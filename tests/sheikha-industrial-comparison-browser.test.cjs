'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { randomUUID } = require('node:crypto');
const { once } = require('node:events');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/tmp/sheikha-architecture-tools/node_modules/playwright');
const { createWorkspaceServer } = require('../tools/preview/sheikha-workspace-preview.cjs');
const { createFederationArchive } = require('../core/industrial/sheikha-industrial-archive-v1.cjs');
const { createFederationStore } = require('../core/industrial/sheikha-industrial-federation-v1.cjs');
const { createFederationReviews } = require('../core/industrial/sheikha-industrial-review-v1.cjs');
const { createFederationImprovements } = require('../core/industrial/sheikha-industrial-improvement-v1.cjs');
const output = path.join(__dirname, '../runtime/industrial-federation-verification');
const finish = (store, run) => {
  run = store.act(run.id, { command: 'start', expectedRevision: 0 });
  while (run.state === 'RUNNING') run = store.act(run.id, { command: 'step', steps: 5, expectedRevision: run.revision });
  return run;
};

test('archived comparisons render neutral full/partial reports, export, preserve drafts and recover on desktop/mobile', { timeout: 90000 }, async t => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
  t.after(() => browser.close()); fs.mkdirSync(output, { recursive: true });
  const errors = [], outside = [], mutations = [];
  for (const width of [1440, 390, 320]) {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-comparison-browser-'));
    const archiveRoot = path.join(temp, 'archive'), reviewRoot = path.join(temp, 'reviews');
    const archive = createFederationArchive({ root: archiveRoot }), store = createFederationStore();
    const config = { name: 'تجمع اختبار المقارنة', templateId: 'food', clusters: 2,
      foundriesPerCluster: 2, factoriesPerCluster: 2, linesPerFactory: 2, farmsPerCluster: 2 };
    const source = finish(store, store.create(config)), original = archive.save(source);
    const reviews = createFederationReviews({ archive, root: reviewRoot });
    const review = reviews.append(original.id, { expectedRevision: 0, requestId: randomUUID(), targetId: 'federation',
      decision: 'CHANGES_REQUESTED', note: 'ملاحظة اختبار للمقارنة دون اعتماد' });
    const improvements = createFederationImprovements({ store, archive, reviews });
    let child = improvements.derive(original.id, { requestId: randomUUID(), expectedReviewRevision: 1,
      expectedReviewChainHead: review.chainHead, requestIds: [review.events[0].requestId],
      config: { ...config, name: '<b>نسخة معدلة للاختبار</b>', linesPerFactory: 1 }, intent: 'مقارنة محلية دون اعتماد أو نشر' });
    const partial = archive.save(child); child = finish(store, child); const complete = archive.save(child);
    const context = await browser.newContext({ viewport: { width, height: 900 }, acceptDownloads: true });
    let server, base;
    const start = async (port = 0) => {
      server = createWorkspaceServer({ federation: { archive: { root: archiveRoot }, reviews: { root: reviewRoot } } });
      server.listen(port, '127.0.0.1'); await once(server, 'listening'); base = `http://127.0.0.1:${server.address().port}`;
    };
    const stop = () => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); });
    try {
      await start(); const page = await context.newPage(); page.setDefaultTimeout(10000);
      page.on('pageerror', e => errors.push(e.message));
      page.on('request', req => {
        if (!req.url().startsWith(base) && !req.url().startsWith('blob:')) outside.push(req.url());
        if (!['GET', 'HEAD'].includes(req.method())) mutations.push(req.url());
      });
      await page.goto(base + '/workspace/industry-runtime.html');
      const open = async id => {
        await page.locator(`[data-archive="${id}"] button`).click();
        await page.waitForFunction(() => !document.getElementById('archive-export').disabled);
      };
      const read = async () => {
        await page.locator('#comparison-read').click();
        await page.waitForFunction(() => !document.getElementById('comparison-export').disabled);
        return JSON.parse(await page.locator('#comparison-json').textContent());
      };
      await open(original.id); assert.equal(await page.locator('#archive-comparison').isVisible(), false);
      await open(complete.id); assert.equal(await page.locator('#archive-comparison').isVisible(), true);
      assert.equal(await page.locator('#comparison-result').isVisible(), false);
      assert.equal(await page.locator('#comparison-export').isDisabled(), true);
      const report = await read(); assert.equal(report.basis.status, 'BOTH_COMPLETE');
      assert.equal(report.policy.improvementVerified, false);
      assert.equal(await page.locator('[data-metric="emittedArtifacts"] td').last().textContent(), '-4');
      assert.equal(await page.locator('[data-metric="steps"] td').last().textContent(), '0');
      assert.equal(await page.locator('#comparison-refs b').count(), 0);
      assert.ok((await page.locator('#comparison-refs').textContent()).includes('<b>نسخة معدلة للاختبار</b>'));
      const downloading = page.waitForEvent('download'); await page.locator('#comparison-export').click();
      const download = await downloading; assert.deepEqual(JSON.parse(fs.readFileSync(await download.path(), 'utf8')), report);
      await page.locator('#comparison-title').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(output, `comparison-${width}.png`) });
      await page.locator('#comparison-metrics').scrollIntoViewIfNeeded();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow at ${width}`);
      assert.deepEqual(await page.locator('button:visible').evaluateAll(items => items.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent)), []);
      assert.deepEqual(await page.locator('.comparison-table th,.comparison-table td').evaluateAll(items => items.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent)), []);
      await page.screenshot({ path: path.join(output, `comparison-metrics-${width}.png`) });
      await page.locator('#review-note').fill('مسودة مراجعة يجب أن تبقى');
      page.once('dialog', dialog => dialog.dismiss()); await page.locator('#comparison-source').click();
      assert.equal(JSON.parse(await page.locator('#archive-json').textContent()).id, complete.id);
      assert.equal(await page.locator('#review-note').inputValue(), 'مسودة مراجعة يجب أن تبقى');
      await page.route('**/comparison', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
      await page.locator('#comparison-read').click();
      await page.waitForFunction(() => document.getElementById('comparison-message').classList.contains('error'));
      assert.equal(await page.locator('#comparison-export').isDisabled(), true);
      assert.equal(await page.locator('#comparison-json').textContent(), ''); assert.equal(await page.locator('#comparison-result').isVisible(), false);
      assert.equal(await page.locator('#archive-export').isDisabled(), false);
      assert.equal(await page.locator('#review-note').inputValue(), 'مسودة مراجعة يجب أن تبقى');
      await page.unroute('**/comparison'); assert.deepEqual(await read(), report);
      await page.locator('#review-note').fill(''); await page.locator('#comparison-source').click();
      await page.waitForFunction(id => JSON.parse(document.getElementById('archive-json').textContent).id === id, original.id);
      assert.equal(await page.locator('#archive-comparison').isVisible(), false); assert.equal(await page.locator('#comparison-json').textContent(), '');
      await open(partial.id); assert.equal(await page.locator('#comparison-export').isDisabled(), true);
      const partialReport = await read(); assert.equal(partialReport.basis.status, 'PARTIAL');
      assert.ok((await page.locator('#comparison-basis').textContent()).includes('مقارنة جزئية'));
      assert.equal(partialReport.metrics.find(m => m.key === 'emittedArtifacts').candidate, 0);
      const port = server.address().port; await stop(); await start(port);
      await page.reload(); await open(complete.id); assert.deepEqual(await read(), report);
      assert.equal(await page.locator('#federation-run').isVisible(), false);
      const sourceFile = path.join(archiveRoot, `${original.id}.json`), bytes = fs.readFileSync(sourceFile);
      fs.unlinkSync(sourceFile); await page.locator('#comparison-read').click();
      await page.waitForFunction(() => document.getElementById('comparison-message').classList.contains('error'));
      assert.equal(await page.locator('#comparison-export').isDisabled(), true);
      assert.equal(await page.locator('#archive-export').isDisabled(), false);
      assert.equal(await page.locator('#review-submit').isDisabled(), false);
      fs.writeFileSync(sourceFile, bytes, { mode: 0o600 }); assert.deepEqual(await read(), report);
      assert.deepEqual(archive.read(original.id), original); assert.deepEqual(archive.read(complete.id), complete);
      assert.deepEqual(reviews.read(original.id), review); assert.equal(reviews.read(complete.id).revision, 0);
    } finally {
      await context.close(); if (server?.listening) await stop(); fs.rmSync(temp, { recursive: true, force: true });
    }
  }
  assert.deepEqual(errors, []); assert.deepEqual(outside, []); assert.deepEqual(mutations, []);
  fs.writeFileSync(path.join(output, 'comparison-browser-verification.json'), JSON.stringify({ checkedAt: new Date().toISOString(),
    widths: [1440, 390, 320], errors, outside, mutations, partialResultsLabeled: true, export: true, sourceLossRecovery: true, restartRecovery: true, passed: true }, null, 2));
});
