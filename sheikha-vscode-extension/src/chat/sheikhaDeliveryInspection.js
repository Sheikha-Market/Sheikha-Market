'use strict';

const { canonicalRoot, inspectSource } = require('./sheikhaWorkspaceIntegration');
const REPORT = 'runtime/distribution/v2/sheikha-universal-delivery-v2-report.json';
const SYSTEM = 'SHEIKHA_UNIVERSAL_DELIVERY_DISTRIBUTION_INSTALLER_FABRIC_V2';
const ARTIFACT_PATH = /^distribution\/artifacts\/v2\/\d+(?:\.\d+){1,3}\/artifacts\/[A-Za-z0-9][A-Za-z0-9._-]{0,179}$/;

async function inspectDelivery(root) {
  const base = await canonicalRoot(root);
  const source = await inspectSource(base, REPORT, { json: true });
  const data = source.data;
  delete source.data;
  const result = { checkedAt: new Date().toISOString(), source, state: 'REPORT_UNVERIFIED',
    recordedAt: null, recorded: {}, artifacts: [], bytesRead: source.bytesRead,
    packagesExecuted: false, signaturesVerified: false, externalPublishing: false, productionReady: false };
  if (source.state !== 'SOURCE_PRESENT' || data?.system !== SYSTEM ||
      !Array.isArray(data.targets) || !Array.isArray(data.auxiliaryProducts)) return result;
  result.state = 'REPORT_READ';
  result.recordedAt = typeof data.generatedAt === 'string' ? data.generatedAt.slice(0,80) : null;
  for (const key of ['productCount','targetCount','builtCount','verifiedCount','nativeVerifiedCount',
    'signedCount','publishedExternallyCount','totalArtifactCount']) {
    result.recorded[key] = Number.isSafeInteger(data[key]) && data[key] >= 0 ? data[key] : null;
  }
  const entries = [...data.targets, ...data.auxiliaryProducts].filter(item => item?.artifact);
  if (entries.length > 32) { result.state = 'ARTIFACT_LIMIT_EXCEEDED'; return result; }
  const seen = new Set();
  let budget = 128 * 1024 * 1024;
  for (const item of entries) {
    const artifact = item.artifact;
    if (typeof artifact.path !== 'string' || !ARTIFACT_PATH.test(artifact.path) ||
        !/^[a-f0-9]{64}$/.test(artifact.sha256) || !Number.isSafeInteger(artifact.bytes) || artifact.bytes < 0) {
      result.artifacts.push({ state: 'ARTIFACT_METADATA_REJECTED' }); continue;
    }
    if (seen.has(artifact.path)) continue;
    seen.add(artifact.path);
    if (budget <= 0) { result.artifacts.push({ source: artifact.path, state: 'READ_BUDGET_EXCEEDED' }); continue; }
    const actual = await inspectSource(base, artifact.path, { limit: Math.min(64 * 1024 * 1024, budget) });
    budget -= actual.bytesRead;
    result.bytesRead += actual.bytesRead;
    result.artifacts.push({ ...actual, expectedSha256: artifact.sha256,
      matchesRecordedBytes: actual.state === 'SOURCE_PRESENT' && actual.sha256 === artifact.sha256 && actual.bytes === artifact.bytes });
  }
  return result;
}

function deliveryMarkdown(result) {
  return ['# تقرير Universal Delivery V2', '', 'وقت القراءة والتحقق المحلي: ' + result.checkedAt,
    'تاريخ التقرير المحفوظ: ' + (result.recordedAt || 'غير متحقق'),
    'هذا مسار حزم توزيع شيخة، وليس خدمة شحن. الأعداد المسجلة تاريخية وليست قياسًا جديدًا لجاهزية الإصدار.',
    '', 'حالة الدليل: ' + result.state,
    'الحزم التي طابقت الحجم والبصمة الآن: ' + result.artifacts.filter(a => a.matchesRecordedBytes).length +
      ' من ' + result.artifacts.length + ' سجل فحص. غياب الدليل لا يعني صفر أعطال.',
    'لم تُنفذ الحزم أو تُفحص التواقيع أو يُنفذ نشر أو تثبيت. تطابق البصمة لا يثبت سلامة الحزمة أو حقوقها أو جاهزيتها التجارية.',
    '', '```json', JSON.stringify(result, null, 2), '```'].join('\n');
}

module.exports = { REPORT, SYSTEM, inspectDelivery, deliveryMarkdown };
