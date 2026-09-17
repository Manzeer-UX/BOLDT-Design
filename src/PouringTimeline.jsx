import React, { useState } from 'react';
import { ChartNoAxesCombined } from 'lucide-react';

const types = { pouring: { label: 'Pouring' }, 'no-pouring': { label: 'No pouring' }, 'no-activity': { label: 'No activity' } };

export default function PouringTimeline() {
  return <section className="ex-panel ex-pouring-timeline" id="production" aria-labelledby="pouring-timeline-title">
    <div className="ex-pouring-head"><h2 id="pouring-timeline-title"><ChartNoAxesCombined size={18}/> Pouring timeline</h2></div>
    <PouringUtilization/>
  </section>;
}

// The supplied illustration's proportions are independent of the report summary totals.
const utilizationSegments = [
  { type: 'pouring', start: 0, end: 4704 },
  { type: 'no-activity', start: 4704, end: 6384 },
  { type: 'no-pouring', start: 6384, end: 8784 },
  { type: 'no-activity', start: 8784, end: 11232 },
  { type: 'pouring', start: 11232, end: 14400 },
];
const videoTimestamp = value => [Math.floor(value / 3600), Math.floor(value % 3600 / 60), value % 60].map(part => String(part).padStart(2, '0')).join(':');

function PouringUtilization() {
  const [position, setPosition] = useState(0);
  const active = utilizationSegments.find(segment => position >= segment.start && position < segment.end) || utilizationSegments.at(-1);
  return <div className="ex-utilization" aria-labelledby="pouring-utilization-title">
    <h3 id="pouring-utilization-title">Pouring utilization</h3>
    <div className="ex-utilization-axis"><span>Video time</span><div>{[0, 1, 2, 3, 4].map(hour => <span key={hour}>{hour} hr</span>)}</div></div>
    <div className="ex-utilization-row"><span>Overall</span><div className="ex-utilization-track">
      <div className="ex-utilization-segments" role="img" aria-label="Four-hour activity timeline: pouring, no activity, no pouring, no activity, pouring">
        {utilizationSegments.map(segment => <span key={segment.start} className={segment.type} style={{ width: ((segment.end - segment.start) / 14400 * 100) + '%' }} title={types[segment.type].label + ': ' + videoTimestamp(segment.start) + ' - ' + videoTimestamp(segment.end)}/>)}
      </div>
      <div className="ex-utilization-playhead" style={{ left: (position / 14400 * 100) + '%' }} aria-hidden="true"/>
      <input type="range" min="0" max="14400" step="1" value={position} onChange={event => setPosition(Number(event.target.value))} aria-label="Utilization video time" aria-valuetext={videoTimestamp(position) + ', ' + types[active.type].label}/>
    </div></div>
    <div className="ex-utilization-footer"><div className="ex-utilization-legend">{Object.entries(types).map(([key, type]) => <span key={key}><i className={key}/>{type.label}</span>)}</div><span>Overall / {videoTimestamp(position)} to 04:00:00</span><strong>3h 55m 12s</strong></div>
  </div>;
}
