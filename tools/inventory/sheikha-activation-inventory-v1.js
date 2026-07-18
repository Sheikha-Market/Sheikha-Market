'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const OUTPUT = path.join(
  ROOT,
  'runtime/governance/foundational-charter/v1/evidence/sheikha-activation-inventory-v1.json'
);

const SCAN_ROOTS = ['core', 'runtime', 'routes', 'tools', 'tests', 'docs'];
const SKIP_DIRS = new Set(['node_modules', '.git', 'coverage', 'dist', 'reports']);
const ID_PATTERN = /\bSHEIKHA_[A-Z0-9_]+_V[0-9]+\b/g;
const TEXT_EXTENSIONS = new Set([
  '.js', '.cjs', '.mjs', '.json', '.md', '.txt', '.yaml', '.yml', '.sh'
]);
const LEGACY_PATTERNS = [
  'إمبراطورية شيخة',
  'الملك الحكيم',
  'الإمبراطور',
  'سيادة مطلقة',
  'وعي صناعي'
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function rel(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function safeRead(file) {
  const stat = fs.statSync(file);
  if (stat.size > 2 * 1024 * 1024) return '';
  return fs.readFileSync(file, 'utf8');
}

function classify(record) {
  const hasSource = record.sourcePaths.length > 0;
  const hasTest = record.testPaths.length > 0;
  const hasDocs = record.documentationPaths.length > 0;
  const hasBlockedMarker = record.blockedMarkers.length > 0;
  const hasLegacy = record.legacyMarkers.length > 0;

  if (hasLegacy) return 'LEGACY';
  if (hasBlockedMarker) return 'BLOCKED';
  if (hasSource && hasTest) return 'VERIFIED';
  if (hasSource) return 'IMPLEMENTED';
  if (hasDocs) return 'DECLARED';
  return 'DECLARED';
}

const records = new Map();
const files = SCAN_ROOTS.flatMap((root) => walk(path.join(ROOT, root)));

for (const file of files) {
  const relative = rel(file);
  let text = '';
  try {
    text = safeRead(file);
  } catch {
    continue;
  }
  const ids = [...new Set(text.match(ID_PATTERN) || [])];
  if (ids.length === 0) continue;

  for (const id of ids) {
    if (!records.has(id)) {
      records.set(id, {
        id,
        sourcePaths: [],
        testPaths: [],
        documentationPaths: [],
        evidencePaths: [],
        blockedMarkers: [],
        legacyMarkers: []
      });
    }
    const record = records.get(id);

    if (relative.startsWith('tests/')) {
      record.testPaths.push(relative);
    } else if (relative.startsWith('docs/')) {
      record.documentationPaths.push(relative);
    } else {
      record.sourcePaths.push(relative);
    }

    if (relative.includes('/evidence/') || relative.includes('admission')) {
      record.evidencePaths.push(relative);
    }

    if (/\b(BLOCKED|FAILED)\b/.test(text)) {
      record.blockedMarkers.push(relative);
    }

    for (const legacy of LEGACY_PATTERNS) {
      if (text.includes(legacy)) {
        record.legacyMarkers.push({ path: relative, marker: legacy });
      }
    }
  }
}

const systems = [...records.values()]
  .map((record) => {
    for (const key of [
      'sourcePaths',
      'testPaths',
      'documentationPaths',
      'evidencePaths',
      'blockedMarkers'
    ]) {
      record[key] = [...new Set(record[key])].sort();
    }
    record.legacyMarkers = record.legacyMarkers
      .filter((item, index, arr) =>
        arr.findIndex((x) => x.path === item.path && x.marker === item.marker) === index
      )
      .sort((a, b) => `${a.path}:${a.marker}`.localeCompare(`${b.path}:${b.marker}`));
    record.classification = classify(record);
    record.classificationBasis = {
      sourceCount: record.sourcePaths.length,
      testCount: record.testPaths.length,
      documentationCount: record.documentationPaths.length,
      evidenceCount: record.evidencePaths.length,
      blockedMarkerCount: record.blockedMarkers.length,
      legacyMarkerCount: record.legacyMarkers.length
    };
    record.humanReviewRequired = true;
    return record;
  })
  .sort((a, b) => a.id.localeCompare(b.id));

const summary = {
  VERIFIED: 0,
  IMPLEMENTED: 0,
  DECLARED: 0,
  LEGACY: 0,
  BLOCKED: 0
};
for (const system of systems) summary[system.classification] += 1;

let commits = [];
try {
  commits = execFileSync(
    'git',
    ['log', '-n', '250', '--pretty=format:%H%x09%s'],
    { cwd: ROOT, encoding: 'utf8' }
  )
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [sha, ...subject] = line.split('\t');
      return { sha, subject: subject.join('\t') };
    });
} catch {
  commits = [];
}

const inventory = {
  system: 'SHEIKHA_ACTIVATION_INVENTORY_V1',
  generatedAt: new Date().toISOString(),
  repositoryHead: execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: ROOT,
    encoding: 'utf8'
  }).trim(),
  classificationPolicy: {
    VERIFIED: 'معرّف ظاهر في مصدر واختبار؛ يبقى الاعتماد الإنتاجي بحاجة إلى دليل تشغيل خاص.',
    IMPLEMENTED: 'مصدر تنفيذي موجود دون اختبار مطابق ظاهر في هذا الجرد.',
    DECLARED: 'تعريف أو توثيق ظاهر دون مصدر تنفيذي مطابق ظاهر.',
    LEGACY: 'يحتوي مؤشرًا تاريخيًا يحتاج عزلًا أو تطبيعًا بشريًا.',
    BLOCKED: 'يحتوي مؤشر فشل أو منع يحتاج مراجعة بشرية.'
  },
  classificationIsAutomatedEvidenceAssessment: true,
  finalHumanApprovalRequired: true,
  scannedRoots: SCAN_ROOTS,
  scannedTextFileCount: files.length,
  systemCount: systems.length,
  summary,
  systems,
  recentCommits: commits
};

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8');

process.stdout.write(
  `${JSON.stringify({
    output: path.relative(ROOT, OUTPUT),
    systemCount: systems.length,
    summary
  }, null, 2)}\n`
);
