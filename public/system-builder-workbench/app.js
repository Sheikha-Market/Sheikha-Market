'use strict';

const api = '/api/sheikha-platform/v1';

const productStateLabels = {
  VERIFIED: 'متحقق بالدليل',
  QEMU_VERIFIED_PHYSICAL_PENDING: 'QEMU متحقق · الفيزيائي منتظر'
};

function split(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.json();

  if (!response.ok) {
    const error = new Error(
      body.error ||
      body.data?.failedChecks?.join(', ') ||
      `HTTP ${response.status}`
    );

    error.body = body;
    throw error;
  }

  return body;
}

function renderInventory(summary) {
  document.getElementById('inventory').innerHTML =
    Object.entries(summary)
      .map(([name, count]) => `
        <article>
          <b>${count}</b>
          <span>${name}</span>
        </article>
      `)
      .join('');
}

function renderPlan(plan) {
  const summary = document.getElementById('summary');

  summary.classList.remove('empty');

  summary.innerHTML = `
    <b>${plan.blueprint.name}</b>
    <span>رقم الخطة: ${plan.planId}</span>
    <span>اللغة: ${plan.language.selected}</span>
    <span>
      التنفيذ:
      ${plan.governance.executionAuthorized
        ? 'مسموح'
        : 'محظور'}
    </span>
    <span>
      النشر:
      ${plan.governance.deploymentAuthorized
        ? 'مسموح'
        : 'محظور'}
    </span>
    <span>التالي: ${plan.nextAction}</span>
  `;

  document.getElementById('lifecycle').innerHTML =
    plan.lifecycle
      .map((stage) => `
        <article class="stage">
          <strong>${String(stage.order).padStart(2, '0')}</strong>
          <div>
            <b>${stage.stage}</b>
            <small>${stage.status}</small>
          </div>
        </article>
      `)
      .join('');
}

async function load() {
  const status = document.getElementById(
    'platformStatus'
  );

  try {
    const [response, productRuntime] = await Promise.all([
      request(`${api}/status`),
      request('/api/sheikha/product-runtime/v1/status')
    ]);

    status.textContent = response.ok
      ? 'المنصة واللغة جاهزتان للتخطيط المحكوم'
      : 'توجد بوابات تحتاج مراجعة';

    renderInventory(
      response.data.inventory.summary
    );

    for (const product of productRuntime.data.products) {
      const target = document.querySelector(
        `[data-product="${product.id}"] strong`
      );
      if (!target) continue;
      target.textContent =
        productStateLabels[product.status] || product.status;
      target.classList.add('ready');
    }
  } catch (error) {
    status.textContent =
      `تعذر التحقق: ${error.message}`;
  }
}

document
  .getElementById('blueprintForm')
  .addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    const payload = {
      name: data.get('name'),
      owner: data.get('owner'),
      purpose: data.get('purpose'),
      programmingLanguage:
        data.get('programmingLanguage'),
      targetEnvironment:
        data.get('targetEnvironment'),
      capabilities:
        split(data.get('capabilities')),
      tools:
        split(data.get('tools')),
      integrations:
        split(data.get('integrations')),
      constraints:
        split(data.get('constraints')),
      beneficiaries:
        split(data.get('beneficiaries'))
    };

    try {
      const response = await request(
        `${api}/workbench/plan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      renderPlan(response.data);
    } catch (error) {
      if (error.body?.data) {
        renderPlan(error.body.data);
        return;
      }

      document.getElementById('summary').textContent =
        `تعذر إنشاء الخطة: ${error.message}`;
    }
  });

load();
