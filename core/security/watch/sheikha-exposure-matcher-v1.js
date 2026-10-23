'use strict';

function norm(v){ return String(v ?? '').trim().toLowerCase(); }

function componentMatches(asset={}, advisory={}) {
  const av=norm(asset.vendor), ap=norm(asset.product||asset.component);
  const vv=norm(advisory.vendor), vp=norm(advisory.product||advisory.component);
  if (!ap || !vp) return false;
  if (vv && av && vv !== av) return false;
  return ap === vp;
}

function cmpVersion(a,b){
  const pa=String(a||'').split(/[.+-]/).map(x=>/^\d+$/.test(x)?Number(x):x);
  const pb=String(b||'').split(/[.+-]/).map(x=>/^\d+$/.test(x)?Number(x):x);
  const n=Math.max(pa.length,pb.length);
  for(let i=0;i<n;i++){
    const x=pa[i]??0,y=pb[i]??0;
    if (typeof x==='number' && typeof y==='number'){ if(x<y)return -1;if(x>y)return 1; }
    else { const c=String(x).localeCompare(String(y)); if(c) return c<0?-1:1; }
  }
  return 0;
}

function inRange(version, range={}){
  if (!version) return null;
  if (range.exact) return cmpVersion(version,range.exact)===0;
  if (range.minInclusive && cmpVersion(version,range.minInclusive)<0) return false;
  if (range.minExclusive && cmpVersion(version,range.minExclusive)<=0) return false;
  if (range.maxInclusive && cmpVersion(version,range.maxInclusive)>0) return false;
  if (range.maxExclusive && cmpVersion(version,range.maxExclusive)>=0) return false;
  return true;
}

function assessExposure(asset={}, advisory={}){
  if (!componentMatches(asset,advisory)) return Object.freeze({state:'NOT_APPLICABLE',reason:'COMPONENT_IDENTITY_MISMATCH'});
  if (!asset.version) return Object.freeze({state:'UNKNOWN',reason:'ASSET_VERSION_UNKNOWN'});
  if (!advisory.versionRange) return Object.freeze({state:'UNKNOWN',reason:'ADVISORY_VERSION_RANGE_MISSING'});
  const hit=inRange(asset.version,advisory.versionRange);
  if (hit===true) return Object.freeze({state:'AFFECTED_BY_VERSION_RANGE',reason:'COMPONENT_AND_VERSION_MATCH'});
  if (hit===false) return Object.freeze({state:'NOT_AFFECTED',reason:'VERSION_OUTSIDE_ADVISORY_RANGE'});
  return Object.freeze({state:'UNKNOWN',reason:'VERSION_COMPARISON_UNRESOLVED'});
}

module.exports=Object.freeze({componentMatches,cmpVersion,inRange,assessExposure});
