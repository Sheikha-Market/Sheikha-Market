'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { componentSource, componentStyles } = require('../core/foundry/sheikha-visual-foundry-templates.cjs');
const storage = path.resolve(__dirname, '../runtime/visual-foundry');

test('real archived visuals, videos and review interface work without external requests', { timeout: 90000 }, async () => {
  const latest = JSON.parse(fs.readFileSync(path.join(storage, 'latest.json')));
  const catalog = JSON.parse(fs.readFileSync(path.join(storage, 'catalog.json')));
  const generated = JSON.parse(fs.readFileSync(path.join(storage, 'generated.json')));
  const browser = await chromium.launch({ executablePath: '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
  const screenshots = '/tmp/sheikha-visual-foundry-screenshots'; fs.mkdirSync(screenshots, { recursive: true });
  const errors = []; const external = [];
  try {
    const context = await browser.newContext();
    await context.route('**/*', route => {
      const url = route.request().url();
      if (/^https?:/.test(url)) { external.push(url); return route.abort(); }
      return route.continue();
    });
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.join(storage, 'index.html')).href);
    await page.waitForURL(pathToFileURL(path.join(latest.directory, 'index.html')).href);
    assert.equal(await page.locator('.asset').count(), catalog.assets.length + generated.length);
    await page.locator('img').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
    await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
    for (const width of [1440, 820, 390, 320]) {
      await page.setViewportSize({ width, height: 950 });
      await page.screenshot({ path: path.join(screenshots, `review-${width}.png`) });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `horizontal overflow at ${width}`);
      assert.deepEqual(await page.locator('h1,h3,button,input').evaluateAll(elements => elements.filter(el => el.getClientRects().length && el.scrollWidth > el.clientWidth + 2).map(el => el.textContent)), []);
    }
    await page.locator('[data-filter="video"]').click();
    assert.equal(await page.locator('.asset:visible').count(), 2);
    const videos = await page.locator('video').evaluateAll(async elements => Promise.all(elements.map(video => new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(Error('VIDEO_METADATA_TIMEOUT')), 10000);
      video.onloadedmetadata = () => { clearTimeout(timeout); resolve({ duration: video.duration, width: video.videoWidth, height: video.videoHeight, autoplay: video.autoplay }); };
      video.onerror = () => { clearTimeout(timeout); reject(Error('VIDEO_DECODE_FAILED')); };
      video.preload = 'metadata'; video.load();
    }))));
    for (const video of videos) { assert.ok(video.duration > 0 && video.width > 0 && video.height > 0); assert.equal(video.autoplay, false); }
    await page.locator('video').first().evaluate(video => { video.currentTime = Math.min(2, video.duration / 2); });
    await page.waitForFunction(() => !document.querySelector('video').seeking && document.querySelector('video').readyState >= 2);
    await page.locator('video').first().screenshot({ path: path.join(screenshots, 'cinematic-frame.png') });
    await page.locator('[data-filter="all"]').click();
    await page.locator('#search').fill('SHEIKHA_CINEMATIC');
    assert.equal(await page.locator('.asset:visible').count(), 1);
    await page.locator('#search').fill('no_matching_asset_123'); assert.equal(await page.locator('#count').textContent(), '0');
    await page.locator('#search').fill('');
    await page.locator('[data-filter="document"]').focus(); await page.keyboard.press('Space');
    assert.equal(await page.locator('.asset:visible').count(), 1);
    assert.equal(await page.locator('iframe,object,embed').count(), 0);

    // Test the packaged module independently; the review page's CSP remains enabled above.
    const componentContext = await browser.newContext({ bypassCSP: true });
    const componentPage = await componentContext.newPage();
    await componentPage.goto(pathToFileURL(path.join(latest.directory, 'index.html')).href);
    const moduleResult = await componentPage.evaluate(async ({ source, styles, asset }) => {
      const { mountSheikhaVisual } = await import('data:text/javascript;base64,' + btoa(unescape(encodeURIComponent(source))));
      const style = document.createElement('style'); style.textContent = styles; document.head.append(style);
      const host = document.createElement('section'); document.body.replaceChildren(host);
      mountSheikhaVisual(host, { ...asset, caption: '<script>unsafe caption</script>' });
      await host.querySelector('img').decode();
      let rejected = false;
      try { mountSheikhaVisual(host, { object: 'https://example.com/tracker.png' }); } catch { rejected = true; }
      return { imageWidth: host.querySelector('img').naturalWidth, scripts: host.querySelectorAll('script').length, caption: host.querySelector('figcaption').textContent, rejected };
    }, { source: componentSource, styles: componentStyles, asset: generated[0] });
    assert.ok(moduleResult.imageWidth > 0); assert.equal(moduleResult.scripts, 0); assert.equal(moduleResult.rejected, true);
    assert.equal(moduleResult.caption, '<script>unsafe caption</script>');
    await componentPage.setViewportSize({ width: 390, height: 850 });
    await componentPage.screenshot({ path: path.join(screenshots, 'component-mobile.png') });
    assert.deepEqual(errors, []); assert.deepEqual(external, []);
    const evidence = { checkedAt: new Date().toISOString(), run: latest.id, result: 'PASS', widths: [1440, 820, 390, 320], archivedImagesLoaded: catalog.assets.filter(asset => asset.kind === 'image').length, generatedImagesLoaded: generated.length, videos, externalRequests: external.length, publicationApproval: false };
    fs.mkdirSync(path.join(storage, 'verification'), { recursive: true, mode: 0o700 });
    fs.writeFileSync(path.join(storage, 'verification', `browser-${latest.id}.json`), JSON.stringify(evidence, null, 2) + '\n', { mode: 0o600 });
    console.log(JSON.stringify(evidence));
  } finally { await browser.close(); }
});
