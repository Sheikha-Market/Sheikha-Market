import { createRobotScene } from './robot-scene.mjs';

const $ = id => document.getElementById(id), API = '/api/sheikha/workspace/v1';
let catalog, parameters, blueprint, scene, session, playing = false, stopped = false, elapsed = 0, last = 0, pending = false, revision = 0, activeJob;
const labels = { RENDERING: 'يجري توليد الفيديو', WORKER_UNVERIFIED: 'حالة عامل الإخراج غير متحققة', FAILED: 'تعذر الإخراج', DRAFT_REQUIRES_HUMAN_REVIEW: 'جاهز للمراجعة', LOCAL: 'محلي', SIMULATION_ONLY: 'محاكاة', LOCAL_RENDERER: 'إخراج محلي', REQUIRED: 'مراجعة مطلوبة', BLOCKED: 'غير مفعّل', OFFLINE_ONLY: 'تبادل ملفات محلي', UNKNOWN: 'غير محدد' };
const errorLabels = { RENDER_BUSY: 'هناك عملية إخراج قيد التنفيذ.', RENDER_LOCKED: 'خط الإخراج مقفل. يلزم التحقق من العملية السابقة.', LOCAL_JOB_QUOTA_REACHED: 'وصل السجل إلى حد 24 عملية. يلزم أرشفة إدارية قبل المزيد.', RENDER_DEPENDENCIES_UNAVAILABLE: 'أدوات الإخراج المحلية غير متاحة.', RATE_LIMITED: 'طلبات كثيرة؛ انتظر قليلًا ثم أعد المحاولة.' };
async function api(route, body) {
  if (body && !session) session = (await (await fetch(API + '/session')).json()).token;
  const response = await fetch(API + route, { method: body ? 'POST' : 'GET', headers: body ? { 'Content-Type': 'application/json', 'X-Sheikha-Session': session } : {}, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(15000) });
  const data = await response.json(); if (!response.ok) throw Error(errorLabels[data.error] || 'تعذر إتمام الطلب المحلي.'); return data;
}
function download(data, name) { const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
function element(tag, text, className) { const el = document.createElement(tag); if (text) el.textContent = text; if (className) el.className = className; return el; }
function tab(id) {
  for (const button of document.querySelectorAll('[data-panel]')) { const active = button.dataset.panel === id; button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1; $('panel-' + button.dataset.panel).hidden = !active; }
  if (id !== 'production') $('job-player').pause();
}
for (const button of document.querySelectorAll('[data-panel]')) {
  button.addEventListener('click', () => tab(button.dataset.panel));
  button.addEventListener('keydown', event => { const list = [...document.querySelectorAll('[data-panel]')], current = list.indexOf(button); let next;
    if (event.key === 'ArrowLeft') next = (current + 1) % list.length; if (event.key === 'ArrowRight') next = (current + list.length - 1) % list.length;
    if (event.key === 'Home') next = 0; if (event.key === 'End') next = list.length - 1;
    if (next !== undefined) { event.preventDefault(); tab(list[next].dataset.panel); list[next].focus(); }
  });
}
function updateTools() {
  const family = catalog.families.find(item => item.id === parameters.family);
  if (!family.tools.includes(parameters.tool)) parameters.tool = family.tools[0];
  $('robot-tool').replaceChildren(...family.tools.map(id => new Option(catalog.tools.find(t => t.id === id).name, id)));
  $('robot-tool').value = parameters.tool;
}
function showBlueprint(data) {
  $('robot-title').textContent = data.title; $('robot-code').textContent = data.code;
  const fields = [['الملف', data.controller.profile], ['المحاور التصورية', data.controller.conceptualAxes.join('، ')], ['الحساسات المقترحة', data.controller.expectedSensors.join('، ')], ['العتاد والبروتوكول', 'غير محددين'], ['Firmware', 'لم يُنفّذ'], ['فحص آلة الحالات', data.simulation.success ? 'نجحت المحاكاة المحلية' : 'يلزم التحقق']];
  $('controller-facts').replaceChildren(...fields.map(([key, value]) => { const row = element('div'); row.append(element('dt', key), element('dd', value)); return row; }));
  $('robot-assembly').replaceChildren(...data.assembly.map(part => { const row = element('div', '', 'record'); row.append(element('span', part.name), element('small', 'مواصفات هندسية مطلوبة')); return row; }));
}
async function update() {
  if (!parameters) return;
  const request = ++revision; blueprint = null; $('robot-export').disabled = true; $('render-video').disabled = true;
  $('robot-scale-value').textContent = parameters.scale.toFixed(2);
  for (const button of document.querySelectorAll('[data-finish]')) button.setAttribute('aria-pressed', String(button.dataset.finish === parameters.finish));
  elapsed = 0; playing = false; updatePlay();
  scene?.setDesign(parameters); scene?.setWireframe($('robot-wire').checked);
  $('design-status').textContent = 'جارٍ إعداد ملف التصميم';
  try { const data = await api('/studio/design', parameters); if (request !== revision) return; blueprint = data; showBlueprint(data); $('design-status').textContent = 'تصميم محلي · قيد المراجعة'; $('robot-export').disabled = false; $('render-video').disabled = !catalog.renderer.available || catalog.busy || pending; }
  catch (error) { if (request === revision) $('design-status').textContent = error.message; }
}
function updatePlay() { $('robot-play').querySelector('img').src = `/architecture-explorer/icons/${playing ? 'pause' : 'play'}.svg`; $('robot-play').title = playing ? 'إيقاف الحركة مؤقتًا' : 'تشغيل الحركة'; $('robot-play').setAttribute('aria-label', $('robot-play').title); $('robot-play').disabled = stopped || !scene; $('robot-state').textContent = stopped ? 'توقف افتراضي مثبت' : playing ? 'حركة تصورية' : 'متوقف'; }
function animate(time) {
  if (playing && !document.hidden) elapsed += Math.min((time - last) / 1000 || 0, 0.08); last = time;
  if (!document.hidden) scene?.frame(elapsed);
  requestAnimationFrame(animate);
}
function showJobs(jobs) {
  $('robot-jobs').replaceChildren(...jobs.map(job => {
    const row = element('div', '', 'record'), text = element('div', job.title);
    text.append(element('small', `${labels[job.status] || job.status} · ${new Date(job.createdAt).toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}`)); row.append(text);
    if (job.status === 'DRAFT_REQUIRES_HUMAN_REVIEW') {
      const actions = element('div', '', 'job-actions'), preview = element('button', 'معاينة');
      const base = `${API}/studio/jobs/${job.id}/`;
      preview.addEventListener('click', () => { const v = $('job-player'); v.pause(); v.src = base + 'video.mp4'; v.poster = base + 'poster.png'; v.hidden = false; v.scrollIntoView({ block: 'center', behavior: 'auto' }); }); actions.append(preview);
      for (const [file, title] of [['video.mp4', 'MP4'], ['blueprint.json', 'التصميم'], ['evidence.json', 'دليل الفحص']]) { const link = element('a', title); link.href = base + file; link.download = `SHEIKHA-${job.family}-${job.id.slice(0, 8)}-${file}`; actions.append(link); }
      row.append(actions);
    } return row;
  }));
}
async function refreshJobs() { try { const data = await api('/studio'); showJobs(data.jobs); catalog.renderer = data.renderer; catalog.busy = data.busy; $('render-video').disabled = !data.renderer.available || data.busy || pending || !blueprint; } catch (error) { $('render-status').textContent = error.message; } }
async function pollJob() {
  if (!activeJob) return;
  try { const job = await api('/studio/jobs/' + activeJob); $('render-status').textContent = labels[job.status] || job.status;
    if (job.status !== 'RENDERING') { activeJob = null; pending = false; await refreshJobs(); return; }
  } catch (error) { $('render-status').textContent = error.message; }
  setTimeout(pollJob, 2000);
}
async function initialize() {
  $('studio-retry').hidden = true;
  try {
    catalog = await api('/studio'); parameters = { ...catalog.defaultDesign };
    $('robot-family').replaceChildren(...catalog.families.map(f => new Option(`${f.name} · ${f.code}`, f.id))); $('robot-family').value = parameters.family;
    $('robot-finishes').replaceChildren(...catalog.finishes.map(finish => { const b = element('button', '', finish.id); b.type = 'button'; b.title = finish.name; b.setAttribute('aria-label', finish.name); b.dataset.finish = finish.id; b.addEventListener('click', () => { parameters.finish = finish.id; update(); }); return b; }));
    updateTools(); $('robot-family').disabled = false; $('robot-tool').disabled = false;
    $('robot-pipeline').replaceChildren(...catalog.pipeline.map(stage => { const li = element('li', stage.name); li.append(element('small', `${stage.owner} · ${labels[stage.status] || stage.status}`)); return li; }));
    $('robot-providers').replaceChildren(...catalog.providers.map(provider => { const row = element('div', '', 'record'), text = element('div', provider.name); text.append(element('small', provider.id === 'sheikha-local' ? 'توليد بارامتري، وليس نموذج فيديو مدرّبًا' : provider.id === 'producer-exchange' ? 'عقد JSON · هوية المنتج ومحتواه غير متحققين' : provider.reason === 'HARDWARE_AND_SAFETY_NOT_VERIFIED' ? 'بانتظار العتاد ومراجعة السلامة' : 'بانتظار المزوّد والميزانية')); row.append(text, element('span', labels[provider.connection] || provider.connection, 'tag')); return row; }));
    showJobs(catalog.jobs); $('render-video').disabled = !catalog.renderer.available || catalog.busy;
    $('render-status').textContent = catalog.renderer.available ? 'محرك شيخة المحلي متاح · لا نشر خارجي' : 'متطلبات الإخراج غير مكتملة';
    const running = catalog.jobs.find(job => job.status === 'RENDERING'); if (running && catalog.busy) { activeJob = running.id; pending = true; pollJob(); }
    await update();
  } catch (error) { $('design-status').textContent = error.message; $('studio-retry').hidden = false; }
}
$('studio-retry').addEventListener('click', initialize);
$('design-form').addEventListener('submit', e => e.preventDefault());
$('robot-family').addEventListener('change', () => { parameters.family = $('robot-family').value; updateTools(); update(); });
$('robot-tool').addEventListener('change', () => { parameters.tool = $('robot-tool').value; update(); });
$('robot-scale').addEventListener('input', () => { $('robot-scale-value').textContent = Number($('robot-scale').value).toFixed(2); });
$('robot-scale').addEventListener('change', () => { if (parameters) { parameters.scale = Number($('robot-scale').value); update(); } });
$('robot-motion').addEventListener('change', () => { if (parameters) { parameters.motion = $('robot-motion').value; update(); } });
$('robot-wire').addEventListener('change', () => scene?.setWireframe($('robot-wire').checked));
$('robot-explore').addEventListener('click', () => { if (!parameters) return; parameters.family = catalog.families[(catalog.families.findIndex(f => f.id === parameters.family) + 1) % catalog.families.length].id; parameters.finish = catalog.finishes[(catalog.finishes.findIndex(f => f.id === parameters.finish) + 1) % catalog.finishes.length].id; $('robot-family').value = parameters.family; updateTools(); update(); });
$('robot-export').addEventListener('click', () => { if (blueprint) download(blueprint, `SHEIKHA-${blueprint.code}-design.json`); });
$('robot-play').addEventListener('click', () => { if (stopped) return; playing = !playing; updatePlay(); });
$('robot-stop').addEventListener('click', () => { playing = false; stopped = true; updatePlay(); });
$('robot-reset').addEventListener('click', () => { playing = false; stopped = false; elapsed = 0; updatePlay(); });
$('robot-reset-view').addEventListener('click', () => scene?.resetCamera());
document.addEventListener('visibilitychange', () => { if (document.hidden) { playing = false; updatePlay(); $('job-player').pause(); } });
$('render-video').addEventListener('click', async () => { if (!blueprint || pending) return; pending = true; $('render-video').disabled = true; $('render-status').textContent = 'جارٍ حجز خط الإنتاج المحلي';
  try { const job = await api('/studio/render', parameters); activeJob = job.id; tab('production'); await refreshJobs(); pollJob(); }
  catch (error) { pending = false; $('render-video').disabled = false; $('render-status').textContent = error.message; }
});
$('refresh-jobs').addEventListener('click', refreshJobs);
$('export-exchange').addEventListener('click', async () => { try { if (parameters) download(await api('/studio/exchange', parameters), 'SHEIKHA-producer-request.json'); } catch (error) { $('receipt-status').textContent = error.message; } });
$('producer-receipt').addEventListener('change', async () => {
  const file = $('producer-receipt').files[0]; $('receipt-result').hidden = true;
  try { if (!file || file.size > 8192 || !parameters) throw Error('يلزم ملف JSON صالح لا يتجاوز 8 KiB.');
    const receipt = JSON.parse(await file.text()), result = await api('/studio/receipt', { design: parameters, receipt });
    $('receipt-status').textContent = 'عقد صحيح البنية · المحتوى وهوية المنتج غير متحققين'; $('receipt-result').textContent = JSON.stringify(result, null, 2); $('receipt-result').hidden = false;
  } catch (error) { $('receipt-status').textContent = error.message.includes('JSON') ? 'ملف JSON غير صالح.' : error.message; }
});
try { scene = createRobotScene($('robot-canvas')); new ResizeObserver(() => scene.resize()).observe($('robot-canvas')); } catch { $('scene-error').hidden = false; }
updatePlay(); requestAnimationFrame(animate); initialize();
