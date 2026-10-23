'use strict';

const crypto=require('crypto');

const zones={
  creator:['STUDIO','DRAWING_MOTION','LMM','MODEL_SUBSCRIPTIONS','MARKET','TRUST_TOOLS','OBSERVABILITY'],
  developer:['ARABIC_LANGUAGE','FOUNDRY','SYSTEM_BUILDER','GIT_LAB_HUB','SDK','CLI','MCP','PHP','OBSERVABILITY','SECURITY_TOOLING'],
  enterprise:['SAAS','CLOUD','BARE_METAL','TRUST_TOOLS','TPM','OBSERVABILITY','SECURITY_TOOLING','COMMERCIAL_READINESS'],
  agriculture:['GARDENS','FARMS','PASTURES','DRAWING_MOTION','POSSIBILITY','RESOURCE_RARITY','OBSERVABILITY'],
  engineering:['STUDIO','DRAWING_MOTION','POSSIBILITY','SYSTEM_BUILDER','FOUNDRY','BARE_METAL','OBSERVABILITY'],
  accessibility:['POSSIBILITY','STUDIO','SAAS','TRUST_TOOLS','OBSERVABILITY'],
  security:['TRUST_TOOLS','TPM','FIRMWARE','SECURITY_TOOLING','OBSERVABILITY','DEFENSIVE_EWAR'],
  general:['STUDIO','POSSIBILITY','SAAS','MARKET','GARDENS','TRUST_TOOLS']
};

function safe(v,max=100){return String(v||'').trim().slice(0,max);}
function compose(ctx={}){
  const segment=safe(ctx.segment||'general').toLowerCase();
  const selected=[...(zones[segment]||zones.general)];
  const domain=safe(ctx.domain).toLowerCase();
  if(domain.includes('garden')||domain.includes('farm')||domain.includes('pasture')||domain.includes('زراع')) selected.push('GARDENS','FARMS','PASTURES');
  if(domain.includes('security')||domain.includes('أمن')) selected.push('SECURITY_TOOLING','TRUST_TOOLS');
  if(domain.includes('developer')||domain.includes('برمج')) selected.push('SDK','CLI','MCP','PHP','ARABIC_LANGUAGE');
  const unique=[...new Set(selected)];
  const payload={
    segment,
    goal:safe(ctx.goal,180),
    domain:safe(ctx.domain,80),
    device:safe(ctx.device||'desktop',40),
    locale:safe(ctx.locale||'ar-SA',20),
    accessibility:safe(ctx.accessibility||'standard',80),
    tenant:safe(ctx.tenant||'personal',80),
    securityClass:safe(ctx.securityClass||'standard',40),
    costBudget:safe(ctx.costBudget||'governed',40),
    zones:unique
  };
  return {
    system:'SHEIKHA_UNIFIED_5D_EXPERIENCE_COMPOSITION_V1',
    experienceId:crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0,24),
    dimensionModel:{D1:'zone',D2:'workflow',D3:'interaction-depth',D4:'time',D5:'adaptive-context'},
    payload,
    visuallyDynamic:true,
    adaptivePerRequest:true,
    claimsAliveOrConscious:false,
    guaranteeEveryCandidateBetter:false,
    productionEvolutionRule:'PROMOTE_ONLY_WHEN_MEASURED_BETTER_AND_SAFE_COMPLIANT'
  };
}

function promote({control={},candidate={},safety=true,compliance=true,minDelta=0.5}={}){
  if(!safety||!compliance)return{decision:'REJECT',reason:'SAFETY_OR_COMPLIANCE'};
  const metrics=['taskSuccess','timeToValueScore','accessibility','reliability','satisfaction'];
  const weights={taskSuccess:.28,timeToValueScore:.18,accessibility:.18,reliability:.22,satisfaction:.14};
  const score=x=>metrics.reduce((a,m)=>a+Number(x[m]||0)*weights[m],0);
  const a=score(control),b=score(candidate),delta=b-a;
  return {
    system:'SHEIKHA_EXPERIENCE_PROMOTION_GATE_V1',
    controlScore:a,candidateScore:b,delta,
    decision:delta>=Number(minDelta)?'PROMOTE':'KEEP_CONTROL',
    rollbackOnRegression:true,
    rule:'only a measured-better candidate becomes the next served production experience'
  };
}
module.exports={compose,promote};
