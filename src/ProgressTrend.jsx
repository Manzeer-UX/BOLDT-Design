import React, { useState } from 'react';

// Illustrative trend from Figma, independent of the headline progress metric.
export const progressData = [
  { date: 'Sep 3', planned: 5, actual: 5 },
  { date: 'Sep 4', planned: 10, actual: 9.2 },
  { date: 'Sep 5', planned: 16, actual: 14.1 },
  { date: 'Sep 6', planned: 22, actual: 19.8 },
  { date: 'Sep 7', planned: 28, actual: 25.4 },
  { date: 'Sep 8', planned: 35, actual: 31.6 },
  { date: 'Sep 9', planned: 42, actual: 38.2 },
  { date: 'Sep 10', planned: 48, actual: 43.7 },
  { date: 'Sep 11', planned: 53, actual: 48.5 },
  { date: 'Sep 12', planned: 57, actual: 52.7 },
  { date: 'Sep 13', planned: 61, actual: 56.6 },
  { date: 'Sep 14', planned: 64, actual: 59.8 },
  { date: 'Sep 15', planned: 66, actual: 62.1 },
  { date: 'Sep 16', planned: 68, actual: 64.8 },
];
const series = ['planned', 'actual'];
const x = index => 44 + index / (progressData.length - 1) * 576;
const y = value => 228 - value / 80 * 208;
const line = key => progressData.map((point, index) => `${index ? 'L' : 'M'}${x(index)} ${y(point[key])}`).join(' ');
const format = value => `${value.toFixed(1)}%`;

export default function ProgressTrend() {
  const [visible, setVisible] = useState({ planned: true, actual: true });
  const [active, setActive] = useState(() => progressData.findIndex(point => point.date === 'Sep 10'));
  const index = active ?? progressData.length - 1;
  const point = progressData[index];
  const difference = Number((point.actual - point.planned).toFixed(1));
  const description = `${point.date}: ${visible.planned ? `Planned ${format(point.planned)}. ` : ''}${visible.actual ? `Actual ${format(point.actual)}.` : ''}`;
  function selectPointer(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const chartX = (event.clientX - bounds.left) / bounds.width * 640;
    setActive(Math.max(0, Math.min(progressData.length - 1, Math.round((chartX - 44) / 576 * (progressData.length - 1)))));
  }
  function selectKey(event) {
    const steps = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 };
    if (event.key in steps) {
      event.preventDefault();
      setActive(Math.max(0, Math.min(progressData.length - 1, index + steps[event.key])));
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActive(event.key === 'Home' ? 0 : progressData.length - 1);
    } else if (event.key === 'Escape') setActive(null);
  }
  return <article className="ex-trend-panel" aria-labelledby="trend-heading">
    <div className="ex-performance-head">
      <div><span className="ex-kicker">14 DAY TREND</span><h3 id="trend-heading">Actual vs planned progress</h3></div>
      <div className="ex-trend-legend" aria-label="Chart series">
        {series.map(key => <button type="button" key={key} aria-pressed={visible[key]} aria-label={`${key === 'planned' ? 'Planned' : 'Actual'} progress`} disabled={visible[key] && !visible[series.find(other => other !== key)]} onClick={() => setVisible(current => ({ ...current, [key]: !current[key] }))}><i className={key}/>{key === 'planned' ? 'Planned' : 'Actual'}</button>)}
      </div>
    </div>
    <div className="ex-trend-chart ex-interactive-trend">
      <div className="ex-trend-plot" role="slider" tabIndex={0} aria-label="Daily progress" aria-valuemin={1} aria-valuemax={14} aria-valuenow={index + 1} aria-valuetext={description} aria-describedby="trend-help" onKeyDown={selectKey} onFocus={() => setActive(index)} onPointerMove={selectPointer} onPointerDown={selectPointer}>
        <svg viewBox="0 0 640 260" preserveAspectRatio="none" aria-hidden="true">
          <defs><linearGradient id="reference-trend-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8d7caf" stopOpacity=".25"/><stop offset="100%" stopColor="#504268" stopOpacity=".015"/></linearGradient></defs>
          {[0, 20, 40, 60, 80].map(tick => <g key={tick}><path className="ex-trend-grid" d={`M44 ${y(tick)}H620`}/><text x="32" y={y(tick) + 4} textAnchor="end" className="ex-trend-tick">{tick}%</text></g>)}
          {visible.actual && <path className="ex-trend-area" d={`${line('actual')} L620 228 L44 228 Z`}/>}
          {series.map(key => visible[key] && <path key={key} className={`ex-trend-${key}`} d={line(key)}/>)}
          {[0, 4, 8, 13].map(i => <text key={i} x={x(i)} y="253" textAnchor={i === 0 ? 'start' : i === 13 ? 'end' : 'middle'} className="ex-trend-tick">{progressData[i].date}</text>)}
          {active !== null && <g><path className="ex-trend-crosshair" d={`M${x(index)} 20V228`}/>{series.map(key => visible[key] && <circle key={key} className={`ex-trend-dot ${key}`} cx={x(index)} cy={y(point[key])} r="4"/>)}</g>}
        </svg>
        {active !== null && <div className="ex-trend-tooltip" style={{ left: `${Math.max(20, Math.min(80, x(index) / 640 * 100))}%` }}>
          <strong>{point.date}, 2026</strong>
          {visible.planned && <div><span>Planned</span><b>{format(point.planned)}</b></div>}
          {visible.actual && <div><span>Actual</span><b>{format(point.actual)}</b></div>}
          {visible.planned && visible.actual && <small>{difference === 0 ? 'On plan' : `${Math.abs(difference).toFixed(1)} percentage points ${difference < 0 ? 'behind' : 'ahead'}`}</small>}
        </div>}
      </div>
      <p className="ex-trend-help" id="trend-help">Hover or tap to explore · Use arrow keys when focused</p>
      <details className="ex-trend-data"><summary>View daily data <span>Static demo · Sep 3–16, 2026</span></summary><div className="ex-trend-table-wrap"><table><caption>Illustrative daily progress · percentage completed</caption><thead><tr><th scope="col">Date</th><th scope="col">Planned</th><th scope="col">Actual</th><th scope="col">Variance (pp)</th></tr></thead><tbody>{progressData.map(row => <tr key={row.date}><th scope="row">{row.date}</th><td>{format(row.planned)}</td><td>{format(row.actual)}</td><td>{(row.actual - row.planned).toFixed(1)}</td></tr>)}</tbody></table></div></details>
    </div>
  </article>;
}
