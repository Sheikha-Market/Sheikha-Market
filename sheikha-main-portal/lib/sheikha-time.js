/**
 * بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
 * ══════════════════════════════════════════════════════════════════════
 * SHEIKHA — منظومة التوقيت الكوني الشامل
 * المرحلة ٥٢ — مزامنة الزمن بالكتاب والسنة
 * ══════════════════════════════════════════════════════════════════════
 * "وَهُوَ الَّذِي جَعَلَ اللَّيْلَ وَالنَّهَارَ خِلْفَةً لِّمَنْ أَرَادَ أَن يَذَّكَّرَ" — الفرقان:62
 * "يَسْأَلُونَكَ عَنِ الأَهِلَّةِ قُلْ هِيَ مَوَاقِيتُ لِلنَّاسِ وَالْحَجِّ" — البقرة:189
 *
 * المالك: سلمان أحمد بن سلمان الراجح — لا تعديل بدون إذن صريح
 * ══════════════════════════════════════════════════════════════════════
 */

'use strict';
const { EventEmitter } = require('events');

// ══════════════════════════════════════════════════════════════════════
// I. التقاويم عبر التاريخ — كل تقويم استُخدم أو توقف
// ══════════════════════════════════════════════════════════════════════
const CALENDARS = {
    // ─── إسلامية ──────────────────────────────────────────────────────
    hijri_lunar: {
        id: 'hijri_lunar',
        name_ar: 'التقويم الهجري القمري',
        name_en: 'Islamic Hijri Lunar',
        origin: 'الهجرة النبوية — 622 م',
        epoch_hijri: 1,
        epoch_miladi: 622,
        basis: 'القمر — الأهلة',
        quran_ref: 'يَسْأَلُونَكَ عَنِ الأَهِلَّةِ قُلْ هِيََ مَوَاقِيتُ لِلنَّاسِ وَالحَجِّ — البقرة:189',
        months_ar: ['مُحَرَّم','صَفَر','رَبِيع الأَوَّل','رَبِيع الثَّانِي','جُمَادَى الأُولَى','جُمَادَى الآخِرَة','رَجَب','شَعْبَان','رَمَضَان','شَوَّال','ذُو القَعْدَة','ذُو الحِجَّة'],
        days_per_year: 354.367,
        status: 'active',
        used_in: 'جميع الدول الإسلامية — العبادات والمواقيت الشرعية'
    },
    hijri_solar: {
        id: 'hijri_solar',
        name_ar: 'التقويم الهجري الشمسي (الإيراني/الأفغاني)',
        name_en: 'Solar Hijri (Persian)',
        origin: 'إيران وأفغانستان',
        epoch_miladi: 622,
        basis: 'الشمس — من الهجرة',
        months_ar: ['فَرْوَرْدِين','اُردِيبِهِشْت','خُرداد','تِير','مُرداد','شَهْرِيوَر','مِهْر','آبان','آذَر','دَي','بَهْمَن','اِسفَند'],
        status: 'active',
        used_in: 'إيران، أفغانستان'
    },
    // ─── ميلادية ──────────────────────────────────────────────────────
    gregorian: {
        id: 'gregorian',
        name_ar: 'التقويم الميلادي (الغريغوري)',
        name_en: 'Gregorian Calendar',
        origin: 'البابا غريغوريوس الثالث عشر — 1582م',
        basis: 'الشمس — ميلاد عيسى ابن مريم عليه السلام (تقريباً)',
        days_per_year: 365.2425,
        status: 'active_global',
        used_in: 'المعيار الدولي للتوقيت المدني'
    },
    julian: {
        id: 'julian',
        name_ar: 'التقويم اليولياني',
        name_en: 'Julian Calendar',
        origin: 'يوليوس قيصر — 46 ق.م',
        basis: 'الشمس — 365.25 يوم',
        status: 'historical_partial',
        used_in: 'الكنيسة الأرثوذكسية الشرقية — بعض الكنائس حتى الآن'
    },
    // ─── قديمة ──────────────────────────────────────────────────────
    babylonian: {
        id: 'babylonian',
        name_ar: 'التقويم البابلي',
        name_en: 'Babylonian Calendar',
        origin: 'بلاد الرافدين — ~2000 ق.م',
        basis: 'قمري-شمسي',
        status: 'extinct',
        note: 'أثّر على التقويم العبري واليوناني'
    },
    hebrew: {
        id: 'hebrew',
        name_ar: 'التقويم العبري',
        name_en: 'Hebrew Calendar',
        origin: 'اليهود — ~2ق.م مُقنَّن',
        basis: 'قمري-شمسي',
        months_en: ['Nisan','Iyar','Sivan','Tamuz','Av','Elul','Tishri','Marcheshvan','Kislev','Tevet','Shevat','Adar'],
        status: 'active',
        used_in: 'إسرائيل — الطوائف اليهودية'
    },
    coptic: {
        id: 'coptic',
        name_ar: 'التقويم القبطي',
        name_en: 'Coptic Calendar',
        origin: 'مصر — يرجع للمصرية القديمة — 284م (عصر دقلديانوس)',
        basis: 'شمسي — 365 يوم',
        status: 'active_religious',
        used_in: 'مصر — الكنيسة القبطية + بعض الفلاحين للزراعة'
    },
    ethiopian: {
        id: 'ethiopian',
        name_ar: 'التقويم الإثيوبي (جعزي)',
        name_en: 'Ethiopian Calendar',
        origin: 'إثيوبيا',
        basis: 'شمسي — 13 شهراً',
        status: 'active',
        used_in: 'إثيوبيا — يتأخر ~7-8 سنوات عن الميلادي'
    },
    chinese: {
        id: 'chinese',
        name_ar: 'التقويم الصيني',
        name_en: 'Chinese Lunisolar Calendar',
        origin: 'الصين — ~2698 ق.م (عهد الإمبراطور الأصفر)',
        basis: 'قمري-شمسي — دورات 60 عاماً',
        status: 'active_cultural',
        used_in: 'الصين، تايوان، جنوب شرق آسيا — الأعياد والسنة الجديدة'
    },
    japanese: {
        id: 'japanese',
        name_ar: 'التقويم الياباني (رِيكِي)',
        name_en: 'Japanese Imperial Calendar',
        origin: 'اليابان — عصر الإمبراطور جيمو ~660 ق.م',
        basis: 'شمسي — يُضاف عليه الميلادي بحقبة حكم الإمبراطور',
        status: 'active',
        used_in: 'اليابان رسمياً',
        current_era: 'رِيوا (Reiwa) — منذ 2019م'
    },
    korean: {
        id: 'korean',
        name_ar: 'التقويم الكوري (دانغون)',
        name_en: 'Korean Calendar (Dangun)',
        origin: 'كوريا — 2333 ق.م',
        basis: 'شمسي',
        status: 'historical_legal',
        note: 'كان رسمياً حتى 1961م، الآن للأغراض الثقافية'
    },
    indian_national: {
        id: 'indian_national',
        name_ar: 'التقويم الهندي الوطني (ساكا)',
        name_en: 'Indian National Calendar (Saka)',
        origin: 'الهند — 78م (حقبة ساكا)',
        basis: 'شمسي',
        status: 'active_official',
        used_in: 'الهند رسمياً جانب الميلادي'
    },
    thai_solar: {
        id: 'thai_solar',
        name_ar: 'التقويم التايلاندي الشمسي (BE)',
        name_en: 'Thai Solar Calendar (Buddhist Era)',
        origin: 'تايلاند — 543 ق.م (وفاة بوذا)',
        basis: 'شمسي — يتقدم 543 عاماً على الميلادي',
        status: 'active',
        used_in: 'تايلاند رسمياً'
    },
    persian_zoroastrian: {
        id: 'persian_zoroastrian',
        name_ar: 'التقويم الزرادشتي الفارسي القديم',
        name_en: 'Zoroastrian Calendar',
        origin: 'فارس القديمة',
        basis: 'شمسي — 365 يوم ثابتة',
        status: 'extinct_religious',
        used_in: 'الأقليات الزرادشتية فقط'
    },
    mayan: {
        id: 'mayan',
        name_ar: 'تقويم المايا (تسولكين + هاب)',
        name_en: 'Mayan Calendar (Tzolkin + Haab)',
        origin: 'أمريكا الوسطى — ~2000 ق.م',
        basis: 'دورتان: 260 يوم ديني + 365 يوم مدني',
        status: 'extinct_cultural',
        note: 'الحضارة انتهت — يُستخدم للدراسة فقط'
    },
    roman_republican: {
        id: 'roman_republican',
        name_ar: 'التقويم الروماني الجمهوري',
        name_en: 'Roman Republican Calendar',
        origin: 'روما القديمة — ~753 ق.م',
        status: 'extinct',
        note: 'حُوّل للتقويم اليولياني 46 ق.م'
    },
    egyptian_ancient: {
        id: 'egyptian_ancient',
        name_ar: 'التقويم المصري القديم',
        name_en: 'Ancient Egyptian Calendar',
        origin: 'مصر — ~3000 ق.م',
        basis: '12 شهر × 30 يوم + 5 أيام إضافية = 365 يوم',
        status: 'extinct',
        note: 'من أقدم التقاويم المعروفة — أثّر على التقويم اليولياني'
    },
    iso_8601: {
        id: 'iso_8601',
        name_ar: 'معيار ISO 8601',
        name_en: 'ISO 8601 Standard',
        basis: 'ميلادي موحَّد للبيانات الرقمية',
        status: 'active_digital',
        used_in: 'البرمجيات والأنظمة الرقمية عالمياً'
    }
};

// ══════════════════════════════════════════════════════════════════════
// II. مناطق التوقيت والوقت الفعلي لكل دولة
// ══════════════════════════════════════════════════════════════════════
const WORLD_TIMEZONES = {
    // ─── الجزيرة العربية ──────────────────────────────────────────────
    'SA': { name_ar: 'المملكة العربية السعودية', tz: 'Asia/Riyadh',    offset: +3,  capital: 'الرياض' },
    'AE': { name_ar: 'الإمارات العربية المتحدة', tz: 'Asia/Dubai',     offset: +4,  capital: 'أبوظبي' },
    'QA': { name_ar: 'قطر',                       tz: 'Asia/Qatar',     offset: +3,  capital: 'الدوحة' },
    'KW': { name_ar: 'الكويت',                    tz: 'Asia/Kuwait',   offset: +3,  capital: 'الكويت' },
    'BH': { name_ar: 'البحرين',                   tz: 'Asia/Bahrain',  offset: +3,  capital: 'المنامة' },
    'OM': { name_ar: 'عُمان',                      tz: 'Asia/Muscat',   offset: +4,  capital: 'مسقط' },
    'YE': { name_ar: 'اليمن',                     tz: 'Asia/Aden',     offset: +3,  capital: 'صنعاء' },
    // ─── الشام ────────────────────────────────────────────────────────
    'JO': { name_ar: 'الأردن',                    tz: 'Asia/Amman',    offset: +3,  capital: 'عمّان' },
    'SY': { name_ar: 'سوريا',                     tz: 'Asia/Damascus', offset: +3,  capital: 'دمشق' },
    'LB': { name_ar: 'لبنان',                     tz: 'Asia/Beirut',   offset: +3,  capital: 'بيروت' },
    'PS': { name_ar: 'فلسطين',                    tz: 'Asia/Gaza',     offset: +3,  capital: 'القدس الشريف' },
    'IQ': { name_ar: 'العراق',                    tz: 'Asia/Baghdad',  offset: +3,  capital: 'بغداد' },
    // ─── شمال أفريقيا ────────────────────────────────────────────────
    'EG': { name_ar: 'مصر',                       tz: 'Africa/Cairo',  offset: +3,  capital: 'القاهرة' },
    'LY': { name_ar: 'ليبيا',                     tz: 'Africa/Tripoli',offset: +2,  capital: 'طرابلس' },
    'TN': { name_ar: 'تونس',                      tz: 'Africa/Tunis',  offset: +1,  capital: 'تونس' },
    'DZ': { name_ar: 'الجزائر',                   tz: 'Africa/Algiers',offset: +1,  capital: 'الجزائر' },
    'MA': { name_ar: 'المغرب',                    tz: 'Africa/Casablanca', offset: +1, capital: 'الرباط' },
    'MR': { name_ar: 'موريتانيا',                 tz: 'Africa/Nouakchott', offset: 0, capital: 'نواكشوط' },
    'SD': { name_ar: 'السودان',                   tz: 'Africa/Khartoum',offset: +3, capital: 'الخرطوم' },
    'SO': { name_ar: 'الصومال',                   tz: 'Africa/Mogadishu',offset:+3,  capital: 'مقديشو' },
    // ─── آسيا ────────────────────────────────────────────────────────
    'TR': { name_ar: 'تركيا',                     tz: 'Europe/Istanbul',offset:+3,  capital: 'أنقرة' },
    'IR': { name_ar: 'إيران',                     tz: 'Asia/Tehran',   offset: +3.5,capital: 'طهران' },
    'PK': { name_ar: 'باكستان',                   tz: 'Asia/Karachi',  offset: +5,  capital: 'إسلام آباد' },
    'AF': { name_ar: 'أفغانستان',                 tz: 'Asia/Kabul',    offset: +4.5,capital: 'كابل' },
    'BD': { name_ar: 'بنغلاديش',                  tz: 'Asia/Dhaka',    offset: +6,  capital: 'دكا' },
    'MY': { name_ar: 'ماليزيا',                   tz: 'Asia/Kuala_Lumpur',offset:+8,capital: 'كوالالمبور' },
    'ID': { name_ar: 'إندونيسيا',                 tz: 'Asia/Jakarta',  offset: +7,  capital: 'جاكرتا' },
    'IN': { name_ar: 'الهند',                     tz: 'Asia/Kolkata',  offset: +5.5,capital: 'نيودلهي' },
    'CN': { name_ar: 'الصين',                     tz: 'Asia/Shanghai', offset: +8,  capital: 'بكين' },
    'JP': { name_ar: 'اليابان',                   tz: 'Asia/Tokyo',    offset: +9,  capital: 'طوكيو' },
    'KR': { name_ar: 'كوريا الجنوبية',            tz: 'Asia/Seoul',    offset: +9,  capital: 'سيول' },
    'KZ': { name_ar: 'كازاخستان',                 tz: 'Asia/Almaty',   offset: +6,  capital: 'أستانا' },
    'SG': { name_ar: 'سنغافورة',                  tz: 'Asia/Singapore',offset: +8,  capital: 'سنغافورة' },
    // ─── أوروبا ──────────────────────────────────────────────────────
    'GB': { name_ar: 'المملكة المتحدة',           tz: 'Europe/London', offset: 0,   capital: 'لندن' },
    'DE': { name_ar: 'ألمانيا',                   tz: 'Europe/Berlin', offset: +1,  capital: 'برلين' },
    'FR': { name_ar: 'فرنسا',                     tz: 'Europe/Paris',  offset: +1,  capital: 'باريس' },
    'RU': { name_ar: 'روسيا',                     tz: 'Europe/Moscow', offset: +3,  capital: 'موسكو' },
    // ─── أمريكا ──────────────────────────────────────────────────────
    'US': { name_ar: 'الولايات المتحدة',          tz: 'America/New_York',offset:-5, capital: 'واشنطن' },
    'BR': { name_ar: 'البرازيل',                  tz: 'America/Sao_Paulo',offset:-3,capital: 'برازيليا' },
    // ─── أفريقيا ──────────────────────────────────────────────────────
    'NG': { name_ar: 'نيجيريا',                   tz: 'Africa/Lagos',  offset: +1,  capital: 'أبوجا' },
    'ZA': { name_ar: 'جنوب أفريقيا',             tz: 'Africa/Johannesburg',offset:+2,capital:'بريتوريا' },
    'ET': { name_ar: 'إثيوبيا',                   tz: 'Africa/Addis_Ababa',offset:+3,capital:'أديس أبابا' },
    'SN': { name_ar: 'السنغال',                   tz: 'Africa/Dakar',  offset: 0,   capital: 'داكار' },
};

// ══════════════════════════════════════════════════════════════════════
// III. أوقات الصلاة — الأساس الشرعي + طرق الحساب
// ══════════════════════════════════════════════════════════════════════
const PRAYER_METHODS = {
    umm_al_qura: {
        id: 'umm_al_qura',
        name_ar: 'أم القرى — المملكة العربية السعودية',
        fajr_angle: 18.5,
        isha_angle: null,
        isha_minutes: 90,
        used_in: 'المملكة العربية السعودية'
    },
    mwl: {
        id: 'mwl',
        name_ar: 'رابطة العالم الإسلامي',
        fajr_angle: 18,
        isha_angle: 17,
        used_in: 'معظم الدول الإسلامية'
    },
    isna: {
        id: 'isna',
        name_ar: 'الجمعية الإسلامية لأمريكا الشمالية',
        fajr_angle: 15,
        isha_angle: 15,
        used_in: 'أمريكا الشمالية'
    },
    egypt: {
        id: 'egypt',
        name_ar: 'الهيئة المصرية العامة للمساحة',
        fajr_angle: 19.5,
        isha_angle: 17.5,
        used_in: 'مصر'
    },
    kuwait: {
        id: 'kuwait',
        name_ar: 'الكويت',
        fajr_angle: 18,
        isha_angle: 17.5,
        used_in: 'الكويت'
    },
    qatar: {
        id: 'qatar',
        name_ar: 'قطر',
        fajr_angle: 18,
        isha_angle: null,
        isha_minutes: 90,
        used_in: 'قطر'
    }
};

// الأدلة الشرعية لأوقات الصلاة
const PRAYER_QURAN_REFS = {
    fajr:   'وَأَقِمِ الصَّلاةَ طَرَفَيِ النَّهارِ — هود:114 | وَقُرْآنَ الفَجْرِ إِنَّ قُرْآنَ الفَجْرِ كانَ مَشْهُودًا — الإسراء:78',
    dhuhr:  'أَقِمِ الصَّلاةَ لِدُلُوكِ الشَّمْسِ — الإسراء:78',
    asr:    'حَافِظُوا عَلَى الصَّلَوَاتِ والصَّلاةِ الوُسْطَى — البقرة:238',
    maghrib:'وَطَرَفَيِ النَّهارِ وَزُلَفًا مِنَ اللَّيْلِ — هود:114',
    isha:   'وَمِن بَعدِ صَلاةِ العِشَاءِ ثَلاثُ عَوراتٍ لَكُم — النور:58'
};

// حساب وقت الصلاة (خوارزمية فلكية مبسطة)
function toRad(d) { return d * Math.PI / 180; }
function toDeg(r) { return r * 180 / Math.PI; }

function calcPrayerTimes(date, lat, lon, method = 'mwl') {
    const m = PRAYER_METHODS[method] || PRAYER_METHODS.mwl;
    const d = new Date(date);
    const JD = Math.floor(365.25 * (d.getFullYear() + 4716)) + Math.floor(30.6001 * (d.getMonth() + 2)) + d.getDate() - 1524.5;
    const T = (JD - 2451545.0) / 36525;
    // الميل الشمسي
    const L0 = 280.46646 + 36000.76983 * T;
    const M = toRad(357.52911 + 35999.05029 * T);
    const C = (1.914602 - 0.004817 * T) * Math.sin(M) + 0.019993 * Math.sin(2 * M);
    const sunLon = toRad(L0 + C);
    const obliq = toRad(23.439 - 0.0000004 * T);
    const decl = Math.asin(Math.sin(obliq) * Math.sin(sunLon));
    const latR = toRad(lat);

    // وقت الظهر (transit)
    const eqTime = 4 * toDeg(- toRad(0.0057183) - Math.atan2(Math.cos(obliq)*Math.sin(sunLon), Math.cos(sunLon)));
    const noon = 12 - (lon / 15) - (eqTime / 60);

    function calcAngleTime(angle) {
        const cosH = (Math.cos(toRad(90 + angle)) - Math.sin(latR)*Math.sin(decl)) / (Math.cos(latR)*Math.cos(decl));
        if (cosH > 1 || cosH < -1) return null;
        return toDeg(Math.acos(cosH)) / 15;
    }
    function calcShadowTime(shadowFactor) {
        const angle = toDeg(Math.atan(1 / (shadowFactor + Math.tan(Math.abs(latR - decl)))));
        return calcAngleTime(-(90 - angle));
    }

    const fajrH = calcAngleTime(m.fajr_angle);
    const sunriseH = calcAngleTime(0.8333);
    const asrH = calcShadowTime(1); // الشافعية: ظل مثله، الحنفية: 2
    const maghribH = calcAngleTime(0.8333);
    const ishaH = m.isha_angle ? calcAngleTime(m.isha_angle) : (maghribH !== null ? maghribH + (m.isha_minutes || 90) / 60 : null);

    function toTime(h) {
        if (h === null) return null;
        const total = noon - h;
        const total2 = noon + h;
        return null; // مُرجَع من noon ± h
    }

    const times = {
        fajr:    fajrH !== null    ? formatHours(noon - fajrH) : null,
        sunrise: sunriseH !== null ? formatHours(noon - sunriseH) : null,
        dhuhr:   formatHours(noon),
        asr:     asrH !== null     ? formatHours(noon + asrH) : null,
        maghrib: maghribH !== null ? formatHours(noon + maghribH) : null,
        isha:    ishaH !== null    ? formatHours(noon + ishaH) : null,
    };
    return times;
}

function formatHours(h) {
    if (h === null || isNaN(h)) return '--:--';
    h = ((h % 24) + 24) % 24;
    const hr = Math.floor(h);
    const mn = Math.round((h - hr) * 60);
    return `${String(hr).padStart(2,'0')}:${String(mn % 60).padStart(2,'0')}`;
}

// ══════════════════════════════════════════════════════════════════════
// IV. التحويل الهجري — خوارزمية أم القرى
// ══════════════════════════════════════════════════════════════════════
function gregorianToHijri(year, month, day) {
    // خوارزمية كويت-ليليوس المُحوَّلة
    let JD = Math.floor((1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4)
           + Math.floor((367 * (month - 2 - 12 * Math.floor((month - 14) / 12))) / 12)
           - Math.floor((3 * Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100)) / 4)
           + day - 32075;
    let l = JD - 1948440 + 10632;
    let n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;
    let j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719)
          + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
    l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
        - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    let m = Math.floor((24 * l) / 709);
    let d = l - Math.floor((709 * m) / 24);
    let y = 30 * n + j - 30;
    return { year: y, month: m, day: d };
}

function hijriToGregorian(hYear, hMonth, hDay) {
    let JD = Math.floor((11 * hYear + 3) / 30)
           + Math.floor(354 * hYear)
           + Math.floor(30 * hMonth)
           - Math.floor((hMonth - 1) / 2)
           + hDay + 1948440 - 385;
    let l = JD + 68569;
    let n = Math.floor((4 * l) / 146097);
    l = l - Math.floor((146097 * n + 3) / 4);
    let i = Math.floor((4000 * (l + 1)) / 1461001);
    l = l - Math.floor((1461 * i) / 4) + 31;
    let j = Math.floor((80 * l) / 2447);
    let day = l - Math.floor((2447 * j) / 80);
    l = Math.floor(j / 11);
    let month = j + 2 - 12 * l;
    let year = 100 * (n - 49) + i + l;
    return { year, month, day };
}

// ══════════════════════════════════════════════════════════════════════
// V. الأحداث الكونية — من الخلق إلى القيامة
// ══════════════════════════════════════════════════════════════════════
const COSMIC_TIMELINE = {
    // ─── ما قبل الخلق ──────────────────────────────────────────────
    pre_creation: [
        {
            id: 'quran_creation',
            era: 'قبل الخلق',
            event_ar: 'كان الله ولم يكن شيء قبله — اللوح المحفوظ والقدر',
            quran: 'هُوَ الأَوَّلُ وَالآخِرُ وَالظَّاهِرُ وَالبَاطِنُ — الحديد:3',
            hadith: 'كان الله ولا شيء معه — البخاري',
            note: 'التوحيد المطلق — لا زمان ولا مكان قبل خلق الله الكون'
        },
        {
            id: 'pen_creation',
            era: 'قبل الخلق',
            event_ar: 'خلق الله القلم فقال له: اكتب',
            hadith: 'إن أول ما خلق الله القلم فقال له: اكتب. قال: ما أكتب؟ قال: اكتب القدر — الترمذي 2155',
            note: 'تدوين القدر كله قبل خلق السماوات والأرض بخمسين ألف سنة'
        }
    ],
    // ─── خلق الكون ──────────────────────────────────────────────
    universe_creation: [
        {
            id: 'big_bang_quran',
            era: 'خلق الكون',
            event_ar: 'خلق السماوات والأرض — فتق الرتق',
            quran: 'أَوَلَمْ يَرَ الَّذِينَ كَفَرُوا أَنَّ السَّمَاوَاتِ وَالأَرْضَ كَانَتَا رَتْقًا فَفَتَقْنَاهُمَا — الأنبياء:30',
            science_parallel: 'الانفجار العظيم — ~13.8 مليار سنة',
            note: 'الإسلام يثبت خلق الكون من العدم — لا يتعارض مع الحقيقة العلمية'
        },
        {
            id: 'six_days',
            era: 'خلق الكون',
            event_ar: 'خلق الله السماوات والأرض في ستة أيام',
            quran: 'إِنَّ رَبَّكُمُ اللَّهُ الَّذِي خَلَقَ السَّمَاوَاتِ وَالأَرْضَ فِي سِتَّةِ أَيَّامٍ — الأعراف:54',
            note: 'الأيام هنا قد تعني آباداً طويلة — علم الله أوسع'
        },
        {
            id: 'water_creation',
            era: 'خلق الكون',
            event_ar: 'وجعلنا من الماء كل شيء حي',
            quran: 'وَجَعَلْنَا مِنَ المَاءِ كُلَّ شَيْءٍ حَيٍّ — الأنبياء:30'
        }
    ],
    // ─── قبل آدم ──────────────────────────────────────────────
    pre_adam: [
        {
            id: 'jinn_earth',
            era: 'قبل آدم عليه السلام',
            event_ar: 'عمارة الأرض بالجن قبل الإنسان',
            quran: 'وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الأَرْضِ خَلِيفَةً — البقرة:30',
            hadith: 'كان في الأرض الجن فأفسدوا فيها — ابن كثير',
            note: 'الجن سكنوا الأرض وأفسدوا فأُرسلوا ليبادوا — ثم خُلق آدم'
        },
        {
            id: 'iblis_refusal',
            era: 'قبل البشرية',
            event_ar: 'امتناع إبليس من السجود لآدم',
            quran: 'أَبَى وَاسْتَكْبَرَ وَكَانَ مِنَ الكَافِرِينَ — البقرة:34',
            note: 'الحدث الذي أطلق عداء إبليس للإنسان إلى يوم القيامة'
        }
    ],
    // ─── الأنبياء والرسل ──────────────────────────────────────────────
    prophets_timeline: [
        { id:'adam',         name_ar:'آدم عليه السلام',           approx:'بداية البشرية', quran:'إِنَّ اللَّهَ اصْطَفَى آدَمَ وَنُوحًا — آل عمران:33' },
        { id:'idris',        name_ar:'إدريس عليه السلام',          approx:'قبل الطوفان',   quran:'وَاذْكُرْ فِي الكِتَابِ إِدْرِيسَ إِنَّهُ كَانَ صِدِّيقًا نَبِيًّا — مريم:56' },
        { id:'nuh',          name_ar:'نوح عليه السلام',             approx:'~3000-4000 ق.م تقديراً', quran:'إِنَّا أَرْسَلْنَا نُوحًا إِلَى قَوْمِهِ — نوح:1', note:'لبث في قومه ألف سنة إلا خمسين عاماً' },
        { id:'hud',          name_ar:'هود عليه السلام',             approx:'بعد نوح', quran:'وَإِلَى عَادٍ أَخَاهُمْ هُودًا — هود:50' },
        { id:'salih',        name_ar:'صالح عليه السلام',            approx:'بعد هود', quran:'وَإِلَى ثَمُودَ أَخَاهُمْ صَالِحًا — هود:61' },
        { id:'ibrahim',      name_ar:'إبراهيم خليل الله عليه السلام', approx:'~2000 ق.م تقديراً', quran:'وَاتَّخَذَ اللَّهُ إِبْرَاهِيمَ خَلِيلًا — النساء:125', note:'بناء الكعبة المشرفة — قبلة الإسلام' },
        { id:'ismail',       name_ar:'إسماعيل عليه السلام',         approx:'~1900 ق.م', quran:'وَاذْكُرْ فِي الكِتَابِ إِسْمَاعِيلَ إِنَّهُ كَانَ صَادِقَ الوَعْدِ — مريم:54' },
        { id:'ishaq',        name_ar:'إسحاق عليه السلام',           approx:'~1900 ق.م', quran:'وَوَهَبْنَا لَهُ إِسْحَاقَ وَيَعْقُوبَ — الأنعام:84' },
        { id:'yusuf',        name_ar:'يوسف عليه السلام',            approx:'~1700 ق.م', quran:'نَحْنُ نَقُصُّ عَلَيْكَ أَحْسَنَ القَصَصِ — يوسف:3' },
        { id:'musa',         name_ar:'موسى كليم الله عليه السلام',  approx:'~1300 ق.م', quran:'وَكَلَّمَ اللَّهُ مُوسَى تَكْلِيمًا — النساء:164' },
        { id:'dawood',       name_ar:'داود عليه السلام',            approx:'~1000 ق.م', quran:'وَآتَينَا دَاوُودَ زَبُورًا — النساء:163' },
        { id:'suleiman',     name_ar:'سليمان عليه السلام',          approx:'~970 ق.م',  quran:'وَوَرِثَ سُلَيْمَانُ دَاوُودَ — النمل:16', note:'أعظم ملك في التاريخ — يسخّر له الريح والجن' },
        { id:'isa',          name_ar:'عيسى المسيح ابن مريم عليه السلام', approx:'~4 ق.م — 30م', quran:'وَرُوحٌ مِنهُ — النساء:171', note:'رُفع إلى السماء — سينزل آخر الزمان' },
        { id:'muhammad',     name_ar:'محمد ﷺ خاتم الأنبياء والمرسلين', miladi:'570-632م', hijri:'قبل الهجرة 53 — 11هـ', quran:'مَّا كَانَ مُحَمَّدٌ أَبَا أَحَدٍ مِّن رِّجَالِكُمْ وَلَٰكِن رَّسُولَ اللَّهِ وَخَاتَمَ النَّبِيِّينَ — الأحزاب:40', note:'أفضل الأنبياء والمرسلين — شفيع الأمة يوم القيامة' }
    ],
    // ─── الحضارات الإسلامية ──────────────────────────────────────────────
    islamic_eras: [
        { id:'hijra',           year_h:1,    year_m:622,  event_ar:'الهجرة النبوية الشريفة — بداية التاريخ الإسلامي' },
        { id:'badr',            year_h:2,    year_m:624,  event_ar:'غزوة بدر الكبرى — وَمَا النَّصْرُ إِلَّا مِنْ عِندِ اللَّهِ' },
        { id:'fath_makka',      year_h:8,    year_m:630,  event_ar:'فتح مكة المكرمة — جَاءَ الحَقُّ وَزَهَقَ البَاطِلُ' },
        { id:'wafat_rasool',    year_h:11,   year_m:632,  event_ar:'وفاة النبي ﷺ — لَّا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا' },
        { id:'quran_compiled',  year_h:13,   year_m:634,  event_ar:'جمع القرآن الكريم في عهد أبي بكر الصديق رضي الله عنه' },
        { id:'al_aqsa',         year_h:15,   year_m:636,  event_ar:'فتح القدس والمسجد الأقصى في عهد عمر رضي الله عنه' },
        { id:'uthman_quran',    year_h:25,   year_m:645,  event_ar:'توحيد المصحف في عهد عثمان رضي الله عنه' },
        { id:'umayyad',         year_h:41,   year_m:661,  event_ar:'الدولة الأموية — توسع الفتوحات شرقاً وغرباً' },
        { id:'abbasid',         year_h:132,  year_m:750,  event_ar:'الدولة العباسية — عصر الترجمة والعلوم الإسلامية' },
        { id:'ibnu_battuta',    year_h:725,  year_m:1325, event_ar:'رحلات ابن بطوطة — جواد الأرض المسلم' },
        { id:'ottoman',         year_h:699,  year_m:1299, event_ar:'قيام الدولة العثمانية — خدمة الحرمين الشريفين' },
        { id:'saudi_1',         year_h:1157, year_m:1744, event_ar:'الدولة السعودية الأولى — الشيخ محمد بن عبد الوهاب' },
        { id:'saudi_3',         year_h:1351, year_m:1932, event_ar:'تأسيس المملكة العربية السعودية — الملك عبد العزيز' },
        { id:'vision_2030',     year_h:1437, year_m:2016, event_ar:'رؤية المملكة 2030 — التحول الاقتصادي الكبير' }
    ],
    // ─── أشراط الساعة ──────────────────────────────────────────────
    end_times: [
        { id:'dajjal',    type:'minor', event_ar:'خروج الدجال',                 quran:'وَلَأُضِلَّنَّهُمْ', hadith:'ما بين خلق آدم إلى قيام الساعة أمر أكبر من الدجال — مسلم' },
        { id:'mahdi',     type:'minor', event_ar:'ظهور المهدي المنتظر',          hadith:'يكون في آخر أمتي خليفة يحثو المال حثياً لا يعده عداً — مسلم' },
        { id:'isa_return',type:'major', event_ar:'نزول عيسى عليه السلام',       quran:'وَإِنَّهُ لَعِلْمٌ لِلسَّاعَةِ — الزخرف:61' },
        { id:'yajuj',     type:'major', event_ar:'خروج يأجوج ومأجوج',           quran:'حَتَّى إِذَا فُتِحَتْ يَأْجُوجُ وَمَأْجُوجُ — الأنبياء:96' },
        { id:'sun_west',  type:'major', event_ar:'طلوع الشمس من مغربها',        hadith:'لا تقوم الساعة حتى تطلع الشمس من مغربها — البخاري' },
        { id:'beast',     type:'major', event_ar:'خروج الدابة من الأرض',         quran:'وَإِذَا وَقَعَ القَوْلُ عَلَيْهِمْ أَخْرَجْنَا لَهُم دَابَّةً — النمل:82' },
        { id:'qiyama',    type:'final', event_ar:'يوم القيامة',                   quran:'يَوْمَ يَقُومُ النَّاسُ لِرَبِّ العَالَمِينَ — المطففين:6', note: 'عِلْمُها عِنْدَ رَبِّي لَا يُجَلِّيهَا لِوَقْتِهَا إِلَّا هُوَ — الأعراف:187' }
    ]
};

// ══════════════════════════════════════════════════════════════════════
// VI. اللغات — توثيق وتصنيف
// ══════════════════════════════════════════════════════════════════════
const WORLD_LANGUAGES = {
    arabic: {
        id: 'arabic',
        name_ar: 'العربية',
        name_en: 'Arabic',
        family: 'السامية',
        speakers: '420+ مليون',
        status: 'living',
        divine_status: 'لغة القرآن الكريم — أشرف اللغات',
        quran: 'إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ — يوسف:2',
        script: 'عربي — يميناً لليسار',
        dialects: ['الفصحى','الحجازية','النجدية','المصرية','الشامية','العراقية','المغربية'],
        history: 'أقدم توثيق للعربية ~500م — لكنها أقدم بكثير لسانياً'
    },
    aramaic: {
        id: 'aramaic',
        name_ar: 'الآرامية',
        name_en: 'Aramaic',
        family: 'السامية',
        status: 'endangered',
        note: 'لغة عيسى عليه السلام — بعض تعابيره الواردة في الأناجيل آرامية',
        link_to_arabic: 'أخت العربية — من ذرية سام بن نوح'
    },
    hebrew: { id:'hebrew', name_ar:'العبرية', name_en:'Hebrew', family:'السامية', status:'revived', note:'أُحييت قسراً في القرن 20م' },
    english: { id:'english', name_ar:'الإنجليزية', name_en:'English', family:'جرمانية هندو-أوروبية', speakers:'1.5 مليار', status:'living' },
    mandarin: { id:'mandarin', name_ar:'الصينية المندرية', name_en:'Mandarin Chinese', family:'صينية-تبتية', speakers:'1.1 مليار', status:'living' },
    hindi: { id:'hindi', name_ar:'الهندية', name_en:'Hindi', family:'هندية-إيرانية', speakers:'600م', status:'living' },
    spanish: { id:'spanish', name_ar:'الإسبانية', name_en:'Spanish', family:'رومانية-لاتينية', speakers:'500م', status:'living' },
    french: { id:'french', name_ar:'الفرنسية', name_en:'French', family:'رومانية', speakers:'300م', status:'living' },
    turkish: { id:'turkish', name_ar:'التركية', name_en:'Turkish', family:'تركية-ألطية', speakers:'90م', status:'living' },
    persian: { id:'persian', name_ar:'الفارسية', name_en:'Persian/Farsi', family:'هندو-إيرانية', speakers:'110م', status:'living' },
    urdu: { id:'urdu', name_ar:'الأردية', name_en:'Urdu', family:'هندو-إيرانية', speakers:'230م', status:'living', note:'قريبة جداً من الهندية — تكتب بالخط العربي' },
    malay: { id:'malay', name_ar:'الملايوية', name_en:'Malay/Indonesian', family:'أسترونيزية', speakers:'290م', status:'living' },
    swahili: { id:'swahili', name_ar:'السواحيلية', name_en:'Swahili', family:'بانتو', speakers:'200م', status:'living', note:'كلمات كثيرة أصلها عربي' },
    latin: { id:'latin', name_ar:'اللاتينية', name_en:'Latin', family:'هندو-أوروبية', status:'extinct_religious', note:'لغة الكنيسة الكاثوليكية — لا يتحدثها أحد أماً' },
    sumerian: { id:'sumerian', name_ar:'السومرية', name_en:'Sumerian', family:'معزولة — لا عائلة معروفة', status:'extinct', origin: '~3200 ق.م', note:'أقدم لغة مكتوبة في التاريخ المدوَّن' },
    akkadian: { id:'akkadian', name_ar:'الأكادية', name_en:'Akkadian', family:'سامية', status:'extinct', note:'لغة بابل وآشور' },
    coptic: { id:'coptic', name_ar:'القبطية', name_en:'Coptic', family:'أفرو-آسيوية — مصرية قديمة', status:'extinct_liturgical', note:'لغة الكنيسة القبطية — آخر مرحلة للمصرية القديمة' },
    amazigh: { id:'amazigh', name_ar:'الأمازيغية (البربرية)', name_en:'Amazigh/Berber', family:'أفرو-آسيوية', speakers:'35م', status:'living', note:'شمال أفريقيا — قبل الفتح الإسلامي والعربي' }
};

// ══════════════════════════════════════════════════════════════════════
// VII. الوقت الفعلي بكل دولة + التقاويم
// ══════════════════════════════════════════════════════════════════════
function getCurrentTimeAllCountries() {
    const now = new Date();
    const result = {};
    for (const [code, info] of Object.entries(WORLD_TIMEZONES)) {
        try {
            const localTime = new Date(now.toLocaleString('en-US', { timeZone: info.tz }));
            const hijri = gregorianToHijri(localTime.getFullYear(), localTime.getMonth()+1, localTime.getDate());
            const months = CALENDARS.hijri_lunar.months_ar;
            result[code] = {
                country_ar: info.name_ar,
                capital: info.capital,
                timezone: info.tz,
                time_actual: localTime.toLocaleTimeString('ar-SA', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12: false }),
                date_miladi: localTime.toLocaleDateString('ar-SA', { year:'numeric', month:'long', day:'numeric', weekday:'long' }),
                date_hijri: `${hijri.day} ${months[hijri.month-1]} ${hijri.year} هـ`,
                is_day: (localTime.getHours() >= 6 && localTime.getHours() < 18),
                period_ar: localTime.getHours() < 12 ? 'صباحاً' : (localTime.getHours() < 15 ? 'ظهراً' : (localTime.getHours() < 18 ? 'عصراً' : (localTime.getHours() < 20 ? 'مغرباً' : 'عشاءً وليلاً')))
            };
        } catch(e) {
            result[code] = { country_ar: info.name_ar, error: 'خطأ في التوقيت' };
        }
    }
    return result;
}

function getCurrentHijriDate() {
    const now = new Date();
    const h = gregorianToHijri(now.getFullYear(), now.getMonth()+1, now.getDate());
    const months = CALENDARS.hijri_lunar.months_ar;
    const days_ar = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    return {
        day: h.day,
        month_num: h.month,
        month_ar: months[h.month-1],
        year: h.year,
        full_ar: `${days_ar[now.getDay()]} ${h.day} ${months[h.month-1]} ${h.year} هـ`,
        full_en: `${h.day}/${h.month}/${h.year} H`,
        miladi_parallel: now.toLocaleDateString('ar-SA', { year:'numeric', month:'long', day:'numeric' })
    };
}

// ══════════════════════════════════════════════════════════════════════
// VIII. البصمة الزمنية الكاملة — كل تقويم في آن واحد
// ══════════════════════════════════════════════════════════════════════
function getCosmicTimestamp() {
    const now = new Date();
    const h = gregorianToHijri(now.getFullYear(), now.getMonth()+1, now.getDate());
    const months_h = CALENDARS.hijri_lunar.months_ar;

    // التقويم الإثيوبي (تقريبي — يتأخر ~7 سنوات و ~3 أشهر)
    const ethYear = now.getFullYear() - (now.getMonth() >= 9 ? 7 : 8);

    // التقويم الياباني
    let jpEra = 'رِيوا', jpYear = now.getFullYear() - 2018;
    if (now.getFullYear() < 1989) { jpEra = 'شووا'; jpYear = now.getFullYear() - 1925; }

    return {
        utc_iso: now.toISOString(),
        miladi_gregorian: now.toLocaleDateString('ar-SA', { year:'numeric', month:'long', day:'numeric', weekday:'long' }),
        hijri_lunar: `${h.day} ${months_h[h.month-1]} ${h.year} هـ`,
        hijri_year_only: h.year,
        time_utc: now.toUTCString(),
        time_mecca: new Date(now.toLocaleString('en-US',{timeZone:'Asia/Riyadh'})).toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}),
        time_madinah: new Date(now.toLocaleString('en-US',{timeZone:'Asia/Riyadh'})).toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit',hour12:false}),
        unix_timestamp: Math.floor(now.getTime()/1000),
        hebrew_approx: `~ ${now.getFullYear() + 3760} AM`,
        ethiopian_approx: `${ethYear} EE`,
        japanese_approx: `${jpEra} ${jpYear}`,
        thai_be_approx: `${now.getFullYear() + 543} BE`,
        quran_time_ref: 'وَاللَّيْلُ وَالنَّهَارُ آيَتَانِ مِن آيَاتِ اللَّهِ — يُدَبِّرُ الأَمْرَ مِنَ السَّمَاءِ إِلَى الأَرْضِ — السجدة:5',
        day_period_ar: (() => {
            const h24 = new Date(now.toLocaleString('en-US',{timeZone:'Asia/Riyadh'})).getHours();
            if(h24 < 4)  return 'جوف الليل — ثلث الليل الآخر';
            if(h24 < 6)  return 'السحر — وقت الاستغفار';
            if(h24 < 7)  return 'الفجر — صلاة الفجر';
            if(h24 < 12) return 'الضحى — بركة الصباح';
            if(h24 < 13) return 'الزوال — وقت الظهر';
            if(h24 < 15) return 'بعد الظهر';
            if(h24 < 16) return 'العصر — والعصر إن الإنسان لفي خسر';
            if(h24 < 18) return 'قبيل المغرب';
            if(h24 < 20) return 'المغرب — ساعة الإفطار';
            return 'العشاء — وللنائمين رحمة';
        })()
    };
}

// ══════════════════════════════════════════════════════════════════════
// IX. الخطط المستقبلية — رقمنة الرؤى
// ══════════════════════════════════════════════════════════════════════
const FUTURE_VISION = {
    quran_ref: 'عَالِمُ الغَيْبِ وَالشَّهَادَةِ — الغيب لله وحده — الأنعام:73',
    note: 'لا يعلم الغيب إلا الله — هذه دراسة وتخطيط بشري للمستقبل وليست نبوءة',
    vision_2030: {
        name_ar: 'رؤية المملكة العربية السعودية 2030',
        goals: ['تنويع الاقتصاد','السياحة والترفيه','تمكين المرأة','الاقتصاد الرقمي','الطاقة المتجددة'],
        progress: 'قيد التنفيذ — إنجازات كبيرة'
    },
    sheikha_roadmap: {
        phase_current: 51,
        next_phases: [
            { phase:52, title:'منظومة التوقيت الكوني', status:'active_now' },
            { phase:53, title:'منظومة الرقمنة الكاملة', status:'planned' },
            { phase:54, title:'البنك الإسلامي الرقمي', status:'planned' },
            { phase:55, title:'سوق الفضاء ومعادن الكواكب', status:'vision' },
            { phase:60, title:'منظومة شيخة للحضارة الإسلامية', status:'vision' }
        ]
    }
};

// ══════════════════════════════════════════════════════════════════════
// X. محرك التوقيت — EventEmitter
// ══════════════════════════════════════════════════════════════════════
class SheikhaTimeEngine extends EventEmitter {
    constructor() {
        super();
        this.stats = {
            name: 'منظومة التوقيت الكوني — شيخة',
            phase: 52,
            startTime: new Date().toISOString(),
            conversions: 0,
            prayerCalcs: 0
        };
        // ضربة قلب كل ساعة
        this._interval = setInterval(() => {
            this.stats.conversions++;
            this.emit('time_sync', { ts: new Date().toISOString(), hijri: getCurrentHijriDate() });
        }, 3600000);
        this._interval.unref();
    }
    getCosmicTime() { this.stats.conversions++; return getCosmicTimestamp(); }
    calcPrayers(lat, lon, method) { this.stats.prayerCalcs++; return calcPrayerTimes(new Date(), lat, lon, method); }
    hijriNow() { return getCurrentHijriDate(); }
    allCountries() { return getCurrentTimeAllCountries(); }
    getStatus() {
        return { ...this.stats, calendars: Object.keys(CALENDARS).length, timezones: Object.keys(WORLD_TIMEZONES).length, languages: Object.keys(WORLD_LANGUAGES).length };
    }
}
const timeEngine = new SheikhaTimeEngine();

// ══════════════════════════════════════════════════════════════════════
// Exports
// ══════════════════════════════════════════════════════════════════════
module.exports = {
    CALENDARS,
    WORLD_TIMEZONES,
    PRAYER_METHODS,
    PRAYER_QURAN_REFS,
    COSMIC_TIMELINE,
    WORLD_LANGUAGES,
    FUTURE_VISION,
    timeEngine,
    gregorianToHijri,
    hijriToGregorian,
    calcPrayerTimes,
    getCurrentHijriDate,
    getCosmicTimestamp,
    getCurrentTimeAllCountries,
    TIME_SYSTEM: {
        version: '52.0.0',
        name: 'منظومة التوقيت الكوني الشامل',
        quran: 'يَسْأَلُونَكَ عَنِ الأَهِلَّةِ قُلْ هِيَ مَوَاقِيتُ لِلنَّاسِ وَالحَجِّ — البقرة:189',
        getFullStatus() {
            return {
                name: this.name,
                version: this.version,
                calendars_count: Object.keys(CALENDARS).length,
                countries_count: Object.keys(WORLD_TIMEZONES).length,
                languages_count: Object.keys(WORLD_LANGUAGES).length,
                prayer_methods: Object.keys(PRAYER_METHODS).length,
                cosmic_events: COSMIC_TIMELINE.prophets_timeline.length + COSMIC_TIMELINE.islamic_eras.length,
                engine: timeEngine.stats
            };
        }
    }
};
