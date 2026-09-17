import React, { useRef, useState, useEffect } from 'react';
import { LayoutDashboard, ChartNoAxesCombined, ShieldAlert, HardHat, ArrowUpRight, Download, LogOut, ChevronRight, CircleHelp, Clock3, Check, X, Building2, Layers3, CalendarDays, Users } from 'lucide-react';
import './executive.css';
import PouringTimeline from './PouringTimeline';
import RiskEvidence from './RiskEvidence';
import ProgressTrend, { progressData } from './ProgressTrend';
import LiveData from './LiveData';
import boldtLogo from './assets/boldt-logo.svg';

const report = {
  poured: 127, planned: 400, remaining: 261.7, rate: 35,
  pouring: 217 * 60 + 58, noPouring: 19 * 60 + 45, inactive: 2 * 60 + 16,
  active: 215 * 60 + 39, idle: 18 * 60 + 26, unobserved: 5 * 60 + 55,
  utilization: 90, averageWorkers: 9, peakWorkers: 21,
};
// Preserve the reference values, including independently rounded totals.
const performanceCards = [
  { label: 'Total pouring time', value: '03h 38m', unit: '', note: '90.8% stream' },
  { label: 'Volume completed', value: '127', unit: 'yd³', note: '32% of daily plan' },
  { label: 'Overall progress', value: '32.7', unit: '%', note: '4h observed' },
  { label: 'Estimated completion', value: 'Sep 18', unit: '', note: '2 days from report' },
];
const screenshotForecast = [
  { label: 'Planned completion', value: 'Oct 10, 2026', tone: 'neutral' },
  { label: 'Forecast completion', value: 'Sep 18, 2026', tone: 'green' },
  { label: 'Remaining volume', value: '261.7 yd³', tone: 'neutral' },
  { label: 'Required daily pace', value: '35 yd³/hr', tone: 'neutral' },
];

const alerts = [
  { name: 'Spatial congestion', value: 55, color: '#a18c96' },
  { name: 'High concentration', value: 27, color: '#a39b8b' },
  { name: 'No pouring', value: 3, color: '#777581' },
  { name: 'No activity', value: 1, color: '#505058' },
];
const alertRoute = alert => '#evidence/' + alert.name.toLowerCase().replaceAll(' ', '-');
const currentRiskEvidence = () => alerts.find(alert => alertRoute(alert) === window.location.hash) || null;
const totalAlerts = alerts.reduce((sum, alert) => sum + alert.value, 0);
const percent = value => (value * 100).toFixed(1);
const productionTime = report.pouring + report.noPouring + report.inactive;
const equipmentTime = report.active + report.idle + report.unobserved;
const equipmentOptions = [
  { id: 'concrete-pump', name: 'Concrete pump', utilization: report.utilization, status: 'Strong utilization', statusTone: 'green', description: 'Active for most of the observed period.', active: report.active, idle: report.idle, unobserved: report.unobserved, total: equipmentTime, note: '90% as reported. Time distribution uses 240m 00s.' },
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
  const [dashboardTab, setDashboardTab] = useState('reports');
  const [evidence, setEvidence] = useState(null);
  const [exported, setExported] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(0);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(equipmentOptions[0].id);
  const [riskEvidence, setRiskEvidence] = useState(currentRiskEvidence);
  const selected = alerts[selectedAlert];
  const selectedEquipment = equipmentOptions.find(item => item.id === selectedEquipmentId) || equipmentOptions[0];
  const nav = [['overview', LayoutDashboard, 'Dashboard'], ['production', ChartNoAxesCombined, 'Extraction'], ['efficiency', HardHat, 'Preprocess'], ['risk', ShieldAlert, 'Detection'], ['save-result', ShieldAlert, 'Save Result']];
  useEffect(() => {
    function syncRoute() {
      setDashboardTab('reports');
      const next = currentRiskEvidence();
      setRiskEvidence(next);
      if (next) { setSelectedAlert(alerts.indexOf(next)); setSection('risk'); }
      else {
        const id = window.location.hash.slice(1) || 'overview';
        setSection(id);
        requestAnimationFrame(() => {
          document.getElementById(id)?.scrollIntoView({ block: 'start' });
          if (id === 'risk') document.querySelector('.ex-alert-row.selected .ex-alert-evidence-arrow')?.focus({ preventScroll: true });
        });
      }
    }
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);
  function navigate(id) {
    if (id === 'save-result') { exportReport(); return; }
    setDashboardTab('reports');
    setSection(id);
    if (riskEvidence) window.location.hash = id;
    else requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
  function openRiskEvidence(alert, index) {
    setSelectedAlert(index);
    window.history.replaceState(null, '', '#risk');
    window.location.hash = alertRoute(alert);
  }
  function backToDashboard() { window.location.hash = 'risk'; }
  function exportReport() {
    const lines = ['BOLDT | Dashboard', 'Construction Stella | Zone 1 | Till Today', 'Last update: 16 September, 2026 | 09:00 AM', 'Total streaming: 4 hours', '', 'KEY PERFORMANCE', ...performanceCards.map(metric => metric.label + ': ' + metric.value + (metric.unit ? ' ' + metric.unit : '') + ' / ' + metric.note), '', 'COMPLETION FORECAST', '32.7% complete', ...screenshotForecast.map(metric => metric.label + ': ' + metric.value), '', 'EQUIPMENT & WORKFORCE', 'Concrete pump utilization: 90%', 'Active: 215m 39s / Idle: 18m 26s / Not observed: 5m 55s', 'Average workers: 9 / Peak workers: 21', '', 'OBSERVED TIME', 'Pouring: 217m 58s / No pouring: 19m 45s / No activity: 2m 16s', 'Interruption & inactivity: 22m 01s / 9.2% of time', '', 'ALERTS', ...alerts.map(a => `${a.name}: ${a.value} (${percent(a.value / totalAlerts)}%)`), '', 'ILLUSTRATIVE 14 DAY TREND', ...progressData.map(row => row.date + ': Planned ' + row.planned.toFixed(1) + '% / Actual ' + row.actual.toFixed(1) + '%'), '', 'SOURCE', 'Figma reference. The illustrative trend and rounded totals are preserved independently of the summary metrics.'];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], {type: 'text/plain;charset=utf-8'}));
    const link = document.createElement('a'); link.href = url; link.download = 'BOLDT-Executive-Report-Zone-1.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setExported(true);
  }
  return <div className="executive-app">
    <aside className="ex-sidebar">
      <a className="ex-brand" href="#overview" aria-label="BOLDT dashboard" onClick={e => {e.preventDefault(); navigate('overview');}}><img className="ex-brand-logo" src={boldtLogo} alt="BOLDT" /></a>
      <div className="ex-workspace"><span className="ex-workspace-icon"><Building2 size={20}/></span><div><strong>Construction intelligence</strong><small>Executive workspace</small></div></div>
      <span className="ex-nav-label">WORKSPACE</span><nav aria-label="Dashboard sections">{nav.map(([id, Icon, label]) => <button key={id} title={label} className={section === id ? 'active' : ''} onClick={() => navigate(id)} aria-current={section === id ? 'location' : undefined}><Icon size={18}/>{label}</button>)}</nav>
      <div className="ex-sidebar-bottom"><div className="ex-source-note"><span className="ex-live-dot"/> Report snapshot<p>One zone. A focused view of the work that matters.</p><button onClick={() => setEvidence({title: 'About this report', source: 'Supplied reference', evidence: 'This dashboard uses the Figma reference for Construction Stella, Zone 1, dated 16 September 2026. The illustrative trend and rounded totals are reproduced as supplied, independently of the summary metrics.', next: 'Connect dated operational reports to support project comparisons, historical trends and schedule assessments.'})}><CircleHelp size={15}/> Data & methodology</button></div><div className="ex-profile"><span>{(name || email || 'E').slice(0,1).toUpperCase()}</span><div><strong>{name || 'Executive'}</strong><small>Leadership view</small></div><button aria-label="Log out" title="Log out" onClick={onLogout}><LogOut size={18}/></button></div></div>
    </aside>
    <main className="ex-main">
      <div className="ex-topbar"><span>Workspace <ChevronRight size={14}/> <strong>{riskEvidence ? `Risk evidence / ${riskEvidence.name}` : 'Executive Insights'}</strong></span><span className="ex-snapshot"><span className="ex-live-dot"/> Last update: 16 September, 2026 | 09:00 AM</span></div>
      <div className="ex-content">
        {riskEvidence && <RiskEvidence alert={riskEvidence} total={totalAlerts} close={backToDashboard}/>} 
        <div hidden={Boolean(riskEvidence)}>
        <header className="ex-heading" id="overview"><div><span className="ex-kicker">Executive Insights.</span><h1>Dashboard</h1><p>Production, efficiency and operational risk at a glance.</p></div>{dashboardTab === 'reports' && <button className="ex-button dark" onClick={exportReport}><Download size={16}/> Export executive report</button>}</header>
        <div className="ex-dashboard-tabs" role="tablist" aria-label="Dashboard data views">
          {[['reports', 'Reports'], ['live', 'Live Data']].map(([id, label]) => <button type="button" key={id} role="tab" id={`tab-${id}`} aria-selected={dashboardTab === id} aria-controls={`panel-${id}`} tabIndex={dashboardTab === id ? 0 : -1} onClick={() => setDashboardTab(id)} onKeyDown={event => {
            if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
              event.preventDefault();
              const next = event.key === 'Home' ? 'reports' : event.key === 'End' ? 'live' : id === 'reports' ? 'live' : 'reports';
              setDashboardTab(next);
              document.getElementById(`tab-${next}`)?.focus();
            }
          }}>{label}</button>)}
        </div>
        <div id="panel-live" role="tabpanel" aria-labelledby="tab-live" hidden={dashboardTab !== 'live'} tabIndex={0}>
          {dashboardTab === 'live' && <LiveData/>}
        </div>
        <div id="panel-reports" role="tabpanel" aria-labelledby="tab-reports" hidden={dashboardTab !== 'reports'} tabIndex={0}>
        <div className="ex-filters"><label><Building2 size={16}/><span>Project<select aria-label="Project"><option>Construction Stella</option></select></span></label><label><Layers3 size={16}/><span>Zone<select aria-label="Zone"><option>Zone 1</option></select></span></label><label><CalendarDays size={16}/><span>Reporting period<select aria-label="Reporting period"><option>Till Today</option></select></span></label><div className="ex-confidence" role="meter" aria-label="Confidence Score" aria-valuemin={0} aria-valuemax={100} aria-valuenow={80}><div className="ex-confidence-gauge" aria-hidden="true">{Array.from({length:20}, (_, index) => <i key={index} className={index < 16 ? 'filled' : undefined} style={{transform: `rotate(${-85.5 + index * 9}deg)`}}/>)}<strong>80%</strong></div><span>Confidence Score</span></div></div>
        <section className="ex-screenshot-snapshot" aria-labelledby="snapshot-heading">
          <div className="ex-section-heading"><h2 id="snapshot-heading">Key performance</h2><span>Total streaming: 4 hours</span></div>
          <div className="ex-performance-cards" aria-label="Key performance metrics">
            {performanceCards.map(metric => <article className="ex-performance-card" key={metric.label}><h3>{metric.label}</h3><strong>{metric.value}{metric.unit && <small>{metric.unit}</small>}</strong><span>{metric.note}</span></article>)}
          </div>
          <div className="ex-performance-layout">
            <ProgressTrend/>
            <article className="ex-forecast-panel" aria-labelledby="forecast-heading">
              <div className="ex-performance-head"><div><span className="ex-kicker">CURRENT PACE</span><h3 id="forecast-heading">Completion forecast</h3></div></div>
              <Ring value={32.7} label="complete" color="#252c30" size={150}/>
              <div className="ex-forecast-list">{screenshotForecast.map(item => <div key={item.label}><span>{item.label}</span><strong className={item.tone === 'green' ? 'is-green' : undefined}>{item.value}</strong></div>)}</div>
            </article>
          </div>
        </section>
        {exported && <div className="ex-export-status" role="status"><Check size={16}/> Executive report downloaded as a text file.<button aria-label="Dismiss download message" onClick={() => setExported(false)}><X size={16}/></button></div>}
        <div className="ex-two-col">
          <PouringTimeline/>
          <section className="ex-panel" id="risk"><PanelTitle icon={ShieldAlert} title="Operational risk signals" note="ALERTS REPORT"/><div className="ex-risk-chart"><div className="ex-donut" role="img" aria-label="86 alerts: 55 spatial congestion, 27 high concentration, 3 no pouring, 1 no activity" style={{background:`conic-gradient(${alerts.map((a,i) => `${a.color} ${alerts.slice(0,i).reduce((s,a)=>s+a.value,0)/totalAlerts*100}% ${alerts.slice(0,i+1).reduce((s,a)=>s+a.value,0)/totalAlerts*100}%`).join(',')})`}}><div><strong>86</strong><span>Total alerts</span></div></div><div className="ex-alert-legend">{alerts.map((a,i) => <div key={a.name} className={`ex-alert-row ${selectedAlert===i?'selected':''}`}><button className="ex-alert-select" aria-pressed={selectedAlert===i} onClick={() => setSelectedAlert(i)}><i style={{background:a.color}}/><span>{a.name}</span><strong>{a.value}</strong><small>{Math.round(a.value/totalAlerts*100)}%</small></button><button type="button" className="ex-alert-evidence-arrow" aria-label={`View ${a.name.toLowerCase()} evidence`} title={`View ${a.name.toLowerCase()} evidence`} onClick={() => openRiskEvidence(a, i)}><ArrowUpRight size={17}/></button></div>)}</div></div><div className="ex-risk-insight" aria-live="polite"><span style={{background:selected.color}}/><p><strong>{selected.name}</strong> accounts for {percent(selected.value/totalAlerts)}% of alerts.{selectedAlert===0?' The dominant signal to investigate.':selectedAlert===1?' The second-largest operational signal.':' Review event evidence before inferring impact.'}</p></div></section>
        </div>
        <div className="ex-section-heading" id="efficiency"><h2>Resources & observed time</h2><span>Understand the operating context</span></div>
        <div className="ex-resource-grid">
          <section className="ex-panel"><div className="ex-equipment-head"><PanelTitle icon={HardHat} title="Equipment utilization"/><select aria-label="Equipment" value={selectedEquipmentId} onChange={event => setSelectedEquipmentId(event.target.value)}>{equipmentOptions.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><div className="ex-equipment-center"><Ring value={selectedEquipment.utilization} label="Utilization" color="#87958d" size={144}/><div><h3>{selectedEquipment.name}</h3><span className={`ex-tag ${selectedEquipment.statusTone}`}>{selectedEquipment.status}</span><p>{selectedEquipment.description}</p></div></div><Segments label={`${selectedEquipment.name}: active 215m 39s, idle 18m 26s, not observed 5m 55s`} total={selectedEquipment.total} items={[{label:'Active',value:selectedEquipment.active,time:'215m 39s',color:'#87958d'},{label:'Idle',value:selectedEquipment.idle,time:'18m 26s',color:'#a39b8b'},{label:'Not observed',value:selectedEquipment.unobserved,time:'5m 55s',color:'#505058'}]}/><div className="ex-time-legend"><span>Active<strong>215m 39s</strong></span><span>Idle<strong>18m 26s</strong></span><span>Not observed<strong>5m 55s</strong></span></div><p className="ex-meta">{selectedEquipment.note}</p></section>
          <section className="ex-panel"><PanelTitle icon={Users} title="Workforce presence"/><div className="ex-workforce-metrics"><div><strong>9</strong><span>Average workers</span></div><span className="ex-workforce-divider"/><div><strong>21</strong><span>Peak workers</span></div></div><div className="ex-workers" role="img" aria-label="Average 9 workers compared with peak 21">{Array.from({length:21},(_,i)=><Users key={i} size={22} className={i<9?'filled':''}/>)}</div><div className="ex-range"><span>Average 9</span><span>Peak 21</span></div><div className="ex-soft-note">Presence varies across the observation. Productivity cannot be inferred from headcount alone.</div></section>
          <section className="ex-panel"><PanelTitle icon={Clock3} title="Where time is lost"/><div className="ex-metric-line"><div><strong>22m <small>01s</small></strong><span>Interruption & inactivity</span></div><span className="ex-tag amber">9.2% of time</span></div><Segments label="Pouring 90.8%, no pouring 8.2%, no activity 0.9% of classified production time" total={productionTime} items={[{label:'Pouring',value:report.pouring,time:'217m 58s',color:'#252c30'},{label:'No pouring',value:report.noPouring,time:'19m 45s',color:'#a18c96'},{label:'No activity',value:report.inactive,time:'2m 16s',color:'#505058'}]}/><div className="ex-time-rows"><span><i className="charcoal"/>Productive pouring <strong>217m 58s</strong></span><span><i className="orange"/>No pouring <strong>19m 45s</strong></span><span><i className="gray"/>No activity <strong>2m 16s</strong></span></div><p className="ex-meta">No-pouring periods are the primary interruption. Classified time: 240m 00s.</p></section>
        </div>
        <div className="ex-bottom-note"><span>BOLDT / CONSTRUCTION INTELLIGENCE</span><span>Zone 1 · Report-derived insights · No historical comparison available</span></div>
        </div>
      </div>
      </div>
    </main>

    {evidence && <EvidenceDialog item={evidence} close={() => setEvidence(null)}/>}
  </div>;
}
