/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  ☪️ مسارات الشريعة الإسلامية
 *  Islamic Sharia Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();
const database = require('../config/database');

// استيراد محرك الامتثال الشرعي
let ShariaCompliance = null;
try {
    ShariaCompliance = require('../lib/sharia-compliance');
} catch (e) {
    console.warn('⚠️ محرك الامتثال الشرعي غير متوفر');
}

// ─── القواعد الشرعية ──────────────────────────────────────────────────────────

router.get('/rules', (req, res) => {
    const rules = database.read('shariaRules');
    
    res.json({
        success: true,
        rules: rules || getDefaultRules()
    });
});

// ─── التحقق من معاملة ─────────────────────────────────────────────────────────

router.post('/validate', (req, res) => {
    const { transaction } = req.body;

    if (!transaction) {
        return res.status(400).json({
            success: false,
            message: 'يرجى إدخال بيانات المعاملة'
        });
    }

    const validation = validateTransaction(transaction);

    res.json({
        success: true,
        validation
    });
});

// ─── التدقيق الشرعي ───────────────────────────────────────────────────────────

router.post('/audit', (req, res) => {
    const { type, data } = req.body;

    const audit = {
        id: require('uuid').v4(),
        type: type || 'general',
        timestamp: new Date().toISOString(),
        checks: [],
        score: 0,
        status: 'pending'
    };

    // فحص الربا
    audit.checks.push({
        rule: 'تحريم الربا',
        reference: 'البقرة: 275',
        status: checkRiba(data) ? 'pass' : 'fail',
        details: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا'
    });

    // فحص الغرر
    audit.checks.push({
        rule: 'تحريم الغرر',
        reference: 'حديث صحيح',
        status: checkGharar(data) ? 'pass' : 'fail',
        details: 'نهى النبي ﷺ عن بيع الغرر'
    });

    // فحص الحلال
    audit.checks.push({
        rule: 'اشتراط الحلال',
        reference: 'المائدة: 88',
        status: checkHalal(data) ? 'pass' : 'fail',
        details: 'وَكُلُوا مِمَّا رَزَقَكُمُ اللَّهُ حَلَالًا طَيِّبًا'
    });

    // فحص الشفافية
    audit.checks.push({
        rule: 'الشفافية والوضوح',
        reference: 'حديث صحيح',
        status: checkTransparency(data) ? 'pass' : 'fail',
        details: 'البيّعان بالخيار ما لم يتفرقا'
    });

    // حساب الدرجة
    const passed = audit.checks.filter(c => c.status === 'pass').length;
    audit.score = Math.round((passed / audit.checks.length) * 100);
    audit.status = audit.score === 100 ? 'compliant' : audit.score >= 75 ? 'partial' : 'non-compliant';

    res.json({
        success: true,
        audit
    });
});

// ─── حساب الزكاة ──────────────────────────────────────────────────────────────

router.post('/zakat/calculate', (req, res) => {
    const { assets, liabilities = 0, goldPrice = 250, silverPrice = 3.5 } = req.body;

    if (!assets) {
        return res.status(400).json({
            success: false,
            message: 'يرجى إدخال قيمة الأصول'
        });
    }

    // نصاب الزكاة (85 جرام ذهب أو 595 جرام فضة)
    const goldNisab = 85 * goldPrice;  // نصاب الذهب
    const silverNisab = 595 * silverPrice;  // نصاب الفضة
    const nisab = Math.min(goldNisab, silverNisab);  // الأقل (الأحوط)

    const netAssets = assets - liabilities;
    const zakatDue = netAssets >= nisab ? netAssets * 0.025 : 0;  // 2.5%

    res.json({
        success: true,
        calculation: {
            assets,
            liabilities,
            netAssets,
            nisab: {
                gold: goldNisab,
                silver: silverNisab,
                applicable: nisab
            },
            zakatRate: '2.5%',
            zakatDue: Math.round(zakatDue * 100) / 100,
            isZakatRequired: netAssets >= nisab,
            currency: 'SAR'
        },
        note: 'هذا حساب تقريبي. يُنصح بمراجعة عالم شرعي للتأكد.'
    });
});

// ─── فتاوى المعادن والسكراب ───────────────────────────────────────────────────

router.get('/fatwas', (req, res) => {
    const { category } = req.query;

    const fatwas = [
        {
            id: 1,
            title: 'حكم بيع وشراء الذهب والفضة',
            category: 'precious-metals',
            ruling: 'يجوز بشرط التقابض في المجلس إذا كان من نفس الجنس',
            evidence: 'حديث: الذهب بالذهب والفضة بالفضة... يداً بيد',
            scholar: 'اللجنة الدائمة للإفتاء'
        },
        {
            id: 2,
            title: 'حكم بيع السكراب المجهول',
            category: 'scrap',
            ruling: 'لا يجوز بيع ما فيه جهالة كثيرة تفضي إلى النزاع',
            evidence: 'النهي عن بيع الغرر',
            scholar: 'هيئة كبار العلماء'
        },
        {
            id: 3,
            title: 'حكم إعادة التدوير',
            category: 'recycling',
            ruling: 'جائز ومستحب لما فيه من حفظ المال والبيئة',
            evidence: 'حفظ المال من مقاصد الشريعة',
            scholar: 'المجمع الفقهي الإسلامي'
        },
        {
            id: 4,
            title: 'حكم التجارة الإلكترونية في المعادن',
            category: 'e-commerce',
            ruling: 'جائزة بشرط الشفافية وعدم الغرر',
            evidence: 'الأصل في المعاملات الإباحة',
            scholar: 'هيئة المحاسبة والمراجعة الشرعية'
        }
    ];

    const filtered = category 
        ? fatwas.filter(f => f.category === category)
        : fatwas;

    res.json({
        success: true,
        count: filtered.length,
        fatwas: filtered
    });
});

// ─── دوال مساعدة ──────────────────────────────────────────────────────────────

function getDefaultRules() {
    return {
        principles: [
            { id: 'riba', name: 'تحريم الربا', active: true },
            { id: 'gharar', name: 'تحريم الغرر', active: true },
            { id: 'halal', name: 'اشتراط الحلال', active: true },
            { id: 'transparency', name: 'الشفافية', active: true }
        ]
    };
}

function validateTransaction(transaction) {
    const issues = [];
    const warnings = [];

    // فحص الربا
    if (transaction.interestRate && transaction.interestRate > 0) {
        issues.push({
            type: 'riba',
            message: 'المعاملة تحتوي على فائدة ربوية',
            severity: 'critical'
        });
    }

    // فحص الغرر
    if (!transaction.quantity || !transaction.price || !transaction.description) {
        warnings.push({
            type: 'gharar',
            message: 'المعاملة تفتقر لبعض التفاصيل (قد يكون فيها غرر)',
            severity: 'warning'
        });
    }

    return {
        isValid: issues.length === 0,
        issues,
        warnings,
        recommendation: issues.length > 0 
            ? 'يجب تعديل المعاملة لتتوافق مع الشريعة'
            : 'المعاملة تبدو متوافقة مع الشريعة'
    };
}

function checkRiba(data) {
    if (!data) return true;
    return !data.interestRate && !data.usury && !data.riba;
}

function checkGharar(data) {
    if (!data) return true;
    return data.description && data.quantity && data.price;
}

function checkHalal(data) {
    if (!data) return true;
    const haram = ['خمر', 'ميسر', 'قمار', 'خنزير'];
    const text = JSON.stringify(data).toLowerCase();
    return !haram.some(h => text.includes(h));
}

function checkTransparency(data) {
    if (!data) return true;
    return data.terms || data.conditions || data.contract;
}

module.exports = router;
