'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const el = (tag, text) => { const node = document.createElement(tag); node.textContent = text; return node; };
  const names = { suppliers: 'الموردون التجريبيون', materials: 'المواد التجريبية', documents: 'الوثائق التجريبية' };
  const categories = { METALS: 'المعادن', ENERGY: 'الطاقة', AUTOMATION: 'الأتمتة', RECYCLING: 'التدوير' };
  const kinds = { SPECIFICATION: 'مواصفة تجريبية', TEST_RECORD: 'سجل فحص تجريبي', LICENSE_SAMPLE: 'نموذج ترخيص' };
  const units = { kg: 'كيلوغرام', piece: 'قطعة', m: 'متر' };
  const tabs = [...document.querySelectorAll('[data-view]')];
  let view = 'suppliers', offset = 0, page = null, selected = null, token = null, busy = false, supplierOptions = null;
  function iconButton(icon, title, action, text) {
    const button = document.createElement('button'); button.type = 'button'; button.title = title; button.setAttribute('aria-label', title);
    if (!text) button.className = 'icon-button';
    const img = document.createElement('img'); img.className = 'icon'; img.alt = ''; img.src = `/architecture-explorer/icons/${icon}.svg`;
    button.append(img); if (text) button.append(document.createTextNode(text)); button.addEventListener('click', action); return button;
  }
  function controls() {
    for (const control of document.querySelectorAll('main button,main input,main select')) control.disabled = busy;
    $('lab-export').disabled = busy || !page;
    $('lab-previous').disabled = busy || !page || page.pagination.offset === 0;
    $('lab-next').disabled = busy || !page?.pagination.hasMore;
    $('lab-panel').setAttribute('aria-busy', String(busy));
  }
  function configure() {
    for (const tab of tabs) { const active = tab.dataset.view === view; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; }
    $('lab-panel').setAttribute('aria-labelledby', `tab-${view}`); $('lab-caption').textContent = names[view];
    const label = view === 'documents' ? 'نوع الوثيقة' : 'القطاع';
    $('lab-category-label').textContent = label; $('lab-column-type').textContent = label;
    $('lab-column-relation').textContent = view === 'suppliers' ? 'السجلات المرتبطة' : 'المورد';
    $('lab-supplier-label').hidden = view === 'suppliers';
    $('lab-category').replaceChildren(...[['', 'الكل'], ...Object.entries(view === 'documents' ? kinds : categories)].map(([value, title]) => {
      const option = el('option', title); option.value = value; return option;
    }));
  }
  function renderDetail() {
    $('lab-detail-title').textContent = selected?.name || 'تفاصيل السجل';
    $('lab-unselected').hidden = Boolean(selected); $('lab-detail-body').hidden = !selected; $('lab-detail-body').replaceChildren();
    if (!selected) return;
    const item = selected, detail = $('lab-detail-body'), facts = [['المصدر', 'بيانات اصطناعية للاختبار فقط']];
    detail.append(el('code', item.id));
    if (view !== 'documents') facts.push(['القطاع', categories[item.category]]);
    if (view === 'suppliers') facts.push(['الاعتماد', 'غير متحقق؛ ليس موردًا فعليًا'], ['المواد التجريبية', item.materialCount], ['الوثائق التجريبية', item.documentCount]);
    else facts.push(['المورد التجريبي', item.supplierName]);
    if (view === 'materials') facts.push(['وحدة القياس', units[item.unit]], ['التوفر التجاري', 'ليست مادة معروضة للبيع']);
    if (view === 'documents') facts.push(['النوع', kinds[item.kind]], ['المادة المرتبطة', item.materialId || 'لا ارتباط بمادة'], ['حجية الوثيقة', 'نموذج غير صالح لإثبات الحقوق'], ['المحتوى', 'بيانات وصفية فقط؛ لا ملف متاح']);
    const dl = document.createElement('dl'); dl.append(...facts.map(([label, value]) => { const row = document.createElement('div'); row.append(el('dt', label), el('dd', value)); return row; })); detail.append(dl);
    const actions = document.createElement('div'); actions.className = 'lab-actions';
    if (view === 'suppliers') {
      actions.append(iconButton('box', 'مواد المورد التجريبية', () => changeView('materials', { supplierId: item.id }), 'المواد'),
        iconButton('book-open', 'وثائق المورد التجريبية', () => changeView('documents', { supplierId: item.id }), 'الوثائق'));
    } else actions.append(iconButton('list', 'سجل المورد التجريبي', () => changeView('suppliers', { q: item.supplierId }), 'المورد'));
    detail.append(actions);
  }
  function render() {
    $('lab-rows').replaceChildren(); $('lab-empty').hidden = !page || page.items.length > 0; renderDetail();
    $('lab-page-count').textContent = ''; $('lab-contract-name').textContent = ''; $('lab-contract-path').textContent = ''; $('lab-requirement').textContent = '';
    if (!page) { controls(); return; }
    for (const item of page.items) {
      const row = document.createElement('tr'); row.dataset.record = item.id; row.classList.toggle('selected', selected?.id === item.id);
      const name = document.createElement('td'); name.append(el('strong', item.name), el('code', item.id));
      const category = el('td', view === 'documents' ? kinds[item.kind] : categories[item.category]);
      if (view === 'materials') category.append(el('small', units[item.unit]));
      const related = el('td', view === 'suppliers' ? `${item.materialCount} مواد · ${item.documentCount} وثائق` : item.supplierName);
      const action = document.createElement('td'); action.append(iconButton('info', `تفاصيل ${item.name}`, () => { selected = item; render(); $('lab-detail-title').focus(); }));
      row.append(name, category, related, action); $('lab-rows').append(row);
    }
    const p = page.pagination;
    $('lab-page-count').textContent = p.returned ? `${p.offset + 1}–${p.offset + p.returned} من ${p.total} سجلًا` : `0 من ${p.total} سجلًا`;
    $('lab-contract-name').textContent = page.contract.name; $('lab-contract-path').textContent = `${page.contract.method} ${page.contract.path}`;
    $('lab-requirement').textContent = `مرجع المتطلب: ${page.contract.requirementId}`; controls();
  }
  async function getSession() {
    const response = await fetch('/api/sheikha/workspace/v1/session', { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw Error('SESSION_FAILED'); token = (await response.json()).token;
  }
  async function read(collection, query) {
    if (!token) await getSession();
    const request = () => fetch(`/api/${collection}?${query}`, { headers: { 'X-Sheikha-Session': token }, signal: AbortSignal.timeout(8000) });
    let response = await request();
    if (response.status === 403) { await getSession(); response = await request(); }
    if (!response.ok) throw Error('READ_FAILED');
    const result = await response.json();
    if (result.kind !== 'SUPPLIER_LAB_PAGE' || result.collection !== collection || result.datasetId !== 'SHEIKHA_SUPPLIER_SYNTHETIC_V1'
      || result.policy?.syntheticData !== true || result.policy?.productionEnabled !== false
      || !Array.isArray(result.items) || result.items.length > 25 || !result.items.every(item => item.synthetic === true)
      || result.pagination?.returned !== result.items.length) throw Error('DATA_REJECTED');
    return result;
  }
  async function load() {
    if (busy) return; busy = true; page = null; selected = null; render();
    $('lab-status').classList.remove('error'); $('lab-status').textContent = 'جارٍ قراءة سجلات المختبر';
    try {
      if (!supplierOptions) {
        supplierOptions = (await read('suppliers', new URLSearchParams({ limit: '25' }))).items;
        const current = $('lab-supplier').value, all = el('option', 'جميع الموردين'); all.value = '';
        $('lab-supplier').replaceChildren(all, ...supplierOptions.map(item => { const option = el('option', item.name); option.value = item.id; return option; }));
        $('lab-supplier').value = current;
      }
      const query = new URLSearchParams({ offset: String(offset), limit: $('lab-limit').value });
      if ($('lab-search').value.trim()) query.set('q', $('lab-search').value.trim());
      if ($('lab-category').value) query.set(view === 'documents' ? 'kind' : 'category', $('lab-category').value);
      if (view !== 'suppliers' && $('lab-supplier').value) query.set('supplierId', $('lab-supplier').value);
      page = await read(view, query); render(); $('lab-status').textContent = `${page.pagination.total} سجلًا تجريبيًا مطابقًا · لا اعتماد إنتاج`;
    } catch { page = null; selected = null; render(); $('lab-status').textContent = 'تعذرت قراءة السجلات. التنزيل متوقف حتى قراءة ناجحة.'; $('lab-status').classList.add('error'); }
    finally { busy = false; controls(); }
  }
  function changeView(next, filters = {}) {
    if (busy || !Object.hasOwn(names, next)) return;
    view = next; offset = 0; configure(); $('lab-search').value = filters.q || ''; $('lab-supplier').value = filters.supplierId || ''; load();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => changeView(tab.dataset.view));
    tab.addEventListener('keydown', e => {
      const index = e.key === 'Home' ? 0 : e.key === 'End' ? 2 : e.key === 'ArrowLeft' ? (i + 1) % 3 : e.key === 'ArrowRight' ? (i + 2) % 3 : null;
      if (index !== null && !busy) { e.preventDefault(); tabs[index].focus(); changeView(tabs[index].dataset.view); }
    });
  });
  $('lab-filters').addEventListener('submit', e => { e.preventDefault(); if (!busy) { offset = 0; load(); } });
  for (const field of ['lab-category', 'lab-supplier', 'lab-limit']) $(field).addEventListener('change', () => { if (!busy) { offset = 0; load(); } });
  $('lab-reset').addEventListener('click', () => changeView(view));
  $('lab-refresh').addEventListener('click', load);
  $('lab-previous').addEventListener('click', () => { if (page && !busy) { offset = Math.max(0, page.pagination.offset - page.pagination.limit); load(); } });
  $('lab-next').addEventListener('click', () => { if (page?.pagination.hasMore && !busy) { offset = page.pagination.offset + page.pagination.limit; load(); } });
  $('lab-export').addEventListener('click', () => {
    if (!page || busy) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(page, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `SHEIKHA_LAB_${view}_${page.pagination.offset}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  configure(); load();
})();
