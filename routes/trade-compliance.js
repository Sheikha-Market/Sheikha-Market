/**
 * ⚖️🌍 منظومة شيخة — محرك الامتثال والتشريعات التجارية الدولية
 * بسم الله الرحمن الرحيم
 * يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ — المائدة 1
 *
 * Trade Compliance Routes:
 *   GET  /api/compliance/overview             — نظرة عامة على منظومة الامتثال
 *   POST /api/compliance/check                — فحص صفقة لكل التشريعات
 *   POST /api/compliance/fix                  — تصحيح تلقائي للمخالفات في صفقة
 *   GET  /api/compliance/regulations          — كل التشريعات الدولية
 *   GET  /api/compliance/regulations/:region  — تشريعات منطقة/دولة
 *   GET  /api/compliance/incoterms-guide      — دليل إنكوترمز للامتثال
 *   GET  /api/compliance/wrong-practices      — قائمة الممارسات الخاطئة + الإصلاح
 *   POST /api/compliance/shariah-check        — فحص شرعي إسلامي لصفقة
 *   GET  /api/compliance/aml-rules            — قواعد مكافحة غسل الأموال
 *   GET  /api/compliance/export-controls      — ضوابط التصدير
 *   GET  /api/compliance/customs/:country     — متطلبات جمارك دولة محددة
 *   GET  /api/compliance/local-customs/:code  — الأعراف المحلية لدولة
 *   POST /api/compliance/document-checklist   — قائمة الوثائق المطلوبة لصفقة
 *   GET  /api/compliance/health               — فحص صحة
 */

'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// ── تحميل البيانات ──────────────────────────────────────────────────────────
let legislationData = {};
let exchangeData = {};
try {
    const lgPath = path.join(__dirname, '../data/international-trade-legislation.json');
    const exPath = path.join(__dirname, '../data/global-exchange-data.json');
    if (fs.existsSync(lgPath)) legislationData = JSON.parse(fs.readFileSync(lgPath, 'utf8'));
    if (fs.existsSync(exPath)) exchangeData = JSON.parse(fs.readFileSync(exPath, 'utf8'));
} catch (e) {
    console.warn('[TradeCompliance] تحذير تحميل البيانات:', e.message);
}

// ── دوال مساعدة ─────────────────────────────────────────────────────────────

/**
 * تحليل المخاطر وإنتاج قائمة المشاكل والتصحيحات
 */
function analyzeTransaction(transaction) {
    const issues = [];
    const fixes = [];
    const warnings = [];

    const {
        metal,
        seller_country,
        buyer_country,
        quantity_tons,
        incoterm,
        has_inspection,
        has_insurance,
        has_contract,
        declared_value_usd,
        payment_method,
        scrap_grade,
        is_hazardous,
        destination_region,
        include_lead,
        include_mercury
    } = transaction;

    const wrong = (legislationData.compliance_rules || {}).wrong_practices_fixes || {};

    // ① العقد
    if (!has_contract) {
        issues.push({ code: 'NO_CONTRACT', severity: 'critical', msg: 'لا يوجد عقد موثق للصفقة' });
        fixes.push({
            code: 'NO_CONTRACT',
            action:
                wrong.no_contract?.fix ||
                'أبرم عقداً مكتوباً يحدد: السعر، الكمية، الجودة، نقطة التسليم، القانون الحاكم'
        });
    }

    // ② الإنكوترم
    if (!incoterm) {
        issues.push({ code: 'NO_INCOTERM', severity: 'critical', msg: 'لم يُحدَّد شرط إنكوترم' });
        fixes.push({
            code: 'NO_INCOTERM',
            action: wrong.incoterm_confusion?.fix || 'استخدم: FOB جدة — CIF شنغهاي — DAP هامبورغ'
        });
    }

    // ③ التفتيش
    if (!has_inspection && quantity_tons >= 50) {
        issues.push({
            code: 'NO_INSPECTION',
            severity: 'high',
            msg: 'لا يوجد تفتيش مستقل لشحنة كبيرة'
        });
        fixes.push({
            code: 'NO_INSPECTION',
            action:
                wrong.no_inspection?.fix ||
                'وكّل SGS أو Bureau Veritas للتفتيش قبل الشحن وإصدار شهادة الوزن والجودة'
        });
    }

    // ④ التأمين
    if (!has_insurance) {
        warnings.push({
            code: 'NO_INSURANCE',
            severity: 'medium',
            msg: 'لا يوجد تأمين/تكافل على الشحنة'
        });
        fixes.push({
            code: 'NO_INSURANCE',
            action:
                wrong.no_insurance?.fix ||
                'احصل على وثيقة تأمين بحري Marine Cargo — يفضل تكافل الشحن'
        });
    }

    // ⑤ المواد الخطرة
    if (include_lead || metal === 'lead') {
        issues.push({
            code: 'HAZARDOUS_LEAD',
            severity: 'high',
            msg: 'الشحنة تحتوي على رصاص — يتطلب ترخيصاً بيئياً خاصاً'
        });
        fixes.push({
            code: 'HAZARDOUS_LEAD',
            action: 'احصل على تصريح البازل PIC + ترخيص بيئي من وزارة البيئة + شهادة التخلص الآمن من المستلم'
        });
    }

    if (include_mercury) {
        issues.push({
            code: 'MERCURY_BANNED',
            severity: 'critical',
            msg: 'الزئبق ممنوع دولياً — اتفاقية ميناماتا'
        });
        fixes.push({
            code: 'MERCURY_BANNED',
            action: 'أوقف الصفقة فوراً — الزئبق محظور بموجب اتفاقية ميناماتا 2017'
        });
    }

    // ⑥ تصدير للدول الخاضعة لعقوبات
    const sanctionedCountries = ['KP', 'IR', 'SY', 'BY', 'MM'];
    if (buyer_country && sanctionedCountries.includes(buyer_country.toUpperCase())) {
        issues.push({
            code: 'SANCTIONED_COUNTRY',
            severity: 'critical',
            msg: `تصدير إلى دولة خاضعة لعقوبات: ${buyer_country}`
        });
        fixes.push({
            code: 'SANCTIONED_COUNTRY',
            action: 'أوقف الصفقة فوراً — تحقق من قوائم OFAC + UN + EU قبل أي تعامل'
        });
    }

    // ⑦ Dodd-Frank للمعادن الأربعة
    const df_metals = ['tin', 'tantalum', 'tungsten', 'gold'];
    if (
        df_metals.includes(metal) &&
        (buyer_country === 'US' || destination_region === 'North_America')
    ) {
        warnings.push({
            code: 'DODD_FRANK',
            severity: 'medium',
            msg: 'معدن Dodd-Frank — يستلزم إثبات سلسلة التوريد (Conflict Minerals)'
        });
        fixes.push({
            code: 'DODD_FRANK',
            action: 'أعد وثيقة OECD Due Diligence لإثبات مصدر المعدن بعيداً عن مناطق النزاع في الكونغو'
        });
    }

    // ⑧ النفايات الإلكترونية لأوروبا
    if (metal === 'e_waste' || scrap_grade === 'e_waste') {
        if (destination_region === 'Europe' || buyer_country === 'DE' || buyer_country === 'FR') {
            issues.push({
                code: 'EU_EWASTE',
                severity: 'high',
                msg: 'خردة إلكترونية لأوروبا — تستلزم تصريح بازل وشهادة EndOfWaste'
            });
            fixes.push({
                code: 'EU_EWASTE',
                action: 'احصل على موافقة PIC + شهادة EndOfWaste + وثائق WEEE الأوروبية من المستورد'
            });
        }
    }

    // ⑨ CBAM الأوروبي
    if ((metal === 'steel' || metal === 'aluminum') && destination_region === 'Europe') {
        warnings.push({
            code: 'EU_CBAM',
            severity: 'medium',
            msg: 'رسوم CBAM الكربونية تطبق على الفولاذ والألمنيوم من خارج الاتحاد الأوروبي'
        });
        fixes.push({
            code: 'EU_CBAM',
            action: 'وفر وثائق بصمة الكربون لمصنعك — احسب رسوم CBAM ضمن تسعيرك للمشتري الأوروبي'
        });
    }

    // ⑩ AML — المعاملات النقدية الكبيرة
    if (payment_method === 'cash' && declared_value_usd * 3.75 > 60000) {
        issues.push({
            code: 'AML_CASH',
            severity: 'high',
            msg: 'دفع نقدي كبير يستلزم إبلاغ جهات مكافحة غسل الأموال'
        });
        fixes.push({
            code: 'AML_CASH',
            action: 'استخدم تحويل بنكي TT أو اعتماد مستندي LC — أي نقدي > 60,000 SAR يستلزم إبلاغ في السعودية'
        });
    }

    // درجة الامتثال
    const criticals = issues.filter(i => i.severity === 'critical').length;
    const highs = issues.filter(i => i.severity === 'high').length;
    let complianceScore = 100 - criticals * 25 - highs * 10 - warnings.length * 3;
    complianceScore = Math.max(0, complianceScore);

    return {
        issues,
        fixes,
        warnings,
        compliance_score: complianceScore,
        compliance_label:
            complianceScore >= 90
                ? 'ممتاز ✓'
                : complianceScore >= 70
                  ? 'مقبول — يحتاج تحسين'
                  : complianceScore >= 40
                    ? 'ضعيف — يجب تصحيح'
                    : 'خطر — توقف وصحح',
        can_proceed: criticals === 0,
        total_issues: issues.length,
        total_warnings: warnings.length
    };
}

// ── نقاط نهاية API ──────────────────────────────────────────────────────────

/**
 * GET /api/compliance/overview
 */
router.get('/overview', (req, res) => {
    const wrongPractices = (legislationData.compliance_rules || {}).wrong_practices_fixes || {};
    const wrongCount = Object.keys(wrongPractices).filter(k => k !== '_info').length;

    res.json({
        success: true,
        message: 'منظومة الامتثال التجاري الدولي — شيخة',
        data: {
            title: 'محرك الامتثال والتشريعات التجارية',
            subtitle: 'مرجع كامل للقوانين الدولية وإصلاح الممارسات الخاطئة',
            quran: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ — المائدة 1',
            features: [
                'فحص الصفقة لكل التشريعات الدولية',
                'تصحيح تلقائي للمخالفات',
                'تشريعات WTO + بازل + Dodd-Frank + REACH + CBAM',
                'دليل الأعراف المحلية لـ 15+ دولة',
                'فحص شرعي إسلامي مدمج',
                'قوائم العقوبات والدول المحظورة'
            ],
            wrong_practices_covered: wrongCount,
            regions_covered: Object.keys(legislationData.regional_regulations || {}).length,
            arbitration_bodies: (legislationData.arbitration_bodies || []).length
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/compliance/check
 * فحص شامل لصفقة
 */
router.post('/check', (req, res) => {
    const transaction = req.body;
    if (!transaction || typeof transaction !== 'object') {
        return res.status(400).json({ success: false, message: 'أرسل بيانات الصفقة في body' });
    }

    const result = analyzeTransaction(transaction);

    res.json({
        success: true,
        message: result.can_proceed
            ? 'الصفقة جاهزة — لا مشاكل حرجة'
            : 'يوجد مخالفات حرجة — يجب التصحيح قبل المتابعة',
        data: {
            transaction_summary: transaction,
            compliance_score: result.compliance_score,
            compliance_label: result.compliance_label,
            can_proceed: result.can_proceed,
            critical_issues: result.issues.filter(i => i.severity === 'critical'),
            high_issues: result.issues.filter(i => i.severity === 'high'),
            warnings: result.warnings,
            actionable_fixes: result.fixes,
            total_issues: result.total_issues,
            total_warnings: result.total_warnings
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/compliance/fix
 * تصحيح تلقائي — يُرجع الصفقة مُصحّحة
 */
router.post('/fix', (req, res) => {
    const transaction = req.body;
    if (!transaction) {
        return res.status(400).json({ success: false, message: 'أرسل بيانات الصفقة' });
    }

    const analysis = analyzeTransaction(transaction);
    const fixed = { ...transaction };
    const applied_fixes = [];

    // تطبيق التصحيحات التلقائية الممكنة
    if (!fixed.has_contract) {
        fixed.has_contract = true;
        applied_fixes.push('تم إضافة تذكير بإبرام عقد مكتوب');
    }
    if (!fixed.has_inspection && (fixed.quantity_tons || 0) >= 50) {
        fixed.requires_inspection = true;
        applied_fixes.push('تم تعيين التفتيش المستقل إلزامياً');
    }
    if (!fixed.has_insurance) {
        fixed.has_insurance = 'takaful_required';
        applied_fixes.push('تم تحديد الحاجة لتكافل الشحن');
    }
    if (!fixed.incoterm) {
        fixed.incoterm = 'FOB';
        applied_fixes.push('تم تعيين FOB كشرط افتراضي — يرجى المراجعة مع الطرف الآخر');
    }

    const reanalysis = analyzeTransaction(fixed);

    res.json({
        success: true,
        message: 'تم تطبيق التصحيحات الممكنة',
        data: {
            original_transaction: transaction,
            fixed_transaction: fixed,
            applied_fixes,
            before: { score: analysis.compliance_score, issues: analysis.total_issues },
            after: { score: reanalysis.compliance_score, issues: reanalysis.total_issues },
            remaining_issues: reanalysis.issues,
            note: 'بعض المشاكل تستلزم تدخلاً يدوياً — راجع remaining_issues'
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/compliance/regulations
 * كل التشريعات الدولية
 */
router.get('/regulations', (req, res) => {
    const wto = legislationData.WTO || {};
    const regional = legislationData.regional_regulations || {};

    res.json({
        success: true,
        message: 'التشريعات التجارية الدولية — مرجع شيخة',
        data: {
            WTO: {
                nameAr: wto.nameAr,
                members: wto.members,
                agreements: Object.values(wto.agreements || {}).map(a => ({
                    id: a.id,
                    name: a.nameAr || a.name,
                    relevance: a.relevance
                }))
            },
            regional_regulations: Object.keys(regional),
            total_frameworks:
                Object.keys(wto.agreements || {}).length + Object.keys(regional).length
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/compliance/regulations/:region
 * تشريعات منطقة أو دولة
 */
router.get('/regulations/:region', (req, res) => {
    const region = req.params.region.toUpperCase();
    const regional = legislationData.regional_regulations || {};
    const data = regional[region] || regional[req.params.region];

    if (!data) {
        return res.status(404).json({
            success: false,
            message: `منطقة غير موجودة: ${region}`,
            available: Object.keys(regional)
        });
    }

    res.json({ success: true, data, region, timestamp: new Date().toISOString() });
});

/**
 * GET /api/compliance/wrong-practices
 * دليل الممارسات الخاطئة + الإصلاح
 */
router.get('/wrong-practices', (req, res) => {
    const compliance = legislationData.compliance_rules || {};
    const wrong = compliance.wrong_practices_fixes || {};
    const list = Object.entries(wrong)
        .filter(([k]) => k !== '_info')
        .map(([k, v]) => ({ id: k, ...v }));

    res.json({
        success: true,
        message: 'الممارسات التجارية الخاطئة وكيفية إصلاحها',
        data: {
            practices: list,
            total: list.length,
            categories: ['توثيق', 'جودة', 'أسعار', 'شرعي', 'تأمين', 'قانوني']
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/compliance/shariah-check
 * فحص شرعي للصفقة
 */
router.post('/shariah-check', (req, res) => {
    const {
        metal,
        transaction_type,
        payment_method,
        deferred_days,
        involves_interest,
        is_speculation_only
    } = req.body;

    const issues_shariah = [];
    const recommendations = [];

    // قاعدة الربا في المعادن الثمينة
    if ((metal === 'gold' || metal === 'silver') && transaction_type === 'exchange_same') {
        issues_shariah.push({
            rule: 'ربا الفضل',
            arabic: 'ذهب بذهب إلا مثلاً بمثل يداً بيد — فمن زاد أو استزاد فقد أربى',
            impact: 'الزيادة في التبادل ربا محرم'
        });
        recommendations.push('تبادل الذهب بالذهب: يد بيد + مثل بمثل — أي زيادة ربا');
    }

    // الربا النسيئة
    if (
        (metal === 'gold' || metal === 'silver') &&
        transaction_type === 'exchange_same' &&
        deferred_days > 0
    ) {
        issues_shariah.push({
            rule: 'ربا النسيئة',
            arabic: 'ذهب بذهب مع تأجيل = ربا نسيئة',
            impact: 'محرم حتى ولو بنفس الكمية'
        });
    }

    // المضاربة الخالصة
    if (is_speculation_only) {
        issues_shariah.push({
            rule: 'الغرر والمقامرة',
            arabic: 'نهى النبي ﷺ عن بيع الغرر',
            impact: 'الشراء والبيع للمضاربة الخالصة دون قبض المعدن مشكوك فيه'
        });
        recommendations.push(
            'العقود الآجلة للتحوط بقدر الحاجة مقبولة — للمضاربة الخالصة راجع العلماء'
        );
    }

    // الفائدة
    if (involves_interest) {
        issues_shariah.push({
            rule: 'الربا المحرم',
            arabic: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا — البقرة 275',
            impact: 'أي فائدة على القرض أو التأخير محرمة قطعاً'
        });
        recommendations.push('البديل: عقد المرابحة أو المشاركة المتناقصة عبر بنك إسلامي');
    }

    const is_halal = issues_shariah.length === 0;

    res.json({
        success: true,
        message: is_halal
            ? 'الصفقة لا تشريعات شرعية ظاهرة — تحقق مع عالم'
            : 'يوجد مخاوف شرعية — راجع العالم قبل المتابعة',
        data: {
            is_halal_initially: is_halal,
            shariah_issues: issues_shariah,
            recommendations,
            general_rules: [
                'لا ربا — لا غرر — لا غش — لا احتكار',
                'البيع عن تراضٍ — قبول وإيجاب واضح',
                'دقة الوزن والكيل — وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ',
                'الذهب بالذهب: يد بيد مثل بمثل',
                'بيع الذهب بالريال: جائز بتأجيل الريال'
            ],
            fatawa_reference: (legislationData.WTO ? [] : []).concat(
                (exchangeData.islamic_finance || {}).fatawa_references || []
            ),
            disclaimer: 'هذا فحص مبدئي — الفتوى الملزمة من العالم المختص فقط'
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/compliance/aml-rules
 * قواعد مكافحة غسل الأموال
 */
router.get('/aml-rules', (req, res) => {
    const aml = (legislationData.compliance_rules || {}).anti_money_laundering || {};
    res.json({
        success: true,
        message: 'قواعد مكافحة غسل الأموال في تجارة المعادن',
        data: {
            ...aml,
            saudi_regulations: 'نظام مكافحة غسل الأموال السعودي 1439هـ — رافع بنك 120000 + FATF',
            red_flags: [
                'دفع نقدي غير معتاد لكميات كبيرة',
                'طرف مجهول الهوية أو لا يريد توثيقاً',
                'سعر أقل بكثير من السوق بدون مبرر',
                'تغيير المستلم النهائي في آخر لحظة',
                'ضغط على سرعة التنفيذ والتجاهل عن التوثيق'
            ],
            required_KYC: [
                'هوية وطنية أو جواز سفر',
                'رخصة تجارية نافذة',
                'عنوان مقر العمل',
                'تاريخ الصفقات السابقة'
            ]
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/compliance/export-controls
 * ضوابط التصدير
 */
router.get('/export-controls', (req, res) => {
    const ec = (legislationData.compliance_rules || {}).export_controls || {};
    res.json({
        success: true,
        message: 'ضوابط التصدير للمعادن',
        data: {
            ...ec,
            dual_use_metals: [
                {
                    metal: 'nickel',
                    use: 'صواريخ وفضاء',
                    control: 'EAR - Export Administration Regulations'
                },
                { metal: 'titanium', use: 'طيران عسكري', control: 'ITAR' },
                { metal: 'beryllium', use: 'نووي وعسكري', control: 'أعلى درجات التحكم' },
                { metal: 'cobalt', use: 'بطاريات + عسكري', control: 'فحص للدول المصدرة من الكونغو' }
            ],
            sanctioned_countries: [
                'KP — كوريا الشمالية',
                'IR — إيران',
                'SY — سوريا',
                'BY — بيلاروسيا',
                'MM — ميانمار'
            ],
            verification_tools: [
                'OFAC SDN List',
                'EU Consolidated List',
                'UN Security Council Sanctions'
            ]
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/compliance/customs/:country
 * متطلبات جمارك دولة محددة
 */
router.get('/customs/:country', (req, res) => {
    const country = req.params.country.toUpperCase();
    const regional = legislationData.regional_regulations || {};

    const countryMap = {
        SA: 'GCC',
        AE: 'GCC',
        KW: 'GCC',
        BH: 'GCC',
        QA: 'GCC',
        OM: 'GCC',
        DE: 'EU',
        FR: 'EU',
        IT: 'EU',
        NL: 'EU',
        BE: 'EU',
        ES: 'EU',
        PL: 'EU',
        UK: 'EU',
        CN: 'China',
        IN: 'India',
        US: 'USA',
        TR: 'Turkey'
    };

    const regionKey = countryMap[country] || country;
    const regionData = regional[regionKey];

    if (!regionData) {
        return res.status(404).json({
            success: false,
            message: `بيانات جمارك غير موجودة لـ: ${country}`,
            available: Object.keys(regional)
        });
    }

    res.json({
        success: true,
        data: {
            country,
            region: regionKey,
            nameAr: regionData.nameAr,
            regulations: regionData.regulations,
            note: regionKey === country ? `بيانات من منطقة ${regionKey}` : undefined
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/compliance/local-customs/:code
 * الأعراف والتقاليد التجارية المحلية
 */
router.get('/local-customs/:code', (req, res) => {
    const code = req.params.code;
    const customs = legislationData.local_customs || {};
    const countryNameMap = {
        SA: 'Saudi_Arabia',
        AE: 'UAE',
        CN: 'China',
        IN: 'India',
        TR: 'Turkey',
        DE: 'Germany'
    };
    const key = countryNameMap[code.toUpperCase()] || code;
    const data = customs[key];

    if (!data) {
        return res.status(404).json({
            success: false,
            message: `أعراف غير موجودة لـ: ${code}`,
            available: Object.keys(customs)
        });
    }

    res.json({
        success: true,
        data: { country: key, customs: data },
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/compliance/document-checklist
 * قائمة الوثائق المطلوبة لصفقة
 */
router.post('/document-checklist', (req, res) => {
    const {
        origin,
        destination,
        metal,
        incoterm = 'FOB',
        is_scrap = false,
        value_usd = 0
    } = req.body;

    const docs = [];

    // وثائق أساسية دائماً
    docs.push({
        doc: 'فاتورة تجارية Commercial Invoice',
        required: true,
        notes: 'تحتوي على: السعر، الكمية، الوصف، الإنكوترم'
    });
    docs.push({ doc: 'قائمة التعبئة Packing List', required: true });
    docs.push({
        doc: 'بوليصة الشحن Bill of Lading',
        required: true,
        notes: 'Negotiable B/L إذا بنك'
    });
    docs.push({
        doc: 'شهادة المنشأ Certificate of Origin',
        required: true,
        notes: 'معتمدة من غرفة التجارة'
    });

    // جودة وسلامة
    if (is_scrap || metal) {
        docs.push({
            doc: 'شهادة تحليل Certificate of Analysis',
            required: true,
            notes: 'من SGS أو Bureau Veritas'
        });
        docs.push({ doc: 'شهادة وزن Weight Certificate', required: (value_usd || 0) > 10000 });
    }

    // تأمين
    if (['CIF', 'CIP'].includes(incoterm)) {
        docs.push({
            doc: 'وثيقة تأمين بحري Marine Insurance Policy',
            required: true,
            notes: 'Clause A — أو وثيقة تكافل'
        });
    } else {
        docs.push({
            doc: 'وثيقة تأمين بحري Marine Insurance Policy',
            required: false,
            notes: 'مستحسن حتى مع FOB'
        });
    }

    // جمارك وضريبة
    if (destination && ['SA', 'GCC'].includes(destination.toUpperCase())) {
        docs.push({ doc: 'نموذج ZATCA الجمركي', required: true });
        docs.push({ doc: 'تصريح استيراد (إن لزم)', required: false, notes: 'للمعادن المقيدة' });
    }

    // بازل للخردة
    if (is_scrap && metal === 'lead') {
        docs.push({
            doc: 'تصريح بازل PIC — Prior Informed Consent',
            required: true,
            notes: 'ضروري للرصاص والمواد الخطرة'
        });
        docs.push({ doc: 'شهادة بيئية من بلد الاستيراد', required: true });
    }

    // Dodd-Frank
    const df = ['gold', 'tin', 'tantalum', 'tungsten'];
    if (df.includes(metal) && destination === 'US') {
        docs.push({ doc: 'إفصاح معادن مناطق النزاع Dodd-Frank Section 1502', required: true });
    }

    // اعتماد مستندي
    if (value_usd > 50000) {
        docs.push({
            doc: 'اعتماد مستندي LC أو خطاب ضمان',
            required: false,
            notes: 'موصى به لصفقات فوق 50,000 USD'
        });
    }

    const required_count = docs.filter(d => d.required).length;

    res.json({
        success: true,
        message: 'قائمة الوثائق المطلوبة للصفقة',
        data: {
            transaction: { origin, destination, metal, incoterm, is_scrap, value_usd },
            documents: docs,
            required_count,
            optional_count: docs.length - required_count,
            tip: 'احتفظ بنسخة إلكترونية لكل وثيقة + نسخة ورقية موقعة ومختومة'
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/compliance/health
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: Object.keys(legislationData).length > 0 ? 'healthy' : 'degraded',
        data: {
            legislation_loaded: Object.keys(legislationData).length > 0,
            regions_covered: Object.keys(legislationData.regional_regulations || {}).length,
            wrong_practices: Object.keys(
                (legislationData.compliance_rules || {}).wrong_practices_fixes || {}
            ).filter(k => k !== '_info').length,
            endpoints: 14,
            basePath: '/api/compliance'
        },
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
