'use strict';

const crypto = require('node:crypto');
const {
  ExternalEd25519Signer, RedisAppendOnlyAuditLog, RedisAtomicNonceStore, productionReadiness
} = require('../core/governance/sheikha-distributed-governance-production-v1');

class FakeRedis {
  constructor() { this.values = new Map(); this.stream = []; }
  async set(key, value, options = {}) {
    if (options.NX && this.values.has(key)) return null;
    this.values.set(key, value);
    return 'OK';
  }
  async get(key) { return this.values.get(key) || null; }
  async eval(_script, {keys, arguments: args}) {
    const current = this.values.get(keys[0]) || args[0];
    if (current !== args[0]) return 0;
    this.stream.push(args[1]);
    this.values.set(keys[0], args[2]);
    return 1;
  }
}

describe('Sheikha distributed governance production V1', () => {
  test('uses an external signer and never stores an application private key', async () => {
    const {privateKey, publicKey} = crypto.generateKeyPairSync('ed25519');
    const signer = new ExternalEd25519Signer({
      provider: 'EPHEMERAL_TEST_HSM', keyId: 'test-key', publicKey,
      sign: async (message) => crypto.sign(null, message, privateKey)
    });
    const signature = await signer.sign('bounded-message');
    expect(crypto.verify(null, Buffer.from('bounded-message'), publicKey, signature)).toBe(true);
    expect(signer.metadata()).toMatchObject({algorithm: 'Ed25519', privateKeyResidentInApplication: false});
    expect(Object.hasOwn(signer, 'privateKey')).toBe(false);
  });

  test('consumes a nonce atomically once across store instances', async () => {
    const redis = new FakeRedis();
    const first = new RedisAtomicNonceStore({client: redis});
    const second = new RedisAtomicNonceStore({client: redis});
    const results = await Promise.all([first.consume('nonce-1'), second.consume('nonce-1')]);
    expect(results.sort()).toEqual([false, true]);
  });

  test('atomically appends a SHA-256-linked audit stream', async () => {
    const redis = new FakeRedis();
    const log = new RedisAppendOnlyAuditLog({client: redis, clock: () => Date.parse('2026-09-01T00:00:00Z')});
    const first = await log.append('DECISION', {id: 'd1'});
    const second = await log.append('EXECUTION', {id: 'e1'});
    expect(first.previousHash).toBe('GENESIS');
    expect(second.previousHash).toBe(first.eventHash);
    expect(redis.stream).toHaveLength(2);
  });

  test('fails production readiness until TLS and WORM export are proven', () => {
    const {privateKey, publicKey} = crypto.generateKeyPairSync('ed25519');
    const redis = new FakeRedis();
    const signer = new ExternalEd25519Signer({provider: 'TEST', keyId: 'k1', publicKey, sign: async (message) => crypto.sign(null, message, privateKey)});
    const nonceStore = new RedisAtomicNonceStore({client: redis});
    const auditLog = new RedisAppendOnlyAuditLog({client: redis});
    expect(productionReadiness({signer, nonceStore, auditLog, redisTls: false, externalWormExport: false})).toMatchObject({
      ready: false,
      blockers: ['redisTls', 'externalWormAuditExport']
    });
    expect(productionReadiness({signer, nonceStore, auditLog, redisTls: true, externalWormExport: true}).ready).toBe(true);
  });
});
