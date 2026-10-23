'use strict';
(() => {
  const API = '/api/sheikha/workspace/v1';
  const $ = id => document.getElementById(id);
  let catalog, token, selected, plan, loading = false, submitting = false;
  const icons = { metals: 'box', food: 'globe', energy: 'cpu', water: 'globe', electronics: 'cpu',
    robotics: 'network', digital: 'layers', visual: 'play', circular: 'refresh-cw',
    construction: 'landmark', logistics: 'box', space: 'compass' };
  const text = (tag, content, className) => {
    const el = document.createElement(tag); el.textContent = content;
    if (className) el.className = className;
    return el;
  };
  const icon = name => {
    const el = document.createElement('img'); el.className = 'icon'; el.alt = '';
    el.src = `/architecture-explorer/icons/${name}.svg`; return el;
  };
  const options = (el, items) => el.replaceChildren(...items.map(item => {
    const option = text('option', item.nameAr); option.value = item.id; return option;
  }));
  async function request(path, body) {
    const response = await fetch(API + path, {
      signal: AbortSignal.timeout(12000),
      ...(body ? { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Sheikha-Session': token },
        body: JSON.stringify(body) } : {})
    });
    if (!response.ok) throw Error('REQUEST_FAILED');
    return response.json();
  }
  function invalidate() {
    plan = null;
    $('industry-result').hidden = true;
    $('plan-status').textContent = '';
  }
  function renderSectors() {
    const query = $('industry-search').value.trim().toLocaleLowerCase();
    const items = catalog.templates.filter(item =>
      `${item.nameAr} ${item.nameEn} ${item.output}`.toLocaleLowerCase().includes(query));
    $('industry-sectors').replaceChildren(...items.map(item => {
      const button = document.createElement('button'); button.type = 'button';
      button.dataset.sector = item.id; button.setAttribute('aria-pressed', String(selected.id === item.id));
      const label = document.createElement('span');
      label.append(text('strong', item.nameAr), text('small', item.nameEn));
      button.append(icon(icons[item.id]), label);
      button.addEventListener('click', () => chooseSector(item.id));
      return button;
    }));
    $('industry-empty').hidden = items.length !== 0;
  }
  function renderDetail() {
    $('sector-code').textContent = selected.nameEn.toUpperCase();
    $('sector-title').textContent = selected.nameAr;
    $('sector-output').textContent = selected.output;
    $('sector-resources').replaceChildren(...selected.resources.map(item => text('li', item)));
    $('sector-stages').replaceChildren(...selected.stages.map(item => text('li', item)));
    $('sector-review').textContent = selected.review;
  }
  function syncForm() {
    const type = catalog.types.find(item => item.id === $('plan-type').value);
    options($('plan-template'), catalog.templates.filter(item => item.types.includes(type.id)));
    if (!selected.types.includes(type.id)) selected = catalog.templates.find(item => item.types.includes(type.id));
    $('plan-template').value = selected.id;
    // Research templates cannot silently become terrestrial production requests.
    if (selected.id === 'space') $('plan-horizon').value = 'space-research';
    $('plan-horizon').disabled = selected.id === 'space';
    $('plan-structure').textContent = `${type.nameAr}: ${type.children.join(' · ')}`;
    renderSectors(); renderDetail();
  }
  function chooseSector(id) {
    if (submitting) return;
    selected = catalog.templates.find(item => item.id === id);
    if (!selected.types.includes($('plan-type').value)) $('plan-type').value = selected.types[0];
    invalidate(); syncForm();
  }
  function renderPlan() {
    $('result-title').textContent = plan.name;
    $('result-output').textContent = `${plan.type.nameAr} · ${plan.horizon.nameAr} · ${plan.output}`;
    const targets = [
      ['المخرجات المستهدفة', plan.targets.quantity],
      ['المعدل اليومي المستهدف (مقرب)', plan.targets.dailyTargetUnits],
      ['حصة المنفعة المجتمعية المستهدفة', plan.targets.communityUnits],
      ['فترة التخطيط بالأيام', plan.targets.planningDays]
    ];
    $('industry-targets').replaceChildren(...targets.map(([label, value]) => {
      const item = document.createElement('div'); item.append(text('dt', label), text('dd', value.toLocaleString('ar-SA'))); return item;
    }));
    $('result-stages').replaceChildren(...plan.stages.map(stage => {
      const item = text('li', stage.nameAr); item.append(text('small', 'لم يبدأ · مسؤول غير معين')); return item;
    }));
    $('industry-reviews').replaceChildren(...plan.reviews.map(review => {
      const row = document.createElement('div');
      row.append(text('strong', review.nameAr), text('p', `${review.ownerRole}: ${review.requiredEvidence}`), text('small', 'بانتظار المراجعة'));
      return row;
    }));
    $('industry-json').textContent = JSON.stringify(plan, null, 2);
    $('industry-result').hidden = false;
    $('result-title').focus();
  }
  async function load() {
    if (loading) return;
    loading = true; $('industry-retry').disabled = true; $('industry-load-error').hidden = true;
    try {
      catalog = await request('/industry/catalog');
      token = (await request('/session')).token;
      selected = catalog.templates[0];
      options($('plan-type'), catalog.types); options($('plan-horizon'), catalog.horizons);
      $('industry-count').textContent = `${catalog.types.length} بنى تنظيمية · ${catalog.templates.length} قطاعًا`;
      $('industry-vision').textContent = catalog.vision;
      $('industry-metrics').replaceChildren(...catalog.metrics.map(metric => {
        const section = document.createElement('section');
        section.append(text('h3', metric.nameAr), text('p', metric.measure), text('span', 'غير مقاس')); return section;
      }));
      $('industry-links').replaceChildren(...catalog.integrations.map(item => {
        const link = text('a', item.nameAr); link.href = item.href; link.append(icon('arrow-left')); return link;
      }));
      syncForm(); $('industry-content').hidden = false;
    } catch {
      $('industry-count').textContent = 'السجل غير متاح';
      $('industry-load-error').hidden = false;
    } finally { loading = false; $('industry-retry').disabled = false; }
  }
  $('industry-search').addEventListener('input', renderSectors);
  $('plan-type').addEventListener('change', () => { invalidate(); syncForm(); });
  $('plan-template').addEventListener('change', () => chooseSector($('plan-template').value));
  $('industry-form').addEventListener('input', invalidate);
  $('industry-retry').addEventListener('click', load);
  $('industry-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || !$('industry-form').reportValidity()) return;
    invalidate(); submitting = true;
    const input = { name: $('plan-name').value, typeId: $('plan-type').value, templateId: $('plan-template').value,
      horizonId: $('plan-horizon').value, quantity: Number($('plan-quantity').value),
      planningDays: Number($('plan-days').value), communitySharePercent: Number($('plan-share').value) };
    const controls = [...$('industry-form').elements, ...$('industry-sectors').querySelectorAll('button')];
    controls.forEach(el => { el.disabled = true; });
    $('plan-status').classList.remove('error'); $('plan-status').textContent = 'جارٍ إعداد المسودة';
    try {
      // Refresh the preview token after a server restart; no persistent browser credentials.
      token = (await request('/session')).token;
      plan = await request('/industry/plan', input);
      renderPlan(); $('plan-status').textContent = 'أُعدت مسودة غير محفوظة على الخادم';
    } catch {
      plan = null; $('industry-result').hidden = true;
      $('plan-status').classList.add('error'); $('plan-status').textContent = 'تعذر إعداد المسودة. تحقق من المدخلات والاتصال المحلي.';
    } finally {
      submitting = false; controls.forEach(el => { el.disabled = false; });
      $('plan-horizon').disabled = selected.id === 'space';
    }
  });
  $('industry-export').addEventListener('click', () => {
    if (!plan) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `SHEIKHA_INDUSTRIAL_DRAFT_${plan.id}.json`;
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  load();
})();
