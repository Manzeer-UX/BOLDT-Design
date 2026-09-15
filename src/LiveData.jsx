import React, { useEffect, useRef, useState } from 'react';
import { Activity, ArrowDownToLine, Camera, Check, ChevronLeft, ChevronRight, Clock3, HardHat, Layers3, Maximize2, Pause, Play, RotateCcw, Search, ShieldCheck, Users, X, ZoomIn, ZoomOut } from 'lucide-react';
import snapshot from './live-snapshot.json';
import './live-data.css';

const types = [
  { id: 'pouring', label: 'Pouring', color: '#3e7965' },
  { id: 'no-pouring', label: 'No pouring', color: '#d67535' },
  { id: 'no-activity', label: 'No activity', color: '#778494' },
];
const duration = seconds => seconds >= 3600 ? `${(seconds / 3600).toFixed(2)} hr` : `${Number((seconds / 60).toFixed(2))} min`;
const dateLabel = new Date(snapshot.reportUpdatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const typeForState = state => state === 'Workers present, no pouring' ? 'no-pouring' : state === 'No workers / no production observed' ? 'no-activity' : 'pouring';
const overallPeriods = snapshot.activities.map(item => ({ ...item, zoneId: 'overall', zone: 'Overall', kind: item.type === 'concrete_pouring' ? 'pouring' : item.type.replaceAll('_', '-') }));
const zonePeriods = snapshot.periods.map((item, index) => ({
  id: `zone-period-${index}`, zoneId: item.zone_id, zone: item.zone_name,
  kind: typeForState(item.state), label: types.find(type => type.id === typeForState(item.state)).label,
  // Zone buckets include the final second. Use an exclusive end for the timeline.
  start: item.start_second, end: item.end_second + 1, duration: item.duration_seconds,
  workers: item.avg_worker_count, confidence: null, evidence: item.evidence || [], reason: item.state,
}));
const extent = Math.ceil(Math.max(snapshot.latest, ...zonePeriods.map(item => item.end)));

function IconButton({ label, children, ...props }) {
  return <button type="button" className="ld-icon-button" title={label} aria-label={label} {...props}>{children}</button>;
}
function Modal({ title, close, children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    ref.current.showModal();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <dialog ref={ref} className={`ld-modal ${className}`} aria-label={title} onCancel={close} onClick={event => { if (event.target === ref.current) close(); }}>
    <header><h2>{title}</h2><IconButton label={`Close ${title.toLowerCase()}`} onClick={close}><X size={20}/></IconButton></header>{children}
  </dialog>;
}
function EvidenceViewer({ period, close }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const image = period.evidence[index];
  const frame = snapshot.frames.find(item => item.image === image);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setIndex(current => {
      if (current >= period.evidence.length - 1) { setPlaying(false); return current; }
      return current + 1;
    }), 1000);
    return () => clearInterval(timer);
  }, [playing, period]);
  function move(amount) { setPlaying(false); setIndex(current => Math.min(period.evidence.length - 1, Math.max(0, current + amount))); }
  return <Modal title={`${period.label} evidence`} close={close} className="ld-evidence-modal">
    <div className="ld-evidence-meta"><span>{period.zone} / {duration(period.start)} to {duration(period.end)}</span><span>{index + 1} of {period.evidence.length} frames</span></div>
    <div className="ld-evidence-image" tabIndex={0} aria-label="Evidence image" onKeyDown={event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
    }}><img src={image} alt={`${period.zone}: ${period.label} at ${duration(frame?.seconds || period.start)}`}/></div>
    <div className="ld-playback"><IconButton label="Previous evidence frame" disabled={index === 0} onClick={() => move(-1)}><ChevronLeft size={18}/></IconButton><IconButton label={playing ? 'Pause evidence playback' : 'Play evidence frames'} disabled={period.evidence.length < 2} onClick={() => { if (index === period.evidence.length - 1) setIndex(0); setPlaying(!playing); }}>{playing ? <Pause size={18}/> : <Play size={18}/>}</IconButton><IconButton label="Next evidence frame" disabled={index === period.evidence.length - 1} onClick={() => move(1)}><ChevronRight size={18}/></IconButton><input aria-label="Evidence frame" type="range" min="0" max={period.evidence.length - 1} value={index} onChange={event => { setPlaying(false); setIndex(Number(event.target.value)); }}/><span>{duration(frame?.seconds || period.start)}</span></div>
    <p className="ld-evidence-reason">{frame?.reason || period.reason}</p>
    <div className="ld-thumbnails">{period.evidence.map((src, i) => <button key={src} type="button" aria-label={`Show evidence frame ${i + 1}`} aria-pressed={index === i} onClick={() => { setPlaying(false); setIndex(i); }}><img src={src} loading="lazy" alt=""/></button>)}</div>
  </Modal>;
}
function PeriodTable({ rows, openEvidence }) {
  return <div className="ld-table-scroll"><table className="ld-table"><thead><tr><th>Activity</th><th>Zone</th><th>Start</th><th>End</th><th>Duration</th><th>Avg. workers</th><th>Confidence</th><th>Evidence</th></tr></thead><tbody>
    {rows.map(row => <tr key={row.id}><td><span className={`ld-state ${row.kind}`}><i/>{row.label}</span></td><td>{row.zone}</td><td>{duration(row.start)}</td><td>{duration(row.end)}</td><td>{duration(row.duration)}</td><td>{row.workers == null ? 'Unavailable' : Number(row.workers.toFixed(2))}</td><td>{row.confidence == null ? 'Unavailable' : `${Math.round(row.confidence * 100)}%`}</td><td>{row.evidence.length ? <button className="ld-evidence-link" type="button" onClick={() => openEvidence(row)}><img src={row.evidence[0]} alt=""/><span>{row.evidence.length} frames</span><ChevronRight size={14}/></button> : <span className="ld-muted">No frames</span>}</td></tr>)}
    {!rows.length && <tr><td colSpan="8" className="ld-no-results">No activity periods match these filters.</td></tr>}
  </tbody></table></div>;
}
function Timeline({ rows, scope, openEvidence }) {
  const videoRef = useRef(null);
  const pendingSeek = useRef(null);
  const [videoTime, setVideoTime] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [start, setStart] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const windowLength = extent / zoom;
  const windowStart = Math.min(start, extent - windowLength);
  const windowEnd = windowStart + windowLength;
  const lanes = scope === 'overall' ? [{ id: 'overall', name: 'Overall' }] : snapshot.zones.filter(zone => scope === 'zones' || scope === zone.zone_id).map(zone => ({ id: zone.zone_id, name: zone.zone_name }));
  const selected = rows.find(row => row.id === selectedId) || rows[0];
  function selectPeriod(row) {
    setSelectedId(row.id);
    pendingSeek.current = row.start;
    if (videoRef.current?.readyState >= 1) {
      videoRef.current.currentTime = Math.min(row.start, videoRef.current.duration);
      pendingSeek.current = null;
    }
  }
  function changeZoom(next) {
    const value = Math.max(1, Math.min(4, next));
    setStart(Math.max(0, Math.min(extent - extent / value, windowStart + windowLength / 2 - extent / value / 2)));
    setZoom(value);
  }
  return <section className="ld-surface ld-timeline">
    <div className="ld-section-head"><h2><Activity size={18}/> Live Video</h2><div className="ld-actions"><IconButton label="Zoom out timeline" disabled={zoom === 1} onClick={() => changeZoom(zoom / 2)}><ZoomOut size={17}/></IconButton><IconButton label="Zoom in timeline" disabled={zoom === 4} onClick={() => changeZoom(zoom * 2)}><ZoomIn size={17}/></IconButton><IconButton label="Reset timeline" onClick={() => { setZoom(1); setStart(0); }}><RotateCcw size={16}/></IconButton><button type="button" className="ex-button ld-latest" onClick={() => setStart(extent - windowLength)}>Latest</button></div></div>
    <div className="ld-video">
      <video ref={videoRef} className="ld-video-player" controls playsInline preload="metadata" poster="/live-data/site-001-poster.jpg" src="/live-data/site-001-observed.mp4" aria-label="Site 001 recorded activity video"
        onLoadedMetadata={() => { setVideoError(false); if (pendingSeek.current !== null) { videoRef.current.currentTime = Math.min(pendingSeek.current, videoRef.current.duration); pendingSeek.current = null; } }}
        onTimeUpdate={event => setVideoTime(event.currentTarget.currentTime)}
        onError={() => setVideoError(true)}/>
      {videoError ? <div className="ld-video-error" role="alert">Video could not be loaded.<button type="button" className="ex-button" onClick={() => { setVideoError(false); videoRef.current?.load(); }}><RotateCcw size={15}/> Retry</button></div> : <div className="ld-video-caption"><span><Camera size={14}/>{snapshot.fileName}</span><span>{duration(videoTime)} / {duration(extent)}</span></div>}
    </div>
    <div className="ld-legend">{types.map(type => <span key={type.id}><i style={{ background: type.color }}/>{type.label}</span>)}</div>
    <div className="ld-timeline-plot"><div className="ld-axis"><span>Video time</span><div>{Array.from({ length: 5 }, (_, index) => <span key={index} style={{ left: `${index * 25}%` }}>{duration(windowStart + windowLength * index / 4)}</span>)}</div></div>
      {lanes.map(lane => <div className="ld-lane" key={lane.id}><strong>{lane.name}</strong><div className="ld-track">{rows.filter(row => row.zoneId === lane.id && row.end > windowStart && row.start < windowEnd).map(row => {
        const left = Math.max(row.start, windowStart);
        const right = Math.min(row.end, windowEnd);
        return <button key={row.id} type="button" className={`ld-interval ${row.kind}`} style={{ left: `${(left - windowStart) / windowLength * 100}%`, width: `${(right - left) / windowLength * 100}%` }} aria-label={`${row.zone}: ${row.label}, ${duration(row.start)} to ${duration(row.end)}`} title={`${row.label}: ${duration(row.duration)}`} aria-pressed={selected?.id === row.id} onClick={() => selectPeriod(row)}><span>{row.label}</span></button>;
      })}{videoTime >= windowStart && videoTime <= windowEnd && <span className="ld-video-playhead" aria-hidden="true" style={{ left: `${(videoTime - windowStart) / windowLength * 100}%` }}/>}</div></div>)}
    </div>
    {zoom > 1 && <label className="ld-pan"><span>Timeline position</span><input aria-label="Timeline position" type="range" min="0" max={extent - windowLength} step="0.01" value={windowStart} onChange={event => setStart(Number(event.target.value))}/></label>}
    <div className="ld-period-detail" aria-live="polite">{selected ? <><span className={`ld-state ${selected.kind}`}><i/>{selected.label}</span><span>{selected.zone} / {duration(selected.start)} to {duration(selected.end)}</span><strong>{duration(selected.duration)}</strong>{selected.evidence.length > 0 && <button type="button" onClick={() => openEvidence(selected)}>View evidence <ChevronRight size={15}/></button>}</> : <span>No activity periods in this view.</span>}</div>
  </section>;
}
export default function LiveData() {
  const [scope, setScope] = useState('overall');
  const [activity, setActivity] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('earliest');
  const [expanded, setExpanded] = useState(false);
  const [evidence, setEvidence] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [notice, setNotice] = useState('');
  const scopedPeriods = scope === 'overall' ? overallPeriods : zonePeriods.filter(period => scope === 'zones' || period.zoneId === scope);
  const filtered = scopedPeriods.filter(period => (activity === 'all' || period.kind === activity) && `${period.label} ${period.zone}`.toLowerCase().includes(query.toLowerCase().trim())).sort((a, b) => sort === 'earliest' ? a.start - b.start : b.start - a.start);
  const zones = snapshot.zones.filter(zone => scope === 'overall' || scope === 'zones' || zone.zone_id === scope);
  const zoneCards = scope === 'overall' || scope === 'zones' ? [{
    zone_id: 'all-zones', zone_name: 'All zones', current_worker_count: zones.reduce((sum, zone) => sum + zone.current_worker_count, 0),
    average_worker_count: Number(zones.reduce((sum, zone) => sum + zone.average_worker_count, 0).toFixed(2)), peak_worker_count: zones.reduce((sum, zone) => sum + zone.peak_worker_count, 0),
    current_state: zones.some(zone => typeForState(zone.current_state) === 'pouring') ? 'Pouring' : zones.some(zone => typeForState(zone.current_state) === 'no-pouring') ? 'Workers present, no pouring' : 'No workers / no production observed',
    pouring_seconds: zones.reduce((sum, zone) => sum + zone.pouring_seconds, 0), workers_present_no_pouring_seconds: zones.reduce((sum, zone) => sum + zone.workers_present_no_pouring_seconds, 0), no_workers_no_production_seconds: zones.reduce((sum, zone) => sum + zone.no_workers_no_production_seconds, 0),
  }] : zones;
  const totalByType = kind => scopedPeriods.filter(period => period.kind === kind).reduce((sum, period) => sum + period.duration, 0);
  const planned = scope === 'overall' || scope === 'zones' ? 400 : 400 / snapshot.zones.length;
  const placed = Math.min(planned, totalByType('pouring') / 3600 * 35);
  const progress = planned > 0 ? placed / planned * 100 : 0;
  const confidences = scopedPeriods.map(period => period.confidence).filter(value => value != null);
  const confidence = confidences.length ? `${Math.round(confidences.reduce((sum, value) => sum + value, 0) / confidences.length * 100)}%` : 'Unavailable';
  const selectedAlerts = snapshot.alerts.filter(alert => scope === 'overall' || scope === 'zones' || alert.zone_id === scope);
  const lastPage = Math.max(0, Math.ceil(filtered.length / pageSize) - 1);
  const safePage = Math.min(page, lastPage);
  const visible = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);
  function changeScope(value) { setScope(value); setPage(0); }
  function resetFilters() { setScope('overall'); setActivity('all'); setQuery(''); setSort('earliest'); setPage(0); }
  function download() {
    const rows = [['Activity', 'Zone', 'Start (minutes)', 'End (minutes)', 'Duration (minutes)', 'Average workers', 'Confidence', 'Evidence frames'], ...filtered.map(row => [row.label, row.zone, (row.start / 60).toFixed(4), (row.end / 60).toFixed(4), (row.duration / 60).toFixed(4), row.workers ?? '', row.confidence ?? '', row.evidence.length])];
    const csv = rows.map(row => row.map(value => '"' + String(value).replaceAll('"', '""') + '"').join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `BOLDT-Live-Data-${scope}-${snapshot.reportUpdatedAt.slice(0, 10)}.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`${filtered.length} activity ${filtered.length === 1 ? 'period' : 'periods'} exported.`);
  }
  return <div className="ex-live-data">
    <div className="ld-heading"><div><h2>Site activity</h2><p>{snapshot.fileName} <span>/</span> {dateLabel} <span>/</span> Recorded snapshot</p></div><button type="button" className="ex-button" onClick={download}><ArrowDownToLine size={16}/> Export activity</button></div>
    <div className="ld-filters"><label><Layers3 size={17}/><span>Zone<select aria-label="Live data zone" value={scope} onChange={event => changeScope(event.target.value)}><option value="overall">Overall</option><option value="zones">All zones</option>{snapshot.zones.map(zone => <option value={zone.zone_id} key={zone.zone_id}>{zone.zone_name}</option>)}</select></span></label><label><Activity size={17}/><span>Activity<select aria-label="Live data activity" value={activity} onChange={event => { setActivity(event.target.value); setPage(0); }}><option value="all">All activities</option>{types.map(type => <option key={type.id} value={type.id}>{type.label}</option>)}</select></span></label><div className="ld-observed"><Clock3 size={16}/>{duration(extent)} observed <span className="ex-tag neutral">Stopped</span></div></div>
    {notice && <div className="ld-notice" role="status"><Check size={16}/>{notice}<IconButton label="Dismiss export message" onClick={() => setNotice('')}><X size={16}/></IconButton></div>}
    <div className="ld-metrics">{[...types.map(type => ({ label: type.label, value: duration(totalByType(type.id)), kind: type.id })), { label: 'Average confidence', value: confidence, kind: 'confidence' }].map(metric => <article className={`ld-metric ${metric.kind}`} key={metric.label}><span><i/>{metric.label}</span><strong>{metric.value}</strong></article>)}</div>
    <div className="ld-layout"><div className="ld-main-stack">
      <Timeline rows={filtered} scope={scope} openEvidence={setEvidence}/>
      <section className="ld-zones"><div className="ld-section-head"><h2><Layers3 size={18}/> Zone summary</h2><span className="ld-muted">{scope === 'overall' || scope === 'zones' ? `${zones.length} zones combined` : '1 zone'}</span></div><div className="ld-zone-grid">{zoneCards.map(zone => {
        const phases = [zone.pouring_seconds, zone.workers_present_no_pouring_seconds, zone.no_workers_no_production_seconds];
        const total = phases.reduce((sum, seconds) => sum + seconds, 0);
        return <article className="ld-zone" key={zone.zone_id}><div className="ld-zone-head"><h3>{zone.zone_name}</h3>{zone.zone_id !== 'all-zones' && <IconButton label={`Filter to ${zone.zone_name}`} onClick={() => changeScope(zone.zone_id)}><ChevronRight size={18}/></IconButton>}</div><div className="ld-worker-summary"><Users size={23}/><strong>{zone.current_worker_count}</strong><span>Current workers</span><div><span>Avg. <b>{zone.average_worker_count}</b></span><span>Peak <b>{zone.peak_worker_count}</b></span></div></div><p className={`ld-state ${typeForState(zone.current_state)}`}><i/>{typeForState(zone.current_state) === 'no-activity' ? 'No activity' : zone.current_state}</p><div className="ld-phase-bar" aria-label={`${zone.zone_name} observed time distribution`}>{phases.map((seconds, index) => <span key={types[index].id} style={{ width: `${total ? seconds / total * 100 : 0}%`, background: types[index].color }} title={`${types[index].label}: ${duration(seconds)}`}/>)}</div><dl className="ld-zone-times">{types.map((type, index) => <div key={type.id}><dt>{type.label}</dt><dd>{duration(phases[index])}</dd></div>)}</dl></article>;
      })}</div></section>
      <section className="ld-surface ld-periods"><div className="ld-section-head"><h2><Clock3 size={18}/> Activity periods <span className="ld-count">{filtered.length}</span></h2><div className="ld-actions"><IconButton label="Export activity periods CSV" onClick={download}><ArrowDownToLine size={17}/></IconButton><IconButton label="Expand activity periods" onClick={() => setExpanded(true)}><Maximize2 size={17}/></IconButton></div></div><div className="ld-table-toolbar"><label className="ld-search"><Search size={16}/><input type="search" aria-label="Search activity periods" placeholder="Search activities or zones" value={query} onChange={event => { setQuery(event.target.value); setPage(0); }}/></label><select aria-label="Sort activity periods" value={sort} onChange={event => setSort(event.target.value)}><option value="earliest">Earliest first</option><option value="latest">Latest first</option></select></div><PeriodTable rows={visible} openEvidence={setEvidence}/><div className="ld-pagination"><label>Rows <select aria-label="Activity rows per page" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(0); }}>{[5, 10, 20].map(size => <option key={size}>{size}</option>)}</select></label><span>{filtered.length ? safePage * pageSize + 1 : 0}-{Math.min((safePage + 1) * pageSize, filtered.length)} of {filtered.length}</span><IconButton label="Previous activity page" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}><ChevronLeft size={17}/></IconButton><IconButton label="Next activity page" disabled={safePage === lastPage} onClick={() => setPage(safePage + 1)}><ChevronRight size={17}/></IconButton></div>{!filtered.length && <button type="button" className="ld-reset" onClick={resetFilters}>Reset filters</button>}</section>
    </div><aside className="ld-side-stack">
      <section className="ld-surface ld-progress"><div className="ld-section-head"><h2>Pour progress</h2><span className="ex-tag neutral">Estimated</span></div><strong className="ld-progress-value">{Math.round(progress)}<small>%</small></strong><progress value={progress} max="100" aria-label="Live pour progress"/><dl className="ld-detail-list"><div><dt>Concrete poured</dt><dd>{Number(placed.toFixed(1))} / {planned} yd³</dd></div><div><dt>Remaining</dt><dd>{Number((planned - placed).toFixed(1))} yd³</dd></div><div><dt>Rate</dt><dd>35 yd³/hr</dd></div></dl><p className="ld-muted">Concrete pouring / {scope === 'overall' ? 'Overall' : scope === 'zones' ? 'All zones' : zones[0]?.zone_name}</p></section>
      <section className="ld-surface"><div className="ld-section-head"><h2><HardHat size={18}/> Equipment status</h2></div><div className="ld-equipment"><span><HardHat size={24}/></span><div><h3>Concrete pump</h3><p className="ld-state no-pouring"><i/>Present, not pouring</p></div></div><dl className="ld-detail-list"><div><dt>Observed + pouring</dt><dd>{duration(snapshot.reports.equipment_summary.rows[0].active_producing_seconds)}</dd></div><div><dt>Observed, not pouring</dt><dd>{duration(snapshot.reports.equipment_summary.rows[0].observed_idle_seconds)}</dd></div><div><dt>Not observed</dt><dd>{duration(snapshot.reports.equipment_summary.rows[0].not_observed_seconds)}</dd></div></dl><p className="ld-muted">Overall equipment observation</p></section>
      <section className="ld-surface"><div className="ld-section-head"><h2><ShieldCheck size={18}/> Alerts</h2><span className="ld-count">{selectedAlerts.length}</span></div>{selectedAlerts.length ? selectedAlerts.map(alert => <p key={alert.alert_id}>{alert.zone_name}: {alert.label}</p>) : <div className="ld-alert-empty"><ShieldCheck size={25}/><strong>No alerts recorded</strong><p>For the selected zone scope.</p></div>}</section>
      <div className="ld-source"><Camera size={16}/><span>{snapshot.fps} fps sampling<br/>Source: linked reference snapshot</span></div>
    </aside></div>
    {expanded && <Modal title="All activity periods" close={() => setExpanded(false)}><PeriodTable rows={filtered} openEvidence={setEvidence}/></Modal>}
    {evidence && <EvidenceViewer period={evidence} close={() => setEvidence(null)}/>}
  </div>;
}
