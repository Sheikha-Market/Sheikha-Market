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

  const result = await fetchJson('/api/product-knowledge/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });

  document.getElementById('result').textContent = JSON.stringify(result, null, 2);
}

window.validateProduct = validateProduct;

loadStatus().catch((error) => {
  document.getElementById('result').textContent = 'تعذر التحميل: ' + error.message;
});
