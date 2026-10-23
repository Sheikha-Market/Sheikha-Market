'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { createPreviewServer } = require('../tools/preview/sheikha-architecture-preview.cjs');
const { getEnterpriseArchitecture } = require('../core/enterprise-architecture/sheikha-enterprise-architecture');

test('architecture explorer browser workflows and responsive layout', { timeout: 90000 }, async t => {
  const server = createPreviewServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const screenshots = process.env.SCREENSHOT_DIR || '/tmp/sheikha-architecture-screenshots';
  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_EXECUTABLE || '/opt/google/chrome/chrome', args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', acceptDownloads: true });
    await context.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const open = async (query = '?view=map') => {
      await page.goto(origin + '/architecture-explorer/' + query);
      await page.waitForFunction(() => document.getElementById('workspace').getAttribute('aria-busy') === 'false');
    };

    await t.test('loads the actual registry, source limits, and bitmap', async () => {
      await open();
      assert.equal(await page.locator('#layer-count').textContent(), '24');
      assert.equal(await page.locator('.layer-button').count(), 24);
      assert.equal(await page.locator('.category-node').count(), 6);
      assert.match(await page.locator('.source-status').textContent(), /غير متحقق/);
      assert.equal(await page.locator('body').textContent().then(text => text.includes('100%')), false);
      await page.locator('.vision-center img').evaluate(img => img.decode());
      assert.equal(await page.locator('.vision-center img').evaluate(img => img.naturalWidth > 0), true);
    });

    await t.test('category, search, empty state, table and relationship navigation', async () => {
      await page.locator('[data-group="runtime"]').click();
      assert.equal(await page.locator('.layer-button').count(), 2);
      await page.locator('#search').fill('COMMERCE-OS');
      assert.equal(await page.locator('.layer-button').count(), 1);
      await page.locator('#list-view').click();
      assert.equal(await page.locator('#table-body tr').count(), 1);
      assert.equal(await page.locator('#table-panel').isVisible(), true);
      await page.locator('#detail-content .relationship-button').first().click();
      assert.equal(await page.locator('#group-filter').inputValue(), 'all');
      assert.equal(await page.locator('#search').inputValue(), '');
      assert.match(page.url(), /layer=commerce-authorities/);
      await page.reload();
      await page.waitForFunction(() => document.getElementById('workspace').getAttribute('aria-busy') === 'false');
      assert.equal(await page.locator('[data-layer="commerce-authorities"]').getAttribute('aria-current'), 'true');
      await page.locator('#search').fill('no-matching-layer-at-all');
      assert.equal(await page.locator('#empty').isVisible(), true);
      assert.equal(await page.locator('#export').isDisabled(), true);
      await page.locator('#reset').click();
      assert.equal(await page.locator('.layer-button').count(), 24);
    });

    await t.test('exports filtered definitions without claiming live health', async () => {
      await page.locator('#group-filter').selectOption('runtime');
      const downloadReady = page.waitForEvent('download');
      await page.locator('#export').click();
      const download = await downloadReady;
      const data = JSON.parse(await fs.readFile(await download.path(), 'utf8'));
      assert.equal(data.layers.length, 2);
      assert.equal(data.liveOperationVerified, false);
      assert.equal(data.evidenceType, 'REGISTRY_DEFINITION');
      assert.ok(data.externalDependencyIds.includes('commerce-authorities'));
    });

    await t.test('keyboard selection, image rendering and no layout overlaps at six widths', async () => {
      await page.locator('#reset').click();
      await page.locator('#map-view').click();
      const target = page.locator('[data-group="foundation"]');
      await target.focus(); await page.keyboard.press('Space');
      assert.equal(await target.getAttribute('aria-pressed'), 'true');
      await page.keyboard.press('Space');
      assert.equal(await target.getAttribute('aria-pressed'), 'false');
      await fs.mkdir(screenshots, { recursive: true });
      for (const width of [1920, 1440, 1200, 820, 390, 320]) {
        await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
        await page.evaluate(() => window.scrollTo(0, 0));
        const layout = await page.evaluate(() => {
          const nodes = [...document.querySelectorAll('.category-node, .vision-center')].map(el => ({ name: el.dataset.group || 'vision', box: el.getBoundingClientRect() }));
          const overlaps = [];
          for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i].box; const b = nodes[j].box;
            if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) overlaps.push([nodes[i].name, nodes[j].name]);
          }
          const clipped = [...document.querySelectorAll('button, h1, .category-node strong')].filter(el => el.getClientRects().length && el.scrollWidth > el.clientWidth + 2).map(el => el.textContent);
          const brokenImages = [...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => img.src);
          return { overflow: document.documentElement.scrollWidth > innerWidth, overlaps, clipped, brokenImages };
        });
        assert.deepEqual(layout, { overflow: false, overlaps: [], clipped: [], brokenImages: [] }, `layout at ${width}px: ${JSON.stringify(layout)}`);
        await page.screenshot({ path: path.join(screenshots, `architecture-${width}.png`), fullPage: true });
      }
    });

    await t.test('failed refresh retains a clearly marked previous snapshot and retry works', async () => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      const fail = route => route.fulfill({ status: 503, body: 'offline' });
      await page.route('**/api/enterprise-architecture/full', fail);
      await page.locator('#refresh').click();
      await page.locator('#error').waitFor({ state: 'visible' });
      assert.match(await page.locator('#error-text').textContent(), /آخر تحميل ناجح/);
      assert.equal(await page.locator('#layer-count').textContent(), '24');
      await page.unroute('**/api/enterprise-architecture/full', fail);
      await page.locator('#retry').click();
      await page.waitForFunction(() => document.getElementById('workspace').getAttribute('aria-busy') === 'false');
      assert.equal(await page.locator('#error').isHidden(), true);
    });

    await t.test('empty registry remains empty and the request timeout restores controls', async () => {
      const architecture = structuredClone(getEnterpriseArchitecture());
      architecture.layers = [];
      const empty = route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ success: true, data: { architecture } }) });
      await page.route('**/api/enterprise-architecture/full', empty);
      await open();
      assert.equal(await page.locator('#layer-count').textContent(), '0');
      assert.equal(await page.locator('#empty').isVisible(), true);
      assert.equal(await page.locator('#export').isDisabled(), true);
      await page.unroute('**/api/enterprise-architecture/full', empty);
      const hang = () => {};
      await page.route('**/api/enterprise-architecture/full', hang);
      await open();
      assert.match(await page.locator('#announcement').textContent(), /انتهت مهلة/);
      assert.equal(await page.locator('#refresh').isEnabled(), true);
      await page.unroute('**/api/enterprise-architecture/full', hang);
    });

    await t.test('malformed first response is not replaced with fabricated data', async () => {
      const malformed = route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ success: true, data: { architecture: { layers: 'invalid' } } }) });
      await page.route('**/api/enterprise-architecture/full', malformed);
      await open();
      assert.equal(await page.locator('#error').isVisible(), true);
      assert.equal(await page.locator('.layer-button').count(), 0);
      assert.equal(await page.locator('#export').isDisabled(), true);
      await page.unroute('**/api/enterprise-architecture/full', malformed);
    });

    await t.test('API labels are text, missing references are visible, future groups remain selectable', async () => {
      const architecture = structuredClone(getEnterpriseArchitecture());
      architecture.layers = [{ id: 'future-layer', name: 'Future', arabicName: '<img src=x onerror="window.injected=true">', purpose: '<script>window.injected=true</script>', dependencies: ['missing-layer'], capabilities: [], responsibilities: [] }];
      const special = route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ success: true, data: { architecture } }) });
      await page.route('**/api/enterprise-architecture/full', special);
      await open();
      assert.equal(await page.locator('.extra-node').isVisible(), true);
      assert.equal(await page.locator('.missing-reference').count(), 1);
      assert.match(await page.locator('.detail-name').textContent(), /<img/);
      assert.equal(await page.locator('#detail-content script, #detail-content img[src="x"]').count(), 0);
      assert.equal(await page.evaluate(() => window.injected), undefined);
      await page.locator('.extra-node').click();
      assert.equal(await page.locator('.layer-button').count(), 1);
      await page.unroute('**/api/enterprise-architecture/full', special);
    });
    assert.deepEqual(errors, []);
    await context.close();
  } finally {
    await browser?.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
