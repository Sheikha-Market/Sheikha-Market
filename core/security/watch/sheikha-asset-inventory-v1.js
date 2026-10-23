'use strict';

const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const cp=require('node:child_process');

const ROOT=path.resolve(__dirname,'../../..');
const OUT=path.join(ROOT,'runtime/security/watch/sheikha-asset-inventory-v1.json');

function sha256File(file){
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}
function readJson(rel){
  return JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8'));
}
function safeJson(rel){
  try{return readJson(rel)}catch{return null}
}
function parseRequirements(text){
  return text.split(/\r?\n/)
    .map(line=>line.replace(/\s+#.*$/,'').trim())
    .filter(line=>line && !line.startsWith('#'))
    .map(spec=>{
      const m=spec.match(/^([^<>=!~\s\[]+)(?:\[[^\]]+\])?\s*(.*)$/);
      return {name:m?m[1]:spec,specifier:m?m[2].trim():'',evidenceState:'DECLARED_REQUIREMENT'};
    });
}
function pythonInstalled(){
  const py=path.join(ROOT,'.venv/bin/python');
  if(!fs.existsSync(py)) return {available:false,packages:[],pythonVersion:null};
  try{
    const pythonVersion=cp.execFileSync(py,['--version'],{encoding:'utf8'}).trim();
    const raw=cp.execFileSync(py,['-m','pip','list','--format=json'],{encoding:'utf8',maxBuffer:16*1024*1024});
    const packages=JSON.parse(raw).map(x=>({name:x.name,version:x.version,evidenceState:'OBSERVED_INSTALLED_VENV'}));
    return {available:true,pythonVersion,packages};
  }catch(error){
    return {available:false,packages:[],pythonVersion:null,error:String(error.message||error)};
  }
}
function mcpInventory(){
  const out=[];
  const files=[
    ['.mcp.json','mcpServers'],
    ['.cursor/mcp.json','mcpServers'],
    ['.vscode/mcp.json','servers']
  ];
  for(const [rel,key] of files){
    const doc=safeJson(rel);
    const servers=doc&&doc[key]||{};
    for(const [name,s] of Object.entries(servers)){
      let transport='unknown',endpointHost=null,localCommand=null;
      if(s.url){
        transport='http';
        try{endpointHost=new URL(s.url).host}catch{}
      }else if(s.command){
        transport='stdio';
        localCommand=String(s.command);
      }
      out.push({name,config:rel,transport,endpointHost,localCommand,evidenceState:'CONFIGURED'});
    }
  }
  return out;
}
function main(){
  const pkg=readJson('package.json');
  const lock=readJson('package-lock.json');
  const lockPackages=lock.packages||{};
  const directNames=new Set(Object.keys({...pkg.dependencies,...pkg.devDependencies,...pkg.optionalDependencies}));
  const nodeComponents=Object.entries(lockPackages)
    .filter(([k,v])=>k && v && v.version)
    .map(([k,v])=>({
      ecosystem:'npm',
      name:v.name||k.replace(/^node_modules\//,''),
      version:String(v.version),
      direct:directNames.has(v.name||k.replace(/^node_modules\//,'')),
      dev:Boolean(v.dev),
      optional:Boolean(v.optional),
      evidenceState:'LOCKED_COMPONENT',
      evidenceSource:'package-lock.json'
    }));

  const reqPath=path.join(ROOT,'requirements.txt');
  const pythonDeclared=parseRequirements(fs.readFileSync(reqPath,'utf8'));
  const py=pythonInstalled();

  const inventory={
    system:'SHEIKHA_ASSET_INVENTORY_V1',
    version:'1.0.0',
    mode:'READ_ONLY_EVIDENCE_INVENTORY',
    generatedAt:new Date().toISOString(),
    project:{
      name:pkg.name,version:pkg.version,
      nodeEngine:pkg.engines&&pkg.engines.node||null,
      observedNodeRuntime:process.version
    },
    evidence:{
      packageJsonSha256:sha256File(path.join(ROOT,'package.json')),
      packageLockSha256:sha256File(path.join(ROOT,'package-lock.json')),
      requirementsSha256:sha256File(reqPath),
      sbomFileObserved:false,
      sbomState:'SBOM_GAP'
    },
    counts:{
      nodeLocked:nodeComponents.length,
      nodeDirect:[...directNames].length,
      pythonDeclared:pythonDeclared.length,
      pythonObservedInstalled:py.packages.length,
      mcpConfigured:mcpInventory().length
    },
    nodeComponents,
    python:{
      declaredRequirements:pythonDeclared,
      observedVenv:{available:py.available,pythonVersion:py.pythonVersion,packages:py.packages,error:py.error||null}
    },
    mcp:mcpInventory(),
    interpretationRules:[
      'LOCKED_COMPONENT_IS_NOT_PROOF_OF_RUNTIME_REACHABILITY',
      'DECLARED_REQUIREMENT_IS_NOT_PROOF_OF_INSTALLATION',
      'OBSERVED_INSTALLED_IS_NOT_PROOF_OF_EXPOSURE',
      'AFFECTED_REQUIRES_COMPONENT_VERSION_AND_ADVISORY_SCOPE',
      'NO_ACTIVE_PROBE'
    ]
  };
  fs.mkdirSync(path.dirname(OUT),{recursive:true});
  fs.writeFileSync(OUT,JSON.stringify(inventory,null,2)+'\n');
  const summary={
    system:inventory.system,status:'GENERATED',
    generatedAt:inventory.generatedAt,
    counts:inventory.counts,
    project:inventory.project,
    evidence:inventory.evidence,
    output:OUT
  };
  process.stdout.write(JSON.stringify(summary,null,2)+'\n');
}
if(require.main===module) main();
module.exports=Object.freeze({parseRequirements,pythonInstalled,mcpInventory});
