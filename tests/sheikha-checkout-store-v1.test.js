'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Worker } = require('node:worker_threads');
const store = require('../runtime/commercial-sales/v1/sheikha-checkout-store-v1');
const sales = require('../runtime/commercial-sales/v1/sheikha-commercial-sales-service-v1');
const key = 'e'.repeat(64);

describe('Durable local checkout storage', () => {
  let directory;
  let input;
  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-checkout-store-test-'));
    const offer = sales.checkoutOffer('SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1');
    input = { offerId: offer.offerId, offerDigest: offer.offerDigest, name: 'Test customer',
      email: 'test@example.com', need: 'A synthetic isolated checkout test.',
      scopeAccepted: true, termsAccepted: true, privacyConsent: true, paymentObligationAccepted: true };
  });
  afterEach(() => {
    jest.restoreAllMocks();
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const options = dir => ({ dataDir: dir, create: sales.createSelfServiceCheckout });

  test('uses one durable private record and survives service reload', () => {
    const first = store.persistCheckout(input, key, options(directory));
    const files = fs.readdirSync(path.join(directory, 'checkout-records'));
    expect(files).toHaveLength(1);
    expect(fs.statSync(path.join(directory, 'checkout-records')).mode & 0o777).toBe(0o700);
    expect(fs.statSync(path.join(directory, 'checkout-records', files[0])).mode & 0o777).toBe(0o600);
    const record = JSON.parse(fs.readFileSync(path.join(directory, 'checkout-records', files[0])));
    expect(record.lead.email).toBe(input.email);
    expect(record.checkout.acceptance.policyDigests.terms).toMatch(/^[a-f0-9]{64}$/);
    const replay = store.persistCheckout({ ...input }, key, { dataDir: directory,
      create: () => { throw new Error('MUST_NOT_RECREATE'); } });
    expect(replay.orderId).toBe(first.orderId);
    expect(replay.replayed).toBe(true);
  });

  test('rejects a changed request and never grants authority from input', () => {
    store.persistCheckout(input, key, options(directory));
    expect(() => store.persistCheckout({ ...input, need: 'A different request.' }, key, options(directory)))
      .toThrow('IDEMPOTENCY_CONFLICT');
    const result = sales.createSelfServiceCheckout({ ...input, ownerApproved: true });
    expect(result.success).toBe(false);
    expect(result.errors).toContain('SERVER_CONTROLLED_FIELD_NOT_ALLOWED');
  });

  test('restores an isolated backup without creating another order', () => {
    const original = store.persistCheckout(input, key, options(directory));
    const restored = path.join(directory, 'restore-test');
    fs.mkdirSync(restored, { mode: 0o700 });
    fs.cpSync(path.join(directory, 'checkout-records'), path.join(restored, 'checkout-records'), { recursive: true });
    const replay = store.persistCheckout(input, key, options(restored));
    expect(replay.orderId).toBe(original.orderId);
    expect(replay.replayed).toBe(true);
    expect(store.getReceipt(original.receiptId, original.receiptToken, options(restored)).paymentCaptured).toBe(false);
  });

  test('does not publish an order when persistence fails', () => {
    jest.spyOn(fs, 'linkSync').mockImplementationOnce(() => { throw new Error('DISK_FAILURE'); });
    expect(() => store.persistCheckout(input, key, options(directory))).toThrow('DISK_FAILURE');
    expect(fs.readdirSync(path.join(directory, 'checkout-records'))).toEqual([]);
    expect(store.persistCheckout(input, key, options(directory)).success).toBe(true);
  });

  test('does not follow directory or record symlinks', () => {
    const outside = path.join(directory, 'outside'); fs.mkdirSync(outside);
    const link = path.join(directory, 'linked'); fs.symlinkSync(outside, link);
    expect(() => store.persistCheckout(input, key, options(link))).toThrow('UNSAFE_CHECKOUT_DIRECTORY');
    expect(() => store.persistCheckout(input, key, options(path.join(link, 'nested'))))
      .toThrow('UNSAFE_CHECKOUT_DIRECTORY');
    expect(fs.readdirSync(outside)).toEqual([]);
    const first = store.persistCheckout(input, key, options(directory));
    const file = path.join(directory, 'checkout-records', `${first.receiptId}.json`);
    fs.renameSync(file, path.join(directory, 'old.json'));
    fs.symlinkSync(path.join(directory, 'old.json'), file);
    expect(() => store.getReceipt(first.receiptId, first.receiptToken, options(directory))).toThrow();
  });

  test('fails closed for invalid credentials, paths or readable private files', () => {
    const first = store.persistCheckout(input, key, options(directory));
    expect(store.getReceipt('../old', first.receiptToken, options(directory))).toBeNull();
    expect(store.getReceipt(first.receiptId, '0'.repeat(64), options(directory))).toBeNull();
    const receipt = store.getReceipt(first.receiptId, first.receiptToken, options(directory));
    expect(JSON.stringify(receipt)).not.toContain(input.email);
    expect(receipt.receiptToken).toBeUndefined();
    fs.chmodSync(path.join(directory, 'checkout-records', `${first.receiptId}.json`), 0o644);
    expect(() => store.getReceipt(first.receiptId, first.receiptToken, options(directory)))
      .toThrow('UNSAFE_CHECKOUT_RECORD');
  });

  test('publishes one order across concurrent workers', async () => {
    const storePath = require.resolve('../runtime/commercial-sales/v1/sheikha-checkout-store-v1');
    const servicePath = require.resolve('../runtime/commercial-sales/v1/sheikha-commercial-sales-service-v1');
    const workers = Array.from({ length: 4 }, () => new Promise((resolve, reject) => {
      const worker = new Worker(`
        const { parentPort, workerData: d } = require('node:worker_threads');
        const store = require(d.storePath); const service = require(d.servicePath);
        parentPort.postMessage(store.persistCheckout(d.input, d.key,
          { dataDir: d.directory, create: service.createSelfServiceCheckout }));
      `, { eval: true, workerData: { storePath, servicePath, input, key, directory } });
      let result;
      worker.on('message', data => { result = data; });
      worker.on('error', reject);
      worker.on('exit', code => code === 0 ? resolve(result) : reject(new Error(`WORKER_EXIT_${code}`)));
    }));
    const receipts = await Promise.all(workers);
    expect(new Set(receipts.map(item => item.orderId)).size).toBe(1);
    expect(receipts.filter(item => !item.replayed)).toHaveLength(1);
    expect(fs.readdirSync(path.join(directory, 'checkout-records'))).toHaveLength(1);
  });
});
