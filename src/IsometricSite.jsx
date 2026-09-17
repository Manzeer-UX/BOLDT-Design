
import React from 'react';
const project=(x,y,z=0)=>[300+(x-y)*.866,210+(x+y)*.5-z];
const points=vs=>vs.map(v=>project(...v).join(',')).join(' ');
function Face({vs,fill,opacity=1}){return <polygon points={points(vs)} fill={fill} opacity={opacity} stroke="#9a9a9a" strokeOpacity=".24" strokeWidth=".65" strokeLinejoin="round"/>}
function Block({x,y,z=0,w,d,h,top='#555555',left='#292929',right='#191919'}){return <g><Face vs={[[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]]} fill={top}/><Face vs={[[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]]} fill={left}/><Face vs={[[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]]} fill={right}/></g>}
function Line({a,b,opacity=.4,width=.7}){const p=project(...a),q=project(...b);return <line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke="#bbbbbb" strokeOpacity={opacity} strokeWidth={width}/>}
export default function IsometricSite(){return <g>
<defs><radialGradient id="deck-light"><stop stopColor="#555555" stopOpacity=".2"/><stop offset="1" stopColor="#171717" stopOpacity="0"/></radialGradient></defs>
<ellipse cx="485" cy="308" rx="370" ry="78" fill="#000000" opacity=".3"/>
<defs><linearGradient id="site-floor-opacity" gradientUnits="userSpaceOnUse" x1="0" y1="140" x2="0" y2="430"><stop offset="0" stopColor="white" stopOpacity="0"/><stop offset=".22" stopColor="white" stopOpacity="0"/><stop offset=".5" stopColor="white" stopOpacity=".35"/><stop offset=".76" stopColor="white" stopOpacity=".9"/><stop offset=".93" stopColor="white" stopOpacity="1"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient><mask id="site-floor-blend" maskUnits="userSpaceOnUse" x="-600" y="140" width="1800" height="290"><rect x="-600" y="140" width="1800" height="290" fill="url(#site-floor-opacity)"/></mask><linearGradient id="site-floor-fade" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#181818"/><stop offset="1" stopColor="#232323"/></linearGradient></defs><g mask="url(#site-floor-blend)"><rect x="-600" y="140" width="1800" height="290" fill="url(#site-floor-fade)"/>{Array.from({length:41},(_,i)=><Line key={'floorX'+i} a={[-600+i*30,-600,1]} b={[-600+i*30,600,1]} opacity={.12}/>)}{Array.from({length:41},(_,i)=><Line key={'floorY'+i} a={[-600,-600+i*30,1]} b={[600,-600+i*30,1]} opacity={.12}/>)}</g>
<g transform="translate(255 0)"><Face vs={[[0,-110,0],[175,-110,0],[175,30,0],[0,30,0]]} fill="#303030"/>
<Block x={0} y={-108} w={39} d={32} h={144} top="#4c4c4c" left="#333333" right="#222222"/>{[0,50,100].map(z=><g key={z}>
{[8,83,158].flatMap(x=>[-100,-40,20].map(y=><Block key={x+','+y} x={x} y={y} z={z} w={8} d={8} h={48} top="#999999" left="#515151" right="#262626"/>))}
{[-100,-40,20].map(y=><Block key={'beam'+y} x={8} y={y} z={z+37} w={158} d={8} h={8} top="#515151" left="#454545" right="#292929"/>)}<Block x={0} y={-110} z={z+44} w={175} d={140} h={6} top={z===100?'#444444':'#333333'} left="#626262" right="#242424"/>
{[0,1,2,3,4,5].map(i=><Line key={i} a={[4+i*32,-108,z+50.3]} b={[4+i*32,28,z+50.3]} opacity={.18}/>)}
</g>)}
{[0,1,2,3,4,5,6,7].map(i=><Line key={'roof'+i} a={[1,-108+i*18,150.4]} b={[173,-108+i*18,150.4]} opacity={.12}/>)}{[0,50].map(z=><g key={'brace'+z}><Line a={[174,-99,z+3]} b={[174,-32,z+43]} opacity={.4} width={1}/><Line a={[174,-32,z+3]} b={[174,-99,z+43]} opacity={.4} width={1}/></g>)}<Line a={[180,-13,1]} b={[180,-13,145]} opacity={.6}/><Line a={[180,2,1]} b={[180,2,145]} opacity={.6}/>{Array.from({length:22},(_,i)=><Line key={'ladder'+i} a={[180,-13,i*6.5]} b={[180,2,i*6.5]} opacity={.5}/>)}{[8,83,158].flatMap(x=>[-100,-40,20].map(y=><g key={'rebar'+x+y}>{[0,3,6].map(v=><Line key={v} a={[x+v,y+2,150]} b={[x+v,y+2,171+v]} opacity={.65}/>)}</g>))}
{[0,25,50,75,100,125,150,175].map(x=><Line key={'rail'+x} a={[x,30,150]} b={[x,30,164]} opacity={.7}/>)}
<Line a={[0,30,164]} b={[175,30,164]} opacity={.7}/><Line a={[0,30,157]} b={[175,30,157]} opacity={.4}/>
{[-110,-85,-60,-35,-10,15,30].map(y=><Line key={'side'+y} a={[175,y,150]} b={[175,y,164]} opacity={.65}/>)}
<Line a={[175,-110,164]} b={[175,30,164]} opacity={.7}/>
<Block x={-90} y={-85} w={14} d={14} h={178} top="#777777" left="#303030" right="#191919"/>
{Array.from({length:9},(_,i)=><g key={'truss'+i}><Line a={[-90,-71,i*20]} b={[-76,-71,i*20+18]} opacity={.65}/><Line a={[-76,-85,i*20]} b={[-76,-71,i*20+18]} opacity={.5}/></g>)}
<Block x={-130} y={-86} z={178} w={245} d={12} h={9} top="#777777" left="#383838" right="#222222"/>
{Array.from({length:13},(_,i)=><Line key={'boom'+i} a={[-128+i*18,-74,178]} b={[-110+i*18,-74,187]} opacity={.75}/>)}
<Line a={[-83,-80,201]} b={[-130,-80,187]}/><Line a={[-83,-80,201]} b={[115,-80,187]}/><Line a={[-83,-80,178]} b={[-83,-80,201]}/>
<Line a={[91,-78,178]} b={[91,-78,106]} opacity={.8}/>
</g><g transform="translate(215 12)">{[0,1,2,3].map(i=><Block key={'stack'+i} x={118} y={100} z={i*5} w={65} d={24} h={4} top="#535353" left="#333333" right="#1a1a1a"/>)}
</g><g transform="translate(75 45)">{[0,1,2].map(i=><Block key={'crate'+i} x={-136+i*21} y={99} w={18} d={24} h={18} top="#4b4b4b" left="#303030" right="#1c1c1c"/>)}
</g>
</g>}
