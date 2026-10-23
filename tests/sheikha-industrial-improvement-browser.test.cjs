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
const output = path.join(__dirname, '../runtime/industrial-federation-verification');

test('derived experiment UI preserves lineage and drafts, resolves conflicts and lost replies on desktop/mobile', { timeout: 90000 }, async t => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
  t.after(() => browser.close()); fs.mkdirSync(output, { recursive: true });
  const errors = [], outside = [];
  for (const width of [1440, 390, 320]) {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-derive-browser-'));
    const archiveRoot = path.join(temp, 'archive'), reviewRoot = path.join(temp, 'reviews');
    const archive = createFederationArchive({ root: archiveRoot }), store = createFederationStore();
    let source = store.create({ name: 'تجمع اختبار التعديل', templateId: 'food', clusters: 1,
      foundriesPerCluster: 1, factoriesPerCluster: 1, linesPerFactory: 1, farmsPerCluster: 1 });
    source = store.act(source.id, { command: 'start', expectedRevision: 0 });
    while (source.state === 'RUNNING') source = store.act(source.id, { command: 'step', expectedRevision: source.revision, steps: 5 });
    const saved = archive.save(source), reviews = createFederationReviews({ archive, root: reviewRoot });
    const note = '<script>window.UNSAFE=1</script> طلب اختبار زيادة عدد الخطوط';
    reviews.append(saved.id, { expectedRevision: 0, requestId: randomUUID(), targetId: source.artifacts[0].id, decision: 'CHANGES_REQUESTED', note });
    const server = createWorkspaceServer({ federation: { archive: { root: archiveRoot }, reviews: { root: reviewRoot } } });
    server.listen(0, '127.0.0.1'); await once(server, 'listening'); const base = `http://127.0.0.1:${server.address().port}`;
    const context = await browser.newContext({ viewport: { width, height: 900 }, acceptDownloads: true });
    try {
      const page = await context.newPage(); page.setDefaultTimeout(10000);
      page.on('pageerror', e => errors.push(e.message));
      page.on('request', req => { if (!req.url().startsWith(base) && !req.url().startsWith('blob:')) outside.push(req.url()); });
      await page.goto(base + '/workspace/industry-runtime.html');
      await page.locator(`[data-archive="${saved.id}"] button`).click();
      await page.waitForFunction(() => !document.getElementById('derive-name').disabled);
      assert.equal(await page.locator('#derive-submit').isDisabled(), true);
      assert.equal(await page.locator('#derive-requests input').count(), 1);
      await page.locator('#derive-requests input').check();
      assert.equal(await page.locator('#derive-submit').isDisabled(), true);
      await page.locator('#derive-linesPerFactory').fill('2');
      await page.locator('#derive-intent').fill('مقارنة تكوين جديد للمراجعة فقط');
      assert.equal(await page.locator('#derive-comparison .changed').count(), 1);
      assert.equal(await page.evaluate(() => window.UNSAFE), undefined);
      page.once('dialog', dialog => dialog.dismiss()); await page.locator('#archive-close').click();
      assert.equal(await page.locator('#archive-review').isVisible(), true);
      const api = base + '/api/sheikha/workspace/v1';
      const token = (await (await context.request.get(api + '/session')).json()).token;
      const remote = await context.request.post(`${api}/industry/archives/${saved.id}/reviews`, {
        headers: { 'X-Sheikha-Session': token }, data: { expectedRevision: 1, requestId: randomUUID(), targetId: 'federation',
          decision: 'COMMENT', note: 'تغيير سجل المراجعة من جلسة اختبار ثانية' } });
      assert.equal(remote.status(), 200);
      await page.locator('#derive-submit').click();
      await page.waitForFunction(() => document.getElementById('federation-message').classList.contains('error'));
      assert.equal(await page.locator('#derive-submit').isDisabled(), true);
      assert.equal(await page.locator('#derive-intent').inputValue(), 'مقارنة تكوين جديد للمراجعة فقط');
      assert.equal(await page.locator('#derive-recovery').isVisible(), false);
      await page.locator('#review-refresh').click();
      await page.waitForFunction(() => !document.getElementById('derive-submit').disabled);
      let sent = 0;
      await page.route('**/derive', async route => {
        sent++; const response = await route.fetch(); assert.equal(response.status(), 200);
        await route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
      });
      await page.locator('#derive-title').scrollIntoViewIfNeeded();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: path.join(output, `derive-form-${width}.png`) });
      await page.locator('#derive-submit').click(); await page.locator('#derive-recovery').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#federation-create').isDisabled(), true);
      assert.equal(await page.locator('#derive-submit').isDisabled(), true);
      await page.unroute('**/derive');
      page.once('dialog', dialog => dialog.accept()); await page.reload();
      await page.locator('#derive-recovery').waitFor({ state: 'visible' });
      await page.locator('#derive-recover').click();
      await page.waitForFunction(() => !document.getElementById('federation-run').hidden && !document.getElementById('federation-save').disabled);
      const child = JSON.parse(await page.locator('#federation-json').textContent());
      assert.equal(sent, 1); assert.equal(child.state, 'READY'); assert.equal(child.tick, 0);
      assert.equal(child.derivation.sourceArchiveId, saved.id); assert.equal(child.derivation.requests[0].note, note);
      assert.equal(child.derivation.approvalInherited, false); assert.equal(child.derivation.improvementVerified, false);
      assert.equal(await page.locator('#run-lineage').isVisible(), true);
      assert.equal(await page.locator('#run-lineage .changed').count(), 1);
      assert.equal(await page.evaluate(() => window.UNSAFE), undefined);
      assert.equal(await page.locator('#derive-recovery').isVisible(), false);
      await page.locator('#run-lineage').scrollIntoViewIfNeeded();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow at ${width}`);
      assert.deepEqual(await page.locator('button:visible').evaluateAll(items => items.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent)), []);
      await page.screenshot({ path: path.join(output, `derive-lineage-${width}.png`) });
      await page.locator('#federation-save').click();
      await page.waitForFunction(() => document.getElementById('review-json').textContent && !document.getElementById('review-export').disabled);
      const childArchive = JSON.parse(await page.locator('#archive-json').textContent());
      assert.deepEqual(childArchive.snapshot, child);
      assert.equal(JSON.parse(await page.locator('#review-json').textContent()).revision, 0);
      assert.equal(await page.locator('#archive-lineage').isVisible(), true);
      assert.equal(await page.locator('#derive-submit').isDisabled(), true);
      const downloading = page.waitForEvent('download'); await page.locator('#archive-export').click();
      const download = await downloading; assert.deepEqual(JSON.parse(fs.readFileSync(await download.path(), 'utf8')), childArchive);
      await page.locator('#federation-discard').click();
      await page.waitForFunction(() => document.getElementById('federation-run').hidden && !document.getElementById('federation-create').disabled);
      await page.evaluate(id => sessionStorage.setItem('sheikha-industrial-pending-derivation', id), child.derivation.requestId);
      await page.reload(); await page.locator('#derive-recover').click();
      await page.locator('#derive-clear').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#federation-create').isDisabled(), true);
      await page.locator('#derive-clear').click();
      assert.equal(await page.locator('#federation-create').isDisabled(), false);
      assert.deepEqual(archive.read(saved.id), saved); assert.equal(reviews.read(saved.id).revision, 2);
    } finally {
      await context.close(); await new Promise(resolve => { server.closeAllConnections(); server.close(resolve); });
      fs.rmSync(temp, { recursive: true, force: true });
    }
  }
  assert.deepEqual(errors, []); assert.deepEqual(outside, []);
  fs.writeFileSync(path.join(output, 'derive-browser-verification.json'), JSON.stringify({ checkedAt: new Date().toISOString(),
    widths: [1440, 390, 320], errors, outside, conflictRecovery: true, lostReplyReloadRecovery: true, expiredRequestNotRecreated: true, passed: true }, null, 2));
});
