'use strict';

const express = require('express');
const request = require('supertest');

const aliases = require(
  '../routes/site-registry/sheikha-public-route-aliases-v2'
);
const registryRoutes = require(
  '../routes/site-registry/sheikha-site-registry-routes-v2'
);
const {
  getStatus,
  resolvePublicRoute,
} = require('../core/site-registry/sheikha-site-registry-v2');

describe('Sheikha site registry routes V2', () => {
  test('reports the complete inventory without exposing internal pages', () => {
    const status = getStatus();
    expect(status.counts.discoveredHtmlPages).toBeGreaterThan(200);
    expect(status.counts.publicPages).toBeGreaterThan(0);
    expect(status.counts.protectedPages).toBeGreaterThan(0);
  });

  test('resolves canonical and identical alias pages', () => {
    expect(resolvePublicRoute('/market/')).toMatchObject({
      found: true,
      canonicalRoute: '/market/',
    });
    expect(resolvePublicRoute('/_admin/sheikha-command-center.html'))
      .toMatchObject({ found: false });
    expect(resolvePublicRoute('/gardens')).toMatchObject({
      found: true,
      canonicalRoute: '/riyadh-aljannah-community/',
      alias: true,
    });
    expect(resolvePublicRoute('/technology/')).toMatchObject({
      found: true,
      canonicalRoute: '/technology/',
    });
    expect(resolvePublicRoute('/technical-product')).toMatchObject({
      found: true,
      canonicalRoute: '/product-technical/',
      alias: true,
    });
  });

  test('serves public APIs and canonical redirects', async () => {
    const app = express();
    app.use('/', aliases);
    app.use('/api/site-registry/v2', registryRoutes);

    const status = await request(app).get('/api/site-registry/v2/status');
    expect(status.status).toBe(200);
    expect(status.body.ok).toBe(true);

    const redirect = await request(app).get('/سوق-شيخة.html');
    expect(redirect.status).toBe(308);
    expect(redirect.headers.location).toBe('/market/');

    const uefi = await request(app).get('/uefi');
    expect(uefi.status).toBe(308);
    expect(uefi.headers.location).toBe('/boot-trial/');

    const technology = await request(app).get('/tech');
    expect(technology.status).toBe(308);
    expect(technology.headers.location).toBe('/technology/');

    const technicalProduct = await request(app).get('/technical-product');
    expect(technicalProduct.status).toBe(308);
    expect(technicalProduct.headers.location).toBe('/product-technical/');

    const archive = await request(app).get('/_archive/index-old.html');
    expect(archive.status).toBe(404);
  });
});
