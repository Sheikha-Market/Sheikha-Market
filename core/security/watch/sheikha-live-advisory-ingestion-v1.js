'use strict';

const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {correlateAdvisory}=require('./sheikha-advisory-correlator-v1.js');
const {registerSecurityEvent}=require('../sheikha-security-registry-v1.js');

const ROOT=path.resolve(__dirname,'../../..');

function stableKey(event={}){
  return String(event.id||event.cve||event.ghsa||
    crypto.createHash('sha256').update(JSON.stringify([
      event.source,event.sourceClass,event.product||event.component,event.title,event.publishedAt
    ])).digest('hex'));
}

function normalizeEvent(event={}){
  return Object.freeze({
    id:event.id||event.cve||event.ghsa||null,
    source:String(event.source||''),
    sourceClass:String(event.sourceClass||'UNKNOWN'),
    sourceUrl:event.sourceUrl||null,
    publishedAt:event.publishedAt||null,
    observedAt:event.observedAt||new Date().toISOString(),
    title:String(event.title||''),
    summary:String(event.summary||''),
    ecosystem:event.ecosystem||null,
    vendor:event.vendor||null,
    product:event.product||event.component||null,
    versionRange:event.versionRange||null,
    severity:event.severity||null,
    cvss:event.cvss??null,
    patchedVersion:event.patchedVersion||null,
    activelyExploited:event.activelyExploited===true,
    eventType:event.eventType||null,
    securityEvidence:event.securityEvidence!==false
  });
}

function triageOne(raw={}){
  const event=normalizeEvent(raw);
  if(event.eventType==='AVAILABILITY_INCIDENT' || event.sourceClass==='OPENAI_STATUS'){
    const registry=registerSecurityEvent({
      id:event.id||'',
      source:event.source,
      sourceClass:event.sourceClass,
      component:event.product||'',
      title:event.title,
      summary:event.summary,
      securityEvidence:false,
      activelyExploited:false,
      ownership:'EXTERNAL'
    },{});
    return Object.freeze({
      key:stableKey(event),event,classification:'AVAILABILITY_INCIDENT',
      applicability:'NOT_EVALUATED_AS_VULNERABILITY',
      assetEvidenceState:null,runtimeReachability:'NOT_APPLICABLE',
      compromised:false,automaticRemediation:false,registry,nextAction:'WATCH_AVAILABILITY'
    });
  }

  const correlation=correlateAdvisory(event);
  const evidenceState=correlation.asset?.evidenceState||null;
  const lockOnly=evidenceState==='LOCKED_COMPONENT';
  let decision=correlation.decisionState;
  if(decision==='AFFECTED' && lockOnly) decision='AFFECTED_LOCKED_COMPONENT';
  if(decision==='NOT_AFFECTED' && lockOnly) decision='NOT_AFFECTED_LOCKED_COMPONENT';

  return Object.freeze({
    key:stableKey(event),event,classification:'SECURITY_ADVISORY',
    applicability:decision,
    asset:correlation.asset,
    assetEvidenceState:evidenceState,
    runtimeReachability:lockOnly?'UNKNOWN_FROM_LOCKFILE_ONLY':'UNKNOWN',
    compromised:false,
    automaticRemediation:false,
    inventoryEvidence:correlation.inventoryEvidence,
    registry:correlation.registry,
    exposure:correlation.exposure,
    nextAction:decision==='AFFECTED_LOCKED_COMPONENT'?'PREPARE_LOCKFILE_REPAIR_CANDIDATE':
      correlation.nextAction
  });
}

function ingest(events=[]){
  const seen=new Set(),results=[],duplicates=[];
  for(const raw of events){
    const normalized=normalizeEvent(raw);
    const key=stableKey(normalized);
    if(seen.has(key)){duplicates.push(key);continue;}
    seen.add(key);
    results.push(triageOne(normalized));
  }
  return Object.freeze({
    system:'SHEIKHA_LIVE_ADVISORY_INGESTION_V1',
    version:'1.0.0',
    generatedAt:new Date().toISOString(),
    inputCount:events.length,
    uniqueCount:results.length,
    duplicateCount:duplicates.length,
    duplicates:Object.freeze(duplicates),
    results:Object.freeze(results),
    safety:Object.freeze({
      activeProbe:false,exploit:false,credentialUse:false,
      install:false,upgrade:false,secretMutation:false,
      permissionEscalation:false,gitWrite:false,ciRerun:false,
      merge:false,deploy:false,production:false,payment:false,
      contract:false,externalContact:false
    })
  });
}

function ingestFile(inputPath,outputPath){
  const doc=JSON.parse(fs.readFileSync(inputPath,'utf8'));
  const events=Array.isArray(doc)?doc:(doc.events||[]);
  const result=ingest(events);
  fs.mkdirSync(path.dirname(outputPath),{recursive:true});
  fs.writeFileSync(outputPath,JSON.stringify(result,null,2)+'\n');
  return result;
}

module.exports=Object.freeze({stableKey,normalizeEvent,triageOne,ingest,ingestFile});

if(require.main===module){
  const input=process.argv[2],output=process.argv[3];
  if(!input||!output){console.error('usage: node sheikha-live-advisory-ingestion-v1.js <input.json> <output.json>');process.exit(2);}
  const result=ingestFile(path.resolve(input),path.resolve(output));
  process.stdout.write(JSON.stringify({
    system:result.system,inputCount:result.inputCount,uniqueCount:result.uniqueCount,
    duplicateCount:result.duplicateCount,
    affected:result.results.filter(x=>String(x.applicability).startsWith('AFFECTED')).map(x=>({id:x.event.id,product:x.event.product,applicability:x.applicability,nextAction:x.nextAction})),
    notAffected:result.results.filter(x=>String(x.applicability).startsWith('NOT_AFFECTED')).map(x=>({id:x.event.id,product:x.event.product,applicability:x.applicability})),
    availability:result.results.filter(x=>x.classification==='AVAILABILITY_INCIDENT').map(x=>({id:x.event.id,title:x.event.title}))
  },null,2)+'\n');
}
