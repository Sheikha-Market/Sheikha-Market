'use strict';

const state = {
  gardens: [],
};

const statusLabels = {
  VERIFIED: 'متحقق بالدليل',
  QEMU_VERIFIED_PHYSICAL_PENDING: 'QEMU متحقق · الفيزيائي منتظر',
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

function createDetail(term, values) {
  const wrapper = document.createElement('div');
  const title = document.createElement('dt');
  const content = document.createElement('dd');
  title.textContent = term;
  content.textContent = values.join(' · ');
  wrapper.append(title, content);
  return wrapper;
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
    const role = document.createElement('span');
    const title = document.createElement('h3');
    const description = document.createElement('p');
    const details = document.createElement('dl');
    role.textContent = garden.role.replaceAll('_', ' ');
    title.textContent = garden.name;
    description.textContent = garden.symbolicMeaning;
    details.append(
      createDetail('الأشجار', garden.trees),
      createDetail('الأنهار الرمزية', garden.rivers),
      createDetail('الثمار', garden.fruits)
    );
    card.append(role, title, description, details);
    container.append(card);
  }
}

function populateFilter(gardens) {
  const filter = document.getElementById('garden-filter');
  for (const garden of gardens) {
    const option = document.createElement('option');
    option.value = garden.id;
    option.textContent = garden.name;
    filter.append(option);
  }
}

async function activate() {
  const [model, runtime] = await Promise.all([
    readJson('/sheikha-jannat-gardens/sheikha-jannat-gardens-v1.json'),
    readJson('/api/sheikha/product-runtime/v1/status'),
  ]);
  state.gardens = model.gardens;
  setText('garden-count', model.metrics.gardens);
  setText('tree-count', model.metrics.trees);
  setText('river-count', model.metrics.rivers);
  setText('fruit-count', model.metrics.fruits);
  setText('garden-boundary', model.boundary.boundaryArabic +
    ' مرجعية القيم معلنة، والأحكام الشرعية تحتاج مراجعة بشرية مؤهلة؛ لا فتوى آلية.');
  setText('runtime-state', 'السجل والتكامل متحققان');
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

activate().catch(() => {
  setText('runtime-state', 'تعذر تحميل السجل');
  document.getElementById('garden-grid').textContent =
    'تعذر تحميل بيانات الحدائق الآن.';
});
