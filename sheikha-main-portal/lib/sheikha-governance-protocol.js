/**
 * بسم الله الرحمن الرحيم
 * ══════════════════════════════════════════════════════════════════════
 * sheikha-governance-protocol.js
 * بروتوكول الحوكمة التشغيلية لمنظومة شيخة
 * ══════════════════════════════════════════════════════════════════════
 * الطبقات:
 *   1. الطبقة الإدارية  — تعريف الأدوار والصلاحيات
 *   2. طبقة البروتوكول — تسجيل كل قرار تشغيلي
 *   3. طبقة القياس     — إحصاء الأداء والموارد
 *   4. طبقة الإحصاء    — توليد تقارير يومية
 *   5. طبقة المنهج     — قواعد التشغيل الأخلاقية
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

// ── المسارات الأساسية ─────────────────────────────────────────────────
const ROOT       = path.resolve(__dirname, '..');
const DATA_DIR   = path.join(ROOT, 'data');
const REPORT_DIR = path.join(ROOT, 'reports', 'governance');
const LOG_FILE   = path.join(DATA_DIR, 'governance-log.json');
const MET_FILE   = path.join(DATA_DIR, 'governance-metrics.json');

// ── الطبقة الإدارية: تعريف الأدوار ───────────────────────────────────
const ROLES = {
  OWNER:    'owner',
  OPERATOR: 'operator',
  AUDITOR:  'auditor',
  SYSTEM:   'system',
};

const ADMIN_LAYER = {
  owner:    { name: 'Owner',    canActivate: true,  canAudit: true,  canReport: true  },
  operator: { name: 'Operator', canActivate: true,  canAudit: false, canReport: false },
  auditor:  { name: 'Auditor',  canActivate: false, canAudit: true,  canReport: true  },
  system:   { name: 'System',   canActivate: true,  canAudit: true,  canReport: true  },
};

// ── طبقة المنهج: قواعد التشغيل ───────────────────────────────────────
const PROTOCOL_RULES = [
  'لا ضرر ولا ضرار',
  'الصدق والأمانة في كل قرار',
  'التحقق قبل التشغيل',
  'التدرج لا الفوضى',
  'التوثيق قبل التوسع',
];

// ── تهيئة الملفات ─────────────────────────────────────────────────────
function _ensureFiles() {
  [DATA_DIR, REPORT_DIR].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, JSON.stringify({ log: [] }, null, 2));
  }
  if (!fs.existsSync(MET_FILE)) {
    fs.writeFileSync(MET_FILE, JSON.stringify({
      runs: 0, success: 0, failure: 0,
      modes: { stable: 0, power: 0, auto: 0 },
      lastRun: null,
    }, null, 2));
  }
}

// ── قراءة JSON بأمان ─────────────────────────────────────────────────
function _readJSON(filePath, fallback = {}) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

// ── كتابة JSON بأمان ─────────────────────────────────────────────────
function _writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ── طبقة البروتوكول: تسجيل قرار ─────────────────────────────────────
function logDecision(event) {
  _ensureFiles();
  const entry = {
    ts:         new Date().toISOString(),
    type:       event.type       || 'activation',
    mode:       event.mode       || 'unknown',
    result:     event.result     || 'unknown',
    role:       event.role       || ROLES.SYSTEM,
    durationMs: event.durationMs || 0,
    meta:       event.meta       || {},
  };

  const logData = _readJSON(LOG_FILE, { log: [] });
  logData.log.push(entry);
  // احتفظ بآخر 500 حدث فقط
  if (logData.log.length > 500) logData.log = logData.log.slice(-500);
  _writeJSON(LOG_FILE, logData);

  // تحديث الإحصاءات
  const met = _readJSON(MET_FILE, { runs: 0, success: 0, failure: 0, modes: {} });
  met.runs = (met.runs || 0) + 1;
  if (entry.result === 'success')       met.success = (met.success || 0) + 1;
  else if (entry.result === 'failure')  met.failure = (met.failure || 0) + 1;
  met.modes = met.modes || {};
  if (entry.mode) met.modes[entry.mode] = (met.modes[entry.mode] || 0) + 1;
  met.lastRun = { ts: entry.ts, mode: entry.mode, result: entry.result };
  _writeJSON(MET_FILE, met);

  return entry;
}

// ── طبقة القياس: جمع بيانات الموارد ──────────────────────────────────
function collectMetrics() {
  const cpus     = os.cpus();
  const totalMem = os.totalmem();
  const freeMem  = os.freemem();
  const uptime   = os.uptime();

  // متوسط استخدام CPU
  const cpuLoad = os.loadavg();

  return {
    ts:        new Date().toISOString(),
    cpu: {
      count:   cpus.length,
      model:   cpus[0]?.model || 'unknown',
      load1:   cpuLoad[0].toFixed(2),
      load5:   cpuLoad[1].toFixed(2),
      load15:  cpuLoad[2].toFixed(2),
    },
    memory: {
      totalMB: (totalMem / 1024 / 1024).toFixed(1),
      freeMB:  (freeMem  / 1024 / 1024).toFixed(1),
      usedPct: (((totalMem - freeMem) / totalMem) * 100).toFixed(1),
    },
    uptime:  `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
    node:    process.version,
    pid:     process.pid,
  };
}

// ── طبقة الإحصاء: قراءة الملخص ───────────────────────────────────────
function getMetricsSummary() {
  _ensureFiles();
  const met     = _readJSON(MET_FILE, { runs: 0, success: 0, failure: 0, modes: {} });
  const logData = _readJSON(LOG_FILE, { log: [] });
  const recent  = logData.log.slice(-20);

  return {
    totalRuns:    met.runs    || 0,
    successRuns:  met.success || 0,
    failureRuns:  met.failure || 0,
    successRate:  met.runs > 0
      ? `${((met.success / met.runs) * 100).toFixed(1)}%`
      : 'N/A',
    byMode:       met.modes   || {},
    lastRun:      met.lastRun || null,
    recentEvents: recent,
    system:       collectMetrics(),
  };
}

// ── طبقة الإحصاء: توليد تقرير ────────────────────────────────────────
function generateReport() {
  _ensureFiles();
  const summary = getMetricsSummary();
  const ts      = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outFile = path.join(REPORT_DIR, `governance-report-${ts}.json`);

  const report = {
    generatedAt:   new Date().toISOString(),
    protocolRules: PROTOCOL_RULES,
    summary,
  };

  _writeJSON(outFile, report);
  return { report, filePath: outFile };
}

// ── التحقق من الصحة ──────────────────────────────────────────────────
function getHealthStatus() {
  _ensureFiles();
  const logExists = fs.existsSync(LOG_FILE);
  const metExists = fs.existsSync(MET_FILE);
  return {
    status:      'ok',
    protocol:    'Sheikha Governance Protocol v1',
    dataFiles:   { log: logExists, metrics: metExists },
    rules:       PROTOCOL_RULES.length,
    roles:       Object.keys(ADMIN_LAYER).length,
    ts:          new Date().toISOString(),
  };
}

// ── فحص صلاحية الدور ─────────────────────────────────────────────────
function checkPermission(role, action) {
  const r = ADMIN_LAYER[role] || ADMIN_LAYER[ROLES.SYSTEM];
  const allowed = {
    activate: r.canActivate,
    audit:    r.canAudit,
    report:   r.canReport,
  };
  return { allowed: allowed[action] !== false, role: r.name, action };
}

module.exports = {
  ROLES,
  ADMIN_LAYER,
  PROTOCOL_RULES,
  logDecision,
  collectMetrics,
  getMetricsSummary,
  generateReport,
  getHealthStatus,
  checkPermission,
};
