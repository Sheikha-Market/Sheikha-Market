const {
  createTechnologyRadar
} = require('../../runtime/technology-radar/sheikha-technology-radar-engine');

describe('Sheikha Technology Radar Engine V1', () => {
  test('creates technology radar plan', () => {
    const radar = createTechnologyRadar();

    expect(radar.status).toBe('ACTIVE');
    expect(radar.watchedTechnologies).toContain('nodejs');
    expect(radar.watchedTechnologies).toContain('lsp');
    expect(radar.outputs).toContain('rollback-plan');
  });
});
