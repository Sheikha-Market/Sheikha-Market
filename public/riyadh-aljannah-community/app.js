'use strict';

const API = '/api/sheikha/gardens-knowledge-dialogue/v2';
const state = {
  gardens: [],
  selectedGardenId: null
};

const statusLabels = {
  VERIFIED: 'متحقق بالدليل',
  QEMU_VERIFIED_PHYSICAL_PENDING: 'QEMU متحقق · الفيزيائي منتظر'
};

async function readJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.json();
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function createTextElement(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function createDetail(term, value) {
  const wrapper = document.createElement('div');
  const title = createTextElement('dt', term);
  const content = createTextElement('dd', value);
  wrapper.append(title, content);
  return wrapper;
}

function createListItem(text) {
  return createTextElement('li', text);
}

function renderGardens(filter = 'all') {
  const container = document.getElementById('garden-grid');
  const gardens = filter === 'all'
    ? state.gardens
    : state.gardens.filter((garden) => garden.id === filter);
  container.replaceChildren();

  for (const garden of gardens) {
    const card = document.createElement('article');
    card.className = 'garden-card';
    const role = createTextElement('span', garden.role.replaceAll('_', ' '));
    const title = createTextElement('h3', garden.nameAr);
    const description = createTextElement('p', garden.descriptionAr);
    const details = document.createElement('dl');
    const button = createTextElement('button', 'فتح الدليل الكامل');
    button.type = 'button';
    button.dataset.gardenId = garden.id;
    details.append(
      createDetail('الأشجار', String(garden.trees.length)),
      createDetail('الأنهار', garden.rivers.map((river) => river.nameAr).join(' · ')),
      createDetail('الثمار التشغيلية', garden.operationalFruitsAr.join(' · '))
    );
    card.append(role, title, description, details, button);
    container.append(card);
  }
}

function populateFilter(gardens) {
  const filter = document.getElementById('garden-filter');
  for (const garden of gardens) {
    const option = document.createElement('option');
    option.value = garden.id;
    option.textContent = garden.nameAr;
    filter.append(option);
  }
}

function renderTree(tree) {
  const card = document.createElement('article');
  card.className = 'tree-card';
  const role = createTextElement('span', tree.id);
  const title = createTextElement('h4', tree.nameAr);
  const purpose = createTextElement('p', tree.purposeAr);
  const plant = createTextElement(
    'p',
    `${tree.physicalExemplar.nameAr} · ${tree.physicalExemplar.scientificName}`,
    'plant-name'
  );
  const details = document.createElement('dl');
  const instructions = document.createElement('ul');
  details.append(
    createDetail('الزهر التشغيلي', tree.operationalAnatomy.flowerAr),
    createDetail('الثمرة والطعم', `${tree.operationalAnatomy.fruitAr} · ${tree.operationalAnatomy.tasteAr}`),
    createDetail('الزهر والثمر النباتي', `${tree.physicalExemplar.flowerAr} ${tree.physicalExemplar.fruitAr}`),
    createDetail('التربة', tree.physicalExemplar.soilAr),
    createDetail('الغرس والري', `${tree.physicalExemplar.plantingAr} ${tree.physicalExemplar.irrigationAr}`)
  );
  for (const item of tree.physicalExemplar.usesAr) {
    instructions.append(createListItem(item));
  }
  card.append(role, title, purpose, plant, details, instructions);
  return card;
}

function openGarden(gardenId) {
  const garden = state.gardens.find((entry) => entry.id === gardenId);
  if (!garden) return;
  state.selectedGardenId = garden.id;
  setText('garden-detail-role', garden.role.replaceAll('_', ' '));
  setText('garden-detail-title', garden.nameAr);
  setText('garden-detail-description', garden.descriptionAr);

  const profile = document.getElementById('land-profile');
  profile.replaceChildren(
    createDetail('التضاريس', garden.terrainAr),
    createDetail('التربة الرقمية', garden.soil.digitalAr),
    createDetail('التربة المادية', garden.soil.physicalAr),
    createDetail('المروج', garden.meadow.descriptionAr)
  );

  const rivers = document.getElementById('river-list');
  rivers.replaceChildren(...garden.rivers.map((river) =>
    createListItem(`${river.nameAr}: ${river.roleAr}`)
  ));

  const laws = document.getElementById('garden-law-list');
  laws.replaceChildren(
    ...garden.lawsAr.map(createListItem),
    ...garden.conditionsAr.map(createListItem)
  );

  const roadmap = document.getElementById('planting-roadmap');
  roadmap.replaceChildren(...garden.plantingRoadmap.map((phase) => {
    const item = document.createElement('li');
    item.append(
      createTextElement('strong', phase.nameAr),
      createTextElement('span', phase.exitCriteriaAr)
    );
    return item;
  }));

  const trees = document.getElementById('tree-grid');
  trees.replaceChildren(...garden.trees.map(renderTree));

  const detail = document.getElementById('garden-detail');
  detail.hidden = false;
  detail.focus({ preventScroll: true });
  detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeGarden() {
  state.selectedGardenId = null;
  document.getElementById('garden-detail').hidden = true;
  document.getElementById('garden-directory')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function activate() {
  const [gardensResponse, statusResponse, runtime] = await Promise.all([
    readJson(`${API}/gardens`),
    readJson(`${API}/status`),
    readJson('/api/sheikha/product-runtime/v1/status')
  ]);
  const model = gardensResponse.data;
  const status = statusResponse.data;
  state.gardens = model.gardens;
  setText('garden-count', status.coverage.gardens);
  setText('tree-count', status.coverage.trees);
  setText('product-count', status.coverage.products);
  setText('sector-count', status.coverage.sectors);
  setText('market-count', status.coverage.markets);
  setText('framework-count', status.coverage.thoughtFrameworks);
  setText('garden-boundary',
    `${model.boundary.boundaryArabic} ${model.boundary.statementAr} ` +
    'الأحكام الشرعية تحتاج مراجعة بشرية مؤهلة؛ لا فتوى آلية.'
  );
  setText('runtime-state', 'الدليل المحلي متحقق');
  document.getElementById('runtime-dot')?.classList.add('ready');
  populateFilter(model.gardens);
  renderGardens();

  for (const product of runtime.data.products) {
    const item = document.querySelector(`[data-product="${product.id}"] b`);
    if (!item) continue;
    item.textContent = statusLabels[product.status] || product.status;
    item.classList.add('ready');
  }
}

document.getElementById('garden-filter')?.addEventListener('change', (event) => {
  renderGardens(event.target.value);
});

document.getElementById('garden-grid')?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-garden-id]');
  if (button) openGarden(button.dataset.gardenId);
});

document.getElementById('close-detail')?.addEventListener('click', closeGarden);

activate().catch(() => {
  setText('runtime-state', 'تعذر تحميل الدليل');
  document.getElementById('garden-grid').textContent =
    'تعذر تحميل بيانات الحدائق الآن.';
});
