const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');

const origin = 'https://seal-nickname-focusing-bikini.trycloudflare.com';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(origin);
    const data = await page.evaluate(async () => {
      const snapshot = await (await fetch('/demo-control/status')).json();
      const { buildZoneAnalytics } = await import('/src/zoneAnalytics.ts');
      const frames = snapshot.modelDetections?.frames || [];
      const activities = snapshot.activities?.activities || [];
      const latest = Math.max(0, ...frames.map(frame => frame.timestamp?.seconds || 0), ...activities.map(activity => activity.end_seconds || 0));
      const analytics = buildZoneAnalytics({
        zones: snapshot.zones, detectionFrames: frames, activities,
        currentSource: { camera_id: 'local-mp4', stream_id: 'construction-ui-live', width: snapshot.metadata.width, height: snapshot.metadata.height },
        latestSourceSeconds: latest, targetFps: snapshot.state.config.targetFps,
        alertThresholds: snapshot.zoneAlertThresholds,
      });
      const mediaPath = uri => uri?.includes('/public/') ? '/' + uri.split('/public/')[1] : uri;
      const proofs = [...new Map(activities.flatMap(activity => activity.proof_frames || []).map(frame => [frame.storage_uri, frame])).values()];
      const periodMedia = new Set(analytics.zonePeriods.flatMap(period => period.evidence_refs || []).map(mediaPath));
      const detectorMedia = frames.filter(frame => periodMedia.has(mediaPath(frame.detected_frame_uri))).map(frame => ({ sourceUrl: mediaPath(frame.detected_frame_uri), seconds: frame.timestamp.seconds, reason: 'Zone detection evidence' }));
      return {
        source: location.origin, capturedAt: new Date().toISOString(), reportUpdatedAt: snapshot.reports.updated_at,
        fileName: snapshot.metadata.file_name, sourceDuration: snapshot.metadata.duration_seconds,
        fps: snapshot.state.config.targetFps, status: snapshot.state.status, latest,
        reports: snapshot.reports,
        zones: analytics.zoneSummaries,
        periods: analytics.zonePeriods.map(period => ({ ...period, evidence_refs: (period.evidence_refs || []).map(mediaPath) })),
        alerts: analytics.zoneAlerts,
        activities: activities.map(activity => ({
          id: activity.activity_id, type: activity.activity_type, label: activity.label,
          start: activity.start_seconds, end: activity.end_seconds, duration: activity.duration_seconds,
          confidence: activity.confidence, reason: activity.reason,
          evidence: (activity.proof_frames || []).map(frame => mediaPath(frame.storage_uri)),
        })),
        frames: [...new Map([...proofs.map(frame => ({ sourceUrl: mediaPath(frame.storage_uri), seconds: frame.source_seconds, reason: frame.llm_reason || frame.reason })), ...detectorMedia].map(frame => [frame.sourceUrl, frame])).values()],
      };
    });
    await fs.mkdir(path.join('public', 'live-data'), { recursive: true });
    const mediaMap = new Map();
    for (let offset = 0; offset < data.frames.length; offset += 6) {
      await Promise.all(data.frames.slice(offset, offset + 6).map(async (frame, index) => {
        const localUrl = `/live-data/evidence-${String(offset + index + 1).padStart(3, '0')}.jpg`;
        const response = await page.request.get(new URL(frame.sourceUrl, origin).href);
        if (!response.ok() || !response.headers()['content-type']?.startsWith('image/')) throw new Error(`Unavailable evidence: ${frame.sourceUrl}`);
        await fs.writeFile(path.join('public', localUrl), await response.body());
        mediaMap.set(frame.sourceUrl, localUrl);
        frame.image = localUrl;
      }));
    }
    data.activities.forEach(activity => { activity.evidence = [...new Set(activity.evidence.map(uri => mediaMap.get(uri)).filter(Boolean))]; });
    data.periods = data.periods.map(({ evidence_refs, ...period }) => ({ ...period, sourceEvidenceCount: evidence_refs.length, evidence: evidence_refs.map(uri => mediaMap.get(uri)).filter(Boolean) }));
    data.frames = data.frames.map(({ sourceUrl, ...frame }) => frame);
    await fs.writeFile(path.join('src', 'live-snapshot.json'), JSON.stringify(data, null, 2) + '\n');
    console.log(JSON.stringify({ zones: data.zones, periods: data.periods, frames: data.frames.length, latest: data.latest }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
