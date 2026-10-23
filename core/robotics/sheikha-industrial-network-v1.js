'use strict';
/* Discrete digital twin. No transport, device I/O or calibrated physical units. */
const CELL_SPECS=[
 {id:'foundry',label:'الفوندري والمصهر',deps:[],robot:'مناولة رقمية',gesture:'READY'},
 {id:'farm',label:'المزرعة الصناعية',deps:[],robot:'فحص موارد رقمي',gesture:'OBSERVE'},
 {id:'software',label:'المصنع البرمجي',deps:[],robot:'وكيل إنتاج رقمي',gesture:'PLAN'},
 {id:'factory',label:'التشكيل والتصنيع',deps:['foundry'],robot:'ذراع رقمي',gesture:'WORK'},
 {id:'assembly',label:'التجميع والتكامل',deps:['factory','farm','software'],robot:'تجميع رقمي',gesture:'WORK'},
 {id:'quality',label:'الاختبار والجودة',deps:['assembly'],robot:'فحص رقمي',gesture:'OBSERVE'},
 {id:'distribution',label:'التغليف والتوزيع',deps:['quality'],robot:'نقل رقمي',gesture:'COMPLETE'}];
class SheikhaIndustrialNetwork {
 constructor(){this.reset();}
 reset(){this.clock=0;this.estop=false;this.state='IDLE';this.events=[];this.cells=CELL_SPECS.map(s=>({...s,deps:[...s.deps],state:'WAITING',progress:0,health:'NOMINAL',fault:null,gesture:'READY',message:'جاهزة للمحاكاة'}));}
 record(cell,event){this.events.push({tick:this.clock,cell,event});if(this.events.length>200)this.events.shift();}
 begin(){if(this.state!=='IDLE')throw Error('NETWORK_NOT_READY');this.state='RUNNING';this.record('network','SIMULATION_STARTED');}
 emergencyStop(){this.estop=true;this.state='ESTOP_LATCHED';for(const c of this.cells){c.gesture='STOP';c.message='إيقاف افتراضي مثبت';}this.record('network','ESTOP_LATCHED');}
 injectFault(id){const c=this.cells.find(c=>c.id===id);if(!c)throw Error('CELL_UNKNOWN');if(c.state==='COMPLETE')throw Error('COMPLETED_CELL_IMMUTABLE');c.health='FAULT_LATCHED';c.fault='SIMULATED_SENSOR_FAILURE';c.state='FAULT_LATCHED';c.gesture='STOP';c.message='عطل افتراضي يحتاج فحصًا';this.record(id,'FAULT_LATCHED');}
 recover(id,review){const c=this.cells.find(c=>c.id===id);if(!c||c.health!=='FAULT_LATCHED')throw Error('NO_FAULT_TO_REVIEW');if(this.estop||review?.inspectionPassed!==true||review?.localResetAcknowledged!==true)throw Error('RECOVERY_REVIEW_REQUIRED');c.health='NOMINAL';c.fault=null;c.state='WAITING';c.progress=0;c.gesture='READY';c.message='تم فحص المحاكاة وإعادة ضبط الخلية';this.record(id,'LOCAL_RECOVERY_REVIEWED');}
 tick(){if(this.state!=='RUNNING'||this.estop)return this.snapshot();this.clock++;const completed=new Set(this.cells.filter(c=>c.state==='COMPLETE').map(c=>c.id));for(const c of this.cells){if(c.health!=='NOMINAL'||c.state==='COMPLETE')continue;if(!c.deps.every(d=>completed.has(d))){c.gesture='WAIT';c.message='انتظار اكتمال مدخلات الخلية';continue;}c.state='WORKING';c.gesture=CELL_SPECS.find(s=>s.id===c.id).gesture;c.message='تنفيذ خطوة إنتاج افتراضية';c.progress++;this.record(c.id,'SIMULATED_WORK_STEP');if(c.progress>=3){c.state='COMPLETE';c.gesture='COMPLETE';c.message='اكتمل العقد التجريبي';this.record(c.id,'SIMULATED_CONTRACT_COMPLETE');}}if(this.cells.every(c=>c.state==='COMPLETE'))this.state='COMPLETE';return this.snapshot();}
 snapshot(){return {mode:'SIMULATION_ONLY',state:this.state,tick:this.clock,estop:this.estop,cells:this.cells.map(c=>({...c,deps:[...c.deps]})),physicalCommandSent:false,realProductionVerified:'UNKNOWN',speechAudioVerified:'UNKNOWN',trace:this.events.map(e=>({...e}))};}
 sendPhysicalCommand(){throw Error('PHYSICAL_ADAPTER_NOT_CONFIGURED');}
}
function runNetwork(){const n=new SheikhaIndustrialNetwork();n.begin();for(let i=0;i<32&&n.state==='RUNNING';i++)n.tick();return n.snapshot();}
if(typeof module!=='undefined'&&module.exports)module.exports={SheikhaIndustrialNetwork,runNetwork};else globalThis.SheikhaIndustrial={SheikhaIndustrialNetwork,runNetwork};
