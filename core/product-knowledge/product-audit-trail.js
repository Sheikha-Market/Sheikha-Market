'use strict';

const fs = require('fs');
const path = require('path');

const defaultAuditPath = path.join(process.cwd(), 'data', 'product-knowledge-audit.json');

function resolveAuditPath() {
  return process.env.SHEIKHA_PRODUCT_AUDIT_PATH || defaultAuditPath;
}

function ensureAuditStore() {
  const auditPath = resolveAuditPath();
  fs.mkdirSync(path.dirname(auditPath), { recursive: true });
  if (!fs.existsSync(auditPath)) {
    fs.writeFileSync(auditPath, JSON.stringify({ events: [] }, null, 2));
  }
}

function readAuditEvents() {
  ensureAuditStore();

  try {
    const parsed = JSON.parse(fs.readFileSync(resolveAuditPath(), 'utf8'));
    return Array.isArray(parsed.events) ? parsed.events : [];
  } catch (error) {
    return [];
  }
}

function writeAuditEvents(events = []) {
  ensureAuditStore();
  fs.writeFileSync(resolveAuditPath(), JSON.stringify({ events }, null, 2));
  return events;
}

function cloneSnapshot(value) {
  return value == null ? null : JSON.parse(JSON.stringify(value));
}

function readSnapshotVersion(snapshot = {}) {
  return snapshot.version ||
    snapshot.product?.version ||
    snapshot.product?.lifecycle?.version ||
    null;
}

function recordProductAuditEvent({
  productId,
  action,
  actor = 'system',
  before = null,
  after = null,
  reason = ''
}) {
  const events = readAuditEvents();

  const event = {
    id: `audit-${Date.now()}-${events.length + 1}`,
    productId,
    action,
    actor,
    before: cloneSnapshot(before),
    after: cloneSnapshot(after),
    reason,
    timestamp: new Date().toISOString()
  };

  events.push(event);
  writeAuditEvents(events);

  return event;
}

function getProductAuditTrail(productId) {
  return readAuditEvents().filter((event) => event.productId === productId);
}

function getProductVersionHistory(productId) {
  return getProductAuditTrail(productId)
    .filter((event) => event.after)
    .map((event) => ({
      auditId: event.id,
      productId: event.productId,
      action: event.action,
      actor: event.actor,
      reason: event.reason,
      version: readSnapshotVersion(event.after),
      snapshot: event.after,
      timestamp: event.timestamp
    }))
    .filter((entry) => entry.version);
}

function getProductVersionSnapshot(productId, version) {
  return getProductVersionHistory(productId)
    .find((entry) => entry.version === version) || null;
}

module.exports = {
  auditPath: defaultAuditPath,
  resolveAuditPath,
  readAuditEvents,
  writeAuditEvents,
  recordProductAuditEvent,
  getProductAuditTrail,
  getProductVersionHistory,
  getProductVersionSnapshot
};
