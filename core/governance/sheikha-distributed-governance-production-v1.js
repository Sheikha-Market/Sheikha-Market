'use strict';

const crypto = require('node:crypto');

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

class ExternalEd25519Signer {
  constructor({provider, keyId, publicKey, sign}) {
    if (!provider || !keyId || !publicKey || typeof sign !== 'function') throw new Error('EXTERNAL_SIGNER_CONFIGURATION_REQUIRED');
    this.provider = provider;
    this.keyId = keyId;
    this.publicKey = publicKey;
    this.signExternally = sign;
    Object.freeze(this);
  }
  async sign(message) {
    const signature = await this.signExternally(Buffer.from(message));
    if (!Buffer.isBuffer(signature) || !crypto.verify(null, Buffer.from(message), this.publicKey, signature)) {
      throw new Error('EXTERNAL_SIGNATURE_VERIFICATION_FAILED');
    }
    return signature;
  }
  metadata() {
    return {provider: this.provider, keyId: this.keyId, algorithm: 'Ed25519', privateKeyResidentInApplication: false};
  }
}

class RedisAtomicNonceStore {
  constructor({client, namespace = 'sheikha:governance:v1', ttlSeconds = 300}) {
    if (!client || typeof client.set !== 'function') throw new Error('REDIS_CLIENT_REQUIRED');
    this.client = client;
    this.namespace = namespace;
    this.ttlSeconds = ttlSeconds;
  }
  async consume(nonce) {
    if (!nonce) return false;
    const result = await this.client.set(`${this.namespace}:nonce:${nonce}`, 'CONSUMED', {NX: true, EX: this.ttlSeconds});
    return result === 'OK';
  }
}

const APPEND_SCRIPT = `
local current = redis.call('GET', KEYS[1])
if not current then current = ARGV[1] end
if current ~= ARGV[1] then return 0 end
redis.call('XADD', KEYS[2], '*', 'event', ARGV[2])
redis.call('SET', KEYS[1], ARGV[3])
return 1
`;

class RedisAppendOnlyAuditLog {
  constructor({client, namespace = 'sheikha:governance:v1', clock = Date.now, maxRetries = 8}) {
    if (!client || typeof client.get !== 'function' || typeof client.eval !== 'function') throw new Error('REDIS_CLIENT_WITH_EVAL_REQUIRED');
    this.client = client;
    this.headKey = `${namespace}:audit:head`;
    this.streamKey = `${namespace}:audit:events`;
    this.clock = clock;
    this.maxRetries = maxRetries;
  }
  async append(type, data) {
    for (let attempt = 0; attempt < this.maxRetries; attempt += 1) {
      const currentRaw = await this.client.get(this.headKey);
      const current = currentRaw ? JSON.parse(currentRaw) : {sequence: 0, hash: 'GENESIS'};
      const event = {
        sequence: current.sequence + 1,
        timestamp: new Date(this.clock()).toISOString(),
        type,
        data,
        previousHash: current.hash
      };
      event.eventHash = crypto.createHash('sha256').update(canonical(event)).digest('hex');
      const nextHead = JSON.stringify({sequence: event.sequence, hash: event.eventHash});
      const appended = await this.client.eval(APPEND_SCRIPT, {
        keys: [this.headKey, this.streamKey],
        arguments: [currentRaw || JSON.stringify(current), JSON.stringify(event), nextHead]
      });
      if (Number(appended) === 1) return event;
    }
    throw new Error('AUDIT_APPEND_CONTENTION_LIMIT_EXCEEDED');
  }
}

function productionReadiness({signer, nonceStore, auditLog, redisTls, externalWormExport}) {
  const checks = {
    externalEd25519Signer: signer instanceof ExternalEd25519Signer,
    privateKeyOutsideApplication: signer?.metadata?.().privateKeyResidentInApplication === false,
    atomicDistributedNonceStore: nonceStore instanceof RedisAtomicNonceStore,
    atomicDistributedAuditAppend: auditLog instanceof RedisAppendOnlyAuditLog,
    redisTls: redisTls === true,
    externalWormAuditExport: externalWormExport === true
  };
  return {
    checks,
    ready: Object.values(checks).every(Boolean),
    blockers: Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name)
  };
}

module.exports = {
  APPEND_SCRIPT,
  ExternalEd25519Signer,
  RedisAppendOnlyAuditLog,
  RedisAtomicNonceStore,
  canonical,
  productionReadiness
};
