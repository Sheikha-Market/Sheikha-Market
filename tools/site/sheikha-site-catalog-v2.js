#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const PUBLIC_ROOT = path.join(ROOT, 'public');
const RUNTIME_DIR = path.join(ROOT, 'runtime', 'site', 'v2');
const PUBLIC_CATALOG_DIR = path.join(PUBLIC_ROOT, 'site-map');
const INVENTORY_PATH = path.join(
  RUNTIME_DIR,
  'sheikha-site-page-inventory-v2.json'
);
const LINK_AUDIT_PATH = path.join(
  RUNTIME_DIR,
  'sheikha-site-link-audit-v2.json'
);
const REGISTRY_PATH = path.join(
  RUNTIME_DIR,
  'sheikha-site-route-domain-registry-v2.json'
);
const PUBLIC_CATALOG_PATH = path.join(
  PUBLIC_CATALOG_DIR,
  'catalog.json'
);
const SITE_POLICY = require('../../config/sheikha-site-route-policy-v2.json');

const DOMAIN_DEFINITIONS = Object.freeze({
  identity: {
    labelAr: 'الهوية والتعريف',
    descriptionAr: 'الصفحة الرئيسية والهوية والشركة والتعريف العام.',
  },
  marketplace: {
    labelAr: 'السوق والقطاعات',
    descriptionAr: 'الأسواق والمنتجات والمعادن والسكراب والفرص.',
  },
  commerce: {
    labelAr: 'التجارة والعملاء',
    descriptionAr: 'التسجيل والطلبات والعقود والدفع والخدمات التجارية.',
  },
  logistics: {
    labelAr: 'اللوجستيات وسلاسل الإمداد',
    descriptionAr: 'النقل والشحن والتتبع والتوريد والخدمات المساندة.',
  },
  enterprise: {
    labelAr: 'المؤسسة والجهات',
    descriptionAr: 'الشركات والحكومة والإدارة ومراكز التحكم.',
  },
  knowledge: {
    labelAr: 'المعرفة والمجتمع',
    descriptionAr: 'المعرفة والأبحاث والمجتمع ورياض الجنة.',
  },
  developer: {
    labelAr: 'البناء والتطوير',
    descriptionAr: 'لغة شيخة وIDE وSystem Builder والعمارة والتكامل.',
  },
  native: {
    labelAr: 'الإقلاع والعتاد',
    descriptionAr: 'Bare Metal وUEFI وصور الإقلاع وتوافق الأجهزة.',
  },
  operations: {
    labelAr: 'التشغيل والمراقبة',
    descriptionAr: 'الصحة والمراقبة والتوزيع ولوحات التشغيل.',
  },
  governance: {
    labelAr: 'الحوكمة والامتثال',
    descriptionAr: 'السياسات والشروط والخصوصية والحوكمة والمراجعة.',
  },
  general: {
    labelAr: 'خدمات ومنظومات أخرى',
    descriptionAr: 'صفحات عامة تحتاج تصنيفًا أدق في دورة المراجعة.',
  },
});

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function listHtmlFiles(directory = PUBLIC_ROOT) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...listHtmlFiles(absolute));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      files.push(absolute);
    }
  }
  return files.sort();
}

function routeForFile(relativeFile) {
  const normalized = toPosix(relativeFile);
  if (normalized === 'index.html') return '/';
  if (normalized.endsWith('/index.html')) {
    return `/${normalized.slice(0, -'index.html'.length)}`;
  }
  return `/${normalized}`;
}

function primaryRouteForFile(relativeFile) {
  const publicFile = `public/${toPosix(relativeFile)}`;
  return Object.entries(SITE_POLICY.primaryRoutes)
    .find(([, file]) => file === publicFile)?.[0] || null;
}

function stripMarkup(value = '') {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstMatch(source, expression) {
  return expression.exec(source)?.[1]?.trim() || null;
}

function extractReferences(source) {
  const values = [];
  const tags = source.match(/<[a-z][^>]*>/gi) || [];
  for (const tag of tags) {
    const expression = /(?:^|\s)(?:href|src|action)\s*=\s*(["'])(.*?)\1/gi;
    let match;
    while ((match = expression.exec(tag)) !== null) {
      values.push(match[2].trim());
    }
  }
  return values;
}

function isPlaceholderReference(reference) {
  const value = reference.trim().toLowerCase();
  return value === '#' ||
    value === 'javascript:void(0)' ||
    value === 'javascript:void(0);';
}

function isExternalReference(reference) {
  return /^(?:https?:)?\/\//i.test(reference) ||
    /^(?:mailto|tel|data|blob):/i.test(reference);
}

function cleanReference(reference) {
  return reference.split('#', 1)[0].split('?', 1)[0];
}

function localCandidates(pageFile, reference) {
  const cleaned = cleanReference(reference);
  if (!cleaned ||
      cleaned.startsWith('/api/') ||
      cleaned.startsWith('/runtime/') ||
      cleaned.startsWith('/docs/') ||
      cleaned.startsWith('/openapi/') ||
      cleaned.includes('${') ||
      cleaned.includes('{{')) {
    return [];
  }

  let decoded = cleaned;
  try {
    decoded = decodeURIComponent(cleaned);
  } catch {
    // Keep the original path when percent encoding is malformed.
  }

  const policyRoute = SITE_POLICY.aliases[decoded] || decoded;
  const declaredFile = SITE_POLICY.primaryRoutes[policyRoute];
  const base = decoded.startsWith('/')
    ? path.join(PUBLIC_ROOT, decoded.replace(/^\/+/, ''))
    : path.resolve(path.dirname(pageFile), decoded);
  const candidates = declaredFile
    ? [path.join(ROOT, declaredFile), base]
    : [base];
  if (decoded.endsWith('/')) {
    candidates.push(path.join(base, 'index.html'));
  } else if (!path.extname(decoded)) {
    candidates.push(`${base}.html`, path.join(base, 'index.html'));
  }
  return [...new Set(candidates)];
}

function resolveLocalReference(pageFile, reference) {
  if (!reference ||
      reference.startsWith('#') ||
      isPlaceholderReference(reference) ||
      isExternalReference(reference)) {
    return { checked: false, exists: true, candidates: [] };
  }
  const candidates = localCandidates(pageFile, reference);
  if (candidates.length === 0) {
    return { checked: false, exists: true, candidates: [] };
  }
  return {
    checked: true,
    exists: candidates.some((candidate) => fs.existsSync(candidate)),
    candidates: candidates.map((candidate) =>
      toPosix(path.relative(ROOT, candidate))
    ),
  };
}

function classifyVisibility(relativeFile) {
  const normalized = toPosix(relativeFile);
  const first = normalized.split('/')[0];
  const route = routeForFile(normalized);
  if (first === '_archive') return 'ARCHIVE_REVIEW_ONLY';
  if (SITE_POLICY.protectedPageRoutes.includes(route) ||
      SITE_POLICY.protectedPrefixes.some((prefix) =>
        route.startsWith(prefix)
      )) {
    return 'PROTECTED_OPERATIONAL';
  }
  if (['generated-images', 'layouts'].includes(first)) {
    return 'TEMPLATE_OR_GENERATED_ASSET';
  }
  return 'PUBLIC';
}

function classifyDomain(relativeFile, title = '') {
  const normalized = toPosix(relativeFile);
  if (normalized === 'market/index.html') return 'marketplace';
  if ([
    'technology/index.html',
    'product-technical/index.html',
  ].includes(normalized)) {
    return 'developer';
  }
  if (normalized === 'constructive-dialogue/index.html') {
    return 'knowledge';
  }
  if (normalized === 'sheikha-dashboards/index.html') {
    return 'operations';
  }
  const value = `${relativeFile} ${title}`.toLowerCase();
  const rules = [
    ['governance', /شريع|حوكم|امتثال|قانون|سياس|خصوص|شروط|استرداد|govern/],
    ['native', /bare.?metal|uefi|boot.?trial|إقلاع|نواة|عتاد|firmware/],
    ['developer', /\bide\b|system-builder|architecture|برمج|تقني|مطور|تكامل|api|sdk/],
    ['logistics', /لوجست|شحن|نقل|توريد|إمداد|تتبع|مخازن|logistic|supply/],
    ['commerce', /تسجيل|دخول|طلب|فاتور|دفع|عقد|عميل|commercial|register|checkout/],
    ['marketplace', /سوق|معادن|سكراب|منتج|متاجر|مورد|عرض|market|metal|scrap/],
    ['enterprise', /مؤسس|شركة|حكوم|إدار|تنفيذي|enterprise|company|government/],
    ['knowledge', /معرف|مجتمع|أبحاث|تعليم|رياض|ويكي|knowledge|community|research/],
    ['operations', /مراقب|تشغيل|صحة|توزيع|مؤشر|لوحة|monitor|runtime|dashboard|control/],
    ['identity', /(^|\/)index\.html$|هوي|تعريف|من نحن|identity|about/],
  ];
  return rules.find(([, expression]) => expression.test(value))?.[0] ||
    'general';
}

function hashFile(filePath) {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex');
}

function canonicalPriority(page) {
  if (page.route === '/') return 0;
  if (page.visibility === 'PUBLIC' && page.route.endsWith('/')) return 1;
  if (page.visibility === 'PUBLIC') return 2;
  if (page.visibility === 'PROTECTED_OPERATIONAL') return 3;
  if (page.visibility === 'TEMPLATE_OR_GENERATED_ASSET') return 4;
  return 5;
}

function inspectPage(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const relativeFile = toPosix(path.relative(PUBLIC_ROOT, filePath));
  const physicalRoute = routeForFile(relativeFile);
  const declaredPrimaryRoute = primaryRouteForFile(relativeFile);
  const references = extractReferences(source);
  const placeholderReferences = references.filter(isPlaceholderReference);
  const brokenLocalReferences = references
    .map((reference) => ({
      reference,
      resolution: resolveLocalReference(filePath, reference),
    }))
    .filter((entry) => entry.resolution.checked && !entry.resolution.exists)
    .map((entry) => ({
      reference: entry.reference,
      candidates: entry.resolution.candidates,
    }));
  const title = stripMarkup(
    firstMatch(source, /<title\b[^>]*>([\s\S]*?)<\/title>/i) || ''
  ) || null;
  const h1 = stripMarkup(
    firstMatch(source, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || ''
  ) || null;
  const htmlTag = firstMatch(source, /<html\b([^>]*)>/i) || '';
  const language = firstMatch(htmlTag, /\blang\s*=\s*["']([^"']+)["']/i);
  const direction = firstMatch(htmlTag, /\bdir\s*=\s*["']([^"']+)["']/i);
  const description = firstMatch(
    source,
    /<meta\b(?=[^>]*\bname\s*=\s*["']description["'])[^>]*\bcontent\s*=\s*["']([^"']*)["'][^>]*>/i
  );
  const hasViewport = /<meta\b(?=[^>]*\bname\s*=\s*["']viewport["'])/i
    .test(source);
  const visibility = classifyVisibility(relativeFile);

  return {
    id: crypto.createHash('sha1').update(relativeFile).digest('hex').slice(0, 12),
    file: `public/${relativeFile}`,
    relativeFile,
    route: declaredPrimaryRoute || physicalRoute,
    physicalRoute,
    declaredPrimaryRoute,
    title,
    h1,
    language,
    direction,
    description,
    hasViewport,
    visibility,
    domain: classifyDomain(relativeFile, title || ''),
    bytes: Buffer.byteLength(source),
    sha256: hashFile(filePath),
    referenceCount: references.length,
    placeholderReferenceCount: placeholderReferences.length,
    placeholderReferences: [...new Set(placeholderReferences)],
    brokenLocalReferenceCount: brokenLocalReferences.length,
    brokenLocalReferences,
    quality: {
      titlePresent: Boolean(title),
      h1Present: Boolean(h1),
      arabicLanguageDeclared: language === 'ar',
      rtlDeclared: direction === 'rtl',
      viewportPresent: hasViewport,
      descriptionPresent: Boolean(description),
      localReferencesResolve: brokenLocalReferences.length === 0,
      noPlaceholderControls: placeholderReferences.length === 0,
    },
  };
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function generate() {
  const generatedAt = new Date().toISOString();
  const pages = listHtmlFiles().map(inspectPage);
  const hashGroups = new Map();
  for (const page of pages) {
    const group = hashGroups.get(page.sha256) || [];
    group.push(page);
    hashGroups.set(page.sha256, group);
  }

  const duplicateGroups = [...hashGroups.values()]
    .filter((group) => group.length > 1)
    .map((group) => {
      const sorted = [...group].sort((left, right) =>
        canonicalPriority(left) - canonicalPriority(right) ||
        left.route.localeCompare(right.route, 'ar')
      );
      return {
        sha256: group[0].sha256,
        canonicalRoute: sorted[0].route,
        canonicalFile: sorted[0].file,
        aliases: sorted.slice(1).map((page) => ({
          route: page.route,
          file: page.file,
        })),
      };
    });
  const duplicateByHash = new Map(
    duplicateGroups.map((group) => [group.sha256, group])
  );
  for (const page of pages) {
    const duplicate = duplicateByHash.get(page.sha256);
    page.canonicalRoute = duplicate?.canonicalRoute || page.route;
    page.isCanonical = page.route === page.canonicalRoute;
    page.aliasOf = page.isCanonical ? null : page.canonicalRoute;
    page.readiness = page.brokenLocalReferenceCount === 0 &&
      page.placeholderReferenceCount === 0
      ? 'ROUTE_READY'
      : 'NEEDS_LINK_OR_CONTROL_REPAIR';
  }

  const visibilityCounts = Object.fromEntries(
    [...new Set(pages.map((page) => page.visibility))].map((visibility) => [
      visibility,
      pages.filter((page) => page.visibility === visibility).length,
    ])
  );
  const domains = Object.entries(DOMAIN_DEFINITIONS).map(([id, definition]) => {
    const domainPages = pages.filter((page) =>
      page.domain === id && page.visibility === 'PUBLIC'
    );
    return {
      id,
      ...definition,
      publicPageCount: domainPages.length,
      canonicalPageCount: domainPages.filter((page) => page.isCanonical).length,
      routes: domainPages
        .filter((page) => page.isCanonical)
        .map((page) => page.route)
        .sort((left, right) => left.localeCompare(right, 'ar')),
    };
  });
  const brokenPages = pages.filter((page) =>
    page.brokenLocalReferenceCount > 0
  );
  const placeholderPages = pages.filter((page) =>
    page.placeholderReferenceCount > 0
  );
  const canonicalRouteSet = new Set(
    pages
      .filter((page) => page.isCanonical)
      .map((page) => page.route)
  );
  const aliasRouteMap = new Map();
  for (const page of pages.filter((entry) => !entry.isCanonical)) {
    aliasRouteMap.set(page.route, {
      route: page.route,
      canonicalRoute: page.canonicalRoute,
      file: page.file,
      source: 'IDENTICAL_ARTIFACT'
    });
  }
  for (const page of pages.filter((entry) =>
    entry.physicalRoute !== entry.route
  )) {
    aliasRouteMap.set(page.physicalRoute, {
      route: page.physicalRoute,
      canonicalRoute: page.route,
      file: page.file,
      source: 'DECLARED_PRIMARY_ROUTE'
    });
  }
  for (const [route, canonicalRoute] of Object.entries(SITE_POLICY.aliases)) {
    if (canonicalRouteSet.has(route)) continue;
    aliasRouteMap.set(route, {
      route,
      canonicalRoute,
      file: null,
      source: 'DECLARED_ROUTE_POLICY'
    });
  }
  const aliasRoutes = [...aliasRouteMap.values()].sort((left, right) =>
    left.route.localeCompare(right.route, 'ar')
  );
  const routePolicyChecks = {
    primaryRouteFilesExist: Object.values(SITE_POLICY.primaryRoutes)
      .every((file) => fs.existsSync(path.join(ROOT, file))),
    aliasTargetsAreCanonical: aliasRoutes.every((alias) =>
      canonicalRouteSet.has(alias.canonicalRoute)
    ),
    dashboardCanonicalRoutePresent: canonicalRouteSet.has('/dashboard/'),
    marketCanonicalRoutePresent: canonicalRouteSet.has('/market/'),
    technologyCanonicalRoutePresent: canonicalRouteSet.has('/technology/'),
    productTechnicalCanonicalRoutePresent:
      canonicalRouteSet.has('/product-technical/'),
    constructiveDialogueCanonicalRoutePresent:
      canonicalRouteSet.has('/constructive-dialogue/')
  };

  const inventory = {
    schemaVersion: '2.0.0',
    system: 'SHEIKHA_SITE_PAGE_INVENTORY_V2',
    generatedAt,
    root: 'public',
    totalHtmlPages: pages.length,
    canonicalPageCount: pages.filter((page) => page.isCanonical).length,
    duplicateGroupCount: duplicateGroups.length,
    visibilityCounts,
    duplicateGroups,
    pages,
    destructiveChangesPerformed: false,
  };
  const linkAudit = {
    schemaVersion: '2.0.0',
    system: 'SHEIKHA_SITE_LINK_AUDIT_V2',
    generatedAt,
    totalPages: pages.length,
    pagesWithBrokenLocalReferences: brokenPages.length,
    brokenLocalReferenceCount: brokenPages.reduce(
      (total, page) => total + page.brokenLocalReferenceCount,
      0
    ),
    pagesWithPlaceholderControls: placeholderPages.length,
    placeholderReferenceCount: placeholderPages.reduce(
      (total, page) => total + page.placeholderReferenceCount,
      0
    ),
    brokenPages: brokenPages.map((page) => ({
      file: page.file,
      route: page.route,
      visibility: page.visibility,
      brokenLocalReferences: page.brokenLocalReferences,
    })),
    placeholderPages: placeholderPages.map((page) => ({
      file: page.file,
      route: page.route,
      visibility: page.visibility,
      placeholderReferences: page.placeholderReferences,
      placeholderReferenceCount: page.placeholderReferenceCount,
    })),
    autoRepairPerformed: false,
  };
  const registry = {
    schemaVersion: '2.0.0',
    system: 'SHEIKHA_SITE_ROUTE_DOMAIN_REGISTRY_V2',
    generatedAt,
    status: 'ACTIVE_GENERATED_REGISTRY',
    identity: {
      nameAr: 'شيخة',
      nameEn: 'SHEIKHA',
      primaryDomain: 'sheikha.top',
      primaryLocalRuntime: 'http://127.0.0.1:8080',
      direction: 'rtl',
      language: 'ar',
      values: ['العدل', 'الأمانة', 'الشفافية', 'الإتقان', 'منع الضرر'],
    },
    hostnames: [
      {
        hostname: 'sheikha.top',
        role: 'CANONICAL_PUBLIC_DOMAIN',
        deploymentVerifiedByThisRun: false,
      },
      {
        hostname: 'www.sheikha.top',
        role: 'PUBLIC_ALIAS_REQUIRES_REDIRECT_VERIFICATION',
        deploymentVerifiedByThisRun: false,
      },
      {
        hostname: 'api.sheikha.top',
        role: 'DECLARED_API_DOMAIN_NOT_LOCALLY_BOUND',
        deploymentVerifiedByThisRun: false,
      },
      {
        hostname: '127.0.0.1:8080',
        role: 'LOCAL_DEVELOPMENT_RUNTIME',
        deploymentVerifiedByThisRun: true,
      },
    ],
    domains,
    canonicalRoutes: pages
      .filter((page) => page.isCanonical)
      .map((page) => ({
        route: page.route,
        file: page.file,
        domain: page.domain,
        visibility: page.visibility,
        readiness: page.readiness,
      })),
    aliasRoutes,
    policies: {
      singleCanonicalRoutePerIdenticalArtifact: true,
      aliasesPreserved: true,
      archivesExcludedFromPublicNavigation: true,
      protectedPagesExcludedFromPublicCatalog: true,
      noDeleteWithoutHumanReview: true,
      externalDomainStateMustBeVerifiedBeforeClaim: true,
    },
    routePolicyChecks,
    sourceInventory: toPosix(path.relative(ROOT, INVENTORY_PATH)),
    sourceLinkAudit: toPosix(path.relative(ROOT, LINK_AUDIT_PATH)),
  };
  const publicCatalog = {
    schemaVersion: '2.0.0',
    system: 'SHEIKHA_PUBLIC_SITE_CATALOG_V2',
    generatedAt,
    identity: registry.identity,
    domains,
    summary: {
      discoveredHtmlPages: pages.length,
      canonicalHtmlPages: pages.filter((page) => page.isCanonical).length,
      duplicateGroups: duplicateGroups.length,
      publicPages: pages.filter((page) => page.visibility === 'PUBLIC').length,
      publicCanonicalPages: pages.filter((page) =>
        page.visibility === 'PUBLIC' && page.isCanonical
      ).length,
      archivePages: visibilityCounts.ARCHIVE_REVIEW_ONLY || 0,
      protectedPages: visibilityCounts.PROTECTED_OPERATIONAL || 0,
      templatePages:
        visibilityCounts.TEMPLATE_OR_GENERATED_ASSET || 0,
      publicPagesWithBrokenLocalReferences: pages.filter((page) =>
        page.visibility === 'PUBLIC' &&
        page.brokenLocalReferences.length > 0
      ).length,
      publicBrokenLocalReferenceCount: pages
        .filter((page) => page.visibility === 'PUBLIC')
        .reduce(
          (total, page) => total + page.brokenLocalReferences.length,
          0
        ),
      publicPagesWithPlaceholderControls: pages.filter((page) =>
        page.visibility === 'PUBLIC' &&
        page.placeholderReferenceCount > 0
      ).length,
    },
    pages: pages
      .filter((page) => page.visibility === 'PUBLIC' && page.isCanonical)
      .map((page) => ({
        id: page.id,
        route: page.route,
        title: page.title || page.h1 || page.relativeFile,
        h1: page.h1,
        domain: page.domain,
        readiness: page.readiness,
      })),
  };

  writeJson(INVENTORY_PATH, inventory);
  writeJson(LINK_AUDIT_PATH, linkAudit);
  writeJson(REGISTRY_PATH, registry);
  writeJson(PUBLIC_CATALOG_PATH, publicCatalog);
  return { inventory, linkAudit, registry, publicCatalog };
}

if (require.main === module) {
  try {
    const result = generate();
    console.log(JSON.stringify({
      system: result.registry.system,
      status: result.registry.status,
      totalHtmlPages: result.inventory.totalHtmlPages,
      canonicalPageCount: result.inventory.canonicalPageCount,
      duplicateGroupCount: result.inventory.duplicateGroupCount,
      pagesWithBrokenLocalReferences:
        result.linkAudit.pagesWithBrokenLocalReferences,
      brokenLocalReferenceCount:
        result.linkAudit.brokenLocalReferenceCount,
      pagesWithPlaceholderControls:
        result.linkAudit.pagesWithPlaceholderControls,
      publicCatalog: toPosix(path.relative(ROOT, PUBLIC_CATALOG_PATH)),
    }, null, 2));
  } catch (error) {
    console.error(`[SHEIKHA_SITE_CATALOG_V2] ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  DOMAIN_DEFINITIONS,
  INVENTORY_PATH,
  LINK_AUDIT_PATH,
  PUBLIC_CATALOG_PATH,
  REGISTRY_PATH,
  classifyDomain,
  classifyVisibility,
  extractReferences,
  generate,
  localCandidates,
  primaryRouteForFile,
  resolveLocalReference,
  routeForFile,
};
