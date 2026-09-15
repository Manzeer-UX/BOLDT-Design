import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ShieldAlert, Camera, Clock3 } from 'lucide-react';

// Source timestamps are video offsets, not wall-clock capture dates.
const frames = [
  { src: '/evidence/frame-000194.jpg', time: '00:03:13', seconds: 193, id: 'F-194' },
  { src: '/evidence/frame-000232.jpg', time: '00:03:51', seconds: 231, id: 'F-232' },
  { src: '/evidence/frame-000272.jpg', time: '00:04:31', seconds: 271, id: 'F-272' },
];

const duration = 353;
const timelineTime = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
const periods = Array.from({ length: 6 }, (_, index) => {
  const start = index * 60;
  const end = Math.min(start + 60, duration);
  return { start, end, frames: frames.map((frame, frameIndex) => ({ ...frame, frameIndex })).filter(frame => frame.seconds >= start && frame.seconds < end) };
});
const maxScreenshots = Math.max(...periods.map(period => period.frames.length));

export default function RiskEvidence({ alert, total, close }) {
  const ref = useRef(null);
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState(3);
  const period = periods[selectedPeriod];
  const frame = frames[selectedFrame];
  function selectPeriod(index) { setSelectedPeriod(index); setSelectedFrame(periods[index].frames[0]?.frameIndex ?? null); }
  const share = (alert.value / total * 100).toFixed(1);
  useEffect(() => {
    window.scrollTo(0, 0);
    ref.current?.focus({ preventScroll: true });
  }, [alert.name]);
  return <section className="ex-risk-evidence ex-risk-evidence-page" aria-labelledby="risk-evidence-title">
    <div className="ex-risk-evidence-head"><span className="ex-kicker"><ShieldAlert size={16}/> ALERT EVIDENCE</span><button type="button" className="ex-button" onClick={close}><ArrowLeft size={16}/> Back to dashboard</button></div>
    <h1 ref={ref} tabIndex={-1} id="risk-evidence-title">{alert.name}</h1>
    <p className="ex-risk-evidence-subtitle">Operational risk signals / Alerts report</p>
    <div className="ex-evidence-metrics">
      <div><span>Reported alerts</span><strong>{alert.value}</strong></div>
      <div><span>Share of all alerts</span><strong>{share}<small>%</small></strong></div>
      <div><span>Total alerts</span><strong>{total}</strong></div>
    </div>
    <section className="ex-evidence-timeline" aria-labelledby="evidence-timeline-heading">
      <div className="ex-timeline-heading"><h3 id="evidence-timeline-heading"><Clock3 size={17}/> Capture timeline</h3><span>{frames.length} screenshots · 00:00–05:53</span></div>
      <div className="ex-timeline-legend"><span><i className="ex-density-high"/>Most screenshots</span><span><i className="ex-density-low"/>Fewer screenshots</span><span><i className="ex-density-empty"/>No screenshots</span></div>
      <div className="ex-timeline-scroll"><div className="ex-timeline-inner">
        <div className="ex-timeline-bar" aria-label="Screenshot density by video time">{periods.map((item, index) => <button key={item.start} type="button" className={`ex-time-period ${item.frames.length ? item.frames.length === maxScreenshots ? 'most' : 'some' : 'empty'}`} style={{ flexGrow: item.end - item.start }} aria-pressed={selectedPeriod === index} aria-label={`${timelineTime(item.start)} to ${timelineTime(item.end)}: ${item.frames.length} screenshots${item.frames.length === maxScreenshots ? ', most screenshots' : ''}`} title={`${timelineTime(item.start)}–${timelineTime(item.end)} · ${item.frames.length} screenshots`} onClick={() => selectPeriod(index)}>{item.frames.length > 0 && <><Camera size={15}/><strong>{item.frames.length}</strong></>}</button>)}</div>
        <div className="ex-timeline-axis">{[0,60,120,180,240,300,353].map(seconds => <span key={seconds} style={{ left: `${seconds / duration * 100}%` }}>{timelineTime(seconds)}</span>)}</div>
      </div></div>
      <p className="ex-timeline-selection" role="status"><strong>{timelineTime(period.start)}–{timelineTime(period.end)}</strong> · {period.frames.length ? `${period.frames.length} screenshots${period.frames.length === maxScreenshots ? ' · Most screenshots' : ''}` : 'No screenshots in this period'}</p>
      <p className="ex-timeline-note">Select a time period to view its captures. Blank periods have no supplied screenshots; activity in those gaps is unknown.</p>
    </section>
    <section className="ex-evidence-records ex-evidence-gallery" aria-labelledby="event-evidence-heading">
      <div className="ex-evidence-gallery-head"><h3 id="event-evidence-heading"><Camera size={20}/> Event evidence</h3><span className="ex-tag neutral">Static preview</span></div>
      {frame ? <><figure className="ex-capture-frame"><img src={frame.src} alt={`Construction camera sample ${frame.id}, captured at video timestamp ${frame.time}, showing concrete work and worker detections`}/><figcaption><span><Camera size={16}/> {frame.id}</span><span><Clock3 size={16}/> Capture time <strong>{frame.time}</strong><small>Video timestamp</small></span></figcaption></figure>
      <div className="ex-capture-thumbnails" aria-label="Evidence frames">{period.frames.map(item => <button type="button" key={item.id} aria-label={`Show frame captured at ${item.time}`} aria-pressed={selectedFrame === item.frameIndex} onClick={() => setSelectedFrame(item.frameIndex)}><img src={item.src} alt=""/><span>{item.time}</span></button>)}</div>
      </> : <div className="ex-capture-empty"><Camera size={28}/><h3>No captures in this period</h3><p>Select a populated period on the timeline to view screenshots.</p></div>}
      <p className="ex-capture-note">Sample frames from the reference site. Capture times are positions in the source video; a calendar date and time zone were not supplied. These previews are not linked to individual {alert.name.toLowerCase()} alerts.</p>
    </section>
    <div className="ex-risk-evidence-footer"><span>Source: supplied Alerts Report screenshot</span></div>
  </section>;
}
