const crypto=require('crypto');
const SEAL="BOUND_BY_QURAN_SUNNAH";
const SECRET_PATTERNS=[
  /SHP-[A-F0-9]{8,}-BOUND-741/g,
  /SHKHA-[A-Z]+-[A-Z]+-[A-F0-9]+-741/g,
  /Bearer [A-Za-z0-9\-_\.]+/g,
  /sk-[A-Za-z0-9]{20,}/g,
  /api_key['\"]?\s*[:=]\s*['\"][^'\"]+/gi,
  /password['\"]?\s*[:=]\s*['\"][^'\"]+/gi,
  /MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQ/g,
  /-----BEGIN (PRIVATE|RSA) KEY-----/g
];
function scrub(obj){
  let s=JSON.stringify(obj);
  let found=false;
  SECRET_PATTERNS.forEach(p=>{
    if(p.test(s)){ found=true; s=s.replace(p,'[REDACTED-BOUND-BY-QURAN-SUNNAH]'); }
  });
  // also scrub token fields
  try{
    let o=JSON.parse(s);
    ['token','nonce','secret','password','apiKey','api_key','jwt','bearer','privateKey'].forEach(k=>{
      if(o[k]) o[k]='[REDACTED]';
      if(o.query && typeof o.query==='object' && o.query[k]) o.query[k]='[REDACTED]';
    });
    // recursive
    const rec=(x)=>{
      if(!x||typeof x!=='object') return;
      Object.keys(x).forEach(k=>{
        if(/token|secret|password|api[_-]?key|nonce|private/i.test(k) && typeof x[k]==='string' && x[k].length>6){ x[k]='[REDACTED-BOUND]'; }
        else if(typeof x[k]==='object') rec(x[k]);
      });
    };
    rec(o);
    return {clean:o, hadSecret:found};
  }catch(e){ return {clean:{error:'scrubbed',seal:SEAL}, hadSecret:found}; }
}
module.exports={scrub, SEAL};
