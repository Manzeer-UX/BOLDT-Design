import React, { useRef, useState, useEffect } from 'react';
import { LayoutDashboard, ChartNoAxesCombined, ShieldAlert, HardHat, ArrowUpRight, ArrowRight, Download, LogOut, ChevronRight, Sparkles, CircleHelp, Clock3, Check, X, Building2, Layers3, CalendarDays, Users, Activity, Target } from 'lucide-react';
import './executive.css';

const report = {
  poured: 138.3, planned: 400, remaining: 261.7, rate: 35,
  pouring: 237 * 60 + 8, noPouring: 21 * 60 + 29, inactive: 2 * 60 + 28,
  active: 239 * 60 + 42, idle: 20 * 60 + 30, unobserved: 6 * 60 + 35,
  utilization: 90, averageWorkers: 9, peakWorkers: 21,
};
const alerts = [
  { name: 'Spatial congestion', value: 55, color: '#d67535' },
  { name: 'High concentration', value: 27, color: '#edba74' },
  { name: 'No pouring', value: 3, color: '#778494' },
  { name: 'No activity', value: 1, color: '#cdd3d9' },
];
const totalAlerts = alerts.reduce((sum, alert) => sum + alert.value, 0);
const percent = value => (value * 100).toFixed(1);
const productionTime = report.pouring + report.noPouring + report.inactive;
const equipmentTime = report.active + report.idle + report.unobserved;
const actions = [
  { title: 'Investigate spatial congestion', signal: '55 occurrences · 64% of alerts', source: 'Alerts Report', text: 'Review congestion hotspots and evidence to determine whether worker, equipment, or access conflicts are affecting production flow.', evidence: 'Spatial congestion: 55 of 86 alerts (64.0%). High concentration: 27 of 86 alerts (31.4%). Together these account for 95.3% of alerts. The supplied report contains counts only; locations, timestamps and event images were not provided.', next: 'Request event timestamps and hotspot evidence from the site team before assigning a root cause.' },
  { title: 'Review high-concentration events', signal: '27 occurrences · 31% of alerts', source: 'Alerts Report + Daily Zone Summary', text: 'Identify where and when workers cluster. Review site sequencing and workforce distribution with the zone lead.', evidence: 'High concentration: 27 alerts. Average workforce: 9 workers. Peak workforce: 21 workers. No event-level timeline or crew allocation was supplied; these counts do not establish worker productivity.', next: 'Review concentration events with zone-level crew allocations and the activity sequence.' },
  { title: 'Analyze no-pouring periods', signal: '21m 29s of observed interruption', source: 'Daily Zone Summary', text: 'Cross-reference interruptions with alert timestamps and evidence before determining the cause.', evidence: 'Pouring: 237m 8s. No pouring: 21m 29s. No activity: 2m 28s. Total classified production time: 261m 5s. Combined interruption / inactivity: 23m 57s (9.2%). Equipment has a separate observation total of 266m 47s.', next: 'Align production and equipment timestamps, then review interruption evidence. Congestion has not been established as the cause.' },
];

function Ring({ value, label, detail, color = '#20272b', size = 168 }) {
  return <div className="ex-ring" style={{ width: size, height: size }} role="img" aria-label={`${value}% ${label}`}>
    <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="51" fill="none" stroke="#edf0f1" strokeWidth="8"/><circle className="ex-ring-fill" cx="60" cy="60" r="51" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" pathLength="100" strokeDasharray={`${value} 100`} transform="rotate(-90 60 60)"/></svg>
    <div><strong>{value}<small>%</small></strong><span>{label}</span>{detail && <small>{detail}</small>}</div>
  </div>;
}
function Segments({ items, total, label }) {
  return <div className="ex-segments" role="img" aria-label={label}>{items.map(item => <span key={item.label} title={`${item.label}: ${item.time}`} style={{ width: `${item.value / total * 100}%`, background: item.color }}/>)}</div>;
}
function PanelTitle({ icon: Icon, title, note }) { return <div className="ex-panel-title"><h2>{Icon && <Icon size={17}/>} {title}</h2>{note && <span>{note}</span>}</div>; }
function EvidenceDialog({ item, close }) {
  const ref = useRef(null);
  useEffect(() => { const previous = document.activeElement; ref.current.showModal(); return () => previous?.focus(); }, []);
  return <dialog ref={ref} className="ex-dialog" onCancel={close} onClick={event => { if(event.target === ref.current) close(); }}>
    <button className="ex-close" aria-label="Close evidence" onClick={close} autoFocus><X size={20}/></button>
    <span className="ex-kicker">REPORT EVIDENCE · ZONE 1</span><h2>{item.title}</h2>
    <span className="ex-pill">{item.source}</span><p>{item.evidence}</p>
    <div className="ex-evidence-next"><strong>Recommended next step</strong><p>{item.next}</p></div>
    <p className="ex-meta">Source: supplied report snapshot. Event-level records are not connected.</p><button className="ex-button dark" onClick={close}>Done <Check size={16}/></button>
  </dialog>;
}

export default function ExecutiveDashboard({ onLogout, name, email }) {
  const [section, setSection] = useState('overview');
  const [evidence, setEvidence] = useState(null);
  const [exported, setExported] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(0);
  const selected = alerts[selectedAlert];
  const nav = [['overview', LayoutDashboard, 'Executive overview'], ['production', ChartNoAxesCombined, 'Production'], ['efficiency', HardHat, 'Resource efficiency'], ['risk', ShieldAlert, 'Risk intelligence'], ['attention', Target, 'Executive attention']];
  function navigate(id) { setSection(id); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  function exportReport() {
    const lines = ['BOLDT | Executive Insights', 'Zone 1 | Supplied report snapshot | Reporting date and project name not supplied', '', 'EXECUTIVE SUMMARY', '34.6% completed. Pump utilization 90%. 86 alerts; congestion accounts for 64.0%. Schedule status cannot be assessed without a baseline.', '', 'PRODUCTION', 'Estimated poured: 138.3 yd³ / Planned: 400 yd³ / Remaining: 261.7 yd³', 'Production rate: 35 yd³/hr', 'Pouring: 237m 8s / No pouring: 21m 29s / No activity: 2m 28s', 'Productive share of classified time: 90.8%', '', 'EQUIPMENT & WORKFORCE', 'Concrete pump utilization: 90% (reported)', 'Active: 239m 42s / Idle: 20m 30s / Not observed: 6m 35s', 'Average workers: 9 / Peak workers: 21', '', 'ALERTS', ...alerts.map(a => `${a.name}: ${a.value} (${percent(a.value / totalAlerts)}%)`), '', 'FORECAST LIMITS', 'Completion date unavailable: no schedule, shift calendar or future production assumptions supplied.', '', 'EXECUTIVE ACTIONS', ...actions.map((a, i) => `${i + 1}. ${a.title}\n${a.signal}\n${a.text}\nEvidence: ${a.evidence}`), '', 'METHODOLOGY', 'Completion = estimated poured / planned. Alert shares = category count / 86. Production time shares use 261m 5s. Equipment time shares use 266m 47s. Totals are separate observation windows. No causal relationship or workforce productivity is established. Executive interpretations are derived from the supplied snapshot, not a live AI service.'];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], {type: 'text/plain;charset=utf-8'}));
    const link = document.createElement('a'); link.href = url; link.download = 'BOLDT-Executive-Report-Zone-1.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setExported(true);
  }
  return <div className="executive-app">
    <aside className="ex-sidebar">
      <a className="ex-brand" href="#overview" onClick={e => {e.preventDefault(); navigate('overview');}}><span className="brand-icon"><i/><i/><i/></span>BOLDT<span>®</span></a>
      <div className="ex-workspace"><span className="ex-workspace-icon"><Building2 size={20}/></span><div><strong>Construction intelligence</strong><small>Executive workspace</small></div></div>
      <span className="ex-nav-label">WORKSPACE</span><nav aria-label="Dashboard sections">{nav.map(([id, Icon, label]) => <button key={id} className={section === id ? 'active' : ''} onClick={() => navigate(id)} aria-current={section === id ? 'location' : undefined}><Icon size={18}/>{label}{id === 'attention' && <b>3</b>}</button>)}</nav>
      <div className="ex-sidebar-bottom"><div className="ex-source-note"><span className="ex-live-dot"/> Report snapshot<p>One zone. A focused view of the work that matters.</p><button onClick={() => setEvidence({title: 'About this report', source: 'Supplied reference', evidence: 'This dashboard uses the supplied Zone 1 production, quantity, workforce, equipment and alert values. A project name, reporting date, schedule baseline and historical records were not supplied.', next: 'Connect dated operational reports to support project comparisons, historical trends and schedule assessments.'})}><CircleHelp size={15}/> Data & methodology</button></div><div className="ex-profile"><span>{(name || email || 'E').slice(0,1).toUpperCase()}</span><div><strong>{name || 'Executive'}</strong><small>Leadership view</small></div><button aria-label="Log out" title="Log out" onClick={onLogout}><LogOut size={18}/></button></div></div>
    </aside>
    <main className="ex-main">
      <div className="ex-topbar"><span>Workspace <ChevronRight size={14}/> <strong>Executive Insights</strong></span><span className="ex-snapshot"><span className="ex-live-dot"/> Supplied report snapshot</span></div>
      <div className="ex-content">
        <header className="ex-heading" id="overview"><div><span className="ex-kicker">THE BIG PICTURE</span><h1>Executive Insights<span>.</span></h1><p>Production, efficiency and operational risk at a glance.</p></div><button className="ex-button dark" onClick={exportReport}><Download size={16}/> Export executive report</button></header>
        <div className="ex-filters"><label><Building2 size={16}/><span>Project<select aria-label="Project"><option>Supplied project · unnamed</option></select></span></label><label><Layers3 size={16}/><span>Zone<select aria-label="Zone"><option>Zone 1</option></select></span></label><label><CalendarDays size={16}/><span>Reporting period<select aria-label="Reporting period"><option>Provided snapshot · undated</option></select></span></label><span className="ex-filter-note">Concrete operations <span> / </span> Single-zone view</span></div>
        {exported && <div className="ex-export-status" role="status"><Check size={16}/> Executive report downloaded as a text file.<button aria-label="Dismiss download message" onClick={() => setExported(false)}><X size={16}/></button></div>}
        <section className="ex-health" aria-label="Executive health summary">
          <div className="ex-progress-summary"><span className="ex-kicker">PRODUCTION PROGRESS</span><div className="ex-summary-ring"><Ring value={percent(report.poured / report.planned)} label="Completed"/><div className="ex-quantity"><strong>138.3 <small>yd³</small></strong><span>of 400 yd³ planned</span><hr/><b>261.7 yd³</b><span>remaining to pour</span></div></div></div>
          <div className="ex-health-dimensions"><span className="ex-kicker">OPERATIONAL HEALTH</span><div><span><Activity size={16}/> Production</span><b className="ex-tag neutral">In progress</b></div><div><span><HardHat size={16}/> Equipment</span><b className="ex-tag green">90% utilized</b></div><div><span><ShieldAlert size={16}/> Risk signals</span><b className="ex-tag amber">86 alerts to review</b></div><p>Schedule status requires a planned progress baseline.</p></div>
          <div className="ex-brief"><span className="ex-kicker"><Sparkles size={15}/> EXECUTIVE BRIEF</span><h2>Production is moving.<br/>Flow needs attention.</h2><p><strong>34.6%</strong> of planned quantity is poured, with <strong>90% pump utilization</strong>. Congestion makes up <strong>64% of alerts</strong> — the first signal to investigate.</p><button onClick={() => navigate('attention')}>Focus on the next actions <ArrowRight size={16}/></button><small>Report-derived interpretation</small></div>
        </section>
        <div className="ex-two-col">
          <section className="ex-panel" id="production"><PanelTitle icon={ChartNoAxesCombined} title="Production performance" note="QUANTITY REPORT"/><div className="ex-metric-line"><div><strong>138.3 <small>yd³</small></strong><span>Estimated concrete poured</span></div><span className="ex-tag neutral">35 yd³/hr</span></div><div className="ex-progress-label"><span>Planned quantity</span><strong>400 yd³</strong></div><div className="ex-quantity-track" role="img" aria-label="34.6% poured, 65.4% remaining"><span style={{width: `${report.poured / report.planned * 100}%`}}/></div><div className="ex-progress-legend"><span><i className="charcoal"/>34.6% completed</span><span><i className="gray"/>65.4% remaining</span></div><div className="ex-production-footer"><div><span>Remaining quantity</span><strong>261.7 <small>yd³</small></strong></div><button className="ex-link" onClick={() => setEvidence({title:'Production progress', source:'Quantity Report', evidence:'Estimated poured: 138.3 yd³. Planned quantity: 400 yd³. Remaining: 261.7 yd³. Completion = 138.3 / 400 × 100 = 34.575%, displayed as 34.6%. Reported production rate: 35 yd³/hr.', next:'Compare this quantity against a dated planned-progress baseline before assessing whether production is on schedule.'})}>View evidence <ArrowUpRight size={15}/></button></div></section>
          <section className="ex-panel" id="risk"><PanelTitle icon={ShieldAlert} title="Operational risk signals" note="ALERTS REPORT"/><div className="ex-risk-chart"><div className="ex-donut" role="img" aria-label="86 alerts: 55 spatial congestion, 27 high concentration, 3 no pouring, 1 no activity" style={{background:`conic-gradient(${alerts.map((a,i) => `${a.color} ${alerts.slice(0,i).reduce((s,a)=>s+a.value,0)/totalAlerts*100}% ${alerts.slice(0,i+1).reduce((s,a)=>s+a.value,0)/totalAlerts*100}%`).join(',')})`}}><div><strong>86</strong><span>Total alerts</span></div></div><div className="ex-alert-legend">{alerts.map((a,i) => <button key={a.name} aria-pressed={selectedAlert===i} onClick={() => setSelectedAlert(i)} className={selectedAlert===i?'selected':''}><i style={{background:a.color}}/><span>{a.name}</span><strong>{a.value}</strong><small>{Math.round(a.value/totalAlerts*100)}%</small></button>)}</div></div><div className="ex-risk-insight" aria-live="polite"><span style={{background:selected.color}}/><p><strong>{selected.name}</strong> accounts for {percent(selected.value/totalAlerts)}% of alerts.{selectedAlert===0?' The dominant signal to investigate.':selectedAlert===1?' The second-largest operational signal.':' Review event evidence before inferring impact.'}</p></div></section>
        </div>
        <section className="ex-insights" aria-labelledby="insights-heading"><div className="ex-section-heading"><h2 id="insights-heading"><Sparkles size={18}/> Executive insights</h2><span>Signals translated into decisions</span></div><div className="ex-insight-grid">{[
          ['01','Operational congestion','55 congestion alerts','64% of all alerts point to spatial congestion.','Investigate workflow and access conflicts first.', ShieldAlert],
          ['02','Strong equipment utilization','90% pump utilization','The concrete pump is active for most of its observed period.','Review workflow alongside equipment availability.', HardHat],
          ['03','Production interruption','21m 29s without pouring','No-pouring time is the largest observed interruption.','Align event evidence before determining cause.', Clock3],
        ].map(([num,title,signal,interpretation,implication,Icon]) => <article key={num}><div className="ex-insight-top"><Icon size={18}/><span>INSIGHT {num}</span></div><h3>{title}</h3><strong>{signal}</strong><p>{interpretation}</p><div><ArrowUpRight size={15}/>{implication}</div></article>)}</div></section>
        <div className="ex-section-heading" id="efficiency"><h2>Resources & observed time</h2><span>Understand the operating context</span></div>
        <div className="ex-resource-grid">
          <section className="ex-panel"><PanelTitle icon={HardHat} title="Equipment utilization"/><div className="ex-equipment-center"><Ring value={90} label="Utilization" color="#3e7965" size={144}/><div><h3>Concrete pump</h3><span className="ex-tag green">Strong utilization</span><p>Active for most of the observed period.</p></div></div><Segments label="Pump: active 239m 42s, idle 20m 30s, not observed 6m 35s" total={equipmentTime} items={[{label:'Active',value:report.active,time:'239m 42s',color:'#3e7965'},{label:'Idle',value:report.idle,time:'20m 30s',color:'#edba74'},{label:'Not observed',value:report.unobserved,time:'6m 35s',color:'#cdd3d9'}]}/><div className="ex-time-legend"><span>Active<strong>239m 42s</strong></span><span>Idle<strong>20m 30s</strong></span><span>Not observed<strong>6m 35s</strong></span></div><p className="ex-meta">90% as reported. Time distribution uses 266m 47s.</p></section>
          <section className="ex-panel"><PanelTitle icon={Users} title="Workforce presence"/><div className="ex-workforce-metrics"><div><strong>9</strong><span>Average workers</span></div><span className="ex-workforce-divider"/><div><strong>21</strong><span>Peak workers</span></div></div><div className="ex-workers" role="img" aria-label="Average 9 workers compared with peak 21">{Array.from({length:21},(_,i)=><Users key={i} size={22} className={i<9?'filled':''}/>)}</div><div className="ex-range"><span>Average 9</span><span>Peak 21</span></div><div className="ex-soft-note">Presence varies across the observation. Productivity cannot be inferred from headcount alone.</div></section>
          <section className="ex-panel"><PanelTitle icon={Clock3} title="Where time is lost"/><div className="ex-metric-line"><div><strong>23m <small>57s</small></strong><span>Interruption & inactivity</span></div><span className="ex-tag amber">9.2% of time</span></div><Segments label="Pouring 90.8%, no pouring 8.2%, no activity 0.9% of classified production time" total={productionTime} items={[{label:'Pouring',value:report.pouring,time:'237m 8s',color:'#252c30'},{label:'No pouring',value:report.noPouring,time:'21m 29s',color:'#d67535'},{label:'No activity',value:report.inactive,time:'2m 28s',color:'#cdd3d9'}]}/><div className="ex-time-rows"><span><i className="charcoal"/>Productive pouring <strong>237m 8s</strong></span><span><i className="orange"/>No pouring <strong>21m 29s</strong></span><span><i className="gray"/>No activity <strong>2m 28s</strong></span></div><p className="ex-meta">No-pouring periods are the primary interruption. Classified time: 261m 5s.</p></section>
        </div>
        <section className="ex-forecast"><div className="ex-forecast-icon"><ChartNoAxesCombined size={22}/></div><div><span className="ex-kicker">FORWARD VIEW</span><h3>Completion forecast needs a schedule baseline.</h3><p>261.7 yd³ remains at a reported rate of 35 yd³/hr. A finish date requires future rate assumptions, shift hours and planned milestones.</p></div><span className="ex-tag neutral">Forecast unavailable</span></section>
        <section className="ex-panel ex-attention" id="attention"><PanelTitle icon={Target} title="Executive attention" note="3 PRIORITIZED INVESTIGATIONS"/><p className="ex-attention-intro">Start with the strongest signals. Validate the evidence before intervening.</p>{actions.map((a,i) => <article key={a.title}><span className="ex-priority">0{i+1}</span><div><h3>{a.title}</h3><span className="ex-action-signal">{a.signal}</span><p>{a.text}</p></div><button className="ex-button" onClick={() => setEvidence(a)}>Review evidence <ArrowUpRight size={16}/></button></article>)}</section>
        <div className="ex-bottom-note"><span>BOLDT / CONSTRUCTION INTELLIGENCE</span><span>Zone 1 · Report-derived insights · No historical comparison available</span></div>
      </div>
    </main>
    {evidence && <EvidenceDialog item={evidence} close={() => setEvidence(null)}/>}
  </div>;
}
