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
  const byId = new Map(registry.map((layer) => [layer.id, layer]));
  const rows = registry.map((layer) => {
    const deps = (layer.dependencies || []).map((dep) => {
      const depLayer = byId.get(dep);
      return depLayer ? depLayer.arabicName : dep;
    });

    return `
      <div class="graph-row">
        <div class="graph-node">
          <b>${layer.arabicName}</b>
          <small>${layer.name}</small>
        </div>
        <div class="graph-arrow">←</div>
        <div class="graph-deps">
          ${deps.length ? deps.map((d) => `<span>${d}</span>`).join('') : '<span>طبقة تأسيسية</span>'}
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('dependencyGraph').innerHTML = rows;
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
