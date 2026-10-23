'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { once } = require('node:events');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/tmp/sheikha-architecture-tools/node_modules/playwright');
const { createWorkspaceServer } = require('../tools/preview/sheikha-workspace-preview.cjs');
const output = path.join(__dirname, '../runtime/industrial-federation-verification');

test('archive survives restart with review and export but no live run, on desktop and narrow mobile', { timeout: 90000 }, async t => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/google/chrome/chrome',
    headless: true, args: ['--no-sandbox'] });
  t.after(() => browser.close());
  fs.mkdirSync(output, { recursive: true });
  const errors = [], outside = [];
  for (const width of [1440, 390, 320]) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-archive-browser-'));
    const context = await browser.newContext({ viewport: { width, height: 900 }, acceptDownloads: true });
    let server, base;
    const start = async (port = 0) => {
      server = createWorkspaceServer({ federation: { archive: { root } } });
      server.listen(port, '127.0.0.1'); await once(server, 'listening');
      base = `http://127.0.0.1:${server.address().port}`;
    };
    const stop = () => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); });
    try {
      await start(); const page = await context.newPage(); page.setDefaultTimeout(10000);
      page.on('pageerror', e => errors.push(e.message));
      page.on('request', req => { if (!req.url().startsWith(base) && !req.url().startsWith('blob:')) outside.push(req.url()); });
      await page.goto(base + '/workspace/industry-runtime.html');
      await page.waitForFunction(() => !document.getElementById('federation-create').disabled);
      await page.locator('#federation-name').fill('شيخة <script>window.UNSAFE=1</script>');
      await page.locator('#federation-create').click();
      await page.locator('#federation-run').waitFor({ state: 'visible' });
      const action = async name => {
        const before = JSON.parse(await page.locator('#federation-json').textContent()).revision;
        await page.locator(`[data-federation-action="${name}"]`).click();
        await page.waitForFunction(rev => JSON.parse(document.getElementById('federation-json').textContent).revision > rev, before);
      };
      await action('start'); await action('step');
      const live = JSON.parse(await page.locator('#federation-json').textContent());
      const save = async () => {
        const response = page.waitForResponse(r => r.url().endsWith('/archive') && r.request().method() === 'POST');
        await page.locator('#federation-save').click(); assert.equal((await response).status(), 200);
        await page.waitForFunction(() => !document.getElementById('federation-save').disabled);
      };
      await save();
      const saved = JSON.parse(await page.locator('#archive-json').textContent());
      assert.deepEqual(saved.snapshot, live); assert.equal(saved.policy.approvalGranted, false);
      await save(); assert.equal(await page.locator('.archive-row').count(), 1);
      assert.deepEqual(JSON.parse(await page.locator('#federation-json').textContent()), live);
      await action('pause'); await action('reset'); await save();
      assert.equal(await page.locator('.archive-row').count(), 2);
      assert.equal(await page.evaluate(() => window.UNSAFE), undefined);
      const port = server.address().port; await stop(); await start(port); await page.reload();
      await page.waitForFunction(() => !document.getElementById('federation-create').disabled && document.querySelectorAll('.archive-row').length === 2);
      assert.equal(await page.locator('#federation-run').isVisible(), false);
      assert.equal(page.url().includes('?run='), false);
      await page.locator(`[data-archive="${saved.id}"] button`).click();
      await page.locator('#archive-review').waitFor({ state: 'visible' });
      await page.waitForFunction(() => !document.getElementById('archive-export').disabled);
      assert.deepEqual(JSON.parse(await page.locator('#archive-json').textContent()), saved);
      assert.equal(await page.locator('#federation-run').isVisible(), false);
      assert.equal(await page.locator('[data-federation-action="resume"]').isDisabled(), true);
      const downloadPromise = page.waitForEvent('download'); await page.locator('#archive-export').click();
      const download = await downloadPromise;
      assert.deepEqual(JSON.parse(fs.readFileSync(await download.path(), 'utf8')), saved);
      await page.locator('#archive-review-title').scrollIntoViewIfNeeded();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow at ${width}`);
      assert.deepEqual(await page.locator('button:visible').evaluateAll(items => items.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent)), []);
      await page.screenshot({ path: path.join(output, `archive-${width}.png`) });
      await page.route(`**/industry/archives/${saved.id}`, route => route.fulfill({ status: 422, contentType: 'application/json', body: '{}' }));
      await page.locator(`[data-archive="${saved.id}"] button`).click();
      await page.waitForFunction(() => document.getElementById('archive-review').hidden);
      assert.equal(await page.locator('#archive-export').isDisabled(), true);
      assert.equal(await page.locator('#archive-json').textContent(), '');
      await page.unroute(`**/industry/archives/${saved.id}`);
      await page.locator('#archive-refresh').click();
      await page.waitForFunction(() => !document.getElementById('archive-refresh').disabled);
      assert.equal(await page.locator('.archive-row').count(), 2);
      assert.equal(await page.locator('#federation-create').isEnabled(), true);
    } finally {
      await context.close(); if (server?.listening) await stop(); fs.rmSync(root, { recursive: true, force: true });
    }
  }
  assert.deepEqual(errors, []); assert.deepEqual(outside, []);
  fs.writeFileSync(path.join(output, 'archive-browser-verification.json'), JSON.stringify({
    checkedAt: new Date().toISOString(), widths: [1440, 390, 320], errors, outside,
    restartRecovery: 'READ_ONLY_NO_REPLAY', passed: true
  }, null, 2));
});
