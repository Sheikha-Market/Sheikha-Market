'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { getEnterpriseArchitecture } = require('../core/enterprise-architecture/sheikha-enterprise-architecture');
const { createPreviewServer } = require('../tools/preview/sheikha-architecture-preview.cjs');
const model = import('../public/architecture-explorer/model.mjs');
const payload = () => ({ success: true, data: { architecture: structuredClone(getEnterpriseArchitecture()) } });

test('all current layers have exactly one curated category', async () => {
  const { GROUPS, groupFor, parseRegistry } = await model;
  const registry = parseRegistry(payload());
  assert.equal(registry.layers.length, 24);
  for (const layer of registry.layers) {
    assert.notEqual(groupFor(layer.id).id, 'other');
    assert.equal(GROUPS.filter(group => group.ids.includes(layer.id)).length, 1);
  }
});

test('future layers remain visible under the additional category', async () => {
  const { groupFor, filterLayers, parseRegistry } = await model;
  const input = payload();
  input.data.architecture.layers.push({ id: 'future-layer', name: 'Future', arabicName: 'طبقة جديدة', dependencies: [] });
  const layers = parseRegistry(input).layers;
  assert.equal(groupFor('future-layer').id, 'other');
  assert.deepEqual(filterLayers(layers, { group: 'other' }).map(item => item.id), ['future-layer']);
});

test('search normalizes Arabic marks and matches English capabilities and IDs', async () => {
  const { filterLayers, parseRegistry, searchKey } = await model;
  const layers = parseRegistry(payload()).layers;
  assert.equal(searchKey('الإِسْلَامِي'), searchKey('الاسلامي'));
  assert.ok(filterLayers(layers, { q: 'الاسلامي' }).some(layer => layer.id === 'islamic-reference-layer'));
  assert.ok(filterLayers(layers, { q: 'COMMERCE-OS', group: 'runtime' }).some(layer => layer.id === 'commerce-os'));
  assert.ok(filterLayers(layers, { q: 'scientific-method-registry' }).length > 0);
  assert.equal(filterLayers(layers, { q: 'no-matching-layer-at-all' }).length, 0);
});

test('URL state is bounded, validated and round-trips through URLSearchParams', async () => {
  const { readState, stateQuery } = await model;
  const state = { q: 'علم & تقنية', group: 'integration', view: 'list', layer: 'product-knowledge-fabric' };
  assert.deepEqual(readState(stateQuery(state)), state);
  const invalid = readState('?group=oops&view=oops&layer=%3Cscript%3E&q=' + 'x'.repeat(200));
  assert.equal(invalid.group, 'all'); assert.equal(invalid.view, 'core'); assert.equal(invalid.layer, ''); assert.equal(invalid.q.length, 160);
  assert.equal(readState('?view=map').view, 'map');
  assert.equal(readState(stateQuery({ q: '', group: 'all', view: 'core', layer: '' })).view, 'core');
});

test('invalid contracts and duplicate IDs are rejected, optional lists default safely', async () => {
  const { parseRegistry } = await model;
  for (const input of [null, {}, { success: false }, { success: true, data: { architecture: { layers: 'bad' } } }]) assert.throws(() => parseRegistry(input));
  const duplicate = payload(); duplicate.data.architecture.layers.push(duplicate.data.architecture.layers[0]);
  assert.throws(() => parseRegistry(duplicate), /duplicate/);
  const badList = payload(); badList.data.architecture.layers[0].dependencies = 'not-a-list';
  assert.throws(() => parseRegistry(badList));
  const badId = payload(); badId.data.architecture.layers[0].id = {};
  assert.throws(() => parseRegistry(badId));
});

test('direct relationships handle cycles without recursive traversal', async () => {
  const { relations } = await model;
  const layers = [{ id: 'a', dependencies: ['b'] }, { id: 'b', dependencies: ['a'] }];
  assert.deepEqual(relations(layers, 'a'), { parents: ['b'], children: ['b'] });
  assert.deepEqual(relations(layers, 'missing'), { parents: [], children: [] });
});

test('3D graph accounts for every registered dependency without inventing links', async () => {
  const { parseRegistry, categoryGraph } = await model;
  const registry = parseRegistry(payload());
  const graph = categoryGraph(registry.layers);
  assert.equal(graph.groups.length, 6);
  assert.equal(graph.groups.reduce((sum, group) => sum + group.count, 0), 24);
  assert.equal(graph.missingRelations, 0);
  assert.equal(graph.links.reduce((sum, link) => sum + link.count, graph.internalRelations), 29);
  for (const link of graph.links) {
    assert.notEqual(link.from, link.to);
    assert.ok(graph.groups.some(group => group.id === link.from));
    assert.ok(graph.groups.some(group => group.id === link.to));
  }
  const unknown = categoryGraph([{ id: 'new-layer', dependencies: ['missing'] }]);
  assert.equal(unknown.missingRelations, 1);
  assert.deepEqual(unknown.links, []);
  assert.equal(unknown.groups[0].id, 'other');
  assert.deepEqual(categoryGraph([]), { groups: [], links: [], internalRelations: 0, missingRelations: 0 });
});

test('export states evidence limits and preserves dependencies outside a filtered subset', async () => {
  const { parseRegistry, exportRegistry } = await model;
  const registry = parseRegistry(payload());
  const layers = [registry.layers.find(layer => layer.id === 'commerce-os')];
  const exported = exportRegistry(registry, layers, { q: '', group: 'runtime' }, '2026-10-18T00:00:00.000Z');
  assert.equal(exported.evidenceType, 'REGISTRY_DEFINITION');
  assert.equal(exported.liveOperationVerified, false);
  assert.deepEqual(exported.externalDependencyIds, ['commerce-authorities']);
  assert.equal('healthScore' in exported.layers[0], false);
  assert.equal(exported.layers[0].status, 'ACTIVE');
});

test('preview serves only reads, protects paths, and uses the existing architecture source', async () => {
  const server = createPreviewServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    const api = await fetch(`${origin}/api/enterprise-architecture/full`);
    assert.equal((await api.json()).data.architecture.layers.length, 24);
    assert.equal((await fetch(`${origin}/api/enterprise-architecture/full`, { method: 'POST' })).status, 405);
    for (const url of ['/api/other', '/.env', '/%2e%2e%2fpackage.json', '/%ZZ']) assert.equal((await fetch(origin + url)).status, 404);
    const script = await fetch(origin + '/architecture-explorer/model.mjs');
    assert.match(script.headers.get('content-type'), /text\/javascript/);
    assert.equal((await fetch(origin + '/architecture-explorer/')).status, 200);
    assert.equal((await fetch(origin + '/architecture-explorer/icons/search.svg')).status, 200);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
