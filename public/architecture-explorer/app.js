'use strict';

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function layerCard(layer, index) {
  const subtitle = layer.id === 'ummah-benefit-value-layer'
    ? 'طبقة النفع والقيم'
    : layer.name;

  return `
    <article class="layer" data-layer-id="${layer.id}">
      <div class="index">${String(index + 1).padStart(2, '0')}</div>
      <b>${layer.arabicName}</b>
      <small>${layer.id === 'ummah-benefit-value-layer' ? 'طبقة النفع والقيم' : layer.name}</small>
      <span class="badge">${layer.status}</span>
    </article>
  `;
}

function list(items) {
  if (!items || !items.length) return '<span class="empty">لا يوجد</span>';
  return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}



function renderDependencyGraph(registry) {
  const byDependency = new Map();

  registry.forEach((layer) => {
    (layer.dependencies || []).forEach((dep) => {
      if (!byDependency.has(dep)) byDependency.set(dep, []);
      byDependency.get(dep).push(layer);
    });
  });

  const roots = registry.filter((layer) => !layer.dependencies || layer.dependencies.length === 0);

  function renderNode(layer, depth = 0) {
    const children = byDependency.get(layer.id) || [];
    return `
      <div class="tree-node" style="--depth:${depth}">
        <div class="tree-card" data-layer-id="${layer.id}">
          <b>${layer.arabicName}</b>
          <small>${layer.name}</small>
        </div>
        ${children.length ? '<div class="tree-line">↓</div>' : ''}
        ${children.map((child) => renderNode(child, depth + 1)).join('')}
      </div>
    `;
  }

  const graph = document.getElementById('dependencyGraph');
  graph.innerHTML = roots.map((root) => renderNode(root)).join('');

  graph.querySelectorAll('.tree-card').forEach((node) => {
    node.addEventListener('click', async () => {
      graph.querySelectorAll('.tree-card').forEach((n) => n.classList.remove('selected-tree'));
      node.classList.add('selected-tree');

      const id = node.getAttribute('data-layer-id');
      const payload = await fetchJson(`/api/enterprise-architecture/layers/${id}`);
      document.getElementById('details').innerHTML = renderLayerDetails(payload.data.layer);
    });
  });
}


function renderLayerDetails(layer) {
  return `
    <div class="detail-card">
      <div class="detail-head">
        <span class="badge">${layer.status}</span>
        <h3>${layer.arabicName}</h3>
        <p>${layer.name}</p>
      </div>

      <div class="detail-section">
        <h4>الغرض</h4>
        <p>${layer.purpose || 'غير محدد'}</p>
      </div>

      <div class="detail-grid">
        <section>
          <h4>المسؤوليات</h4>
          ${list(layer.responsibilities)}
        </section>

        <section>
          <h4>القدرات</h4>
          ${list(layer.capabilities)}
        </section>

        <section>
          <h4>التبعيات</h4>
          ${list(layer.dependencies)}
        </section>
      </div>
    </div>
  `;
}

async function loadArchitecture() {
  const statusPayload = await fetchJson('/api/enterprise-architecture/status');
  const registryPayload = await fetchJson('/api/enterprise-architecture/registry');

  const status = statusPayload.data.status;
  const registry = registryPayload.data.registry;

  document.getElementById('status').textContent = status.status;
  document.getElementById('version').textContent = `${status.system} · ${status.version}`;
  document.getElementById('layersCount').textContent = status.layers;
  document.getElementById('activeLayers').textContent = status.activeLayers;
  document.getElementById('principles').textContent = status.principles;
  document.getElementById('integrations').textContent = status.integrations;

  const layersRoot = document.getElementById('layers');
  layersRoot.innerHTML = registry.map(layerCard).join('');
  renderDependencyGraph(registry);

  layersRoot.querySelectorAll('.layer').forEach((node) => {
    node.addEventListener('click', async () => {
      layersRoot.querySelectorAll('.layer').forEach((n) => n.classList.remove('selected'));
      node.classList.add('selected');

      const id = node.getAttribute('data-layer-id');
      const payload = await fetchJson(`/api/enterprise-architecture/layers/${id}`);
      document.getElementById('details').innerHTML = renderLayerDetails(payload.data.layer);
    });
  });

  const first = layersRoot.querySelector('.layer');
  if (first) first.click();
}

loadArchitecture().catch((error) => {
  document.getElementById('details').textContent = `تعذر تحميل المعمارية: ${error.message}`;
});
