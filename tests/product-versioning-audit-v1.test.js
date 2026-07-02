'use strict';

const {
  bumpPatchVersion,
  createProductVersion
} = require('../core/product-knowledge/product-versioning');

const {
  recordProductAuditEvent,
  getProductAuditTrail
} = require('../core/product-knowledge/product-audit-trail');

describe('Sheikha Product Versioning and Audit V1', () => {
  test('bumps product patch version', () => {
    expect(bumpPatchVersion('1.0.0')).toBe('1.0.1');
    expect(bumpPatchVersion('2.4.9')).toBe('2.4.10');
  });

  test('creates updated product version', () => {
    const updated = createProductVersion(
      { id: 'versioned-product', version: '1.0.0', product: { name: 'Copper Cable' } },
      { product: { description: 'Updated description' } }
    );

    expect(updated.version).toBe('1.0.1');
    expect(updated.product.version).toBe('1.0.1');
    expect(updated.product.description).toBe('Updated description');
  });

  test('records product audit trail', () => {
    const event = recordProductAuditEvent({
      productId: 'audit-product',
      action: 'UPDATED',
      actor: 'test',
      reason: 'unit test'
    });

    const trail = getProductAuditTrail('audit-product');

    expect(event.productId).toBe('audit-product');
    expect(trail.length).toBeGreaterThanOrEqual(1);
    expect(trail.map((item) => item.action)).toContain('UPDATED');
  });
});
