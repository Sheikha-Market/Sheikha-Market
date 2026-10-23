'use strict';
const { digest } = require('./sheikha-owned-asset-registry.cjs');

const DATASET_ID = 'SHEIKHA_SUPPLIER_SYNTHETIC_V1';
const CATEGORIES = ['METALS', 'ENERGY', 'AUTOMATION', 'RECYCLING'];
const DOCUMENT_KINDS = ['SPECIFICATION', 'TEST_RECORD', 'LICENSE_SAMPLE'];
const CONTRACTS = {
  suppliers: { name: 'list_suppliers', method: 'GET', path: '/api/suppliers', requirementId: 'supplier-package--acceptance-1' },
  materials: { name: 'list_materials', method: 'GET', path: '/api/materials', requirementId: 'supplier-package--acceptance-2' },
  documents: { name: 'list_documents', method: 'GET', path: '/api/documents', requirementId: 'supplier-package--acceptance-3' }
};
const POLICY = { mode: 'SYNTHETIC_READ_ONLY', syntheticData: true, realSupplierData: false,
  productionEnabled: false, mutationEnabled: false, externalCallsMade: false, purchaseVerified: false,
  databaseOpened: false, documentContentExposed: false, sourcePackageModified: false };
const id = (prefix, n) => `${prefix}-SYN-${String(n).padStart(3, '0')}`;
const suppliers = [
  ['مورد تجريبي 01', 'METALS'], ['مورد تجريبي 02', 'ENERGY'], ['مورد تجريبي 03', 'AUTOMATION'],
  ['مورد تجريبي 04', 'RECYCLING'], ['مورد تجريبي 05', 'METALS'], ['مورد تجريبي 06', 'AUTOMATION']
].map(([name, category], i) => ({ id: id('SUP', i + 1), name, category, synthetic: true, verification: 'NOT_VERIFIED' }));
const materials = [
  ['صفائح فولاذ تجريبية', 'METALS', 'kg', 1], ['لفائف نحاس تجريبية', 'METALS', 'kg', 1],
  ['وحدة طاقة تجريبية', 'ENERGY', 'piece', 2], ['ذراع آلية تجريبية', 'AUTOMATION', 'piece', 3],
  ['متحكم تجريبي', 'AUTOMATION', 'piece', 3], ['حبيبات معاد تدويرها تجريبية', 'RECYCLING', 'kg', 4],
  ['مقاطع ألمنيوم تجريبية', 'METALS', 'kg', 5], ['مستشعر تجريبي', 'AUTOMATION', 'piece', 6],
  ['كابل تحكم تجريبي', 'AUTOMATION', 'm', 6]
].map(([name, category, unit, supplier], i) => ({ id: id('MAT', i + 1), name, category, unit,
  supplierId: id('SUP', supplier), synthetic: true, availability: 'NOT_OFFERED' }));
const documents = [
  ['مواصفة صفائح تجريبية', 'SPECIFICATION', 1, 1], ['سجل فحص نحاس تجريبي', 'TEST_RECORD', 1, 2],
  ['مواصفة طاقة تجريبية', 'SPECIFICATION', 2, 3], ['نموذج ترخيص تجريبي', 'LICENSE_SAMPLE', 3, null],
  ['سجل فحص متحكم تجريبي', 'TEST_RECORD', 3, 5], ['مواصفة تدوير تجريبية', 'SPECIFICATION', 4, 6],
  ['مواصفة ألمنيوم تجريبية', 'SPECIFICATION', 5, 7], ['مواصفة مستشعر تجريبية', 'SPECIFICATION', 6, 8]
].map(([name, kind, supplier, material], i) => ({ id: id('DOC', i + 1), name, kind,
  supplierId: id('SUP', supplier), materialId: material ? id('MAT', material) : null,
  synthetic: true, verification: 'SAMPLE_NOT_EVIDENCE', contentAvailable: false }));
const DATA = { suppliers, materials, documents };
const LIMITS = Object.freeze({ queryBytes: 1024, searchLength: 80, maxLimit: 25, defaultLimit: 5, maxOffset: 1000 });

function parseQuery(collection, params) {
  if (typeof collection !== 'string' || !Object.hasOwn(CONTRACTS, collection) || !(params instanceof URLSearchParams)
    || Buffer.byteLength(params.toString()) > LIMITS.queryBytes) throw Error('SUPPLIER_LAB_INPUT_REJECTED');
  const allowed = ['q', 'offset', 'limit', ...(collection === 'documents' ? ['kind'] : ['category']),
    ...(collection === 'suppliers' ? [] : ['supplierId'])];
  const seen = new Set();
  for (const [key] of params) {
    if (!allowed.includes(key) || seen.has(key)) throw Error('SUPPLIER_LAB_INPUT_REJECTED');
    seen.add(key);
  }
  const integer = (key, fallback, min, max) => {
    if (!params.has(key)) return fallback;
    const value = params.get(key);
    if (!/^(0|[1-9][0-9]{0,3})$/.test(value) || Number(value) < min || Number(value) > max) throw Error('SUPPLIER_LAB_INPUT_REJECTED');
    return Number(value);
  };
  const q = params.get('q') || '';
  if (q.length > LIMITS.searchLength || /[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/u.test(q)) throw Error('SUPPLIER_LAB_INPUT_REJECTED');
  const filters = { q: q.trim().normalize('NFC') };
  if (params.has('supplierId')) {
    if (!/^SUP-SYN-[0-9]{3}$/.test(params.get('supplierId'))) throw Error('SUPPLIER_LAB_INPUT_REJECTED');
    filters.supplierId = params.get('supplierId');
  }
  for (const [field, values] of [['category', CATEGORIES], ['kind', DOCUMENT_KINDS]]) if (params.has(field)) {
    if (!values.includes(params.get(field))) throw Error('SUPPLIER_LAB_INPUT_REJECTED');
    filters[field] = params.get(field);
  }
  return { filters, offset: integer('offset', 0, 0, LIMITS.maxOffset), limit: integer('limit', LIMITS.defaultLimit, 1, LIMITS.maxLimit) };
}

function listSupplierLab(collection, params = new URLSearchParams()) {
  const { filters, offset, limit } = parseQuery(collection, params), q = filters.q.toLocaleLowerCase('en');
  const matching = DATA[collection].filter(item => (!filters.category || item.category === filters.category)
    && (!filters.kind || item.kind === filters.kind) && (!filters.supplierId || item.supplierId === filters.supplierId)
    && [item.id, item.name, item.supplierId || '', item.materialId || ''].some(value => value.normalize('NFC').toLocaleLowerCase('en').includes(q)));
  const items = matching.slice(offset, offset + limit).map(item => {
    if (collection !== 'suppliers') return { ...item, supplierName: suppliers.find(s => s.id === item.supplierId).name };
    return { ...item, materialCount: materials.filter(m => m.supplierId === item.id).length,
      documentCount: documents.filter(d => d.supplierId === item.id).length };
  });
  const body = { schemaVersion: 1, kind: 'SUPPLIER_LAB_PAGE', datasetId: DATASET_ID, collection,
    contract: { ...CONTRACTS[collection] }, filters, items,
    pagination: { offset, limit, total: matching.length, returned: items.length, hasMore: offset + items.length < matching.length },
    policy: { ...POLICY } };
  return { ...body, integrity: { algorithm: 'SHA-256_CANONICAL_JSON', digest: digest(body), signature: false } };
}

module.exports = { listSupplierLab, LIMITS };
