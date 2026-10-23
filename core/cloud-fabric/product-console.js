(() => {
  'use strict';
  const data = __REGISTRY__, probe = __PROBE__;
  const byId = id => document.getElementById(id);
  const groups = new Map(data.categories.map(group => [group.id, group.title]));
  const products = new Map(data.products.map(product => [product.id, product]));
  const key = `sheikha-cloud-pilot-v1:${data.scopeSha256}`;
  let selected = new Set(data.products.filter(product => product.pilotPriority).map(product => product.id));
  const node = (tag, value, className) => { const element = document.createElement(tag); if (value !== undefined) element.textContent = value; if (className) element.className = className; return element; };
  const notice = value => { byId('notice').textContent = value; byId('notice').hidden = !value; };
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      if (saved.length > 64000) throw Error('LIMIT');
      const values = JSON.parse(saved);
      if (!Array.isArray(values) || values.length > data.products.length || values.some(id => typeof id !== 'string' || !products.has(id))) throw Error('SCHEMA');
      selected = new Set(values);
    }
  } catch { notice('تعذر تحميل الاختيار المحفوظ؛ النطاق الأولي ظاهر دون تغيير أي خدمة.'); }
  const lifecycle = product => product.lifecycle === 'LOCAL_CANDIDATE_NOT_ACCEPTED' ? 'مرشح محلي · غير معتمد' : 'مقترح · لم يُنفذ';
  function saveSelection() {
    try { localStorage.setItem(key, JSON.stringify([...selected])); notice('حُفظ نطاق التجربة محليًا. لم يُعتمد التنفيذ.'); }
    catch { notice('تعذر الحفظ في المتصفح. الاختيار متاح مؤقتًا ويمكن تنزيل خطة التجربة.'); }
  }
  function fact(container, label, value, code = false) {
    const dd = node('dd'); dd.append(node(code ? 'code' : 'span', value)); container.append(node('dt', label), dd);
  }
  function detail(product) {
    byId('detail-title').textContent = product.nameAr;
    const body = byId('detail-body'); body.replaceChildren();
    const facts = node('dl', undefined, 'facts');
    fact(facts, 'المعرف', product.id, true); fact(facts, 'المجال', groups.get(product.categoryId));
    fact(facts, 'مرجع القائمة', product.referenceLabel); fact(facts, 'حالة البناء', lifecycle(product));
    fact(facts, 'التشغيل السحابي', 'غير مثبت'); fact(facts, 'واجهة الربط المقترحة', product.proposedApi || 'تحتاج تحديدًا', true);
    body.append(facts, node('h3', 'معيار القبول المقترح'), node('p', product.acceptance), node('h3', 'أدلة الملفات المحلية'));
    if (!product.evidence.length) body.append(node('p', 'لا يوجد ربط بملفات تنفيذ في هذا السجل.'));
    for (const evidence of product.evidence) {
      const list = node('dl', undefined, 'facts'); fact(list, 'الملف', evidence.path, true);
      fact(list, 'القراءة', evidence.sha256 ? 'ملف موجود؛ لم يُثبت السلوك التشغيلي' : 'مفقود أو غير قابل للقراءة الآمنة');
      fact(list, 'SHA-256', evidence.sha256 || 'غير متاح', true); body.append(list);
    }
    body.append(node('p', 'اسم المنتج واتجاهه الوظيفي مقترحان. وجود الشيفرة أو بصمتها لا يثبت اكتمال المنتج أو التكافؤ مع المرجع.', 'boundary'));
    byId('details').showModal(); byId('details').scrollTop = 0;
  }
  function render() {
    const query = byId('search').value.trim().toLocaleLowerCase();
    const category = byId('category').value, state = byId('lifecycle').value;
    const rows = data.products.filter(product => (!category || product.categoryId === category) && (!state || product.lifecycle === state) && `${product.nameAr} ${product.referenceLabel} ${product.id}`.toLocaleLowerCase().includes(query));
    byId('rows').replaceChildren();
    for (const product of rows) {
      const row = node('tr');
      const choose = node('input'); choose.type = 'checkbox'; choose.checked = selected.has(product.id); choose.setAttribute('aria-label', `ضم ${product.nameAr} إلى التجربة`);
      choose.addEventListener('change', () => { choose.checked ? selected.add(product.id) : selected.delete(product.id); saveSelection(); renderPilot(); });
      const first = node('td'); first.append(choose); row.append(first, node('td', product.nameAr), node('td', product.referenceLabel), node('td', groups.get(product.categoryId)));
      const stateCell = node('td'); stateCell.append(node('span', lifecycle(product), `badge${product.lifecycle === 'LOCAL_CANDIDATE_NOT_ACCEPTED' ? ' local' : ''}`));
      const last = node('td'), button = node('button', undefined, 'icon'); button.title = `تفاصيل ${product.nameAr}`; button.setAttribute('aria-label', button.title);
      button.append(byId('detail-icon').content.cloneNode(true)); button.addEventListener('click', () => detail(product)); last.append(button); row.append(stateCell, last); byId('rows').append(row);
    }
    byId('result-count').textContent = `${rows.length} من ${data.products.length}`; byId('empty').hidden = rows.length !== 0;
  }
  function renderPilot() {
    const list = byId('selected-products'); list.replaceChildren();
    for (const product of data.products.filter(product => selected.has(product.id))) {
      const item = node('li'); item.append(node('strong', product.nameAr), node('small', lifecycle(product)), node('p', product.acceptance)); list.append(item);
    }
    byId('selected-count').textContent = `(${selected.size})`; byId('pilot-empty').hidden = selected.size !== 0; byId('export-pilot').disabled = selected.size === 0;
  }
  function download(name, payload) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2) + '\n'], { type: 'application/json' }));
    const link = node('a'); link.href = url; link.download = name; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  const statusLabels = { NOT_REQUESTED: 'لم يُطلب فحص اتصال في هذا البناء', BLOCKED_AUTH_NOT_CONFIGURED: 'متوقف: تفويض القراءة غير مهيأ', ENABLED_API_INVENTORY_OBSERVED: 'اكتمل جرد الواجهات المفعلة فقط', AUTH_REJECTED: 'رفضت الخدمة التفويض', PERMISSION_DENIED: 'صلاحية الجرد غير متاحة', TIMEOUT: 'انتهت مهلة الفحص' };
  byId('total').textContent = data.counts.products; byId('categories-count').textContent = data.counts.categories; byId('candidates-count').textContent = data.counts.localCandidates;
  for (const group of data.categories) { const option = node('option', group.title); option.value = group.id; byId('category').append(option); }
  const facts = byId('connection-facts'); fact(facts, 'المشروع المعلن محليًا', data.project.id, true); fact(facts, 'رقم المشروع المعلن', data.project.number, true);
  fact(facts, 'نتيجة فحص القراءة', statusLabels[probe.status] || 'لم يكتمل الفحص؛ لا يُستنتج تفعيل أو تعطيل');
  fact(facts, 'وقت الفحص', probe.observedAt || 'لم يُنفذ', true); fact(facts, 'الطلبات الخارجية', String(probe.requestCount));
  fact(facts, 'واجهات فُعلت بهذه الأداة', '0'); fact(facts, 'أحمال عمل مختبرة', '0');
  for (const product of data.products.filter(product => product.proposedApi)) {
    const item = node('li'); const observation = probe.complete ? (probe.services.includes(product.proposedApi) ? 'ظهرت في الجرد المفعّل؛ الحمل غير مختبر' : 'لم تظهر في الجرد المفعّل') : 'حالة الواجهة غير معلومة';
    item.append(node('strong', product.nameAr), node('small', product.proposedApi), node('span', observation)); byId('bindings').append(item);
  }
  for (const source of data.sources) { const item = node('li'), link = node('a', source.purpose); link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; item.append(link); byId('sources').append(item); }
  byId('observed').textContent = `وقت جرد الملفات: ${new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Riyadh' }).format(new Date(data.observedAt))} · الرياض`;
  byId('source-proof').textContent = data.request ? `بصمة المرفق: ${data.request.sha256} · مطابقة ${data.request.matchedProducts} بندًا` : 'لم يُرفق مصدر للمطابقة في هذا البناء.';
  for (const button of document.querySelectorAll('nav button')) button.addEventListener('click', () => {
    for (const section of document.querySelectorAll('.view')) section.hidden = section.id !== button.dataset.view;
    for (const item of document.querySelectorAll('nav button')) item.removeAttribute('aria-current');
    button.setAttribute('aria-current', 'page'); window.scrollTo(0, 0);
    if (button.dataset.view === 'catalog') render();
  });
  ['search', 'category', 'lifecycle'].forEach(id => byId(id).addEventListener(id === 'search' ? 'input' : 'change', render));
  byId('clear').addEventListener('click', () => { ['search', 'category', 'lifecycle'].forEach(id => { byId(id).value = ''; }); render(); });
  byId('close-details').addEventListener('click', () => byId('details').close());
  byId('export-catalog').addEventListener('click', () => download('sheikha-product-registry.json', data));
  byId('export-pilot').addEventListener('click', () => download('sheikha-pilot-draft.json', {
    schema: 'SHEIKHA_PRODUCT_PILOT_DRAFT_V1', scopeSha256: data.scopeSha256, exportedAt: new Date().toISOString(),
    status: 'DRAFT_REQUIRES_REVIEW', selectedProducts: data.products.filter(product => selected.has(product.id)).map(({ id, nameAr, acceptance }) => ({ id, nameAr, acceptance })),
    budgetApproved: false, executionAuthorized: false, publicationApproved: false, partnershipEstablished: false
  }));
  render(); renderPilot();
})();
