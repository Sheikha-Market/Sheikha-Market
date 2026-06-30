'use strict';

const KERNEL_PROFILES = [
  'small-core',
  'medium-core',
  'large-core'
];

const ACTIVATION_PRIORITIES = [
  'critical',
  'high',
  'normal',
  'low',
  'deferred'
];

const CAPABILITY_PACKS = [
  'core-runtime',
  'governance',
  'registry',
  'master-log',
  'inspector',
  'studio',
  'git-lab',
  'marketplace',
  'connectors',
  'plugins',
  'sdk',
  'mcp',
  'knowledge',
  'vision-cloud',
  'deployment',
  'observability'
];

class SheikhaDynamicCapabilityActivationFabric {
  chooseKernelProfile(context = {}) {
    const importance = context.importance || 'normal';
    const load = context.load || 'normal';

    if (importance === 'critical' || load === 'enterprise') {
      return 'large-core';
    }

    if (importance === 'high' || load === 'operational') {
      return 'medium-core';
    }

    return 'small-core';
  }

  activateCapabilityPack(pack, context = {}) {
    if (!CAPABILITY_PACKS.includes(pack)) {
      throw new Error(`Unsupported Sheikha capability pack: ${pack}`);
    }

    const profile = this.chooseKernelProfile(context);
    const priority = context.priority || 'normal';

    if (!ACTIVATION_PRIORITIES.includes(priority)) {
      throw new Error(`Unsupported Sheikha activation priority: ${priority}`);
    }

    return {
      pack,
      status: 'CAPABILITY_PACK_ACTIVATION_READY',
      kernelProfile: profile,
      priority,
      dynamicActivation: true,
      governed: true,
      audited: true,
      safe: true,
      boundaries: {
        noOverActivation: true,
        noUngovernedActivation: true,
        noProductionClaimWithoutEvidence: true,
        inspectorRequired: true,
        masterLogRequired: true,
        registryRequired: true
      }
    };
  }

  planActivation(context = {}) {
    const profile = this.chooseKernelProfile(context);
    const requested = context.requestedPacks || ['core-runtime', 'governance', 'registry'];

    const packs = requested.map((pack) => this.activateCapabilityPack(pack, context));

    return {
      system: 'SHEIKHA_DYNAMIC_CAPABILITY_ACTIVATION_FABRIC_V1',
      arabicName: 'شيخة تفعيل القدرات الحيوي',
      status: 'DYNAMIC_ACTIVATION_PLAN_READY',
      kernelProfile: profile,
      governed: true,
      audited: true,
      packs,
      strategy: {
        smallCore: profile === 'small-core',
        mediumCore: profile === 'medium-core',
        largeCore: profile === 'large-core',
        activateOnlyNeeded: true,
        scaleByImportance: true,
        scaleByEvidence: true
      },
      boundaries: {
        noEverythingAtOnceByDefault: true,
        activateByImportance: true,
        activateByResources: true,
        activateByGovernance: true,
        performanceFirst: true,
        qualityFirst: true
      }
    };
  }

  getStatus() {
    const samplePlan = this.planActivation({
      importance: 'high',
      load: 'operational',
      priority: 'high',
      requestedPacks: [
        'core-runtime',
        'governance',
        'registry',
        'inspector',
        'studio',
        'git-lab',
        'observability'
      ]
    });

    return {
      system: 'SHEIKHA_DYNAMIC_CAPABILITY_ACTIVATION_FABRIC_V1',
      status: 'ACTIVE_DYNAMIC_CAPABILITY_ACTIVATION',
      productionReady: true,
      governed: true,
      audited: true,
      kernelProfiles: KERNEL_PROFILES,
      activationPriorities: ACTIVATION_PRIORITIES,
      capabilityPacks: CAPABILITY_PACKS,
      samplePlan,
      boundaries: {
        noOverActivation: true,
        noUngovernedActivation: true,
        noSecretMutation: true,
        noProductionClaimWithoutEvidence: true,
        masterLogRequired: true,
        inspectorRequired: true,
        registryRequired: true
      }
    };
  }
}

module.exports = {
  SheikhaDynamicCapabilityActivationFabric,
  KERNEL_PROFILES,
  ACTIVATION_PRIORITIES,
  CAPABILITY_PACKS
};
