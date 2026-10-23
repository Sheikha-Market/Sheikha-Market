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
const { createFederationLineage } = require('../core/industrial/sheikha-industrial-lineage-v1.cjs');
const output = path.join(__dirname, '../runtime/industrial-federation-verification');

test('lineage filtering, snapshot grouping, draft guards, export and loss recovery work on desktop and mobile', { timeout: 90000 }, async t => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
  t.after(() => browser.close()); fs.mkdirSync(output, { recursive: true });
  const errors = [], outside = [], mutations = [];
  for (const width of [1440, 390, 320]) {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-lineage-browser-'));
    const archiveRoot = path.join(temp, 'archive'), reviewRoot = path.join(temp, 'reviews');
    const archive = createFederationArchive({ root: archiveRoot }), store = createFederationStore();
    const reviews = createFederationReviews({ archive, root: reviewRoot });
    const improvements = createFederationImprovements({ store, archive, reviews });
    const config = { name: 'التجمع الأصلي للاختبار', templateId: 'food', clusters: 1,
      foundriesPerCluster: 1, factoriesPerCluster: 1, linesPerFactory: 1, farmsPerCluster: 1 };
    const source = archive.save(store.create(config));
    const derive = (parent, name) => {
      const review = reviews.append(parent.id, { expectedRevision: 0, requestId: randomUUID(), targetId: 'federation',
        decision: 'CHANGES_REQUESTED', note: 'طلب اختباري للسلاسل دون اعتماد' });
      return improvements.derive(parent.id, { requestId: randomUUID(), expectedReviewRevision: 1,
        expectedReviewChainHead: review.chainHead, requestIds: [review.events[0].requestId],
        config: { ...config, name, linesPerFactory: parent.snapshot.config.linesPerFactory === 1 ? 2 : 1 },
        intent: 'اختبار محلي لترابط التجارب' });
    };
    const child = derive(source, '<b>تعديل أول للاختبار</b>'), initial = archive.save(child);
    const reset = archive.save(store.act(child.id, { command: 'reset', expectedRevision: 0 }));
    const grandchild = archive.save(derive(reset, 'تعديل متفرع من التعديل الأول'));
    const independent = archive.save(store.create({ ...config, name: 'سلسلة مستقلة للاختبار' }));
    const readDisks = () => [archiveRoot, reviewRoot].map(root => fs.readdirSync(root).sort().map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
    const before = readDisks();
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
      const ready = () => page.waitForFunction(() => !document.getElementById('lineage-export').disabled);
      const open = async id => {
        await page.locator(`[data-archive="${id}"] button`).click();
        await page.waitForFunction(id => !document.getElementById('archive-export').disabled
          && JSON.parse(document.getElementById('archive-json').textContent).id === id, id);
      };
      await ready(); assert.equal(await page.locator('[data-experiment]').count(), 4);
      assert.equal(await page.locator('[data-archive]').count(), 5); assert.equal(await page.locator('#archive-family option').count(), 3);
      await page.locator('#archive-family').selectOption(source.snapshot.id);
      assert.equal(await page.locator('[data-experiment]').count(), 3); assert.equal(await page.locator('[data-archive]').count(), 4);
      assert.equal(await page.locator(`[data-archive="${independent.id}"]`).count(), 0);
      const childGroup = page.locator(`[data-experiment="${child.id}"]`);
      assert.deepEqual(await childGroup.locator('[data-archive]').evaluateAll(rows => rows.map(el => el.dataset.archive)), [reset.id, initial.id]);
      assert.equal(await childGroup.locator('b').count(), 0); assert.ok((await childGroup.textContent()).includes('<b>تعديل أول للاختبار</b>'));
      assert.ok((await page.locator(`[data-experiment="${grandchild.snapshot.id}"]`).textContent()).includes('مستوى التفرع 2'));
      const downloading = page.waitForEvent('download'); await page.locator('#lineage-export').click();
      const download = await downloading;
      assert.deepEqual(JSON.parse(fs.readFileSync(await download.path(), 'utf8')), createFederationLineage({ archive }).read());
      await page.locator('#archive-title').scrollIntoViewIfNeeded();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow at ${width}`);
      assert.deepEqual(await page.locator('button:visible').evaluateAll(items => items.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent)), []);
      assert.equal(await page.locator('.runtime-panorama img').evaluate(img => img.complete && img.naturalWidth > 0), true);
      await page.screenshot({ path: path.join(output, `lineage-${width}.png`) });
      await childGroup.scrollIntoViewIfNeeded(); await page.screenshot({ path: path.join(output, `lineage-branch-${width}.png`) });
      await open(reset.id); await page.locator('#comparison-read').click();
      await page.waitForFunction(() => !document.getElementById('comparison-export').disabled);
      assert.equal(JSON.parse(await page.locator('#comparison-json').textContent()).source.archiveId, source.id);
      await page.locator('#review-note').fill('مسودة مراجعة لا يجوز فقدانها');
      page.once('dialog', dialog => dialog.dismiss()); await childGroup.locator('[data-lineage-source]').click();
      assert.equal(JSON.parse(await page.locator('#archive-json').textContent()).id, reset.id);
      await page.locator('#archive-refresh').click(); await ready();
      assert.equal(await page.locator('#archive-family').inputValue(), source.snapshot.id);
      assert.equal(await page.locator('#review-note').inputValue(), 'مسودة مراجعة لا يجوز فقدانها');
      await page.route('**/archives/lineage', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
      await page.locator('#archive-refresh').click();
      await page.waitForFunction(() => !document.getElementById('archive-refresh').disabled);
      assert.equal(await page.locator('[data-archive]').count(), 0); assert.equal(await page.locator('#lineage-export').isDisabled(), true);
      assert.equal(await page.locator('#archive-family').isDisabled(), true);
      assert.equal(await page.locator('#archive-export').isDisabled(), false);
      assert.equal(await page.locator('#review-note').inputValue(), 'مسودة مراجعة لا يجوز فقدانها');
      await page.unroute('**/archives/lineage'); await page.locator('#archive-refresh').click(); await ready();
      const sourceFile = path.join(archiveRoot, `${source.id}.json`), bytes = fs.readFileSync(sourceFile);
      fs.unlinkSync(sourceFile); await page.locator('#archive-refresh').click(); await ready();
      assert.ok((await childGroup.textContent()).includes('الأصل غير متاح'));
      assert.equal(await childGroup.locator('[data-lineage-source]').count(), 0);
      assert.ok((await page.locator(`[data-experiment="${grandchild.snapshot.id}"]`).textContent()).includes('سلسلة الأصل غير مكتملة'));
      assert.equal(await page.locator('#archive-export').isDisabled(), false);
      assert.equal(await page.locator('#review-note').inputValue(), 'مسودة مراجعة لا يجوز فقدانها');
      fs.writeFileSync(sourceFile, bytes, { mode: 0o600 }); await page.locator('#archive-refresh').click(); await ready();
      await page.locator('#review-note').fill(''); await childGroup.locator('[data-lineage-source]').click();
      await page.waitForFunction(id => JSON.parse(document.getElementById('archive-json').textContent).id === id, source.id);
      const port = server.address().port; await stop(); await start(port); await page.reload(); await ready();
      assert.equal(await page.locator('[data-experiment]').count(), 4); assert.equal(await page.locator('#federation-run').isVisible(), false);
      assert.deepEqual(readDisks(), before);
      for (const file of fs.readdirSync(archiveRoot)) fs.unlinkSync(path.join(archiveRoot, file));
      await page.locator('#archive-refresh').click(); await ready();
      assert.equal(await page.locator('[data-experiment]').count(), 0); assert.equal(await page.locator('#archive-family option').count(), 1);
      assert.ok((await page.locator('#archive-message').textContent()).includes('0 من 100'));
    } finally {
      await context.close(); if (server?.listening) await stop(); fs.rmSync(temp, { recursive: true, force: true });
    }
  }
  assert.deepEqual(errors, []); assert.deepEqual(outside, []); assert.deepEqual(mutations, []);
  fs.writeFileSync(path.join(output, 'lineage-browser-verification.json'), JSON.stringify({ checkedAt: new Date().toISOString(),
    widths: [1440, 390, 320], errors, outside, mutations, grouping: true, filter: true, export: true,
    draftPreservation: true, missingSourceRecovery: true, restartRecovery: true, passed: true }, null, 2));
});
