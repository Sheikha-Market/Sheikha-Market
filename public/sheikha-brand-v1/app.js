'use strict';

const runtimeStatus = document.getElementById('runtimeStatus');
const runtimeDot = document.getElementById('runtimeDot');
const pageCount = document.getElementById('pageCount');
const routeCount = document.getElementById('routeCount');
const domainCount = document.getElementById('domainCount');

async function readJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.json();
}

async function activateRuntimeStatus() {
  const [health, registry] = await Promise.all([
    readJson('/api/health'),
    readJson('/api/site-registry/v2/status'),
  ]);
  const healthy = health.success === true &&
    health.data?.status === 'ok' &&
    registry.ok === true;
  runtimeStatus.textContent = healthy
    ? 'المنظومة المحلية تعمل'
    : 'تشغيل جزئي';
  runtimeDot.classList.toggle('ready', healthy);
  pageCount.textContent = registry.data.counts.discoveredHtmlPages;
  routeCount.textContent = registry.data.counts.publicCanonicalPages;
  domainCount.textContent = registry.data.counts.domains;
}

activateRuntimeStatus().catch(() => {
  runtimeStatus.textContent = 'تعذر قراءة حالة التشغيل';
});
