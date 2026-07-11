'use strict';

const {
  createCapabilityRegistryReader,
  safeResolve
} = require('../tools/capability-registry/sheikha-master-capability-index-v1');

describe('Sheikha master capability registry query V1', () => {
  test('loads a full capability through the verified compressed shard', () => {
    const reader = createCapabilityRegistryReader();
    const capability = reader.getByPath('.claude/config.json');

    expect(capability).toMatchObject({
      path: '.claude/config.json',
      evidence: { source: 'local-repository-discovery' }
    });
    expect(capability.apis).toEqual([]);
    expect(reader.stats()).toMatchObject({
      status: 'ACTIVE_SHARDED_INDEX',
      componentCount: reader.index.componentCount,
      storageFormat: 'SHARDED_JSON_V1',
      loadedShardCount: 1,
      githubRequired: false
    });
  });

  test('searches the compact index without loading every shard', () => {
    const reader = createCapabilityRegistryReader();
    const results = reader.search('arabic-semantic-encoding', { limit: 20 });

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((item) => item.path.includes('arabic-semantic-encoding'))).toBe(true);
    expect(reader.stats().loadedShardCount).toBe(0);
  });

  test('rejects paths outside the governed repository root', () => {
    expect(() => safeResolve(process.cwd(), '../../etc/passwd'))
      .toThrow('CAPABILITY_REGISTRY_PATH_OUTSIDE_ROOT');
  });
});
