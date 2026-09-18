import React, { useRef, useState, useEffect } from 'react';
import { LayoutDashboard, ChartNoAxesCombined, ShieldAlert, HardHat, ArrowUpRight, LogOut, ChevronRight, CircleHelp, Clock3, Check, X, Building2, Layers3, CalendarDays, Users, FolderKanban, Plus, Pencil, Trash2, List, LayoutGrid } from 'lucide-react';
import './executive.css';
import PouringTimeline from './PouringTimeline';
import RiskEvidence from './RiskEvidence';
import ProgressTrend, { progressData } from './ProgressTrend';
import LiveData from './LiveData';
import boldtLogo from './assets/boldt-logo.svg';
import cameraPreview from './assets/camera-preview.png';

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
const managers = ['Avery Johnson', 'Morgan Lee', 'Priya Sharma', 'Daniel Brooks'];
const equipmentChecklist = ['Concrete pump', 'Mixer truck', 'Tower crane', 'Excavator', 'Laser screed', 'Generator', 'Boom lift', 'Compactor'];
const cameraOptions = ['Gate camera 01', 'Pour deck camera 02', 'North yard camera 03', 'Mobile crane camera 04'];
const taskOptions = ['Pouring', 'Rebar inspection', 'Formwork', 'Material staging', 'Finishing', 'Safety watch'];
const managerProfiles = [
  { id: 'avery-johnson', name: 'Avery Johnson', email: 'avery.johnson@boldt.com', phone: '+1 414 555 0184', role: 'Senior Project Manager', project: 'Construction Stella', status: 'Active' },
  { id: 'morgan-lee', name: 'Morgan Lee', email: 'morgan.lee@boldt.com', phone: '+1 920 555 0147', role: 'Operations Manager', project: 'Riverfront Core', status: 'Active' },
  { id: 'priya-sharma', name: 'Priya Sharma', email: 'priya.sharma@boldt.com', phone: '+1 608 555 0192', role: 'Site Manager', project: 'North Yard Expansion', status: 'Non-Active' },
  { id: 'daniel-brooks', name: 'Daniel Brooks', email: 'daniel.brooks@boldt.com', phone: '+1 262 555 0166', role: 'Delivery Manager', project: 'Lakeview Deck', status: 'Finished' },
];
const initialProjects = [
  { id: 'construction-stella', name: 'Construction Stella', description: 'Concrete operations for Zone 1 with four-hour progress monitoring.', location: 'Milwaukee, WI', startDate: '2026-09-03', endDate: '2026-10-10', equipment: ['Concrete pump', 'Mixer truck', 'Laser screed'], assignee: 'Avery Johnson', status: 'Active' },
  { id: 'riverfront-core', name: 'Riverfront Core', description: 'Structural prep and resource planning for the next pour cycle.', location: 'Green Bay, WI', startDate: '2026-09-18', endDate: '2026-11-02', equipment: ['Tower crane', 'Excavator', 'Generator'], assignee: 'Morgan Lee', status: 'Non-Active' },
  { id: 'lakeview-deck', name: 'Lakeview Deck', description: 'Completed deck pour review with equipment and manager records archived.', location: 'Madison, WI', startDate: '2026-07-12', endDate: '2026-08-28', equipment: ['Concrete pump', 'Compactor'], assignee: 'Daniel Brooks', status: 'Finished' },
];
const projectCategories = ['All', 'Active', 'Non-Active', 'Finished'];
const emptyZoneForm = { name: '', workerLimit: '', tasks: [], equipment: [], minClusterSize: '', crowdingSensitivity: 'Normal', breakTime: '', allowOverlap: false };
const emptyProjectForm = { name: '', description: '', location: '', startDate: '', endDate: '', equipment: [], assignee: managers[0], status: 'Active', camera: cameraOptions[0], cameraLink: '', videoName: '', zones: [] };
const emptyManagerForm = { name: '', email: '', phone: '', role: '', project: 'Construction Stella' };

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
function ConfidenceScore() { return <div className="ex-confidence" role="meter" aria-label="Confidence Score" aria-valuemin={0} aria-valuemax={100} aria-valuenow={80}><div className="ex-confidence-gauge" aria-hidden="true">{Array.from({length:20}, (_, index) => <i key={index} className={index < 16 ? 'filled' : undefined} style={{transform: `rotate(${-85.5 + index * 9}deg)`}}/>)}<strong>80%</strong></div><span>Confidence Score</span></div>; }
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

function ProjectsAdmin() {
  const [projects, setProjects] = useState(initialProjects);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [category, setCategory] = useState('All');
  const [view, setView] = useState('cards');
  const [form, setForm] = useState(emptyProjectForm);
  const [projectStep, setProjectStep] = useState(1);
  const [zoneForm, setZoneForm] = useState(emptyZoneForm);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [createdProject, setCreatedProject] = useState('');
  const visibleProjects = category === 'All' ? projects : projects.filter(project => project.status === category);
  const isEditing = Boolean(editingId);
  const canContinueProject = form.name && form.description && form.location && form.startDate && form.endDate;
  function updateField(field, value) { setForm(current => ({ ...current, [field]: value })); }
  function toggleEquipment(name) {
    setForm(current => ({
      ...current,
      equipment: current.equipment.includes(name) ? current.equipment.filter(item => item !== name) : [...current.equipment, name],
    }));
  }
  function toggleZoneMulti(field, name) {
    setZoneForm(current => ({
      ...current,
      [field]: current[field].includes(name) ? current[field].filter(item => item !== name) : [...current[field], name],
    }));
  }
  function addZone() {
    if (!zoneForm.name || !zoneForm.workerLimit) return;
    setForm(current => ({ ...current, zones: [...current.zones, { ...zoneForm, id: `${zoneForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'zone'}-${current.zones.length + 1}` }] }));
    setZoneForm(emptyZoneForm);
  }
  function removeZone(id) { setForm(current => ({ ...current, zones: current.zones.filter(zone => zone.id !== id) })); }
  function createProject(event) {
    event.preventDefault();
    if (isEditing) {
      setProjects(current => current.map(project => project.id === editingId ? { ...project, ...form } : project));
      setCreatedProject(`${form.name} updated`);
      setEditingId('');
    } else {
      const next = { id: `${form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'project'}-${projects.length + 1}`, ...form };
      setProjects(current => [next, ...current]);
      setCreatedProject(`${form.name} created`);
    }
    setForm(emptyProjectForm);
    setProjectStep(1);
    setZoneForm(emptyZoneForm);
    setShowZoneForm(false);
    setCreating(false);
  }
  function startEdit(project) {
    setForm({ ...emptyProjectForm, ...project, zones: project.zones || [] });
    setEditingId(project.id);
    setCreating(true);
    setProjectStep(1);
    setZoneForm(emptyZoneForm);
    setShowZoneForm(false);
    setCreatedProject('');
  }
  function cancelForm() { setCreating(false); setEditingId(''); setForm(emptyProjectForm); setProjectStep(1); setZoneForm(emptyZoneForm); setShowZoneForm(false); }
  function deleteProject(project) {
    setProjects(current => current.filter(item => item.id !== project.id));
    if (editingId === project.id) cancelForm();
    setCreatedProject(`${project.name} deleted`);
  }
  const projectActions = project => <div className="ex-project-card-actions"><button type="button" aria-label={`Edit ${project.name}`} title="Edit project" onClick={() => startEdit(project)}><Pencil size={15}/><span>Edit</span></button><button type="button" aria-label={`Delete ${project.name}`} title="Delete project" onClick={() => deleteProject(project)}><Trash2 size={15}/><span>Delete</span></button></div>;
  return <section className="ex-projects-page" aria-labelledby="projects-title">
    <header className="ex-heading ex-projects-heading"><div><span className="ex-kicker">ADMIN WORKSPACE</span><h1 id="projects-title">Projects</h1><p>Manage construction projects, assigned managers and equipment plans.</p></div><div className="ex-project-heading-actions"><span className="ex-project-count"><strong>{visibleProjects.length}</strong><span>{visibleProjects.length === 1 ? 'Project' : 'Projects'}</span></span><button type="button" className="ex-button dark" onClick={() => setCreating(true)}><Plus size={16}/> Create Projects</button></div></header>
    {!creating && <div className="ex-project-filter"><label>Project category<select value={category} onChange={event => setCategory(event.target.value)}>{projectCategories.map(item => <option key={item}>{item}</option>)}</select></label><div className="ex-project-view-toggle" role="group" aria-label="Project view"><button type="button" className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-pressed={view === 'list'}><List size={15}/> List</button><button type="button" className={view === 'cards' ? 'active' : ''} onClick={() => setView('cards')} aria-pressed={view === 'cards'}><LayoutGrid size={15}/> Cards</button></div></div>}
    {createdProject && <div className="ex-export-status" role="status"><Check size={16}/> {createdProject}.<button aria-label="Dismiss project message" onClick={() => setCreatedProject('')}><X size={16}/></button></div>}
    {creating && <form className="ex-project-form ex-panel" onSubmit={createProject}>
      <div className="ex-project-form-head"><div><span className="ex-kicker">{isEditing ? 'EDIT PROJECT' : 'NEW PROJECT'}</span><h2>{isEditing ? 'Edit project' : 'Create project'}</h2></div><button type="button" className="ex-close-inline" onClick={cancelForm} aria-label="Close project form"><X size={18}/></button></div>
      <div className="ex-project-steps" aria-label="Project creation steps"><span className={projectStep === 1 ? 'active' : ''}>1. Project details</span><span className={projectStep === 2 ? 'active' : ''}>2. Camera & zones</span></div>
      {projectStep === 1 && <><div className="ex-project-fields">
        <label>Project name<input required value={form.name} onChange={event => updateField('name', event.target.value)} placeholder="Project name"/></label>
        <label>Location<input required value={form.location} onChange={event => updateField('location', event.target.value)} placeholder="City, State"/></label>
        <label>Status<select value={form.status} onChange={event => updateField('status', event.target.value)}>{projectCategories.filter(item => item !== 'All').map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="ex-project-span">Project Description<textarea required rows={4} value={form.description} onChange={event => updateField('description', event.target.value)} placeholder="Brief project description"/></label>
        <label>Start Date<input required type="date" value={form.startDate} onChange={event => updateField('startDate', event.target.value)}/></label>
        <label>End Date<input required type="date" value={form.endDate} onChange={event => updateField('endDate', event.target.value)}/></label>
        <label>Assignee<select value={form.assignee} onChange={event => updateField('assignee', event.target.value)}>{managers.map(manager => <option key={manager}>{manager}</option>)}</select></label>
      </div>
      <fieldset className="ex-equipment-checks"><legend>List of equipment's going to use</legend>{equipmentChecklist.map(item => <label key={item}><input type="checkbox" checked={form.equipment.includes(item)} onChange={() => toggleEquipment(item)}/><span>{item}</span></label>)}</fieldset>
      <div className="ex-project-actions"><button type="button" className="ex-button" onClick={cancelForm}>Cancel</button><button type="button" className="ex-button dark" disabled={!canContinueProject} onClick={() => setProjectStep(2)}>Next: Camera selection</button></div></>}
      {projectStep === 2 && <><div className="ex-project-fields ex-camera-fields">
        <label>Camera selection<select value={form.camera} onChange={event => updateField('camera', event.target.value)}>{cameraOptions.map(camera => <option key={camera}>{camera}</option>)}</select></label>
        <label>Camera link<input type="url" value={form.cameraLink} onChange={event => updateField('cameraLink', event.target.value)} placeholder="https://camera-feed.example/video"/></label>
        <label className="ex-project-upload">Video from camera<input type="file" accept="video/*" onChange={event => updateField('videoName', event.target.files?.[0]?.name || '')}/><span>{form.videoName || 'Add video to unlock zone creation'}</span></label>
      </div>
      {form.camera && <figure className="ex-camera-preview"><img src={cameraPreview} alt="Construction camera preview"/><button type="button" aria-label="Play camera preview"><span/> </button><figcaption><strong>{form.camera}</strong><span>{form.cameraLink || form.videoName || 'Selected camera preview'}</span></figcaption></figure>}
      <section className="ex-zone-builder" aria-label="Zone creation">
        <div className="ex-project-form-head"><div><span className="ex-kicker">ZONE SETUP</span><h2>Create zone</h2></div></div>
        {!showZoneForm ? <div className="ex-zone-start"><button type="button" className="ex-button dark" onClick={() => setShowZoneForm(true)}><Plus size={16}/> Create Zone</button></div> : <><div className="ex-project-fields">
          <label>Zone name<input value={zoneForm.name} onChange={event => setZoneForm(current => ({ ...current, name: event.target.value }))} placeholder="Zone name"/></label>
          <label>Worker Limit<input type="number" min="1" value={zoneForm.workerLimit} onChange={event => setZoneForm(current => ({ ...current, workerLimit: event.target.value }))} placeholder="Worker limit"/></label>
          <label>Min Cluster Size<input type="number" min="1" value={zoneForm.minClusterSize} onChange={event => setZoneForm(current => ({ ...current, minClusterSize: event.target.value }))} placeholder="Min cluster size"/></label>
          <label>Crowding sensitivity<select value={zoneForm.crowdingSensitivity} onChange={event => setZoneForm(current => ({ ...current, crowdingSensitivity: event.target.value }))}><option>Normal</option><option>Tight</option><option>Loose</option></select></label>
          <label>Break Time<input type="time" value={zoneForm.breakTime} onChange={event => setZoneForm(current => ({ ...current, breakTime: event.target.value }))}/></label>
          <label className="ex-overlap-check"><input type="checkbox" checked={zoneForm.allowOverlap} onChange={event => setZoneForm(current => ({ ...current, allowOverlap: event.target.checked }))}/><span>Allow overlap</span></label>
        </div>
        <fieldset className="ex-equipment-checks"><legend>Task - Multi selection</legend>{taskOptions.map(task => <label key={task}><input type="checkbox" checked={zoneForm.tasks.includes(task)} onChange={() => toggleZoneMulti('tasks', task)}/><span>{task}</span></label>)}</fieldset>
        <fieldset className="ex-equipment-checks"><legend>Equipment - Multi selection</legend>{equipmentChecklist.map(item => <label key={item}><input type="checkbox" checked={zoneForm.equipment.includes(item)} onChange={() => toggleZoneMulti('equipment', item)}/><span>{item}</span></label>)}</fieldset>
        <div className="ex-project-actions"><button type="button" className="ex-button" onClick={() => { setShowZoneForm(false); setZoneForm(emptyZoneForm); }}>Cancel Zone</button><button type="button" className="ex-button" onClick={addZone}>Add Zone</button></div></>}
        {form.zones.length > 0 && <div className="ex-zone-list">{form.zones.map(zone => <article key={zone.id}><div><strong>{zone.name}</strong><span>{zone.workerLimit} workers · {zone.crowdingSensitivity}</span></div><button type="button" aria-label={`Remove ${zone.name}`} onClick={() => removeZone(zone.id)}><X size={16}/></button></article>)}</div>}
      </section>
      <div className="ex-project-actions"><button type="button" className="ex-button" onClick={() => setProjectStep(1)}>Back</button><button type="submit" className="ex-button dark">{isEditing ? 'Save Changes' : 'Create Project'}</button></div></>}
    </form>}
    {view === 'cards' ? <div className="ex-project-list" aria-label="Project cards">
      {visibleProjects.map(project => <article className="ex-project-card" key={project.id}><div className="ex-project-card-head"><span className={`ex-tag ${project.status === 'Active' ? 'green' : project.status === 'Finished' ? 'amber' : 'neutral'}`}>{project.status}</span>{projectActions(project)}</div><div><h2>{project.name}</h2><p>{project.description}</p></div><dl><div><dt>Location</dt><dd>{project.location}</dd></div><div><dt>Timeline</dt><dd>{project.startDate} to {project.endDate}</dd></div><div><dt>Assignee</dt><dd>{project.assignee}</dd></div><div><dt>Equipment</dt><dd>{project.equipment.join(', ') || 'Not selected'}</dd></div></dl></article>)}
    </div> : <div className="ex-project-table" role="table" aria-label="Project list"><div role="row" className="ex-project-table-head"><span role="columnheader">Project</span><span role="columnheader">Status</span><span role="columnheader">Location</span><span role="columnheader">Assignee</span><span role="columnheader">Timeline</span><span role="columnheader">Actions</span></div>{visibleProjects.map(project => <div role="row" className="ex-project-table-row" key={project.id}><div role="cell"><strong>{project.name}</strong><small>{project.description}</small></div><span role="cell" className={`ex-tag ${project.status === 'Active' ? 'green' : project.status === 'Finished' ? 'amber' : 'neutral'}`}>{project.status}</span><span role="cell">{project.location}</span><span role="cell">{project.assignee}</span><span role="cell">{project.startDate} to {project.endDate}</span><div role="cell">{projectActions(project)}</div></div>)}</div>}
  </section>;
}

function ManagersAdmin() {
  const [managerList, setManagerList] = useState(managerProfiles);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [view, setView] = useState('cards');
  const [form, setForm] = useState(emptyManagerForm);
  const [message, setMessage] = useState('');
  const visibleManagers = managerList;
  const isEditing = Boolean(editingId);
  function updateField(field, value) { setForm(current => ({ ...current, [field]: value })); }
  function cancelForm() { setCreating(false); setEditingId(''); setForm(emptyManagerForm); }
  function saveManager(event) {
    event.preventDefault();
    if (isEditing) {
      setManagerList(current => current.map(manager => manager.id === editingId ? { ...manager, ...form } : manager));
      setMessage(`${form.name} updated`);
      setEditingId('');
    } else {
      const next = { id: `${form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'manager'}-${managerList.length + 1}`, ...form };
      setManagerList(current => [next, ...current]);
      setMessage(`${form.name} added`);
    }
    setForm(emptyManagerForm);
    setCreating(false);
  }
  function startEdit(manager) {
    setForm({ name: manager.name, email: manager.email, phone: manager.phone, role: manager.role, project: manager.project });
    setEditingId(manager.id);
    setCreating(true);
    setMessage('');
  }
  function deleteManager(manager) {
    setManagerList(current => current.filter(item => item.id !== manager.id));
    if (editingId === manager.id) cancelForm();
    setMessage(`${manager.name} deleted`);
  }
  const managerActions = manager => <div className="ex-project-card-actions"><button type="button" aria-label={`Edit ${manager.name}`} title="Edit manager" onClick={() => startEdit(manager)}><Pencil size={15}/><span>Edit</span></button><button type="button" aria-label={`Delete ${manager.name}`} title="Delete manager" onClick={() => deleteManager(manager)}><Trash2 size={15}/><span>Delete</span></button></div>;
  return <section className="ex-projects-page" aria-labelledby="managers-title">
    <header className="ex-heading ex-projects-heading"><div><span className="ex-kicker">ADMIN WORKSPACE</span><h1 id="managers-title">Managers</h1><p>Manage project managers, assignments and availability.</p></div><div className="ex-project-heading-actions"><span className="ex-project-count"><strong>{visibleManagers.length}</strong><span>{visibleManagers.length === 1 ? 'Manager' : 'Managers'}</span></span><button type="button" className="ex-button dark" onClick={() => setCreating(true)}><Plus size={16}/> Add New Manager</button></div></header>
    <div className="ex-project-filter ex-manager-viewbar"><div className="ex-project-view-toggle" role="group" aria-label="Manager view"><button type="button" className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-pressed={view === 'list'}><List size={15}/> List</button><button type="button" className={view === 'cards' ? 'active' : ''} onClick={() => setView('cards')} aria-pressed={view === 'cards'}><LayoutGrid size={15}/> Cards</button></div></div>
    {message && <div className="ex-export-status" role="status"><Check size={16}/> {message}.<button aria-label="Dismiss manager message" onClick={() => setMessage('')}><X size={16}/></button></div>}
    {creating && <form className="ex-project-form ex-panel" onSubmit={saveManager}>
      <div className="ex-project-form-head"><div><span className="ex-kicker">{isEditing ? 'EDIT MANAGER' : 'NEW MANAGER'}</span><h2>{isEditing ? 'Edit manager' : 'Add new manager'}</h2></div><button type="button" className="ex-close-inline" onClick={cancelForm} aria-label="Close manager form"><X size={18}/></button></div>
      <div className="ex-project-fields">
        <label>Manager name<input required value={form.name} onChange={event => updateField('name', event.target.value)} placeholder="Manager name"/></label>
        <label>Email<input required type="email" value={form.email} onChange={event => updateField('email', event.target.value)} placeholder="manager@boldt.com"/></label>
        <label>Phone<input required value={form.phone} onChange={event => updateField('phone', event.target.value)} placeholder="Phone number"/></label>
        <label>Role<input required value={form.role} onChange={event => updateField('role', event.target.value)} placeholder="Manager role"/></label>
        <label>Assigned project<select value={form.project} onChange={event => updateField('project', event.target.value)}>{initialProjects.map(project => <option key={project.id}>{project.name}</option>)}</select></label>
      </div>
      <div className="ex-project-actions"><button type="button" className="ex-button" onClick={cancelForm}>Cancel</button><button type="submit" className="ex-button dark">{isEditing ? 'Save Changes' : 'Add Manager'}</button></div>
    </form>}
    {view === 'cards' ? <div className="ex-project-list" aria-label="Manager cards">
      {visibleManagers.map(manager => <article className="ex-project-card ex-manager-card" key={manager.id}><div className="ex-project-card-head ex-manager-card-actions">{managerActions(manager)}</div><div><h2>{manager.name}</h2><p>{manager.role}</p></div><dl><div><dt>Email</dt><dd>{manager.email}</dd></div><div><dt>Phone</dt><dd>{manager.phone}</dd></div><div><dt>Assigned project</dt><dd>{manager.project}</dd></div><div><dt>Role</dt><dd>{manager.role}</dd></div></dl></article>)}
    </div> : <div className="ex-project-table ex-manager-table" role="table" aria-label="Manager list"><div role="row" className="ex-project-table-head"><span role="columnheader">Manager</span><span role="columnheader">Role</span><span role="columnheader">Project</span><span role="columnheader">Contact</span><span role="columnheader">Actions</span></div>{visibleManagers.map(manager => <div role="row" className="ex-project-table-row" key={manager.id}><div role="cell"><strong>{manager.name}</strong><small>{manager.email}</small></div><span role="cell">{manager.role}</span><span role="cell">{manager.project}</span><span role="cell">{manager.phone}</span><div role="cell">{managerActions(manager)}</div></div>)}</div>}
  </section>;
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
  const nav = [['overview', LayoutDashboard, 'Dashboard'], ['projects', FolderKanban, 'Projects'], ['managers', Users, 'Managers'], ['production', ChartNoAxesCombined, 'Extraction'], ['efficiency', HardHat, 'Preprocess'], ['risk', ShieldAlert, 'Detection'], ['save-result', ShieldAlert, 'Save Result']];
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
    if (id === 'projects' || id === 'managers') { window.history.replaceState(null, '', `#${id}`); return; }
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
      <div className="ex-topbar" aria-label="Workspace breadcrumb"><nav className="ex-breadcrumb" aria-label="Breadcrumb"><span>Workspace</span><ChevronRight size={15} strokeWidth={1.8} aria-hidden="true"/><strong>{riskEvidence ? `Risk evidence / ${riskEvidence.name}` : section === 'projects' ? 'Projects' : section === 'managers' ? 'Managers' : 'Executive Insights'}</strong></nav><span className="ex-snapshot"><span className="ex-live-dot" aria-hidden="true"/> Last update: 16 September, 2026 | 09:00 AM</span></div>
      <div className="ex-content">
        {riskEvidence && <RiskEvidence alert={riskEvidence} total={totalAlerts} close={backToDashboard}/>} 
        {section === 'projects' && !riskEvidence && <ProjectsAdmin/>}
        {section === 'managers' && !riskEvidence && <ManagersAdmin/>}
        <div hidden={Boolean(riskEvidence) || section === 'projects' || section === 'managers'}>
        <header className="ex-heading" id="overview"><div><span className="ex-kicker">Executive Insights.</span><h1>Dashboard</h1><p>Production, efficiency and operational risk at a glance.</p></div>{dashboardTab === 'reports' && <ConfidenceScore/>}</header>
        <div className="ex-dashboard-tabs" role="tablist" aria-label="Dashboard data views">
          {[['reports', 'Reports'], ['live', 'Live Data']].map(([id, label]) => <button type="button" key={id} role="tab" id={`tab-${id}`} aria-selected={dashboardTab === id} aria-controls={`panel-${id}`} tabIndex={dashboardTab === id ? 0 : -1} onClick={() => setDashboardTab(id)} onKeyDown={event => {
            if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
              event.preventDefault();
              const next = event.key === 'Home' ? 'reports' : event.key === 'End' ? 'live' : id === 'reports' ? 'live' : 'reports';
              setDashboardTab(next);
              document.getElementById(`tab-${next}`)?.focus();
            }
          }}>{label}</button>)}
          {dashboardTab === 'reports' && <div className="ex-filter-controls"><label><Building2 size={16}/><span>Project<select aria-label="Project"><option>Construction Stella</option></select></span></label><label><Layers3 size={16}/><span>Zone<select aria-label="Zone"><option>Zone 1</option></select></span></label><label><CalendarDays size={16}/><span>Reporting period<select aria-label="Reporting period"><option>Till Today</option></select></span></label></div>}
        </div>
        <div id="panel-live" role="tabpanel" aria-labelledby="tab-live" hidden={dashboardTab !== 'live'} tabIndex={0}>
          {dashboardTab === 'live' && <LiveData/>}
        </div>
        <div id="panel-reports" role="tabpanel" aria-labelledby="tab-reports" hidden={dashboardTab !== 'reports'} tabIndex={0}>
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
