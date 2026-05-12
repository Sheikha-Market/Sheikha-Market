#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  نظام الأرشفة والبحث الرقمي — مكتبات شيخة                  ║
 * ║  يضغط المكتبة، يدمج الملفات، يبحث داخل المضغوط              ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * الاستخدام:
 *   node scripts/library-archive.js export          — تصدير وضغط المكتبة
 *   node scripts/library-archive.js search <نص>     — بحث داخل الأرشيف
 *   node scripts/library-archive.js merge <ملف1> <ملف2> — دمج نسختين
 *   node scripts/library-archive.js analyze          — تحليل الأرشيف
 *   node scripts/library-archive.js list              — قائمة الأرشيفات
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT     = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const ARCH_DIR = path.join(ROOT, 'archives');

// مصادر البيانات المراد أرشفتها
const SOURCES = [
    { key: 'islamicLibrary',    file: 'islamic-library.json',    label: 'المكتبة الإسلامية' },
    { key: 'knowledge',         file: 'knowledge.json',           label: 'قاعدة المعرفة' },
    { key: 'audits',            file: 'audits.json',              label: 'سجل المراجعات' }
];

// ── مساعدات ───────────────────────────────────────────────────

function nowStamp() {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }
}

/** يقرأ ملف JSON بأمان */
function readJson(filePath) {
    if (!fs.existsSync(filePath)) { return []; }
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
        return [];
    }
}

/** يضغط نص إلى بيانات gzip ثنائية */
function gzipSync(text) {
    return zlib.gzipSync(Buffer.from(text, 'utf8'));
}

/** يفك ضغط gzip إلى نص */
function gunzipSync(buf) {
    return zlib.gunzipSync(buf).toString('utf8');
}

// ── تصدير وضغط المكتبة ────────────────────────────────────────

function exportArchive() {
    ensureDir(ARCH_DIR);
    const stamp   = nowStamp();
    const bundle  = {};
    let   total   = 0;

    for (const src of SOURCES) {
        const raw = readJson(path.join(DATA_DIR, src.file));
        bundle[src.key] = raw;
        total += Array.isArray(raw) ? raw.length : 1;
        console.log(`  ✓ ${src.label}: ${Array.isArray(raw) ? raw.length : 1} سجل`);
    }

    bundle._meta = {
        exportedAt: new Date().toISOString(),
        totalRecords: total,
        sources: SOURCES.map((s) => s.key),
        version: '1.0',
        project: 'SHEIKHA'
    };

    const json    = JSON.stringify(bundle, null, 2);
    const compressed = gzipSync(json);

    const fileName = `sheikha-library-${stamp}.json.gz`;
    const outPath  = path.join(ARCH_DIR, fileName);
    fs.writeFileSync(outPath, compressed);

    const origKB   = Math.round(Buffer.byteLength(json, 'utf8') / 1024);
    const compKB   = Math.round(compressed.length / 1024);
    const ratio    = origKB > 0 ? Math.round((1 - compKB / origKB) * 100) : 0;

    console.log(`\n📦 تم الأرشفة: ${fileName}`);
    console.log(`   الحجم الأصلي: ${origKB} KB`);
    console.log(`   بعد الضغط:   ${compKB} KB (وفر ${ratio}%)`);
    console.log(`   الإجمالي:    ${total} سجل`);
    return outPath;
}

// ── بحث داخل الأرشيف المضغوط دون فتحه كاملاً ───────────────────

function searchArchive(query, archivePath) {
    const gz   = fs.readFileSync(archivePath);
    const json = gunzipSync(gz); // فك ضغط في الذاكرة فقط

    let data;
    try { data = JSON.parse(json); } catch { console.error('خطأ في تحليل الأرشيف'); process.exit(1); }

    const q = query.toLowerCase();
    const results = [];

    // بحث في المكتبة الإسلامية
    const lib = data.islamicLibrary || [];
    for (const item of lib) {
        const text = String(item.indexText || item.title || item.summary || '').toLowerCase();
        if (text.includes(q)) {
            results.push({
                source: 'المكتبة الإسلامية',
                id: item.id,
                title: item.title,
                author: item.author,
                field: item.field,
                era: item.era,
                snippet: item.summary ? item.summary.slice(0, 120) + '…' : ''
            });
        }
    }

    // بحث في قاعدة المعرفة
    const knowledge = data.knowledge || [];
    for (const item of knowledge) {
        const text = String(item.title || item.content || item.summary || '').toLowerCase();
        if (text.includes(q)) {
            results.push({
                source: 'قاعدة المعرفة',
                id: item.id,
                title: item.title || '—',
                field: item.field || '',
                snippet: item.content ? String(item.content).slice(0, 120) + '…' : ''
            });
        }
    }

    console.log(`\n🔍 نتائج البحث عن: "${query}"`);
    console.log(`   الأرشيف: ${path.basename(archivePath)}`);
    console.log(`   النتائج: ${results.length}\n`);

    for (const r of results.slice(0, 25)) {
        console.log(`  [${r.source}] ${r.title}`);
        if (r.author)  { console.log(`   ✍  الكاتب: ${r.author}`); }
        if (r.field)   { console.log(`   📚  المجال: ${r.field}`); }
        if (r.snippet) { console.log(`   📄  ${r.snippet}`); }
        console.log();
    }

    return results;
}

// ── دمج نسختين من الأرشيف ────────────────────────────────────────

function mergeArchives(path1, path2) {
    const dec1 = JSON.parse(gunzipSync(fs.readFileSync(path1)));
    const dec2 = JSON.parse(gunzipSync(fs.readFileSync(path2)));

    const merged = {};
    for (const src of SOURCES) {
        const a1 = dec1[src.key] || [];
        const a2 = dec2[src.key] || [];
        const seen = new Set();
        merged[src.key] = [];
        for (const item of [...a1, ...a2]) {
            const key = String(item.id || item.title || JSON.stringify(item));
            if (!seen.has(key)) {
                seen.add(key);
                merged[src.key].push(item);
            }
        }
        console.log(`  ✓ ${src.label}: ${a1.length} + ${a2.length} → ${merged[src.key].length} (بعد الدمج)`);
    }

    merged._meta = {
        mergedAt: new Date().toISOString(),
        sources: [path.basename(path1), path.basename(path2)],
        version: '1.0'
    };

    ensureDir(ARCH_DIR);
    const outPath = path.join(ARCH_DIR, `sheikha-merged-${nowStamp()}.json.gz`);
    fs.writeFileSync(outPath, gzipSync(JSON.stringify(merged, null, 2)));
    console.log(`\n🔀 تم الدمج: ${path.basename(outPath)}`);
    return outPath;
}

// ── تحليل الأرشيف ────────────────────────────────────────────────

function analyzeArchive(archivePath) {
    const json = gunzipSync(fs.readFileSync(archivePath));
    const data = JSON.parse(json);
    const lib  = data.islamicLibrary || [];

    const byField   = {};
    const byEra     = {};
    const byCause   = {};  // أسباب البحث
    const toolsFreq = {};  // الأدوات الأكثر استخدامًا
    const sciFreq   = {};  // العلوم الأكثر استخدامًا

    for (const item of lib) {
        byField[item.field] = (byField[item.field] || 0) + 1;
        byEra[item.era]     = (byEra[item.era]     || 0) + 1;

        const m = item.methodology || {};
        (m.researchCauses || []).forEach((c) => { byCause[c] = (byCause[c] || 0) + 1; });
        (m.firstTools     || []).forEach((t) => { toolsFreq[t] = (toolsFreq[t] || 0) + 1; });
        (m.sciencesUsed   || []).forEach((s) => { sciFreq[s]   = (sciFreq[s]   || 0) + 1; });
    }

    const top = (obj, n = 5) =>
        Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n)
                           .map(([k, v]) => `${k} (${v})`).join('، ');

    const fileSizeKB = Math.round(fs.statSync(archivePath).size / 1024);

    console.log(`\n📊 تحليل الأرشيف: ${path.basename(archivePath)}`);
    console.log(`   الحجم   : ${fileSizeKB} KB (مضغوط)`);
    console.log(`   السجلات : ${lib.length} كتاب`);
    console.log(`   المجالات: ${Object.keys(byField).length}`);
    console.log(`\n   أبرز المجالات: ${top(byField)}`);
    console.log(`   أبرز الحقب   : ${top(byEra)}`);
    console.log(`   أبرز الأسباب : ${top(byCause)}`);
    console.log(`   أبرز الأدوات : ${top(toolsFreq)}`);
    console.log(`   أبرز العلوم  : ${top(sciFreq)}`);
    console.log(`\n   البيانات الوصفية:`, data._meta || {});
}

// ── قائمة الأرشيفات ──────────────────────────────────────────────

function listArchives() {
    ensureDir(ARCH_DIR);
    const files = fs.readdirSync(ARCH_DIR)
        .filter((f) => f.endsWith('.gz') || f.endsWith('.json'))
        .map((f) => {
            const fp   = path.join(ARCH_DIR, f);
            const stat = fs.statSync(fp);
            return { name: f, sizeKB: Math.round(stat.size / 1024), mtime: stat.mtime.toISOString().slice(0, 16) };
        })
        .sort((a, b) => b.mtime.localeCompare(a.mtime));

    if (files.length === 0) {
        console.log('لا توجد أرشيفات بعد. نفّذ: node scripts/library-archive.js export');
        return;
    }

    console.log('\n📁 الأرشيفات المتاحة:\n');
    for (const f of files) {
        console.log(`  ${f.name.padEnd(55)} ${String(f.sizeKB).padStart(6)} KB   ${f.mtime}`);
    }
    console.log('\nللبحث: node scripts/library-archive.js search <نص> [مسار_الأرشيف]');
}

// ── نقطة الدخول ──────────────────────────────────────────────────

const [,, cmd, arg1, arg2] = process.argv;

switch (cmd) {
    case 'export':
        exportArchive();
        break;

    case 'search': {
        if (!arg1) { console.error('استخدام: node scripts/library-archive.js search <نص> [مسار]'); process.exit(1); }
        const archives = fs.existsSync(ARCH_DIR)
            ? fs.readdirSync(ARCH_DIR).filter((f) => f.endsWith('.gz')).sort().reverse()
            : [];
        const archPath = arg2 || (archives.length > 0 ? path.join(ARCH_DIR, archives[0]) : null);
        if (!archPath || !fs.existsSync(archPath)) {
            console.error('لا يوجد أرشيف. نفّذ أولاً: node scripts/library-archive.js export');
            process.exit(1);
        }
        searchArchive(arg1, archPath);
        break;
    }

    case 'merge':
        if (!arg1 || !arg2) { console.error('استخدام: node scripts/library-archive.js merge <ملف1> <ملف2>'); process.exit(1); }
        mergeArchives(arg1, arg2);
        break;

    case 'analyze': {
        const archives2 = fs.existsSync(ARCH_DIR)
            ? fs.readdirSync(ARCH_DIR).filter((f) => f.endsWith('.gz')).sort().reverse()
            : [];
        const ap = arg1 || (archives2.length > 0 ? path.join(ARCH_DIR, archives2[0]) : null);
        if (!ap || !fs.existsSync(ap)) {
            console.error('لا يوجد أرشيف. نفّذ أولاً: node scripts/library-archive.js export');
            process.exit(1);
        }
        analyzeArchive(ap);
        break;
    }

    case 'list':
    default:
        listArchives();
        break;
}
