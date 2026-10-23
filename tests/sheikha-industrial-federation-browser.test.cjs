'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { once } = require('node:events');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/tmp/sheikha-architecture-tools/node_modules/playwright');
const { createWorkspaceServer } = require('../tools/preview/sheikha-workspace-preview.cjs');
const output = path.join(__dirname, '../runtime/industrial-federation-verification');

test('federation controls, cultivation, latches, stale-state recovery and export work on desktop and mobile', { timeout: 90000 }, async t => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/google/chrome/chrome',
    headless: true, args: ['--no-sandbox'] });
  t.after(() => browser.close());
  fs.mkdirSync(output, { recursive: true });
  const errors = [], outside = [];
  for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
    const server = createWorkspaceServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}`;
    const context = await browser.newContext({ viewport, acceptDownloads: true });
    try {
      const page = await context.newPage(); page.setDefaultTimeout(10000);
      page.on('pageerror', e => errors.push(e.message));
      page.on('request', req => { if (!req.url().startsWith(base) && !req.url().startsWith('blob:')) outside.push(req.url()); });
      await page.goto(base + '/workspace/industry.html');
      await page.getByRole('link', { name: 'تشغيل التجمع الصناعي الرقمي' }).click();
      await page.waitForFunction(() => !document.getElementById('federation-create').disabled);
      assert.equal(await page.locator('#federation-sector option[value="space"]').count(), 0);
      await page.locator('#federation-sector').selectOption('food');
      await page.locator('#federation-name').fill('تجمع شيخة <script>window.UNSAFE=1</script>');
      await page.locator('#federation-create').click();
      await page.locator('#federation-run').waitFor({ state: 'visible' });
      assert.equal(await page.evaluate(() => window.UNSAFE), undefined);
      await page.locator('#federation-discard').click();
      await page.locator('#federation-run').waitFor({ state: 'hidden' });
      await page.locator('#federation-name').fill('تجمع شيخة للفوندريات والمزارع الصناعية');
      await page.locator('#federation-create').click();
      await page.locator('#federation-run').waitFor({ state: 'visible' });
      assert.match(page.url(), /\?run=[a-f0-9-]{36}$/);
      assert.equal(await page.locator('.federation-cluster').count(), 2);
      assert.equal(await page.locator('#federation-create').isDisabled(), true);
      const action = async name => {
        const before = JSON.parse(await page.locator('#federation-json').textContent()).revision;
        await page.locator(`[data-federation-action="${name}"]`).click();
        await page.waitForFunction(rev => JSON.parse(document.getElementById('federation-json').textContent).revision > rev, before);
      };
      await action('start');
      if (viewport.width === 1440) {
        await page.locator('#federation-auto').check();
        await page.waitForFunction(() => JSON.parse(document.getElementById('federation-json').textContent).tick === 5);
        await page.locator('#federation-auto').uncheck();
      } else await action('step');
      await action('pause');
      assert.equal(await page.locator('[data-federation-action="step"]').isDisabled(), true);
      await page.reload();
      await page.waitForFunction(() => !document.querySelector('[data-federation-action="resume"]').disabled);
      assert.equal(await page.locator('#federation-sector').inputValue(), 'food');
      assert.equal(await page.locator('#federation-auto').isChecked(), false);
      await action('resume');
      await page.locator('#federation-fault-node').selectOption('c1-p1');
      await page.locator('#federation-fault').click();
      await page.waitForFunction(() => document.querySelector('[data-node="c1-p1"] [data-state="FAULT_LATCHED"]'));
      await action('step');
      assert.equal(await page.locator('[data-node="c1-p1"] progress').getAttribute('value'), '62');
      assert.equal(await page.locator('[data-node="c2-p1"] progress').getAttribute('value'), '100');
      await action('stop');
      assert.equal(await page.locator('[data-federation-action="resume"]').isDisabled(), true);
      assert.equal(await page.locator('[data-federation-action="step"]').isDisabled(), true);
      await action('reset'); await action('start');
      for (let i = 0; i < 6; i++) await action('step');
      const completed = JSON.parse(await page.locator('#federation-json').textContent());
      assert.equal(completed.state, 'COMPLETE'); assert.equal(completed.artifacts.length, 18);
      assert.equal(completed.clusters[0].farms[0].realReadiness.harvest.ready, false);
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#federation-export').click();
      const download = await downloadPromise;
      assert.deepEqual(JSON.parse(fs.readFileSync(await download.path(), 'utf8')), completed);
      await page.evaluate(async () => { await Promise.all([...document.images].filter(img => img.getClientRects().length).map(img => img.decode())); });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow at ${viewport.width}`);
      assert.deepEqual(await page.locator('button:visible').evaluateAll(items => items.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent)), []);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: path.join(output, `federation-${viewport.width}.png`), fullPage: true });
      await page.screenshot({ path: path.join(output, `viewport-${viewport.width}.png`) });
      await page.locator('.federation-cluster').first().screenshot({ path: path.join(output, `cluster-${viewport.width}.png`) });
      await page.route('**/actions', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
      await page.locator('[data-federation-action="reset"]').click();
      await page.waitForFunction(() => document.getElementById('federation-message').classList.contains('error'));
      assert.equal(await page.locator('#federation-export').isDisabled(), true);
      assert.equal(await page.locator('[data-federation-action="reset"]').isDisabled(), true);
      await page.unroute('**/actions'); await page.locator('#federation-refresh').click();
      await page.waitForFunction(() => !document.getElementById('federation-export').disabled);
      await page.locator('#federation-discard').click();
      await page.locator('#federation-run').waitFor({ state: 'hidden' });
      assert.equal(await page.locator('#federation-create').isEnabled(), true);
      assert.equal(page.url().includes('?run='), false);
    } finally {
      await context.close(); await new Promise(resolve => { server.closeAllConnections(); server.close(resolve); });
    }
  }
  assert.deepEqual(errors, []); assert.deepEqual(outside, []);
  fs.writeFileSync(path.join(output, 'browser-verification.json'), JSON.stringify({
    checkedAt: new Date().toISOString(), widths: [1440, 390, 320], errors, outside, passed: true
  }, null, 2));
});
