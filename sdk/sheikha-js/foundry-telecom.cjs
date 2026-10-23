'use strict';

const { runNetwork } = require('../../core/robotics/sheikha-industrial-network-v1');
const { runConnectorScenario } = require('../../core/robotics/sheikha-robotic-connectors-v1.cjs');

function simulateFoundryTelecom(options = {}) {
  if (options === null || typeof options !== 'object' || Array.isArray(options) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(options)) ||
      Reflect.ownKeys(options).length !== 0) {
    throw new Error('SIMULATION_ARGUMENTS_DENIED');
  }

  const industrialNetwork = runNetwork();
  const telecom = runConnectorScenario();
  if (industrialNetwork.state !== 'COMPLETE') {
    throw new Error('SIMULATION_INCOMPLETE');
  }

  // Detach the connector catalog, which the existing simulator exports by reference.
  return JSON.parse(JSON.stringify({
    system: 'SHEIKHA_FOUNDRY_TELECOM_LOCAL_INTEGRATION_V1',
    mode: 'SIMULATION_ONLY',
    status: 'LOCAL_SIMULATION_COMPLETED',
    industrialNetwork,
    telecom,
    boundaries: {
      physicalCommandSent: false,
      networkAccessPerformed: false,
      modelInferencePerformed: false,
      persistentStateWritten: false,
      productionReady: false,
      hardwareConnection: 'NOT_TESTED',
      internetConnectivity: 'NOT_TESTED',
      aiInference: 'NOT_TESTED'
    }
  }));
}

module.exports = { simulateFoundryTelecom };
