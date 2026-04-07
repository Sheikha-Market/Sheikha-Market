'use strict';
/**
 * lib/sheikha-logistics-engine.js
 * المرحلة ٣٧ب — محرك اللوجستيات والاقتصاد العالمي
 *
 * بسم الله الرحمن الرحيم
 * ﴿وَزِنُوا بِالْقِسْطَاسِ الْمُسْتَقِيمِ﴾ — الإسراء ٣٥
 * ﴿وَلَا تَبْخَسُوا النَّاسَ أَشْيَاءَهُمْ﴾ — هود ٨٥
 * ﴿يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ﴾ — النساء ٢٩
 *
 * يشمل:
 *  — أسعار الشحن الدولي بكل أنواع اليونكوتيرمز
 *  — رسوم الموانئ والجمارك لكل دولة
 *  — الميزانيات الحكومية والعجز والفائض
 *  — موارد الاقتصاد لكل دولة والسعر العادل
 *  — سعر شحن شيخة العادل الشامل
 *
 * المالك: سلمان أحمد بن سلمان الراجح | sheikha.top
 */

const BASE_DATE = '2026-04-07';

// ══════════════════════════════════════════════════════════════════════════════
// ١. اليونكوتيرمز ٢٠٢٠ — Incoterms 2020
// ══════════════════════════════════════════════════════════════════════════════
const INCOTERMS_2020 = [
    {
        code: 'EXW', name_en: 'Ex Works', name_ar: 'تسليم في المصنع',
        category: 'أي وسيلة نقل',
        seller_obligation: 'إتاحة البضاعة في موقعه فقط',
        buyer_obligation: 'تحمل كل مصاريف النقل والتأمين والجمارك من المصنع',
        risk_transfer: 'عند استلام البضاعة في مقدمات البائع',
        best_for: 'المشتري يتحكم في سلسلة التوريد بالكامل',
        sheikha_markup_percent: 0,
        typical_hidden_costs: ['استئجار شاحنة محلية', 'ترخيص تصدير', 'رسوم شهادة المنشأ'],
    },
    {
        code: 'FCA', name_en: 'Free Carrier', name_ar: 'تسليم للناقل',
        category: 'أي وسيلة نقل',
        seller_obligation: 'تسليم للناقل في مكان محدد + إجراءات التصدير',
        buyer_obligation: 'تكاليف النقل الدولي + التأمين + جمارك الاستيراد',
        risk_transfer: 'عند تسليم البضاعة للناقل في المكان المتفق عليه',
        best_for: 'الشحن الجوي والبري والبحري',
        sheikha_markup_percent: 0,
        typical_hidden_costs: ['رسوم التفتيش', 'غلاف التصدير'],
    },
    {
        code: 'CPT', name_en: 'Carriage Paid To', name_ar: 'الشحن مدفوع إلى',
        category: 'أي وسيلة نقل',
        seller_obligation: 'دفع أجور الشحن حتى الوجهة',
        buyer_obligation: 'التأمين + جمارك الاستيراد + مصاريف الاستلام',
        risk_transfer: 'عند تسليم البضاعة للناقل الأول',
        sheikha_markup_percent: 2,
        typical_hidden_costs: ['رسوم الوجهة', 'تكاليف الانتظار في الميناء'],
    },
    {
        code: 'CIP', name_en: 'Carriage and Insurance Paid To', name_ar: 'شحن وتأمين مدفوعان إلى',
        category: 'أي وسيلة نقل',
        seller_obligation: 'دفع الشحن والتأمين حتى الوجهة',
        buyer_obligation: 'جمارك الاستيراد + مصاريف الاستلام',
        risk_transfer: 'عند تسليم البضاعة للناقل الأول',
        sheikha_markup_percent: 3,
        typical_hidden_costs: ['رسوم التخزين في الميناء', 'تحرير الوثائق'],
    },
    {
        code: 'DAP', name_en: 'Delivered at Place', name_ar: 'تسليم في المكان المحدد',
        category: 'أي وسيلة نقل',
        seller_obligation: 'توصيل حتى مكان المشتري جاهزاً للتفريغ (دون جمارك)',
        buyer_obligation: 'جمارك الاستيراد + التفريغ',
        risk_transfer: 'عند وصول للمكان المحدد جاهزاً للتفريغ',
        sheikha_markup_percent: 5,
        typical_hidden_costs: ['رسوم الجمارك المحلية', 'رسوم إدخال البضاعة'],
    },
    {
        code: 'DPU', name_en: 'Delivered at Place Unloaded', name_ar: 'تسليم في المكان مفرغاً',
        category: 'أي وسيلة نقل',
        seller_obligation: 'تسليم وتفريغ في الوجهة المحددة (دون جمارك)',
        buyer_obligation: 'جمارك الاستيراد فقط',
        risk_transfer: 'بعد التفريغ في المكان المحدد',
        sheikha_markup_percent: 6,
        typical_hidden_costs: ['رسوم الجمارك', 'ترخيص الاستيراد'],
    },
    {
        code: 'DDP', name_en: 'Delivered Duty Paid', name_ar: 'تسليم مع دفع الرسوم الجمركية',
        category: 'أي وسيلة نقل',
        seller_obligation: 'كل شيء — شحن + تأمين + جمارك + توصيل للمشتري',
        buyer_obligation: 'التفريغ فقط',
        risk_transfer: 'الحد الأقصى من مسؤولية البائع',
        best_for: 'المشتري يريد ثمناً واحداً شاملاً',
        sheikha_markup_percent: 8,
        typical_hidden_costs: ['مخاطر تغير الرسوم الجمركية', 'ضريبة القيمة المضافة المحلية'],
    },
    {
        code: 'FAS', name_en: 'Free Alongside Ship', name_ar: 'تسليم بجانب السفينة',
        category: 'بحري فقط',
        seller_obligation: 'وضع البضاعة بجانب السفينة في ميناء الشحن + إجراءات التصدير',
        buyer_obligation: 'تحميل السفينة + الشحن + التأمين + الجمارك',
        risk_transfer: 'عند وضع البضاعة بجانب السفينة',
        sheikha_markup_percent: 1,
        typical_hidden_costs: ['رسوم الرصيف', 'تكلفة تنزيل البضاعة من الشاحنة للرصيف'],
    },
    {
        code: 'FOB', name_en: 'Free On Board', name_ar: 'تسليم على ظهر السفينة',
        category: 'بحري فقط',
        seller_obligation: 'تحميل البضاعة على السفينة + إجراءات التصدير',
        buyer_obligation: 'أجرة الشحن البحري + التأمين + جمارك الاستيراد',
        risk_transfer: 'عند تجاوز البضاعة حائط السفينة',
        best_for: 'معظم صفقات تجارة المعادن والسكراب',
        sheikha_markup_percent: 2,
        typical_hidden_costs: ['رسوم ميناء الشحن', 'رسوم تعديل وثائق الشحن'],
    },
    {
        code: 'CFR', name_en: 'Cost and Freight', name_ar: 'التكلفة والشحن',
        category: 'بحري فقط',
        seller_obligation: 'دفع الشحن البحري حتى ميناء الوجهة',
        buyer_obligation: 'التأمين البحري + جمارك الاستيراد + مصاريف الميناء',
        risk_transfer: 'عند تحميل البضاعة على السفينة في ميناء الشحن',
        sheikha_markup_percent: 3,
        typical_hidden_costs: ['رسوم الاستيراد في الوجهة', 'تأمين البضاعة'],
    },
    {
        code: 'CIF', name_en: 'Cost, Insurance and Freight', name_ar: 'التكلفة والتأمين والشحن',
        category: 'بحري فقط',
        seller_obligation: 'دفع الشحن البحري + التأمين الأدنى حتى ميناء الوجهة',
        buyer_obligation: 'جمارك الاستيراد + مصاريف الميناء',
        risk_transfer: 'عند تحميل البضاعة في ميناء الشحن',
        best_for: 'الأكثر شيوعاً في تجارة المعادن الدولية',
        sheikha_markup_percent: 4,
        typical_hidden_costs: ['رسوم ميناء الوجهة', 'التخزين والإيجار'],
    },
];

// ══════════════════════════════════════════════════════════════════════════════
// ٢. أسعار الشحن الدولي بالحاوية (TEU) — International Freight Rates (USD)
// ══════════════════════════════════════════════════════════════════════════════
const SHIPPING_ROUTES = [
    // ميناء جدة كنقطة مرجعية
    { from: 'SAJED', from_ar: 'جدة', to: 'CNSHA', to_ar: 'شنغهاي',     usd_per_teu: 1850, days: 21, type: 'بحري' },
    { from: 'SAJED', from_ar: 'جدة', to: 'NLRTM', to_ar: 'روتردام',    usd_per_teu: 1400, days: 18, type: 'بحري' },
    { from: 'SAJED', from_ar: 'جدة', to: 'USLAX', to_ar: 'لوس أنجلوس', usd_per_teu: 2200, days: 30, type: 'بحري' },
    { from: 'SAJED', from_ar: 'جدة', to: 'AEDXB', to_ar: 'دبي',        usd_per_teu: 380,  days: 4,  type: 'بحري' },
    { from: 'SAJED', from_ar: 'جدة', to: 'EGPSD', to_ar: 'بورسعيد',    usd_per_teu: 480,  days: 5,  type: 'بحري' },
    { from: 'SAJED', from_ar: 'جدة', to: 'INBOM', to_ar: 'مومباي',     usd_per_teu: 680,  days: 10, type: 'بحري' },
    { from: 'SAJED', from_ar: 'جدة', to: 'PKKAR', to_ar: 'كراتشي',     usd_per_teu: 620,  days: 9,  type: 'بحري' },
    { from: 'SAJED', from_ar: 'جدة', to: 'JOAQJ', to_ar: 'العقبة',     usd_per_teu: 340,  days: 3,  type: 'بحري' },
    { from: 'SAJED', from_ar: 'جدة', to: 'TRIST', to_ar: 'إسطنبول',    usd_per_teu: 890,  days: 10, type: 'بحري' },
    { from: 'SAJED', from_ar: 'جدة', to: 'DKAAR', to_ar: 'داكار',      usd_per_teu: 920,  days: 12, type: 'بحري' },
    { from: 'SAJED', from_ar: 'جدة', to: 'NGLAG', to_ar: 'لاغوس',      usd_per_teu: 1050, days: 14, type: 'بحري' },
    { from: 'SAJED', from_ar: 'جدة', to: 'MYMYK', to_ar: 'بورت كلانج', usd_per_teu: 980,  days: 14, type: 'بحري' },
    // ميناء الدمام
    { from: 'SATAB', from_ar: 'الدمام', to: 'CNSHA', to_ar: 'شنغهاي',   usd_per_teu: 1900, days: 22, type: 'بحري' },
    { from: 'SATAB', from_ar: 'الدمام', to: 'AEDXB', to_ar: 'دبي',      usd_per_teu: 290,  days: 2,  type: 'بحري' },
    { from: 'SATAB', from_ar: 'الدمام', to: 'INBOM', to_ar: 'مومباي',    usd_per_teu: 650,  days: 8,  type: 'بحري' },
    // خطوط جوية
    { from: 'OEJN', from_ar: 'جدة  (جوي)', to: 'OMDB', to_ar: 'دبي',     usd_per_kg: 2.1,  hours: 2,  type: 'جوي' },
    { from: 'OEJN', from_ar: 'جدة  (جوي)', to: 'OTBD', to_ar: 'الدوحة',  usd_per_kg: 2.3,  hours: 2,  type: 'جوي' },
    { from: 'OEJN', from_ar: 'جدة  (جوي)', to: 'EGLL', to_ar: 'لندن',    usd_per_kg: 4.8,  hours: 7,  type: 'جوي' },
    { from: 'OEJN', from_ar: 'جدة  (جوي)', to: 'KJFK', to_ar: 'نيويورك', usd_per_kg: 5.9,  hours: 14, type: 'جوي' },
    { from: 'OEJN', from_ar: 'جدة  (جوي)', to: 'ZPKM', to_ar: 'كوالالمبور', usd_per_kg: 3.8, hours: 9, type: 'جوي' },
    // بري
    { from: 'الرياض', from_ar: 'الرياض (بري)', to: 'الكويت', to_ar: 'الكويت',   usd_per_ton: 85,  hours: 6,  type: 'بري' },
    { from: 'الرياض', from_ar: 'الرياض (بري)', to: 'البحرين', to_ar: 'البحرين', usd_per_ton: 70,  hours: 4,  type: 'بري' },
    { from: 'الرياض', from_ar: 'الرياض (بري)', to: 'قطر',    to_ar: 'الدوحة',  usd_per_ton: 80,  hours: 5,  type: 'بري' },
    { from: 'الرياض', from_ar: 'الرياض (بري)', to: 'الأردن',  to_ar: 'عمان',    usd_per_ton: 180, hours: 16, type: 'بري' },
];

// ══════════════════════════════════════════════════════════════════════════════
// ٣. رسوم الموانئ الدولية — Port Fees by Country (USD / TEU)
// ══════════════════════════════════════════════════════════════════════════════
const PORT_FEES = [
    // الخليج العربي
    {
        country: 'Saudi Arabia', country_ar: 'المملكة العربية السعودية',
        port: 'Jeddah Islamic Port', code: 'SAJED',
        thc_usd: 165, documentation_usd: 55, customs_processing_usd: 90,
        storage_per_day_usd: 22, overtime_per_hour_usd: 38,
        total_typical_usd: 310, currency: 'SAR', exchange_rate: 3.75,
    },
    {
        country: 'UAE', country_ar: 'الإمارات العربية المتحدة',
        port: 'Jebel Ali', code: 'AEDXB',
        thc_usd: 185, documentation_usd: 60, customs_processing_usd: 70,
        storage_per_day_usd: 28, overtime_per_hour_usd: 42,
        total_typical_usd: 315, currency: 'AED', exchange_rate: 3.67,
    },
    {
        country: 'Kuwait', country_ar: 'الكويت',
        port: 'Shuwaikh Port', code: 'KWSWK',
        thc_usd: 155, documentation_usd: 50, customs_processing_usd: 80,
        storage_per_day_usd: 20, overtime_per_hour_usd: 35,
        total_typical_usd: 285, currency: 'KWD', exchange_rate: 0.307,
    },
    {
        country: 'Qatar', country_ar: 'قطر',
        port: 'Hamad Port', code: 'QTDOH',
        thc_usd: 175, documentation_usd: 55, customs_processing_usd: 75,
        storage_per_day_usd: 25, overtime_per_hour_usd: 40,
        total_typical_usd: 305, currency: 'QAR', exchange_rate: 3.64,
    },
    {
        country: 'Bahrain', country_ar: 'البحرين',
        port: 'Khalifa Bin Salman Port', code: 'BHKBS',
        thc_usd: 145, documentation_usd: 45, customs_processing_usd: 65,
        storage_per_day_usd: 18, overtime_per_hour_usd: 30,
        total_typical_usd: 255, currency: 'BHD', exchange_rate: 0.376,
    },
    {
        country: 'Oman', country_ar: 'سلطنة عُمان',
        port: 'Port of Sohar / Salalah', code: 'OMSLL',
        thc_usd: 160, documentation_usd: 50, customs_processing_usd: 70,
        storage_per_day_usd: 20, overtime_per_hour_usd: 32,
        total_typical_usd: 280, currency: 'OMR', exchange_rate: 0.385,
    },
    // المشرق العربي
    {
        country: 'Egypt', country_ar: 'مصر',
        port: 'Port Said / Alexandria', code: 'EGPSD',
        thc_usd: 120, documentation_usd: 35, customs_processing_usd: 110,
        storage_per_day_usd: 12, overtime_per_hour_usd: 18,
        total_typical_usd: 265, currency: 'EGP', exchange_rate: 48.5,
    },
    {
        country: 'Jordan', country_ar: 'الأردن',
        port: 'Port of Aqaba', code: 'JOAQJ',
        thc_usd: 130, documentation_usd: 40, customs_processing_usd: 95,
        storage_per_day_usd: 14, overtime_per_hour_usd: 22,
        total_typical_usd: 265, currency: 'JOD', exchange_rate: 0.709,
    },
    {
        country: 'Turkey', country_ar: 'تركيا',
        port: 'Istanbul / Mersin', code: 'TRIST',
        thc_usd: 175, documentation_usd: 45, customs_processing_usd: 85,
        storage_per_day_usd: 18, overtime_per_hour_usd: 28,
        total_typical_usd: 305, currency: 'TRY', exchange_rate: 32.5,
    },
    // آسيا
    {
        country: 'China', country_ar: 'الصين',
        port: 'Shanghai / Shenzhen', code: 'CNSHA',
        thc_usd: 95, documentation_usd: 25, customs_processing_usd: 60,
        storage_per_day_usd: 8, overtime_per_hour_usd: 15,
        total_typical_usd: 180, currency: 'CNY', exchange_rate: 7.26,
    },
    {
        country: 'India', country_ar: 'الهند',
        port: 'Mumbai / JNPT', code: 'INBOM',
        thc_usd: 110, documentation_usd: 30, customs_processing_usd: 90,
        storage_per_day_usd: 10, overtime_per_hour_usd: 18,
        total_typical_usd: 230, currency: 'INR', exchange_rate: 83.5,
    },
    {
        country: 'Pakistan', country_ar: 'باكستان',
        port: 'Karachi', code: 'PKKAR',
        thc_usd: 100, documentation_usd: 28, customs_processing_usd: 95,
        storage_per_day_usd: 9, overtime_per_hour_usd: 14,
        total_typical_usd: 223, currency: 'PKR', exchange_rate: 278,
    },
    {
        country: 'Malaysia', country_ar: 'ماليزيا',
        port: 'Port Klang', code: 'MYMYK',
        thc_usd: 120, documentation_usd: 30, customs_processing_usd: 55,
        storage_per_day_usd: 10, overtime_per_hour_usd: 20,
        total_typical_usd: 205, currency: 'MYR', exchange_rate: 4.72,
    },
    // أوروبا
    {
        country: 'Netherlands', country_ar: 'هولندا (روتردام)',
        port: 'Rotterdam', code: 'NLRTM',
        thc_usd: 210, documentation_usd: 65, customs_processing_usd: 50,
        storage_per_day_usd: 35, overtime_per_hour_usd: 65,
        total_typical_usd: 325, currency: 'EUR', exchange_rate: 0.92,
    },
    {
        country: 'Germany', country_ar: 'ألمانيا (هامبورغ)',
        port: 'Hamburg', code: 'DEHAM',
        thc_usd: 220, documentation_usd: 70, customs_processing_usd: 55,
        storage_per_day_usd: 38, overtime_per_hour_usd: 70,
        total_typical_usd: 345, currency: 'EUR', exchange_rate: 0.92,
    },
    // أمريكا
    {
        country: 'USA', country_ar: 'الولايات المتحدة',
        port: 'Los Angeles / New York', code: 'USLAX',
        thc_usd: 195, documentation_usd: 60, customs_processing_usd: 75,
        storage_per_day_usd: 30, overtime_per_hour_usd: 55,
        total_typical_usd: 330, currency: 'USD', exchange_rate: 1,
    },
    // أفريقيا
    {
        country: 'Nigeria', country_ar: 'نيجيريا',
        port: 'Lagos / Apapa', code: 'NGLAG',
        thc_usd: 165, documentation_usd: 55, customs_processing_usd: 140,
        storage_per_day_usd: 15, overtime_per_hour_usd: 22,
        total_typical_usd: 360, currency: 'NGN', exchange_rate: 1580,
    },
    {
        country: 'Senegal', country_ar: 'السنغال (داكار)',
        port: 'Dakar', code: 'DKAAR',
        thc_usd: 150, documentation_usd: 45, customs_processing_usd: 100,
        storage_per_day_usd: 13, overtime_per_hour_usd: 18,
        total_typical_usd: 295, currency: 'XOF', exchange_rate: 605,
    },
];

// ══════════════════════════════════════════════════════════════════════════════
// ٤. الرسوم الجمركية لكل دولة — Customs & Tax Rates by Country
// ══════════════════════════════════════════════════════════════════════════════
const CUSTOMS_BY_COUNTRY = [
    {
        country: 'Saudi Arabia', country_ar: 'المملكة العربية السعودية',
        vat_percent: 15, customs_general_percent: 5, customs_metals_percent: 5,
        customs_scrap_percent: 0, excise_tax_percent: 0, corporate_tax_percent: 20,
        zakat_percent: 2.5, free_trade_agreements: ['GCC', 'Arab League', 'GAFTA'],
        customs_authority: 'ZATCA', customs_website: 'customs.gov.sa',
        notes: 'معفى من الجمارك: دول الخليج (GCC) + السكراب المعدني عادةً صفر',
    },
    {
        country: 'UAE', country_ar: 'الإمارات العربية المتحدة',
        vat_percent: 5, customs_general_percent: 5, customs_metals_percent: 5,
        customs_scrap_percent: 0, excise_tax_percent: 0, corporate_tax_percent: 9,
        free_trade_agreements: ['GCC', 'Singapore', 'CEPA India', 'CEPA Israel'],
        notes: 'المناطق الحرة معفاة بالكامل — دبي الأكثر استيراداً للمعادن',
    },
    {
        country: 'Kuwait', country_ar: 'الكويت',
        vat_percent: 0, customs_general_percent: 5, customs_metals_percent: 5,
        customs_scrap_percent: 0, corporate_tax_percent: 15,
        free_trade_agreements: ['GCC'],
        notes: 'لا ضريبة قيمة مضافة في الكويت — أدنى معدلات ضريبية خليجياً',
    },
    {
        country: 'Qatar', country_ar: 'قطر',
        vat_percent: 0, customs_general_percent: 5, customs_metals_percent: 5,
        customs_scrap_percent: 0, corporate_tax_percent: 10,
        free_trade_agreements: ['GCC'],
        notes: 'لا ضريبة قيمة مضافة — فائض ميزانية بسبب الغاز',
    },
    {
        country: 'Bahrain', country_ar: 'البحرين',
        vat_percent: 10, customs_general_percent: 5, customs_metals_percent: 5,
        customs_scrap_percent: 0, corporate_tax_percent: 0,
        free_trade_agreements: ['GCC', 'USA FTA'],
        notes: 'لا ضريبة دخل شركات — مركز مالي إسلامي',
    },
    {
        country: 'Oman', country_ar: 'عُمان',
        vat_percent: 5, customs_general_percent: 5, customs_metals_percent: 5,
        customs_scrap_percent: 0, corporate_tax_percent: 15,
        free_trade_agreements: ['GCC', 'USA FTA'],
        notes: 'ميناء صلالة منطقة حرة استراتيجية',
    },
    {
        country: 'Egypt', country_ar: 'مصر',
        vat_percent: 14, customs_general_percent: 12, customs_metals_percent: 10,
        customs_scrap_percent: 2, corporate_tax_percent: 22.5,
        free_trade_agreements: ['Arab League', 'GAFTA', 'COMESA'],
        notes: 'رسوم جمارك أعلى — رسوم إضافية على المعادن المصنوعة',
    },
    {
        country: 'Jordan', country_ar: 'الأردن',
        vat_percent: 16, customs_general_percent: 10, customs_metals_percent: 8,
        customs_scrap_percent: 0, corporate_tax_percent: 20,
        free_trade_agreements: ['Arab League', 'GAFTA', 'USA', 'EU'],
        notes: 'اتفاقية حرة مع الولايات المتحدة وأوروبا — موقع لوجستي متميز',
    },
    {
        country: 'Turkey', country_ar: 'تركيا',
        vat_percent: 20, customs_general_percent: 0, customs_metals_percent: 3,
        customs_scrap_percent: 0, corporate_tax_percent: 25,
        free_trade_agreements: ['EU Customs Union', 'EFTA'],
        notes: 'اتحاد جمركي مع الاتحاد الأوروبي — أكبر مستورد سكراب في العالم',
    },
    {
        country: 'China', country_ar: 'الصين',
        vat_percent: 13, customs_general_percent: 6, customs_metals_percent: 3,
        customs_scrap_percent: 0, corporate_tax_percent: 25,
        free_trade_agreements: ['RCEP', 'ASEAN', 'Pakistan', 'Australia'],
        notes: 'حظر استيراد سكراب خارجي من 2020 — رسوم صادرات على المعادن النادرة',
    },
    {
        country: 'India', country_ar: 'الهند',
        vat_percent: 18, customs_general_percent: 10, customs_metals_percent: 7.5,
        customs_scrap_percent: 2.5, corporate_tax_percent: 22,
        free_trade_agreements: ['ASEAN', 'UAE CEPA', 'Australia ECTA'],
        notes: 'رسوم جمارك مرتفعة نسبياً — سياسة حماية الصناعة المحلية',
    },
    {
        country: 'USA', country_ar: 'الولايات المتحدة',
        vat_percent: 0, customs_general_percent: 3.5, customs_metals_percent: 0,
        customs_scrap_percent: 0, corporate_tax_percent: 21,
        special: 'رسوم 25% على الصلب والألومنيوم (Section 232)',
        free_trade_agreements: ['USMCA', 'Jordan', 'Bahrain', 'Australia', 'Chile'],
        notes: 'لا ضريبة قيمة مضافة فيدرالية — رسوم قطاعية على الصلب والألومنيوم',
    },
    {
        country: 'EU', country_ar: 'الاتحاد الأوروبي',
        vat_percent: 20, customs_general_percent: 4, customs_metals_percent: 6,
        customs_scrap_percent: 0, corporate_tax_percent: 25,
        free_trade_agreements: ['Turkey', 'Canada CETA', 'Japan EPA', 'UK TCA'],
        notes: 'CBAM — ضريبة كربون على الحدود تطبق من 2026',
    },
    {
        country: 'Pakistan', country_ar: 'باكستان',
        vat_percent: 17, customs_general_percent: 15, customs_metals_percent: 11,
        customs_scrap_percent: 0, corporate_tax_percent: 29,
        free_trade_agreements: ['China', 'Malaysia', 'SAFTA'],
        notes: 'ممر CPEC يربط باكستان بالصين — نمو قطاع السكراب',
    },
    {
        country: 'Indonesia', country_ar: 'إندونيسيا',
        vat_percent: 11, customs_general_percent: 7, customs_metals_percent: 5,
        customs_scrap_percent: 0, corporate_tax_percent: 22,
        free_trade_agreements: ['ASEAN', 'RCEP', 'Australia CEPA'],
        notes: 'حظر تصدير المعادن الخام (نيكل، بوكسيت) لتشجيع التصنيع المحلي',
    },
    {
        country: 'Nigeria', country_ar: 'نيجيريا',
        vat_percent: 7.5, customs_general_percent: 20, customs_metals_percent: 15,
        customs_scrap_percent: 5, corporate_tax_percent: 30,
        free_trade_agreements: ['ECOWAS', 'AfCFTA'],
        notes: 'بيئة جمركية معقدة — فرص واعدة في سكراب النفط',
    },
];

// ══════════════════════════════════════════════════════════════════════════════
// ٥. الميزانيات الحكومية — Government Budgets (2025/2026 Estimates)
// ══════════════════════════════════════════════════════════════════════════════
const COUNTRY_BUDGETS = [
    {
        country: 'Saudi Arabia', country_ar: 'المملكة العربية السعودية',
        year: 2026,
        revenue_usd_billion: 328,
        expenditure_usd_billion: 371,
        surplus_deficit_usd_billion: -43,
        status: 'عجز',
        debt_to_gdp_percent: 26,
        oil_revenue_percent: 62,
        gdp_usd_billion: 1108,
        gdp_growth_percent: 2.7,
        per_capita_usd: 28800,
        main_revenue_sources: ['نفط وغاز', 'ضريبة القيمة المضافة', 'الجمارك', 'رسوم حكومية'],
        main_expenditure: ['البنية التحتية', 'التعليم', 'الصحة', 'الدفاع', 'رواتب'],
        vision_2030_projects_usd_billion: 1100,
        currency: 'SAR', exchange_rate: 3.75,
        credit_rating: 'A / Positive',
    },
    {
        country: 'UAE', country_ar: 'الإمارات العربية المتحدة',
        year: 2026,
        revenue_usd_billion: 96,
        expenditure_usd_billion: 91,
        surplus_deficit_usd_billion: 5,
        status: 'فائض',
        debt_to_gdp_percent: 27,
        oil_revenue_percent: 35,
        gdp_usd_billion: 500,
        gdp_growth_percent: 4.1,
        per_capita_usd: 48000,
        main_revenue_sources: ['نفط', 'تجارة', 'سياحة', 'خدمات مالية'],
        currency: 'AED', exchange_rate: 3.67,
        credit_rating: 'AA / Stable',
    },
    {
        country: 'Kuwait', country_ar: 'الكويت',
        year: 2026,
        revenue_usd_billion: 65,
        expenditure_usd_billion: 71,
        surplus_deficit_usd_billion: -6,
        status: 'عجز طفيف',
        debt_to_gdp_percent: 3,
        oil_revenue_percent: 89,
        gdp_usd_billion: 159,
        gdp_growth_percent: 1.5,
        per_capita_usd: 36000,
        main_revenue_sources: ['نفط خام (٨٩٪)'],
        currency: 'KWD', exchange_rate: 0.307,
        notes: 'صندوق الأجيال القادمة يفوق ٧٠٠ مليار دولار',
        credit_rating: 'A+ / Stable',
    },
    {
        country: 'Qatar', country_ar: 'قطر',
        year: 2026,
        revenue_usd_billion: 74,
        expenditure_usd_billion: 63,
        surplus_deficit_usd_billion: 11,
        status: 'فائض',
        debt_to_gdp_percent: 50,
        oil_revenue_percent: 55,
        gdp_usd_billion: 201,
        gdp_growth_percent: 2.2,
        per_capita_usd: 68000,
        main_revenue_sources: ['غاز طبيعي مسال (LNG)', 'نفط', 'بتروكيماويات'],
        currency: 'QAR', exchange_rate: 3.64,
        notes: 'ثالث أكبر احتياطي غاز في العالم',
        credit_rating: 'AA- / Stable',
    },
    {
        country: 'Egypt', country_ar: 'مصر',
        year: 2026,
        revenue_usd_billion: 54,
        expenditure_usd_billion: 77,
        surplus_deficit_usd_billion: -23,
        status: 'عجز كبير',
        debt_to_gdp_percent: 89,
        gdp_usd_billion: 395,
        gdp_growth_percent: 4.2,
        per_capita_usd: 3500,
        main_revenue_sources: ['قناة السويس', 'السياحة', 'تحويلات المغتربين', 'غاز طبيعي'],
        currency: 'EGP', exchange_rate: 48.5,
        credit_rating: 'B / Stable',
    },
    {
        country: 'Turkey', country_ar: 'تركيا',
        year: 2026,
        revenue_usd_billion: 207,
        expenditure_usd_billion: 245,
        surplus_deficit_usd_billion: -38,
        status: 'عجز',
        debt_to_gdp_percent: 33,
        gdp_usd_billion: 1088,
        gdp_growth_percent: 3.1,
        per_capita_usd: 12500,
        main_revenue_sources: ['ضرائب', 'صادرات', 'سياحة', 'خدمات'],
        currency: 'TRY', exchange_rate: 32.5,
        notes: 'أكبر مستورد سكراب في العالم — تضخم مرتفع',
        credit_rating: 'B+ / Positive',
    },
    {
        country: 'China', country_ar: 'الصين',
        year: 2026,
        revenue_usd_billion: 2860,
        expenditure_usd_billion: 3200,
        surplus_deficit_usd_billion: -340,
        status: 'عجز',
        debt_to_gdp_percent: 51,
        gdp_usd_billion: 18600,
        gdp_growth_percent: 4.7,
        per_capita_usd: 13000,
        main_revenue_sources: ['ضرائب الشركات', 'ضرائب القيمة المضافة', 'صادرات'],
        currency: 'CNY', exchange_rate: 7.26,
        credit_rating: 'A+ / Stable',
    },
    {
        country: 'USA', country_ar: 'الولايات المتحدة',
        year: 2026,
        revenue_usd_billion: 5100,
        expenditure_usd_billion: 7200,
        surplus_deficit_usd_billion: -2100,
        status: 'عجز ضخم',
        debt_to_gdp_percent: 126,
        debt_total_usd_trillion: 35.5,
        gdp_usd_billion: 28000,
        gdp_growth_percent: 2.0,
        per_capita_usd: 82000,
        main_revenue_sources: ['ضريبة الدخل', 'ضريبة الرواتب', 'ضرائب شركات'],
        currency: 'USD', exchange_rate: 1,
        credit_rating: 'AA+ / Negative',
        notes: 'الديون تتجاوز ٣٥ تريليون دولار — تستمر في الارتفاع',
    },
    {
        country: 'EU', country_ar: 'الاتحاد الأوروبي',
        year: 2026,
        revenue_usd_billion: 210,
        expenditure_usd_billion: 230,
        surplus_deficit_usd_billion: -20,
        status: 'عجز بسيط',
        gdp_usd_billion: 18400,
        gdp_growth_percent: 1.2,
        currency: 'EUR', exchange_rate: 0.92,
        notes: 'متوسط دول الاتحاد — الميزانية الإجمالية ١٨٩ مليار يورو',
    },
    {
        country: 'Indonesia', country_ar: 'إندونيسيا',
        year: 2026,
        revenue_usd_billion: 216,
        expenditure_usd_billion: 237,
        surplus_deficit_usd_billion: -21,
        status: 'عجز',
        debt_to_gdp_percent: 38,
        gdp_usd_billion: 1412,
        gdp_growth_percent: 5.1,
        per_capita_usd: 4900,
        main_revenue_sources: ['ضرائب', 'معادن (نيكل، بوكسيت)', 'نخيل الزيت', 'سياحة'],
        currency: 'IDR', exchange_rate: 16200,
        notes: 'أكبر اقتصاد في جنوب شرق آسيا — قوة معادنية صاعدة',
    },
    {
        country: 'Pakistan', country_ar: 'باكستان',
        year: 2026,
        revenue_usd_billion: 48,
        expenditure_usd_billion: 72,
        surplus_deficit_usd_billion: -24,
        status: 'عجز خطير',
        debt_to_gdp_percent: 74,
        gdp_usd_billion: 372,
        gdp_growth_percent: 2.8,
        per_capita_usd: 1600,
        main_revenue_sources: ['ضرائب', 'تحويلات مغتربين', 'نسيج وملابس'],
        currency: 'PKR', exchange_rate: 278,
        notes: 'تحت ضغط ديون خارجية — دعم صندوق النقد الدولي',
    },
];

// ══════════════════════════════════════════════════════════════════════════════
// ٦. موارد الاقتصاد لكل دولة والسعر العادل — Economic Resources & Fair Pricing
// ══════════════════════════════════════════════════════════════════════════════
const COUNTRY_ECONOMICS = [
    {
        country: 'Saudi Arabia', country_ar: 'المملكة العربية السعودية',
        main_resources: ['نفط خام (٢٦٠ مليار برميل احتياطي)', 'غاز طبيعي', 'معادن (ذهب، نحاس، فوسفات، بوكسيت)', 'طاقة شمسية هائلة'],
        production_highlights: { oil_mb_per_day: 10.5, gas_bcf_per_day: 11, gold_tons_year: 35 },
        fair_price_advantage: 'تكلفة إنتاج النفط ≈ $3-5/برميل — أدنى تكلفة عالمياً',
        logistics_advantage: 'موانئ متطورة على البحر الأحمر والخليج — جسر برّي لآسيا وأفريقيا وأوروبا',
        sheikha_opportunity: 'تسعير المعادن المحلية بالدينار الإسلامي — استبدال الدولار بالريال المدعوم بالذهب',
    },
    {
        country: 'UAE', country_ar: 'الإمارات',
        main_resources: ['نفط', 'غاز', 'مركز تجاري ومالي', 'سياحة', 'خدمات لوجستية'],
        fair_price_advantage: 'ميناء جبل علي — ٧٠٪ من تجارة منطقة الشرق الأوسط',
        sheikha_opportunity: 'مركز إعادة تصدير — بوابة للأسواق الناشئة',
    },
    {
        country: 'China', country_ar: 'الصين',
        main_resources: ['أكبر منتج معادن نادرة (٦٠٪ عالمياً)', 'فولاذ', 'ألومنيوم', 'زنك', 'نحاس'],
        fair_price_advantage: 'أدنى تكاليف تصنيع صناعي',
        sheikha_opportunity: 'مصدر رئيسي للمعادن المصنوعة — يجب تنويع المصادر الإسلامية',
        warning: 'احتكار المعادن النادرة يخالف مبدأ العدل الإسلامي في التجارة',
    },
    {
        country: 'Turkey', country_ar: 'تركيا',
        main_resources: ['صناعة فولاذ', 'مصانع تصنيع', 'صهر السكراب'],
        fair_price_advantage: 'أكبر مستورد سكراب عالمياً — يعيد تصنيعه بسعر تنافسي',
        sheikha_opportunity: 'تعاون لمعالجة السكراب الإسلامي وإعادة تدويره',
    },
    {
        country: 'Indonesia', country_ar: 'إندونيسيا',
        main_resources: ['نيكل (أكبر احتياطي عالمي)', 'بوكسيت', 'قصدير', 'نخيل زيت', 'فحم'],
        fair_price_advantage: 'حظر تصدير خام النيكل يرفع أسعاره — تحول لمعالجة محلية',
        sheikha_opportunity: 'شراكة في معادن البطاريات اللازمة للطاقة الخضراء',
    },
    {
        country: 'India', country_ar: 'الهند',
        main_resources: ['حديد', 'ألومنيوم', 'بوكسيت', 'تيتانيوم', 'صناعة تقنية'],
        fair_price_advantage: 'قاعدة تصنيع واسعة — سوق استهلاكي ضخم',
        sheikha_opportunity: 'تجارة المعادن مع السوق الهندي الواعد',
    },
];

// ══════════════════════════════════════════════════════════════════════════════
// ٧. نموذج سعر شحن شيخة العادل — Sheikha Fair Freight Pricing Model
// ══════════════════════════════════════════════════════════════════════════════
const SHEIKHA_FREIGHT_MODEL = {
    name_ar: 'نموذج التسعير العادل لشحن شيخة',
    verse: '﴿وَزِنُوا بِالْقِسْطَاسِ الْمُسْتَقِيمِ﴾ — الإسراء ٣٥',
    principle: 'السعر العادل = التكاليف الحقيقية + هامش ربح حلال معلوم — لا رسوم مخفية',
    components: [
        { item: 'أجرة الشحن البحري (Ocean Freight)', typical_usd_teu: { min: 350, max: 2500 }, notes: 'يعتمد على المسار والموسم' },
        { item: 'رسوم الميناء — Origin THC', typical_usd_teu: { min: 90, max: 220 }, notes: 'ميناء الشحن' },
        { item: 'رسوم الميناء — Destination THC', typical_usd_teu: { min: 90, max: 350 }, notes: 'ميناء الوصول' },
        { item: 'رسوم وثائق الشحن (B/L Fee)', typical_usd: { min: 45, max: 95 }, notes: 'لكل شحنة' },
        { item: 'رسوم الوقود (BAF / GRI)', typical_usd_teu: { min: 75, max: 250 }, notes: 'متغيرة مع أسعار النفط' },
        { item: 'تأمين الشحن (Insurance)', typical_percent: 0.3, notes: '٠.٣٪ من قيمة البضاعة CIF' },
        { item: 'تخليص جمركي (Customs Clearance)', typical_usd: { min: 80, max: 200 }, notes: 'وكيل التخليص' },
        { item: 'الرسوم الجمركية (Duties)', calculation: 'قيمة البضاعة × نسبة الجمارك', notes: 'تختلف حسب الدولة والسلعة' },
        { item: 'ضريبة القيمة المضافة', calculation: 'السعر CIF + الجمارك × نسبة VAT', notes: 'تختلف حسب الدولة' },
        { item: 'نقل بري محلي', typical_usd_ton: { min: 15, max: 85 }, notes: 'من الميناء للمستودع' },
        { item: 'تخزين (Storage)', typical_usd_day: { min: 8, max: 40 }, notes: 'إذا تأخر الاستلام' },
        { item: 'هامش ربح شيخة (Halal Margin)', percent: 3.5, notes: 'معلوم ومتفق عليه — لا غرر' },
    ],
    hidden_costs_exposed: [
        'BAF — رسوم الوقود المتغيرة (غالباً لا تُذكر في العرض)',
        'رسوم الذروة (PSS) في مواسم الشحن العالية',
        'رسوم الاحتجاز (Detention & Demurrage) إذا تأخرت',
        'رسوم تسليم في الباب (Door Delivery) — نقل بري إضافي',
        'رسوم تأشيرة الشحن (VGM) — وزن الحاوية المعتمد',
        'رسوم CAF (Currency Adjustment Factor) عند تقلب العملة',
        'رسوم تعديل الوثائق (Amendments Fee)',
        'رسوم التأخير (Late Booking Fee)',
    ],
    sheikha_promise: [
        'نكشف كل رسوم مخفية قبل الاتفاق',
        'السعر النهائي = مجموع كل التكاليف + هامش ربح حلال ٣.٥٪',
        'لا إسقاط بالسعر ثم الزيادة — العقد ملزم',
        'نصلح ما يفسد ونعيد المظالم — برنامج الشكاوى الشرعية',
    ],
};

// نموذج حساب سعر الشحن — Freight Price Calculator
function calculateShippingPrice({
    cargo_value_usd = 10000,
    weight_kg = 1000,
    volume_cbm = 3,
    origin_port = 'SAJED',
    destination_port = 'DEHAM',
    incoterm = 'CIF',
    commodity = 'metals',
}) {
    const route = SHIPPING_ROUTES.find(r => r.from === origin_port && r.to === destination_port);
    const destFees = PORT_FEES.find(p => p.code === destination_port) || PORT_FEES[13]; // Rotterdam default
    const originFees = PORT_FEES.find(p => p.code === origin_port) || PORT_FEES[0]; // Jeddah default

    const ocean_freight = route ? route.usd_per_teu * (volume_cbm / 28) : 1200;
    const origin_thc = originFees.thc_usd;
    const dest_thc = destFees.thc_usd;
    const documentation = 75;
    const baf = ocean_freight * 0.12; // 12% fuel surcharge
    const insurance = cargo_value_usd * 0.003;
    const sheikha_margin = (ocean_freight + origin_thc + dest_thc + baf) * 0.035;

    const base_total = ocean_freight + origin_thc + dest_thc + documentation + baf + insurance + sheikha_margin;

    return {
        breakdown: {
            ocean_freight_usd: +ocean_freight.toFixed(2),
            origin_thc_usd: +origin_thc.toFixed(2),
            dest_thc_usd: +dest_thc.toFixed(2),
            documentation_usd: documentation,
            baf_fuel_surcharge_usd: +baf.toFixed(2),
            insurance_usd: +insurance.toFixed(2),
            sheikha_halal_margin_usd: +sheikha_margin.toFixed(2),
        },
        total_usd: +base_total.toFixed(2),
        total_sar: +(base_total * 3.75).toFixed(2),
        incoterm,
        route: route ? `${route.from_ar} ← ${route.to_ar}` : `${origin_port} ← ${destination_port}`,
        transit_days: route ? route.days : null,
        note: '﴿وَزِنُوا بِالْقِسْطَاسِ الْمُسْتَقِيمِ﴾ — السعر شامل وعادل لا رسوم مخفية',
    };
}

// ══════════════════════════════════════════════════════════════════════════════
// ٨. الوظائف المُصدَّرة — Exported Functions
// ══════════════════════════════════════════════════════════════════════════════
function getIncoterms() {
    return INCOTERMS_2020;
}

function getIncotermsById(code) {
    return INCOTERMS_2020.find(i => i.code === code.toUpperCase()) || null;
}

function getShippingRoutes(from, to) {
    if (from && to) return SHIPPING_ROUTES.filter(r => r.from === from || r.to === to);
    if (from) return SHIPPING_ROUTES.filter(r => r.from === from);
    return SHIPPING_ROUTES;
}

function getPortFees(country) {
    if (country) return PORT_FEES.filter(p => p.country.toLowerCase().includes(country.toLowerCase()) || p.country_ar.includes(country));
    return PORT_FEES;
}

function getCustomsByCountry(country) {
    if (country) return CUSTOMS_BY_COUNTRY.find(c => c.country.toLowerCase().includes(country.toLowerCase()) || c.country_ar.includes(country));
    return CUSTOMS_BY_COUNTRY;
}

function getCountryBudgets(country) {
    if (country) return COUNTRY_BUDGETS.find(b => b.country.toLowerCase().includes(country.toLowerCase()) || b.country_ar.includes(country));
    return COUNTRY_BUDGETS;
}

function getCountryEconomics(country) {
    if (country) return COUNTRY_ECONOMICS.find(e => e.country.toLowerCase().includes(country.toLowerCase()) || e.country_ar.includes(country));
    return COUNTRY_ECONOMICS;
}

function getFreightModel() {
    return SHEIKHA_FREIGHT_MODEL;
}

function getLogisticsStats() {
    return {
        incoterms_count: INCOTERMS_2020.length,
        shipping_routes_count: SHIPPING_ROUTES.length,
        ports_covered: PORT_FEES.length,
        countries_customs: CUSTOMS_BY_COUNTRY.length,
        countries_budgets: COUNTRY_BUDGETS.length,
        countries_economics: COUNTRY_ECONOMICS.length,
        base_date: BASE_DATE,
        verse: '﴿وَلَا تَبْخَسُوا النَّاسَ أَشْيَاءَهُمْ﴾ — هود ٨٥',
        principle: 'السعر العادل من الله — لا ظلم ولا غبن لأحد',
    };
}

module.exports = {
    getIncoterms,
    getIncotermsById,
    getShippingRoutes,
    getPortFees,
    getCustomsByCountry,
    getCountryBudgets,
    getCountryEconomics,
    getFreightModel,
    calculateShippingPrice,
    getLogisticsStats,
};
