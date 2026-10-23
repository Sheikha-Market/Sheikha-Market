#!/usr/bin/env node
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { inspectRun } = require('../inspect-sheikha-foundation-scratch-v1');
const { privatePath, readPrivate } = require('../../partnerships/evaluate-shared-goals-v1');
const benchmarks = require('./benchmarks');
const ASSETS = new Map([['/', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/icons.js', ['icons.js', 'text/javascript; charset=utf-8']]]);

function sanitizedModel(report, evidence) {
  return { id: report.modelId, profile: report.profile, parameters: report.parameters,
    layers: report.provenance.modelConfig.n_layer, width: report.provenance.modelConfig.n_embd,
    heads: report.provenance.modelConfig.n_head, context: 96, vocabulary: 258,
    device: report.device, threads: report.threads, steps: report.stepsCompleted,
    tokens: report.trainingTargetTokensSeen, seconds: report.totalRunSeconds,
    lossBefore: report.validationBefore.crossEntropyPerByteToken,
    lossAfter: report.validationAfter.crossEntropyPerByteToken,
    exact: report.testExactAnswers.correct, total: report.testExactAnswers.total,
    reloadVerified: evidence.freshCpuInferenceVerified,
    weightsDigest: report.weightsSha256, release: 'RELEASE_DENY',
    initialization: 'RANDOM', externalWeights: false };
}

function buildData(root) {
  const models = ['micro', 'mini', 'seed'].map((profile) => {
    const file = path.join(root, `${profile}-v1`, 'run-report.json');
    const evidence = inspectRun(file);
    return sanitizedModel(JSON.parse(readPrivate(file)), evidence);
  });
  return { schemaVersion: '1.0.0', verifiedAt: new Date().toISOString(), models, benchmarks,
    commercial: { saleAllowed: false, publicReleaseAllowed: false,
      requirements: [
        ['الجودة والأداء', 'دقة الاختبار المحلي غير كافية؛ المعايير الخارجية لم تنفذ.'],
        ['المبيع والحقوق', 'تحديد الأوزان أو الخدمة والإصدار وحقوق الاستخدام والتوزيع كتابة.'],
        ['الأطراف والرضا', 'هوية الأطراف وأهليتهم وتفويضهم وإيجاب وقبول موثقان.'],
        ['الثمن والتسليم', 'الثمن والعملة والضرائب وآلية التسليم والقبول والاسترداد غير معتمدة.'],
        ['SLA والدعم', 'لا توجد مدة توافر أو زمن استجابة تعاقدي مقاس ومعتمد.'],
        ['الخصوصية والأمن', 'عزل العملاء وإدارة الأسرار والتعافي واختبار الاستعادة للإنتاج مطلوبة.'],
        ['المراجعة والاعتماد', 'مراجعة بشرية شرعية ونظامية بحسب الاختصاص؛ لا توقيع آلي أو فتوى آلية.'],
      ],
      references: [
        ['التراضي في التجارة، النساء 29', 'https://quran.com/4/29'],
        ['الصدق والبيان في البيع', 'https://dorar.net/h/TwEGhJIK?osoul=1'],
        ['وزارة التجارة، النظام السعودي عند انطباقه', 'https://mc.gov.sa/ar/ecc/pages/default.aspx'],
      ] },
    privacy: { externalUploads: false, rawDataAvailable: false, weightsDownloadAvailable: false },
  };
}

function createServer(data, token) {
  const expires = Date.now() + 8 * 60 * 60 * 1000;
  return http.createServer((req, res) => {
    const host = `127.0.0.1:${req.socket.localPort}`;
    const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' blob: data:; media-src blob:; frame-ancestors 'none'; base-uri 'none'; form-action 'none'" };
    function send(code, body, type = 'application/json; charset=utf-8') {
      res.writeHead(code, { ...headers, 'Content-Type': type }); res.end(body);
    }
    if (req.headers.host !== host || (req.headers.origin && req.headers.origin !== `http://${host}`)) {
      return send(403, '{"error":"ORIGIN_DENIED"}');
    }
    if (req.method !== 'GET') return send(405, '{"error":"READ_ONLY_PREVIEW"}');
    const pathname = new URL(req.url, `http://${host}`).pathname;
    if (pathname === '/api/overview') {
      const supplied = crypto.createHash('sha256').update(String(req.headers.authorization || '')).digest();
      const key = crypto.createHash('sha256').update(`Bearer ${token}`).digest();
      if (Date.now() >= expires || !crypto.timingSafeEqual(supplied, key)) return send(401, '{"error":"OWNER_SESSION_REQUIRED"}');
      return send(200, JSON.stringify(data));
    }
    const asset = ASSETS.get(pathname);
    if (!asset) return send(404, '{"error":"NOT_FOUND"}');
    return send(200, fs.readFileSync(path.join(__dirname, asset[0])), asset[1]);
  });
}

async function start(root) {
  const data = buildData(root);
  const token = crypto.randomBytes(32).toString('hex');
  const server = createServer(data, token);
  let port = 8108;
  while (true) {
    try {
      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, '127.0.0.1', () => { server.removeListener('error', reject); resolve(); });
      });
      break;
    } catch (error) {
      if (error.code !== 'EADDRINUSE' || port >= 8120) throw error;
      port++;
    }
  }
  const access = { url: `http://127.0.0.1:${port}/#${token}`, pid: process.pid,
    expiresInHours: 8, bind: '127.0.0.1', publicRelease: false };
  fs.writeFileSync(path.join(root, `preview-session-${process.pid}.json`), JSON.stringify(access, null, 2), { mode: 0o600, flag: 'wx' });
  if (process.send) { process.send(access); process.disconnect(); }
  else console.log(JSON.stringify(access));
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args[0] !== '--root' || !args[1] || args.length > 3 || (args[2] && args[2] !== '--detach')) {
    console.error('USAGE: --root PRIVATE_RUNS_DIRECTORY [--detach]'); process.exitCode = 1;
  } else {
    const root = privatePath(args[1]);
    if (args[2] === '--detach') {
      const log = fs.openSync(path.join(root, `preview-${Date.now()}.log`), 'wx', 0o600);
      const child = spawn(process.execPath, [__filename, '--root', root],
        { detached: true, stdio: ['ignore', log, log, 'ipc'] });
      fs.closeSync(log);
      child.once('message', (message) => { console.log(JSON.stringify(message)); child.unref(); });
      child.once('exit', (code) => { if (code) process.exitCode = code; });
    } else start(root).catch(() => { console.error('PREVIEW_START_FAILED_NO_RELEASE'); process.exitCode = 1; });
  }
}

module.exports = { createServer, sanitizedModel, buildData };
