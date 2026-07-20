'use strict';

const state = {
  catalog: null,
  domains: new Map(),
};

const elements = {
  allCount: document.getElementById('allCount'),
  publicCount: document.getElementById('publicCount'),
  canonicalCount: document.getElementById('canonicalCount'),
  domainCount: document.getElementById('domainCount'),
  domainSelect: document.getElementById('domainSelect'),
  emptyState: document.getElementById('emptyState'),
  registryState: document.getElementById('registryState'),
  registryStateBox: document.querySelector('.registry-state'),
  resultCount: document.getElementById('resultCount'),
  routeRows: document.getElementById('routeRows'),
  searchInput: document.getElementById('searchInput'),
};

function escapeHtml(value) {
  const element = document.createElement('span');
  element.textContent = String(value || '');
  return element.innerHTML;
}

function filteredPages() {
  const search = elements.searchInput.value.trim().toLocaleLowerCase('ar');
  const domain = elements.domainSelect.value;
  return state.catalog.pages.filter((page) => {
    if (domain && page.domain !== domain) return false;
    if (!search) return true;
    return `${page.title} ${page.h1 || ''} ${page.route}`
      .toLocaleLowerCase('ar')
      .includes(search);
  });
}

function renderPages() {
  const pages = filteredPages();
  elements.resultCount.textContent = `${pages.length} نتيجة`;
  elements.emptyState.hidden = pages.length > 0;
  elements.routeRows.innerHTML = pages.map((page) => {
    const domain = state.domains.get(page.domain);
    const ready = page.readiness === 'ROUTE_READY';
    return `
      <div class="route-row" role="row">
        <span class="route-title" role="cell">${escapeHtml(page.title)}</span>
        <span class="route-domain" role="cell">${escapeHtml(domain?.labelAr || page.domain)}</span>
        <span class="route-path" role="cell">${escapeHtml(page.route)}</span>
        <span class="route-status${ready ? '' : ' review'}" role="cell">
          ${ready ? 'جاهز' : 'تحت المراجعة'}
        </span>
        <a class="open-route" href="${encodeURI(page.route)}" aria-label="فتح ${escapeHtml(page.title)}">↗</a>
      </div>
    `;
  }).join('');
}

async function loadCatalog() {
  const response = await fetch('/site-map/catalog.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`catalog ${response.status}`);
  state.catalog = await response.json();
  state.domains = new Map(
    state.catalog.domains.map((domain) => [domain.id, domain])
  );

  elements.allCount.textContent = state.catalog.summary.discoveredHtmlPages;
  elements.publicCount.textContent = state.catalog.summary.publicPages;
  elements.canonicalCount.textContent =
    state.catalog.summary.publicCanonicalPages;
  elements.domainCount.textContent = state.catalog.domains.length;
  elements.domainSelect.insertAdjacentHTML(
    'beforeend',
    state.catalog.domains
      .filter((domain) => domain.publicPageCount > 0)
      .map((domain) => `
        <option value="${escapeHtml(domain.id)}">
          ${escapeHtml(domain.labelAr)} (${domain.publicPageCount})
        </option>
      `)
      .join('')
  );
  elements.registryState.textContent = 'السجل متصل';
  elements.registryStateBox.classList.add('ready');
  renderPages();
}

elements.searchInput.addEventListener('input', renderPages);
elements.domainSelect.addEventListener('change', renderPages);

loadCatalog().catch(() => {
  elements.registryState.textContent = 'السجل غير متاح';
  elements.emptyState.hidden = false;
  elements.emptyState.textContent = 'تعذر تحميل سجل الصفحات.';
});
