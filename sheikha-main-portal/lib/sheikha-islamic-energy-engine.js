/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║   محرك الطاقة الإسلامية المتجددة — شيخة                ║
 * ║   الطاقة نعمة — لا إسراف ولا إفساد في الأرض           ║
 * ║   المرحلة ١٧ من منظومة شيخة الاقتصادية الإسلامية       ║
 * ╚══════════════════════════════════════════════════════════╝
 * ﴿وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا﴾ — الأعراف ٥٦
 */

'use strict';

// ══ مصادر الطاقة المتجددة الإسلامية ══
const RENEWABLE_SOURCES = [
    {
        id: 'solar',
        name: 'الطاقة الشمسية',
        arabic: 'نور الشمس — آية من آيات الله',
        icon: '☀️',
        quran: '﴿وَجَعَلَ الشَّمْسَ سِرَاجًا﴾',
        capacity_gw: 480,
        oic_potential_tw: 12.4,
        cost_usd_kwh: 0.025,
        countries_leading: ['السعودية', 'الإمارات', 'مصر', 'المغرب', 'إيران'],
        projects: [
            { name: 'نيوم — مشروع شمسي ٢٠٠ GW', country: 'السعودية', capacity_gw: 200 },
            { name: 'محطة بن راشد الشمسية', country: 'الإمارات', capacity_gw: 5 },
            { name: 'مشروع نور ورزازات', country: 'المغرب', capacity_gw: 0.58 },
            { name: 'محطة بنبان', country: 'مصر', capacity_gw: 1.65 },
        ]
    },
    {
        id: 'wind',
        name: 'طاقة الرياح',
        arabic: 'الرياح رحمة — مسخرة بأمر الله',
        icon: '💨',
        quran: '﴿وَأَرْسَلْنَا الرِّيَاحَ لَوَاقِحَ﴾',
        capacity_gw: 95,
        oic_potential_tw: 5.8,
        cost_usd_kwh: 0.03,
        countries_leading: ['تركيا', 'إيران', 'المغرب', 'باكستان', 'إندونيسيا'],
        projects: [
            { name: 'مزرعة رياح طفيلة', country: 'الأردن', capacity_mw: 117 },
            { name: 'مشروع زاهدان الريحي', country: 'إيران', capacity_mw: 600 },
            { name: 'ماسدار الرياح البحرية', country: 'الإمارات', capacity_mw: 500 },
        ]
    },
    {
        id: 'hydro',
        name: 'الطاقة المائية',
        arabic: 'الماء أصل كل حياة',
        icon: '💧',
        quran: '﴿وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ﴾',
        capacity_gw: 220,
        oic_potential_tw: 1.9,
        cost_usd_kwh: 0.04,
        countries_leading: ['تركيا', 'إيران', 'ماليزيا', 'إندونيسيا', 'مصر'],
        projects: [
            { name: 'سد الرنة', country: 'تركيا', capacity_gw: 1.3 },
            { name: 'سد أسوان', country: 'مصر', capacity_gw: 2.1 },
            { name: 'سد باكون', country: 'ماليزيا', capacity_mw: 2400 },
        ]
    },
    {
        id: 'geothermal',
        name: 'الطاقة الحرارية الأرضية',
        arabic: 'حرارة الأرض — كنز لم يُستغل',
        icon: '🌋',
        quran: '﴿أَلَمْ نَجْعَلِ الْأَرْضَ مِهَادًا﴾',
        capacity_gw: 18,
        oic_potential_gw: 120,
        cost_usd_kwh: 0.045,
        countries_leading: ['إندونيسيا', 'تركيا', 'ماليزيا'],
        projects: [
            { name: 'لاهيندونج الجيوحرارية', country: 'إندونيسيا', capacity_mw: 130 },
            { name: 'كيزيلدر الجيوحراري', country: 'تركيا', capacity_mw: 95 },
        ]
    },
    {
        id: 'hydrogen',
        name: 'الهيدروجين الأخضر',
        arabic: 'وقود المستقبل — بلا انبعاثات',
        icon: '⚗️',
        quran: '﴿إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَعْقِلُونَ﴾',
        capacity_gw: 5,
        oic_target_mt_2035: 22,
        cost_usd_kg: 2.5,
        countries_leading: ['السعودية', 'الإمارات', 'مصر', 'المغرب'],
        projects: [
            { name: 'مشروع نيوم — هيدروجين أخضر', country: 'السعودية', capacity_mt_yr: 1.2 },
            { name: 'مشروع الجبيل الأخضر', country: 'السعودية', capacity_mt_yr: 0.6 },
        ]
    }
];

// ══ مبادئ الطاقة الإسلامية ══
const ISLAMIC_ENERGY_PRINCIPLES = [
    {
        id: 'no_waste',
        name: 'لا إسراف',
        arabic: 'تحريم الإسراف في الطاقة',
        quran: '﴿وَلَا تُسْرِفُوا إِنَّهُ لَا يُحِبُّ الْمُسْرِفِينَ﴾ — الأنعام ١٤١',
        application: 'ترشيد استهلاك الطاقة — أولوية الكفاءة',
        rule: 'mandatory'
    },
    {
        id: 'no_corruption',
        name: 'لا إفساد في الأرض',
        arabic: 'حماية البيئة فريضة إسلامية',
        quran: '﴿وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا﴾ — الأعراف ٥٦',
        application: 'تفضيل مصادر نظيفة — رفض المصادر الضارة',
        rule: 'mandatory'
    },
    {
        id: 'stewardship',
        name: 'الاستخلاف',
        arabic: 'المسلم مستخلف في الأرض',
        quran: '﴿وَهُوَ الَّذِي جَعَلَكُمْ خَلَائِفَ الْأَرْضِ﴾ — الأنعام ١٦٥',
        application: 'إدارة الموارد الطبيعية بأمانة وحكمة',
        rule: 'mandatory'
    },
    {
        id: 'justice',
        name: 'العدل في التوزيع',
        arabic: 'الطاقة حق لكل مسلم فقير',
        quran: '﴿إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ﴾ — النحل ٩٠',
        application: 'ضمان وصول الطاقة للفقراء — لا احتكار',
        rule: 'mandatory'
    },
    {
        id: 'reflection',
        name: 'التدبر في الآيات الكونية',
        arabic: 'الطاقة آية من آيات الله',
        quran: '﴿أَفَلَا يَنظُرُونَ إِلَى الْإِبِلِ كَيْفَ خُلِقَتْ﴾ — تمثيل التدبر',
        application: 'العلم والبحث في الطاقة عبادة',
        rule: 'recommended'
    },
    {
        id: 'cooperation',
        name: 'التعاون الإسلامي',
        arabic: 'وحدة الطاقة لوحدة الأمة',
        quran: '﴿وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى﴾ — المائدة ٢',
        application: 'شبكات طاقة إسلامية مشتركة — OIC Grid',
        rule: 'recommended'
    }
];

// ══ إحصائيات الطاقة في دول OIC ══
const OIC_ENERGY_STATS = {
    total_installed_gw: 1420,
    renewable_gw: 380,
    renewable_pct: 26.8,
    population_without_electricity_m: 380,
    co2_reduction_target_mt_2030: 450,
    investment_needed_usd_b: 2800,
    gdp_energy_sector_usd_b: 1200,
    oil_gas_revenues_usd_b: 890,
    regions: [
        { name: 'الخليج العربي', solar_potential: 'عالي جداً', installed_gw: 45, target_gw_2030: 180 },
        { name: 'شمال أفريقيا', solar_potential: 'عالي جداً', installed_gw: 28, target_gw_2030: 120 },
        { name: 'جنوب شرق آسيا', hydro_potential: 'عالي', installed_gw: 210, target_gw_2030: 380 },
        { name: 'آسيا الوسطى', wind_potential: 'عالي', installed_gw: 35, target_gw_2030: 95 },
        { name: 'تركيا وجنوب أوروبا الإسلامي', mix_potential: 'متنوع', installed_gw: 62, target_gw_2030: 140 },
    ]
};

// ══ مشاريع الطاقة الإسلامية الكبرى ══
const MEGA_PROJECTS = [
    {
        id: 'neom_solar',
        name: 'مشروع نيوم الشمسي الضخم',
        country: 'المملكة العربية السعودية',
        type: 'solar + hydrogen',
        capacity: '200 GW شمسي + 1.2M طن هيدروجين/سنة',
        investment_usd_b: 500,
        completion: 2030,
        vision: 'أكبر مشروع طاقة متجددة في التاريخ',
        islamic_value: 'خدمة الحرمين والأمة الإسلامية'
    },
    {
        id: 'oic_grid',
        name: 'شبكة الكهرباء الإسلامية الموحدة',
        countries: '57 دولة OIC',
        type: 'smart grid',
        capacity: '500 GW مشترك',
        investment_usd_b: 1200,
        completion: 2035,
        vision: 'ربط شبكات الطاقة بين دول العالم الإسلامي',
        islamic_value: 'وِحدة الأمة — تعاون اقتصادي'
    },
    {
        id: 'morocco_solar',
        name: 'بوابة المغرب الشمسية لأفريقيا',
        country: 'المغرب',
        type: 'solar + export',
        capacity: '52 GW + تصدير لأوروبا وأفريقيا',
        investment_usd_b: 78,
        completion: 2030,
        vision: 'مركز طاقة إسلامي-أفريقي',
        islamic_value: 'نشر الخير في القارة الأفريقية'
    },
    {
        id: 'indonesia_geo',
        name: 'الجيوحراري الإندونيسي',
        country: 'إندونيسيا',
        type: 'geothermal',
        capacity: '22 GW احتياطي + 8 GW مخطط',
        investment_usd_b: 45,
        completion: 2032,
        vision: 'أكبر دولة مسلمة تقود الطاقة الجيوحرارية',
        islamic_value: 'الاستفادة من نعم الله في الأرض الإندونيسية'
    }
];

// ══ المحرك الرئيسي ══
class SheikhaIslamicEnergyEngine {
    constructor() {
        this.name = 'محرك الطاقة الإسلامية المتجددة';
        this.phase = 17;
        this.isActive = false;
        this.basmala = 'بسم الله الرحمن الرحيم';
        this.quranVerse = '﴿وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا﴾';
    }

    start() {
        this.isActive = true;
        console.log(`\n╔══ ${this.name} ══╗`);
        console.log(`║ ${this.basmala}`);
        console.log(`║ ${this.quranVerse}`);
        console.log(`║ ${RENEWABLE_SOURCES.length} مصادر طاقة | ${MEGA_PROJECTS.length} مشاريع كبرى | ${OIC_ENERGY_STATS.total_installed_gw} GW إجمالي`);
        console.log('╚' + '═'.repeat(42) + '╝\n');
        return this;
    }

    getStatus() {
        return {
            engine: this.name,
            phase: this.phase,
            active: this.isActive,
            sources_count: RENEWABLE_SOURCES.length,
            principles_count: ISLAMIC_ENERGY_PRINCIPLES.length,
            mega_projects: MEGA_PROJECTS.length,
            total_installed_gw: OIC_ENERGY_STATS.total_installed_gw,
            renewable_pct: OIC_ENERGY_STATS.renewable_pct,
            quran: this.quranVerse
        };
    }

    getOverview() {
        return {
            ...OIC_ENERGY_STATS,
            vision: 'طاقة نظيفة لكل مسلم — بدون إسراف ولا إفساد',
            sources_count: RENEWABLE_SOURCES.length,
            principles_count: ISLAMIC_ENERGY_PRINCIPLES.length
        };
    }

    getSources() {
        return RENEWABLE_SOURCES;
    }

    getPrinciples() {
        return ISLAMIC_ENERGY_PRINCIPLES;
    }

    getMegaProjects() {
        return MEGA_PROJECTS;
    }

    getRegions() {
        return OIC_ENERGY_STATS.regions;
    }

    calculateProjectROI(investmentUsd, capacityGw, years = 25, utilization = 0.25) {
        // حساب العائد على استثمار مشروع طاقة
        const annualKwh = capacityGw * 1e9 * 8760 * utilization;
        const pricePerKwh = 0.04; // USD متوسط
        const annualRevenue = annualKwh * pricePerKwh;
        const totalRevenue = annualRevenue * years;
        const roi = ((totalRevenue - investmentUsd) / investmentUsd) * 100;
        const payback_years = investmentUsd / annualRevenue;
        return {
            investment_usd: investmentUsd,
            capacity_gw: capacityGw,
            annual_kwh: Math.round(annualKwh),
            annual_revenue_usd: Math.round(annualRevenue),
            total_revenue_usd: Math.round(totalRevenue),
            roi_pct: Math.round(roi * 10) / 10,
            payback_years: Math.round(payback_years * 10) / 10,
            co2_saved_tons_yr: Math.round(annualKwh * 0.0004),
            note: 'تقدير للمعرفة فقط — الطاقة أمانة وليست مجرد ربح'
        };
    }
}

const islamicEnergyEngine = new SheikhaIslamicEnergyEngine();
module.exports = islamicEnergyEngine;
