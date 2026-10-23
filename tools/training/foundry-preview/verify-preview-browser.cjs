'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { privatePath, readPrivate } = require('../../partnerships/evaluate-shared-goals-v1');

async function main() {
  const sessionFile = privatePath(process.argv[2]);
  const session = JSON.parse(readPrivate(sessionFile));
  assert.match(session.url, /^http:\/\/127\.0\.0\.1:\d+\/#[a-f0-9]{64}$/);
  const base = new URL(session.url).origin;
  const output = privatePath(path.join(path.dirname(sessionFile), `browser-verification-${Date.now()}`));
  fs.mkdirSync(output, { mode: 0o700 });
  const { chromium } = require(process.env.SHEIKHA_PLAYWRIGHT_MODULE || 'playwright');
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true,
    args: ['--no-sandbox', '--disable-background-networking', '--disable-component-update', '--disable-default-apps'] });
  const evidence = [];
  try {
    for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844], ['compact', 320, 760]]) {
      const context = await browser.newContext({ viewport: { width, height }, acceptDownloads: true, serviceWorkers: 'block' });
      const unexpected = [];
      await context.route('**/*', (route) => {
        if (!route.request().url().startsWith(base + '/')) { unexpected.push(new URL(route.request().url()).origin); return route.abort(); }
        return route.continue();
      });
      const page = await context.newPage(); const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(session.url); await page.waitForSelector('#workspace', { state: 'visible' });
      assert.equal(await page.locator('.model').count(), 3);
      assert.equal(await page.locator('#local-table tbody tr').count(), 3);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      const pixelCheck = await page.locator('canvas').evaluate((canvas) => {
        const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        let colored = 0;
        for (let i = 0; i < pixels.length; i += 4) if (pixels[i] < 180 || pixels[i + 1] < 180 || pixels[i + 2] < 180) colored++;
        return { width: canvas.width, height: canvas.height, colored };
      });
      assert.ok(pixelCheck.colored > 2000);
      await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true });
      await page.locator('[data-tab="bench"]').click();
      assert.equal(await page.locator('#bench-table tbody tr').count(), 13);
      await page.locator('#category').selectOption('Vision');
      assert.equal(await page.locator('#bench-table tbody tr').count(), 5);
      await page.locator('[data-tab="commerce"]').click();
      assert.equal(await page.locator('#sale-gates > div').count(), 7);
      await page.locator('[data-tab="manual"]').click();
      assert.equal(await page.locator('.architecture > div').count(), 4);
      await page.locator('[data-tab="models"]').click();
      if (name === 'desktop') {
        const jsonDownload = page.waitForEvent('download'); await page.locator('#json').click();
        const jsonFile = await (await jsonDownload).path();
        const exported = JSON.parse(fs.readFileSync(jsonFile));
        assert.equal(exported.models.length, 3); assert.equal(exported.commercial.saleAllowed, false);
        assert.ok(!JSON.stringify(exported).includes('/home/'));
        const pngDownload = page.waitForEvent('download'); await page.locator('#png').click();
        await (await pngDownload).saveAs(path.join(output, 'chart.png'));
        const videoDownload = page.waitForEvent('download', { timeout: 20000 }); await page.locator('#video').click();
        const video = await videoDownload; const videoFile = path.join(output, 'measurements.webm'); await video.saveAs(videoFile);
        assert.ok(fs.statSync(videoFile).size > 2000);
        const videoMetadata = await page.evaluate(async (encoded) => {
          const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
          const url = URL.createObjectURL(new Blob([bytes], { type: 'video/webm' }));
          const video = document.createElement('video'); video.src = url;
          await new Promise((resolve, reject) => { video.onloadedmetadata = resolve; video.onerror = reject; });
          const result = { width: video.videoWidth, height: video.videoHeight };
          URL.revokeObjectURL(url); return result;
        }, fs.readFileSync(videoFile).toString('base64'));
        assert.equal(videoMetadata.width, 1280); assert.equal(videoMetadata.height, 440);
      }
      assert.deepEqual(errors, []); assert.deepEqual(unexpected, []);
      evidence.push({ name, width, height, pixelCheck, javascriptErrors: 0, unexpectedRequests: 0, tabsVerified: 4 });
      await context.close();
    }
    const anonymous = await browser.newContext(); const page = await anonymous.newPage();
    await page.goto(base); assert.equal(await page.locator('#access').isVisible(), true);
    assert.equal(await page.evaluate(async () => (await fetch('/api/overview')).status), 401);
    await anonymous.close();
  } finally { await browser.close(); }
  for (const file of fs.readdirSync(output)) fs.chmodSync(path.join(output, file), 0o600);
  const report = { status: 'BROWSER_VERIFIED', evidence, pngExportVerified: true,
    webmExportAndMetadataVerified: true, publicReleaseApproved: false };
  fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(report, null, 2), { mode: 0o600, flag: 'wx' });
  console.log(JSON.stringify({ ...report, directory: output }));
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
