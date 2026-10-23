'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { once } = require('node:events');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/tmp/sheikha-architecture-tools/node_modules/playwright');
const { createWorkspaceServer } = require('../tools/preview/sheikha-workspace-preview.cjs');
const { listSupplierLab } = require('../core/ownership/sheikha-supplier-lab-v1.cjs');
const output = path.join(__dirname, '../runtime/supplier-lab-verification');

test('supplier lab supports filtering, pagination, linked records, scoped exports and failure recovery across desktop and mobile', { timeout: 90000 }, async t => {
  const server = createWorkspaceServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
  t.after(() => browser.close()); fs.mkdirSync(output, { recursive: true });
  const errors = [], outside = [], mutations = [];
  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, acceptDownloads: true });
    try {
      const page = await context.newPage(); page.setDefaultTimeout(10000);
      page.on('pageerror', e => errors.push(e.message)); page.on('request', req => {
        if (!req.url().startsWith(base) && !req.url().startsWith('blob:')) outside.push(req.url());
        if (!['GET', 'HEAD'].includes(req.method())) mutations.push(req.url());
      });
      const ready = () => page.waitForFunction(() => !document.getElementById('lab-refresh').disabled && !document.getElementById('lab-export').disabled);
      const layout = async () => {
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `page overflow at ${width}`);
        assert.deepEqual(await page.locator('button:visible,th:visible,td:visible,h1:visible,h2:visible').evaluateAll(items => items.filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent)), []);
      };
      await page.goto(base + '/workspace/supplier-lab.html'); await ready();
      assert.equal(await page.locator('[data-record]').count(), 5);
      assert.equal(await page.locator('.brand img').evaluate(img => img.complete && img.naturalWidth > 0), true);
      assert.equal(await page.locator('#lab-previous').isDisabled(), true); await layout();
      await page.screenshot({ path: path.join(output, `suppliers-${width}.png`) });
      await page.locator('#lab-next').click(); await ready(); assert.equal(await page.locator('[data-record]').count(), 1);
      assert.equal(await page.locator('#lab-next').isDisabled(), true);
      await page.locator('#lab-previous').click(); await ready(); assert.equal(await page.locator('[data-record]').count(), 5);
      await page.locator('#lab-category').selectOption('METALS'); await ready(); assert.equal(await page.locator('[data-record]').count(), 2);
      await page.locator('#lab-search').fill('NO_MATCH'); await page.getByRole('button', { name: 'بحث', exact: true }).click(); await ready();
      assert.equal(await page.locator('#lab-empty').isVisible(), true); assert.equal(await page.locator('[data-record]').count(), 0);
      await page.locator('#lab-reset').click(); await ready();
      await page.locator('[data-record="SUP-SYN-001"] button').click();
      assert.ok((await page.locator('#lab-detail-body').textContent()).includes('ليس موردًا فعليًا'));
      await page.getByRole('button', { name: 'مواد المورد التجريبية', exact: true }).click(); await ready();
      assert.equal(await page.locator('#tab-materials').getAttribute('aria-selected'), 'true');
      assert.equal(await page.locator('#lab-supplier').inputValue(), 'SUP-SYN-001'); assert.equal(await page.locator('[data-record]').count(), 2);
      await page.locator('[data-record="MAT-SYN-001"] button').click();
      assert.ok((await page.locator('#lab-detail-body').textContent()).includes('كيلوغرام'));
      await layout(); await page.locator('#lab-panel').evaluate(panel => panel.scrollIntoView({ block: 'start' }));
      await page.screenshot({ path: path.join(output, `materials-${width}.png`) });
      await page.getByRole('button', { name: 'سجل المورد التجريبي', exact: true }).click(); await ready();
      assert.equal(await page.locator('[data-record]').count(), 1); assert.equal(await page.locator('#lab-search').inputValue(), 'SUP-SYN-001');
      await page.locator('[data-record="SUP-SYN-001"] button').click();
      await page.getByRole('button', { name: 'وثائق المورد التجريبية', exact: true }).click(); await ready();
      assert.equal(await page.locator('#tab-documents').getAttribute('aria-selected'), 'true'); assert.equal(await page.locator('[data-record]').count(), 2);
      await page.locator('#lab-category').selectOption('TEST_RECORD'); await ready(); assert.equal(await page.locator('[data-record]').count(), 1);
      await page.locator('[data-record="DOC-SYN-002"] button').click();
      assert.ok((await page.locator('#lab-detail-body').textContent()).includes('لا ملف متاح'));
      assert.equal(await page.locator('#lab-detail-body a[download]').count(), 0); await layout();
      await page.locator('#lab-detail').evaluate(detail => detail.scrollIntoView({ block: 'start' }));
      await page.screenshot({ path: path.join(output, `document-detail-${width}.png`) });
      const downloading = page.waitForEvent('download'); await page.locator('#lab-export').click(); const file = await downloading;
      const exported = JSON.parse(fs.readFileSync(await file.path(), 'utf8'));
      assert.deepEqual(exported, listSupplierLab('documents', new URLSearchParams({ offset: '0', limit: '5', kind: 'TEST_RECORD', supplierId: 'SUP-SYN-001' })));
      assert.equal(exported.policy.documentContentExposed, false);
      await page.locator('#lab-reset').click(); await ready(); await page.locator('#lab-limit').selectOption('10'); await ready();
      assert.equal(await page.locator('[data-record]').count(), 8); assert.equal(await page.locator('#lab-next').isDisabled(), true);
      await page.locator('#tab-documents').focus(); await page.keyboard.press('Home'); await ready();
      assert.equal(await page.locator('#tab-suppliers').getAttribute('aria-selected'), 'true'); assert.equal(await page.locator('[data-record]').count(), 6);
      await page.locator('#tab-suppliers').focus(); await page.keyboard.press('ArrowLeft'); await ready();
      assert.equal(await page.locator('#tab-materials').getAttribute('aria-selected'), 'true');
      await page.route('**/api/materials?*', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
      await page.locator('#lab-refresh').click(); await page.waitForFunction(() => !document.getElementById('lab-refresh').disabled);
      assert.equal(await page.locator('#lab-export').isDisabled(), true); assert.equal(await page.locator('[data-record]').count(), 0);
      assert.equal(await page.locator('#lab-detail-body').isVisible(), false); assert.equal(await page.locator('#lab-contract-path').textContent(), '');
      await page.unroute('**/api/materials?*');
      let deniedOnce = false;
      await page.route('**/api/materials?*', route => {
        if (!deniedOnce) { deniedOnce = true; return route.fulfill({ status: 403, contentType: 'application/json', body: '{}' }); }
        return route.continue();
      });
      await page.locator('#lab-refresh').click(); await ready(); assert.equal(deniedOnce, true);
      await page.unroute('**/api/materials?*');
      const malformed = listSupplierLab('materials'); malformed.policy.productionEnabled = true;
      await page.route('**/api/materials?*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(malformed) }));
      await page.locator('#lab-refresh').click(); await page.waitForFunction(() => !document.getElementById('lab-refresh').disabled);
      assert.equal(await page.locator('#lab-export').isDisabled(), true); assert.equal(await page.locator('[data-record]').count(), 0);
      await page.unroute('**/api/materials?*');
      const untrusted = listSupplierLab('materials'); untrusted.items[0].name = '<img src=x onerror=alert(1)>';
      await page.route('**/api/materials?*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(untrusted) }));
      await page.locator('#lab-refresh').click(); await ready();
      assert.equal(await page.locator('#lab-rows img[src=x]').count(), 0); assert.ok((await page.locator('#lab-rows').textContent()).includes('<img src=x onerror=alert(1)>'));
      await page.unroute('**/api/materials?*'); await page.reload(); await ready();
      assert.equal(await page.locator('#tab-suppliers').getAttribute('aria-selected'), 'true');
      assert.equal(await page.locator('a[href="./assets.html"]').first().getAttribute('href'), './assets.html');
    } finally { await context.close(); }
  }
  assert.deepEqual(errors, []); assert.deepEqual(outside, []); assert.deepEqual(mutations, []);
  fs.writeFileSync(path.join(output, 'browser-verification.json'), JSON.stringify({ checkedAt: new Date().toISOString(), widths: [1440, 390, 320],
    scope: 'LOCAL_SYNTHETIC_PROTOTYPE_ONLY', filters: true, pagination: true, relationships: true, metadataExport: true,
    failureAndSessionRecovery: true, errors, outside, mutations, passed: true, productionApproved: false }, null, 2));
});
