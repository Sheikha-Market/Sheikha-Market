'use strict';
/**
 * 🕋 Arabic UTF-8 Neural Engine — Routes
 * مسارات محرك اللغة العربية العصبي (19 endpoint)
 * "عَلَّمَهُ الْبَيَانَ" — الرحمن:٤
 */

const express = require('express');
const router  = express.Router();

const {
    UNICODE_BLOCKS,
    ARABIC_LETTERS,
    QURAN_VERSES,
    SUNNAH_HADITHS,
    MAQASID,
    NEURAL_NETWORK,
    encodeText,
    analyzeCodePoints,
    detectLanguage,
    normalizeText,
    removeDiacritics,
    extractRoot,
    analyzeSentence,
    calculateSimilarity,
    generateEmbedding,
    runNeuralNetwork
} = require('../lib/sheikha-arabic-utf8-neural-engine.js');

const engineStartedAt = new Date().toISOString();

// ─── مساعد الاستجابة ─────────────────────────────────────────
const ok  = (res, data, msg = 'نجح') => res.json({ success: true,  data, message: msg, timestamp: new Date().toISOString() });
const err = (res, msg, code = 400)   => res.status(code).json({ success: false, message: msg, timestamp: new Date().toISOString() });

// ═══════════════════════════════════════════════════════════════
// GET / — قائمة الـ APIs
// ═══════════════════════════════════════════════════════════════
router.get('/', (req, res) => {
    ok(res, {
        engine: 'Sheikha Arabic UTF-8 Neural Language Engine',
        verse: 'عَلَّمَهُ الْبَيَانَ — الرحمن:٤',
        version: '1.0.0',
        endpoints: [
            'GET  /api/arabic-utf8/',
            'GET  /api/arabic-utf8/health',
            'GET  /api/arabic-utf8/unicode-blocks',
            'GET  /api/arabic-utf8/letters',
            'GET  /api/arabic-utf8/quran',
            'GET  /api/arabic-utf8/quran/search?q=',
            'GET  /api/arabic-utf8/sunnah',
            'GET  /api/arabic-utf8/sunnah/search?q=',
            'GET  /api/arabic-utf8/maqasid',
            'GET  /api/arabic-utf8/network/status',
            'POST /api/arabic-utf8/encode',
            'POST /api/arabic-utf8/codepoints',
            'POST /api/arabic-utf8/neural',
            'POST /api/arabic-utf8/analyze',
            'POST /api/arabic-utf8/detect-language',
            'POST /api/arabic-utf8/normalize',
            'POST /api/arabic-utf8/similarity',
            'POST /api/arabic-utf8/embedding',
            'POST /api/arabic-utf8/root',
            'POST /api/arabic-utf8/full-analysis'
        ]
    }, 'محرك اللغة العربية العصبي — 19 endpoint');
});

// ═══════════════════════════════════════════════════════════════
// GET /health — حالة المحرك
// ═══════════════════════════════════════════════════════════════
router.get('/health', (req, res) => {
    ok(res, {
        status: 'healthy',
        engine: 'ArabicUTF8NeuralEngine',
        startedAt: engineStartedAt,
        uptime: process.uptime(),
        unicodeBlocks: UNICODE_BLOCKS.length,
        arabicLetters: ARABIC_LETTERS.length,
        quranVerses: QURAN_VERSES.length,
        sunnahHadiths: SUNNAH_HADITHS.length,
        maqasid: MAQASID.length,
        neuralLayers: NEURAL_NETWORK.totalLayers,
        neuralNeurons: NEURAL_NETWORK.totalNeurons
    }, 'المحرك يعمل بكفاءة');
});

// ═══════════════════════════════════════════════════════════════
// GET /unicode-blocks — كتل Unicode
// ═══════════════════════════════════════════════════════════════
router.get('/unicode-blocks', (req, res) => {
    ok(res, UNICODE_BLOCKS.map(b => ({
        ...b,
        rangeHex: [`U+${b.range[0].toString(16).toUpperCase().padStart(4,'0')}`,
                   `U+${b.range[1].toString(16).toUpperCase().padStart(4,'0')}`],
        size: b.range[1] - b.range[0] + 1
    })), `${UNICODE_BLOCKS.length} كتل Unicode العربية`);
});

// ═══════════════════════════════════════════════════════════════
// GET /letters — الحروف العربية
// ═══════════════════════════════════════════════════════════════
router.get('/letters', (req, res) => {
    const { type } = req.query; // ?type=letter|diacritic|connector|quranic
    let data = ARABIC_LETTERS;
    if (type) data = data.filter(l => (l.type || 'letter') === type);
    ok(res, data.map(l => ({
        ...l,
        unicodeHex: `U+${l.unicode.toString(16).toUpperCase().padStart(4,'0')}`
    })), `${data.length} حرف ومُشكِّل عربي`);
});

// ═══════════════════════════════════════════════════════════════
// GET /quran — قاعدة القرآن الكريم
// ═══════════════════════════════════════════════════════════════
router.get('/quran', (req, res) => {
    const { maqasid } = req.query;
    let data = QURAN_VERSES;
    if (maqasid) data = data.filter(v => v.maqasid === maqasid);
    ok(res, data, `${data.length} آية قرآنية`);
});

// GET /quran/search
router.get('/quran/search', (req, res) => {
    const q = (req.query.q || '').trim();
    if (!q) return err(res, 'مطلوب معامل البحث ?q=');
    const results = QURAN_VERSES.filter(v =>
        v.text.includes(q) || v.surah.includes(q) || v.theme.includes(q) || v.maqasid.includes(q)
    );
    ok(res, results, `${results.length} نتيجة للبحث: "${q}"`);
});

// ═══════════════════════════════════════════════════════════════
// GET /sunnah — السنة النبوية
// ═══════════════════════════════════════════════════════════════
router.get('/sunnah', (req, res) => {
    ok(res, SUNNAH_HADITHS, `${SUNNAH_HADITHS.length} أحاديث صحيحة`);
});

// GET /sunnah/search
router.get('/sunnah/search', (req, res) => {
    const q = (req.query.q || '').trim();
    if (!q) return err(res, 'مطلوب معامل البحث ?q=');
    const results = SUNNAH_HADITHS.filter(h =>
        h.text.includes(q) || h.book.includes(q) || h.theme.includes(q)
    );
    ok(res, results, `${results.length} نتيجة للبحث: "${q}"`);
});

// ═══════════════════════════════════════════════════════════════
// GET /maqasid — مقاصد الشريعة
// ═══════════════════════════════════════════════════════════════
router.get('/maqasid', (req, res) => {
    ok(res, MAQASID, 'مقاصد الشريعة الخمس');
});

// ═══════════════════════════════════════════════════════════════
// GET /network/status — حالة الشبكة العصبية
// ═══════════════════════════════════════════════════════════════
router.get('/network/status', (req, res) => {
    ok(res, NEURAL_NETWORK, `شبكة عصبية — ${NEURAL_NETWORK.totalNeurons} خلية في ${NEURAL_NETWORK.totalLayers} طبقات`);
});

// ═══════════════════════════════════════════════════════════════
// POST /encode — ترميز UTF-8
// ═══════════════════════════════════════════════════════════════
router.post('/encode', (req, res) => {
    const { text } = req.body;
    if (!text) return err(res, 'مطلوب حقل text');
    ok(res, encodeText(text), 'تم الترميز بنجاح');
});

// ═══════════════════════════════════════════════════════════════
// POST /codepoints — تحليل نقاط Unicode
// ═══════════════════════════════════════════════════════════════
router.post('/codepoints', (req, res) => {
    const { text } = req.body;
    if (!text) return err(res, 'مطلوب حقل text');
    ok(res, analyzeCodePoints(text), `تم تحليل ${text.length} رمز`);
});

// ═══════════════════════════════════════════════════════════════
// POST /neural — تشغيل الشبكة العصبية
// ═══════════════════════════════════════════════════════════════
router.post('/neural', (req, res) => {
    const { text } = req.body;
    if (!text) return err(res, 'مطلوب حقل text');
    ok(res, runNeuralNetwork(text), 'اكتملت معالجة الشبكة العصبية');
});

// ═══════════════════════════════════════════════════════════════
// POST /analyze — التحليل اللغوي
// ═══════════════════════════════════════════════════════════════
router.post('/analyze', (req, res) => {
    const { text } = req.body;
    if (!text) return err(res, 'مطلوب حقل text');
    ok(res, analyzeSentence(text), 'اكتمل التحليل اللغوي');
});

// ═══════════════════════════════════════════════════════════════
// POST /detect-language — كشف اللغة
// ═══════════════════════════════════════════════════════════════
router.post('/detect-language', (req, res) => {
    const { text } = req.body;
    if (!text) return err(res, 'مطلوب حقل text');
    ok(res, detectLanguage(text), 'اكتمل كشف اللغة');
});

// ═══════════════════════════════════════════════════════════════
// POST /normalize — تطبيع النص
// ═══════════════════════════════════════════════════════════════
router.post('/normalize', (req, res) => {
    const { text, keepDiacritics } = req.body;
    if (!text) return err(res, 'مطلوب حقل text');
    const normalized = normalizeText(text);
    const withoutDiac = keepDiacritics ? normalized : removeDiacritics(normalized);
    ok(res, { original: text, normalized: withoutDiac, changes: text !== withoutDiac }, 'اكتمل التطبيع');
});

// ═══════════════════════════════════════════════════════════════
// POST /similarity — حساب التشابه
// ═══════════════════════════════════════════════════════════════
router.post('/similarity', (req, res) => {
    const { text1, text2 } = req.body;
    if (!text1 || !text2) return err(res, 'مطلوب حقلا text1 و text2');
    const score = calculateSimilarity(text1, text2);
    ok(res, { text1, text2, similarity: score, percentage: `${(score * 100).toFixed(1)}%` }, 'اكتمل حساب التشابه');
});

// ═══════════════════════════════════════════════════════════════
// POST /embedding — توليد التضمين (64 بُعد)
// ═══════════════════════════════════════════════════════════════
router.post('/embedding', (req, res) => {
    const { text } = req.body;
    if (!text) return err(res, 'مطلوب حقل text');
    const emb = generateEmbedding(text);
    ok(res, { text, dims: 64, embedding: emb }, 'اكتمل توليد التضمين');
});

// ═══════════════════════════════════════════════════════════════
// POST /root — استخراج الجذر
// ═══════════════════════════════════════════════════════════════
router.post('/root', (req, res) => {
    const { word } = req.body;
    if (!word) return err(res, 'مطلوب حقل word');
    ok(res, extractRoot(word), 'اكتمل استخراج الجذر');
});

// ═══════════════════════════════════════════════════════════════
// POST /full-analysis — التحليل الشامل
// ═══════════════════════════════════════════════════════════════
router.post('/full-analysis', (req, res) => {
    const { text } = req.body;
    if (!text) return err(res, 'مطلوب حقل text');

    const words = text.split(/\s+/).filter(Boolean);
    ok(res, {
        input: text,
        encoding: encodeText(text),
        language: detectLanguage(text),
        sentence: analyzeSentence(text),
        codepoints: analyzeCodePoints(text).slice(0, 20),
        roots: words.slice(0, 5).map(w => extractRoot(w)),
        normalized: normalizeText(text),
        embedding: { dims: 64, preview: generateEmbedding(text).slice(0, 8) },
        neural: runNeuralNetwork(text),
        quranMatches: QURAN_VERSES.filter(v => words.some(w => w.length > 3 && v.text.includes(w))).slice(0, 2),
        sunnahMatches: SUNNAH_HADITHS.filter(h => words.some(w => w.length > 3 && h.text.includes(w))).slice(0, 2)
    }, 'اكتمل التحليل الشامل — عَلَّمَهُ الْبَيَانَ');
});

module.exports = { router };
