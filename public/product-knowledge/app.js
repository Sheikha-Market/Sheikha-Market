'use strict';

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const payload = await response.json();
  return payload;
}

async function loadStatus() {
  const payload = await fetchJson('/api/product-knowledge/status');
  document.getElementById('status').textContent = payload.data.status;
  document.getElementById('system').textContent = payload.data.system;
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

  const payload = await fetchJson('/api/product-knowledge/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });

  document.getElementById('result').textContent = JSON.stringify(payload, null, 2);
}

loadStatus().catch((error) => {
  document.getElementById('result').textContent = 'تعذر التحميل: ' + error.message;
});
