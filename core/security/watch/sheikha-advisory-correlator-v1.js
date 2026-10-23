'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {assessExposure}=require('./sheikha-exposure-matcher-v1.js');
const {registerSecurityEvent}=require('../sheikha-security-registry-v1.js');

const ROOT=path.resolve(__dirname,'../../..');
const INVENTORY=path.join(ROOT,'runtime/security/watch/sheikha-asset-inventory-v1.json');

function loadInventory(){
  return JSON.parse(fs.readFileSync(INVENTORY,'utf8'));
}
function findAsset(inventory, advisory={}){
  const eco=String(advisory.ecosystem||'').toLowerCase();
  const product=String(advisory.product||advisory.component||'').toLowerCase();
  if(!product) return null;

  if(eco==='npm' || !eco){
    const hit=(inventory.nodeComponents||[]).find(x=>String(x.name).toLowerCase()===product);
    if(hit) return {vendor:advisory.vendor||'',component:hit.name,product:hit.name,version:hit.version,evidenceState:hit.evidenceState,evidenceSource:hit.evidenceSource};
  }
  if(eco==='pypi' || eco==='python'){
    const hit=(inventory.python?.observedVenv?.packages||[]).find(x=>String(x.name).toLowerCase()===product);
    if(hit) return {vendor:advisory.vendor||'',component:hit.name,product:hit.name,version:hit.version,evidenceState:hit.evidenceState,evidenceSource:'.venv pip list'};
    const declared=(inventory.python?.declaredRequirements||[]).find(x=>String(x.name).toLowerCase()===product);
    if(declared) return {vendor:advisory.vendor||'',component:declared.name,product:declared.name,version:null,evidenceState:'DECLARED_NOT_PROVEN_INSTALLED',evidenceSource:'requirements.txt'};
  }
  return null;
}

function correlateAdvisory(advisory={}){
  const inventory=loadInventory();
  const asset=findAsset(inventory,advisory);
  const event={
    id:advisory.id||advisory.cve||advisory.ghsa||'',
    source:advisory.source||'',
    sourceClass:advisory.sourceClass||'',
    component:advisory.product||advisory.component||'',
    title:advisory.title||'security advisory',
    summary:advisory.summary||'',
    securityEvidence:true,
    activelyExploited:advisory.activelyExploited===true,
    ownership:'EXTERNAL',
    affectedVersions:Array.isArray(advisory.affectedVersions)?advisory.affectedVersions:undefined
  };

  const registry=registerSecurityEvent(event,asset||{});
  let exposure={state:'UNKNOWN',reason:'NO_MATCHING_OBSERVED_ASSET'};
  if(asset){
    exposure=assessExposure(asset,{
      vendor:advisory.vendor||'',
      product:advisory.product||advisory.component||'',
      versionRange:advisory.versionRange||null
    });
  }

  const state=asset
    ? (exposure.state==='AFFECTED_BY_VERSION_RANGE'?'AFFECTED':
       exposure.state==='NOT_AFFECTED'?'NOT_AFFECTED':
       exposure.state==='NOT_APPLICABLE'?'NOT_APPLICABLE':'POTENTIALLY_AFFECTED')
    : 'UNKNOWN';

  return Object.freeze({
    advisoryId:event.id||null,
    source:event.source,
    sourceClass:event.sourceClass,
    asset:asset||null,
    inventoryEvidence:{
      generatedAt:inventory.generatedAt,
      packageLockSha256:inventory.evidence?.packageLockSha256||null,
      requirementsSha256:inventory.evidence?.requirementsSha256||null,
      sbomState:inventory.evidence?.sbomState||'UNKNOWN'
    },
    registry,
    exposure,
    decisionState:state,
    compromised:false,
    automaticRemediation:false,
    nextAction:state==='AFFECTED'?'PREPARE_DEFENSIVE_REPAIR_CANDIDATE':
      state==='POTENTIALLY_AFFECTED'?'COLLECT_EXACT_VERSION_OR_RANGE_EVIDENCE':
      state==='UNKNOWN'?'ASSET_INVENTORY_REVIEW':'WATCH'
  });
}

module.exports=Object.freeze({loadInventory,findAsset,correlateAdvisory});
