/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  📖 مسارات اللغة العربية
 *  Arabic Language Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();

// استيراد المحركات
let ArabicLanguageEngine = null;
let ArabicParserEngine = null;

try {
    ArabicLanguageEngine = require('../lib/arabic-language-engine');
} catch (e) {
    console.warn('⚠️ محرك اللغة العربية غير متوفر');
}

try {
    ArabicParserEngine = require('../lib/arabic-parser-engine');
} catch (e) {
    console.warn('⚠️ محرك الإعراب غير متوفر');
}

// ─── إعراب الجملة ─────────────────────────────────────────────────────────────

router.post('/parse', (req, res) => {
    if (!ArabicParserEngine || !ArabicParserEngine.محرك) {
        return res.status(503).json({
            success: false,
            message: 'محرك الإعراب غير متوفر'
        });
    }

    const { جملة, sentence } = req.body;
    const text = جملة || sentence;

    if (!text) {
        return res.status(400).json({
            success: false,
            message: 'يرجى إدخال جملة للإعراب'
        });
    }

    try {
        const result = ArabicParserEngine.محرك.أعرب_الجملة(text);
        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في الإعراب',
            error: error.message
        });
    }
});

// ─── نموذج برمجي للجملة ───────────────────────────────────────────────────────

router.post('/parse/model', (req, res) => {
    if (!ArabicParserEngine || !ArabicParserEngine.محرك) {
        return res.status(503).json({
            success: false,
            message: 'محرك الإعراب غير متوفر'
        });
    }

    const { جملة, sentence } = req.body;
    const text = جملة || sentence;

    if (!text) {
        return res.status(400).json({
            success: false,
            message: 'يرجى إدخال جملة'
        });
    }

    try {
        const model = ArabicParserEngine.محرك.نمذج_للبرمجة(text);
        res.json({
            success: true,
            data: model,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في النمذجة',
            error: error.message
        });
    }
});

// ─── نوع الكلمة ───────────────────────────────────────────────────────────────

router.post('/parse/word-type', (req, res) => {
    if (!ArabicParserEngine || !ArabicParserEngine.محرك) {
        return res.status(503).json({
            success: false,
            message: 'محرك الإعراب غير متوفر'
        });
    }

    const { كلمة, word } = req.body;
    const text = كلمة || word;

    if (!text) {
        return res.status(400).json({
            success: false,
            message: 'يرجى إدخال كلمة'
        });
    }

    try {
        const result = ArabicParserEngine.محرك.حدد_نوع_الكلمة(text);
        res.json({
            success: true,
            data: {
                الكلمة: text,
                ...result
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديد النوع',
            error: error.message
        });
    }
});

// ─── تحليل الجملة ─────────────────────────────────────────────────────────────

router.post('/analyze', (req, res) => {
    if (!ArabicLanguageEngine) {
        return res.status(503).json({
            success: false,
            message: 'محرك اللغة العربية غير متوفر'
        });
    }

    const { جملة, sentence } = req.body;
    const text = جملة || sentence;

    if (!text) {
        return res.status(400).json({
            success: false,
            message: 'يرجى إدخال جملة'
        });
    }

    try {
        const analysis = ArabicLanguageEngine.حلل_الجملة 
            ? ArabicLanguageEngine.حلل_الجملة(text)
            : { text, message: 'التحليل غير متوفر' };

        res.json({
            success: true,
            data: analysis,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في التحليل',
            error: error.message
        });
    }
});

// ─── القواعد النحوية ──────────────────────────────────────────────────────────

router.get('/grammar', (req, res) => {
    const grammar = {
        sections: [
            { id: 'noun', name: 'الاسم', description: 'كلمة تدل على معنى في نفسها غير مقترن بزمان' },
            { id: 'verb', name: 'الفعل', description: 'كلمة تدل على حدث مقترن بزمان' },
            { id: 'particle', name: 'الحرف', description: 'كلمة لا تدل على معنى في نفسها' }
        ],
        prepositions: ArabicParserEngine?.حروف_الجر || {},
        kanaFamily: ArabicParserEngine?.كان_وأخواتها || {},
        innaFamily: ArabicParserEngine?.إن_وأخواتها || {}
    };

    res.json({
        success: true,
        grammar
    });
});

// ─── الصرف ────────────────────────────────────────────────────────────────────

router.post('/morphology', (req, res) => {
    const { كلمة, word } = req.body;
    const text = كلمة || word;

    if (!text) {
        return res.status(400).json({
            success: false,
            message: 'يرجى إدخال كلمة'
        });
    }

    // تحليل صرفي أساسي
    const morphology = {
        word: text,
        root: extractRoot(text),
        pattern: detectPattern(text),
        type: detectWordType(text)
    };

    res.json({
        success: true,
        data: morphology
    });
});

// ─── ترجمة الكود للعربية ──────────────────────────────────────────────────────

router.post('/translate-code', (req, res) => {
    const { code, direction = 'toArabic' } = req.body;

    if (!code) {
        return res.status(400).json({
            success: false,
            message: 'يرجى إدخال الكود'
        });
    }

    // كلمات مفتاحية عربية
    const arabicKeywords = {
        'if': 'إذا',
        'else': 'وإلا',
        'while': 'طالما',
        'for': 'لكل',
        'function': 'دالة',
        'return': 'أرجع',
        'let': 'متغير',
        'const': 'ثابت',
        'var': 'عرّف',
        'class': 'صنف',
        'new': 'جديد',
        'this': 'هذا',
        'true': 'صحيح',
        'false': 'خطأ',
        'null': 'فارغ',
        'undefined': 'غير_معرّف',
        'try': 'حاول',
        'catch': 'التقط',
        'throw': 'ارمِ',
        'async': 'متزامن',
        'await': 'انتظر',
        'import': 'استورد',
        'export': 'صدّر',
        'default': 'افتراضي',
        'switch': 'حسب',
        'case': 'حالة',
        'break': 'توقف',
        'continue': 'استمر',
        'do': 'افعل',
        'in': 'في',
        'of': 'من',
        'typeof': 'نوع',
        'instanceof': 'نسخة_من',
        'delete': 'احذف',
        'void': 'فراغ',
        'yield': 'أنتج',
        'super': 'أب',
        'extends': 'يرث',
        'static': 'ثابت_الصنف',
        'get': 'احصل',
        'set': 'عيّن',
        'print': 'اطبع',
        'console.log': 'اطبع'
    };

    let translated = code;

    if (direction === 'toArabic') {
        for (const [en, ar] of Object.entries(arabicKeywords)) {
            translated = translated.replace(new RegExp(`\\b${en}\\b`, 'g'), ar);
        }
    } else {
        for (const [en, ar] of Object.entries(arabicKeywords)) {
            translated = translated.replace(new RegExp(ar, 'g'), en);
        }
    }

    res.json({
        success: true,
        original: code,
        translated,
        direction
    });
});

// ─── دوال مساعدة ──────────────────────────────────────────────────────────────

function extractRoot(word) {
    // استخراج الجذر (تبسيط)
    const cleaned = word.replace(/[\u064B-\u0652]/g, ''); // إزالة التشكيل
    if (cleaned.length <= 3) return cleaned;
    
    // محاولة استخراج جذر ثلاثي
    const vowels = ['ا', 'و', 'ي', 'ى', 'ة', 'ء'];
    let root = '';
    for (const char of cleaned) {
        if (!vowels.includes(char) && root.length < 3) {
            root += char;
        }
    }
    return root || cleaned.substring(0, 3);
}

function detectPattern(word) {
    const len = word.replace(/[\u064B-\u0652]/g, '').length;
    if (len === 3) return 'فَعَلَ';
    if (len === 4) return 'فَعْلَلَ';
    if (len === 5) return 'تَفَعَّلَ';
    if (len === 6) return 'اسْتَفْعَلَ';
    return 'غير محدد';
}

function detectWordType(word) {
    const cleaned = word.replace(/[\u064B-\u0652]/g, '');
    
    // فحص بسيط
    if (['ال'].some(p => cleaned.startsWith(p))) return 'اسم معرفة';
    if (['ي', 'ت', 'ن', 'أ'].includes(cleaned[0]) && cleaned.length > 2) return 'فعل مضارع';
    if (cleaned.endsWith('ة') || cleaned.endsWith('ات')) return 'اسم';
    
    return 'غير محدد';
}

module.exports = router;
