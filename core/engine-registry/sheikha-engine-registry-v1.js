'use strict';

const {
  buildSafeOptionalEngineContract
} = require('../optional-engine-contract-fabric/sheikha-optional-engine-data-contracts-v14');

const registry = new Map();

function createSafeOptionalEngine(name, reason = 'OPTIONAL_NOT_REGISTERED') {
  return buildSafeOptionalEngineContract(name, reason);
}


function registerEngine(name, factory, metadata = {}) {
  if (!name || typeof name !== 'string') {
    throw new Error('ENGINE_NAME_REQUIRED');
  }

  if (typeof factory !== 'function') {
    throw new Error(`ENGINE_FACTORY_REQUIRED:${name}`);
  }

  const record = {
    name,
    factory,
    metadata,
    status: 'REGISTERED',
    registeredAt: new Date().toISOString()
  };

  registry.set(name, record);
  return record;
}

function hasEngine(name) {
  return registry.has(name);
}

function resolveEngine(name, options = {}) {
  if (!registry.has(name)) {
    return {
      system: 'SHEIKHA_ENGINE_REGISTRY_V1',
      status: 'OPTIONAL_NOT_REGISTERED',
      name,
      required: options.required === true,
      safe: true,
      message: `Engine ${name} is not registered`,
      instance: createSafeOptionalEngine(name, 'OPTIONAL_NOT_REGISTERED')
    };
  }

  try {
    const record = registry.get(name);
    const instance = record.factory();

    return {
      system: 'SHEIKHA_ENGINE_REGISTRY_V1',
      status: 'RESOLVED',
      name,
      instance,
      metadata: record.metadata,
      safe: true
    };
  } catch (error) {
    return {
      system: 'SHEIKHA_ENGINE_REGISTRY_V1',
      status: 'OPTIONAL_FAILED',
      name,
      error: error.message,
      safe: true,
      instance: createSafeOptionalEngine(name, 'OPTIONAL_FAILED')
    };
  }
}

function listEngines() {
  return {
    system: 'SHEIKHA_ENGINE_REGISTRY_V1',
    status: 'ACTIVE',
    count: registry.size,
    engines: [...registry.values()].map(({ factory, ...record }) => record)
  };
}

function clearEngines() {
  registry.clear();
}

module.exports = {
  registerEngine,
  hasEngine,
  resolveEngine,
  listEngines,
  clearEngines,
  createSafeOptionalEngine
};
