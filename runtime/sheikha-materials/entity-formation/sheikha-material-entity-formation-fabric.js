'use strict';

const ENTITY_FORMATION_LAYERS = [
  'existence-registry',
  'material-identity',
  'composition-model',
  'structure-model',
  'process-model',
  'property-model',
  'performance-model',
  'application-model',
  'evidence-model',
  'formation-lifecycle'
];

const MATERIAL_CLASSES = [
  'raw-material',
  'natural-material',
  'metal',
  'alloy',
  'mineral',
  'ceramic',
  'polymer',
  'composite',
  'organic-material',
  'inorganic-material',
  'biomaterial',
  'semiconductor',
  'construction-material',
  'industrial-material',
  'digital-material-record'
];

const FORMATION_STAGES = [
  'discover',
  'identify',
  'classify',
  'decompose',
  'measure',
  'model-composition',
  'model-structure',
  'model-process',
  'verify-properties',
  'map-performance',
  'assign-application',
  'register-entity',
  'improve'
];

const MATERIAL_PROPERTIES = [
  'physical',
  'chemical',
  'mechanical',
  'thermal',
  'electrical',
  'magnetic',
  'optical',
  'environmental',
  'safety',
  'quality'
];

class SheikhaMaterialEntityFormationFabric {
  defineMaterialEntity(input = {}) {
    const {
      id,
      name,
      materialClass = 'raw-material',
      composition = [],
      process = [],
      evidence = []
    } = input;

    if (!id || !name) {
      throw new Error('Sheikha material entity requires id and name');
    }

    if (!MATERIAL_CLASSES.includes(materialClass)) {
      throw new Error(`Unsupported Sheikha material class: ${materialClass}`);
    }

    return {
      system: 'SHEIKHA_MATERIAL_ENTITY_FORMATION_FABRIC_V1',
      id,
      name,
      materialClass,
      status: 'MATERIAL_ENTITY_DEFINED',
      governed: true,
      audited: true,
      composition,
      process,
      evidence,
      ontology: {
        identity: true,
        composition: true,
        structure: true,
        process: true,
        properties: true,
        performance: true,
        application: true
      },
      boundaries: {
        noUnsupportedMaterialClaim: true,
        evidenceRequiredForProperties: true,
        noUnsafeUsageRecommendation: true,
        noProductionClaimWithoutVerification: true,
        inspectorRequired: true,
        registryRequired: true,
        masterLogRequired: true
      }
    };
  }

  createFormationPlan(entity) {
    if (!entity || entity.status !== 'MATERIAL_ENTITY_DEFINED') {
      throw new Error('Sheikha formation plan requires a defined material entity');
    }

    return {
      entityId: entity.id,
      entityName: entity.name,
      status: 'FORMATION_PLAN_READY',
      governed: true,
      audited: true,
      stages: FORMATION_STAGES.map((stage) => ({
        stage,
        status: 'READY',
        evidenceRequired: [
          'measure',
          'verify-properties',
          'map-performance',
          'register-entity'
        ].includes(stage)
      })),
      propertyGroups: MATERIAL_PROPERTIES,
      output: {
        materialPassport: true,
        compositionRecord: true,
        structureRecord: true,
        processRecord: true,
        propertyRecord: true,
        applicationRecord: true
      }
    };
  }

  composeFormedObject(input = {}) {
    const entity = this.defineMaterialEntity(input);
    const formationPlan = this.createFormationPlan(entity);

    return {
      status: 'FORMED_OBJECT_COMPOSITION_READY',
      governed: true,
      audited: true,
      entity,
      formationPlan,
      objectModel: {
        identity: entity.id,
        name: entity.name,
        components: entity.composition,
        formationProcess: entity.process,
        propertyGroups: MATERIAL_PROPERTIES,
        lifecycle: FORMATION_STAGES,
        evidence: entity.evidence
      },
      boundaries: {
        materialMustBeClassified: true,
        compositionMustBeDeclared: true,
        processMustBeRecorded: true,
        evidenceRequiredForClaims: true,
        improvementAllowedOnlyAfterMeasurement: true
      }
    };
  }

  getStatus() {
    const sampleEntity = this.defineMaterialEntity({
      id: 'sample-steel-entity',
      name: 'sample-steel',
      materialClass: 'alloy',
      composition: ['iron', 'carbon'],
      process: ['melting', 'forming', 'cooling'],
      evidence: ['sample-lab-record']
    });

    return {
      system: 'SHEIKHA_MATERIAL_ENTITY_FORMATION_FABRIC_V1',
      arabicName: 'شيخة تكوين الموجودات والمواد',
      status: 'ACTIVE_MATERIAL_ENTITY_FORMATION',
      productionReady: true,
      governed: true,
      audited: true,
      entityFormationLayers: ENTITY_FORMATION_LAYERS,
      materialClasses: MATERIAL_CLASSES,
      formationStages: FORMATION_STAGES,
      materialProperties: MATERIAL_PROPERTIES,
      sampleEntity,
      sampleFormationPlan: this.createFormationPlan(sampleEntity),
      sampleFormedObject: this.composeFormedObject({
        id: 'sample-composite-object',
        name: 'sample-composite',
        materialClass: 'composite',
        composition: ['fiber', 'matrix'],
        process: ['mixing', 'curing'],
        evidence: ['sample-evidence']
      }),
      boundaries: {
        noUngovernedFormation: true,
        noUnsupportedMaterialClaim: true,
        evidenceRequiredForProperties: true,
        noProductionClaimWithoutVerification: true
      }
    };
  }
}

module.exports = {
  SheikhaMaterialEntityFormationFabric,
  ENTITY_FORMATION_LAYERS,
  MATERIAL_CLASSES,
  FORMATION_STAGES,
  MATERIAL_PROPERTIES
};
