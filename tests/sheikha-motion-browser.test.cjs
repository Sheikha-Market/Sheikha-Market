'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { once } = require('node:events');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/tmp/sheikha-architecture-tools/node_modules/playwright');
const { createWorkspaceServer } = require('../tools/preview/sheikha-workspace-preview.cjs');
const output = path.join(__dirname, '../runtime/workspace-verification');

async function frame(page, seconds) {
  return page.evaluate(async time => {
    const v = document.getElementById('motion-player'); v.pause();
    if (Math.abs(v.currentTime - time) > 0.001) {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(Error('SEEK_TIMEOUT')), 8000);
        v.addEventListener('seeked', () => { clearTimeout(timer); resolve(); }, { once: true });
        v.currentTime = time;
      });
    }
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const c = document.createElement('canvas'); c.width = 160; c.height = 90;
    const ctx = c.getContext('2d'); ctx.drawImage(v, 0, 0, c.width, c.height);
    return Array.from(ctx.getImageData(0, 0, c.width, c.height).data);
  }, seconds);
}
const brightness = values => {
  const rgb = values.filter((_, i) => i % 4 !== 3);
  const mean = rgb.reduce((a, n) => a + n, 0) / rgb.length;
  return { mean, variance: rgb.reduce((a, n) => a + (n - mean) ** 2, 0) / rgb.length };
};
const difference = (a, b) => a.reduce((sum, n, i) => sum + (i % 4 === 3 ? 0 : Math.abs(n - b[i])), 0) / (a.length * 0.75);

test('motion review plays, seeks, downloads and remains nonblank on desktop/mobile', { timeout: 120000 }, async t => {
  const server = createWorkspaceServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
  t.after(async () => { await browser.close(); await new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }); });
  fs.mkdirSync(output, { recursive: true });
  const errors = [], outside = [], results = [];
  for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, acceptDownloads: true });
    const page = await context.newPage(); page.setDefaultTimeout(12000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (!request.url().startsWith(base)) outside.push(request.url()); });
    await page.goto(base + '/workspace/#/motion');
    await page.waitForFunction(() => document.getElementById('motion-player').readyState >= 2);
    assert.equal(await page.locator('#motion-player').evaluate(v => v.paused), true);
    assert.equal(await page.locator('#motion-player').getAttribute('autoplay'), null);
    for (const clip of [{ id: 'unified', duration: 33, width: 1280 }, { id: 'cinematic', duration: 24, width: 1920 }, { id: 'wave', duration: 10, width: 1280 }]) {
      await page.locator(`[data-clip="${clip.id}"]`).click();
      await page.waitForFunction(duration => {
        const v = document.getElementById('motion-player'); return v.readyState >= 2 && Math.abs(v.duration - duration) < 0.1;
      }, clip.duration);
      assert.equal(await page.locator('#motion-player').evaluate(v => v.videoWidth), clip.width);
      const first = await frame(page, 2), second = await frame(page, 6);
      const pixels = brightness(first), movement = difference(first, second);
      assert.ok(pixels.mean > 5 && pixels.variance > 100, `${clip.id}: nonblank canvas`);
      assert.ok(movement > 0.1, `${clip.id}: real moving pixels (${movement})`);
      await page.locator('#motion-player').evaluate(async v => { v.muted = true; await v.play(); });
      await page.waitForFunction(() => document.getElementById('motion-player').currentTime > 6.3);
      await page.locator('#motion-player').evaluate(v => v.pause());
      await page.locator('#motion-speed').selectOption('1.5');
      await page.locator('#motion-loop').check();
      assert.equal(await page.locator('#motion-player').evaluate(v => v.playbackRate), 1.5);
      assert.equal(await page.locator('#motion-player').evaluate(v => v.loop), true);
      await page.locator('#motion-loop').uncheck(); await page.locator('#motion-speed').selectOption('1');
      await frame(page, 2);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${viewport.width}`);
      assert.deepEqual(await page.locator('button:visible').evaluateAll(buttons => buttons.filter(b => b.scrollWidth > b.clientWidth + 1).map(b => b.textContent)), []);
      const screenshot = `motion-${clip.id}-${viewport.width}.png`;
      await page.screenshot({ path: path.join(output, screenshot), fullPage: true });
      results.push({ clip: clip.id, viewport, screenshot, pixels, meanPixelChange: movement, playback: true });
    }
    await page.locator('[data-clip="unified"]').click();
    await page.waitForFunction(() => document.getElementById('motion-player').duration === 33);
    await page.locator('[data-seek="24"]').click();
    await page.waitForFunction(() => Math.abs(document.getElementById('motion-player').currentTime - 24) < 0.1);
    const chapter = await frame(page, 25);
    assert.ok(brightness(chapter).variance > 100);
    await page.locator('#motion-player').evaluate(async v => { await v.play(); });
    await page.locator('.topbar nav a[href="#/sheikha"]').click();
    await page.waitForFunction(() => document.getElementById('motion-player').paused);
    await page.locator('.topbar nav a[href="#/motion"]').click();
    assert.equal(await page.locator('#motion-player').evaluate(v => v.paused), true);
    const pending = page.waitForEvent('download'); await page.locator('#motion-download').click();
    const download = await pending;
    assert.equal(download.suggestedFilename(), 'SHEIKHA_UNIFIED_MOTION_REVIEW_01.mp4');
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(await download.path())).digest('hex'), '74366be3405116b7cc45da8c5add4b804274bf70c40f7e70b8e0a551b4f0ba1d');
    await page.locator('.motion-evidence summary').click();
    await page.locator('.motion-contact-grid img').evaluateAll(async images => {
      for (const img of images) img.loading = 'eager';
      await Promise.all(images.map(img => img.decode()));
    });
    await context.close();
  }
  const context = await browser.newContext(); const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!request.url().startsWith(base)) outside.push(request.url()); });
  await page.route('**/media/review-v1/manifest.json', route => route.fulfill({ status: 503, body: '{}' }));
  await page.goto(base + '/workspace/#/motion');
  await page.locator('#motion-error').waitFor({ state: 'visible' });
  assert.equal(await page.locator('[data-clip="unified"]').isDisabled(), true);
  await page.unroute('**/media/review-v1/manifest.json'); await page.locator('#motion-retry').click();
  await page.waitForFunction(() => document.getElementById('motion-player').readyState >= 2);
  await page.route('**/wave.mp4', route => route.abort('failed'));
  await page.locator('[data-clip="wave"]').click();
  await page.waitForFunction(() => document.getElementById('motion-status').classList.contains('error'));
  await page.unroute('**/wave.mp4'); await page.locator('[data-clip="wave"]').click();
  await page.waitForFunction(() => document.getElementById('motion-player').readyState >= 2 && document.getElementById('motion-player').duration === 10);
  const tampered = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/workspace/media/review-v1/manifest.json'), 'utf8'));
  tampered.clips[0].file = 'https://example.invalid/untrusted.mp4';
  await page.route('**/media/review-v1/manifest.json', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify(tampered) }));
  await page.reload();
  await page.locator('#motion-error').waitFor({ state: 'visible' });
  assert.equal(await page.locator('[data-clip="unified"]').isDisabled(), true);
  assert.equal(await page.locator('#motion-player').getAttribute('src'), null);
  await context.close();
  assert.deepEqual(errors, []); assert.deepEqual(outside, []);
  fs.writeFileSync(path.join(output, 'motion-browser-verification.json'), JSON.stringify({ checkedAt: new Date().toISOString(), results, errors, outside, passed: true }, null, 2));
});
