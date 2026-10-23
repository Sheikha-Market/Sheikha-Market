"use strict";
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
if(process.argv.length>3||process.argv[2]&&process.argv[2]!=='--write')throw Error('MODE_DENIED');
const stack=require('../../core/foundation/sheikha-system-stack-v1.cjs').inspect();
const architecture=require('../../core/os/sheikha-os-integration-v1.cjs').inspect();
const work=[
{id:'storage',requires:['crash_safe_filesystem','backup_restore_test'],acceptance:'Recorded recovery after interrupted writes'},
{id:'isolation',requires:['user_mode','memory_protection','preemptive_scheduler'],acceptance:'Untrusted task cannot access another task memory'},
{id:'drivers',requires:['target_hardware_inventory','driver_tests'],acceptance:'Each supported device passes its defined tests'},
{id:'network',requires:['network_stack','authenticated_transport','policy_tests'],acceptance:'Protocol correctness and denied traffic tests'},
{id:'applications',requires:['package_loader','desktop','application_compatibility'],acceptance:'Declared applications execute and recover correctly'},
{id:'intelligence',requires:['approved_model_and_data','task_evaluation_set','quality_and_latency_results'],acceptance:'Reproducible task-specific results with error bounds'},
{id:'operations',requires:['service_supervision','persistent_observability','fault_recovery'],acceptance:'Documented failures detected and recovery verified'},
{id:'release',requires:['target_selection','reproducible_image','release_integrity','rollback'],acceptance:'Bootable tested image with a demonstrated rollback'}
].map(x=>({...x,status:'PENDING_QUALIFICATION'}));
const report={timestamp:new Date().toISOString(),status:'INTEGRATED_READINESS_ASSESSED_INCOMPLETE',stack,architecture,hostResources:{platform:os.platform(),arch:os.arch(),logicalCpus:os.cpus().length,memoryBytes:os.totalmem()},deliveryPaths:{hosted:'Existing Linux host supports current development tools; full integrated service operation unverified',nativeVm:'Limited native boot verified; full OS capabilities pending',physical:'Target and hardware qualification pending'},completionWork:work,fullSystemReady:false,agiOrAsiVerified:false,physicalHardwareManufactured:false,productionEnabled:false,serviceChanges:false,authorityGranted:false};
let evidence=null;if(process.argv[2]==='--write'){const dir=path.join(root,'runtime/sheikha-complete-system/v1',String(Date.now()));fs.mkdirSync(dir,{recursive:true,mode:0o700});evidence=path.join(dir,'readiness.json');fs.writeFileSync(evidence,JSON.stringify(report,null,2)+'\n',{mode:0o600,flag:'wx'});fs.writeFileSync(path.join(dir,'SHA256SUMS'),crypto.createHash('sha256').update(fs.readFileSync(evidence)).digest('hex')+'  readiness.json\n',{mode:0o600,flag:'wx'});}console.log(JSON.stringify({status:report.status,components:stack.components.map(x=>({id:x.id,status:x.status})),workPackages:work.length,fullSystemReady:false,evidence}));
