'use strict';

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

function layerCard(layer) {
  return `
    <article class="layer" data-layer-id="${layer.id}">
      <b>${layer.arabicName}</b>
      <small>${layer.name}</small>
      <span class="badge">${layer.status}</span>
    </article>
  `;
}

async function loadArchitecture() {
  const statusPayload = await fetchJson('/api/enterprise-architecture/status');
  const registryPayload = await fetchJson('/api/enterprise-architecture/registry');

  const status = statusPayload.data.status;
  const registry = registryPayload.data.registry;

  document.getElementById('status').textContent = status.status;
  document.getElementById('version').textContent = status.system + ' · ' + status.version;
  document.getElementById('layersCount').textContent = status.layers;
  document.getElementById('activeLayers').textContent = status.activeLayers;
  document.getElementById('principles').textContent = status.principles;
  document.getElementById('integrations').textContent = status.integrations;

  const layersRoot = document.getElementById('layers');
  layersRoot.innerHTML = registry.map(layerCard).join('');

  layersRoot.querySelectorAll('.layer').forEach((node) => {
    node.addEventListener('click', async () => {
      const id = node.getAttribute('data-layer-id');
      const payload = await fetchJson(`/api/enterprise-architecture/layers/${id}`);
      document.getElementById('details').textContent =
        JSON.stringify(payload.data.layer, null, 2);
    });
  });
}

loadArchitecture().catch((error) => {
  document.getElementById('details').textContent =
    'تعذر تحميل المعمارية: ' + error.message;
});
