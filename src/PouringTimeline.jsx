import React, { useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ChartNoAxesCombined, ZoomIn, ZoomOut, ArrowUpRight } from 'lucide-react';

// Static demo activity intervals, measured in seconds within the sample video.
const samples = [
  { start: 0, end: 3, type: 'pouring' },
  { start: 3, end: 5, type: 'no-activity' },
  { start: 5, end: 9, type: 'pouring' },
  { start: 9, end: 12, type: 'no-pouring' },
  { start: 12, end: 15, type: 'pouring' },
  { start: 15, end: 16, type: 'no-activity' },
  { start: 16, end: 18, type: 'pouring' },
];
const types = { pouring: { label: 'Pouring', color: '#3e7965' }, 'no-pouring': { label: 'No pouring', color: '#d67535' }, 'no-activity': { label: 'No activity', color: '#778494' } };
const formatDuration = seconds => {
  const minutes = seconds / 60;
  if (minutes >= 60) return `${(minutes / 60).toFixed(1)} hr`;
  return `${minutes.toFixed(minutes < 10 ? 2 : 1)} min`;
};
const spans = [18, 12, 6];
const chartTheme = createTheme({ typography: { fontFamily: '"DM Sans", sans-serif', fontSize: 12 }, palette: { text: { primary: '#20272b', secondary: '#737b84' }, divider: '#e6e9ec' } });
const elapsed = (type, second) => samples.filter(event => event.type === type).reduce((sum, event) => sum + Math.max(0, Math.min(second, event.end) - event.start), 0);

export default function PouringTimeline({ onEvidence }) {
  const [filter, setFilter] = useState('overall');
  const [zoom, setZoom] = useState(0);
  const [hovered, setHovered] = useState(null);
  const end = 18;
  const start = end - spans[zoom];
  const events = samples.filter(event => (filter === 'overall' || filter === event.type) && event.end > start && event.start < end);
  const ticks = zoom === 0 ? [0, 10, 18] : [start, start + spans[zoom] / 2, end];
  const seconds = Array.from({ length: spans[zoom] + 1 }, (_, index) => start + index);
  const series = Object.entries(types).filter(([key]) => filter === 'overall' || key === filter).map(([key, type]) => ({
    id: key, label: type.label, color: type.color, data: seconds.map(second => elapsed(key, second)), curve: 'linear', showMark: true,
    valueFormatter: value => formatDuration(value), highlightScope: { highlight: 'series', fade: 'global' },
  }));
  function reset() { setZoom(0); setFilter('overall'); setHovered(null); }
  return <section className="ex-panel ex-pouring-timeline" id="production" aria-labelledby="pouring-timeline-title">
    <div className="ex-pouring-head"><h2 id="pouring-timeline-title"><ChartNoAxesCombined size={18}/> Pouring timeline</h2></div>
    <div className="ex-pouring-controls"><select aria-label="Pouring timeline activity" value={filter} onChange={e => { setFilter(e.target.value); setHovered(null); }}><option value="overall">Overall</option><option value="pouring">Pouring activity</option><option value="no-pouring">No pouring evidence</option><option value="no-activity">No activity</option></select><button type="button" aria-label="Zoom out pouring timeline" disabled={zoom === 0} onClick={() => { setZoom(zoom - 1); setHovered(null); }}><ZoomOut size={17}/></button><button type="button" aria-label="Zoom in pouring timeline" disabled={zoom === spans.length - 1} onClick={() => { setZoom(zoom + 1); setHovered(null); }}><ZoomIn size={17}/></button><button type="button" className="ex-pouring-latest" onClick={reset}>Latest</button></div>
    <div className="ex-mui-pouring-chart" aria-label="Cumulative activity duration line graph">
      <p className="ex-mui-chart-label">Accumulated activity time (min / hr)</p>
      <ThemeProvider theme={chartTheme}>
        <LineChart
          height={210}
          series={series}
          xAxis={[{ id: 'time', data: seconds, scaleType: 'linear', min: start, max: end, tickInterval: ticks, valueFormatter: value => formatDuration(value), label: 'Video time' }]}
          yAxis={[{ min: 0, max: 12, tickInterval: [0, 3, 6, 9, 12], valueFormatter: value => formatDuration(value), width: 52 }]}
          grid={{ horizontal: true }}
          margin={{ left: 8, right: 18, top: 18, bottom: 8 }}
          onMarkClick={(_, item) => setHovered({ type: item.seriesId, time: seconds[item.dataIndex], duration: elapsed(item.seriesId, seconds[item.dataIndex]) })}
          slotProps={{ legend: { direction: 'horizontal' } }}
          sx={{ '& .MuiChartsAxis-tickLabel': { fill: '#737b84', fontSize: 10 }, '& .MuiChartsGrid-line': { stroke: '#e6e9ec' }, '& .MuiLineChart-line': { strokeWidth: 2.5 }, '& .MuiLineChart-mark': { cursor: 'pointer' } }}
        />
      </ThemeProvider>
    </div>
    {!events.length && <p className="ex-activity-empty" role="status">No matching events in this time window.</p>}
    {hovered && <div className="ex-pouring-detail" role="status"><div><strong>{types[hovered.type].label}</strong><span>{formatDuration(hovered.duration)} accumulated by {formatDuration(hovered.time)}</span></div>{hovered.type !== 'pouring' && <button type="button" className="ex-link" onClick={() => onEvidence(hovered.type)}>Category evidence <ArrowUpRight size={14}/></button>}</div>}
  </section>;
}
