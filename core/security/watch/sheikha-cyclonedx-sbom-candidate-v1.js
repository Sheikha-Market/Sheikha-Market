'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

const ROOT=path.resolve(__dirname,'../../..');
const inventoryPath=path.join(ROOT,'runtime/security/watch/sheikha-asset-inventory-v1.json');
const outPath=path.join(ROOT,'runtime/security/watch/sheikha-cyclonedx-sbom-candidate-v1.json');

function hash(s){return crypto.createHash('sha256').update(String(s)).digest('hex');}
function purlNpm(name,version){return 'pkg:npm/'+encodeURIComponent(name).replace(/%2F/gi,'%2F')+'@'+encodeURIComponent(version);}
function purlPypi(name,version){return 'pkg:pypi/'+encodeURIComponent(String(name).toLowerCase())+'@'+encodeURIComponent(version);}

const inv=JSON.parse(fs.readFileSync(inventoryPath,'utf8'));
const components=[];
const seen=new Set();

for(const c of inv.nodeComponents||[]){
  const key='npm:'+c.name+'@'+c.version;
  if(seen.has(key))continue; seen.add(key);
  components.push({
    type:'library',
    'bom-ref':key,
    group:c.name.startsWith('@')?c.name.split('/')[0]:'',
    name:c.name.startsWith('@')?c.name.split('/').slice(1).join('/'):c.name,
    version:c.version,
    purl:purlNpm(c.name,c.version),
    properties:[
      {name:'sheikha:evidenceState',value:c.evidenceState||'UNKNOWN'},
      {name:'sheikha:direct',value:String(!!c.direct)},
      {name:'sheikha:dev',value:String(!!c.dev)},
      {name:'sheikha:optional',value:String(!!c.optional)}
    ]
  });
}
for(const c of inv.python?.observedVenv?.packages||[]){
  const key='pypi:'+c.name+'@'+c.version;
  if(seen.has(key))continue; seen.add(key);
  components.push({
    type:'library','bom-ref':key,name:c.name,version:c.version,purl:purlPypi(c.name,c.version),
    properties:[{name:'sheikha:evidenceState',value:c.evidenceState||'OBSERVED_INSTALLED_VENV'}]
  });
}

components.sort((a,b)=>String(a['bom-ref']).localeCompare(String(b['bom-ref'])));
const serialSeed=hash(JSON.stringify({
  packageLockSha256:inv.evidence?.packageLockSha256,
  requirementsSha256:inv.evidence?.requirementsSha256,
  components:components.map(x=>x['bom-ref'])
}));

const doc={
  bomFormat:'CycloneDX',
  specVersion:'1.6',
  serialNumber:'urn:uuid:'+[
    serialSeed.slice(0,8),serialSeed.slice(8,12),'4'+serialSeed.slice(13,16),
    '8'+serialSeed.slice(17,20),serialSeed.slice(20,32)
  ].join('-'),
  version:1,
  metadata:{
    timestamp:new Date().toISOString(),
    tools:{components:[{type:'application',name:'Sheikha Asset Inventory → CycloneDX Candidate Generator',version:'1.0.0'}]},
    component:{
      type:'application',
      name:inv.project?.name||'sheikha-operating-system',
      version:inv.project?.version||'unknown',
      'bom-ref':'application:'+String(inv.project?.name||'sheikha')+'@'+String(inv.project?.version||'unknown')
    },
    properties:[
      {name:'sheikha:status',value:'GENERATED_CANDIDATE_NOT_SIGNED'},
      {name:'sheikha:sourcePackageLockSha256',value:inv.evidence?.packageLockSha256||''},
      {name:'sheikha:sourceRequirementsSha256',value:inv.evidence?.requirementsSha256||''},
      {name:'sheikha:inventoryGeneratedAt',value:inv.generatedAt||''},
      {name:'sheikha:limitations',value:'No runtime reachability inference; no dependency graph completeness claim; no signature/attestation.'}
    ]
  },
  components
};
fs.writeFileSync(outPath,JSON.stringify(doc,null,2)+'\n');
console.log(JSON.stringify({
  status:'GENERATED_CANDIDATE_NOT_SIGNED',
  output:outPath,
  componentCount:components.length,
  npmCount:components.filter(x=>String(x['bom-ref']).startsWith('npm:')).length,
  pypiCount:components.filter(x=>String(x['bom-ref']).startsWith('pypi:')).length,
  sha256:hash(fs.readFileSync(outPath))
},null,2));
