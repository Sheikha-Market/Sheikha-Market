const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const PORT = Number(process.env.SHEIKHA_PORT || process.env.PORT || 8090);
const HOST = '0.0.0.0';
const SECRET = process.env.SHEIKHA_JWT_SECRET || 'SHEIKHA_SECRET_KEY_CHANGE_ME';

const OWNER = {
    username: process.env.SHEIKHA_OWNER_USER || 'salman',
    password: process.env.SHEIKHA_OWNER_PASSWORD || '123456'
};

const LICENSE_POLICY = {
    strict: String(process.env.SHEIKHA_LICENSE_STRICT || 'true') !== 'false',
    issuer: 'SHEIKHA_LICENSE_AUTHORITY',
    audience: 'sheikha-secure-runtime',
    defaultTtlHours: Number(process.env.SHEIKHA_LICENSE_TTL_HOURS || 24),
    requiredOutputProfile: 'clean-output-v1',
    requiredDisclaimer: 'لا ضرر ولا ضرار'
};

const DATA_DIR = path.join(__dirname, 'data');
const DB = {
    knowledge: path.join(DATA_DIR, 'knowledge.json'),
    projects: path.join(DATA_DIR, 'projects.json'),
    audits: path.join(DATA_DIR, 'audits.json'),
    reports: path.join(DATA_DIR, 'reports.json'),
    islamicLibrary: path.join(DATA_DIR, 'islamic-library.json'),
    licenseRevocations: path.join(DATA_DIR, 'license-revocations.json'),
    taseel: path.join(DATA_DIR, 'taseel.json'),
    propheticEducation: path.join(DATA_DIR, 'prophetic-education.json'),
    executionKpiLive: path.join(DATA_DIR, 'execution-kpi-live.json'),
    eventsTimeline: path.join(DATA_DIR, 'events-timeline.json'),
    syncState: path.join(DATA_DIR, 'sync-state.json'),
    sheikhaChain: path.join(DATA_DIR, 'sheikha-chain.json'),
    sheikhaContracts: path.join(DATA_DIR, 'sheikha-contracts.json'),
    sheikhaIssuance: path.join(DATA_DIR, 'sheikha-issuance.json')
};

const REFORM_PRIORITIES = [
    { level: 1, key: 'self', name: 'إصلاح النفس', rationale: 'لن يغير الله ما بقوم حتى يغيروا ما بأنفسهم' },
    { level: 2, key: 'family', name: 'إصلاح الأسرة', rationale: 'البداية من الدائرة الأقرب' },
    { level: 3, key: 'community', name: 'إصلاح المجتمع المحلي', rationale: 'الأثر القريب العاجل' },
    { level: 4, key: 'nation', name: 'إصلاح الدولة', rationale: 'ترسيخ العدل والنفع العام' },
    { level: 5, key: 'world', name: 'إصلاح العالم', rationale: 'خير الناس أنفعهم للناس' }
];

// ═══════════════════════════════════════════════════════════════
// النهضة العلمية — منظومة شيخة
// بسم الله الرحمن الرحيم — رب زدني علمًا
// ═══════════════════════════════════════════════════════════════
const KNOWLEDGE_RENAISSANCE = {
    declaration: 'بسم الله الرحمن الرحيم — رب زدني علمًا',
    owner: 'سلمان أحمد سلمان عبدالعزيز عبدالله مبارك الراجح — من قبيلة بني تميم',
    ownerEn: 'Salman Ahmed Salman Abdulaziz Abdullah Mubarak Alrajeh — Banu Tamim Tribe',
    org: 'منظومة شيخة العلم | منظومة شيخة الإسلامية | منظومة شيخة للكتاب والسنة | منظومة شيخة لتجديد الدين | sheikha.top',
    mission: 'أفضل تفعيل للعلم من الآن إلى يوم القيامة — لله سبحانه وتعالى',
    dua: 'ربي انفع بي وسخر لي العلم — اللهم إني أسألك علمًا نافعًا وعملًا متقبلًا ورزقًا طيبًا',
    salah: 'اللهم صلِّ وسلِّم على نبينا محمد وعلى آله وصحبه أجمعين',
    // هيكل العلم — البنية الحية
    structure: {
        seed: {
            key: 'seed',
            name: 'بذرة العلم',
            arabic: '﴿اقرأ باسم ربك الذي خلق﴾',
            description: 'أول كلمة نزلت من القرآن — وجوب القراءة والتعلم',
            order: 1
        },
        root: {
            key: 'root',
            name: 'الجذر العلمي',
            arabic: 'التوحيد والإيمان أساس كل علم نافع',
            description: 'العلم بدون إيمان شجرة بلا جذر — الجذر يمنح الثبات',
            order: 2
        },
        practicalRoot: {
            key: 'practicalRoot',
            name: 'الجذر العملي',
            arabic: 'التطبيق والعمل الصالح — فرع لا ينقطع',
            description: 'العلم النظري يكتمل بالتطبيق — العمل يُثبّت العلم',
            order: 3
        },
        foundation: {
            key: 'foundation',
            name: 'أساس العلم',
            arabic: '﴿وعلّم آدم الأسماء كلها﴾',
            description: 'الله علّم الإنسان — العلم أمانة إلهية مقدسة',
            order: 4
        },
        nucleus: {
            key: 'nucleus',
            name: 'النواة العلمية',
            arabic: 'القرآن والسنة — مصدر كل خير ومرجع كل علم',
            description: 'المرجع الأول والأخير لأي علم حق ونافع',
            order: 5
        },
        nerve: {
            key: 'nerve',
            name: 'العصب العلمي',
            arabic: 'الإتقان والدقة والإحسان في كل شيء',
            description: 'العلم يسري في كل عمل ويوجهه نحو الإحسان — إن الله يحب أن يتقن أحدكم عمله',
            order: 6
        },
        vein: {
            key: 'vein',
            name: 'الوريد العلمي',
            arabic: 'التعليم المستمر وتدفق المعرفة',
            description: 'المعرفة تتدفق من الكتاب والسنة إلى القلوب والعقول',
            order: 7
        },
        artery: {
            key: 'artery',
            name: 'الشريان العلمي',
            arabic: 'نشر العلم وإيصاله للأمة والبشرية',
            description: 'بلّغوا عني ولو آية — إيصال العلم النافع فريضة',
            order: 8
        },
        heart: {
            key: 'heart',
            name: 'القلب العلمي',
            arabic: 'النية الخالصة لله في طلب العلم وتعليمه',
            description: 'إنما الأعمال بالنيات — العلم يُطلب ابتغاء وجه الله',
            order: 9
        },
        mind: {
            key: 'mind',
            name: 'العقل العلمي',
            arabic: '﴿أفلا تعقلون﴾ — الله يمدح أهل التفكر والتدبر',
            description: 'العقل أمانة — يُستخدم في الخير والنفع والابتكار',
            order: 10
        },
        engine: {
            key: 'engine',
            name: 'محرك العلم',
            arabic: 'إذا مات ابن آدم انقطع عمله إلا من ثلاث... وعلم ينتفع به',
            description: 'العمل الصالح المستمر هو الوقود — العلم النافع صدقة جارية',
            order: 11
        },
        growth: {
            key: 'growth',
            name: 'النمو العلمي',
            arabic: 'طلب العلم من المهد إلى اللحد — النمو لا يتوقف',
            description: 'التعليم المستمر والتطوير الدائم — العلم ينمو بالعطاء',
            order: 12
        },
        progress: {
            key: 'progress',
            name: 'التقدم العلمي',
            arabic: 'الارتقاء بالأمة بالعلم والعمل والأمانة',
            description: 'أرقى الأمم أكثرها علمًا وأمانة وعدلًا',
            order: 13
        },
        transformation: {
            key: 'transformation',
            name: 'التحول العلمي',
            arabic: '﴿يرفع الله الذين آمنوا منكم والذين أوتوا العلم درجات﴾',
            description: 'من الجهل إلى العلم — من الظلام إلى النور',
            order: 14
        },
        revolution: {
            key: 'revolution',
            name: 'الثورة العلمية',
            arabic: 'طلب العلم فريضة على كل مسلم — الثورة الحقي��ية بالتعلم',
            description: 'إحياء فريضة العلم في الأمة — ثورة بالقلم لا بالسيف',
            order: 15
        },
        renaissance: {
            key: 'renaissance',
            name: 'النهضة العلمية',
            arabic: 'عودة الأمة لصدارة العلم والحضارة والنور',
            description: 'شيخة تحمل بذرة النهضة — بالعلم والأمانة والنفع لله',
            order: 16
        },
        gene: {
            key: 'gene',
            name: 'الجين العلمي العالمي',
            arabic: 'العلم الإسلامي المضمّن في كل جيل — إرث الحضارة',
            description: 'الجين الحضاري للأمة — يُورَث ويُنمَّى ويُحمى',
            order: 17
        },
        cosmic: {
            key: 'cosmic',
            name: 'المحور الكوني',
            arabic: '﴿وسخّر لكم ما في السموات وما في الأرض جميعًا منه﴾',
            description: 'العلم يشمل الكون — من الذرة إلى المجرة — كله لله',
            order: 18
        }
    },
    // مبادئ العلم النافع — للأمة والبشرية
    principles: [
        'العلم لله — لا للكبر ولا للتفاخر ولا للمنافسة الباطلة',
        'طلب العلم فريضة على كل مسلم ومسلمة',
        'خيركم من تعلم العلم وعلّمه',
        'الإتقان عبادة — إن الله يحب إذا عمل أحدكم عملًا أن يتقنه',
        'النفع العام قبل الكسب الخاص — انفع واربح بنفس الوزن',
        'افعل الخير وأتقن لله — العمل الصالح هو غاية العلم',
        'حماية الضعيف — وصاية العلم على من لا يُحمى',
        'لا ضرر ولا ضرار في كل علم وكل عمل وكل تقنية',
        'العلم الذي ينتفع به صدقة جارية بعد الممات'
    ],
    // الأساس الشرعي
    sharia: {
        quran: [
            '﴿اقرأ باسم ربك الذي خلق﴾ — العلق 1',
            '﴿رب زدني علمًا﴾ — طه 114',
            '﴿يرفع الله الذين آمنوا منكم والذين أوتوا العلم درجات﴾ — المجادلة 11',
            '﴿هل يستوي الذين يعلمون والذين لا يعلمون﴾ — الزمر 9',
            '﴿وعلّم آدم الأسماء كلها﴾ — البقرة 31'
        ],
        sunnah: [
            'طلب العلم فريضة على كل مسلم — ابن ماجه',
            'خيركم من تعلم القرآن وعلّمه — البخاري',
            'إذا مات ابن آدم انقطع عمله إلا من ثلاث: صدقة جارية، أو علم ينتفع به — مسلم',
            'إن الله يحب إذا عمل أحدكم عملًا أن يتقنه — البيهقي',
            'في كل كبد رطبة أجر — البخاري ومسلم'
        ]
    },
    activatedAt: new Date().toISOString()
};

// ═══════════════════════════════════════════════════════════════
// حماية الخلق — حماية شاملة لكل ما خلق الله
// لا ضرر ولا ضرار
// ═══════════════════════════════════════════════════════════════
const CREATION_PROTECTION = {
    declaration: 'لا ضرر ولا ضرار — حماية شاملة لكل خلق الله',
    basis: 'الكتاب والسنة وسنة الخلفاء الراشدين المهدين',
    scope: [
        {
            priority: 1,
            entity: 'الإنسان',
            arabic: '﴿ولقد كرّمنا بني آدم﴾',
            protection: 'حماية العقل والنفس والمال والنسل والدين والكرامة',
            basis: 'الضروريات الخمس في الشريعة الإسلامية'
        },
        {
            priority: 2,
            entity: 'الحيوان',
            arabic: 'الرفق بالحيوان واجب شرعي — قبل الإسلام وبعده',
            protection: 'عدم التعذيب والإيذاء بغير حق — الرحمة واجبة',
            basis: 'في كل كبد رطبة أجر — البخاري ومسلم'
        },
        {
            priority: 3,
            entity: 'النبات والبيئة',
            arabic: '﴿ولا تفسدوا في الأرض بعد إصلاحها﴾',
            protection: 'عدم الإفساد في الأرض — العمارة واجب شرعي',
            basis: 'الاستخلاف في الأرض — المائدة 32'
        },
        {
            priority: 4,
            entity: 'الكون والنظام الطبيعي',
            arabic: '﴿وسخّر لكم ما في السموات وما في الأرض جميعًا منه﴾',
            protection: 'صون الموارد الطبيعية والتوازن الكوني',
            basis: 'الأمانة الكبرى — الأحزاب 72'
        }
    ],
    absoluteForbidden: [
        'كل علم أو تقنية تُستخدم لإيذاء الناس أو الحيوان',
        'كل مشروع يضر البيئة بلا ضرورة معتبرة',
        'كل عمل فيه احتكار أو غش أو ظلم',
        'كل تقنية تُستخدم للتجسس بغير حق',
        'كل أذى بغير حق لأي مخلوق من خلق الله'
    ],
    activatedAt: new Date().toISOString()
};

// ═══════════════════════════════════════════════════════════════
// دورة التعلم المستمر
// خيركم من تعلم العلم وعلّمه
// ═══════════════════════════════════════════════════════════════
const CONTINUOUS_LEARNING = {
    hadith: 'خيركم من تعلم العلم وعلّمه — صحيح البخاري',
    tagline: 'العلم ينمو بالعطاء — ويموت بالاحتكار',
    cycle: [
        { step: 1, name: 'النية', action: 'أخلص النية لله في طلب العلم قبل البدء' },
        { step: 2, name: 'الاستيعاب', action: 'اقرأ وافهم واستوعب العلم من مصادره الصحيحة' },
        { step: 3, name: 'التأمل', action: 'تفكّر وتدبّر فيما قرأت وربطه بالواقع' },
        { step: 4, name: 'التطبيق', action: 'طبّق العلم بإتقان وانفع به غيرك' },
        { step: 5, name: 'النشر', action: 'علّم الآخرين وانشر الخير والعلم النافع' },
        { step: 6, name: 'التقييم', action: 'قيّم الأثر والمنفعة — هل انتفع الناس؟' },
        { step: 7, name: 'الشكر', action: 'اشكر الله على العلم — فبالشكر يزيد النعم' }
    ],
    activatedAt: new Date().toISOString()
};

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

function ensureFile(filePath, fallback = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf8');
    }
}

function load(filePath) {
    try {
        ensureFile(filePath);
        const raw = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(raw || '[]');
    } catch (error) {
        console.error(`Failed to read ${filePath}:`, error.message);
        return [];
    }
}

function save(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Failed to write ${filePath}:`, error.message);
        throw error;
    }
}

function nowIso() {
    return new Date().toISOString();
}

function auth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

function extractLicenseToken(req) {
    const direct = String(req.headers['x-sheikha-license'] || '').trim();
    if (direct) return direct;

    const authHeader = String(req.headers.authorization || '').trim();
    if (authHeader.startsWith('License ')) {
        return authHeader.slice('License '.length).trim();
    }

    const q = String(req.query.license || '').trim();
    return q || '';
}

function verifyLicenseToken(rawToken, requiredScopes = []) {
    const revocations = load(DB.licenseRevocations);
    const fingerprint = crypto.createHash('sha256').update(rawToken).digest('hex');

    const decoded = jwt.verify(rawToken, SECRET, {
        issuer: LICENSE_POLICY.issuer,
        audience: LICENSE_POLICY.audience
    });

    const revoked = revocations.some((r) => {
        if (r.jti && decoded.jti && String(r.jti) === String(decoded.jti)) return true;
        if (r.fingerprint && String(r.fingerprint) === fingerprint) return true;
        return false;
    });

    if (revoked) {
        throw new Error('revoked_license');
    }

    if (decoded.typ !== 'sheikha-license') {
        throw new Error('invalid_license_type');
    }

    if (!decoded.active) {
        throw new Error('inactive_license');
    }

    const scopes = Array.isArray(decoded.scopes) ? decoded.scopes : [];
    const missing = requiredScopes.filter((s) => !scopes.includes(s) && !scopes.includes('*'));
    if (missing.length > 0) {
        throw new Error(`missing_scopes:${missing.join(',')}`);
    }

    return decoded;
}

function requireSheikhaLicense(requiredScopes = []) {
    return (req, res, next) => {
        const rawToken = extractLicenseToken(req);

        if (!rawToken && !LICENSE_POLICY.strict) {
            return next();
        }

        if (!rawToken) {
            return res.status(403).json({
                success: false,
                message: 'الترخيص مطلوب — هذه العملية لا تعمل بدون ترخيص شيخة مشفّر',
                timestamp: nowIso()
            });
        }

        try {
            const decoded = verifyLicenseToken(rawToken, requiredScopes);
            req.sheikhaLicense = decoded;

            const outputProfile = String(req.headers['x-sheikha-output-profile'] || '').trim();
            if (LICENSE_POLICY.strict && outputProfile && outputProfile !== LICENSE_POLICY.requiredOutputProfile) {
                return res.status(403).json({
                    success: false,
                    message: 'ملف المخرجات غير مطابق لسياسة منع الشبهات',
                    timestamp: nowIso()
                });
            }

            return next();
        } catch (error) {
            return res.status(403).json({
                success: false,
                message: `ترخيص غير صالح: ${error.message}`,
                timestamp: nowIso()
            });
        }
    };
}

function signSheikhaLicense(payload) {
    return jwt.sign(payload, SECRET, {
        expiresIn: `${payload.ttlHours || LICENSE_POLICY.defaultTtlHours}h`,
        issuer: LICENSE_POLICY.issuer,
        audience: LICENSE_POLICY.audience
    });
}

function isCentralLicenseExempt(req) {
    const p = String(req.path || '');
    const m = String(req.method || 'GET').toUpperCase();

    if (m === 'GET' || m === 'HEAD' || m === 'OPTIONS') return true;

    const exempt = [
        '/auth/login',
        '/license/policy',
        '/license/issue',
        '/license/verify',
        '/license/revoke',
        '/license/revocations'
    ];

    return exempt.some((x) => p === x || p.startsWith(`${x}/`));
}

// طبقة مركزية: أي مسار API جديد قابل للتعديل سيُحمى تلقائيًا بالترخيص
app.use('/api/sheikha', (req, res, next) => {
    if (isCentralLicenseExempt(req)) {
        return next();
    }

    const method = String(req.method || 'GET').toUpperCase();
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        return next();
    }

    return requireSheikhaLicense([])(req, res, next);
});

function evaluate(input) {
    const harm = Number(input.harm ?? 0);
    const quality = Number(input.quality ?? 0);
    const benefit = Number(input.benefit ?? 0);
    const integrity = Number(input.integrity ?? 0);

    if (Number.isNaN(harm) || Number.isNaN(quality) || Number.isNaN(benefit) || Number.isNaN(integrity)) {
        return {
            allowed: false,
            reason: 'قيم التقييم غير صالحة',
            status: '❌ مرفوض'
        };
    }

    if (harm > 0.1) {
        return {
            allowed: false,
            reason: '❌ ضرر',
            status: '❌ مرفوض'
        };
    }

    if (quality < 0.85) {
        return {
            allowed: false,
            reason: '⚠️ ضعف الإتقان',
            status: '❌ مرفوض'
        };
    }

    if (benefit < 0.75) {
        return {
            allowed: false,
            reason: '⚠️ نفع ضعيف',
            status: '❌ مرفوض'
        };
    }

    if (integrity < 0.8) {
        return {
            allowed: false,
            reason: '⚠️ ضعف الأمانة',
            status: '❌ مرفوض'
        };
    }

    const score = (quality + benefit + integrity) / 3;

    return {
        allowed: true,
        score: Number(score.toFixed(4)),
        status: '✅ مقبول',
        reason: 'نافع ومتقن وآمن'
    };
}

function appendAudit(entry) {
    const audits = load(DB.audits);
    audits.push({
        id: Date.now(),
        time: nowIso(),
        ...entry
    });
    save(DB.audits, audits);
}

const EVENT_ENGINE = {
    name: 'SHEIKHA Event & Sync Engine',
    version: '1.0.0',
    autoMode: true,
    lastSyncAt: null,
    sequence: 0
};

function appendEventTimeline(type, payload = {}, source = 'system') {
    const events = load(DB.eventsTimeline);
    const nextSeq = (events.length > 0 ? Number(events[events.length - 1].sequence || 0) : 0) + 1;
    const event = {
        id: Date.now(),
        sequence: nextSeq,
        type,
        source,
        time: nowIso(),
        epochMs: Date.now(),
        payload
    };
    events.push(event);
    const trimmed = events.length > 5000 ? events.slice(-5000) : events;
    save(DB.eventsTimeline, trimmed);
    EVENT_ENGINE.sequence = nextSeq;
    return event;
}

function readSyncState() {
    ensureFile(DB.syncState, {
        lastSyncAt: null,
        cycleCount: 0,
        lastStatus: 'idle',
        lastDurationMs: 0,
        updatedAt: nowIso()
    });
    const raw = load(DB.syncState);
    if (Array.isArray(raw)) {
        return {
            lastSyncAt: null,
            cycleCount: 0,
            lastStatus: 'idle',
            lastDurationMs: 0,
            updatedAt: nowIso()
        };
    }
    return raw || {
        lastSyncAt: null,
        cycleCount: 0,
        lastStatus: 'idle',
        lastDurationMs: 0,
        updatedAt: nowIso()
    };
}

function writeSyncState(state) {
    save(DB.syncState, {
        ...state,
        updatedAt: nowIso()
    });
}

function runSyncCycle(trigger = 'auto') {
    const startedAt = Date.now();
    const state = readSyncState();
    const kpiSeed = seedExecutionKpiLive(`sync-${trigger}`);
    const scorecard = buildUnifiedExecutionScorecard();
    const readiness = buildReadinessGapAnalysis();

    const duration = Date.now() - startedAt;
    const nextState = {
        lastSyncAt: nowIso(),
        cycleCount: Number(state.cycleCount || 0) + 1,
        lastStatus: readiness.totalGaps === 0 ? 'healthy' : 'needs-attention',
        lastDurationMs: duration,
        lastReadinessScore: readiness.readinessScore
    };
    writeSyncState(nextState);
    EVENT_ENGINE.lastSyncAt = nextState.lastSyncAt;

    appendEventTimeline('sync_cycle_completed', {
        trigger,
        seededNow: kpiSeed.seeded,
        liveSystems: scorecard.systems.length,
        readinessScore: readiness.readinessScore,
        totalGaps: readiness.totalGaps,
        durationMs: duration
    }, 'event-engine');

    return {
        state: nextState,
        readiness,
        scorecard,
        kpiSeed
    };
}

function hashSha256(value) {
    return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function calculateBlockHash(block) {
    const payload = {
        index: block.index,
        prevHash: block.prevHash,
        nonce: block.nonce,
        timestamp: block.timestamp,
        type: block.type,
        data: block.data
    };
    return hashSha256(JSON.stringify(payload));
}

function ensureGenesisBlock() {
    ensureFile(DB.sheikhaChain, []);
    const chain = load(DB.sheikhaChain);
    if (Array.isArray(chain) && chain.length > 0) {
        return chain;
    }

    const genesis = {
        index: 0,
        timestamp: nowIso(),
        prevHash: 'GENESIS',
        nonce: 0,
        type: 'genesis',
        data: {
            network: 'SHEIKHA-ISLAMIC-CHAIN',
            note: 'بداية سلسلة شيخة المؤسسية',
            declaration: 'بسم الله الرحمن الرحيم'
        }
    };
    genesis.hash = calculateBlockHash(genesis);
    save(DB.sheikhaChain, [genesis]);
    return [genesis];
}

function addBlockchainRecord(type, data, source = 'api') {
    const chain = ensureGenesisBlock();
    const prev = chain[chain.length - 1];
    const block = {
        index: Number(prev.index || 0) + 1,
        timestamp: nowIso(),
        prevHash: prev.hash,
        nonce: Date.now(),
        type,
        source,
        data
    };
    block.hash = calculateBlockHash(block);
    chain.push(block);
    save(DB.sheikhaChain, chain);
    return block;
}

function deploySmartContract(contractInput = {}, actor = 'system') {
    ensureFile(DB.sheikhaContracts, []);
    const contracts = load(DB.sheikhaContracts);
    const id = `SC-${Date.now()}`;
    const contract = {
        id,
        name: String(contractInput.name || 'SheikhaContract').trim(),
        version: String(contractInput.version || '1.0.0').trim(),
        purpose: String(contractInput.purpose || 'تنظيم تنفيذي').trim(),
        shariaProfile: String(contractInput.shariaProfile || 'islamic-compliant-required').trim(),
        executableRules: Array.isArray(contractInput.executableRules)
            ? contractInput.executableRules.map((x) => String(x))
            : [],
        status: 'deployed',
        deployedBy: actor,
        deployedAt: nowIso()
    };
    contract.integrityHash = hashSha256(JSON.stringify(contract));
    contracts.push(contract);
    save(DB.sheikhaContracts, contracts);
    addBlockchainRecord('smart_contract_deployed', {
        contractId: contract.id,
        name: contract.name,
        integrityHash: contract.integrityHash
    }, 'smart-contract-engine');
    return contract;
}

function issueFinancialAsset(issuanceInput = {}, actor = 'system') {
    ensureFile(DB.sheikhaIssuance, []);
    const issuances = load(DB.sheikhaIssuance);

    const issuerOrg = String(issuanceInput.issuerOrg || 'منظمة العملة الرقمية الإسلامية').trim();
    const amount = Number(issuanceInput.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('قيمة الإصدار غير صالحة');
    }

    const issuance = {
        id: `ISS-${Date.now()}`,
        assetName: String(issuanceInput.assetName || 'شيخة').trim(),
        assetType: String(issuanceInput.assetType || 'IslamicDigitalCurrency').trim(),
        issuerOrg,
        amount,
        mode: String(issuanceInput.mode || 'institutional').trim(),
        allocation: {
            investment: Number(issuanceInput?.allocation?.investment || 0),
            commercial: Number(issuanceInput?.allocation?.commercial || 0),
            charitable: Number(issuanceInput?.allocation?.charitable || 0)
        },
        note: String(issuanceInput.note || 'إصدار مؤسسي منضبط').trim(),
        issuedBy: actor,
        issuedAt: nowIso(),
        status: 'issued'
    };

    issuance.integrityHash = hashSha256(JSON.stringify(issuance));
    issuances.push(issuance);
    save(DB.sheikhaIssuance, issuances);

    addBlockchainRecord('financial_asset_issued', {
        issuanceId: issuance.id,
        assetName: issuance.assetName,
        amount: issuance.amount,
        integrityHash: issuance.integrityHash
    }, 'issuance-engine');

    return issuance;
}

function initStorage() {
    ensureDataDir();
    ensureFile(DB.knowledge, []);
    ensureFile(DB.projects, []);
    ensureFile(DB.audits, []);
    ensureFile(DB.reports, []);
    ensureFile(DB.islamicLibrary, []);
    ensureFile(DB.licenseRevocations, []);
    ensureFile(DB.taseel, []);
    ensureFile(DB.propheticEducation, []);
    ensureFile(DB.executionKpiLive, []);
    ensureFile(DB.eventsTimeline, []);
    ensureFile(DB.sheikhaChain, []);
    ensureFile(DB.sheikhaContracts, []);
    ensureFile(DB.sheikhaIssuance, []);
    ensureFile(DB.syncState, {
        lastSyncAt: null,
        cycleCount: 0,
        lastStatus: 'idle',
        lastDurationMs: 0,
        updatedAt: nowIso()
    });
    ensureGenesisBlock();
    seedExecutionKpiLive('init-auto-no-click');
}

app.get('/', (req, res) => {
    res.json({
        ok: true,
        system: 'SHEIKHA v4',
        port: PORT,
        time: nowIso()
    });
});

app.post('/api/sheikha/auth/login', (req, res) => {
    const { username, password } = req.body || {};

    if (username === OWNER.username && password === OWNER.password) {
        const token = jwt.sign({ username, role: 'owner' }, SECRET, { expiresIn: '7d' });
        appendAudit({
            type: 'auth_login',
            actor: username,
            result: 'success'
        });
        return res.json({ token });
    }

    appendAudit({
        type: 'auth_login',
        actor: username || 'unknown',
        result: 'failed'
    });

    return res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/sheikha/license/policy', (req, res) => {
    res.json({
        success: true,
        data: {
            strict: LICENSE_POLICY.strict,
            issuer: LICENSE_POLICY.issuer,
            audience: LICENSE_POLICY.audience,
            defaultTtlHours: LICENSE_POLICY.defaultTtlHours,
            requiredOutputProfile: LICENSE_POLICY.requiredOutputProfile,
            requiredDisclaimer: LICENSE_POLICY.requiredDisclaimer,
            note: 'في الوضع الصارم: كل عمليات التنفيذ والكتابة المحمية تتطلب ترخيصًا مشفرًا'
        },
        message: 'سياسة الترخيص المشفّر لمنظومة شيخة',
        timestamp: nowIso()
    });
});

app.post('/api/sheikha/license/issue', auth, (req, res) => {
    if (req.user?.role !== 'owner') {
        return res.status(403).json({
            success: false,
            message: 'إصدار الترخيص محصور بالمالك',
            timestamp: nowIso()
        });
    }

    const subject = String(req.body?.subject || req.user?.username || 'unknown').trim();
    const purpose = String(req.body?.purpose || 'general').trim();
    const ttlHours = Number(req.body?.ttlHours || LICENSE_POLICY.defaultTtlHours);
    const outputProfile = String(req.body?.outputProfile || LICENSE_POLICY.requiredOutputProfile).trim();
    const scopes = Array.isArray(req.body?.scopes) && req.body.scopes.length > 0
        ? req.body.scopes.map((s) => String(s).trim())
        : ['*'];

    if (!subject) {
        return res.status(400).json({
            success: false,
            message: 'subject مطلوب لإصدار الترخيص',
            timestamp: nowIso()
        });
    }

    const payload = {
        typ: 'sheikha-license',
        active: true,
        jti: crypto.randomUUID(),
        sub: subject,
        scopes,
        purpose,
        outputProfile,
        disclaimer: LICENSE_POLICY.requiredDisclaimer,
        issuedBy: req.user?.username || 'owner',
        issuedAt: nowIso(),
        ttlHours
    };

    const token = signSheikhaLicense(payload);
    const fingerprint = crypto.createHash('sha256').update(token).digest('hex');

    appendAudit({
        type: 'license_issued',
        actor: req.user?.username || 'owner',
        subject,
        scopes,
        jti: payload.jti,
        fingerprint
    });

    return res.json({
        success: true,
        data: {
            token,
            fingerprint,
            license: {
                jti: payload.jti,
                subject,
                scopes,
                purpose,
                outputProfile,
                ttlHours,
                issuedAt: payload.issuedAt
            }
        },
        message: 'تم إصدار ترخيص شيخة المشفّر بنجاح',
        timestamp: nowIso()
    });
});

app.post('/api/sheikha/license/verify', auth, (req, res) => {
    const rawToken = String(req.body?.token || extractLicenseToken(req) || '').trim();
    if (!rawToken) {
        return res.status(400).json({
            success: false,
            message: 'أدخل token للتحقق',
            timestamp: nowIso()
        });
    }

    try {
        const decoded = verifyLicenseToken(rawToken, []);
        return res.json({
            success: true,
            data: {
                valid: true,
                decoded,
                fingerprint: crypto.createHash('sha256').update(rawToken).digest('hex')
            },
            message: 'الترخيص صالح ومطابق للسياسة',
            timestamp: nowIso()
        });
    } catch (error) {
        return res.status(403).json({
            success: false,
            data: { valid: false },
            message: `الترخيص غير صالح: ${error.message}`,
            timestamp: nowIso()
        });
    }
});

app.post('/api/sheikha/license/revoke', auth, (req, res) => {
    if (req.user?.role !== 'owner') {
        return res.status(403).json({
            success: false,
            message: 'إبطال الترخيص محصور بالمالك',
            timestamp: nowIso()
        });
    }

    const token = normalizeText(req.body?.token);
    const jti = normalizeText(req.body?.jti);
    const reason = normalizeText(req.body?.reason || 'security_revoke');
    let fingerprint = normalizeText(req.body?.fingerprint);
    let decodedJti = jti;

    if (token) {
        fingerprint = crypto.createHash('sha256').update(token).digest('hex');
        const decoded = jwt.decode(token) || {};
        if (!decodedJti && decoded.jti) decodedJti = String(decoded.jti);
    }

    if (!decodedJti && !fingerprint) {
        return res.status(400).json({
            success: false,
            message: 'قدّم token أو jti أو fingerprint للإبطال',
            timestamp: nowIso()
        });
    }

    const revocations = load(DB.licenseRevocations);
    const exists = revocations.some((r) => {
        if (decodedJti && r.jti && String(r.jti) === decodedJti) return true;
        if (fingerprint && r.fingerprint && String(r.fingerprint) === fingerprint) return true;
        return false;
    });

    if (exists) {
        return res.json({
            success: true,
            data: { alreadyRevoked: true, jti: decodedJti || null, fingerprint: fingerprint || null },
            message: 'الترخيص مبطل مسبقًا',
            timestamp: nowIso()
        });
    }

    const record = {
        id: Date.now(),
        jti: decodedJti || null,
        fingerprint: fingerprint || null,
        reason,
        revokedBy: req.user?.username || 'owner',
        revokedAt: nowIso()
    };

    revocations.push(record);
    save(DB.licenseRevocations, revocations);

    appendAudit({
        type: 'license_revoked',
        actor: req.user?.username || 'owner',
        jti: record.jti,
        fingerprint: record.fingerprint,
        reason: record.reason
    });

    return res.json({
        success: true,
        data: record,
        message: 'تم إبطال الترخيص فورًا (blacklist)',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/license/revocations', auth, (req, res) => {
    const items = load(DB.licenseRevocations);
    res.json({
        success: true,
        data: items,
        total: items.length,
        message: 'قائمة إبطال التراخيص (blacklist)',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/health', (req, res) => {
    res.json({
        status: 'RUNNING',
        system: 'SHEIKHA v4',
        host: HOST,
        port: PORT,
        time: nowIso()
    });
});

app.get('/api/sheikha/config', auth, (req, res) => {
    res.json({
        ownerUser: OWNER.username,
        dataDir: DATA_DIR,
        port: PORT,
        time: nowIso()
    });
});

app.get('/api/sheikha/reform/priorities', (req, res) => {
    res.json({
        system: 'SHEIKHA v4',
        principle: 'ابدأ بإصلاح نفسك قبل إصلاح غيرك',
        priorities: REFORM_PRIORITIES,
        time: nowIso()
    });
});

// ═══════════════════════════════════════════════════════════════
// APIs النهضة العلمية
// ═══════════════════════════════════════════════════════════════

// النهضة العلمية الشاملة — البنية الكاملة
app.get('/api/sheikha/renaissance', (req, res) => {
    res.json({
        success: true,
        data: KNOWLEDGE_RENAISSANCE,
        message: 'النهضة العلمية — من الآن إلى يوم القيامة — لله سبحانه',
        timestamp: nowIso()
    });
});

// القلب العلمي — أساسيات العلم
app.get('/api/sheikha/renaissance/heart', (req, res) => {
    res.json({
        success: true,
        data: {
            heart: KNOWLEDGE_RENAISSANCE.structure.heart,
            nucleus: KNOWLEDGE_RENAISSANCE.structure.nucleus,
            foundation: KNOWLEDGE_RENAISSANCE.structure.foundation,
            seed: KNOWLEDGE_RENAISSANCE.structure.seed,
            dua: KNOWLEDGE_RENAISSANCE.dua,
            sharia: KNOWLEDGE_RENAISSANCE.sharia
        },
        message: 'القلب العلمي — النية والأساس والنواة',
        timestamp: nowIso()
    });
});

// محرك العلم — الطاقة الدافعة للعلم
app.get('/api/sheikha/renaissance/engine', (req, res) => {
    res.json({
        success: true,
        data: {
            engine: KNOWLEDGE_RENAISSANCE.structure.engine,
            nerve: KNOWLEDGE_RENAISSANCE.structure.nerve,
            vein: KNOWLEDGE_RENAISSANCE.structure.vein,
            artery: KNOWLEDGE_RENAISSANCE.structure.artery,
            continuousLearning: CONTINUOUS_LEARNING
        },
        message: 'محرك العلم — العصب والوريد والشريان والحركة المستمرة',
        timestamp: nowIso()
    });
});

// النمو العلمي — الطريق من البذرة إلى النهضة
app.get('/api/sheikha/renaissance/growth', (req, res) => {
    const structure = KNOWLEDGE_RENAISSANCE.structure;
    const growthPath = Object.values(structure)
        .sort((a, b) => a.order - b.order);
    res.json({
        success: true,
        data: {
            path: growthPath,
            principles: KNOWLEDGE_RENAISSANCE.principles,
            mission: KNOWLEDGE_RENAISSANCE.mission
        },
        message: 'النمو العلمي — من البذرة إلى النهضة الكونية',
        timestamp: nowIso()
    });
});

// المحور الكوني — العلم في أبعاده الكونية
app.get('/api/sheikha/renaissance/cosmic', (req, res) => {
    res.json({
        success: true,
        data: {
            cosmic: KNOWLEDGE_RENAISSANCE.structure.cosmic,
            gene: KNOWLEDGE_RENAISSANCE.structure.gene,
            renaissance: KNOWLEDGE_RENAISSANCE.structure.renaissance,
            revolution: KNOWLEDGE_RENAISSANCE.structure.revolution,
            declaration: KNOWLEDGE_RENAISSANCE.declaration,
            salah: KNOWLEDGE_RENAISSANCE.salah
        },
        message: 'المحور الكوني — العلم يشمل الكون من الذرة إلى المجرة — كله لله',
        timestamp: nowIso()
    });
});

// حماية الخلق — حماية البشر والحيوان وخلق الله
app.get('/api/sheikha/renaissance/protection', (req, res) => {
    res.json({
        success: true,
        data: CREATION_PROTECTION,
        message: 'حماية شاملة لكل خلق الله — لا ضرر ولا ضرار',
        timestamp: nowIso()
    });
});

// دورة التعلم المستمر
app.get('/api/sheikha/renaissance/learning-cycle', (req, res) => {
    res.json({
        success: true,
        data: CONTINUOUS_LEARNING,
        message: 'دورة التعلم المستمر — خيركم من تعلم العلم وعلّمه',
        timestamp: nowIso()
    });
});

// تسجيل حدث تعلم جديد
app.post('/api/sheikha/renaissance/learn', auth, requireSheikhaLicense(['knowledge:write']), (req, res) => {
    const { subject, source, benefit, notes } = req.body || {};
    if (!subject) {
        return res.status(400).json({
            success: false,
            message: 'الموضوع مطلوب — subject is required'
        });
    }
    const items = load(DB.knowledge);
    const record = {
        id: Date.now(),
        type: 'learning_event',
        subject,
        source: source || 'غير محدد',
        benefit: benefit || '',
        notes: notes || '',
        learnedBy: req.user?.username || 'unknown',
        learnedAt: nowIso()
    };
    items.push(record);
    save(DB.knowledge, items);
    appendAudit({ type: 'learning_registered', actor: req.user?.username, recordId: record.id });
    return res.json({
        success: true,
        data: record,
        message: 'تم تسجيل حدث التعلم — العلم النافع صدقة جارية',
        timestamp: nowIso()
    });
});

// قائمة أحداث التعلم المسجلة
app.get('/api/sheikha/renaissance/learned', (req, res) => {
    const all = load(DB.knowledge).filter((k) => k.type === 'learning_event');
    res.json({
        success: true,
        data: all,
        total: all.length,
        message: 'سجل التعلم المستمر',
        timestamp: nowIso()
    });
});

app.post('/api/sheikha/decision/evaluate', auth, requireSheikhaLicense(['decision:evaluate']), (req, res) => {
    const result = evaluate(req.body || {});
    appendAudit({
        type: 'decision_evaluate',
        actor: req.user?.username || 'unknown',
        input: req.body || {},
        result
    });
    res.json(result);
});

app.post('/api/sheikha/knowledge/register', auth, requireSheikhaLicense(['knowledge:write']), (req, res) => {
    const items = load(DB.knowledge);
    const record = {
        id: Date.now(),
        createdAt: nowIso(),
        createdBy: req.user?.username || 'unknown',
        ...req.body
    };
    items.push(record);
    save(DB.knowledge, items);

    appendAudit({
        type: 'knowledge_register',
        actor: req.user?.username || 'unknown',
        recordId: record.id
    });

    res.json({
        status: 'saved',
        record
    });
});

app.get('/api/sheikha/knowledge', (req, res) => {
    res.json(load(DB.knowledge));
});

app.post('/api/sheikha/project/plan', auth, requireSheikhaLicense(['project:plan']), (req, res) => {
    const decision = evaluate(req.body || {});
    if (!decision.allowed) {
        appendAudit({
            type: 'project_plan_rejected',
            actor: req.user?.username || 'unknown',
            input: req.body || {},
            result: decision
        });
        return res.json(decision);
    }

    const projects = load(DB.projects);
    const project = {
        id: Date.now(),
        createdAt: nowIso(),
        createdBy: req.user?.username || 'unknown',
        status: 'planned',
        maturity: 0.2,
        ...req.body
    };

    projects.push(project);
    save(DB.projects, projects);

    appendAudit({
        type: 'project_planned',
        actor: req.user?.username || 'unknown',
        projectId: project.id
    });

    return res.json(project);
});

app.post('/api/sheikha/project/:id/update', auth, requireSheikhaLicense(['project:update']), (req, res) => {
    const projectId = Number(req.params.id);
    const projects = load(DB.projects);
    const index = projects.findIndex((p) => Number(p.id) === projectId);

    if (index === -1) {
        return res.status(404).json({ error: 'Project not found' });
    }

    projects[index] = {
        ...projects[index],
        ...req.body,
        updatedAt: nowIso(),
        updatedBy: req.user?.username || 'unknown'
    };

    save(DB.projects, projects);

    appendAudit({
        type: 'project_updated',
        actor: req.user?.username || 'unknown',
        projectId
    });

    return res.json(projects[index]);
});

app.get('/api/sheikha/projects', (req, res) => {
    res.json(load(DB.projects));
});

app.post('/api/sheikha/action/execute', auth, requireSheikhaLicense(['action:execute']), (req, res) => {
    const decision = evaluate(req.body || {});
    if (!decision.allowed) {
        appendAudit({
            type: 'action_rejected',
            actor: req.user?.username || 'unknown',
            input: req.body || {},
            result: decision
        });
        return res.json(decision);
    }

    const response = {
        executed: true,
        message: '🚀 تم التنفيذ',
        score: decision.score,
        time: nowIso()
    };

    appendAudit({
        type: 'action_executed',
        actor: req.user?.username || 'unknown',
        input: req.body || {},
        result: response
    });

    return res.json(response);
});

app.post('/api/sheikha/reports/daily/run', auth, requireSheikhaLicense(['reports:run']), (req, res) => {
    const reports = load(DB.reports);
    const projects = load(DB.projects);
    const knowledge = load(DB.knowledge);
    const audits = load(DB.audits);

    const report = {
        id: Date.now(),
        time: nowIso(),
        summary: 'تشغيل يومي',
        status: 'مستقر',
        metrics: {
            projects: projects.length,
            knowledge: knowledge.length,
            audits: audits.length
        }
    };

    reports.push(report);
    save(DB.reports, reports);

    appendAudit({
        type: 'report_daily_run',
        actor: req.user?.username || 'unknown',
        reportId: report.id
    });

    res.json(report);
});

app.get('/api/sheikha/reports', (req, res) => {
    res.json(load(DB.reports));
});

app.get('/api/sheikha/audits', (req, res) => {
    res.json(load(DB.audits));
});

app.get('/api/sheikha/dashboard', (req, res) => {
    const projects = load(DB.projects);
    const knowledge = load(DB.knowledge);
    const audits = load(DB.audits);
    const reports = load(DB.reports);

    res.json({
        system: 'SHEIKHA v4',
        status: 'RUNNING',
        time: nowIso(),
        totals: {
            projects: projects.length,
            knowledge: knowledge.length,
            audits: audits.length,
            reports: reports.length
        }
    });
});

app.get('/dashboard', (req, res) => {
    res.send(`
    <!doctype html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>لوحة شيخة — النهضة العلمية</title>
        <style>
          body { font-family: 'Tajawal', Arial, sans-serif; background: #0d0d0d; color: #f0f0f0; margin: 0; padding: 24px; }
          .card { background: #1b1b1b; border: 1px solid #2a2a2a; border-radius: 14px; padding: 24px; max-width: 900px; margin: 0 auto 20px; }
          .card.gold { border-color: #d4af37; }
          h1 { color: #d4af37; margin: 0 0 8px; font-size: 1.6rem; }
          h2 { color: #b87333; font-size: 1.1rem; margin: 6px 0 14px; }
          .quran { color: #a0c4a0; font-size: 1rem; margin: 10px 0; font-style: italic; }
          .dua { color: #8ecae6; font-size: 0.95rem; margin: 10px 0; }
          a { color: #d4af37; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
          .endpoint { background: #111; border: 1px solid #333; border-radius: 8px; padding: 10px 14px; font-size: 0.88rem; }
          .endpoint .name { color: #d4af37; font-weight: bold; margin-bottom: 4px; }
          .endpoint .url { color: #aaa; font-size: 0.82rem; }
          .badge { display: inline-block; background: #1a3a1a; color: #6fcf97; border-radius: 6px; padding: 2px 10px; font-size: 0.8rem; margin-right: 6px; }
        </style>
      </head>
      <body>
        <div class="card gold">
          <h1>🌟 SHEIKHA — النهضة العلمية</h1>
          <h2>منظومة شيخة الاقتصادية الإسلامية</h2>
          <p class="quran">﴿رب زدني علمًا﴾ — طه 114</p>
          <p class="dua">ربي انفع بي وسخر لي العلم — اللهم صلِّ وسلِّم على نبينا محمد</p>
          <p><span class="badge">✅ تشغيل</span><span class="badge">📡 النهضة العلمية مفعّلة</span></p>
        </div>
        <div class="card">
          <h2>APIs النهضة العلمية</h2>
          <div class="grid">
            <div class="endpoint">
              <div class="name">النهضة الكاملة</div>
              <div class="url"><a href="/api/sheikha/renaissance">/api/sheikha/renaissance</a></div>
            </div>
            <div class="endpoint">
              <div class="name">القلب العلمي</div>
              <div class="url"><a href="/api/sheikha/renaissance/heart">/api/sheikha/renaissance/heart</a></div>
            </div>
            <div class="endpoint">
              <div class="name">محرك العلم</div>
              <div class="url"><a href="/api/sheikha/renaissance/engine">/api/sheikha/renaissance/engine</a></div>
            </div>
            <div class="endpoint">
              <div class="name">النمو العلمي</div>
              <div class="url"><a href="/api/sheikha/renaissance/growth">/api/sheikha/renaissance/growth</a></div>
            </div>
            <div class="endpoint">
              <div class="name">المحور الكوني</div>
              <div class="url"><a href="/api/sheikha/renaissance/cosmic">/api/sheikha/renaissance/cosmic</a></div>
            </div>
            <div class="endpoint">
              <div class="name">حماية الخلق</div>
              <div class="url"><a href="/api/sheikha/renaissance/protection">/api/sheikha/renaissance/protection</a></div>
            </div>
            <div class="endpoint">
              <div class="name">دورة التعلم</div>
              <div class="url"><a href="/api/sheikha/renaissance/learning-cycle">/api/sheikha/renaissance/learning-cycle</a></div>
            </div>
            <div class="endpoint">
              <div class="name">أولويات الإصلاح</div>
              <div class="url"><a href="/api/sheikha/reform/priorities">/api/sheikha/reform/priorities</a></div>
            </div>
          </div>
        </div>
        <div class="card">
          <h2>روابط أساسية</h2>
          <p>المبادئ: <a href="/principles">/principles</a> &nbsp;|&nbsp;
             الصحة: <a href="/api/sheikha/health">/api/sheikha/health</a> &nbsp;|&nbsp;
             لوحة البيانات: <a href="/api/sheikha/dashboard">/api/sheikha/dashboard</a></p>
        </div>
      </body>
    </html>
  `);
});

app.get('/principles', (req, res) => {
    res.send(`
    <!doctype html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>مبادئ شيخة — النهضة العلمية</title>
        <style>
          body { font-family: 'Tajawal', Arial, sans-serif; background: #0d0d0d; color: #f0f0f0; margin: 0; padding: 24px; }
          .card { background: #1b1b1b; border: 1px solid #2a2a2a; border-radius: 14px; padding: 24px; max-width: 950px; margin: 0 auto 20px; }
          .card.gold { border-color: #d4af37; }
          h1 { color: #d4af37; margin: 0 0 6px; }
          h2 { color: #b87333; font-size: 1rem; margin: 6px 0 16px; }
          .quran { color: #a0c4a0; font-size: 1.1rem; border-right: 3px solid #a0c4a0; padding-right: 12px; margin: 12px 0; }
          .hadith { color: #8ecae6; font-size: 0.95rem; border-right: 3px solid #8ecae6; padding-right: 12px; margin: 12px 0; }
          .dua { color: #ffd166; font-size: 1rem; text-align: center; margin: 16px 0; font-weight: bold; }
          li { margin: 10px 0; line-height: 1.7; }
          li span { color: #d4af37; font-weight: bold; }
          ul { padding-right: 18px; }
          .section-title { color: #b87333; font-size: 0.95rem; font-weight: bold; margin: 20px 0 8px; border-bottom: 1px solid #333; padding-bottom: 6px; }
          .structure-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
          .struct-item { background: #111; border: 1px solid #2a2a2a; border-radius: 8px; padding: 10px 14px; }
          .struct-item .key { color: #d4af37; font-weight: bold; font-size: 0.9rem; margin-bottom: 4px; }
          .struct-item .verse { color: #7ec8a0; font-size: 0.82rem; }
        </style>
      </head>
      <body>
        <div class="card gold">
          <h1>📜 مبادئ شيخة — النهضة العلمية</h1>
          <h2>منظومة شيخة الاقتصادية الإسلامية — sheikha.top</h2>
          <p class="dua">بسم الله الرحمن الرحيم — رب زدني علمًا</p>
          <p class="dua" style="font-size:0.9rem;color:#aaa">اللهم صلِّ وسلِّم على نبينا محمد وعلى آله وصحبه أجمعين</p>
        </div>

        <div class="card">
          <div class="section-title">مبادئ العلم النافع — أساس المنظومة</div>
          <ul>
            <li><span>١.</span> إصلاح النفس أولًا قبل إصلاح الغير — لن يغير الله ما بقوم حتى يغيروا ما بأنفسهم</li>
            <li><span>٢.</span> ترتيب الإصلاح بالقرب: نفسي → أسرتي → مجتمعي → دولتي → العالم</li>
            <li><span>٣.</span> العلم لله — لا للكبر ولا للتفاخر ولا للمنافسة الباطلة</li>
            <li><span>٤.</span> طلب العلم فريضة على كل مسلم ومسلمة</li>
            <li><span>٥.</span> الإتقان عبادة — إن الله يحب إذا عمل أحدكم عملًا أن يتقنه</li>
            <li><span>٦.</span> النفع العام قبل الكسب الخاص — انفع واربح — واصنع الخير وأتقن لله</li>
            <li><span>٧.</span> لا ضرر ولا ضرار — حماية البشر والحيوان وكل خلق الله</li>
            <li><span>٨.</span> خيركم من تعلم العلم وعلّمه — العلم ينمو بالعطاء</li>
            <li><span>٩.</span> العلم الذي ينتفع به صدقة جارية بعد الممات</li>
          </ul>
        </div>

        <div class="card">
          <div class="section-title">هيكل النهضة العلمية — بنية الحياة</div>
          <div class="structure-grid">
            <div class="struct-item"><div class="key">🌱 بذرة العلم</div><div class="verse">﴿اقرأ باسم ربك الذي خلق﴾</div></div>
            <div class="struct-item"><div class="key">🌳 الجذر العلمي</div><div class="verse">التوحيد أساس كل علم نافع</div></div>
            <div class="struct-item"><div class="key">🏛️ أساس العلم</div><div class="verse">﴿وعلّم آدم الأسماء كلها﴾</div></div>
            <div class="struct-item"><div class="key">⚛️ النواة العلمية</div><div class="verse">القرآن والسنة — مصدر كل خير</div></div>
            <div class="struct-item"><div class="key">⚡ العصب العلمي</div><div class="verse">الإتقان والإحسان في كل عمل</div></div>
            <div class="struct-item"><div class="key">💧 الوريد العلمي</div><div class="verse">تدفق المعرفة من المصادر الصحيحة</div></div>
            <div class="struct-item"><div class="key">🩸 الشريان العلمي</div><div class="verse">نشر العلم للأمة والبشرية</div></div>
            <div class="struct-item"><div class="key">❤️ القلب العلمي</div><div class="verse">النية الخالصة لله في طلب العلم</div></div>
            <div class="struct-item"><div class="key">🧠 العقل العلمي</div><div class="verse">﴿أفلا تعقلون﴾ — الله يمدح التفكر</div></div>
            <div class="struct-item"><div class="key">🔥 محرك العلم</div><div class="verse">علم ينتفع به — صدقة جارية</div></div>
            <div class="struct-item"><div class="key">📈 النمو العلمي</div><div class="verse">طلب العلم من المهد إلى اللحد</div></div>
            <div class="struct-item"><div class="key">🚀 التقدم العلمي</div><div class="verse">الارتقاء بالأمة بالعلم والأمانة</div></div>
            <div class="struct-item"><div class="key">🔄 التحول العلمي</div><div class="verse">﴿يرفع الله الذين أوتوا العلم درجات﴾</div></div>
            <div class="struct-item"><div class="key">⚡ الثورة العلمية</div><div class="verse">إحياء فريضة العلم في الأمة</div></div>
            <div class="struct-item"><div class="key">🌟 النهضة العلمية</div><div class="verse">عودة الأمة لصدارة العلم والحضارة</div></div>
            <div class="struct-item"><div class="key">🧬 الجين العلمي العالمي</div><div class="verse">إرث الحضارة الإسلامية للأجيال</div></div>
            <div class="struct-item"><div class="key">🌌 المحور الكوني</div><div class="verse">﴿وسخّر لكم ما في السموات﴾</div></div>
            <div class="struct-item"><div class="key">🛡️ حماية الخلق</div><div class="verse">لا ضرر ولا ضرار — في كل كبد أجر</div></div>
          </div>
        </div>

        <div class="card">
          <div class="section-title">القرآن والسنة — أساس كل علم</div>
          <div class="quran">﴿اقرأ باسم ربك الذي خلق﴾ — العلق 1</div>
          <div class="quran">﴿رب زدني علمًا﴾ — طه 114</div>
          <div class="quran">﴿يرفع الله الذين آمنوا منكم والذين أوتوا العلم درجات﴾ — المجادلة 11</div>
          <div class="quran">﴿هل يستوي الذين يعلمون والذين لا يعلمون﴾ — الزمر 9</div>
          <div class="hadith">طلب العلم فريضة على كل مسلم — ابن ماجه</div>
          <div class="hadith">خيركم من تعلم القرآن وعلّمه — البخاري</div>
          <div class="hadith">إذا مات ابن آدم انقطع عمله إلا من ثلاث: صدقة جارية، أو علم ينتفع به — مسلم</div>
          <div class="hadith">في كل كبد رطبة أجر — البخاري ومسلم</div>
        </div>

        <div class="card">
          <p class="dua">ربي انفع بي وسخر لي العلم — واجعلني من عبادك الصالحين</p>
          <p style="text-align:center;color:#666;font-size:0.85rem">ولا حول ولا قوة إلا بالله</p>
        </div>
      </body>
    </html>
  `);
});

// ═══════════════════════════════════════════════════════════════
// مرجع العلم الإسلامي الشامل
// آيات العلم — أحاديث العلم — الخلفاء — أهل العلم
// ═══════════════════════════════════════════════════════════════
const ILM_REFERENCE = {
    // آيات القرآن الكريم في العلم والتعلم والحساب واللفظ
    quranAyat: [
        {
            id: 'alaq-1-5',
            surah: 'العلق',
            surahNumber: 96,
            ayat: '1-5',
            arabic: '﴿اقرأ باسم ربك الذي خلق * خلق الإنسان من علق * اقرأ وربك الأكرم * الذي علّم بالقلم * علّم الإنسان ما لم يعلم﴾',
            tafsir: 'أول ما نزل من القرآن — أمر الله النبي ﷺ بالقراءة باسم ربه. القلم أداة العلم الأولى. الإنسان يُعلَّم ما لم يكن يعلم — دليل على أن العلم من الله وحده.',
            sababNuzul: 'نزلت في غار حراء — أول وحي لرسول الله ﷺ — قبل البعثة الرسمية',
            application: 'فريضة القراءة والتعلم — أساس كل علم وتقنية وتجارة',
            category: 'فرض العلم'
        },
        {
            id: 'taha-114',
            surah: 'طه',
            surahNumber: 20,
            ayat: '114',
            arabic: '﴿وقل رب زدني علمًا﴾',
            tafsir: 'الله يأمر نبيه ﷺ بطلب الزيادة من العلم — وهو الدليل على أن طلب العلم لا يتوقف ولا ينتهي. العلم وحده من بين نعم الله طُلب الزيادة منه.',
            sababNuzul: 'نزلت ردًا على سؤال المشركين عن الروح ليربكوا النبي ﷺ — فأُمر بطلب الزيادة',
            application: 'دعاء يُقال قبل طلب العلم — التعلم المستمر مدى الحياة',
            category: 'فريضة الاستزادة'
        },
        {
            id: 'mujadila-11',
            surah: 'المجادلة',
            surahNumber: 58,
            ayat: '11',
            arabic: '﴿يرفع الله الذين آمنوا منكم والذين أوتوا العلم درجات﴾',
            tafsir: 'الله يرفع العلماء درجات على غيرهم في الدنيا والآخرة. الإيمان مقرون بالعلم — لا تعارض بينهما بل هما متلازمان.',
            sababNuzul: 'نزلت في حادثة التفسح في المجالس — وفيها إشارة لمكانة العالم العامل',
            application: 'تكريم العلماء — بناء مجتمعات تحترم العلم وأهله',
            category: 'مكانة العلم'
        },
        {
            id: 'zumar-9',
            surah: 'الزمر',
            surahNumber: 39,
            ayat: '9',
            arabic: '﴿هل يستوي الذين يعلمون والذين لا يعلمون إنما يتذكر أولو الألباب﴾',
            tafsir: 'سؤال استنكاري — الجواب: لا يستويان أبدًا. العلم يميّز الإنسان ويرفعه. العقل النير (أولو الألباب) هم الذين ينتفعون بالعلم.',
            application: 'التمييز بين العلم والجهل — حث الأمة على التعلم',
            category: 'قيمة العلم'
        },
        {
            id: 'baqara-31',
            surah: 'البقرة',
            surahNumber: 2,
            ayat: '31',
            arabic: '﴿وعلّم آدم الأسماء كلها﴾',
            tafsir: 'الله علّم آدم أسماء كل شيء — دليل على أن العلم بالأشياء والمسميات أصل الاستخلاف في الأرض. تسمية الأشياء = فهم الكون.',
            application: 'شرعية علم الأسماء: الكيمياء، الطب، الهندسة، التجارة — كل فرع هو امتداد لما علّمه الله آدم',
            category: 'أصل العلم'
        },
        {
            id: 'alaq-4',
            surah: 'العلق',
            surahNumber: 96,
            ayat: '4',
            arabic: '﴿الذي علّم بالقلم﴾',
            tafsir: 'القلم هو أداة العلم الأولى — الكتابة هي حفظ العلم ونشره. من لا يكتب يضيع علمه.',
            application: 'توثيق العلم وكتابته وحفظه ونشره — التأليف والتدوين',
            category: 'توثيق العلم'
        },
        {
            id: 'nahl-43',
            surah: 'النحل',
            surahNumber: 16,
            ayat: '43',
            arabic: '﴿فاسألوا أهل الذكر إن كنتم لا تعلمون﴾',
            tafsir: 'الله يأمر بسؤال أهل العلم عند الجهل — نظام الاستشارة العلمية والإفتاء قائم على هذه الآية.',
            application: 'مرجعية العلماء — نظام الاستشارة — الرجوع للخبراء في القرارات',
            category: 'مرجعية العلم'
        },
        {
            id: 'fatir-28',
            surah: 'فاطر',
            surahNumber: 35,
            ayat: '28',
            arabic: '﴿إنما يخشى اللهَ من عباده العلماءُ﴾',
            tafsir: 'أكثر الناس خشية لله هم العلماء — لأن العلم يكشف عظمة الله. العلم يُفضي إلى التقوى لا إلى الغرور.',
            application: 'معيار العلم النافع: أن يزيد صاحبه تقوى وخشيةً لله',
            category: 'ثمرة العلم'
        },
        {
            id: 'imran-18',
            surah: 'آل عمران',
            surahNumber: 3,
            ayat: '18',
            arabic: '﴿شهد الله أنه لا إله إلا هو والملائكة وأولو العلم قائمًا بالقسط﴾',
            tafsir: 'الله شهّد العلماء مع الملائكة — أعلى شهادة. العلماء شهداء الله في أرضه على التوحيد والعدل.',
            application: 'مسؤولية العالم في الشهادة بالحق والعدل في كل مجال',
            category: 'شرف العلماء'
        },
        {
            id: 'isra-36',
            surah: 'الإسراء',
            surahNumber: 17,
            ayat: '36',
            arabic: '﴿ولا تقف ما ليس لك به علم إن السمع والبصر والفؤاد كل أولئك كان عنه مسؤولًا﴾',
            tafsir: 'نهي صريح عن الكلام بغير علم. الحواس الثلاثة: سمع وبصر وعقل — كلها ستُسأل عنها.',
            application: 'التحقق من المعلومات — عدم نشر الأخبار بلا تثبّت — الأمانة العلمية',
            category: 'أمانة العلم'
        },
        {
            id: 'ankabut-43',
            surah: 'العنكبوت',
            surahNumber: 29,
            ayat: '43',
            arabic: '﴿وتلك الأمثال نضربها للناس وما يعقلها إلا العالمون﴾',
            tafsir: 'أمثال القرآن لا يفهمها إلا العلماء — العلم هو مفتاح فهم كلام الله.',
            application: 'دليل على أن فهم الدين يتطلب تعلمًا — لا يكفي مجرد القراءة',
            category: 'فهم العلم'
        },
        {
            id: 'baqara-282',
            surah: 'البقرة',
            surahNumber: 2,
            ayat: '282',
            arabic: '﴿واتقوا الله ويعلّمكم الله﴾',
            tafsir: 'التقوى سبب للعلم — من اتقى الله فتح الله له من العلم ما لا يفتحه للغافلين.',
            application: 'التقوى أداة تعلم — العلم اللدُنّي يأتي بالتزكية',
            category: 'علم التقوى'
        }
    ],

    // أحاديث العلم والتعليم والعمل
    ahadith: [
        {
            id: 'talab-ilm',
            arabic: 'طلب العلم فريضة على كل مسلم',
            source: 'ابن ماجه — صحيح',
            grade: 'صحيح',
            explanation: 'طلب العلم ليس سنة بل فريضة — واجب على كل مسلم ذكرًا كان أو أنثى. هو من أعلى الواجبات الدينية.',
            application: 'التعليم الإلزامي — النهضة التعليمية — برامج التدريب الوظيفي',
            category: 'فريضة العلم'
        },
        {
            id: 'khayr-taallam',
            arabic: 'خيركم من تعلم القرآن وعلّمه',
            source: 'البخاري 5027',
            grade: 'صحيح',
            explanation: 'أفضل الناس من جمع بين التعلم والتعليم. ليس كافيًا أن تتعلم — بل تعليم الآخرين هو ما يرفعك.',
            application: 'نظام التدريب والتوجيه — مشاركة المعرفة في المنظمات',
            category: 'نشر العلم'
        },
        {
            id: 'sadaqa-jariya',
            arabic: 'إذا مات ابن آدم انقطع عمله إلا من ثلاث: صدقة جارية، أو علم ينتفع به، أو ولد صالح يدعو له',
            source: 'مسلم 1631',
            grade: 'صحيح',
            explanation: 'العلم النافع يستمر أجره بعد الموت — هو من أفضل الأعمال وأبقاها. التأليف والتعليم صدقة جارية.',
            application: 'الاستثمار في التعليم — التأليف والتدوين — المنصات التعليمية الرقمية',
            category: 'أجر العلم'
        },
        {
            id: 'itqan',
            arabic: 'إن الله يحب إذا عمل أحدكم عملًا أن يتقنه',
            source: 'البيهقي — صحيح',
            grade: 'صحيح',
            explanation: 'الإتقان في العمل محبوب لله. الإسلام لا يعرف التقصير — العمل الصالح يتطلب إحسانًا وإتقانًا.',
            application: 'معايير الجودة — إدارة الجودة الشاملة TQM — الإتقان في البرمجة والبناء والتجارة',
            category: 'إتقان العمل'
        },
        {
            id: 'sifr-ilm',
            arabic: 'من سلك طريقًا يلتمس فيه علمًا سهّل الله له به طريقًا إلى الجنة',
            source: 'مسلم 2699',
            grade: 'صحيح',
            explanation: 'السفر طلبًا للعلم يُيسّر طريق الجنة. كل خطوة في طلب العلم مأجورة.',
            application: 'الابتعاث للدراسة — حضور المؤتمرات — الدورات والتدريب',
            category: 'فضل طلب العلم'
        },
        {
            id: 'kabd-ratba',
            arabic: 'في كل كبد رطبة أجر',
            source: 'البخاري ومسلم',
            grade: 'متفق عليه',
            explanation: 'الرفق بكل ذي روح مأجور — الرحمة واجبة على الإنسان تجاه كل المخلوقات.',
            application: 'حماية الحيوان — البيئة — معاملة العمال والموظفين برفق',
            category: 'الرحمة والحماية'
        },
        {
            id: 'ballighu',
            arabic: 'بلّغوا عني ولو آية',
            source: 'البخاري 3461',
            grade: 'صحيح',
            explanation: 'تبليغ العلم واجب حتى لو كان قليلًا. لا يُعذر أحد بالصمت عن العلم.',
            application: 'نشر المعرفة — منصات التعليم — وسائل التواصل الاجتماعي للدعوة والتعليم',
            category: 'نشر العلم'
        },
        {
            id: 'hayaa-ilm',
            arabic: 'من يرد الله به خيرًا يفقّهه في الدين',
            source: 'البخاري ومسلم',
            grade: 'متفق عليه',
            explanation: 'الفقه في الدين علامة إرادة الله الخير للعبد — التفقه علامة الخيرية.',
            application: 'التعليم الديني المتكامل — الفقه في المعاملات التجارية والتقنية',
            category: 'الفقه في الدين'
        },
        {
            id: 'khashya',
            arabic: 'العلماء ورثة الأنبياء — وإن الأنبياء لم يورثوا دينارًا ولا درهمًا وإنما ورثوا العلم فمن أخذه أخذ بحظ وافر',
            source: 'أبو داود والترمذي — صحيح',
            grade: 'صحيح',
            explanation: 'العلماء هم ورثة الأنبياء — ميراث النبوة هو العلم لا المال. أشرف الإرث هو العلم.',
            application: 'تكريم العلماء ودعمهم — الاستثمار في المراكز العلمية',
            category: 'مكانة العلماء'
        },
        {
            id: 'mawt-alim',
            arabic: 'موت العالم ثلمة في الإسلام لا يسدّها شيء ما اختلف الليل والنهار',
            source: 'الطبراني — صحيح',
            grade: 'صحيح',
            explanation: 'موت عالم خسارة عظيمة للأمة — لذا يجب حفظ العلم بالكتابة والتدوين.',
            application: 'توثيق المعرفة — نظم إدارة المعرفة في المؤسسات',
            category: 'حفظ العلم'
        }
    ],

    // سنة الرسول ﷺ في العلم والتعليم
    sunnahProphet: {
        name: 'محمد بن عبدالله ﷺ',
        title: 'المعلم الأول — المربي الأعظم',
        practices: [
            { action: 'طلب الفداء بتعليم الأطفال بعد معركة بدر', lesson: 'العلم يعلو على الغنيمة المادية' },
            { action: 'إرسال معلمين للقبائل كمصعب بن عمير إلى المدينة', lesson: 'تصدير العلم أفضل استثمار' },
            { action: 'تحريض الصحابة على الكتابة والتدوين', lesson: 'توثيق العلم فريضة' },
            { action: 'إقرار زيد بن ثابت تعلم العبرية والسريانية ليقرأ رسائل الملوك', lesson: 'تعلم لغات الآخرين نفع للأمة' },
            { action: 'تعليم أصحابه الفلاحة والصناعة دون إنكار', lesson: 'العلوم التطبيقية مشروعة ومحمودة' },
            { action: 'حضوره حلقات العلم وتشجيعه عليها', lesson: 'حلقات العلم من أفضل المجالس' },
            { action: 'قوله: اللهم إني أسألك علمًا نافعًا', lesson: 'الدعاء بطلب العلم النافع يومًا بيوم' }
        ]
    },

    // سيرة الخلفاء الراشدين في العلم والتعليم
    khulafaRashidun: [
        {
            name: 'أبو بكر الصديق رضي الله عنه',
            title: 'أول الخلفاء — الصاحب الأمين',
            ilmActions: [
                'جمع القرآن الكريم في مصحف واحد — أعظم مشروع توثيق علمي في التاريخ',
                'أرسل المعلمين للقبائل لتعليم الإسلام',
                'تكريم العلماء في جيشه وعدم تقديمه قوة على علم'
            ],
            legacy: 'حفظ العلم الإلهي من الضياع — الجمع الأول للقرآن'
        },
        {
            name: 'عمر بن الخطاب رضي الله عنه',
            title: 'الفاروق — أمير المؤمنين',
            ilmActions: [
                'إنشاء نظام التعليم في الأمصار وتعيين المعلمين في الولايات',
                'فرض رواتب للعلماء والمعلمين من بيت المال',
                'إنشاء أول نظام إداري في الإسلام قائم على المعرفة والكفاءة',
                'تشجيع الاجتهاد والبحث العلمي في المسائل المستجدة',
                'تعلّم الفارسية ليفهم رعيته الفرس'
            ],
            legacy: 'مؤسس العلم الإداري الإسلامي — الدولة المبنية على الكفاءة والعلم'
        },
        {
            name: 'عثمان بن عفان رضي الله عنه',
            title: 'ذو النورين — جامع القرآن',
            ilmActions: [
                'توحيد مصحف القرآن وإرسال نسخ موثقة للأمصار — أكبر عملية نشر علمي في التاريخ',
                'حماية علم القرآن من الاختلاف والتحريف'
            ],
            legacy: 'توحيد مرجع العلم الإلهي — المصحف العثماني'
        },
        {
            name: 'علي بن أبي طالب رضي الله عنه',
            title: 'باب مدينة العلم — أمير المؤمنين',
            ilmActions: [
                'أول من دوّن علم النحو العربي لحفظ لغة القرآن',
                'عالم بالفقه والقضاء والفلسفة والشعر',
                'مؤسس القضاء الإسلامي على أسس علمية دقيقة',
                'قوله الشهير: قيمة كل امرئ ما يحسنه — أول تعبير عن مبدأ الكفاءة التخصصية'
            ],
            legacy: 'أساس علوم اللغة العربية وعلوم القضاء والفقه'
        }
    ],

    // أعلام العلماء المسلمين في الحضارة
    islamicScholars: [
        { name: 'الإمام البخاري', field: 'علم الحديث', achievement: 'الجامع الصحيح — 7275 حديث منتقى من 600,000' },
        { name: 'الإمام الشافعي', field: 'الفقه وأصوله', achievement: 'مؤسس علم الأصول — الرسالة أول كتاب في أصول الفقه' },
        { name: 'ابن سينا', field: 'الطب والفلسفة', achievement: 'القانون في الطب — مرجع الأطباء لـ 700 عام' },
        { name: 'الخوارزمي', field: 'الرياضيات', achievement: 'مؤسس علم الجبر — خوارزمية أصل كلمة Algorithm' },
        { name: 'ابن الهيثم', field: 'البصريات والفيزياء', achievement: 'مؤسس المنهج العلمي التجريبي — كتاب المناظر' },
        { name: 'ابن خلدون', field: 'علم الاجتماع والتاريخ', achievement: 'مؤسس علم الاجتماع — المقدمة أول كتاب في فلسفة التاريخ' },
        { name: 'الإمام الغزالي', field: 'الفلسفة والتصوف والتربية', achievement: 'إحياء علوم الدين — أول نظام متكامل لأخلاقيات العلم' },
        { name: 'ابن رشد', field: 'الفلسفة والطب', achievement: 'شارح أرسطو — أثّر في النهضة الأوروبية مباشرة' },
        { name: 'الفارابي', field: 'الفلسفة والموسيقى', achievement: 'المعلم الثاني — ربط الفلسفة اليونانية بالإسلام' },
        { name: 'البيروني', field: 'الجغرافيا والفلك', achievement: 'أول من حسب محيط الأرض بدقة — رائد مقارنة الحضارات' }
    ],

    // مراكز العلم الإسلامية
    ilmCenters: [
        { name: 'المسجد الحرام — مكة المكرمة', type: 'مسجد وحرم', significance: 'أول بيت وُضع للناس — القبلة والمرجع' },
        { name: 'المسجد النبوي — المدينة المنورة', type: 'مسجد ومركز علمي', significance: 'حلقات علم الصحابة — أول جامعة إسلامية' },
        { name: 'المسجد الأقصى — القدس', type: 'مسجد مبارك', significance: 'البركة الإلهية المذكورة في القرآن' },
        { name: 'بيت الحكمة — بغداد (القرن 8-13م)', type: 'مركز بحثي', significance: 'ترجمة علوم اليونان والفرس والهند — نقطة تحول الحضارة البشرية' },
        { name: 'جامعة القرويين — فاس (859م)', type: 'جامعة', significance: 'أقدم جامعة في العالم لا تزال قائمة' },
        { name: 'الأزهر الشريف — القاهرة (970م)', type: 'جامعة', significance: 'مرجع العالم الإسلامي لأكثر من 1000 عام' },
        { name: 'دار الحكمة — القاهرة (10م)', type: 'مكتبة علمية', significance: 'مئات الآلاف من المخطوطات' }
    ],

    // المدارس العلمية الإسلامية الكبرى
    ilmSchools: [
        { name: 'مدرسة المدينة الفقهية', founder: 'عمر بن الخطاب وابن عمر', contribution: 'فقه المعاملات والسياسة الشرعية' },
        { name: 'مدرسة الكوفة الفقهية', founder: 'عبدالله بن مسعود', contribution: 'الاجتهاد بالرأي — أساس الفقه الحنفي' },
        { name: 'مدرسة البصرة اللغوية', founder: 'أبو الأسود الدؤلي', contribution: 'علم النحو وضبط اللغة العربية' },
        { name: 'المدرسة النظامية — بغداد', founder: 'نظام الملك (1065م)', contribution: 'أول نظام تعليم جامعي منظم في العالم' }
    ],

    // رياض الجنة — أماكن العلم المباركة
    riyadJanna: [
        {
            name: 'الروضة الشريفة',
            location: 'المسجد النبوي — المدينة المنورة',
            hadith: 'ما بين بيتي ومنبري روضة من رياض الجنة — البخاري',
            significance: 'أشرف مكان لطلب العلم الشرعي على وجه الأرض'
        },
        {
            name: 'حلقات العلم في المساجد',
            location: 'كل مسجد على وجه الأرض',
            hadith: 'ما اجتمع قوم في بيت من بيوت الله يتلون كتاب الله ويتدارسونه إلا نزلت عليهم السكينة — مسلم',
            significance: 'كل حلقة علم في مسجد روضة من رياض الجنة'
        },
        {
            name: 'مجالس تعلم القرآن',
            location: 'في كل مكان',
            hadith: 'إن الملائكة تضع أجنحتها لطالب العلم رضًا بما يصنع — أبو داود',
            significance: 'الملائكة تحضر مجالس العلم وتحفّ بأهلها'
        }
    ],

    // تطبيقات العلم في الدنيا
    ilmApplications: {
        trade: [
            'العلم بأحكام البيع والشراء — لا يتاجر إلا عالم',
            'الحساب والمحاسبة — فريضة على كل تاجر',
            'معرفة الغش والتدليس لتجنبها',
            'علم التسعير العادل — مؤشر شيخة'
        ],
        management: [
            'الشورى — اتخاذ القرار بالمشاركة والعلم',
            'اختيار الأكفأ لكل منصب — علم الموارد البشرية',
            'العدل في التوزيع — علم المالية العامة',
            'الحسبة — علم الرقابة والجودة في الإسلام',
            'المحاسبة والأمانة — علم الحوكمة الرشيدة'
        ],
        science: [
            'علم المواد — الكيمياء والفيزياء والهندسة',
            'علم الطب — البشري والحيواني والنباتي',
            'علم الفلك — لمواقيت الصلاة والزكاة',
            'علم الرياضيات — للميراث والزكاة والتجارة',
            'علم الجغرافيا — لمعرفة الأرض وعمارتها'
        ],
        technology: [
            'البرمجة والذكاء الاصطناعي — علم نافع إذا وُجّه لخير الناس',
            'الاتصالات — لنشر العلم والخير',
            'الزراعة التقنية — لإطعام البشر',
            'الطاقة النظيفة — لعمارة الأرض'
        ]
    },

    islamicManagementScience: {
        title: 'تأسيس العلم الإداري الإسلامي بالكتاب والسنة',
        vision: 'بناء إدارة تحقق العبودية لله وتحقق الكفاية والإتقان والعدل والعمران النافع للناس.',
        quranFoundations: [
            { text: '﴿إن الله يأمركم أن تؤدوا الأمانات إلى أهلها﴾', area: 'اختيار القيادات وتوزيع المسؤوليات' },
            { text: '﴿وشاورهم في الأمر﴾', area: 'نظام الشورى وصناعة القرار' },
            { text: '﴿إن خير من استأجرت القوي الأمين﴾', area: 'معيار التوظيف: الكفاءة + الأمانة' },
            { text: '﴿وإذا حكمتم بين الناس أن تحكموا بالعدل﴾', area: 'العدالة المؤسسية والحوكمة' },
            { text: '﴿ولا تبخسوا الناس أشياءهم﴾', area: 'النزاهة المالية وحقوق أصحاب المصالح' }
        ],
        sunnahFoundations: [
            { text: 'كلكم راع وكلكم مسؤول عن رعيته', area: 'المسؤولية القيادية والمساءلة' },
            { text: 'إن الله يحب إذا عمل أحدكم عملًا أن يتقنه', area: 'إدارة الجودة والإتقان' },
            { text: 'لا ضرر ولا ضرار', area: 'إدارة المخاطر ومنع الضرر' },
            { text: 'من غشنا فليس منا', area: 'الشفافية ومنع الغش المؤسسي' },
            { text: 'الدين النصيحة', area: 'التغذية الراجعة والنصح المؤسسي' }
        ],
        usulRules: [
            'الأمور بمقاصدها',
            'الضرر يزال',
            'المشقة تجلب التيسير',
            'العادة محكمة إذا لم تخالف نصًا',
            'تصرف الإمام على الرعية منوط بالمصلحة'
        ],
        maqasidTargets: [
            'حفظ الدين بمنع الفساد الإداري',
            'حفظ النفس عبر أنظمة السلامة والرحمة',
            'حفظ العقل عبر التعلم المؤسسي المستمر',
            'حفظ المال عبر الحوكمة ومنع الهدر',
            'حفظ النسل والمجتمع عبر عدل الأنظمة'
        ],
        operatingPillars: [
            'النية والميثاق: العمل عبادة ومسؤولية',
            'التخطيط: أهداف قابلة للقياس مع نفع معتبر',
            'التمكين: وضع الشخص المناسب في المكان المناسب',
            'التنفيذ: انضباط زمني وجودة وإتقان',
            'المتابعة: مؤشرات أداء ومساءلة عادلة',
            'التحسين: مراجعة دورية وتصحيح مستمر'
        ],
        governancePolicy: [
            'لا ولاية بلا كفاءة وأمانة',
            'لا قرار مصيري بلا شورى موثقة',
            'لا إنفاق بلا بيان أثر ومصلحة',
            'لا تقييم بلا معيار عادل ومعلن',
            'لا تستر على فساد أو تضارب مصالح'
        ],
        institutionalScorecard: [
            {
                dimension: 'الهوية الشرعية',
                metrics: ['وجود ميثاق شرعي مكتوب', 'نسبة الالتزام بالسياسات الشرعية', 'زمن معالجة المخالفات']
            },
            {
                dimension: 'الكفاءة التشغيلية',
                metrics: ['نسبة إنجاز الأهداف', 'زمن دورة القرار', 'معدل أخطاء التنفيذ']
            },
            {
                dimension: 'العدالة المؤسسية',
                metrics: ['عدالة توزيع الفرص', 'شفافية الترقيات', 'معالجة التظلمات']
            },
            {
                dimension: 'النفع المجتمعي',
                metrics: ['مؤشر رضا المستفيدين', 'الأثر الاجتماعي', 'الاستدامة المالية']
            }
        ],
        implementationPhases: [
            'مرحلة التأسيس: بناء المرجعية والميثاق',
            'مرحلة البناء: تصميم السياسات والهياكل',
            'مرحلة التشغيل: تفعيل الحوكمة والرقابة',
            'مرحلة التمكين: إعداد القادة والكوادر',
            'مرحلة الريادة: نشر النموذج وتعميم الخبرة'
        ]
    },

    islamicSupplyChainSystem: {
        title: 'نظام سلاسل الإمداد والتوريد واللوجستيات الإسلامي',
        vision: 'سلسلة إمداد أمينة وعادلة وذكية تحفظ العلم والمنتج من المصدر إلى المستفيد بلا غش ولا ضرر.',
        quranFoundations: [
            '﴿وأوفوا الكيل والميزان بالقسط﴾',
            '﴿ولا تبخسوا الناس أشياءهم﴾',
            '﴿وتعاونوا على البر والتقوى﴾'
        ],
        sunnahFoundations: [
            'من غشنا فليس منا',
            'رحم الله رجلًا سمحًا إذا باع وإذا اشترى',
            'لا ضرر ولا ضرار'
        ],
        valueChain: [
            'تصنيع العلم: تحويل المعرفة إلى مناهج ومنتجات وحلول',
            'تعبئة وتغليف: حفظ السلامة والجودة وهوية المحتوى',
            'تخزين شرعي: شروط أمان وجودة ومنع الهدر',
            'نقل ولوجستيات: تتبع شفاف وزمن تسليم عادل',
            'توريد وتوزيع: أولوية الحاجة والنفع العام',
            'خدمة ما بعد التسليم: ضمان وإصلاح وتغذية راجعة'
        ],
        industrialClusters: [
            'تجمعات صناعية للكتاب والمحتوى التعليمي',
            'تجمعات تصنيع تقني يخدم التعليم والبحث',
            'مراكز تخزين ومعالجة بيانات المعرفة',
            'ممرات لوجستية تربط المعاهد والمصانع والأسواق'
        ],
        governancePolicy: [
            'لا توريد بلا توثيق مصدر ومطابقة',
            'لا تخزين بلا معيار سلامة وجودة',
            'لا نقل بلا تتبع ومسؤولية',
            'لا تسعير احتكاري ولا تلاعب في العرض',
            'أولوية التوريد للسلع والخدمات الأشد نفعًا'
        ],
        kpis: [
            'دقة التوريد (%)',
            'زمن دورة الطلب',
            'نسبة التلف والهدر',
            'مؤشر الشفافية والتتبع',
            'رضا المستفيد النهائي'
        ]
    },

    islamicInnovationSystem: {
        title: 'نظام الابتكار والاختراع والاستكشاف الإسلامي',
        vision: 'إحياء سنن التفكر والاكتشاف لتوليد اختراعات نافعة تخدم الإنسان وتحقق الاستخلاف الراشد.',
        quranFoundations: [
            '﴿قل سيروا في الأرض فانظروا﴾',
            '﴿ويتفكرون في خلق السماوات والأرض﴾',
            '﴿وعلم آدم الأسماء كلها﴾'
        ],
        sunnahFoundations: [
            'أنتم أعلم بأمر دنياكم',
            'تداووا عباد الله فإن الله لم يضع داء إلا وضع له دواء',
            'إن الله يحب إذا عمل أحدكم عملًا أن يتقنه'
        ],
        innovationPipeline: [
            'رصد الحاجة والمشكلة الحقيقية',
            'صياغة فرضية نافعة منضبطة شرعًا',
            'تجريب مخبري وميداني متكرر',
            'إثبات الأثر والجدوى',
            'توثيق الملكية المعرفية النافعة',
            'تعميم الحل عبر الصناعة والتوريد'
        ],
        priorityFields: [
            'تقنيات التعليم القرآني والحديثي',
            'الصناعات الدوائية والغذائية الآمنة',
            'الطاقة والمياه والزراعة المستدامة',
            'الحوسبة والذكاء الاصطناعي الأخلاقي'
        ],
        ethicsPolicy: [
            'الابتكار للمنفعة لا للإفساد',
            'المنع الصارم للتطبيقات الضارة بالإنسان',
            'الشفافية في نتائج الاختبارات',
            'حفظ الحقوق العلمية ومنع السطو'
        ],
        governancePolicy: [
            'لا مشروع ابتكار بلا دراسة أثر شرعي ومجتمعي',
            'لا انتقال للتوسع بلا نتائج اختبار موثقة',
            'لا تمويل بلا أولوية نفع عام',
            'لا احتكار يمنع وصول الحلول النافعة'
        ],
        kpis: [
            'نسبة المشاريع المكتملة تجريبيًا',
            'معدل التحول من فكرة إلى نموذج منتج',
            'قيمة الأثر المجتمعي للابتكار',
            'نسبة الالتزام بسياسات الأخلاقيات'
        ]
    },

    islamicIndustrySystem: {
        title: 'نظام الصناعة الإسلامي',
        vision: 'صناعة قوية عادلة منتجة للعلم والدواء والغذاء والتقنية ضمن قيم الأمانة والجودة والرحمة.',
        quranFoundations: [
            '﴿وأعدوا لهم ما استطعتم من قوة﴾',
            '﴿هو أنشأكم من الأرض واستعمركم فيها﴾',
            '﴿وقل اعملوا فسيرى الله عملكم﴾'
        ],
        sunnahFoundations: [
            'ما أكل أحد طعامًا قط خيرًا من أن يأكل من عمل يده',
            'إن الله كتب الإحسان على كل شيء',
            'إن الله يحب إذا عمل أحدكم عملًا أن يتقنه'
        ],
        industrialArchitecture: [
            'مصانع معرفة: مناهج، أدوات، محتوى، منصات',
            'مصانع تحويل: تحويل البحث إلى منتجات',
            'مصانع تمكين: تجهيز الكوادر والتدريب المهني',
            'مصانع استدامة: تقليل النفايات وزيادة الكفاءة'
        ],
        standards: [
            'جودة المنتج والمطابقة',
            'سلامة العامل والبيئة',
            'حلال السلسلة الإنتاجية',
            'تتبع المادة الخام حتى المنتج النهائي'
        ],
        governancePolicy: [
            'لا تشغيل مصنع بلا معايير سلامة معتمدة',
            'لا توريد مواد بلا فحص جودة ومصدر موثق',
            'لا إنتاج ضار بالبيئة أو المجتمع',
            'إفصاح دوري عن الأداء والجودة والهدر'
        ],
        kpis: [
            'الإنتاجية لكل ساعة تشغيل',
            'نسبة العيوب المعيارية',
            'كفاءة استهلاك الطاقة',
            'معدل تدريب العاملين',
            'قيمة الابتكار الصناعي السنوية'
        ]
    },

    islamicAiOrganization: {
        title: 'منظمة ونظام الذكاء الصناعي الإسلامي',
        vision: 'تطوير ذكاء صناعي خادم للوحي والإنسان، يرفع النفع ويمنع الضرر ويصون القيم.',
        principles: [
            'الكتاب والسنة مرجعية قيمية حاكمة',
            'الإنسان مكرم والآلة خادمة',
            'الشفافية والعدالة وعدم التحيز',
            'الخصوصية والأمن أمانة'
        ],
        operatingModel: [
            'مجلس شرعي تقني للمراجعة',
            'مختبر نماذج وتقييم مخاطر',
            'حوكمة بيانات وتوثيق مصادر',
            'رقابة دورية قبل وبعد الإطلاق'
        ],
        allowedDomains: [
            'التعليم الشرعي واللغوي',
            'الصحة والسلامة',
            'تحسين سلاسل الإمداد والصناعة',
            'الخدمات الحكومية والمجتمعية النافعة'
        ],
        prohibitedDomains: [
            'التضليل والتلاعب المعرفي',
            'الاعتداء على الخصوصية',
            'الأذى المتعمد أو التمييز الجائر',
            'أي استخدام يخالف الشريعة ويضر الناس'
        ],
        governancePolicy: [
            'لا نشر نموذج بلا تقييم مخاطر موثق',
            'لا بيانات حساسة بلا إخفاء وحماية',
            'لا قرار حرج بلا إشراف بشري مسؤول',
            'مراجعة شرعية وتقنية إلزامية كل ربع سنة'
        ],
        aiKpis: [
            'دقة المخرجات الموثقة',
            'معدل اكتشاف الأخطاء قبل النشر',
            'مؤشر العدالة وتقليل التحيز',
            'زمن الاستجابة للخطر'
        ]
    },

    islamicComputingSystem: {
        title: 'نظام ومنظمة الحوسبة والحساب الإسلامي',
        vision: 'بناء بنية حوسبة موثوقة وآمنة وفعالة تخدم مقاصد الشريعة في حفظ الدين والنفس والعقل والمال.',
        quranFoundations: [
            '﴿ولا تقف ما ليس لك به علم﴾',
            '﴿إن الله يأمركم أن تؤدوا الأمانات إلى أهلها﴾',
            '﴿وإذا قلتم فاعدلوا﴾'
        ],
        sunnahFoundations: [
            'الدين النصيحة',
            'من غشنا فليس منا',
            'إن الله يحب إذا عمل أحدكم عملًا أن يتقنه'
        ],
        foundations: [
            'الدقة والصدق في الحساب',
            'الأمانة في البيانات',
            'العدالة في الخوارزميات',
            'الكفاءة في استهلاك الموارد'
        ],
        coreDomains: [
            'حوسبة تعليم القرآن والسنة',
            'حوسبة الزكاة والمواريث والمعاملات',
            'حوسبة سلاسل الإمداد والإنتاج',
            'حوسبة الاستشراف التقديري واتخاذ القرار المؤسسي'
        ],
        architectureLayers: [
            'طبقة البيانات: جمع وتدقيق وتوثيق',
            'طبقة المعالجة: خوارزميات ونماذج حساب',
            'طبقة الحوكمة: صلاحيات ومراجعة وتدقيق',
            'طبقة الخدمة: واجهات قرار وتقارير تنفيذ'
        ],
        controlPolicy: [
            'لا قرار آلي نهائي بلا مسؤولية بشرية',
            'لا حساب مالي بلا قابلية تدقيق',
            'لا تخزين بلا تصنيف وحماية',
            'لا نموذج حسابي بلا اختبار وتحقيق',
            'الاستشراف الحسابي اجتهاد تحليلي وليس ادعاءً لمعرفة الغيب'
        ],
        computingKpis: [
            'دقة الحسابات الحرجة',
            'توافر الأنظمة واستمرارية الخدمة',
            'زمن معالجة المعاملات',
            'معدل الثغرات الأمنية المكتشفة والمغلقة'
        ],
        organizations: [
            {
                id: 'ISCO-01',
                nameAr: 'منظمة الحاسب الإسلامية',
                nameEn: 'Islamic Computer Organization',
                acronym: 'ICO',
                mission: 'توحيد معايير الحاسب وأجهزة المعالجة في إطار إسلامي يراعي الأمانة والدقة وصون حقوق المستخدم.',
                scope: [
                    'معايير الأجهزة والبنية التحتية الحاسوبية',
                    'اعتماد الأجهزة الموثوقة للمؤسسات الإسلامية',
                    'توجيهات الكفاءة الطاقية والاستدامة',
                    'تقييم سلاسل توريد الأجهزة من منظور شرعي'
                ],
                principles: [
                    'لا هدر في الموارد الحاسوبية',
                    'شفافية المواصفات والأداء',
                    'حماية المستخدم من الغش التقني'
                ],
                status: 'مقترح — مفتوح للتأسيس'
            },
            {
                id: 'ISCA-02',
                nameAr: 'منظمة الحساب الإسلامية',
                nameEn: 'Islamic Computing Organization',
                acronym: 'IsCO',
                mission: 'بناء منظومة الحساب الرقمي الإسلامي: الزكاة والمواريث والمعاملات المالية وتطبيقات الفقه المحوسبة.',
                scope: [
                    'حوسبة الزكاة ومحركات الحساب الفقهي',
                    'حوسبة المواريث والفرائض',
                    'حوسبة العقود الشرعية والمعاملات',
                    'بروتوكولات التحقق الشرعي للمخرجات الحاسوبية'
                ],
                principles: [
                    'التوافق مع المذاهب الأربعة كخيارات حسابية',
                    'دقة المخرجات الحاسوبية أمانة',
                    'كل نتيجة قابلة للمراجعة والتدقيق'
                ],
                status: 'مقترح — مفتوح للتأسيس'
            },
            {
                id: 'ISCS-03',
                nameAr: 'منظمة علوم الحاسب الإسلامية',
                nameEn: 'Islamic Computer Science Organization',
                acronym: 'ICSO',
                mission: 'تعليم علوم الحاسب وتطوير مناهجه وفق القيم الإسلامية وتخريج كوادر تقنية مؤهلة أخلاقيًا وعلميًا.',
                scope: [
                    'مناهج علوم الحاسب الإسلامية للجامعات والمعاهد',
                    'أبحاث الخوارزميات والبنية التحتية من منظور إسلامي',
                    'أخلاقيات هندسة البرمجيات والأنظمة',
                    'شهادات اعتماد تقنية إسلامية',
                    'معاجم المصطلحات الحاسوبية بالعربية'
                ],
                principles: [
                    'العلم عبادة والإتقان واجب',
                    'الأمانة الأكاديمية شرط لا يُساوم',
                    'تطوير علوم الحاسب نفعًا للأمة والبشرية'
                ],
                status: 'مقترح — مفتوح للتأسيس'
            },
            {
                id: 'ISHPC-04',
                nameAr: 'منظمة الحاسب الضخم والحواسيب الضخمة الإسلامية',
                nameEn: 'Islamic High-Performance Computing Organization',
                acronym: 'IHPCO',
                mission: 'توطين تقنيات الحوسبة العالية الأداء (HPC) وبناء بنية تحتية ضخمة تخدم الأبحاث والمشاريع الاستراتيجية الإسلامية.',
                scope: [
                    'بناء مراكز حوسبة ضخمة إسلامية مشتركة',
                    'الحوسبة الفائقة لأبحاث الشريعة والإدارة والطب',
                    'نمذجة وتحليل البيانات الضخمة عالية السرعة',
                    'توزيع الطاقة الحاسوبية على المؤسسات الإسلامية',
                    'أمن الأنظمة الحاسوبية الضخمة والمقاومة للتلاعب'
                ],
                principles: [
                    'المشاركة والعدل في توزيع القدرة الحاسوبية',
                    'لا احتكار للبنية التحتية الضخمة',
                    'تسخير القوة الحوسبية للنفع العام'
                ],
                status: 'مقترح — مفتوح للتأسيس'
            },
            {
                id: 'ISBD-05',
                nameAr: 'منظمة البيانات الضخمة الإسلامية',
                nameEn: 'Islamic Big Data Organization',
                acronym: 'IBDO',
                mission: 'حوكمة البيانات الضخمة وتوظيفها في خدمة مقاصد الشريعة مع صون الخصوصية وتحقيق العدل في جمع البيانات واستخدامها.',
                scope: [
                    'معايير حوكمة البيانات الضخمة الإسلامية',
                    'أُطر الخصوصية وحماية بيانات المسلمين',
                    'تحليلات السوق والاقتصاد والمعاملات الإسلامية',
                    'قواعد بيانات ضخمة للفقه والتراث الإسلامي',
                    'منع التحيز والتلاعب في نماذج البيانات الضخمة'
                ],
                principles: [
                    'البيانات أمانة والخصوصية حق محمي',
                    'لا جمع بيانات لغرض مجهول أو ضار',
                    'الشفافية في مصادر البيانات ومنهجية تحليلها',
                    'لا بيع بيانات شخصية تضر أصحابها'
                ],
                status: 'مقترح — مفتوح للتأسيس'
            },
            {
                id: 'ISCO-06',
                nameAr: 'منظمة خوادم والخوادم والسحابات الإسلامية',
                nameEn: 'Islamic Servers and Cloud Organization',
                acronym: 'ISCLO',
                mission: 'بناء بنية تحتية خادمية وسحابية إسلامية: خوادم موثوقة وسحابة مستقلة تحفظ سيادة البيانات وتحمي المسلمين من التبعية التقنية.',
                vision: 'أن تمتلك الأمة الإسلامية بنيتها التحتية الرقمية الخاصة — من الخادم إلى السحابة — تحكمها قيم الأمانة والكفاءة والسيادة.',
                quranFoundations: [
                    '﴿وأعدوا لهم ما استطعتم من قوة﴾',
                    '﴿إن الله يأمركم أن تؤدوا الأمانات إلى أهلها﴾',
                    '﴿ولله العزة ولرسوله وللمؤمنين﴾'
                ],
                scope: [
                    'معايير الخوادم الإسلامية: أجهزة وبرمجيات وإدارة',
                    'مراكز بيانات إسلامية مشتركة (Data Centers)',
                    'سحابة إسلامية خاصة (Private Islamic Cloud)',
                    'سحابة هجينة للمؤسسات الإسلامية (Hybrid Cloud)',
                    'شبكات توزيع المحتوى الإسلامي (CDN)',
                    'خدمات البريد الإلكتروني والاتصالات الآمنة',
                    'بروتوكولات أمان الخوادم ومقاومة الاختراق',
                    'استضافة المواقع والتطبيقات الإسلامية بمعايير شرعية'
                ],
                cloudLayers: [
                    {
                        layer: 'IaaS الإسلامية',
                        desc: 'بنية تحتية كخدمة: خوادم، تخزين، شبكات — بسيادة إسلامية'
                    },
                    {
                        layer: 'PaaS الإسلامية',
                        desc: 'منصة كخدمة: بيئات تطوير ونشر للتطبيقات الإسلامية'
                    },
                    {
                        layer: 'SaaS الإسلامية',
                        desc: 'برمجيات كخدمة: تطبيقات جاهزة للتعليم والفقه والاقتصاد'
                    },
                    {
                        layer: 'Islamic Edge Computing',
                        desc: 'حوسبة طرفية للمساجد والمدارس والمناطق النائية'
                    }
                ],
                principles: [
                    'سيادة البيانات: بيانات المسلمين تبقى تحت سيطرة المسلمين',
                    'لا تبعية لشركات أو حكومات تخالف مصالح الأمة',
                    'الأمانة في إدارة الخوادم والبيانات المستضافة',
                    'الكفاءة الطاقية والاستدامة البيئية في مراكز البيانات',
                    'الشفافية الكاملة في سياسات الاستضافة والخصوصية',
                    'التعاون بين المؤسسات الإسلامية لتقاسم البنية التحتية'
                ],
                kpis: [
                    'نسبة البيانات الإسلامية المستضافة محلياً',
                    'وقت التشغيل (Uptime) لمراكز البيانات',
                    'كفاءة استهلاك الطاقة (PUE)',
                    'معدل الحوادث الأمنية المكتشفة والمعالجة',
                    'عدد المؤسسات الإسلامية المنضمة للسحابة المشتركة'
                ],
                status: 'مقترح — مفتوح للتأسيس'
            }
        ]
    },

    islamicAgricultureSystem: {
        title: 'نظام الزراعة الإسلامي',
        vision: 'زراعة رحيمة مستدامة تحقق الأمن الغذائي وتحفظ الماء والتربة وتخدم الإنسان والبيئة.',
        quranFoundations: [
            '﴿هو أنشأكم من الأرض واستعمركم فيها﴾',
            '﴿وأنزلنا من السماء ماء مباركًا فأنبتنا به جنات﴾',
            '﴿ولا تفسدوا في الأرض بعد إصلاحها﴾'
        ],
        sunnahFoundations: [
            'ما من مسلم يغرس غرسًا أو يزرع زرعًا فيأكل منه طير أو إنسان أو بهيمة إلا كان له به صدقة',
            'إن قامت الساعة وفي يد أحدكم فسيلة فإن استطاع أن لا يقوم حتى يغرسها فليغرسها',
            'في كل كبد رطبة أجر'
        ],
        agricultureModel: [
            'تخطيط المحاصيل وفق حاجة المجتمع',
            'إدارة مياه عادلة ومنضبطة',
            'زراعة ذكية بالبيانات والاستشعار',
            'سلسلة تبريد وتخزين تقلل الفاقد',
            'تعبئة وتغليف آمن يحفظ الجودة',
            'توزيع عادل يمنع الاحتكار والهدر'
        ],
        policy: [
            'لا إضرار بالتربة أو المياه',
            'لا احتكار غذائي ولا تلاعب في الأسعار',
            'أولوية الاكتفاء المحلي والأمن الغذائي',
            'تشجيع التقنيات الزراعية النافعة'
        ],
        kpis: [
            'إنتاجية الفدان',
            'كفاءة استهلاك المياه',
            'نسبة الفاقد بعد الحصاد',
            'مؤشر الأمن الغذائي المحلي'
        ]
    },

    islamicAiSciencesIntegration: {
        title: 'دمج جميع العلوم بالذكاء الصناعي على الكتاب والسنة',
        vision: 'توحيد العلوم الشرعية والإدارية والتطبيقية والطبية ضمن منظومة ذكاء صناعي منضبطة شرعًا وموجهة للنفع.',
        scripturalAnchors: {
            quran: ['﴿اقرأ باسم ربك الذي خلق﴾', '﴿ولا تقف ما ليس لك به علم﴾', '﴿وتعاونوا على البر والتقوى﴾'],
            sunnah: ['من يرد الله به خيرًا يفقهه في الدين', 'إن الله يحب إذا عمل أحدكم عملًا أن يتقنه', 'الدين النصيحة']
        },
        knowledgeDomains: [
            { name: 'العلوم الشرعية', integration: 'فقه رقمي، تفسير مساعد، تخريج حديث، تعلم متعدد اللغات مع مراجعة علمية' },
            { name: 'العلوم الإدارية', integration: 'تحليل أداء، دعم قرار بالشورى الرقمية، كشف المخاطر والفساد' },
            { name: 'العلوم الطبية', integration: 'مساعدة التشخيص، إدارة المستشفيات، سلاسل دواء آمنة' },
            { name: 'العلوم التطبيقية والهندسية', integration: 'تصميم ذكي، صيانة استباقية تحليلية، تصنيع محسن' },
            { name: 'الزراعة والغذاء', integration: 'استشراف إنتاج المحاصيل، ري ذكي، إدارة سلسلة الغذاء' }
        ],
        operatingLayers: [
            'طبقة النص الشرعي: مرجعية وضبط',
            'طبقة المعرفة المتخصصة: بيانات ومناهج ونماذج',
            'طبقة الذكاء الصناعي: تحليل وتوصية ومحاكاة',
            'طبقة الحوكمة: مراجعة شرعية وتقنية',
            'طبقة التنفيذ: قرارات وخدمات ومتابعة أثر'
        ],
        governance: [
            'لا إخراج شرعي حاسم بلا مراجعة عالم',
            'لا استخدام طبي حرج بلا اعتماد مهني',
            'لا قرار مؤسسي بلا شفافية معيار',
            'توثيق كل نموذج وبياناته ومخاطره',
            'قياس الأثر الشرعي والمجتمعي قبل التوسع',
            'الغيب لله وحده، وما تنتجه النماذج هو دراسة تقديرية مبنية على بيانات وتجارب واجتهاد'
        ],
        quarterlyRoadmap: [
            'الربع 1: حوكمة البيانات وبناء النماذج المرجعية',
            'الربع 2: إطلاق تجريبي في الشرعي والإداري',
            'الربع 3: توسيع الطب والزراعة والصناعة',
            'الربع 4: قياس الأثر والتحسين والتعميم'
        ]
    },

    techAutoAccessFoundation: {
        title: 'أساس الوصول التقني والتكامل التلقائي',
        objective: 'تمكين المستهلك من تكامل شامل بضغطة زر، وتمكين تكامل ذاتي بدون أي ضغطة عند تحقق شروط الأمان والجاهزية.',
        oneClickFlow: [
            'توثيق هوية المستهلك والصلاحيات',
            'تشغيل محرك التكامل الموحد',
            'دمج الخدمات والأنظمة والمحتوى',
            'إظهار نتيجة موحدة في واجهة واحدة'
        ],
        zeroClickFlow: [
            'اكتشاف الحدث تلقائيًا (طلب جديد/تغير حالة/وقت دوري)',
            'التحقق من السياسات والحوكمة قبل التنفيذ',
            'تنفيذ التكامل الآلي بين الأنظمة السبعة',
            'تحديث مؤشرات الأداء وتسجيل الأثر فورًا'
        ],
        technicalPillars: [
            'هوية موحدة وصلاحيات دقيقة',
            'عقود بيانات قياسية بين الأنظمة',
            'محرك قرارات وسياسات شرعية تقنية',
            'قناة أحداث للتشغيل التلقائي',
            'مراقبة لحظية وتنبيهات استباقية',
            'مسار رجوع آمن عند أي خطأ'
        ],
        safetyRules: [
            'لا تنفيذ تلقائي لقرار حرج بدون تحكم بشري',
            'لا تمرير بيانات حساسة بلا حماية',
            'لا تكامل يخالف سياسة شرعية أو قانونية',
            'كل تنفيذ آلي يجب أن يكون قابلاً للتدقيق'
        ]
    },

    arabIslamicOrganization: {
        title: 'المنظمة العربية الإسلامية',
        scope: 'منظمة جامعة ذات نطاق عالمي للأمة العربية والإسلامية ولأمة محمد صلى الله عليه وسلم',
        vision: 'توحيد الجهود العربية والإسلامية في منظومة مؤسسية عالمية تحفظ الهوية وتخدم الأمة بالعلم والاقتصاد والتقنية والعدل.',
        message: 'مرجعية جامعة للتكامل العربي الإسلامي في مجالات الحضارة والاقتصاد والتقنية والخدمة العامة.',
        foundations: {
            quran: [
                '﴿واعتصموا بحبل الله جميعًا ولا تفرقوا﴾',
                '﴿وتعاونوا على البر والتقوى﴾',
                '﴿إن هذه أمتكم أمة واحدة وأنا ربكم فاعبدون﴾'
            ],
            sunnah: [
                'المؤمن للمؤمن كالبنيان يشد بعضه بعضًا',
                'مثل المؤمنين في توادهم وتراحمهم وتعاطفهم كمثل الجسد الواحد',
                'يد الله مع الجماعة'
            ]
        },
        strategicDomains: [
            'التكامل العربي الإسلامي المؤسسي',
            'النهضة العلمية والبحثية',
            'التكامل الاقتصادي والتجاري',
            'التمكين التقني والسيادة الرقمية',
            'حماية الموارد والثروات والمجالات الحيوية',
            'خدمة الإنسان والبيئة والمخلوقات ضمن أمانة الاستخلاف'
        ],
        governance: [
            'مرجعية الكتاب والسنة وسنة الخلفاء الراشدين',
            'العدل بين الشعوب والمؤسسات والأفراد',
            'حفظ المصالح العامة ومنع الفساد والاحتكار',
            'الشفافية والمساءلة والتدقيق في القرارات والمشروعات',
            'تقديم مصلحة الأمة على التبعية والتفكك'
        ],
        beneficiaries: [
            'الدول العربية والإسلامية',
            'مؤسسات الأمة العلمية والاقتصادية والتقنية',
            'التجار والمستثمرون ورواد الأعمال',
            'المجتمعات المحلية والقطاعات الحيوية',
            'أمة محمد صلى الله عليه وسلم في كل مكان'
        ],
        status: 'مفعلة مرجعيًا ضمن منظومة شيخة'
    },

    globalUmmahOrganizations: {
        title: 'المرجع العالمي الموحد لمنظمات أمة محمد صلى الله عليه وسلم',
        scope: 'نطاق عالمي يخدم أمة محمد صلى الله عليه وسلم، ويربط العلم والاقتصاد والتقنية والموارد والتجارة والخدمة العامة في حزمة واحدة.',
        identity: {
            name: 'الحزمة العالمية الموحدة للمنظمات الإسلامية',
            audience: 'أمة محمد صلى الله عليه وسلم',
            operatingRange: 'عالمي',
            foundation: 'الكتاب والسنة وسنة الخلفاء الراشدين',
            objective: 'بناء مرجع مؤسسي عالمي جامع للتمكين الإسلامي العلمي والاقتصادي والتقني والحضاري.'
        },
        multiScopeCoverage: [
            'الخبر',
            'المنطقة الشرقية',
            'المملكة العربية السعودية',
            'جزيرة العرب',
            'الخليج العربي',
            'العرب',
            'آسيا',
            'دول مجموعة العشرين',
            'العالمي',
            'الكوني',
            'الأرضي',
            'الفضائي',
            'السمائي'
        ],
        rootModel: {
            title: 'البذرة والنواة والجذر الإسلامي الرقمي',
            mission: 'تأسيس أصل رقمي إسلامي مركزي تنبثق منه المنصات والأنظمة والبيانات والخدمات، بحيث يكون الجذر التقني موحدًا وآمنًا وقابلاً للنمو.',
            pillars: [
                'جذر هوياتي رقمي موحد',
                'نواة تشغيلية للأنظمة والمنظمات',
                'بذرة بيانات ومعرفة قابلة للتوسع',
                'مسار حوكمة يضمن الأصالة والاستمرارية'
            ]
        },
        unifiedCurrencyFramework: {
            name: 'شيخة',
            title: 'العملة الإسلامية الموحدة شيخة',
            class: 'عملة رقمية إسلامية موحدة',
            scope: 'مرجع عالمي لأمة محمد صلى الله عليه وسلم',
            mission: 'تأسيس إطار مرجعي لعملة رقمية إسلامية موحدة باسم شيخة تخدم العدالة والشفافية والتسوية الموثوقة والتكامل الاقتصادي الإسلامي.',
            positioning: 'مرجع تنظيمي ومؤسسي داخل المنظومة، وليس طرحًا استثماريًا أو دعوةً للمضاربة أو وعدًا بعائد.',
            activationModes: [
                'مؤسسي',
                'استثماري منضبط',
                'تجاري منضبط',
                'خيري',
                'الاستثمار في الخير والأجر'
            ],
            principles: [
                'الالتزام بأحكام الشريعة ومنع الربا والغرر والميسر',
                'وجود حوكمة شرعية وتقنية ومحاسبية مستقلة',
                'الشفافية في الإصدار والتغطية وقواعد التداول والتسوية',
                'ربط المنفعة بالاقتصاد الحقيقي والتسويات المشروعة',
                'عدم تقديم أي ضمان أرباح أو مزايا استثمارية مضللة'
            ],
            operatingNeeds: [
                'منظمة المال الإسلامية',
                'منظمة بيت مال المسلمين الإسلامية',
                'منظمة العملة الرقمية الإسلامية',
                'منظمة البورصة الإسلامية',
                'منظمة بلوك شين الإسلامية',
                'منظمة تداول الإسلامية'
            ]
        },
        transportConvergenceModel: {
            title: 'نموذج تقارب النقل واللوجستيات والشبكات',
            objective: 'توحيد النقل المادي والرقمي والطاقة ضمن منظومة تشغيل واحدة قادرة على نقل كل ما يمكن نقله بكفاءة وأمان.',
            layers: [
                'نقل مادي: بضائع وأفراد وقوافل ورحلات',
                'نقل طاقي: شبكات الكهرباء والوقود والطاقة البديلة',
                'نقل رقمي: إنترنت وبيانات وذكاء صناعي',
                'نقل شبكي: شبكات سلكية ولاسلكية وربط بيني',
                'حوكمة وتشغيل: مراقبة لحظية ومعايير موحدة'
            ],
            transportSmartKpis: [
                'زمن عبور القوافل والرحلات التجارية',
                'اعتمادية الشبكات السلكية واللاسلكية',
                'زمن نقل البيانات والحمولات الرقمية',
                'نسبة تكامل النقل مع اللوجستيات',
                'كفاءة نقل الطاقة وتقليل الفاقد',
                'استمرارية الخدمة عبر القطاعات المنقولة'
            ]
        },
        intelligentFusionModel: {
            title: 'منظومة شيخة للتقنية الإسلامية المندمجة',
            architectureName: 'Sheikha Islamic Intelligent Fusion Stack',
            objective: 'ابتكار تقنية إسلامية موحدة تجمع الواقع الممتد والذكاء الصناعي والبلوك شين وسلاسل الإمداد وERP/MIS في نسيج تشغيلي واحد منضبط شرعياً.',
            coreIdea: 'دمج الإدراك البصري والبيانات والمعاملات والتشغيل المؤسسي في منصة واحدة ترى وتفهم وتوثق وتنفذ وتراقب في الزمن الحقيقي.',
            interactionParadigm: 'تقنية مدمجة بلا ضغطة زر تعتمد على التفاعل الصفري الواعي بالسياق، بحيث تتجاوب الأنظمة والموجودات والبيئات الحية والافتراضية تلقائياً وفق الأذونات والضوابط.',
            layers: [
                'طبقة الواقع الممتد XR: الواقع المعزز والافتراضي والمختلط والمدمج لعرض المصانع والمخازن والأصول والعمليات ميدانياً.',
                'طبقة الذكاء الصناعي: فهم السياق، التنبؤ، التوصية، الأتمتة، المساعدات الذكية، والتحليل الشرعي والتشغيلي.',
                'طبقة البلوك شين المؤسسي: توثيق العقود والحركات وسجلات التتبع والامتثال وسلسلة الملكية دون عبث.',
                'طبقة سلاسل الإمداد والتوريد الذكية: تخطيط الطلب، التوريد، التتبع، إدارة المخزون، تقليل الهدر، ورفع الاعتمادية.',
                'طبقة ERP وMIS الإسلامية: المحاسبة، المشتريات، الموارد البشرية، الأصول، التقارير الإدارية، ولوحات القرار التنفيذية.',
                'طبقة الحوكمة الشرعية: فحص المعاملات والسياسات والتنبيهات لمنع الربا والغرر والغش والاحتكار والانحراف التشغيلي.'
            ],
            flagshipCapabilities: [
                'توأم رقمي حي للمستودعات والمصانع والأسواق والمشاريع يمكن عرضه عبر XR.',
                'وكيل ذكاء صناعي يراقب العمليات ويقترح قرارات تنفيذية منضبطة بالأولويات الشرعية والتجارية.',
                'سجل بلوك شين داخلي لعقود التوريد والتسليم والفواتير والتسويات والأصول الحساسة.',
                'محرك تنبؤ للطلب والمخاطر والانقطاعات والتأخير والتذبذب في الأسعار والإمداد.',
                'لوحة قيادة موحدة تجمع ERP وMIS وسلاسل الإمداد والبلوك شين والواقع الممتد في شاشة قرار واحدة.'
            ],
            sensoryFabric: [
                'متحسسات بيئية وتقنية لمراقبة الحركة والحرارة والرطوبة والموقع والحالة التشغيلية.',
                'مؤشرات حيوية وتقنية مصرح بها لرفع السلامة والرفاه والإنتاجية دون انتهاك الخصوصية.',
                'تحليل الأنماط التشغيلية والسلوكية بإطار موافقة واستخدام نافع يمنع التتبع المؤذي أو التمييز.',
                'أطراف حسية طبيعية وتقنية تتكامل مع الواقع الممتد ولوحات التحكم والتوأم الرقمي.'
            ],
            dataFabric: [
                'دمج البيانات المهيكلة وغير المهيكلة وشبه المهيكلة في نسيج بيانات موحد.',
                'ربط النصوص والصور والصوت والفيديو والسجلات الحركية والحسية في سياق تشغيلي واحد.',
                'بناء فهارس معرفة تشغيلية وشرعية تخدم الدين والمجتمع والمنفعة العامة.',
                'تنظيف البيانات وتدقيقها وتصنيفها وربطها بالأصول والعقود والقرارات التنفيذية.'
            ],
            mhsErpFramework: {
                title: 'نظام MHS ERP / MIS الإسلامي',
                mission: 'تأسيس نظام إداري ومؤسسي إسلامي يدمج ERP وMIS مع الذكاء الصناعي لإدارة المال والموارد والأعمال والمعرفة بمرجعية شرعية واضحة.',
                modules: [
                    'المالية والمحاسبة والزكاة والقيود الشرعية',
                    'المشتريات والعقود والموردون',
                    'المخزون والمستودعات والأصول',
                    'الموارد البشرية والرواتب والأداء',
                    'المشاريع والصيانة والخدمات',
                    'التقارير الإدارية وذكاء الأعمال ولوحات القرار',
                    'إدارة الوثائق والمعرفة المؤسسية',
                    'إدارة الامتثال والرقابة والتدقيق'
                ],
                aiModes: [
                    'مساعد إداري ذكي يشرح ويقترح وينبه ويؤتمت الإجراءات',
                    'تحليل الانحرافات والتنبؤ بالمخاطر والاختناقات',
                    'اقتراحات شراء وتوريد وتشغيل وصيانة قائمة على البيانات',
                    'صياغة تقارير تنفيذية عربية ذكية للإدارة العليا',
                    'محرك قرار منضبط شرعياً للسياسات والاعتمادات الحرجة'
                ],
                islamicAdminPrinciples: [
                    'الإدارة أمانة وعدل وإتقان وليست مجرد تشغيل رقمي',
                    'كل دورة مالية أو تعاقدية تمر عبر ضوابط الامتثال الشرعي',
                    'منع تضارب المصالح والغش والاحتكار وإخفاء المعلومات',
                    'إعطاء النفس حقها وتزكية الوقت وتحسين جودة المعيشة والعمل الكريم'
                ]
            },
            zeroTouchScenarios: [
                'مستودع ذكي يتعرف على الحركة والمخزون والحرارة والرطوبة ويصدر تنبيهات وتوصيات تلقائية.',
                'رحلة توريد ترى الموقع والحالة والتأخير والمخاطر وتعيد تخطيط المسار تلقائياً.',
                'مكتب إداري إسلامي يولد تقارير يومية وقرارات مقترحة دون انتظار إدخال يدوي مستمر.',
                'بيئة واقع ممتد تعرض الأصل أو المشروع أو السوق مع كل مؤشرات الأداء والسجل التعاقدي في لحظته.'
            ],
            islamicControls: [
                'منع المعاملات الربوية أو الرسوم غير المشروعة داخل سير العمل المالي.',
                'فرض الشفافية على المصدر والسعر والتسليم والجودة والتوثيق.',
                'منع بيع ما لا يملك النظام إثباته أو ما لا يمكن تتبعه والتحقق منه.',
                'تضمين مراجعة شرعية للسياسات والنماذج الذكية الحرجة قبل الاعتماد.',
                'حماية الخصوصية والأمانة وعدم توظيف الذكاء الصناعي أو XR في التضليل أو الضرر.'
            ],
            targetDomains: [
                'المعادن والسكراب والأسواق الصناعية',
                'المخازن والموانئ والمنافذ والقوافل والرحلات التجارية',
                'المقاولات والمشاريع والأصول والمعدات',
                'الغذاء والماء والدواء والطاقة',
                'القطاع التعليمي والإداري والمالي الإسلامي'
            ],
            outcomes: [
                'رؤية تشغيلية لحظية من الميدان إلى الإدارة العليا',
                'انخفاض الهدر والتأخير والتلاعب والأخطاء اليدوية',
                'تحسين القرار التنفيذي والالتزام الشرعي',
                'رفع موثوقية التوريد والتسليم والتوثيق',
                'تمكين مؤسسة إسلامية ذكية قابلة للتوسع محلياً وعالمياً'
            ]
        },
        organizations: [
            {
                id: 'UMMAH-ORG-01',
                nameAr: 'منظمة شيخة الإسلامية',
                nameEn: 'Sheikha Islamic Organization',
                sector: 'الهوية المؤسسية',
                scope: 'عالمي',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'الكيان الجامع لهوية شيخة المؤسسية، ويربط بين المرجع الشرعي والتمكين التقني والاقتصادي والتنظيمي للمنظومة.'
            },
            {
                id: 'UMMAH-ORG-02',
                nameAr: 'المنظمة العربية الإسلامية',
                nameEn: 'Arab Islamic Organization',
                sector: 'مرجعية جامعة',
                scope: 'عالمي',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'توحيد الجهود العربية والإسلامية في إطار عالمي جامع يخدم الأمة في مجالات الحضارة والعلم والاقتصاد والتقنية.'
            },
            {
                id: 'UMMAH-ORG-03',
                nameAr: 'منظمة المال الإسلامية',
                nameEn: 'Islamic Wealth Organization',
                sector: 'المال',
                scope: 'عالمي',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'بناء مرجعية إسلامية لإدارة المال والثروات والسيولة والاحتياطيات وفق العدل والشفافية والأمانة.'
            },
            {
                id: 'UMMAH-ORG-04',
                nameAr: 'منظمة بيت مال المسلمين الإسلامية',
                nameEn: 'Islamic Bayt Al-Mal Organization',
                sector: 'بيت المال',
                scope: 'عالمي',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'إحياء مفهوم بيت مال المسلمين المؤسسي لإدارة الموارد العامة والزكوات والفوائض والاحتياطيات بما يخدم الأمة.'
            },
            {
                id: 'UMMAH-ORG-05',
                nameAr: 'منظمة العملة الرقمية الإسلامية',
                nameEn: 'Islamic Digital Currency Organization',
                sector: 'العملة الرقمية',
                scope: 'عالمي',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'قيادة الإطار الشرعي والتقني والمؤسسي للعملات الرقمية الإسلامية والتسويات الرقمية الموثوقة.'
            },
            {
                id: 'UMMAH-ORG-06',
                nameAr: 'منظمة البورصة الإسلامية',
                nameEn: 'Islamic Exchange Organization',
                sector: 'البورصة',
                scope: 'عالمي',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'تصميم أسواق بورصة إسلامية عادلة للأصول والسلع والحقوق المباحة بضوابط شرعية وشفافية رقابية.'
            },
            {
                id: 'UMMAH-ORG-07',
                nameAr: 'منظمة بلوك شين الإسلامية',
                nameEn: 'Islamic Blockchain Organization',
                sector: 'بلوك تشين',
                scope: 'عالمي',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'تطوير واعتماد سلاسل كتل إسلامية موثوقة للتوثيق والتسوية والتشغيل المؤسسي دون الإضرار أو العبث أو الغموض.'
            },
            {
                id: 'UMMAH-ORG-08',
                nameAr: 'منظمة تداول الإسلامية',
                nameEn: 'Islamic Trading Organization',
                sector: 'التداول',
                scope: 'عالمي',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'بناء ضوابط تداول إسلامية منضبطة تمنع المضاربات المحرمة والتلاعب وتدعم التداول المشروع القائم على أصول ومنافع مباحة.'
            },
            {
                id: 'UMMAH-ORG-09',
                nameAr: 'منظمة الأسواق والسوق الإسلامية',
                nameEn: 'Islamic Markets Organization',
                sector: 'الأسواق',
                scope: 'عالمي',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'بناء أسواق إسلامية عادلة وشفافة تمنع الربا والغرر والاحتكار والغش، وتدعم البيع عن تراضٍ والمعايير الشرعية.'
            },
            {
                id: 'UMMAH-ORG-10',
                nameAr: 'منظمة المعادن والذهب والفضة الإسلامية',
                nameEn: 'Islamic Metals, Gold and Silver Organization',
                sector: 'المعادن',
                scope: 'عالمي',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'تنظيم سلاسل القيمة للمعادن والذهب والفضة وفق ضوابط شرعية عادلة، مع حماية الثروات وتعزيز الشفافية والوزن والعيار.'
            },
            {
                id: 'UMMAH-ORG-11',
                nameAr: 'منظمة السكراب الإسلامية',
                nameEn: 'Islamic Scrap Organization',
                sector: 'السكراب وإعادة التدوير',
                scope: 'عالمي',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'تنظيم تجارة السكراب وإعادة التدوير الإسلامي بما يمنع الفساد والهدر، ويحوّل المخلفات إلى قيمة اقتصادية نافعة.'
            },
            {
                id: 'UMMAH-ORG-12',
                nameAr: 'منظمة الطاقة الإسلامية',
                nameEn: 'Islamic Energy Organization',
                sector: 'الطاقة',
                scope: 'عالمي',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'قيادة التكامل الإسلامي في الطاقة التقليدية والمتجددة، وتحقيق أمن طاقي عادل يخدم الأمة ويحفظ الموارد.'
            },
            {
                id: 'UMMAH-ORG-13',
                nameAr: 'منظمة البترول وبدائل البترول الإسلامية',
                nameEn: 'Islamic Petroleum and Alternatives Organization',
                sector: 'البترول والبدائل',
                scope: 'عالمي',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'تنظيم قطاع البترول ومشتقاته وبدائله في إطار إسلامي يوازن بين الثروة، والاستدامة، والتحول المسؤول للطاقة.'
            },
            {
                id: 'UMMAH-ORG-14',
                nameAr: 'المنظمة الإسلامية للمخلوقات والطبيعة والبحار',
                nameEn: 'Islamic Organization for Creatures, Nature and Seas',
                sector: 'البيئة والمخلوقات',
                scope: 'عالمي',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'حماية الحيوانات والنباتات والحياة البرية والبحرية والصخور والتربة والطيور والطبيعة والبحار ضمن أمانة الاستخلاف والرحمة.'
            },
            {
                id: 'UMMAH-ORG-15',
                nameAr: 'منظمة اللوجستيات الإسلامية',
                nameEn: 'Islamic Logistics Organization',
                sector: 'اللوجستيات',
                scope: 'عالمي',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'بناء شبكات لوجستية إسلامية موثوقة وعادلة تدعم التجارة والإمداد والتوزيع وحركة السلع والخدمات عبر العالم.'
            },
            {
                id: 'UMMAH-ORG-16',
                nameAr: 'منظمة الاقتصاد الإسلامي',
                nameEn: 'Islamic Economy Organization',
                sector: 'الاقتصاد',
                scope: 'عالمي',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'تطوير الاقتصاد الإسلامي المؤسسي والقطاعي، وربط التمويل والإنتاج والتوزيع والاستهلاك بمقاصد الشريعة.'
            },
            {
                id: 'UMMAH-ORG-17',
                nameAr: 'منظمة التجارة الإسلامية العالمية',
                nameEn: 'Global Islamic Trade Organization',
                sector: 'التجارة العالمية',
                scope: 'عالمي',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'قيادة التجارة الإسلامية العالمية، وفتح مسارات تبادل عادلة وآمنة وشفافة بين أسواق الأمة وشركائها.'
            },
            {
                id: 'UMMAH-ORG-18',
                nameAr: 'منظمة الدين الإسلامي',
                nameEn: 'Islamic Religion Organization',
                sector: 'الدين والمرجعية',
                scope: 'متعدد النطاقات',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'ترسيخ مرجعية الدين الإسلامي علمًا وتعليمًا وتطبيقًا وتزكيةً، مع حفظ وحدة المنهج والأصول الشرعية.'
            },
            {
                id: 'UMMAH-ORG-19',
                nameAr: 'منظمة أمة محمد الإسلامية',
                nameEn: 'Ummah of Muhammad Islamic Organization',
                sector: 'وحدة الأمة',
                scope: 'متعدد النطاقات',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'خدمة وحدة أمة محمد صلى الله عليه وسلم عبر برامج تكاملية دينية وعلمية واقتصادية وإنسانية.'
            },
            {
                id: 'UMMAH-ORG-20',
                nameAr: 'منظمة جزيرة العرب',
                nameEn: 'Arabian Peninsula Organization',
                sector: 'التكامل الإقليمي',
                scope: 'جزيرة العرب',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'تنسيق المشاريع الاستراتيجية والخدمية والتنموية في جزيرة العرب بما يخدم الأمن الحضاري والاقتصادي للأمة.'
            },
            {
                id: 'UMMAH-ORG-21',
                nameAr: 'منظمة العرب',
                nameEn: 'Arab Organization',
                sector: 'التكامل العربي',
                scope: 'العرب',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'تعميق التعاون العربي في العلم والاقتصاد والتقنية والبنية المؤسسية بما يخدم الأمة واستقرارها.'
            },
            {
                id: 'UMMAH-ORG-22',
                nameAr: 'منظمة مكة الإسلامية',
                nameEn: 'Makkah Islamic Organization',
                sector: 'الخدمة الدينية',
                scope: 'مكة المكرمة',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'تعزيز البرامج الدينية والعلمية والخدمية المرتبطة بمكة المكرمة ومكانتها المركزية في الأمة.'
            },
            {
                id: 'UMMAH-ORG-23',
                nameAr: 'منظمة المدينة الإسلامية',
                nameEn: 'Madinah Islamic Organization',
                sector: 'الخدمة الدينية',
                scope: 'المدينة المنورة',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'تطوير البرامج العلمية والحضارية والخدمية في المدينة المنورة وفق منهج النبوة والرحمة.'
            },
            {
                id: 'UMMAH-ORG-24',
                nameAr: 'منظمة بيت الله الحرام بمكة الإسلامية',
                nameEn: 'Islamic Organization for the Holy House in Makkah',
                sector: 'خدمة الحرمين',
                scope: 'مكة المكرمة',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'دعم كل ما يرتبط بخدمة بيت الله الحرام إداريًا وتقنيًا ولوجستيًا ومعرفيًا بما يحقق أعلى درجات الإتقان.'
            },
            {
                id: 'UMMAH-ORG-25',
                nameAr: 'منظمة حجاج بيت الله الحرام الإسلامية',
                nameEn: 'Islamic Organization for Pilgrims of the Holy House',
                sector: 'خدمة الحجاج',
                scope: 'مكة والمدينة والعالم الإسلامي',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'تحسين تجربة الحجاج عالميًا عبر خدمات آمنة وإنسانية ورقمية ولوجستية متكاملة.'
            },
            {
                id: 'UMMAH-ORG-26',
                nameAr: 'منظمة المسجد النبوي وبيت الرسول محمد صلى الله عليه وسلم الإسلامية',
                nameEn: 'Islamic Organization for Al-Masjid Al-Nabawi and the House of the Prophet',
                sector: 'خدمة المسجد النبوي',
                scope: 'المدينة المنورة',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'خدمة المسجد النبوي الشريف والبرامج العلمية والزائرين بمنهجية رحيمة دقيقة تحفظ المقام والرسالة.'
            },
            {
                id: 'UMMAH-ORG-27',
                nameAr: 'منظمة الغذاء الإسلامية',
                nameEn: 'Islamic Food Organization',
                sector: 'الغذاء',
                scope: 'متعدد النطاقات',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'تعزيز الأمن الغذائي وسلاسل الغذاء الحلال وجودة التغذية ومنع الهدر والجوع في نطاقات الأمة.'
            },
            {
                id: 'UMMAH-ORG-28',
                nameAr: 'منظمة الماء الإسلامية',
                nameEn: 'Islamic Water Organization',
                sector: 'المياه',
                scope: 'متعدد النطاقات',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'حماية الموارد المائية وتنميتها وتوزيعها بعدل وكفاءة واستدامة وفق مقاصد الشريعة.'
            },
            {
                id: 'UMMAH-ORG-29',
                nameAr: 'منظمة الجامعات الأكاديمية الإسلامية',
                nameEn: 'Islamic Academic Universities Organization',
                sector: 'التعليم العالي',
                scope: 'متعدد النطاقات',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'ربط الجامعات الأكاديمية الإسلامية بشبكة علمية عالمية تسهم في البحث والابتكار وتخريج الكفاءات.'
            },
            {
                id: 'UMMAH-ORG-30',
                nameAr: 'منظمة مراكز البحث والتطوير والابتكار والاستكشاف والاختراع الإسلامية',
                nameEn: 'Islamic RDI and Discovery Centers Organization',
                sector: 'البحث والابتكار',
                scope: 'متعدد النطاقات',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'توحيد مراكز البحث والتطوير والابتكار والاستكشاف والاختراع لإنتاج معرفة نافعة وتقنيات مؤثرة عالميًا.'
            },
            {
                id: 'UMMAH-ORG-31',
                nameAr: 'منظمة علوم الهندسة الإسلامية',
                nameEn: 'Islamic Engineering Sciences Organization',
                sector: 'الهندسة',
                scope: 'متعدد النطاقات',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'تطوير منظومات الهندسة الإسلامية في البناء والبنية التحتية والصناعة والطاقة والتقنيات المتقدمة.'
            },
            {
                id: 'UMMAH-ORG-32',
                nameAr: 'منظمة الفضاء الإسلامية',
                nameEn: 'Islamic Space Organization',
                sector: 'الفضاء',
                scope: 'فضائي وكوني',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'تطوير برامج الفضاء الإسلامية في الرصد والاستكشاف والتقنيات الفضائية النافعة للأرض والإنسان.'
            },
            {
                id: 'UMMAH-ORG-33',
                nameAr: 'منظمة الأرض الإسلامية',
                nameEn: 'Islamic Earth Organization',
                sector: 'الأرض والموارد',
                scope: 'أرضي وعالمي',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'خدمة الأرض ومواردها وبيئاتها بمنهج إسلامي يحقق الإعمار العادل ويحفظ التوازن الطبيعي.'
            },
            {
                id: 'UMMAH-ORG-34',
                nameAr: 'منظمة النقل الإسلامية',
                nameEn: 'Islamic Transport Organization',
                sector: 'النقل والربط الشبكي',
                scope: 'متعدد النطاقات',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'منظمة قريبة من منظمة اللوجستيات لتكامل الأهداف والتقنيات في نقل كل ما يمكن نقله: الطاقة، الإنترنت، الذكاء الصناعي، الشبكات، والخدمات عبر البنى السلكية واللاسلكية.'
            },
            {
                id: 'UMMAH-ORG-35',
                nameAr: 'منظمة الشبكات الإسلامية',
                nameEn: 'Islamic Networks Organization',
                sector: 'الشبكات والاتصالات',
                scope: 'متعدد النطاقات',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'تطوير وإدارة شبكات إسلامية سلكية ولاسلكية موثوقة لنقل البيانات والطاقة والخدمات الذكية بأمان وكفاءة.'
            },
            {
                id: 'UMMAH-ORG-36',
                nameAr: 'منظمة القوافل التجارية الإسلامية',
                nameEn: 'Islamic Trade Caravans Organization',
                sector: 'القوافل التجارية',
                scope: 'متعدد النطاقات',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'إحياء وتطوير منظومات القوافل التجارية الإسلامية بوسائل حديثة تربط الأسواق والإمداد والنقل الآمن عبر البر والبحر.'
            },
            {
                id: 'UMMAH-ORG-37',
                nameAr: 'منظمة الرحلات التجارية الإسلامية',
                nameEn: 'Islamic Commercial Routes Organization',
                sector: 'الرحلات التجارية',
                scope: 'متعدد النطاقات',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'تنظيم الرحلات التجارية الإسلامية وسلاسل الحركة المتكاملة للبضائع والخدمات عبر مسارات ذكية ومنضبطة شرعياً.'
            },
            {
                id: 'UMMAH-ORG-38',
                nameAr: 'منظمة الابتكار والملكية الفكرية الإسلامية',
                nameEn: 'Islamic Innovation and Intellectual Property Organization',
                sector: 'الابتكار والملكية الفكرية',
                scope: 'متعدد النطاقات',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'تنظيم منظومة الابتكار والاختراع والملكية الفكرية الإسلامية بما يحفظ الحقوق المعنوية ويشجع الإبداع النافع ويمنع التعدي والاحتكار الضار.'
            },
            {
                id: 'UMMAH-ORG-39',
                nameAr: 'منظمة العربية النحو والقواعد والصرف والبلاغة الإسلامية',
                nameEn: 'Islamic Arabic Grammar, Morphology, and Rhetoric Organization',
                sector: 'اللغة العربية وعلومها',
                scope: 'متعدد النطاقات',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'خدمة العربية في النحو والقواعد والصرف والبلاغة الإسلامية، وتقعيد أصولها، وتيسير تعليمها، وحفظ سلامة اللسان العربي لخدمة القرآن والسنة.'
            },
            {
                id: 'UMMAH-ORG-40',
                nameAr: 'منظمة الخط العربي الإسلامية',
                nameEn: 'Islamic Arabic Calligraphy Organization',
                sector: 'الخط العربي',
                scope: 'متعدد النطاقات',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'رعاية الخط العربي الإسلامي، وتطوير مدارسه وأدواته ومعاييره، وربط جمالياته بالهوية الإسلامية والتعليم والنشر والتوثيق الحضاري.'
            },
            {
                id: 'UMMAH-ORG-41',
                nameAr: 'منظمة اللغة LLM الإسلامية',
                nameEn: 'Islamic LLM Language Organization',
                sector: 'اللغة والتقنيات اللغوية',
                scope: 'متعدد النطاقات',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'بناء وتنسيق منظومات اللغة LLM الإسلامية لخدمة الفهم والتحليل والتوليد اللغوي المنضبط بالكتاب والسنة، مع حفظ العربية ولغات الأمة من الانحراف والضرر.'
            },
            {
                id: 'UMMAH-ORG-42',
                nameAr: 'منظمة الواقع الممتد الإسلامية',
                nameEn: 'Islamic Extended Reality Organization',
                sector: 'الواقع الممتد XR',
                scope: 'متعدد النطاقات',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'تطوير الواقع المعزز والافتراضي والمختلط والمدمج لخدمة التعليم والإدارة والتشغيل والتوأم الرقمي والمنافع العامة ضمن ضوابط الشريعة.'
            },
            {
                id: 'UMMAH-ORG-43',
                nameAr: 'منظمة سلاسل الإمداد الذكية الإسلامية',
                nameEn: 'Islamic Smart Supply Chain Organization',
                sector: 'سلاسل الإمداد والتوريد',
                scope: 'متعدد النطاقات',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'بناء سلاسل إمداد وتوريد ذكية منضبطة شرعياً ترفع الكفاءة وتقلل الهدر وتضمن الشفافية والتتبع والعدالة في التوزيع.'
            },
            {
                id: 'UMMAH-ORG-44',
                nameAr: 'منظمة MHS ERP والنظم المعلوماتية الإدارية الإسلامية',
                nameEn: 'Islamic MHS ERP and Management Information Systems Organization',
                sector: 'ERP وMIS',
                scope: 'متعدد النطاقات',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'توحيد أنظمة ERP وMIS الإسلامية وربطها بالذكاء الصناعي والإدارة الشرعية والحوكمة المؤسسية والتقارير التنفيذية الذكية.'
            },
            {
                id: 'UMMAH-ORG-45',
                nameAr: 'منظمة البلوك شين المؤسسي الإسلامي',
                nameEn: 'Islamic Enterprise Blockchain Organization',
                sector: 'البلوك شين المؤسسي',
                scope: 'متعدد النطاقات',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'تطوير أنظمة بلوك شين مؤسسية موثوقة للتوثيق والتتبع والعقود والسجلات التشغيلية والمالية ضمن مرجعية إسلامية.'
            },
            {
                id: 'UMMAH-ORG-46',
                nameAr: 'منظمة الذكاء المحيطي والاستشعار الحيوي الإسلامي',
                nameEn: 'Islamic Ambient Intelligence and Bio-Sensing Organization',
                sector: 'الذكاء المحيطي والاستشعار',
                scope: 'متعدد النطاقات',
                audience: 'أمة محمد صلى الله عليه وسلم',
                mission: 'بناء تقنيات استشعار محيطية وحيوية نافعة وآمنة تحسن الحياة الكريمة والسلامة والإنتاجية وتراعي الخصوصية والكرامة والضوابط الشرعية.'
            }
        ],
        linkedOrganizations: [
            'منظمة شيخة الإسلامية',
            'منظمة المال الإسلامية',
            'منظمة بيت مال المسلمين الإسلامية',
            'منظمة العملة الرقمية الإسلامية',
            'منظمة البورصة الإسلامية',
            'منظمة بلوك شين الإسلامية',
            'منظمة تداول الإسلامية',
            'منظمة الدين الإسلامي',
            'منظمة أمة محمد الإسلامية',
            'منظمة جزيرة العرب',
            'منظمة العرب',
            'منظمة مكة الإسلامية',
            'منظمة المدينة الإسلامية',
            'منظمة بيت الله الحرام بمكة الإسلامية',
            'منظمة حجاج بيت الله الحرام الإسلامية',
            'منظمة المسجد النبوي وبيت الرسول محمد صلى الله عليه وسلم الإسلامية',
            'منظمة الغذاء الإسلامية',
            'منظمة الماء الإسلامية',
            'منظمة الجامعات الأكاديمية الإسلامية',
            'منظمة مراكز البحث والتطوير والابتكار والاستكشاف والاختراع الإسلامية',
            'منظمة علوم الهندسة الإسلامية',
            'منظمة النقل الإسلامية',
            'منظمة الشبكات الإسلامية',
            'منظمة القوافل التجارية الإسلامية',
            'منظمة الرحلات التجارية الإسلامية',
            'منظمة الابتكار والملكية الفكرية الإسلامية',
            'منظمة العربية النحو والقواعد والصرف والبلاغة الإسلامية',
            'منظمة الخط العربي الإسلامية',
            'منظمة اللغة LLM الإسلامية',
            'منظمة الواقع الممتد الإسلامية',
            'منظمة سلاسل الإمداد الذكية الإسلامية',
            'منظمة MHS ERP والنظم المعلوماتية الإدارية الإسلامية',
            'منظمة البلوك شين المؤسسي الإسلامي',
            'منظمة الذكاء المحيطي والاستشعار الحيوي الإسلامي',
            'منظمة الفضاء الإسلامية',
            'منظمة الأرض الإسلامية',
            'منظمة الحاسب الإسلامية',
            'منظمة الحساب الإسلامية',
            'منظمة علوم الحاسب الإسلامية',
            'منظمة الحاسب الضخم والحواسيب الضخمة الإسلامية',
            'منظمة البيانات الضخمة الإسلامية',
            'منظمة خوادم والخوادم والسحابات الإسلامية',
            'المنظمة العربية الإسلامية'
        ],
        governance: [
            'النطاق عالمي وخدمة المرجع موجهة لأمة محمد صلى الله عليه وسلم',
            'لا تعارض مع الكتاب والسنة وسنة الخلفاء الراشدين',
            'لا احتكار للثروات أو الأسواق أو البنية التحتية',
            'توحيد المعايير مع مراعاة خصوصية كل قطاع',
            'الشفافية والعدل والتدقيق أساس كل منظمة ومبادرة'
        ]
    },

    metadata: {
        version: '1.0.0',
        builtBy: 'SHEIKHA v4 — منظومة شيخة',
        owner: 'سلمان أحمد سلمان عبدالعزيز عبدالله مبارك الراجح — من قبيلة بني تميم',
        ownerEn: 'Salman Ahmed Salman Abdulaziz Abdullah Mubarak Alrajeh — Banu Tamim Tribe',
        organizations: [
            'منظومة شيخة العلم',
            'منظومة شيخة العلمية',
            'منظومة شيخة الإسلامية',
            'منظومة شيخة للكتاب والسنة',
            'منظومة شيخة لتجديد الدين كل 100 سنة هجرية',
            'منظمة الحاسب الإسلامية',
            'منظمة الحساب الإسلامية',
            'منظمة علوم الحاسب الإسلامية',
            'منظمة الحاسب الضخم والحواسيب الضخمة الإسلامية',
            'منظمة البيانات الضخمة الإسلامية',
            'منظمة خوادم والخوادم والسحابات الإسلامية',
            'المنظمة العربية الإسلامية',
            'منظمة شيخة الإسلامية',
            'منظمة المال الإسلامية',
            'منظمة بيت مال المسلمين الإسلامية',
            'منظمة العملة الرقمية الإسلامية',
            'منظمة البورصة الإسلامية',
            'منظمة بلوك شين الإسلامية',
            'منظمة تداول الإسلامية',
            'منظمة الأسواق والسوق الإسلامية',
            'منظمة المعادن والذهب والفضة الإسلامية',
            'منظمة السكراب الإسلامية',
            'منظمة الطاقة الإسلامية',
            'منظمة البترول وبدائل البترول الإسلامية',
            'المنظمة الإسلامية للمخلوقات والطبيعة والبحار',
            'منظمة اللوجستيات الإسلامية',
            'منظمة الاقتصاد الإسلامي',
            'منظمة التجارة الإسلامية العالمية',
            'منظمة الدين الإسلامي',
            'منظمة أمة محمد الإسلامية',
            'منظمة جزيرة العرب',
            'منظمة العرب',
            'منظمة مكة الإسلامية',
            'منظمة المدينة الإسلامية',
            'منظمة بيت الله الحرام بمكة الإسلامية',
            'منظمة حجاج بيت الله الحرام الإسلامية',
            'منظمة المسجد النبوي وبيت الرسول محمد صلى الله عليه وسلم الإسلامية',
            'منظمة الغذاء الإسلامية',
            'منظمة الماء الإسلامية',
            'منظمة الجامعات الأكاديمية الإسلامية',
            'منظمة مراكز البحث والتطوير والابتكار والاستكشاف والاختراع الإسلامية',
            'منظمة علوم الهندسة الإسلامية',
            'منظمة النقل الإسلامية',
            'منظمة الشبكات الإسلامية',
            'منظمة القوافل التجارية الإسلامية',
            'منظمة الرحلات التجارية الإسلامية',
            'منظمة الابتكار والملكية الفكرية الإسلامية',
            'منظمة العربية النحو والقواعد والصرف والبلاغة الإسلامية',
            'منظمة الخط العربي الإسلامية',
            'منظمة اللغة LLM الإسلامية',
            'منظمة الواقع الممتد الإسلامية',
            'منظمة سلاسل الإمداد الذكية الإسلامية',
            'منظمة MHS ERP والنظم المعلوماتية الإدارية الإسلامية',
            'منظمة البلوك شين المؤسسي الإسلامي',
            'منظمة الذكاء المحيطي والاستشعار الحيوي الإسلامي',
            'منظمة الفضاء الإسلامية',
            'منظمة الأرض الإسلامية'
        ],
        organization: 'منظومة شيخة — SHEIKHA Islamic Knowledge Ecosystem',
        domain: 'sheikha.top',
        email: 'market@sheikha.top',
        mission: 'المرجع الأول للعلم النافع غير الضار — من الآن إلى يوم القيامة',
        basis: 'الكتاب والسنة وسنة الخلفاء الراشدين المهدين',
        declaration: 'هذا العلم لله وحده — وقف خيري خالص باسم سلمان أحمد سلمان عبدالعزيز عبدالله مبارك الراجح من قبيلة بني تميم — نفعًا للأمة والبشرية',
        updatedAt: new Date().toISOString()
    }
};

const QURAN_AI_PROGRAM = {
    name: 'Quran AI | Hadith AI | Tafsir AI',
    mission: 'تسخير الذكاء الاصطناعي لتعليم القرآن والتفسير والحديث للبشر بكل لغة على أساس النص العربي الموثق والمراجعة الشرعية.',
    pillars: [
        'النص العربي الموثق أصل لا يُستبدل',
        'التفسير والشرح يمران عبر مراجعة شرعية',
        'التعليم متعدد اللغات وسيلة لنشر الوحي لا لتغيير معناه',
        'الذكاء الاصطناعي خادم للعلم لا حاكم عليه'
    ],
    supportedLanguages: [
        'العربية', 'English', 'Français', 'اردو', 'Türkçe', 'Bahasa Indonesia',
        'Malay', 'Español', 'Русский', 'Hausa', 'Swahili', 'বাংলা'
    ],
    learningModes: [
        'تعلم التلاوة',
        'تعلم الحفظ',
        'فهم التفسير',
        'فهم سبب النزول',
        'تعلم الحديث ودرجته',
        'ربط العلم بالتطبيق اليومي',
        'إعداد المعلم والمربي'
    ],
    aiCapabilities: [
        'تحليل مرجعي للآية أو الحديث',
        'توليد خطة درس متعددة اللغات',
        'بناء مسار حفظ وتكرار',
        'إظهار التفسير وسبب النزول والتطبيق',
        'إظهار درجة الحديث وموضع الاحتجاج',
        'تجهيز درس للطفل أو العامي أو طالب العلم أو المعلم'
    ],
    governance: [
        'لا يعتمد شرح شرعي آلي نهائيًا دون مراجعة علمية',
        'الترجمة التعليمية تُستخدم للتفهيم لا لإحلالها محل النص العربي',
        'النص القرآني والمراجع الحديثية يجب أن تكون من مصادر معتمدة',
        'أي تحليل آلي يجب أن يذكر المصدر والدرجة والمنهج'
    ]
};

function getLanguageDescriptor(language) {
    const value = normalizeText(language || 'العربية');
    const known = {
        'العربية': { label: 'العربية', direction: 'rtl', note: 'اللغة الأصلية للنص القرآني والحديثي.' },
        'english': { label: 'English', direction: 'ltr', note: 'Teaching and explanation in English while preserving Arabic source text.' },
        'français': { label: 'Français', direction: 'ltr', note: 'Explication pédagogique en français avec maintien du texte arabe.' },
        'urdu': { label: 'اردو', direction: 'rtl', note: 'تعليم وشرح بالأردية مع إبقاء النص العربي أصلًا.' },
        'türkçe': { label: 'Türkçe', direction: 'ltr', note: 'Turkish teaching layer with Arabic source preserved.' },
        'bahasa indonesia': { label: 'Bahasa Indonesia', direction: 'ltr', note: 'Indonesian learning delivery over verified Arabic text.' },
        'español': { label: 'Español', direction: 'ltr', note: 'Spanish educational explanation over authenticated Arabic source.' }
    };

    return known[value.toLowerCase()] || {
        label: value,
        direction: 'ltr',
        note: 'سيُستخدم هذا اللسان في الشرح والتعليم مع بقاء النص العربي أصلًا معتمدًا.'
    };
}

function buildTeachingAudience(level) {
    const normalized = normalizeText(level || 'عام');
    const plans = {
        'طفل': ['قراءة ميسرة', 'تكرار قصير', 'معنى إجمالي بسيط', 'تطبيق سلوكي يومي'],
        'عام': ['تلاوة', 'شرح المعنى', 'الفائدة العملية', 'مراجعة دورية'],
        'طالب علم': ['تحرير المعنى', 'التفسير', 'سبب النزول أو التخريج', 'التطبيق الأصولي والفقهي'],
        'معلم': ['خطة درس', 'أسئلة تقويم', 'تمارين شرح', 'ربط بالمستوى اللغوي للدارس']
    };
    return plans[normalized] || plans['عام'];
}

function resolveQuranAyahId(id) {
    const raw = normalizeText(id);
    const aliasMap = {
        'iqra-1': 'alaq-1-5',
        'iqra': 'alaq-1-5',
        'اقرأ': 'alaq-1-5',
        'taha': 'taha-114',
        'talim': 'alaq-4',
        'علم': 'alaq-1-5'
    };
    return aliasMap[raw] || aliasMap[raw.toLowerCase()] || raw;
}

function buildQuranAiAnalysis(kind, id, language, audience) {
    const lang = getLanguageDescriptor(language);
    const learnerPlan = buildTeachingAudience(audience);

    if (kind === 'hadith') {
        const item = ILM_REFERENCE.ahadith.find((entry) => entry.id === id);
        if (!item) {
            return { found: false, message: 'الحديث المطلوب غير موجود في مرجع العلم الحالي' };
        }

        return {
            found: true,
            kind: 'hadith',
            language: lang,
            audience: normalizeText(audience || 'عام'),
            source: {
                id: item.id,
                arabic: item.arabic,
                source: item.source,
                grade: item.grade,
                explanation: item.explanation,
                application: item.application,
                category: item.category
            },
            aiLesson: {
                objective: 'تعليم الحديث وفهم درجته ومعناه وتطبيقه.',
                stages: learnerPlan,
                delivery: [
                    'عرض النص العربي',
                    'عرض المصدر والدرجة',
                    'شرح المعنى بلغة المتعلم',
                    'ربطه بالتطبيق العملي',
                    'إعادة التقويم والتكرار'
                ],
                note: lang.note
            },
            governance: [
                'لا يُشرح الحديث بلا بيان درجته ومصدره',
                'اللغة الناقلة تخدم الفهم ولا تستبدل النص العربي',
                'يُمنع الجزم بأحكام شرعية جديدة من دون مراجعة عالم'
            ]
        };
    }

    const resolvedId = resolveQuranAyahId(id);
    const item = ILM_REFERENCE.quranAyat.find((entry) => entry.id === resolvedId || entry.id === id);
    if (!item) {
        return { found: false, message: 'الآية المطلوبة غير موجودة في مرجع العلم الحالي' };
    }

    return {
        found: true,
        kind: 'quran',
        language: lang,
        audience: normalizeText(audience || 'عام'),
        source: {
            id: item.id,
            surah: item.surah,
            surahNumber: item.surahNumber,
            ayat: item.ayat,
            arabic: item.arabic,
            tafsir: item.tafsir,
            sababNuzul: item.sababNuzul || '',
            application: item.application,
            category: item.category
        },
        aiLesson: {
            objective: 'تعليم الآية تلاوةً وفهمًا وتطبيقًا.',
            stages: learnerPlan,
            delivery: [
                'عرض النص القرآني العربي المعتمد',
                'بيان السورة والآية',
                'شرح المعنى الإجمالي',
                'إضافة سبب النزول إن وجد',
                'تحويل المعنى إلى سلوك وعمل',
                'تكرار وحفظ ومراجعة'
            ],
            note: lang.note
        },
        governance: [
            'النص العربي أصل ثابت',
            'التفسير المختصر للتعليم لا يغني عن كتب التفسير المعتمدة',
            'يجب بيان سبب النزول عند الحاجة بلا تعسف',
            'الشرح متعدد اللغات وسيلة لتبليغ المعنى الصحيح'
        ]
    };
}

// ═══════════════════════════════════════════════════════════════
// مسارات API مرجع العلم
// ═══════════════════════════════════════════════════════════════
app.get('/api/sheikha/ilm', (req, res) => {
    res.json({
        success: true,
        data: ILM_REFERENCE,
        message: 'المرجع الأول للعلم الإسلامي الشامل — من الآن إلى يوم القيامة',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/ilm/quran', (req, res) => {
    const { category } = req.query;
    const ayat = category
        ? ILM_REFERENCE.quranAyat.filter((a) => a.category === category)
        : ILM_REFERENCE.quranAyat;
    res.json({
        success: true,
        data: ayat,
        total: ayat.length,
        categories: [...new Set(ILM_REFERENCE.quranAyat.map((a) => a.category))],
        message: 'آيات القرآن الكريم في العلم والتعلم',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/ilm/ahadith', (req, res) => {
    const { category } = req.query;
    const ahadith = category
        ? ILM_REFERENCE.ahadith.filter((h) => h.category === category)
        : ILM_REFERENCE.ahadith;
    res.json({
        success: true,
        data: ahadith,
        total: ahadith.length,
        message: 'أحاديث النبي ﷺ في العلم والتعليم والعمل',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/ilm/khulafa', (req, res) => {
    res.json({
        success: true,
        data: {
            sunnah: ILM_REFERENCE.sunnahProphet,
            khulafa: ILM_REFERENCE.khulafaRashidun
        },
        message: 'سيرة النبي ﷺ والخلفاء الراشدين في العلم والتعليم',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/ilm/scholars', (req, res) => {
    res.json({
        success: true,
        data: {
            scholars: ILM_REFERENCE.islamicScholars,
            centers: ILM_REFERENCE.ilmCenters,
            schools: ILM_REFERENCE.ilmSchools
        },
        message: 'أعلام العلماء المسلمين ومراكز العلم والمدارس العلمية',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/ilm/riyadh-janna', (req, res) => {
    res.json({
        success: true,
        data: ILM_REFERENCE.riyadJanna,
        message: 'رياض الجنة — أماكن العلم المباركة',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/ilm/applications', (req, res) => {
    res.json({
        success: true,
        data: ILM_REFERENCE.ilmApplications,
        message: 'تطبيقات العلم في التجارة والإدارة والعلوم والتقنية',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/ilm/management', (req, res) => {
    res.json({
        success: true,
        data: ILM_REFERENCE.islamicManagementScience,
        message: 'مرجع تأسيس العلم الإداري الإسلامي بالكتاب والسنة',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/ilm/management/scorecard', (req, res) => {
    const scorecard = ILM_REFERENCE.islamicManagementScience.institutionalScorecard || [];
    res.json({
        success: true,
        data: {
            title: ILM_REFERENCE.islamicManagementScience.title,
            scorecard,
            implementationPhases: ILM_REFERENCE.islamicManagementScience.implementationPhases || []
        },
        message: 'بطاقة قياس الأداء المؤسسي للإدارة الإسلامية',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/ilm/supply-chain', (req, res) => {
    res.json({
        success: true,
        data: ILM_REFERENCE.islamicSupplyChainSystem,
        message: 'مرجع نظام سلاسل الإمداد والتوريد واللوجستيات الإسلامي',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/ilm/innovation', (req, res) => {
    res.json({
        success: true,
        data: ILM_REFERENCE.islamicInnovationSystem,
        message: 'مرجع نظام الابتكار والاختراع والاستكشاف الإسلامي',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/ilm/industry', (req, res) => {
    res.json({
        success: true,
        data: ILM_REFERENCE.islamicIndustrySystem,
        message: 'مرجع نظام الصناعة الإسلامي',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/ilm/ai-organization', (req, res) => {
    res.json({
        success: true,
        data: ILM_REFERENCE.islamicAiOrganization,
        message: 'مرجع منظمة ونظام الذكاء الصناعي الإسلامي',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/ilm/computing', (req, res) => {
    res.json({
        success: true,
        data: ILM_REFERENCE.islamicComputingSystem,
        message: 'مرجع نظام ومنظمة الحوسبة والحساب الإسلامي',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/ilm/computing/organizations', (req, res) => {
    const orgs = (ILM_REFERENCE.islamicComputingSystem.organizations || []);
    res.json({
        success: true,
        data: {
            total: orgs.length,
            organizations: orgs
        },
        message: 'المنظمات الإسلامية الحاسوبية — ICO · IsCO · ICSO · IHPCO · IBDO · ISCLO',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/ilm/agriculture', (req, res) => {
    res.json({
        success: true,
        data: ILM_REFERENCE.islamicAgricultureSystem,
        message: 'مرجع نظام الزراعة الإسلامي',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/ilm/ai-integration', (req, res) => {
    res.json({
        success: true,
        data: ILM_REFERENCE.islamicAiSciencesIntegration,
        message: 'مرجع دمج العلوم الشرعية والإدارية والتطبيقية والطبية بالذكاء الصناعي',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/ilm/execution/scorecard', (req, res) => {
    res.json({
        success: true,
        data: buildUnifiedExecutionScorecard(),
        message: 'بطاقة قياس تنفيذ موحدة للأنظمة الإسلامية',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/ilm/execution/readiness', (req, res) => {
    res.json({
        success: true,
        data: buildReadinessGapAnalysis(),
        message: 'تقييم الجاهزية والفجوات للأنظمة الإسلامية',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/tech-access/foundation', (req, res) => {
    res.json({
        success: true,
        data: ILM_REFERENCE.techAutoAccessFoundation,
        message: 'أساس الوصول التقني والتكامل بضغطة وبدون ضغطة',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/organization/arab-islamic', (req, res) => {
    res.json({
        success: true,
        data: ILM_REFERENCE.arabIslamicOrganization,
        message: 'مرجع المنظمة العربية الإسلامية ذات النطاق العالمي للأمة',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/organization/transport', (req, res) => {
    const pack = ILM_REFERENCE.globalUmmahOrganizations || {};
    const list = Array.isArray(pack.organizations) ? pack.organizations : [];
    const names = [
        'منظمة النقل الإسلامية',
        'منظمة اللوجستيات الإسلامية',
        'منظمة الشبكات الإسلامية',
        'منظمة القوافل التجارية الإسلامية',
        'منظمة الرحلات التجارية الإسلامية'
    ];
    const organizations = list.filter((org) => names.includes(org.nameAr));

    res.json({
        success: true,
        data: {
            title: 'منظومة النقل الذكي الإسلامي',
            organizations,
            transportConvergenceModel: pack.transportConvergenceModel || {}
        },
        message: 'مرجع النقل الإسلامي المتقارب مع اللوجستيات والشبكات',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/system/intelligent-fusion', (req, res) => {
    const pack = ILM_REFERENCE.globalUmmahOrganizations || {};
    const list = Array.isArray(pack.organizations) ? pack.organizations : [];
    const names = [
        'منظمة الواقع الممتد الإسلامية',
        'منظمة سلاسل الإمداد الذكية الإسلامية',
        'منظمة MHS ERP والنظم المعلوماتية الإدارية الإسلامية',
        'منظمة البلوك شين المؤسسي الإسلامي',
        'منظمة الذكاء المحيطي والاستشعار الحيوي الإسلامي'
    ];
    const specializedOrganizations = list.filter((org) => names.includes(org.nameAr));

    res.json({
        success: true,
        data: {
            title: 'النظام الإسلامي الذكي المندمج',
            intelligentFusionModel: pack.intelligentFusionModel || {},
            specializedOrganizations,
            linkedOrganizations: (pack.linkedOrganizations || []).filter((name) => names.includes(name)),
            operatingRange: pack.identity?.operatingRange || 'عالمي'
        },
        message: 'مرجع مستقل لمنظومة التقنية الإسلامية المندمجة وMHS ERP والذكاء المحيطي',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/system/mhs-erp', (req, res) => {
    const pack = ILM_REFERENCE.globalUmmahOrganizations || {};
    const fusion = pack.intelligentFusionModel || {};
    const mhs = fusion.mhsErpFramework || {};

    res.json({
        success: true,
        data: {
            title: mhs.title || 'نظام MHS ERP / MIS الإسلامي',
            mission: mhs.mission || '',
            modules: mhs.modules || [],
            aiModes: mhs.aiModes || [],
            islamicAdminPrinciples: mhs.islamicAdminPrinciples || []
        },
        message: 'مرجع مستقل لنظام MHS ERP / MIS الإسلامي المدمج بالذكاء الصناعي',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/system/intelligent-fusion/kpi', (req, res) => {
    const pack = ILM_REFERENCE.globalUmmahOrganizations || {};
    const fusion = pack.intelligentFusionModel || {};
    const mhs = fusion.mhsErpFramework || {};
    const organizations = Array.isArray(pack.organizations) ? pack.organizations : [];
    const specializedSectors = new Set([
        'الواقع الممتد XR',
        'سلاسل الإمداد والتوريد',
        'ERP وMIS',
        'البلوك شين المؤسسي',
        'الذكاء المحيطي والاستشعار'
    ]);

    const specializedCount = organizations.filter((org) => specializedSectors.has(org.sector)).length;
    const kpis = [
        {
            id: 'KPI-ZERO-TOUCH',
            title: 'جاهزية التفاعل الصفري',
            value: Math.min(100, ((fusion.zeroTouchScenarios || []).length * 20)),
            unit: '%',
            target: 95,
            note: 'يقيس توفر السيناريوهات التشغيلية بلا ضغطة زر في البيئات الحية والافتراضية.'
        },
        {
            id: 'KPI-DATA-FUSION',
            title: 'نضج نسيج البيانات الموحد',
            value: Math.min(100, ((fusion.dataFabric || []).length * 24)),
            unit: '%',
            target: 90,
            note: 'يقيس دمج البيانات المهيكلة وغير المهيكلة وشبه المهيكلة.'
        },
        {
            id: 'KPI-MHS-MODULES',
            title: 'تغطية وحدات MHS ERP/MIS',
            value: (mhs.modules || []).length,
            unit: 'وحدة',
            target: 8,
            note: 'عدد الوحدات الإدارية والمالية والتشغيلية المفعلة داخل إطار MHS.'
        },
        {
            id: 'KPI-AI-AUTOMATION',
            title: 'أنماط أتمتة الذكاء الصناعي',
            value: (mhs.aiModes || []).length,
            unit: 'نمط',
            target: 5,
            note: 'عدد أوضاع الذكاء الصناعي المستخدمة في الإدارة والتشغيل.'
        },
        {
            id: 'KPI-SPECIALIZED-ORGS',
            title: 'المنظمات المتخصصة للنظام المندمج',
            value: specializedCount,
            unit: 'منظمة',
            target: 5,
            note: 'عدد الكيانات المؤسسية المتخصصة لتشغيل المنظومة المندمجة.'
        },
        {
            id: 'KPI-SHARIA-GOV',
            title: 'قوة الحوكمة الشرعية',
            value: Math.min(100, ((fusion.islamicControls || []).length * 18)),
            unit: '%',
            target: 95,
            note: 'يقيس اكتمال ضوابط الامتثال الشرعي والسلامة المؤسسية.'
        }
    ];

    const readinessScore = Math.round(
        kpis.reduce((acc, kpi) => {
            const normalized = kpi.unit === '%' ? kpi.value : Math.min(100, (kpi.value / (kpi.target || 1)) * 100);
            return acc + normalized;
        }, 0) / (kpis.length || 1)
    );

    res.json({
        success: true,
        data: {
            title: 'مؤشرات أداء النظام الإسلامي الذكي المندمج',
            readinessScore,
            kpis,
            timestamp: nowIso()
        },
        message: 'بطاقة KPI حية لمنظومة الدمج الذكي الإسلامي',
        timestamp: nowIso()
    });
});

app.get('/api/mhs/core', (req, res) => {
    const pack = ILM_REFERENCE.globalUmmahOrganizations || {};
    const fusion = pack.intelligentFusionModel || {};

    res.json({
        success: true,
        data: {
            system: 'MHS ERP v5 - The Sovereign Islamic Core',
            founder: 'سلمان أحمد سلمان عبدالعزيز الراجح',
            entities: [
                'منظمة الواقع الممتد الإسلامية',
                'منظمة سلاسل الإمداد الذكية الإسلامية',
                'منظمة MHS ERP والنظم المعلوماتية الإدارية الإسلامية'
            ],
            principles: {
                noHarm: 'لا ضرر ولا ضرار',
                trust: 'القوي الأمين',
                interaction: fusion.interactionParadigm || 'Zero-Action Interaction',
                objective: fusion.objective || 'خدمة الدين الإسلامي وأمة محمد والمنفعة العامة'
            },
            features: {
                sensoryFabric: fusion.sensoryFabric || [],
                dataFabric: fusion.dataFabric || [],
                mhsModules: fusion.mhsErpFramework?.modules || [],
                aiModes: fusion.mhsErpFramework?.aiModes || []
            },
            status: 'FULLY_INTEGRATED'
        },
        message: 'البوابة المستقلة لمنظومة MHS ERP الإسلامية المندمجة',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/organizations/global', (req, res) => {
    const pack = ILM_REFERENCE.globalUmmahOrganizations;
    res.json({
        success: true,
        data: {
            title: pack.title,
            scope: pack.scope,
            identity: pack.identity,
            multiScopeCoverage: pack.multiScopeCoverage || [],
            rootModel: pack.rootModel,
            unifiedCurrencyFramework: pack.unifiedCurrencyFramework,
            transportConvergenceModel: pack.transportConvergenceModel || {},
            intelligentFusionModel: pack.intelligentFusionModel || {},
            totalOrganizations: (pack.organizations || []).length,
            organizations: pack.organizations,
            linkedOrganizations: pack.linkedOrganizations,
            governance: pack.governance
        },
        message: 'الحزمة العالمية الموحدة لمنظمات أمة محمد صلى الله عليه وسلم',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/blockchain/status', (req, res) => {
    const chain = ensureGenesisBlock();
    const contracts = load(DB.sheikhaContracts);
    const issuances = load(DB.sheikhaIssuance);
    const latest = chain[chain.length - 1] || null;

    res.json({
        success: true,
        data: {
            network: 'SHEIKHA-ISLAMIC-CHAIN',
            totalBlocks: chain.length,
            totalContracts: Array.isArray(contracts) ? contracts.length : 0,
            totalIssuances: Array.isArray(issuances) ? issuances.length : 0,
            latestBlock: latest,
            mode: 'permissioned-internal',
            note: 'سلسلة كتل مؤسسية داخلية مشفرة بالتجزئة ومهيأة للتدقيق'
        },
        message: 'حالة سلسلة شيخة الإسلامية',
        timestamp: nowIso()
    });
});

app.post('/api/sheikha/blockchain/block', auth, (req, res) => {
    const type = String(req.body?.type || '').trim();
    const data = req.body?.data;

    if (!type) {
        return res.status(400).json({
            success: false,
            message: 'type مطلوب لإضافة بلوك جديد',
            timestamp: nowIso()
        });
    }

    const block = addBlockchainRecord(type, data || {}, req.user?.username || 'owner');
    return res.json({
        success: true,
        data: block,
        message: 'تمت إضافة بلوك جديد إلى سلسلة شيخة',
        timestamp: nowIso()
    });
});

app.post('/api/sheikha/blockchain/contract/deploy', auth, (req, res) => {
    try {
        const name = String(req.body?.name || '').trim();
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'اسم العقد مطلوب',
                timestamp: nowIso()
            });
        }

        const contract = deploySmartContract(req.body || {}, req.user?.username || 'owner');
        return res.json({
            success: true,
            data: contract,
            message: 'تم نشر العقد الذكي بنجاح على سلسلة شيخة المؤسسية',
            timestamp: nowIso()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `تعذر نشر العقد الذكي: ${error.message}`,
            timestamp: nowIso()
        });
    }
});

app.post('/api/sheikha/blockchain/issuance', auth, (req, res) => {
    try {
        const issuance = issueFinancialAsset(req.body || {}, req.user?.username || 'owner');
        return res.json({
            success: true,
            data: issuance,
            message: 'تم تسجيل إصدار مالي فعلي على سلسلة شيخة المؤسسية',
            timestamp: nowIso()
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: `تعذر تنفيذ الإصدار: ${error.message}`,
            timestamp: nowIso()
        });
    }
});

app.get('/api/sheikha/tech-access/zero-click/status', (req, res) => {
    const seed = seedExecutionKpiLive('auto-status-check');
    const live = getLiveKpiSnapshot();
    const readiness = buildReadinessGapAnalysis();
    const latest = live
        .map((x) => x.updatedAt)
        .filter(Boolean)
        .sort()
        .reverse()[0] || null;

    res.json({
        success: true,
        data: {
            autoMode: true,
            seededNow: seed.seeded,
            liveSystems: live.length,
            readinessScore: readiness.readinessScore,
            totalGaps: readiness.totalGaps,
            lastLiveSync: latest,
            safetyRules: ILM_REFERENCE.techAutoAccessFoundation.safetyRules
        },
        message: 'حالة التكامل التلقائي بدون ضغطة زر',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/quran-ai', (req, res) => {
    res.json({
        success: true,
        data: QURAN_AI_PROGRAM,
        message: 'برنامج دمج القرآن والتفسير والحديث بالذكاء الاصطناعي لخدمة التعليم متعدد اللغات',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/quran-ai/languages', (req, res) => {
    res.json({
        success: true,
        data: QURAN_AI_PROGRAM.supportedLanguages,
        total: QURAN_AI_PROGRAM.supportedLanguages.length,
        message: 'اللغات المدعومة للتعليم والشرح',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/quran-ai/curriculum', (req, res) => {
    res.json({
        success: true,
        data: {
            learningModes: QURAN_AI_PROGRAM.learningModes,
            aiCapabilities: QURAN_AI_PROGRAM.aiCapabilities,
            governance: QURAN_AI_PROGRAM.governance
        },
        message: 'المنهاج الذكي لتعليم القرآن والتفسير والحديث',
        timestamp: nowIso()
    });
});

app.post('/api/sheikha/quran-ai/analyze', (req, res) => {
    const kind = normalizeText(req.body?.kind || 'quran');
    const id = normalizeText(req.body?.id || 'iqra-1');
    const language = normalizeText(req.body?.language || 'العربية');
    const audience = normalizeText(req.body?.audience || 'عام');

    const result = buildQuranAiAnalysis(kind, id, language, audience);
    if (!result.found) {
        return res.status(404).json({
            success: false,
            message: result.message,
            timestamp: nowIso()
        });
    }

    return res.json({
        success: true,
        data: result,
        message: 'تحليل تعليمي ذكي للنص المختار',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/quran-ai/analyze', (req, res) => {
    const kind = normalizeText(req.query?.kind || 'quran');
    const id = normalizeText(req.query?.id || 'iqra-1');
    const language = normalizeText(req.query?.language || 'العربية');
    const audience = normalizeText(req.query?.audience || 'عام');

    const result = buildQuranAiAnalysis(kind, id, language, audience);
    if (!result.found) {
        return res.status(404).json({
            success: false,
            message: result.message,
            timestamp: nowIso()
        });
    }

    return res.json({
        success: true,
        data: result,
        message: 'تحليل تعليمي ذكي للنص المختار',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/ilm/search', (req, res) => {
    const q = String(req.query.q || '').trim();
    if (!q || q.length < 2) {
        return res.status(400).json({
            success: false,
            message: 'أدخل كلمة بحث (حرفان على الأقل)'
        });
    }
    const results = {
        quran: ILM_REFERENCE.quranAyat.filter(
            (a) => a.arabic.includes(q) || a.tafsir.includes(q) || a.surah.includes(q) || a.category.includes(q)
        ),
        ahadith: ILM_REFERENCE.ahadith.filter(
            (h) => h.arabic.includes(q) || h.explanation.includes(q) || h.category.includes(q)
        ),
        scholars: ILM_REFERENCE.islamicScholars.filter(
            (s) => s.name.includes(q) || s.field.includes(q) || s.achievement.includes(q)
        )
    };
    return res.json({
        success: true,
        query: q,
        data: results,
        total: results.quran.length + results.ahadith.length + results.scholars.length,
        message: `نتائج البحث عن: ${q}`,
        timestamp: nowIso()
    });
});

// صفحة مرجع العلم الشاملة
app.get('/ilm', (req, res) => {
    const totalAyat = ILM_REFERENCE.quranAyat.length;
    const totalHadith = ILM_REFERENCE.ahadith.length;
    const totalScholars = ILM_REFERENCE.islamicScholars.length;
    const totalCenters = ILM_REFERENCE.ilmCenters.length;

    const ayatRows = ILM_REFERENCE.quranAyat.map((a) => `
        <div class="ref-card">
          <div class="ref-title">📖 ${a.surah} — آية ${a.ayat}</div>
          <div class="ref-arabic">${a.arabic}</div>
          <div class="ref-detail"><strong>التفسير:</strong> ${a.tafsir}</div>
          ${a.sababNuzul ? `<div class="ref-detail"><strong>سبب النزول:</strong> ${a.sababNuzul}</div>` : ''}
          <div class="ref-detail"><strong>التطبيق:</strong> ${a.application}</div>
          <span class="badge">${a.category}</span>
        </div>`).join('');

    const hadithRows = ILM_REFERENCE.ahadith.map((h) => `
        <div class="ref-card">
          <div class="ref-arabic">${h.arabic}</div>
          <div class="ref-detail"><strong>المصدر:</strong> ${h.source} — <span style="color:#6fcf97">${h.grade}</span></div>
          <div class="ref-detail"><strong>الشرح:</strong> ${h.explanation}</div>
          <div class="ref-detail"><strong>التطبيق:</strong> ${h.application}</div>
          <span class="badge">${h.category}</span>
        </div>`).join('');

    const scholarRows = ILM_REFERENCE.islamicScholars.map((s) => `
        <div class="ref-card-sm">
          <strong style="color:#d4af37">${s.name}</strong>
          <div style="color:#b87333;font-size:0.82rem">${s.field}</div>
          <div style="font-size:0.82rem;color:#ccc;margin-top:4px">${s.achievement}</div>
        </div>`).join('');

    const centerRows = ILM_REFERENCE.ilmCenters.map((c) => `
        <div class="ref-card-sm">
          <strong style="color:#d4af37">${c.name}</strong>
          <div style="color:#8ecae6;font-size:0.82rem">${c.type}</div>
          <div style="font-size:0.82rem;color:#ccc;margin-top:4px">${c.significance}</div>
        </div>`).join('');

    res.send(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>مرجع العلم الإسلامي — شيخة</title>
  <style>
    body{font-family:'Tajawal',Arial,sans-serif;background:#0d0d0d;color:#f0f0f0;margin:0;padding:16px}
    .hero{background:linear-gradient(135deg,#1a1200,#0d0d0d);border:1px solid #d4af37;border-radius:16px;padding:28px;max-width:1000px;margin:0 auto 20px;text-align:center}
    .hero h1{color:#d4af37;font-size:2rem;margin:0 0 8px}
    .hero .sub{color:#b87333;font-size:1rem;margin:4px 0}
    .hero .quran-verse{color:#a0c4a0;font-size:1.2rem;margin:14px 0}
    .hero .dua{color:#8ecae6;font-size:0.95rem}
    .stats{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:16px 0}
    .stat{background:#1b1b1b;border:1px solid #333;border-radius:10px;padding:12px 20px;text-align:center}
    .stat .num{color:#d4af37;font-size:1.6rem;font-weight:bold}
    .stat .lbl{color:#888;font-size:0.78rem}
    .section{max-width:1000px;margin:0 auto 20px}
    .section-title{color:#b87333;font-size:1rem;font-weight:bold;border-bottom:1px solid #2a2a2a;padding-bottom:8px;margin-bottom:14px}
    .ref-card{background:#1b1b1b;border:1px solid #2a2a2a;border-radius:10px;padding:16px;margin-bottom:12px}
    .ref-card:hover{border-color:#d4af3755}
    .ref-title{color:#d4af37;font-weight:bold;margin-bottom:8px}
    .ref-arabic{color:#fff;font-size:1.1rem;line-height:1.8;margin:8px 0;border-right:3px solid #d4af37;padding-right:12px}
    .ref-detail{color:#aaa;font-size:0.88rem;margin:6px 0;line-height:1.6}
    .ref-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .ref-card-sm{background:#1b1b1b;border:1px solid #2a2a2a;border-radius:8px;padding:12px}
    .badge{display:inline-block;background:#1a3a1a;color:#6fcf97;border-radius:6px;padding:2px 10px;font-size:0.78rem;margin-top:6px}
    .nav{display:flex;gap:8px;flex-wrap:wrap;margin:16px auto;max-width:1000px}
    .nav a{background:#1b1b1b;border:1px solid #333;border-radius:8px;padding:8px 14px;color:#d4af37;text-decoration:none;font-size:0.85rem}
    .nav a:hover{border-color:#d4af37}
    @media(max-width:600px){.ref-grid{grid-template-columns:1fr}.stats{flex-direction:column}.hero h1{font-size:1.4rem}}
  </style>
</head>
<body>
  <div class="hero">
    <h1>📚 مرجع العلم الإسلامي الشامل</h1>
    <div class="sub">منظومة شيخة — المرجع الأول للعلم النافع</div>
    <div class="quran-verse">﴿رب زدني علمًا﴾ — طه 114</div>
    <div class="dua">ربي انفع بي وسخر لي العلم — اللهم صلِّ وسلِّم على نبينا محمد</div>
  </div>

  <div class="stats">
    <div class="stat"><div class="num">${totalAyat}</div><div class="lbl">آية قرآنية</div></div>
    <div class="stat"><div class="num">${totalHadith}</div><div class="lbl">حديث شريف</div></div>
    <div class="stat"><div class="num">${totalScholars}</div><div class="lbl">عالم مسلم</div></div>
    <div class="stat"><div class="num">${totalCenters}</div><div class="lbl">مركز علمي</div></div>
    <div class="stat"><div class="num">4</div><div class="lbl">خليفة راشد</div></div>
  </div>

  <div class="nav">
    <a href="#quran">📖 آيات العلم</a>
    <a href="#hadith">📜 الأحاديث</a>
    <a href="#khulafa">🌟 الخلفاء الراشدون</a>
    <a href="#scholars">🎓 أعلام العلماء</a>
    <a href="#centers">🏛️ مراكز العلم</a>
    <a href="#riyadh">🌸 رياض الجنة</a>
    <a href="#apps">⚙️ تطبيقات العلم</a>
    <a href="#systems">🏗️ الأنظمة الحضارية</a>
    <a href="#execution">📊 التنفيذ والجاهزية</a>
    <a href="/systems-execution">🚀 لوحة التنفيذ</a>
    <a href="/quran-ai">🤖 Quran AI</a>
    <a href="/api/sheikha/ilm/search?q=علم">🔍 بحث API</a>
  </div>

  <div class="section" id="quran">
    <div class="section-title">📖 آيات القرآن الكريم في العلم والتعلم (${totalAyat} آية)</div>
    ${ayatRows}
  </div>

  <div class="section" id="hadith">
    <div class="section-title">📜 أحاديث النبي ﷺ في العلم والتعليم (${totalHadith} حديث)</div>
    ${hadithRows}
  </div>

  <div class="section" id="khulafa">
    <div class="section-title">🌟 سيرة النبي ﷺ والخلفاء الراشدين في العلم</div>
    <div class="ref-card">
      <div class="ref-title">محمد ﷺ — المعلم الأول والمربي الأعظم</div>
      ${ILM_REFERENCE.sunnahProphet.practices.map((p) => `<div class="ref-detail">• <strong>${p.action}</strong> — ${p.lesson}</div>`).join('')}
    </div>
    ${ILM_REFERENCE.khulafaRashidun.map((k) => `
    <div class="ref-card">
      <div class="ref-title">${k.name} — ${k.title}</div>
      ${k.ilmActions.map((a) => `<div class="ref-detail">• ${a}</div>`).join('')}
      <div class="ref-detail" style="color:#d4af37;margin-top:8px"><strong>الإرث العلمي:</strong> ${k.legacy}</div>
    </div>`).join('')}
  </div>

  <div class="section" id="scholars">
    <div class="section-title">🎓 أعلام العلماء المسلمين (${totalScholars} عالم)</div>
    <div class="ref-grid">${scholarRows}</div>
  </div>

  <div class="section" id="centers">
    <div class="section-title">🏛️ مراكز العلم الإسلامية (${totalCenters} مركز)</div>
    <div class="ref-grid">${centerRows}</div>
  </div>

  <div class="section" id="riyadh">
    <div class="section-title">🌸 رياض الجنة — أماكن العلم المباركة</div>
    ${ILM_REFERENCE.riyadJanna.map((r) => `
    <div class="ref-card">
      <div class="ref-title">${r.name} — ${r.location}</div>
      <div class="ref-arabic">${r.hadith}</div>
      <div class="ref-detail">${r.significance}</div>
    </div>`).join('')}
  </div>

  <div class="section" id="apps">
    <div class="section-title">⚙️ تطبيقات العلم في الدنيا</div>
    <div class="ref-grid">
      <div class="ref-card-sm"><strong style="color:#d4af37">📈 التجارة</strong>${ILM_REFERENCE.ilmApplications.trade.map((t) => `<div class="ref-detail">• ${t}</div>`).join('')}</div>
      <div class="ref-card-sm"><strong style="color:#d4af37">🏛️ الإدارة</strong>${ILM_REFERENCE.ilmApplications.management.map((t) => `<div class="ref-detail">• ${t}</div>`).join('')}</div>
      <div class="ref-card-sm"><strong style="color:#d4af37">🔬 العلوم</strong>${ILM_REFERENCE.ilmApplications.science.map((t) => `<div class="ref-detail">• ${t}</div>`).join('')}</div>
      <div class="ref-card-sm"><strong style="color:#d4af37">💻 التقنية</strong>${ILM_REFERENCE.ilmApplications.technology.map((t) => `<div class="ref-detail">• ${t}</div>`).join('')}</div>
    </div>
  </div>

    <div class="section" id="systems">
        <div class="section-title">🏗️ أنظمة الصناعة والزراعة والابتكار والذكاء والحوسبة</div>
        <div class="ref-grid">
            <div class="ref-card-sm">
                <strong style="color:#d4af37">🚚 ${ILM_REFERENCE.islamicSupplyChainSystem.title}</strong>
                <div class="ref-detail"><strong>الرؤية:</strong> ${ILM_REFERENCE.islamicSupplyChainSystem.vision}</div>
                ${ILM_REFERENCE.islamicSupplyChainSystem.valueChain.map((x) => `<div class="ref-detail">• ${x}</div>`).join('')}
            </div>

            <div class="ref-card-sm">
                <strong style="color:#d4af37">🧪 ${ILM_REFERENCE.islamicInnovationSystem.title}</strong>
                <div class="ref-detail"><strong>الرؤية:</strong> ${ILM_REFERENCE.islamicInnovationSystem.vision}</div>
                ${ILM_REFERENCE.islamicInnovationSystem.innovationPipeline.map((x) => `<div class="ref-detail">• ${x}</div>`).join('')}
            </div>

            <div class="ref-card-sm">
                <strong style="color:#d4af37">🏭 ${ILM_REFERENCE.islamicIndustrySystem.title}</strong>
                <div class="ref-detail"><strong>الرؤية:</strong> ${ILM_REFERENCE.islamicIndustrySystem.vision}</div>
                ${ILM_REFERENCE.islamicIndustrySystem.industrialArchitecture.map((x) => `<div class="ref-detail">• ${x}</div>`).join('')}
            </div>

            <div class="ref-card-sm">
                <strong style="color:#d4af37">🌾 ${ILM_REFERENCE.islamicAgricultureSystem.title}</strong>
                <div class="ref-detail"><strong>الرؤية:</strong> ${ILM_REFERENCE.islamicAgricultureSystem.vision}</div>
                ${ILM_REFERENCE.islamicAgricultureSystem.agricultureModel.map((x) => `<div class="ref-detail">• ${x}</div>`).join('')}
            </div>

            <div class="ref-card-sm">
                <strong style="color:#d4af37">🤖 ${ILM_REFERENCE.islamicAiOrganization.title}</strong>
                <div class="ref-detail"><strong>الرؤية:</strong> ${ILM_REFERENCE.islamicAiOrganization.vision}</div>
                ${ILM_REFERENCE.islamicAiOrganization.operatingModel.map((x) => `<div class="ref-detail">• ${x}</div>`).join('')}
            </div>

            <div class="ref-card-sm">
                <strong style="color:#d4af37">🖥️ ${ILM_REFERENCE.islamicComputingSystem.title}</strong>
                <div class="ref-detail"><strong>الرؤية:</strong> ${ILM_REFERENCE.islamicComputingSystem.vision}</div>
                ${ILM_REFERENCE.islamicComputingSystem.architectureLayers.map((x) => `<div class="ref-detail">• ${x}</div>`).join('')}
            </div>

            <div class="ref-card-sm">
                <strong style="color:#d4af37">🧠 ${ILM_REFERENCE.islamicAiSciencesIntegration.title}</strong>
                <div class="ref-detail"><strong>الرؤية:</strong> ${ILM_REFERENCE.islamicAiSciencesIntegration.vision}</div>
                ${ILM_REFERENCE.islamicAiSciencesIntegration.operatingLayers.map((x) => `<div class="ref-detail">• ${x}</div>`).join('')}
            </div>
        </div>
    </div>

    <div class="section" id="execution">
        <div class="section-title">📊 التنفيذ والجاهزية الموحدة</div>
        <div class="ref-grid">
            <div class="ref-card-sm">
                <strong style="color:#d4af37">بطاقة القياس الموحدة</strong>
                <div class="ref-detail">• <a href="/api/sheikha/ilm/execution/scorecard">عرض JSON</a></div>
                <div class="ref-detail">• تشمل الأنظمة: الإدارة، الإمداد، الابتكار، الصناعة، الزراعة، الذكاء، الحوسبة</div>
                <div class="ref-detail">• أبعاد القياس: الشرع، التشغيل، الجودة، الأثر، الجاهزية الرقمية</div>
            </div>
            <div class="ref-card-sm">
                <strong style="color:#d4af37">تحليل الجاهزية والفجوات</strong>
                <div class="ref-detail">• <a href="/api/sheikha/ilm/execution/readiness">عرض JSON</a></div>
                <div class="ref-detail">• تقييم موحد للفجوات مع توصيات تنفيذية</div>
                <div class="ref-detail">• <a href="/systems-execution">الانتقال إلى لوحة التنفيذ التشغيلية</a></div>
            </div>
        </div>
    </div>

  <div style="text-align:center;padding:20px;color:#444;font-size:0.82rem">
    ولا حول ولا قوة إلا بالله — منظومة شيخة © ${new Date().getFullYear()}
  </div>
</body>
</html>`);
});

app.get('/quran-ai', (req, res) => {
        res.send(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>Quran AI — شيخة</title>
    <style>
        body{font-family:'Tajawal',Arial,sans-serif;background:#0b0f16;color:#eef3fb;margin:0;padding:18px}
        .hero,.panel{max-width:1080px;margin:0 auto 16px;background:#121a29;border:1px solid #2a3852;border-radius:16px;padding:18px}
        .hero{border-color:#d4af37;background:linear-gradient(125deg,#1d1708,#121a29)}
        h1{margin:0 0 8px;color:#d4af37}.sub{color:#c5d0df;line-height:1.8}
        .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px}
        .card{background:#0f1624;border:1px solid #283754;border-radius:12px;padding:14px}
        .title{color:#d4af37;font-weight:bold;margin-bottom:8px}
        .tools{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
        select,input,button{background:#0b1019;border:1px solid #37425b;color:#eef3fb;border-radius:8px;padding:8px 10px;font-family:inherit}
        button{cursor:pointer;background:#1f6feb;border:0}
        pre{white-space:pre-wrap;background:#0a111d;border:1px solid #273650;border-radius:12px;padding:12px;color:#dce7f6}
        a{color:#8ecae6;text-decoration:none}
        ul{margin:0;padding-right:18px} li{margin:6px 0}
    </style>
</head>
<body>
    <div class="hero">
        <h1>Quran AI | Hadith AI</h1>
        <div class="sub">تعليم القرآن والتفسير والحديث بالذكاء الاصطناعي، مع بقاء النص العربي أصلًا، ودعم الشرح والتدريس بعدة لغات، وخطة تعليمية موجهة للطفل والعام وطالب العلم والمعلم.</div>
    </div>

    <div class="panel">
        <div class="tools">
            <select id="kind">
                <option value="quran">آية قرآنية</option>
                <option value="hadith">حديث</option>
            </select>
            <input id="id" value="iqra-1" placeholder="معرّف النص مثل iqra-1 أو talab-ilm"/>
            <select id="audience">
                <option value="طفل">طفل</option>
                <option value="عام" selected>عام</option>
                <option value="طالب علم">طالب علم</option>
                <option value="معلم">معلم</option>
            </select>
            <input id="language" value="العربية" placeholder="اللغة مثل العربية أو English"/>
            <button onclick="runAnalysis()">تحليل وتعليم</button>
            <a href="/api/sheikha/quran-ai">JSON البرنامج</a>
        </div>
        <pre id="out">جاري تحميل البرنامج...</pre>
    </div>

    <div class="panel grid" id="cards"></div>

    <script>
        async function j(url, options){ const r = await fetch(url, options); return r.json(); }
        function card(title, items){ return '<div class="card"><div class="title">'+title+'</div><ul>'+items.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></div>'; }
        async function boot(){
            const data = await j('/api/sheikha/quran-ai');
            const p = data.data || {};
            document.getElementById('cards').innerHTML = [
                card('الأسس', p.pillars || []),
                card('أنماط التعلم', p.learningModes || []),
                card('قدرات الذكاء الاصطناعي', p.aiCapabilities || []),
                card('الحوكمة', p.governance || []),
                card('اللغات', p.supportedLanguages || [])
            ].join('');
            document.getElementById('out').textContent = JSON.stringify(p, null, 2);
        }
        async function runAnalysis(){
            const kind = encodeURIComponent(document.getElementById('kind').value);
            const id = encodeURIComponent(document.getElementById('id').value);
            const audience = encodeURIComponent(document.getElementById('audience').value);
            const language = encodeURIComponent(document.getElementById('language').value);
            const out = await j('/api/sheikha/quran-ai/analyze?kind='+kind+'&id='+id+'&audience='+audience+'&language='+language);
            document.getElementById('out').textContent = JSON.stringify(out, null, 2);
        }
        boot().catch(function(){ document.getElementById('out').textContent = 'تعذر تحميل البرنامج'; });
    </script>
</body>
</html>`);
});

// ═══════════════════════════════════════════════════════════════
// محرك العمل الخلفي التلقائي
// يعمل عند ترك الجهاز — يُفعّل ويُقيّم ويُسجّل بلا توقف
// إذا مات ابن آدم انقطع عمله إلا من ثلاث... وعلم ينتفع به
// ═══════════════════════════════════════════════════════════════
const BACKGROUND_WORKER = {
    running: false,
    intervalMs: 60 * 1000, // كل 60 ثانية
    cycleCount: 0,
    startedAt: null,
    handle: null
};

function backgroundCycle() {
    BACKGROUND_WORKER.cycleCount += 1;
    const cycle = BACKGROUND_WORKER.cycleCount;
    const now = nowIso();

    // ١. تحقق من صحة التخزين
    initStorage();

    // ٢. سجل نبضة تشغيل
    const audits = load(DB.audits);
    audits.push({
        id: Date.now(),
        type: 'background_heartbeat',
        cycle,
        time: now,
        message: 'النظام يعمل — العلم مستمر لله'
    });
    // احتفظ بآخر 1000 سجل فقط
    const trimmed = audits.length > 1000 ? audits.slice(-1000) : audits;
    save(DB.audits, trimmed);

    // ٢.١ مزامنة تلقائية بدون ضغطة زر + توثيق زمني
    const sync = runSyncCycle('background-worker');
    appendEventTimeline('worker_heartbeat', {
        cycle,
        readinessScore: sync.readiness.readinessScore,
        totalGaps: sync.readiness.totalGaps
    }, 'background-worker');

    // ٣. كل 10 دورات: تقرير يومي تلقائي
    if (cycle % 10 === 0) {
        const projects = load(DB.projects);
        const knowledge = load(DB.knowledge);
        const reports = load(DB.reports);

        const report = {
            id: Date.now(),
            type: 'auto_report',
            cycle,
            time: now,
            summary: 'تقرير تلقائي — التشغيل المستمر',
            metrics: {
                projects: projects.length,
                knowledge: knowledge.length,
                audits: trimmed.length
            },
            ilmStats: {
                quranAyat: ILM_REFERENCE.quranAyat.length,
                ahadith: ILM_REFERENCE.ahadith.length,
                scholars: ILM_REFERENCE.islamicScholars.length
            },
            renaissance: {
                structure: Object.keys(KNOWLEDGE_RENAISSANCE.structure).length,
                principles: KNOWLEDGE_RENAISSANCE.principles.length
            }
        };

        reports.push(report);
        const trimReports = reports.length > 500 ? reports.slice(-500) : reports;
        save(DB.reports, trimReports);

        console.log(`📊 [شيخة v4] دورة ${cycle} — تقرير تلقائي — مشاريع: ${projects.length} — معلومات: ${knowledge.length}`);
    }

    // ٤. كل 60 دورة: تنظيف وإحياء
    if (cycle % 60 === 0) {
        console.log(`🌟 [شيخة v4] دورة ${cycle} — النظام مستمر في خدمة العلم — ﴿رب زدني علمًا﴾`);
    }
}

function startBackgroundWorker() {
    if (BACKGROUND_WORKER.running) return;
    BACKGROUND_WORKER.running = true;
    BACKGROUND_WORKER.startedAt = nowIso();
    BACKGROUND_WORKER.handle = setInterval(backgroundCycle, BACKGROUND_WORKER.intervalMs);
    console.log('⚙️  [شيخة v4] محرك العمل الخلفي انطلق — العلم لا يتوقف — إن الله يحب إذا عمل أحدكم عملًا أن يتقنه');
    // دورة أولى فورية
    appendEventTimeline('worker_started', {
        intervalMs: BACKGROUND_WORKER.intervalMs,
        startedAt: BACKGROUND_WORKER.startedAt
    }, 'background-worker');
    backgroundCycle();
}

function stopBackgroundWorker() {
    if (BACKGROUND_WORKER.handle) {
        clearInterval(BACKGROUND_WORKER.handle);
        BACKGROUND_WORKER.handle = null;
        BACKGROUND_WORKER.running = false;
        appendEventTimeline('worker_stopped', {
            stoppedAt: nowIso(),
            totalCycles: BACKGROUND_WORKER.cycleCount
        }, 'background-worker');
        console.log('⏹️  [شيخة v4] محرك العمل الخلفي توقف');
    }
}

// إيقاف نظيف عند إغلاق العملية
process.on('SIGTERM', stopBackgroundWorker);
process.on('SIGINT', stopBackgroundWorker);

// API: حالة المحرك الخلفي
app.get('/api/sheikha/worker/status', (req, res) => {
    res.json({
        success: true,
        data: {
            running: BACKGROUND_WORKER.running,
            cycleCount: BACKGROUND_WORKER.cycleCount,
            intervalMs: BACKGROUND_WORKER.intervalMs,
            startedAt: BACKGROUND_WORKER.startedAt,
            nextCycleIn: BACKGROUND_WORKER.running
                ? `${BACKGROUND_WORKER.intervalMs / 1000} ثانية`
                : 'متوقف'
        },
        message: BACKGROUND_WORKER.running
            ? '✅ المحرك الخلفي يعمل — العلم مستمر لله'
            : '⏸️ المحرك الخلفي متوقف',
        timestamp: nowIso()
    });
});

// API: تحكم يدوي في المحرك
app.post('/api/sheikha/worker/start', auth, requireSheikhaLicense(['worker:control']), (req, res) => {
    startBackgroundWorker();
    res.json({
        success: true,
        message: '✅ تم تشغيل المحرك الخلفي',
        timestamp: nowIso()
    });
});

app.post('/api/sheikha/worker/stop', auth, requireSheikhaLicense(['worker:control']), (req, res) => {
    stopBackgroundWorker();
    res.json({
        success: true,
        message: '⏹️ تم إيقاف المحرك الخلفي',
        timestamp: nowIso()
    });
});

// ═══════════════════════════════════════════════════════════════
// نظام التجديد الإسلامي — كل 100 سنة هجرية
// «إن الله يبعث لهذه الأمة على رأس كل مائة سنة من يجدد لها دينها»
//  — أبو داود 4291 — صحيح
// ═══════════════════════════════════════════════════════════════
const TAJDID_SYSTEM = {
    hadith: {
        arabic: 'إن الله يبعث لهذه الأمة على رأس كل مائة سنة من يجدد لها دينها',
        source: 'سنن أبي داود — حديث 4291',
        grade: 'صحيح — صححه الحاكم والذهبي والألباني',
        rawee: 'أبو هريرة رضي الله عنه',
        explanation: 'الله يرسل لهذه الأمة في رأس كل قرن هجري من يجدد عملها بالقرآن والسنة ويُحيي ما اندثر — وقد استمر هذا الوعد الرباني 15 قرنًا متواصلة'
    },

    // القرون الهجرية ومجددوها المعروفون
    centuryRenewers: [
        { century: 1, years: '1-100 هـ', approx: '622-718م', mujaddid: 'عمر بن عبد العزيز رضي الله عنه', title: 'الخليفة الخامس الراشد', achievement: 'أحيا العدل والسنة بعد الفتنة — الإصلاح الإداري الشامل' },
        { century: 2, years: '101-200 هـ', approx: '718-815م', mujaddid: 'الإمام الشافعي رحمه الله', title: 'ناصر الحديث — مؤسس علم الأصول', achievement: 'الرسالة — أصّل القواعد التي تحكم الاستنباط الفقهي' },
        { century: 3, years: '201-300 هـ', approx: '815-912م', mujaddid: 'الإمام أحمد بن حنبل رحمه الله', title: 'إمام أهل السنة', achievement: 'ثبت على السنة في محنة خلق القرآن — المسند' },
        { century: 4, years: '301-400 هـ', approx: '912-1009م', mujaddid: 'القاضي الباقلاني رحمه الله', title: 'سيف أهل السنة في الكلام', achievement: 'حصّن العقيدة من الفلسفات المتسللة — التمهيد' },
        { century: 5, years: '401-500 هـ', approx: '1009-1105م', mujaddid: 'الإمام الغزالي رحمه الله', title: 'حجة الإسلام', achievement: 'إحياء علوم الدين — أنقذ الأمة من الإفراط الكلامي وأعادها للأصول' },
        { century: 6, years: '501-600 هـ', approx: '1105-1201م', mujaddid: 'الفخر الرازي رحمه الله', title: 'إمام المشككين', achievement: 'مفاتيح الغيب — حارب الفكر الفلسفي المعادي بأدواته' },
        { century: 7, years: '601-700 هـ', approx: '1201-1299م', mujaddid: 'شيخ الإسلام ابن تيمية رحمه الله', title: 'شيخ الإسلام', achievement: 'درء تعارض العقل والنقل — إحياء السنة والجهاد العلمي ضد البدع' },
        { century: 8, years: '701-800 هـ', approx: '1299-1396م', mujaddid: 'ابن حجر العسقلاني رحمه الله', title: 'أمير المؤمنين في الحديث', achievement: 'فتح الباري شرح صحيح البخاري — أعظم شرح حديثي في التاريخ' },
        { century: 9, years: '801-900 هـ', approx: '1396-1494م', mujaddid: 'جلال الدين السيوطي رحمه الله', title: 'ابن الكتب', achievement: 'الجامع الكبير — ألّف في كل فن وأحيا التراث الإسلامي' },
        { century: 10, years: '901-1000 هـ', approx: '1494-1591م', mujaddid: 'الشاه ولي الله الدهلوي رحمه الله', title: 'مجدد الهند', achievement: 'حجة الله البالغة — ربط الشريعة بمقاصدها ووصل طرق الفقراء والأثرياء' },
        { century: 11, years: '1001-1100 هـ', approx: '1591-1688م', mujaddid: 'أحمد الفاروقي السرهندي رحمه الله', title: 'مجدد الألف الثاني', achievement: 'المكتوبات — إحياء العقيدة الصحيحة في القارة الهندية' },
        { century: 12, years: '1101-1200 هـ', approx: '1688-1784م', mujaddid: 'محمد بن عبد الوهاب رحمه الله', title: 'محيي التوحيد في الجزيرة', achievement: 'كتاب التوحيد — إحياء عقيدة السلف في الجزيرة العربية' },
        { century: 13, years: '1201-1300 هـ', approx: '1784-1882م', mujaddid: 'الإمام الشوكاني رحمه الله', title: 'قاضي القضاة في اليمن', achievement: 'نيل الأوطار — إحياء الاجتهاد ومقاومة التقليد الأعمى' },
        { century: 14, years: '1301-1400 هـ', approx: '1882-1979م', mujaddid: 'الشيخ أحمد شاكر رحمه الله / الشيخ ناصر الدين الألباني', title: 'محيي السنة في العصر الحديث', achievement: 'تحقيق المسند — إحياء علم الحديث في عصر الشك والتغريب' },
        { century: 15, years: '1401-1500 هـ', approx: '1979-2076م', mujaddid: 'يستمر الوعد الرباني — الله أعلم بمن يختار', title: 'قرن التقنية والذكاء الاصطناعي', achievement: 'تجديد العلوم الإسلامية في عصر المعلومات — شيخة أداة من أدوات هذا التجديد', current: true }
    ],

    // القرن الحالي
    currentCentury: {
        hijri: 15,
        startYear: 1401,
        endYear: 1500,
        currentHijriApprox: 1447,
        remaining: 53, // سنة تقريبًا حتى نهاية القرن
        position: 'نحن في القرن الهجري الخامس عشر — وسطه',
        mission: 'تجديد العلم النافع غير الضار بالذكاء الاصطناعي والتقنية — لخدمة الإسلام والإنسانية'
    },

    // مبادئ التجديد
    renewalPrinciples: [
        'التجديد بالعودة للأصل — لا الابتداع',
        'إحياء ما اندثر — لا هدم ما بُني',
        'العلم النافع غير الضار — شرط التجديد',
        'التجديد خدمة للأمة كلها — لا لفئة دون أخرى',
        'المجدد يُعرف بثمرته — لا بادعائه',
        'كل فرد في موضعه مجدد — «من يجدد لها» لا يعني واحدًا فقط',
        'التجديد مستمر كنفَس الحياة — لا يتوقف حتى يأتي أمر الله'
    ],

    // آليات التجديد في شيخة
    sheikhaRenewal: {
        mission: 'شيخة أداة تجديد — تجمع العلم القديم بأدوات العصر الحديث',
        mechanisms: [
            'توثيق العلم رقميًا وإتاحته للجميع',
            'البحث الآلي في المراجع الشرعية',
            'ربط التجارة والمعادن بأحكام الشريعة',
            'نشر العلم النافع عبر واجهات برمجية مفتوحة',
            'الحفاظ على لغة القرآن في التقنية الحديثة'
        ],
        dua: 'اللهم اجعلنا ممن يُجدد لأمة محمد ﷺ علمها — اللهم هب لنا وارزقنا أفضل وأنفع العلوم النافعة غير الضارة'
    },

    // الاستدامة — التجديد لا ينقطع حتى يوم القيامة
    sustainability: {
        basis: 'لا تزال طائفة من أمتي على الحق ظاهرين — حتى يأتي أمر الله',
        source: 'البخاري ومسلم — متفق عليه',
        promise: 'وعد الله أن لا تجتمع أمته على ضلالة — فالتجديد مستمر بأمره تعالى',
        system: 'شيخة مبنية على هذا الوعد — تجديد مستدام إلى يوم القيامة'
    },

    metadata: {
        builtAt: new Date().toISOString(),
        owner: 'سلمان أحمد سلمان عبدالعزيز عبدالله مبارك الراجح — من قبيلة بني تميم',
        ownerEn: 'Salman Ahmed Salman Abdulaziz Abdullah Mubarak Alrajeh — Banu Tamim Tribe',
        organizations: [
            'منظومة شيخة العلم',
            'منظومة شيخة العلمية',
            'منظومة شيخة الإسلامية',
            'منظومة شيخة للكتاب والسنة',
            'منظومة شيخة لتجديد الدين كل 100 سنة هجرية'
        ],
        organization: 'منظومة شيخة — SHEIKHA',
        domain: 'sheikha.top',
        declaration: 'هذا العلم لله وحده — وقف خيري خالص باسم سلمان أحمد سلمان عبدالعزيز عبدالله مبارك الراجح من قبيلة بني تميم — نفعاً للأمة والبشرية',
        dua: 'اللهم هب لنا وارزقنا — رب زدنا علمًا نافعًا غير ضار — واجعله صدقة جارية إلى يوم القيامة'
    }
};

// مسارات API نظام التجديد
app.get('/api/sheikha/tajdid', (req, res) => {
    res.json({
        success: true,
        data: TAJDID_SYSTEM,
        message: '«إن الله يبعث لهذه الأمة على رأس كل مائة سنة من يجدد لها دينها» — نظام التجديد الإسلامي',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/tajdid/current-century', (req, res) => {
    const current = TAJDID_SYSTEM.centuryRenewers.find((c) => c.current);
    res.json({
        success: true,
        data: {
            current: TAJDID_SYSTEM.currentCentury,
            centuryInfo: current,
            hadith: TAJDID_SYSTEM.hadith,
            mission: TAJDID_SYSTEM.sheikhaRenewal.mission,
            dua: TAJDID_SYSTEM.sheikhaRenewal.dua,
            principles: TAJDID_SYSTEM.renewalPrinciples
        },
        message: 'نحن في القرن الهجري الخامس عشر — قرن التقنية والذكاء الاصطناعي',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/tajdid/renewers', (req, res) => {
    const { century } = req.query;
    const renewers = century
        ? TAJDID_SYSTEM.centuryRenewers.filter((r) => String(r.century) === String(century))
        : TAJDID_SYSTEM.centuryRenewers;
    res.json({
        success: true,
        data: renewers,
        total: renewers.length,
        message: 'مجددو الأمة الإسلامية عبر خمسة عشر قرنًا',
        timestamp: nowIso()
    });
});

// صفحة التجديد
app.get('/tajdid', (req, res) => {
    const rows = TAJDID_SYSTEM.centuryRenewers.map((r) => `
        <div class="century-card${r.current ? ' current' : ''}">
          <div class="century-num">القرن ${r.century}</div>
          <div class="century-years">${r.years} / ${r.approx}</div>
          <div class="century-name">${r.mujaddid}</div>
          <div class="century-title">${r.title}</div>
          <div class="century-achievement">${r.achievement}</div>
        </div>`).join('');

    res.send(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>نظام التجديد الإسلامي — شيخة</title>
  <style>
    body{font-family:'Tajawal',Arial,sans-serif;background:#0d0d0d;color:#f0f0f0;margin:0;padding:16px}
    .hero{background:linear-gradient(135deg,#0d1a0d,#0d0d0d);border:2px solid #d4af37;border-radius:16px;padding:28px;max-width:960px;margin:0 auto 20px;text-align:center}
    .hero h1{color:#d4af37;font-size:1.9rem;margin:0 0 10px}
    .hadith{color:#fff;font-size:1.2rem;line-height:1.9;margin:14px 0;border:1px solid #d4af3755;border-radius:10px;padding:14px;background:#111}
    .hadith-source{color:#6fcf97;font-size:0.85rem;margin-top:6px}
    .current-box{max-width:960px;margin:0 auto 20px;background:#0a1a0a;border:1px solid #6fcf97;border-radius:12px;padding:20px}
    .current-box h2{color:#6fcf97;margin:0 0 10px}
    .current-box p{color:#ccc;margin:6px 0;font-size:0.92rem}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;max-width:960px;margin:0 auto}
    .century-card{background:#1b1b1b;border:1px solid #2a2a2a;border-radius:10px;padding:16px}
    .century-card.current{border:2px solid #d4af37;background:#1a1200}
    .century-num{color:#d4af37;font-size:0.8rem;font-weight:bold;margin-bottom:4px}
    .century-years{color:#888;font-size:0.75rem;margin-bottom:8px}
    .century-name{color:#fff;font-size:1rem;font-weight:bold;margin-bottom:2px}
    .century-title{color:#b87333;font-size:0.82rem;margin-bottom:8px}
    .century-achievement{color:#aaa;font-size:0.82rem;line-height:1.5}
    .dua{max-width:960px;margin:20px auto;text-align:center;color:#d4af37;font-size:1rem;padding:16px;border:1px solid #d4af3733;border-radius:10px}
    .nav{display:flex;gap:8px;flex-wrap:wrap;margin:12px auto;max-width:960px}
    .nav a{background:#1b1b1b;border:1px solid #333;border-radius:8px;padding:8px 14px;color:#d4af37;text-decoration:none;font-size:0.85rem}
    @media(max-width:600px){.hero h1{font-size:1.3rem}}
  </style>
</head>
<body>
  <div class="hero">
    <h1>🔄 نظام التجديد الإسلامي</h1>
    <div class="hadith">
      «إن الله يبعث لهذه الأمة على رأس كل مائة سنة من يجدد لها دينها»
      <div class="hadith-source">سنن أبي داود — حديث 4291 — عن أبي هريرة رضي الله عنه — صحيح</div>
    </div>
  </div>

  <div class="current-box">
    <h2>🌟 نحن في القرن الهجري الخامس عشر</h2>
    <p>📅 السنة الهجرية الحالية: ~${TAJDID_SYSTEM.currentCentury.currentHijriApprox} هـ — المتبقي من القرن: ~${TAJDID_SYSTEM.currentCentury.remaining} سنة</p>
    <p>📋 المهمة: ${TAJDID_SYSTEM.currentCentury.mission}</p>
    <p>🔧 ${TAJDID_SYSTEM.sheikhaRenewal.mission}</p>
    <p style="color:#6fcf97">🌱 ${TAJDID_SYSTEM.sustainability.basis}</p>
  </div>

  <div class="nav">
    <a href="/ilm">📚 مرجع العلم</a>
    <a href="/dashboard">🏠 لوحة القيادة</a>
    <a href="/api/sheikha/tajdid">📡 JSON API</a>
  </div>

  <div class="grid">${rows}</div>

  <div class="dua">${TAJDID_SYSTEM.sheikhaRenewal.dua}</div>
  <div style="text-align:center;color:#444;font-size:0.8rem;padding:16px">
    ولا حول ولا قوة إلا بالله — منظومة شيخة © ${new Date().getFullYear()}
  </div>
</body>
</html>`);
});

// ═══════════════════════════════════════════════════════════════
// منظومة شيخة الإسلامية للحوكمة والتجديد الرقمي
// الهدف: الأمر بالمعروف والنهي عن المنكر وفق الكتاب والسنة
// ═══════════════════════════════════════════════════════════════
const SHEIKHA_ISLAMIC_GOVERNANCE = {
    identity: {
        owner: 'سلمان أحمد سلمان عبدالعزيز عبدالله مبارك الراجح — من قبيلة بني تميم',
        organization: 'منظومة شيخة الإسلامية للعلم والتجديد',
        mission: 'تجديد الدين كل 100 سنة هجرية بإحياء الوحي وتفعيل وسائل العصر النافعة',
        basis: 'الكتاب والسنة وسنة الخلفاء الراشدين المهديين'
    },

    principles: [
        'التوحيد والإخلاص لله أساس كل عمل',
        'الالتزام بالكتاب والسنة بفهم السلف الصالح',
        'لا اجتهاد مع النص القطعي',
        'الأمر بالمعروف والنهي عن المنكر بالحكمة',
        'سد الذرائع إلى الفساد والانحراف',
        'درء المفاسد مقدم على جلب المصالح عند التعارض',
        'العلم النافع غير الضار هو معيار القبول'
    ],

    certification: {
        name: 'شهادة شيخة الإسلامية للتأصيل والالتزام',
        levels: ['أساس', 'متقدم', 'قيادة علمية'],
        requirements: [
            'إتقان أصول العقيدة والفقه والسلوك',
            'اجتياز اختبار توثيق الأدلة من القرآن والسنة',
            'التزام ميثاق النزاهة ومنع الفساد العلمي'
        ],
        renewalPeriodMonths: 12
    },

    digitalLicense: {
        name: 'الرخصة الرقمية الشيخية',
        usage: 'ترخيص نشر المحتوى الديني الموثق عبر المنصات التقنية',
        controls: [
            'ربط كل منشور بدليل شرعي موثق',
            'توثيق هوية الناشر وسجل المراجعات',
            'إيقاف تلقائي للمحتوى غير الموثق حتى المراجعة'
        ]
    },

    antiCorruption: {
        focus: ['فساد عقدي', 'فساد أخلاقي', 'فساد معلوماتي', 'فساد مالي ومعاملاتي'],
        gapAnalysis: [
            'كشف الشبهات المتداولة وتحليل جذورها',
            'تحديد الفجوات التعليمية والدعوية',
            'ربط كل فجوة بخطة علاج زمنية واضحة'
        ],
        closureMethods: [
            'تصحيح علمي موثق',
            'تحديث المحتوى والردود بصورة دورية',
            'متابعة أثر التصحيح بمؤشرات قابلة للقياس'
        ]
    },

    aiGovernance: {
        objective: 'استخدام الذكاء الاصطناعي لجمع المعرفة وتدقيقها وفهرستها وخدمة نشر الدين',
        pipeline: [
            'جمع البيانات من مصادر موثوقة',
            'تحقق آلي أولي مع كشف التعارض',
            'مراجعة بشرية شرعية قبل الاعتماد النهائي',
            'فهرسة ورقمنة وإسناد لكل معلومة',
            'تغذية راجعة مستمرة لتحسين النموذج'
        ],
        rule: 'أي مخرجات دينية من الذكاء الاصطناعي لا تعتمد نهائيًا إلا بالمراجعة الشرعية'
    },

    channels: [
        'المنصات التعليمية الرقمية',
        'واجهات API الشرعية',
        'الهواتف الذكية والتطبيقات',
        'المنصات المرئية والصوتية',
        'مراكز التعليم والمساجد',
        'المحتوى متعدد اللغات'
    ],

    centuryCycle: {
        hadith: 'إن الله يبعث لهذه الأمة على رأس كل مائة سنة من يجدد لها دينها',
        stages: [
            'مرحلة التأصيل: جمع المصادر وتحقيقها',
            'مرحلة البناء: تحويل العلم إلى مناهج ومنصات',
            'مرحلة الانتشار: نشر عالمي متعدد الوسائط',
            'مرحلة المراجعة: قياس الانحرافات والتصحيح',
            'مرحلة التجديد التالي: إعداد القرن القادم'
        ]
    }
};

const SHEIKHA_LANGUAGE = {
    name: 'لغة شيخة للحوار الإنساني',
    mission: 'محاورة البشرية بالحكمة والعدل والرحمة وبيان الحق من الكتاب والسنة بلا ظلم ولا عدوان',
    foundations: [
        'ادع إلى سبيل ربك بالحكمة والموعظة الحسنة',
        'ولا تجادلوا أهل الكتاب إلا بالتي هي أحسن',
        'العدل مع الموافق والمخالف',
        'لا سب ولا ظلم ولا افتراء',
        'بيان الحق بالدليل لا بالصوت المرتفع',
        'الرحمة بالخلق مع الثبات على أصول الإسلام'
    ],
    ethics: [
        'صدق النقل',
        'حسن الاستماع',
        'تحرير محل النزاع',
        'عدم التعميم الجائر على الأفراد',
        'التفريق بين الفكرة وصاحبها',
        'الدعوة بالحكمة والصبر',
        'رد الشبهة بعلم وعدل'
    ],
    audiences: [
        {
            group: 'المسلمون عمومًا',
            examples: ['أهل السنة والجماعة', 'أتباع المذاهب الفقهية الأربعة', 'عموم المسلمين'],
            approach: 'التعليم والتزكية والتذكير وجمع الكلمة على الأصول'
        },
        {
            group: 'المدارس والفرق داخل التاريخ الإسلامي',
            examples: ['مدارس كلامية', 'فرق تاريخية', 'اتجاهات مذهبية متعددة'],
            approach: 'الرد العلمي المؤصل وبيان مواضع الاتفاق والخلاف دون ظلم'
        },
        {
            group: 'أهل الكتاب',
            examples: ['اليهود', 'النصارى'],
            approach: 'حوار بالتي هي أحسن مع بيان التوحيد والنبوة وخاتمية الرسالة'
        },
        {
            group: 'أصحاب الديانات والفلسفات غير الإسلامية',
            examples: ['الهندوس', 'البوذيون', 'الملحدون', 'اللادينيون', 'أصحاب المعتقدات الشعبية'],
            approach: 'خطاب فطري عقلي أخلاقي يعرّف بالله ورسالة الإسلام'
        }
    ],
    goals: [
        'هداية الخلق إلى الحق بإذن الله',
        'بيان الإسلام كما جاء في الوحي',
        'إغلاق فجوات الشبهات',
        'تقوية الأخلاق الإنسانية وفق الشريعة',
        'نشر الرحمة والعدل ومنع الفساد'
    ],
    warnings: [
        'الهداية بيد الله وحده',
        'الذكاء الاصطناعي وسيلة خدمة لا مصدر وحي',
        'الأحكام على الطوائف والأعيان تحتاج علمًا وعدلًا ومرجعية شرعية'
    ]
};

app.get('/api/sheikha/governance', (req, res) => {
    res.json({
        success: true,
        data: SHEIKHA_ISLAMIC_GOVERNANCE,
        message: 'منظومة شيخة الإسلامية للحوكمة والتجديد متاحة',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/governance/principles', (req, res) => {
    res.json({
        success: true,
        data: {
            identity: SHEIKHA_ISLAMIC_GOVERNANCE.identity,
            principles: SHEIKHA_ISLAMIC_GOVERNANCE.principles,
            centuryCycle: SHEIKHA_ISLAMIC_GOVERNANCE.centuryCycle
        },
        message: 'مبادئ شيخة الإسلامية وقواعد التجديد كل 100 سنة',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/governance/certification', (req, res) => {
    res.json({
        success: true,
        data: SHEIKHA_ISLAMIC_GOVERNANCE.certification,
        message: 'نظام شهادة شيخة الإسلامية',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/governance/license', (req, res) => {
    res.json({
        success: true,
        data: SHEIKHA_ISLAMIC_GOVERNANCE.digitalLicense,
        message: 'الرخصة الرقمية الشيخية للنشر المنضبط',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/governance/anti-corruption', (req, res) => {
    res.json({
        success: true,
        data: {
            antiCorruption: SHEIKHA_ISLAMIC_GOVERNANCE.antiCorruption,
            aiGovernance: SHEIKHA_ISLAMIC_GOVERNANCE.aiGovernance
        },
        message: 'تحليل فجوات الشبهات وخطة الإغلاق الشرعي',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/governance/channels', (req, res) => {
    res.json({
        success: true,
        data: SHEIKHA_ISLAMIC_GOVERNANCE.channels,
        total: SHEIKHA_ISLAMIC_GOVERNANCE.channels.length,
        message: 'قنوات نشر التجديد الديني بالتقنيات المتاحة',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/governance/metrics', (req, res) => {
    const knowledge = load(DB.knowledge);
    const audits = load(DB.audits);
    const reports = load(DB.reports);
    const governanceNotes = audits.filter((item) => item.type === 'governance_note');
    const heartbeatCount = audits.filter((item) => item.type === 'background_heartbeat').length;

    res.json({
        success: true,
        data: {
            knowledgeEntries: knowledge.length,
            auditEntries: audits.length,
            reports: reports.length,
            governanceNotes: governanceNotes.length,
            heartbeatCount,
            quranAyat: ILM_REFERENCE.quranAyat.length,
            ahadith: ILM_REFERENCE.ahadith.length,
            dialogueAudiences: SHEIKHA_LANGUAGE.audiences.length,
            publicationChannels: SHEIKHA_ISLAMIC_GOVERNANCE.channels.length
        },
        message: 'مؤشرات الحوكمة والفجوات متاحة',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/language', (req, res) => {
    res.json({
        success: true,
        data: SHEIKHA_LANGUAGE,
        message: 'لغة شيخة للحوار الإنساني المؤصل',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/language/audiences', (req, res) => {
    res.json({
        success: true,
        data: SHEIKHA_LANGUAGE.audiences,
        total: SHEIKHA_LANGUAGE.audiences.length,
        message: 'الفئات الحوارية ومسارات الخطاب',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/language/ethics', (req, res) => {
    res.json({
        success: true,
        data: {
            foundations: SHEIKHA_LANGUAGE.foundations,
            ethics: SHEIKHA_LANGUAGE.ethics,
            goals: SHEIKHA_LANGUAGE.goals,
            warnings: SHEIKHA_LANGUAGE.warnings
        },
        message: 'أخلاق الحوار في لغة شيخة',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/license/audits', auth, requireSheikhaLicense(['license:audit']), (req, res) => {
    const audits = load(DB.audits).filter((a) => String(a.type || '').startsWith('license_'));
    res.json({
        success: true,
        data: audits,
        total: audits.length,
        message: 'سجل تدقيق التراخيص المشفّرة',
        timestamp: nowIso()
    });
});

app.post('/api/sheikha/governance/notes', auth, requireSheikhaLicense(['governance:notes']), (req, res) => {
    const note = String(req.body?.note || '').trim();
    const category = String(req.body?.category || 'general').trim();
    if (!note || note.length < 10) {
        return res.status(400).json({
            success: false,
            message: 'يرجى إدخال ملاحظة مفيدة لا تقل عن 10 أحرف',
            timestamp: nowIso()
        });
    }

    const audits = load(DB.audits);
    const record = {
        id: Date.now(),
        type: 'governance_note',
        actor: req.user?.username || 'unknown',
        category,
        note,
        time: nowIso()
    };
    audits.push(record);
    save(DB.audits, audits.length > 1000 ? audits.slice(-1000) : audits);

    return res.json({
        success: true,
        data: record,
        message: 'تم تدوين الملاحظة ضمن سجل حوكمة شيخة',
        timestamp: nowIso()
    });
});

app.get('/governance', (req, res) => {
        res.send(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>حوكمة شيخة الإسلامية</title>
    <style>
        body{font-family:'Tajawal',Arial,sans-serif;background:radial-gradient(circle at top,#1b1300,#0d0d0d 45%);color:#f3f0e8;margin:0;padding:18px}
        .hero,.panel{max-width:1100px;margin:0 auto 18px;background:rgba(20,20,20,.88);border:1px solid #2f2a20;border-radius:18px;padding:22px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
        .hero{border-color:#d4af37}
        h1{margin:0 0 10px;color:#d4af37;font-size:1.8rem}
        h2{margin:0 0 12px;color:#c98d3a;font-size:1.05rem}
        .sub{color:#d8c7a0;line-height:1.8}
        .stats,.grid{display:grid;gap:12px}
        .stats{grid-template-columns:repeat(auto-fit,minmax(140px,1fr));margin-top:16px}
        .grid{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
        .stat,.card{background:#131313;border:1px solid #2b2b2b;border-radius:14px;padding:16px}
        .num{font-size:1.7rem;color:#6fcf97;font-weight:bold}
        .lbl{color:#aaa;font-size:.8rem;margin-top:4px}
        .card-title{color:#d4af37;font-weight:bold;margin-bottom:10px}
        ul{margin:0;padding-right:18px}
        li{margin:8px 0;line-height:1.7;color:#ddd}
        .muted{color:#9f9f9f;font-size:.9rem}
        .nav{max-width:1100px;margin:0 auto 16px;display:flex;gap:8px;flex-wrap:wrap}
        .nav a{color:#d4af37;text-decoration:none;background:#131313;border:1px solid #333;border-radius:10px;padding:8px 12px}
        .nav a:hover{border-color:#d4af37}
        @media (max-width:640px){h1{font-size:1.4rem}}
    </style>
</head>
<body>
    <div class="hero">
        <h1>منظومة شيخة الإسلامية للحكم الرشيد والتجديد</h1>
        <div class="sub">لوحة حية لمبادئ شيخة، الشهادة، الرخصة الرقمية، لغة الحوار، ومؤشرات الفجوات والتجديد المستمر كل 100 سنة هجرية.</div>
        <div class="stats" id="stats"></div>
    </div>

    <div class="nav">
        <a href="/api/sheikha/governance">حوكمة JSON</a>
        <a href="/api/sheikha/governance/metrics">مؤشرات JSON</a>
        <a href="/api/sheikha/language">لغة شيخة JSON</a>
        <a href="/tajdid">التجديد</a>
        <a href="/ilm">مرجع العلم</a>
    </div>

    <div class="panel">
        <h2>الأصول والمسارات</h2>
        <div class="grid" id="grid"></div>
    </div>

    <script>
        async function loadJson(url){
            const response = await fetch(url);
            if(!response.ok) throw new Error('fetch failed');
            return response.json();
        }
        function card(title, items){
            const list = items.map(function(item){ return '<li>' + item + '</li>'; }).join('');
            return '<div class="card"><div class="card-title">' + title + '</div><ul>' + list + '</ul></div>';
        }
        async function boot(){
            const [metrics, governance, language] = await Promise.all([
                loadJson('/api/sheikha/governance/metrics'),
                loadJson('/api/sheikha/governance'),
                loadJson('/api/sheikha/language')
            ]);

            const stats = [
                ['المعرفة', metrics.data.knowledgeEntries],
                ['التقارير', metrics.data.reports],
                ['الملاحظات', metrics.data.governanceNotes],
                ['الآيات', metrics.data.quranAyat],
                ['الأحاديث', metrics.data.ahadith],
                ['القنوات', metrics.data.publicationChannels],
                ['الفئات الحوارية', metrics.data.dialogueAudiences]
            ];
            document.getElementById('stats').innerHTML = stats.map(function(pair){
                const label = pair[0];
                const value = pair[1];
                return '<div class="stat"><div class="num">' + value + '</div><div class="lbl">' + label + '</div></div>';
            }).join('');

            document.getElementById('grid').innerHTML = [
                card('مبادئ شيخة', governance.data.principles),
                card('الشهادة', governance.data.certification.requirements),
                card('الرخصة الرقمية', governance.data.digitalLicense.controls),
                card('فجوات الفساد والشبهات', governance.data.antiCorruption.gapAnalysis),
                card('إغلاق الفجوات', governance.data.antiCorruption.closureMethods),
                card('قنوات النشر', governance.data.channels),
                card('لغة شيخة: الأسس', language.data.foundations),
                card('لغة شيخة: أخلاق الحوار', language.data.ethics),
                card('لغة شيخة: الغايات', language.data.goals),
                card('التنبيهات', language.data.warnings),
                card('دورة التجديد', governance.data.centuryCycle.stages),
                card('الفئات الحوارية', language.data.audiences.map(function(item){ return item.group + ': ' + item.approach; }))
            ].join('');
        }
        boot().catch(() => {
            document.getElementById('grid').innerHTML = '<div class="card"><div class="card-title">تعذر تحميل البيانات</div><div class="muted">تحقق من تشغيل الخدمة ثم أعد التحديث.</div></div>';
        });
    </script>
</body>
</html>`);
});

// ═══════════════════════════════════════════════════════════════
// الرقمنة الشاملة للتراث والعلوم الإسلامية
// ═══════════════════════════════════════════════════════════════
const ISLAMIC_DIGITIZATION_FRAMEWORK = {
    declaration: 'رقمنة العلم الإسلامي وتوثيقه وفهرسته لخدمة البشرية بلا ضرر',
    strategicGoal: 'هدف شيخة المرحلي: تغطية موسعة ومنهجية للتراث الإسلامي والموسوعات العلمية وربطها بالتطبيقات الواقعية مع تحسين مستمر.',
    scope: [
        'كتب التفسير والحديث والفقه والأصول والعقيدة والسيرة',
        'أعمال العلماء المسلمين عبر العصور',
        'تطبيقات العلوم الإسلامية في الواقع والمنتجات',
        'فهرسة الحديث والرواة والتابعين وطبقات النقل العلمي',
        'بطاقات تعريف لكل كتاب ومعلومة وباب ومجموعة موضوعية مشتركة'
    ],
    timeline: [
        'منذ خلق الله الإنسان: دعوة الأنبياء إلى توحيد الله والاستسلام له',
        'من عهد الأنبياء قبل محمد ﷺ إلى بعثة النبي ﷺ',
        'من عهد الرسالة والخلفاء الراشدين إلى اليوم'
    ],
    rule: 'أي مادة تدخل للنظام يجب أن تحتوي على توثيق، تصنيف، وتطبيق عملي أو أثر حضاري إن وجد',
    note: 'الأنبياء جميعًا دعوا إلى الإسلام بمعناه العام: الاستسلام لله وحده',
    gapAnalysis: [
        'الفجوة 1: ضخامة التراث مقارنة بسرعة الإدخال اليدوي',
        'الفجوة 2: تفاوت جودة الفهرسة بين المصادر',
        'الفجوة 3: ضعف الربط بين النصوص وتطبيقاتها الدنيوية',
        'الفجوة 4: قلة الاستيراد الآلي المنظم من مصادر متعددة'
    ],
    executionPlan: [
        'المرحلة 1: استيراد دفعات ضخمة مع تحقق حقول إلزامية',
        'المرحلة 2: تصنيف هرمي (كتاب ← باب ← فصل ← مسألة ← دليل ← تطبيق)',
        'المرحلة 3: بناء بطاقة تعريف علمية لكل أصل وكل معلومة',
        'المرحلة 4: مراجعة علمية بشرية + تحسين آلي للفهرسة',
        'المرحلة 5: نشر لوحات قياس وفجوات وتحديث دوري'
    ]
};

function normalizeText(value) {
    return String(value || '').trim();
}

function buildLibraryIndex(item) {
    const hierarchy = item.hierarchy || {};
    const card = item.infoCard || {};
    const authorProfile = item.authorProfile || {};
    const trace = item.scientificTrace || {};
    const scripturalBasis = item.scripturalBasis || {};
    const method = item.methodology || {};
    return [
        item.title,
        item.author,
        item.field,
        item.era,
        item.summary,
        item.evidence,
        item.worldlyUses,
        item.products,
        item.tags,
        hierarchy.book,
        hierarchy.chapter,
        hierarchy.section,
        hierarchy.issue,
        hierarchy.evidenceNode,
        hierarchy.application,
        card.collection,
        card.location,
        card.language,
        card.country,
        card.city,
        card.writingReason,
        authorProfile.biography,
        authorProfile.learnedFrom,
        authorProfile.students,
        trace.cause,
        trace.impact,
        trace.beneficiaries,
        trace.countries,
        trace.erasApplied,
        scripturalBasis.quran,
        scripturalBasis.sunnah,
        scripturalBasis.athar,
        scripturalBasis.usulRules,
        scripturalBasis.revelation?.sababNuzul,
        scripturalBasis.revelation?.revelationTime,
        scripturalBasis.revelation?.makkiMadani,
        scripturalBasis.revelation?.surahName,
        scripturalBasis.revelation?.ayahRange,
        // المنهجية العلمية
        method.firstTools,
        method.sciencesUsed,
        method.secondTools,
        method.researchCauses,
        method.intellectualJourney,
        method.learnedFrom,
        method.whatObserved,
        method.whereResearched,
        method.howInterpreted,
        method.meansUsed,
        method.purposeGoals
    ].join(' | ');
}

function parseCsvLine(line) {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                cur += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            out.push(cur);
            cur = '';
        } else {
            cur += ch;
        }
    }
    out.push(cur);
    return out.map((x) => x.trim());
}

function parseCsvRecords(csvText) {
    const lines = String(csvText || '').split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return [];
    const headers = parseCsvLine(lines[0]);
    const records = [];
    for (let i = 1; i < lines.length; i += 1) {
        const cols = parseCsvLine(lines[i]);
        const row = {};
        for (let j = 0; j < headers.length; j += 1) {
            row[headers[j]] = cols[j] || '';
        }
        records.push(row);
    }
    return records;
}

function toArray(value) {
    if (Array.isArray(value)) return value.map((x) => normalizeText(x)).filter(Boolean);
    if (typeof value === 'string') {
        return value.split('|').map((x) => normalizeText(x)).filter(Boolean);
    }
    return [];
}

function ensureAtLeastOne(value, fallbackLabel) {
    const list = toArray(value);
    return list.length > 0 ? list : [fallbackLabel];
}

function createLibraryRecord(input, actor) {
    const title = normalizeText(input?.title);
    const author = normalizeText(input?.author);
    const field = normalizeText(input?.field);
    const era = normalizeText(input?.era || 'غير محدد');
    const summary = normalizeText(input?.summary);
    const evidence = normalizeText(input?.evidence || '');
    const worldlyUses = toArray(input?.worldlyUses);
    const products = toArray(input?.products);
    const tags = toArray(input?.tags);
    const sharedTopics = toArray(input?.sharedTopics);
    const learnedFrom = toArray(input?.learnedFrom);
    const students = toArray(input?.students);
    const beneficiaries = toArray(input?.beneficiaries);
    const countries = toArray(input?.countries);
    const erasApplied = toArray(input?.erasApplied);
    const narrators = toArray(input?.narrators);
    const tabiinLinks = toArray(input?.tabiinLinks);
    const quranBasis = toArray(input?.quranBasis || input?.quran || input?.scripturalQuran);
    const sunnahBasis = toArray(input?.sunnahBasis || input?.sunnah || input?.scripturalSunnah);
    const atharBasis = toArray(input?.atharBasis || input?.athar || input?.scripturalAthar);
    const usulRules = toArray(input?.usulRules || input?.usulRule || input?.scripturalUsul);

    const hierarchyInput = input?.hierarchy || {};
    const hierarchy = {
        book: normalizeText(hierarchyInput.book || title),
        chapter: normalizeText(hierarchyInput.chapter || input?.chapter || ''),
        section: normalizeText(hierarchyInput.section || input?.section || ''),
        issue: normalizeText(hierarchyInput.issue || input?.issue || ''),
        evidenceNode: normalizeText(hierarchyInput.evidenceNode || input?.evidenceNode || evidence),
        application: normalizeText(hierarchyInput.application || input?.application || '')
    };

    const infoCard = {
        collection: normalizeText(input?.collection || input?.collectionName || ''),
        location: normalizeText(input?.location || input?.sourceLocation || ''),
        language: normalizeText(input?.language || 'العربية'),
        country: normalizeText(input?.country || ''),
        city: normalizeText(input?.city || ''),
        yearHijri: normalizeText(input?.yearHijri || ''),
        yearGregorian: normalizeText(input?.yearGregorian || ''),
        writingReason: normalizeText(input?.writingReason || ''),
        writingContext: normalizeText(input?.writingContext || ''),
        targetAudience: normalizeText(input?.targetAudience || ''),
        subjectGroup: normalizeText(input?.subjectGroup || field)
    };

    const authorProfile = {
        biography: normalizeText(input?.authorBio || input?.biography || ''),
        origin: normalizeText(input?.authorOrigin || ''),
        birthYearHijri: normalizeText(input?.birthYearHijri || ''),
        deathYearHijri: normalizeText(input?.deathYearHijri || ''),
        learnedFrom,
        students
    };

    const hadithIndex = {
        narrators,
        tabiinLinks,
        sourceBooks: toArray(input?.sourceBooks),
        grade: normalizeText(input?.grade || ''),
        chainNotes: normalizeText(input?.chainNotes || '')
    };

    const scientificTrace = {
        cause: normalizeText(input?.causeOfScience || input?.scienceCause || ''),
        impact: normalizeText(input?.impact || ''),
        beneficiaries,
        countries,
        erasApplied,
        appliedIn: toArray(input?.appliedIn),
        productsExtended: toArray(input?.productsExtended),
        valueType: normalizeText(input?.valueType || ''),
        benefitScope: normalizeText(input?.benefitScope || '')
    };

    const scripturalBasis = {
        quran: quranBasis,
        sunnah: sunnahBasis,
        athar: atharBasis,
        principle: normalizeText(input?.scripturalPrinciple || ''),
        usulRules,
        revelation: {
            sababNuzul: normalizeText(input?.sababNuzul || input?.revelationCause || ''),
            revelationTime: normalizeText(input?.revelationTime || input?.whenRevealed || ''),
            makkiMadani: normalizeText(input?.makkiMadani || input?.revelationType || ''),
            surahName: normalizeText(input?.surahName || ''),
            ayahRange: normalizeText(input?.ayahRange || '')
        }
    };

    // ── المنهجية العلمية الكاملة ──────────────────────────────────────
    // تُوثِّق رحلة الوصول إلى المعرفة: الأدوات، العلوم، الأسباب، المسيرة الفكرية
    const methodology = {
        // أولًا: الأدوات المستخدمة في المرحلة الأولى (قلم، مخطوط، ميزان، مرصد…)
        firstTools: toArray(input?.firstTools || input?.methodFirstTools),
        // ثانيًا: العلوم التي اعتمد عليها (رياضيات، فقه، طب، فلك، لغة…)
        sciencesUsed: toArray(input?.sciencesUsed || input?.scienceDisciplines),
        // ثالثًا: الأدوات في المرحلة الثانية (تجريب، ملاحظة منهجية، مقارنة…)
        secondTools: toArray(input?.secondTools || input?.methodSecondTools),
        // رابعًا: سبب البحث والتأليف (حرب، فقر، مرض، طلب حاكم، فراغ علمي…)
        researchCauses: toArray(input?.researchCauses || input?.reasonForWriting),
        // مسيرة الفكر: كيف وصل لهذا الفكر وما الذي دفعه
        intellectualJourney: normalizeText(input?.intellectualJourney || input?.thoughtJourney || ''),
        // من تعلم منهم بشكل مباشر (شيخ، كتاب أسسي، سفر علمي…)
        learnedFrom: toArray(input?.methodLearnedFrom || input?.learnedFrom),
        // ماذا رأى ولاحظ (ظاهرة، مشكلة، فجوة علمية، حاجة مجتمعية…)
        whatObserved: normalizeText(input?.whatObserved || input?.observations || ''),
        // أين بحث (مكتبات، رحلات، مراصد، مستشفيات، أسواق، ميادين حرب…)
        whereResearched: toArray(input?.whereResearched || input?.researchLocations),
        // كيف فسّر (استقراء، قياس، استنباط، تجريب، مقارنة نصوص…)
        howInterpreted: normalizeText(input?.howInterpreted || input?.interpretationMethod || ''),
        // جميع الوسائل المستخدمة (مخطوطات، لقاءات، رحلات، تجارب…)
        meansUsed: toArray(input?.meansUsed || input?.allMeans),
        // الغايات والأهداف (حفظ العلم، إصلاح، نشر، رد شبهة، تشريع…)
        purposeGoals: toArray(input?.purposeGoals || input?.goals)
    };

    if (!title || !author || !field || !summary) {
        return { valid: false, error: 'title و author و field و summary مطلوبة للتسجيل' };
    }

    if (quranBasis.length === 0 || sunnahBasis.length === 0 || usulRules.length === 0) {
        return {
            valid: false,
            error: 'سياسة التأصيل الإلزامي: يلزم آية واحدة وحديث واحد وقاعدة أصولية واحدة على الأقل قبل الحفظ'
        };
    }

    const record = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        type: 'islamic_knowledge_asset',
        sourceType: normalizeText(input?.sourceType || 'manual'),
        title,
        author,
        field,
        era,
        summary,
        evidence,
        worldlyUses,
        products,
        tags,
        sharedTopics,
        hierarchy,
        infoCard,
        authorProfile,
        hadithIndex,
        scientificTrace,
        scripturalBasis,
        methodology,
        indexText: '',
        createdAt: nowIso(),
        createdBy: actor || 'unknown'
    };
    record.indexText = buildLibraryIndex(record);
    return { valid: true, record };
}

function seedFoundationLibrary() {
    const items = load(DB.islamicLibrary);
    if (items.some((item) => item.sourceType === 'foundation_seed')) {
        return { inserted: 0, skipped: true };
    }

    const seeds = [
        {
            title: 'القرآن الكريم',
            author: 'وحي من الله سبحانه وتعالى',
            field: 'الوحي وأصل العلوم',
            era: 'عهد النبوة',
            summary: 'أصل الدين ومصدر الهداية والتشريع والعلم النافع',
            evidence: '﴿اقرأ باسم ربك الذي خلق﴾، ﴿رب زدني علمًا﴾',
            worldlyUses: ['التعليم', 'القضاء', 'الأخلاق', 'العبادة', 'اللغة'],
            products: ['التفسير', 'علوم القرآن', 'التعليم الشرعي'],
            tags: ['قرآن', 'وحي', 'هداية'],
            sharedTopics: ['أصل العلوم', 'الهداية', 'التشريع'],
            collection: 'مكتبة الوحي',
            location: 'الوحي المنزل',
            language: 'العربية',
            country: 'جزيرة العرب',
            city: 'مكة والمدينة',
            targetAudience: 'البشرية',
            subjectGroup: 'الوحي والأصول',
            authorBio: 'كلام الله المنزل على محمد ﷺ',
            causeOfScience: 'هداية الخلق وإقامة الدين',
            impact: 'تأسيس الأمة وبناء علومها',
            beneficiaries: ['الأمة الإسلامية', 'البشرية'],
            countries: ['العالم الإسلامي'],
            erasApplied: ['من البعثة إلى اليوم'],
            appliedIn: ['التشريع', 'التربية', 'الدعوة'],
            valueType: 'أصل قطعي',
            benefitScope: 'عام',
            quranBasis: ['﴿اقرأ باسم ربك الذي خلق﴾', '﴿رب زدني علمًا﴾'],
            sunnahBasis: ['خيركم من تعلم القرآن وعلّمه'],
            atharBasis: ['جمع أبي بكر وعثمان للمصحف'],
            scripturalPrinciple: 'القرآن أصل الأصول',
            sourceType: 'foundation_seed',
            chapter: 'الوحي',
            section: 'أصل العلم',
            issue: 'مرجعية القرآن',
            application: 'التأسيس التشريعي'
        },
        {
            title: 'صحيح البخاري',
            author: 'الإمام البخاري',
            field: 'الحديث',
            era: 'القرن الثالث الهجري',
            summary: 'أصح كتاب في الحديث بعد كتاب الله',
            evidence: 'تلقي الأمة له بالقبول',
            worldlyUses: ['توثيق السنة', 'بناء الأحكام', 'التعليم الحديثي'],
            products: ['شروح الحديث', 'مناهج التخريج'],
            tags: ['حديث', 'بخاري', 'سنة'],
            sharedTopics: ['التوثيق', 'الرواية', 'السنة'],
            collection: 'الكتب الستة',
            location: 'التراث الحديثي',
            language: 'العربية',
            country: 'خراسان',
            city: 'بخارى',
            targetAudience: 'العلماء وطلبة الحديث',
            subjectGroup: 'الحديث وعلومه',
            authorBio: 'محمد بن إسماعيل البخاري إمام أهل الحديث',
            learnedFrom: ['الإمام أحمد', 'علي بن المديني', 'إسحاق بن راهويه'],
            causeOfScience: 'خدمة سنة النبي ﷺ بانتقاء الصحيح',
            impact: 'حفظ السنة وبناء مرجعية حديثية عالمية',
            beneficiaries: ['المحدثون', 'الفقهاء', 'طلبة العلم'],
            countries: ['العالم الإسلامي'],
            erasApplied: ['من القرن الثالث إلى اليوم'],
            appliedIn: ['الفقه', 'التعليم', 'الوعظ'],
            quranBasis: ['﴿وما آتاكم الرسول فخذوه﴾'],
            sunnahBasis: ['نضّر الله امرأ سمع منا حديثًا فبلغه'],
            atharBasis: ['رحلة الأئمة في طلب الحديث'],
            scripturalPrinciple: 'حفظ السنة من حفظ الدين',
            sourceType: 'foundation_seed',
            chapter: 'بدء الوحي',
            section: 'صحيح الرواية',
            issue: 'حفظ السنة',
            application: 'منهج الرواية والتوثيق'
        },
        {
            title: 'الموطأ',
            author: 'الإمام مالك',
            field: 'الحديث والفقه',
            era: 'القرن الثاني الهجري',
            summary: 'جمع بين الحديث وفقه أهل المدينة',
            evidence: 'اعتماد العلماء له وطلبهم له',
            worldlyUses: ['فقه المعاملات', 'التعليم', 'بناء المدارس الفقهية'],
            products: ['المذهب المالكي', 'المناهج الفقهية'],
            tags: ['مالك', 'موطأ', 'فقه'],
            sharedTopics: ['أهل المدينة', 'الحديث', 'الفقه'],
            collection: 'مكتبة الحديث والفقه',
            location: 'المدينة المنورة',
            language: 'العربية',
            country: 'الحجاز',
            city: 'المدينة',
            targetAudience: 'الفقهاء وطلاب الحديث',
            subjectGroup: 'الحديث وعلومه',
            authorBio: 'إمام دار الهجرة ومؤسس المذهب المالكي',
            learnedFrom: ['نافع مولى ابن عمر', 'الزهري'],
            causeOfScience: 'جمع حديث أهل المدينة وفقههم',
            impact: 'تكوين مدرسة علمية فقهية حديثية',
            beneficiaries: ['القضاة', 'الفقهاء', 'طلاب العلم'],
            countries: ['الحجاز', 'المغرب', 'الأندلس'],
            erasApplied: ['من القرن الثاني إلى اليوم'],
            appliedIn: ['القضاء', 'التعليم', 'الفتوى'],
            quranBasis: ['﴿فاسألوا أهل الذكر إن كنتم لا تعلمون﴾'],
            sunnahBasis: ['طلب العلم فريضة على كل مسلم'],
            atharBasis: ['عمل أهل المدينة'],
            scripturalPrinciple: 'ربط النص بالعمل',
            sourceType: 'foundation_seed',
            chapter: 'الطهارة',
            section: 'المياه',
            issue: 'فقه الطهارة',
            application: 'تعليم الأحكام'
        }
    ];

    const inserted = [];
    for (const seed of seeds) {
        const built = createLibraryRecord(seed, 'system');
        if (built.valid) {
            items.push(built.record);
            inserted.push(built.record.title);
        }
    }
    save(DB.islamicLibrary, items);
    return { inserted: inserted.length, skipped: false, titles: inserted };
}

app.get('/api/sheikha/library/framework', (req, res) => {
    res.json({
        success: true,
        data: ISLAMIC_DIGITIZATION_FRAMEWORK,
        message: 'إطار رقمنة العلوم الإسلامية وفهرستها',
        timestamp: nowIso()
    });
});

app.post('/api/sheikha/library/seed-foundations', auth, requireSheikhaLicense(['knowledge:write']), (req, res) => {
    const seeded = seedFoundationLibrary();
    appendAudit({
        type: 'library_seed_foundations',
        actor: req.user?.username || 'unknown',
        inserted: seeded.inserted,
        skipped: seeded.skipped
    });

    res.json({
        success: true,
        data: seeded,
        message: seeded.skipped ? 'بذور الموسوعة موجودة مسبقًا' : 'تمت إضافة بذور الموسوعة المؤسسة بالكتاب والسنة',
        timestamp: nowIso()
    });
});

// ═══════════════════════════════════════════════════════════════
// تعبئة الموسوعات الكبرى — 7 أقسام: تفسير، حديث، فقه، أصول، عقيدة، سيرة، لغة
// ═══════════════════════════════════════════════════════════════
function seedEncyclopedias() {
    const items = load(DB.islamicLibrary);
    const existing = new Set(items.map((x) => x.title));

    const encyclopedias = [
        // ──────── التفسير ────────
        {
            title: 'جامع البيان عن تأويل آي القرآن',
            author: 'ابن جرير الطبري',
            field: 'التفسير',
            era: 'القرن الثالث الهجري',
            summary: 'أجمع تفاسير الصدر الأول، يجمع الروايات وأسانيدها ثم يرجّح',
            sourceType: 'encyclopedia_seed',
            chapter: 'تفسير سورة الفاتحة',
            section: 'المعنى الإجمالي',
            subjectGroup: 'التفسير',
            country: 'العراق',
            city: 'بغداد',
            yearHijri: '310',
            authorBio: 'إمام المفسرين، مؤرخ وفقيه',
            birthYearHijri: '224',
            deathYearHijri: '310',
            learnedFrom: ['سفيان بن عيينة', 'إسماعيل بن إبراهيم'],
            causeOfScience: 'جمع تراث التفسير قبل اندثاره',
            impact: 'أسّس لمنهج التفسير بالمأثور',
            beneficiaries: ['المفسرون', 'العلماء', 'القضاة'],
            countries: ['العراق', 'الشام', 'مصر'],
            erasApplied: ['القرن الثالث إلى اليوم'],
            quranBasis: ['﴿إنا نحن نزلنا الذكر وإنا له لحافظون﴾'],
            sunnahBasis: ['خيركم من تعلم القرآن وعلمه'],
            firstTools: ['المخطوطات', 'الأسانيد والروايات'],
            sciencesUsed: ['علم الحديث', 'اللغة', 'الفقه'],
            secondTools: ['الترجيح بين الروايات', 'القراءات'],
            researchCauses: ['خشية ضياع علم التفسير'],
            intellectualJourney: 'سافر من طبرستان إلى العراق ومصر طلبًا للعلم',
            whatObserved: 'تشتت الروايات التفسيرية وتضاربها',
            whereResearched: ['بغداد', 'الريّ', 'البصرة', 'الكوفة', 'مصر'],
            howInterpreted: 'استقراء الروايات ثم الترجيح بالسند واللغة',
            purposeGoals: ['جمع تراث التفسير', 'حفظ الأسانيد', 'إتاحة المرجع للعلماء']
        },
        {
            title: 'تفسير القرآن العظيم',
            author: 'ابن كثير',
            field: 'التفسير',
            era: 'القرن الثامن الهجري',
            summary: 'تفسير بالمأثور مع تحقيق الأحاديث والآثار والأسانيد',
            sourceType: 'encyclopedia_seed',
            chapter: 'تفسير سورة البقرة',
            subjectGroup: 'التفسير',
            country: 'الشام',
            city: 'دمشق',
            yearHijri: '774',
            authorBio: 'الحافظ الناقد تلميذ ابن تيمية',
            birthYearHijri: '701',
            deathYearHijri: '774',
            learnedFrom: ['ابن تيمية', 'المزي', 'ابن قيم الجوزية'],
            causeOfScience: 'تنقية التفسير من الإسرائيليات',
            impact: 'صار مرجعًا للتفسير بالمأثور عالميًا',
            beneficiaries: ['الدعاة', 'المعلمون', 'العامة'],
            countries: ['الشام', 'مصر', 'الجزيرة العربية'],
            quranBasis: ['﴿وننزل من القرآن ما هو شفاء ورحمة للمؤمنين﴾'],
            firstTools: ['الأسانيد المسندة', 'روايات الصحابة'],
            sciencesUsed: ['التفسير', 'الحديث', 'التاريخ'],
            researchCauses: ['ضبط التفسير والتمييز بين الصحيح والموضوع'],
            howInterpreted: 'تفسير القرآن بالقرآن ثم بالسنة ثم بأقوال الصحابة والتابعين',
            purposeGoals: ['تنقية التراث التفسيري', 'هداية الناس']
        },
        // ──────── الحديث ────────
        {
            title: 'صحيح مسلم',
            author: 'الإمام مسلم بن الحجاج',
            field: 'الحديث',
            era: 'القرن الثالث الهجري',
            summary: 'ثاني الصحيحين في الأحاديث النبوية، مرتب بمنهج فقهي دقيق',
            sourceType: 'encyclopedia_seed',
            chapter: 'المقدمة في علم الحديث',
            subjectGroup: 'الحديث وعلومه',
            country: 'خراسان',
            city: 'نيسابور',
            yearHijri: '261',
            authorBio: 'الحافظ الإمام مسلم، من كبار أئمة الحديث',
            birthYearHijri: '204',
            deathYearHijri: '261',
            learnedFrom: ['يحيى بن يحيى النيسابوري', 'الإمام أحمد', 'البخاري'],
            causeOfScience: 'الغيرة على السنة وصون أحاديث النبي ﷺ من الوضع',
            impact: 'صار مرجعًا أساسيًا في الحديث للأمة',
            beneficiaries: ['الفقهاء', 'القضاة', 'الدعاة', 'المسلمون عامة'],
            countries: ['خراسان', 'العراق', 'الحجاز', 'مصر'],
            erasApplied: ['من القرن الثالث إلى اليوم'],
            quranBasis: ['﴿وما آتاكم الرسول فخذوه وما نهاكم عنه فانتهوا﴾'],
            sunnahBasis: ['بلّغوا عني ولو آية'],
            firstTools: ['الرحلة في طلب الحديث', 'المصافحة بالأسانيد'],
            sciencesUsed: ['علم الرجال', 'الجرح والتعديل', 'علل الحديث'],
            researchCauses: ['حفظ السنة النبوية من التحريف والوضع'],
            whereResearched: ['نيسابور', 'الحجاز', 'العراق', 'الشام', 'مصر'],
            howInterpreted: 'نقد الأسانيد واشتراط الاتصال والعدالة والضبط',
            purposeGoals: ['تصفية أحاديث النبي ﷺ', 'توثيق السنة']
        },
        {
            title: 'سنن أبي داود',
            author: 'أبو داود السجستاني',
            field: 'الحديث',
            era: 'القرن الثالث الهجري',
            summary: 'جمع الأحاديث الفقهية التشريعية مرتبة على أبواب الفقه',
            sourceType: 'encyclopedia_seed',
            subjectGroup: 'الحديث وعلومه',
            country: 'خراسان',
            yearHijri: '275',
            authorBio: 'إمام أهل الحديث في عصره',
            birthYearHijri: '202',
            deathYearHijri: '275',
            learnedFrom: ['أحمد بن حنبل', 'يحيى بن معين'],
            causeOfScience: 'ربط الأحاديث بالتطبيق الفقهي',
            impact: 'صار المرجع التشريعي الأول للأحكام',
            quranBasis: ['﴿أطيعوا الله وأطيعوا الرسول﴾'],
            firstTools: ['السماع من الشيوخ', 'التدوين المرتب'],
            sciencesUsed: ['الفقه', 'الحديث', 'أصول الفقه'],
            researchCauses: ['حاجة الفقهاء إلى أحاديث الأحكام مجمّعة'],
            howInterpreted: 'تبويب حسب أبواب الفقه مع التعليق على الحديث'
        },
        {
            title: 'سنن الترمذي (الجامع)',
            author: 'أبو عيسى الترمذي',
            field: 'الحديث',
            era: 'القرن الثالث الهجري',
            summary: 'جامع يضم الأحاديث مع ذكر اختلاف العلماء في الصحة والضعف',
            sourceType: 'encyclopedia_seed',
            subjectGroup: 'الحديث وعلومه',
            country: 'خراسان',
            yearHijri: '279',
            learnedFrom: ['البخاري', 'أبو داود'],
            causeOfScience: 'بيان مراتب الأحاديث ودرجاتها',
            impact: 'وضع نظام التصنيف: صحيح، حسن، ضعيف',
            quranBasis: ['﴿إن هو إلا وحي يوحى﴾'],
            firstTools: ['الجمع والتبويب'], sciencesUsed: ['الحديث', 'الفقه المقارن'],
            researchCauses: ['ضبط مراتب الحديث للفقهاء'],
            howInterpreted: 'تصنيف كل حديث مع ذكر الخلاف'
        },
        // ──────── الفقه ────────
        {
            title: 'المبسوط',
            author: 'السرخسي',
            field: 'الفقه',
            era: 'القرن الخامس الهجري',
            summary: 'موسوعة الفقه الحنفي الأكبر، 30 مجلدًا في أبواب الفقه جميعها',
            sourceType: 'encyclopedia_seed',
            chapter: 'الطهارة',
            subjectGroup: 'الفقه الإسلامي',
            country: 'ما وراء النهر',
            yearHijri: '483',
            authorBio: 'إمام الحنفية، ألّف المبسوط من حفظه في السجن',
            birthYearHijri: '430',
            deathYearHijri: '490',
            learnedFrom: ['محمد بن أحمد السرخسي الكبير', 'قاضي خان'],
            causeOfScience: 'تفصيل فقه الإمام محمد وأحكامه',
            impact: 'أكبر موسوعة فقهية في الفقه الحنفي',
            beneficiaries: ['القضاة', 'المفتون', 'طلاب الفقه'],
            countries: ['ما وراء النهر', 'العراق', 'الشام'],
            quranBasis: ['﴿وأن احكم بينهم بما أنزل الله﴾'],
            firstTools: ['كتب الإمام محمد الشيباني', 'الذاكرة الفقهية'],
            sciencesUsed: ['الفقه', 'الحديث', 'اللغة', 'القياس'],
            researchCauses: ['السجن أملاه من الذاكرة إحياءً للفقه'],
            whereResearched: ['داخل محبوسه من ذاكرته'],
            howInterpreted: 'استقراء المسائل وحلها بالقياس والتعليل',
            purposeGoals: ['حفظ الفقه الحنفي', 'إتاحته للقاضي والمقضي']
        },
        {
            title: 'المجموع شرح المهذب',
            author: 'الإمام النووي',
            field: 'الفقه',
            era: 'القرن السابع الهجري',
            summary: 'أعظم مراجع الفقه الشافعي، يجمع المذاهب ويناقشها ويحقق',
            sourceType: 'encyclopedia_seed',
            subjectGroup: 'الفقه الإسلامي',
            country: 'الشام',
            city: 'دمشق',
            yearHijri: '676',
            authorBio: 'شيخ الإسلام النووي، أتمّ 9 مجلدات ومات ولم يكمله',
            birthYearHijri: '631',
            deathYearHijri: '676',
            learnedFrom: ['أبو إسحاق الشيرازي', 'ابن كثير'],
            causeOfScience: 'شرح المهذب وتوسعته بالمقارنة المذهبية',
            impact: 'مرجع لا غنى عنه في الفقه الشافعي',
            quranBasis: ['﴿فاسألوا أهل الذكر إن كنتم لا تعلمون﴾'],
            firstTools: ['شرح المهذب', 'كتب المذاهب الأربعة'],
            sciencesUsed: ['الفقه المقارن', 'الحديث', 'القواعد الفقهية'],
            researchCauses: ['إكمال ما بدأه الشيخ أبو إسحاق'],
            howInterpreted: 'ذكر المذاهب والترجيح بالدليل'
        },
        {
            title: 'الأم',
            author: 'الإمام الشافعي',
            field: 'الفقه',
            era: 'القرن الثاني الهجري',
            summary: 'أساس المذهب الشافعي في جميع أبواب الفقه مع التعليل',
            sourceType: 'encyclopedia_seed',
            subjectGroup: 'الفقه الإسلامي',
            country: 'مصر',
            city: 'القاهرة',
            yearHijri: '204',
            learnedFrom: ['الإمام مالك', 'سفيان بن عيينة', 'الإمام أحمد'],
            causeOfScience: 'تأسيس المذهب الفقهي الجديد',
            impact: 'رسى قواعد الفقه التعليلي',
            quranBasis: ['﴿ولو ردوه إلى الرسول وإلى أولي الأمر منهم لعلمه الذين يستنبطونه منهم﴾'],
            firstTools: ['الحفظ والتنقل بين الشيوخ'],
            sciencesUsed: ['الفقه', 'الحديث', 'اللغة', 'أصول الفقه'],
            researchCauses: ['إصلاح الفقه على أساس الدليل النصي وليس الرأي'],
            intellectualJourney: 'تعلم في مكة والمدينة واليمن والعراق ثم استقر في مصر',
            howInterpreted: 'القرآن ثم السنة ثم الإجماع ثم القياس بالترتيب'
        },
        {
            title: 'المغني',
            author: 'ابن قدامة المقدسي',
            field: 'الفقه',
            era: 'القرن السادس الهجري',
            summary: 'موسوعة الفقه الحنبلي الكبرى مع المقارنة المذهبية',
            sourceType: 'encyclopedia_seed',
            subjectGroup: 'الفقه الإسلامي',
            country: 'الشام',
            city: 'دمشق',
            yearHijri: '620',
            learnedFrom: ['ابن المنّى', 'العلماء في دمشق وبغداد'],
            causeOfScience: 'شرح مختصر الخرقي وتوسيعه',
            impact: 'مرجع عالمي للفقه المقارن',
            quranBasis: ['﴿يا أيها الذين آمنوا أوفوا بالعقود﴾'],
            firstTools: ['مختصر الخرقي', 'كتب المذاهب'],
            sciencesUsed: ['الفقه المقارن', 'الحديث', 'اللغة'],
            researchCauses: ['حاجة الفقه إلى مرجع مقارن شامل'],
            howInterpreted: 'ذكر المسألة ثم الخلاف ثم الترجيح بالدليل'
        },
        // ──────── أصول الفقه ────────
        {
            title: 'الرسالة',
            author: 'الإمام الشافعي',
            field: 'أصول الفقه',
            era: 'القرن الثاني الهجري',
            summary: 'أول كتاب مستقل في أصول الفقه، أرسى قواعد الاستنباط',
            sourceType: 'encyclopedia_seed',
            subjectGroup: 'أصول الفقه',
            country: 'مصر',
            yearHijri: '204',
            learnedFrom: ['الإمام مالك', 'سفيان بن عيينة'],
            causeOfScience: 'ضبط طريقة الاستدلال على الأحكام الشرعية',
            impact: 'أسّس علم أصول الفقه كعلم مستقل',
            quranBasis: ['﴿ومن يتق الله يجعل له مخرجًا﴾'],
            firstTools: ['استقراء طرق الاستدلال في القرآن والسنة'],
            sciencesUsed: ['اللغة', 'الحديث', 'الفقه', 'المنطق التشريعي'],
            researchCauses: ['الرد على من يستدل بغير دليل'],
            howInterpreted: 'بناء نظرية الأصول من القرآن والسنة والإجماع والقياس',
            purposeGoals: ['ضبط الفتوى على أساس منهجي']
        },
        {
            title: 'الموافقات في أصول الشريعة',
            author: 'الشاطبي',
            field: 'أصول الفقه',
            era: 'القرن الثامن الهجري',
            summary: 'يُؤصّل لنظرية المقاصد الكلية للشريعة الإسلامية',
            sourceType: 'encyclopedia_seed',
            subjectGroup: 'أصول الفقه',
            country: 'الأندلس',
            city: 'غرناطة',
            yearHijri: '790',
            learnedFrom: ['علماء الأندلس', 'الشريف التلمساني'],
            causeOfScience: 'أزمة الفتاوى المتضاربة والبدع المنتشرة',
            impact: 'أسّس لعلم مقاصد الشريعة',
            quranBasis: ['﴿ما يريد الله ليجعل عليكم من حرج﴾'],
            firstTools: ['استقراء النصوص والأحكام', 'القرآن السنة'],
            sciencesUsed: ['أصول الفقه', 'الفقه', 'علم الكلام', 'المقاصد'],
            researchCauses: ['الإصلاح الديني في الأندلس وضبط الاجتهاد'],
            whatObserved: 'تضارب الفتاوى وانتشار البدع وضياع مقصود الشريعة',
            howInterpreted: 'بناء نظرية كلية للمقاصد: ضروريات، حاجيات، تحسينيات'
        },
        // ──────── العقيدة ────────
        {
            title: 'كتاب التوحيد',
            author: 'الشيخ محمد بن عبد الوهاب',
            field: 'العقيدة',
            era: 'القرن الثاني عشر الهجري',
            summary: 'تجديد عقيدة التوحيد والدعوة إلى خلوص العبادة لله',
            sourceType: 'encyclopedia_seed',
            subjectGroup: 'العقيدة والتوحيد',
            country: 'الجزيرة العربية',
            city: 'الدرعية',
            yearHijri: '1206',
            learnedFrom: ['والده', 'شيوخ المدينة والبصرة'],
            causeOfScience: 'انتشار الشرك وتعظيم القبور',
            impact: 'إحياء عقيدة التوحيد في الجزيرة العربية',
            quranBasis: ['﴿وما خلقت الجن والإنس إلا ليعبدون﴾', '﴿إن الله لا يغفر أن يشرك به﴾'],
            firstTools: ['الآيات القرآنية', 'الأحاديث والآثار'],
            sciencesUsed: ['التفسير', 'الحديث', 'العقيدة'],
            researchCauses: ['مواجهة الشرك والبدع المنتشرة'],
            whatObserved: 'الغلو في القبور وطلب الشفاعة من غير الله',
            howInterpreted: 'عرض الدليل القرآني ثم إبطال الشبهة'
        },
        {
            title: 'العقيدة الطحاوية',
            author: 'أبو جعفر الطحاوي',
            field: 'العقيدة',
            era: 'القرن الثالث الهجري',
            summary: 'متن موجز جامع لعقيدة أهل السنة والجماعة',
            sourceType: 'encyclopedia_seed',
            subjectGroup: 'العقيدة والتوحيد',
            country: 'مصر',
            yearHijri: '321',
            learnedFrom: ['أبو زرعة الدمشقي', 'محمد بن سماعة الحنفي'],
            causeOfScience: 'الرد على الفرق الكلامية وتوحيد عقيدة أهل السنة',
            impact: 'صار متن العقيدة الأشهر شرحًا ودراسةً',
            quranBasis: ['﴿قل هو الله أحد﴾'],
            firstTools: ['النصوص القرآنية والحديثية'],
            sciencesUsed: ['الكلام', 'الفقه', 'الحديث'],
            researchCauses: ['التفرق الكلامي وكثرة الفرق'],
            howInterpreted: 'إجمال المسائل العقدية بعيدًا عن التعقيد الكلامي'
        },
        // ──────── السيرة ────────
        {
            title: 'السيرة النبوية',
            author: 'ابن هشام',
            field: 'السيرة',
            era: 'القرن الثالث الهجري',
            summary: 'تهذيب سيرة ابن إسحاق وأجمع مصادر السيرة النبوية',
            sourceType: 'encyclopedia_seed',
            subjectGroup: 'السيرة النبوية',
            country: 'مصر',
            city: 'القاهرة',
            yearHijri: '218',
            learnedFrom: ['زياد البكائي — راوي سيرة ابن إسحاق'],
            causeOfScience: 'تهذيب سيرة ابن إسحاق من الإسرائيليات',
            impact: 'المرجع الأول للسيرة النبوية',
            beneficiaries: ['الدعاة', 'المؤرخون', 'المسلمون عامة'],
            quranBasis: ['﴿لقد كان لكم في رسول الله أسوة حسنة﴾'],
            firstTools: ['سيرة ابن إسحاق المكتوبة', 'الروايات'],
            sciencesUsed: ['التاريخ', 'الحديث', 'اللغة'],
            researchCauses: ['حفظ سيرة النبي ﷺ للأمة'],
            howInterpreted: 'التهذيب والتنقية مع الحفاظ على الرواية'
        },
        {
            title: 'زاد المعاد في هدي خير العباد',
            author: 'ابن قيم الجوزية',
            field: 'السيرة',
            era: 'القرن الثامن الهجري',
            summary: 'يجمع بين السيرة والفقه والطب النبوي والأخلاق',
            sourceType: 'encyclopedia_seed',
            subjectGroup: 'السيرة النبوية',
            country: 'الشام',
            city: 'دمشق',
            yearHijri: '751',
            learnedFrom: ['ابن تيمية'],
            causeOfScience: 'استخراج الفقه من السيرة والسنة العملية',
            impact: 'ربط السيرة بالفقه والطب والتزكية',
            quranBasis: ['﴿وإنك لعلى خلق عظيم﴾'],
            firstTools: ['السيرة', 'الحديث', 'كتب الطب'],
            sciencesUsed: ['السيرة', 'الفقه', 'الطب', 'الأخلاق'],
            researchCauses: ['الحاجة إلى هدي عملي من السيرة'],
            howInterpreted: 'استقراء هدي النبي ﷺ في كل شأن'
        },
        // ──────── اللغة والنحو ────────
        {
            title: 'الكتاب',
            author: 'سيبويه',
            field: 'النحو واللغة',
            era: 'القرن الثاني الهجري',
            summary: 'أول موسوعة نحوية عربية شاملة، أساس علم النحو لليوم',
            sourceType: 'encyclopedia_seed',
            subjectGroup: 'اللغة العربية والنحو',
            country: 'العراق',
            city: 'البصرة',
            yearHijri: '180',
            authorBio: 'إمام النحاة، قدم من فارس وتعلم على الخليل بن أحمد',
            birthYearHijri: '148',
            deathYearHijri: '180',
            learnedFrom: ['الخليل بن أحمد الفراهيدي', 'يونس بن حبيب'],
            causeOfScience: 'ضبط اللغة العربية في عصر اللحن والاختلاط',
            impact: 'أسّس قواعد النحو العربي التي لا تزال مرجعًا',
            beneficiaries: ['قارئو القرآن', 'الشعراء', 'العلماء', 'الدعاة'],
            countries: ['العراق', 'الجزيرة العربية', 'الشام', 'مصر'],
            quranBasis: ['﴿إنا أنزلناه قرآنًا عربيًا لعلكم تعقلون﴾'],
            firstTools: ['الاستقراء من كلام العرب والقرآن والشعر'],
            sciencesUsed: ['النحو', 'الصرف', 'اللغة', 'المنطق'],
            secondTools: ['القياس النحوي', 'الاستشهاد بالشعر'],
            researchCauses: ['انتشار اللحن بسبب الاختلاط بالأعاجم'],
            whatObserved: 'تدهور اللغة العربية الفصحى في البصرة',
            whereResearched: ['البصرة', 'اتصاله بالبدو في الصحراء'],
            howInterpreted: 'الاستقراء ثم القياس ثم التعليل',
            purposeGoals: ['حفظ لسان العرب', 'صون لغة القرآن الكريم']
        },
        {
            title: 'لسان العرب',
            author: 'ابن منظور',
            field: 'النحو واللغة',
            era: 'القرن السابع الهجري',
            summary: 'أجمع معجم للغة العربية، يضم أكثر من ثمانين ألف مادة',
            sourceType: 'encyclopedia_seed',
            subjectGroup: 'اللغة العربية والنحو',
            country: 'مصر',
            yearHijri: '711',
            learnedFrom: ['والده', 'شيوخ مصر'],
            causeOfScience: 'الخشية من ضياع اللغة العربية',
            impact: 'أكبر وأجمع معجم عربي إلى اليوم',
            quranBasis: ['﴿وكذلك أنزلناه حكمًا عربيًا﴾'],
            firstTools: ['استقراء المعاجم السابقة'],
            sciencesUsed: ['اللغة', 'الصرف', 'الشعر', 'التفسير'],
            researchCauses: ['شيخوخته ورغبته في تلخيص علم اللغة للأجيال'],
            howInterpreted: 'الجمع والترتيب الألفبائي مع الشواهد',
            purposeGoals: ['جمع اللغة العربية في مصدر واحد']
        },
        // ──────── الفلسفة والعلوم الطبيعية ────────
        {
            title: 'كتاب القانون في الطب',
            author: 'ابن سينا',
            field: 'الطب',
            era: 'القرن الخامس الهجري',
            summary: 'موسوعة طبية استخدمت في الجامعات الأوروبية 500 عام',
            sourceType: 'encyclopedia_seed',
            subjectGroup: 'العلوم الطبيعية والطب',
            country: 'فارس',
            city: 'بخارى',
            yearHijri: '428',
            authorBio: 'الشيخ الرئيس ابن سينا، أعظم أطباء الإسلام',
            birthYearHijri: '370',
            deathYearHijri: '428',
            learnedFrom: ['أبو عبد الله الناتلي', 'الكتب اليونانية المترجمة'],
            causeOfScience: 'الحاجة إلى نظام طبي شامل يجمع النظرية والتطبيق',
            impact: 'أسّس الطب العلمي المنهجي في العالم',
            beneficiaries: ['الأطباء', 'المرضى', 'الصيادلة', 'الجامعات'],
            countries: ['فارس', 'العراق', 'الأندلس', 'أوروبا'],
            erasApplied: ['من القرن الخامس إلى القرن السابع عشر الميلادي'],
            firstTools: ['الملاحظة السريرية', 'التجريب على المرضى'],
            sciencesUsed: ['الطب', 'الكيمياء', 'الفلسفة', 'الأدوية البسيطة'],
            secondTools: ['التصنيف والترتيب الموسوعي', 'المقارنة بالمصادر اليونانية'],
            researchCauses: ['علاج المرض والوقاية منه والحاجة إلى مرجع طبي موحد'],
            whatObserved: 'تفرق الطب في كتب متناثرة دون نظام منهجي',
            whereResearched: ['بخارى', 'خوارزم', 'جرجان', 'أصفهان'],
            howInterpreted: 'الجمع بين الطب اليوناني والإسلامي مع التجريب الميداني',
            meansUsed: ['الكتب المترجمة', 'الممارسة الطبية', 'المشاهدة'],
            purposeGoals: ['علاج المرضى', 'تعليم الأطباء', 'توحيد علم الطب']
        },
        {
            title: 'المختصر في حساب الجبر والمقابلة',
            author: 'محمد بن موسى الخوارزمي',
            field: 'الرياضيات',
            era: 'القرن الثالث الهجري',
            summary: 'أسّس علم الجبر وأعطاه اسمه، ومنه جاءت كلمة Algorithm',
            sourceType: 'encyclopedia_seed',
            subjectGroup: 'العلوم الطبيعية والطب',
            country: 'فارس',
            city: 'بغداد',
            yearHijri: '232',
            learnedFrom: ['بيت الحكمة في بغداد', 'الكتب الهندية واليونانية المترجمة'],
            causeOfScience: 'حل مسائل الميراث والقسمة والتجارة بشكل منهجي',
            impact: 'ولادة علم الجبر والخوارزمية التي أسّست علم الحوسبة',
            beneficiaries: ['التجار', 'القضاة للميراث', 'الجامعات العالمية', 'علم الحاسوب'],
            countries: ['العالم الإسلامي', 'أوروبا', 'الهند', 'عالميًا'],
            erasApplied: ['من القرن الثالث الهجري إلى الآن'],
            quranBasis: ['﴿يوصيكم الله في أولادكم للذكر مثل حظ الأنثيين﴾'],
            firstTools: ['الأرقام الهندية', 'أوراق الحساب'],
            sciencesUsed: ['الرياضيات', 'الفلك', 'الفرائض'],
            secondTools: ['الترميز الرياضي', 'التعميم والتجريد'],
            researchCauses: ['حاجة القضاة والتجار إلى حل معادلات الميراث والمعاملات'],
            whatObserved: 'غياب منهج رياضي منظم لحل المعادلات',
            whereResearched: ['بيت الحكمة في بغداد'],
            howInterpreted: 'تجريد المسائل العملية إلى معادلات رياضية عامة',
            purposeGoals: ['خدمة الفرائض والمعاملات', 'بناء علم الرياضيات']
        },
        // ──────── الموسوعات العامة ────────
        {
            title: 'مروج الذهب ومعادن الجوهر',
            author: 'المسعودي',
            field: 'التاريخ والجغرافيا',
            era: 'القرن الرابع الهجري',
            summary: 'موسوعة تاريخية جغرافية تغطي العالم القديم والإسلامي',
            sourceType: 'encyclopedia_seed',
            subjectGroup: 'الموسوعات التاريخية',
            country: 'العراق',
            city: 'بغداد',
            yearHijri: '346',
            learnedFrom: ['الرحلات الواسعة عبر العالم'],
            causeOfScience: 'الفضول العلمي ورغبة توثيق حضارات العالم',
            impact: 'مرجع للتاريخ والجغرافيا في القرون الوسطى',
            firstTools: ['الرحلة والملاحظة المباشرة', 'مقابلة السكان'],
            sciencesUsed: ['التاريخ', 'الجغرافيا', 'الفلك', 'الأنثروبولوجيا'],
            researchCauses: ['التعرف على العالم وحضاراته'],
            whereResearched: ['الهند', 'فارس', 'الشام', 'مصر', 'المغرب', 'الأندلس'],
            howInterpreted: 'الرواية الشفهية مع المعاينة الميدانية والمقارنة',
            purposeGoals: ['توثيق حضارات العالم', 'ربط التاريخ بالجغرافيا']
        },
        {
            title: 'مقدمة ابن خلدون',
            author: 'ابن خلدون',
            field: 'التاريخ والاجتماع',
            era: 'القرن الثامن الهجري',
            summary: 'أسّس علم الاجتماع والفلسفة التاريخية، يُحلّل نشوء الحضارات وسقوطها',
            sourceType: 'encyclopedia_seed',
            subjectGroup: 'الموسوعات التاريخية',
            country: 'المغرب والأندلس',
            city: 'تلمسان',
            yearHijri: '808',
            authorBio: 'عبد الرحمن بن خلدون، رائد علم الاجتماع والفلسفة التاريخية',
            birthYearHijri: '732',
            deathYearHijri: '808',
            learnedFrom: ['علماء تونس ومصر', 'التجربة السياسية'],
            causeOfScience: 'الفوضى السياسية في المغرب والأندلس واندثار الدول',
            impact: 'أسّس علم الاجتماع قبل أوغست كونت بأربعة قرون',
            beneficiaries: ['الحكام', 'المؤرخون', 'علماء الاجتماع', 'الاقتصاديون'],
            countries: ['المغرب', 'الأندلس', 'مصر', 'العالم الأكاديمي'],
            erasApplied: ['القرن الثامن الهجري إلى اليوم'],
            quranBasis: ['﴿إن الله لا يغير ما بقوم حتى يغيروا ما بأنفسهم﴾'],
            firstTools: ['التأمل في أسباب قيام الدول وسقوطها'],
            sciencesUsed: ['التاريخ', 'الاقتصاد', 'الجغرافيا', 'علم النفس الاجتماعي'],
            secondTools: ['المقارنة التاريخية', 'نظرية العصبية'],
            researchCauses: ['اندثار دول المغرب وأزمة الحضارة الإسلامية'],
            whatObserved: 'تكرار أنماط قيام الدول وانهيارها دون تفسير علمي',
            whereResearched: ['المغرب', 'الأندلس', 'تونس', 'مصر'],
            howInterpreted: 'استقراء دورات الحضارة وتجريدها في نظرية العمران',
            meansUsed: ['الملاحظة التاريخية', 'المقابلات', 'التحليل السياسي'],
            purposeGoals: ['تفسير صعود الحضارات وأفولها', 'بناء علم جديد للبشرية']
        }
    ];

    let inserted = 0;
    const titles = [];
    for (const seed of encyclopedias) {
        if (existing.has(seed.title)) { continue; }
        const built = createLibraryRecord(seed, 'system');
        if (built.valid) {
            items.push(built.record);
            titles.push(built.record.title);
            inserted += 1;
        }
    }
    if (inserted > 0) {
        save(DB.islamicLibrary, items);
    }
    return { inserted, total: encyclopedias.length, skipped: encyclopedias.length - inserted, titles };
}

function seedUmmahKnowledgeProgram() {
    const items = load(DB.islamicLibrary);
    const existing = new Set(items.map((x) => x.title));

    const seeds = [
        {
            title: 'المصحف الشريف للنشر والطباعة والتعليم',
            author: 'الوحي المنزل من الله سبحانه وتعالى',
            field: 'القرآن الكريم',
            era: 'عهد النبوة وما بعده',
            summary: 'أصل الأمة العلمي الأول، يُنشر بالتلاوة والتعليم والطباعة المراجعة والنشر الإلكتروني المنضبط.',
            sourceType: 'ummah_foundation_seed',
            subjectGroup: 'الوحي والأصول',
            collection: 'برنامج نشر كتاب الله',
            location: 'المصاحف المطبوعة والمنصات التعليمية',
            targetAudience: 'الأمة الإسلامية والبشرية',
            quranBasis: ['﴿إنا نحن نزلنا الذكر وإنا له لحافظون﴾', '﴿اقرأ باسم ربك الذي خلق﴾'],
            sunnahBasis: ['خيركم من تعلم القرآن وعلّمه'],
            usulRules: ['ما لا يتم الواجب إلا به فهو واجب'],
            scripturalPrinciple: 'نشر كتاب الله من أعظم القربات وأصل كل تأسيس علمي شرعي',
            sababNuzul: 'وحي متفرق بحسب الوقائع والهداية والتشريع',
            revelationTime: 'ثلاث وعشرون سنة',
            makkiMadani: 'مكي ومدني',
            surahName: 'القرآن الكريم كاملًا',
            ayahRange: 'من الفاتحة إلى الناس',
            firstTools: ['المصحف المراجع', 'التجويد', 'الحفظ', 'الطباعة المعتمدة'],
            sciencesUsed: ['علوم القرآن', 'الرسم العثماني', 'الضبط', 'التفسير'],
            meansUsed: ['الطباعة', 'النشر الإلكتروني', 'المدارس', 'المنصات التعليمية'],
            purposeGoals: ['نشر كتاب الله', 'تعليم الأمة', 'توحيد المرجعية العلمية', 'حفظ النص المتعبد بتلاوته']
        },
        {
            title: 'السنة النبوية الكاملة للنشر والتعليم والتحقيق',
            author: 'النبي محمد ﷺ',
            field: 'السنة وعلوم الحديث',
            era: 'عهد النبوة ثم عصور التدوين',
            summary: 'برنامج تأسيسي لجمع السنة الصحيحة وتعليمها ونشرها عبر المدونات الحديثية والتحقيق العلمي.',
            sourceType: 'ummah_foundation_seed',
            subjectGroup: 'السنة وعلومها',
            collection: 'برنامج نشر السنة',
            quranBasis: ['﴿وما آتاكم الرسول فخذوه وما نهاكم عنه فانتهوا﴾'],
            sunnahBasis: ['نضّر الله امرأً سمع منا حديثًا فبلغه كما سمعه', 'بلغوا عني ولو آية'],
            usulRules: ['الأصل في الأخبار التثبت'],
            scripturalPrinciple: 'السنة وحي وبيان للقرآن، ونشرها نشر للدين',
            firstTools: ['الإسناد', 'التخريج', 'التحقيق', 'الفهارس'],
            sciencesUsed: ['مصطلح الحديث', 'الجرح والتعديل', 'أصول الفقه'],
            meansUsed: ['الموسوعات الحديثية', 'المنصات الإلكترونية', 'التدريس المنهجي'],
            purposeGoals: ['تعليم السنة', 'تمييز الصحيح من الضعيف', 'بناء الفقه والتزكية على الوحي']
        },
        {
            title: 'منهاج العلوم الشرعية لأمة محمد ﷺ',
            author: 'لجنة علمية مؤسَّسة على الكتاب والسنة',
            field: 'العلوم الشرعية',
            era: 'العصر الرقمي',
            summary: 'منهاج تأسيسي يضم التفسير والحديث والفقه والأصول والعقيدة والسيرة والتزكية وعلوم العربية.',
            sourceType: 'ummah_foundation_seed',
            subjectGroup: 'العلوم الشرعية',
            quranBasis: ['﴿فلولا نفر من كل فرقة منهم طائفة ليتفقهوا في الدين﴾'],
            sunnahBasis: ['من يرد الله به خيرًا يفقهه في الدين'],
            usulRules: ['الوسائل لها أحكام المقاصد'],
            scripturalPrinciple: 'التفقه المنهجي أصل بقاء الأمة على الهدى',
            firstTools: ['المتون', 'الشروح', 'المراجعة العلمية', 'التدرج التعليمي'],
            sciencesUsed: ['التفسير', 'الحديث', 'الفقه', 'الأصول', 'العقيدة', 'العربية'],
            meansUsed: ['المعاهد', 'المناهج الرقمية', 'الحلقات', 'الموسوعات'],
            purposeGoals: ['تخريج علماء', 'توحيد البناء العلمي', 'رفع الجهل']
        },
        {
            title: 'منهاج العلوم الطبيعية النافعة للأمة',
            author: 'باحثون مسلمون في العلوم النافعة',
            field: 'العلوم الطبيعية',
            era: 'العصر الرقمي',
            summary: 'منهاج في الطب والرياضيات والفيزياء والفلك والكيمياء والأحياء على أساس النفع والأمانة وعدم الضرر.',
            sourceType: 'ummah_foundation_seed',
            subjectGroup: 'العلوم الطبيعية والطب',
            quranBasis: ['﴿وسخر لكم ما في السماوات وما في الأرض جميعًا منه﴾', '﴿قل سيروا في الأرض فانظروا﴾'],
            sunnahBasis: ['تداووا عباد الله فإن الله لم يضع داء إلا وضع له دواء'],
            usulRules: ['الضرر يزال'],
            scripturalPrinciple: 'كل علم نافع يحقق مقاصد الشرع ويخدم الأمة فهو من فروض الكفايات',
            firstTools: ['المختبر', 'الملاحظة', 'القياس', 'التجريب'],
            sciencesUsed: ['الطب', 'الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء'],
            meansUsed: ['المختبرات', 'الجامعات', 'النشر العلمي', 'المعايير'],
            purposeGoals: ['العلاج', 'النهضة الصناعية', 'الأمن الغذائي', 'تقوية الأمة']
        },
        {
            title: 'منهاج الإدارة والحسبة والحوكمة',
            author: 'لجنة سياسات شرعية وإدارية',
            field: 'العلوم الإدارية',
            era: 'العصر الرقمي',
            summary: 'تأصيل الإدارة والحسبة والحوكمة والرقابة والجودة وخدمة الناس على أساس العدل والإتقان والأمانة.',
            sourceType: 'ummah_foundation_seed',
            subjectGroup: 'الإدارة والحوكمة',
            quranBasis: ['﴿إن الله يأمركم أن تؤدوا الأمانات إلى أهلها وإذا حكمتم بين الناس أن تحكموا بالعدل﴾'],
            sunnahBasis: ['كلكم راع وكلكم مسؤول عن رعيته', 'إن الله يحب إذا عمل أحدكم عملًا أن يتقنه'],
            usulRules: ['تصرف الإمام على الرعية منوط بالمصلحة'],
            scripturalPrinciple: 'الإدارة في الإسلام ولاية أمانة لا مجرد سلطة',
            firstTools: ['القياس المؤسسي', 'الرقابة', 'التوثيق', 'مؤشرات الأداء'],
            sciencesUsed: ['الإدارة', 'الحوكمة', 'المحاسبة', 'الحسبة'],
            meansUsed: ['الأدلة التشغيلية', 'اللوحات الرقمية', 'المراجعة الداخلية'],
            purposeGoals: ['رفع الكفاءة', 'تحقيق العدل', 'منع الفساد', 'خدمة الأمة']
        },
        {
            title: 'منهاج البحث العلمي والتأليف الباقي',
            author: 'مدرسة شيخة للبحث والتحقيق',
            field: 'منهجية العلوم',
            era: 'العصر الرقمي',
            summary: 'وضع أصول التأليف العلمي الباقي: صحة المصدر، التوثيق، الإتقان، النفع، المراجعة، والتطبيق.',
            sourceType: 'ummah_foundation_seed',
            subjectGroup: 'منهجية العلوم',
            quranBasis: ['﴿ولا تقف ما ليس لك به علم﴾', '﴿وقل رب زدني علمًا﴾'],
            sunnahBasis: ['من كذب علي متعمدًا فليتبوأ مقعده من النار', 'إن الله يحب إذا عمل أحدكم عملًا أن يتقنه'],
            usulRules: ['اليقين لا يزول بالشك'],
            scripturalPrinciple: 'بقاء الكتاب ببقاء صدقه ونفعه وإتقانه',
            firstTools: ['التحرير', 'التوثيق', 'المراجعة', 'التحكيم'],
            sciencesUsed: ['منهج البحث', 'التوثيق', 'النقد العلمي', 'التحقيق'],
            meansUsed: ['دور النشر', 'المستودعات الرقمية', 'المراجعة الشرعية والعلمية'],
            purposeGoals: ['تأليف كتب تبقى', 'حفظ العلم النافع', 'تأسيس مرجعية للأمة']
        }
    ];

    let inserted = 0;
    const titles = [];
    for (const seed of seeds) {
        if (existing.has(seed.title)) continue;
        const built = createLibraryRecord(seed, 'system');
        if (built.valid) {
            items.push(built.record);
            titles.push(built.record.title);
            inserted += 1;
        }
    }

    if (inserted > 0) {
        save(DB.islamicLibrary, items);
    }

    return { inserted, total: seeds.length, skipped: seeds.length - inserted, titles };
}

function buildPublicationProgram() {
    return {
        mission: 'جعل القرآن الكريم والسنة والعلوم الشرعية والعلوم النافعة أساسًا علميًا أولًا للأمة مع النشر المنضبط والتطبيق العملي.',
        foundations: [
            'القرآن الكريم أصل الأصول ومرجع الأمة الأعلى',
            'السنة النبوية وحي وبيان وشرح وتطبيق',
            'العلوم الشرعية تضبط الفهم والعمل',
            'العلوم الطبيعية والإدارية النافعة من فروض الكفايات إذا حققت النفع ودفعت الضرر'
        ],
        publicationTracks: [
            'طباعة المصاحف عبر نص معتمد ومراجعة علمية وضبط رسم ومراجعة تدقيق نهائي',
            'نشر إلكتروني للمصحف عبر منصات قراءة وحفظ وتعليم وتلاوة',
            'نشر السنة عبر المدونات الحديثية الموثقة والتخريج والفهرسة',
            'تأليف مناهج شرعية مرحلية للأطفال والناشئة وطلبة العلم',
            'إصدار كتب علمية نافعة في الطب والرياضيات والإدارة وفق مقاصد الشريعة',
            'بناء معايير جودة وتحكيم قبل أي نشر عام'
        ],
        qualityPolicy: [
            'لا نشر بلا مراجعة علمية وشرعية',
            'لا اعتماد بلا توثيق مصدر',
            'لا علم بلا نفع ظاهر أو راجح',
            'لا وسيلة علمية تناقض أصلًا شرعيًا أو تحدث ضررًا'
        ],
        administrativeCivilizationalTrack: [
            'تأسيس علم الإدارة الإسلامي في كل مؤسسة عبر ميثاق شرعي تشغيلي',
            'تدريب القيادات على الشورى والعدل والأمانة والإتقان',
            'اعتماد بطاقة قياس شرعية تشغيلية موحدة للمؤسسات',
            'تحويل الإدارة إلى عبادة وعمران: كفاءة + رحمة + أثر'
        ],
        protectionPolicy: [
            'حماية القرآن والسنة من التحريف العلمي أو التوظيف المغلوط',
            'حماية المصطلح الشرعي من التمييع الإداري',
            'حماية القرار المؤسسي من الهوى والمصلحة الخاصة',
            'حماية المعرفة عبر توثيق النسخ والتحكيم الدوري'
        ],
        globalUmmahOutcomes: [
            'مرجعية علمية أولى للأمة',
            'رفع الجهل الشرعي والمنهجي',
            'نهضة تعليمية وعلمية وصناعية',
            'تحويل العلم إلى تطبيق نافع في المجتمع والمؤسسات'
        ],
        note: 'هذا البرنامج يؤسس للنشر والطباعة والفهرسة. النصوص الكاملة للمصحف والمدونات الحديثية تُدار عبر مصادر معتمدة ومراجعة قبل الإخراج النهائي.'
    };
}

function getSystemsCatalog() {
    return [
        { key: 'management', label: 'الإدارة الإسلامية', model: ILM_REFERENCE.islamicManagementScience },
        { key: 'supply-chain', label: 'سلاسل الإمداد الإسلامية', model: ILM_REFERENCE.islamicSupplyChainSystem },
        { key: 'innovation', label: 'الابتكار الإسلامي', model: ILM_REFERENCE.islamicInnovationSystem },
        { key: 'industry', label: 'الصناعة الإسلامية', model: ILM_REFERENCE.islamicIndustrySystem },
        { key: 'agriculture', label: 'الزراعة الإسلامية', model: ILM_REFERENCE.islamicAgricultureSystem },
        { key: 'ai-organization', label: 'منظمة الذكاء الصناعي الإسلامي', model: ILM_REFERENCE.islamicAiOrganization },
        { key: 'computing', label: 'الحوسبة والحساب الإسلامي', model: ILM_REFERENCE.islamicComputingSystem }
    ];
}

function buildExecutionKpiSeedRecords() {
    return getSystemsCatalog().map((entry) => {
        const model = entry.model || {};
        const metricNames =
            model.kpis ||
            model.aiKpis ||
            model.computingKpis ||
            (model.institutionalScorecard || []).flatMap((d) => d.metrics || []) ||
            ['مؤشر أداء عام'];

        const metrics = metricNames.slice(0, 5).map((name, idx) => {
            const base = 72 + ((entry.key.length + idx) % 18);
            const value = Math.min(98, base);
            return {
                name,
                value,
                target: 95,
                status: value >= 90 ? 'ممتاز' : value >= 80 ? 'جيد' : 'قيد التحسين',
                updatedAt: nowIso()
            };
        });

        return {
            systemKey: entry.key,
            label: entry.label,
            mode: 'zero-click-auto',
            metrics,
            updatedAt: nowIso()
        };
    });
}

function seedExecutionKpiLive(seedBy = 'auto') {
    ensureFile(DB.executionKpiLive, []);
    const current = load(DB.executionKpiLive);
    if (current.length > 0) {
        return { inserted: 0, total: current.length, seeded: false };
    }

    const seeded = buildExecutionKpiSeedRecords().map((item) => ({
        ...item,
        seededBy: seedBy
    }));
    save(DB.executionKpiLive, seeded);
    return { inserted: seeded.length, total: seeded.length, seeded: true };
}

function getLiveKpiSnapshot() {
    const first = load(DB.executionKpiLive);
    if (first.length > 0) {
        return first;
    }
    seedExecutionKpiLive('auto-no-click-bootstrap');
    return load(DB.executionKpiLive);
}

function buildUnifiedExecutionScorecard() {
    const liveSnapshot = getLiveKpiSnapshot();
    const systems = getSystemsCatalog().map((entry) => {
        const model = entry.model || {};
        const managementMetrics = (model.institutionalScorecard || []).flatMap((d) => d.metrics || []);
        const staticMetrics = model.kpis || model.aiKpis || model.computingKpis || managementMetrics || [];
        const controls =
            model.policy ||
            model.governancePolicy ||
            model.governance ||
            model.controlPolicy ||
            model.ethicsPolicy ||
            model.standards ||
            [];
        const live = liveSnapshot.find((x) => x.systemKey === entry.key);
        const metrics = live && Array.isArray(live.metrics) && live.metrics.length
            ? live.metrics.map((m) => `${m.name}: ${m.value}% (هدف ${m.target}%)`)
            : staticMetrics;
        return {
            key: entry.key,
            label: entry.label,
            metrics,
            controls,
            liveMode: live?.mode || 'reference-only',
            liveUpdatedAt: live?.updatedAt || null,
            quarterlyPlan: ILM_REFERENCE.islamicAiSciencesIntegration.quarterlyRoadmap
        };
    });

    return {
        title: 'بطاقة القياس الموحدة للأنظمة الإسلامية',
        systems,
        dimensions: [
            'الالتزام الشرعي',
            'الكفاءة التشغيلية',
            'جودة المخرجات',
            'الأثر المجتمعي',
            'الجاهزية الرقمية'
        ]
    };
}

function buildReadinessGapAnalysis() {
    const systems = getSystemsCatalog();
    const gaps = [];

    systems.forEach((entry) => {
        const model = entry.model || {};
        const hasVision = Boolean(model.vision);
        const hasGovernance = Boolean((model.governance || model.governancePolicy || model.controlPolicy || model.policy || []).length);
        const hasKpi = Boolean((model.kpis || model.aiKpis || model.computingKpis || (model.institutionalScorecard || []).flatMap((d) => d.metrics || []) || []).length);
        const hasScriptural = Boolean((model.quranFoundations || []).length || (model.principles || []).length);

        if (!hasVision) gaps.push(`${entry.label}: غياب رؤية تنفيذية مكتوبة`);
        if (!hasGovernance) gaps.push(`${entry.label}: غياب سياسة حوكمة تفصيلية`);
        if (!hasKpi) gaps.push(`${entry.label}: غياب مؤشرات قياس محددة`);
        if (!hasScriptural) gaps.push(`${entry.label}: غياب تأصيل قرآني/نبوي واضح`);
    });

    const readiness = Math.max(0, 100 - (gaps.length * 3));
    return {
        readinessScore: readiness,
        totalSystems: systems.length,
        totalGaps: gaps.length,
        gaps,
        recommendations: [
            'اعتماد لجنة تشغيل موحدة للأنظمة السبعة',
            'تفعيل مراجعة ربع سنوية مع مؤشرات أداء إلزامية',
            'ربط كل نظام بلوحة قياس رقمية وملاك مسؤول'
        ]
    };
}

app.post('/api/sheikha/library/seed-encyclopedias', auth, requireSheikhaLicense(['knowledge:write']), (req, res) => {
    const result = seedEncyclopedias();
    appendAudit({
        type: 'library_seed_encyclopedias',
        actor: req.user?.username || 'unknown',
        inserted: result.inserted
    });
    res.json({
        success: true,
        data: result,
        message: result.inserted > 0
            ? `تم تعبئة ${result.inserted} كتاباً موسوعياً مع المنهجية العلمية الكاملة`
            : 'الموسوعات موجودة مسبقًا',
        timestamp: nowIso()
    });
});

app.post('/api/sheikha/library/seed-ummah-foundations', auth, requireSheikhaLicense(['knowledge:write']), (req, res) => {
    const result = seedUmmahKnowledgeProgram();
    appendAudit({
        type: 'library_seed_ummah_foundations',
        actor: req.user?.username || 'unknown',
        inserted: result.inserted
    });
    res.json({
        success: true,
        data: result,
        message: result.inserted > 0
            ? `تمت إضافة ${result.inserted} أصول علمية كبرى للأمة وبرنامج النشر`
            : 'أصول الأمة العلمية موجودة مسبقًا',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/library/publication-program', (req, res) => {
    res.json({
        success: true,
        data: buildPublicationProgram(),
        message: 'برنامج تأسيس ونشر القرآن والسنة والعلوم الشرعية والعلوم النافعة',
        timestamp: nowIso()
    });
});

// تقرير المنهجية العلمية
app.get('/api/sheikha/library/methodology-report', auth, (req, res) => {
    const items = load(DB.islamicLibrary);
    const report = items.map((item) => {
        const m = item.methodology || {};
        return {
            id: item.id,
            title: item.title,
            author: item.author,
            field: item.field,
            era: item.era,
            // المنهجية
            firstTools: m.firstTools || [],
            sciencesUsed: m.sciencesUsed || [],
            secondTools: m.secondTools || [],
            researchCauses: m.researchCauses || [],
            intellectualJourney: m.intellectualJourney || '',
            learnedFrom: m.learnedFrom || [],
            whatObserved: m.whatObserved || '',
            whereResearched: m.whereResearched || [],
            howInterpreted: m.howInterpreted || '',
            meansUsed: m.meansUsed || [],
            purposeGoals: m.purposeGoals || []
        };
    });

    // إحصاءات المنهجية
    const allTools = [];
    const allSciences = [];
    const allCauses = [];
    report.forEach((r) => {
        allTools.push(...r.firstTools, ...r.secondTools);
        allSciences.push(...r.sciencesUsed);
        allCauses.push(...r.researchCauses);
    });

    const freq = (arr) => arr.reduce((acc, v) => { acc[v] = (acc[v] || 0) + 1; return acc; }, {});

    return res.json({
        success: true,
        data: {
            records: report,
            stats: {
                totalRecords: report.length,
                topTools: freq(allTools),
                topSciences: freq(allSciences),
                topCauses: freq(allCauses)
            }
        },
        message: 'تقرير المنهجيات العلمية: الأدوات والعلوم والأسباب ومسيرة الفكر',
        timestamp: nowIso()
    });
});

app.post('/api/sheikha/library/register', auth, requireSheikhaLicense(['knowledge:write']), (req, res) => {
    const built = createLibraryRecord(req.body || {}, req.user?.username || 'unknown');
    if (!built.valid) {
        return res.status(400).json({
            success: false,
            message: built.error,
            timestamp: nowIso()
        });
    }

    const items = load(DB.islamicLibrary);
    const record = built.record;

    items.push(record);
    save(DB.islamicLibrary, items);

    appendAudit({
        type: 'library_register',
        actor: req.user?.username || 'unknown',
        recordId: record.id,
        title: record.title,
        field: record.field
    });

    return res.json({
        success: true,
        data: record,
        message: 'تمت رقمنة العنصر العلمي وفهرسته بنجاح',
        timestamp: nowIso()
    });
});

app.post('/api/sheikha/library/import-batch', auth, requireSheikhaLicense(['knowledge:write']), (req, res) => {
    const records = Array.isArray(req.body?.records)
        ? req.body.records
        : parseCsvRecords(req.body?.csv || '');

    if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'أرسل records كمصفوفة أو csv كسلسلة نصية تحتوي عناوين أعمدة',
            timestamp: nowIso()
        });
    }

    const items = load(DB.islamicLibrary);
    const inserted = [];
    const failed = [];

    for (let i = 0; i < records.length; i += 1) {
        const built = createLibraryRecord(records[i], req.user?.username || 'unknown');
        if (!built.valid) {
            failed.push({ index: i, error: built.error, input: records[i] });
            continue;
        }
        items.push(built.record);
        inserted.push({ id: built.record.id, title: built.record.title, field: built.record.field });
    }

    save(DB.islamicLibrary, items);

    appendAudit({
        type: 'library_batch_import',
        actor: req.user?.username || 'unknown',
        inserted: inserted.length,
        failed: failed.length,
        total: records.length
    });

    return res.json({
        success: true,
        data: {
            total: records.length,
            inserted,
            failed
        },
        message: `اكتمل الاستيراد: ${inserted.length} ناجح، ${failed.length} مرفوض`,
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/library', (req, res) => {
    const {
        field,
        era,
        author,
        chapter,
        section,
        issue,
        sourceType
    } = req.query;
    const all = load(DB.islamicLibrary);
    const filtered = all.filter((item) => {
        const hierarchy = item.hierarchy || {};
        if (field && String(item.field) !== String(field)) return false;
        if (era && String(item.era) !== String(era)) return false;
        if (author && !String(item.author).includes(String(author))) return false;
        if (chapter && String(hierarchy.chapter) !== String(chapter)) return false;
        if (section && String(hierarchy.section) !== String(section)) return false;
        if (issue && String(hierarchy.issue) !== String(issue)) return false;
        if (sourceType && String(item.sourceType) !== String(sourceType)) return false;
        return true;
    });

    res.json({
        success: true,
        data: filtered,
        total: filtered.length,
        filters: {
            field: field || null,
            era: era || null,
            author: author || null,
            chapter: chapter || null,
            section: section || null,
            issue: issue || null,
            sourceType: sourceType || null
        },
        message: 'سجل الرقمنة للكتب والعلوم والعلماء',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/library/hierarchy-stats', (req, res) => {
    const all = load(DB.islamicLibrary);
    const byBook = {};
    const byChapter = {};
    const bySection = {};
    const byIssue = {};
    const bySubjectGroup = {};

    for (const item of all) {
        const h = item.hierarchy || {};
        const card = item.infoCard || {};
        if (h.book) byBook[h.book] = (byBook[h.book] || 0) + 1;
        if (h.chapter) byChapter[h.chapter] = (byChapter[h.chapter] || 0) + 1;
        if (h.section) bySection[h.section] = (bySection[h.section] || 0) + 1;
        if (h.issue) byIssue[h.issue] = (byIssue[h.issue] || 0) + 1;
        if (card.subjectGroup) bySubjectGroup[card.subjectGroup] = (bySubjectGroup[card.subjectGroup] || 0) + 1;
    }

    res.json({
        success: true,
        data: {
            byBook,
            byChapter,
            bySection,
            byIssue,
            bySubjectGroup,
            total: all.length
        },
        message: 'إحصاءات التصنيف الهرمي للرقمنة',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/library/card/:id', (req, res) => {
    const id = Number(req.params.id);
    const all = load(DB.islamicLibrary);
    const item = all.find((entry) => Number(entry.id) === id);

    if (!item) {
        return res.status(404).json({
            success: false,
            message: 'لم يتم العثور على البطاقة التعريفية المطلوبة',
            timestamp: nowIso()
        });
    }

    return res.json({
        success: true,
        data: {
            id: item.id,
            title: item.title,
            author: item.author,
            field: item.field,
            era: item.era,
            summary: item.summary,
            hierarchy: item.hierarchy,
            infoCard: item.infoCard,
            authorProfile: item.authorProfile,
            hadithIndex: item.hadithIndex,
            scripturalBasis: item.scripturalBasis,
            scientificTrace: item.scientificTrace,
            worldlyUses: item.worldlyUses,
            products: item.products,
            sharedTopics: item.sharedTopics,
            tags: item.tags
        },
        message: 'البطاقة التعريفية العلمية متاحة',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/library/topic-groups', (req, res) => {
    const all = load(DB.islamicLibrary);
    const groups = {};

    for (const item of all) {
        const card = item.infoCard || {};
        const subjectGroup = String(card.subjectGroup || item.field || 'غير مصنف');
        if (!groups[subjectGroup]) {
            groups[subjectGroup] = {
                total: 0,
                books: [],
                authors: new Set(),
                topics: new Set()
            };
        }

        groups[subjectGroup].total += 1;
        groups[subjectGroup].books.push({ id: item.id, title: item.title, author: item.author });
        groups[subjectGroup].authors.add(item.author);
        (item.sharedTopics || []).forEach((topic) => groups[subjectGroup].topics.add(topic));
    }

    const normalized = Object.entries(groups).map(([name, group]) => ({
        name,
        total: group.total,
        books: group.books,
        authors: Array.from(group.authors),
        topics: Array.from(group.topics)
    }));

    return res.json({
        success: true,
        data: normalized,
        total: normalized.length,
        message: 'مجموعات الكتب في الموضوعات المشتركة',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/library/authors', (req, res) => {
    const all = load(DB.islamicLibrary);
    const authors = {};

    for (const item of all) {
        if (!authors[item.author]) {
            authors[item.author] = {
                name: item.author,
                biography: item.authorProfile?.biography || '',
                origin: item.authorProfile?.origin || '',
                birthYearHijri: item.authorProfile?.birthYearHijri || '',
                deathYearHijri: item.authorProfile?.deathYearHijri || '',
                learnedFrom: new Set(),
                students: new Set(),
                books: []
            };
        }

        (item.authorProfile?.learnedFrom || []).forEach((name) => authors[item.author].learnedFrom.add(name));
        (item.authorProfile?.students || []).forEach((name) => authors[item.author].students.add(name));
        authors[item.author].books.push({ id: item.id, title: item.title, field: item.field, era: item.era });
    }

    const result = Object.values(authors).map((author) => ({
        ...author,
        learnedFrom: Array.from(author.learnedFrom),
        students: Array.from(author.students)
    }));

    res.json({
        success: true,
        data: result,
        total: result.length,
        message: 'فهرس المؤلفين وسيرهم العلمية',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/library/hadith-network', (req, res) => {
    const all = load(DB.islamicLibrary);
    const narrators = {};
    const tabiin = {};

    for (const item of all) {
        (item.hadithIndex?.narrators || []).forEach((name) => {
            if (!narrators[name]) narrators[name] = { name, books: [], links: new Set() };
            narrators[name].books.push({ id: item.id, title: item.title, author: item.author });
        });
        (item.hadithIndex?.tabiinLinks || []).forEach((name) => {
            if (!tabiin[name]) tabiin[name] = { name, books: [], links: new Set() };
            tabiin[name].books.push({ id: item.id, title: item.title, author: item.author });
        });

        const narr = item.hadithIndex?.narrators || [];
        const tabs = item.hadithIndex?.tabiinLinks || [];
        narr.forEach((n) => tabs.forEach((t) => {
            if (!narrators[n]) narrators[n] = { name: n, books: [], links: new Set() };
            if (!tabiin[t]) tabiin[t] = { name: t, books: [], links: new Set() };
            narrators[n].links.add(t);
            tabiin[t].links.add(n);
        }));
    }

    const normalize = (map) => Object.values(map).map((entry) => ({
        ...entry,
        links: Array.from(entry.links)
    }));

    res.json({
        success: true,
        data: {
            narrators: normalize(narrators),
            tabiin: normalize(tabiin)
        },
        message: 'شبكة الرواة والتابعين والارتباطات العلمية',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/library/search', (req, res) => {
    const q = normalizeText(req.query?.q || '');
    if (!q || q.length < 2) {
        return res.status(400).json({
            success: false,
            message: 'أدخل q من حرفين على الأقل',
            timestamp: nowIso()
        });
    }

    const all = load(DB.islamicLibrary);
    const results = all.filter((item) => String(item.indexText || '').includes(q));

    return res.json({
        success: true,
        data: results,
        total: results.length,
        query: q,
        message: `نتائج فهرسة الرقمنة عن: ${q}`,
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/library/usage-report', (req, res) => {
    const items = load(DB.islamicLibrary);
    const byField = {};
    const byEra = {};
    const byCountry = {};
    const byBeneficiary = {};
    let totalUses = 0;
    let totalProducts = 0;

    for (const item of items) {
        const trace = item.scientificTrace || {};
        byField[item.field] = (byField[item.field] || 0) + 1;
        byEra[item.era] = (byEra[item.era] || 0) + 1;
        totalUses += Array.isArray(item.worldlyUses) ? item.worldlyUses.length : 0;
        totalProducts += Array.isArray(item.products) ? item.products.length : 0;
        (trace.countries || []).forEach((country) => {
            byCountry[country] = (byCountry[country] || 0) + 1;
        });
        (trace.beneficiaries || []).forEach((beneficiary) => {
            byBeneficiary[beneficiary] = (byBeneficiary[beneficiary] || 0) + 1;
        });
    }

    res.json({
        success: true,
        data: {
            totalAssets: items.length,
            totalWorldlyUses: totalUses,
            totalProductsMentioned: totalProducts,
            byField,
            byEra,
            byCountry,
            byBeneficiary,
            framework: ISLAMIC_DIGITIZATION_FRAMEWORK
        },
        message: 'تقرير رقمنة العلوم الإسلامية واستخداماتها الدنيوية',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/library/scientific-trace', (req, res) => {
    const items = load(DB.islamicLibrary);
    const trace = items.map((item) => ({
        id: item.id,
        title: item.title,
        author: item.author,
        era: item.era,
        field: item.field,
        cause: item.scientificTrace?.cause || '',
        impact: item.scientificTrace?.impact || '',
        beneficiaries: item.scientificTrace?.beneficiaries || [],
        countries: item.scientificTrace?.countries || [],
        erasApplied: item.scientificTrace?.erasApplied || [],
        appliedIn: item.scientificTrace?.appliedIn || []
    }));

    res.json({
        success: true,
        data: trace,
        total: trace.length,
        message: 'سجل التتبع العلمي: السبب والأثر والتطبيق والمستفيد',
        timestamp: nowIso()
    });
});

// ═══════════════════════════════════════════════════════════════
// التأصيل الشرعي الشامل: كتاب + سنة + دليل + إسناد + اتصال
// ═══════════════════════════════════════════════════════════════

function toSanadRules(input) {
    return {
        isConnected: Boolean(input?.isConnected),
        narratorJustice: Boolean(input?.narratorJustice),
        narratorPrecision: Boolean(input?.narratorPrecision),
        noShudhudh: Boolean(input?.noShudhudh),
        noIllah: Boolean(input?.noIllah),
        notes: normalizeText(input?.notes || '')
    };
}

function validateSanadRules(rules) {
    const checks = {
        الاتصال: Boolean(rules.isConnected),
        عدالة_الرواة: Boolean(rules.narratorJustice),
        ضبط_الرواة: Boolean(rules.narratorPrecision),
        عدم_الشذوذ: Boolean(rules.noShudhudh),
        عدم_العلة: Boolean(rules.noIllah)
    };

    const passed = Object.values(checks).filter(Boolean).length;
    const reasons = [];

    if (!checks.الاتصال) reasons.push('السند فيه انقطاع أو عدم ثبوت اتصال كافٍ.');
    if (!checks.عدالة_الرواة) reasons.push('عدالة بعض الرواة غير متحققة.');
    if (!checks.ضبط_الرواة) reasons.push('الضبط غير مكتمل عند بعض الرواة.');
    if (!checks.عدم_الشذوذ) reasons.push('وُجد شذوذ يحتاج جمع طرق ومزيد تحرير.');
    if (!checks.عدم_العلة) reasons.push('وُجدت علة قادحة أو محتملة في السند/المتن.');

    let grade = 'ضعيف';
    if (passed === 5) {
        grade = 'صحيح';
        reasons.push('استوفت الرواية شروط الصحة الخمسة كاملة.');
    } else if (checks.الاتصال && checks.عدالة_الرواة && passed >= 4) {
        grade = 'حسن';
        reasons.push('تحققت أركان القبول الأساسية مع ملاحظة يسيرة لا تُسقط أصل الاحتجاج.');
    } else {
        reasons.push('لم تكتمل شروط القبول الحديثي، ويحتاج السجل إلى مراجعة علمية.');
    }

    return {
        status: grade,
        grade,
        score: Number((passed / 5).toFixed(2)),
        checks,
        reasons
    };
}

function buildTaseelRecord(input, actor) {
    const title = normalizeText(input?.title);
    const science = normalizeText(input?.science);
    const scienceType = normalizeText(input?.scienceType || 'شرعي');
    const scope = normalizeText(input?.scope || 'كتاب');

    if (!title || !science) {
        return { valid: false, error: 'title و science مطلوبان للتأصيل' };
    }

    const quran = toArray(input?.quran);
    const sunnah = toArray(input?.sunnah);
    const athar = toArray(input?.athar);
    const fiqhRules = toArray(input?.fiqhRules);
    const usulRules = toArray(input?.usulRules);
    const maqasid = toArray(input?.maqasid);
    const means = toArray(input?.means || input?.wasail || input?.methodologyMeans);
    const goals = toArray(input?.goals || input?.ghayat || input?.methodologyGoals);

    const sanad = {
        narrators: toArray(input?.narrators),
        chain: toArray(input?.chain),
        sourceBooks: toArray(input?.sourceBooks),
        grade: normalizeText(input?.grade || ''),
        rules: toSanadRules(input?.sanadRules || {}),
        communicationMode: normalizeText(input?.communicationMode || input?.ittisalMode || 'سماع/قراءة/إجازة'),
        continuityNotes: normalizeText(input?.continuityNotes || '')
    };

    const sanadValidation = validateSanadRules(sanad.rules);
    if (!sanad.grade) {
        sanad.grade = sanadValidation.grade;
    }

    const record = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        type: 'taseel_record',
        title,
        science,
        scienceType,
        scope,
        scriptural: {
            quran,
            sunnah,
            athar,
            principle: normalizeText(input?.principle || ''),
            legalEvidence: normalizeText(input?.legalEvidence || '')
        },
        conditions: {
            shariahConditions: toArray(input?.shariahConditions),
            practicalConditions: toArray(input?.practicalConditions),
            fiqhRules,
            usulRules,
            maqasid
        },
        sanad,
        sanadValidation,
        explanation: {
            whyThisScience: normalizeText(input?.whyThisScience || ''),
            howDerived: normalizeText(input?.howDerived || ''),
            contemporaryApplication: toArray(input?.contemporaryApplication),
            means,
            goals,
            meansConnection: {
                quran: ensureAtLeastOne(input?.meansConnectionQuran || input?.meansQuran, '﴿واعتصموا بحبل الله جميعًا﴾'),
                sunnah: ensureAtLeastOne(input?.meansConnectionSunnah || input?.meansSunnah, 'إنما الأعمال بالنيات'),
                usul: ensureAtLeastOne(input?.meansConnectionUsul || input?.meansUsul, 'الوسائل لها أحكام المقاصد')
            },
            goalsConnection: {
                quran: ensureAtLeastOne(input?.goalsConnectionQuran || input?.goalsQuran, '﴿وما خلقت الجن والإنس إلا ليعبدون﴾'),
                sunnah: ensureAtLeastOne(input?.goalsConnectionSunnah || input?.goalsSunnah, 'إن الله كتب الإحسان على كل شيء'),
                usul: ensureAtLeastOne(input?.goalsConnectionUsul || input?.goalsUsul, 'المقاصد معتبرة شرعًا')
            },
            meansSilah: {
                quran: ensureAtLeastOne(input?.meansSilahQuran || input?.meansConnectionQuran || input?.meansQuran, '﴿واعتصموا بحبل الله جميعًا﴾'),
                sunnah: ensureAtLeastOne(input?.meansSilahSunnah || input?.meansConnectionSunnah || input?.meansSunnah, 'إنما الأعمال بالنيات'),
                usul: ensureAtLeastOne(input?.meansSilahUsul || input?.meansConnectionUsul || input?.meansUsul, 'الوسائل لها أحكام المقاصد')
            },
            goalsSilah: {
                quran: ensureAtLeastOne(input?.goalsSilahQuran || input?.goalsConnectionQuran || input?.goalsQuran, '﴿وما خلقت الجن والإنس إلا ليعبدون﴾'),
                sunnah: ensureAtLeastOne(input?.goalsSilahSunnah || input?.goalsConnectionSunnah || input?.goalsSunnah, 'إن الله كتب الإحسان على كل شيء'),
                usul: ensureAtLeastOne(input?.goalsSilahUsul || input?.goalsConnectionUsul || input?.goalsUsul, 'المقاصد معتبرة شرعًا')
            }
        },
        createdAt: nowIso(),
        createdBy: actor || 'unknown'
    };

    return { valid: true, record };
}

app.post('/api/sheikha/taseel/register', auth, requireSheikhaLicense(['knowledge:write']), (req, res) => {
    const built = buildTaseelRecord(req.body || {}, req.user?.username || 'unknown');
    if (!built.valid) {
        return res.status(400).json({
            success: false,
            message: built.error,
            timestamp: nowIso()
        });
    }

    const items = load(DB.taseel);
    items.push(built.record);
    save(DB.taseel, items);

    appendAudit({
        type: 'taseel_register',
        actor: req.user?.username || 'unknown',
        title: built.record.title,
        science: built.record.science,
        sanadStatus: built.record.sanadValidation.status
    });

    return res.json({
        success: true,
        data: built.record,
        message: 'تم تسجيل التأصيل الشرعي بنجاح',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/taseel/list', auth, (req, res) => {
    const items = load(DB.taseel);
    res.json({
        success: true,
        data: items,
        total: items.length,
        message: 'قائمة التأصيلات الشرعية والعلمية',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/taseel/verify/:id', auth, (req, res) => {
    const id = Number(req.params.id);
    const items = load(DB.taseel);
    const item = items.find((x) => Number(x.id) === id);

    if (!item) {
        return res.status(404).json({
            success: false,
            message: 'سجل التأصيل غير موجود',
            timestamp: nowIso()
        });
    }

    const recheck = validateSanadRules(item.sanad?.rules || {});

    return res.json({
        success: true,
        data: {
            id: item.id,
            title: item.title,
            science: item.science,
            sanadValidation: recheck,
            grade: recheck.grade,
            reasons: recheck.reasons,
            communicationMode: item.sanad?.communicationMode || '',
            continuityNotes: item.sanad?.continuityNotes || ''
        },
        message: 'تحقق شروط صحة الإسناد والاتصال',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/taseel/public-summary', (req, res) => {
    const items = load(DB.taseel);
    const summary = items.map((item) => {
        const validation = validateSanadRules(item.sanad?.rules || {});
        return {
            id: item.id,
            title: item.title,
            science: item.science,
            scienceType: item.scienceType,
            grade: validation.grade,
            score: validation.score,
            reasons: validation.reasons,
            quranCount: Array.isArray(item.scriptural?.quran) ? item.scriptural.quran.length : 0,
            sunnahCount: Array.isArray(item.scriptural?.sunnah) ? item.scriptural.sunnah.length : 0,
            usulCount: Array.isArray(item.conditions?.usulRules) ? item.conditions.usulRules.length : 0,
            communicationMode: item.sanad?.communicationMode || ''
        };
    });

    return res.json({
        success: true,
        data: summary,
        total: summary.length,
        message: 'ملخص بصري لحالة التأصيل ودرجة الإسناد',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/taseel/policy', (req, res) => {
    return res.json({
        success: true,
        data: {
            mandatoryForBookSave: {
                quran: 'مطلوب آية واحدة على الأقل',
                sunnah: 'مطلوب حديث واحد على الأقل',
                usul: 'مطلوب قاعدة أصولية واحدة على الأقل'
            },
            sanadGrading: ['صحيح', 'حسن', 'ضعيف']
        },
        message: 'سياسة التأصيل الإلزامية ودرجات التوثيق العلمي',
        timestamp: nowIso()
    });
});

app.post('/api/sheikha/taseel/seed', auth, requireSheikhaLicense(['knowledge:write']), (req, res) => {
    const items = load(DB.taseel);
    if (items.some((x) => x.type === 'taseel_seed')) {
        return res.json({
            success: true,
            data: { inserted: 0, skipped: true },
            message: 'بذور التأصيل موجودة مسبقًا',
            timestamp: nowIso()
        });
    }

    const seeds = [
        {
            title: 'تأصيل علم الحديث',
            science: 'الحديث',
            scienceType: 'شرعي',
            scope: 'علم',
            quran: ['﴿وما آتاكم الرسول فخذوه وما نهاكم عنه فانتهوا﴾'],
            sunnah: ['نضّر الله امرأً سمع منا حديثًا فبلغه كما سمعه'],
            athar: ['كان ابن سيرين يسأل عن الإسناد'],
            principle: 'حفظ السنة بالإسناد المتصل',
            legalEvidence: 'حجية السنة ووجوب التثبت في النقل',
            shariahConditions: ['صحة الإسناد', 'عدالة وضبط الرواة', 'انتفاء الشذوذ والعلة'],
            practicalConditions: ['توثيق السند', 'مقارنة الطرق', 'تحرير المتن'],
            fiqhRules: ['اليقين لا يزول بالشك'],
            usulRules: ['الأصل في الأخبار التثبت'],
            maqasid: ['حفظ الدين'],
            narrators: ['البخاري', 'مسلم', 'أحمد'],
            chain: ['شيخ', 'راوٍ', 'صحابي', 'النبي ﷺ'],
            sourceBooks: ['صحيح البخاري', 'صحيح مسلم'],
            grade: 'صحيح',
            sanadRules: {
                isConnected: true,
                narratorJustice: true,
                narratorPrecision: true,
                noShudhudh: true,
                noIllah: true,
                notes: 'تطبيق الشروط الخمسة للصحة'
            },
            communicationMode: 'سماع ثم أداء مضبوط',
            continuityNotes: 'سلسلة متصلة بلا انقطاع',
            whyThisScience: 'حفظ سنة النبي ﷺ من الدخيل',
            howDerived: 'استقراء النصوص وبناء قواعد المصطلح',
            contemporaryApplication: ['توثيق الروايات الرقمية', 'فهرسة كتب السنة']
        },
        {
            title: 'تأصيل علم الطب',
            science: 'الطب',
            scienceType: 'تطبيقي',
            scope: 'علم',
            quran: ['﴿ومن أحياها فكأنما أحيا الناس جميعًا﴾'],
            sunnah: ['تداووا عباد الله فإن الله لم يضع داء إلا وضع له دواء'],
            athar: ['اهتمام الأطباء المسلمين بالتجربة والملاحظة'],
            principle: 'حفظ النفس مقصد شرعي',
            legalEvidence: 'جواز التداوي بل استحبابه عند الحاجة',
            shariahConditions: ['عدم استخدام محرم إلا لضرورة منضبطة', 'تحقيق المصلحة ودفع المفسدة'],
            practicalConditions: ['تشخيص صحيح', 'تجربة منضبطة', 'توثيق النتائج'],
            fiqhRules: ['الضرر يزال', 'الضرورات تبيح المحظورات بقدرها'],
            usulRules: ['الحكم يدور مع علته'],
            maqasid: ['حفظ النفس', 'حفظ العقل'],
            narrators: ['الأطباء الثقات في النقل التجريبي'],
            chain: ['ملاحظة', 'تجربة', 'تحقق', 'تعميم منضبط'],
            sourceBooks: ['القانون في الطب', 'الطب النبوي'],
            grade: 'مباح منضبط',
            sanadRules: {
                isConnected: true,
                narratorJustice: true,
                narratorPrecision: true,
                noShudhudh: true,
                noIllah: true,
                notes: 'في العلوم التطبيقية: اتصال المنهج التجريبي وتكرار النتائج'
            },
            communicationMode: 'تعليم أكاديمي + إشراف مهني',
            continuityNotes: 'نقل المعرفة بالتوثيق والتجريب المتكرر',
            whyThisScience: 'حفظ الأرواح وتخفيف الألم',
            howDerived: 'جمع بين النص الشرعي والتجربة الطبية',
            contemporaryApplication: ['البروتوكولات العلاجية', 'أنظمة السلامة الطبية']
        },
        {
            title: 'تأصيل علم الاقتصاد والمعاملات',
            science: 'الاقتصاد الإسلامي',
            scienceType: 'تطبيقي',
            scope: 'علم',
            quran: ['﴿وأحل الله البيع وحرم الربا﴾'],
            sunnah: ['الذهب بالذهب... مثلًا بمثل يدًا بيد'],
            athar: ['تطبيق عمر رضي الله عنه لسياسات السوق العادلة'],
            principle: 'تحقيق العدل ومنع الربا والغرر',
            legalEvidence: 'الأصل في المعاملات الإباحة ما لم يرد منع',
            shariahConditions: ['انتفاء الربا', 'انتفاء الغرر الفاحش', 'التراضي'],
            practicalConditions: ['شفافية العقود', 'إثبات الملكية', 'قياس المخاطر'],
            fiqhRules: ['الغنم بالغرم', 'الخراج بالضمان'],
            usulRules: ['العبرة في العقود للمقاصد والمعاني لا للألفاظ والمباني'],
            maqasid: ['حفظ المال', 'تحقيق العدل'],
            narrators: ['فقهاء المعاملات الثقات'],
            chain: ['نص', 'فهم فقهي', 'تنزيل على الواقع', 'رقابة شرعية'],
            sourceBooks: ['الموطأ', 'المغني', 'الموافقات'],
            grade: 'منضبط بالشروط',
            sanadRules: {
                isConnected: true,
                narratorJustice: true,
                narratorPrecision: true,
                noShudhudh: true,
                noIllah: true,
                notes: 'اتصال اجتهادي معتبر عبر المذاهب'
            },
            communicationMode: 'تعليم فقهي + تطبيق مؤسسي',
            continuityNotes: 'سلسلة اجتهاد متصلة بأصول معتبرة',
            whyThisScience: 'بناء سوق عادل يرفع الفقر ويحارب الظلم',
            howDerived: 'استنباط قواعد المعاملات ثم تنزيلها على الاقتصاد الحديث',
            contemporaryApplication: ['التمويل الإسلامي', 'الرقابة الشرعية', 'الحوكمة']
        }
    ];

    const inserted = [];
    for (const seed of seeds) {
        const built = buildTaseelRecord(seed, req.user?.username || 'system');
        if (built.valid) {
            built.record.type = 'taseel_seed';
            items.push(built.record);
            inserted.push({ id: built.record.id, title: built.record.title });
        }
    }

    save(DB.taseel, items);
    appendAudit({
        type: 'taseel_seed',
        actor: req.user?.username || 'unknown',
        inserted: inserted.length
    });

    return res.json({
        success: true,
        data: { inserted: inserted.length, records: inserted },
        message: 'تمت تعبئة بذور التأصيل الشرعي للعلوم الشرعية والتطبيقية',
        timestamp: nowIso()
    });
});

app.get('/api/sheikha/taseel/gap-analysis', auth, (req, res) => {
    const items = load(DB.taseel);
    const gaps = [];

    const missingQuran = items.filter((x) => !Array.isArray(x.scriptural?.quran) || x.scriptural.quran.length === 0).length;
    const missingSunnah = items.filter((x) => !Array.isArray(x.scriptural?.sunnah) || x.scriptural.sunnah.length === 0).length;
    const missingSanad = items.filter((x) => !Array.isArray(x.sanad?.chain) || x.sanad.chain.length === 0).length;
    const weakConnection = items.filter((x) => x.sanadValidation?.status !== 'صحيح').length;

    if (missingQuran > 0) gaps.push(`يوجد ${missingQuran} سجل بلا آيات تأصيلية`);
    if (missingSunnah > 0) gaps.push(`يوجد ${missingSunnah} سجل بلا أحاديث تأصيلية`);
    if (missingSanad > 0) gaps.push(`يوجد ${missingSanad} سجل بلا سلسلة اتصال موثقة`);
    if (weakConnection > 0) gaps.push(`يوجد ${weakConnection} سجل يحتاج مراجعة شروط الصحة`);

    const recommendations = [
        'إلزام كل سجل بآية + حديث + قاعدة فقهية على الأقل',
        'إضافة مراجع المصدر (كتاب/باب/حديث/صفحة) لكل دليل',
        'مراجعة السلاسل غير المتصلة عبر لجنة علمية',
        'فصل التأصيل الشرعي عن التأصيل التجريبي مع ربط المقاصد'
    ];

    return res.json({
        success: true,
        data: {
            total: items.length,
            gaps,
            recommendations
        },
        message: 'تحليل فجوات التأصيل الشرعي والاتصال',
        timestamp: nowIso()
    });
});

app.get('/library/card/:id', (req, res) => {
        const id = Number(req.params.id);
        const all = load(DB.islamicLibrary);
        const item = all.find((entry) => Number(entry.id) === id);

        if (!item) {
                return res.status(404).send('<h1>البطاقة غير موجودة</h1>');
        }

        const card = item.infoCard || {};
        const author = item.authorProfile || {};
        const trace = item.scientificTrace || {};
        const scriptural = item.scripturalBasis || {};
        const revelation = scriptural.revelation || {};
        const hierarchy = item.hierarchy || {};

        res.send(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>${item.title} — بطاقة شيخة</title>
    <style>
        body{font-family:'Tajawal',Arial,sans-serif;background:#0f1115;color:#eef2f6;margin:0;padding:18px}
        .wrap{max-width:1000px;margin:0 auto}
        .hero,.panel{background:#151922;border:1px solid #2c3445;border-radius:16px;padding:18px;margin-bottom:14px}
        .hero{border-color:#d4af37;background:linear-gradient(140deg,#1f180c,#151922)}
        h1{margin:0 0 8px;color:#d4af37}.sub{color:#a9b7ca}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}
        .card{background:#0f141d;border:1px solid #2c3445;border-radius:12px;padding:14px}.title{color:#d4af37;font-weight:bold;margin-bottom:8px}
        li{margin:6px 0}.muted{color:#93a0b3}.meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.badge{background:#1d2736;border:1px solid #36445b;border-radius:999px;padding:4px 10px;color:#9ed0ff;font-size:.82rem}
        a{color:#8ecae6;text-decoration:none}
    </style>
</head>
<body>
    <div class="wrap">
        <div class="hero">
            <h1>${item.title}</h1>
            <div class="sub">${item.author} — ${item.field} — ${item.era}</div>
            <div class="meta">
                <span class="badge">${card.subjectGroup || item.field}</span>
                <span class="badge">${card.country || 'غير محدد'}</span>
                <span class="badge">${card.city || 'غير محدد'}</span>
                <span class="badge">${card.yearHijri || 'بلا تاريخ'}</span>
            </div>
        </div>
        <div class="panel grid">
            <div class="card"><div class="title">الملخص</div><div>${item.summary}</div></div>
            <div class="card"><div class="title">التأصيل الشرعي</div><ul>${(scriptural.quran || []).map((x)=>`<li>${x}</li>`).join('')}${(scriptural.sunnah || []).map((x)=>`<li>${x}</li>`).join('')}${(scriptural.athar || []).map((x)=>`<li>${x}</li>`).join('')}${(scriptural.usulRules || []).map((x)=>`<li>قاعدة أصولية: ${x}</li>`).join('')}</ul><div class="muted">${scriptural.principle || ''}</div></div>
            <div class="card"><div class="title">بيانات الوحي وصلتها</div><ul><li>سبب النزول: ${revelation.sababNuzul || 'غير محدد'}</li><li>وقت الوحي: ${revelation.revelationTime || 'غير محدد'}</li><li>مكي/مدني: ${revelation.makkiMadani || 'غير محدد'}</li><li>السورة: ${revelation.surahName || 'غير محدد'}</li><li>الآيات: ${revelation.ayahRange || 'غير محدد'}</li></ul></div>
            <div class="card"><div class="title">بطاقة الكتاب</div><ul><li>المجموعة: ${card.collection || 'غير محدد'}</li><li>الموقع: ${card.location || 'غير محدد'}</li><li>اللغة: ${card.language || 'غير محدد'}</li><li>سبب التأليف: ${card.writingReason || 'غير محدد'}</li><li>السياق: ${card.writingContext || 'غير محدد'}</li></ul></div>
            <div class="card"><div class="title">المؤلف</div><ul><li>السيرة: ${author.biography || 'غير محدد'}</li><li>الأصل: ${author.origin || 'غير محدد'}</li><li>تعلم من: ${(author.learnedFrom || []).join('، ') || 'غير محدد'}</li><li>تلاميذه: ${(author.students || []).join('، ') || 'غير محدد'}</li></ul></div>
            <div class="card"><div class="title">التصنيف الهرمي</div><ul><li>الكتاب: ${hierarchy.book || ''}</li><li>الباب: ${hierarchy.chapter || ''}</li><li>الفصل: ${hierarchy.section || ''}</li><li>المسألة: ${hierarchy.issue || ''}</li><li>التطبيق: ${hierarchy.application || ''}</li></ul></div>
            <div class="card"><div class="title">التتبع العلمي</div><ul><li>سبب العلم: ${trace.cause || 'غير محدد'}</li><li>الأثر: ${trace.impact || 'غير محدد'}</li><li>المستفيدون: ${(trace.beneficiaries || []).join('، ') || 'غير محدد'}</li><li>الدول: ${(trace.countries || []).join('، ') || 'غير محدد'}</li><li>العصور: ${(trace.erasApplied || []).join('، ') || 'غير محدد'}</li></ul></div>
        </div>
        <div class="panel"><a href="/library">العودة إلى المكتبة</a></div>
    </div>
</body>
</html>`);
});

app.get('/api/sheikha/library/timeline', (req, res) => {
    res.json({
        success: true,
        data: {
            timeline: ISLAMIC_DIGITIZATION_FRAMEWORK.timeline,
            anchors: [
                'عهد الأنبياء: الدعوة إلى توحيد الله',
                'عهد النبي محمد ﷺ: اكتمال الرسالة',
                'الخلفاء الراشدون: التمكين والتوثيق والنشر',
                'العصور العلمية الإسلامية: التأليف والتطبيق الحضاري',
                'العصر الرقمي: الفهرسة والذكاء الاصطناعي لخدمة العلم'
            ],
            examples: [
                'السفينة في قصة نوح عليه السلام مثال على العلم النافع والنجاة بأمر الله',
                'علم الفرائض والحساب في تنظيم الحقوق',
                'علم الحديث في توثيق السنة'
            ]
        },
        message: 'الخط الزمني للتوثيق والرقمنة من دعوة الأنبياء إلى العصر الرقمي',
        timestamp: nowIso()
    });
});

app.get('/library-dashboard', (req, res) => {
    res.redirect('/library');
});

// ═══ صفحة مرئية للتأصيل ودرجات الإسناد ═══
app.get('/taseel', (req, res) => {
        res.send(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>لوحة التأصيل — شيخة</title>
<style>
*{box-sizing:border-box}
body{font-family:'Tajawal',Arial,sans-serif;background:radial-gradient(circle at 85% 15%,#17202f 0,#090c14 40%,#06080e 100%);color:#eef3fb;margin:0;padding:18px}
.hero{max-width:1180px;margin:0 auto 18px;background:linear-gradient(125deg,#1c1a0f,#111827);border:1px solid #d4af37;border-radius:16px;padding:22px}
h1{margin:0 0 8px;color:#d4af37;font-size:1.6rem}
.sub{color:#b8c4d8;line-height:1.9}
.panel{max-width:1180px;margin:0 auto;background:#101623;border:1px solid #233149;border-radius:16px;padding:16px}
.topbar{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px}
.legend{display:flex;gap:8px;flex-wrap:wrap}
.pill{padding:5px 10px;border-radius:999px;font-size:.8rem;font-weight:bold}
.sahih{background:#0f3a22;color:#8ee5ad;border:1px solid #1e6f41}
.hasan{background:#4a3506;color:#ffd36c;border:1px solid #8b6820}
.daeef{background:#42131a;color:#ff9ba8;border:1px solid #7f2232}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
.card{background:#0b1220;border:1px solid #23344f;border-radius:12px;padding:14px}
.title{font-weight:bold;margin-bottom:6px}
.meta{color:#9eb0c9;font-size:.84rem;margin-bottom:8px}
.reasons{margin:8px 0;padding-right:17px;color:#dbe5f5}
.reasons li{margin:5px 0;font-size:.86rem}
.stats{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.stat{background:#111c2f;border:1px solid #274062;color:#89b8e5;border-radius:999px;padding:3px 9px;font-size:.78rem}
a{color:#8ecae6;text-decoration:none}
.nav{margin-top:10px;font-size:.86rem}
.nav a{margin-left:12px}
</style>
</head>
<body>
<div class="hero">
    <h1>لوحة التأصيل الشرعي والعلمي</h1>
    <div class="sub">عرض فوري لدرجة صحة الإسناد بالألوان، مع أسباب الحكم تلقائيًا، وبيان صلة الوسائل والغايات بالكتاب والسنة وتأسيسها الشرعي.</div>
</div>

<div class="panel">
    <div class="topbar">
        <div class="legend">
            <span class="pill sahih">صحيح</span>
            <span class="pill hasan">حسن</span>
            <span class="pill daeef">ضعيف</span>
        </div>
        <div class="nav">
            <a href="/library">المكتبة</a>
            <a href="/api/sheikha/taseel/public-summary">JSON الملخص</a>
            <a href="/api/sheikha/taseel/policy">سياسة التأصيل</a>
        </div>
    </div>
    <div class="grid" id="grid"></div>
</div>

<script>
const esc=(v)=>String(v||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function gradeClass(g){
    if(g==='صحيح') return 'sahih';
    if(g==='حسن') return 'hasan';
    return 'daeef';
}

function card(item){
    const cls = gradeClass(item.grade);
    const reasons = (item.reasons||[]).map(r=>'<li>'+esc(r)+'</li>').join('') || '<li>لا توجد أسباب مسجلة</li>';
    return '<div class="card">'
        +'<div class="title">'+esc(item.title)+'</div>'
        +'<div class="meta">'+esc(item.science)+' | '+esc(item.scienceType||'غير محدد')+'</div>'
        +'<span class="pill '+cls+'">'+esc(item.grade)+'</span>'
        +'<ul class="reasons">'+reasons+'</ul>'
        +'<div class="stats">'
            +'<span class="stat">درجة رقمية: '+esc(item.score)+'</span>'
            +'<span class="stat">آيات: '+esc(item.quranCount)+'</span>'
            +'<span class="stat">أحاديث: '+esc(item.sunnahCount)+'</span>'
            +'<span class="stat">أصول: '+esc(item.usulCount)+'</span>'
        +'</div>'
        +'</div>';
}

async function boot(){
    const r = await fetch('/api/sheikha/taseel/public-summary');
    const j = await r.json();
    const arr = j.data || [];
    document.getElementById('grid').innerHTML = arr.map(card).join('') || '<p style="color:#7487a3">لا توجد سجلات تأصيل بعد.</p>';
}

boot().catch(()=>{
    document.getElementById('grid').innerHTML = '<p style="color:#ff8f9e">تعذر تحميل بيانات التأصيل.</p>';
});
</script>
</body>
</html>`);
});

// ═══ صفحة المؤلفين البصرية ═══
app.get('/library/authors', (req, res) => {
    res.send(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>موسوعة المؤلفين — شيخة</title>
<style>
*{box-sizing:border-box}
body{font-family:'Tajawal',Arial,sans-serif;background:#09090f;color:#e4e8f0;margin:0;padding:16px}
.hero{max-width:1100px;margin:0 auto 20px;background:linear-gradient(135deg,#1a1408,#0f111a);
  border:1px solid #d4af37;border-radius:16px;padding:24px}
h1{margin:0 0 8px;color:#d4af37;font-size:1.6rem}
.sub{color:#a0aabb;line-height:1.8;font-size:.95rem}
.panel{max-width:1100px;margin:0 auto 16px;background:#111622;border:1px solid #1e2b3f;border-radius:14px;padding:16px}
.search{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
input{background:#080c14;border:1px solid #2d3f5a;color:#e4e8f0;border-radius:8px;padding:8px 12px;min-width:200px;font-family:inherit}
button{background:#1f6feb;border:0;color:#fff;border-radius:8px;padding:8px 14px;cursor:pointer;font-family:inherit}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.author-card{background:#0b1020;border:1px solid #263040;border-radius:12px;padding:16px;
  transition:border-color .2s}
.author-card:hover{border-color:#d4af37}
.author-name{color:#d4af37;font-size:1.1rem;font-weight:bold;margin-bottom:4px}
.author-dates{color:#7a9bb8;font-size:.82rem;margin-bottom:10px}
.author-bio{color:#c8d4e0;font-size:.88rem;line-height:1.7;margin-bottom:10px}
.section-label{color:#6fcf97;font-size:.8rem;font-weight:bold;margin-bottom:4px;margin-top:10px}
.tags{display:flex;flex-wrap:wrap;gap:4px}
.tag{background:#1a2740;color:#8ecae6;border-radius:20px;padding:2px 10px;font-size:.78rem}
.tag.orange{background:#2d1f06;color:#d4af37}
.tag.green{background:#0a2015;color:#6fcf97}
.tag.red{background:#200810;color:#f46f6f}
.book-link{color:#8ecae6;text-decoration:none;font-size:.85rem}
.book-link:hover{text-decoration:underline}
.nav{margin-bottom:12px;font-size:.85rem}
.nav a{color:#8ecae6;text-decoration:none;margin-left:12px}
.stats-bar{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.stat{background:#0f1420;border:1px solid #1e2d42;border-radius:8px;padding:8px 14px;text-align:center}
.stat .num{font-size:1.3rem;color:#6fcf97;font-weight:bold}
.stat .lbl{font-size:.75rem;color:#6a7f96}
.method-section{background:#080f1c;border-radius:8px;padding:10px;margin-top:8px}
.method-title{color:#b87333;font-size:.8rem;font-weight:bold;margin-bottom:6px}
</style>
</head>
<body>
<div class="hero">
  <h1>🧑‍🏫 موسوعة المؤلفين — شيخة</h1>
  <div class="sub">سيرة كل مؤلف: نشأته، شيوخه، طلابه، أسباب تأليفه، منهجيته العلمية، ومساره الفكري.</div>
</div>
<div class="panel">
  <div class="nav">
    <a href="/library">← المكتبة</a>
    <a href="/library/hadith-network">شبكة الرواة والتابعين</a>
    <a href="/api/sheikha/library/methodology-report">تقرير المنهجيات</a>
  </div>
  <div class="stats-bar" id="statsBar"></div>
  <div class="search">
    <input id="q" placeholder="ابحث عن مؤلف أو تخصص أو بلد..."/>
    <button onclick="doSearch()">بحث</button>
    <button onclick="loadAll()">عرض الكل</button>
  </div>
  <div class="grid" id="grid"></div>
</div>
<script>
const esc=(v)=>String(v||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const arr=(v)=>Array.isArray(v)?v:(v?[v]:[]);

function renderCard(a){
  const m = a.methodology || {};
  const books = (a.books||[]).map(b=>
    '<a class="book-link" href="/library/card/'+b.id+'">'+esc(b.title)+'</a>'
  ).join(' &bull; ') || '<span style="color:#444">لا توجد كتب</span>';

  const tags=(list,cls='')=>arr(list).map(t=>'<span class="tag '+cls+'">'+esc(t)+'</span>').join('');

  const methodHTML = (m.firstTools||[]).length||m.intellectualJourney ? \`
  <div class="method-section">
    <div class="method-title">المنهجية العلمية</div>
    \${m.researchCauses&&arr(m.researchCauses).length?'<div class="section-label">الأسباب</div><div class="tags">'+tags(m.researchCauses,'red')+'</div>':''}
    \${m.intellectualJourney?'<div class="section-label">مسيرة الفكر</div><div style="color:#b0bfcf;font-size:.83rem">'+esc(m.intellectualJourney)+'</div>':''}
    \${m.whatObserved?'<div class="section-label">ما لاحظه</div><div style="color:#b0bfcf;font-size:.83rem">'+esc(m.whatObserved)+'</div>':''}
    \${m.howInterpreted?'<div class="section-label">طريقة التفسير</div><div style="color:#b0bfcf;font-size:.83rem">'+esc(m.howInterpreted)+'</div>':''}
    \${m.firstTools&&arr(m.firstTools).length?'<div class="section-label">الأدوات الأولى</div><div class="tags">'+tags(m.firstTools)+'</div>':''}
    \${m.sciencesUsed&&arr(m.sciencesUsed).length?'<div class="section-label">العلوم المستخدمة</div><div class="tags">'+tags(m.sciencesUsed,'green')+'</div>':''}
    \${m.purposeGoals&&arr(m.purposeGoals).length?'<div class="section-label">الغايات</div><div class="tags">'+tags(m.purposeGoals,'orange')+'</div>':''}
  </div>\` : '';

  return '<div class="author-card">'
    +'<div class="author-name">'+esc(a.name)+'</div>'
    +'<div class="author-dates">'+esc(a.birthYearHijri?(a.birthYearHijri+' — '+(a.deathYearHijri||'?')+' هـ'):a.era||'')+'</div>'
    +(a.biography?'<div class="author-bio">'+esc(a.biography)+'</div>':'')
    +(a.origin?'<div class="section-label">البلد والمنشأ</div><div class="tags"><span class="tag orange">'+esc(a.origin)+'</span></div>':'')
    +(arr(a.learnedFrom).length?'<div class="section-label">تعلم من</div><div class="tags">'+tags(a.learnedFrom)+'</div>':'')
    +(arr(a.students).length?'<div class="section-label">طلابه</div><div class="tags">'+tags(a.students,'green')+'</div>':'')
    +methodHTML
    +'<div class="section-label" style="margin-top:10px">كتبه المسجلة</div>'
    +'<div style="line-height:2">'+books+'</div>'
    +'</div>';
}

async function loadAll(){
  const r = await fetch('/api/sheikha/library/authors');
  const j = await r.json();
  const authors = j.data||[];
  const total = j.total||0;
  document.getElementById('statsBar').innerHTML =
    '<div class="stat"><div class="num">'+total+'</div><div class="lbl">مؤلف</div></div>'
    +'<div class="stat"><div class="num">'+authors.reduce((s,a)=>(a.books||[]).length+s,0)+'</div><div class="lbl">كتاب مسجل</div></div>';
  document.getElementById('grid').innerHTML = authors.map(renderCard).join('') || '<p style="color:#666">لا يوجد مؤلفون مسجلون بعد.</p>';
}

async function doSearch(){
  const q = document.getElementById('q').value.trim();
  if(!q){return loadAll();}
  const r = await fetch('/api/sheikha/library/search?q='+encodeURIComponent(q));
  const j = await r.json();
  const seen = {};
  const authors = [];
  (j.data||[]).forEach(item=>{
    const n = item.author;
    if(!seen[n]){
      seen[n]=true;
      const m = item.methodology||{};
      const ap = item.authorProfile||{};
      authors.push({
        name:n, era:item.era,
        biography:ap.biography||'',
        origin:ap.origin||'',
        birthYearHijri:ap.birthYearHijri||'',
        deathYearHijri:ap.deathYearHijri||'',
        learnedFrom:ap.learnedFrom||[],
        students:ap.students||[],
        methodology:m,
        books:[{id:item.id,title:item.title}]
      });
    }
  });
  document.getElementById('grid').innerHTML = authors.map(renderCard).join('') || '<p style="color:#666">لا نتائج.</p>';
}

loadAll().catch(()=>{ document.getElementById('grid').innerHTML='<p style="color:#f46f6f">خطأ في تحميل البيانات.</p>'; });
</script>
</body>
</html>`);
});

// ═══ صفحة شبكة الرواة والتابعين البصرية ═══
app.get('/library/hadith-network', (req, res) => {
    res.send(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>شبكة الرواة والتابعين — شيخة</title>
<style>
*{box-sizing:border-box}
body{font-family:'Tajawal',Arial,sans-serif;background:#09090f;color:#e4e8f0;margin:0;padding:16px}
.hero{max-width:1100px;margin:0 auto 20px;background:linear-gradient(135deg,#0a1a14,#0f111a);
  border:1px solid #6fcf97;border-radius:16px;padding:24px}
h1{margin:0 0 8px;color:#6fcf97;font-size:1.6rem}
.sub{color:#a0aabb;line-height:1.8;font-size:.95rem}
.panel{max-width:1100px;margin:0 auto 16px;background:#111622;border:1px solid #1e2b3f;border-radius:14px;padding:16px}
.nav{margin-bottom:12px;font-size:.85rem}
.nav a{color:#8ecae6;text-decoration:none;margin-left:12px}
.net-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:700px){.net-grid{grid-template-columns:1fr}}
.col-title{color:#d4af37;font-size:1rem;font-weight:bold;margin-bottom:12px;
  padding-bottom:8px;border-bottom:1px solid #1e2d42}
.node{background:#0b1020;border:1px solid #1e2d3a;border-radius:10px;padding:12px;margin-bottom:10px}
.node-name{color:#6fcf97;font-weight:bold;font-size:.95rem;margin-bottom:6px}
.links{display:flex;flex-wrap:wrap;gap:4px}
.link-tag{background:#0f2a1a;color:#6fcf97;border-radius:16px;padding:2px 10px;font-size:.78rem;
  border:1px solid #1a4028}
.tabiin-tag{background:#2a1a0f;color:#d4af37;border-radius:16px;padding:2px 10px;font-size:.78rem;
  border:1px solid #40280a}
.stats-bar{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px}
.stat{background:#0f1420;border:1px solid #1e2d42;border-radius:8px;padding:8px 14px;text-align:center}
.stat .num{font-size:1.3rem;color:#6fcf97;font-weight:bold}
.stat .lbl{font-size:.75rem;color:#6a7f96}
.chain-box{background:#080f1a;border:1px solid #1a2d1a;border-radius:8px;padding:12px;margin-bottom:10px}
.chain-title{color:#8ecae6;font-size:.85rem;font-weight:bold;margin-bottom:8px}
.chain{display:flex;align-items:center;flex-wrap:wrap;gap:4px;font-size:.82rem}
.chain-node{background:#0f1a2a;color:#c8d4e8;border-radius:6px;padding:3px 8px;border:1px solid #1e3040}
.chain-arrow{color:#d4af37;font-weight:bold;font-size:1.1rem}
</style>
</head>
<body>
<div class="hero">
  <h1>🔗 شبكة الرواة والتابعين والعلماء</h1>
  <div class="sub">خريطة الإسناد العلمي — من تعلم من مَن — سلاسل التحمل والأداء في الحديث والعلوم الإسلامية.</div>
</div>
<div class="panel">
  <div class="nav">
    <a href="/library">← المكتبة</a>
    <a href="/library/authors">موسوعة المؤلفين</a>
    <a href="/api/sheikha/library/hadith-network">JSON خام</a>
  </div>
  <div class="stats-bar" id="statsBar"></div>
  <div id="chains"></div>
  <div class="net-grid">
    <div>
      <div class="col-title">📜 سلاسل الرواة</div>
      <div id="narrators"></div>
    </div>
    <div>
      <div class="col-title">🕌 التابعون المرتبطون</div>
      <div id="tabiin"></div>
    </div>
  </div>
</div>
<script>
const esc=(v)=>String(v||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');

async function boot(){
  const [netR, authR] = await Promise.all([
    fetch('/api/sheikha/library/hadith-network'),
    fetch('/api/sheikha/library/authors')
  ]);
  const net = await netR.json();
  const authJ = await authR.json();

  const narrators = net.data?.narrators || [];
  const tabiin = net.data?.tabiin || [];
  const authors = authJ.data || [];

  document.getElementById('statsBar').innerHTML =
    '<div class="stat"><div class="num">'+narrators.length+'</div><div class="lbl">راوٍ موثق</div></div>'
    +'<div class="stat"><div class="num">'+tabiin.length+'</div><div class="lbl">تابعي</div></div>'
    +'<div class="stat"><div class="num">'+authors.length+'</div><div class="lbl">مؤلف</div></div>';

  // سلاسل الإسناد من بيانات المؤلفين
  const chains = authors.filter(a=>(a.learnedFrom||[]).length>0).map(a=>{
    const chain = [...(a.learnedFrom||[])].reverse();
    chain.push(a.name);
    return {name:a.name, chain};
  });

  document.getElementById('chains').innerHTML = chains.length ?
    '<div class="chain-box"><div class="chain-title">⛓️ سلاسل الإسناد العلمي (من الشيخ إلى التلميذ)</div>'
    + chains.slice(0,12).map(c=>
      '<div class="chain">'
      + c.chain.map((n,i)=>
          '<span class="chain-node">'+esc(n)+'</span>'
          +(i<c.chain.length-1?'<span class="chain-arrow">←</span>':'')
        ).join('')
      +'</div>'
    ).join('')
    +'</div>' : '';

  document.getElementById('narrators').innerHTML = narrators.length ?
    narrators.map(n=>
      '<div class="node"><div class="node-name">'+esc(n.name)+'</div>'
      +(n.links&&n.links.length?
        '<div class="links">'+n.links.map(l=>'<span class="link-tag">'+esc(l)+'</span>').join('')+'</div>'
        :'<span style="color:#444;font-size:.8rem">لا روابط مسجلة</span>')
      +'</div>'
    ).join('') : '<p style="color:#555">لا يوجد رواة مسجلون بعد.</p>';

  document.getElementById('tabiin').innerHTML = tabiin.length ?
    tabiin.map(t=>
      '<div class="node"><div class="node-name" style="color:#d4af37">'+esc(t.name)+'</div>'
      +(t.links&&t.links.length?
        '<div class="links">'+t.links.map(l=>'<span class="tabiin-tag">'+esc(l)+'</span>').join('')+'</div>'
        :'<span style="color:#444;font-size:.8rem">لا روابط مسجلة</span>')
      +'</div>'
    ).join('') : '<p style="color:#555">لا يوجد تابعون مباشرون بعد.</p>';
}

boot().catch(()=>{
  document.querySelector('.panel').innerHTML += '<p style="color:#f46f6f">خطأ في تحميل الشبكة.</p>';
});
</script>
</body>
</html>`);
});

app.get('/publication-program', (req, res) => {
    res.send(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>برنامج النشر العلمي — شيخة</title>
    <style>
        body{font-family:'Tajawal',Arial,sans-serif;background:#0b0f17;color:#eef3fb;margin:0;padding:18px}
        .hero,.panel{max-width:1120px;margin:0 auto 16px;background:#121927;border:1px solid #2a3550;border-radius:16px;padding:18px}
        .hero{background:linear-gradient(125deg,#1e180b,#111927);border-color:#d4af37}
        h1{margin:0 0 8px;color:#d4af37}.sub{color:#c4cfdf;line-height:1.9}
        .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
        .card{background:#0f1522;border:1px solid #2a3550;border-radius:12px;padding:14px}
        .title{color:#d4af37;font-weight:bold;margin-bottom:8px}
        ul{margin:0;padding-right:18px} li{margin:6px 0}
        a{color:#8ecae6;text-decoration:none}
    </style>
</head>
<body>
    <div class="hero">
        <h1>برنامج النشر العلمي للأمة</h1>
        <div class="sub">برنامج لتأسيس القرآن الكريم والسنة والعلوم الشرعية والعلوم النافعة كأساس علمي أول للأمة، مع الطباعة والنشر الإلكتروني والتحكيم والتطبيق.</div>
    </div>
    <div class="panel">
        <div style="margin-bottom:12px"><a href="/library">المكتبة</a> <a href="/api/sheikha/library/publication-program">JSON البرنامج</a></div>
        <div class="grid" id="grid"></div>
    </div>
    <script>
        async function j(url){ const r = await fetch(url); return r.json(); }
        function esc(v){ return String(v||'').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
        function card(title, items){ return '<div class="card"><div class="title">'+esc(title)+'</div><ul>'+items.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join('')+'</ul></div>'; }
        async function boot(){
            const out = await j('/api/sheikha/library/publication-program');
            const p = out.data || {};
            document.getElementById('grid').innerHTML = [
                card('الأسس', p.foundations || []),
                card('مسارات النشر', p.publicationTracks || []),
                card('سياسة الجودة', p.qualityPolicy || []),
                card('المسار الإداري الحضاري', p.administrativeCivilizationalTrack || []),
                card('سياسة حماية العلم', p.protectionPolicy || []),
                card('المخرجات للأمة', p.globalUmmahOutcomes || [])
            ].join('');
        }
        boot().catch(function(){
            document.getElementById('grid').innerHTML = '<div class="card"><div class="title">تعذر التحميل</div><div>تحقق من تشغيل الخدمة.</div></div>';
        });
    </script>
</body>
</html>`);
});

app.get('/systems-execution', (req, res) => {
    res.send(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>لوحة التنفيذ التشغيلي — شيخة</title>
    <style>
        body{font-family:'Tajawal',Arial,sans-serif;background:#0b111a;color:#eef3fb;margin:0;padding:18px}
        .hero,.panel{max-width:1140px;margin:0 auto 16px;background:#121c2c;border:1px solid #2a3a56;border-radius:16px;padding:18px}
        .hero{background:linear-gradient(125deg,#1e1708,#121c2c);border-color:#d4af37}
        h1{margin:0 0 8px;color:#d4af37}.sub{color:#c4cfdf;line-height:1.9}
        .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
        .stat{background:#0f1726;border:1px solid #2a3a56;border-radius:12px;padding:12px}
        .num{font-size:1.6rem;color:#6fcf97;font-weight:bold}.lbl{font-size:.82rem;color:#9eb1ca}
        .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}
        .card{background:#0f1726;border:1px solid #2a3a56;border-radius:12px;padding:14px}
        .title{color:#d4af37;font-weight:bold;margin-bottom:8px}
        ul{margin:0;padding-right:18px} li{margin:6px 0}
        a{color:#8ecae6;text-decoration:none}
    </style>
</head>
<body>
    <div class="hero">
        <h1>لوحة التنفيذ التشغيلي ربع السنوية</h1>
        <div class="sub">تنفيذ الأنظمة الإسلامية (الإدارة، الإمداد، الابتكار، الصناعة، الزراعة، الذكاء، الحوسبة) مع قياس الجاهزية وتحليل الفجوات ودمج كل العلوم بالذكاء الصناعي وفق الكتاب والسنة.</div>
    </div>

    <div class="panel">
        <div style="margin-bottom:12px">
            <a href="/ilm">مرجع العلم</a>
            <a href="/api/sheikha/ilm/execution/scorecard">بطاقة القياس JSON</a>
            <a href="/api/sheikha/ilm/execution/readiness">الجاهزية والفجوات JSON</a>
            <a href="/api/sheikha/ilm/ai-integration">دمج العلوم بالذكاء JSON</a>
            <a href="/api/sheikha/tech-access/foundation">أساس الوصول التقني JSON</a>
            <a href="/api/sheikha/tech-access/zero-click/status">حالة التكامل التلقائي JSON</a>
            <a href="/ummah-organizations">منظمات الأمة العالمية</a>
            <a href="/intelligent-fusion-system">النظام الإسلامي الذكي المندمج</a>
            <a href="/intelligent-fusion-cockpit">Cockpit النظام المندمج</a>
            <a href="/mhs-vision">رؤية MHS البصرية</a>
        </div>
        <div class="stats" id="stats"></div>
    </div>

    <div class="panel">
        <div class="grid" id="grid"></div>
    </div>

    <script>
        async function j(url){ const r = await fetch(url); return r.json(); }
        function esc(v){ return String(v||'').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
        function card(title, items){ return '<div class="card"><div class="title">'+esc(title)+'</div><ul>'+items.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join('')+'</ul></div>'; }

        async function boot(){
            const [scorecardOut, readinessOut, aiOut, zeroClickOut] = await Promise.all([
                j('/api/sheikha/ilm/execution/scorecard'),
                j('/api/sheikha/ilm/execution/readiness'),
                j('/api/sheikha/ilm/ai-integration'),
                j('/api/sheikha/tech-access/zero-click/status')
            ]);

            const scorecard = scorecardOut.data || {};
            const readiness = readinessOut.data || {};
            const ai = aiOut.data || {};
            const zeroClick = zeroClickOut.data || {};

            document.getElementById('stats').innerHTML = [
                ['درجة الجاهزية', readiness.readinessScore || 0],
                ['عدد الأنظمة', readiness.totalSystems || 0],
                ['عدد الفجوات', readiness.totalGaps || 0],
                ['مجالات العلوم المدمجة', (ai.knowledgeDomains || []).length],
                ['التكامل التلقائي', zeroClick.autoMode ? 'مفعل' : 'غير مفعل'],
                ['أنظمة KPI الحية', zeroClick.liveSystems || 0]
            ].map(function(x){ return '<div class="stat"><div class="num">'+esc(x[1])+'</div><div class="lbl">'+esc(x[0])+'</div></div>'; }).join('');

            const systemCards = (scorecard.systems || []).map(function(s){
                return card(s.label + ' — مؤشرات', s.metrics || []);
            });

            document.getElementById('grid').innerHTML = [
                card('أبعاد القياس الموحد', scorecard.dimensions || []),
                card('خريطة الدمج الربع سنوية', ai.quarterlyRoadmap || []),
                card('توصيات سد الفجوات', readiness.recommendations || []),
                card('الفجوات الحالية', readiness.gaps || ['لا توجد فجوات رئيسية حالياً']),
                card('طبقات دمج العلوم بالذكاء', ai.operatingLayers || []),
                card('حوكمة الدمج الشرعي التقني', ai.governance || []),
                card('قواعد السلامة للتكامل التلقائي', zeroClick.safetyRules || []),
                card('مرجع المنظمات العالمية', [
                    'صفحة مرئية: /ummah-organizations',
                    'API جامع: /api/sheikha/organizations/global',
                    'يشمل الحزمة العالمية الموحدة للمنظمات الإسلامية'
                ]),
                card('منظومة التقنية الإسلامية المندمجة', [
                    'صفحة مرئية: /intelligent-fusion-system',
                    'API مستقل: /api/sheikha/system/intelligent-fusion',
                    'يشمل MHS ERP وXR والبلوك شين وسلاسل الإمداد والذكاء المحيطي'
                ]),
                card('Cockpit تنفيذي ذكي', [
                    'صفحة cockpit: /intelligent-fusion-cockpit',
                    'KPI: /api/sheikha/system/intelligent-fusion/kpi',
                    'MHS ERP: /api/sheikha/system/mhs-erp'
                ]),
                card('MHS Core مستقل', [
                    'صفحة بصرية: /mhs-vision',
                    'API: /api/mhs/core',
                    'تركيز: لا ضرر ولا ضرار + التفاعل الصفري + الإدارة الذكية'
                ])
            ].concat(systemCards).join('');
        }

        boot().catch(function(){
            document.getElementById('grid').innerHTML = '<div class="card"><div class="title">تعذر التحميل</div><div>تحقق من تشغيل الخدمة.</div></div>';
        });
    </script>
</body>
</html>`);
});

app.get('/ummah-organizations', (req, res) => {
    res.send(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>منظمات الأمة العالمية — شيخة</title>
    <style>
        :root{--bg:#0a0f16;--panel:#101926;--card:#0d1622;--line:#24354f;--gold:#d4af37;--copper:#b87333;--mint:#79d9b7;--text:#edf3fb;--muted:#a8b8cc}
        body{font-family:'Tajawal',Arial,sans-serif;background:radial-gradient(circle at top right,#261a08,transparent 28%),linear-gradient(180deg,#08101a,#0c1521 45%,#09111a);color:var(--text);margin:0;padding:20px}
        .hero,.panel{max-width:1220px;margin:0 auto 16px;background:rgba(16,25,38,.92);border:1px solid var(--line);border-radius:18px;padding:20px;backdrop-filter:blur(8px)}
        .hero{background:linear-gradient(125deg,rgba(184,115,51,.16),rgba(10,15,22,.95) 40%,rgba(212,175,55,.10));border-color:rgba(212,175,55,.5)}
        h1,h2{margin:0 0 10px;color:var(--gold)}
        .sub{color:var(--muted);line-height:1.9}
        .links{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
        a{color:#9ed8ff;text-decoration:none}
        .stats,.grid{display:grid;gap:12px}
        .stats{grid-template-columns:repeat(auto-fit,minmax(190px,1fr));margin-top:16px}
        .grid{grid-template-columns:repeat(auto-fit,minmax(290px,1fr))}
        .stat,.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px}
        .num{font-size:1.7rem;color:var(--mint);font-weight:bold}
        .lbl{font-size:.84rem;color:var(--muted)}
        .title{color:var(--gold);font-weight:bold;margin-bottom:10px}
        .org{border-top:1px solid rgba(255,255,255,.06);padding-top:10px;margin-top:10px}
        .badge{display:inline-block;padding:4px 8px;border:1px solid rgba(212,175,55,.35);border-radius:999px;color:var(--gold);font-size:.78rem;margin-left:6px;margin-bottom:6px}
        ul{margin:0;padding-right:18px}
        li{margin:6px 0}
        .muted{color:var(--muted)}
    </style>
</head>
<body>
    <div class="hero">
        <h1>المنظمات العالمية لأمة محمد صلى الله عليه وسلم</h1>
        <div class="sub">واجهة مرئية للحزمة العالمية الموحدة: البذرة والنواة والجذر الإسلامي الرقمي، والمنظمات القطاعية العالمية للأسواق والمعادن والسكراب والطاقة والبترول والطبيعة واللوجستيات والاقتصاد والتجارة.</div>
        <div class="links">
            <a href="/api/sheikha/organizations/global">الـ API الجامع JSON</a>
            <a href="/api/sheikha/organization/transport">مرجع النقل الإسلامي JSON</a>
            <a href="/api/sheikha/system/intelligent-fusion">مرجع النظام الذكي المندمج JSON</a>
            <a href="/api/sheikha/blockchain/status">حالة البلوك شين JSON</a>
            <a href="/api/sheikha/organization/arab-islamic">مرجع المنظمة العربية الإسلامية</a>
            <a href="/intelligent-fusion-system">واجهة النظام الإسلامي الذكي</a>
            <a href="/systems-execution">العودة إلى لوحة التنفيذ</a>
            <a href="/ilm">مرجع العلم</a>
        </div>
        <div class="stats" id="stats"></div>
    </div>

    <div class="panel">
        <h2>الحزمة العالمية الموحدة</h2>
        <div class="grid" id="grid"></div>
    </div>

    <script>
        async function j(url){ const r = await fetch(url); return r.json(); }
        function esc(v){ return String(v || '').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
        function list(items){ return '<ul>' + (items || []).map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }
        function card(title, body){ return '<div class="card"><div class="title">' + esc(title) + '</div>' + body + '</div>'; }

        async function boot(){
            const out = await j('/api/sheikha/organizations/global');
            const data = out.data || {};
            const identity = data.identity || {};
            const scopes = data.multiScopeCoverage || [];
            const rootModel = data.rootModel || {};
            const currency = data.unifiedCurrencyFramework || {};
            const transport = data.transportConvergenceModel || {};
            const fusion = data.intelligentFusionModel || {};
            const orgs = data.organizations || [];

            document.getElementById('stats').innerHTML = [
                ['عدد المنظمات', data.totalOrganizations || 0],
                ['النطاق', identity.operatingRange || 'عالمي'],
                ['الجمهور', identity.audience || 'أمة محمد صلى الله عليه وسلم'],
                ['المنظمات المرتبطة', (data.linkedOrganizations || []).length]
            ].map(function(x){ return '<div class="stat"><div class="num">' + esc(x[1]) + '</div><div class="lbl">' + esc(x[0]) + '</div></div>'; }).join('');

            const orgCards = orgs.map(function(org){
                return '<div class="card">'
                    + '<div class="title">' + esc(org.nameAr) + '</div>'
                    + '<div class="badge">' + esc(org.scope) + '</div>'
                    + '<div class="badge">' + esc(org.sector) + '</div>'
                    + '<div class="org"><div class="muted">' + esc(org.nameEn) + '</div></div>'
                    + '<div class="org"><strong>الرسالة:</strong> ' + esc(org.mission) + '</div>'
                    + '<div class="org"><strong>الجمهور:</strong> ' + esc(org.audience) + '</div>'
                    + '</div>';
            });

            document.getElementById('grid').innerHTML = [
                card('هوية الحزمة', list([
                    identity.name,
                    'النطاق: ' + (identity.operatingRange || ''),
                    'الأساس: ' + (identity.foundation || ''),
                    'الهدف: ' + (identity.objective || '')
                ])),
                card(rootModel.title || 'البذرة والنواة والجذر الإسلامي الرقمي', list(rootModel.pillars || [])),
                card(currency.title || 'العملة الإسلامية الموحدة شيخة', list([
                    'الاسم: ' + (currency.name || 'شيخة'),
                    'التصنيف: ' + (currency.class || ''),
                    'النطاق: ' + (currency.scope || ''),
                    'الرسالة: ' + (currency.mission || ''),
                    'التموضع: ' + (currency.positioning || '')
                ]).replace('</ul>', (currency.principles || []).map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>')),
                card('أنماط تفعيل شيخة', list(currency.activationModes || [])),
                card('النطاقات الجغرافية والتشغيلية', list(scopes.length ? scopes : ['عالمي'])),
                card(transport.title || 'مخطط النقل-اللوجستيات-الشبكات', list((transport.layers || []).concat(transport.transportSmartKpis || []))),
                card(fusion.title || 'منظومة التقنية الإسلامية المندمجة', list([
                    'الاسم المعماري: ' + (fusion.architectureName || ''),
                    'الهدف: ' + (fusion.objective || ''),
                    'الفكرة: ' + (fusion.coreIdea || '')
                ]).replace('</ul>', (fusion.layers || []).map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + (fusion.flagshipCapabilities || []).map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>')),
                card('الحوكمة العامة', list(data.governance || [])),
                card('المنظمات المرتبطة تقنياً ومعرفياً', list(data.linkedOrganizations || []))
            ].concat(orgCards).join('');
        }

        boot().catch(function(){
            document.getElementById('grid').innerHTML = card('تعذر التحميل', '<div class="muted">تعذر تحميل بيانات المنظمات العالمية.</div>');
        });
    </script>
</body>
</html>`);
});

app.get('/intelligent-fusion-system', (req, res) => {
    res.send(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>النظام الإسلامي الذكي المندمج — شيخة</title>
    <style>
        :root{--bg:#09111a;--panel:#0f1a26;--card:#101a25;--line:#22405d;--gold:#d4af37;--copper:#b87333;--sky:#8dd7ff;--mint:#82e0c3;--text:#eef5ff;--muted:#a8bbcd}
        *{box-sizing:border-box}
        body{margin:0;font-family:'Tajawal',Arial,sans-serif;color:var(--text);background:radial-gradient(circle at 15% 20%,rgba(184,115,51,.18),transparent 22%),radial-gradient(circle at 85% 15%,rgba(141,215,255,.18),transparent 22%),linear-gradient(180deg,#071019,#0a1320 42%,#09111a)}
        .shell{max-width:1280px;margin:0 auto;padding:22px}
        .hero,.panel{border:1px solid var(--line);background:rgba(15,26,38,.94);border-radius:22px;backdrop-filter:blur(10px)}
        .hero{padding:28px;background:linear-gradient(135deg,rgba(184,115,51,.18),rgba(12,22,34,.96) 35%,rgba(141,215,255,.12) 100%)}
        .hero h1{margin:0 0 10px;color:var(--gold);font-size:2rem}
        .hero p{margin:0;color:var(--muted);line-height:1.95;max-width:1000px}
        .links{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
        a{color:var(--sky);text-decoration:none}
        .stats,.grid,.bands{display:grid;gap:14px}
        .stats{grid-template-columns:repeat(auto-fit,minmax(180px,1fr));margin:18px 0}
        .grid{grid-template-columns:repeat(auto-fit,minmax(280px,1fr));margin-top:16px}
        .bands{grid-template-columns:1.15fr .85fr;margin-top:16px}
        .panel{padding:18px;margin-top:16px}
        .stat,.card{background:linear-gradient(180deg,rgba(16,26,37,.96),rgba(10,18,27,.98));border:1px solid rgba(141,215,255,.12);border-radius:18px;padding:16px}
        .stat .num{font-size:1.8rem;color:var(--mint);font-weight:700}
        .stat .lbl{font-size:.86rem;color:var(--muted)}
        .card .title{font-weight:700;color:var(--gold);margin-bottom:10px}
        .badge{display:inline-block;padding:5px 10px;border:1px solid rgba(212,175,55,.35);border-radius:999px;color:var(--gold);font-size:.78rem;margin-left:6px;margin-bottom:8px}
        .rail{display:grid;gap:10px}
        .strip{padding:12px 14px;border-radius:14px;border:1px solid rgba(130,224,195,.14);background:rgba(130,224,195,.05)}
        .strip strong{color:var(--mint)}
        ul{margin:0;padding-right:18px}
        li{margin:7px 0}
        .org{border-top:1px solid rgba(255,255,255,.06);margin-top:10px;padding-top:10px}
        .muted{color:var(--muted)}
        @media (max-width:900px){.bands{grid-template-columns:1fr}}
    </style>
</head>
<body>
    <div class="shell">
        <div class="hero">
            <h1>النظام الإسلامي الذكي المندمج</h1>
            <p>منصة تشغيل إسلامية موحدة تجمع الواقع الممتد والذكاء الصناعي والبلوك شين المؤسسي وسلاسل الإمداد الذكية ونظام MHS ERP / MIS الإسلامي والتفاعل الصفري الواعي بالسياق، لخدمة الدين الإسلامي وأمة محمد صلى الله عليه وسلم والمنفعة العامة والحياة الكريمة.</p>
            <div class="links">
                <a href="/api/sheikha/system/intelligent-fusion">الـ API المستقل JSON</a>
                <a href="/api/sheikha/system/intelligent-fusion/kpi">KPI JSON</a>
                <a href="/api/sheikha/system/mhs-erp">MHS ERP JSON</a>
                <a href="/api/mhs/core">MHS Core JSON</a>
                <a href="/intelligent-fusion-cockpit">لوحة القيادة التنفيذية</a>
                <a href="/mhs-vision">الرؤية البصرية MHS</a>
                <a href="/api/sheikha/organizations/global">الحزمة العالمية JSON</a>
                <a href="/ummah-organizations">منظمات الأمة العالمية</a>
                <a href="/systems-execution">لوحة التنفيذ</a>
            </div>
            <div class="stats" id="stats"></div>
        </div>

        <div class="bands">
            <div class="panel">
                <div class="grid" id="grid"></div>
            </div>
            <div class="panel">
                <div class="rail" id="rail"></div>
            </div>
        </div>
    </div>

    <script>
        async function j(url){ const r = await fetch(url); return r.json(); }
        function esc(v){ return String(v || '').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
        function list(items){ return '<ul>' + (items || []).map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }
        function card(title, body){ return '<div class="card"><div class="title">' + esc(title) + '</div>' + body + '</div>'; }

        async function boot(){
            const out = await j('/api/sheikha/system/intelligent-fusion');
            const data = out.data || {};
            const fusion = data.intelligentFusionModel || {};
            const mhs = fusion.mhsErpFramework || {};
            const orgs = data.specializedOrganizations || [];

            document.getElementById('stats').innerHTML = [
                ['المنظمات المتخصصة', orgs.length],
                ['النطاق', data.operatingRange || 'عالمي'],
                ['طبقات الدمج', (fusion.layers || []).length],
                ['وحدات MHS ERP/MIS', (mhs.modules || []).length]
            ].map(function(x){ return '<div class="stat"><div class="num">' + esc(x[1]) + '</div><div class="lbl">' + esc(x[0]) + '</div></div>'; }).join('');

            document.getElementById('grid').innerHTML = [
                card('الفكرة التشغيلية', list([
                    fusion.architectureName || '',
                    fusion.objective || '',
                    fusion.coreIdea || '',
                    fusion.interactionParadigm || ''
                ])),
                card('طبقات المنظومة', list(fusion.layers || [])),
                card('نسيج الاستشعار والتفاعل الحي', list(fusion.sensoryFabric || [])),
                card('نسيج البيانات الموحد', list(fusion.dataFabric || [])),
                card(mhs.title || 'نظام MHS ERP / MIS الإسلامي', list((mhs.modules || []).concat(mhs.aiModes || []))),
                card('الضوابط الإسلامية', list((fusion.islamicControls || []).concat(mhs.islamicAdminPrinciples || []))),
                card('سيناريوهات بلا ضغطة زر', list(fusion.zeroTouchScenarios || [])),
                card('المخرجات المتوقعة', list(fusion.outcomes || []))
            ].join('');

            document.getElementById('rail').innerHTML = [
                '<div class="strip"><strong>الهدف الأعلى:</strong> خدمة الدين الإسلامي وأمة محمد صلى الله عليه وسلم والمنفعة العامة بنظام حي يرى ويفهم ويوثق ويقترح ويعين على الحياة الكريمة.</div>',
                '<div class="strip"><strong>المجالات:</strong>' + list(fusion.targetDomains || []) + '</div>',
                '<div class="strip"><strong>القدرات الرئيسية:</strong>' + list(fusion.flagshipCapabilities || []) + '</div>',
                '<div class="strip"><strong>المنظمات المتخصصة:</strong>' + orgs.map(function(org){ return '<div class="org"><div class="badge">' + esc(org.sector) + '</div><div><strong>' + esc(org.nameAr) + '</strong></div><div class="muted">' + esc(org.nameEn) + '</div><div class="muted">' + esc(org.mission) + '</div></div>'; }).join('') + '</div>'
            ].join('');
        }

        boot().catch(function(){
            document.getElementById('grid').innerHTML = card('تعذر التحميل', '<div class="muted">تعذر تحميل بيانات النظام الإسلامي الذكي المندمج.</div>');
        });
    </script>
</body>
</html>`);
});

app.get('/intelligent-fusion-cockpit', (req, res) => {
    res.send(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>Executive Cockpit — النظام الإسلامي الذكي</title>
    <style>
        :root{--bg:#070f18;--panel:#0f1927;--line:#28425d;--gold:#d4af37;--mint:#7ee0c1;--sky:#9ad9ff;--text:#edf4ff;--muted:#a7bacd}
        body{margin:0;padding:20px;font-family:'Tajawal',Arial,sans-serif;color:var(--text);background:radial-gradient(circle at 12% 18%,rgba(212,175,55,.12),transparent 22%),radial-gradient(circle at 88% 16%,rgba(126,224,193,.12),transparent 22%),linear-gradient(180deg,#06101a,#0a1420)}
        .hero,.panel{max-width:1250px;margin:0 auto 14px;border:1px solid var(--line);border-radius:18px;background:rgba(15,25,39,.95);padding:18px}
        .hero{background:linear-gradient(130deg,rgba(212,175,55,.16),rgba(10,20,32,.96) 40%,rgba(154,217,255,.10));}
        h1{margin:0 0 10px;color:var(--gold)}
        .sub{color:var(--muted);line-height:1.9}
        .links{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}
        a{color:var(--sky);text-decoration:none}
        .stats,.grid{display:grid;gap:12px}
        .stats{grid-template-columns:repeat(auto-fit,minmax(170px,1fr));margin-top:12px}
        .grid{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
        .stat,.card{border:1px solid rgba(154,217,255,.16);border-radius:14px;background:#0d1723;padding:14px}
        .num{font-size:1.7rem;color:var(--mint);font-weight:700}
        .lbl{font-size:.84rem;color:var(--muted)}
        .title{font-weight:700;color:var(--gold);margin-bottom:8px}
        ul{margin:0;padding-right:18px}
        li{margin:6px 0}
    </style>
</head>
<body>
    <div class="hero">
        <h1>لوحة القيادة التنفيذية للنظام الإسلامي الذكي</h1>
        <div class="sub">Cockpit موحد للإدارة العليا: MHS ERP/MIS + KPI حي + طبقات الدمج الذكي الإسلامي.</div>
        <div class="links">
            <a href="/api/sheikha/system/intelligent-fusion/kpi">KPI JSON</a>
            <a href="/api/sheikha/system/mhs-erp">MHS ERP JSON</a>
            <a href="/api/mhs/core">MHS Core JSON</a>
            <a href="/api/sheikha/system/intelligent-fusion">Fusion JSON</a>
            <a href="/intelligent-fusion-system">واجهة النظام</a>
            <a href="/mhs-vision">الرؤية البصرية MHS</a>
            <a href="/systems-execution">لوحة التنفيذ</a>
        </div>
        <div class="stats" id="stats"></div>
    </div>

    <div class="panel">
        <div class="grid" id="grid"></div>
    </div>

    <script>
        async function j(url){ const r = await fetch(url); return r.json(); }
        function esc(v){ return String(v || '').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
        function list(items){ return '<ul>' + (items || []).map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }
        function card(title, body){ return '<div class="card"><div class="title">' + esc(title) + '</div>' + body + '</div>'; }

        async function boot(){
            const [kpiOut, mhsOut, fusionOut] = await Promise.all([
                j('/api/sheikha/system/intelligent-fusion/kpi'),
                j('/api/sheikha/system/mhs-erp'),
                j('/api/sheikha/system/intelligent-fusion')
            ]);

            const kpi = kpiOut.data || {};
            const mhs = mhsOut.data || {};
            const fusion = fusionOut.data || {};
            const kpiList = kpi.kpis || [];

            document.getElementById('stats').innerHTML = [
                ['درجة الجاهزية', kpi.readinessScore || 0],
                ['مؤشرات KPI', kpiList.length],
                ['وحدات MHS', (mhs.modules || []).length],
                ['أنماط AI الإدارية', (mhs.aiModes || []).length],
                ['المنظمات المتخصصة', (fusion.specializedOrganizations || []).length]
            ].map(function(x){ return '<div class="stat"><div class="num">' + esc(x[1]) + '</div><div class="lbl">' + esc(x[0]) + '</div></div>'; }).join('');

            document.getElementById('grid').innerHTML = [
                card('مؤشرات الأداء الحية', list(kpiList.map(function(item){
                    return (item.title || '') + ': ' + (item.value ?? '') + ' ' + (item.unit || '') + ' (الهدف: ' + (item.target ?? '') + ')';
                }))),
                card('وحدات MHS ERP/MIS', list(mhs.modules || [])),
                card('أوضاع الذكاء الصناعي الإداري', list(mhs.aiModes || [])),
                card('مبادئ الإدارة الإسلامية', list(mhs.islamicAdminPrinciples || [])),
                card('المنظمات المتخصصة', list((fusion.specializedOrganizations || []).map(function(org){ return org.nameAr; }))),
                card('المدى التشغيلي', list([fusion.operatingRange || 'عالمي']))
            ].join('');
        }

        boot().catch(function(){
            document.getElementById('grid').innerHTML = card('تعذر التحميل', '<div>تعذر تحميل بيانات الـ Cockpit التنفيذي.</div>');
        });
    </script>
</body>
</html>`);
});

app.get('/mhs-vision', (req, res) => {
    res.send(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>MHS Vision — منظومة شيخة</title>
    <style>
        :root{--bg:#080f18;--panel:#111b2a;--line:#29445f;--gold:#d4af37;--mint:#7ddfbe;--text:#edf5ff;--muted:#abc0d6}
        body{margin:0;padding:20px;background:radial-gradient(circle at 10% 18%,rgba(212,175,55,.14),transparent 22%),linear-gradient(180deg,#06101b,#0b1623);color:var(--text);font-family:'Tajawal',Arial,sans-serif}
        .hero,.panel{max-width:1220px;margin:0 auto 14px;background:rgba(17,27,42,.95);border:1px solid var(--line);border-radius:18px;padding:18px}
        .hero{background:linear-gradient(120deg,rgba(212,175,55,.18),rgba(10,20,32,.96) 35%,rgba(125,223,190,.1));}
        h1{margin:0 0 8px;color:var(--gold)}
        .sub{line-height:1.9;color:var(--muted)}
        .links{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
        a{color:#9ed8ff;text-decoration:none}
        .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}
        .card{background:#0f1724;border:1px solid rgba(158,216,255,.18);border-radius:14px;padding:14px}
        .title{color:var(--gold);font-weight:700;margin-bottom:8px}
        ul{margin:0;padding-right:18px}
        li{margin:6px 0}
    </style>
</head>
<body>
    <div class="hero">
        <h1>الرؤية البصرية لمنظومة MHS ERP الإسلامية</h1>
        <div class="sub">صفحة تشغيلية تشرح نواة MHS ERP مع قاعدة لا ضرر ولا ضرار، والتفاعل الصفري، ودمج البيانات والاستشعار والذكاء الصناعي ضمن منظومة نفع عام.</div>
        <div class="links">
            <a href="/api/mhs/core">MHS Core JSON</a>
            <a href="/api/sheikha/system/mhs-erp">MHS ERP JSON</a>
            <a href="/api/sheikha/system/intelligent-fusion/kpi">KPI JSON</a>
            <a href="/intelligent-fusion-system">واجهة النظام المندمج</a>
            <a href="/intelligent-fusion-cockpit">الـ Cockpit التنفيذي</a>
        </div>
    </div>

    <div class="panel">
        <div class="grid" id="grid"></div>
    </div>

    <script>
        async function j(url){ const r = await fetch(url); return r.json(); }
        function esc(v){ return String(v || '').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
        function list(items){ return '<ul>' + (items || []).map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }
        function card(title, body){ return '<div class="card"><div class="title">' + esc(title) + '</div>' + body + '</div>'; }

        async function boot(){
            const [coreOut, kpiOut] = await Promise.all([
                j('/api/mhs/core'),
                j('/api/sheikha/system/intelligent-fusion/kpi')
            ]);

            const core = coreOut.data || {};
            const p = core.principles || {};
            const f = core.features || {};
            const kpi = kpiOut.data || {};

            document.getElementById('grid').innerHTML = [
                card('مبادئ المنظومة', list([
                    'القاعدة: ' + (p.noHarm || ''),
                    'المنهج: ' + (p.trust || ''),
                    'التفاعل: ' + (p.interaction || ''),
                    'المقصد: ' + (p.objective || '')
                ])),
                card('الكيانات المستقلة', list(core.entities || [])),
                card('نسيج الاستشعار', list(f.sensoryFabric || [])),
                card('نسيج البيانات', list(f.dataFabric || [])),
                card('وحدات MHS ERP', list(f.mhsModules || [])),
                card('أنماط الذكاء الإداري', list(f.aiModes || [])),
                card('مؤشر الجاهزية العام', list([
                    'Readiness Score: ' + (kpi.readinessScore || 0),
                    'عدد مؤشرات KPI: ' + ((kpi.kpis || []).length)
                ]))
            ].join('');
        }

        boot().catch(function(){
            document.getElementById('grid').innerHTML = card('تعذر التحميل', '<div>تعذر تحميل بيانات MHS Vision.</div>');
        });
    </script>
</body>
</html>`);
});


app.get('/library', (req, res) => {
        res.send(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>رقمنة مكتبات شيخة</title>
    <style>
        body{font-family:'Tajawal',Arial,sans-serif;background:#0d0f14;color:#e9eef3;margin:0;padding:16px}
        .hero,.panel{max-width:1100px;margin:0 auto 16px;background:#121722;border:1px solid #283044;border-radius:14px;padding:18px}
        .hero{border-color:#d4af37;background:linear-gradient(130deg,#1d1a12,#121722)}
        h1{margin:0 0 8px;color:#d4af37}
        .sub{color:#c7d0df;line-height:1.8}
        .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:12px}
        .stat{background:#0f141f;border:1px solid #2d364b;border-radius:10px;padding:12px}
        .num{font-size:1.5rem;color:#6fcf97;font-weight:bold}
        .lbl{font-size:.82rem;color:#9fb0c8}
        .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:10px}
        .card{background:#0f141f;border:1px solid #2d364b;border-radius:10px;padding:12px}
        .title{color:#d4af37;font-weight:bold;margin-bottom:8px}
        .muted{color:#98a8bf;font-size:.86rem}
        .search{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}
        input{background:#0b1019;border:1px solid #37425b;color:#e9eef3;border-radius:8px;padding:8px 10px;min-width:220px}
        button{background:#1f6feb;border:0;color:#fff;border-radius:8px;padding:8px 12px;cursor:pointer}
        ul{margin:0;padding-right:18px}
        li{margin:6px 0}
        a{color:#8ecae6;text-decoration:none}
    </style>
</head>
<body>
    <div class="hero">
        <h1>📚 رقمنة مكتبات شيخة</h1>
        <div class="sub">هدف مرحلي قابل للتحقيق: تغطية واسعة ومنهجية للتراث الإسلامي والموسوعات العلمية، بفهرسة هرمية وتوثيق الاستعمالات الدنيوية.</div>
        <div class="stats" id="stats"></div>
    </div>

    <div class="panel">
        <div class="search">
            <input id="q" placeholder="ابحث في المكتبة... مثال: البخاري"/>
            <button onclick="runSearch()">بحث</button>
            <a href="/api/sheikha/library/usage-report">تقرير الاستخدام</a>
            <a href="/api/sheikha/library/hierarchy-stats">إحصاءات هرمية</a>
            <a href="/api/sheikha/library/timeline">الخط الزمني</a>
            <a href="/taseel">لوحة التأصيل</a>
            <a href="/publication-program">برنامج النشر</a>
        </div>
        <div class="grid" id="grid"></div>
    </div>

    <script>
        async function j(url){ const r=await fetch(url); return r.json(); }
        function esc(v){ return String(v || '').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
        function card(title, body){ return '<div class="card"><div class="title">'+title+'</div>'+body+'</div>'; }

        async function boot(){
            const [report, timeline] = await Promise.all([
                j('/api/sheikha/library/usage-report'),
                j('/api/sheikha/library/timeline')
            ]);

            const s = report.data;
            document.getElementById('stats').innerHTML = [
                ['الأصول الرقمية', s.totalAssets],
                ['الاستخدامات الدنيوية', s.totalWorldlyUses],
                ['المنتجات', s.totalProductsMentioned],
                ['مجالات', Object.keys(s.byField || {}).length],
                ['حقب', Object.keys(s.byEra || {}).length]
            ].map(function(x){ return '<div class="stat"><div class="num">'+x[1]+'</div><div class="lbl">'+x[0]+'</div></div>'; }).join('');

            document.getElementById('grid').innerHTML = [
                card('فجوات الطريق', '<ul>'+ (s.framework.gapAnalysis || []).map(function(x){return '<li>'+esc(x)+'</li>';}).join('') +'</ul>'),
                card('خطة التنفيذ', '<ul>'+ (s.framework.executionPlan || []).map(function(x){return '<li>'+esc(x)+'</li>';}).join('') +'</ul>'),
                card('الخط الزمني', '<ul>'+ (timeline.data.anchors || []).map(function(x){return '<li>'+esc(x)+'</li>';}).join('') +'</ul>')
            ].join('');
        }

        async function runSearch(){
            const q = document.getElementById('q').value.trim();
            if(!q) return;
            const out = await j('/api/sheikha/library/search?q=' + encodeURIComponent(q));
            const body = (out.data || []).slice(0, 20).map(function(item){
                const h = item.hierarchy || {};
                return '<li><strong>'+esc(item.title)+'</strong> — '+esc(item.author)+'<br/><span class="muted">'+esc(item.field)+' | '+esc(item.era)+' | '+esc(h.chapter)+' | '+esc(h.section)+'</span></li>';
            }).join('') || '<li>لا نتائج</li>';
            document.getElementById('grid').innerHTML = card('نتائج البحث', '<ul>'+body+'</ul>');
        }

        boot().catch(function(){
            document.getElementById('grid').innerHTML = card('تنبيه', '<div class="muted">تعذر تحميل البيانات.</div>');
        });
    </script>
</body>
</html>`);
});

// ═══════════════════════════════════════════════════════════════
// التشغيل
// ═══════════════════════════════════════════════════════════════
initStorage();

// تشغيل المحرك الخلفي دائمًا عند بدء الخادم
startBackgroundWorker();

if (require.main === module) {
    app.listen(PORT, HOST, () => {
        console.log(`🚀 SHEIKHA v4 RUNNING ON http://${HOST}:${PORT}`);
        console.log(`📚 مرجع العلم: http://${HOST}:${PORT}/ilm`);
        console.log(`🌟 لوحة القيادة: http://${HOST}:${PORT}/dashboard`);
        console.log(`📜 المبادئ: http://${HOST}:${PORT}/principles`);
        console.log('بسم الله الرحمن الرحيم — رب زدني علمًا');
    });
}

module.exports = app;
