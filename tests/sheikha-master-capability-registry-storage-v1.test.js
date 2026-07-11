'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(
  ROOT,
  'runtime/master-activation/sheikha-master-capability-registry-v1.json'
);
const MAX_INDEX_BYTES = 4 * 1024 * 1024;
const MAX_SHARD_BYTES = 3 * 1024 * 1024;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

describe('Sheikha master capability registry sharded storage V1', () => {
  test('keeps the editor-facing index compact and the shard chain complete', () => {
    const index = readJson(INDEX_PATH);
    const descriptors = index.storage.shards;
    const seenIds = new Set();
    let componentCount = 0;

    expect(index.status).toBe('ACTIVE_SHARDED_INDEX');
    expect(index.storage.format).toBe('SHARDED_JSON_V1');
    expect(index.storage.fullComponentRecordsInShards).toBe(true);
    expect(fs.statSync(INDEX_PATH).size).toBeLessThan(MAX_INDEX_BYTES);
    expect(index.components).toHaveLength(index.componentCount);
    expect(descriptors).toHaveLength(index.storage.shardCount);

    for (const descriptor of descriptors) {
      const shardPath = path.join(ROOT, descriptor.path);
      const shardText = fs.readFileSync(shardPath, 'utf8');
      const shard = JSON.parse(shardText);

      expect(fs.statSync(shardPath).size).toBeLessThan(MAX_SHARD_BYTES);
      expect(Buffer.byteLength(shardText, 'utf8')).toBe(descriptor.bytes);
      expect(crypto.createHash('sha256').update(shardText, 'utf8').digest('hex'))
        .toBe(descriptor.sha256);
      expect(shard.components).toHaveLength(descriptor.componentCount);

      componentCount += shard.components.length;
      for (const component of shard.components) {
        expect(seenIds.has(component.id)).toBe(false);
        seenIds.add(component.id);
      }
    }

    const digestChain = crypto
      .createHash('sha256')
      .update(descriptors.map((descriptor) => descriptor.sha256).join('\n'), 'utf8')
      .digest('hex');
    expect(componentCount).toBe(index.componentCount);
    expect(seenIds.size).toBe(index.componentCount);
    expect(digestChain).toBe(index.storage.shardDigestChainSha256);
  });

  test('does not leak server routes into unrelated capability records', () => {
    const index = readJson(INDEX_PATH);
    const reference = index.components.find((component) => component.path === '.claude/config.json');
    expect(reference).toBeDefined();

    const shard = readJson(path.join(ROOT, reference.shard));
    const component = shard.components.find((item) => item.id === reference.id);
    expect(component).toBeDefined();
    expect(component.apis).toEqual([]);
  });
});
