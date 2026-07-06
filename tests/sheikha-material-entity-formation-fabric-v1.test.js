'use strict';

const {
  SheikhaMaterialEntityFormationFabric,
  ENTITY_FORMATION_LAYERS,
  MATERIAL_CLASSES,
  FORMATION_STAGES,
  MATERIAL_PROPERTIES
} = require('../runtime/sheikha-materials/entity-formation/sheikha-material-entity-formation-fabric');

test('activates material entity formation fabric', () => {
  const fabric = new SheikhaMaterialEntityFormationFabric();
  const status = fabric.getStatus();

  expect(status.status).toBe('ACTIVE_MATERIAL_ENTITY_FORMATION');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.entityFormationLayers).toEqual(ENTITY_FORMATION_LAYERS);
  expect(status.materialClasses).toEqual(MATERIAL_CLASSES);
  expect(status.formationStages).toEqual(FORMATION_STAGES);
  expect(status.materialProperties).toEqual(MATERIAL_PROPERTIES);

  expect(status.sampleEntity.status).toBe('MATERIAL_ENTITY_DEFINED');
  expect(status.sampleFormationPlan.status).toBe('FORMATION_PLAN_READY');
  expect(status.sampleFormedObject.status).toBe('FORMED_OBJECT_COMPOSITION_READY');

  expect(status.boundaries.noUngovernedFormation).toBe(true);
  expect(status.boundaries.evidenceRequiredForProperties).toBe(true);
});

test('defines material entity with composition process and evidence', () => {
  const fabric = new SheikhaMaterialEntityFormationFabric();

  const entity = fabric.defineMaterialEntity({
    id: 'barite-api-42',
    name: 'barite-api-4.2',
    materialClass: 'mineral',
    composition: ['barium-sulfate'],
    process: ['mining', 'crushing', 'milling', 'quality-check'],
    evidence: ['api-density-record']
  });

  expect(entity.status).toBe('MATERIAL_ENTITY_DEFINED');
  expect(entity.materialClass).toBe('mineral');
  expect(entity.composition).toContain('barium-sulfate');
  expect(entity.boundaries.evidenceRequiredForProperties).toBe(true);
});

test('creates formed object composition model', () => {
  const fabric = new SheikhaMaterialEntityFormationFabric();

  const object = fabric.composeFormedObject({
    id: 'steel-pipe-001',
    name: 'steel-pipe',
    materialClass: 'industrial-material',
    composition: ['steel-alloy'],
    process: ['forming', 'welding', 'inspection'],
    evidence: ['mill-test-certificate']
  });

  expect(object.status).toBe('FORMED_OBJECT_COMPOSITION_READY');
  expect(object.objectModel.components).toContain('steel-alloy');
  expect(object.boundaries.compositionMustBeDeclared).toBe(true);
  expect(object.boundaries.evidenceRequiredForClaims).toBe(true);
});

test('rejects unsupported material entity definitions', () => {
  const fabric = new SheikhaMaterialEntityFormationFabric();

  expect(() => fabric.defineMaterialEntity({ id: 'x' }))
    .toThrow('Sheikha material entity requires id and name');

  expect(() => fabric.defineMaterialEntity({
    id: 'x',
    name: 'bad',
    materialClass: 'unknown-material'
  })).toThrow('Unsupported Sheikha material class');

  expect(() => fabric.createFormationPlan({ status: 'BAD' }))
    .toThrow('Sheikha formation plan requires a defined material entity');
});
