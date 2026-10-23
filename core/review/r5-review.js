'use strict';
(() => {
  const data = JSON.parse(document.getElementById('r5-data').textContent);
  const $ = id => document.getElementById(id);
  const sourceKey = 'sheikha-r5-review-v1:' + data.sourceSha256;
  const titles = { systems: 'كتالوج الأنظمة', flows: 'عقود التكامل', acceptance: 'مراجعة معايير القبول', architecture: 'المعمارية والجذور', rfq: 'مواصفة RFQ / CRM', references: 'المرئيات والمراجع' };
  const { STATES: reviewStates, MAX_IMPORT_BYTES, parseReview, planImport, applyImport } = SheikhaR5ReviewState;
  const knownCriteria = new Set(data.criteria.map(row => row.id));
  let view = 'systems', selectedCriterion = data.criteria[0].id, review = {}, storageAvailable = true, pendingImport = null, undoSnapshot = null;
  const visualWords = value => String(value).replace(/(?<![\p{L}])الصور(?![\p{L}])/gu, 'المرئيات').replace(/(?<![\p{L}])صور(?![\p{L}])/gu, 'مرئيات').replace(/(?<![\p{L}])الصورة(?![\p{L}])/gu, 'المرئية').replace(/(?<![\p{L}])صورة(?![\p{L}])/gu, 'مرئية');
  const normalize = value => String(value).normalize('NFKC').toLowerCase().replace(/[\u064b-\u065f\u0640]/g, '').replace(/[أإآ]/g, 'ا');
  function node(tag, text, className) {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = visualWords(text);
    if (className) el.className = className;
    return el;
  }
  try { const cached = localStorage.getItem(sourceKey); if (cached !== null) review = parseReview(cached, data.sourceSha256, knownCriteria); }
  catch { storageAvailable = false; }
  const envelope = () => ({ schema: 'SHEIKHA_R5_HUMAN_REVIEW_V1', sourceSha256: data.sourceSha256, exportedAt: new Date().toISOString(), items: review, publicationApproval: false, testResults: 'NOT_EVALUATED', status: 'DRAFT_REQUIRES_REVIEW' });
  function countReviews() {
    $('review-count').textContent = `${Object.values(review).filter(item => item.state !== 'NOT_REVIEWED' || item.note.trim()).length} / 34`;
  }
  function saveReview() {
    try { localStorage.setItem(sourceKey, JSON.stringify(envelope())); storageAvailable = true; }
    catch { storageAvailable = false; }
    if ($('save-state')) $('save-state').textContent = storageAvailable ? 'حُفظت الملاحظة في هذا المتصفح.' : 'الحفظ المحلي غير متاح؛ تبقى الملاحظات لهذه الجلسة. صدّر المراجعة لحفظها.';
    countReviews();
  }
  function download(value, name) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
    const a = node('a'); a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('notice').textContent = 'أُعدّ ملف التصدير. لا يتضمن موافقة نشر أو إثبات تشغيل.';
  }
  function clearUndo() { undoSnapshot = null; $('undo-import').disabled = true; }
  function showImportSummary() {
    const plan = pendingImport.plan, result = applyImport(plan, pendingImport.choices);
    $('import-summary').textContent = `${plan.added.length} جديدة · ${plan.conflicts.length} متعارضة · ${plan.unchanged.length} مطابقة. التغييرات المختارة: ${result.changedIds.length}.`;
    $('confirm-import').disabled = result.changedIds.length === 0;
  }
  function reviewPreview(item, label) {
    const block = node('div'), text = node('p', undefined, 'review-text');
    text.textContent = item.note || 'بدون ملاحظة';
    block.append(node('h4', label), badge(reviewStates[item.state], 'info'), text); return block;
  }
  function showImport(plan, filename) {
    pendingImport = { plan, choices: {} };
    $('import-filename').textContent = filename;
    const preview = $('import-preview'); preview.replaceChildren();
    preview.append(node('p', 'المصدر مطابق لـ R5. اعتماد النشر ونتائج الاختبار لا يتغيران.', 'callout'));
    if (plan.added.length) {
      const details = node('details'); details.append(node('summary', `الملاحظات الجديدة (${plan.added.length})`));
      for (const id of plan.added) {
        const block = node('div', undefined, 'added-note'); block.append(node('strong', id), reviewPreview(plan.incoming[id], 'من الملف')); details.append(block);
      }
      preview.append(details);
    }
    for (const id of plan.conflicts) {
      const section = node('section', undefined, 'conflict'), compare = node('div', undefined, 'comparison');
      section.append(node('h3', `${id} · ${data.criteria.find(row => row.id === id).scenario}`));
      compare.append(reviewPreview(plan.local[id], 'الملاحظة الحالية'), reviewPreview(plan.incoming[id], 'الملاحظة الواردة'));
      const label = node('label', 'قرار التعارض'), select = node('select'); select.id = `conflict-${id}`; label.htmlFor = select.id;
      for (const [value, title] of [['keep', 'إبقاء الحالية'], ['incoming', 'استخدام الواردة']]) { const option = node('option', title); option.value = value; select.append(option); }
      select.addEventListener('change', () => { pendingImport.choices[id] = select.value; showImportSummary(); });
      label.append(select); section.append(compare, label); preview.append(section);
    }
    if (!plan.added.length && !plan.conflicts.length) preview.append(node('p', 'الملف لا يضيف تغييرات إلى المراجعة الحالية.'));
    showImportSummary(); $('import-dialog').showModal(); $('cancel-import').focus();
  }
  async function importFile(file) {
    if (!file) return;
    $('import-review').disabled = true;
    try {
      if (file.size > MAX_IMPORT_BYTES) throw Error('IMPORT_TOO_LARGE');
      const incoming = parseReview(await file.text(), data.sourceSha256, knownCriteria);
      $('notice').textContent = '';
      showImport(planImport(review, incoming), file.name);
    } catch (error) {
      const messages = {
        IMPORT_TOO_LARGE: 'حجم الملف يتجاوز الحد المسموح: 256 KiB.',
        INVALID_JSON: 'الملف ليس JSON صالحًا.',
        INVALID_SCHEMA: 'الملف ليس مراجعة شيخة R5 مصدّرة.',
        SOURCE_MISMATCH: 'بصمة المصدر مختلفة؛ لا يمكن دمج مراجعة إصدار آخر.',
        UNSAFE_REVIEW_FLAGS: 'الملف يتضمن اعتمادًا أو نتيجة اختبار غير مسموح باستيرادها.',
        UNKNOWN_CRITERION: 'يتضمن الملف معرّف معيار غير موجود في R5.',
        INVALID_ITEM: 'إحدى الملاحظات غير صالحة أو تتجاوز 2000 محرف.',
        INVALID_REVIEW: 'بنية ملف المراجعة غير صالحة.'
      };
      $('notice').textContent = (messages[error.message] || 'تعذرت قراءة ملف المراجعة.') + ' لم تتغير الملاحظات الحالية.';
    } finally { $('import-review').disabled = false; $('import-file').value = ''; }
  }
  function confirmImport() {
    if (!pendingImport) return;
    const result = applyImport(pendingImport.plan, pendingImport.choices);
    if (!result.changedIds.length) return;
    undoSnapshot = pendingImport.plan.local;
    review = result.items; saveReview(); $('undo-import').disabled = false;
    $('import-dialog').close(); selectView('acceptance');
    $('notice').textContent = `دُمجت ${result.changedIds.length} ملاحظات.` + (storageAvailable ? ' حُفظت في هذا المتصفح.' : ' الحفظ المحلي غير متاح؛ صدّر المراجعة لحفظها.');
  }
  function badge(text, type = '') { return node('span', text, 'badge ' + type); }
  function button(text, action, className = 'link') {
    const el = node('button', text, className); el.type = 'button'; el.addEventListener('click', action); return el;
  }
  function table(headers, rows, renderRow) {
    const wrap = node('div', undefined, 'table-scroll');
    wrap.tabIndex = 0; wrap.setAttribute('role', 'region'); wrap.setAttribute('aria-label', titles[view]);
    const table = node('table'), head = node('thead'), tr = node('tr'), body = node('tbody');
    for (const [text, className] of headers) { const cell = node('th', text, className); cell.scope = 'col'; tr.append(cell); }
    head.append(tr); table.append(head, body); wrap.append(table);
    for (const row of rows) body.append(renderRow(row));
    if (!rows.length) wrap.append(node('p', 'لا توجد نتائج مطابقة.', 'empty'));
    return wrap;
  }
  function cell(content, className) { const el = node('td', undefined, className); el.append(typeof content === 'string' ? node('span', content) : content); return el; }
  function options(items) {
    $('filter').replaceChildren();
    for (const [id, name] of items) { const option = node('option', name); option.value = id; $('filter').append(option); }
  }
  function selectView(next) {
    view = Object.hasOwn(titles, next) ? next : 'systems';
    document.querySelectorAll('nav button').forEach(button => { if (button.dataset.view === view) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current'); });
    $('view-title').textContent = titles[view]; $('search').value = ''; $('notice').textContent = '';
    $('toolbar').hidden = !['systems', 'flows', 'acceptance'].includes(view);
    $('filter-label').firstChild.textContent = view === 'acceptance' ? 'المراجعة' : 'العائلة';
    options(view === 'acceptance' ? [['all', 'كل الحالات'], ...Object.entries(reviewStates)] : [['all', 'كل العائلات'], ...data.families.map(f => [f.id, f.id + ' · ' + f.name])]);
    render();
    window.scrollTo(0, 0);
  }
  function matches(row) { return normalize(Object.values(row).join(' ')).includes(normalize($('search').value.trim())); }
  function showSystem(id) {
    const system = data.systems.find(row => row.id === id);
    if (!system) return;
    $('dialog-title').textContent = `${system.id} · ${system.name}`;
    const body = $('dialog-body'); body.replaceChildren(badge('تصميم مرجعي'));
    const dl = node('dl');
    for (const [key, value] of [['العائلة', data.families.find(f => f.id === system.family).name], ['مالك الدور', system.owner], ['مخرج العائلة', system.output], ['مصدر المعرّف', 'رمز العائلة وترتيب الوحدة في جدول R5؛ ليس معرّف خدمة متصلة.']]) dl.append(node('dt', key), node('dd', value));
    body.append(dl, node('h3', 'عقود الربط المرتبطة'));
    const connected = data.flows.filter(flow => flow.source === id || flow.target === id);
    if (!connected.length) body.append(node('p', 'لا عقد مدرج لهذه الوحدة في R5.'));
    for (const flow of connected) body.append(button(flow.id + ' · ' + flow.event, () => { $('details').close(); selectView('flows'); $('search').value = flow.id; render(); $('search').focus(); }, 'flow-link'));
    $('details').showModal();
  }
  function renderSystems() {
    const rows = data.systems.filter(row => matches(row) && ($('filter').value === 'all' || row.family === $('filter').value));
    $('result-count').textContent = `${rows.length} / 88 وحدة`;
    return table([['المعرّف', ''], ['الوحدة', ''], ['مالك الدور', 'owner-column'], ['الحالة', 'state-column']], rows, row => {
      const tr = node('tr'); tr.append(cell(button(row.id, () => showSystem(row.id)), 'id'), cell(row.name, 'unit-name'), cell(row.owner, 'owner-column'), cell(badge('تصميم مرجعي'), 'state-column')); return tr;
    });
  }
  function renderFlows() {
    const family = $('filter').value;
    const rows = data.flows.filter(row => matches(row) && (family === 'all' || row.source.startsWith(family + '-') || row.target.startsWith(family + '-')));
    $('result-count').textContent = `${rows.length} / 14 عقدًا`;
    return table([['العقد', ''], ['المصدر', ''], ['المستهلك', ''], ['الحدث', ''], ['شرط العبور', '']], rows, row => {
      const tr = node('tr'); tr.append(cell(row.id, 'id'), cell(button(row.source, () => showSystem(row.source)), 'id'), cell(button(row.target, () => showSystem(row.target)), 'id'), cell(node('bdi', row.event)), cell(row.gate)); return tr;
    });
  }
  function renderEditor() {
    const criterion = data.criteria.find(row => row.id === selectedCriterion);
    const item = review[criterion.id] || { state: 'NOT_REVIEWED', note: '' };
    const editor = node('section', undefined, 'review-editor');
    editor.append(node('h3', criterion.id + ' · ' + criterion.scenario), node('p', criterion.expected));
    const statusLabel = node('label', 'قرار المراجعة'), select = node('select');
    select.id = 'review-state'; statusLabel.htmlFor = select.id;
    for (const [key, title] of Object.entries(reviewStates)) { const option = node('option', title); option.value = key; select.append(option); } select.value = item.state;
    const noteLabel = node('label', 'ملاحظات المراجع'), note = node('textarea'); note.id = 'review-note'; noteLabel.htmlFor = note.id; note.maxLength = 2000; note.value = item.note;
    const update = () => {
      clearUndo();
      review[criterion.id] = { state: select.value, note: note.value, updatedAt: new Date().toISOString() };
      saveReview();
      const label = document.querySelector(`[data-review-label="${criterion.id}"]`);
      if (label) { label.textContent = reviewStates[select.value]; label.className = 'badge ' + (select.value === 'NEEDS_CHANGE' ? 'warn' : 'info'); }
    };
    select.addEventListener('change', () => { update(); if ($('filter').value !== 'all') render(); }); note.addEventListener('input', update);
    const saved = node('small', storageAvailable ? 'ملاحظات محلية؛ لا تعد نتيجة اختبار أو موافقة نشر.' : 'الحفظ المحلي غير متاح. استخدم تصدير المراجعة.'); saved.id = 'save-state'; saved.setAttribute('aria-live', 'polite');
    editor.append(statusLabel, select, noteLabel, note, saved); return editor;
  }
  function renderAcceptance() {
    const rows = data.criteria.filter(row => matches(row) && ($('filter').value === 'all' || (review[row.id]?.state || 'NOT_REVIEWED') === $('filter').value));
    $('result-count').textContent = `${rows.length} / 34 معيارًا`;
    const layout = node('div', undefined, 'review-layout');
    layout.append(table([['المعرّف', ''], ['السيناريو', ''], ['المراجعة', '']], rows, row => {
      const tr = node('tr', undefined, row.id === selectedCriterion ? 'selected' : '');
      const state = badge(reviewStates[review[row.id]?.state || 'NOT_REVIEWED'], review[row.id]?.state === 'NEEDS_CHANGE' ? 'warn' : 'info'); state.dataset.reviewLabel = row.id;
      tr.append(cell(button(row.id, () => { selectedCriterion = row.id; render(); $('review-state').focus(); }), 'id'), cell(row.scenario), cell(state)); return tr;
    }), renderEditor()); return layout;
  }
  function documentSection(id) {
    const article = node('article', undefined, 'document');
    for (const block of data.sections[id]) {
      if (block.type === 'table') {
        article.append(table(block.rows[0].map(text => [text, '']), block.rows.slice(1), row => { const tr = node('tr'); row.forEach(text => tr.append(cell(text))); return tr; }));
      } else if (block.type === 'li') { const list = node('ul'); list.append(node('li', block.text)); article.append(list); }
      else article.append(node(block.type === 'h1' ? 'h2' : block.type, block.text));
    }
    return article;
  }
  function renderReferences() {
    const root = node('div'), visuals = node('div', undefined, 'references');
    for (const [index, visual] of data.visuals.entries()) {
      const figure = node('figure'), img = node('img'); img.src = visual.src; img.alt = visualWords(visual.alt); img.loading = 'lazy';
      figure.append(img, node('figcaption', `مرجع بصري ${index + 1} · تصور وليس إثبات منشأة قائمة`)); visuals.append(figure);
    }
    root.append(visuals, node('p', 'SHA-256 · ' + data.sourceSha256, 'hash'));
    for (const [id, title] of [['daily', 'خط الإنتاج اليومي في المرجع'], ['product', 'المخرج D001'], ['source', 'المصدر والحقوق'], ['verification', 'التحقق التاريخي في R5']]) {
      const details = node('details'); details.append(node('summary', title), documentSection(id)); root.append(details);
    }
    return root;
  }
  function render() {
    $('view').replaceChildren();
    const text = ['architecture', 'rfq', 'references'].includes(view)
      ? 'محتوى R5 التاريخي. حالات التشغيل الواردة فيه لم تُتحقق في هذه الواجهة.'
      : view === 'acceptance' ? '34 معيارًا مرجعيًا. الملاحظات أدناه ليست نتائج اختبار؛ لا تمنح اعتماد نشر.' : 'وحدات وعقود تصميم مقترحة. لا يُستنتج التشغيل أو الاتصال من إدراجها في الكتالوج.';
    $('view').append(node('p', text, 'callout'));
    $('view').append(view === 'systems' ? renderSystems() : view === 'flows' ? renderFlows() : view === 'acceptance' ? renderAcceptance() : view === 'references' ? renderReferences() : documentSection(view));
    countReviews();
  }
  document.querySelectorAll('nav button').forEach(button => button.addEventListener('click', () => selectView(button.dataset.view)));
  $('search').addEventListener('input', render); $('filter').addEventListener('change', render);
  $('clear').addEventListener('click', () => { $('search').value = ''; $('filter').value = 'all'; render(); $('search').focus(); });
  $('export-catalog').addEventListener('click', () => download({ schema: data.schema, sourceSha256: data.sourceSha256, systems: data.systems, families: data.families, flows: data.flows, criteria: data.criteria, executionEvidence: data.executionEvidence, publicationApproval: false }, 'SHEIKHA_R5_CATALOG.json'));
  $('export-review').addEventListener('click', () => download(envelope(), 'SHEIKHA_R5_REVIEW.json'));
  $('import-review').addEventListener('click', () => $('import-file').click());
  $('import-file').addEventListener('change', event => importFile(event.target.files[0]));
  $('confirm-import').addEventListener('click', confirmImport);
  for (const id of ['cancel-import', 'close-import']) $(id).addEventListener('click', () => $('import-dialog').close());
  $('import-dialog').addEventListener('close', () => { pendingImport = null; });
  $('undo-import').addEventListener('click', () => {
    if (!undoSnapshot) return;
    review = undoSnapshot; clearUndo(); saveReview(); selectView('acceptance');
    $('notice').textContent = 'أُعيدت المراجعة إلى ما قبل آخر استيراد.' + (storageAvailable ? '' : ' الحفظ المحلي غير متاح؛ صدّر المراجعة لحفظها.');
  });
  $('close-dialog').addEventListener('click', () => $('details').close());
  $('source-name').textContent = data.sourceFilename;
  selectView('systems');
})();
