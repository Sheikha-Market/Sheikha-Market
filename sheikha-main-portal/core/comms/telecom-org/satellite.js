/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SATELLITE NETWORKS — الشبكات الفضائية                                      ║
 * ║                                                                              ║
 * ║  تصنيف كامل للشبكات الفضائية:                                               ║
 * ║  • GEO (ثابت)  • MEO (متوسط)  • LEO (منخفض)  • HEO (إهليجي)              ║
 * ║  • طيران  • سفن  • GPS/GNSS  • الاتصالات الدفاعية                          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَهُوَ الَّذِي جَعَلَ لَكُمُ النُّجُومَ لِتَهْتَدُوا بِهَا" — الأنعام:٩٧
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// مدارات الأقمار الصناعية
// ═══════════════════════════════════════════════════════════════
const SATELLITE_ORBITS = {

    // ─── LEO — المدار الأرضي المنخفض ─────────────────────────
    LEO: {
        id:          'LEO',
        nameAr:      'المدار الأرضي المنخفض',
        nameEn:      'Low Earth Orbit',
        icon:        '🛸',
        altitude_km: '200 – 2,000',
        period:      '90 – 128 دقيقة',
        latency:     '20 – 50ms',
        coverage:    'عالمي (بمجموعات constellations)',
        examples: {
            STARLINK:   { operator: 'SpaceX', sats: 5000, speed: '50-200 Mbps', use: 'إنترنت للمناطق النائية' },
            ONEWEB:     { operator: 'Eutelsat OneWeb', sats: 648, speed: '100 Mbps', use: 'اتصالات جوية وبحرية' },
            IRIDIUM:    { operator: 'Iridium', sats: 66, use: 'هاتف فضائي عالمي', coverage: 'قطبي كامل' },
            O3B_MEO:    { operator: 'SES', note: 'MEO مُدرج هنا للمقارنة', speed: '400 Mbps' },
        },
        best_for:   ['الإنترنت عالي السرعة', 'الطيران المدني', 'السفن', 'المناطق النائية'],
        quran_ref:  { ref: 'الملك:٥', text: 'وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ' },
    },

    // ─── MEO — المدار الأرضي المتوسط ─────────────────────────
    MEO: {
        id:          'MEO',
        nameAr:      'المدار الأرضي المتوسط',
        nameEn:      'Medium Earth Orbit',
        icon:        '🌐',
        altitude_km: '2,000 – 35,786',
        period:      '2 – 24 ساعة',
        latency:     '100 – 300ms',
        coverage:    'واسع — يحتاج عدداً أقل من الأقمار',
        examples: {
            GPS:        { operator: 'USA DoD', sats: 31, use: 'الملاحة العالمية' },
            GALILEO:    { operator: 'ESA', sats: 30, use: 'ملاحة أوروبية' },
            GLONASS:    { operator: 'Russia', sats: 24, use: 'ملاحة روسية' },
            BEIDOU:     { operator: 'China', sats: 35, use: 'ملاحة صينية — LEO+MEO+GEO' },
            O3B:        { operator: 'SES O3B', sats: 20, speed: '400 Mbps', use: 'إنترنت سرعة عالية' },
        },
        best_for:   ['الملاحة (GPS)', 'إنترنت التأخير المنخفض', 'المناطق المتوسطة'],
        quran_ref:  { ref: 'يونس:٥', text: 'هُوَ الَّذِي جَعَلَ الشَّمْسَ ضِيَاءً وَالْقَمَرَ نُورًا وَقَدَّرَهُ مَنَازِلَ' },
    },

    // ─── GEO — المدار الثابت بالنسبة للأرض ──────────────────
    GEO: {
        id:          'GEO',
        nameAr:      'المدار الثابت الجغرافي',
        nameEn:      'Geostationary Orbit',
        icon:        '🛰️',
        altitude_km: '35,786',
        period:      '24 ساعة (يبدو ثابتاً)',
        latency:     '500 – 700ms',
        coverage:    'ثلث الكرة الأرضية لكل قمر',
        examples: {
            ARABSAT:    { operator: 'Arabsat', sats: 8, region: 'الشرق الأوسط + أفريقيا', use: 'بث فضائي + إنترنت VSAT' },
            INTELSAT:   { operator: 'Intelsat', sats: 50, use: 'اتصالات دولية' },
            SES:        { operator: 'SES Astra', sats: 70, use: 'بث مباشر' },
            EUTELSAT:   { operator: 'Eutelsat', sats: 36, use: 'بث + إنترنت' },
            THURAYA:    { operator: 'Thuraya (موبايلي)', sats: 2, use: 'هاتف فضائي الشرق الأوسط' },
        },
        best_for:   ['البث الفضائي', 'VSAT الثابت', 'الاتصالات الريفية'],
        ksa_partner: 'Arabsat — القاهرة / المنطقة العربية',
        quran_ref:  { ref: 'الأنبياء:٣٣', text: 'وَهُوَ الَّذِي خَلَقَ اللَّيْلَ وَالنَّهَارَ وَالشَّمْسَ وَالْقَمَرَ' },
    },

    // ─── HEO — المدار الإهليجي العالي ────────────────────────
    HEO: {
        id:          'HEO',
        nameAr:      'المدار الإهليجي',
        nameEn:      'Highly Elliptical Orbit',
        icon:        '🪐',
        altitude_km: '500 – 50,000 (متغير)',
        latency:     '100 – 600ms (متغير)',
        coverage:    'تغطية ممتازة للمناطق القطبية',
        examples: {
            MOLNIYA:   { operator: 'Russia', use: 'تغطية القطب الشمالي' },
            SIRIUS_XM: { operator: 'SiriusXM', use: 'راديو فضائي أمريكا الشمالية' },
        },
        best_for:   ['المناطق القطبية', 'خطوط العرض العليا'],
    },
};

// ═══════════════════════════════════════════════════════════════
// تطبيقات الأقمار الصناعية حسب القطاع
// ═══════════════════════════════════════════════════════════════
const SATELLITE_SECTORS = {

    // ─── قطاع الطيران ─────────────────────────────────────────
    AVIATION: {
        id:     'SAT_AVIATION',
        nameAr: 'الأقمار الصناعية للطيران',
        nameEn: 'Aviation Satellite Communications',
        icon:   '✈️',
        systems: {
            INMARSAT_SWIFT:  { nameAr: 'Inmarsat SwiftBroadband', speed: '432 kbps – 1.7 Mbps', orbit: 'GEO', use: 'صوت + بيانات للطائرات' },
            INMARSAT_GX:     { nameAr: 'Inmarsat Global Xpress (GX)', speed: '50 Mbps', orbit: 'GEO', use: 'إنترنت للركاب' },
            VIASAT_IFC:      { nameAr: 'ViaSat In-Flight Connectivity', speed: '100 Mbps', orbit: 'GEO/LEO', use: 'واي فاي على متن الطائرة' },
            ONEWEB_AVIATION: { nameAr: 'OneWeb Aviation', speed: '100-200 Mbps', orbit: 'LEO', use: 'إنترنت منخفض التأخير للطيران' },
            SATCOM_VHF:      { nameAr: 'SATCOM VHF — ACARS فضائي', speed: 'منخفض', orbit: 'GEO', use: 'رسائل بيانات الطيران ACARS' },
        },
        standards: ['ARINC 741', 'DO-160', 'ICAO Annex 10'],
        regulatory: 'ICAO + GACA (هيئة الطيران المدني السعودية)',
        quran_ref: { ref: 'الملك:١٩', text: 'أَوَلَمْ يَرَوْا إِلَى الطَّيْرِ فَوْقَهُمْ صَافَّاتٍ وَيَقْبِضْنَ' },
    },

    // ─── قطاع السفن والبحر ────────────────────────────────────
    MARITIME: {
        id:     'SAT_MARITIME',
        nameAr: 'الأقمار الصناعية للسفن والبحر',
        nameEn: 'Maritime Satellite Communications',
        icon:   '🚢',
        systems: {
            INMARSAT_FLEET:  { nameAr: 'Inmarsat Fleet Xpress', speed: '100 Mbps', orbit: 'GEO', use: 'اتصالات السفن التجارية' },
            INMARSAT_FLEET_77: { nameAr: 'Fleet 77 / F33', speed: '128 kbps', orbit: 'GEO', use: 'سفن أصغر + صيد' },
            VSAT_MARITIME:   { nameAr: 'VSAT البحري', speed: '2-20 Mbps', orbit: 'GEO', use: 'الإنترنت على السفن الكبيرة' },
            STARLINK_MARITIME:{ nameAr: 'Starlink Maritime', speed: '100-350 Mbps', orbit: 'LEO', use: 'إنترنت فائق السرعة للسفن' },
            IRIDIUM_CERTUS:  { nameAr: 'Iridium Certus Maritime', speed: '700 kbps', orbit: 'LEO', use: 'تغطية قطبية للسفن' },
        },
        emergency: {
            EPIRB: { nameAr: 'EPIRB — إشارة الاستغاثة البحرية', orbit: 'COSPAS-SARSAT (LEO+GEO)', use: 'إنقاذ حوادث السفن' },
            GMDSS: { nameAr: 'GMDSS — نظام نجدة الاستغاثة البحري', use: 'الاتصال الإلزامي للسلامة' },
        },
        standards: ['SOLAS Chapter IV', 'IMO', 'ITU-R M.823'],
        regulatory: 'IMO + PMSA (الرئاسة العامة للأرصاد وحماية البيئة)',
        quran_ref: { ref: 'يونس:٢٢', text: 'هُوَ الَّذِي يُسَيِّرُكُمْ فِي الْبَرِّ وَالْبَحْرِ' },
    },

    // ─── GPS / GNSS الملاحة ───────────────────────────────────
    GNSS_NAVIGATION: {
        id:     'SAT_GNSS',
        nameAr: 'أنظمة الملاحة العالمية GNSS',
        nameEn: 'Global Navigation Satellite Systems',
        icon:   '🗺️',
        systems: {
            GPS:     { country: 'أمريكا',  sats: 31, accuracy: '3m / 30cm RTK',  orbit: 'MEO', frequency: 'L1/L2/L5' },
            GALILEO: { country: 'أوروبا', sats: 30, accuracy: '1m',              orbit: 'MEO', frequency: 'E1/E5/E6' },
            GLONASS: { country: 'روسيا',  sats: 24, accuracy: '3-5m',            orbit: 'MEO', frequency: 'L1/L2' },
            BEIDOU:  { country: 'الصين',   sats: 35, accuracy: '2.5m',            orbit: 'LEO+MEO+GEO' },
            NAVIC:   { country: 'الهند',   sats: 7,  accuracy: '5m',              orbit: 'GEO+GSO', region: 'شبه القارة الهندية' },
            QZSS:    { country: 'اليابان', sats: 4,  accuracy: '1cm RTK',         orbit: 'QZO', region: 'آسيا والمحيط الهادئ' },
        },
        use_case: ['ملاحة الطيران', 'السفن', 'المركبات', 'الهواتف', 'اللوجستيات', 'البناء الدقيق'],
        augmentation: {
            SBAS: { nameAr: 'SBAS — تعزيز قاعدة الأرض', accuracy: '1-3m' },
            WAAS: { nameAr: 'WAAS — نظام تعزيز أمريكا الشمالية', accuracy: '1-3m' },
            EGNOS:{ nameAr: 'EGNOS — أوروبا', accuracy: '1-3m' },
        },
        quran_ref: { ref: 'الأنعام:٩٧', text: 'وَهُوَ الَّذِي جَعَلَ لَكُمُ النُّجُومَ لِتَهْتَدُوا بِهَا' },
    },

    // ─── الاستشعار عن بُعد ───────────────────────────────────
    EARTH_OBSERVATION: {
        id:     'SAT_EO',
        nameAr: 'الاستشعار عن بُعد',
        nameEn: 'Earth Observation / Remote Sensing',
        icon:   '🔭',
        systems: {
            SENTINEL:   { operator: 'ESA', use: 'رصد البيئة والمحاصيل' },
            LANDSAT:    { operator: 'USGS/NASA', use: 'خرائط الأراضي والمناخ' },
            SPOT:       { operator: 'Airbus', use: 'التصوير التجاري عالي الدقة' },
            PLANET:     { operator: 'Planet Labs', sats: '200+', resolution: '3m', cadence: 'يومي' },
            KSA_SAT:    { operator: 'KACST / Saudi Aramco', nameAr: 'أقمار سعودية للرصد', use: 'رصد النفط والزراعة والبيئة' },
        },
        use_case: ['الزراعة الدقيقة', 'مراقبة الحدود', 'البيئة', 'الكوارث', 'التخطيط العمراني'],
        quran_ref: { ref: 'الغاشية:١٧-٢٠', text: 'أَفَلَا يَنظُرُونَ إِلَى الْإِبِلِ كَيْفَ خُلِقَتْ' },
    },

    // ─── البث الفضائي ────────────────────────────────────────
    BROADCAST: {
        id:     'SAT_BROADCAST',
        nameAr: 'البث الفضائي',
        nameEn: 'Direct Broadcast Satellite',
        icon:   '📺',
        systems: {
            ARABSAT_BADR:  { orbit: 'GEO 26°E', channels: '550+', use: 'تلفزيون عربي — MBC / روتانا / بين سبورت' },
            ARABSAT_BADR6: { orbit: 'GEO 26°E', tech: 'DVB-S2X', use: 'HDTV + 4K' },
            NILESAT:       { orbit: 'GEO 7°W', channels: '400+', region: 'شمال أفريقيا + الشرق الأوسط' },
        },
        standards: ['DVB-S', 'DVB-S2', 'DVB-S2X', 'DVB-RCS'],
        ksa_operator: 'Arabsat — مملوكة جزئياً للمملكة',
        quran_ref: { ref: 'الحجرات:٦', text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِن جَاءَكُمْ فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا' },
    },
};

// ═══════════════════════════════════════════════════════════════
// API
// ═══════════════════════════════════════════════════════════════
function getSatelliteNetworks() {
    return {
        domain:    'SATELLITE',
        nameAr:    'الشبكات الفضائية',
        icon:      '🛰️',
        orbits:    Object.values(SATELLITE_ORBITS),
        sectors:   Object.values(SATELLITE_SECTORS),
        summary: {
            orbits_count:  Object.keys(SATELLITE_ORBITS).length,
            sectors_count: Object.keys(SATELLITE_SECTORS).length,
            total_sats_approx: '6,000+ قمر في المدار حالياً',
        },
        verse: { ref: 'الأنعام:٩٧', text: 'وَهُوَ الَّذِي جَعَلَ لَكُمُ النُّجُومَ لِتَهْتَدُوا بِهَا' },
    };
}

function getSatOrbit(orbitKey) {
    return SATELLITE_ORBITS[orbitKey.toUpperCase()] || null;
}

function getSatSector(sectorKey) {
    return SATELLITE_SECTORS[sectorKey.toUpperCase()] || null;
}

module.exports = {
    SATELLITE_ORBITS,
    SATELLITE_SECTORS,
    getSatelliteNetworks,
    getSatOrbit,
    getSatSector,
};
