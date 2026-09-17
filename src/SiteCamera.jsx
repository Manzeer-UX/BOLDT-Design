import React from 'react';
export default function SiteCamera(){return <g transform="translate(115 185) scale(.7)">
<defs><linearGradient id="pole-metal"><stop stopColor="#222222"/><stop offset=".3" stopColor="#777777"/><stop offset=".46" stopColor="#939393"/><stop offset=".62" stopColor="#424242"/><stop offset="1" stopColor="#191919"/></linearGradient><linearGradient id="housing-metal" x1="0" y1="0" x2=".3" y2="1"><stop stopColor="#dddddd"/><stop offset=".35" stopColor="#aaaaaa"/><stop offset=".8" stopColor="#666666"/><stop offset="1" stopColor="#414141"/></linearGradient><radialGradient id="camera-optics"><stop stopColor="#070707"/><stop offset=".4" stopColor="#151515"/><stop offset=".6" stopColor="#555555"/><stop offset=".68" stopColor="#111111"/><stop offset=".83" stopColor="#333333"/><stop offset="1" stopColor="#080808"/></radialGradient></defs>
<ellipse cx="10" cy="149" rx="32" ry="10" fill="#000000" opacity=".5"/>
<path d="M-20 143-2 134 24 144 6 154Z" fill="#444444" stroke="#999999" strokeWidth=".6"/><path d="M-20 143v5l26 12 18-10v-6L6 154Z" fill="#292929" stroke="#666666" strokeWidth=".5"/>
{[[-12,144],[0,140],[16,146],[5,151]].map(([x,y])=><ellipse key={x} cx={x} cy={y} rx="2" ry="1.2" fill="#aaaaaa"/>)}
<path d="M-5 40h11v104q-5 4-11 0Z" fill="url(#pole-metal)" stroke="#777777" strokeWidth=".5"/>
<ellipse cx=".5" cy="40" rx="5.5" ry="2.3" fill="#929292"/><path d="M-7 127h15v7H-7Z" fill="#505050" stroke="#888888" strokeWidth=".5"/>
<path d="M5 60h21l9-28" stroke="#242424" strokeWidth="8" strokeLinejoin="round"/><path d="M5 58h19l9-27" stroke="#858585" strokeWidth="4" strokeLinejoin="round"/>
<path d="M-5 47h12v18H-5Z" fill="#484848" stroke="#9b9b9b" strokeWidth=".7"/><circle cx="1" cy="52" r="1.5" fill="#cccccc"/><circle cx="1" cy="61" r="1.5" fill="#cccccc"/>
<path d="M24 24q-13 1-13 14v46" stroke="#131313" strokeWidth="3"/><circle cx="33" cy="31" r="6" fill="#343434" stroke="#aaaaaa"/><circle cx="33" cy="31" r="2" fill="#bababa"/>
<g transform="translate(33 31) scale(.65) translate(-33 -31)"><g className="site-camera"><path d="M-29-14 0-25 62-1 34 13Z" fill="url(#housing-metal)" stroke="#b5b5b5" strokeWidth=".65"/><path d="M-29-14v30L34 40V13Z" fill="url(#housing-metal)" stroke="#888888" strokeWidth=".65"/><path d="M34 13 62-1v29L34 40Z" fill="#242424" stroke="#858585" strokeWidth=".7"/>
<path d="M-34-16-1-29 68-3 67 3 33 19-34-8Z" fill="#aaaaaa" stroke="#d0d0d0" strokeWidth=".6"/><path d="M-34-8 33 19 67 3v3L33 23Z" fill="#4c4c4c"/>
<ellipse cx="48" cy="21" rx="9.5" ry="12" transform="rotate(24 48 21)" fill="#090909" stroke="#999999" strokeWidth="1.2"/><ellipse cx="48" cy="21" rx="6.5" ry="9" transform="rotate(24 48 21)" fill="url(#camera-optics)"/><ellipse cx="46" cy="17" rx="2" ry="3" fill="#ffffff" opacity=".32"/>
<path d="M-20 1 3 10 M-20 5-3 12" stroke="#555555" strokeWidth="1"/><circle cx="24" cy="27" r="1" fill="#dedede"/><path d="M-24 13 26 32" stroke="#555555" strokeWidth=".5"/></g></g></g>}
