'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const hash = value => crypto.createHash('sha256').update(value).digest('hex');

function storeDirectory(dataDir) {
  const root = path.resolve(dataDir);
  let ancestor = path.parse(root).root;
  for (const part of root.slice(ancestor.length).split(path.sep)) {
    ancestor = path.join(ancestor, part);
    try {
      if (fs.lstatSync(ancestor).isSymbolicLink()) throw new Error('UNSAFE_CHECKOUT_DIRECTORY');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  if (fs.realpathSync(root) !== root || !fs.lstatSync(root).isDirectory()) {
    throw new Error('UNSAFE_CHECKOUT_DIRECTORY');
  }
  fs.chmodSync(root, 0o700);
  const directory = path.join(root, 'checkout-records');
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  if (fs.realpathSync(directory) !== directory || !fs.lstatSync(directory).isDirectory()) {
    throw new Error('UNSAFE_CHECKOUT_DIRECTORY');
  }
  fs.chmodSync(directory, 0o700);
  return directory;
}

function readRecord(file) {
  let fd;
  try {
    fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || (stat.mode & 0o077) !== 0 || stat.size > 65536) {
      throw new Error('UNSAFE_CHECKOUT_RECORD');
    }
    return JSON.parse(fs.readFileSync(fd, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

function receipt(record, includeCredential = false) {
  const { checkout } = record;
  return {
    success: true,
    receiptId: record.receiptId,
    ...(includeCredential ? { receiptToken: record.receiptToken } : {}),
    checkoutId: checkout.checkoutId,
    orderId: checkout.order.orderId,
    status: checkout.order.status,
    subtotalSar: checkout.quote.subtotalSar,
    vatSar: checkout.quote.vatSar,
    totalSar: checkout.quote.totalSar,
    currency: checkout.quote.currency,
    amountDueNowSar: 0,
    paymentCaptured: false,
    fulfillmentAuthorized: false,
    nextAction: checkout.payment.nextAction
  };
}

function persistCheckout(input, key, options) {
  if (typeof key !== 'string' || !/^[a-f0-9]{64}$/.test(key)) {
    throw new Error('IDEMPOTENCY_KEY_REQUIRED');
  }
  // One immutable record holds the lead, acceptance and receipt. Hard-link publication
  // is exclusive across local processes, so retries cannot publish a second order.
  const directory = storeDirectory(options.dataDir);
  const id = hash(key);
  const file = path.join(directory, `${id}.json`);
  const canonical = value => {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.keys(value).sort().map(name => [name, canonical(value[name])]));
    }
    return value;
  };
  const requestDigest = hash(JSON.stringify(canonical(input)));
  const replay = record => {
    if (record.requestDigest !== requestDigest) throw new Error('IDEMPOTENCY_CONFLICT');
    return { ...receipt(record, true), replayed: true };
  };
  const previous = readRecord(file);
  if (previous) return replay(previous);
  const result = options.create(input);
  if (!result.success) return result;
  const record = { schemaVersion: 1, receiptId: id, requestDigest,
    receiptToken: crypto.randomBytes(32).toString('hex'), lead: result.lead, checkout: result.checkout };
  const temporary = path.join(directory, `.${crypto.randomUUID()}.tmp`);
  let fd;
  try {
    fd = fs.openSync(temporary, 'wx', 0o600);
    fs.writeFileSync(fd, JSON.stringify(record));
    fs.fsyncSync(fd);
    fs.closeSync(fd); fd = undefined;
    try { fs.linkSync(temporary, file); } catch (error) {
      if (error.code === 'EEXIST') return replay(readRecord(file));
      throw error;
    }
    const dirfd = fs.openSync(directory, fs.constants.O_RDONLY);
    try { fs.fsyncSync(dirfd); } finally { fs.closeSync(dirfd); }
    return { ...receipt(record, true), replayed: false };
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

function getReceipt(id, token, options) {
  if (!/^[a-f0-9]{64}$/.test(id || '') || !/^[a-f0-9]{64}$/.test(token || '')) return null;
  const record = readRecord(path.join(storeDirectory(options.dataDir), `${id}.json`));
  if (!record || !crypto.timingSafeEqual(Buffer.from(hash(token)), Buffer.from(hash(record.receiptToken)))) {
    return null;
  }
  return receipt(record);
}

module.exports = { persistCheckout, getReceipt };
