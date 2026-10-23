'use strict';
(() => {
  const $ = id => document.getElementById(id), API = '/api/sheikha/workspace/v1';
  const el = (tag, text) => { const node = document.createElement(tag); node.textContent = text; return node; };
  const kinds = { DOMAIN: 'نطاق', SERVICE: 'خدمة', SOFTWARE: 'مصدر برمجي', DESIGN_PACKAGE: 'حزمة تصميم' };
  const evidenceLabels = { DECLARATION_ONLY: 'بيان وصفي فقط', LOCAL_SOURCE_OBSERVED: 'مصدر محلي مرصود',
    DESIGN_ONLY_HOLD: 'تصميم فقط · الإنتاج متوقف', REVIEW_REQUIRED: 'يحتاج مراجعة', INCOMPLETE: 'أدلة محلية ناقصة', DIGEST_MISMATCH: 'اختلاف عن البصمة المسجلة' };
  const sourceLabels = { READ: 'ملف مقروء', MISSING: 'ملف غير متاح', UNREADABLE: 'قراءة مرفوضة', INVALID_JSON: 'بنية غير صالحة' };
  const requirementLabels = { LOCAL_PASS: 'فحص محلي ناجح', LOCAL_FAIL: 'فحص محلي غير مستوفى', NOT_TESTED: 'قبول غير مختبر', REVIEW_REQUIRED: 'مراجعة مطلوبة' };
  let report = null, selected = null, busy = false;
  function download(value, name) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function controls() {
    $('asset-refresh').disabled = busy; $('asset-export').disabled = busy || !report;
    $('passport-export').disabled = busy || !selected;
    for (const item of document.querySelectorAll('#asset-content button,#asset-content input,#asset-content select')) item.disabled = busy || !report;
    $('passport-export').disabled = busy || !selected;
    $('plan-export').disabled = busy || !report?.executionPlan;
  }
  const assetName = id => report.assets.find(a => a.id === id)?.name || id;
  function renderList() {
    if (!report) return;
    const query = $('asset-search').value.trim().toLocaleLowerCase(), kind = $('asset-kind').value;
    const items = report.assets.filter(a => (!kind || a.kind === kind)
      && [a.name, a.id, a.role, ...a.capabilities].join(' ').toLocaleLowerCase().includes(query));
    $('asset-empty').hidden = items.length > 0;
    $('asset-list').replaceChildren(...items.map(a => {
      const row = document.createElement('li'); row.dataset.asset = a.id; row.classList.toggle('selected', a.id === selected?.id);
      const label = document.createElement('div'); label.append(el('strong', a.name), el('small', `${kinds[a.kind]} · ${evidenceLabels[a.evidenceStatus]}`));
      const button = document.createElement('button'); button.type = 'button'; button.className = 'icon-button';
      button.title = `فتح بطاقة ${a.name}`; button.setAttribute('aria-label', button.title);
      const icon = document.createElement('img'); icon.src = '/architecture-explorer/icons/book-open.svg'; icon.className = 'icon'; icon.alt = ''; button.append(icon);
      button.addEventListener('click', () => { selected = a; renderList(); renderPassport(); $('passport-title').focus(); });
      row.append(label, button); return row;
    }));
  }
  function renderPassport() {
    $('passport-lab').hidden = selected?.id !== 'supplier-package';
    $('asset-passport').hidden = !selected; if (!selected) return;
    const a = selected;
    $('passport-title').textContent = a.name; $('passport-code').textContent = a.id; $('passport-role').textContent = a.role;
    $('passport-facts').replaceChildren(...[
      ['السجل الرقمي', 'مسودة موثقة محليًا'], ['الملكية والشراء', 'تصريح شراء عام؛ نطاق الأصل ودليله غير متحققين'],
      ['الأدلة', evidenceLabels[a.evidenceStatus]], ['التشغيل الفعلي', 'متوقف لحين الاستكمال والتفويض'],
      ['الاسم البديل', a.aliases.join(' · ') || 'لا يوجد اسم بديل مسجل']
    ].map(([label, value]) => { const div = document.createElement('div'); div.append(el('dt', label), el('dd', value)); return div; }));
    $('passport-capabilities').replaceChildren(...a.capabilities.map(c => el('li', c)));
    $('passport-needs').replaceChildren(...a.needs.map(n => el('li', n)));
    $('passport-dependencies').textContent = a.dependsOn.map(assetName).join(' · ') || 'لا اعتماد آخر مقترح في هذا النطاق';
    $('passport-next').textContent = report.executionPlan?.nextActions.find(n => n.assetId === a.id).action || 'لم تُدرج خطة متطلبات في هذا التقرير.';
  }
  function renderRequirements() {
    if (!report?.executionPlan) return;
    const asset = $('requirement-asset').value, status = $('requirement-status').value;
    const query = $('requirement-search').value.trim().toLocaleLowerCase();
    const plan = report.executionPlan;
    const items = plan.requirements.filter(r => (!asset || r.assetId === asset) && (!status || r.status === status)
      && [r.id, r.title, assetName(r.assetId), ...r.acceptanceCriteria, ...r.requiredEvidence].join(' ').toLocaleLowerCase().includes(query));
    $('requirement-count').textContent = `${items.length} من ${plan.requirements.length} متطلبًا`;
    $('requirement-empty').hidden = items.length > 0;
    $('asset-requirements').replaceChildren(...items.map(r => {
      const details = document.createElement('details'); details.className = 'asset-requirement'; details.dataset.requirement = r.id;
      const summary = document.createElement('summary'), heading = document.createElement('span');
      heading.append(el('strong', r.title), el('small', assetName(r.assetId)));
      const label = el('span', requirementLabels[r.status]); label.className = 'requirement-status'; label.dataset.status = r.status;
      summary.append(heading, label); details.append(summary, el('code', r.id));
      const list = (title, items) => { const ul = document.createElement('ul'); ul.append(...items.map(t => el('li', t))); details.append(el('h3', title), ul); };
      list('معايير القبول', r.acceptanceCriteria); list('الأدلة المطلوبة', r.requiredEvidence);
      const gate = report.governance.gates.find(g => g.id === r.gateId);
      details.append(el('p', `${gate.name} · ${r.responsibleRole} · لم يُعيّن مسؤول بالاسم`));
      list('القدرات المرتبطة', r.capabilityIds.map(id => plan.capabilities.find(c => c.id === id).name).concat(r.capabilityIds.length ? [] : ['فحص أدلة فقط']));
      details.append(el('h3', 'سياق محلي، لا دليل قبول'));
      for (const ref of r.evidenceRefs) {
        const source = report.sources.find(s => s.id === ref.sourceId);
        const row = document.createElement('div'); row.className = 'requirement-source';
        row.append(el('p', `${source.label} · ${sourceLabels[ref.status]}`), el('code', ref.sha256 || 'NO_DIGEST')); details.append(row);
      }
      details.append(el('h3', 'متطلبات سابقة مقترحة'));
      if (!r.dependsOn.length) details.append(el('p', 'لا متطلب سابق في هذه الخطة.'));
      for (const id of r.dependsOn) {
        const previous = plan.requirements.find(item => item.id === id), link = el('a', `${previous.title} · ${requirementLabels[previous.status]}`);
        link.href = '#panel-plan'; link.className = 'asset-plan-link';
        link.addEventListener('click', e => { e.preventDefault(); openRequirement(id); }); details.append(link);
      }
      details.append(el('h3', 'الإجراء التالي'), el('p', r.nextAction)); return details;
    }));
  }
  function openRequirement(id) {
    if (!report?.executionPlan || busy) return;
    const requirement = report.executionPlan.requirements.find(r => r.id === id); if (!requirement) return;
    $('requirement-asset').value = requirement.assetId; $('requirement-search').value = ''; $('requirement-status').value = '';
    activate($('tab-plan')); renderRequirements();
    const details = [...$('asset-requirements').children].find(item => item.dataset.requirement === id);
    details.open = true; details.querySelector('summary').focus(); details.scrollIntoView({ block: 'start' });
  }
  function render() {
    $('asset-content').hidden = !report;
    const categories = report?.inventoryScope?.categories;
    $('asset-inventory-scope').hidden = !Array.isArray(categories);
    $('inventory-categories').replaceChildren(...(categories || []).map(category => {
      const row = document.createElement('div'); row.className = 'asset-gate'; row.dataset.scopeCategory = category.id;
      const title = document.createElement('div'); title.append(el('h3', category.name),
        el('small', category.knownAssetIds.length ? `${category.knownAssetIds.length} سجلات مرجعية؛ ليست مشتريات متحققة` : 'قائمة الأصول التفصيلية لم تُقدّم'));
      const evidence = document.createElement('div');
      if (category.knownAssetIds.length) evidence.append(el('p', category.knownAssetIds.map(assetName).join(' · ')));
      for (const [label, items] of [['بيانات الجرد المطلوبة', category.requiredDetails], ['أدلة المراجعة المطلوبة', category.requiredEvidence]]) {
        const list = document.createElement('ul'); list.append(...items.map(item => el('li', item))); evidence.append(el('strong', label), list);
      }
      row.append(title, evidence); return row;
    }));
    const hasPlan = Boolean(report?.executionPlan);
    $('tab-plan').hidden = !hasPlan; $('passport-plan').hidden = !hasPlan;
    document.querySelector('.asset-tabs').classList.toggle('without-plan', !hasPlan);
    if (report && !hasPlan && $('tab-plan').getAttribute('aria-selected') === 'true') activate($('tab-register'));
    $('asset-requirements').replaceChildren(); $('plan-summary').textContent = ''; $('requirement-count').textContent = '';
    if (!report) {
      selected = null; $('asset-list').replaceChildren(); $('asset-sources').replaceChildren();
      $('asset-layers').replaceChildren(); $('asset-links').replaceChildren(); $('asset-gates').replaceChildren();
      $('asset-json').textContent = ''; $('asset-summary').textContent = ''; renderPassport(); controls(); return;
    }
    selected = report.assets.find(a => a.id === selected?.id) || report.assets[0]; renderList(); renderPassport();
    const filteredAsset = $('requirement-asset').value;
    const all = el('option', 'جميع الأصول'); all.value = '';
    $('requirement-asset').replaceChildren(all, ...report.assets.map(a => { const option = el('option', a.name); option.value = a.id; return option; }));
    $('requirement-asset').value = report.assets.some(a => a.id === filteredAsset) ? filteredAsset : '';
    if (hasPlan) {
      const counts = report.executionPlan.summary;
      $('plan-summary').textContent = `${counts.capabilities} قدرة · ${counts.localChecksPassed} فحوص محلية ناجحة · ${counts.localChecksFailed} غير مستوفاة · ${counts.acceptanceNotTested} قبول غير مختبر · ${counts.reviewsRequired} مراجعة مطلوبة`;
      renderRequirements();
    }
    $('asset-summary').textContent = `${report.assets.length} أصول محددة · ${report.sources.filter(s => s.status === 'READ').length} من ${report.sources.length} ملفات مقروءة · الملكية غير متحققة · الإنتاج متوقف`;
    $('asset-layers').replaceChildren(...report.architecture.layers.map((layer, i) => {
      const li = document.createElement('li'); li.append(el('strong', `${i + 1}. ${layer.name}`), el('p', layer.members.map(assetName).join(' · '))); return li;
    }));
    $('asset-links').replaceChildren(...report.architecture.links.map(link => {
      const tr = document.createElement('tr'); tr.append(...[assetName(link.source), assetName(link.target), 'علاقة مقترحة'].map(t => el('td', t))); return tr;
    }));
    $('asset-gates').replaceChildren(...report.governance.gates.map(g => {
      const row = document.createElement('div'); row.className = 'asset-gate';
      const title = document.createElement('div'); title.append(el('h3', g.name), el('small', 'مراجعة مطلوبة'));
      const evidence = document.createElement('div'); evidence.append(el('strong', g.responsibleRole), el('p', g.requiredEvidence));
      row.append(title, evidence); return row;
    }));
    $('asset-duplicates').textContent = `${report.attachmentCopies} مرفقات مقروءة · ${report.uniqueAttachmentContents} محتويات مستقلة حسب البصمة. التكرار ليس دليلًا إضافيًا.`;
    const audit = report.packageAudit;
    $('asset-package').textContent = `حزمة الموردين الأصلية: ${audit.declaredHashesMatch ? 'تطابقت بصمات الملفات مع بيان الحزمة' : 'لم يثبت تطابق الملفات مع بيان الحزمة'}. الواجهات المصرح بعدم تنفيذها: ${audit.unimplementedContracts ?? 'غير متحقق'} من ${audit.contractsCount ?? 'غير متحقق'}. هذه حالة الحزمة المحفوظة؛ مختبر المشروع المحلي مستقل عنها ولا يعتمدها للإنتاج.`;
    $('asset-sources').replaceChildren(...report.sources.map(s => {
      const row = document.createElement('div'); row.className = 'asset-source'; row.dataset.source = s.id;
      row.append(el('strong', s.label), el('p', `${sourceLabels[s.status]} · ${s.bytes ?? 0} بايت`), el('code', s.sha256 || 'NO_DIGEST'));
      const status = el('small', s.matchesRecordedDigest === true ? 'مطابق للبصمة الواردة؛ ليس إثبات ملكية أو اتصال حي'
        : s.matchesRecordedDigest === false ? 'لا يطابق البصمة الواردة' : 'لا مقارنة ببصمة مرجعية متاحة');
      if (s.status !== 'READ' || s.matchesRecordedDigest === false) status.className = 'error'; row.append(status); return row;
    }));
    $('asset-json').textContent = JSON.stringify(report, null, 2); controls();
  }
  async function refresh() {
    if (busy) return; busy = true; report = null; render();
    $('asset-status').textContent = 'جارٍ قراءة الأدلة المحلية'; $('asset-status').classList.remove('error');
    try {
      const get = async (url, headers = {}) => { const r = await fetch(url, { headers, signal: AbortSignal.timeout(8000) }); if (!r.ok) throw Error('READ_FAILED'); return r.json(); };
      const { token } = await get(API + '/session'); report = await get(API + '/assets/report', { 'X-Sheikha-Session': token });
      render(); $('asset-status').textContent = `آخر قراءة: ${new Date(report.observedAt).toLocaleString('ar-SA', { calendar: 'gregory' })} · دون تنفيذ المصادر`;
    } catch { report = null; render(); $('asset-status').textContent = 'تعذرت قراءة الأدلة. التنزيل متوقف حتى تحديث ناجح.'; $('asset-status').classList.add('error'); }
    finally { busy = false; controls(); }
  }
  const tabs = [...document.querySelectorAll('[role=tab]')];
  function activate(tab) {
    for (const item of tabs) { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; $(item.getAttribute('aria-controls')).hidden = !active; }
  }
  tabs.forEach(tab => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', e => {
      const available = tabs.filter(item => !item.hidden), current = available.indexOf(tab);
      const index = e.key === 'Home' ? 0 : e.key === 'End' ? available.length - 1 : e.key === 'ArrowLeft' ? (current + 1) % available.length : e.key === 'ArrowRight' ? (current + available.length - 1) % available.length : null;
      if (index !== null) { e.preventDefault(); activate(available[index]); available[index].focus(); }
    });
  });
  $('asset-search').addEventListener('input', renderList); $('asset-kind').addEventListener('change', renderList);
  $('requirement-search').addEventListener('input', renderRequirements);
  for (const id of ['requirement-asset', 'requirement-status']) $(id).addEventListener('change', renderRequirements);
  $('passport-plan').addEventListener('click', e => {
    e.preventDefault(); if (report?.executionPlan && selected && !busy) openRequirement(report.executionPlan.nextActions.find(n => n.assetId === selected.id).requirementId);
  });
  $('plan-export').addEventListener('click', () => {
    if (report?.executionPlan && !busy) download({ plan: report.executionPlan, observedAt: report.observedAt, policy: report.policy,
      parentDossierDigest: report.integrity.digest }, 'SHEIKHA_ASSET_EXECUTION_PLAN.json');
  });
  $('asset-refresh').addEventListener('click', refresh);
  $('asset-export').addEventListener('click', () => { if (report && !busy) download(report, 'SHEIKHA_ASSET_DOSSIER.json'); });
  $('passport-export').addEventListener('click', () => {
    if (report && selected && !busy) download({ asset: selected, sources: report.sources.filter(s => selected.evidenceIds.includes(s.id)),
      observedAt: report.observedAt, policy: report.policy, parentDossierDigest: report.integrity.digest }, `SHEIKHA_ASSET_${selected.id}.json`);
  });
  refresh();
})();
