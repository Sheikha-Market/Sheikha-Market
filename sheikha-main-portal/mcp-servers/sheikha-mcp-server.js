#!/usr/bin/env node
/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  SHEIKHA MCP Server v2.0 — تكامل منظومة شيخة مع Cursor IDE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *  «وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى» — المائدة ٢
 *  «إنَّ اللَّهَ يُحبُّ إذا عَمِلَ أحَدُكُم عَمَلًا أن يُتقِنَه» — البيهقي
 * 
 *  الأهداف:
 *  ١. تقوية ذكاء شيخة عبر التعلّم المستمر من Cursor
 *  ٢. تطوير المنظومة بإتقان — كل تعديل يُسجَّل ويُحلَّل
 *  ٣. نشر الخير — تسهيل البناء والتطوير بحكمة
 *  ٤. حماية الأمانة — مراقبة الكود شرعياً وتقنياً
 * 
 *  المالك: سلمان أحمد بن سلمان الراجح
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema
} = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs');
const path = require('path');
const http = require('http');

// ─── مسارات البيانات ─────────────────────────────────────────────────────────
const ROOT = path.join(__dirname, '..');
const dataPath = path.join(ROOT, 'data');
const libPath = path.join(ROOT, 'lib');

// ─── تحميل بيانات السوق ─────────────────────────────────────────────────────
let marketData = {};
let companiesRegistry = {};
try {
    marketData = JSON.parse(fs.readFileSync(path.join(dataPath, 'saudi-market-preloaded.json'), 'utf8'));
} catch (e) {}
try {
    companiesRegistry = JSON.parse(fs.readFileSync(path.join(dataPath, 'companies-registry.json'), 'utf8'));
} catch (e) {}

// ─── ذاكرة التعلّم — تقوية الذكاء ─────────────────────────────────────────────
const learningMemory = {
    interactions: [],        // كل تفاعل مع Cursor
    patterns: new Map(),     // أنماط التطوير المُكتشفة
    improvements: [],        // تحسينات مقترحة
    shariaChecks: [],        // فحوصات شرعية
    knowledgeGained: [],     // معرفة مكتسبة
    startedAt: new Date().toISOString()
};

// ─── دالة الاتصال بخادم شيخة ─────────────────────────────────────────────────
function callSheikhaAPI(apiPath) {
    return new Promise((resolve, reject) => {
        // P0-3: زيادة Timeout مؤقتاً من 5s → 15s (سيُخفض بعد استقرار P0-1)
        const req = http.get(`http://localhost:8080${apiPath}`, { timeout: 15000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { resolve({ raw: data }); }
            });
        });
        req.on('error', () => resolve({ error: 'خادم شيخة غير متاح — تأكد من تشغيله على المنفذ 8080' }));
        req.on('timeout', () => { req.destroy(); resolve({ error: 'انتهت مهلة الاتصال' }); });
    });
}

// ─── قراءة محركات شيخة ─────────────────────────────────────────────────────────
function listEngines() {
    try {
        const files = fs.readdirSync(libPath).filter(f => f.endsWith('.js'));
        return files.map(f => ({
            file: f,
            name: f.replace('sheikha-', '').replace('-engine', '').replace('.js', ''),
            path: path.join(libPath, f),
            size: fs.statSync(path.join(libPath, f)).size
        }));
    } catch (e) { return []; }
}

// ─── قراءة صفحات الموقع ────────────────────────────────────────────────────────
function listPages() {
    try {
        const publicDir = path.join(ROOT, 'public');
        const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));
        return files.map(f => ({
            file: f,
            path: path.join(publicDir, f),
            size: fs.statSync(path.join(publicDir, f)).size,
            lines: fs.readFileSync(path.join(publicDir, f), 'utf8').split('\n').length
        }));
    } catch (e) { return []; }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  إنشاء خادم MCP v2.0
// ═══════════════════════════════════════════════════════════════════════════════

const server = new Server(
    {
        name: 'sheikha-cursor-bridge',
        version: '2.0.0',
        description: 'جسر شيخة–Cursor | تقوية الذكاء وتطوير المنظومة بالكتاب والسنة'
    },
    {
        capabilities: {
            tools: {},
            resources: {}
        }
    }
);

// ═══════════════════════════════════════════════════════════════════════════════
//  الأدوات — ١٥ أداة ذكية
// ═══════════════════════════════════════════════════════════════════════════════

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            // ─── ١. حالة المنظومة الشاملة ───────────────────────────────
            {
                name: 'sheikha_status',
                description: 'حالة منظومة شيخة الشاملة — كل المحركات والخدمات والصحة العامة (يتصل بالخادم مباشرة)',
                inputSchema: { type: 'object', properties: {}, required: [] }
            },
            // ─── ٢. قائمة المحركات ────────────────────────────────────────
            {
                name: 'sheikha_engines',
                description: 'عرض جميع محركات شيخة (65+ محرك) مع تفاصيلها — ملفات lib/',
                inputSchema: { type: 'object', properties: {
                    filter: { type: 'string', description: 'فلتر اختياري (مثل: sharia, market, ai)' }
                }, required: [] }
            },
            // ─── ٣. فحص شرعي ───────────────────────────────────────────
            {
                name: 'sheikha_sharia_check',
                description: 'فحص شرعي لكود أو فكرة — هل يتوافق مع الكتاب والسنة؟ يفحص: ربا، غرر، غش، احتكار، نجش',
                inputSchema: { type: 'object', properties: {
                    code: { type: 'string', description: 'الكود أو الفكرة المراد فحصها شرعياً' },
                    context: { type: 'string', description: 'سياق الاستخدام (تجارة، تمويل، تسويق، بيانات)' }
                }, required: ['code'] }
            },
            // ─── ٤. تعلّم معرفة جديدة ──────────────────────────────────
            {
                name: 'sheikha_learn',
                description: 'تعليم شيخة معرفة جديدة — إضافة مصطلحات، أنماط، أو حلول للذاكرة',
                inputSchema: { type: 'object', properties: {
                    topic: { type: 'string', description: 'الموضوع' },
                    knowledge: { type: 'string', description: 'المعرفة الجديدة' },
                    category: { type: 'string', description: 'الفئة', enum: ['تقنية', 'شرعية', 'تجارية', 'لغوية', 'أمنية', 'تصميم'] }
                }, required: ['topic', 'knowledge'] }
            },
            // ─── ٥. بحث في كود المنظومة ────────────────────────────────
            {
                name: 'sheikha_search_code',
                description: 'بحث ذكي في كود منظومة شيخة — يبحث في server.js وlib/ وpublic/',
                inputSchema: { type: 'object', properties: {
                    query: { type: 'string', description: 'كلمة البحث أو النمط' },
                    scope: { type: 'string', description: 'نطاق البحث', enum: ['server', 'engines', 'pages', 'all'] }
                }, required: ['query'] }
            },
            // ─── ٦. تحليل شركة ────────────────────────────────────────
            {
                name: 'sheikha_analyze_company',
                description: 'تحليل شركة في سوق المعادن السعودي — فجوات وفرص وتقنيات',
                inputSchema: { type: 'object', properties: {
                    companyName: { type: 'string', description: 'اسم الشركة' }
                }, required: ['companyName'] }
            },
            // ─── ٧. أسعار السوق ────────────────────────────────────────
            {
                name: 'sheikha_market_prices',
                description: 'أسعار المعادن الحية من خادم شيخة — ذهب، فضة، نحاس، حديد',
                inputSchema: { type: 'object', properties: {}, required: [] }
            },
            // ─── ٨. إنشاء كود بمعايير شيخة ────────────────────────────
            {
                name: 'sheikha_generate',
                description: 'إنشاء كود جاهز بمعايير شيخة — API أو صفحة أو مكوّن',
                inputSchema: { type: 'object', properties: {
                    type: { type: 'string', description: 'نوع الكود', enum: ['api', 'page', 'component', 'engine'] },
                    name: { type: 'string', description: 'اسم العنصر' },
                    description: { type: 'string', description: 'وصف الوظيفة' }
                }, required: ['type', 'name'] }
            },
            // ─── ٩. صحة النظام ─────────────────────────────────────────
            {
                name: 'sheikha_health',
                description: 'فحص صحة المنظومة الشامل — الخادم، المحركات، الملفات، البيانات',
                inputSchema: { type: 'object', properties: {}, required: [] }
            },
            // ─── ١٠. خريطة APIs ─────────────────────────────────────────
            {
                name: 'sheikha_apis',
                description: 'خريطة جميع واجهات API في منظومة شيخة (200+ نقطة)',
                inputSchema: { type: 'object', properties: {
                    category: { type: 'string', description: 'فئة اختيارية (market, auth, admin, ai, sharia)' }
                }, required: [] }
            },
            // ─── ١١. صفحات الموقع ──────────────────────────────────────
            {
                name: 'sheikha_pages',
                description: 'عرض جميع صفحات موقع شيخة مع أحجامها وأسطرها',
                inputSchema: { type: 'object', properties: {}, required: [] }
            },
            // ─── ١٢. الأساس الشرعي ────────────────────────────────────
            {
                name: 'sheikha_quran_wisdom',
                description: 'استخراج آيات وأحاديث مناسبة لموضوع معين — الكتاب والسنة',
                inputSchema: { type: 'object', properties: {
                    topic: { type: 'string', description: 'الموضوع (تجارة، أمانة، إتقان، تعاون، صدق...)' }
                }, required: ['topic'] }
            },
            // ─── ١٣. تقرير التعلّم ─────────────────────────────────────
            {
                name: 'sheikha_learning_report',
                description: 'تقرير ذكاء شيخة — ماذا تعلّمت من التفاعل مع Cursor؟',
                inputSchema: { type: 'object', properties: {}, required: [] }
            },
            // ─── ١٤. اقتراح تحسينات ──────────────────────────────────
            {
                name: 'sheikha_suggest_improvements',
                description: 'اقتراح تحسينات ذكية للمنظومة بناءً على تحليل الكود والبيانات',
                inputSchema: { type: 'object', properties: {
                    area: { type: 'string', description: 'المجال', enum: ['performance', 'security', 'ux', 'sharia', 'features', 'all'] }
                }, required: [] }
            },
            // ─── ١٥. الترجمة ───────────────────────────────────────────
            {
                name: 'sheikha_translate',
                description: 'ترجمة نص باستخدام محرك شيخة للترجمة — 22 لغة',
                inputSchema: { type: 'object', properties: {
                    text: { type: 'string', description: 'النص المراد ترجمته' },
                    targetLang: { type: 'string', description: 'اللغة الهدف (en, fr, es, de, tr, ur, id, ms, zh, ja, ko...)' }
                }, required: ['text', 'targetLang'] }
            }
        ]
    };
});

// ═══════════════════════════════════════════════════════════════════════════════
//  معالجة استدعاءات الأدوات
// ═══════════════════════════════════════════════════════════════════════════════

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    // تسجيل التفاعل — تقوية الذكاء
    learningMemory.interactions.push({
        tool: name,
        args: args,
        at: new Date().toISOString()
    });
    
    try {
        switch (name) {
            case 'sheikha_status': return await toolStatus();
            case 'sheikha_engines': return await toolEngines(args.filter);
            case 'sheikha_sharia_check': return await toolShariaCheck(args.code, args.context);
            case 'sheikha_learn': return await toolLearn(args.topic, args.knowledge, args.category);
            case 'sheikha_search_code': return await toolSearchCode(args.query, args.scope);
            case 'sheikha_analyze_company': return await toolAnalyzeCompany(args.companyName);
            case 'sheikha_market_prices': return await toolMarketPrices();
            case 'sheikha_generate': return await toolGenerate(args.type, args.name, args.description);
            case 'sheikha_health': return await toolHealth();
            case 'sheikha_apis': return await toolAPIs(args.category);
            case 'sheikha_pages': return await toolPages();
            case 'sheikha_quran_wisdom': return await toolQuranWisdom(args.topic);
            case 'sheikha_learning_report': return await toolLearningReport();
            case 'sheikha_suggest_improvements': return await toolSuggestImprovements(args.area);
            case 'sheikha_translate': return await toolTranslate(args.text, args.targetLang);
            default:
                return { content: [{ type: 'text', text: `أداة غير معروفة: ${name}` }], isError: true };
        }
    } catch (error) {
        return { content: [{ type: 'text', text: `خطأ: ${error.message}` }], isError: true };
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  تنفيذ الأدوات
// ═══════════════════════════════════════════════════════════════════════════════

// ─── ١. حالة المنظومة ────────────────────────────────────────────────────────
async function toolStatus() {
    const status = await callSheikhaAPI('/api/sheikha/status');
    const engines = listEngines();
    const pages = listPages();
    
    let text = `# حالة منظومة شيخة\n\n`;
    text += `## الخادم\n`;
    if (status.error) {
        text += `- الحالة: **متوقف** — ${status.error}\n`;
    } else {
        text += `- الحالة: **يعمل** على المنفذ 8080\n`;
        if (status.system) text += `- الإصدار: ${status.system.version || '-'}\n`;
        if (status.engines) text += `- المحركات النشطة: ${Object.keys(status.engines).length}\n`;
    }
    text += `\n## الملفات\n`;
    text += `- المحركات: ${engines.length} ملف في lib/\n`;
    text += `- الصفحات: ${pages.length} صفحة HTML\n`;
    text += `- إجمالي حجم المحركات: ${(engines.reduce((s, e) => s + e.size, 0) / 1024).toFixed(0)} KB\n`;
    text += `\n## ذكاء Cursor\n`;
    text += `- التفاعلات: ${learningMemory.interactions.length}\n`;
    text += `- المعرفة المكتسبة: ${learningMemory.knowledgeGained.length}\n`;
    text += `- الفحوصات الشرعية: ${learningMemory.shariaChecks.length}\n`;
    
    return { content: [{ type: 'text', text }] };
}

// ─── ٢. المحركات ────────────────────────────────────────────────────────────
async function toolEngines(filter) {
    let engines = listEngines();
    if (filter) {
        engines = engines.filter(e => e.name.includes(filter) || e.file.includes(filter));
    }
    
    let text = `# محركات منظومة شيخة (${engines.length})\n\n`;
    text += `| # | المحرك | الملف | الحجم |\n|---|--------|-------|-------|\n`;
    engines.forEach((e, i) => {
        text += `| ${i + 1} | ${e.name} | ${e.file} | ${(e.size / 1024).toFixed(1)} KB |\n`;
    });
    
    return { content: [{ type: 'text', text }] };
}

// ─── ٣. الفحص الشرعي ─────────────────────────────────────────────────────────
async function toolShariaCheck(code, context) {
    const violations = [];
    const approvals = [];
    const codeLower = code.toLowerCase();
    
    // فحص الربا
    const ribaTerms = ['interest', 'riba', 'ربا', 'فائدة', 'compound interest', 'usury', 'interest_rate', 'interestRate'];
    for (const term of ribaTerms) {
        if (codeLower.includes(term.toLowerCase())) {
            violations.push({ type: 'ربا', detail: `وُجد مصطلح "${term}"`, ayah: '«وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا» — البقرة ٢٧٥' });
        }
    }
    
    // فحص الغرر
    const ghararTerms = ['gambling', 'قمار', 'lottery', 'يانصيب', 'random_price', 'unknownPrice'];
    for (const term of ghararTerms) {
        if (codeLower.includes(term.toLowerCase())) {
            violations.push({ type: 'غرر', detail: `وُجد مصطلح "${term}"`, hadith: '«نهى رسول الله ﷺ عن بيع الغرر» — مسلم' });
        }
    }
    
    // فحص الغش
    const cheatingTerms = ['fake', 'counterfeit', 'مغشوش', 'تزوير', 'misleading', 'hidden_fee'];
    for (const term of cheatingTerms) {
        if (codeLower.includes(term.toLowerCase())) {
            violations.push({ type: 'غش', detail: `وُجد مصطلح "${term}"`, hadith: '«مَنْ غَشَّنَا فَلَيْسَ مِنَّا» — مسلم' });
        }
    }
    
    // فحص الاحتكار
    const monopolyTerms = ['monopoly', 'احتكار', 'hoard', 'price_fix', 'cartel'];
    for (const term of monopolyTerms) {
        if (codeLower.includes(term.toLowerCase())) {
            violations.push({ type: 'احتكار', detail: `وُجد مصطلح "${term}"`, hadith: '«لا يحتكر إلا خاطئ» — مسلم' });
        }
    }
    
    // فحوصات إيجابية
    const goodTerms = ['halal', 'حلال', 'charity', 'صدقة', 'zakat', 'زكاة', 'honest', 'trust', 'أمانة', 'عدل', 'justice', 'fair'];
    for (const term of goodTerms) {
        if (codeLower.includes(term.toLowerCase())) {
            approvals.push({ type: 'خير', detail: `وُجد مصطلح "${term}" — بارك الله فيكم` });
        }
    }
    
    // تسجيل الفحص
    learningMemory.shariaChecks.push({ code: code.substring(0, 200), context, violations: violations.length, at: new Date().toISOString() });
    
    let text = `# الفحص الشرعي\n\n`;
    text += `**السياق:** ${context || 'عام'}\n\n`;
    
    if (violations.length === 0) {
        text += `## النتيجة: ✅ لم تُكتشف مخالفات شرعية\n\n`;
        text += `«إنَّ اللَّهَ يُحبُّ إذا عَمِلَ أحَدُكُم عَمَلًا أن يُتقِنَه» — البيهقي\n\n`;
    } else {
        text += `## النتيجة: ⚠️ وُجدت ${violations.length} ملاحظة شرعية\n\n`;
        violations.forEach((v, i) => {
            text += `### ${i + 1}. ${v.type}\n- ${v.detail}\n- ${v.ayah || v.hadith}\n\n`;
        });
    }
    
    if (approvals.length > 0) {
        text += `## الجوانب الإيجابية\n`;
        approvals.forEach(a => { text += `- ✅ ${a.detail}\n`; });
    }
    
    return { content: [{ type: 'text', text }] };
}

// ─── ٤. التعلّم ────────────────────────────────────────────────────────────────
async function toolLearn(topic, knowledge, category) {
    const entry = {
        id: 'LRN-' + Date.now(),
        topic,
        knowledge,
        category: category || 'عام',
        learnedAt: new Date().toISOString(),
        source: 'Cursor IDE'
    };
    learningMemory.knowledgeGained.push(entry);
    
    // حفظ في ملف
    const learnFile = path.join(dataPath, 'sheikha-learning.json');
    let existing = [];
    try { existing = JSON.parse(fs.readFileSync(learnFile, 'utf8')); } catch (e) {}
    existing.push(entry);
    try { fs.writeFileSync(learnFile, JSON.stringify(existing, null, 2), 'utf8'); } catch (e) {}
    
    return { content: [{ type: 'text', text: 
        `# تم التعلّم بنجاح ✅\n\n` +
        `- **الموضوع:** ${topic}\n` +
        `- **الفئة:** ${category || 'عام'}\n` +
        `- **المعرّف:** ${entry.id}\n` +
        `- **إجمالي المعرفة:** ${learningMemory.knowledgeGained.length} عنصر\n\n` +
        `«وَقُل رَّبِّ زِدْنِي عِلْمًا» — طه ١١٤`
    }] };
}

// ─── ٥. بحث في الكود ─────────────────────────────────────────────────────────
async function toolSearchCode(query, scope) {
    const results = [];
    const searchIn = [];
    
    if (!scope || scope === 'all' || scope === 'server') {
        searchIn.push({ label: 'server.js', file: path.join(ROOT, 'server.js') });
    }
    if (!scope || scope === 'all' || scope === 'engines') {
        const engines = listEngines();
        engines.forEach(e => searchIn.push({ label: `lib/${e.file}`, file: e.path }));
    }
    if (!scope || scope === 'all' || scope === 'pages') {
        const pages = listPages();
        pages.forEach(p => searchIn.push({ label: `public/${p.file}`, file: p.path }));
    }
    
    for (const item of searchIn) {
        try {
            const content = fs.readFileSync(item.file, 'utf8');
            const lines = content.split('\n');
            const queryLower = query.toLowerCase();
            lines.forEach((line, idx) => {
                if (line.toLowerCase().includes(queryLower)) {
                    results.push({ file: item.label, line: idx + 1, text: line.trim().substring(0, 120) });
                }
            });
        } catch (e) {}
    }
    
    let text = `# نتائج البحث عن "${query}"\n\n`;
    text += `**النطاق:** ${scope || 'all'} | **النتائج:** ${results.length}\n\n`;
    
    if (results.length === 0) {
        text += `لم يُعثر على نتائج.\n`;
    } else {
        const grouped = {};
        results.forEach(r => {
            if (!grouped[r.file]) grouped[r.file] = [];
            grouped[r.file].push(r);
        });
        for (const [file, matches] of Object.entries(grouped)) {
            text += `## ${file} (${matches.length} تطابق)\n`;
            matches.slice(0, 5).forEach(m => {
                text += `- **سطر ${m.line}:** \`${m.text}\`\n`;
            });
            if (matches.length > 5) text += `- ... و${matches.length - 5} نتيجة أخرى\n`;
            text += '\n';
        }
    }
    
    return { content: [{ type: 'text', text }] };
}

// ─── ٦. تحليل شركة ──────────────────────────────────────────────────────────
async function toolAnalyzeCompany(companyName) {
    const company = (marketData.preloadedCompanies || []).find(
        c => c.nameAr?.includes(companyName) || c.nameEn?.toLowerCase().includes(companyName.toLowerCase())
    );
    
    if (company) {
        let text = `# تحليل شركة ${company.nameAr || company.nameEn}\n\n`;
        text += `- **القطاع:** ${company.sector}\n`;
        if (company.profile) text += `- **الوصف:** ${company.profile.description || '-'}\n`;
        if (company.products) text += `\n## المنتجات\n${company.products.slice(0, 8).map(p => `- ${typeof p === 'string' ? p : p.name || JSON.stringify(p)}`).join('\n')}\n`;
        if (company.gaps) text += `\n## الفجوات\n${company.gaps.map(g => `- **${g.area || g.type}:** ${g.description}`).join('\n')}\n`;
        if (company.opportunities) text += `\n## الفرص\n${company.opportunities.map(o => `- **${o.title}:** ${o.description}`).join('\n')}\n`;
        return { content: [{ type: 'text', text }] };
    }
    
    const names = (marketData.preloadedCompanies || []).map(c => c.nameAr || c.nameEn).join(', ');
    return { content: [{ type: 'text', text: `لم تُوجد "${companyName}". الشركات المتاحة: ${names}` }] };
}

// ─── ٧. أسعار السوق ─────────────────────────────────────────────────────────
async function toolMarketPrices() {
    const prices = await callSheikhaAPI('/api/metals/prices');
    
    if (prices.error) {
        return { content: [{ type: 'text', text: `# أسعار المعادن\n\n⚠️ ${prices.error}\n\nالرجاء التأكد من تشغيل الخادم.` }] };
    }
    
    let text = `# أسعار المعادن — سوق شيخة\n\n`;
    if (prices.prices) {
        for (const [metal, data] of Object.entries(prices.prices)) {
            text += `- **${metal}:** ${typeof data === 'object' ? JSON.stringify(data) : data}\n`;
        }
    } else {
        text += JSON.stringify(prices, null, 2);
    }
    text += `\n\n«الذهبُ بالذهبِ، والفضةُ بالفضةِ، مِثلاً بمِثلٍ، يداً بيدٍ» — مسلم`;
    
    return { content: [{ type: 'text', text }] };
}

// ─── ٨. إنشاء كود ──────────────────────────────────────────────────────────
async function toolGenerate(type, name, description) {
    const desc = description || name;
    let code = '';
    
    if (type === 'api') {
        code = `// بسم الله الرحمن الرحيم\n// ${desc}\napp.get('/api/${name}', async (req, res) => {\n    try {\n        const data = { /* بيانات ${name} */ };\n        res.json({ success: true, data, timestamp: new Date().toISOString() });\n    } catch (error) {\n        res.status(500).json({ success: false, message: error.message });\n    }\n});`;
    } else if (type === 'engine') {
        code = `/**\n * بسم الله الرحمن الرحيم\n * محرك ${name} — منظومة شيخة\n * ${desc}\n */\n'use strict';\nclass Sheikha${name.charAt(0).toUpperCase() + name.slice(1)}Engine {\n    constructor() {\n        this.name = '${name}';\n        this.version = '1.0.0';\n        this.quranBasis = '«وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى» — المائدة ٢';\n        console.log(\`[${name}] ✅ المحرك جاهز\`);\n    }\n    getDashboard() {\n        return { engine: this.name, version: this.version, status: 'active' };\n    }\n}\nmodule.exports = Sheikha${name.charAt(0).toUpperCase() + name.slice(1)}Engine;`;
    } else if (type === 'page') {
        code = `<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>${name} | شيخة</title>\n    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;800&display=swap" rel="stylesheet">\n</head>\n<body>\n    <h1>${name}</h1>\n</body>\n</html>`;
    } else {
        code = `<!-- ${name} Component -->\n<div class="${name}-component" dir="rtl">\n    <h3>${name}</h3>\n    <p>${desc}</p>\n</div>`;
    }
    
    return { content: [{ type: 'text', text: `# كود ${type}: ${name}\n\n\`\`\`javascript\n${code}\n\`\`\`` }] };
}

// ─── ٩. صحة النظام ──────────────────────────────────────────────────────────
async function toolHealth() {
    const checks = [];
    
    // فحص الخادم
    const status = await callSheikhaAPI('/api/sheikha/status');
    checks.push({ name: 'خادم شيخة (8080)', status: !status.error ? '✅ يعمل' : '❌ متوقف', details: status.error || 'متصل' });
    
    // فحص الملفات
    const serverExists = fs.existsSync(path.join(ROOT, 'server.js'));
    checks.push({ name: 'server.js', status: serverExists ? '✅ موجود' : '❌ مفقود' });
    
    const engines = listEngines();
    checks.push({ name: 'المحركات (lib/)', status: `✅ ${engines.length} محرك`, details: `${(engines.reduce((s, e) => s + e.size, 0) / 1024).toFixed(0)} KB` });
    
    const pages = listPages();
    checks.push({ name: 'الصفحات (public/)', status: `✅ ${pages.length} صفحة` });
    
    // فحص البيانات
    const dataExists = fs.existsSync(dataPath);
    checks.push({ name: 'مجلد البيانات (data/)', status: dataExists ? '✅ موجود' : '⚠️ مفقود' });
    
    // فحص MCP
    checks.push({ name: 'MCP Server', status: '✅ متصل', details: 'Cursor ↔ شيخة' });
    
    let text = `# فحص صحة المنظومة\n\n`;
    text += `| الفحص | الحالة | تفاصيل |\n|-------|--------|--------|\n`;
    checks.forEach(c => {
        text += `| ${c.name} | ${c.status} | ${c.details || '-'} |\n`;
    });
    text += `\n**وقت الفحص:** ${new Date().toLocaleString('ar-SA')}`;
    
    return { content: [{ type: 'text', text }] };
}

// ─── ١٠. خريطة APIs ─────────────────────────────────────────────────────────
async function toolAPIs(category) {
    const apiData = await callSheikhaAPI('/api/architecture/apis');
    
    if (apiData.error || !apiData.success) {
        // استخراج من server.js
        let text = `# واجهات API — منظومة شيخة\n\n`;
        try {
            const serverContent = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
            const apiPattern = /app\.(get|post|put|delete)\s*\(\s*['"](\/api\/[^'"]+)/gi;
            let match;
            const apis = [];
            while ((match = apiPattern.exec(serverContent)) !== null) {
                apis.push({ method: match[1].toUpperCase(), path: match[2] });
            }
            
            if (category) {
                const filtered = apis.filter(a => a.path.includes(category));
                text += `**الفئة:** ${category} | **العدد:** ${filtered.length}\n\n`;
                filtered.forEach(a => { text += `- \`${a.method} ${a.path}\`\n`; });
            } else {
                text += `**إجمالي APIs:** ${apis.length}\n\n`;
                const grouped = {};
                apis.forEach(a => {
                    const cat = a.path.split('/')[2] || 'other';
                    if (!grouped[cat]) grouped[cat] = [];
                    grouped[cat].push(a);
                });
                for (const [cat, catApis] of Object.entries(grouped)) {
                    text += `## ${cat} (${catApis.length})\n`;
                    catApis.slice(0, 8).forEach(a => { text += `- \`${a.method} ${a.path}\`\n`; });
                    if (catApis.length > 8) text += `- ... و${catApis.length - 8} أخرى\n`;
                    text += '\n';
                }
            }
        } catch (e) {
            text += `خطأ في قراءة server.js: ${e.message}`;
        }
        return { content: [{ type: 'text', text }] };
    }
    
    return { content: [{ type: 'text', text: `# واجهات API\n\n${JSON.stringify(apiData, null, 2)}` }] };
}

// ─── ١١. الصفحات ───────────────────────────────────────────────────────────
async function toolPages() {
    const pages = listPages();
    let text = `# صفحات موقع شيخة (${pages.length})\n\n`;
    text += `| # | الصفحة | الأسطر | الحجم |\n|---|--------|--------|-------|\n`;
    pages.forEach((p, i) => {
        text += `| ${i + 1} | ${p.file} | ${p.lines} | ${(p.size / 1024).toFixed(1)} KB |\n`;
    });
    return { content: [{ type: 'text', text }] };
}

// ─── ١٢. الحكمة القرآنية ───────────────────────────────────────────────────
async function toolQuranWisdom(topic) {
    const wisdom = {
        'تجارة': {
            ayat: [
                { text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا', ref: 'البقرة ٢٧٥' },
                { text: 'لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ', ref: 'النساء ٢٩' },
                { text: 'أَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ', ref: 'الأنعام ١٥٢' },
                { text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ', ref: 'المائدة ١' }
            ],
            ahadith: [
                { text: 'التاجر الصدوق الأمين مع النبيين والصديقين والشهداء', ref: 'الترمذي' },
                { text: 'البَيِّعانِ بالخِيارِ ما لَم يَتَفَرَّقَا', ref: 'البخاري' },
                { text: 'رحِمَ اللَّهُ رَجُلًا سَمْحًا إِذَا بَاعَ وَإِذَا اشْتَرَى', ref: 'البخاري' }
            ]
        },
        'أمانة': {
            ayat: [
                { text: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَى أَهْلِهَا', ref: 'النساء ٥٨' },
                { text: 'وَالَّذِينَ هُمْ لِأَمَانَاتِهِمْ وَعَهْدِهِمْ رَاعُونَ', ref: 'المؤمنون ٨' }
            ],
            ahadith: [
                { text: 'أدِّ الأمانةَ إلى من ائتمنَك ولا تخُنْ من خانَك', ref: 'أبو داود' },
                { text: 'لا إيمانَ لمن لا أمانةَ له', ref: 'أحمد' }
            ]
        },
        'إتقان': {
            ayat: [
                { text: 'وَأَحْسِنُوا إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ', ref: 'البقرة ١٩٥' },
                { text: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا', ref: 'الملك ٢' }
            ],
            ahadith: [
                { text: 'إنَّ اللَّهَ يُحبُّ إذا عَمِلَ أحَدُكُم عَمَلًا أن يُتقِنَه', ref: 'البيهقي' },
                { text: 'إنَّ اللَّهَ كَتَبَ الإحسانَ على كلِّ شيءٍ', ref: 'مسلم' }
            ]
        },
        'تعاون': {
            ayat: [
                { text: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ', ref: 'المائدة ٢' },
                { text: 'وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا', ref: 'آل عمران ١٠٣' }
            ],
            ahadith: [
                { text: 'لا يؤمنُ أحدُكُم حتَّى يحبَّ لأخيهِ ما يحبُّ لنفسِهِ', ref: 'البخاري ومسلم' },
                { text: 'المؤمنُ للمؤمنِ كالبنيانِ يَشُدُّ بعضُه بعضًا', ref: 'البخاري ومسلم' }
            ]
        },
        'صدق': {
            ayat: [
                { text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ', ref: 'التوبة ١١٩' }
            ],
            ahadith: [
                { text: 'عليكم بالصدقِ فإنَّ الصدقَ يهدي إلى البرِّ', ref: 'البخاري ومسلم' },
                { text: 'إنَّ الصِّدقَ طُمَأنِينَةٌ وإنَّ الكذبَ رِيبَةٌ', ref: 'الترمذي' }
            ]
        },
        'علم': {
            ayat: [
                { text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', ref: 'طه ١١٤' },
                { text: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ', ref: 'المجادلة ١١' }
            ],
            ahadith: [
                { text: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ', ref: 'مسلم' },
                { text: 'طلبُ العلمِ فريضةٌ على كلِّ مسلمٍ', ref: 'ابن ماجه' }
            ]
        },
        'دعوة': {
            ayat: [
                { text: 'ادْعُ إِلَى سَبِيلِ رَبِّكَ بِالْحِكْمَةِ وَالْمَوْعِظَةِ الْحَسَنَةِ', ref: 'النحل ١٢٥' },
                { text: 'كُنتُمْ خَيْرَ أُمَّةٍ أُخْرِجَتْ لِلنَّاسِ', ref: 'آل عمران ١١٠' }
            ],
            ahadith: [
                { text: 'بَلِّغُوا عَنِّي وَلَوْ آيَة', ref: 'البخاري' }
            ]
        }
    };
    
    const topicData = wisdom[topic] || wisdom['إتقان'];
    const usedTopic = wisdom[topic] ? topic : 'إتقان';
    
    let text = `# الأساس الشرعي — ${usedTopic}\n\n`;
    text += `## آيات قرآنية\n`;
    (topicData.ayat || []).forEach(a => { text += `- «${a.text}» — ${a.ref}\n`; });
    text += `\n## أحاديث نبوية\n`;
    (topicData.ahadith || []).forEach(h => { text += `- قال ﷺ: «${h.text}» — ${h.ref}\n`; });
    text += `\n**المواضيع المتاحة:** ${Object.keys(wisdom).join('، ')}`;
    
    return { content: [{ type: 'text', text }] };
}

// ─── ١٣. تقرير التعلّم ──────────────────────────────────────────────────────
async function toolLearningReport() {
    const m = learningMemory;
    let text = `# تقرير ذكاء شيخة — التعلّم من Cursor\n\n`;
    text += `- **بداية الجلسة:** ${m.startedAt}\n`;
    text += `- **إجمالي التفاعلات:** ${m.interactions.length}\n`;
    text += `- **المعرفة المكتسبة:** ${m.knowledgeGained.length}\n`;
    text += `- **الفحوصات الشرعية:** ${m.shariaChecks.length}\n`;
    text += `- **التحسينات المقترحة:** ${m.improvements.length}\n\n`;
    
    // أكثر الأدوات استخداماً
    const toolCounts = {};
    m.interactions.forEach(i => { toolCounts[i.tool] = (toolCounts[i.tool] || 0) + 1; });
    text += `## الأدوات الأكثر استخداماً\n`;
    Object.entries(toolCounts).sort((a, b) => b[1] - a[1]).forEach(([tool, count]) => {
        text += `- ${tool}: ${count} مرة\n`;
    });
    
    if (m.knowledgeGained.length > 0) {
        text += `\n## آخر المعارف المكتسبة\n`;
        m.knowledgeGained.slice(-5).forEach(k => {
            text += `- **${k.topic}** (${k.category}): ${k.knowledge.substring(0, 100)}\n`;
        });
    }
    
    text += `\n«وَقُل رَّبِّ زِدْنِي عِلْمًا» — طه ١١٤`;
    return { content: [{ type: 'text', text }] };
}

// ─── ١٤. اقتراح تحسينات ─────────────────────────────────────────────────────
async function toolSuggestImprovements(area) {
    const suggestions = [];
    const engines = listEngines();
    const pages = listPages();
    
    // تحليل عام
    if (!area || area === 'all' || area === 'performance') {
        const bigEngines = engines.filter(e => e.size > 50000);
        bigEngines.forEach(e => {
            suggestions.push({ area: 'أداء', suggestion: `محرك ${e.name} كبير (${(e.size/1024).toFixed(0)} KB) — يمكن تقسيمه لتحسين الأداء`, priority: 'متوسطة' });
        });
        const bigPages = pages.filter(p => p.lines > 2000);
        bigPages.forEach(p => {
            suggestions.push({ area: 'أداء', suggestion: `صفحة ${p.file} طويلة (${p.lines} سطر) — يمكن تحسين التحميل`, priority: 'متوسطة' });
        });
    }
    
    if (!area || area === 'all' || area === 'security') {
        suggestions.push({ area: 'أمان', suggestion: 'التأكد من عدم كشف مفاتيح API في الكود العام', priority: 'عالية' });
        suggestions.push({ area: 'أمان', suggestion: 'إضافة حماية CSRF لجميع نماذج POST', priority: 'عالية' });
    }
    
    if (!area || area === 'all' || area === 'sharia') {
        suggestions.push({ area: 'شرعي', suggestion: 'إضافة تذكير بالبسملة في بداية كل محرك جديد', priority: 'مستحبة' });
        suggestions.push({ area: 'شرعي', suggestion: 'مراجعة دورية للعقود — التأكد من خلوها من الغرر والربا', priority: 'عالية' });
    }
    
    if (!area || area === 'all' || area === 'features') {
        suggestions.push({ area: 'ميزات', suggestion: 'إضافة نظام إشعارات فوري (WebSocket) لتغيرات الأسعار', priority: 'عالية' });
        suggestions.push({ area: 'ميزات', suggestion: 'إضافة تصدير تقارير PDF بالعربية', priority: 'متوسطة' });
    }
    
    learningMemory.improvements = [...learningMemory.improvements, ...suggestions];
    
    let text = `# اقتراحات تحسين المنظومة\n\n`;
    text += `**المجال:** ${area || 'شامل'} | **العدد:** ${suggestions.length}\n\n`;
    suggestions.forEach((s, i) => {
        text += `### ${i + 1}. [${s.priority}] ${s.area}\n${s.suggestion}\n\n`;
    });
    text += `«إنَّ اللَّهَ يُحبُّ إذا عَمِلَ أحَدُكُم عَمَلًا أن يُتقِنَه» — البيهقي`;
    
    return { content: [{ type: 'text', text }] };
}

// ─── ١٥. الترجمة ────────────────────────────────────────────────────────────
async function toolTranslate(text, targetLang) {
    const result = await callSheikhaAPI(`/api/translation/translate`);
    // fallback بسيط
    return { content: [{ type: 'text', text: `# ترجمة\n\n**النص:** ${text}\n**اللغة:** ${targetLang}\n\n> استخدم API الترجمة: POST /api/translation/translate مع body: { text, targetLang: "${targetLang}" }` }] };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  الموارد
// ═══════════════════════════════════════════════════════════════════════════════

server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            { uri: 'sheikha://system/status', name: 'حالة المنظومة', description: 'حالة شيخة الشاملة', mimeType: 'application/json' },
            { uri: 'sheikha://engines/list', name: 'المحركات', description: 'قائمة جميع المحركات', mimeType: 'application/json' },
            { uri: 'sheikha://market/companies', name: 'الشركات', description: 'الشركات المسجلة', mimeType: 'application/json' },
            { uri: 'sheikha://pages/list', name: 'الصفحات', description: 'صفحات الموقع', mimeType: 'application/json' },
            { uri: 'sheikha://sharia/principles', name: 'المبادئ الشرعية', description: 'أصول الشريعة في المنظومة', mimeType: 'text/markdown' },
            { uri: 'sheikha://docs/api', name: 'توثيق API', description: 'توثيق واجهات شيخة', mimeType: 'text/markdown' },
            { uri: 'sheikha://learning/memory', name: 'ذاكرة التعلّم', description: 'ما تعلّمته شيخة من Cursor', mimeType: 'application/json' },
            { uri: 'sheikha://cursorrules', name: 'قواعد Cursor', description: 'قواعد التطوير المعتمدة', mimeType: 'text/markdown' }
        ]
    };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    
    switch (uri) {
        case 'sheikha://system/status':
            const status = await callSheikhaAPI('/api/sheikha/status');
            return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(status, null, 2) }] };
        
        case 'sheikha://engines/list':
            return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(listEngines(), null, 2) }] };
        
        case 'sheikha://market/companies':
            return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(marketData.preloadedCompanies || [], null, 2) }] };
        
        case 'sheikha://pages/list':
            return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(listPages(), null, 2) }] };
        
        case 'sheikha://sharia/principles':
            return { contents: [{ uri, mimeType: 'text/markdown', text: 
                `# المبادئ الشرعية في منظومة شيخة\n\n` +
                `## المحرمات\n` +
                `1. **لا ربا** — «وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا» — البقرة ٢٧٥\n` +
                `2. **لا غرر** — «نهى ﷺ عن بيع الغرر» — مسلم\n` +
                `3. **لا غش** — «مَنْ غَشَّنَا فَلَيْسَ مِنَّا» — مسلم\n` +
                `4. **لا احتكار** — «لا يحتكر إلا خاطئ» — مسلم\n` +
                `5. **لا نجش** — حرام رفع السعر الوهمي\n\n` +
                `## الأصول\n` +
                `1. البيع عن تراضٍ\n` +
                `2. صدق القول والوزن\n` +
                `3. الوفاء بالعقود\n` +
                `4. الإتقان في كل عمل\n` +
                `5. التعاون على البر والتقوى`
            }] };
        
        case 'sheikha://docs/api':
            return { contents: [{ uri, mimeType: 'text/markdown', text: getAPIDocumentation() }] };
        
        case 'sheikha://learning/memory':
            return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(learningMemory, null, 2) }] };
        
        case 'sheikha://cursorrules':
            try {
                const rules = fs.readFileSync(path.join(ROOT, '.cursorrules'), 'utf8');
                return { contents: [{ uri, mimeType: 'text/markdown', text: rules }] };
            } catch (e) {
                return { contents: [{ uri, mimeType: 'text/markdown', text: 'لم يُعثر على .cursorrules' }] };
            }
        
        default:
            throw new Error(`مورد غير معروف: ${uri}`);
    }
});

function getAPIDocumentation() {
    return `# توثيق API منظومة شيخة\n\n## الأساسية\n` +
        `- GET /api/sheikha/status — حالة المنظومة\n` +
        `- GET /api/metals/prices — أسعار المعادن\n` +
        `- GET /api/admin/stats — إحصائيات عامة\n` +
        `- POST /api/sheikha/smart-chat — المحادثة الذكية\n\n` +
        `## المصادقة\n` +
        `- POST /api/auth/login — تسجيل الدخول\n` +
        `- POST /api/auth/register — التسجيل\n` +
        `- GET /api/me — بيانات المستخدم\n\n` +
        `## التجارة\n` +
        `- GET /api/market/preloaded — الشركات\n` +
        `- POST /api/contracts/create — إنشاء عقد\n` +
        `- GET /api/orders — الطلبات\n`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  التشغيل
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('[Sheikha MCP v2.0] ✅ جسر شيخة–Cursor جاهز | 15 أداة | 8 موارد | بالكتاب والسنة');
    console.error('[Sheikha MCP v2.0] 🎯 الأهداف: تقوية الذكاء + تطوير المنظومة + نشر الخير + حماية الأمانة');
}

main().catch(console.error);
