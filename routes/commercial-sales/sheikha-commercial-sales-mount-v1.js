'use strict';

const path = require('path');
const express = require('express');

const {
  buildRouter
} = require(
  './sheikha-commercial-sales-routes-v1'
);

const COMMERCIAL_PUBLIC_DIR = path.resolve(
  __dirname,
  '../../public/commercial'
);

function applyCommercialHeaders(req, res, next) {
  res.setHeader(
    'X-Content-Type-Options',
    'nosniff'
  );

  res.setHeader(
    'Referrer-Policy',
    'strict-origin-when-cross-origin'
  );

  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'"
    ].join('; ')
  );

  next();
}

function applyApiHeaders(req, res, next) {
  res.setHeader(
    'Cache-Control',
    'no-store, max-age=0'
  );

  res.setHeader('Pragma', 'no-cache');

  next();
}

function rejectFinancialSecrets(req, res, next) {
  const prohibitedPattern =
    /card(number)?|cvv|cvc|pin|password|secret|privatekey/i;

  const queue = [req.body];
  const prohibitedFields = [];

  while (queue.length) {
    const current = queue.shift();

    if (
      !current ||
      typeof current !== 'object'
    ) {
      continue;
    }

    for (const [key, value] of Object.entries(current)) {
      if (prohibitedPattern.test(key)) {
        prohibitedFields.push(key);
      }

      if (
        value &&
        typeof value === 'object'
      ) {
        queue.push(value);
      }
    }
  }

  if (prohibitedFields.length) {
    return res.status(400).json({
      success: false,
      error: 'PROHIBITED_FINANCIAL_OR_SECRET_DATA',
      prohibitedFields,
      messageAr:
        'لا تُرسل بيانات بطاقات أو كلمات مرور أو أسرار من خلال هذا المسار.'
    });
  }

  return next();
}

function mountCommercialSales(app, options = {}) {
  if (!app || typeof app.use !== 'function') {
    throw new TypeError(
      'Express application is required'
    );
  }

  const apiBasePath =
    options.apiBasePath ||
    '/api/commercial/v1';

  const staticBasePath =
    options.staticBasePath ||
    '/commercial';

  const dataDir = options.dataDir;

  app.disable('x-powered-by');

  app.use(
    apiBasePath,
    applyCommercialHeaders,
    applyApiHeaders,
    express.json({
      limit: '32kb',
      strict: true,
      type: 'application/json'
    }),
    rejectFinancialSecrets,
    buildRouter({ dataDir })
  );

  app.use(
    staticBasePath,
    applyCommercialHeaders,
    express.static(
      COMMERCIAL_PUBLIC_DIR,
      {
        index: 'index.html',
        fallthrough: false,
        dotfiles: 'deny',
        etag: true,
        maxAge: '5m'
      }
    )
  );

  return {
    success: true,
    system:
      'SHEIKHA_COMMERCIAL_SALES_MOUNT_V1',
    apiBasePath,
    staticBasePath,
    publicDirectory: COMMERCIAL_PUBLIC_DIR,
    paymentCaptureEnabled: false,
    officialTaxInvoiceEnabled: false,
    cardDataCollectionEnabled: false,
    humanApprovalRequired: true
  };
}

module.exports = {
  COMMERCIAL_PUBLIC_DIR,
  applyCommercialHeaders,
  applyApiHeaders,
  rejectFinancialSecrets,
  mountCommercialSales
};
