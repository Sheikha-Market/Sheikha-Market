'use strict';

const https = require('node:https');
const { sha } = require('./opportunityWatch');

// Mirrors the existing observation service's approved release-source registry.
const SOURCES = Object.freeze([
  ...['pytorch/pytorch', 'huggingface/transformers', 'huggingface/diffusers', 'ggml-org/llama.cpp',
    'vllm-project/vllm', 'modelcontextprotocol/modelcontextprotocol'].map(repo => Object.freeze({
    id: repo, kind: 'GITHUB', url: 'https://api.github.com/repos/' + repo + '/releases?per_page=3' })),
  ...['Qwen/Qwen-Image-2.1', 'Hcompany/NeoMME-260M-Retriever'].map(model => Object.freeze({
    id: model, kind: 'MODEL', url: 'https://huggingface.co/api/models/' + model })),
  Object.freeze({ id: 'NCA/SAUDI-CERT', kind: 'NCA', url: 'https://backend.nca.gov.sa/api/public/alert?size=12&page=0&sort=warningNumber,desc' }),
  Object.freeze({ id: 'GitHub/Service-Status', kind: 'STATUS', url: 'https://www.githubstatus.com/api/v2/summary.json' })
]);
const MAX_BYTES = 1024 * 1024;
function fetchPublicJson(source, { signal } = {}) {
  if (!SOURCES.some(item => item.id === source.id && item.url === source.url)) return Promise.reject(Error('SOURCE_DENIED'));
  return new Promise((resolve, reject) => {
    let settled = false, timer, req;
    const finish = (code, value) => {
      if (settled) return; settled = true; clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      if (code) { req?.destroy(); reject(Error(code)); } else resolve(value);
    };
    const abort = () => finish('CANCELLED');
    if (signal?.aborted) return finish('CANCELLED');
    req = https.get(source.url, { agent: false, headers: { Accept: 'application/json',
      'User-Agent': 'Sheikha-Opportunity-Watch/1.0' } }, response => {
      if (response.statusCode !== 200) { response.resume(); finish([403, 429].includes(response.statusCode) ? 'RATE_LIMITED' : 'HTTP_REJECTED'); return; }
      if (!/^application\/json(?:;|$)/i.test(response.headers['content-type'] || '')) { finish('CONTENT_TYPE_DENIED'); return; }
      const declared = response.headers['content-length'];
      if (declared && (!/^\d+$/.test(declared) || Number(declared) > MAX_BYTES)) { finish('RESPONSE_LIMIT'); return; }
      let length = 0; const chunks = [];
      response.on('data', chunk => { length += chunk.length; if (length > MAX_BYTES) finish('RESPONSE_LIMIT'); else chunks.push(chunk); });
      response.on('aborted', () => finish('RESPONSE_ABORTED'));
      response.on('error', () => finish('RESPONSE_FAILED'));
      response.on('end', () => {
        if (settled) return;
        try { finish(null, JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { finish('INVALID_JSON'); }
      });
    });
    timer = setTimeout(() => finish('SOURCE_TIMEOUT'), 10000);
    signal?.addEventListener('abort', abort, { once: true });
    req.on('error', () => finish('SOURCE_UNAVAILABLE'));
  });
}
function recordsFor(source, data) {
  if (source.kind === 'NCA') {
    if (!Array.isArray(data?.content) || !data.content.length || data.content.length > 12) throw Error('ADVISORY_LIST_INVALID');
    return data.content.map(alert => {
      if (!Number.isSafeInteger(alert.id) || alert.id <= 0 || !/^\d{4}-\d{4,8}$/.test(alert.warningNumber) ||
          typeof alert.warningDate !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(alert.warningDate) ||
          !['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'MULTI'].includes(alert.severityLevel) || typeof alert.vendor?.nameEn !== 'string') throw Error('ADVISORY_INVALID');
      const advisory = { authority: 'NCA / Saudi CERT', number: alert.warningNumber, severity: alert.severityLevel,
        vendor: alert.vendor.nameEn, publishedDate: alert.warningDate.slice(0, 10) };
      return { title: alert.titleAr + ' · ' + alert.warningNumber, category: 'SECURITY', kind: 'SECURITY_ADVISORY', advisory,
        sourceUrl: 'https://nca.gov.sa/ar/cert/' + alert.id + '/', publishedAt: null,
        evidenceDigest: sha(JSON.stringify({ advisory, title: alert.titleAr, body: alert.bodyAr, measures: alert.preventiveMeasuresAr, threats: alert.threatsAr })),
        summary: 'تنبيه صادر عن NCA. يلزم التحقق من المنتج والإصدار والأصل المتأثر عبر المرجع؛ اسم المورد وحده لا يثبت الانطباق. لم تُنفّذ تحديثات أو تعديلات.' };
    });
  }
  if (source.kind === 'STATUS') {
    if (data?.page?.url !== 'https://www.githubstatus.com' || !['none', 'minor', 'major', 'critical'].includes(data.status?.indicator) ||
        !Array.isArray(data.incidents) || data.incidents.length > 100 || !Array.isArray(data.components) || data.components.length > 100) throw Error('SERVICE_STATUS_INVALID');
    const statuses = ['investigating', 'identified', 'monitoring', 'resolved', 'postmortem'];
    const incidents = data.incidents.map(i => {
      if (typeof i.name !== 'string' || i.name.length > 240 || !statuses.includes(i.status)) throw Error('INCIDENT_INVALID');
      return { name: i.name, status: i.status };
    });
    const components = data.components.map(c => ({ name: String(c.name).slice(0, 160), status: String(c.status).slice(0, 80) }));
    return [{ title: 'حالة خدمات GitHub', category: 'INFRASTRUCTURE', kind: 'SERVICE_STATUS',
      sourceUrl: 'https://www.githubstatus.com/', publishedAt: null,
      evidenceDigest: sha(JSON.stringify({ indicator: data.status.indicator, incidents, components })),
      summary: 'مؤشر المصدر: ' + data.status.indicator + '. الحوادث المعروضة: ' + incidents.length + '. ' +
        incidents.slice(0, 6).map(i => i.name + ' (' + i.status + ')').join('؛ ') +
        '. هذا تقرير المزود، لا فحص لاتصال شيخة أو إثبات أثر على عميل. يلزم مراجعة التفاصيل لدى المصدر.' }];
  }
  if (source.kind === 'GITHUB') {
    if (!Array.isArray(data) || data.length > 3) throw Error('RELEASE_LIST_INVALID');
    return data.map(release => {
      if (release.draft !== false || typeof release.prerelease !== 'boolean' || !Number.isSafeInteger(release.id) ||
          typeof release.tag_name !== 'string' || release.tag_name.length > 200 || !release.tag_name.trim() ||
          (release.body != null && typeof release.body !== 'string')) throw Error('RELEASE_INVALID');
      const url = new URL(release.html_url);
      if (url.origin !== 'https://github.com' || url.search || url.hash || url.username || url.password ||
          url.pathname !== '/' + source.id + '/releases/tag/' + encodeURIComponent(release.tag_name)) throw Error('RELEASE_BINDING_FAILED');
      const published = new Date(release.published_at);
      if (!release.published_at || !Number.isFinite(published.getTime())) throw Error('PUBLICATION_REQUIRED');
      return { title: source.id + ' · ' + release.tag_name, sourceUrl: url.href, category: 'TECHNOLOGY',
        publishedAt: published.toISOString(), releaseClass: release.prerelease ? 'PREVIEW' : 'STABLE',
        evidenceDigest: sha(JSON.stringify({ id: release.id, tag: release.tag_name, body: release.body || '' })),
        summary: 'رصد بيانات إصدار رسمية. يلزم فحص التغييرات والترخيص والتوافق؛ لم يُقَس أثره على شيخة ولم تُنفّذ ترقية.' };
    });
  }
  if (!data || data.id !== source.id || typeof data.sha !== 'string' || !/^[a-f0-9]{40,64}$/.test(data.sha)) throw Error('MODEL_BINDING_FAILED');
  const license = data.cardData?.license;
  return [{ title: source.id, sourceUrl: 'https://huggingface.co/' + source.id, category: 'SCIENTIFIC', publishedAt: null,
    releaseClass: 'MODEL', license: typeof license === 'string' ? license.slice(0, 120) : 'UNKNOWN',
    evidenceDigest: sha(JSON.stringify({ revision: data.sha, license: license || null })), upstreamRevision: data.sha,
    summary: 'رصد بطاقة نموذج ومراجعة مستودعه، وليس تنزيلًا للأوزان. تاريخ النشر غير مثبت من هذه الواجهة. مراجعة الترخيص وتثبيت revision واختبار محلي مطلوبة قبل الاستعمال.' }];
}
async function collect({ fetcher = fetchPublicJson, signal } = {}) {
  const records = [], failures = [];
  for (const source of SOURCES) {
    if (signal?.aborted) throw Error('CANCELLED');
    try { records.push(...recordsFor(source, await fetcher(source, { signal }))); }
    catch (error) {
      if (signal?.aborted) throw Error('CANCELLED', { cause: error });
      const safe = new Set(['RATE_LIMITED', 'SOURCE_TIMEOUT', 'HTTP_REJECTED', 'RESPONSE_LIMIT', 'MODEL_BINDING_FAILED', 'RELEASE_BINDING_FAILED']);
      failures.push({ source: source.id, code: safe.has(error.message) ? error.message : 'SOURCE_REVIEW_REQUIRED' });
    }
  }
  return { records, failures, sourceCount: SOURCES.length, network: 'FIXED_PUBLIC_METADATA_GET_ONLY', privateDataSent: false };
}
module.exports = { SOURCES, MAX_BYTES, fetchPublicJson, recordsFor, collect };
