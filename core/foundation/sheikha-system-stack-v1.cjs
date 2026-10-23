'use strict';const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');const ROOT=path.resolve(__dirname,'../..');const SOURCE='sheikha-language/foundations/sheikha-system-stack-v1.shk';const language=require('../language/sheikha-managed-language-v1.cjs'),foundation=require('./sheikha-foundation-management-v1.cjs'),native=require('./sheikha-native-environment-status-v1.cjs');
const SPECS=[{id:'core',name:'Sheikha Core',deps:[]},{id:'system',name:'Sheikha System',deps:['core']},{id:'os',name:'Sheikha OS',deps:['core','system']},{id:'cloud',name:'Sheikha Cloud',deps:['system','os']},{id:'saas',name:'Sheikha SaaS',deps:['cloud','software']},{id:'software',name:'Sheikha Software',deps:['core']},{id:'hardware',name:'Sheikha Hardware',deps:['core']}];
function inspect(options={}){
 if(!options||typeof options!=='object'||Array.isArray(options)||Object.keys(options).length)throw Error('ONLY_LOCAL_FOUNDATION_ADMITTED');
 const source=fs.readFileSync(path.join(ROOT,SOURCE),'utf8'),compiled=language.compile(source);if(!compiled.success)throw Error('STACK_TYPECHECK_FAILED');
 const entities=compiled.ast.body.filter(n=>n.type==='EntityDeclaration');if(entities.length!==SPECS.length||!SPECS.every(s=>entities.filter(e=>e.name===s.id).length===1))throw Error('STACK_CONTRACT_MISMATCH');
 const execution=language.run(source);if(!execution.success||!execution.output.some(s=>s.includes('SHEIKHA_SYSTEM_FOUNDATION_LOCAL')))throw Error('STACK_GOVERNANCE_BLOCKED');
 const core=foundation.inspect('core'),software=language.status(),firmware=foundation.inspect('firmware'),os=native.status();
 const components=SPECS.map(spec=>{
 let status='LOCAL_CONTRACT_DEFINED',evidence={basis:'COMPILED_LANGUAGE_ENTITY_ONLY'};
 if(spec.id==='core'){status=core.evidence.passed?'LOCAL_CONTRACT_COMPOSITION_VERIFIED':'UNKNOWN';evidence=core.evidence;}
 if(spec.id==='software'){status=software.success?'LOCAL_LANGUAGE_RUNTIME_VERIFIED':'UNKNOWN';evidence={basis:'ACTUAL_COMPILER_AND_VM_PROBE',languageStatus:software.status};}
 if(spec.id==='os'){status=os.status;evidence={basis:'CURRENT_ARTIFACT_HASHES_AND_RECORDED_VM_BOOT',artifactIntegrityVerified:os.artifactIntegrityVerified,buildId:os.buildId,evidenceFile:os.evidenceFile,bootExecutedThisSession:false,blockers:os.blockers};}
 if(spec.id==='system'){status='LOCAL_STACK_REGISTRY_VERIFIED';evidence={basis:'SEVEN_LANGUAGE_ENTITIES_AND_VM_MARKER',runtimeDaemonVerified:'UNKNOWN'};}
 if(spec.id==='hardware'){status=firmware.evidence.passed?'LOCAL_HARDWARE_POLICY_VERIFIED':'UNKNOWN';evidence=firmware.evidence;}
 return {...spec,status,evidence,productionActivation:'UNKNOWN',physicalActivation:'UNKNOWN',liveServiceVerified:'UNKNOWN'};
 });
 return {system:'SHEIKHA_SYSTEM_STACK_V1',status:'LOCAL_FOUNDATION_REGISTRY_VERIFIED',source:SOURCE,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),components,hostRuntime:'Node.js',productionReady:false,cloudProvisionedThisSession:false,serviceStartedThisSession:false,physicalCommandSent:false,ownerDetailsIncluded:false};
}
module.exports={inspect,SOURCE};
