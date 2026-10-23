'use strict';
const fs = require('node:fs'); const path = require('node:path');
const language = require('../language/sheikha-managed-language-v1.cjs');
const { runBytecode } = require('../../sheikha-language/compiler/bytecode-vm');
const { runScenario } = require('./sheikha-digital-robot-v1');
const SOURCE = path.resolve(__dirname, '../../sheikha-language/robots/sheikha-digital-robot-v1.shk');
function activateDigitalRobot() {
  const compiled = language.compile(fs.readFileSync(SOURCE, 'utf8'));
  if (!compiled.success) throw new Error('ROBOT_SOURCE_TYPECHECK_FAILED');
  let simulation;
  const result = runBytecode(compiled.bytecode, { live: false, profile: 'local', strictIsolation: true,
    localProductionHandlers: { 'حاكي_روبوت': step => {
      const mission = JSON.parse(step.argument); simulation = runScenario(mission);
      return { ok: simulation.success, marker: 'SHEIKHA_DIGITAL_ROBOT_SIMULATION_COMPLETE' };
    } } });
  return { system: 'SHEIKHA_DIGITAL_ROBOT_V1', status: result.ok && simulation?.success ? 'LOCAL_DIGITAL_SIMULATION_VERIFIED' : 'UNKNOWN',
    identity: require('../identity/sheikha-identity-v1'),
    mode: 'SIMULATION_ONLY', languageSource: 'sheikha-language/robots/sheikha-digital-robot-v1.shk',
    simulation, physicalDriverConfigured: false, physicalRobotConnected: 'UNKNOWN', hostRuntime: 'Node.js', nativeRobotRuntimeVerified: 'UNKNOWN' };
}
function hardwareIntegrationPlan() {
  return { status: 'INTERFACE_CONTRACT_ONLY', connected: false, physicalActuationAllowed: false,
    commandEnvelope: { schemaVersion: '1.0', deviceId: 'UNKNOWN', sessionId: 'UNKNOWN', sequence: 'REQUIRED',
      expiresAt: 'REQUIRED', commandScope: 'EXPLICITLY_BOUNDED', calibratedLimitsId: 'UNKNOWN', safetyState: 'INDEPENDENT_HARDWARE_INPUT_REQUIRED', signature: 'REQUIRED_NOT_GENERATED' },
    requirements: ['EXACT_HARDWARE', 'DEVICE_IDENTITY', 'AUTHENTICATED_TRANSPORT', 'CALIBRATED_LIMITS', 'SAFETY_REVIEW', 'SEPARATE_PHYSICAL_OPERATION_APPROVAL'] };
}
module.exports = { activateDigitalRobot, hardwareIntegrationPlan };
