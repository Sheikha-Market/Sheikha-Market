'use strict';
// Pure telemetry contract simulator: no network, credentials, device or actuator I/O.
const MODULES=[['visual-robot','Sheikha Visual Robot'],['visual','Sheikha Visual'],['robotics','Sheikha Robotics'],['lab','Sheikha Lab Robotics'],['studio','Sheikha Studio Robotics'],['foundry','Sheikha Foundry Robotics'],['robotic-pipeline','Sheikha Robotic Pipeline'],['visual-pipeline','Sheikha Visual Pipeline'],['connection-pipeline','Sheikha Connection Pipeline'],['connectors','Sheikha Robotic Connectors']].map(([id,name])=>({id,name,status:'LOCAL_CONTRACT_DEFINED',productionVerified:'UNKNOWN'}));
const PROFILES=['wire','wireless','iot','satellite','hybrid'];
class SimulatedConnector {
 constructor(profile){if(!PROFILES.includes(profile))throw Error('CONNECTOR_PROFILE_DENIED');this.profile=profile;this.sequence=-1;this.clock=0;this.connected=false;this.events=[];}
 advance(tick){if(!Number.isSafeInteger(tick)||tick<this.clock)throw Error('INVALID_SIMULATED_CLOCK');this.clock=tick;}
 validate(packet){
  if(!packet||typeof packet!=='object'||Array.isArray(packet))throw Error('ENVELOPE_REQUIRED');
  const required=['version','deviceId','sequence','issuedTick','expiresTick','kind','payload'];
  if(Object.keys(packet).length!==required.length||!required.every(k=>Object.hasOwn(packet,k)))throw Error('ENVELOPE_FIELDS_DENIED');
  if(packet.version!==1||packet.deviceId!=='SIM_ROBOT_01'||packet.kind!=='telemetry')throw Error('IDENTITY_OR_SCOPE_DENIED');
  if(!Number.isSafeInteger(packet.sequence)||packet.sequence<=this.sequence)throw Error('REPLAY_OR_SEQUENCE_DENIED');
  if(!Number.isSafeInteger(packet.issuedTick)||!Number.isSafeInteger(packet.expiresTick)||packet.issuedTick<0||packet.issuedTick>this.clock||packet.expiresTick<=this.clock||packet.expiresTick<=packet.issuedTick||packet.expiresTick-packet.issuedTick>5)throw Error('EXPIRED_OR_INVALID_SIMULATED_ENVELOPE');
  const p=packet.payload;
  if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length!==2||!Object.hasOwn(p,'health')||!Object.hasOwn(p,'position'))throw Error('PAYLOAD_FIELDS_DENIED');
  if(!['NOMINAL','FAULT_LATCHED','ESTOP_LATCHED'].includes(p.health)||!Array.isArray(p.position)||p.position.length!==2||!p.position.every(v=>Number.isFinite(v)&&v>=0&&v<=10))throw Error('TELEMETRY_VALUE_DENIED');
  this.sequence=packet.sequence;this.events.push({sequence:this.sequence,receivedTick:this.clock,profile:this.profile,kind:'SIMULATED_TELEMETRY_ACCEPTED'});if(this.events.length>100)this.events.shift();return {accepted:true,simulationOnly:true,authenticatedDevice:false,physicalCommandSent:false};
 }
 sendPhysicalCommand(){throw Error('PHYSICAL_TRANSPORT_NOT_CONFIGURED');}
 status(){return {profile:this.profile,mode:'SIMULATION_ONLY',realConnection:'UNKNOWN',authenticatedDevice:false,cryptographicVerification:'UNKNOWN',connected:this.connected,physicalActuationAllowed:false,sequence:this.sequence};}
}
function runConnectorScenario(){return {modules:MODULES,profiles:PROFILES.map(profile=>{const c=new SimulatedConnector(profile);c.validate({version:1,deviceId:'SIM_ROBOT_01',sequence:0,issuedTick:0,expiresTick:3,kind:'telemetry',payload:{health:'NOMINAL',position:[1,1]}});return c.status();}),wirelessFallbackVerified:'UNKNOWN',satelliteCoverage:'UNKNOWN',hardwareAdapterConfigured:false,physicalCommandSent:false};}
module.exports={MODULES,PROFILES,SimulatedConnector,runConnectorScenario};
