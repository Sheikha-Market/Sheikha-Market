/* global document, location, sessionStorage, history, window, Blob, HTMLCanvasElement, MediaRecorder, performance, requestAnimationFrame */
'use strict';
const $ = (id) => document.getElementById(id);
const number = (value) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }).format(value);
let data;
let token = location.hash.slice(1) || sessionStorage.getItem('sheikha-preview') || '';
history.replaceState(null, '', '/');

function element(tag, text, className) {
  const node = document.createElement(tag); node.textContent = text;
  if (className) node.className = className;
  return node;
}
function download(blob, name) {
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function renderChart(progress = 1) {
  const canvas = $('loss-chart'); const ctx = canvas.getContext('2d');
  const mobile = window.matchMedia('(max-width:720px)').matches;
  canvas.width = mobile ? 640 : 1280; canvas.height = mobile ? 660 : 440;
  if (mobile) {
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 640, 660); ctx.direction = 'ltr'; ctx.textAlign = 'left';
    ctx.fillStyle = '#263a32'; ctx.font = 'bold 28px Arial'; ctx.fillText('SHEIKHA / VALIDATION LOSS', 28, 44);
    ctx.font = '22px Arial'; ctx.fillStyle = '#65776b'; ctx.fillText('Stored CPU experiment / byte tokens', 28, 84);
    data.models.forEach((model, index) => {
      const y = 137 + index * 143;
      ctx.fillStyle = '#293c32'; ctx.font = 'bold 26px Arial'; ctx.fillText(model.profile.toUpperCase(), 28, y);
      ctx.font = '23px Arial'; ctx.fillText(`${model.exact}/${model.total} exact`, 408, y);
      ctx.fillStyle = '#e3eae5'; ctx.fillRect(28, y + 18, model.lossBefore / 6 * 450, 22);
      ctx.fillStyle = ['#087e62', '#317d90', '#b37b24'][index]; ctx.fillRect(28, y + 49, model.lossAfter / 6 * 450 * progress, 22);
      ctx.fillStyle = '#374e41'; ctx.fillText(number(model.lossBefore), 506, y + 38); ctx.fillText(number(model.lossAfter), 506, y + 69);
    });
    ctx.font = '23px Arial'; ctx.fillStyle = '#65776b'; ctx.fillText('Gray: before / Color: after', 28, 604);
    ctx.fillStyle = '#936013'; ctx.fillText('ENGINEERING PROOF / NOT FOR SALE', 28, 642); return;
  }
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 1280, 440);
  ctx.direction = 'ltr'; ctx.textAlign = 'left';
  ctx.fillStyle = '#263a32'; ctx.font = 'bold 24px Arial';
  ctx.fillText('SHEIKHA FOUNDRY / VALIDATION LOSS', 40, 42);
  ctx.fillStyle = '#63766c'; ctx.font = '16px Arial';
  ctx.fillText('Stored CPU experiment | byte-token cross entropy | not a benchmark ranking', 40, 72);
  const colors = ['#087e62', '#317d90', '#b37b24'];
  data.models.forEach((model, index) => {
    const y = 134 + index * 88;
    ctx.fillStyle = '#293c32'; ctx.font = 'bold 18px Arial'; ctx.fillText(model.profile.toUpperCase(), 40, y + 22);
    ctx.fillStyle = '#e3eae5'; ctx.fillRect(172, y, model.lossBefore / 6 * 830, 19);
    ctx.fillStyle = colors[index]; ctx.fillRect(172, y + 25, model.lossAfter / 6 * 830 * progress, 19);
    ctx.font = '16px Arial'; ctx.fillStyle = '#4d5e55';
    ctx.fillText(number(model.lossBefore), 172 + model.lossBefore / 6 * 830 + 14, y + 15);
    ctx.fillStyle = colors[index]; ctx.fillText(number(model.lossAfter), 172 + model.lossAfter / 6 * 830 + 14, y + 42);
    ctx.fillStyle = '#57675e'; ctx.fillText(`${model.exact}/${model.total} exact answers`, 1015, y + 24);
  });
  ctx.font = '16px Arial'; ctx.fillStyle = '#6d7f73'; ctx.fillText('Gray: before training   Color: after training', 40, 419);
  ctx.fillStyle = '#936013'; ctx.fillText('ENGINEERING PROOF / RELEASE DENIED', 865, 419);
}
function benchmarks() {
  const header = element('tr', '');
  for (const name of ['Benchmark', 'Sheikha', ...data.benchmarks.models]) header.append(element('th', name));
  $('bench-table').querySelector('thead').replaceChildren(header);
  const rows = data.benchmarks.rows.filter((row) => $('category').value === 'all' || row.category === $('category').value);
  $('bench-table').querySelector('tbody').replaceChildren(...rows.map((row) => {
    const tr = document.createElement('tr');
    tr.append(element('td', row.name), element('td', 'NOT RUN'));
    row.values.forEach((value) => tr.append(element('td', value === null ? '—' : `${value}${row.unit === 'percent' ? '%' : ' pts'}`)));
    return tr;
  }));
  $('bench-source').href = data.benchmarks.source;
}
function render() {
  $('count').textContent = data.models.length;
  $('reload').textContent = `${data.models.filter((m) => m.reloadVerified).length}/${data.models.length}`;
  $('verified').textContent = `تحقق محلي محفوظ: ${new Date(data.verifiedAt).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' })}`;
  $('model-grid').replaceChildren(...data.models.map((model, index) => {
    const article = element('article', '', 'model');
    article.append(element('span', `0${index + 1} / RANDOM INITIALIZATION`, 'index'), element('h2', model.id));
    const dl = document.createElement('dl');
    for (const [label, value] of [['معامل', number(model.parameters)], ['طبقات', model.layers], ['عرض مخفي', model.width], ['رؤوس انتباه', model.heads]]) {
      const group = document.createElement('div'); group.append(element('dt', label), element('dd', value)); dl.append(group);
    }
    article.append(dl, element('span', 'دُرّب · غير معتمد للبيع', 'tag')); return article;
  }));
  $('local-table').querySelector('tbody').replaceChildren(...data.models.map((model) => {
    const tr = document.createElement('tr');
    for (const value of [model.profile.toUpperCase(), number(model.parameters), `${model.exact}/${model.total}`, number(model.tokens), `${number(model.seconds)} s`, 'تجربة CPU محفوظة']) tr.append(element('td', value));
    return tr;
  }));
  $('sale-gates').replaceChildren(...data.commercial.requirements.map(([title, detail]) => {
    const row = document.createElement('div'); row.append(element('strong', title), element('p', detail), element('small', 'مراجعة مطلوبة')); return row;
  }));
  $('references').replaceChildren(...data.commercial.references.map(([label, href]) => {
    const item = document.createElement('li'); const a = element('a', label); a.href = href; a.target = '_blank'; a.rel = 'noreferrer'; item.append(a); return item;
  }));
  const gates = ['تثبيت إصدار النموذج والبيانات وحقوق الاختبار.', 'حاضنة معزولة مع أدوات وإعدادات وحَكَم معلومي الإصدارات.', 'ميزانية وموافقة منفصلة لأي اتصال أو تكلفة خارجية.', 'تكرار القياسات وفواصل عدم اليقين وفحص تلوث الاختبار.', 'نشر النتائج القابلة للإعادة ومراجعتها قبل أي ادعاء تفوق.'];
  $('bench-gates').replaceChildren(...gates.map((text) => element('li', text)));
  benchmarks(); renderChart();
  $('access').hidden = true; $('workspace').hidden = false;
  $('session').textContent = 'جلسة المالك · محلية';
}
async function load() {
  $('refresh').disabled = true;
  try {
    const response = await fetch('/api/overview', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!response.ok) throw new Error(response.status === 401 ? 'جلسة المالك مطلوبة أو انتهت صلاحيتها.' : 'تعذر التحقق من المعاينة المحلية.');
    data = await response.json(); sessionStorage.setItem('sheikha-preview', token); render(); $('message').textContent = '';
  } catch (error) { $('message').textContent = error.message; $('workspace').hidden = true; $('access').hidden = false; }
  finally { $('refresh').disabled = false; }
}
$('auth').addEventListener('submit', (event) => { event.preventDefault(); token = $('key').value; $('key').value = ''; load(); });
document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.view').forEach((view) => { view.hidden = view.id !== button.dataset.tab; });
  document.querySelectorAll('[data-tab]').forEach((item) => { item.classList.toggle('active', item === button); if (item === button) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current'); });
}));
$('category').addEventListener('change', benchmarks);
$('refresh').addEventListener('click', load);
$('json').addEventListener('click', () => download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'sheikha-measured-summary.json'));
$('png').addEventListener('click', () => $('loss-chart').toBlob((blob) => { if (blob) download(blob, 'sheikha-validation.png'); }));
$('video').addEventListener('click', async () => {
  if (!globalThis.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) { $('message').textContent = 'تصدير WebM غير متاح في هذا المتصفح.'; return; }
  const canvas = $('loss-chart'); const chunks = []; let stream; let recorder;
  $('video').disabled = true;
  try {
    const type = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((value) => MediaRecorder.isTypeSupported(value));
    if (!type) throw new Error('صيغة WebM غير مدعومة.');
    stream = canvas.captureStream(24); recorder = new MediaRecorder(stream, { mimeType: type });
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    const finished = new Promise((resolve, reject) => { recorder.onstop = resolve; recorder.onerror = reject; });
    recorder.start(); const start = performance.now();
    await new Promise((resolve) => {
      function frame(now) { renderChart(Math.min(1, (now - start) / 1300)); if (now - start < 3500) requestAnimationFrame(frame); else resolve(); }
      requestAnimationFrame(frame);
    });
    recorder.stop(); await finished;
    download(new Blob(chunks, { type }), 'sheikha-measured-validation.webm');
    $('message').textContent = 'اكتمل تصدير فيديو القياسات المحفوظة.';
  } catch { $('message').textContent = 'تعذر تصدير الفيديو؛ الرسم PNG متاح.'; }
  finally { if (recorder?.state === 'recording') recorder.stop(); stream?.getTracks().forEach((track) => track.stop()); renderChart(); $('video').disabled = false; }
});
if (token) load();
window.addEventListener('resize', () => { if (data) renderChart(); });
