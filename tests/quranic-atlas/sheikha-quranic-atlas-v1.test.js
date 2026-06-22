const { loadQuranicAtlas } = require('../../runtime/quranic-atlas/sheikha-quranic-atlas-runtime');

describe('Sheikha Quranic Architectural Atlas V1', () => {
  test('loads active atlas with core layers', () => {
    const atlas = loadQuranicAtlas();

    expect(atlas.status).toBe('ACTIVE');
    expect(atlas.layers.length).toBeGreaterThanOrEqual(10);
    expect(atlas.layers.find((x) => x.name === 'UNIVERSAL_HEART')).toBeTruthy();
    expect(atlas.layers.find((x) => x.name === 'COSMIC_AORTA')).toBeTruthy();
    expect(atlas.layers.find((x) => x.name === 'GLOBAL_WATEEN')).toBeTruthy();
  });
});
