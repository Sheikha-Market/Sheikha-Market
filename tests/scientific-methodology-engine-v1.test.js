'use strict';

const {
  getScientificMethodologyEngine,
  runMethodologyPipeline
} = require('../core/scientific-methodology/scientific-methodology-engine');

describe('Sheikha Scientific Methodology Engine V1', () => {
  test('engine is active and governed', () => {
    const engine = getScientificMethodologyEngine();

    expect(engine.system).toBe('SHEIKHA_SCIENTIFIC_METHODOLOGY_ENGINE_V1');
    expect(engine.status).toBe('ACTIVE');
    expect(engine.productionLine).toContain('read');
    expect(engine.productionLine).toContain('analyze');
    expect(engine.productionLine).toContain('record');
    expect(engine.productionLine).toContain('computational-learn');
    expect(engine.productionLine).toContain('monitor');
    expect(engine.productionLine).toContain('measure');
    expect(engine.productionLine).toContain('transfer-knowledge');
    expect(engine.productionLine).toContain('renew-science');
    expect(engine.principles).toContain('quran-and-sunnah-reference');
    expect(engine.productionLine).toContain('improve');
    expect(engine.productionLine).toContain('propose-methodology');
  });

  test('pipeline reads analyzes records and recommends improvement', () => {
    const result = runMethodologyPipeline({
      domain: 'commerce',
      text: 'Build a scientific method for commerce evaluation with evidence, measurement, validation, Quran and Sunnah reference.'
    });

    expect(result.status).toBe('RECORDED');
    expect(result.domain).toBe('commerce');
    expect(result.record.evidenceScore).toBeGreaterThanOrEqual(60);
    expect(result.steps).toContain('map-methodology');
    expect(result.record.quranSunnahReference).toBe(true);
    expect(result.record.monitoringStatus).toBe('ACTIVE');
    expect(result.record.measurementStatus).toBe('ACTIVE');
    expect(result.record.knowledgeTransferStatus).toBe('READY');
    expect(result.record.scienceRenewalStatus).toBe('CONTROLLED_PROPOSAL_ONLY');
  });
});
