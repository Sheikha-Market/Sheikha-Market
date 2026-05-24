/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * محرك العمليات الرقمية الشامل — Sheikha Digital Operations Engine v1.0
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * «التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ»
 * ﴿ هُوَ أَنشَأَكُم مِّنَ الْأَرْضِ وَاسْتَعْمَرَكُمْ فِيهَا ﴾ — هود: ٦١
 *
 * يغطي: الميناء الرقمي، تشليح السفن والطائرات، سلسلة الكتلة،
 * وكلاء الذكاء الاصطناعي، القيمة التنافسية، المحاسبة الرقمية،
 * المبيعات، العقود، إدارة الحاويات والأصول والشاحنات والمعدات،
 * الدراسات، التخطيط الاستراتيجي، نموذج العمل، إدارة المشاريع،
 * الهندسة الرقمية، أدوات التصميم، الولاء، الهوية الرقمية
 *
 * الملكية الفكرية: سلمان أحمد بن سلمان الراجح — © 2026
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

module.exports = function(app, ctx) {
const { USERS, TRADERS, LISTINGS, ORDERS, CONTAINERS } = ctx;

// ═══════════════════════════════════════════════════════════════════════════════
// ▌ القسم ١: الميناء الرقمي — السفن والطائرات والتشليح البحري والجوي
// ═══════════════════════════════════════════════════════════════════════════════

const DIGITAL_PORT = {
    saudi_ports: [
        { id:'jeddah',   ar:'ميناء جدة الإسلامي',      lat:21.48, lng:39.16, type:'بحري',  capacity:'7.3M TEU', scrap_yard:true, specialties:['حاويات','سكراب','سفن'] },
        { id:'dammam',   ar:'ميناء الملك عبدالعزيز',    lat:26.46, lng:50.07, type:'بحري',  capacity:'2.2M TEU', scrap_yard:true, specialties:['معادن','بتروكيماويات','سكراب'] },
        { id:'jubail',   ar:'ميناء الجبيل التجاري',     lat:27.01, lng:49.65, type:'صناعي',  capacity:'1.5M طن',  scrap_yard:true, specialties:['مواد كيميائية','معادن'] },
        { id:'yanbu',    ar:'ميناء ينبع التجاري',       lat:24.09, lng:38.06, type:'صناعي',  capacity:'1.8M طن',  scrap_yard:true, specialties:['بتروكيماويات','معادن'] },
        { id:'ras_khair',ar:'ميناء رأس الخير',          lat:27.48, lng:49.25, type:'تعدين',  capacity:'5M طن',    scrap_yard:false, specialties:['بوكسيت','ألمنيوم','فوسفات'] },
        { id:'jizan',    ar:'ميناء جازان',              lat:16.88, lng:42.53, type:'بحري',   capacity:'500K طن',  scrap_yard:false, specialties:['عام','سكراب'] },
    ],
    international_ports: [
        { id:'alang',     ar:'ألانغ — الهند',      country:'IN', type:'تكسير سفن',  capacity:'400+ سفينة/سنة', rank:1 },
        { id:'chittagong',ar:'شيتاغونغ — بنغلاديش', country:'BD', type:'تكسير سفن',  capacity:'200+ سفينة/سنة', rank:2 },
        { id:'gadani',    ar:'غداني — باكستان',     country:'PK', type:'تكسير سفن',  capacity:'100+ سفينة/سنة', rank:3 },
        { id:'aliaga',    ar:'ألياغا — تركيا',      country:'TR', type:'تكسير سفن',  capacity:'150+ سفينة/سنة', rank:4 },
        { id:'rotterdam', ar:'روتردام — هولندا',     country:'NL', type:'سكراب معادن', capacity:'5M طن/سنة',     rank:5 },
    ],
    // أنواع السفن القابلة للتشليح
    vessel_types: [
        { id:'bulk_carrier',   ar:'ناقلة بضائع سائبة',  avg_weight:'25,000-80,000 طن', steel_yield:'85-90%', lifespan:'25-30 سنة', scrap_metals:['صلب','نحاس','ألمنيوم','زنك'] },
        { id:'tanker',         ar:'ناقلة نفط',          avg_weight:'30,000-100,000 طن', steel_yield:'80-85%', lifespan:'25-30 سنة', scrap_metals:['صلب','نحاس أصفر','نحاس أحمر'] },
        { id:'container_ship', ar:'سفينة حاويات',       avg_weight:'15,000-60,000 طن', steel_yield:'85-88%', lifespan:'25-30 سنة', scrap_metals:['صلب','ألمنيوم','نحاس'] },
        { id:'cargo_ship',     ar:'سفينة شحن عامة',    avg_weight:'10,000-30,000 طن', steel_yield:'85-90%', lifespan:'25-35 سنة', scrap_metals:['صلب','حديد زهر','نحاس'] },
        { id:'offshore',       ar:'منصة بحرية',         avg_weight:'5,000-50,000 طن',  steel_yield:'75-85%', lifespan:'30-40 سنة', scrap_metals:['صلب عالي المقاومة','نحاس','تيتانيوم'] },
        { id:'naval',          ar:'سفينة عسكرية',       avg_weight:'3,000-15,000 طن',  steel_yield:'80-85%', lifespan:'30-40 سنة', scrap_metals:['صلب مدرع','نحاس','ألمنيوم بحري'] },
    ],
    // أنواع الطائرات القابلة للتشليح
    aircraft_types: [
        { id:'narrow_body', ar:'طائرة ضيقة البدن',   examples:'B737, A320',      avg_weight:'40-80 طن',  aluminum_yield:'65-70%', lifespan:'25-30 سنة', scrap_metals:['ألمنيوم 2024/7075','تيتانيوم','نيكل','نحاس','صلب'] },
        { id:'wide_body',   ar:'طائرة عريضة البدن',  examples:'B777, A330, A380', avg_weight:'130-280 طن', aluminum_yield:'60-65%', lifespan:'25-30 سنة', scrap_metals:['ألمنيوم','تيتانيوم','كربون فايبر','نيكل','صلب'] },
        { id:'cargo_ac',    ar:'طائرة شحن',         examples:'B747F, A330F',     avg_weight:'170-200 طن', aluminum_yield:'60-65%', lifespan:'30-35 سنة', scrap_metals:['ألمنيوم','صلب','تيتانيوم'] },
        { id:'helicopter',  ar:'مروحية',            examples:'Bell, Airbus H',   avg_weight:'2-10 طن',   aluminum_yield:'50-60%', lifespan:'20-30 سنة', scrap_metals:['ألمنيوم','تيتانيوم','كربون','مغنيسيوم'] },
        { id:'military_ac', ar:'طائرة عسكرية',      examples:'F-15, Typhoon',    avg_weight:'15-30 طن',  aluminum_yield:'40-50%', lifespan:'30-40 سنة', scrap_metals:['تيتانيوم','ألمنيوم','نيكل فائق','صلب مارجنغ'] },
    ],
    // عمليات الفك والتجميع
    dismantling_process: [
        { step:1, ar:'الفحص والتقييم',       en:'Inspection',      description:'تقييم هيكلي وبيئي شامل — تحديد المواد الخطرة والمعادن القابلة للاسترداد', duration:'1-2 أسبوع' },
        { step:2, ar:'إزالة المواد الخطرة',   en:'Hazmat Removal',  description:'إزالة الأسبستوس والزيوت والوقود والمواد الكيميائية — السلامة أولاً', duration:'1-3 أسابيع' },
        { step:3, ar:'تجريد المكونات',        en:'Stripping',       description:'فك المحركات والمعدات الإلكترونية والأسلاك والأنابيب', duration:'2-4 أسابيع' },
        { step:4, ar:'القطع والفصل',         en:'Cutting',         description:'قطع الهيكل بالحرارة أو الميكانيكي — فصل المعادن حسب النوع', duration:'4-12 أسبوع' },
        { step:5, ar:'الفرز والتصنيف',       en:'Sorting',         description:'فرز المعادن حسب النوع والدرجة — تصنيف HS Code', duration:'1-2 أسبوع' },
        { step:6, ar:'الكبس والتجهيز',       en:'Processing',      description:'كبس وتقطيع وتجهيز المعادن للنقل والصهر', duration:'1-2 أسبوع' },
        { step:7, ar:'الإدخال في سلسلة الإمداد', en:'Supply Chain',  description:'بيع المعادن المفرزة — ربط بالمصاهر والمصانع عبر شيخة', duration:'فوري' },
    ],
    scrap_categories_from_vessels: [
        { id:'hull_steel',     ar:'صلب الهيكل',         hs:'7204.49', grade:'HMS 1/2', price_range:'250-400 $/طن', purity:'95-98%' },
        { id:'ship_copper',    ar:'نحاس بحري',          hs:'7404.00', grade:'Birch Cliff', price_range:'5,000-8,000 $/طن', purity:'85-95%' },
        { id:'ship_aluminum',  ar:'ألمنيوم بحري',        hs:'7602.00', grade:'Taint/Tabor', price_range:'800-1,500 $/طن', purity:'90-95%' },
        { id:'ship_brass',     ar:'نحاس أصفر بحري',      hs:'7404.00', grade:'Yellow Brass', price_range:'3,000-5,000 $/طن', purity:'60-70%' },
        { id:'stainless_ship', ar:'ستانلس ستيل بحري',    hs:'7204.21', grade:'304/316', price_range:'600-1,200 $/طن', purity:'70-85%' },
        { id:'cable_wire',     ar:'أسلاك وكيابل',        hs:'7404.00', grade:'Mixed Cable', price_range:'2,000-5,000 $/طن', purity:'30-85%' },
    ],
    scrap_categories_from_aircraft: [
        { id:'ac_aluminum',    ar:'ألمنيوم طيران',       hs:'7602.00', grade:'2024/7075', price_range:'2,000-4,000 $/طن', purity:'90-95%' },
        { id:'ac_titanium',    ar:'تيتانيوم طيران',      hs:'8108.30', grade:'Ti-6Al-4V', price_range:'8,000-15,000 $/طن', purity:'85-95%' },
        { id:'ac_nickel',      ar:'نيكل فائق',          hs:'7502.20', grade:'Inconel/Waspaloy', price_range:'10,000-25,000 $/طن', purity:'60-80%' },
        { id:'ac_carbon',      ar:'كربون فايبر',         hs:'6815.10', grade:'CFRP', price_range:'5,000-12,000 $/طن', purity:'varies' },
        { id:'ac_engine',      ar:'محركات (معادن مختلطة)', hs:'8411.99', grade:'Mixed Super Alloy', price_range:'15,000-50,000 $/محرك', purity:'mixed' },
    ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// ▌ القسم ٢: سلسلة الكتلة الرقمية — Blockchain لكل معدن من خام إلى منتج
// ═══════════════════════════════════════════════════════════════════════════════

const BLOCKCHAIN_CHAINS = {
    // سلاسل المعادن الأساسية مع HS Codes
    chains: [
        {
            id: 'iron_steel',
            ar: 'سلسلة الحديد والصلب',
            stages: [
                { stage:'خام حديد',       hs:'2601',    process:'استخراج',        node:'mine' },
                { stage:'حديد مختزل DRI',  hs:'7203',    process:'اختزال مباشر',    node:'smelter' },
                { stage:'صلب خام',         hs:'7206',    process:'صهر وتكرير',     node:'smelter' },
                { stage:'سبائك صلب',       hs:'7207',    process:'صب مستمر',       node:'factory' },
                { stage:'صفائح مسطحة',     hs:'7208-7212',process:'درفلة',          node:'factory' },
                { stage:'قضبان وأعمدة',    hs:'7213-7215',process:'درفلة طولية',    node:'factory' },
                { stage:'أنابيب',          hs:'7304-7306',process:'تشكيل',          node:'factory' },
                { stage:'حديد تسليح',      hs:'7214',    process:'درفلة + تشكيل',   node:'factory' },
                { stage:'هياكل معدنية',    hs:'7308',    process:'لحام + تجميع',    node:'factory' },
                { stage:'سكراب حديد',      hs:'7204',    process:'جمع + فرز',      node:'recycler' },
            ],
        },
        {
            id: 'copper',
            ar: 'سلسلة النحاس',
            stages: [
                { stage:'خام نحاس',        hs:'2603',    process:'استخراج',        node:'mine' },
                { stage:'نحاس خام مصهور',   hs:'7401',    process:'صهر',           node:'smelter' },
                { stage:'نحاس مكرر',        hs:'7403',    process:'تكرير كهربائي',  node:'smelter' },
                { stage:'أسلاك نحاس',       hs:'7408',    process:'سحب',           node:'factory' },
                { stage:'أنابيب نحاس',      hs:'7411',    process:'بثق',           node:'factory' },
                { stage:'صفائح نحاس',       hs:'7409',    process:'درفلة',          node:'factory' },
                { stage:'سكراب نحاس',       hs:'7404',    process:'جمع + فرز',     node:'recycler' },
            ],
        },
        {
            id: 'aluminum',
            ar: 'سلسلة الألمنيوم',
            stages: [
                { stage:'بوكسيت',           hs:'2606',    process:'استخراج',        node:'mine' },
                { stage:'ألومينا',           hs:'2818.20', process:'عملية باير',     node:'smelter' },
                { stage:'ألمنيوم أولي',      hs:'7601',    process:'تحليل كهربائي',  node:'smelter' },
                { stage:'سبائك ألمنيوم',     hs:'7601.20', process:'سبك',           node:'factory' },
                { stage:'صفائح ألمنيوم',     hs:'7606',    process:'درفلة',          node:'factory' },
                { stage:'بثق ألمنيوم',       hs:'7604',    process:'بثق',           node:'factory' },
                { stage:'ألمنيوم طيران',     hs:'7606.12', process:'معالجة حرارية',  node:'factory' },
                { stage:'علب وعبوات',        hs:'7612',    process:'تشكيل',          node:'factory' },
                { stage:'سكراب ألمنيوم',     hs:'7602',    process:'جمع + فرز',     node:'recycler' },
            ],
        },
        {
            id: 'precious',
            ar: 'سلسلة المعادن الثمينة',
            stages: [
                { stage:'خام ذهب/فضة',      hs:'2616',    process:'استخراج',        node:'mine' },
                { stage:'تركيز الخام',       hs:'2616.90', process:'طحن + تعويم',    node:'smelter' },
                { stage:'سبائك ذهب خام',     hs:'7108.12', process:'صهر',           node:'smelter' },
                { stage:'ذهب مكرر 999.9',   hs:'7108.13', process:'تكرير كهربائي',  node:'smelter' },
                { stage:'سبائك مسكوكة',      hs:'7108.13', process:'صب + ختم',      node:'factory' },
                { stage:'مجوهرات ذهب',       hs:'7113.19', process:'تشكيل + ترصيع', node:'factory' },
                { stage:'ذهب صناعي',        hs:'7108.13', process:'سحب + رقائق',   node:'factory' },
                { stage:'سكراب ذهب',         hs:'7112.91', process:'جمع + فحص',    node:'recycler' },
            ],
            sub_chains: {
                diamond: [
                    { stage:'ألماس خام',     hs:'7102.10', process:'استخراج',        node:'mine' },
                    { stage:'ألماس مقطوع',   hs:'7102.31', process:'قطع + تلميع',    node:'factory', use:'مجوهرات وزينة' },
                    { stage:'ألماس صناعي',   hs:'7102.21', process:'تقطيع صناعي',    node:'factory', use:'حفر وقطع صناعي' },
                    { stage:'أدوات ألماس',   hs:'8207.19', process:'تثبيت + تجميع',  node:'factory', use:'حفر آبار ومناجم' },
                ],
                silver: [
                    { stage:'خام فضة',        hs:'2616.10', process:'استخراج',       node:'mine' },
                    { stage:'فضة مكررة',      hs:'7106.91', process:'تكرير',         node:'smelter' },
                    { stage:'مجوهرات فضة',    hs:'7113.11', process:'تشكيل',         node:'factory' },
                    { stage:'فضة صناعية',     hs:'7106.92', process:'تشكيل صناعي',   node:'factory', use:'إلكترونيات + طب' },
                ],
                platinum: [
                    { stage:'خام بلاتين',     hs:'2616.90', process:'استخراج',       node:'mine' },
                    { stage:'بلاتين مكرر',    hs:'7110.11', process:'تكرير',         node:'smelter' },
                    { stage:'محولات حفازة',    hs:'8421.39', process:'تصنيع',         node:'factory', use:'سيارات' },
                    { stage:'مجوهرات بلاتين',  hs:'7113.19', process:'تشكيل',         node:'factory' },
                ],
            }
        },
        {
            id: 'scrap_recycling',
            ar: 'سلسلة التشليح وإعادة التدوير',
            stages: [
                { stage:'مصدر السكراب',     hs:'various', process:'جمع أولي',       node:'recycler', sources:['مصانع','مواني','سفن','طائرات','سيارات','بناء','إلكترونيات'] },
                { stage:'تجميع وفرز',       hs:'various', process:'فرز يدوي/آلي',   node:'warehouse' },
                { stage:'كبس وتجهيز',       hs:'various', process:'كبس + تقطيع',    node:'warehouse' },
                { stage:'نقل للمصهر',        hs:'various', process:'شحن',           node:'transport' },
                { stage:'صهر وتكرير',       hs:'varies',  process:'صهر',            node:'smelter' },
                { stage:'سبائك ثانوية',     hs:'varies',  process:'صب',             node:'factory' },
                { stage:'منتج نهائي',       hs:'varies',  process:'تصنيع',           node:'factory' },
            ],
            scrap_sources_detail: {
                ships:    { ar:'تشليح السفن',     avg_yield:'85% صلب + 3% نحاس + 2% ألمنيوم', global_volume:'700+ سفينة/سنة' },
                aircraft: { ar:'تشليح الطائرات',   avg_yield:'65% ألمنيوم + 10% تيتانيوم + 5% نيكل', global_volume:'800+ طائرة/سنة' },
                vehicles: { ar:'تشليح السيارات',   avg_yield:'75% صلب + 8% ألمنيوم + 3% نحاس', global_volume:'27M سيارة/سنة عالمياً' },
                factories:{ ar:'نفايات المصانع',    avg_yield:'varies', global_volume:'600M طن/سنة عالمياً' },
                buildings:{ ar:'هدم المباني',       avg_yield:'90% صلب + 5% نحاس', global_volume:'1B+ طن/سنة عالمياً' },
            }
        },
    ],
    // هيكل كتلة البيانات
    block_structure: {
        fields: ['blockId','timestamp','productId','hsCode','stage','fromNode','toNode','quantity','unit','quality','certifications','location','hash','previousHash','verifiedBy'],
        consensus: 'Proof of Authority (PoA) — موثوق وسريع للبيانات التجارية',
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ▌ القسم ٣: وكلاء الذكاء الاصطناعي — AI Agents
// ═══════════════════════════════════════════════════════════════════════════════

const AI_AGENTS = {
    agents: [
        { id:'market_analyst',   ar:'محلل السوق',        role:'تحليل العرض والطلب والأسعار — تنبؤات وتوصيات', capabilities:['تحليل اتجاهات','تنبؤ أسعار','فجوات السوق','فرص الاستثمار'] },
        { id:'quality_inspector',ar:'مفتش الجودة',       role:'فحص المنتجات رقمياً — مطابقة المواصفات', capabilities:['فحص النقاوة','تحقق HS Code','مطابقة الشهادات','كشف الغش'] },
        { id:'supply_optimizer', ar:'محسّن سلسلة الإمداد', role:'تحسين المسارات والتكاليف والمخزون', capabilities:['تحسين المسارات','إدارة المخزون','توقع الطلب','تقليل التكاليف'] },
        { id:'trust_evaluator',  ar:'مقيّم الثقة',        role:'تقييم التجار بمعايير الصدق والأمانة', capabilities:['تحليل سلوك','كشف أنماط الغش','تقييم شامل','إنذار مبكر'] },
        { id:'contract_agent',   ar:'وكيل العقود',        role:'إنشاء ومراجعة العقود الإلكترونية الشرعية', capabilities:['صياغة عقود','مراجعة شرعية','تنفيذ آلي','حل نزاعات'] },
        { id:'logistics_agent',  ar:'وكيل اللوجستيات',    role:'إدارة الشحن والنقل والتوصيل', capabilities:['حجز شحنات','تتبع لحظي','تخليص جمركي','توثيق'] },
        { id:'marketing_agent',  ar:'وكيل التسويق',       role:'إنشاء حملات وتحسين الأداء التسويقي', capabilities:['إنشاء محتوى','استهداف ذكي','تحسين حملات','تحليل أداء'] },
        { id:'finance_agent',    ar:'وكيل المالية',       role:'إدارة المدفوعات والتسويات والتقارير المالية', capabilities:['فوترة آلية','تسوية','تقارير مالية','حساب زكاة'] },
        { id:'port_agent',       ar:'وكيل الموانئ',       role:'إدارة عمليات الاستيراد والتصدير والتشليح البحري', capabilities:['تخليص جمركي','حجز حاويات','تقييم سفن','إدارة أرصفة'] },
        { id:'recycling_agent',  ar:'وكيل إعادة التدوير', role:'تقييم وتصنيف السكراب — ربط بالمصاهر', capabilities:['تصنيف سكراب','تقدير قيمة','ربط مصاهر','تقييم بيئي'] },
    ],
    generative_capabilities: [
        'توليد تقارير سوقية تلقائية بالعربية',
        'إنشاء عقود إلكترونية شرعية مخصصة',
        'توليد وصف منتجات تسويقي بالذكاء الاصطناعي',
        'إنشاء دراسات جدوى أولية لمشاريع المعادن',
        'توليد تقارير مالية ومحاسبية دورية',
        'إنشاء خطط تسويقية مخصصة لكل تاجر',
        'توليد مواصفات فنية للمنتجات',
    ],
    quran: '﴿ إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ ﴾ — النحل: ٩٠'
};

// ═══════════════════════════════════════════════════════════════════════════════
// ▌ القسم ٤: القيمة التنافسية والمحاسبة والمبيعات الرقمية
// ═══════════════════════════════════════════════════════════════════════════════

const COMPETITIVE_VALUE = {
    advantages: [
        { id:'first_islamic',    ar:'أول سوق إسلامي للمعادن',     weight:0.20, description:'لا يوجد منافس في السوق الإسلامي المتكامل للمعادن' },
        { id:'supply_chain',     ar:'تكامل سلسلة الإمداد',        weight:0.20, description:'من المنجم للمصنع — كل المراحل في منصة واحدة' },
        { id:'trust_system',     ar:'نظام الصدق والأمانة',        weight:0.15, description:'تقييم مبتكر مبني على القرآن والسنة' },
        { id:'arabic_first',     ar:'العربية أولاً',              weight:0.10, description:'أول منصة معادن بواجهة عربية كاملة مع 15 لغة' },
        { id:'saudi_focus',      ar:'تركيز سعودي',               weight:0.10, description:'فهم عميق للسوق السعودي — مصاهر، موانئ، مناجم' },
        { id:'ai_powered',       ar:'ذكاء اصطناعي',              weight:0.10, description:'10 وكلاء ذكيين لأتمتة العمليات التجارية' },
        { id:'low_commission',   ar:'عمولة منخفضة',              weight:0.08, description:'1-2% مقابل 5-10% في المنصات التقليدية' },
        { id:'blockchain',       ar:'سلسلة كتلة شفافة',          weight:0.07, description:'تتبع كل منتج من المصدر للمشتري النهائي' },
    ],
    competitors: [
        { name:'MetalBulletin',   type:'دولي',  strength:'بيانات أسعار', weakness:'لا تداول، لا عربي', gap:'سوق إسلامي متكامل' },
        { name:'Alibaba Metals',  type:'دولي',  strength:'حجم ضخم',     weakness:'لا تخصص معادن، لا شرعي', gap:'تقييم شرعي' },
        { name:'ScrapMonster',    type:'دولي',  strength:'سكراب',       weakness:'لا عربي، لا سلسلة إمداد', gap:'تكامل' },
        { name:'حراج',           type:'سعودي', strength:'محلي',        weakness:'عام، لا تخصص، لا تقييم', gap:'كل شيء' },
    ]
};

const DIGITAL_SALES = {
    models: [
        { id:'spot',       ar:'بيع فوري',        description:'بيع مباشر بسعر السوق — تنفيذ فوري' },
        { id:'auction',    ar:'مزاد إلكتروني',    description:'مزاد شفاف — أعلى سعر يربح' },
        { id:'rfq',        ar:'طلب عرض سعر',     description:'المشتري يطلب — التجار يقدمون عروضهم' },
        { id:'contract',   ar:'عقد توريد',        description:'عقد طويل الأجل — كميات وأسعار ثابتة' },
        { id:'tender',     ar:'مناقصة',           description:'عطاء رسمي — الأفضل جودةً وسعراً يربح' },
        { id:'negotiate',  ar:'تفاوض مباشر',      description:'محادثة مباشرة بين البائع والمشتري' },
    ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// ▌ القسم ٥: إدارة الأصول والشاحنات والمعدات الرقمية
// ═══════════════════════════════════════════════════════════════════════════════

const DIGITAL_ASSETS = {
    asset_types: [
        { id:'trucks',      ar:'شاحنات',          subtypes:['تريلا','قلاب','مسطح','مبرد','صهريج','حامل حاويات'], kpis:['km/day','loadFactor','fuelEfficiency','maintenanceCost'] },
        { id:'containers',   ar:'حاويات',          subtypes:['20ft','40ft','40ft HC','Open Top','Flat Rack','Reefer'], kpis:['utilizationRate','turnaroundTime','damageRate','location'] },
        { id:'equipment',    ar:'معدات ثقيلة',      subtypes:['حفار','رافعة','لودر','بلدوزر','كسارة','خلاط'], kpis:['operatingHours','efficiency','maintenanceCost','downtime'] },
        { id:'cranes',       ar:'رافعات',          subtypes:['برجية','متحركة','جسرية','ميناء','شوكية'], kpis:['liftCapacity','operatingHours','safetyScore'] },
        { id:'scales',       ar:'موازين',          subtypes:['جسرية','منصة','رقمية','محمولة'], kpis:['accuracy','calibrationDate','capacity','lastCheck'] },
        { id:'warehouses',   ar:'مخازن',           subtypes:['مغلق','مفتوح','مبرد','خطر','مؤقت'], kpis:['capacityUsed','temperature','humidity','securityLevel'] },
    ],
    lifecycle: ['شراء/إيجار','تسجيل','تشغيل','صيانة دورية','إصلاح','تقييم','إعادة استخدام','تشليح'],
    quran: '﴿ وَلَا تُبَذِّرْ تَبْذِيرًا ﴾ — الإسراء: ٢٦',
};

// ═══════════════════════════════════════════════════════════════════════════════
// ▌ القسم ٦: الدراسات والتخطيط الاستراتيجي ونموذج العمل
// ═══════════════════════════════════════════════════════════════════════════════

const STUDIES_SYSTEM = {
    types: [
        {
            id: 'market_study', ar: 'دراسة سوقية رقمية',
            sections: ['حجم السوق','النمو المتوقع','الشرائح المستهدفة','المنافسون','الفجوات','SWOT','الأسعار','قنوات التوزيع','البيئة التنظيمية'],
            output: 'تقرير رقمي تفاعلي مع بيانات حية من سوق شيخة',
        },
        {
            id: 'competitive_study', ar: 'دراسة تنافسية رقمية',
            sections: ['خريطة المنافسين','نقاط القوة/الضعف','الحصة السوقية','استراتيجيات التسعير','القيمة المميزة','فرص التفوق'],
        },
        {
            id: 'economic_study', ar: 'دراسة اقتصادية',
            sections: ['التكلفة الاستثمارية','التكاليف التشغيلية','الإيرادات المتوقعة','نقطة التعادل','العائد على الاستثمار ROI','القيمة الحالية NPV','معدل العائد الداخلي IRR'],
        },
        {
            id: 'technical_study', ar: 'دراسة فنية',
            sections: ['المواصفات الفنية','المعدات المطلوبة','القدرة الإنتاجية','المواد الخام','العمالة','الموقع','البنية التحتية'],
        },
        {
            id: 'financial_study', ar: 'دراسة مالية',
            sections: ['التدفقات النقدية','الميزانية العمومية','قائمة الدخل','النسب المالية','التمويل','الزكاة','تحليل الحساسية'],
        },
        {
            id: 'feasibility', ar: 'دراسة جدوى شاملة',
            sections: ['ملخص تنفيذي','الدراسة السوقية','الدراسة الفنية','الدراسة المالية','الدراسة البيئية','المخاطر','التوصيات'],
        },
        {
            id: 'execution_plan', ar: 'خطة تنفيذية',
            sections: ['المراحل','الجدول الزمني','الموارد','الميزانية','المسؤوليات','مؤشرات الأداء','المخاطر','خطة الطوارئ'],
        },
    ],
    strategic_planning: {
        frameworks: ['SWOT','Porter\'s Five Forces','BCG Matrix','Ansoff Matrix','Blue Ocean','Balanced Scorecard'],
        vision_template: 'أن نكون المرجع العالمي لتجارة المعادن العادلة والأمينة — بإذن الله',
        mission_template: 'ربط تجار المعادن بالصدق والأمانة عبر سوق رقمي متكامل يعمّر الأرض',
    },
    business_model: {
        canvas: {
            value_propositions: ['سوق معادن إسلامي متكامل','سلسلة إمداد شفافة','تقييم بالصدق والأمانة','عمولة منخفضة 1-2%'],
            customer_segments: ['شركات التعدين','المصاهر','تجار السكراب','المصانع','شركات المقاولات','شركات النقل','الحكومة'],
            channels: ['المنصة الرقمية','واتساب','لينكدإن','المعارض','فريق المبيعات'],
            revenue_streams: ['عمولة المعاملات 1-2%','اشتراكات مميزة','خدمات لوجستية','خدمات تسويقية','إعلانات','بيانات وتحليلات'],
            key_resources: ['المنصة التقنية','128 محرك ذكي','قاعدة بيانات التجار','الشبكة اللوجستية','العلامة التجارية'],
            key_activities: ['تطوير المنصة','اكتساب التجار','إدارة العمليات','ضمان الجودة','الدعم'],
            key_partners: ['موانئ','مصاهر','شركات نقل','بنوك إسلامية','هيئات حكومية'],
            cost_structure: ['تطوير تقني','تسويق','فريق عمل','بنية تحتية','تراخيص'],
        },
        hadith: '«البيّعان بالخيار ما لم يتفرقا فإن صدقا وبيّنا بورك لهما» — متفق عليه',
    },
    admin_org: {
        departments: [
            { id:'ceo',        ar:'الإدارة العليا',     roles:['الرئيس التنفيذي','مستشار شرعي'] },
            { id:'tech',       ar:'التقنية',           roles:['مدير تقني','مطور أول','مطور واجهات','DevOps','أمن معلومات'] },
            { id:'operations', ar:'العمليات',          roles:['مدير عمليات','إدارة السوق','إدارة الجودة','دعم العملاء'] },
            { id:'marketing',  ar:'التسويق والمبيعات', roles:['مدير تسويق','مسؤول محتوى','مسؤول مبيعات','مدير شراكات'] },
            { id:'finance',    ar:'المالية',           roles:['مدير مالي','محاسب','مدقق شرعي'] },
            { id:'logistics',  ar:'اللوجستيات',        roles:['مدير لوجستيات','مسؤول شحن','مسؤول جمارك'] },
        ],
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ▌ القسم ٧: خطة الولاء والهوية الرقمية والبوت
// ═══════════════════════════════════════════════════════════════════════════════

const LOYALTY_SYSTEM = {
    tiers: [
        { level:1, ar:'برونزي',   min_points:0,     benefits:['عمولة قياسية 2%','دعم عام','تقارير أساسية'] },
        { level:2, ar:'فضي',     min_points:1000,  benefits:['عمولة 1.5%','دعم أولوية','تقارير متقدمة','تنبيهات أسعار'] },
        { level:3, ar:'ذهبي',    min_points:5000,  benefits:['عمولة 1%','مدير حساب','تحليلات AI','أولوية في العروض'] },
        { level:4, ar:'بلاتيني', min_points:15000, benefits:['عمولة 0.5%','مدير حساب خاص','تقارير مخصصة','دعوة معارض','أولوية مطلقة'] },
        { level:5, ar:'التاجر الصدوق الأمين', min_points:50000, benefits:['عمولة 0%','شريك استراتيجي','علامة ذهبية','أولوية في كل شيء','وسام شيخة'] },
    ],
    points_system: [
        { action:'تسجيل حساب',       points:100 },
        { action:'إضافة منتج',       points:50 },
        { action:'إتمام صفقة',       points:200 },
        { action:'تقييم إيجابي',      points:30 },
        { action:'إحالة تاجر جديد',   points:500 },
        { action:'إتمام عقد توريد',   points:1000 },
    ],
    hadith: '«من دلّ على خير فله مثل أجر فاعله» — مسلم',
};

const IDENTITY_BOT = {
    fields: [
        { id:'company_name',    ar:'اسم المنشأة',       auto_source:'السجل التجاري' },
        { id:'cr_number',       ar:'رقم السجل التجاري',  auto_source:'السجل التجاري' },
        { id:'activity',        ar:'النشاط التجاري',     auto_source:'السجل التجاري' },
        { id:'owner_name',      ar:'اسم المالك',        auto_source:'السجل التجاري' },
        { id:'national_id',     ar:'رقم الهوية',        auto_source:'أبشر/نفاذ' },
        { id:'address',         ar:'العنوان الوطني',     auto_source:'العنوان الوطني' },
        { id:'phone',           ar:'الجوال',            auto_source:'إدخال يدوي' },
        { id:'email',           ar:'البريد الإلكتروني',  auto_source:'إدخال يدوي' },
        { id:'bank_iban',       ar:'الآيبان',           auto_source:'البنك' },
        { id:'vat_number',      ar:'الرقم الضريبي',     auto_source:'هيئة الزكاة' },
        { id:'logo',            ar:'الشعار',            auto_source:'رفع' },
        { id:'specialty',       ar:'التخصص في المعادن',  auto_source:'اختيار' },
    ],
    auto_fill_platforms: [
        'اعتماد — المشتريات الحكومية',
        'قوى — وزارة الموارد البشرية',
        'مقيم — وزارة الداخلية',
        'موقي — المدن الصناعية',
        'الغرف التجارية',
        'LinkedIn — الملف التجاري',
        'Google Business — ملف النشاط',
    ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// ▌ القسم ٨: إدارة المشاريع والهندسة الرقمية وأدوات التصميم
// ═══════════════════════════════════════════════════════════════════════════════

const PROJECT_MANAGEMENT = {
    methodologies: ['Agile/Scrum','Waterfall','Kanban','Hybrid','PRINCE2'],
    tools: [
        { id:'gantt',        ar:'مخطط جانت',      description:'جدول زمني بصري لمراحل المشروع' },
        { id:'kanban',       ar:'لوحة كانبان',     description:'إدارة المهام — قيد العمل، قيد المراجعة، مكتمل' },
        { id:'wbs',          ar:'هيكل تجزئة العمل', description:'WBS — تقسيم المشروع لحزم عمل' },
        { id:'risk_register',ar:'سجل المخاطر',     description:'تحديد وتقييم وإدارة المخاطر' },
        { id:'budget_track', ar:'تتبع الميزانية',   description:'مقارنة التكاليف الفعلية بالمخطط' },
        { id:'milestones',   ar:'المعالم الرئيسية', description:'نقاط مرجعية لقياس التقدم' },
        { id:'resource_mgmt',ar:'إدارة الموارد',    description:'تخصيص الموارد البشرية والمادية' },
        { id:'reports',      ar:'تقارير الأداء',    description:'تقارير أسبوعية/شهرية — التقدم والمخاطر' },
    ],
    hadith: '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه» — البيهقي',
};

const DIGITAL_ENGINEERING = {
    tools: [
        { id:'cad',          ar:'تصميم هندسي CAD',       description:'رسم ثنائي وثلاثي الأبعاد للهياكل المعدنية' },
        { id:'fea',          ar:'تحليل العناصر المحدودة',  description:'FEA — محاكاة الإجهاد والتشوه' },
        { id:'process_sim',  ar:'محاكاة العمليات',        description:'محاكاة عمليات الصهر والدرفلة والصب' },
        { id:'material_db',  ar:'قاعدة بيانات المواد',    description:'خصائص المعادن والسبائك — ميكانيكية وكيميائية' },
        { id:'quality_ctrl', ar:'ضبط الجودة الإحصائي',    description:'SPC — مراقبة جودة الإنتاج' },
        { id:'maintenance',  ar:'صيانة تنبؤية',          description:'IoT + AI لتوقع الأعطال قبل حدوثها' },
        { id:'energy_mgmt',  ar:'إدارة الطاقة',          description:'مراقبة وتحسين استهلاك الطاقة' },
        { id:'safety',       ar:'السلامة الصناعية',       description:'تحليل المخاطر وإجراءات السلامة' },
    ],
};

const DESIGN_TOOLS = {
    tools: [
        { id:'brand_kit',     ar:'مجموعة الهوية البصرية', description:'شعار + ألوان + خطوط + أنماط' },
        { id:'brochure',      ar:'بروشور رقمي',          description:'منشور تسويقي قابل للطباعة والمشاركة' },
        { id:'social_media',  ar:'تصميمات التواصل',       description:'قوالب لجميع المنصات — X, LinkedIn, WhatsApp' },
        { id:'business_card', ar:'بطاقة عمل رقمية',      description:'بطاقة عمل تفاعلية بكود QR' },
        { id:'catalog',       ar:'كتالوج منتجات',        description:'كتالوج رقمي احترافي للمنتجات' },
        { id:'presentation',  ar:'عرض تقديمي',           description:'عرض تقديمي لاجتماعات المستثمرين والشركاء' },
        { id:'email_sig',     ar:'توقيع بريد إلكتروني',   description:'توقيع احترافي للبريد الإلكتروني' },
        { id:'invoice',       ar:'فواتير احترافية',       description:'قوالب فواتير متوافقة مع هيئة الزكاة' },
    ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// ▌ واجهات API
// ═══════════════════════════════════════════════════════════════════════════════

// ─── الميناء الرقمي ───
app.get('/api/port/dashboard', (req, res) => {
    res.json({
        success: true,
        ports: { saudi: DIGITAL_PORT.saudi_ports, international: DIGITAL_PORT.international_ports },
        vesselTypes: DIGITAL_PORT.vessel_types,
        aircraftTypes: DIGITAL_PORT.aircraft_types,
        dismantlingProcess: DIGITAL_PORT.dismantling_process,
        scrapFromVessels: DIGITAL_PORT.scrap_categories_from_vessels,
        scrapFromAircraft: DIGITAL_PORT.scrap_categories_from_aircraft,
        quran: '﴿ وَالْفُلْكِ الَّتِي تَجْرِي فِي الْبَحْرِ بِمَا يَنفَعُ النَّاسَ ﴾ — البقرة: ١٦٤',
    });
});

app.get('/api/port/saudi', (req, res) => {
    res.json({ success: true, ports: DIGITAL_PORT.saudi_ports });
});

app.get('/api/port/vessels', (req, res) => {
    res.json({ success: true, vesselTypes: DIGITAL_PORT.vessel_types, dismantling: DIGITAL_PORT.dismantling_process });
});

app.get('/api/port/aircraft', (req, res) => {
    res.json({ success: true, aircraftTypes: DIGITAL_PORT.aircraft_types, scrap: DIGITAL_PORT.scrap_categories_from_aircraft });
});

app.get('/api/port/scrap-categories', (req, res) => {
    res.json({ success: true, fromVessels: DIGITAL_PORT.scrap_categories_from_vessels, fromAircraft: DIGITAL_PORT.scrap_categories_from_aircraft });
});

// ─── سلسلة الكتلة ───
app.get('/api/blockchain/chains', (req, res) => {
    res.json({
        success: true,
        chains: BLOCKCHAIN_CHAINS.chains.map(c => ({
            id: c.id, ar: c.ar,
            stageCount: c.stages.length,
            stages: c.stages,
            subChains: c.sub_chains ? Object.keys(c.sub_chains) : [],
        })),
        blockStructure: BLOCKCHAIN_CHAINS.block_structure,
        totalChains: BLOCKCHAIN_CHAINS.chains.length,
    });
});

app.get('/api/blockchain/chain/:id', (req, res) => {
    const chain = BLOCKCHAIN_CHAINS.chains.find(c => c.id === req.params.id);
    if (!chain) return res.status(404).json({ success: false, message: 'سلسلة غير موجودة' });
    res.json({ success: true, chain });
});

app.get('/api/blockchain/flow/:metalId', (req, res) => {
    const chain = BLOCKCHAIN_CHAINS.chains.find(c => c.id === req.params.metalId);
    if (!chain) return res.status(404).json({ success: false, message: 'معدن غير موجود' });
    const flow = chain.stages.map((s, i) => ({
        order: i + 1,
        ...s,
        next: chain.stages[i + 1] ? chain.stages[i + 1].stage : 'نهاية السلسلة',
    }));
    res.json({ success: true, metal: chain.ar, flow, totalStages: flow.length });
});

// ─── وكلاء الذكاء الاصطناعي ───
app.get('/api/ai-agents', (req, res) => {
    res.json({
        success: true,
        agents: AI_AGENTS.agents,
        generativeCapabilities: AI_AGENTS.generative_capabilities,
        totalAgents: AI_AGENTS.agents.length,
        quran: AI_AGENTS.quran,
    });
});

app.get('/api/ai-agents/:id', (req, res) => {
    const agent = AI_AGENTS.agents.find(a => a.id === req.params.id);
    if (!agent) return res.status(404).json({ success: false, message: 'الوكيل غير موجود' });
    res.json({ success: true, agent });
});

// ─── القيمة التنافسية ───
app.get('/api/competitive-value', (req, res) => {
    res.json({
        success: true,
        advantages: COMPETITIVE_VALUE.advantages,
        competitors: COMPETITIVE_VALUE.competitors,
        salesModels: DIGITAL_SALES.models,
    });
});

// ─── إدارة الأصول الرقمية ───
app.get('/api/assets/dashboard', (req, res) => {
    res.json({
        success: true,
        assetTypes: DIGITAL_ASSETS.asset_types,
        lifecycle: DIGITAL_ASSETS.lifecycle,
        quran: DIGITAL_ASSETS.quran,
    });
});

app.get('/api/assets/trucks', (req, res) => {
    const truckType = DIGITAL_ASSETS.asset_types.find(a => a.id === 'trucks');
    res.json({ success: true, trucks: truckType });
});

app.get('/api/assets/equipment', (req, res) => {
    const equipType = DIGITAL_ASSETS.asset_types.find(a => a.id === 'equipment');
    res.json({ success: true, equipment: equipType });
});

// ─── الدراسات والتخطيط ───
app.get('/api/studies', (req, res) => {
    res.json({
        success: true,
        studyTypes: STUDIES_SYSTEM.types,
        strategicPlanning: STUDIES_SYSTEM.strategic_planning,
        totalTypes: STUDIES_SYSTEM.types.length,
    });
});

app.get('/api/studies/business-model', (req, res) => {
    res.json({
        success: true,
        canvas: STUDIES_SYSTEM.business_model.canvas,
        hadith: STUDIES_SYSTEM.business_model.hadith,
    });
});

app.get('/api/studies/admin-org', (req, res) => {
    res.json({
        success: true,
        departments: STUDIES_SYSTEM.admin_org.departments,
    });
});

app.get('/api/studies/:type', (req, res) => {
    const study = STUDIES_SYSTEM.types.find(s => s.id === req.params.type);
    if (!study) return res.status(404).json({ success: false, message: 'نوع الدراسة غير موجود' });
    res.json({ success: true, study });
});

// ─── الولاء ───
app.get('/api/loyalty/program', (req, res) => {
    res.json({
        success: true,
        tiers: LOYALTY_SYSTEM.tiers,
        pointsSystem: LOYALTY_SYSTEM.points_system,
        hadith: LOYALTY_SYSTEM.hadith,
    });
});

// ─── الهوية الرقمية / البوت ───
app.get('/api/identity-bot/fields', (req, res) => {
    res.json({
        success: true,
        fields: IDENTITY_BOT.fields,
        autoFillPlatforms: IDENTITY_BOT.auto_fill_platforms,
    });
});

// ─── إدارة المشاريع ───
app.get('/api/project-management/tools', (req, res) => {
    res.json({
        success: true,
        methodologies: PROJECT_MANAGEMENT.methodologies,
        tools: PROJECT_MANAGEMENT.tools,
        hadith: PROJECT_MANAGEMENT.hadith,
    });
});

// ─── الهندسة الرقمية ───
app.get('/api/engineering/tools', (req, res) => {
    res.json({
        success: true,
        tools: DIGITAL_ENGINEERING.tools,
    });
});

// ─── أدوات التصميم ───
app.get('/api/design/tools', (req, res) => {
    res.json({
        success: true,
        tools: DESIGN_TOOLS.tools,
    });
});

// ─── ملخص شامل ───
app.get('/api/digital-ops/overview', (req, res) => {
    res.json({
        success: true,
        overview: {
            ports: { saudi: DIGITAL_PORT.saudi_ports.length, international: DIGITAL_PORT.international_ports.length },
            blockchainChains: BLOCKCHAIN_CHAINS.chains.length,
            aiAgents: AI_AGENTS.agents.length,
            competitiveAdvantages: COMPETITIVE_VALUE.advantages.length,
            salesModels: DIGITAL_SALES.models.length,
            assetTypes: DIGITAL_ASSETS.asset_types.length,
            studyTypes: STUDIES_SYSTEM.types.length,
            loyaltyTiers: LOYALTY_SYSTEM.tiers.length,
            pmTools: PROJECT_MANAGEMENT.tools.length,
            engineeringTools: DIGITAL_ENGINEERING.tools.length,
            designTools: DESIGN_TOOLS.tools.length,
        },
        ip: {
            owner: 'سلمان أحمد بن سلمان الراجح',
            brand: 'شيخة — Sheikha',
            copyright: '© 2026 — جميع الحقوق محفوظة',
        },
        quran: '﴿ هُوَ أَنشَأَكُم مِّنَ الْأَرْضِ وَاسْتَعْمَرَكُمْ فِيهَا ﴾ — هود: ٦١',
        hadith: '«التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ» — الترمذي',
    });
});

console.log('✅ [DigitalOps] محرك العمليات الرقمية الشامل — مفعّل');
console.log('   🚢 الميناء الرقمي: ' + DIGITAL_PORT.saudi_ports.length + ' ميناء سعودي | ' + DIGITAL_PORT.vessel_types.length + ' نوع سفينة | ' + DIGITAL_PORT.aircraft_types.length + ' نوع طائرة');
console.log('   ⛓  سلسلة الكتلة: ' + BLOCKCHAIN_CHAINS.chains.length + ' سلسلة معدنية');
console.log('   🤖 وكلاء AI: ' + AI_AGENTS.agents.length + ' وكيل ذكي');
console.log('   📊 الدراسات: ' + STUDIES_SYSTEM.types.length + ' نوع دراسة');
console.log('   🏆 الولاء: ' + LOYALTY_SYSTEM.tiers.length + ' مستوى');
console.log('   🛠  الأصول: ' + DIGITAL_ASSETS.asset_types.length + ' فئة | هندسة: ' + DIGITAL_ENGINEERING.tools.length + ' أداة | تصميم: ' + DESIGN_TOOLS.tools.length + ' أداة');
console.log('   📡 APIs: /api/port/*, /api/blockchain/*, /api/ai-agents/*, /api/competitive-value, /api/assets/*, /api/studies/*, /api/loyalty/*, /api/engineering/*, /api/design/*, /api/digital-ops/*');

};
