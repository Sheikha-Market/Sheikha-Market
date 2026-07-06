'use strict';

const {
  SheikhaUniversalMarketSectorRuntime,
  MARKET_SECTORS,
  SECTOR_CAPABILITIES
} = require('../runtime/sheikha-marketplace/sectors/sheikha-universal-market-sector-runtime');

test('activates universal market sector runtime for all sectors', () => {
  const runtime = new SheikhaUniversalMarketSectorRuntime();
  const status = runtime.getStatus();

  expect(status.status).toBe('ACTIVE_UNIVERSAL_MARKET_SECTOR_RUNTIME');
  expect(status.layerRank).toBe('ABOVE_ADAPTER_MARKETPLACE_OPERATIONAL_RUNTIME');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.marketSectors).toEqual(MARKET_SECTORS);
  expect(status.sectorCapabilities).toEqual(SECTOR_CAPABILITIES);
  expect(status.sectors).toHaveLength(MARKET_SECTORS.length);
  expect(status.coverage.score).toBe(100);

  expect(status.boundaries.allSectorsGoverned).toBe(true);
  expect(status.boundaries.allSectorsAudited).toBe(true);
  expect(status.boundaries.allSectorsEvidenceBased).toBe(true);
});

test('activates construction commerce and AI sectors with governed bindings', () => {
  const runtime = new SheikhaUniversalMarketSectorRuntime();

  for (const sectorName of ['construction', 'commerce', 'ai-services']) {
    const sector = runtime.activateSector(sectorName);

    expect(sector.status).toBe('SECTOR_RUNTIME_READY');
    expect(sector.capabilities).toEqual(SECTOR_CAPABILITIES);
    expect(sector.dataSupport.structured).toBe(true);
    expect(sector.dataSupport.unstructured).toBe(true);
    expect(sector.bindings.capabilityRegistry).toBe(true);
    expect(sector.bindings.evidenceRegistry).toBe(true);
    expect(sector.boundaries.evidenceRequiredForDecisions).toBe(true);
  }
});

test('rejects unsupported market sector', () => {
  const runtime = new SheikhaUniversalMarketSectorRuntime();

  expect(() => runtime.activateSector('unknown-sector'))
    .toThrow('Unsupported Sheikha market sector');
});
