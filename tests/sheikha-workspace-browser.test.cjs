'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { once } = require('node:events');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/tmp/sheikha-architecture-tools/node_modules/playwright');
const { createWorkspaceServer } = require('../tools/preview/sheikha-workspace-preview.cjs');
const output = path.join(__dirname, '../runtime/workspace-verification');

test('desktop and mobile workflows, real SDK/MCP, review gates and visual layout', { timeout: 90000 }, async t => {
  const server = createWorkspaceServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
  t.after(async () => { await browser.close(); await new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }); });
  fs.mkdirSync(output, { recursive: true });
  const errors = [], outside = [], results = [];
  for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, acceptDownloads: true });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', req => { if (!req.url().startsWith(base) && !req.url().startsWith('blob:')) outside.push(req.url()); });
    await page.goto(base + '/workspace/');
    for (const route of ['sheikha', 'market', 'operations', 'architecture']) {
      await page.locator(`.topbar nav a[href="#/${route}"]`).click();
      await page.locator(`[data-page="${route}"]`).waitFor({ state: 'visible' });
      if (route === 'market') await page.locator('.product').first().waitFor();
      if (route === 'operations') await page.waitForFunction(() => document.getElementById('connection-status').textContent.includes('متاح'));
      await page.evaluate(async () => {
        const images = [...document.images].filter(img => img.getClientRects().length);
        for (const img of images) img.loading = 'eager';
        await Promise.race([Promise.all(images.map(img => img.decode())), new Promise((_, reject) => setTimeout(() => reject(Error('ASSET_LOAD_TIMEOUT')), 8000))]);
      });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route}: horizontal overflow at ${viewport.width}`);
      const badButtons = await page.locator('button:visible').evaluateAll(buttons => buttons.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent));
      assert.deepEqual(badButtons, [], `${route}: clipped buttons`);
      const screenshot = `${route}-${viewport.width}.png`;
      await page.screenshot({ path: path.join(output, screenshot), fullPage: true });
      results.push({ route, viewport, screenshot, nonblankAssets: true });
    }

    await page.locator('.topbar nav a[href="#/market"]').click();
    await page.locator('#search').fill('nothing-xyz');
    assert.equal(await page.locator('.product').count(), 0);
    await page.getByRole('button', { name: 'مسح المرشحات' }).click();
    await page.locator('.product').first().waitFor();
    await page.locator('#search').fill('PROD-GOV-001');
    assert.equal(await page.locator('.product').count(), 1);
    await page.locator('.product button').click();
    await page.locator('#rfq-intent').fill('مراجعة نطاق المنتج <script>window.UNSAFE=1</script>');
    await page.locator('#rfq-consent').check();
    await page.locator('#create-plan').click();
    await page.locator('#rfq-dialog').waitFor({ state: 'hidden' });
    await page.locator('#plans .record').waitFor();
    assert.equal(await page.evaluate(() => window.UNSAFE), undefined);
    const planDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'تنزيل مسودة الطلب' }).click();
    const planDownload = await planDownloadPromise;
    const plan = JSON.parse(fs.readFileSync(await planDownload.path(), 'utf8'));
    assert.equal(plan.sentToSupplier, false); assert.equal(plan.execution.performed, false);
    await page.locator('.topbar nav a[href="#/operations"]').click();
    for (const transport of ['sdk', 'mcp']) {
      await page.locator(`[data-transport="${transport}"]`).click();
      for (const operation of ['foundry', 'natural', 'sensory']) {
        await page.locator(`[data-operation="${operation}"]`).click();
        await page.waitForFunction(() => !document.getElementById('run').disabled);
        await page.locator('#run').click();
        await page.waitForFunction(() => document.getElementById('run-state').textContent === 'اكتمل الاستدعاء المحلي');
        assert.equal(await page.locator('#result').isVisible(), true);
        const response = JSON.parse(await page.locator('#result-json').textContent());
        assert.equal(response.transport, transport); assert.equal(response.operation, operation);
        assert.equal(response.result.boundaries.physicalCommandSent, false);
      }
    }
    assert.equal(await page.locator('#history .record').count(), 6);
    await page.screenshot({ path: path.join(output, `operations-result-${viewport.width}.png`), fullPage: true });
    await page.locator('#arguments').fill('{broken'); await page.locator('#run').click();
    assert.ok((await page.locator('#run-state').textContent()).includes('JSON غير صالح'));
    assert.equal(await page.locator('#result').isVisible(), false);
    await page.locator('#import-json').setInputFiles({ name: 'invalid-scope.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ token: 'denied' })) });
    await page.waitForFunction(() => document.getElementById('input-origin').textContent === 'ملف مستخدم غير متحقق');
    await page.locator('#run').click();
    await page.waitForFunction(() => document.getElementById('run-state').classList.contains('error'));
    assert.equal(await page.locator('#result').isVisible(), false);
    await page.locator('#clear-history').click(); assert.equal(await page.locator('#history .record').count(), 0);
    await page.goto(base + '/workspace/#catalog');
    assert.equal(await page.locator('[data-page="market"]').isVisible(), true);
    await page.reload(); await page.locator('.topbar nav a[href="#/market"]').click(); assert.equal(await page.locator('#plans .record').count(), 0);
    await context.close();
  }
  assert.deepEqual(errors, []); assert.deepEqual(outside, []);
  fs.writeFileSync(path.join(output, 'browser-verification.json'), JSON.stringify({ checkedAt: new Date().toISOString(), results, errors, outside, passed: true }, null, 2));
});
