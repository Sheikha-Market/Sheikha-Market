'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createHash } = require('node:crypto');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'runtime/r5-review');
test('R5 offline review supports catalogs, flows, notes, export and responsive layouts', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
    const page = await context.newPage(), errors = [], external = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (/^https?:/.test(request.url())) external.push(request.url()); });
    await context.route(/^https?:/, route => route.abort());
    await page.goto(pathToFileURL(path.join(output, 'index.html')).href);
    assert.equal(await page.locator('#view tbody tr').count(), 88);
    await page.locator('#filter').selectOption('FIN');
    assert.equal(await page.locator('#view tbody tr').count(), 8);
    await page.locator('#clear').click();
    await page.locator('#search').fill('COM-03');
    assert.equal(await page.locator('#view tbody tr').count(), 1);
    await page.getByRole('button', { name: 'COM-03', exact: true }).click();
    assert.equal(await page.locator('#details').evaluate(dialog => dialog.open), true);
    await page.getByRole('button', { name: /FLOW-01 ·/ }).click();
    assert.equal(await page.locator('#view tbody tr').count(), 1);
    assert.match(await page.locator('#view').innerText(), /rfq.received.v1/);
    await page.getByRole('button', { name: 'CRM-02', exact: true }).click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#details').evaluate(dialog => dialog.open), false);
    await page.locator('nav [data-view="systems"]').click();
    await page.locator('#search').fill('nonexistent-value');
    assert.equal(await page.locator('.empty').count(), 1);
    await page.locator('#clear').click();
    const downloadCatalog = page.waitForEvent('download'); await page.locator('#export-catalog').click();
    const catalog = JSON.parse(fs.readFileSync(await (await downloadCatalog).path()));
    assert.equal(catalog.systems.length, 88); assert.equal(catalog.publicationApproval, false);
    await page.locator('nav [data-view="acceptance"]').click();
    assert.equal(await page.locator('#view tbody tr').count(), 34);
    await page.locator('#review-state').selectOption('NEEDS_CHANGE');
    await page.locator('#review-note').fill('<script>window.injected=1</script> مراجعة مرئيات');
    await page.reload(); await page.locator('nav [data-view="acceptance"]').click();
    assert.equal(await page.locator('#review-state').inputValue(), 'NEEDS_CHANGE');
    assert.match(await page.locator('#review-note').inputValue(), /مراجعة مرئيات/);
    assert.equal(await page.evaluate(() => window.injected), undefined);
    const downloadReview = page.waitForEvent('download'); await page.locator('#export-review').click();
    const review = JSON.parse(fs.readFileSync(await (await downloadReview).path()));
    assert.equal(review.items['RFQ-01'].state, 'NEEDS_CHANGE');
    assert.equal(review.testResults, 'NOT_EVALUATED'); assert.equal(review.publicationApproval, false);
    assert.equal(review.sourceSha256, catalog.sourceSha256);
    await page.locator('#filter').selectOption('NEEDS_CHANGE');
    assert.equal(await page.locator('#view tbody tr').count(), 1);
    await page.locator('nav [data-view="architecture"]').click();
    assert.match(await page.locator('#view').innerText(), /الجذور والأساس المشترك/);
    await page.locator('nav [data-view="rfq"]').click();
    assert.match(await page.locator('#view').innerText(), /POST \/sandbox\/api\/v1\/rfqs/);
    await page.locator('nav [data-view="references"]').click();
    await page.locator('#view img').evaluateAll(images => images.forEach(img => { img.loading = 'eager'; }));
    await page.waitForFunction(() => [...document.querySelectorAll('#view img')].every(img => img.complete && img.naturalWidth > 0));
    assert.equal(await page.locator('#view img').count(), 3);
    await page.getByText('خط الإنتاج اليومي في المرجع', { exact: true }).click();
    assert.match(await page.locator('#view').innerText(), /البرنامج اليومي/);
    const snapshots = '/tmp/sheikha-r5-review-screenshots'; fs.mkdirSync(snapshots, { recursive: true });
    for (const width of [1440, 820, 390, 320]) {
      await page.setViewportSize({ width, height: 960 });
      for (const view of ['systems', 'flows', 'acceptance', 'architecture', 'rfq', 'references']) {
        await page.locator(`nav [data-view="${view}"]`).click();
        assert.equal(await page.evaluate(() => scrollY), 0, `${view}: reset scroll at ${width}`);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${view}: overflow at ${width}`);
        if (view === 'systems' || view === 'acceptance' || (view === 'references' && width === 1440)) await page.screenshot({ path: `${snapshots}/${view}-${width}.png` });
      }
    }
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.locator('nav [data-view="systems"]').click();
    await page.evaluate(() => window.scrollTo(0, 600));
    const navBox = await page.locator('nav').boundingBox(), noteBox = await page.locator('.side-note').boundingBox();
    assert.ok(navBox.y + navBox.height < noteBox.y, 'sidebar navigation must not overlap status');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('nav [data-view="systems"]').click();
    await page.getByRole('button', { name: 'GOV-01', exact: true }).click();
    const dialogBox = await page.locator('#details').boundingBox(); assert.ok(dialogBox.width <= 390);
    await page.screenshot({ path: `${snapshots}/details-mobile.png` });
    assert.deepEqual(errors, []); assert.deepEqual(external, []);
    const denied = await browser.newContext();
    await denied.addInitScript(() => { Storage.prototype.setItem = () => { throw Error('Storage denied'); }; });
    const deniedPage = await denied.newPage(); await deniedPage.goto(pathToFileURL(path.join(output, 'index.html')).href);
    await deniedPage.locator('nav [data-view="acceptance"]').click(); await deniedPage.locator('#review-note').fill('ملاحظة مؤقتة');
    assert.match(await deniedPage.locator('#save-state').innerText(), /غير متاح/);
    const manifest = JSON.parse(fs.readFileSync(path.join(output, 'build.json')));
    assert.equal(createHash('sha256').update(fs.readFileSync(manifest.source)).digest('hex'), manifest.sourceSha256);
    for (const [file, expected] of Object.entries(manifest.artifacts)) assert.equal(createHash('sha256').update(fs.readFileSync(path.join(output, file))).digest('hex'), expected);
    const evidence = { checkedAt: new Date().toISOString(), result: 'PASS', sourceSha256: manifest.sourceSha256, artifactSha256: manifest.artifacts, widths: [1440, 820, 390, 320], counts: manifest.counts, externalRequests: external.length, sourceModified: false, publicationApproval: false, scope: 'REVIEW_INTERFACE_ONLY_NOT_RFQ_BACKEND_ACCEPTANCE' };
    fs.writeFileSync(path.join(output, 'browser-verification.json'), JSON.stringify(evidence, null, 2), { mode: 0o600 });
    console.log(JSON.stringify(evidence));
  } finally { await browser.close(); }
});

test('review import rejects unsafe files, previews conflicts, merges explicitly and supports undo', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/google/chrome/chrome', headless: true, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, acceptDownloads: true });
    const page = await context.newPage(), errors = [], external = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (/^https?:/.test(request.url())) external.push(request.url()); });
    await context.route(/^https?:/, route => route.abort());
    await page.goto(pathToFileURL(path.join(output, 'index.html')).href);
    const sourceSha256 = JSON.parse(fs.readFileSync(path.join(output, 'catalog.json'))).sourceSha256;
    const storageKey = 'sheikha-r5-review-v1:' + sourceSha256;
    const stored = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
    const upload = value => page.locator('#import-file').setInputFiles({ name: 'review.json', mimeType: 'application/json', buffer: Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)) });
    const openImport = async value => { await upload(value); await page.locator('#import-dialog').waitFor({ state: 'visible' }); };
    await page.locator('nav [data-view="acceptance"]').click();
    await page.locator('#review-note').fill('ملاحظة محلية لا تضيع');
    const baseline = await stored();
    const incoming = structuredClone(baseline);
    incoming.items['RFQ-01'] = { state: 'NEEDS_CHANGE', note: '<script>window.importedScript=true</script> ملاحظة واردة', updatedAt: new Date().toISOString() };
    incoming.items['RFQ-02'] = { state: 'READY_FOR_TEST', note: 'مرئيات للمراجعة', updatedAt: new Date().toISOString() };
    for (const [invalid, message] of [
      ['{broken', /JSON/],
      [{ ...incoming, sourceSha256: 'b'.repeat(64) }, /بصمة المصدر مختلفة/],
      [{ ...incoming, publicationApproval: true }, /اعتمادًا/],
      [{ ...incoming, items: { 'UNKNOWN-01': incoming.items['RFQ-01'] } }, /معرّف معيار/],
      [' '.repeat(256 * 1024 + 1), /حجم الملف/]
    ]) {
      await upload(invalid);
      await page.waitForFunction(() => document.getElementById('import-file').value === '' && document.getElementById('notice').textContent !== '');
      assert.match(await page.locator('#notice').innerText(), message);
      assert.deepEqual(await stored(), baseline);
    }
    await openImport(incoming);
    assert.equal(await page.locator('#conflict-RFQ-01').inputValue(), 'keep');
    assert.equal(await page.evaluate(() => window.importedScript), undefined);
    const snapshots = '/tmp/sheikha-r5-review-screenshots'; fs.mkdirSync(snapshots, { recursive: true });
    for (const [width, height] of [[1440, 960], [820, 960], [390, 844], [320, 640]]) {
      await page.setViewportSize({ width, height });
      assert.ok(await page.locator('#import-dialog').evaluate(dialog => dialog.scrollWidth <= dialog.clientWidth + 1));
      assert.ok(await page.locator('#import-preview').evaluate(preview => preview.scrollWidth <= preview.clientWidth + 1));
      const modal = await page.locator('#import-dialog').boundingBox(), confirm = await page.locator('#confirm-import').boundingBox();
      assert.ok(confirm.y + confirm.height < modal.y + modal.height, 'merge action must stay inside dialog');
      await page.screenshot({ path: `${snapshots}/import-${width}.png` });
    }
    await page.locator('#cancel-import').click(); assert.deepEqual(await stored(), baseline);
    await page.setViewportSize({ width: 1440, height: 960 });
    await openImport(incoming); await page.locator('#confirm-import').click();
    assert.deepEqual((await stored()).items['RFQ-01'], baseline.items['RFQ-01']);
    assert.deepEqual((await stored()).items['RFQ-02'], incoming.items['RFQ-02']);
    await page.locator('#undo-import').click(); assert.deepEqual((await stored()).items, baseline.items);
    assert.equal(await page.locator('#undo-import').isDisabled(), true);
    await openImport(incoming); await page.locator('#conflict-RFQ-01').selectOption('incoming'); await page.locator('#confirm-import').click();
    assert.deepEqual((await stored()).items, incoming.items);
    await page.reload(); await page.locator('nav [data-view="acceptance"]').click();
    assert.equal(await page.locator('#review-note').inputValue(), incoming.items['RFQ-01'].note);
    assert.equal(await page.locator('#undo-import').isDisabled(), true);
    await openImport(incoming); assert.equal(await page.locator('#confirm-import').isDisabled(), true); await page.keyboard.press('Escape');
    const next = structuredClone(incoming); next.items['RFQ-02'].note = 'تعديل وارد آخر';
    await openImport(next); await page.locator('#conflict-RFQ-02').selectOption('incoming'); await page.locator('#confirm-import').click();
    assert.equal(await page.locator('#undo-import').isDisabled(), false);
    await page.locator('#review-note').fill('تعديل يدوي بعد الدمج');
    assert.equal(await page.locator('#undo-import').isDisabled(), true);
    const download = page.waitForEvent('download'); await page.locator('#export-review').click();
    const exported = JSON.parse(fs.readFileSync(await (await download).path()));
    assert.equal(exported.publicationApproval, false); assert.equal(exported.testResults, 'NOT_EVALUATED');
    assert.equal(exported.items['RFQ-01'].note, 'تعديل يدوي بعد الدمج');
    assert.equal(await page.evaluate(() => window.importedScript), undefined);
    assert.deepEqual(errors, []); assert.deepEqual(external, []);
    const deniedContext = await browser.newContext();
    await deniedContext.addInitScript(() => { Storage.prototype.setItem = () => { throw Error('Storage denied'); }; });
    const denied = await deniedContext.newPage(); await denied.goto(pathToFileURL(path.join(output, 'index.html')).href);
    await denied.locator('#import-file').setInputFiles({ name: 'review.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(incoming)) });
    await denied.locator('#import-dialog').waitFor({ state: 'visible' }); await denied.locator('#confirm-import').click();
    assert.match(await denied.locator('#notice').innerText(), /الحفظ المحلي غير متاح/);
    assert.equal(await denied.locator('#review-note').inputValue(), incoming.items['RFQ-01'].note);
    const evidence = { checkedAt: new Date().toISOString(), result: 'PASS', sourceSha256, indexSha256: createHash('sha256').update(fs.readFileSync(path.join(output, 'index.html'))).digest('hex'), invalidImportsLeaveStateUnchanged: true, conflictsDefaultToLocal: true, undoVerified: true, storageFailureReported: true, externalRequests: external.length, publicationApproval: false };
    fs.writeFileSync(path.join(output, 'import-verification.json'), JSON.stringify(evidence, null, 2), { mode: 0o600 });
    console.log(JSON.stringify(evidence));
  } finally { await browser.close(); }
});
