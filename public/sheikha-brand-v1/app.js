'use strict';

const runtimeStatus = document.getElementById('runtimeStatus');
const runtimeDot = document.getElementById('runtimeDot');
const pageCount = document.getElementById('pageCount');
const routeCount = document.getElementById('routeCount');
const domainCount = document.getElementById('domainCount');
const productCount = document.getElementById('productCount');

const productStateLabels = {
  VERIFIED: 'متحقق بالدليل',
  QEMU_VERIFIED_PHYSICAL_PENDING: 'QEMU متحقق · الفيزيائي منتظر',
};

async function readJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.json();
}

async function activateRuntimeStatus() {
  const [health, registry, products] = await Promise.all([
    readJson('/api/health'),
    readJson('/api/site-registry/v2/status'),
    readJson('/api/sheikha/product-runtime/v1/status'),
  ]);
  const healthy = health.success === true &&
    health.data?.status === 'ok' &&
    registry.ok === true &&
    products.ok === true;
  runtimeStatus.textContent = healthy
    ? 'المنظومة المحلية تعمل'
    : 'تشغيل جزئي';
  runtimeDot.classList.toggle('ready', healthy);
  pageCount.textContent = registry.data.counts.discoveredHtmlPages;
  routeCount.textContent = registry.data.counts.publicCanonicalPages;
  domainCount.textContent = registry.data.counts.domains;
  productCount.textContent = products.data.products.length;

  for (const product of products.data.products) {
    const item = document.querySelector(`[data-product="${product.id}"]`);
    const status = item?.querySelector('b');
    if (!status) continue;
    status.textContent = productStateLabels[product.status] || product.status;
    status.dataset.state = product.status;
  }
}

activateRuntimeStatus().catch(() => {
  runtimeStatus.textContent = 'تعذر قراءة حالة التشغيل';
});
