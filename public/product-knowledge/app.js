'use strict';

async function fetchJson(url, options = {}) {
  const response = await fetch(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(), {
    cache: 'no-store',
    ...options
  });

  const text = await response.text();

  try {
    return {
      httpStatus: response.status,
      ok: response.ok,
      payload: JSON.parse(text)
    };
  } catch (error) {
    return {
      httpStatus: response.status,
      ok: response.ok,
      payload: { success: false, error: 'NON_JSON_RESPONSE', body: text }
    };
  }
}

async function loadStatus() {
  const result = await fetchJson('/api/product-knowledge/status');
  document.getElementById('status').textContent = result.payload.data?.status || 'UNKNOWN';
  document.getElementById('system').textContent = result.payload.data?.system || 'UNKNOWN';
}

async function validateProduct() {
  const raw = document.getElementById('productInput').value;
  let product;

  try {
    product = JSON.parse(raw);
  } catch (error) {
    document.getElementById('result').textContent = 'JSON غير صحيح: ' + error.message;
    return;
  }

  const decision = await fetchJson('/api/product-knowledge/decision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });

  const classification = await fetchJson('/api/product-knowledge/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });

  let registration = null;

  if (decision.payload?.data?.finalDecision === 'APPROVED') {
    registration = await fetchJson('/api/product-knowledge/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...product,
        category: classification.payload?.data?.detectedCategory || product.category,
        status: 'APPROVED'
      })
    });

    if (registration.payload?.data?.id) {
      registration.auditTrail = await fetchJson(
        `/api/product-knowledge/products/${registration.payload.data.id}/audit`
      );
      registration.versionHistory = await fetchJson(
        `/api/product-knowledge/products/${registration.payload.data.id}/history`
      );
    }
  }

  document.getElementById('result').textContent = JSON.stringify({
    decision,
    classification,
    registration
  }, null, 2);
}

async function searchProducts() {
  const q = encodeURIComponent(document.getElementById('searchInput').value || '');
  const category = encodeURIComponent(document.getElementById('categoryInput').value || '');
  const result = await fetchJson(`/api/product-knowledge/search?q=${q}&category=${category}`);
  document.getElementById('catalogResult').textContent = JSON.stringify(result, null, 2);
}

window.validateProduct = validateProduct;
window.searchProducts = searchProducts;

loadStatus().catch((error) => {
  document.getElementById('result').textContent = 'تعذر التحميل: ' + error.message;
});
