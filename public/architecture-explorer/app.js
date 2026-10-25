import { GROUPS, groupFor, parseRegistry, filterLayers, readState, stateQuery, relations, exportRegistry, categoryGraph } from './model.mjs';

const $ = id => document.getElementById(id);
const state = readState(location.search);
let registry = null;
let loadedAt = null;
let loading = false;
let coreScene = null;
let sceneLoading = false;
let sceneFailed = false;
let sceneRegistry = null;
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const principleNames = new Map([
  ['Justice', 'العدل'], ['Honesty', 'الصدق'], ['Trust', 'الأمانة'], ['Transparency', 'الشفافية'],
  ['Quality', 'الجودة'], ['Value', 'القيمة'], ['Sustainability', 'الاستدامة'], ['No Harm', 'عدم الإضرار'],
  ['Contract Fulfillment', 'الوفاء بالعقود'], ['Benefit to People', 'نفع الناس'], ['Beneficial Commerce', 'التجارة النافعة']
]);
const destinations = new Map([
  ['commerce-os', ['/sheikha-platform/', 'منصة شيخة']],
  ['global-commerce-infrastructure', ['/technology/', 'التقنية']],
  ['product-knowledge-fabric', ['/product-knowledge/', 'معرفة المنتجات']],
  ['commerce-ministries', ['/sheikha-organization/', 'التنظيم']],
  ['commerce-authorities', ['/sheikha-organization/', 'التنظيم']]
]);

function node(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content !== undefined) element.textContent = String(content);
  return element;
}
function icon(name) {
  const img = node('img', 'icon');
  img.src = `/architecture-explorer/icons/${name}.svg`;
  img.alt = '';
  return img;
}
function button(className, label, onClick) {
  const result = node('button', className, label);
  result.type = 'button';
  result.addEventListener('click', onClick);
  return result;
}
function syncUrl() {
  const query = stateQuery(state);
  history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`);
}
function visibleLayers() { return registry ? filterLayers(registry.layers, state) : []; }

function selectGroup(id) {
  state.group = state.group === id ? 'all' : id;
  render();
}
function sceneControls(enabled) {
  for (const control of document.querySelectorAll('.scene-toolbar button, .scene-toolbar input')) control.disabled = !enabled;
  $('scene-motion').disabled = !enabled || motionPreference.matches;
}
function sceneUnavailable() {
  sceneFailed = true;
  coreScene?.setMotion(false);
  coreScene?.setVisible(false);
  const canvas = $('core-stage').querySelector('canvas');
  if (canvas) canvas.hidden = true;
  $('scene-state').hidden = true;
  $('scene-error').hidden = false;
  $('scene-hover').hidden = true;
  $('scene-motion').checked = false;
  sceneControls(false);
}
async function syncScene() {
  const active = state.view === 'core' && Boolean(registry?.layers.length);
  coreScene?.setVisible(active && !sceneFailed);
  if (!registry) return;
  if (!registry.layers.length) {
    $('scene-state').textContent = 'لا توجد طبقات مسجلة.';
    $('scene-state').hidden = false;
    $('scene-error').hidden = true;
    $('scene-hover').hidden = true;
    $('scene-motion').checked = false;
    coreScene?.setMotion(false);
    if (coreScene) $('core-stage').querySelector('canvas').hidden = true;
    sceneControls(false);
    return;
  }
  if (sceneFailed) { $('scene-state').hidden = true; $('scene-error').hidden = false; return; }
  if (!active || sceneLoading) return;
  sceneLoading = true;
  try {
    if (!coreScene) {
      $('scene-state').textContent = 'جارٍ تحميل النواة المعمارية...';
      const { createCoreScene } = await import('./core-scene.mjs');
      if (state.view !== 'core' || !registry?.layers.length) return;
      coreScene = createCoreScene($('core-stage'), {
        onSelect: selectGroup,
        onHover: text => { $('scene-hover').textContent = text; $('scene-hover').hidden = !text; },
        onUnavailable: sceneUnavailable
      });
    }
    if (sceneRegistry !== registry) { coreScene.setGraph(categoryGraph(registry.layers)); sceneRegistry = registry; }
    coreScene.setSelection(state.group, filterLayers(registry.layers, { q: state.q }).map(layer => groupFor(layer.id).id));
    $('core-stage').querySelector('canvas').hidden = false;
    $('scene-state').hidden = true;
    sceneControls(true);
    coreScene.setVisible(true);
  } catch {
    sceneUnavailable();
  } finally { sceneLoading = false; }
}

function selectLayer(id) {
  if (!registry?.layers.some(layer => layer.id === id)) return;
  if (!visibleLayers().some(layer => layer.id === id)) { state.q = ''; state.group = 'all'; }
  state.layer = id;
  render();
  $('detail-content').scrollTop = 0;
  $('detail-panel').focus({ preventScroll: true });
  if (matchMedia('(max-width: 1190px)').matches) $('detail-panel').scrollIntoView({ block: 'start' });
}

for (const group of GROUPS) {
  const option = node('option', '', group.name);
  option.value = group.id;
  $('group-filter').append(option);
  const legend = button('scene-category', undefined, () => selectGroup(group.id));
  legend.dataset.sceneGroup = group.id;
  legend.setAttribute('aria-pressed', 'false');
  legend.setAttribute('aria-controls', 'layer-list');
  legend.append(icon(group.icon), node('span', '', group.name), node('small', '', '0'));
  legend.disabled = true;
  if (group.id === 'other') legend.hidden = true;
  $('scene-legend').append(legend);
  if (group.id === 'other') continue;
  const item = button('category-node', undefined, () => {
    selectGroup(group.id);
  });
  item.dataset.group = group.id;
  item.append(icon(group.icon), node('strong', '', group.name), node('small', '', 'بانتظار المصدر'));
  item.setAttribute('aria-controls', 'layer-list');
  item.setAttribute('aria-pressed', 'false');
  item.disabled = true;
  $('category-nodes').append(item);
}
const extraGroup = button('extra-node', 'طبقات إضافية', () => { state.group = 'other'; render(); });
extraGroup.hidden = true;
$('map-panel').append(extraGroup);

function renderList(layers) {
  const list = $('layer-list');
  const oldScroll = list.scrollTop;
  const fragment = document.createDocumentFragment();
  for (const group of GROUPS) {
    const members = layers.filter(layer => groupFor(layer.id).id === group.id);
    if (!members.length) continue;
    fragment.append(node('h3', 'layer-group-title', group.name));
    for (const layer of members) {
      const item = button('layer-button', undefined, () => selectLayer(layer.id));
      item.dataset.layer = layer.id;
      item.setAttribute('aria-current', String(state.layer === layer.id));
      item.setAttribute('aria-controls', 'detail-panel');
      const labels = node('span');
      labels.append(node('strong', '', layer.arabicName), node('small', '', layer.name));
      item.append(icon(group.icon), labels);
      fragment.append(item);
    }
  }
  list.replaceChildren(fragment);
  list.hidden = !layers.length;
  list.scrollTop = oldScroll;
  $('empty').hidden = layers.length > 0;
  $('result-count').textContent = `${layers.length} / ${registry.layers.length}`;
}

function renderTable(layers) {
  const rows = layers.map(layer => {
    const row = node('tr');
    row.dataset.selected = String(state.layer === layer.id);
    const name = node('td');
    name.append(button('', layer.arabicName, () => selectLayer(layer.id)), node('small', '', layer.name));
    row.append(name, node('td', '', groupFor(layer.id).name), node('td', '', layer.dependencies.length));
    return row;
  });
  if (!rows.length) {
    const row = node('tr');
    const cell = node('td', 'table-empty', 'لا توجد طبقات مطابقة.');
    cell.colSpan = 3;
    row.append(cell);
    rows.push(row);
  }
  $('table-body').replaceChildren(...rows);
}

function section(title, content) {
  const result = node('section', 'detail-section');
  result.append(node('h4', '', title), content);
  return result;
}
function technicalList(items) {
  const list = node('ul', 'technical-list');
  list.lang = 'en';
  items.forEach(item => list.append(node('li', '', item)));
  return items.length ? list : node('p', '', 'لا توجد عناصر مسجلة.');
}
function relationList(ids) {
  if (!ids.length) return node('p', '', 'لا توجد علاقات مسجلة.');
  const list = node('ul');
  for (const id of ids) {
    const layer = registry.layers.find(item => item.id === id);
    const entry = node('li');
    if (layer) {
      const link = button('relationship-button', undefined, () => selectLayer(id));
      link.append(node('span', '', layer.arabicName), icon('arrow-left'));
      entry.append(link);
    } else {
      entry.append(node('span', 'missing-reference', `مرجع غير موجود: ${id}`));
    }
    list.append(entry);
  }
  return list;
}

function renderDetail() {
  const host = $('detail-content');
  const layer = registry.layers.find(item => item.id === state.layer);
  if (!layer) { host.replaceChildren(node('p', 'empty-state', 'لا توجد طبقة ضمن النتائج الحالية.')); return; }
  const english = node('p', 'detail-english', layer.name);
  english.dir = 'ltr'; english.lang = 'en';
  const facts = node('dl', 'detail-facts');
  const rawStatus = node('dd', '', layer.status); rawStatus.dir = 'ltr';
  facts.append(node('dt', '', 'الحالة في السجل'), rawStatus, node('dt', '', 'التحقق الحي'), node('dd', '', 'غير متاح'));
  const purpose = node('p', 'source-purpose', layer.purpose || 'No purpose registered.');
  purpose.lang = 'en';
  const links = relations(registry.layers, layer.id);
  const sourceDetails = node('details');
  const identifier = node('p', 'technical-list', layer.id);
  const governance = node('p', 'source-purpose', registry.governanceNote);
  governance.lang = 'en';
  sourceDetails.append(node('summary', '', 'بيانات المصدر'), identifier, governance);
  host.replaceChildren(
    node('p', 'detail-group', groupFor(layer.id).name), node('h3', 'detail-name', layer.arabicName), english,
    node('span', 'definition-badge', 'تعريف مسجل · ليس إثبات تشغيل'), facts,
    section('الغرض في السجل', purpose),
    section(`تعتمد على (${links.parents.length})`, relationList(links.parents)),
    section(`تعتمد عليها (${links.children.length})`, relationList(links.children)),
    section('القدرات المسجلة', technicalList(layer.capabilities)),
    section('المسؤوليات', technicalList(layer.responsibilities)), section('المصدر', sourceDetails)
  );
  if (destinations.has(layer.id)) {
    const [url, label] = destinations.get(layer.id);
    const link = node('a', 'detail-link', label); link.href = url; link.append(icon('arrow-left'));
    host.append(link);
  }
}

function render() {
  $('search').value = state.q;
  $('group-filter').value = state.group;
  $('map-panel').hidden = state.view !== 'map';
  $('core-panel').hidden = state.view !== 'core';
  $('table-panel').hidden = state.view !== 'list';
  $('map-view').setAttribute('aria-pressed', String(state.view === 'map'));
  $('core-view').setAttribute('aria-pressed', String(state.view === 'core'));
  $('list-view').setAttribute('aria-pressed', String(state.view === 'list'));
  $('overview-heading').textContent = { core: 'النواة المعمارية', map: 'خريطة المجالات', list: 'سجل الطبقات' }[state.view];
  if (!registry) return;
  const layers = visibleLayers();
  if (!layers.some(layer => layer.id === state.layer)) state.layer = layers[0]?.id || '';
  renderList(layers);
  renderTable(layers);
  renderDetail();
  const queryMatches = filterLayers(registry.layers, { q: state.q });
  for (const item of document.querySelectorAll('.scene-category')) {
    const group = item.dataset.sceneGroup;
    const total = registry.layers.filter(layer => groupFor(layer.id).id === group).length;
    const count = queryMatches.filter(layer => groupFor(layer.id).id === group).length;
    item.disabled = total === 0;
    if (group === 'other') item.hidden = total === 0;
    item.setAttribute('aria-pressed', String(state.group === group));
    item.querySelector('small').textContent = state.q ? `${count}/${total}` : total;
  }
  const graph = categoryGraph(registry.layers);
  $('scene-relations').textContent = `${graph.groups.length} مجالات · ${graph.links.length} رابط اعتماد بين المجالات · ${graph.internalRelations} علاقة داخل المجالات${graph.missingRelations ? ` · ${graph.missingRelations} مراجع غير موجودة` : ''}`;
  for (const item of document.querySelectorAll('.category-node')) {
    const group = item.dataset.group;
    const total = registry.layers.filter(layer => groupFor(layer.id).id === group).length;
    const count = queryMatches.filter(layer => groupFor(layer.id).id === group).length;
    item.disabled = total === 0;
    item.setAttribute('aria-pressed', String(state.group === group));
    item.querySelector('small').textContent = state.q ? `${count} / ${total} طبقات` : `${total} طبقات مسجلة`;
  }
  extraGroup.hidden = !registry.layers.some(layer => groupFor(layer.id).id === 'other');
  extraGroup.setAttribute('aria-pressed', String(state.group === 'other'));
  $('export').disabled = loading || !layers.length;
  $('announcement').textContent = `${layers.length} طبقة ضمن النتائج · تعريفات السجل فقط`;
  syncUrl();
  syncScene();
}

async function load() {
  if (loading) return;
  loading = true;
  $('workspace').setAttribute('aria-busy', 'true');
  $('refresh').disabled = true; $('retry').disabled = true; $('export').disabled = true;
  $('error').hidden = true;
  $('announcement').textContent = 'جارٍ تحميل سجل المعمارية...';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch('/api/enterprise-architecture/full', { signal: controller.signal, cache: 'no-store', headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Registry request failed');
    const next = parseRegistry(await response.json());
    registry = next;
    loadedAt = new Date().toISOString();
    $('source-version').textContent = `الإصدار ${registry.version}`;
    $('layer-count').textContent = registry.layers.length;
    $('relation-count').textContent = registry.layers.reduce((sum, layer) => sum + layer.dependencies.length, 0);
    $('principle-count').textContent = registry.principles.length;
    $('integration-count').textContent = registry.integrations.length;
    $('loaded-at').textContent = `آخر تحميل: ${new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(loadedAt))}`;
    $('principles').replaceChildren(...registry.principles.map(item => {
      const entry = node('li', '', principleNames.get(item) || item); entry.title = item; return entry;
    }));
    render();
  } catch (error) {
    $('error').hidden = false;
    $('error-text').textContent = registry
      ? 'تعذر تحديث السجل. المعروض هو آخر تحميل ناجح، وليس بيانات حديثة.'
      : 'تعذر تحميل سجل المعمارية. المصدر غير متاح أو أعاد بيانات غير صالحة.';
    $('announcement').textContent = error.name === 'AbortError' ? 'انتهت مهلة تحميل السجل.' : 'لم يكتمل تحميل السجل.';
    if (!registry) {
      $('source-version').textContent = 'المصدر غير متاح';
      $('detail-content').replaceChildren(node('p', 'empty-state', 'لا تتوفر بيانات معمارية للعرض.'));
      $('scene-state').textContent = 'المصدر غير متاح. لا توجد بيانات للمشهد.';
    }
  } finally {
    clearTimeout(timeout);
    loading = false;
    $('workspace').setAttribute('aria-busy', 'false');
    $('refresh').disabled = false; $('retry').disabled = false;
    $('export').disabled = !visibleLayers().length;
  }
}

$('search').addEventListener('input', event => { state.q = event.target.value; render(); });
$('group-filter').addEventListener('change', event => { state.group = event.target.value; render(); });
$('reset').addEventListener('click', () => { state.q = ''; state.group = 'all'; render(); $('search').focus(); });
$('map-view').addEventListener('click', () => { state.view = 'map'; render(); });
$('core-view').addEventListener('click', () => { state.view = 'core'; render(); });
$('scene-fallback').addEventListener('click', () => { state.view = 'map'; render(); $('map-view').focus(); });
$('scene-left').addEventListener('click', () => coreScene?.rotate(-Math.PI / 8));
$('scene-right').addEventListener('click', () => coreScene?.rotate(Math.PI / 8));
$('scene-zoom-in').addEventListener('click', () => coreScene?.zoom(1.15));
$('scene-zoom-out').addEventListener('click', () => coreScene?.zoom(1 / 1.15));
$('scene-reset').addEventListener('click', () => { $('scene-motion').checked = false; coreScene?.setMotion(false); coreScene?.reset(); });
$('scene-motion').addEventListener('change', event => { event.target.checked = coreScene?.setMotion(event.target.checked) || false; });
motionPreference.addEventListener('change', () => {
  if (motionPreference.matches) { $('scene-motion').checked = false; coreScene?.setMotion(false); }
  sceneControls(Boolean(coreScene) && !sceneFailed && Boolean(registry?.layers.length));
});
window.addEventListener('pagehide', event => { if (!event.persisted) coreScene?.dispose(); });
$('list-view').addEventListener('click', () => { state.view = 'list'; render(); });
$('refresh').addEventListener('click', load);
$('retry').addEventListener('click', load);
window.addEventListener('popstate', () => { Object.assign(state, readState(location.search)); render(); });
$('export').addEventListener('click', () => {
  if (!registry || loading) return;
  const content = exportRegistry(registry, visibleLayers(), state, loadedAt);
  const url = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], { type: 'application/json;charset=utf-8' }));
  const link = node('a'); link.href = url; link.download = 'sheikha-architecture-registry.json';
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
render();
load();
