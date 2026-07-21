'use strict';

const fs = require('node:fs');

const {
  INVENTORY_PATH,
  PUBLIC_CATALOG_PATH,
  REGISTRY_PATH,
  classifyDomain,
  classifyVisibility,
  primaryRouteForFile,
  routeForFile,
} = require('../tools/site/sheikha-site-catalog-v2');

describe('Sheikha site catalog V2', () => {
  test('maps index pages and regular files to stable routes', () => {
    expect(routeForFile('index.html')).toBe('/');
    expect(routeForFile('market/index.html')).toBe('/market/');
    expect(routeForFile('sheikha-dashboards/index.html')).toBe(
      '/sheikha-dashboards/'
    );
    expect(primaryRouteForFile('sheikha-dashboards/index.html')).toBe(
      '/dashboard/'
    );
    expect(primaryRouteForFile('technology/index.html')).toBe(
      '/technology/'
    );
    expect(primaryRouteForFile('product-technical/index.html')).toBe(
      '/product-technical/'
    );
    expect(routeForFile('الشريعة-الاسلامية.html')).toBe(
      '/الشريعة-الاسلامية.html'
    );
  });

  test('separates public, protected, and archive surfaces', () => {
    expect(classifyVisibility('index.html')).toBe('PUBLIC');
    expect(classifyVisibility('_admin/panel.html')).toBe(
      'PROTECTED_OPERATIONAL'
    );
    expect(classifyVisibility('_archive/old.html')).toBe(
      'ARCHIVE_REVIEW_ONLY'
    );
  });

  test('classifies primary business and engineering domains', () => {
    expect(classifyDomain('market/index.html', 'سوق شيخة')).toBe(
      'marketplace'
    );
    expect(classifyDomain('system-builder-workbench/index.html')).toBe(
      'developer'
    );
    expect(classifyDomain('technology/index.html')).toBe('developer');
    expect(classifyDomain('product-technical/index.html')).toBe(
      'developer'
    );
    expect(classifyDomain('boot-trial/index.html')).toBe('native');
    expect(classifyDomain('sheikha-dashboards/index.html')).toBe(
      'operations'
    );
    expect(classifyDomain('نظام-اللوجستيات.html')).toBe('logistics');
  });

  test('records every HTML page but exposes only public canonical pages', () => {
    const inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));
    const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    const publicCatalog = JSON.parse(
      fs.readFileSync(PUBLIC_CATALOG_PATH, 'utf8')
    );

    expect(inventory.totalHtmlPages).toBeGreaterThan(200);
    expect(registry.policies.aliasesPreserved).toBe(true);
    expect(registry.routePolicyChecks).toEqual({
      primaryRouteFilesExist: true,
      aliasTargetsAreCanonical: true,
      dashboardCanonicalRoutePresent: true,
      marketCanonicalRoutePresent: true,
      technologyCanonicalRoutePresent: true,
      productTechnicalCanonicalRoutePresent: true,
    });
    expect(registry.aliasRoutes).toEqual(expect.arrayContaining([
      expect.objectContaining({
        route: '/uefi',
        canonicalRoute: '/boot-trial/',
        source: 'DECLARED_ROUTE_POLICY',
      }),
      expect.objectContaining({
        route: '/tech',
        canonicalRoute: '/technology/',
        source: 'DECLARED_ROUTE_POLICY',
      }),
      expect.objectContaining({
        route: '/technical-product',
        canonicalRoute: '/product-technical/',
        source: 'DECLARED_ROUTE_POLICY',
      }),
    ]));
    expect(publicCatalog.pages.length).toBeGreaterThan(0);
    expect(
      publicCatalog.summary.publicPages +
      publicCatalog.summary.archivePages +
      publicCatalog.summary.protectedPages +
      publicCatalog.summary.templatePages
    ).toBe(publicCatalog.summary.discoveredHtmlPages);
    expect(
      publicCatalog.summary.publicBrokenLocalReferenceCount
    ).toBe(0);
    expect(
      publicCatalog.summary.publicPagesWithPlaceholderControls
    ).toBe(0);
    expect(publicCatalog.pages.every((page) =>
      !page.route.startsWith('/_admin/') &&
      !page.route.startsWith('/_archive/')
    )).toBe(true);
  });
});
