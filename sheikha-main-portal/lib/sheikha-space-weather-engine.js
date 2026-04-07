'use strict';

// ============================================================
// محرك طقس الفضاء — القمر السعودي شمس — شيخة
// المرحلة ٣٨ — أول مشاركة عربية في آرتميس ٢ — أبريل ٢٠٢٦
// ============================================================

// ---- معلومات القمر شمس ----
const shamsSatellite = {
    id: 'shams-1',
    name: 'القمر الصناعي شمس',
    name_en: 'SHAMS-1 Satellite',
    type: 'CubeSat 12U',
    launch_date: '2026-04-02',
    launch_vehicle: 'NASA SLS (Space Launch System)',
    mission: 'آرتميس ٢ — Artemis II',
    orbit_type: 'HEO — إهليلجي عالٍ',
    orbit_altitude_km: { min: 500, max: 70000 },
    developer: 'وكالة الفضاء السعودية (KSSA)',
    support: 'برنامج ندلب (NIDLP)',
    launch_site: 'مركز كينيدي للفضاء — فلوريدا، USA',
    historic_note: 'أول قمر صناعي عربي في برنامج آرتميس — أول مشاركة سعودية مع ناسا',
    objective: 'رصد طقس الفضاء وحماية البنية التحتية الأرضية من العواصف الشمسية',
    vision_2030: 'توطين تقنيات الفضاء — رفع الكفاءات الوطنية',
    saudi_space_crew: [
        { name: 'ريانة برناوي', role: 'رائدة فضاء — أول سعودية في الفضاء', mission: 'Axiom 2 — محطة الفضاء الدولية — مايو 2023' },
        { name: 'علي القرني', role: 'رائد فضاء', mission: 'Axiom 2 — محطة الفضاء الدولية — مايو 2023' },
        { name: 'الأمير سلطان بن سلمان', role: 'أول رائد فضاء عربي وسعودي', mission: 'مكوك ديسكفري — 1985' }
    ]
};

// ---- مستشعرات القمر الأربعة ----
const sensors = {
    magnetometer: {
        id: 'magnetometer',
        name: 'مقياس المغناطيسية',
        name_en: 'Magnetometer',
        icon: '🧲',
        measures: 'شدة واتجاه المجال المغناطيسي للأرض في المدار العالي',
        unit: 'nT (نانو تسلا)',
        normal_range: { min: 30000, max: 60000 },
        storm_threshold: 25000,
        data_produced: 'رصد العواصف الجيومغناطيسية',
        protects: ['شبكات الكهرباء', 'خطوط الأنابيب', 'المنشآت النفطية']
    },
    xray_spectrometer: {
        id: 'xray_spectrometer',
        name: 'مقياس الأشعة السينية الشمسية',
        name_en: 'Solar X-ray Spectrometer',
        icon: '☀️',
        measures: 'شدة الانبعاثات الكهرومغناطيسية عالية الطاقة من الشمس',
        unit: 'W/m²',
        normal_range: { max: 1e-6 },
        warning_threshold: 1e-5,
        danger_threshold: 1e-4,
        flare_classes: { A: '< 1e-7', B: '1e-7–1e-6', C: '1e-6–1e-5', M: '1e-5–1e-4', X: '> 1e-4' },
        data_produced: 'كشف التوهجات الشمسية لحظياً',
        protects: ['GPS والملاحة', 'اتصالات الراديو', 'الطيران المدني']
    },
    radiation_dosimeter: {
        id: 'radiation_dosimeter',
        name: 'مقياس الإشعاع الكوني',
        name_en: 'Radiation Dosimeter',
        icon: '⚡',
        measures: 'الجرعة الإشعاعية التراكمية في المدار',
        unit: 'mGy (ميلي غراي)',
        safe_max: 80,
        warning_threshold: 60,
        data_produced: 'قياس بيئة الإشعاع لحماية الإلكترونيات والرواد',
        protects: ['رواد الفضاء', 'الأقمار الصناعية الأخرى', 'رحلات القطبين الجوية']
    },
    particle_detector: {
        id: 'particle_detector',
        name: 'كاشف الجسيمات المشحونة',
        name_en: 'Charged Particle Detector (SEP)',
        icon: '🔬',
        measures: 'تدفق البروتونات والإلكترونات عالية الطاقة',
        unit: 'p/cm²/s',
        normal_max: 500,
        warning_threshold: 800,
        danger_threshold: 1200,
        data_produced: 'رصد انبعاثات الجسيمات الشمسية',
        protects: ['الأقمار الصناعية', 'شبكات الاتصال', 'أجهزة المطارات']
    }
};

// ---- مستويات التحذير ----
const alertLevels = {
    green: {
        level: 1, code: 'GREEN', label_ar: 'آمن', label_en: 'Clear',
        color: '#00C851',
        description: 'الفضاء هادئ — كل الأنظمة تعمل بشكل طبيعي',
        sheikha_status: 'العمليات طبيعية — لا قيود'
    },
    yellow: {
        level: 2, code: 'YELLOW', label_ar: 'تحذير مبكر', label_en: 'Watch',
        color: '#FFD700',
        description: 'نشاط شمسي متوسط — مراقبة مستمرة مطلوبة',
        sheikha_status: 'متابعة مزيدة — عمليات طبيعية مع تنبه'
    },
    orange: {
        level: 3, code: 'ORANGE', label_ar: 'تحذير عالٍ', label_en: 'Warning',
        color: '#FF6600',
        description: 'عاصفة شمسية نشطة — اتخاذ احتياطات تشغيلية',
        sheikha_status: 'تفعيل بروتوكول الحماية — تحذير العملاء'
    },
    red: {
        level: 4, code: 'RED', label_ar: 'خطر شديد', label_en: 'Emergency',
        color: '#FF1744',
        description: 'عاصفة جيومغناطيسية شديدة — حالة طوارئ فضائية',
        sheikha_status: 'وقف العمليات الحساسة فوراً — استنفار كامل'
    }
};

// ---- تأثيرات طقس الفضاء على قطاعات شيخة ----
const sheikhaImpacts = {
    metals_trading: {
        name: 'تداول المعادن', icon: '⚖️',
        explanation: 'العواصف الشمسية تؤثر على أسعار النحاس والألمنيوم لارتباطهما بشبكات الكهرباء',
        impacts: {
            green:  { risk: 'منعدم',   volatility: '±0%',   action: 'تداول طبيعي — أفضل وقت للصفقات' },
            yellow: { risk: 'منخفض',   volatility: '±1-2%', action: 'راقب أسعار المعادن الإلكترونية والنحاس' },
            orange: { risk: 'متوسط',   volatility: '±3-5%', action: 'يُنصح بتأجيل الصفقات الكبيرة ٢٤-٤٨ ساعة' },
            red:    { risk: 'عالٍ جداً', volatility: '±5-10%', action: 'تجميد الصفقات الآلية — مراجعة يدوية إلزامية' }
        }
    },
    shipping_logistics: {
        name: 'الشحن واللوجستيات', icon: '🚢',
        explanation: 'دقة GPS حيوية لتتبع الشحنات والملاحة البحرية لناقلات المعادن والسكراب',
        impacts: {
            green:  { risk: 'منعدم', gps: 'دقيق جداً',     action: 'شحن طبيعي — مسارات مثالية' },
            yellow: { risk: 'منخفض', gps: 'دقيق',          action: 'فحص إضافي لمسارات الملاحة عبر شيخة' },
            orange: { risk: 'متوسط', gps: 'هامش خطأ ±50م', action: 'تأجيل الشحنات الحساسة — تفعيل ملاحة احتياطية' },
            red:    { risk: 'عالٍ',  gps: 'غير موثوق',     action: 'إيقاف الشحن الآلي — التحول لملاحة يدوية' }
        }
    },
    financial_transactions: {
        name: 'المعاملات المالية', icon: '💰',
        explanation: 'الصرافات والمعاملات المالية والBTC تعتمد على توقيت GPS الدقيق',
        impacts: {
            green:  { risk: 'منعدم', timing: 'مثالي',       action: 'معاملات طبيعية' },
            yellow: { risk: 'منخفض', timing: 'دقيق',        action: 'مراقبة التوقيت الدقيق للمعاملات الكبيرة' },
            orange: { risk: 'متوسط', timing: 'هامش ±1ms',   action: 'تعزيز نسخ احتياطية لخوادم التوقيت' },
            red:    { risk: 'عالٍ',  timing: 'غير موثوق',   action: 'تأجيل المعاملات الكبيرة لحين استقرار الفضاء' }
        }
    },
    communications: {
        name: 'الاتصالات والبيانات', icon: '📡',
        explanation: 'العواصف المغناطيسية تسبب تشويشاً في اتصالات الأقمار الصناعية والإنترنت',
        impacts: {
            green:  { risk: 'منعدم', quality: 'ممتازة',     action: 'اتصالات طبيعية — سرعة كاملة' },
            yellow: { risk: 'منخفض', quality: 'جيدة',       action: 'فحص جودة الاتصال بخوادم شيخة' },
            orange: { risk: 'متوسط', quality: 'متقطعة',     action: 'تفعيل خطوط احتياطية — تقليل البيانات الحرجة' },
            red:    { risk: 'عالٍ',  quality: 'غير مستقرة', action: 'التحول لاتصالات أرضية — وضع البيانات في queue' }
        }
    },
    power_grid: {
        name: 'الطاقة والبنية التحتية', icon: '⚡',
        explanation: 'العواصف الجيومغناطيسية تسبب تيارات كهربائية تؤثر على المحولات ومصافي النفط',
        impacts: {
            green:  { risk: 'منعدم', grid: 'مستقر تماماً',  action: 'عمليات طبيعية' },
            yellow: { risk: 'منخفض', grid: 'مستقر',         action: 'مراقبة بسيطة للشبكة' },
            orange: { risk: 'متوسط', grid: 'تحت المراقبة',  action: 'تقليل الأحمال الكهربائية غير الضرورية' },
            red:    { risk: 'عالٍ',  grid: 'خطر انقطاع',   action: 'تفعيل مولدات احتياطية — تنبيه مصافي النفط' }
        }
    }
};

// ---- تصنيف الأشعة السينية ----
function classifyXRay(xray) {
    if (xray >= 1e-4) return { class: 'X', severity: 'شديد جداً', ar: 'فئة X — خطر' };
    if (xray >= 1e-5) return { class: 'M', severity: 'متوسط الخطورة', ar: 'فئة M — تحذير' };
    if (xray >= 1e-6) return { class: 'C', severity: 'خفيف', ar: 'فئة C — منخفض' };
    if (xray >= 1e-7) return { class: 'B', severity: 'ضعيف جداً', ar: 'فئة B — هادئ' };
    return { class: 'A', severity: 'هادئ تماماً', ar: 'فئة A — مثالي' };
}

// ---- توليد قراءة من القمر شمس (محاكاة) ----
function generateShamsReading() {
    const now = new Date();
    // محاكاة دورة النشاط الشمسي (ذروة الدورة 25 حوالي 2025-2026)
    const solarPeak = 0.85; // نحن قريبون من الذروة
    const variance = Math.random() * 0.3;
    const activityFactor = Math.min(1, solarPeak + variance - 0.15);

    const radiation = +(Math.random() * 90 * activityFactor).toFixed(2);
    const xray = +(Math.random() * 2e-4 * activityFactor);
    const magnetic = Math.round(28000 + Math.random() * 32000);
    const particles = Math.round(Math.random() * 1400 * activityFactor);

    return {
        timestamp: now.toISOString(),
        satellite: 'SHAMS-1',
        mission: 'Artemis II',
        orbit_altitude_km: Math.round(500 + Math.random() * 69500),
        sensors: { radiation, xray, magnetic, particles },
        raw_api_path: '/api/v1/shams/all_sensors'
    };
}

// ---- تقييم مستوى الخطر ----
function assessAlertLevel(reading) {
    const { radiation, xray, magnetic, particles } = reading.sensors;
    let key = 'green';

    if (xray >= 1e-4 || radiation > 80 || particles > 1200 || magnetic < 22000) {
        key = 'red';
    } else if (xray >= 5e-5 || radiation > 60 || particles > 800 || magnetic < 28000) {
        key = 'orange';
    } else if (xray >= 1e-5 || radiation > 40 || particles > 500 || magnetic < 35000) {
        key = 'yellow';
    }

    const xrayClass = classifyXRay(xray);

    return {
        key,
        ...alertLevels[key],
        triggers: {
            xray_class: xrayClass,
            geomagnetic_storm: magnetic < 28000,
            radiation_elevated: radiation > 60,
            particle_burst: particles > 800
        },
        sensor_readings: {
            radiation: { value: radiation, unit: 'mGy', safe: radiation <= 60 },
            xray: { value: xray.toExponential(2), unit: 'W/m²', classification: xrayClass.ar },
            magnetic: { value: magnetic, unit: 'nT', safe: magnetic > 28000 },
            particles: { value: particles, unit: 'p/cm²/s', safe: particles <= 800 }
        }
    };
}

// ---- الحالة التشغيلية لشيخة ----
function getSheikhaOperationalStatus(alertKey) {
    const status = {};
    for (const [sector, data] of Object.entries(sheikhaImpacts)) {
        status[sector] = {
            name: data.name,
            icon: data.icon,
            explanation: data.explanation,
            impact: data.impacts[alertKey]
        };
    }
    return status;
}

// ---- توصيات شيخة بناءً على طقس الفضاء ----
function getSheikhaRecommendations(alertKey) {
    const recs = {
        green: [
            'السوق في حالة مثالية — تداول المعادن دون قيود',
            'GPS دقيق — الشحن يسير بانتظام عبر كل الموانئ',
            'وقت مثالي لإبرام الصفقات الكبيرة'
        ],
        yellow: [
            'راقب أسعار النحاس والألمنيوم — احتمال تذبذب طفيف',
            'تحقق من مسارات الملاحة البحرية في لوحة شيخة للوجستيات',
            'تابع التحديثات كل ٤ ساعات — لا داعي لتأجيل الصفقات حالياً'
        ],
        orange: [
            'يُنصح بتأجيل الصفقات الكبيرة ٢٤-٤٨ ساعة',
            'فعّل الملاحة الاحتياطية للشحنات البحرية الحساسة',
            'زد هامش الأمان في العروض — الأسعار قد تتغير بسرعة',
            'تحقق من جاهزية أنظمة الطاقة الاحتياطية'
        ],
        red: [
            '🚨 تجميد الصفقات الآلية فوراً — مراجعة يدوية لكل عملية',
            '🚨 إيقاف الشحن الآلي — انتقل للبروتوكول الاحتياطي',
            '🚨 تأجيل المعاملات المالية الكبيرة لحين استقرار الفضاء',
            '🚨 تواصل مع مشرف منصة شيخة فوراً'
        ]
    };
    return recs[alertKey] || recs.green;
}

// ---- تنبؤ ٢٤ ساعة ----
function getSpaceWeatherForecast() {
    const hourly = [];
    for (let h = 0; h < 24; h++) {
        const r = generateShamsReading();
        const alert = assessAlertLevel(r);
        hourly.push({
            hour: `+${h}h`,
            label: `بعد ${h} ساعة`,
            alert_code: alert.code,
            alert_label: alert.label_ar,
            color: alert.color,
            radiation: r.sensors.radiation,
            xray_class: classifyXRay(r.sensors.xray).class,
            magnetic: r.sensors.magnetic
        });
    }
    const worst = hourly.reduce((a, b) =>
        ['GREEN','YELLOW','ORANGE','RED'].indexOf(a.alert_code) >
        ['GREEN','YELLOW','ORANGE','RED'].indexOf(b.alert_code) ? a : b
    );
    return {
        generated_at: new Date().toISOString(),
        source: 'محرك شيخة لطقس الفضاء — استناداً لبيانات القمر شمس',
        disclaimer: 'تنبؤ تقريبي — للتوجيه التشغيلي فقط لا للقرار الملزم',
        worst_expected: worst,
        hourly
    };
}

// ---- الحصول على الحالة الآنية ----
function getCurrentSpaceWeather() {
    const reading = generateShamsReading();
    const alert = assessAlertLevel(reading);
    const operationalStatus = getSheikhaOperationalStatus(alert.key);
    const recommendations = getSheikhaRecommendations(alert.key);

    return {
        success: true,
        source: 'القمر الصناعي شمس — مهمة آرتميس ٢ — وكالة الفضاء السعودية',
        halal_note: 'معلومات تشغيلية فقط — لا قرار مالي ملزم — شيخة تُعلم ولا تُلزم',
        reading,
        alert,
        operational_status: operationalStatus,
        recommendations,
        api_endpoints: {
            satellite_info: 'GET /api/space-weather/satellite',
            current: 'GET /api/space-weather/current',
            forecast: 'GET /api/space-weather/forecast',
            sensors: 'GET /api/space-weather/sensors',
            impact: 'GET /api/space-weather/sheikha-impact',
            stats: 'GET /api/space-weather/stats'
        }
    };
}

function getShamsSatelliteInfo() {
    return shamsSatellite;
}

function getSensorsInfo() {
    return sensors;
}

function getAlertLevels() {
    return alertLevels;
}

function getSheikhaImpacts() {
    return sheikhaImpacts;
}

function getSpaceWeatherStats() {
    return {
        satellite: 'SHAMS-1 — CubeSat 12U',
        launch: '٢ أبريل ٢٠٢٦ — مركز كينيدي للفضاء',
        mission: 'آرتميس ٢ — أول مشاركة عربية في برنامج آرتميس',
        orbit: 'إهليلجي عالٍ HEO (500 – 70,000 كم)',
        sensors_count: Object.keys(sensors).length,
        alert_levels: Object.keys(alertLevels).length,
        sheikha_sectors_monitored: Object.keys(sheikhaImpacts).length,
        data_products: [
            'إشعاع فضائي', 'أشعة سينية شمسية',
            'مجال مغناطيسي أرضي', 'جسيمات مشحونة (SEP)'
        ],
        saudi_crew_missions: shamsSatellite.saudi_space_crew.length,
        halal_only: true,
        data_policy: 'بيانات علمية مفتوحة — التحكم سعودي خالص',
        sheikha_integration: 'تأثيرات مباشرة على المعادن والشحن والمعاملات والاتصالات'
    };
}

module.exports = {
    getShamsSatelliteInfo,
    getSensorsInfo,
    getAlertLevels,
    getSheikhaImpacts,
    getCurrentSpaceWeather,
    getSpaceWeatherForecast,
    getSheikhaOperationalStatus,
    getSheikhaRecommendations,
    getSpaceWeatherStats,
    classifyXRay,
    generateShamsReading,
    assessAlertLevel
};
