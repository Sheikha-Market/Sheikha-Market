'use strict';

const API = '/api/sheikha/pastures-orchards-cultivation/v4';

function text(id, value) {
  document.getElementById(id).textContent = value;
}

function label(value) {
  return String(value || '-').replaceAll('_', ' ');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderStatus(data) {
  const status = document.getElementById('runtime-status');
  status.textContent = 'النظام يعمل';
  status.classList.add('ready');
  text('metric-total', data.metrics.totalPlots);
  text('metric-active', data.metrics.activePlots);
  text('metric-harvest', data.metrics.harvestReadyPlots);
  text('metric-propagation', data.metrics.propagationReadyPlots);

  document.getElementById('plots-body').innerHTML = data.plots.map((plot) => `
    <tr>
      <td><strong>${plot.nameAr}</strong></td>
      <td>${label(plot.path)}</td>
      <td>${label(plot.stage)}</td>
      <td class="${plot.harvest.ready ? 'ok' : 'held'}">${plot.harvest.ready ? 'جاهز' : 'قيد النمو'}</td>
      <td>${plot.harvest.blockers.map(label).join('، ') || 'لا يوجد'}</td>
    </tr>
  `).join('');

  document.getElementById('domain-grid').innerHTML =
    data.integratedHabitat.domains.map((domain) => `
      <article><h3>${domain.nameAr}</h3><p>${domain.includesAr.join('، ')}</p></article>
    `).join('');
}

function renderSacred(data) {
  document.getElementById('sacred-references').innerHTML =
    data.references.map((reference) =>
      `<li><strong>${reference.id}</strong> · ${reference.topicAr}</li>`
    ).join('');
}

function renderBalance(data) {
  const values = [
    ['الماء اليومي مع الاحتياطي', `${data.dailyDemand.totalWaterWithReserveLiters.toLocaleString('ar-SA')} لتر`],
    ['الغذاء اليومي', `${data.dailyDemand.foodKg.toLocaleString('ar-SA')} كجم`],
    ['الكهرباء اليومية', `${data.dailyDemand.electricityKwh.toLocaleString('ar-SA')} ك.و.س`],
    ['السكن والخدمات', `${data.areasM2.housingAndServices.toLocaleString('ar-SA')} م²`],
    ['البساتين والمحاصيل', `${data.areasM2.foodOrchardsAndCrops.toLocaleString('ar-SA')} م²`],
    ['المراعي', `${data.areasM2.grazingPastures.toLocaleString('ar-SA')} م²`]
  ];
  document.getElementById('balance-results').innerHTML = values.map(([name, value]) =>
    `<div><span>${name}</span><strong>${value}</strong></div>`
  ).join('');
}

function renderCompilation(data) {
  const graph = data.cultivationGraph;
  const plan = data.engineeringPlan;
  const review = data.admissionReview;
  const blockerItems = review.blockers.map((blocker) =>
    `<li>${escapeHtml(label(blocker))}</li>`
  ).join('');
  const inputItems = review.evidence.unresolvedEngineeringInputs.map((input) =>
    `<li>${escapeHtml(label(input))}</li>`
  ).join('');
  document.getElementById('compiler-output').innerHTML = `
    <dl>
      <dt>اللغة</dt><dd>شيخة .shk</dd>
      <dt>التصريح الجذر</dt><dd>${escapeHtml(data.declaration)}</dd>
      <dt>حالة فحص الأنواع</dt><dd class="${data.typeCheck.ok ? 'ok' : 'held'}">${data.typeCheck.ok ? 'ناجح' : 'مرفوض'}</dd>
      <dt>العقد والعلاقات</dt><dd>${graph.nodes.length} عقدة · ${graph.edges.length} علاقة</dd>
      <dt>المراجع المفقودة</dt><dd>${graph.unresolvedReferences.length}</dd>
      <dt>الحالة الهندسية</dt><dd>${escapeHtml(label(plan.status))}</dd>
      <dt>قرار القبول</dt><dd class="${review.decision === 'BLOCKED' ? 'held' : 'ok'}">${escapeHtml(label(review.decision))}</dd>
      <dt>البوابة التالية</dt><dd>${escapeHtml(label(review.nextGate))}</dd>
      <dt>التنفيذ</dt><dd class="held">غير مصرح ولم يحدث</dd>
    </dl>
    <h3>موانع القبول (${review.blockers.length})</h3>
    <ul>${blockerItems || '<li class="ok">لا توجد موانع</li>'}</ul>
    <h3>مدخلات هندسية تحتاج دليلًا (${review.evidence.unresolvedEngineeringInputCount})</h3>
    <ul>${inputItems || '<li class="ok">مكتملة</li>'}</ul>
    <h3>دورة النمو</h3>
    <ul>${graph.continuousCycle.map((stage) => `<li>${escapeHtml(label(stage))}</li>`).join('')}</ul>
  `;
}

function renderCompileError(error) {
  const diagnostics = error.diagnostics || [];
  document.getElementById('compiler-output').innerHTML = `
    <p class="held">تعذرت الترجمة: ${escapeHtml(error.message || error.error || 'خطأ غير معروف')}</p>
    <ul>${diagnostics.map((entry) =>
      `<li><strong>${escapeHtml(entry.code)}</strong> · ${escapeHtml(entry.message)}</li>`
    ).join('')}</ul>
  `;
}

async function getJson(path, options) {
  const response = await fetch(`${API}${path}`, options);
  const body = await response.json();
  if (!response.ok || !body.ok) {
    const error = new Error(body.message || body.error || 'REQUEST_FAILED');
    error.error = body.error;
    error.diagnostics = body.diagnostics || [];
    throw error;
  }
  return body.data;
}

async function load() {
  try {
    const [status, sacred] = await Promise.all([
      getJson('/status'),
      getJson('/sacred-references')
    ]);
    renderStatus(status);
    renderSacred(sacred);
    renderBalance(status.integratedHabitat.planningExample);
  } catch (_error) {
    const status = document.getElementById('runtime-status');
    status.textContent = 'تعذر الاتصال';
    status.classList.remove('ready');
  }
}

document.getElementById('refresh').addEventListener('click', load);
document.getElementById('balance-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const payload = Object.fromEntries(
    [...form.entries()].map(([key, value]) => [key, Number(value)])
  );
  try {
    const data = await getJson('/habitat/resource-balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    renderBalance(data);
  } catch (_error) {
    document.getElementById('balance-results').innerHTML =
      '<div><span>النتيجة</span><strong class="held">راجع المدخلات</strong></div>';
  }
});

document.getElementById('compile-source').addEventListener('click', async () => {
  const button = document.getElementById('compile-source');
  button.disabled = true;
  button.textContent = 'جار الترجمة';
  try {
    const data = await getJson('/language/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: document.getElementById('sheikha-source').value
      })
    });
    renderCompilation(data);
  } catch (error) {
    renderCompileError(error);
  } finally {
    button.disabled = false;
    button.textContent = 'ترجم البرنامج';
  }
});

load();
