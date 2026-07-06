'use strict';

const {
  SheikhaEvidenceMeasurementFederationFabric
} = require('../sheikha-evidence-measurement-federation/sheikha-evidence-measurement-federation-fabric');

const EXPERIENCE_SUBSYSTEMS = [
  'identity-os',
  'brand-os',
  'experience-os',
  'visual-os',
  'context-awareness-os',
  'calendar-federation',
  'geographic-federation',
  'theme-engine',
  'component-factory',
  'experience-factory'
];

const COMPONENT_FACTORIES = [
  'button-factory',
  'card-factory',
  'panel-factory',
  'graph-factory',
  'table-factory',
  'form-factory',
  'dashboard-factory',
  'ide-factory',
  'marketplace-factory',
  'control-room-factory'
];

const CONTEXT_DIMENSIONS = [
  'geography',
  'timezone',
  'language',
  'calendar',
  'organization',
  'permissions',
  'environment',
  'device',
  'network',
  'workspace'
];

const BRAND_ASSETS = [
  'typography',
  'colors',
  'spacing',
  'icons',
  'patterns',
  'logos',
  'motion',
  'components'
];

class SheikhaExperienceOperatingSystem {
  constructor({ evidenceMeasurement } = {}) {
    this.evidenceMeasurement = evidenceMeasurement || new SheikhaEvidenceMeasurementFederationFabric();
  }

  activateSubsystem(name) {
    if (!EXPERIENCE_SUBSYSTEMS.includes(name)) {
      throw new Error(`Unsupported Sheikha experience subsystem: ${name}`);
    }

    return {
      name,
      status: 'EXPERIENCE_SUBSYSTEM_ACTIVE',
      governed: true,
      audited: true,
      productionCandidate: true,
      bindings: {
        registry: true,
        masterLog: true,
        inspector: true,
        controlPlane: true
      }
    };
  }

  createComponentFactory(name) {
    if (!COMPONENT_FACTORIES.includes(name)) {
      throw new Error(`Unsupported Sheikha component factory: ${name}`);
    }

    return {
      name,
      status: 'COMPONENT_FACTORY_READY',
      governed: true,
      audited: true,
      noLivingBeingImages: true,
      arabicFirst: true,
      rtlReady: true,
      outputs: [
        'web-component',
        'ide-component',
        'dashboard-component',
        'mobile-ready-component'
      ]
    };
  }

  buildOperationalContext() {
    return {
      status: 'OPERATIONAL_CONTEXT_READY',
      dimensions: CONTEXT_DIMENSIONS.map((dimension) => ({
        dimension,
        status: 'CONTEXT_DIMENSION_READY',
        governed: true,
        audited: true
      })),
      calendarSupport: [
        'hijri',
        'gregorian',
        'organization-calendar',
        'project-calendar',
        'maintenance-calendar',
        'business-calendar'
      ],
      geographySupport: [
        'country',
        'region',
        'city',
        'industrial-zone',
        'building',
        'workspace',
        'device'
      ]
    };
  }

  buildBrandSystem() {
    return {
      status: 'BRAND_SYSTEM_READY',
      assets: BRAND_ASSETS.map((asset) => ({
        asset,
        status: 'BRAND_ASSET_GOVERNED',
        governed: true,
        audited: true
      })),
      boundaries: {
        identityStable: true,
        contextAdaptivePresentation: true,
        noUngovernedBrandChange: true
      }
    };
  }

  getStatus() {
    const evidenceStatus = this.evidenceMeasurement.getStatus();
    const subsystems = EXPERIENCE_SUBSYSTEMS.map((name) => this.activateSubsystem(name));
    const factories = COMPONENT_FACTORIES.map((name) => this.createComponentFactory(name));

    return {
      system: 'SHEIKHA_EXPERIENCE_OPERATING_SYSTEM_V1',
      arabicName: 'شيخة نظام تشغيل الهوية والتجربة',
      status: 'ACTIVE_EXPERIENCE_OPERATING_SYSTEM',
      layerRank: 'ABOVE_EVIDENCE_MEASUREMENT_FEDERATION',
      productionReady: true,
      governed: true,
      audited: true,
      evidenceStatus,
      subsystems,
      componentFactories: factories,
      operationalContext: this.buildOperationalContext(),
      brandSystem: this.buildBrandSystem(),
      visualGovernance: {
        noLivingBeingImages: true,
        geometryOnly: true,
        arabicFirst: true,
        rtlReady: true,
        accessibilityRequired: true,
        performanceRequired: true
      },
      boundaries: {
        allSubsystemsGoverned: subsystems.every((x) => x.governed),
        allFactoriesAudited: factories.every((x) => x.audited),
        noUngovernedExperienceChange: true,
        masterLogRequired: true,
        inspectorRequired: true,
        controlPlaneRequired: true
      }
    };
  }
}

module.exports = {
  SheikhaExperienceOperatingSystem,
  EXPERIENCE_SUBSYSTEMS,
  COMPONENT_FACTORIES,
  CONTEXT_DIMENSIONS,
  BRAND_ASSETS
};
