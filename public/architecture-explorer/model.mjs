export const GROUPS = Object.freeze([
  { id: 'foundation', name: 'المرجعية والقيم', icon: 'book-open', ids: ['islamic-reference-layer', 'constitution', 'ummah-benefit-value-layer', 'religion-renewal-service-layer', 'universal-scientific-methodology-layer'] },
  { id: 'strategy', name: 'الرؤية والقيمة', icon: 'compass', ids: ['planning-analysis-layer', 'civilization', 'ecosystem', 'value-operating-system'] },
  { id: 'organization', name: 'التنظيم والحوكمة', icon: 'landmark', ids: ['kingdom', 'commerce-supreme-council', 'commerce-emirates', 'commerce-ministries', 'commerce-authorities'] },
  { id: 'regions', name: 'التعاون والاتحادات', icon: 'globe', ids: ['arabian-peninsula-federation-layer', 'arabian-gulf-cooperation-layer', 'global-commerce-federation', 'federation-of-commerce-ecosystems'] },
  { id: 'runtime', name: 'المنصات التقنية', icon: 'cpu', ids: ['commerce-os', 'global-commerce-infrastructure'] },
  { id: 'integration', name: 'التكامل والمعرفة', icon: 'network', ids: ['internal-integration-layer', 'external-integration-layer', 'universal-integration-fabric', 'product-knowledge-fabric'] },
  { id: 'other', name: 'طبقات إضافية', icon: 'layers', ids: [] }
]);

const byLayer = new Map(GROUPS.flatMap(group => group.ids.map(id => [id, group])));
const ID = /^[a-z0-9][a-z0-9-]{0,127}$/;
export function groupFor(id) { return byLayer.get(id) || GROUPS.at(-1); }
function text(value, limit = 2000) {
  if (typeof value !== 'string' || value.length > limit) throw new Error('Invalid registry text');
  return value;
}
function strings(value) {
  if (!Array.isArray(value) || value.length > 256) throw new Error('Invalid registry list');
  return value.map(item => text(item));
}
// Registry declarations are read as definitions, never as live-health evidence.
export function parseRegistry(payload) {
  const data = payload?.data?.architecture;
  if (payload?.success !== true || !data || !Array.isArray(data.layers) || data.layers.length > 512) throw new Error('Invalid architecture response');
  const ids = new Set();
  const layers = data.layers.map(layer => {
    if (!layer || typeof layer.id !== 'string' || !ID.test(layer.id) || ids.has(layer.id)) throw new Error('Invalid or duplicate layer ID');
    ids.add(layer.id);
    return {
      id: layer.id, name: text(layer.name), arabicName: text(layer.arabicName),
      purpose: text(layer.purpose ?? ''), status: text(layer.status ?? 'UNSPECIFIED', 80),
      responsibilities: strings(layer.responsibilities ?? []), capabilities: strings(layer.capabilities ?? []),
      dependencies: [...new Set(strings(layer.dependencies))]
    };
  });
  return {
    version: text(data.version, 80), system: text(data.system, 160),
    governanceNote: text(data.governanceNote ?? ''), layers,
    principles: strings(data.principles ?? []), integrations: strings(data.integrations ?? [])
  };
}
export function searchKey(value) {
  return value.normalize('NFKC').toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي');
}
export function filterLayers(layers, { q = '', group = 'all' } = {}) {
  const terms = searchKey(q).trim().split(/\s+/).filter(Boolean);
  return layers.filter(layer => {
    const haystack = searchKey([layer.id, layer.name, layer.arabicName, layer.purpose, ...layer.capabilities, ...layer.responsibilities].join(' '));
    return (group === 'all' || groupFor(layer.id).id === group) && terms.every(term => haystack.includes(term));
  });
}
export function readState(search) {
  const params = new URLSearchParams(search);
  const group = params.get('group');
  const layer = params.get('layer') || '';
  return {
    q: (params.get('q') || '').slice(0, 160), group: GROUPS.some(item => item.id === group) ? group : 'all',
    view: ['map', 'list'].includes(params.get('view')) ? params.get('view') : 'core', layer: ID.test(layer) ? layer : ''
  };
}
export function stateQuery(state) {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.group !== 'all') params.set('group', state.group);
  if (state.view !== 'core') params.set('view', state.view);
  if (state.layer) params.set('layer', state.layer);
  return params.toString();
}
export function relations(layers, id) {
  return { parents: layers.find(layer => layer.id === id)?.dependencies ?? [], children: layers.filter(layer => layer.dependencies.includes(id)).map(layer => layer.id) };
}

// Collapse registered dependencies by category, retaining direction and counts.
export function categoryGraph(layers) {
  const byId = new Map(layers.map(layer => [layer.id, layer]));
  const groups = GROUPS.map(group => ({
    id: group.id, name: group.name, count: layers.filter(layer => groupFor(layer.id).id === group.id).length
  })).filter(group => group.count > 0);
  const links = new Map();
  let internalRelations = 0;
  let missingRelations = 0;
  for (const layer of layers) for (const id of layer.dependencies) {
    if (!byId.has(id)) { missingRelations++; continue; }
    const from = groupFor(layer.id).id;
    const to = groupFor(id).id;
    if (from === to) { internalRelations++; continue; }
    const key = `${from}:${to}`;
    const link = links.get(key) || { from, to, count: 0 };
    link.count++;
    links.set(key, link);
  }
  return { groups, links: [...links.values()], internalRelations, missingRelations };
}
export function exportRegistry(registry, layers, filters, loadedAt) {
  const selectedIds = new Set(layers.map(layer => layer.id));
  return {
    schemaVersion: 1, source: '/api/enterprise-architecture/full', sourceVersion: registry.version,
    loadedAt, evidenceType: 'REGISTRY_DEFINITION', liveOperationVerified: false,
    filters: { q: filters.q, group: filters.group }, governanceNote: registry.governanceNote,
    externalDependencyIds: [...new Set(layers.flatMap(layer => layer.dependencies).filter(id => !selectedIds.has(id)))], layers
  };
}
