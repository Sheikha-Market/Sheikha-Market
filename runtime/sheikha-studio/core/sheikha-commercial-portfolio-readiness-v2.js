'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { PRODUCTS } = require('./sheikha-unified-ecosystem-v1');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const PRODUCTION_REPORT = path.join(ROOT, 'runtime/system/sheikha-production-readiness-report.json');
const LAUNCH_REPORT = path.join(ROOT, 'runtime/commercial-launch-validation/sheikha-commercial-launch-validation-v1-report.json');
const AUDIT_REPORT = path.join(ROOT, 'runtime/commercial-readiness/v2/dependency-audit-summary.json');

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function buildCommercialPortfolioReadiness({ production = readJson(PRODUCTION_REPORT), launch = readJson(LAUNCH_REPORT), audit = readJson(AUDIT_REPORT)?.counts } = {}) {
  const globalBlockers = [];
  if (production?.checks?.operationalReady !== true) globalBlockers.push('OPERATIONAL_READINESS_REQUIRED');
  if (production?.checks?.qualityReady !== true) globalBlockers.push('QUALITY_VERIFICATION_REQUIRED');
  if (production?.checks?.productionSecretsReady !== true) globalBlockers.push('PRODUCTION_SECRET_READINESS_REQUIRED');
  if (production?.git?.clean !== true) globalBlockers.push('CLEAN_VERSIONED_RELEASE_CANDIDATE_REQUIRED');
  if (launch?.readiness?.backupReady !== true) globalBlockers.push('BACKUP_EVIDENCE_REQUIRED');
  if (launch?.readiness?.rollbackReady !== true) globalBlockers.push('ROLLBACK_REHEARSAL_REQUIRED');
  if (launch?.readiness?.monitoringReady !== true) globalBlockers.push('OWNED_MONITORING_AND_ALERTS_REQUIRED');
  if (launch?.readiness?.revenueReady !== true) globalBlockers.push('PAYMENT_AND_BILLING_E2E_REQUIRED');
  if (launch?.checks?.find((check) => check.id === 'contract-approval')?.passed !== true) {
    globalBlockers.push('HUMAN_APPROVED_COMMERCIAL_CONTRACT_REQUIRED');
  }
  if (launch?.readiness?.customerLifecycleReady !== true) globalBlockers.push('CUSTOMER_LIFECYCLE_E2E_REQUIRED');
  if (launch?.readiness?.supportReady !== true) globalBlockers.push('SUPPORT_SLA_EVIDENCE_REQUIRED');
  if ((audit?.high || 0) > 0) globalBlockers.push('HIGH_SEVERITY_DEPENDENCY_FINDINGS_REQUIRED');
  if ((audit?.critical || 0) > 0) globalBlockers.push('CRITICAL_SEVERITY_DEPENDENCY_FINDINGS_REQUIRED');
  if (![audit?.high, audit?.critical].every((value) => Number.isInteger(value) && value >= 0)) {
    globalBlockers.push('CURRENT_DEPENDENCY_AUDIT_EVIDENCE_REQUIRED');
  }

  const products = PRODUCTS.map((product) => {
    const blockers = [...globalBlockers];
    if (!fs.existsSync(path.join(ROOT, product.evidence))) blockers.push('PRODUCT_EVIDENCE_FILE_REQUIRED');
    if (['FOUNDATION', 'MODEL', 'DEVELOPMENT', 'RESEARCH_AND_TRIAL'].includes(product.maturity)) {
      blockers.push('PRODUCT_SPECIFIC_COMMERCIAL_ACCEPTANCE_REQUIRED');
    }
    return {
      id: product.id,
      maturity: product.maturity,
      operationalState: product.state,
      commercialDecision: blockers.length ? 'COMMERCIAL_RELEASE_DENY' : 'COMMERCIAL_RELEASE_ALLOW',
      blockers: [...new Set(blockers)],
    };
  });
  const readyCount = products.filter((product) => product.commercialDecision === 'COMMERCIAL_RELEASE_ALLOW').length;
  const base = {
    system: 'SHEIKHA_COMMERCIAL_PORTFOLIO_READINESS_V2',
    status: readyCount === products.length ? 'ALL_PRODUCTS_COMMERCIAL_READY' : 'COMMERCIAL_CLOSURE_REQUIRED',
    productCount: products.length,
    readyCount,
    blockedCount: products.length - readyCount,
    globalBlockers: [...new Set(globalBlockers)],
    products,
    truthPolicy: 'NO_PRODUCT_IS_MARKED_COMMERCIAL_READY_WITHOUT_COMPLETE_EVIDENCE',
  };
  return { ...base, sha256: crypto.createHash('sha256').update(JSON.stringify(base)).digest('hex') };
}

module.exports = { buildCommercialPortfolioReadiness };
