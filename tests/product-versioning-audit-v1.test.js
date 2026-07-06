'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  bumpPatchVersion,
  createProductVersion
} = require('../core/product-knowledge/product-versioning');

const {
  resolveAuditPath,
  recordProductAuditEvent,
  getProductAuditTrail,
  getProductVersionHistory,
  getProductVersionSnapshot
} = require('../core/product-knowledge/product-audit-trail');

describe('Sheikha Product Versioning and Audit V1', () => {
  beforeEach(() => {
    process.env.SHEIKHA_PRODUCT_AUDIT_PATH = path.join(
      os.tmpdir(),
      `sheikha-product-audit-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
    );
  });

  afterEach(() => {
    if (fs.existsSync(resolveAuditPath())) {
      fs.unlinkSync(resolveAuditPath());
    }
    delete process.env.SHEIKHA_PRODUCT_AUDIT_PATH;
  });

  test('bumps product patch version', () => {
    expect(bumpPatchVersion('1.0.0')).toBe('1.0.1');
    expect(bumpPatchVersion('2.4.9')).toBe('2.4.10');
  });

  test('creates updated product version', () => {
    const updated = createProductVersion(
      {
        id: 'versioned-product',
        version: '1.0.0',
        name: 'Copper Cable',
        category: 'metals',
        product: { name: 'Copper Cable' }
      },
      {
        product: { description: 'Updated description' },
        actor: 'test',
        reason: 'unit test'
      }
    );

    expect(updated.version).toBe('1.0.1');
    expect(updated.lifecycle.version).toBe('1.0.1');
    expect(updated.description).toBe('Updated description');
    expect(updated.actor).toBeUndefined();
    expect(updated.reason).toBeUndefined();
  });

  test('records product audit trail and exposes version history', () => {
    const created = recordProductAuditEvent({
      productId: 'audit-product',
      action: 'CREATED',
      actor: 'test',
      after: {
        id: 'audit-product',
        version: '1.0.0',
        product: { name: 'Copper Cable', version: '1.0.0' }
      },
      reason: 'unit test create'
    });

    const updated = recordProductAuditEvent({
      productId: 'audit-product',
      action: 'UPDATED',
      actor: 'test',
      before: created.after,
      after: {
        id: 'audit-product',
        version: '1.0.1',
        product: { name: 'Copper Cable', version: '1.0.1' }
      },
      reason: 'unit test'
    });

    const trail = getProductAuditTrail('audit-product');
    const history = getProductVersionHistory('audit-product');
    const version = getProductVersionSnapshot('audit-product', '1.0.1');

    expect(updated.productId).toBe('audit-product');
    expect(trail.length).toBe(2);
    expect(trail.map((item) => item.action)).toContain('UPDATED');
    expect(history.map((item) => item.version)).toEqual(['1.0.0', '1.0.1']);
    expect(version.snapshot.version).toBe('1.0.1');
  });
});
