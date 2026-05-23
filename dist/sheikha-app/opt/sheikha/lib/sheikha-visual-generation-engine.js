/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🎨  Sheikha Visual Generation Engine — محرك شيخة البصري
 *  طبقة تحكم بصرية كاملة مملوكة لشيخة
 *  "وَهُوَ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ بِالْحَقِّ"
 *
 *  المكوّنات:
 *    1) Brand Brain       — هوية شيخة البصرية
 *    2) Visual Planner    — تحويل الأمر إلى خطة توليد مهيكلة
 *    3) Adapter Chain     — سلسلة تنفيذ قابلة للتوسع
 *    4) Media Library     — مكتبة assets مملوكة لشيخة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const path = require('path');
const fs   = require('fs');
const { randomUUID } = require('crypto');

// ─── Brand Brain — هوية شيخة البصرية ─────────────────────────────────────────
const BRAND_BRAIN = {
    name:    'Sheikha Visual Brand Brain v1.0',
    symbols: ['⚖️ الميزان', '🔵 الدائرة', '🧠 الشبكة العصبية'],
    palette: {
        primary:    '#D4AF37',   // ذهبي
        secondary:  '#B87333',   // نحاسي
        dark:       '#050810',   // خلفية داكنة
        accent:     '#60A5FA',   // أزرق تقني
        neutral:    '#F4F4F5',   // نص فاتح
    },
    principles:   ['الإتقان', 'الوضوح', 'العدل', 'الأمانة'],
    typography:   { arabic: 'Tajawal', latin: 'JetBrains Mono' },
    styleGuide: {
        preferDark:    true,
        goldAccents:   true,
        arabicFirst:   true,
        islamicValues: true,
    },
};

// ─── Intent → adapter mapping ─────────────────────────────────────────────────
const INTENT_MAP = {
    brand_visual:    { adapters: ['sheikha_brand_adapter'], description: 'هوية تقنية لشيخة' },
    product_image:   { adapters: ['sheikha_product_adapter'], description: 'صورة منتج' },
    logo:            { adapters: ['sheikha_logo_adapter'], description: 'شعار وهوية' },
    banner:          { adapters: ['sheikha_banner_adapter'], description: 'بانر إعلاني' },
    social:          { adapters: ['sheikha_social_adapter'], description: 'محتوى تواصل اجتماعي' },
    video_intro:     { adapters: ['sheikha_video_adapter'], description: 'مقدمة فيديو' },
    video_promo:     { adapters: ['sheikha_video_adapter', 'sheikha_brand_adapter'], description: 'فيديو ترويجي' },
    infographic:     { adapters: ['sheikha_info_adapter'], description: 'انفوغرافيك' },
    icon_set:        { adapters: ['sheikha_icon_adapter'], description: 'مجموعة أيقونات' },
    general:         { adapters: ['sheikha_visual_adapter'], description: 'بصري عام' },
};

// ─── Adapter registry ─────────────────────────────────────────────────────────
const ADAPTERS = {
    sheikha_visual_adapter:  { name: 'Sheikha Visual Adapter',  type: 'image',    provider: 'sheikha_internal', status: 'active' },
    sheikha_brand_adapter:   { name: 'Sheikha Brand Adapter',   type: 'image',    provider: 'sheikha_internal', status: 'active' },
    sheikha_product_adapter: { name: 'Sheikha Product Adapter', type: 'image',    provider: 'sheikha_internal', status: 'active' },
    sheikha_logo_adapter:    { name: 'Sheikha Logo Adapter',    type: 'image',    provider: 'sheikha_internal', status: 'active' },
    sheikha_banner_adapter:  { name: 'Sheikha Banner Adapter',  type: 'image',    provider: 'sheikha_internal', status: 'active' },
    sheikha_social_adapter:  { name: 'Sheikha Social Adapter',  type: 'image',    provider: 'sheikha_internal', status: 'active' },
    sheikha_video_adapter:   { name: 'Sheikha Video Adapter',   type: 'video',    provider: 'sheikha_internal', status: 'active' },
    sheikha_info_adapter:    { name: 'Sheikha Info Adapter',    type: 'image',    provider: 'sheikha_internal', status: 'active' },
    sheikha_icon_adapter:    { name: 'Sheikha Icon Adapter',    type: 'image',    provider: 'sheikha_internal', status: 'active' },
};

// ─── Media Library (in-memory + optional JSON persistence) ────────────────────
const LIBRARY_DIR  = path.join(__dirname, '../data');
const LIBRARY_FILE = path.join(LIBRARY_DIR, 'visual-library.json');

function loadLibrary() {
    try {
        if (!fs.existsSync(LIBRARY_FILE)) return [];
        return JSON.parse(fs.readFileSync(LIBRARY_FILE, 'utf8'));
    } catch (_) {
        return [];
    }
}

function saveLibrary(lib) {
    try {
        if (!fs.existsSync(LIBRARY_DIR)) fs.mkdirSync(LIBRARY_DIR, { recursive: true });
        fs.writeFileSync(LIBRARY_FILE, JSON.stringify(lib, null, 2), 'utf8');
    } catch (err) {
        console.warn('[VISUAL] تحذير: فشل حفظ مكتبة الأصول:', err.message);
    }
}

// ─── Jobs registry (in-memory) ────────────────────────────────────────────────
const _jobs = new Map();

// ─── Visual Planner — تحويل الأمر إلى خطة توليد ──────────────────────────────
function detectIntent(prompt) {
    const p = (prompt || '').toLowerCase();
    if (/شعار|logo/i.test(p))                     return 'logo';
    if (/بانر|banner|إعلان|ad\s/i.test(p))         return 'banner';
    if (/فيديو.*ترويج|promo.*video/i.test(p))       return 'video_promo';
    if (/فيديو.*مقدمة|intro.*video|video.*intro/i.test(p)) return 'video_intro';
    if (/انفوغرافيك|infographic/i.test(p))          return 'infographic';
    if (/أيقون|icon/i.test(p))                      return 'icon_set';
    if (/تواصل\s*اجتماعي|social/i.test(p))          return 'social';
    if (/منتج|product/i.test(p))                    return 'product_image';
    if (/هوية.*تقني|brand.*visual|visual.*brand/i.test(p)) return 'brand_visual';
    return 'general';
}

function buildNormalizedPrompt(prompt, intent) {
    const base = (prompt || '').trim();
    const rules = [
        'يجب أن يعكس هوية شيخة الذهبية والداكنة',
        'يتبع مبادئ: الإتقان والوضوح والعدل',
        'يدمج الرمزية الإسلامية بشكل راقي',
        `أسلوب بصري: ${BRAND_BRAIN.styleGuide.preferDark ? 'داكن وذهبي' : 'فاتح'}`,
    ];
    return `${base}. [قواعد شيخة البصرية: ${rules.join(' | ')}]`;
}

function plan(prompt, type = 'image', options = {}) {
    const intent       = detectIntent(prompt);
    const intentDef    = INTENT_MAP[intent] || INTENT_MAP.general;
    const adapterChain = intentDef.adapters;
    const normalizedPrompt = buildNormalizedPrompt(prompt, intent);

    return {
        id:               'PLAN-' + randomUUID().slice(0, 8).toUpperCase(),
        type:             type,
        intent:           intent,
        intentDescription: intentDef.description,
        originalPrompt:   prompt,
        normalizedPrompt,
        palette:          BRAND_BRAIN.palette,
        adapterChain,
        options: {
            width:   options.width   || (type === 'video' ? 1920 : 1024),
            height:  options.height  || (type === 'video' ? 1080 : 1024),
            quality: options.quality || 'high',
            format:  options.format  || (type === 'video' ? 'mp4' : 'png'),
            style:   options.style   || 'sheikha-dark-gold',
        },
        createdAt: new Date().toISOString(),
    };
}

// ─── Job creation & execution ─────────────────────────────────────────────────
function createJob(visualPlan, priority = 'normal') {
    const jobId = 'JOB-' + randomUUID().slice(0, 8).toUpperCase();
    const job = {
        id:       jobId,
        plan:     visualPlan,
        priority,
        status:   'queued',
        createdAt: new Date().toISOString(),
        startedAt: null,
        completedAt: null,
        asset:    null,
        error:    null,
    };
    _jobs.set(jobId, job);
    return job;
}

function executeJob(jobId) {
    const job = _jobs.get(jobId);
    if (!job) return null;

    job.status    = 'processing';
    job.startedAt = new Date().toISOString();

    try {
        // محرك الترميز الداخلي — يُنشئ asset metadata بدون اعتماد على مزود خارجي.
        // المسار (outputPath) يمثل الموقع المستقبلي للملف عند ربط مولّد خارجي أو renderer.
        // لتفعيل الكتابة الفعلية للملف: أضف adapter يكتب البيانات إلى هذا المسار.
        const assetId = 'AST-' + randomUUID().slice(0, 8).toUpperCase();
        const outputPath = `/generated/${job.plan.type}/${assetId}.${job.plan.options.format}`;

        const asset = {
            id:          assetId,
            type:        job.plan.type,
            intent:      job.plan.intent,
            path:        outputPath,
            format:      job.plan.options.format,
            dimensions:  `${job.plan.options.width}x${job.plan.options.height}`,
            quality:     job.plan.options.quality,
            prompt:      job.plan.normalizedPrompt,
            provider:    job.plan.adapterChain[0] || 'sheikha_visual_adapter',
            palette:     job.plan.palette,
            planId:      job.plan.id,
            jobId,
            createdAt:   new Date().toISOString(),
        };

        job.asset       = asset;
        job.status      = 'completed';
        job.completedAt = new Date().toISOString();

        // أضف إلى المكتبة
        const library = loadLibrary();
        library.push(asset);
        saveLibrary(library);

        return job;
    } catch (err) {
        job.status = 'failed';
        job.error  = err.message;
        job.completedAt = new Date().toISOString();
        return job;
    }
}

// ─── High-level generate (plan → job → execute) ───────────────────────────────
function generate(prompt, type = 'image', options = {}) {
    const visualPlan = plan(prompt, type, options);
    const job        = createJob(visualPlan, options.priority || 'normal');
    return executeJob(job.id);
}

// ─── Analyze prompt ───────────────────────────────────────────────────────────
function analyze(prompt) {
    const intent    = detectIntent(prompt);
    const intentDef = INTENT_MAP[intent] || INTENT_MAP.general;
    return {
        prompt,
        intent,
        intentDescription: intentDef.description,
        adapterChain:  intentDef.adapters,
        normalizedPrompt: buildNormalizedPrompt(prompt, intent),
        palette: BRAND_BRAIN.palette,
        estimatedAdapters: intentDef.adapters.map(id => ADAPTERS[id] || { id }),
        brandCompliance: {
            darkTheme:     true,
            goldAccents:   true,
            arabicFirst:   true,
            islamicValues: true,
        },
    };
}

// ─── Health ───────────────────────────────────────────────────────────────────
function health() {
    const library = loadLibrary();
    return {
        status:       'active',
        engine:       'Sheikha Visual Generation Engine v1.0',
        mode:         'orchestrated-execution',
        brandBrain:   BRAND_BRAIN.name,
        adapters:     Object.keys(ADAPTERS).length,
        intents:      Object.keys(INTENT_MAP).length,
        librarySize:  library.length,
        jobsInMemory: _jobs.size,
        capabilities: ['image', 'video', 'brand', 'product', 'logo', 'banner', 'social', 'infographic', 'icon_set'],
        timestamp:    new Date().toISOString(),
    };
}

// ─── Catalog ──────────────────────────────────────────────────────────────────
function catalog() {
    return {
        brandBrain: BRAND_BRAIN,
        adapters:   Object.entries(ADAPTERS).map(([id, a]) => ({ id, ...a })),
        intents:    Object.entries(INTENT_MAP).map(([id, v]) => ({ id, ...v })),
    };
}

// ─── Jobs list ────────────────────────────────────────────────────────────────
function listJobs(limit = 50) {
    const all = [..._jobs.values()].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    return all.slice(0, limit);
}

function getJob(jobId) {
    return _jobs.get(jobId) || null;
}

// ─── Library ──────────────────────────────────────────────────────────────────
function getLibrary(limit = 100) {
    const lib = loadLibrary();
    return lib.slice(-limit).reverse();
}

// ─── Singleton pattern ────────────────────────────────────────────────────────
let _instance = null;

function getEngine() {
    if (!_instance) {
        _instance = {
            brandBrain: BRAND_BRAIN,
            plan,
            analyze,
            generate,
            createJob,
            executeJob,
            health,
            catalog,
            listJobs,
            getJob,
            getLibrary,
        };
    }
    return _instance;
}

module.exports = { getEngine, plan, analyze, generate, health, catalog, listJobs, getJob, getLibrary };
