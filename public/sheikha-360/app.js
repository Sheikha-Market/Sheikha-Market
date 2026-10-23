'use strict';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const money = new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 });

function setBusy(button, busy, label) {
  button.disabled = busy;
  if (!button.dataset.label) button.dataset.label = button.textContent;
  button.textContent = busy ? label : button.dataset.label;
}

async function getJson(path) {
  const response = await fetch(path, { headers: { accept: 'application/json' } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.data?.status || payload.error || `HTTP_${response.status}`);
  return payload;
}

function activateView(name) {
  let activeButton;
  $$('.nav-button').forEach((button) => {
    const active = button.dataset.view === name;
    button.classList.toggle('active', active);
    if (active) activeButton = button;
  });
  $$('.view').forEach((view) => view.classList.toggle('active', view.id === `view-${name}`));
  history.replaceState(null, '', `#${name}`);
  activeButton?.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' });
}

async function loadStatus() {
  const connection = $('.live-state');
  $('#connectionText').textContent = 'جارٍ الاتصال';
  try {
    const payload = await getJson('/api/sheikha/commercial-os/v1/status');
    const data = payload.data;
    connection.classList.add('online');
    $('#connectionText').textContent = 'متصل بالمحرك الحي';
    $('#operatingState').textContent = 'نشط ومحكوم';
    $('#offerCount').textContent = data.offerCount;
    $('#segmentCount').textContent = data.segments.length;
    $('#gateCount').textContent = data.releaseGates.length;
    $('#methodList').innerHTML = data.methodologies.map((item) => `<article><b>${item.id}</b><p>${item.use.replaceAll('_', ' ')}</p></article>`).join('');
    const runtime = payload.runtime;
    $('#runtimeEvidence').textContent = `${runtime.evidencePresentCount}/${runtime.componentCount} دليل مصدر`;
    $('#runtimeGrid').replaceChildren(...runtime.components.map((component) => {
      const item = document.createElement('article');
      const mark = document.createElement('i');
      const copy = document.createElement('div');
      const title = document.createElement('strong');
      const detail = document.createElement('span');
      mark.className = component.evidencePresent ? 'verified' : 'missing';
      title.textContent = component.labelAr;
      detail.textContent = component.evidencePresent ? 'دليل المصدر موجود' : 'دليل المصدر مفقود';
      copy.append(title, detail);
      item.append(mark, copy);
      return item;
    }));
    $('#runtimeBoundary').textContent = runtime.release.generalAvailabilityAllowed
      ? 'اجتازت المنظومة بوابة الإصدار العام.'
      : `التكامل المحلي نشط، والإطلاق العام ينتظر ${runtime.release.gates.length} بوابات موثقة.`;
  } catch (error) {
    connection.classList.remove('online');
    $('#connectionText').textContent = 'تعذر الاتصال';
    $('#operatingState').textContent = 'بحاجة للفحص';
    $('#runtimeEvidence').textContent = 'تعذر الفحص';
  }
}

async function calculateFeasibility(event) {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  const params = new URLSearchParams(new FormData(event.currentTarget));
  params.set('vatRate', '0.15');
  setBusy(button, true, 'جارٍ الحساب');
  try {
    const payload = await getJson(`/api/sheikha/commercial-os/v1/feasibility?${params}`);
    const data = payload.data;
    const result = data.scenario;
    $('#operatingResult').textContent = money.format(result.operatingResultSar);
    $('#resultDecision').textContent = data.decision === 'ECONOMICALLY_POSITIVE_UNDER_ASSUMPTIONS' ? 'موجب تحت الافتراضات المدخلة' : 'لم يصل إلى نقطة التعادل';
    $('#revenue').textContent = money.format(result.revenueExcludingVatSar);
    $('#margin').textContent = `${result.contributionMarginPercent}%`;
    $('#breakEven').textContent = result.breakEvenCustomers === null ? 'غير متاح' : `${result.breakEvenCustomers} عميل`;
    $('#invoiceTotal').textContent = money.format(result.invoiceTotalSar);
  } catch (error) {
    $('#resultDecision').textContent = `تعذر الحساب: ${error.message}`;
  } finally { setBusy(button, false); }
}

async function evaluateExperiment(event) {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  const params = new URLSearchParams(new FormData(event.currentTarget));
  setBusy(button, true, 'جارٍ التقييم');
  try {
    const payload = await getJson(`/api/sheikha/commercial-os/v1/experiment?${params}`);
    const data = payload.data;
    $('#experimentStatus').textContent = data.status === 'CANDIDATE_ELIGIBLE_FOR_HUMAN_REVIEW' ? 'مؤهل للمراجعة البشرية' : 'توقف أو ارفض';
    $('#improvement').textContent = `${data.result.improvementPercent}%`;
    $('#experimentNote').textContent = data.humanApprovalRequired ? 'التحسن مثبت حسابيًا، والترقية تنتظر المراجعة البشرية.' : 'لم يجتز المرشح شروط التحسن وعدم الانحدار.';
  } catch (error) {
    $('#experimentStatus').textContent = 'أدلة التجربة غير مكتملة';
    $('#experimentNote').textContent = error.message;
  } finally { setBusy(button, false); }
}

async function evaluateExperience5D(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button');
  const value = (name) => Number(form.elements[name].value);
  const environments = [...form.querySelectorAll('input[name="environment"]:checked')].map((input) => input.value);
  const payload = {
    baseline: { value: value('baselineValue'), usability: value('baselineUsability'), trust: value('baselineTrust'), context: value('baselineContext'), time: value('baselineTime') },
    candidate: { value: value('candidateValue'), usability: value('candidateUsability'), trust: value('candidateTrust'), context: value('candidateContext'), time: value('candidateTime') },
    environments,
    consentGranted: $('#experienceConsent').checked,
    minimumImprovement: 3,
    regressionTolerance: 0,
  };
  setBusy(button, true, 'جارٍ القياس');
  try {
    const response = await fetch('/api/sheikha/commercial-os/v1/experience-5d/evaluate', {
      method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error((result.data?.blockers || []).join('، ') || `HTTP_${response.status}`);
    const data = result.data;
    $('#baseline5d').textContent = data.assessment.baselineScore;
    $('#candidate5d').textContent = data.assessment.candidateScore;
    $('#delta5d').textContent = `${data.assessment.delta >= 0 ? '+' : ''}${data.assessment.delta}`;
    $('#decision5d').textContent = data.controlledTrialAllowed ? 'المرشح مؤهل لتجربة محدودة بعد المراجعة' : `احتفظ بخط الأساس${data.assessment.regressions.length ? '، يوجد انحدار في أحد المحاور' : ''}`;
  } catch (error) {
    $('#decision5d').textContent = `تعذر التقييم: ${error.message}`;
  } finally { setBusy(button, false); }
}

function addMessage(role, text, error = false) {
  const item = document.createElement('div');
  item.className = `message ${role}${error ? ' error' : ''}`;
  const label = document.createElement('span');
  label.textContent = role === 'user' ? 'أنت' : 'شيخة';
  const body = document.createElement('p');
  body.textContent = text;
  item.append(label, body);
  $('#messages').append(item);
  $('#messages').scrollTop = $('#messages').scrollHeight;
  return body;
}

async function sendChat(event) {
  event.preventDefault();
  const input = $('#chatInput');
  const prompt = input.value.trim();
  if (!prompt) return;
  const button = event.currentTarget.querySelector('button');
  const audience = $('#audienceProfile').value;
  const domain = $('#chatDomain').value;
  addMessage('user', prompt);
  input.value = '';
  button.disabled = true;
  const pending = addMessage('assistant', 'جارٍ إعداد إجابة موثقة...');
  try {
    const response = await fetch('/api/sheikha/commercial-os/v1/public-chat', {
      method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ message: prompt, prompt, audienceProfile: audience, domain, guardianConsent: $('#guardianConsent').checked }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || payload.error || `HTTP_${response.status}`);
    const result = payload.data || payload;
    pending.textContent = result.answer || result.output || result.response || result.message || result.reply || result.data?.answer || result.data?.output || 'وصل الطلب، لكن لم يرجع المحرك نصًا قابلًا للعرض.';
  } catch (error) {
    pending.parentElement.classList.add('error');
    pending.textContent = `تعذر إكمال الرد الآن: ${error.message}. لم تُفقد رسالتك من هذه الشاشة.`;
  } finally { button.disabled = false; input.focus(); }
}

$$('.nav-button').forEach((button) => button.addEventListener('click', () => activateView(button.dataset.view)));
$('#refreshButton').addEventListener('click', loadStatus);
$('#feasibilityForm').addEventListener('submit', calculateFeasibility);
$('#experimentForm').addEventListener('submit', evaluateExperiment);
$('#experienceForm').addEventListener('submit', evaluateExperience5D);
$('#chatForm').addEventListener('submit', sendChat);
$('#audienceProfile').addEventListener('change', (event) => {
  const child = event.target.value === 'child';
  $('#guardianControl').classList.toggle('visible', child);
  if (!child) $('#guardianConsent').checked = false;
});

activateView(location.hash.slice(1) || 'overview');
loadStatus();
$('#feasibilityForm').requestSubmit();
$('#experienceForm').requestSubmit();
