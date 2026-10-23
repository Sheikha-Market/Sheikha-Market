'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const API = '/api/sheikha/workspace/v1', KEY = 'sheikha-industrial-simulation-id';
  const states = { READY: 'جاهزة', RUNNING: 'تشغيل رقمي', PAUSED: 'معلقة', STOPPED: 'إيقاف مثبت', COMPLETE: 'مكتملة افتراضيًا',
    LIMIT_REACHED: 'انتهى حد الخطوات', INCOMPLETE: 'غير مكتملة', WAITING: 'انتظار', IDLE: 'انتظار المدخلات',
    GROWING: 'زراعة رمزية', FAULT_LATCHED: 'عطل تجريبي مثبت', ESTOP_LATCHED: 'متوقفة افتراضيًا' };
  const artifacts = { FACTORY_AND_LINE_BLUEPRINT_DRAFT: 'حزمة تصميم مصنع وخطوط', SIMULATED_HARVEST_DRAFT: 'مسودة حصاد افتراضي',
    SIMULATED_LINE_OUTPUT_DRAFT: 'مخرج خط افتراضي', CLUSTER_BLUEPRINT_DRAFT: 'حزمة عنقود صناعي' };
  let run = null, token, busy = false, uncertain = false, loaded = false, timer, archived = null;
  let review = null, reviewUncertain = false, reviewFormId = null, pendingReview = null;
  const DERIVE_KEY = 'sheikha-industrial-pending-derivation';
  const countLabels = { clusters: 'العناقيد', foundriesPerCluster: 'الفوندريات في كل عنقود', factoriesPerCluster: 'المصانع في كل عنقود',
    linesPerFactory: 'الخطوط في كل مصنع', farmsPerCluster: 'المزارع في كل عنقود' };
  let deriveFormId = null, pendingDerivation = null, deriveDirty = false;
  let comparison = null, comparisonArchiveId = null;
  let lineageIndex = null;
  const linkLabels = { ORIGINAL: 'تجربة أصلية', MATCHED: 'مرجع أصل مطابق', SOURCE_UNAVAILABLE: 'الأصل غير متاح',
    SOURCE_MISMATCH: 'مرجع أصل غير مطابق', INCONSISTENT_RUN: 'نسخ متعارضة للتجربة', CYCLE: 'دورة مراجع مرفوضة' };
  const metricLabels = { steps: 'الخطوات المسجلة', expectedArtifacts: 'المخرجات عند اكتمال التكوين',
    emittedArtifacts: 'المخرجات الصادرة', missingArtifacts: 'المخرجات غير الصادرة', foundryArtifacts: 'حزم الفوندريات',
    farmArtifacts: 'مسودات الحصاد الافتراضي', lineArtifacts: 'مخرجات الخطوط', clusterArtifacts: 'حزم العناقيد',
    networkFaults: 'وحدات الشبكة ذات عطل مثبت', farmFaults: 'المزارع ذات عطل مثبت' };
  try {
    const id = sessionStorage.getItem(DERIVE_KEY);
    if (/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id || '')) pendingDerivation = id;
  } catch {}
  function rememberDerivation(id) {
    pendingDerivation = id;
    try { if (id) sessionStorage.setItem(DERIVE_KEY, id); else sessionStorage.removeItem(DERIVE_KEY); } catch {}
    $('derive-clear').hidden = true;
  }
  const reviewStatuses = { PENDING: 'بانتظار المراجعة', CHANGES_REQUESTED: 'يحتاج تحسينًا', CONCEPT_REVIEWED: 'مراجعة تصورية مكتملة' };
  const reviewDecisions = { COMMENT: 'ملاحظة', CHANGES_REQUESTED: 'طلب تحسين', CONCEPT_REVIEWED: 'إكمال مراجعة تصورية', REOPENED: 'إعادة فتح' };
  const element = (tag, text) => { const el = document.createElement(tag); el.textContent = text; return el; };
  const remember = id => {
    try { if (id) sessionStorage.setItem(KEY, id); else sessionStorage.removeItem(KEY); } catch {}
    const url = new URL(location.href);
    if (id) url.searchParams.set('run', id); else url.searchParams.delete('run');
    history.replaceState(null, '', url);
  };
  const remembered = () => { try { return sessionStorage.getItem(KEY); } catch { return null; } };
  function cancelAuto() { clearTimeout(timer); timer = null; }
  function schedule() {
    cancelAuto();
    if ($('federation-auto').checked && run?.state === 'RUNNING' && !busy && !uncertain && !pendingDerivation && !document.hidden) {
      timer = setTimeout(() => act('step'), 4000);
    }
  }
  async function request(path, body) {
    const response = await fetch(API + path, { signal: AbortSignal.timeout(8000),
      headers: { 'X-Sheikha-Session': token || '', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { method: 'POST', body: JSON.stringify(body) } : {}) });
    if (!response.ok) { const error = Error('REQUEST_FAILED'); error.status = response.status; throw error; }
    return response.json();
  }
  function message(value, error = false) { $('federation-message').textContent = value; $('federation-message').classList.toggle('error', error); }
  function controls() {
    const blocked = busy || uncertain || Boolean(pendingDerivation);
    for (const el of $('federation-form').elements) el.disabled = blocked || !loaded || Boolean(run);
    $('federation-refresh').disabled = busy;
    const allow = { start: ['READY'], step: ['RUNNING'], pause: ['RUNNING'], resume: ['PAUSED'],
      stop: ['READY', 'RUNNING', 'PAUSED'], reset: ['READY', 'PAUSED', 'STOPPED', 'COMPLETE', 'LIMIT_REACHED'] };
    for (const el of document.querySelectorAll('[data-federation-action]')) {
      el.disabled = blocked || !run || !allow[el.dataset.federationAction].includes(run.state);
    }
    $('federation-auto').disabled = blocked || run?.state !== 'RUNNING';
    $('federation-fault-node').disabled = blocked;
    $('federation-fault').disabled = blocked || !['RUNNING', 'PAUSED'].includes(run?.state) || !$('federation-fault-node').value;
    $('federation-export').disabled = blocked || !run;
    $('federation-save').disabled = blocked || !run;
    $('federation-discard').disabled = blocked || !run;
    $('archive-refresh').disabled = busy || !token;
    $('archive-family').disabled = busy || !lineageIndex;
    $('lineage-export').disabled = busy || !lineageIndex;
    $('archive-export').disabled = busy || !archived;
    $('archive-close').disabled = busy;
    for (const button of $('archive-list').querySelectorAll('button')) button.disabled = busy || !token;
    const reviewReady = review && review.archiveId === archived?.id && !reviewUncertain;
    for (const el of $('review-form').elements) el.disabled = busy || !reviewReady || review.revision >= review.limits.events;
    $('review-refresh').disabled = busy || !archived;
    $('review-export').disabled = busy || !reviewReady;
    $('comparison-read').disabled = busy || !archived?.snapshot.derivation;
    $('comparison-source').disabled = busy || !archived?.snapshot.derivation;
    $('comparison-export').disabled = busy || !comparison || comparison.candidate.archiveId !== archived?.id;
    const deriveReady = reviewReady && !run && !blocked && openRequests().length > 0;
    for (const el of $('derive-form').elements) el.disabled = !deriveReady;
    const selected = $('derive-requests').querySelectorAll('input:checked').length;
    const changed = archived && Object.keys(countLabels).some(k => Number($(`derive-${k}`).value) !== archived.snapshot.config[k]);
    $('derive-submit').disabled = !deriveReady || selected < 1 || selected > 8 || !changed;
    $('derive-recovery').hidden = !pendingDerivation;
    $('derive-recover').disabled = busy;
    $('derive-clear').disabled = busy;
    if (archived) $('derive-message').textContent = run ? 'توجد تجربة مفتوحة؛ لم تُغلق أو تُستبدل.'
      : !reviewReady ? 'سجل المراجعة غير متاح للتعديل.' : !openRequests().length ? 'لا توجد طلبات تحسين مفتوحة.'
        : selected > 8 ? 'الحد الأقصى 8 طلبات لكل تجربة.' : 'تعديل أعداد الوحدات ضمن السياق القطاعي نفسه.';
  }
  const savedDate = value => new Date(value).toLocaleString('ar-SA', { calendar: 'gregory' });
  function renderArchive() {
    $('archive-review').hidden = !archived;
    renderComparison();
    if (!archived) { $('archive-json').textContent = ''; review = null; renderReview(); return; }
    const s = archived.snapshot;
    $('archive-review-title').textContent = s.config.name;
    $('archive-meta').textContent = `محفوظة ${savedDate(archived.savedAt)} · ${states[s.state]} وقت الحفظ · جيل ${s.generation} · مراجعة ${s.revision} · ${s.artifacts.length} مخرجات`;
    $('archive-digest').textContent = `SHA-256: ${archived.snapshotSha256}`;
    $('archive-json').textContent = JSON.stringify(archived, null, 2);
    renderLineage('archive-lineage', s);
    renderReview();
  }
  function renderComparison() {
    if (comparisonArchiveId !== archived?.id) {
      comparison = null; comparisonArchiveId = archived?.id;
      $('comparison-message').textContent = 'لم تُقرأ مقارنة لهذه النسخة.';
      $('comparison-message').classList.remove('error');
    }
    $('archive-comparison').hidden = !archived?.snapshot.derivation;
    const ready = comparison && comparison.candidate.archiveId === archived?.id;
    $('comparison-result').hidden = !ready;
    if (!ready) {
      $('comparison-refs').replaceChildren(); $('comparison-metrics').replaceChildren();
      $('comparison-json').textContent = ''; $('comparison-basis').textContent = ''; return;
    }
    $('comparison-basis').textContent = comparison.basis.status === 'BOTH_COMPLETE'
      ? 'كلتا النسختين مكتملتان افتراضيًا. زيادة المخرجات أو نقصها يعكسان اختلاف التكوين، ولا يثبتان جودة أفضل.'
      : 'مقارنة جزئية: إحدى النسختين أو كلتاهما غير مكتملة. فرق الخطوات ليس فرقًا في زمن الإنتاج أو الكفاءة.';
    $('comparison-refs').replaceChildren(...[['source', 'الأصل'], ['candidate', 'التعديل']].map(([key, label]) => {
      const ref = comparison[key], div = document.createElement('div');
      div.append(element('strong', `${label}: ${ref.name}`), element('p', `${states[ref.state]} وقت الحفظ · جيل ${ref.generation} · مراجعة ${ref.revision}`),
        element('p', savedDate(ref.savedAt)), element('code', ref.archiveId)); return div;
    }));
    const table = (title, rows, labels) => {
      const el = document.createElement('table'); el.className = 'comparison-table'; el.append(element('caption', title));
      const head = document.createElement('thead'), heading = document.createElement('tr');
      for (const text of ['المؤشر', 'الأصل', 'التعديل', 'الفرق']) { const th = element('th', text); th.scope = 'col'; heading.append(th); }
      head.append(heading); el.append(head); const body = document.createElement('tbody');
      for (const item of rows) {
        const tr = document.createElement('tr'); tr.dataset.metric = item.key; if (item.delta !== 0) tr.className = 'changed';
        const th = element('th', labels[item.key]); th.scope = 'row'; tr.append(th);
        for (const value of [item.source, item.candidate, item.delta > 0 ? `+${item.delta}` : String(item.delta)]) {
          const td = document.createElement('td'), number = element('bdi', value); number.dir = 'ltr'; td.append(number); tr.append(td);
        }
        body.append(tr);
      }
      el.append(body); return el;
    };
    $('comparison-metrics').replaceChildren(table('المخرجات والخطوات الافتراضية', comparison.metrics, metricLabels),
      table('أعداد الوحدات في التكوين', comparison.configuration, countLabels));
    $('comparison-json').textContent = JSON.stringify(comparison, null, 2);
  }
  async function loadComparison() {
    if (busy || !archived?.snapshot.derivation) return;
    const id = archived.id;
    comparison = null; busy = true; cancelAuto(); $('federation-auto').checked = false;
    renderComparison(); controls(); $('comparison-message').textContent = 'جارٍ التحقق من النسختين المحفوظتين.';
    $('comparison-message').classList.remove('error');
    try {
      token = (await request('/session')).token;
      const result = await request(`/industry/archives/${id}/comparison`);
      if (result.candidate.archiveId !== id || archived?.id !== id) throw Error('COMPARISON_CHANGED');
      comparison = result; renderComparison(); $('comparison-message').textContent = 'قُرئت المقارنة دون تغيير أي تجربة أو مراجعة.';
    } catch {
      comparison = null; renderComparison();
      $('comparison-message').textContent = 'تعذر التحقق من النسختين أو تطابق مرجع الأصل. المقارنة والتنزيل غير متاحين؛ لم تُغيّر المحفوظات.';
      $('comparison-message').classList.add('error');
    } finally { busy = false; controls(); }
  }
  function reviewMessage(text, error = false) {
    $('review-message').textContent = text; $('review-message').classList.toggle('error', error);
  }
  function targetLabel(id) {
    if (id === 'federation') return 'التجمع كاملًا';
    const a = archived?.snapshot.artifacts.find(item => item.id === id);
    return a ? `${a.nodeId} · ${artifacts[a.kind]}` : id;
  }
  function renderReview() {
    if (reviewFormId !== archived?.id) {
      $('review-form').reset(); reviewFormId = archived?.id; pendingReview = null;
    }
    if (!review || review.archiveId !== archived?.id) {
      $('review-target').replaceChildren(); $('review-targets').replaceChildren(); $('review-events').replaceChildren();
      $('review-summary').textContent = ''; $('review-json').textContent = ''; renderDerivation(); return;
    }
    const chosen = $('review-target').value;
    $('review-target').replaceChildren(...review.targets.map(t => {
      const option = element('option', targetLabel(t.id)); option.value = t.id; return option;
    }));
    if (review.targets.some(t => t.id === chosen)) $('review-target').value = chosen;
    const outputs = review.targets.filter(t => t.id !== 'federation');
    $('review-summary').replaceChildren(...[
      `نسخة السجل: ${review.revision} من ${review.limits.events}`,
      `مخرجات مراجعة تصوريًا: ${outputs.filter(t => t.status === 'CONCEPT_REVIEWED').length} من ${outputs.length}`,
      `تحتاج تحسينًا: ${outputs.filter(t => t.status === 'CHANGES_REQUESTED').length}`
    ].map(text => element('span', text)));
    $('review-targets').replaceChildren(...review.targets.map(t => {
      const row = document.createElement('div'); row.className = 'review-target-row'; row.dataset.reviewTarget = t.id;
      row.append(element('span', targetLabel(t.id)), element('span', reviewStatuses[t.status])); return row;
    }));
    $('review-events').replaceChildren(...[...review.events].reverse().map(e => {
      const row = document.createElement('li');
      row.append(element('strong', `${reviewDecisions[e.decision]} · ${targetLabel(e.targetId)}`),
        element('p', e.note), element('small', `${savedDate(e.recordedAt)} · سجل ${e.sequence} · جلسة محلية غير متحققة الهوية`)); return row;
    }));
    $('review-json').textContent = JSON.stringify(review, null, 2);
    renderDerivation();
  }
  function openRequests() {
    if (!review || review.archiveId !== archived?.id) return [];
    return review.targets.filter(t => t.status === 'CHANGES_REQUESTED').map(t =>
      review.events.findLast(e => e.targetId === t.id && e.decision === 'CHANGES_REQUESTED'));
  }
  function compareConfig(container, baseline, proposed) {
    const row = (values, changed = false) => {
      const el = document.createElement('div'); el.className = `config-row${changed ? ' changed' : ''}`;
      el.append(...values.map(v => element('span', v))); return el;
    };
    container.replaceChildren(row(['التكوين', 'الأصل', 'المقترح']), ...Object.entries(countLabels).map(([k, label]) =>
      row([label, baseline[k], Number.isFinite(proposed[k]) ? proposed[k] : 'غير محدد'], baseline[k] !== proposed[k])));
  }
  function renderDerivation() {
    if (deriveFormId !== archived?.id) {
      $('derive-form').reset(); deriveFormId = archived?.id; deriveDirty = false;
      if (archived) {
        $('derive-name').value = `${archived.snapshot.config.name.slice(0, 106)} · تعديل`;
        for (const k of Object.keys(countLabels)) $(`derive-${k}`).value = archived.snapshot.config[k];
      }
      $('derive-requests').replaceChildren();
    }
    const selected = new Set([...$('derive-requests').querySelectorAll('input:checked')].map(el => el.value));
    $('derive-requests').replaceChildren(...openRequests().map(e => {
      const label = document.createElement('label'); label.className = 'derive-request';
      const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.value = e.requestId; checkbox.checked = selected.has(e.requestId);
      const text = document.createElement('span'); text.append(element('strong', `${targetLabel(e.targetId)} · سجل ${e.sequence}`), document.createTextNode(e.note));
      label.append(checkbox, text); return label;
    }));
    updateComparison();
  }
  function updateComparison() {
    if (!archived) { $('derive-comparison').replaceChildren(); return; }
    compareConfig($('derive-comparison'), archived.snapshot.config,
      Object.fromEntries(Object.keys(countLabels).map(k => [k, $(`derive-${k}`).value ? Number($(`derive-${k}`).value) : NaN])));
  }
  function renderLineage(id, snapshot) {
    const container = $(id), d = snapshot.derivation;
    container.hidden = !d; container.replaceChildren(); if (!d) return;
    container.append(element('h3', 'مرجع تجربة التعديل'), element('p', d.intent), element('code', d.sourceArchiveId),
      element('p', `جيل الأصل ${d.sourceGeneration} · مراجعة الأصل ${d.sourceRevision} · سجل المراجعة ${d.reviewRevision}`),
      element('p', 'لا موافقات موروثة · التحسين غير مثبت'));
    const comparison = document.createElement('div'); comparison.className = 'config-comparison';
    compareConfig(comparison, d.baselineConfig, snapshot.config); container.append(comparison);
    const list = document.createElement('ul');
    list.append(...d.requests.map(r => element('li', `سجل ${r.sequence}: ${r.note}`))); container.append(list);
  }
  async function loadReview() {
    if (!archived) return;
    try {
      review = await request(`/industry/archives/${archived.id}/reviews`); reviewUncertain = false;
      const confirmed = pendingReview?.archiveId === archived.id && review.events.some(e => e.requestId === pendingReview.body.requestId);
      if (confirmed) { $('review-note').value = ''; pendingReview = null; }
      renderReview(); reviewMessage(confirmed ? 'تم العثور على الطلب السابق في السجل؛ لم يُكرر.' : 'سجل محلي للمراجعة التصورية فقط.');
    } catch {
      review = null; reviewUncertain = true; renderReview();
      reviewMessage('تعذر التحقق من سجل المراجعة. التعديل والتنزيل متوقفان حتى التحديث.', true);
    }
  }
  async function refreshReview() {
    if (busy || !archived) return;
    busy = true; cancelAuto(); $('federation-auto').checked = false; controls();
    try { token = (await request('/session')).token; await loadReview(); }
    catch { reviewUncertain = true; reviewMessage('تعذر الاتصال؛ لا إعادة تلقائية للقرارات.', true); }
    finally { busy = false; controls(); }
  }
  async function loadArchives() {
    const selected = $('archive-family').value;
    lineageIndex = null; $('archive-list').replaceChildren();
    try {
      lineageIndex = await request('/industry/archives/lineage');
      const all = element('option', 'جميع السلاسل'); all.value = '';
      $('archive-family').replaceChildren(all, ...lineageIndex.families.map(f => {
        const option = element('option', `${f.name} · ${f.id.slice(0, 8)}`); option.value = f.id; return option;
      }));
      if (lineageIndex.families.some(f => f.id === selected)) $('archive-family').value = selected;
      renderArchiveIndex();
    } catch {
      lineageIndex = null; $('archive-list').replaceChildren();
      $('archive-family').replaceChildren(Object.assign(element('option', 'جميع السلاسل'), { value: '' }));
      $('archive-message').textContent = 'تعذرت قراءة فهرس المحفوظات. لم تُحذف أي نسخة.';
      $('archive-message').classList.add('error');
    }
  }
  function renderArchiveIndex() {
    if (!lineageIndex) return;
    const result = lineageIndex, records = new Map(result.records.map(r => [r.id, r]));
    const experiments = new Map(result.experiments.map(e => [e.runId, e]));
    const families = result.families.filter(f => !$('archive-family').value || f.id === $('archive-family').value);
    $('archive-list').replaceChildren(...families.flatMap(f => f.experimentIds.map(runId => {
      const e = experiments.get(runId), section = document.createElement('section');
      section.className = 'archive-experiment'; section.dataset.experiment = runId;
      const heading = element('h3', e.name); heading.id = `experiment-${runId}`; section.setAttribute('aria-labelledby', heading.id);
      const state = element('p', `${linkLabels[e.linkStatus]} · مستوى التفرع ${e.depth} · ${e.archiveIds.length} نسخ محفوظة`);
      state.className = e.ancestryStatus === 'INCOMPLETE' ? 'lineage-warning' : 'subtle';
      section.append(heading, element('code', runId), state);
      if (e.ancestryStatus === 'INCOMPLETE') section.append(element('p', 'سلسلة الأصل غير مكتملة؛ لا استنتاج للاعتماد أو التحسين.'));
      if (e.source) {
        const source = records.get(e.source.archiveId);
        section.append(element('small', `أصل التعديل: ${source ? `${source.name} · جيل ${source.generation} · مراجعة ${source.revision}` : e.source.archiveId}`));
        if (e.linkStatus === 'MATCHED') {
          const button = archiveButton(e.source.archiveId, 'فتح أصل التعديل'); button.dataset.lineageSource = e.source.archiveId;
          section.append(button);
        }
      }
      for (const id of e.archiveIds) {
        const record = records.get(id);
        const row = document.createElement('div'); row.className = 'archive-row'; row.dataset.archive = record.id;
        const label = document.createElement('div');
        label.append(element('strong', record.name), element('small', `${savedDate(record.savedAt)} · ${states[record.state]} وقت الحفظ · جيل ${record.generation} · مراجعة ${record.revision}`));
        row.append(label, archiveButton(record.id, `مراجعة ${record.name}`)); section.append(row);
      }
      return section;
    })));
    const incomplete = result.experiments.filter(e => e.ancestryStatus === 'INCOMPLETE').length;
    $('archive-message').textContent = `${result.records.length} من ${result.limits.records} نسخ محفوظة · ${result.experiments.length} تجارب · ${families.length} سلاسل معروضة`
      + (result.unavailableRecords ? ` · ${result.unavailableRecords} سجلات غير قابلة للتحقق` : '')
      + (incomplete ? ` · ${incomplete} تجارب بسلسلة غير مكتملة` : '');
    $('archive-message').classList.toggle('error', result.unavailableRecords > 0 || incomplete > 0);
  }
  function archiveButton(id, label) {
    const button = document.createElement('button'); button.className = 'icon-button'; button.type = 'button';
    button.title = label; button.setAttribute('aria-label', label);
    const icon = document.createElement('img'); icon.src = '/architecture-explorer/icons/book-open.svg'; icon.alt = ''; icon.className = 'icon'; button.append(icon);
    button.addEventListener('click', () => archiveRead(id)); return button;
  }
  async function archiveRead(id) {
    if (busy || !token) return;
    if (id && !canLeaveReview(id)) return;
    busy = true; cancelAuto(); $('federation-auto').checked = false; controls();
    try {
      if (id) { archived = await request(`/industry/archives/${encodeURIComponent(id)}`); renderArchive(); await loadReview(); }
      else { token = (await request('/session')).token; await loadArchives(); }
      renderArchive();
    } catch {
      archived = null; renderArchive();
      $('archive-message').textContent = 'تعذر التحقق من النسخة المحفوظة؛ لا استرجاع إلى المحاكاة.';
      $('archive-message').classList.add('error');
    } finally { busy = false; controls(); }
  }
  function render() {
    $('federation-run').hidden = !run;
    if (!run) { controls(); return; }
    if (run.state !== 'RUNNING') $('federation-auto').checked = false;
    for (const [id, key] of [['name', 'name'], ['sector', 'templateId'], ['clusters', 'clusters'],
      ['foundries', 'foundriesPerCluster'], ['factories', 'factoriesPerCluster'], ['lines', 'linesPerFactory'], ['farms', 'farmsPerCluster']]) {
      $(`federation-${id}`).value = run.config[key];
    }
    $('run-title').textContent = run.config.name;
    renderLineage('run-lineage', run);
    $('federation-state').textContent = `${states[run.state]} · الخطوة ${run.tick} من ${run.limits.totalSteps} · مراجعة الحالة ${run.revision}`;
    const farms = run.clusters.flatMap(c => c.farms), foundries = run.clusters.flatMap(c => c.foundries);
    const factories = run.clusters.flatMap(c => c.factories), lines = factories.flatMap(f => f.lines);
    $('federation-totals').replaceChildren(...[
      `${run.clusters.length} عناقيد`, `${foundries.length} فوندريات`, `${factories.length} مصانع`, `${lines.length} خطوط`, `${farms.length} مزارع`,
      `${run.artifacts.length} مخرجات افتراضية`, 'المصانع الفعلية المنشأة: 0'
    ].map(value => element('span', value)));
    $('federation-cluster-list').replaceChildren(...run.clusters.map(cluster => {
      const section = document.createElement('section'); section.className = 'federation-cluster'; section.dataset.cluster = cluster.id;
      const heading = document.createElement('div'); heading.className = 'heading';
      heading.append(element('h3', cluster.nameAr), element('span', states[cluster.state]));
      const flow = element('p', 'فوندريات + مزارع ← خطوط المصانع ← حزمة العنقود'); flow.className = 'federation-flow';
      const table = document.createElement('table'); table.className = 'federation-table';
      const caption = element('caption', cluster.nameAr); caption.hidden = true; table.append(caption);
      const head = document.createElement('thead'), tr = document.createElement('tr');
      for (const name of ['الوحدة', 'الحالة', 'تقدم افتراضي', 'الدليل']) { const th = element('th', name); th.scope = 'col'; tr.append(th); }
      head.append(tr); table.append(head);
      const body = document.createElement('tbody');
      const nodes = [...cluster.foundries, ...cluster.farms, ...cluster.factories.flatMap(f => f.lines.map(n => ({ ...n, nameAr: `${f.nameAr} / ${n.nameAr}` })))];
      for (const node of nodes) {
        const row = document.createElement('tr'); row.dataset.node = node.id;
        const label = element('td', node.nameAr); label.append(element('small', node.kind === 'farm'
          ? node.domain === 'CONCEPTUAL_CROP_CULTIVATION' ? 'مزرعة زراعية تصورية' : 'مزرعة موارد صناعية' : node.id));
        const status = element('td', states[node.state] || node.state); status.dataset.state = node.state;
        const progressCell = document.createElement('td'), progress = document.createElement('progress');
        progress.value = node.progressPercent; progress.max = 100; progress.setAttribute('aria-label', `تقدم ${node.nameAr}`);
        progressCell.append(progress, element('small', `${node.progressPercent}%`));
        const evidence = element('td', node.kind === 'farm' ? node.stage : `${node.completedCells} من ${node.totalCells} خلايا`);
        if (node.kind === 'farm') evidence.append(element('small', 'الحصاد الحقيقي: غير معتمد'));
        row.append(label, status, progressCell, evidence); body.append(row);
      }
      table.append(body); section.append(heading, flow, table); return section;
    }));
    const chosen = $('federation-fault-node').value;
    $('federation-fault-node').replaceChildren(...[...foundries, ...farms, ...lines]
      .filter(n => !['COMPLETE', 'FAULT_LATCHED', 'ESTOP_LATCHED'].includes(n.state)).map(n => {
        const option = element('option', `${n.id} · ${n.nameAr}`); option.value = n.id; return option;
      }));
    if ([...$('federation-fault-node').options].some(o => o.value === chosen)) $('federation-fault-node').value = chosen;
    $('federation-artifacts').replaceChildren(...run.artifacts.map(artifact => {
      const row = element('div', artifacts[artifact.kind]); row.className = 'record';
      row.append(element('small', `${artifact.nodeId} · خطوة ${artifact.tick} · للمراجعة`)); return row;
    }));
    $('federation-events').replaceChildren(...run.events.slice(-12).map(e => element('li', `${e.tick} · ${e.nodeId} · ${artifacts[e.event] || e.event}`)));
    $('federation-json').textContent = JSON.stringify(run, null, 2);
    controls();
  }
  async function refresh() {
    if (busy) return;
    busy = true; cancelAuto(); controls();
    try {
      token = (await request('/session')).token;
      if (!loaded) {
        const catalog = await request('/industry/catalog');
        $('federation-sector').replaceChildren(...catalog.templates.filter(t => t.id !== 'space').map(t => {
          const option = element('option', t.nameAr); option.value = t.id; return option;
        })); loaded = true;
      }
      const requested = new URLSearchParams(location.search).get('run');
      const id = run?.id || (/^[a-f0-9-]{36}$/.test(requested || '') ? requested : remembered());
      if (id) {
        try { run = await request(`/industry/simulations/${encodeURIComponent(id)}`); remember(run.id); }
        catch (error) { if (error.status !== 404) throw error; run = null; remember(null); }
      }
      uncertain = false; message(run ? 'تمت قراءة الحالة المحلية؛ لا تنفيذ مادي.' : 'جاهز لتجربة محلية؛ لا تجربة نشطة في هذه الصفحة.');
      await loadArchives();
    } catch { uncertain = true; message('تعذر التحقق من الحالة. أعد التحديث قبل أي أمر أو تنزيل.', true); }
    finally { busy = false; render(); schedule(); }
  }
  async function mutate(path, body, onResult) {
    if (busy || uncertain || pendingDerivation) return;
    busy = true; cancelAuto(); controls();
    try { const result = await request(path, body); await onResult(result); message('اكتمل الطلب المحلي؛ المخرجات افتراضية وبانتظار المراجعة.'); }
    catch (error) {
      $('federation-auto').checked = false;
      uncertain = true;
      message(error.status === 409 ? 'تغيرت الحالة من جلسة أخرى؛ أعد التحديث.' : 'تعذر تأكيد الطلب. أعد التحديث قبل المتابعة؛ لا إعادة تلقائية للأوامر.', true);
    } finally { busy = false; render(); schedule(); }
  }
  function act(command) {
    if (!run) return;
    const body = { command, expectedRevision: run.revision };
    if (command === 'step') body.steps = 5;
    if (command === 'fault') body.nodeId = $('federation-fault-node').value;
    if (command !== 'step' && command !== 'start' && command !== 'resume') { $('federation-auto').checked = false; cancelAuto(); }
    mutate(`/industry/simulations/${run.id}/actions`, body, result => { run = result; });
  }
  $('federation-form').addEventListener('submit', event => {
    event.preventDefault(); if (!$('federation-form').reportValidity()) return;
    mutate('/industry/simulations', { name: $('federation-name').value, templateId: $('federation-sector').value,
      clusters: Number($('federation-clusters').value), foundriesPerCluster: Number($('federation-foundries').value),
      factoriesPerCluster: Number($('federation-factories').value), linesPerFactory: Number($('federation-lines').value),
      farmsPerCluster: Number($('federation-farms').value) }, result => { run = result; remember(run.id); });
  });
  for (const button of document.querySelectorAll('[data-federation-action]')) button.addEventListener('click', () => act(button.dataset.federationAction));
  $('federation-refresh').addEventListener('click', refresh);
  $('federation-fault').addEventListener('click', () => act('fault'));
  $('federation-auto').addEventListener('change', schedule);
  $('federation-discard').addEventListener('click', () => {
    if (run) mutate(`/industry/simulations/${run.id}/discard`, { expectedRevision: run.revision }, () => {
      run = null; remember(null); $('federation-auto').checked = false;
    });
  });
  function download(value, name) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = name;
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function canLeaveReview(nextId) {
    return archived?.id === nextId || !($('review-note').value.trim() || deriveDirty)
      || window.confirm('توجد ملاحظات أو تعديلات لم تُسجل. هل تريد المغادرة دون حفظها؟');
  }
  $('derive-form').addEventListener('input', () => { deriveDirty = true; updateComparison(); controls(); });
  $('derive-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || uncertain || pendingDerivation || run || reviewUncertain || !review || review.archiveId !== archived?.id
      || !$('derive-form').reportValidity() || $('derive-submit').disabled) return;
    const requestId = crypto.randomUUID(), body = { requestId, expectedReviewRevision: review.revision,
      expectedReviewChainHead: review.chainHead, requestIds: [...$('derive-requests').querySelectorAll('input:checked')].map(el => el.value),
      config: { name: $('derive-name').value, templateId: archived.snapshot.config.templateId,
        ...Object.fromEntries(Object.keys(countLabels).map(k => [k, Number($(`derive-${k}`).value)])) }, intent: $('derive-intent').value };
    rememberDerivation(requestId); busy = true; cancelAuto(); $('federation-auto').checked = false; controls();
    try {
      run = await request(`/industry/archives/${archived.id}/derive`, body); remember(run.id); rememberDerivation(null);
      $('derive-intent').value = ''; deriveDirty = false; message('أُنشئت تجربة مستقلة جاهزة، دون بدء أو اعتماد تلقائي.');
    } catch (error) {
      if ([400, 403, 409, 422, 429].includes(error.status)) {
        rememberDerivation(null);
        if ([409, 422].includes(error.status)) reviewUncertain = true;
        message('رُفض إنشاء التجربة. حدّث سجل المراجعة وتحقق من التكوين والحدود؛ لم تُمسح المسودة.', true);
      } else {
        $('derive-recovery-message').textContent = 'تعذر تأكيد إنشاء التجربة. تحقق من الطلب قبل أي محاولة جديدة.';
        message('نتيجة الإنشاء غير مؤكدة؛ لا إعادة تلقائية للطلب.', true);
      }
    } finally { busy = false; render(); }
  });
  $('derive-recover').addEventListener('click', async () => {
    if (busy || !pendingDerivation) return;
    busy = true; cancelAuto(); controls();
    try {
      token = (await request('/session')).token;
      const child = await request(`/industry/derivations/${pendingDerivation}`);
      run = child; remember(run.id); rememberDerivation(null); uncertain = false; $('derive-intent').value = ''; deriveDirty = false;
      message('استُعيدت نتيجة الطلب السابق دون إنشاء تجربة ثانية.');
    } catch (error) {
      $('derive-clear').hidden = ![404, 410].includes(error.status);
      $('derive-recovery-message').textContent = [404, 410].includes(error.status)
        ? 'الطلب غير متاح في هذه العملية أو انتهت التجربة. لا إعادة إنشاء تلقائية؛ النسخ المحفوظة مستقلة.'
        : 'تعذر التحقق من الطلب. لم تُرسل أوامر إنشاء جديدة.';
    } finally { busy = false; render(); }
  });
  $('derive-clear').addEventListener('click', () => {
    if (!busy && !$('derive-clear').hidden) { rememberDerivation(null); controls(); }
  });
  $('federation-export').addEventListener('click', () => {
    if (run && !uncertain && !busy) download(run, `SHEIKHA_FEDERATION_${run.id}_G${run.generation}_R${run.revision}.json`);
  });
  $('federation-save').addEventListener('click', () => {
    if (!run) return;
    const sameSnapshot = archived?.snapshot.id === run.id && archived.snapshot.revision === run.revision;
    if (!sameSnapshot && !canLeaveReview(null)) return;
    $('federation-auto').checked = false;
    mutate(`/industry/simulations/${run.id}/archive`, { expectedRevision: run.revision }, async result => {
      archived = result; renderArchive(); await loadReview(); await loadArchives();
    });
  });
  $('archive-refresh').addEventListener('click', () => archiveRead());
  $('archive-family').addEventListener('change', () => { renderArchiveIndex(); controls(); });
  $('lineage-export').addEventListener('click', () => {
    if (!busy && lineageIndex) download(lineageIndex, 'SHEIKHA_ARCHIVED_LINEAGE.json');
  });
  $('archive-close').addEventListener('click', () => { if (canLeaveReview(null)) { archived = null; renderArchive(); controls(); } });
  $('archive-export').addEventListener('click', () => {
    if (archived && !busy) download(archived, `SHEIKHA_ARCHIVE_${archived.id}.json`);
  });
  $('comparison-read').addEventListener('click', loadComparison);
  $('comparison-source').addEventListener('click', () => {
    if (!busy && archived?.snapshot.derivation) archiveRead(archived.snapshot.derivation.sourceArchiveId);
  });
  $('comparison-export').addEventListener('click', () => {
    if (!busy && comparison && archived && comparison.candidate.archiveId === archived.id) download(comparison, `SHEIKHA_COMPARISON_${archived.id}.json`);
  });
  $('review-refresh').addEventListener('click', refreshReview);
  $('review-export').addEventListener('click', () => {
    if (archived && review?.archiveId === archived.id && !reviewUncertain && !busy) {
      download({ archive: archived, review }, `SHEIKHA_REVIEW_${archived.id}_R${review.revision}.json`);
    }
  });
  $('review-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || reviewUncertain || !review || review.archiveId !== archived?.id || !$('review-form').reportValidity()) return;
    let body = { expectedRevision: review.revision, requestId: crypto.randomUUID(), targetId: $('review-target').value,
      decision: $('review-decision').value, note: $('review-note').value };
    if (pendingReview?.archiveId === archived.id && ['expectedRevision', 'targetId', 'decision', 'note'].every(k => pendingReview.body[k] === body[k])) body = pendingReview.body;
    pendingReview = { archiveId: archived.id, body };
    busy = true; cancelAuto(); $('federation-auto').checked = false; controls();
    try {
      review = await request(`/industry/archives/${archived.id}/reviews`, body);
      pendingReview = null; $('review-note').value = ''; renderReview();
      reviewMessage('سُجلت المراجعة التصورية؛ لم يتغير أي اعتماد إنتاج أو صلاحية تشغيل.');
    } catch (error) {
      reviewUncertain = true;
      reviewMessage(error.status === 409 ? 'تعارض في سجل المراجعة؛ حدّث السجل قبل المتابعة.' : 'تعذر تأكيد التسجيل؛ حدّث السجل قبل المتابعة. ملاحظتك لم تُمسح.', true);
    } finally { busy = false; controls(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { $('federation-auto').checked = false; cancelAuto(); } });
  window.addEventListener('pagehide', cancelAuto);
  window.addEventListener('beforeunload', event => {
    if ($('review-note').value.trim() || deriveDirty) { event.preventDefault(); event.returnValue = ''; }
  });
  refresh();
})();
