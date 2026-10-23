'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { sha256 } = require('../core/cloud-fabric/sheikha-product-registry-v1.cjs');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'runtime/cloud-products');
const latest = JSON.parse(fs.readFileSync(path.join(output, 'latest.json')));
const snapshot = path.join(output, latest.snapshot);
const registry = JSON.parse(fs.readFileSync(path.join(snapshot, 'registry.json')));
const url = pathToFileURL(path.join(output, 'index.html')).href;
const launch = () => chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });

test('offline console supports scope review, selection, export, dialogs and responsive views', async () => {
  const browser = await launch();
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
    const page = await context.newPage(), errors = [], external = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', request => { if (/^https?:/.test(request.url())) external.push(request.url()); });
    await context.route(/^https?:/, route => route.abort());
    await page.goto(url); await page.locator('#rows tr').first().waitFor();
    assert.equal(await page.locator('#rows tr').count(), 129);
    assert.equal(await page.locator('#category option').count(), 19);
    await page.locator('#category').selectOption('analytics'); assert.equal(await page.locator('#rows tr').count(), 18);
    await page.locator('#clear').click(); await page.locator('#lifecycle').selectOption('LOCAL_CANDIDATE_NOT_ACCEPTED');
    assert.equal(await page.locator('#rows tr').count(), 6);
    await page.locator('#clear').click(); await page.locator('#search').fill('BigQuery'); assert.equal(await page.locator('#rows tr').count(), 1);
    await page.locator('#rows button').click(); assert.equal(await page.locator('#details').evaluate(dialog => dialog.open), true);
    assert.match(await page.locator('#detail-body').innerText(), /لم يُنفذ/); await page.keyboard.press('Escape');
    assert.equal(await page.locator('#details').evaluate(dialog => dialog.open), false);
    await page.locator('#rows input').uncheck(); await page.reload(); await page.locator('#search').fill('BigQuery');
    assert.equal(await page.locator('#rows input').isChecked(), false);
    await page.locator('nav [data-view="pilot"]').click(); assert.equal(await page.locator('#selected-products li').count(), 5);
    const downloadPlan = page.waitForEvent('download'); await page.locator('#export-pilot').click();
    const plan = JSON.parse(fs.readFileSync(await (await downloadPlan).path()));
    assert.equal(plan.selectedProducts.length, 5);
    for (const flag of ['budgetApproved', 'executionAuthorized', 'publicationApproved', 'partnershipEstablished']) assert.equal(plan[flag], false);
    await page.locator('nav [data-view="catalog"]').click(); await page.locator('#rows input').check();
    await page.locator('#search').fill('no-such-product-123'); assert.equal(await page.locator('#empty').isVisible(), true); assert.equal(await page.locator('#rows tr').count(), 0);
    await page.locator('#clear').click();
    const downloadCatalog = page.waitForEvent('download'); await page.locator('#export-catalog').click();
    const catalog = JSON.parse(fs.readFileSync(await (await downloadCatalog).path())); assert.equal(catalog.products.length, 129); assert.equal(catalog.effects.publicationApproved, false);
    await page.locator('nav [data-view="connection"]').click(); assert.match(await page.locator('#connection-facts').innerText(), /تفويض القراءة غير مهيأ/);
    assert.equal(await page.locator('#bindings li').count(), 8);
    await page.locator('nav [data-view="partnership"]').click(); assert.equal(await page.locator('#sources a').count(), 4);
    assert.match(await page.locator('#partnership').innerText(), /غير مرسل/);
    await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
    const screenshots = '/tmp/sheikha-product-console-screenshots'; fs.mkdirSync(screenshots, { recursive: true });
    for (const width of [1440, 820, 390, 320]) {
      await page.setViewportSize({ width, height: width === 320 ? 640 : 960 });
      for (const view of ['catalog', 'pilot', 'connection', 'partnership']) {
        await page.locator(`nav [data-view="${view}"]`).click();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${view}: overflow at ${width}`);
        assert.equal(await page.evaluate(() => scrollY), 0);
        if (view === 'catalog' || view === 'connection') await page.screenshot({ path: `${screenshots}/${view}-${width}.png` });
      }
      await page.locator('nav [data-view="catalog"]').click(); await page.locator('#search').fill('Cloud Storage');
      await page.locator('#rows button').click();
      const bounds = await page.locator('#details').boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width + 1);
      assert.ok(await page.locator('#details').evaluate(dialog => dialog.scrollWidth <= dialog.clientWidth + 1));
      if (width === 320) await page.screenshot({ path: `${screenshots}/details-320.png` });
      await page.locator('#close-details').click(); await page.locator('#clear').click();
    }
    assert.deepEqual(errors, []); assert.deepEqual(external, []);
    const build = JSON.parse(fs.readFileSync(path.join(snapshot, 'build.json')));
    for (const [file, digest] of Object.entries(build.artifacts)) assert.equal(sha256(fs.readFileSync(path.join(snapshot, file))), digest);
    fs.writeFileSync(path.join(output, 'browser-verification.json'), JSON.stringify({
      status: 'PASS_OFFLINE_REVIEW_NOT_PRODUCT_ACCEPTANCE', checkedAt: new Date().toISOString(), snapshot: latest.snapshot,
      htmlSha256: build.artifacts['index.html'], viewports: [1440, 820, 390, 320], views: 4, externalRequests: external.length,
      browserErrors: errors, productAcceptanceVerified: false, liveGoogleConnectionTested: false
    }, null, 2) + '\n', { mode: 0o600 });
    await context.close();
  } finally { await browser.close(); }
});

test('blocked or corrupted local storage never grants execution authority or loses export access', async () => {
  const browser = await launch();
  try {
    const context = await browser.newContext({ acceptDownloads: true });
    await context.addInitScript(() => {
      Object.defineProperty(Storage.prototype, 'getItem', { value() { throw new Error('blocked'); } });
      Object.defineProperty(Storage.prototype, 'setItem', { value() { throw new Error('blocked'); } });
    });
    const page = await context.newPage(); await page.goto(url); await page.locator('#rows tr').first().waitFor();
    assert.match(await page.locator('#notice').innerText(), /تعذر تحميل/);
    await page.locator('#rows input').first().uncheck(); assert.match(await page.locator('#notice').innerText(), /تعذر الحفظ/);
    await page.locator('nav [data-view="pilot"]').click(); assert.equal(await page.locator('#export-pilot').isEnabled(), true);
    const downloaded = page.waitForEvent('download'); await page.locator('#export-pilot').click();
    const plan = JSON.parse(fs.readFileSync(await (await downloaded).path())); assert.equal(plan.executionAuthorized, false); assert.equal(plan.selectedProducts.length, 5);
    await context.close();
    const fresh = await browser.newContext(); const clean = await fresh.newPage(); await clean.goto(url); await clean.locator('#rows tr').first().waitFor();
    await clean.evaluate(({ key }) => localStorage.setItem(key, JSON.stringify(['unknown-product', '<script>window.injected=1</script>'])), { key: `sheikha-cloud-pilot-v1:${registry.scopeSha256}` });
    await clean.reload(); assert.match(await clean.locator('#notice').innerText(), /تعذر تحميل/); assert.equal(await clean.evaluate(() => window.injected), undefined);
    await clean.locator('nav [data-view="pilot"]').click(); assert.equal(await clean.locator('#selected-products li').count(), 6);
    await fresh.close();
  } finally { await browser.close(); }
});
