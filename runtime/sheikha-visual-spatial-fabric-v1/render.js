'use strict';

const zlib = require('zlib');

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) {
    c ^= b;
    for (let k=0;k<8;k++) c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  t.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([t,data])), 8 + data.length);
  return out;
}

function earthSkyPng(width=512, height=288) {
  width = Math.max(64, Math.min(2048, Number(width)||512));
  height = Math.max(64, Math.min(2048, Number(height)||288));
  const raw = Buffer.alloc((width*4 + 1) * height);
  for (let y=0;y<height;y++) {
    const row = y*(width*4+1);
    raw[row]=0;
    for (let x=0;x<width;x++) {
      const o=row+1+x*4;
      const horizon=Math.floor(height*0.58);
      let r,g,b;
      if (y<horizon) {
        const t=y/Math.max(1,horizon);
        r=Math.round(18+70*t); g=Math.round(55+115*t); b=Math.round(105+125*t);
        const star = ((x*17+y*31)%997===0) && y<horizon*0.7;
        if (star) r=g=b=245;
      } else {
        const t=(y-horizon)/Math.max(1,height-horizon);
        r=Math.round(22+35*t); g=Math.round(95+45*t); b=Math.round(42+20*t);
        if ((x + y*3) % 73 < 2) { r=45; g=125; b=60; }
      }
      raw[o]=r; raw[o+1]=g; raw[o+2]=b; raw[o+3]=255;
    }
  }
  const ihdr=Buffer.alloc(13);
  ihdr.writeUInt32BE(width,0); ihdr.writeUInt32BE(height,4);
  ihdr[8]=8; ihdr[9]=6; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR',ihdr),
    chunk('IDAT',zlib.deflateSync(raw,{level:6})),
    chunk('IEND',Buffer.alloc(0))
  ]);
}

function gardensAnimatedSvg(width=1280, height=720) {
  width=Math.max(320,Math.min(3840,Number(width)||1280));
  height=Math.max(180,Math.min(2160,Number(height)||720));
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1280 720" role="img" aria-label="Sheikha gardens procedural motion graphic without people or animals">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#173b69"/><stop offset="1" stop-color="#8ecae6"/></linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1b8ca8"/><stop offset=".5" stop-color="#8bd3dd"/><stop offset="1" stop-color="#1b8ca8"/></linearGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="1280" height="390" fill="url(#sky)"/>
  <circle cx="1040" cy="115" r="54" fill="#f4d35e" opacity=".9"/>
  <path d="M0 340 Q250 280 510 350 T980 330 T1280 345 V720 H0Z" fill="#315f38"/>
  <path d="M0 410 Q300 360 620 430 T1280 400 V720 H0Z" fill="#477b43"/>
  <path d="M0 575 Q320 525 650 570 T1280 550 V720 H0Z" fill="url(#water)" opacity=".9">
    <animate attributeName="d" dur="8s" repeatCount="indefinite"
      values="M0 575 Q320 525 650 570 T1280 550 V720 H0Z;
              M0 565 Q320 545 650 560 T1280 570 V720 H0Z;
              M0 575 Q320 525 650 570 T1280 550 V720 H0Z"/>
  </path>
  <g fill="#245c2d">
    ${Array.from({length:22},(_,i)=>`<path d="M${70+i*55} ${500-(i%4)*10} q-20 -70 0 -125 q20 55 0 125Z"><animateTransform attributeName="transform" type="rotate" values="-1 ${70+i*55} ${500-(i%4)*10};2 ${70+i*55} ${500-(i%4)*10};-1 ${70+i*55} ${500-(i%4)*10}" dur="${4+(i%5)}s" repeatCount="indefinite"/></path>`).join('')}
  </g>
  <g opacity=".35" filter="url(#soft)">
    <ellipse cx="250" cy="180" rx="135" ry="26" fill="#fff"><animate attributeName="cx" values="180;1100;180" dur="34s" repeatCount="indefinite"/></ellipse>
    <ellipse cx="820" cy="235" rx="175" ry="30" fill="#fff"><animate attributeName="cx" values="1150;160;1150" dur="43s" repeatCount="indefinite"/></ellipse>
  </g>
  <text x="48" y="68" font-family="sans-serif" font-size="30" fill="#fff">Sheikha Gardens Spatial Twin — Procedural Motion</text>
  <text x="48" y="105" font-family="sans-serif" font-size="18" fill="#fff" opacity=".85">No people • no animals • visually dynamic, not alive or conscious</text>
</svg>`;
}

module.exports = { earthSkyPng, gardensAnimatedSvg };
