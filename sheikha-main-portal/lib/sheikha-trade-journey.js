/**
 * بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
 * شيخة — محرك رحلة التجارة الكونية الشامل — المرحلة ٤٧
 * سلاسل الإمداد + الشحن + المختبرات + الشهادات + التراخيص + المنصات + الجاهزية
 * "وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا" — البقرة:٢٧٥
 * "وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ" — الأنعام:١٥٢
 * المالك: سلمان أحمد بن سلمان الراجح — المالك الوحيد
 */

'use strict';

// ══════════════════════════════════════════════════════════════════════
// ١. رموز HS للمعادن والسكراب (الكاملة)
// ══════════════════════════════════════════════════════════════════════
const METALS_HS_CODES = {
    ferrous: [
        { hs: '7204.10', ar: 'سكراب حديد زهر', en: 'Cast iron scrap', unit: 'MT' },
        { hs: '7204.21', ar: 'سكراب فولاذ غير مليغ', en: 'Stainless steel scrap', unit: 'MT' },
        { hs: '7204.29', ar: 'سكراب فولاذ أخرى', en: 'Other alloy steel scrap', unit: 'MT' },
        { hs: '7204.30', ar: 'سكراب حديد معلب', en: 'Tinned iron scrap', unit: 'MT' },
        { hs: '7204.41', ar: 'نشارة وبرادة حديد', en: 'Turnings, shavings, chips', unit: 'MT' },
        { hs: '7204.49', ar: 'سكراب حديد أخرى', en: 'Other ferrous scrap', unit: 'MT' },
        { hs: '7204.50', ar: 'حديد سبائك إعادة صهر', en: 'Remelting scrap ingots', unit: 'MT' },
        { hs: '7208',    ar: 'صفائح حديد مدلفنة ساخنة', en: 'Hot-rolled flat steel', unit: 'MT' },
        { hs: '7213',    ar: 'قضبان وأسياخ حديد', en: 'Bars and rods', unit: 'MT' },
        { hs: '7217',    ar: 'أسلاك حديد وفولاذ', en: 'Wire of iron/steel', unit: 'MT' },
        { hs: '7225',    ar: 'منتجات مسطحة من فولاذ سبائكي', en: 'Flat-rolled alloy steel', unit: 'MT' },
    ],
    nonFerrous: [
        { hs: '7404.00', ar: 'نحاس وسبائكه خردة', en: 'Copper waste and scrap', unit: 'MT' },
        { hs: '7503.00', ar: 'نيكل خردة', en: 'Nickel waste and scrap', unit: 'MT' },
        { hs: '7602.00', ar: 'ألومنيوم خردة', en: 'Aluminium waste and scrap', unit: 'MT' },
        { hs: '7802.00', ar: 'رصاص خردة', en: 'Lead waste and scrap', unit: 'MT' },
        { hs: '7902.00', ar: 'زنك خردة', en: 'Zinc waste and scrap', unit: 'MT' },
        { hs: '8002.00', ar: 'قصدير خردة', en: 'Tin waste and scrap', unit: 'MT' },
        { hs: '7112',    ar: 'معادن نفيسة خردة (ذهب/فضة/بلاتين)', en: 'Precious metal scrap', unit: 'KG' },
    ],
    precious: [
        { hs: '7108.12', ar: 'ذهب غير نقدي صب', en: 'Non-monetary gold, unwrought', unit: 'KG' },
        { hs: '7106.91', ar: 'فضة غير مصنوعة', en: 'Silver unwrought', unit: 'KG' },
        { hs: '7110.11', ar: 'بلاتين غير مصنوع', en: 'Platinum unwrought', unit: 'KG' },
        { hs: '7109',    ar: 'معادن أساسية مطلية بذهب', en: 'Base metals clad with gold', unit: 'KG' },
    ],
    ores: [
        { hs: '2601.11', ar: 'خام حديد غير محمص', en: 'Iron ore, non-agglomerated', unit: 'MT' },
        { hs: '2606.00', ar: 'خام ألومنيوم (بوكسيت)', en: 'Aluminium ores (bauxite)', unit: 'MT' },
        { hs: '2603.00', ar: 'خام نحاس', en: 'Copper ores', unit: 'MT' },
        { hs: '2604.00', ar: 'خام نيكل', en: 'Nickel ores', unit: 'MT' },
        { hs: '2605.00', ar: 'خام كوبالت', en: 'Cobalt ores', unit: 'MT' },
        { hs: '7601.10', ar: 'ألومنيوم خالص غير مشغول', en: 'Aluminium, not alloyed', unit: 'MT' },
        { hs: '7601.20', ar: 'سبائك ألومنيوم غير مشغولة', en: 'Aluminium alloys, unwrought', unit: 'MT' },
    ]
};

// ══════════════════════════════════════════════════════════════════════
// ٢. شركاء الشحن العالميون والإقليميون
// ══════════════════════════════════════════════════════════════════════
const SHIPPING_CARRIERS = {
    sea: [
        { id: 'maersk', name: 'Maersk Line', ar: 'ميرسك لاين', type: 'FCL/LCL/Bulk', tracking: 'https://www.maersk.com/tracking', coverage: 'global', saudi_agent: true },
        { id: 'msc', name: 'MSC Mediterranean Shipping', ar: 'شركة البحر المتوسط', type: 'FCL/LCL', tracking: 'https://www.msc.com/track-a-shipment', coverage: 'global', saudi_agent: true },
        { id: 'cosco', name: 'COSCO Shipping', ar: 'كوسكو الصينية للشحن', type: 'FCL/Bulk', coverage: 'global' },
        { id: 'cma_cgm', name: 'CMA CGM', ar: 'CMA CGM', type: 'FCL/LCL', coverage: 'global', tracking: 'https://www.cma-cgm.com/ebusiness/tracking' },
        { id: 'hapag', name: 'Hapag-Lloyd', ar: 'هاباغ لويد', type: 'FCL/LCL', coverage: 'global' },
        { id: 'evergreen', name: 'Evergreen Marine', ar: 'إيفرجرين', type: 'FCL', coverage: 'global' },
        { id: 'bahri', name: 'Bahri (National Shipping Co.)', ar: 'البحري — الشحن الوطني السعودي', type: 'Bulk/Tanker/RoRo', coverage: 'regional_global', speciality: 'metals_bulk', url: 'https://www.bahri.sa', saudi_national: true },
        { id: 'uasc', name: 'United Arab Shipping (via CMA)', ar: 'الشحن العربي المتحد', type: 'FCL', coverage: 'regional' },
        { id: 'bulk_charter', name: 'Bulk Charter (Handysize/Panamax)', ar: 'سفن تشارتر سائبة للمعادن', type: 'Bulk', coverage: 'global', speciality: 'scrap_metals_ores' },
    ],
    air: [
        { id: 'saudia_cargo', name: 'Saudia Cargo', ar: 'السعودية للشحن الجوي', type: 'AWB', coverage: 'international', saudi_national: true },
        { id: 'flynas_cargo', name: 'Flynas Cargo', ar: 'فلاي ناس كارجو', type: 'AWB', coverage: 'regional' },
        { id: 'fedex', name: 'FedEx Freight International', ar: 'فيديكس دولي', type: 'Express/Air Freight', tracking: 'https://www.fedex.com/tracking', coverage: 'global' },
        { id: 'dhl', name: 'DHL Express/Freight', ar: 'دي إتش إل', type: 'Express/Air Freight', tracking: 'https://www.dhl.com', coverage: 'global' },
        { id: 'ups', name: 'UPS Worldwide', ar: 'UPS دولي', type: 'Express/Freight', coverage: 'global' },
        { id: 'emirates_sky', name: 'Emirates SkyCargo', ar: 'طيران الإمارات كارجو', type: 'AWB', coverage: 'global' },
        { id: 'qatar_cargo', name: 'Qatar Airways Cargo', ar: 'قطر إيرويز كارجو', type: 'AWB', coverage: 'global' },
    ],
    land: [
        { id: 'agility', name: 'Agility Logistics', ar: 'أجيليتي للخدمات اللوجستية', coverage: 'GCC_MENA', type: 'FTL/LTL' },
        { id: 'aramex_freight', name: 'Aramex Freight', ar: 'أرامكس فريت', coverage: 'MENA_global', type: 'FTL/LTL/Express' },
        { id: 'naqel', name: 'Naqel Express', ar: 'ناقل إكسبريس', coverage: 'Saudi_domestic', type: 'Express' },
        { id: 'smsa', name: 'SMSA Express', ar: 'SMSA إكسبريس', coverage: 'Saudi_GCC', type: 'Express' },
        { id: 'saudi_transport', name: 'شبكة هيئة النقل (شاحنات مرخصة)', ar: 'هيئة النقل', coverage: 'domestic', type: 'FTL/Bulk_Truck' },
    ],
    rail: [
        { id: 'sar', name: 'الشركة السعودية للخطوط الحديدية (SAR)', ar: 'SAR — القطار السعودي', routes: 'الرياض↔الدمام↔الجبيل', type: 'Bulk/Freight Rail', capacity: 'heavy_metals_ore' },
        { id: 'gcc_rail', name: 'سكة الخليج (قيد الإنجاز)', ar: 'مشروع سكة الخليج', routes: 'الكويت←السعودية←الإمارات←عُمان', status: 'development' },
    ]
};

// ══════════════════════════════════════════════════════════════════════
// ٣. الموانئ الاستراتيجية
// ══════════════════════════════════════════════════════════════════════
const PORTS = {
    saudi: [
        { id: 'jeddah', name: 'ميناء جدة الإسلامي', code: 'SAJED', type: ['container', 'bulk', 'general'], metals: true, freeZone: false, gateway: 'غرب السعودية + بحر أحمر' },
        { id: 'jubail', name: 'ميناء الملك فهد الصناعي — الجبيل', code: 'SAJBI', type: ['bulk', 'industrial'], metals: true, heavy: true, gateway: 'الخليج العربي + صناعة' },
        { id: 'dammam', name: 'ميناء الملك عبدالعزيز — الدمام', code: 'SADMM', type: ['container', 'bulk', 'general'], metals: true, gateway: 'شرق السعودية' },
        { id: 'yanbu', name: 'ميناء ينبع الصناعي', code: 'SAYNB', type: ['bulk', 'industrial', 'oil'], metals: true, gateway: 'غرب + بتروكيماويات' },
        { id: 'jizan', name: 'ميناء جازان', code: 'SAJIZ', type: ['bulk', 'general'], metals: true, gateway: 'جنوب السعودية + إفريقيا' },
        { id: 'duba', name: 'ميناء ضباء', code: 'SADUB', type: ['general'], gateway: 'خليج العقبة' },
    ],
    gcc: [
        { id: 'jebel_ali', name: 'ميناء جبل علي (دبي)', code: 'AEJEA', metals: true, freeZone: true, hub: true, largest: 'أكبر ميناء في الشرق الأوسط' },
        { id: 'khalifa', name: 'ميناء خليفة (أبوظبي)', code: 'AEADK', metals: true, freeZone: true },
        { id: 'sohar', name: 'ميناء صحار (عُمان)', code: 'OMOH', metals: true, heavy: true, freeZone: true },
        { id: 'salalah', name: 'ميناء صلالة (عُمان)', code: 'OMSAL', transshipment: true },
        { id: 'hamad', name: 'ميناء حمد (قطر)', code: 'QADHM', metals: true },
        { id: 'mina_salman', name: 'ميناء مينا سلمان (البحرين)', code: 'BHMNM', metals: true },
        { id: 'shuwaikh', name: 'ميناء الشويخ (الكويت)', code: 'KWSHU', metals: true },
    ],
    global_hubs: [
        { name: 'شنغهاي', code: 'CNSHA', country: '🇨🇳 الصين', rank: 1 },
        { name: 'سنغافورة', code: 'SGSIN', country: '🇸🇬 سنغافورة', rank: 2 },
        { name: 'روتردام', code: 'NLRTM', country: '🇳🇱 هولندا', rank: 3, europe: true },
        { name: 'أنتويرب', code: 'BEANR', country: '🇧🇪 بلجيكا', europe: true },
        { name: 'هامبورغ', code: 'DEHAM', country: '🇩🇪 ألمانيا', europe: true },
        { name: 'لوس أنجلوس / لونج بيتش', code: 'USLAX', country: '🇺🇸 أمريكا', rank: 4 },
        { name: 'نيوسابورت كلانغ', code: 'MYPKG', country: '🇲🇾 ماليزيا' },
        { name: 'بوسان', code: 'KRPUS', country: '🇰🇷 كوريا الجنوبية' },
        { name: 'فيليكستو', code: 'GBFXT', country: '🇬🇧 المملكة المتحدة' },
        { name: 'بيرايوس (أثينا)', code: 'GRPIR', country: '🇬🇷 اليونان', gateway: 'جنوب أوروبا' },
        { name: 'مومباي / نهاوا شيفا', code: 'INNSA', country: '🇮🇳 الهند' },
        { name: 'كولومبو', code: 'LKCMB', country: '🇱🇰 سريلانكا', transshipment: true },
    ]
};

// ══════════════════════════════════════════════════════════════════════
// ٤. مختبرات الفحص والتحليل المعتمدة
// ══════════════════════════════════════════════════════════════════════
const LABORATORIES = {
    international: [
        {
            id: 'sgs', name: 'SGS Group', ar: 'مجموعة SGS', country: '🇨🇭 سويسرا',
            services: ['XRF Analysis', 'OES Spectrometry', 'Chemical Composition', 'Mechanical Testing', 'Weight Verification', 'Sampling', 'Radiation Check'],
            metals: true, scrap: true, precious: true,
            certifications: ['ISO/IEC 17025', 'ILAC', 'IAF'],
            saudi_offices: ['جدة', 'الرياض', 'الدمام', 'الجبيل', 'ينبع'],
            url: 'https://www.sgs.com'
        },
        {
            id: 'bureau_veritas', name: 'Bureau Veritas', ar: 'بيورو فيريتاس', country: '🇫🇷 فرنسا',
            services: ['Metal Analysis', 'Pre-shipment Inspection', 'Third Party Inspection', 'Mill Test Reports', 'Lab Testing', 'Sampling'],
            metals: true, scrap: true,
            certifications: ['ISO/IEC 17025', 'ILAC'],
            saudi_offices: ['الرياض', 'الدمام', 'جدة', 'ينبع', 'الجبيل'],
            url: 'https://www.bureauveritas.com'
        },
        {
            id: 'intertek', name: 'Intertek Group', ar: 'إنترتيك', country: '🇬🇧 المملكة المتحدة',
            services: ['XRF/OES Testing', 'Cargo Inspection', 'Mill Test Reports', 'Commodity Testing', 'REACH Testing'],
            metals: true, scrap: true,
            certifications: ['ISO/IEC 17025', 'ILAC'],
            saudi_offices: ['جدة', 'الدمام'],
            url: 'https://www.intertek.com'
        },
        {
            id: 'alex_stewart', name: 'Alex Stewart International', ar: 'أليكس ستيوارت', country: '🇬🇧 المملكة المتحدة',
            services: ['Sampling', 'Assaying', 'Weighing', 'Precious Metal Testing', 'Metal Trading Support'],
            metals: true, precious: true,
            certifications: ['ISO/IEC 17025', 'LBMA Approved (ذهب/فضة)']
        },
        {
            id: 'cti', name: 'CTI — Commodity Testing International', ar: 'معهد اختبار السلع الدولي',
            services: ['Radiation Safety Check', 'Chemical Analysis', 'Shredded Scrap Inspection'],
            metals: true, scrap: true, radiation: true
        },
        {
            id: 'abs_qe', name: 'ABS Quality Evaluations', ar: 'ABS للجودة',
            services: ['ISO Certification', 'Quality Audits', 'Third Party Audits'],
            certifications: ['ISO 9001', 'ISO 14001', 'ISO 45001']
        }
    ],
    local_saudi: [
        {
            id: 'saso_labs', name: 'مختبرات الهيئة السعودية للمواصفات (SASO)', ar: 'SASO Labs',
            services: ['مطابقة المواصفات', 'شهادة الجودة', 'اختبار المعادن', 'معايرة الأجهزة'],
            certifications: ['ISO/IEC 17025', 'شهادة SASO المعتمدة'], authority: true
        },
        {
            id: 'kaust_labs', name: 'مختبرات جامعة الملك عبدالله (KAUST)', ar: 'KAUST Labs',
            services: ['تحليل مواد متقدم', 'Electron Microscopy', 'XPS Analysis'],
            access: 'بالتنسيق والشراكة البحثية'
        },
        {
            id: 'maaden_labs', name: 'مختبرات معادن', ar: 'Ma\'aden Labs',
            services: ['تحليل خامات المعادن', 'Chemical Composition', 'Geological Analysis', 'Ore Characterization'],
            access: 'شراكة مؤسسية'
        },
        {
            id: 'ncnsp_labs', name: 'مختبرات مدينة الملك عبدالله للطاقة الذرية (KACST)', ar: 'KACST/NCNSP',
            services: ['فحص إشعاعي للسكراب', 'قياس جرعات الإشعاع', 'Nuclear Safety Analysis'],
            authority: true, required_for_scrap: true
        }
    ]
};

// ══════════════════════════════════════════════════════════════════════
// ٥. الشهادات والتراخيص المطلوبة
// ══════════════════════════════════════════════════════════════════════
const CERTIFICATES = {
    saudi_mandatory: [
        { id: 'cr', name: 'السجل التجاري', en: 'Commercial Registration (CR)', issuer: 'وزارة التجارة', renewal: 'سنوي', required: true },
        { id: 'saber', name: 'شهادة مطابقة سابر', en: 'SABER Certificate of Conformity', issuer: 'SASO', digital: true, url: 'https://saber.org.sa', required: true },
        { id: 'customs_code', name: 'رقم المستورد/المصدر الجمركي', en: 'Importer/Exporter Customs Code', issuer: 'هيئة الزكاة والضريبة والجمارك', required: true },
        { id: 'vat', name: 'شهادة ضريبة القيمة المضافة', en: 'VAT Registration', issuer: 'هيئة الزكاة والضريبة والجمارك', threshold: '375,000 ريال سنوياً', required: true },
        { id: 'zakat', name: 'شهادة الزكاة', en: 'Zakat Certificate', issuer: 'هيئة الزكاة والضريبة والجمارك', renewal: 'سنوي', required: true },
        { id: 'enviro', name: 'التصريح البيئي للنفايات المعدنية', en: 'Environmental Permit for Metal Waste', issuer: 'المركز الوطني للرقابة البيئية (NCEC)', required: true, for_scrap: true },
        { id: 'municipality', name: 'الترخيص البلدي لمنشآت التخزين', en: 'Municipal Storage License', issuer: 'أمانات المدن', required: true },
        { id: 'radiation', name: 'شهادة سلامة إشعاعية', en: 'Radiation Safety Certificate', issuer: 'مدينة الملك عبدالله للطاقة الذرية (KACST)', required: true, for_scrap: true },
    ],
    international: [
        { id: 'iso9001', name: 'ISO 9001 — نظام إدارة الجودة', en: 'ISO 9001 Quality Management', type: 'quality', global: true },
        { id: 'iso14001', name: 'ISO 14001 — الإدارة البيئية', en: 'ISO 14001 Environmental Management', type: 'environmental', global: true },
        { id: 'iso45001', name: 'ISO 45001 — الصحة والسلامة المهنية', en: 'ISO 45001 Occupational H&S', type: 'safety', global: true },
        { id: 'isri', name: 'عضوية ISRI للسكراب', en: 'ISRI Membership', type: 'industry', url: 'https://www.isri.org' },
        { id: 'aeo', name: 'المتعامل الاقتصادي المعتمد AEO', en: 'Authorized Economic Operator', issuer: 'WCO / الجمارك السعودية', type: 'customs_fast_track', benefit: 'تخليص جمركي أسرع' },
        { id: 'imdg', name: 'شهادة IMO IMDG للبضائع الخطرة', en: 'IMDG Certificate', type: 'hazmat_shipping', required_for: 'dangerous_goods' },
        { id: 'lme', name: 'اعتماد بورصة لندن للمعادن LME', en: 'LME Brand Approval', type: 'metals_trading', url: 'https://www.lme.com' },
        { id: 'reach', name: 'امتثال REACH الأوروبي', en: 'EU REACH Compliance', type: 'eu_export', required_for: 'europe' },
        { id: 'ctpat', name: 'C-TPAT للتصدير لأمريكا', en: 'Customs-Trade Partnership Against Terrorism', type: 'usa_export', required_for: 'usa' },
    ],
    gcc: [
        { id: 'gso', name: 'شهادة GSO الخليجية', en: 'Gulf Standards Organization (GSO)', issuer: 'GSO', for_gcc: true },
        { id: 'gcc_customs', name: 'إجراءات الاتحاد الجمركي الخليجي', en: 'GCC Customs Union Procedures', for_gcc: true },
    ]
};

// ══════════════════════════════════════════════════════════════════════
// ٦. منصات التكامل التجاري العالمي
// ══════════════════════════════════════════════════════════════════════
const PLATFORMS = {
    global_metals: [
        { id: 'alibaba', name: 'Alibaba.com', ar: 'علي بابا', type: 'B2B Marketplace', api: true },
        { id: 'metalshub', name: 'Metals Hub', ar: 'ميتالز هاب', type: 'Digital Metals Exchange', api: true, url: 'https://www.metalshub.com' },
        { id: 'scrap_register', name: 'ScrapRegister.com', ar: 'سكراب ريجيستر', type: 'Scrap Marketplace' },
        { id: 'lme_exchange', name: 'LME — London Metal Exchange', ar: 'بورصة لندن للمعادن', type: 'Exchange', clearing: true },
        { id: 'comex', name: 'COMEX', ar: 'كوميكس للمعادن الثمينة', type: 'Futures Exchange', precious: true },
        { id: 'fastmarkets', name: 'Fastmarkets / Metal Bulletin', ar: 'فاست ماركتس', type: 'Price Index + News', api: true },
        { id: 'isteel', name: 'iSteel', ar: 'آي ستيل', type: 'Digital Steel Exchange', api: true },
        { id: 'gem', name: 'Global Energy Metals Exchange', ar: 'بورصة المعادن الطاقوية', type: 'Exchange', speciality: 'battery_metals' },
    ],
    saudi_government: [
        { id: 'fasah', name: 'منصة فسح — التخليص الجمركي', en: 'Fasah', url: 'https://www.fasah.gov.sa', authority: 'هيئة الزكاة والضريبة والجمارك', required: true },
        { id: 'saber', name: 'منصة سابر — شهادات المطابقة', en: 'SABER', url: 'https://saber.org.sa', authority: 'SASO', required: true },
        { id: 'maroof', name: 'منصة معروف — التوثيق التجاري', en: 'Maroof', url: 'https://maroof.sa', authority: 'وزارة التجارة' },
        { id: 'etimad', name: 'منصة اعتماد — المشتريات الحكومية', en: 'Etimad', url: 'https://etimad.sa', authority: 'وزارة المالية' },
        { id: 'nafath', name: 'نفاذ — الهوية الرقمية', en: 'Nafath', url: 'https://nafath.sa', authority: 'هيئة الاتصالات' },
        { id: 'wasel', name: 'واصل — ربط الشحن', en: 'Wasel', authority: 'هيئة النقل', type: 'freight_connect' },
        { id: 'single_window', name: 'النافذة الواحدة للتجارة الخارجية', en: 'Single Window', authority: 'وزارة التجارة + الجمارك', integration: 'ERP_ready' },
        { id: 'musaned', name: 'مساند — عمالة منزلية', en: 'Musaned', authority: 'وزارة الموارد البشرية' },
    ],
    logistics_digital: [
        { id: 'flexport', name: 'Flexport', ar: 'فليكسبورت', type: 'Digital Freight Forwarder', api: true, url: 'https://www.flexport.com' },
        { id: 'freightos', name: 'Freightos', ar: 'فريتوس', type: 'Freight Marketplace', api: true, url: 'https://www.freightos.com' },
        { id: 'project44', name: 'project44', ar: 'بروجكت 44', type: 'Real-time Shipment Visibility', api: true, tracking: 'global_real_time' },
        { id: 'fourkites', name: 'FourKites', ar: 'فور كايتس', type: 'AI Supply Chain Visibility', api: true },
        { id: 'inttra', name: 'INTTRA (WiseTech)', ar: 'إنترا', type: 'Ocean Booking Platform', api: true },
        { id: 'gt_nexus', name: 'GT Nexus (Infor)', ar: 'جي تي نيكسوس', type: 'Supply Chain Platform', api: true },
        { id: 'sap_tm', name: 'SAP Transportation Management', ar: 'SAP إدارة النقل', type: 'ERP-TMS', api: true },
        { id: 'oracle_tms', name: 'Oracle TMS', ar: 'أوراكل لإدارة النقل', type: 'TMS', api: true },
    ]
};

// ══════════════════════════════════════════════════════════════════════
// ٧. وثائق الشحن والتجارة الكاملة
// ══════════════════════════════════════════════════════════════════════
const TRADE_DOCUMENTS = {
    shipping: [
        { id: 'bl', name: 'بوليصة الشحن البحري', en: 'Bill of Lading (B/L)', required: true, digital_option: 'eBL' },
        { id: 'awb', name: 'بوليصة الشحن الجوي', en: 'Air Waybill (AWB)', required: 'للشحن الجوي' },
        { id: 'cmr', name: 'وثيقة شحن بري (CMR)', en: 'CMR Consignment Note', required: 'للشحن البري الدولي' },
        { id: 'cim', name: 'وثيقة شحن سكك حديدية (CIM)', en: 'CIM Rail Consignment Note', required: 'للقطارات' },
    ],
    commercial: [
        { id: 'ci', name: 'الفاتورة التجارية', en: 'Commercial Invoice', required: true, sharia: 'يجب أن تعكس الثمن الحقيقي — لا تحايل على الجمارك' },
        { id: 'pl', name: 'قائمة التعبئة', en: 'Packing List', required: true },
        { id: 'coo', name: 'شهادة المنشأ', en: 'Certificate of Origin', required: true, issuer: 'الغرف التجارية السعودية' },
        { id: 'coa', name: 'شهادة التحليل الكيميائي', en: 'Certificate of Analysis (CoA)', required: true, for_metals: true },
        { id: 'cow', name: 'شهادة الوزن والقياس', en: 'Certificate of Weight', required: true, for_bulk: true },
        { id: 'phyto', name: 'شهادة صحة النباتات (للتعبئة الخشبية)', en: 'Phytosanitary Certificate', required: 'للشحنات بتعبئة خشبية' },
        { id: 'fumigation', name: 'شهادة التدخين', en: 'Fumigation Certificate', required: 'عند وجود تعبئة خشبية' },
    ],
    insurance: [
        { id: 'cargo_ins', name: 'شهادة التأمين على البضائع', en: 'Cargo Insurance Certificate', required: true, sharia: 'تأمين تكافلي إسلامي مفضل على التقليدي' },
        { id: 'takaful', name: 'التأمين التكافلي الإسلامي', en: 'Islamic Takaful Insurance', sharia_compliant: true, preferred: true },
    ],
    financial: [
        { id: 'tt', name: 'حوالة بنكية T/T', en: 'Telegraphic Transfer', sharia_compliant: true, preferred: true, rank: 1 },
        { id: 'dp', name: 'مستندات مقابل الدفع D/P', en: 'Documents against Payment', sharia_compliant: true, rank: 2 },
        { id: 'murabaha_lc', name: 'اعتماد مرابحة إسلامي', en: 'Islamic Murabaha L/C', sharia_compliant: true, preferred: true, rank: 3 },
        { id: 'lc', name: 'اعتماد مستندي تقليدي (بدون فوائد)', en: 'Letter of Credit (conventional, no interest)', sharia: 'جائز بشرط إزالة الفوائد التأخيرية', rank: 4 },
        { id: 'open_account', name: 'حساب مفتوح (أجل بلا فوائد)', en: 'Open Account / Deferred', sharia_compliant: true, rank: 5 },
        { id: 'riba_loan', name: 'قرض ربوي بفوائد', en: 'Interest-bearing Bank Loan', forbidden: true, sharia: 'محرم — لا تستخدم أبداً' },
    ],
    customs: [
        { id: 'customs_dec', name: 'الإقرار الجمركي', en: 'Customs Declaration', platform: 'فسح', required: true },
        { id: 'import_permit', name: 'تصريح الاستيراد', en: 'Import Permit', required: 'للسلع الخاضعة مثل السكراب' },
        { id: 'saber_coc', name: 'شهادة مطابقة سابر', en: 'SABER CoC', platform: 'saber.org.sa', required: true },
        { id: 'arrival_notice', name: 'إشعار الوصول', en: 'Arrival Notice', required: true },
        { id: 'do', name: 'أمر التسليم', en: 'Delivery Order (D/O)', required: true },
        { id: 'ata_carnet', name: 'دفتر ATA — للعينات المؤقتة', en: 'ATA Carnet (temporary import)', note: 'مناسب لعينات المعادن في المعارض' },
    ]
};

// ══════════════════════════════════════════════════════════════════════
// ٨. أنواع الحاويات والسفن
// ══════════════════════════════════════════════════════════════════════
const CONTAINERS_AND_VESSELS = {
    containers: [
        { type: '20ft DC', volume_cbm: 33, max_payload_kg: 28200, use_ar: 'معادن كثيفة + بضائع عامة' },
        { type: '40ft DC', volume_cbm: 67, max_payload_kg: 26680, use_ar: 'لفائف فولاذ + بضائع متوسطة' },
        { type: '40ft HC', volume_cbm: 76, max_payload_kg: 26460, use_ar: 'بضائع ذات حجم كبير' },
        { type: 'Open Top (OT) 20ft', use_ar: 'سكراب بارز من الأعلى + قضبان طويلة', special: true },
        { type: 'Open Top (OT) 40ft', use_ar: 'آلات ثقيلة + سكراب ضخم', special: true },
        { type: 'Flat Rack (FR) 20ft', use_ar: 'محولات كهربائية + بضائع عريضة', special: true },
        { type: 'Flat Rack (FR) 40ft', use_ar: 'معدات ثقيلة جداً + Over-gauge', special: true },
        { type: 'Bulk Container', use_ar: 'برادة معادن + سبائك صغيرة سائبة', special: true },
        { type: 'Tank Container (ISO Tank)', use_ar: 'معادن سائلة + مواد كيميائية', special: true },
    ],
    bulk_vessels: [
        { class: 'Small Handysize', dwt: '10,000–28,000', use_ar: 'سكراب خليجي + موانئ صغيرة محدودة الغاطس' },
        { class: 'Handysize', dwt: '28,000–40,000', use_ar: 'سكراب إقليمي متوسط' },
        { class: 'Handymax/Supramax', dwt: '40,000–60,000', use_ar: 'شحنات سكراب وخامات كبيرة' },
        { class: 'Ultramax', dwt: '60,000–65,000', use_ar: 'خامات معادن ضخمة' },
        { class: 'Panamax', dwt: '65,000–85,000', use_ar: 'خامات عبر قناة بنما + رحلات طويلة' },
        { class: 'Post-Panamax / Kamsarmax', dwt: '80,000–120,000', use_ar: 'كميات ضخمة من بوكسيت/خام حديد' },
        { class: 'Capesize', dwt: '120,000–200,000', use_ar: 'خام حديد ضخم (معادن / أرامكو) عبر رأس الرجاء', premium_routes: true },
    ]
};

// ══════════════════════════════════════════════════════════════════════
// ٩. مناطق التجارة الحرة الاستراتيجية
// ══════════════════════════════════════════════════════════════════════
const FREE_ZONES = {
    saudi: [
        { id: 'jizan_ez', name: 'المنطقة الاقتصادية الخاصة بجازان', benefits: 'إعفاءات ضريبية 50 سنة + استيراد معادن مسهّل', metals: true, status: 'active' },
        { id: 'neom_ez', name: 'منطقة NEOM الاقتصادية الخاصة', benefits: 'ضريبة صفر + بنية ذكية + بيانات مفتوحة', status: 'development' },
        { id: 'ria_ez', name: 'منطقة الرياض الاقتصادية الخاصة', benefits: 'تسهيل الأعمال + مقر إقليمي للشركات', status: 'active' },
        { id: 'king_salman_ez', name: 'منطقة الملك سلمان للطاقة', benefits: 'استثمار متكامل للطاقة والمعادن المرتبطة', status: 'development' },
    ],
    gcc: [
        { id: 'jafza', name: 'منطقة جبل علي الحرة JAFZA (دبي)', benefits: 'ملكية 100% + إعفاء جمركي + أكبر منطقة حرة بالشرق الأوسط', metals: true, hub: true },
        { id: 'dmcc', name: 'مركز دبي للسلع المتعددة DMCC', benefits: 'تخصص ذهب + معادن ثمينة + سوق دبي للذهب', precious: true },
        { id: 'sohar_fz', name: 'المنطقة الحرة بصحار (عُمان)', benefits: 'ملكية 100% + معافاة ضريبية + قرب الهند وآسيا', metals: true },
        { id: 'khalifa_ind', name: 'منطقة خليفة الصناعية KIZAD (أبوظبي)', benefits: 'صناعات ثقيلة + ميناء خليفة المتكامل', metals: true },
    ],
    global: [
        { id: 'jebel_ali_global', name: 'جبل علي — بوابة العالم', hub: true },
        { id: 'rotterdam_distripark', name: 'مناطق توزيع روتردام', country: 'هولندا', europe: true },
        { id: 'singapore_ftz', name: 'المناطق الحرة في سنغافورة', country: 'سنغافورة', asia_hub: true },
        { id: 'shanghai_ftz', name: 'منطقة شنغهاي الحرة', country: 'الصين', china: true },
    ]
};

// ══════════════════════════════════════════════════════════════════════
// ١٠. مؤشرات الشحن والأسعار
// ══════════════════════════════════════════════════════════════════════
const MARKET_INDICES = {
    freight: [
        { id: 'bdi', name: 'Baltic Dry Index (BDI)', ar: 'مؤشر البلطيق للشحن السائب', frequency: 'يومي', url: 'https://www.balticexchange.com', use: 'مرجع شحن السكراب والخامات السائبة' },
        { id: 'scfi', name: 'Shanghai Containerized Freight Index (SCFI)', ar: 'مؤشر شنغهاي للحاويات', frequency: 'أسبوعي', use: 'مرجع الشحن بالحاويات من آسيا' },
        { id: 'wci', name: 'Drewry World Container Index', ar: 'مؤشر دريوري للحاويات', frequency: 'أسبوعي' },
        { id: 'fbx', name: 'Freightos Baltic Index (FBX)', ar: 'مؤشر فريتوس البلطيق', frequency: 'يومي', api: true, url: 'https://fbx.freightos.com' },
    ],
    metals: [
        { id: 'lme', name: 'LME Metal Prices', ar: 'أسعار LME اللحظية', coverage: 'Cu/Al/Zn/Ni/Pb/Sn', frequency: 'لحظي', api: true },
        { id: 'fastmarkets_steel', name: 'Fastmarkets Steel Scrap Assessments', ar: 'أسعار سكراب الفولاذ فاست ماركتس', frequency: 'يومي', api: true },
        { id: 'platts', name: 'Platts Metals Assessments', ar: 'بلاتس للمعادن', frequency: 'يومي' },
        { id: 'argus', name: 'Argus Media Metals', ar: 'أرغوس ميديا للمعادن', frequency: 'يومي' },
        { id: 'sheikha_index', name: 'مؤشر شيخة للمعادن والسكراب', ar: 'Sheikha Metal Index', frequency: 'لحظي', source: 'internal', note: 'للمعرفة وشفافية السوق فقط — ليس تسعيراً إلزامياً بإذن الله' },
    ]
};

// ══════════════════════════════════════════════════════════════════════
// ١١. معمارية سلسلة الإمداد (7 طبقات)
// ══════════════════════════════════════════════════════════════════════
const SUPPLY_CHAIN_ARCHITECTURE = {
    name: 'رحلة التجارة الكونية — شيخة',
    quran: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا — البقرة:٢٧٥',
    layers: [
        {
            id: 1, name: 'مصادر المعادن والسكراب', en: 'Sourcing',
            nodes: ['منتجون محليون (معادن / الجبيل / حديد سعودي)', 'سكراب صناعي (مصانع / ورش)', 'مصادر خليجية إقليمية', 'استيراد من آسيا/أوروبا/أمريكا'],
            sheikha_tools: ['مؤشر شيخة', 'RFQ النظام', 'ملفات الموردين الذكية'],
            output: 'عرض توريد مؤكد + سعر عادل بلا غرر'
        },
        {
            id: 2, name: 'الفحص والمختبرات', en: 'Inspection & Testing',
            nodes: ['XRF/OES — تحليل كيميائي', 'شهادة وزن SGS/BV/Intertek', 'فحص إشعاعي (NCNSP)', 'Mill Test Report / CoA'],
            sheikha_tools: ['نظام شهادات شيخة', 'تتبع المختبرات'],
            output: 'شهادة تحليل معتمدة + شهادة وزن + تقرير إشعاعي'
        },
        {
            id: 3, name: 'التوثيق والوثائق التجارية', en: 'Documentation',
            nodes: ['فاتورة تجارية صحيحة', 'قائمة التعبئة', 'شهادة المنشأ', 'شهادات إضافية حسب الوجهة'],
            sheikha_tools: ['مولّد الوثائق الرقمي', 'بوابة المستندات'],
            output: 'مجموعة وثائق كاملة ومتوافقة دولياً'
        },
        {
            id: 4, name: 'التخليص الجمركي', en: 'Customs Clearance',
            nodes: ['منصة فسح السعودية', 'سابر SASO للمطابقة', 'النافذة الواحدة', 'وكيل تخليص جمركي معتمد'],
            sheikha_tools: ['تكامل فسح API', 'تكامل سابر API'],
            output: 'موافقة جمركية + إقرار جمركي مقبول'
        },
        {
            id: 5, name: 'الشحن والنقل', en: 'Transport & Shipping',
            nodes: ['بحري — FCL/LCL/Bulk (سفن سائبة)', 'جوي — AWB Express', 'بري — GCC FTL', 'SAR — سكك حديدية صناعية'],
            sheikha_tools: ['حجز الشحن عبر شيخة', 'تتبع project44 / FourKites'],
            output: 'بوليصة شحن صادرة + تتبع لحظي'
        },
        {
            id: 6, name: 'الاستلام والتخزين', en: 'Receipt & Warehousing',
            nodes: ['مستودعات ذكية بـ WMS', 'مناطق حرة (JAFZA/جازان)', 'مستودعات الموانئ الصناعية', 'RFID + باركود للجرد'],
            sheikha_tools: ['نظام المخزون الذكي لشيخة'],
            output: 'استلام مؤكد + جرد رقمي دقيق'
        },
        {
            id: 7, name: 'التسوية المالية الشرعية', en: 'Sharia-compliant Settlement',
            nodes: ['T/T حوالة بنكية (مفضل)', 'مرابحة إسلامية', 'اعتماد مستندي إسلامي', 'تأمين تكافلي'],
            quran: 'وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ — الأنعام:١٥٢',
            output: 'تسوية حلال كاملة + سجل مالي شفاف'
        }
    ],
    digital_twin: {
        name: 'النسخة الرقمية لسلسلة الإمداد — Sheikha Digital Twin',
        capabilities: ['تتبع لحظي للشحنات', 'تحديث آلي للوثائق', 'تنبيهات انقطاع السلسلة', 'لوحة تحكم موحدة', 'IoT + RFID Integration'],
        integrations: ['SAP/Oracle ERP', 'منصة فسح', 'Carriers API', 'Lab Systems', 'LME Prices Feed']
    }
};

// ══════════════════════════════════════════════════════════════════════
// ١٢. قائمة الجاهزية الكاملة للشحن (Readiness Checklist)
// ══════════════════════════════════════════════════════════════════════
function getReadinessChecklist(options = {}) {
    const items = [
        // التراخيص والتسجيل
        { phase: 'تراخيص', step: 1,  ar: 'السجل التجاري ساري المفعول', required: true },
        { phase: 'تراخيص', step: 2,  ar: 'رقم المستورد/المصدر الجمركي نشط', required: true },
        { phase: 'تراخيص', step: 3,  ar: 'شهادة ضريبة القيمة المضافة (VAT)', required: true },
        { phase: 'تراخيص', step: 4,  ar: 'شهادة الزكاة سارية', required: true },
        { phase: 'تراخيص', step: 5,  ar: 'التصريح البيئي للنفايات المعدنية (NCEC)', required: options.scrap !== false },
        // الفحص والمختبرات
        { phase: 'مختبرات', step: 6,  ar: 'شهادة تحليل كيميائي معتمدة (SGS/BV/Intertek)', required: true },
        { phase: 'مختبرات', step: 7,  ar: 'شهادة وزن مستقلة من جهة معتمدة', required: true },
        { phase: 'مختبرات', step: 8,  ar: 'تقرير الفحص الإشعاعي للسكراب المعدني', required: options.scrap !== false },
        // الوثائق التجارية
        { phase: 'وثائق', step: 9,  ar: 'الفاتورة التجارية بالثمن الحقيقي (بلا تحايل)', required: true },
        { phase: 'وثائق', step: 10, ar: 'قائمة التعبئة الكاملة والدقيقة', required: true },
        { phase: 'وثائق', step: 11, ar: 'شهادة المنشأ من الغرفة التجارية السعودية', required: true },
        { phase: 'وثائق', step: 12, ar: 'شهادة مطابقة سابر (SABER CoC)', required: true },
        { phase: 'وثائق', step: 13, ar: 'شهادة التأمين (تكافل إسلامي مفضل)', required: true },
        { phase: 'وثائق', step: 14, ar: 'شهادة التدخين إن وجدت تعبئة خشبية', required: false },
        // الشحن والتخليص
        { phase: 'شحن', step: 15, ar: 'تحديد نوع الحاوية/السفينة المناسبة', required: true },
        { phase: 'شحن', step: 16, ar: 'حجز الشحن وتأكيد المسار والمسافرة', required: true },
        { phase: 'شحن', step: 17, ar: 'بوليصة شحن صادرة (B/L أو AWB)', required: true },
        { phase: 'جمارك', step: 18, ar: 'التخليص الجمركي عبر منصة فسح', required: true },
        { phase: 'جمارك', step: 19, ar: 'إشعار الوصول + أمر التسليم (D/O)', required: true },
        // التسوية المالية
        { phase: 'مالية', step: 20, ar: 'تأكيد طريقة الدفع الشرعية (T/T أو مرابحة)', required: true },
        { phase: 'مالية', step: 21, ar: 'التحقق من خلو الاتفاقية من أي شرط ربوي', required: true },
        { phase: 'مالية', step: 22, ar: 'استلام المدفوعات وإغلاق ملف الصفقة', required: true },
    ];

    // إضافات حسب الوجهة
    if (options.destination === 'eu') {
        items.push({ phase: 'متطلبات خاصة', step: 23, ar: 'شهادة REACH الأوروبية للمواد الكيميائية', required: true });
    }
    if (options.destination === 'usa') {
        items.push({ phase: 'متطلبات خاصة', step: 23, ar: 'C-TPAT Compliance للتصدير لأمريكا', required: true });
    }
    if (options.precious_metals) {
        items.push({ phase: 'متطلبات خاصة', step: 24, ar: 'شهادة LBMA أو اعتماد المختبر لمعادن نفيسة', required: true });
    }
    if (options.aeo) {
        items.push({ phase: 'تمييز', step: 25, ar: 'شهادة AEO — المتعامل الاقتصادي المعتمد (تسريع التخليص)', required: false, benefit: true });
    }
    return { destination: options.destination || 'global', total: items.length, checklist: items };
}

// ══════════════════════════════════════════════════════════════════════
// ١٣. المبادئ الشرعية للتجارة الدولية
// ══════════════════════════════════════════════════════════════════════
const SHARIA_PRINCIPLES = {
    foundations: [
        { principle: 'البيع عن تراضٍ', quran: 'إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ', ref: 'النساء:٢٩' },
        { principle: 'صدق الكيل والوزن', quran: 'وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ', ref: 'الأنعام:١٥٢' },
        { principle: 'الوفاء بالعقود', quran: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ', ref: 'المائدة:١' },
        { principle: 'تحريم الربا', quran: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا', ref: 'البقرة:٢٧٥' },
        { principle: 'تجنب الغرر والجهالة', hadith: 'نهى النبي ﷺ عن بيع الغرر', ref: 'مسلم' },
        { principle: 'النهي عن الاحتكار', hadith: 'من احتكر فهو خاطئ', ref: 'مسلم' },
        { principle: 'الشفافية في الثمن', note: 'الفاتورة التجارية تعكس الثمن الحقيقي دون تحايل على الجمارك' },
        { principle: 'الرزق الحلال', quran: 'فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِن رِّزْقِهِ', ref: 'الملك:١٥' },
    ],
    payment_guidance: [
        { rank: 1, method: 'حوالة بنكية T/T', status: 'جائز — الأفضل', preferred: true },
        { rank: 2, method: 'مستندات مقابل الدفع D/P', status: 'جائز', preferred: true },
        { rank: 3, method: 'مرابحة إسلامية (اعتماد إسلامي)', status: 'جائز بالضوابط', preferred: true },
        { rank: 4, method: 'اعتماد مستندي تقليدي (L/C) بدون فوائد', status: 'جائز بشروط', note: 'يجب حذف بند الفوائد التأخيرية' },
        { rank: 5, method: 'حساب مفتوح — أجل بلا فوائد', status: 'جائز' },
        { rank: 6, method: 'أي قرض أو تمويل ربوي', status: 'محرم — لا تستخدم', forbidden: true },
    ],
    insurance: 'تأمين تكافلي إسلامي على البضائع — مفضل على التأمين التقليدي الربوي'
};

// ══════════════════════════════════════════════════════════════════════
// ١٤. وظائف التصدير والإحصاء
// ══════════════════════════════════════════════════════════════════════

function getHSCodes(category) {
    return category ? (METALS_HS_CODES[category] || []) : METALS_HS_CODES;
}
function getCarriers(mode) {
    return mode ? (SHIPPING_CARRIERS[mode] || []) : SHIPPING_CARRIERS;
}
function getPorts(region) {
    return region ? (PORTS[region] || []) : PORTS;
}
function getLabs(type) {
    return type ? (LABORATORIES[type] || []) : LABORATORIES;
}
function getCertificates(scope) {
    return scope ? (CERTIFICATES[scope] || []) : CERTIFICATES;
}
function getPlatforms(category) {
    return category ? (PLATFORMS[category] || []) : PLATFORMS;
}
function getDocuments(docGroup) {
    return docGroup ? (TRADE_DOCUMENTS[docGroup] || []) : TRADE_DOCUMENTS;
}
function getArchitecture() {
    return SUPPLY_CHAIN_ARCHITECTURE;
}
function getContainers(type) {
    return type ? (CONTAINERS_AND_VESSELS[type] || []) : CONTAINERS_AND_VESSELS;
}
function getIndices(category) {
    return category ? (MARKET_INDICES[category] || []) : MARKET_INDICES;
}
function getSharia() {
    return SHARIA_PRINCIPLES;
}
function getFreeZones(region) {
    return region ? (FREE_ZONES[region] || []) : FREE_ZONES;
}

function getFullProfile() {
    return {
        hs_codes: METALS_HS_CODES,
        carriers: SHIPPING_CARRIERS,
        ports: PORTS,
        laboratories: LABORATORIES,
        certificates: CERTIFICATES,
        platforms: PLATFORMS,
        documents: TRADE_DOCUMENTS,
        architecture: SUPPLY_CHAIN_ARCHITECTURE,
        containers: CONTAINERS_AND_VESSELS,
        indices: MARKET_INDICES,
        sharia: SHARIA_PRINCIPLES,
        free_zones: FREE_ZONES,
        readiness: getReadinessChecklist()
    };
}

function getEngineStats() {
    return {
        engine: 'sheikha-trade-journey',
        version: '1.0.0',
        phase: 47,
        date: '2026-04-08',
        hs_codes_total: Object.values(METALS_HS_CODES).flat().length,
        carriers_total: Object.values(SHIPPING_CARRIERS).flat().length,
        ports_total: Object.values(PORTS).flat().length,
        labs_total: Object.values(LABORATORIES).flat().length,
        certificates_total: Object.values(CERTIFICATES).flat().length,
        platforms_total: Object.values(PLATFORMS).flat().length,
        documents_total: Object.values(TRADE_DOCUMENTS).flat().length,
        supply_chain_layers: SUPPLY_CHAIN_ARCHITECTURE.layers.length,
        container_types: CONTAINERS_AND_VESSELS.containers.length,
        bulk_vessel_classes: CONTAINERS_AND_VESSELS.bulk_vessels.length,
        free_zones_total: Object.values(FREE_ZONES).flat().length,
        readiness_checklist_base: 22,
        sharia_principles: SHARIA_PRINCIPLES.foundations.length,
        quran: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا — البقرة:٢٧٥'
    };
}

// ══════════════════════════════════════════════════════════════════════
module.exports = {
    getHSCodes,
    getCarriers,
    getPorts,
    getLabs,
    getCertificates,
    getPlatforms,
    getDocuments,
    getArchitecture,
    getContainers,
    getIndices,
    getSharia,
    getFreeZones,
    getFullProfile,
    getReadinessChecklist,
    getEngineStats,
    METALS_HS_CODES,
    SHIPPING_CARRIERS,
    PORTS,
    LABORATORIES,
    CERTIFICATES,
    PLATFORMS,
    TRADE_DOCUMENTS,
    SUPPLY_CHAIN_ARCHITECTURE,
    CONTAINERS_AND_VESSELS,
    MARKET_INDICES,
    SHARIA_PRINCIPLES,
    FREE_ZONES
};
