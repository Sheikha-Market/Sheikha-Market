'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { createPreviewServer } = require('../tools/preview/sheikha-architecture-preview.cjs');

async function pixels(page, buffer) {
  return page.evaluate(async base64 => {
    const img = new Image(); img.src = `data:image/png;base64,${base64}`; await img.decode();
    const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const colors = new Set(); let gold = 0; let lit = 0;
    const bounds = { left: canvas.width, right: 0, top: canvas.height, bottom: 0 };
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      colors.add(`${r >> 4},${g >> 4},${b >> 4}`);
      if (r + g + b > 200) lit++;
      if (r > 100 && g > 75 && r > g * 1.1 && g > b * 1.15) {
        gold++;
        const x = (i / 4) % canvas.width, y = Math.floor(i / 4 / canvas.width);
        bounds.left = Math.min(bounds.left, x); bounds.right = Math.max(bounds.right, x);
        bounds.top = Math.min(bounds.top, y); bounds.bottom = Math.max(bounds.bottom, y);
      }
    }
    return { colors: colors.size, gold, lit, bounds, width: canvas.width, height: canvas.height };
  }, buffer.toString('base64'));
}

test('3D architecture rendering, controls, selection and fallbacks', { timeout: 120000 }, async t => {
  const server = createPreviewServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const out = process.env.SCREENSHOT_DIR || '/tmp/sheikha-architecture-core-screenshots';
  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_EXECUTABLE || '/opt/google/chrome/chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
    await context.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + '/architecture-explorer/');
    await page.waitForSelector('#core-stage canvas[data-state="ready"]');
    const canvas = page.locator('#core-stage canvas');
    await fs.mkdir(out, { recursive: true });

    await t.test('renders a nonblank, framed scene at desktop and mobile sizes', async () => {
      for (const width of [1920, 1440, 1200, 820, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.locator('#scene-reset').click();
        await page.mouse.move(0, 0);
        const png = await canvas.screenshot({ path: path.join(out, `core-canvas-${width}.png`) });
        const info = await pixels(page, png);
        assert.ok(info.colors > 60, JSON.stringify(info));
        assert.ok(info.gold > 100 && info.lit > 1500, JSON.stringify(info));
        assert.ok(info.bounds.left > 2 && info.bounds.right < info.width - 3, `horizontal framing ${width}: ${JSON.stringify(info)}`);
        assert.ok(info.bounds.top > 2 && info.bounds.bottom < info.height - 3, `vertical framing ${width}: ${JSON.stringify(info)}`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        const clipped = await page.locator('button, h1, .core-heading').evaluateAll(elements => elements.filter(el => el.getClientRects().length && el.scrollWidth > el.clientWidth + 2).map(el => el.textContent));
        assert.deepEqual(clipped, [], `clipped text ${width}`);
        await page.screenshot({ path: path.join(out, `core-page-${width}.png`), fullPage: true });
      }
    });

    await t.test('rotation, zoom, drag and reset change actual canvas pixels', async () => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.locator('#scene-reset').click();
      const original = await canvas.screenshot();
      await page.locator('#scene-right').click();
      assert.notDeepEqual(await canvas.screenshot(), original);
      await page.locator('#scene-reset').click();
      assert.deepEqual(await canvas.screenshot(), original);
      await page.locator('#scene-zoom-in').click();
      assert.notDeepEqual(await canvas.screenshot(), original);
      await page.locator('#scene-reset').click();
      const box = await canvas.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 70, box.y + box.height / 2 + 20, { steps: 6 }); await page.mouse.up();
      assert.notDeepEqual(await canvas.screenshot(), original);
      await page.locator('#scene-reset').click();
    });

    await t.test('group selection is shared with filters, keyboard and 3D picking', async () => {
      const runtime = page.locator('[data-scene-group="runtime"]');
      await runtime.focus(); await page.keyboard.press('Space');
      assert.equal(await page.locator('#group-filter').inputValue(), 'runtime');
      assert.equal(await page.locator('.layer-button').count(), 2);
      assert.equal(await canvas.getAttribute('data-selected-group'), 'runtime');
      await runtime.click();
      const box = await canvas.boundingBox();
      let point = null;
      for (let y = .25; y < .8 && !point; y += .08) for (let x = .2; x < .85 && !point; x += .06) {
        const candidate = { x: box.x + box.width * x, y: box.y + box.height * y };
        await page.mouse.move(candidate.x, candidate.y);
        if (await page.locator('#scene-hover').isVisible()) point = candidate;
      }
      assert.ok(point, 'at least one category tower is pickable');
      await page.mouse.click(point.x, point.y);
      assert.notEqual(await page.locator('#group-filter').inputValue(), 'all');
      assert.equal(await canvas.getAttribute('data-selected-group'), await page.locator('#group-filter').inputValue());
      await page.locator('#reset').click();
    });

    await t.test('animation moves pixels, stops when hidden, and respects reduced motion', async () => {
      await page.locator('#scene-motion').check();
      const before = await canvas.screenshot();
      const frame = Number(await canvas.getAttribute('data-frame'));
      await page.waitForFunction(start => Number(document.querySelector('#core-stage canvas').dataset.frame) > start + 4, frame);
      assert.notDeepEqual(await canvas.screenshot(), before);
      await page.locator('#map-view').click();
      const stopped = await canvas.getAttribute('data-frame');
      await page.waitForTimeout(200);
      assert.equal(await canvas.getAttribute('data-frame'), stopped);
      await page.locator('#core-view').click();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => document.getElementById('scene-motion').disabled);
      assert.equal(await page.locator('#scene-motion').isChecked(), false);
      await page.locator('#scene-reset').click();
      const still = await canvas.screenshot();
      await page.waitForTimeout(150);
      assert.deepEqual(await canvas.screenshot(), still);
    });

    await t.test('empty and changed registry refreshes replace the scene without stale motion', async () => {
      const response = await context.request.get(origin + '/api/enterprise-architecture/full');
      const original = await response.json();
      let snapshot = structuredClone(original);
      snapshot.data.architecture.layers = [];
      await page.route('**/api/enterprise-architecture/full', route => route.fulfill({ json: snapshot }));
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForFunction(() => !document.getElementById('scene-motion').disabled);
      await page.locator('#scene-motion').check();
      await page.locator('#refresh').click();
      await page.waitForFunction(() => document.getElementById('layer-count').textContent === '0');
      assert.equal(await canvas.isVisible(), false);
      assert.equal(await page.locator('#scene-state').textContent(), 'لا توجد طبقات مسجلة.');
      assert.equal(await page.locator('#scene-motion').isChecked(), false);
      assert.equal(await page.locator('#scene-motion').isDisabled(), true);
      const stopped = await canvas.getAttribute('data-frame');
      await page.waitForTimeout(150);
      assert.equal(await canvas.getAttribute('data-frame'), stopped);

      snapshot = structuredClone(original);
      snapshot.data.architecture.layers = [{ id: 'future-domain', name: 'Future domain', arabicName: 'مجال جديد', dependencies: [] }];
      await page.locator('#refresh').click();
      await page.waitForFunction(() => document.getElementById('layer-count').textContent === '1');
      assert.equal(await canvas.isVisible(), true);
      assert.equal(await canvas.getAttribute('data-group-count'), '1');
      assert.equal(await canvas.getAttribute('data-link-count'), '0');
      await page.locator('[data-scene-group="other"]').click();
      assert.equal(await canvas.getAttribute('data-selected-group'), 'other');

      snapshot = original;
      await page.locator('#refresh').click();
      await page.waitForFunction(() => document.getElementById('layer-count').textContent === '24');
      await page.locator('#reset').click();
      assert.equal(await canvas.getAttribute('data-group-count'), '6');
      assert.equal(await canvas.getAttribute('data-link-count'), '9');
      assert.equal(await page.locator('#core-stage canvas').count(), 1);
      assert.equal(await page.locator('#scene-motion').isChecked(), false);
      await page.unroute('**/api/enterprise-architecture/full');
    });

    await t.test('losing an active WebGL context stops rendering and preserves the registry views', async () => {
      const lostPage = await context.newPage();
      await lostPage.goto(origin + '/architecture-explorer/');
      await lostPage.waitForSelector('#core-stage canvas[data-state="ready"]');
      await lostPage.locator('#scene-motion').check();
      const canLoseContext = await lostPage.locator('canvas').evaluate(element => {
        const gl = element.getContext('webgl2');
        const extension = gl?.getExtension('WEBGL_lose_context');
        extension?.loseContext();
        return Boolean(extension);
      });
      assert.equal(canLoseContext, true);
      await lostPage.locator('#scene-error').waitFor({ state: 'visible' });
      assert.equal(await lostPage.locator('#scene-motion').isChecked(), false);
      assert.equal(await lostPage.locator('#scene-motion').isDisabled(), true);
      const stopped = await lostPage.locator('canvas').getAttribute('data-frame');
      await lostPage.waitForTimeout(150);
      assert.equal(await lostPage.locator('canvas').getAttribute('data-frame'), stopped);
      await lostPage.locator('#list-view').click();
      assert.equal(await lostPage.locator('#table-body tr').count(), 24);
      await lostPage.locator('#core-view').click();
      assert.equal(await lostPage.locator('#scene-error').isVisible(), true);
      await lostPage.close();
    });

    await t.test('WebGL failure leaves the 2D map, search and source data available', async () => {
      const fallbackPage = await context.newPage();
      await fallbackPage.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, ...args) { return type.includes('webgl') ? null : original.call(this, type, ...args); };
      });
      await fallbackPage.goto(origin + '/architecture-explorer/');
      await fallbackPage.locator('#scene-error').waitFor({ state: 'visible' });
      assert.equal(await fallbackPage.locator('#layer-count').textContent(), '24');
      assert.equal(await fallbackPage.locator('#scene-right').isDisabled(), true);
      await fallbackPage.locator('#scene-fallback').click();
      assert.equal(await fallbackPage.locator('#map-panel').isVisible(), true);
      await fallbackPage.locator('#search').fill('commerce-os');
      assert.equal(await fallbackPage.locator('.layer-button').count(), 1);
      await fallbackPage.close();
    });
    assert.deepEqual(errors, []);
    await context.close();
  } finally {
    await browser?.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
