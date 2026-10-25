(() => {
  'use strict';
  const byId = (id) => document.getElementById(id);
  const numbers = new Intl.NumberFormat('en-US');
  const dateLabel = (value) => new Intl.DateTimeFormat('ar-SA', {
    dateStyle: 'medium', timeStyle: 'short', calendar: 'gregory'
  }).format(new Date(value));
  let checking = false;

  async function getJson(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, {
        signal: controller.signal, cache: 'no-store', credentials: 'same-origin',
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  function healthState(label, state) {
    byId('header-health').textContent = label;
    byId('health-status').textContent = label;
    byId('health-dot').dataset.state = state;
  }

  async function checkHealth() {
    if (checking) return;
    checking = true;
    byId('refresh-status').disabled = true;
    healthState('جارٍ فحص الخدمة', 'loading');
    try {
      if (navigator.onLine === false) throw new Error('offline');
      const result = await getJson('/api/health');
      if (navigator.onLine === false) throw new Error('offline');
      const reported = String(result.status || result.data?.status || '').toLowerCase();
      const failed = result.ok === false || result.success === false ||
        ['error', 'failed', 'unhealthy', 'degraded', 'down'].includes(reported);
      const confirmed = result.ok === true ||
        (result.success === true && ['ok', 'healthy'].includes(reported));
      healthState(failed ? 'استجابة مع تنبيه' : confirmed ? 'الخدمة تستجيب' : 'استجابة غير مؤكدة',
        !failed && confirmed ? 'ok' : 'error');
      byId('health-checked').textContent = `آخر فحص: ${dateLabel(Date.now())}`;
    } catch (error) {
      const label = navigator.onLine === false ? 'الجهاز غير متصل' :
        error.name === 'AbortError' ? 'انتهت مهلة الفحص' : 'تعذر التحقق من الخدمة';
      healthState(label, 'error');
      byId('health-checked').textContent = `آخر محاولة: ${dateLabel(Date.now())}`;
    } finally {
      checking = false;
      byId('refresh-status').disabled = false;
    }
  }

  async function loadRegistry() {
    byId('snapshot-status').textContent = 'جارٍ تحميل اللقطة';
    try {
      const data = await getJson('/site-map/registry-summary.json');
      if (!Number.isSafeInteger(data.metadataRecords) || data.metadataRecords < 0 ||
          !Number.isFinite(data.recordedRewardUnits) || data.recordedRewardUnits < 0 ||
          data.unit !== 'SHK' || data.scope !== 'metadata_only' ||
          !/^[a-f0-9]{64}$/i.test(data.registrySha256 || '') ||
          !data.observedAt || !Number.isFinite(Date.parse(data.observedAt))) {
        throw new Error('Invalid registry snapshot');
      }
      byId('metadata-records').textContent = numbers.format(data.metadataRecords);
      byId('reward-units').textContent = numbers.format(data.recordedRewardUnits);
      byId('snapshot-time').textContent = dateLabel(data.observedAt);
      byId('snapshot-time').dateTime = data.observedAt;
      byId('snapshot-status').textContent = 'لقطة منشورة • بيانات وصفية فقط';
      byId('registry-evidence').replaceChildren();
      const source = document.createElement('a');
      source.href = '/site-map/registry-summary.json';
      source.textContent = 'مصدر اللقطة';
      byId('registry-evidence').append(source, ` • SHA-256: ${data.registrySha256}`);
    } catch {
      byId('metadata-records').textContent = '—';
      byId('reward-units').textContent = '—';
      byId('snapshot-time').textContent = 'غير متاحة';
      byId('snapshot-time').removeAttribute('datetime');
      byId('snapshot-status').textContent = 'تعذر التحقق من لقطة السجل';
      byId('registry-evidence').textContent = 'لم تُعرض أرقام دون لقطة صالحة؛ يمكن إعادة المحاولة بزر تحديث الحالة.';
    }
  }

  byId('refresh-status').addEventListener('click', () => {
    checkHealth();
    loadRegistry();
  });
  window.addEventListener('online', checkHealth);
  window.addEventListener('offline', () => healthState('الجهاز غير متصل', 'error'));
  checkHealth();
  loadRegistry();
  setInterval(checkHealth, 60000);
})();
