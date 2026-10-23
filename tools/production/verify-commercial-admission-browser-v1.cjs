'use strict';
/* global document, innerWidth, location */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

async function main() {
  const base = process.argv[2] || 'http://127.0.0.1:8111';
  assert.match(base, /^http:\/\/127\.0\.0\.1:\d+$/);
  const { chromium } = require(process.env.SHEIKHA_PLAYWRIGHT_MODULE || 'playwright');
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-admission-browser-'));
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true,
    args: ['--no-sandbox', '--disable-background-networking', '--disable-component-update', '--disable-default-apps'] });
  const evidence = [];
  try {
    for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844], ['compact', 320, 760]]) {
      const context = await browser.newContext({ viewport: { width, height }, serviceWorkers: 'block' });
      const unexpected = [];
      await context.route('**/*', route => {
        if (!route.request().url().startsWith(base + '/')) {
          unexpected.push(new URL(route.request().url()).origin); return route.abort();
        }
        return route.continue();
      });
      const page = await context.newPage(); const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${base}/commercial/checkout.html`);
      await page.waitForFunction(() => !document.querySelector('button[type="submit"]').disabled);
      assert.equal(await page.locator('#previewNotice').isVisible(), true);
      assert.equal(await page.locator('#offerId option').count(), 5);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      await page.locator('#offerId').selectOption('SHEIKHA_PRODUCT_VISUAL_PACK_V1');
      assert.match(await page.locator('#summaryPayment').innerText(), /٥٠/);
      assert.ok(await page.locator('#summaryDeliverables li').count() > 0);
      await page.locator('input[name="name"]').fill('Browser test customer');
      await page.locator('input[name="email"]').fill('browser-test@example.com');
      await page.locator('textarea[name="need"]').fill('Synthetic private browser workflow test only.');
      for (const field of ['scopeAccepted', 'termsAccepted', 'privacyConsent', 'paymentObligationAccepted']) {
        await page.locator(`input[name="${field}"]`).check();
      }
      await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true });
      // Drop the response after the server stores the request; retry must return the same receipt.
      let intercepted = false;
      let firstBody;
      if (name === 'desktop') {
        await page.route('**/self-service-checkouts', async route => {
          if (intercepted) return route.continue();
          intercepted = true;
          const request = route.request();
          const response = await fetch(request.url(), {
            method: request.method(), headers: request.headers(), body: request.postData()
          });
          firstBody = await response.json();
          assert.equal(response.status, 201);
          return route.abort();
        });
      }
      await page.locator('button[type="submit"]').click();
      if (name === 'desktop') {
        await page.waitForFunction(() => document.getElementById('checkoutResult').classList.contains('error'));
        const replay = page.waitForResponse(response => response.url().endsWith('/self-service-checkouts'));
        await page.locator('button[type="submit"]').click();
        const response = await replay;
        assert.equal(response.status(), 200);
        assert.equal((await response.json()).orderId, firstBody.orderId);
      }
      await page.locator('#receiptLink').waitFor({ state: 'visible' });
      assert.equal(await page.locator('button[type="submit"]').isDisabled(), true);
      assert.match(await page.locator('#checkoutResult').innerText(), /لم يُحصّل/);
      await page.locator('#receiptLink').click();
      await page.waitForFunction(() => document.querySelectorAll('#receiptDetails dt').length === 5);
      assert.equal(await page.evaluate(() => location.hash), '');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      await page.screenshot({ path: path.join(output, `${name}-receipt.png`), fullPage: true });
      assert.deepEqual(errors, []); assert.deepEqual(unexpected, []);
      evidence.push({ viewport: name, width, height, checkoutVerified: true, privateReceiptVerified: true,
        noOverflow: true, noJavascriptErrors: true, retryAfterLostResponseVerified: name === 'desktop' });
      await context.close();
    }
  } finally { await browser.close(); }
  const report = { evidence, externalRequests: 0, productionPaymentTested: false, output };
  fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(report, null, 2), { mode: 0o600 });
  for (const file of fs.readdirSync(output)) fs.chmodSync(path.join(output, file), 0o600);
  console.log(JSON.stringify(report));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
