'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');

const express = require('express');

const {
  mountCommercialSales
} = require(
  '../../routes/commercial-sales/' +
  'sheikha-commercial-sales-mount-v1'
);

function request({
  port,
  method = 'GET',
  requestPath,
  body
}) {
  return new Promise((resolve, reject) => {
    const encoded = body === undefined
      ? null
      : Buffer.from(JSON.stringify(body));

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: requestPath,
        method,
        headers: encoded
          ? {
              'content-type':
                'application/json',
              'content-length':
                String(encoded.length)
            }
          : {}
      },
      (res) => {
        const chunks = [];

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          const text = Buffer
            .concat(chunks)
            .toString('utf8');

          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            text
          });
        });
      }
    );

    req.setTimeout(10000, () => {
      req.destroy(
        new Error('Admission request timeout')
      );
    });

    req.on('error', reject);

    if (encoded) {
      req.write(encoded);
    }

    req.end();
  });
}

function parseJson(response, label) {
  try {
    return JSON.parse(response.text);
  } catch (error) {
    throw new Error(
      `${label} did not return valid JSON`
    );
  }
}

function check(condition, name, checks) {
  checks[name] = Boolean(condition);
}

async function main() {
  const dataDir = path.resolve(
    process.env.SHEIKHA_COMMERCIAL_ADMISSION_DATA_DIR ||
    ''
  );

  if (!dataDir) {
    throw new Error(
      'SHEIKHA_COMMERCIAL_ADMISSION_DATA_DIR is required'
    );
  }

  fs.mkdirSync(dataDir, {
    recursive: true,
    mode: 0o700
  });

  fs.chmodSync(dataDir, 0o700);

  const app = express();

  const mount = mountCommercialSales(
    app,
    { dataDir }
  );

  const server = http.createServer(app);

  await new Promise((resolve, reject) => {
    server.once('error', reject);

    server.listen(
      0,
      '127.0.0.1',
      resolve
    );
  });

  const address = server.address();
  const port = address.port;

  const checks = {};
  const observations = {};

  try {
    const page = await request({
      port,
      requestPath: '/commercial/index.html'
    });

    observations.salesPageStatus =
      page.statusCode;

    check(
      page.statusCode === 200,
      'salesPageStatus200',
      checks
    );

    check(
      String(
        page.headers['content-type'] || ''
      ).includes('text/html'),
      'salesPageHtmlContentType',
      checks
    );

    check(
      page.text.includes('حلول شيخة التجارية') &&
      page.text.includes('dir="rtl"'),
      'salesPageArabicRtl',
      checks
    );

    check(
      String(
        page.headers[
          'content-security-policy'
        ] || ''
      ).includes("default-src 'self'"),
      'contentSecurityPolicyPresent',
      checks
    );

    const requestPage = await request({
      port,
      requestPath:
        '/commercial/request.html'
    });

    check(
      requestPage.statusCode === 200 &&
      requestPage.text.includes(
        'commercialLeadForm'
      ),
      'leadRequestPageAvailable',
      checks
    );

    const statusResponse = await request({
      port,
      requestPath:
        '/api/commercial/v1/status'
    });

    const status = parseJson(
      statusResponse,
      'status'
    );

    observations.apiStatusCode =
      statusResponse.statusCode;

    check(
      statusResponse.statusCode === 200,
      'apiStatus200',
      checks
    );

    check(
      status.success === true &&
      status.offersCount === 4,
      'commercialServiceHealthy',
      checks
    );

    check(
      status.paymentCaptureEnabled === false &&
      status.officialTaxInvoiceEnabled === false,
      'financialAutomationDisabled',
      checks
    );

    check(
      String(
        statusResponse.headers[
          'cache-control'
        ] || ''
      ).includes('no-store'),
      'apiNoStoreHeader',
      checks
    );

    const offersResponse = await request({
      port,
      requestPath:
        '/api/commercial/v1/offers'
    });

    const offers = parseJson(
      offersResponse,
      'offers'
    );

    check(
      offersResponse.statusCode === 200 &&
      Array.isArray(offers.offers) &&
      offers.offers.length === 4,
      'fourOffersAvailable',
      checks
    );

    const leadResponse = await request({
      port,
      method: 'POST',
      requestPath:
        '/api/commercial/v1/leads',
      body: {
        name: 'عميل قبول محلي',
        company: 'شركة اختبار محلية',
        email:
          'local-admission@example.com',
        phone: '',
        offerId:
          'SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1',
        need:
          'نحتاج تشخيصًا تجريبيًا لمسار سلسلة الإمداد.',
        consent: true,
        source:
          'LOCAL_ENDPOINT_ADMISSION_V1'
      }
    });

    const lead = parseJson(
      leadResponse,
      'lead'
    );

    observations.testLeadId =
      lead.leadId || null;

    check(
      leadResponse.statusCode === 201 &&
      lead.success === true &&
      /^LEAD-\d{8}-[A-F0-9]{10}$/.test(
        lead.leadId || ''
      ),
      'testLeadCreated',
      checks
    );

    check(
      lead.paymentDataCollected === false,
      'leadContainsNoPaymentData',
      checks
    );

    const invalidLeadResponse = await request({
      port,
      method: 'POST',
      requestPath:
        '/api/commercial/v1/leads',
      body: {
        name: 'عميل ناقص',
        email: '',
        phone: '',
        offerId:
          'SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1',
        need:
          'طلب غير مكتمل لأغراض الاختبار.',
        consent: false
      }
    });

    check(
      invalidLeadResponse.statusCode === 400,
      'invalidLeadRejected',
      checks
    );

    const prohibitedResponse = await request({
      port,
      method: 'POST',
      requestPath:
        '/api/commercial/v1/leads',
      body: {
        name: 'اختبار بيانات ممنوعة',
        email:
          'blocked@example.com',
        offerId:
          'SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1',
        need:
          'اختبار رفض بيانات مالية سرية.',
        consent: true,
        cardNumber:
          '4111111111111111'
      }
    });

    const prohibited = parseJson(
      prohibitedResponse,
      'prohibited data'
    );

    check(
      prohibitedResponse.statusCode === 400 &&
      prohibited.error ===
        'PROHIBITED_FINANCIAL_OR_SECRET_DATA',
      'financialSecretsRejected',
      checks
    );

    const quoteResponse = await request({
      port,
      method: 'POST',
      requestPath:
        '/api/commercial/v1/quotes',
      body: {
        offerId:
          'SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1',
        vatApplicable: false
      }
    });

    const quoteResult = parseJson(
      quoteResponse,
      'quote'
    );

    const quote = quoteResult.quote;

    observations.quoteId =
      quote && quote.quoteId;

    check(
      quoteResponse.statusCode === 201 &&
      quoteResult.success === true &&
      quote.totalSar === 2500 &&
      quote.vatSar === 0,
      'diagnosticQuoteCreated',
      checks
    );

    check(
      quote.officialInvoiceIssued === false &&
      quote.humanApprovalRequired === true,
      'quoteRemainsControlled',
      checks
    );

    const blockedOrderResponse = await request({
      port,
      method: 'POST',
      requestPath:
        '/api/commercial/v1/orders',
      body: {
        quote,
        customerAcceptedScope: true,
        ownerApproved: false
      }
    });

    check(
      blockedOrderResponse.statusCode === 400,
      'unapprovedOrderRejected',
      checks
    );

    const orderResponse = await request({
      port,
      method: 'POST',
      requestPath:
        '/api/commercial/v1/orders',
      body: {
        quote,
        customerAcceptedScope: true,
        ownerApproved: true
      }
    });

    const orderResult = parseJson(
      orderResponse,
      'order'
    );

    const order = orderResult.order;

    observations.orderId =
      order && order.orderId;

    check(
      orderResponse.statusCode === 201 &&
      orderResult.success === true &&
      order.status === 'PENDING_SIGNATURE',
      'controlledOrderCreated',
      checks
    );

    const blockedProformaResponse =
      await request({
        port,
        method: 'POST',
        requestPath:
          '/api/commercial/v1/proforma',
        body: {
          order,
          signedAgreement: false,
          invoiceRecipient:
            'شركة اختبار محلية'
        }
      });

    check(
      blockedProformaResponse.statusCode === 400,
      'unsignedProformaRejected',
      checks
    );

    const proformaResponse = await request({
      port,
      method: 'POST',
      requestPath:
        '/api/commercial/v1/proforma',
      body: {
        order,
        signedAgreement: true,
        invoiceRecipient:
          'شركة اختبار محلية'
      }
    });

    const proformaResult = parseJson(
      proformaResponse,
      'proforma'
    );

    const document = proformaResult.document;

    observations.proformaId =
      document && document.documentId;

    check(
      proformaResponse.statusCode === 201 &&
      proformaResult.success === true &&
      document.documentType ===
        'PROFORMA_PAYMENT_REQUEST',
      'proformaCreated',
      checks
    );

    check(
      document.officialTaxInvoice === false &&
      document.officialTaxInvoiceIssued === false &&
      document.bankAccountPublished === false &&
      document.cardDataRequested === false &&
      document.revenueRecognized === false,
      'proformaFinancialBoundariesPreserved',
      checks
    );

    const leadFile = path.join(
      dataDir,
      'leads.jsonl'
    );

    observations.leadFile = leadFile;

    check(
      fs.existsSync(leadFile),
      'leadFileCreated',
      checks
    );

    if (fs.existsSync(leadFile)) {
      const lines = fs
        .readFileSync(leadFile, 'utf8')
        .trim()
        .split('\n')
        .filter(Boolean);

      const fileMode =
        fs.statSync(leadFile).mode & 0o777;

      const dirMode =
        fs.statSync(dataDir).mode & 0o777;

      observations.leadFileMode =
        fileMode.toString(8);

      observations.leadDirectoryMode =
        dirMode.toString(8);

      observations.leadRecordCount =
        lines.length;

      check(
        lines.length === 1,
        'singleTestLeadPersisted',
        checks
      );

      check(
        fileMode === 0o600,
        'leadFilePrivateMode600',
        checks
      );

      check(
        dirMode === 0o700,
        'leadDirectoryPrivateMode700',
        checks
      );

      check(
        !leadFile.startsWith(
          process.cwd() + path.sep
        ),
        'leadStorageOutsideRepository',
        checks
      );

      const storedLead = JSON.parse(
        lines[0]
      );

      check(
        storedLead.email ===
          'local-admission@example.com' &&
        storedLead.paymentDataCollected === false &&
        storedLead.cardDataCollected === false,
        'storedLeadContainsNoFinancialData',
        checks
      );
    }

    check(
      mount.paymentCaptureEnabled === false &&
      mount.officialTaxInvoiceEnabled === false &&
      mount.cardDataCollectionEnabled === false,
      'mountFinancialBoundariesPreserved',
      checks
    );

    const failedChecks = Object.entries(checks)
      .filter(([, passed]) => !passed)
      .map(([name]) => name);

    const output = {
      schemaVersion: '1.0.0',
      system:
        'SHEIKHA_LOCAL_SALES_ENDPOINT_ADMISSION_V1',
      server: {
        host: '127.0.0.1',
        ephemeralPortUsed: true,
        port
      },
      mount,
      observations,
      checks,
      failedChecks,
      execution: {
        syntheticLeadOnly: true,
        realCustomerDataUsed: false,
        paymentCaptureExecuted: false,
        officialTaxInvoiceIssued: false,
        revenueRecognized: false,
        productionDeploymentExecuted: false
      },
      passed: failedChecks.length === 0
    };

    process.stdout.write(
      JSON.stringify(output, null, 2) + '\n'
    );

    if (!output.passed) {
      process.exitCode = 1;
    }
  } finally {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  }
}

main().catch((error) => {
  process.stderr.write(
    `${error.stack || error.message}\n`
  );

  process.exitCode = 1;
});
