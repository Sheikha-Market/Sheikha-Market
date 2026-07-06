#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const REPORT_DIR = path.join(ROOT, 'reports', 'governance');
const args = process.argv.slice(2);
const flags = new Set(args);

const JSON_ONLY = flags.has('--json');
const STRICT_GIT = flags.has('--strict-git');
const BASE = process.env.SHEIKHA_API || 'http://127.0.0.1:8080';

const EXPECTED_PORTS = [
  { port: 8080, role: 'MAIN_SYSTEMD', required: true },
  { port: 8082, role: 'PROXY_GATEWAY', required: true },
  { port: 8082, role: 'API_PM2_COMPANION', required: false }
];

const WATCH_PORTS = [8080, 8082];

const CRITICAL_FILES = [
  'server.js',
  'package.json',
  'scripts/sheikha-cli.js',
  'scripts/sheikha-self-governance.js',
  'lib/sheikha-root-control-plane.js',
  'routes/root-control-plane.routes.js'
];

function stamp(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function run(command, commandArgs = [], options = {}) {
  const startedAt = Date.now();
  try {
    const result = spawnSync(command, commandArgs, {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: options.timeout || 8000,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    return {
      command: [command, ...commandArgs].join(' '),
      ok: result.status === 0,
      status: result.status,
      signal: result.signal || null,
      stdout: (result.stdout || '').trim(),
      stderr: (result.stderr || '').trim(),
      durationMs: Date.now() - startedAt
    };
  } catch (err) {
    return {
      command: [command, ...commandArgs].join(' '),
      ok: false,
      status: null,
      signal: null,
      stdout: '',
      stderr: err.message,
      durationMs: Date.now() - startedAt
    };
  }
}

function requestJson(route, timeoutMs = 4000) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const url = new URL(route, BASE);
    const req = http.request(url, { method: 'GET', timeout: timeoutMs }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
        if (body.length > 1024 * 1024) req.destroy(new Error('response too large'));
      });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (_) {
          json = null;
        }

        const successField = json && Object.prototype.hasOwnProperty.call(json, 'success')
          ? json.success !== false
          : true;

        resolve({
          route,
          url: url.toString(),
          ok: res.statusCode >= 200 && res.statusCode < 400 && successField,
          statusCode: res.statusCode,
          durationMs: Date.now() - startedAt,
          json,
          bodyPreview: json ? undefined : body.slice(0, 240)
        });
      });
    });

    req.on('timeout', () => req.destroy(new Error(`timeout after ${timeoutMs}ms`)));
    req.on('error', (err) => {
      resolve({
        route,
        url: url.toString(),
        ok: false,
        statusCode: null,
        durationMs: Date.now() - startedAt,
        error: err.message
      });
    });
    req.end();
  });
}

function makePolicy(id, label, status, severity, summary, details = {}, recommendation = null) {
  return {
    id,
    label,
    status,
    severity,
    summary,
    recommendation,
    details
  };
}

function parseListeningPorts(ssOutput) {
  const ports = {};
  for (const port of WATCH_PORTS) ports[port] = [];

  for (const line of ssOutput.split(/\r?\n/)) {
    for (const port of WATCH_PORTS) {
      if (new RegExp(`:${port}\\b`).test(line)) {
        ports[port].push(line.trim());
      }
    }
  }

  return ports;
}

function parseProcesses(psOutput) {
  return psOutput
    .split(/\r?\n/)
    .map((line) => {
      const match = line.trim().match(/^(\d+)\s+(\d+)\s+(.+)$/);
      if (!match) return null;
      return { pid: Number(match[1]), ppid: Number(match[2]), command: match[3] };
    })
    .filter(Boolean);
}

function parsePm2List(pm2Output) {
  try {
    const rows = JSON.parse(pm2Output);
    return rows.map((item) => ({
      name: item.name,
      pid: item.pid,
      status: item.pm2_env && item.pm2_env.status,
      restartTime: item.pm2_env && item.pm2_env.restart_time,
      unstableRestarts: item.pm2_env && item.pm2_env.unstable_restarts,
      envPort: item.pm2_env && (item.pm2_env.PORT || item.pm2_env.port || null)
    }));
  } catch (_) {
    return [];
  }
}

function gitPathFromStatusLine(line) {
  return line.slice(3).replace(/^"|"$/g, '').split(' -> ').pop();
}

async function healthPolicy() {
  const endpoints = [
    { id: 'core-health', route: '/api/health' },
    { id: 'root-control-plane', route: '/api/root-control-plane/health' },
    { id: 'runtime-root', route: '/api/runtime-root/health' },
    { id: 'decision-flow', route: '/api/decision-flow/health' }
  ];

  const checks = await Promise.all(endpoints.map((endpoint) => requestJson(endpoint.route)));
  const failed = checks.filter((check) => !check.ok);

  if (failed.length > 0) {
    return makePolicy(
      'health',
      'Health Policy',
      'fail',
      'critical',
      `فشل ${failed.length} من ${checks.length} فحوصات صحة أساسية`,
      { base: BASE, checks },
      'ابدأ بـ sheikha smoke ثم افحص Root Control Plane وDecision Flow قبل أي تفعيل جديد.'
    );
  }

  return makePolicy(
    'health',
    'Health Policy',
    'pass',
    'critical',
    'كل نقاط الصحة الأساسية تعمل',
    { base: BASE, checks }
  );
}

async function portPolicy() {
  const ss = run('ss', ['-ltnp']);
  const ps = run('ps', ['-eo', 'pid,ppid,args']);
  const declared = await requestJson('/api/root-control-plane/ports');

  const listening = ss.ok ? parseListeningPorts(ss.stdout) : {};
  const processes = ps.ok ? parseProcesses(ps.stdout) : [];
  const manualServerCli = processes.filter((process) => /server\.js\s+cli\b/.test(process.command));

  const missingRequired = EXPECTED_PORTS
    .filter((item) => item.required && (!listening[item.port] || listening[item.port].length === 0))
    .map((item) => item.port);

  const missingCompanion = EXPECTED_PORTS
    .filter((item) => !item.required && (!listening[item.port] || listening[item.port].length === 0))
    .map((item) => item.port);

  const unexpectedPorts = [8083, 8084, 8085].filter((port) => listening[port] && listening[port].length > 0);
  const details = {
    expected: EXPECTED_PORTS,
    listening,
    declaredByControlPlane: declared.ok ? declared.json : { error: declared.error || declared.statusCode },
    manualServerCli
  };

  if (manualServerCli.length > 0) {
    return makePolicy(
      'ports',
      'Port Policy',
      'fail',
      'high',
      'تم اكتشاف تشغيل خاطئ: server.js cli يعمل كنسخة سيرفر إضافية',
      details,
      'نفّذ sheikha stop-extra ثم sheikha ports.'
    );
  }

  if (missingRequired.length > 0) {
    return makePolicy(
      'ports',
      'Port Policy',
      'fail',
      'high',
      `منافذ أساسية غير مستمعة: ${missingRequired.join(', ')}`,
      details,
      'أعد تشغيل sheikha-main.service أو PM2 حسب المنفذ المفقود.'
    );
  }

  if (!ss.ok) {
    return makePolicy(
      'ports',
      'Port Policy',
      'warn',
      'medium',
      'تعذر قراءة جدول المنافذ عبر ss',
      details,
      'ثبّت ss/iproute2 أو شغّل الفحص من بيئة تملك صلاحية قراءة المنافذ.'
    );
  }

  if (unexpectedPorts.length > 0 || missingCompanion.length > 0) {
    return makePolicy(
      'ports',
      'Port Policy',
      'warn',
      'medium',
      [
        unexpectedPorts.length ? `منافذ انتقالية مستمعة: ${unexpectedPorts.join(', ')}` : null,
        missingCompanion.length ? `رفيق PM2 غير ظاهر على: ${missingCompanion.join(', ')}` : null
      ].filter(Boolean).join(' | '),
      details,
      'ثبّت قاعدة 8080/8082 فقط ثم أعد sheikha ports.'
    );
  }

  return makePolicy(
    'ports',
    'Port Policy',
    'pass',
    'high',
    'Port Unity ثابت: 8080 رئيسي، 8082 بوابة Proxy/PM2',
    details
  );
}

function runtimePolicy() {
  const syntax = run('node', ['--check', 'server.js'], { timeout: 15000 });
  const systemdRequired = false;
  const systemd = systemdRequired
    ? run('systemctl', ['is-active', 'sheikha-main.service'])
    : {
        ok: true,
        stdout: 'optional',
        stderr: '',
        status: 0,
        command: 'systemctl is-active sheikha-main.service',
        durationMs: 0
      };
  const pm2 = run('pm2', ['jlist']);
  const nodeVersion = run('node', ['--version']);
  const pm2List = pm2.ok ? parsePm2List(pm2.stdout) : [];
  const sheikhaApi = pm2List.find((item) => item.name === 'sheikha-main-portal');

  const details = {
    syntax: {
      ok: syntax.ok,
      stderr: syntax.stderr,
      stdout: syntax.stdout
    },
    systemd: {
      required: systemdRequired,
      ok: systemd.ok,
      status: systemd.stdout || systemd.stderr
    },
    pm2: {
      ok: pm2.ok,
      processes: pm2List,
      sheikhaApi: sheikhaApi || null
    },
    node: nodeVersion.stdout || nodeVersion.stderr
  };

  if (!syntax.ok) {
    return makePolicy(
      'runtime',
      'Runtime Policy',
      'fail',
      'critical',
      'server.js غير نظيف نحويًا',
      details,
      'لا تكمل أي تفعيل قبل نجاح node --check server.js.'
    );
  }

  const systemdActive = !systemdRequired || systemd.stdout === 'active';
  const pm2Online = sheikhaApi && sheikhaApi.status === 'online';

  if (!systemdActive || !pm2Online) {
    return makePolicy(
      'runtime',
      'Runtime Policy',
      'warn',
      'medium',
      [
        systemdActive ? null : 'sheikha-main.service ليس active',
        pm2Online ? null : 'PM2 sheikha-main-portal ليس online'
      ].filter(Boolean).join(' | '),
      details,
      'ثبّت PM2 ثم أعد smoke. systemd اختياري في هذه البيئة.'
    );
  }

  return makePolicy(
    'runtime',
    'Runtime Policy',
    'pass',
    'critical',
    'Runtime نظيف: syntax صحيح وPM2 يعمل، وsystemd اختياري',
    details
  );
}

function gitCleanlinessPolicy() {
  const git = run('git', ['status', '--short']);

  if (!git.ok) {
    return makePolicy(
      'git-cleanliness',
      'Git Cleanliness Policy',
      'warn',
      'medium',
      'تعذر قراءة حالة Git',
      { error: git.stderr || git.stdout },
      'افحص git status --short يدويًا.'
    );
  }

  const dirty = git.stdout ? git.stdout.split(/\r?\n/).filter(Boolean) : [];
  const criticalDirty = dirty.filter((line) => {
    const file = gitPathFromStatusLine(line);
    return CRITICAL_FILES.some((critical) => file === critical || file.startsWith(`${critical}/`));
  });

  const details = {
    dirtyCount: dirty.length,
    criticalDirtyCount: criticalDirty.length,
    criticalFiles: CRITICAL_FILES,
    dirtySample: dirty.slice(0, 60),
    criticalDirty
  };

  if (dirty.length === 0) {
    return makePolicy(
      'git-cleanliness',
      'Git Cleanliness Policy',
      'pass',
      'medium',
      'Git clean: لا توجد تغييرات غير مثبتة',
      details
    );
  }

  if (STRICT_GIT && criticalDirty.length > 0) {
    return makePolicy(
      'git-cleanliness',
      'Git Cleanliness Policy',
      'fail',
      'medium',
      `ملفات حاكمة غير مثبتة: ${criticalDirty.length}`,
      details,
      'ثبّت ملفات الحوكمة الحرجة أو شغّل بدون --strict-git أثناء التطوير.'
    );
  }

  return makePolicy(
    'git-cleanliness',
    'Git Cleanliness Policy',
    'warn',
    'medium',
    criticalDirty.length > 0
      ? `يوجد ${criticalDirty.length} ملف حاكم غير مثبت ضمن ${dirty.length} تغيير`
      : `يوجد ${dirty.length} تغيير غير مثبت خارج الملفات الحاكمة`,
    details,
    'لا تمنع هذه السياسة التشغيل المحلي، لكنها تمنع إعلان الإنتاج النهائي قبل التثبيت.'
  );
}

function productionReadinessPolicy(policies) {
  const policyById = Object.fromEntries(policies.map((policy) => [policy.id, policy]));
  const localReady = ['health', 'ports', 'runtime'].every((id) => policyById[id] && policyById[id].status !== 'fail');
  const dnsSslReady = process.env.SHEIKHA_DNS_SSL_READY === 'true';
  const nodeEnv = process.env.NODE_ENV || 'development';
  const publicUrl = process.env.SHEIKHA_PUBLIC_URL || 'https://sheikha.top';

  const details = {
    localReady,
    dnsSslReady,
    nodeEnv,
    publicUrl,
    gates: {
      health: policyById.health && policyById.health.status,
      ports: policyById.ports && policyById.ports.status,
      runtime: policyById.runtime && policyById.runtime.status,
      gitCleanliness: policyById['git-cleanliness'] && policyById['git-cleanliness'].status
    }
  };

  if (!localReady) {
    return makePolicy(
      'production-readiness',
      'Production Readiness Policy',
      'fail',
      'high',
      'الجاهزية العامة محجوبة لأن قاعدة التشغيل المحلية لم تكتمل',
      details,
      'أصلح السياسات الفاشلة أولًا ثم أعد self-govern.'
    );
  }

  return makePolicy(
    'production-readiness',
    'Production Readiness Policy',
    'pass',
    'high',
    dnsSslReady
      ? 'جاهزية الإنتاج مكتملة حسب البوابات المحلية وDNS/SSL'
      : 'جاهزية التشغيل المحلي مكتملة؛ DNS/SSL بوابة نشر عام منفصلة',
    {
      ...details,
      publicExposureReady: dnsSslReady,
      publicExposureNote: dnsSslReady
        ? 'DNS/SSL مفعلة حسب SHEIKHA_DNS_SSL_READY=true'
        : 'لا يتم إعلان جاهزية الوصول العام حتى ضبط SHEIKHA_DNS_SSL_READY=true'
    }
  );
}

function verdictFor(policies) {
  const failed = policies.filter((policy) => policy.status === 'fail');
  const blocking = failed.filter((policy) => ['critical', 'high'].includes(policy.severity));
  const warnings = policies.filter((policy) => policy.status === 'warn');
  const pending = policies.filter((policy) => policy.status === 'pending');

  if (blocking.length > 0) {
    return {
      success: false,
      status: 'BLOCKED',
      code: 'SELF_GOVERNANCE_BLOCKED',
      message: 'يوجد مانع تشغيلي يجب إصلاحه قبل التفعيل التالي'
    };
  }

  if (failed.length > 0 || warnings.length > 0 || pending.length > 0) {
    return {
      success: true,
      status: 'READY_WITH_WARNINGS',
      code: 'SELF_GOVERNANCE_READY_WITH_WARNINGS',
      message: 'النواة تعمل، مع ملاحظات يجب إغلاقها قبل الإنتاج العام'
    };
  }

  return {
    success: true,
    status: 'READY',
    code: 'SELF_GOVERNANCE_READY',
    message: 'المنظومة نظيفة ومحوكمة وجاهزة'
  };
}

function toMarkdown(report) {
  const rows = report.policies
    .map((policy) => `| ${policy.id} | ${policy.status} | ${policy.severity} | ${policy.summary.replace(/\|/g, '/')} |`)
    .join('\n');

  return [
    '# Sheikha Self-Governance Report',
    '',
    `- Timestamp: ${report.timestamp}`,
    `- Verdict: ${report.verdict.status}`,
    `- Code: ${report.verdict.code}`,
    `- Message: ${report.verdict.message}`,
    '',
    '| Policy | Status | Severity | Summary |',
    '| --- | --- | --- | --- |',
    rows,
    '',
    '## Report Files',
    '',
    `- JSON: ${report.reportFiles.json}`,
    `- Latest JSON: ${report.reportFiles.latestJson}`,
    `- Markdown: ${report.reportFiles.markdown}`,
    `- Latest Markdown: ${report.reportFiles.latestMarkdown}`,
    ''
  ].join('\n');
}

function writeReports(report) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  fs.writeFileSync(report.reportFiles.jsonAbs, JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(report.reportFiles.latestJsonAbs, JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(report.reportFiles.markdownAbs, toMarkdown(report));
  fs.writeFileSync(report.reportFiles.latestMarkdownAbs, toMarkdown(report));
}

function printableReport(report) {
  const statusIcon = {
    pass: '✅',
    warn: '⚠️',
    fail: '❌',
    pending: '⏳'
  };

  const lines = [
    'Sheikha Self-Governance Controller',
    `Verdict: ${report.verdict.status} — ${report.verdict.message}`,
    ''
  ];

  for (const policy of report.policies) {
    lines.push(`${statusIcon[policy.status] || '•'} ${policy.label}: ${policy.summary}`);
  }

  lines.push('');
  lines.push(`Report: ${report.reportFiles.json}`);
  lines.push(`Latest: ${report.reportFiles.latestJson}`);
  return lines.join('\n');
}

async function main() {
  const now = new Date();
  const reportStamp = stamp(now);
  const reportFiles = {
    json: `reports/governance/self-governance-${reportStamp}.json`,
    latestJson: 'reports/governance/self-governance-latest.json',
    markdown: `reports/governance/self-governance-${reportStamp}.md`,
    latestMarkdown: 'reports/governance/self-governance-latest.md'
  };

  reportFiles.jsonAbs = path.join(ROOT, reportFiles.json);
  reportFiles.latestJsonAbs = path.join(ROOT, reportFiles.latestJson);
  reportFiles.markdownAbs = path.join(ROOT, reportFiles.markdown);
  reportFiles.latestMarkdownAbs = path.join(ROOT, reportFiles.latestMarkdown);

  const policies = [
    await healthPolicy(),
    await portPolicy(),
    runtimePolicy(),
    gitCleanlinessPolicy()
  ];

  policies.push(productionReadinessPolicy(policies));

  const reportPolicy = makePolicy(
    'auto-report',
    'Auto Report Policy',
    'pass',
    'low',
    'تم توليد تقرير الحوكمة الذاتي',
    { files: reportFiles }
  );
  policies.push(reportPolicy);

  const report = {
    success: true,
    service: 'Sheikha Self-Governance Controller',
    version: '2.0.0',
    timestamp: now.toISOString(),
    base: BASE,
    strictGit: STRICT_GIT,
    policies,
    verdict: verdictFor(policies),
    reportFiles
  };
  report.success = report.verdict.success;

  try {
    writeReports(report);
  } catch (err) {
    report.success = false;
    report.verdict = {
      success: false,
      status: 'BLOCKED',
      code: 'SELF_GOVERNANCE_REPORT_WRITE_FAILED',
      message: `فشل توليد التقرير: ${err.message}`
    };
  }

  if (JSON_ONLY) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(printableReport(report));
  }

  process.exit(report.verdict.status === 'BLOCKED' ? 1 : 0);
}

main().catch((err) => {
  console.error('SHEIKHA_SELF_GOVERNANCE_ERROR:', err.message);
  process.exit(1);
});
