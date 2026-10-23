'use strict';

const fs=require('fs'),path=require('path'),http=require('http');

const ROOT=process.argv[2] || process.cwd();
const registry=JSON.parse(fs.readFileSync(path.join(__dirname,'component-registry.json'),'utf8'));

const TOKENS={
  STUDIO:['studio'],
  TRUST_TOOLS:['trust','openssl','tpm'],
  FIRMWARE:['firmware'],
  TPM:['tpm'],
  ARABIC_LANGUAGE:['arabic','language','لغة'],
  LMM:['lmm','model-cluster','ollama'],
  FOUNDRY:['foundry'],
  CLOUD:['cloud'],
  BARE_METAL:['bare-metal','baremetal'],
  SAAS:['saas'],
  SYSTEM_BUILDER:['system-builder','system_builder'],
  GIT_LAB_HUB:['github','gitlab','git-hub','git_lab'],
  SDK:['sdk'],
  CLI:['cli'],
  MCP:['mcp'],
  PHP:['php'],
  MODEL_SUBSCRIPTIONS:['model','subscription'],
  OBSERVABILITY:['observability','prometheus','grafana','telemetry'],
  SECURITY_TOOLING:['security','hardening','semantic-scan'],
  MARKET:['market','commerce','سوق'],
  GARDENS:['garden','jannat','جنات'],
  FARMS:['farm','مزر'],
  PASTURES:['pasture','مرعى','مراعي'],
  RESOURCE_RARITY:['rarity','resource-governance'],
  DEFENSIVE_EWAR:['ewar','defensive-awareness'],
  DRAWING_MOTION:['sheikha-visual-spatial','drawing'],
  POSSIBILITY:['possibility-realization'],
  COMMERCIAL_READINESS:['commercial-readiness']
};

const ignored=new Set(['node_modules','.git','dist','build','.cache','.next','coverage']);
const found={};
for(const c of registry.components) found[c.id]=[];

function walk(dir,depth=0){
  if(depth>6)return;
  let entries;try{entries=fs.readdirSync(dir,{withFileTypes:true});}catch{return;}
  for(const e of entries){
    if(ignored.has(e.name))continue;
    const full=path.join(dir,e.name);
    const rel=path.relative(ROOT,full);
    const low=rel.toLowerCase();
    for(const [id,tokens] of Object.entries(TOKENS)){
      if(found[id].length>=12)continue;
      if(tokens.some(t=>low.includes(String(t).toLowerCase()))) found[id].push(rel);
    }
    if(e.isDirectory())walk(full,depth+1);
  }
}
walk(ROOT);

function get(port,pathname){
  return new Promise(resolve=>{
    const q=http.request({host:'127.0.0.1',port,path:pathname,timeout:600},r=>{
      let d='';r.on('data',c=>{if(d.length<131072)d+=c});
      r.on('end',()=>{try{resolve({reachable:r.statusCode===200,http:r.statusCode,system:JSON.parse(d).system||null})}catch{resolve({reachable:r.statusCode===200,http:r.statusCode})}});
    });
    q.on('error',e=>resolve({reachable:false,error:e.code||e.message}));
    q.on('timeout',()=>{q.destroy();resolve({reachable:false,error:'TIMEOUT'})});
    q.end();
  });
}

(async()=>{
 const services={
   apex:await get(8092,'/health'),
   drawing:await get(8093,'/api/drawing/status'),
   possibility:await get(8094,'/api/possibility/status'),
   commercial:await get(8095,'/api/commercial/status')
 };
 const components=registry.components.map(c=>({
   ...c,
   evidencePaths:found[c.id],
   evidenceCount:found[c.id].length,
   discoveryState:found[c.id].length?'LOCAL_SIGNALS_FOUND':'NO_LOCAL_PATH_SIGNAL',
   liveService:
     c.id==='DRAWING_MOTION'?services.drawing:
     c.id==='POSSIBILITY'?services.possibility:
     c.id==='COMMERCIAL_READINESS'?services.commercial:null
 }));
 console.log(JSON.stringify({system:'SHEIKHA_UNIFIED_RUNTIME_DISCOVERY_V1',root:ROOT,services,components,boundaries:registry.boundaries},null,2));
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
