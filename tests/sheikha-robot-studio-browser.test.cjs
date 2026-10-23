'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { once } = require('node:events');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/tmp/sheikha-architecture-tools/node_modules/playwright');
const { createWorkspaceServer } = require('../tools/preview/sheikha-workspace-preview.cjs');
const output = path.join(__dirname, '../runtime/workspace-verification');
async function pixels(page) { return page.locator('#robot-canvas').evaluate(canvas => { const temp = document.createElement('canvas'); temp.width = 160; temp.height = 100; const ctx = temp.getContext('2d'); ctx.drawImage(canvas, 0, 0, 160, 100); return Array.from(ctx.getImageData(0, 0, 160, 100).data); }); }
const delta = (a, b) => a.reduce((sum, value, i) => sum + Math.abs(value - b[i]), 0) / a.length;

test('robot studio renders four moving models on desktop/mobile and produces a verified local MP4', { timeout: 240000 }, async t => {
  const storage = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-robot-browser-'));
  const server = createWorkspaceServer({ studio: { storage } }); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ executablePath: '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  t.after(async () => { await browser.close(); await new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }); fs.rmSync(storage, { recursive: true, force: true }); });
  fs.mkdirSync(output, { recursive: true }); const errors = [], outside = [], results = [];
  for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, acceptDownloads: true }), page = await context.newPage(); page.setDefaultTimeout(15000);
    page.on('pageerror', e => errors.push(e.message)); page.on('request', req => { if (!req.url().startsWith(base) && !req.url().startsWith('blob:')) outside.push(req.url()); });
    await page.goto(base + '/workspace/robot-studio.html');
    await page.waitForFunction(() => document.getElementById('design-status').textContent.includes('قيد المراجعة'));
    assert.equal(await page.locator('#scene-error').isVisible(), false);
    for (const family of ['mobile', 'arm', 'reception', 'digital']) {
      await page.locator('#robot-family').selectOption(family);
      await page.waitForFunction(() => !document.getElementById('robot-export').disabled);
      const before = await pixels(page);
      const colored = before.filter((v, i) => i % 4 !== 3 && v < 150).length;
      assert.ok(colored > 200, `${family}: robot geometry visible`);
      await page.locator('#robot-play').click(); await page.waitForTimeout(900); await page.locator('#robot-stop').click();
      const after = await pixels(page); assert.ok(delta(before, after) > 0.1, `${family}: moving pixels`);
      assert.equal(await page.locator('#robot-play').isDisabled(), true);
      await page.waitForTimeout(150); assert.ok(delta(after, await pixels(page)) < 0.05, `${family}: stop holds pose`);
      await page.locator('#robot-reset').click();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${family}: no horizontal overflow`);
      assert.deepEqual(await page.locator('button:visible').evaluateAll(buttons => buttons.filter(b => b.scrollWidth > b.clientWidth + 1).map(b => b.textContent)), []);
      await page.locator('#robot-canvas').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(output, `robot-${family}-${viewport.width}.png`), fullPage: true });
      results.push({ family, viewport, coloredSamples: colored, frameDelta: delta(before, after) });
    }
    await page.locator('#robot-family').selectOption('arm'); await page.waitForFunction(() => !document.getElementById('robot-export').disabled);
    assert.deepEqual(await page.locator('#robot-tool option').evaluateAll(options => options.map(o => o.value)), ['gripper', 'camera']);
    const downloadPromise = page.waitForEvent('download'); await page.locator('#robot-export').click();
    const design = JSON.parse(fs.readFileSync(await (await downloadPromise).path(), 'utf8'));
    assert.equal(design.controller.firmware, 'NOT_IMPLEMENTED');
    await page.locator('#tab-producers').click();
    const receipt = { schema: 'SHEIKHA_PRODUCER_RECEIPT_V1', designId: design.id, producer: 'test-fixture', reference: 'offline-test', artifactSha256: 'a'.repeat(64) };
    await page.locator('#producer-receipt').setInputFiles({ name: 'receipt.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(receipt)) });
    await page.locator('#receipt-result').waitFor({ state: 'visible' });
    assert.equal(JSON.parse(await page.locator('#receipt-result').textContent()).artifactHashVerified, false);
    if (viewport.width === 1440) {
      await page.locator('#render-video').click();
      await page.waitForFunction(() => document.getElementById('render-status').textContent === 'جاهز للمراجعة', undefined, { timeout: 180000 });
      const jobs = (await (await page.request.get(base + '/api/sheikha/workspace/v1/studio')).json()).jobs;
      assert.equal(jobs.length, 1); const job = jobs[0]; assert.equal(job.evidence.fullDecode, 'PASS'); assert.equal(job.evidence.frames, 96);
      await page.getByRole('button', { name: 'معاينة', exact: true }).click();
      await page.waitForFunction(() => document.getElementById('job-player').readyState >= 2);
      assert.equal(await page.locator('#job-player').evaluate(v => v.duration), 4);
      const bytes = fs.readFileSync(path.join(storage, job.id, 'video.mp4'));
      assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), job.evidence.sha256);
      fs.writeFileSync(path.join(output, 'robot-render-test-evidence.json'), JSON.stringify(job.evidence, null, 2));
    }
    await context.close();
  }
  assert.deepEqual(errors, []); assert.deepEqual(outside, []);
  fs.writeFileSync(path.join(output, 'robot-studio-browser-verification.json'), JSON.stringify({ checkedAt: new Date().toISOString(), results, errors, outside, passed: true }, null, 2));
});
