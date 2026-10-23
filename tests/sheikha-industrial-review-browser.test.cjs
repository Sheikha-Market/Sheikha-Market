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
const output = path.join(__dirname, '../runtime/industrial-federation-verification');

test('review workflow handles conflicts, lost responses, restart and export on desktop and mobile', { timeout: 90000 }, async t => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
  t.after(() => browser.close()); fs.mkdirSync(output, { recursive: true });
  const errors = [], outside = [];
  for (const width of [1440, 390, 320]) {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-review-browser-'));
    const archiveRoot = path.join(temp, 'archive'), reviewRoot = path.join(temp, 'reviews');
    const archive = createFederationArchive({ root: archiveRoot }), store = createFederationStore();
    let run = store.create({ name: 'تجمع شيخة للمراجعة التصورية', templateId: 'food', clusters: 1,
      foundriesPerCluster: 1, factoriesPerCluster: 1, linesPerFactory: 1, farmsPerCluster: 1 });
    run = store.act(run.id, { command: 'start', expectedRevision: 0 });
    while (run.state === 'RUNNING') run = store.act(run.id, { command: 'step', steps: 5, expectedRevision: run.revision });
    const saved = archive.save(run), targetId = run.artifacts[0].id;
    const context = await browser.newContext({ viewport: { width, height: 900 }, acceptDownloads: true });
    let server, base;
    const start = async (port = 0) => {
      server = createWorkspaceServer({ federation: { archive: { root: archiveRoot }, reviews: { root: reviewRoot } } });
      server.listen(port, '127.0.0.1'); await once(server, 'listening'); base = `http://127.0.0.1:${server.address().port}`;
    };
    const stop = () => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); });
    try {
      await start(); const page = await context.newPage(); page.setDefaultTimeout(10000);
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', req => { if (!req.url().startsWith(base) && !req.url().startsWith('blob:')) outside.push(req.url()); });
      const open = async () => {
        await page.goto(base + '/workspace/industry-runtime.html');
        await page.locator(`[data-archive="${saved.id}"] button`).click();
        await page.waitForFunction(() => !document.getElementById('review-submit').disabled);
      };
      await open();
      const view = async () => JSON.parse(await page.locator('#review-json').textContent());
      assert.equal((await view()).revision, 0);
      assert.equal(await page.locator('#review-target option').count(), 5);
      await page.locator('#review-note').fill('مسودة لم تُسجل بعد');
      page.once('dialog', dialog => dialog.dismiss());
      await page.locator('#archive-close').click();
      assert.equal(await page.locator('#archive-review').isVisible(), true);
      assert.equal(await page.locator('#review-note').inputValue(), 'مسودة لم تُسجل بعد');
      await page.locator('#review-note').fill('');
      const submit = async (decision, note, revision) => {
        await page.locator('#review-decision').selectOption(decision); await page.locator('#review-note').fill(note);
        await page.locator('#review-submit').click();
        await page.waitForFunction(rev => JSON.parse(document.getElementById('review-json').textContent).revision === rev, revision);
        await page.waitForFunction(() => !document.getElementById('review-submit').disabled);
      };
      await page.locator('#review-target').selectOption(targetId);
      await submit('CHANGES_REQUESTED', 'توثيق متطلبات الموارد قبل الخطوة التالية', 1);
      await submit('COMMENT', '<script>window.UNSAFE=1</script> اختبار نص محلي', 2);
      assert.equal(await page.evaluate(() => window.UNSAFE), undefined);
      assert.equal((await view()).targets.find(item => item.id === targetId).status, 'CHANGES_REQUESTED');
      const api = base + '/api/sheikha/workspace/v1';
      const token = (await (await context.request.get(api + '/session')).json()).token;
      const remote = await context.request.post(`${api}/industry/archives/${saved.id}/reviews`, {
        headers: { 'X-Sheikha-Session': token }, data: { expectedRevision: 2, requestId: randomUUID(), targetId: 'federation',
          decision: 'CONCEPT_REVIEWED', note: 'قرار جلسة اختبار ثانية؛ لا اعتماد إنتاج' } });
      assert.equal(remote.status(), 200);
      await page.locator('#review-note').fill('ملاحظة محفوظة في النموذج عند التعارض');
      await page.locator('#review-submit').click();
      await page.waitForFunction(() => document.getElementById('review-message').classList.contains('error'));
      assert.equal(await page.locator('#review-export').isDisabled(), true);
      assert.equal(await page.locator('#review-submit').isDisabled(), true);
      await page.locator('#review-refresh').click();
      await page.waitForFunction(() => !document.getElementById('review-submit').disabled);
      assert.equal((await view()).revision, 3);
      assert.equal(await page.locator('#review-note').inputValue(), 'ملاحظة محفوظة في النموذج عند التعارض');
      await submit('COMMENT', 'ملاحظة محفوظة في النموذج عند التعارض', 4);
      await page.route('**/reviews', async route => {
        if (route.request().method() !== 'POST') return route.continue();
        const response = await route.fetch(); assert.equal(response.status(), 200);
        await route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
      });
      await page.locator('#review-decision').selectOption('CONCEPT_REVIEWED');
      await page.locator('#review-note').fill('اكتملت مراجعة التصور الاختباري دون اعتماد');
      await page.locator('#review-submit').click();
      await page.waitForFunction(() => document.getElementById('review-message').classList.contains('error'));
      assert.equal((await view()).revision, 4);
      await page.unroute('**/reviews'); await page.locator('#review-refresh').click();
      await page.waitForFunction(() => !document.getElementById('review-submit').disabled);
      assert.equal((await view()).revision, 5); assert.equal(await page.locator('#review-note').inputValue(), '');
      assert.equal((await view()).events.filter(e => e.note === 'اكتملت مراجعة التصور الاختباري دون اعتماد').length, 1);
      await submit('REOPENED', 'إعادة فتح المراجعة لفحص الموارد المقترحة', 6);
      assert.equal((await view()).targets.find(item => item.id === targetId).status, 'PENDING');
      const reviewed = await view(); assert.equal(reviewed.policy.approvalGranted, false);
      assert.deepEqual(JSON.parse(await page.locator('#archive-json').textContent()), saved);
      const downloadPromise = page.waitForEvent('download'); await page.locator('#review-export').click();
      const download = await downloadPromise;
      assert.deepEqual(JSON.parse(fs.readFileSync(await download.path(), 'utf8')), { archive: saved, review: reviewed });
      const port = server.address().port; await stop(); await start(port); await open();
      assert.deepEqual(await view(), reviewed);
      assert.equal(await page.locator('#federation-run').isVisible(), false);
      await page.locator('#review-title').scrollIntoViewIfNeeded();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow at ${width}`);
      assert.deepEqual(await page.locator('button:visible').evaluateAll(items => items.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent)), []);
      await page.screenshot({ path: path.join(output, `review-${width}.png`) });
      await page.route('**/reviews', route => route.fulfill({ status: 422, contentType: 'application/json', body: '{}' }));
      await page.locator('#review-refresh').click();
      await page.waitForFunction(() => document.getElementById('review-message').classList.contains('error'));
      assert.equal(await page.locator('#review-submit').isDisabled(), true);
      assert.equal(await page.locator('#review-export').isDisabled(), true);
      assert.equal(await page.locator('#review-json').textContent(), '');
      assert.equal(await page.locator('#archive-export').isDisabled(), false);
    } finally {
      await context.close(); if (server?.listening) await stop(); fs.rmSync(temp, { recursive: true, force: true });
    }
  }
  assert.deepEqual(errors, []); assert.deepEqual(outside, []);
  fs.writeFileSync(path.join(output, 'review-browser-verification.json'), JSON.stringify({
    checkedAt: new Date().toISOString(), widths: [1440, 390, 320], errors, outside,
    conflictRecovery: true, lostResponseDeduplicated: true, restartRecovery: true, passed: true
  }, null, 2));
});
