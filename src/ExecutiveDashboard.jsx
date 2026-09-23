import React, { useRef, useState, useEffect } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { LayoutDashboard, ChartNoAxesCombined, ShieldAlert, HardHat, ArrowUpRight, ArrowLeft, LogOut, ChevronRight, ChevronDown, CircleHelp, Clock3, Check, X, Building2, Layers3, CalendarDays, Users, FolderKanban, Plus, Pencil, Trash2, List, LayoutGrid, Search, Video, MapPin, Factory, Server } from 'lucide-react';
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
const equipmentTimeline = ['05:00 AM', '06:00', '07:00', '08:00', '09:00 AM'];
const managers = ['Avery Johnson', 'Morgan Lee', 'Priya Sharma', 'Daniel Brooks'];
const equipmentChecklist = ['Concrete pump', 'Mixer truck', 'Tower crane', 'Excavator', 'Laser screed', 'Generator', 'Boom lift', 'Compactor'];
const taskOptions = ['Pouring', 'Rebar inspection', 'Formwork', 'Material staging', 'Finishing', 'Safety watch'];
const roleOptions = ['General Contractor', 'Owner', 'Design Team', "Owner's Agent", 'Subcontractor', 'Construction Manager', 'Other'];
const managerProfiles = [
  { id: 'avery-johnson', name: 'Avery Johnson', email: 'avery.johnson@boldt.com', phone: '+1 414 555 0184', role: 'General Contractor', project: 'Construction Stella', status: 'Active' },
  { id: 'morgan-lee', name: 'Morgan Lee', email: 'morgan.lee@boldt.com', phone: '+1 920 555 0147', role: 'Owner', project: 'Riverfront Core', status: 'Active' },
  { id: 'priya-sharma', name: 'Priya Sharma', email: 'priya.sharma@boldt.com', phone: '+1 608 555 0192', role: 'Design Team', project: 'North Yard Expansion', status: 'Non-Active' },
  { id: 'daniel-brooks', name: 'Daniel Brooks', email: 'daniel.brooks@boldt.com', phone: '+1 262 555 0166', role: 'Construction Manager', project: 'Lakeview Deck', status: 'Finished' },
];
const initialProjects = [
  { id: 'construction-stella', name: 'Construction Stella', description: 'Concrete operations for Zone 1 with four-hour progress monitoring.', location: 'Milwaukee, WI', startDate: '2026-09-03T07:00', endDate: '2026-10-10T17:00', equipment: ['Concrete pump', 'Mixer truck', 'Laser screed'], assignee: 'Avery Johnson', status: 'Active', videos: [{ id: 'stella-camera-1', name: 'zone-1-progress.mp4', source: 'computer', zones: [{ id: 'stella-zone-1', name: 'Zone 1', workerLimit: '12', minClusterSize: '4', crowdingSensitivity: 'Normal', breakTime: '12:30' }] }] },
  { id: 'riverfront-core', name: 'Riverfront Core', description: 'Structural prep and resource planning for the next pour cycle.', location: 'Green Bay, WI', startDate: '2026-09-18T08:00', endDate: '2026-11-02T17:00', equipment: ['Tower crane', 'Excavator', 'Generator'], assignee: 'Morgan Lee', status: 'Non-Active', videos: [{ id: 'riverfront-camera-1', name: 'site-entry-feed.mp4', source: 'computer', zones: [{ id: 'riverfront-zone-a', name: 'Core deck', workerLimit: '10', minClusterSize: '3', crowdingSensitivity: 'Tight', breakTime: '13:00' }] }] },
  { id: 'lakeview-deck', name: 'Lakeview Deck', description: 'Completed deck pour review with equipment and manager records archived.', location: 'Madison, WI', startDate: '2026-07-12T08:00', endDate: '2026-08-28T16:30', equipment: ['Concrete pump', 'Compactor'], assignee: 'Daniel Brooks', status: 'Finished', videos: [{ id: 'lakeview-camera-1', name: 'deck-review.mp4', source: 'computer', zones: [{ id: 'lakeview-zone-1', name: 'Deck review', workerLimit: '8', minClusterSize: '2', crowdingSensitivity: 'Loose', breakTime: '12:00' }] }] },
];
const projectCategories = ['All', 'Active', 'Non-Active', 'Finished'];
const emptyZoneForm = { name: '', workerLimit: '', tasks: [], equipment: [], minClusterSize: '', crowdingSensitivity: 'Normal', breakTime: '', allowOverlap: false };
const emptyProjectForm = { name: '', description: '', location: '', startDate: '', endDate: '', equipment: [], assignee: managers[0], status: 'Active', videoName: '', videos: [], zones: [] };
const emptyManagerForm = { name: '', email: '', phone: '', role: '', project: 'Construction Stella' };
const formatProjectDateTime = value => value ? new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value)) : 'Not set';
const getProjectZones = project => [...(project.zones || []), ...(project.videos || []).flatMap(video => video.zones || [])];
const formatProjectSchedule = project => project.startDate || project.endDate ? `${formatProjectDateTime(project.startDate)} to ${formatProjectDateTime(project.endDate)}` : 'Not scheduled';
const formatProjectEquipment = project => project.equipment?.length ? project.equipment.join(', ') : 'Not selected';
const formatProjectZones = project => {
  const zones = getProjectZones(project);
  if (!zones.length) return 'No zones added';
  return `${zones.length} ${zones.length === 1 ? 'zone' : 'zones'}: ${zones.map(zone => `${zone.name}${zone.workerLimit ? ` (${zone.workerLimit} workers)` : ''}`).join(', ')}`;
};
const getProjectVideoSource = video => video?.source && video.source !== 'computer' ? video.source : '/live-data/site-001-observed.mp4';
const getProjectVideoPoster = video => video?.poster || '/live-data/site-001-poster.jpg';
const getDatePart = value => value?.split('T')[0] || '';
const getTimePart = value => value?.split('T')[1]?.slice(0, 5) || '';
const formatDateInput = value => {
  const date = getDatePart(value);
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return year && month && day ? `${day}-${month}-${year}` : date;
};
const parseDateInput = value => {
  const trimmed = value.trim();
  const displayMatch = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (displayMatch) return `${displayMatch[3]}-${displayMatch[2]}-${displayMatch[1]}`;
  return trimmed;
};

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
  const equipmentDropdownRef = useRef(null);
  const [projects, setProjects] = useState(initialProjects);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [category, setCategory] = useState('All');
  const [view, setView] = useState('list');
  const [form, setForm] = useState(emptyProjectForm);
  const [projectStep, setProjectStep] = useState(1);
  const [zoneForm, setZoneForm] = useState(emptyZoneForm);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [equipmentOpen, setEquipmentOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideoUploadPopup, setShowVideoUploadPopup] = useState(false);
  const [createdProject, setCreatedProject] = useState('');
  const visibleProjects = category === 'All' ? projects : projects.filter(project => project.status === category);
  const isEditing = Boolean(editingId);
  const canContinueProject = form.name && form.description && form.location;
  useEffect(() => {
    if (!equipmentOpen) return undefined;
    function closeOnOutsideClick(event) {
      if (!equipmentDropdownRef.current?.contains(event.target)) setEquipmentOpen(false);
    }
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [equipmentOpen]);
  function updateField(field, value) { setForm(current => ({ ...current, [field]: value })); }
  function updateDateTimeField(field, part, value) {
    setForm(current => {
      const date = part === 'date' ? value : getDatePart(current[field]);
      const time = part === 'time' ? value : getTimePart(current[field]);
      return { ...current, [field]: date || time ? `${date}${time ? `T${time}` : ''}` : '' };
    });
  }
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
  function handleVideoUpload(files) {
    const nextVideos = Array.from(files || []).map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: file.name,
      size: file.size,
      source: 'computer',
      zones: [],
    }));
    if (!nextVideos.length) return;
    setForm(current => ({ ...current, videoName: nextVideos[0].name, videos: [...(current.videos || []), ...nextVideos] }));
    setShowVideoUploadPopup(false);
  }
  function addVideoUrl() {
    const url = videoUrl.trim();
    if (!url) return;
    let sourceName = url;
    try {
      const parsed = new URL(url);
      const fileName = parsed.pathname.split('/').filter(Boolean).pop();
      sourceName = fileName ? decodeURIComponent(fileName) : parsed.hostname;
    } catch {
      sourceName = url.replace(/^https?:\/\//, '').split(/[/?#]/)[0] || 'Video link';
    }
    const nextVideo = {
      id: `${Date.now()}-url-${sourceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'video'}`,
      name: sourceName,
      source: url,
      zones: [],
    };
    setForm(current => ({ ...current, videoName: current.videoName || sourceName, videos: [...(current.videos || []), nextVideo] }));
    setVideoUrl('');
    setShowVideoUploadPopup(false);
  }
  function removeVideo(videoId) {
    setForm(current => ({ ...current, videos: (current.videos || []).filter(video => video.id !== videoId) }));
    if (showZoneForm === videoId) { setShowZoneForm(false); setZoneForm(emptyZoneForm); }
  }
  function addZone(videoId) {
    if (!zoneForm.name || !zoneForm.workerLimit) return;
    if (!videoId) {
      setForm(current => ({ ...current, zones: [...current.zones, { ...zoneForm, id: `${zoneForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'zone'}-${current.zones.length + 1}` }] }));
    } else {
      setForm(current => ({
        ...current,
        videos: (current.videos || []).map(video => video.id === videoId ? {
          ...video,
          zones: [...(video.zones || []), { ...zoneForm, id: `${zoneForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'zone'}-${(video.zones || []).length + 1}` }],
        } : video),
      }));
    }
    setZoneForm(emptyZoneForm);
    setShowZoneForm(false);
  }
  function removeZone(id, videoId) {
    if (!videoId) { setForm(current => ({ ...current, zones: current.zones.filter(zone => zone.id !== id) })); return; }
    setForm(current => ({ ...current, videos: (current.videos || []).map(video => video.id === videoId ? { ...video, zones: (video.zones || []).filter(zone => zone.id !== id) } : video) }));
  }
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
    setEquipmentOpen(false);
    setVideoUrl('');
    setShowVideoUploadPopup(false);
    setCreating(false);
  }
  function startEdit(project) {
    setForm({ ...emptyProjectForm, ...project, zones: project.zones || [] });
    setEditingId(project.id);
    setCreating(true);
    setProjectStep(1);
    setZoneForm(emptyZoneForm);
    setShowZoneForm(false);
    setEquipmentOpen(false);
    setVideoUrl('');
    setShowVideoUploadPopup(false);
    setCreatedProject('');
  }
  function cancelForm() { setCreating(false); setEditingId(''); setForm(emptyProjectForm); setProjectStep(1); setZoneForm(emptyZoneForm); setShowZoneForm(false); setEquipmentOpen(false); setVideoUrl(''); setShowVideoUploadPopup(false); }
  function deleteProject(project) {
    setProjects(current => current.filter(item => item.id !== project.id));
    if (editingId === project.id) cancelForm();
    setCreatedProject(`${project.name} deleted`);
  }
  function startCreateProject() { setCreating(true); setEditingId(''); setForm(emptyProjectForm); setProjectStep(1); setZoneForm(emptyZoneForm); setShowZoneForm(false); setEquipmentOpen(false); setVideoUrl(''); setShowVideoUploadPopup(false); setCreatedProject(''); }
  const equipmentSummary = form.equipment.length ? `${form.equipment.length} selected` : 'Select equipment';
  const equipmentDropdown = <div className="ex-equipment-dropdown" ref={equipmentDropdownRef}>
    <label>List of equipment's going to use</label>
    <button type="button" className="ex-equipment-dropdown-trigger" aria-expanded={equipmentOpen} onClick={() => setEquipmentOpen(open => !open)}>
      <span>{equipmentSummary}</span><ChevronDown size={17} aria-hidden="true"/>
    </button>
    {equipmentOpen && <div className="ex-equipment-dropdown-panel" role="menu">{equipmentChecklist.map(item => <label key={item} role="menuitemcheckbox" aria-checked={form.equipment.includes(item)}><input type="checkbox" checked={form.equipment.includes(item)} onChange={() => toggleEquipment(item)}/><span>{item}</span></label>)}</div>}
  </div>;
  const previewVideo = (form.videos || [])[0];
  if (creating) return <section className="ex-projects-page ex-create-project-screen" aria-labelledby="create-project-title">
    <header className="ex-heading ex-projects-heading"><div><button type="button" className="ex-back-link" onClick={cancelForm}><ArrowLeft size={16}/> Projects</button><span className="ex-kicker">{isEditing ? 'EDIT PROJECT' : 'NEW PROJECT'}</span><h1 id="create-project-title">{isEditing ? 'Edit project' : 'Create project'}</h1><p>Add the project details and connect video sources for zone setup.</p></div></header>
    <form className="ex-project-form ex-panel" onSubmit={createProject}>
      <div className="ex-create-stepper" aria-label="Project creation steps">
        <button type="button" className={projectStep === 1 ? 'active' : projectStep > 1 ? 'complete' : ''} onClick={() => setProjectStep(1)}><span>{projectStep > 1 ? <Check size={14}/> : '1'}</span><strong>Basic information</strong></button>
        <i/>
        <button type="button" className={projectStep === 2 ? 'active' : ''} disabled={!canContinueProject} onClick={() => setProjectStep(2)}><span>2</span><strong>Video configuration</strong></button>
      </div>
      {projectStep === 1 && <section className="ex-create-step-panel" aria-labelledby="basic-info-title">
        <div className="ex-project-form-head"><div><span className="ex-kicker">STEP 01</span><h2 id="basic-info-title">Basic information</h2></div></div>
        <div className="ex-project-fields">
          <label>Project name<input required value={form.name} onChange={event => updateField('name', event.target.value)} placeholder="Project name"/></label>
          <label>Location<input required value={form.location} onChange={event => updateField('location', event.target.value)} placeholder="City, State"/></label>
          <label>Status<select value={form.status} onChange={event => updateField('status', event.target.value)}>{projectCategories.filter(item => item !== 'All').map(item => <option key={item}>{item}</option>)}</select></label>
          <label>Assignee<select value={form.assignee} onChange={event => updateField('assignee', event.target.value)}>{managers.map(manager => <option key={manager}>{manager}</option>)}</select></label>
          <label className="ex-project-span">Project Description<textarea required rows={4} value={form.description} onChange={event => updateField('description', event.target.value)} placeholder="Brief project description"/></label>
        </div>
        {equipmentDropdown}
        <div className="ex-project-actions"><button type="button" className="ex-button" onClick={cancelForm}>Cancel</button><button type="button" className="ex-button dark" disabled={!canContinueProject} onClick={() => setProjectStep(2)}>Next: Video configuration</button></div>
      </section>}
      {projectStep === 2 && <section className="ex-create-step-panel" aria-labelledby="video-config-title">
        <div className="ex-project-form-head"><div><span className="ex-kicker">STEP 02</span><h2 id="video-config-title">Video configuration</h2></div></div>
        <div className="ex-video-config-grid">
          <div className={`ex-video-main-preview${previewVideo ? ' has-video' : ''}`}>
            {previewVideo ? <figure className="ex-camera-preview"><img src={cameraPreview} alt="Construction camera preview"/><button type="button" aria-label={`Play ${previewVideo.name}`}><span/> </button><figcaption><strong>{previewVideo.name}</strong><span>{previewVideo.source && previewVideo.source !== 'computer' ? 'URL source' : 'Uploaded video'}</span></figcaption></figure> : <div className="ex-video-placeholder"><span aria-hidden="true"/><strong>Video preview</strong><p>Preview will appear here after the user uploads a video or adds a URL.</p><button type="button" className="ex-button dark ex-video-upload-trigger" onClick={() => setShowVideoUploadPopup(true)}><Plus size={16}/> Upload video</button></div>}
          </div>
          <div className="ex-video-config-inputs">
            <div className="ex-project-fields ex-schedule-fields">
              <label className="ex-screenshot-input">Start date<span><input required type="text" inputMode="numeric" placeholder="dd-mm-yyyy" value={formatDateInput(form.startDate)} onChange={event => updateDateTimeField('startDate', 'date', parseDateInput(event.target.value))}/><CalendarDays size={16} aria-hidden="true"/></span></label>
              <label className="ex-screenshot-input">Start time<span><input required type="text" inputMode="numeric" placeholder="--:--" value={getTimePart(form.startDate)} onChange={event => updateDateTimeField('startDate', 'time', event.target.value)}/><Clock3 size={16} aria-hidden="true"/></span></label>
              <label className="ex-screenshot-input">End date<span><input required type="text" inputMode="numeric" placeholder="dd-mm-yyyy" value={formatDateInput(form.endDate)} onChange={event => updateDateTimeField('endDate', 'date', parseDateInput(event.target.value))}/><CalendarDays size={16} aria-hidden="true"/></span></label>
              <label className="ex-screenshot-input">End time<span><input required type="text" inputMode="numeric" placeholder="--:--" value={getTimePart(form.endDate)} onChange={event => updateDateTimeField('endDate', 'time', event.target.value)}/><Clock3 size={16} aria-hidden="true"/></span></label>
            </div>
            <div className="ex-video-zone-fields">
              <label className="ex-screenshot-input ex-video-zone-span">Define zone<span><input value={zoneForm.name} onChange={event => setZoneForm(current => ({ ...current, name: event.target.value }))} placeholder="Zone name"/></span></label>
              <label className="ex-screenshot-input">Worker limit<span><input type="number" min="1" value={zoneForm.workerLimit} onChange={event => setZoneForm(current => ({ ...current, workerLimit: event.target.value }))} placeholder="Worker limit"/></span></label>
              <label className="ex-screenshot-input">Min Cluster<span><input type="number" min="1" value={zoneForm.minClusterSize} onChange={event => setZoneForm(current => ({ ...current, minClusterSize: event.target.value }))} placeholder="Min cluster"/></span></label>
              <label className="ex-screenshot-input">Crowding sensitivity<span><select value={zoneForm.crowdingSensitivity} onChange={event => setZoneForm(current => ({ ...current, crowdingSensitivity: event.target.value }))}><option>Normal</option><option>Tight</option><option>Loose</option></select><ChevronDown size={17} aria-hidden="true"/></span></label>
              <label className="ex-screenshot-input">Break time<span><input type="text" inputMode="numeric" placeholder="--:--" value={zoneForm.breakTime} onChange={event => setZoneForm(current => ({ ...current, breakTime: event.target.value }))}/><Clock3 size={16} aria-hidden="true"/></span></label>
            </div>
          </div>
        </div>
        {showVideoUploadPopup && <div className="ex-video-upload-overlay" role="dialog" aria-modal="true" aria-labelledby="video-upload-title" onClick={() => setShowVideoUploadPopup(false)}>
          <div className="ex-video-upload-popover" onClick={event => event.stopPropagation()}>
            <button type="button" className="ex-close-inline" aria-label="Close upload options" onClick={() => setShowVideoUploadPopup(false)}><X size={16}/></button>
            <div className="ex-project-form-head"><div><span className="ex-kicker">VIDEO SOURCE</span><h2 id="video-upload-title">Upload video</h2></div></div>
            <label className="ex-project-upload">Upload from computer<input type="file" accept="video/*" multiple onChange={event => { handleVideoUpload(event.target.files); event.target.value = ''; }}/></label>
            <div className="ex-video-source-fields">
              <label className="ex-video-url-field">Provide URL<input type="url" value={videoUrl} onChange={event => setVideoUrl(event.target.value)} placeholder="https://camera-feed.example/video" autoFocus/></label>
              <button type="button" className="ex-button" disabled={!videoUrl.trim()} onClick={addVideoUrl}>Add URL</button>
            </div>
          </div>
        </div>}
        <div className="ex-video-list" aria-label="Uploaded videos and zones">
          {(form.videos || []).map((video, index) => <article className="ex-video-card" key={video.id}>
            <div className="ex-video-card-head"><div><span className="ex-kicker">VIDEO {index + 1}</span><h3>{video.name}</h3></div><button type="button" className="ex-close-inline" aria-label={`Remove ${video.name}`} onClick={() => removeVideo(video.id)}><X size={16}/></button></div>
            <section className="ex-zone-builder" aria-label={`Zone creation for ${video.name}`}>
              <div className="ex-project-form-head"><div><span className="ex-kicker">ZONE SETUP</span><h2>Create zone</h2></div></div>
              {showZoneForm !== video.id ? <div className="ex-zone-start"><button type="button" className="ex-button dark" onClick={() => { setShowZoneForm(video.id); setZoneForm(emptyZoneForm); }}><Plus size={16}/> Create Zone</button></div> : <><div className="ex-project-fields">
                <label>Zone name<input value={zoneForm.name} onChange={event => setZoneForm(current => ({ ...current, name: event.target.value }))} placeholder="Zone name"/></label>
                <label>Worker Limit<input type="number" min="1" value={zoneForm.workerLimit} onChange={event => setZoneForm(current => ({ ...current, workerLimit: event.target.value }))} placeholder="Worker limit"/></label>
                <label>Min Cluster Size<input type="number" min="1" value={zoneForm.minClusterSize} onChange={event => setZoneForm(current => ({ ...current, minClusterSize: event.target.value }))} placeholder="Min cluster size"/></label>
                <label>Crowding sensitivity<select value={zoneForm.crowdingSensitivity} onChange={event => setZoneForm(current => ({ ...current, crowdingSensitivity: event.target.value }))}><option>Normal</option><option>Tight</option><option>Loose</option></select></label>
                <label>Break Time<input type="time" value={zoneForm.breakTime} onChange={event => setZoneForm(current => ({ ...current, breakTime: event.target.value }))}/></label>
                <label className="ex-overlap-check"><input type="checkbox" checked={zoneForm.allowOverlap} onChange={event => setZoneForm(current => ({ ...current, allowOverlap: event.target.checked }))}/><span>Allow overlap</span></label>
              </div>
              <fieldset className="ex-equipment-checks"><legend>Task - Multi selection</legend>{taskOptions.map(task => <label key={task}><input type="checkbox" checked={zoneForm.tasks.includes(task)} onChange={() => toggleZoneMulti('tasks', task)}/><span>{task}</span></label>)}</fieldset>
              <fieldset className="ex-equipment-checks"><legend>Equipment - Multi selection</legend>{equipmentChecklist.map(item => <label key={item}><input type="checkbox" checked={zoneForm.equipment.includes(item)} onChange={() => toggleZoneMulti('equipment', item)}/><span>{item}</span></label>)}</fieldset>
              <div className="ex-project-actions"><button type="button" className="ex-button" onClick={() => { setShowZoneForm(false); setZoneForm(emptyZoneForm); }}>Cancel Zone</button><button type="button" className="ex-button" onClick={() => addZone(video.id)}>Add Zone</button></div></>}
              {(video.zones || []).length > 0 && <div className="ex-zone-list">{video.zones.map(zone => <article key={zone.id}><div><strong>{zone.name}</strong><span>{zone.workerLimit} workers · {zone.crowdingSensitivity}</span></div><button type="button" aria-label={`Remove ${zone.name}`} onClick={() => removeZone(zone.id, video.id)}><X size={16}/></button></article>)}</div>}
            </section>
          </article>)}
        </div>
        <div className="ex-project-actions"><button type="button" className="ex-button" onClick={() => setProjectStep(1)}>Back</button><button type="submit" className="ex-button dark">{isEditing ? 'Save Changes' : 'Create Project'}</button></div>
      </section>}
    </form>
  </section>;
  const projectActions = project => <div className="ex-project-card-actions"><button type="button" aria-label={`Edit ${project.name}`} title="Edit project" onClick={() => startEdit(project)}><Pencil size={15}/><span>Edit</span></button><button type="button" aria-label={`Delete ${project.name}`} title="Delete project" onClick={() => deleteProject(project)}><Trash2 size={15}/><span>Delete</span></button></div>;
  return <section className="ex-projects-page" aria-labelledby="projects-title">
    <header className="ex-heading ex-projects-heading"><div><span className="ex-kicker">ADMIN WORKSPACE</span><h1 id="projects-title">Projects</h1><p>Manage construction projects, assigned managers and equipment plans.</p></div><div className="ex-project-heading-actions"><span className="ex-project-count"><strong>{visibleProjects.length}</strong><span>{visibleProjects.length === 1 ? 'Project' : 'Projects'}</span></span><button type="button" className="ex-button dark" onClick={startCreateProject}><Plus size={16}/> Create Project</button></div></header>
    {!creating && <div className="ex-project-filter"><label>Project category<select value={category} onChange={event => setCategory(event.target.value)}>{projectCategories.map(item => <option key={item}>{item}</option>)}</select></label><div className="ex-project-view-toggle" role="group" aria-label="Project view"><button type="button" className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-pressed={view === 'list'}><List size={15}/> List</button><button type="button" className={view === 'cards' ? 'active' : ''} onClick={() => setView('cards')} aria-pressed={view === 'cards'}><LayoutGrid size={15}/> Cards</button></div></div>}
    {createdProject && <div className="ex-export-status" role="status"><Check size={16}/> {createdProject}.<button aria-label="Dismiss project message" onClick={() => setCreatedProject('')}><X size={16}/></button></div>}
    {creating && <form className="ex-project-form ex-panel" onSubmit={createProject}>
      <div className="ex-project-form-head"><div><span className="ex-kicker">{isEditing ? 'EDIT PROJECT' : 'NEW PROJECT'}</span><h2>{isEditing ? 'Edit project' : 'Create project'}</h2></div><button type="button" className="ex-close-inline" onClick={cancelForm} aria-label="Close project form"><X size={18}/></button></div>
      <div className="ex-project-steps" aria-label="Project creation steps"><span className={projectStep === 1 ? 'active' : ''}>1. Project details</span><span className={projectStep === 2 ? 'active' : ''}>2. Camera & zones</span></div>
      {projectStep === 1 && <><div className="ex-project-fields">
        <label>Project name<input required value={form.name} onChange={event => updateField('name', event.target.value)} placeholder="Project name"/></label>
        <label>Location<input required value={form.location} onChange={event => updateField('location', event.target.value)} placeholder="City, State"/></label>
        <label>Status<select value={form.status} onChange={event => updateField('status', event.target.value)}>{projectCategories.filter(item => item !== 'All').map(item => <option key={item}>{item}</option>)}</select></label>
        <label>Assignee<select value={form.assignee} onChange={event => updateField('assignee', event.target.value)}>{managers.map(manager => <option key={manager}>{manager}</option>)}</select></label>
        <label className="ex-project-span">Project Description<textarea required rows={4} value={form.description} onChange={event => updateField('description', event.target.value)} placeholder="Brief project description"/></label>
      </div>
      {equipmentDropdown}
      <div className="ex-project-actions"><button type="button" className="ex-button" onClick={cancelForm}>Cancel</button><button type="button" className="ex-button dark" disabled={!canContinueProject} onClick={() => setProjectStep(2)}>Next: Video configuration</button></div></>}
      {projectStep === 2 && <><div className="ex-project-fields ex-camera-fields">
        <label className="ex-screenshot-input">Start date<span><input required type="text" inputMode="numeric" placeholder="dd-mm-yyyy" value={formatDateInput(form.startDate)} onChange={event => updateDateTimeField('startDate', 'date', parseDateInput(event.target.value))}/><CalendarDays size={16} aria-hidden="true"/></span></label>
        <label className="ex-screenshot-input">Start time<span><input required type="text" inputMode="numeric" placeholder="--:--" value={getTimePart(form.startDate)} onChange={event => updateDateTimeField('startDate', 'time', event.target.value)}/><Clock3 size={16} aria-hidden="true"/></span></label>
        <label className="ex-screenshot-input">End date<span><input required type="text" inputMode="numeric" placeholder="dd-mm-yyyy" value={formatDateInput(form.endDate)} onChange={event => updateDateTimeField('endDate', 'date', parseDateInput(event.target.value))}/><CalendarDays size={16} aria-hidden="true"/></span></label>
        <label className="ex-screenshot-input">End time<span><input required type="text" inputMode="numeric" placeholder="--:--" value={getTimePart(form.endDate)} onChange={event => updateDateTimeField('endDate', 'time', event.target.value)}/><Clock3 size={16} aria-hidden="true"/></span></label>
        <label className="ex-project-upload">Video from camera<input type="file" accept="video/*" onChange={event => updateField('videoName', event.target.files?.[0]?.name || '')}/><span>{form.videoName || 'Add video to unlock zone creation'}</span></label>
      </div>
      {form.videoName && <figure className="ex-camera-preview"><img src={cameraPreview} alt="Construction camera preview"/><button type="button" aria-label="Play camera preview"><span/> </button><figcaption><strong>{form.videoName}</strong><span>Selected video preview</span></figcaption></figure>}
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
      {visibleProjects.map(project => <article className="ex-project-card" key={project.id}><div className="ex-project-card-head"><span className={`ex-tag ${project.status === 'Active' ? 'green' : project.status === 'Finished' ? 'amber' : 'neutral'}`}>{project.status}</span>{projectActions(project)}</div><div><h2>{project.name}</h2><p>{project.description}</p></div><dl><div><dt>Location</dt><dd>{project.location}</dd></div><div><dt>Timeline</dt><dd>{formatProjectDateTime(project.startDate)} to {formatProjectDateTime(project.endDate)}</dd></div><div><dt>Assignee</dt><dd>{project.assignee}</dd></div><div><dt>Equipment</dt><dd>{project.equipment.join(', ') || 'Not selected'}</dd></div></dl></article>)}
    </div> : <div className="ex-project-table" role="table" aria-label="Project list"><div role="row" className="ex-project-table-head"><span role="columnheader">Project</span><span role="columnheader">Location</span><span role="columnheader">Schedule</span><span role="columnheader">Equipment</span><span role="columnheader">Zones</span><span role="columnheader">Status</span><span role="columnheader">Actions</span></div>{visibleProjects.map(project => <div role="row" className="ex-project-table-row" key={project.id}><div role="cell"><strong>{project.name}</strong><small>{project.description}</small></div><span role="cell">{project.location}</span><span role="cell">{formatProjectSchedule(project)}</span><span role="cell">{formatProjectEquipment(project)}</span><span role="cell">{formatProjectZones(project)}</span><span role="cell" className={`ex-tag ${project.status === 'Active' ? 'green' : project.status === 'Finished' ? 'amber' : 'neutral'}`}>{project.status}</span><div role="cell">{projectActions(project)}</div></div>)}</div>}
  </section>;
}

function ProjectModify() {
  const projects = initialProjects.map(project => ({ ...project, videos: [...(project.videos || []), ...[2, 3].map(number => ({ id: `${project.id}-sample-${number}`, name: `Sample recording ${number}`, source: '/live-data/site-001-observed.mp4' }))] }));
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('name');
  const visibleProjects = projects.filter(project =>
    (status === 'All' || project.status === status) &&
    `${project.name} ${project.location} ${project.assignee}`.toLowerCase().includes(query.trim().toLowerCase())
  ).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : (b.startDate || '').localeCompare(a.startDate || ''));
  const totalVideos = projects.reduce((sum, project) => sum + (project.videos?.length || 0), 0);
  return <section className="ex-projects-page ex-project-modify-page" aria-labelledby="project-modify-title">
    <header className="pm-heading">
      <div><span className="pm-eyebrow">PROJECT WORKSPACE</span><h1 id="project-modify-title">Project Modify</h1></div>
      <div className="pm-totals"><span><FolderKanban size={16}/><strong>{projects.length}</strong> projects</span><span><Video size={16}/><strong>{totalVideos}</strong> videos</span></div>
    </header>
    <div className="pm-toolbar">
      <div className="pm-status" role="group" aria-label="Filter by project status">{projectCategories.map(category => <button key={category} aria-pressed={status === category} onClick={() => setStatus(category)}>{category === 'All' ? 'All projects' : category}<span>{projects.filter(project => category === 'All' || project.status === category).length}</span></button>)}</div>
      <div className="pm-tools"><label className="pm-search"><Search size={16}/><input aria-label="Search projects" placeholder="Search projects..." value={query} onChange={event => setQuery(event.target.value)}/>{query && <button title="Clear search" aria-label="Clear search" onClick={() => setQuery('')}><X size={15}/></button>}</label><select aria-label="Sort projects" value={sort} onChange={event => setSort(event.target.value)}><option value="name">Name: A to Z</option><option value="newest">Newest first</option></select></div>
    </div>
    <div className="pm-results" role="status">{visibleProjects.length} {visibleProjects.length === 1 ? 'project' : 'projects'}{status !== 'All' ? ` / ${status}` : ''}</div>
    <div className="pm-grid" aria-label="Project cards">
      {visibleProjects.map(project => <ProjectModifyCard key={project.id} project={project}/>) }
    </div>
    {!visibleProjects.length && <div className="pm-empty"><Search size={28}/><h2>No matching projects</h2><button className="ex-button" onClick={() => { setQuery(''); setStatus('All'); }}>Clear filters</button></div>}
  </section>;
}

function ProjectModifyCard({ project }) {
  const videos = project.videos || [];
  const [videoIndex, setVideoIndex] = useState(0);
  const video = videos[videoIndex];
  const zones = getProjectZones(project);
  const shortDate = value => value ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)) : 'Not set';
  return <article className="pm-card">
    <header className="pm-card-header"><span className={`pm-badge ${project.status === 'Active' ? 'active' : project.status === 'Finished' ? 'finished' : 'inactive'}`}><i/>{project.status}</span><span className="pm-video-count"><Video size={14}/>{videos.length} {videos.length === 1 ? 'video' : 'videos'}</span></header>
    <div className="pm-card-title"><h2>{project.name}</h2><span><MapPin size={14}/>{project.location || 'Location not set'}</span></div>
    {videos.length > 0 && <div className="pm-video-tabs" role="tablist" aria-label={`${project.name} videos`}>{videos.map((item, index) => <button key={item.id || index} type="button" role="tab" id={`${project.id}-video-tab-${index}`} aria-controls={`${project.id}-video-panel`} aria-selected={videoIndex === index} tabIndex={videoIndex === index ? 0 : -1} title={item.name} onClick={() => setVideoIndex(index)} onKeyDown={event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % videos.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + videos.length) % videos.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = videos.length - 1;
      else return;
      event.preventDefault(); setVideoIndex(next);
      event.currentTarget.parentElement.children[next].focus();
    }}><Video size={13}/><span>Video {index + 1}</span></button>)}</div>}
    <div className="pm-media" role={video ? 'tabpanel' : undefined} id={`${project.id}-video-panel`} aria-labelledby={video ? `${project.id}-video-tab-${videoIndex}` : undefined} tabIndex={video ? 0 : undefined}>{video ? <video key={video.id || videoIndex} controls playsInline preload="none" poster={getProjectVideoPoster(video)} aria-label={`${project.name}: ${video.name}`}><source src={getProjectVideoSource(video)} type="video/mp4"/></video> : <div className="pm-no-video"><Video size={28}/><span>No video attached</span></div>}</div>
    <div className="pm-video-label"><Video size={14}/><span title={video?.name}>{video?.name || 'No recording'}</span></div>
    <div className="pm-body"><p className="pm-description">{project.description}</p>
      <div className="pm-owner"><span className="pm-avatar" aria-hidden="true">{(project.assignee || '?').split(' ').map(part => part[0]).slice(0, 2).join('')}</span><div><span>Project manager</span><strong>{project.assignee || 'Unassigned'}</strong></div></div>
      <dl className="pm-schedule"><div><dt>Start date</dt><dd><CalendarDays size={14}/><time dateTime={project.startDate}>{shortDate(project.startDate)}</time></dd></div><div><dt>End date</dt><dd><CalendarDays size={14}/><time dateTime={project.endDate}>{shortDate(project.endDate)}</time></dd></div></dl>
      <div className="pm-equipment"><span className="pm-field-label">Equipment</span><div>{project.equipment?.length ? project.equipment.map(item => <span key={item}>{item}</span>) : <span>Not selected</span>}</div></div>
    </div>
    <footer className="pm-card-footer"><Layers3 size={15}/><strong>{zones.length} {zones.length === 1 ? 'zone' : 'zones'}</strong><span title={zones.map(zone => zone.name).join(', ')}>{zones.map(zone => zone.name).join(', ') || 'No zones added'}</span></footer>
  </article>;
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
        <div className="ex-role-field">
          <label id="manager-role-label" htmlFor="manager-role">Role</label>
          <Select
            id="manager-role" labelId="manager-role-label" name="role" required displayEmpty
            value={form.role} onChange={event => updateField('role', event.target.value)}
            IconComponent={ChevronDown} className="ex-role-select"
            renderValue={value => value || <span className="ex-role-placeholder">Select a role</span>}
            MenuProps={{
              slotProps: { paper: { className: 'ex-role-menu' }, list: { 'aria-labelledby': 'manager-role-label' } },
              anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
              transformOrigin: { vertical: 'top', horizontal: 'left' },
            }}
          >
            {roleOptions.map(role => <MenuItem key={role} value={role} className="ex-role-option"><span>{role}</span><Check size={16} aria-hidden="true" className="ex-role-check"/></MenuItem>)}
          </Select>
        </div>
        <label>Assigned project<select value={form.project} onChange={event => updateField('project', event.target.value)}>{initialProjects.map(project => <option key={project.id}>{project.name}</option>)}</select></label>
      </div>
      <div className="ex-project-actions"><button type="button" className="ex-button" onClick={cancelForm}>Cancel</button><button type="submit" className="ex-button dark">{isEditing ? 'Save Changes' : 'Add Manager'}</button></div>
    </form>}
    {view === 'cards' ? <div className="ex-project-list" aria-label="Manager cards">
      {visibleManagers.map(manager => <article className="ex-project-card ex-manager-card" key={manager.id}><div className="ex-project-card-head ex-manager-card-actions">{managerActions(manager)}</div><div><h2>{manager.name}</h2><p>{manager.role}</p></div><dl><div><dt>Email</dt><dd>{manager.email}</dd></div><div><dt>Phone</dt><dd>{manager.phone}</dd></div><div><dt>Assigned project</dt><dd>{manager.project}</dd></div><div><dt>Role</dt><dd>{manager.role}</dd></div></dl></article>)}
    </div> : <div className="ex-project-table ex-manager-table" role="table" aria-label="Manager list"><div role="row" className="ex-project-table-head"><span role="columnheader">Manager</span><span role="columnheader">Role</span><span role="columnheader">Project</span><span role="columnheader">Contact</span><span role="columnheader">Actions</span></div>{visibleManagers.map(manager => <div role="row" className="ex-project-table-row" key={manager.id}><div role="cell"><strong>{manager.name}</strong><small>{manager.email}</small></div><span role="cell">{manager.role}</span><span role="cell">{manager.project}</span><span role="cell">{manager.phone}</span><div role="cell">{managerActions(manager)}</div></div>)}</div>}
  </section>;
}

const setupStages = [
  { id: 'mobilization', name: 'Site Mobilization & Survey', dates: 'Jul 10 - Jul 20, 2026', detail: '11 days', start: 4, width: 5 },
  { id: 'earthwork', name: 'Excavation & Earthwork', dates: 'Jul 21 - Aug 4, 2026', detail: '15 days', start: 9, width: 7 },
  { id: 'foundation', name: 'Foundation Works', dates: 'Aug 5 - Aug 25, 2026', detail: '21 days', start: 13, width: 10, recorded: true },
  { id: 'framework', name: 'Structural Framework', dates: 'Aug 26 - Oct 6, 2026', detail: '42 days', start: 25, width: 20 },
  { id: 'masonry', name: 'Masonry & Building Envelope', dates: 'Oct 7 - Oct 28, 2026', detail: '22 days', start: 45, width: 10 },
  { id: 'roofing', name: 'Roofing & Waterproofing', dates: 'Oct 29 - Nov 11, 2026', detail: '14 days', start: 55, width: 7 },
  { id: 'rough-in', name: 'MEP Rough-in', dates: 'Nov 12 - Dec 9, 2026', detail: '28 days', start: 63, width: 13 },
  { id: 'finishes', name: 'Interior Finishes', dates: 'Dec 10, 2026 - Jan 6, 2027', detail: '28 days', start: 76, width: 13 },
  { id: 'fixtures', name: 'MEP Fixtures & Fit-out', dates: 'Jan 7 - Jan 27, 2027', detail: '21 days', start: 88, width: 10 },
  { id: 'external', name: 'External Works & Landscaping', dates: 'Jan 28 - Feb 10, 2027', detail: '14 days', start: 96, width: 6 },
  { id: 'handover', name: 'Testing, Commissioning & Handover', dates: 'Feb 11 - Feb 24, 2027', detail: '14 days', start: 102, width: 6 },
];
const setupMonths = ['Jul 2026', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', "Jan '27", 'Feb'];
const solarStages = [
  { id: 'roof-assessment', name: 'Roof Load & Site Assessment', dates: 'Jul 10 - Jul 17, 2026', detail: '7 days', start: 0, width: 8 },
  { id: 'solar-design', name: 'Design Finalization & Approvals', dates: 'Jul 18 - Jul 27, 2026', detail: '10 days', start: 8, width: 10 },
  { id: 'mounting', name: 'Mounting Structure Fabrication & Install', dates: 'Jul 28 - Aug 8, 2026', detail: '12 days', start: 18, width: 12 },
  { id: 'modules', name: 'Solar Panel (Module) Installation', dates: 'Aug 9 - Aug 18, 2026', detail: '10 days', start: 30, width: 10 },
  { id: 'dc-wiring', name: 'DC Wiring & Combiner Boxes', dates: 'Aug 19 - Aug 25, 2026', detail: '7 days', start: 40, width: 7 },
  { id: 'inverter', name: 'Inverter Install & AC Wiring', dates: 'Aug 26 - Sep 1, 2026', detail: '7 days', start: 47, width: 7 },
  { id: 'grid', name: 'Grid Tie-in / Net Metering & Inspection', dates: 'Sep 2 - Sep 11, 2026', detail: '10 days', start: 54, width: 10 },
  { id: 'commissioning', name: 'Commissioning & Performance Testing', dates: 'Sep 12 - Sep 18, 2026', detail: '7 days', start: 64, width: 7 },
].map(stage => ({ ...stage, start: stage.start / 71 * 108, width: stage.width / 71 * 108 }));
const hvacStages = [
  { id: 'plant-room', name: 'Central Plant Room Civil Works', dates: 'Jul 10 - Jul 25, 2026', detail: '15 days', start: 0, width: 16 },
  { id: 'chiller', name: 'Chiller & AHU Equipment Placement', dates: 'Jul 26 - Aug 4, 2026', detail: '10 days', start: 16, width: 10 },
  { id: 'ductwork', name: 'Ductwork Fabrication & Installation', dates: 'Aug 5 - Aug 29, 2026', detail: '25 days', start: 26, width: 25 },
  { id: 'piping', name: 'Piping - Chilled & Condenser Water Lines', dates: 'Aug 30 - Sep 18, 2026', detail: '20 days', start: 51, width: 20 },
  { id: 'bms', name: 'Electrical & Control Wiring (BMS)', dates: 'Sep 19 - Oct 3, 2026', detail: '15 days', start: 71, width: 15 },
  { id: 'insulation', name: 'Insulation & Fire Damper Installation', dates: 'Oct 4 - Oct 13, 2026', detail: '10 days', start: 86, width: 10 },
  { id: 'tab', name: 'Testing, Balancing & Commissioning (TAB)', dates: 'Oct 14 - Oct 23, 2026', detail: '10 days', start: 96, width: 10 },
].map(stage => ({ ...stage, start: stage.start / 106 * 108, width: stage.width / 106 * 108 }));
const steelStages = [
  { id: 'steel-survey', name: 'Ore Yard & Conveyor Readiness', dates: 'Jul 10 - Jul 18, 2026', detail: '9 days', start: 0, width: 9 },
  { id: 'crusher', name: 'Crusher & Screen Commissioning', dates: 'Jul 19 - Jul 31, 2026', detail: '13 days', start: 9, width: 13 },
  { id: 'magnetic-separation', name: 'Magnetic Separation Line Setup', dates: 'Aug 1 - Aug 13, 2026', detail: '13 days', start: 22, width: 13 },
  { id: 'beneficiation', name: 'Beneficiation & Slurry Circuit', dates: 'Aug 14 - Sep 4, 2026', detail: '22 days', start: 35, width: 22 },
  { id: 'pellet-feed', name: 'Pellet Feed Handling', dates: 'Sep 5 - Sep 19, 2026', detail: '15 days', start: 57, width: 15 },
  { id: 'stockpile', name: 'Stockpile Quality Verification', dates: 'Sep 20 - Oct 4, 2026', detail: '15 days', start: 72, width: 15 },
  { id: 'steel-handover', name: 'Extraction Line Handover', dates: 'Oct 5 - Oct 17, 2026', detail: '13 days', start: 87, width: 13 },
  { id: 'steel-performance', name: 'Throughput Performance Run', dates: 'Oct 18 - Oct 28, 2026', detail: '11 days', start: 100, width: 11 },
].map(stage => ({ ...stage, start: stage.start / 111 * 108, width: stage.width / 111 * 108 }));
const dataCenterStages = [
  { id: 'dc-site-ready', name: 'White Space & Slab Readiness', dates: 'Jul 10 - Jul 24, 2026', detail: '15 days', start: 0, width: 15 },
  { id: 'dc-power', name: 'Utility Feed, UPS & Switchgear', dates: 'Jul 25 - Aug 18, 2026', detail: '25 days', start: 15, width: 25 },
  { id: 'dc-cooling', name: 'Chilled Water / CRAH Cooling Fit-out', dates: 'Aug 19 - Sep 12, 2026', detail: '25 days', start: 40, width: 25 },
  { id: 'dc-racks', name: 'Rack, Cable Tray & Containment Install', dates: 'Sep 13 - Oct 5, 2026', detail: '23 days', start: 65, width: 23 },
  { id: 'dc-network', name: 'Fiber Backbone & Network Rooms', dates: 'Oct 6 - Oct 24, 2026', detail: '19 days', start: 88, width: 19 },
  { id: 'dc-security', name: 'BMS, Fire Suppression & Security', dates: 'Oct 25 - Nov 12, 2026', detail: '19 days', start: 107, width: 19 },
  { id: 'dc-integrated-test', name: 'Integrated Systems Testing', dates: 'Nov 13 - Nov 30, 2026', detail: '18 days', start: 126, width: 18 },
  { id: 'dc-live', name: 'Client Handover & Go-live Readiness', dates: 'Dec 1 - Dec 12, 2026', detail: '12 days', start: 144, width: 12 },
  { id: 'dc-stabilization', name: 'Stabilization Monitoring', dates: 'Dec 13 - Dec 22, 2026', detail: '10 days', start: 156, width: 10 },
].map(stage => ({ ...stage, start: stage.start / 166 * 108, width: stage.width / 166 * 108 }));
const setupCategories = [
  { id: 'civil', label: 'Concrete / Civil Building', count: setupStages.length, icon: Building2, stages: setupStages, months: setupMonths, subtitle: 'Main structure build sequence', scheduleEnd: 'Feb 24, 2027', milestoneLabel: 'Handover', milestone: 'Feb 2027', footage: '1 stage', footageDetail: ' recorded' },
  { id: 'solar', label: 'Solar Panel Installation', count: solarStages.length, icon: Layers3, stages: solarStages, months: ['Jul 2026', 'Aug', 'Sep'], subtitle: 'Rooftop solar for the hospital block', scheduleEnd: 'Sep 18, 2026', milestoneLabel: 'Commissioning', milestone: 'Sep 2026', footage: 'No footage yet' },
  { id: 'hvac', label: 'HVAC & Central Plant', count: hvacStages.length, icon: HardHat, stages: hvacStages, months: ['Jul 2026', 'Aug', 'Sep', 'Oct'], subtitle: 'Central mechanical plant for the hospital', scheduleEnd: 'Oct 23, 2026', milestoneLabel: 'Commissioning', milestone: 'Oct 2026', footage: 'No footage yet' },
  { id: 'steel', label: 'Steel Extraction', count: steelStages.length, icon: Factory, stages: steelStages, months: ['Jul 2026', 'Aug', 'Sep', 'Oct'], subtitle: 'Ore handling, beneficiation and extraction-line readiness', scheduleEnd: 'Oct 28, 2026', milestoneLabel: 'Performance run', milestone: 'Oct 2026', footage: 'No footage yet' },
  { id: 'data-center', label: 'Data Center', count: dataCenterStages.length, icon: Server, stages: dataCenterStages, months: ['Jul 2026', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], subtitle: 'Critical power, cooling, network and go-live sequence', scheduleEnd: 'Dec 22, 2026', milestoneLabel: 'Go-live', milestone: 'Dec 2026', footage: 'No footage yet' },
];
const foundationBreakdown = [
  { id: 'footing', label: 'Footing Excavation & Prep', date: 'Aug 5 - Aug 11' },
  { id: 'rebar', label: 'Rebar & Formwork - Zone 1', date: 'Aug 12 - Aug 14' },
  { id: 'pouring', label: 'Concrete Pouring - Zone 1 Foundation Slab', date: 'Aug 15, 2026', recorded: true },
  { id: 'curing', label: 'Curing & Formwork Strip', date: 'Aug 16 - Aug 25' },
];

function ProjectSetup() {
  const [category, setCategory] = useState('civil');
  const [openStage, setOpenStage] = useState('foundation');
  const [view, setView] = useState('timeline');
  const selectedCategory = setupCategories.find(item => item.id === category);
  const isCivil = selectedCategory.id === 'civil';
  const stages = selectedCategory.stages;
  const months = selectedCategory.months;
  const monthGrid = { gridTemplateColumns: `var(--label-width) repeat(${months.length}, minmax(74px, 1fr))` };
  return <section className="ex-setup-page" aria-labelledby="setup-title">
    <div className="ex-setup-page-heading"><div><h1 id="setup-title">Main setup</h1><p>Construction schedule & stage records</p></div><span className="ex-setup-project-tag"><Building2 size={15}/> Hospital project</span></div>
    <header className="ex-setup-head">
      <div className="ex-setup-tabs" role="group" aria-label="Workstream">
        {setupCategories.map(item => { const Icon = item.icon; return <button key={item.id} type="button" aria-pressed={category === item.id} className={category === item.id ? 'active' : ''} onClick={() => { setCategory(item.id); setOpenStage(''); }}><Icon size={16}/>{item.label}<span className="ex-setup-tab-count">{item.count}</span></button>; })}
      </div>
    </header>
    <div className="ex-setup-title-row"><div><h2>{selectedCategory.label}{category === 'hvac' ? ' Installation' : ''}</h2><p>{selectedCategory.subtitle}</p></div></div>
    <dl className="ex-setup-summary">
      <div><dt><CalendarDays size={14}/> Schedule</dt><dd>Jul 10, 2026 <span>to</span> {selectedCategory.scheduleEnd}</dd></div>
      <div><dt><Layers3 size={14}/> Planned stages</dt><dd>{stages.length} <span>stages</span></dd></div>
      <div><dt><Clock3 size={14}/> {selectedCategory.milestoneLabel}</dt><dd>{selectedCategory.milestone}</dd></div>
      <div><dt><FolderKanban size={14}/> Stage footage</dt><dd>{selectedCategory.footage}{selectedCategory.footageDetail && <span>{selectedCategory.footageDetail}</span>}</dd></div>
    </dl>
    <div className="ex-setup-toolbar"><h3>Stage schedule <span>{stages.length}</span></h3><div className="ex-setup-legend" aria-label="Timeline legend">{isCivil && <span><i className="recorded"/> Recorded</span>}<span><i/> Scheduled</span></div><div className="ex-setup-view" role="group" aria-label="Schedule view"><button type="button" aria-pressed={view === 'timeline'} onClick={() => setView('timeline')}><ChartNoAxesCombined size={15}/> Timeline</button><button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={15}/> List</button></div></div>
    <div className={`ex-setup-timeline ${view === 'list' ? 'is-list' : ''}`} role="region" aria-label={`${selectedCategory.label} schedule`} tabIndex={0}>
      {view === 'timeline' && <div className="ex-setup-months" style={monthGrid}><b>Stage / date</b>{months.map(month => <span key={month}>{month}</span>)}</div>}
      {stages.map((stage, index) => <React.Fragment key={stage.id}>
        <button type="button" className={`ex-setup-stage ${stage.recorded ? 'has-recording' : ''} ${openStage === stage.id ? 'open' : ''}`} onClick={() => setOpenStage(openStage === stage.id ? '' : stage.id)} aria-expanded={openStage === stage.id} aria-controls={`setup-detail-${stage.id}`}>
          <span className="ex-setup-stage-copy"><span className="ex-setup-stage-number">{String(index + 1).padStart(2, '0')}</span><span className="ex-setup-stage-text"><strong>{stage.name}</strong><small>{stage.dates} <span> / {stage.detail}</span></small></span><ChevronDown size={14}/></span>
          {view === 'timeline' ? <span className="ex-setup-bar" style={{ '--start': stage.start, '--width': stage.width }} aria-hidden="true"/> : <span className={`ex-setup-status ${stage.recorded ? 'recorded' : ''}`}>{stage.recorded ? 'Footage recorded' : 'Scheduled'}</span>}
        </button>
        {openStage === stage.id && <div id={`setup-detail-${stage.id}`} className="ex-setup-inline-detail">
          <div className="ex-setup-detail-heading"><strong>{stage.recorded ? 'Foundation work breakdown' : stage.name}</strong><span className={`ex-setup-status ${stage.recorded ? 'recorded' : ''}`}>{stage.recorded ? '1 recorded activity' : 'Scheduled / No footage yet'}</span></div>
          {stage.recorded ? <div className="ex-setup-breakdown-list">{foundationBreakdown.map(item => <div key={item.id} className={item.recorded ? 'recorded' : ''}><span><strong>{item.label}</strong></span><time>{item.date}</time>{item.recorded && <em>Video recorded</em>}</div>)}</div> : <p className="ex-setup-stage-note"><CalendarDays size={15}/>{stage.dates}<span>{stage.detail}</span></p>}
        </div>}
      </React.Fragment>)}
    </div>
  </section>;
}
export default function ExecutiveDashboard({ onLogout, name, email }) {
  const [section, setSection] = useState('overview');
  const [dashboardTab, setDashboardTab] = useState('reports');
  const [evidence, setEvidence] = useState(null);
  const [exported, setExported] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(0);
  const [riskEvidence, setRiskEvidence] = useState(currentRiskEvidence);
  const selected = alerts[selectedAlert];
  const nav = [['overview', LayoutDashboard, 'Dashboard'], ['projects', FolderKanban, 'Projects'], ['project-modify', Pencil, 'Project Modify'], ['setup', CalendarDays, 'Setup'], ['managers', Users, 'Managers'], ['production', ChartNoAxesCombined, 'Extraction'], ['efficiency', HardHat, 'Preprocess'], ['risk', ShieldAlert, 'Detection'], ['save-result', ShieldAlert, 'Save Result']];
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
    syncRoute();
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);
  function navigate(id) {
    if (id === 'save-result') { exportReport(); return; }
    setDashboardTab('reports');
    setSection(id);
    if (id === 'projects' || id === 'project-modify' || id === 'managers') { window.history.replaceState(null, '', `#${id}`); return; }
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
      <div className="ex-topbar" aria-label="Workspace breadcrumb"><nav className="ex-breadcrumb" aria-label="Breadcrumb"><span>Workspace</span><ChevronRight size={15} strokeWidth={1.8} aria-hidden="true"/><strong>{riskEvidence ? `Risk evidence / ${riskEvidence.name}` : section === 'projects' ? 'Projects' : section === 'project-modify' ? 'Project Modify' : section === 'setup' ? 'Setup' : section === 'managers' ? 'Managers' : 'Executive Insights'}</strong></nav><span className="ex-snapshot"><span className="ex-live-dot" aria-hidden="true"/> Last update: 16 September, 2026 | 09:00 AM</span></div>
      <div className="ex-content">
        {riskEvidence && <RiskEvidence alert={riskEvidence} total={totalAlerts} close={backToDashboard}/>} 
        {section === 'projects' && !riskEvidence && <ProjectsAdmin/>}
        {section === 'project-modify' && !riskEvidence && <ProjectModify/>}
        {section === 'setup' && !riskEvidence && <ProjectSetup/>}
        {section === 'managers' && !riskEvidence && <ManagersAdmin/>}
        <div hidden={Boolean(riskEvidence) || section === 'projects' || section === 'project-modify' || section === 'setup' || section === 'managers'}>
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
        <section className="ex-panel ex-activity-utilization">
          <PanelTitle icon={HardHat} title="Equipment utilization" note="SAMPLE DATA"/>
          <div className="ex-equipment-utilization-v2">
            <div className="ex-equipment-summary-card">
              <span>Concrete pouring</span>
              <strong>91<small>%</small></strong>
              <p>Observed active utilization</p>
            </div>
            <div className="ex-equipment-timeline-card">
              <div className="ex-equipment-timeline-head"><span>Video time</span><strong>05:00 AM - 09:00 AM</strong></div>
              <div className="ex-equipment-time-axis" aria-hidden="true">{equipmentTimeline.map(time => <span key={time}>{time}</span>)}</div>
              <div className="ex-equipment-timeline-track" role="meter" aria-label="Concrete pouring equipment utilization 91 percent" aria-valuemin={0} aria-valuemax={100} aria-valuenow={91}>
                <span className="is-active" style={{ width: '91%' }} title="Concrete pouring: 91%"/>
                <span className="is-remaining" style={{ width: '9%' }} title="Remaining observed time: 9%"/>
              </div>
              <div className="ex-equipment-timeline-meta"><span><i className="is-active"/>Active pouring</span><span><i className="is-remaining"/>Remaining observed time</span></div>
            </div>
          </div>
        </section>
        <div className="ex-resource-grid ex-resource-pair">
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
