#!/usr/bin/env node
'use strict';

/**
 * رقمنة حدود الجزيرة العربية والخليج العربي
 * من الكتاب والسنة والمصادر التاريخية الإسلامية
 * "وأخرجوا المشركين من جزيرة العرب" — حديث صحيح
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'operations');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function sha256File(filePath) {
    return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

/**
 * تعريف جزيرة العرب من المصادر الإسلامية
 * العلماء: ابن الأثير — "جزيرة العرب ما بين البحرين وعدن والعراق والشام"
 * الحد الشرعي: ما بين المشرق والمغرب من البحرين إلى البحر المحيط
 */
function buildArabianPeninsulaDefinition() {
    return {
        id: 'BOUNDARY-AP-001',
        name: 'جزيرة العرب — الحدود الشرعية والجغرافية',
        arabicName: 'جزيرة العرب',

        shariahBasis: {
            primaryTexts: [
                {
                    type: 'Sunnah',
                    source: 'صحيح مسلم ـ كتاب الوصية',
                    text: 'أخرجوا المشركين من جزيرة العرب',
                    narrator: 'عمر بن الخطاب رضي الله عنه عن النبي ﷺ',
                    significance: 'تحديد الجزيرة بوصفها مكاناً مخصوصاً ذا حكم شرعي',
                },
                {
                    type: 'Sunnah',
                    source: 'صحيح البخاري ـ كتاب الجهاد والسير',
                    text: 'لا يجتمع دينان في جزيرة العرب',
                    narrator: 'أبو هريرة رضي الله عنه عن النبي ﷺ',
                    significance: 'تأكيد الطابع الخاص لجزيرة العرب شرعاً',
                },
                {
                    type: 'Quran',
                    source: 'سورة الحج — 26',
                    text: 'وأذن في الناس بالحج يأتوك رجالاً وعلى كل ضامر يأتين من كل فج عميق',
                    significance: 'الحج أصل الحضور في الجزيرة والتوجه نحوها',
                },
                {
                    type: 'Quran',
                    source: 'سورة البقرة — 144',
                    text: 'فول وجهك شطر المسجد الحرام',
                    significance: 'مكة المكرمة مركز الجزيرة العربية وقبلة المسلمين',
                },
            ],
            scholarDefinitions: [
                {
                    scholar: 'ابن الأثير (الجزري) — النهاية في غريب الحديث',
                    definition: 'جزيرة العرب ما أحاط به البحر من ناحية الشرق والجنوب، ومن الشمال والغرب تحدها بادية الشام والعراق',
                    coordinates: 'من البحرين شرقاً إلى عدن جنوباً إلى الشام شمالاً إلى البحر الأحمر غرباً',
                },
                {
                    scholar: 'ابن القيم — زاد المعاد',
                    definition: 'جزيرة العرب: ما بين بحر القلزم (الأحمر) وبحر الهند وخليج فارس (الخليج العربي) وأرض بابل والعراق',
                    note: 'شملت اليمن والحجاز ونجداً والبحرين واليمامة',
                },
                {
                    scholar: 'الماوردي — الأحكام السلطانية',
                    definition: 'جزيرة العرب هي: الحجاز واليمن ونجد والعروض (البحرين واليمامة)',
                    note: 'تقسيم فقهي لأغراض الولاية والإدارة',
                },
                {
                    scholar: 'ابن حزم — المحلى',
                    definition: 'هي أرض العرب كلها التي هي وطنهم الأصلي، ما بين البحرين وعدن والشام والعراق',
                },
            ],
        },

        geographicBoundaries: {
            north: {
                description: 'الحد الشمالي — بادية الشام والعراق',
                modernEquivalent: 'الحدود الجنوبية للأردن والعراق وسوريا',
                landmarks: ['وادي السرحان', 'القريات', 'الجوف', 'رأس العقبة'],
                coordinates: { latMin: 29.0, latMax: 33.0, lonRange: '35.0 — 46.5' },
            },
            south: {
                description: 'الحد الجنوبي — اليمن وحضرموت وعدن وبحر العرب',
                modernEquivalent: 'الساحل الجنوبي لليمن وعُمان على بحر العرب',
                landmarks: ['عدن', 'حضرموت', 'صلالة', 'مهرة'],
                coordinates: { latMin: 11.5, latMax: 16.0 },
            },
            east: {
                description: 'الحد الشرقي — الخليج العربي وبحر العُمان',
                modernEquivalent: 'ساحل الإمارات وعُمان على الخليج العربي وبحر العرب',
                landmarks: ['مسقط', 'صحار', 'أبو ظبي', 'الكويت'],
                coordinates: { lonMin: 55.0, lonMax: 60.0 },
            },
            west: {
                description: 'الحد الغربي — البحر الأحمر وخليج العقبة',
                modernEquivalent: 'الساحل الغربي للمملكة العربية السعودية على البحر الأحمر',
                landmarks: ['مكة المكرمة', 'جدة', 'ينبع', 'تبوك'],
                coordinates: { lonMin: 32.5, lonMax: 37.5 },
            },
        },

        historicRegions: [
            {
                id: 'REG-HIJAZ',
                name: 'الحجاز',
                significance: 'أعظم بقاع الأرض — مكة المكرمة والمدينة المنورة',
                quranicRef: 'وهذا البلد الأمين (التين:3)',
                cities: ['مكة المكرمة', 'المدينة المنورة', 'الطائف', 'جدة', 'ينبع'],
                modernCountries: ['SA'],
            },
            {
                id: 'REG-NAJD',
                name: 'نجد',
                significance: 'قلب الجزيرة العربية — موطن الدعوة الإصلاحية',
                hadithRef: 'اللهم بارك لنا في شامنا وفي يمننا (البخاري)',
                cities: ['الرياض', 'بريدة', 'الأحساء', 'حائل'],
                modernCountries: ['SA'],
            },
            {
                id: 'REG-YEMEN',
                name: 'اليمن',
                significance: 'من أقدم حضارات العرب — الإيمان يمانٍ والحكمة يمانية (حديث)',
                hadithRef: 'الإيمان يمانٍ والفقه يمانٍ والحكمة يمانية (البخاري)',
                cities: ['صنعاء', 'عدن', 'تعز', 'حضرموت', 'مأرب'],
                modernCountries: ['YE'],
            },
            {
                id: 'REG-OMAN',
                name: 'عُمان التاريخية',
                significance: 'أول من أسلم طوعاً من بلاد العرب خارج شبه الجزيرة',
                hadithRef: 'أهل عُمان — مدحهم النبي ﷺ بقوله: لو أن الناس سلكوا وادياً وسلكت عُمان وادياً آخر لسلكت وادي عُمان (ذكره ابن كثير)',
                cities: ['مسقط', 'صحار', 'نزوى', 'صلالة'],
                modernCountries: ['OM'],
            },
            {
                id: 'REG-AHSA-BAHRAIN',
                name: 'الأحساء والبحرين التاريخية',
                significance: 'العروض — تاريخ إسلامي عريق، موطن قبائل عبد القيس',
                cities: ['الأحساء', 'القطيف', 'المنامة', 'المحرق'],
                modernCountries: ['SA', 'BH'],
            },
            {
                id: 'REG-UAE-QATAR-KUWAIT',
                name: 'السواحل الشرقية (الإمارات والقطر والكويت)',
                significance: 'متصلة بالجزيرة شرقاً — جزء من العروض الإسلامية',
                cities: ['أبو ظبي', 'دبي', 'الدوحة', 'الكويت'],
                modernCountries: ['AE', 'QA', 'KW'],
            },
        ],

        modernCountriesIncluded: [
            { code: 'SA', name: 'المملكة العربية السعودية', region: 'الحجاز + نجد + الحجاز الشمالي + الأحساء' },
            { code: 'YE', name: 'الجمهورية اليمنية', region: 'اليمن التاريخي' },
            { code: 'OM', name: 'سلطنة عُمان', region: 'عُمان + ظفار' },
            { code: 'AE', name: 'الإمارات العربية المتحدة', region: 'السواحل الشرقية' },
            { code: 'QA', name: 'قطر', region: 'شبه جزيرة قطر — العروض' },
            { code: 'KW', name: 'الكويت', region: 'الشمال الشرقي' },
            { code: 'BH', name: 'البحرين', region: 'البحرين التاريخية' },
        ],

        sacredSites: [
            { name: 'المسجد الحرام — مكة المكرمة', status: 'أشرف بقاع الأرض', quranicRef: 'سورة آل عمران:96' },
            { name: 'المسجد النبوي — المدينة المنورة', status: 'ثاني الحرمين الشريفين', hadithRef: 'صلاة في مسجدي (البخاري)' },
            { name: 'مسجد قباء', status: 'أول مسجد بُني في الإسلام', quranicRef: 'التوبة:108' },
        ],

        noHarm: {
            principle: 'لا ضرر ولا ضرار',
            forbiddenUseCases: [
                'استخدام الحدود لتقسيم المسلمين أو إثارة النزاعات',
                'نسب أراضٍ بما يثير فتنة طائفية أو قبلية',
                'توظيف الحدود الشرعية لتبرير احتلال أو ضم قسري',
                'استخدام المعلومات الجغرافية لأغراض عسكرية عدوانية',
            ],
            allowedPurposes: [
                'التعريف بالتاريخ الإسلامي والهوية الحضارية',
                'الدراسة الأكاديمية والفقهية',
                'تعزيز الوحدة والأخوة الإسلامية',
                'خدمة قاصدي الحج والعمرة',
            ],
        },
    };
}

/**
 * تعريف الخليج العربي من أصوله التاريخية والإسلامية
 */
function buildArabianGulfDefinition() {
    return {
        id: 'BOUNDARY-AG-001',
        name: 'الخليج العربي — الحدود الجغرافية والتاريخية',
        arabicName: 'الخليج العربي',
        historicalName: 'بحر فارس عند القدامى — الخليج العربي في المصادر الإسلامية العربية',

        islamicReferences: [
            {
                source: 'ابن بطوطة — رحلة ابن بطوطة',
                text: 'بحر فارس الذي يمتد من عُمان إلى البصرة ويُسمى بحر الخليج',
                note: 'الاسم التاريخي العربي الإسلامي',
            },
            {
                source: 'ياقوت الحموي — معجم البلدان',
                text: 'الخليج الفارسي يمتد من مدخل هرمز شرقاً إلى شط العرب شمالاً',
            },
            {
                source: 'الإدريسي — نزهة المشتاق',
                text: 'هذا البحر الذي يفصل بين جزيرة العرب وبلاد فارس',
            },
        ],

        geographicBoundaries: {
            north: {
                description: 'رأس الخليج — شط العرب / الكويت',
                modernEquivalent: 'الحدود العراقية الكويتية — الفاو والبصرة',
                coordinates: { lat: 29.5, lon: 48.2 },
            },
            south: {
                description: 'مضيق هرمز — مدخل الخليج',
                modernEquivalent: 'بين رأس مسندم (عُمان) ورأس الشيخ مسعود (إيران)',
                width_km: 54,
                coordinates: { lat: 26.5, lon: 56.5 },
            },
            west: {
                description: 'الساحل العربي — المملكة العربية السعودية + قطر + الإمارات + الكويت + البحرين',
                countries: ['SA', 'KW', 'QA', 'AE', 'BH'],
            },
            east: {
                description: 'الساحل الشرقي — إيران (فارس وخوزستان وبندر عباس)',
                geopoliticalNote: 'يُعرف لدى المسلمين العرب بالخليج العربي، أُطلق عليه تاريخياً خليج فارس في الخرائط الغربية',
            },
        },

        dimensions: {
            length_km: 989,
            maxWidth_km: 338,
            averageDepth_m: 50,
            area_km2: 251000,
            majorIslands: ['البحرين', 'أبو موسى (إماراتية)', 'طنب الكبرى والصغرى (إماراتية)', 'قشم (إيران)', 'كيش (إيران)'],
        },

        coastalCountries: [
            { code: 'SA', name: 'المملكة العربية السعودية', coastLength_km: 560, majorPorts: ['الجبيل', 'الدمام', 'رأس تنورة'] },
            { code: 'KW', name: 'الكويت', coastLength_km: 499, majorPorts: ['ميناء الكويت', 'الشعيبة', 'الزور'] },
            { code: 'BH', name: 'البحرين', coastLength_km: 161, majorPorts: ['المنامة', 'خليج البحرين'] },
            { code: 'QA', name: 'قطر', coastLength_km: 563, majorPorts: ['الدوحة', 'ميناء مسيعيد', 'رأس لفان'] },
            { code: 'AE', name: 'الإمارات العربية المتحدة', coastLength_km: 1318, majorPorts: ['أبو ظبي', 'جبل علي', 'الفجيرة'] },
            { code: 'OM', name: 'عُمان (مضيق هرمز)', coastLength_km: 2092, majorPorts: ['صحار', 'مسقط (بحر العرب)', 'مدخل هرمز'] },
            { code: 'IQ', name: 'العراق (المنفذ الضيق)', coastLength_km: 58, majorPorts: ['أم قصر', 'أبو فلوس'] },
        ],

        strategicSignificance: {
            economic: 'يمر عبر الخليج العربي 20% من نفط العالم — أهم ممر طاقة دولي',
            islamic: 'يربط دول الجزيرة العربية (أرض الرسالة) ببحار الشرق وطرق التجارة الإسلامية التاريخية',
            historical: 'كان طريقاً للتجارة الإسلامية بين الجزيرة وبلاد فارس والهند منذ فجر الإسلام',
        },

        majapahitRoute: {
            description: 'طريق التجارة الإسلامية الكلاسيكي عبر الخليج',
            route: 'البصرة ← الكويت ← البحرين ← قطر ← أبو ظبي ← دبي ← مسقط ← الهند ← جنوب شرق آسيا',
            islamicMerchants: 'حملوا الإسلام مع التجارة إلى مالاكا وجاوا وجزر الفلبين',
        },

        noHarm: {
            principle: 'لا ضرر ولا ضرار',
            forbiddenUseCases: [
                'استخدام البيانات الجغرافية لتبرير نزاعات سياسية أو تدخلات عسكرية',
                'استغلال البيانات في التجسس أو إضرار الدول الساحلية',
            ],
            allowedPurposes: [
                'التعريف الجغرافي والثقافي والتاريخي',
                'خدمة التجارة الحلال والبحث الأكاديمي',
                'دعم الاتحاد والتكامل الخليجي المبني على العدل',
            ],
        },
    };
}

/**
 * خريطة الدول العربية الإسلامية وعلاقتها بالجزيرة
 */
function buildArabWorldContext() {
    return {
        title: 'السياق العربي والإسلامي الموسع',
        qiblaCenter: {
            city: 'مكة المكرمة',
            lat: 21.4225,
            lon: 39.8262,
            significance: 'قبلة المسلمين — مركز الرسالة',
            quranicRef: 'إن أول بيت وضع للناس للذي ببكة مباركاً (آل عمران:96)',
        },
        propheticCity: {
            city: 'المدينة المنورة',
            lat: 24.5247,
            lon: 39.5692,
            significance: 'دار الهجرة — مستقر السنة النبوية',
            hadithRef: 'المدينة خير لهم لو كانوا يعلمون (مسلم)',
        },
        arabLeagueContext: {
            founded: '1945 / 1364هـ',
            members: 22,
            note: 'الجامعة تضم دول عربية تمتد من المحيط الأطلسي إلى الخليج العربي',
        },
        islamicConferenceContext: {
            name: 'منظمة التعاون الإسلامي',
            members: 57,
            hq: 'جدة — قلب الجزيرة العربية',
            note: 'تجمع دول ذات أغلبية مسلمة على امتداد القارات الست',
        },
    };
}

function main() {
    ensureDir(DATA_DIR);
    ensureDir(REPORTS_DIR);

    const arabianPeninsula = buildArabianPeninsulaDefinition();
    const arabianGulf = buildArabianGulfDefinition();
    const arabWorldContext = buildArabWorldContext();

    const fullData = {
        generatedAt: new Date().toISOString(),
        title: 'رقمنة حدود الجزيرة العربية والخليج العربي — بالكتاب والسنة',
        unifiedForAllah: true,
        basis: 'الكتاب والسنة والمصادر الإسلامية المعتمدة',
        arabianPeninsula,
        arabianGulf,
        arabWorldContext,
        noHarm: {
            globalPrinciple: 'لا ضرر ولا ضرار',
            ruleOfJustice: 'إن الله يأمر بالعدل والإحسان (النحل:90)',
            forbiddenUseCases: [
                'استخدام المعلومات الجغرافية لإثارة نزاعات أو فتن',
                'توظيفها في تبرير احتلال أو ضم قسري',
                'استخدامها لأغراض عسكرية عدوانية',
            ],
        },
    };

    const outputPath = path.join(DATA_DIR, 'sheikha-arabian-boundaries-definition.json');

    // حفظ نسخة احتياطية إن وُجدت
    if (fs.existsSync(outputPath)) {
        const stamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
        fs.copyFileSync(outputPath, `${outputPath}.bak-${stamp}`);
    }

    fs.writeFileSync(outputPath, JSON.stringify(fullData, null, 2), 'utf8');
    const hash = sha256File(outputPath);

    // تقرير HTML
    const htmlReport = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>حدود الجزيرة العربية والخليج العربي — شيخة</title>
<style>
  body { font-family: 'Tajawal', Arial, sans-serif; background:#0a0a0a; color:#e0e0e0; direction:rtl; padding:20px; }
  h1 { color:#D4AF37; } h2 { color:#B87333; } h3 { color:#d4d4d4; }
  .card { background:#1a1a1a; border:1px solid #3a3a3a; border-radius:8px; padding:16px; margin:12px 0; }
  .gold { color:#D4AF37; } .copper { color:#B87333; }
  .badge { background:#2a2a2a; border-radius:4px; padding:2px 8px; font-size:0.85em; margin:2px; display:inline-block; }
  table { width:100%; border-collapse:collapse; margin:8px 0; }
  th { background:#2a2a2a; color:#D4AF37; padding:8px; }
  td { padding:8px; border-bottom:1px solid #2a2a2a; }
  .quran { border-right:3px solid #D4AF37; padding-right:12px; font-style:italic; }
  .hadith { border-right:3px solid #B87333; padding-right:12px; font-style:italic; }
  .no-harm { background:#1a2a1a; border:1px solid #2d5a2d; border-radius:6px; padding:12px; }
</style>
</head>
<body>
<h1>🕌 حدود الجزيرة العربية والخليج العربي</h1>
<p class="gold">رقمنة بالكتاب والسنة والمصادر الإسلامية — وحدها لله</p>
<p>تاريخ الإنشاء: ${fullData.generatedAt} | SHA256: <code style="font-size:0.7em">${hash}</code></p>

<h2>الجزيرة العربية</h2>
<div class="card">
  <h3 class="gold">الأساس الشرعي</h3>
  ${arabianPeninsula.shariahBasis.primaryTexts.map(t => `
    <div class="${t.type === 'Quran' ? 'quran' : 'hadith'}" style="margin:8px 0">
      <strong>${t.type === 'Quran' ? 'قرآن كريم' : 'سنة نبوية'}</strong> — ${t.source}<br>
      "${t.text}"<br>
      <small class="copper">${t.significance || ''}</small>
    </div>`).join('')}
</div>

<div class="card">
  <h3 class="gold">تعريفات العلماء للحدود</h3>
  <table>
    <tr><th>العالم</th><th>التعريف</th></tr>
    ${arabianPeninsula.shariahBasis.scholarDefinitions.map(s => `
      <tr><td class="copper">${s.scholar}</td><td>${s.definition}</td></tr>`).join('')}
  </table>
</div>

<div class="card">
  <h3 class="gold">الحدود الجغرافية الأربعة</h3>
  <table>
    <tr><th>الجهة</th><th>الوصف</th><th>المعادل الحديث</th></tr>
    <tr><td>الشمال</td><td>${arabianPeninsula.geographicBoundaries.north.description}</td><td>${arabianPeninsula.geographicBoundaries.north.modernEquivalent}</td></tr>
    <tr><td>الجنوب</td><td>${arabianPeninsula.geographicBoundaries.south.description}</td><td>${arabianPeninsula.geographicBoundaries.south.modernEquivalent}</td></tr>
    <tr><td>الشرق</td><td>${arabianPeninsula.geographicBoundaries.east.description}</td><td>${arabianPeninsula.geographicBoundaries.east.modernEquivalent}</td></tr>
    <tr><td>الغرب</td><td>${arabianPeninsula.geographicBoundaries.west.description}</td><td>${arabianPeninsula.geographicBoundaries.west.modernEquivalent}</td></tr>
  </table>
</div>

<div class="card">
  <h3 class="gold">الأقاليم التاريخية</h3>
  ${arabianPeninsula.historicRegions.map(r => `
    <div style="margin:8px 0; border-right:2px solid #D4AF37; padding-right:10px">
      <strong class="gold">${r.name}</strong> — ${r.significance}
      <br><small>${r.cities.join(' | ')}</small>
    </div>`).join('')}
</div>

<h2>الخليج العربي</h2>
<div class="card">
  <h3 class="gold">الحدود الجغرافية</h3>
  <p>الطول: ${arabianGulf.dimensions.length_km} كم | الأعمق: ${arabianGulf.dimensions.averageDepth_m} م | المساحة: ${arabianGulf.dimensions.area_km2.toLocaleString()} كم²</p>
  
  <h3 class="gold">الدول الساحلية العربية</h3>
  <table>
    <tr><th>الدولة</th><th>طول الساحل</th><th>الموانئ الرئيسية</th></tr>
    ${arabianGulf.coastalCountries.filter(c => c.code !== 'IQ' || true).map(c => `
      <tr><td>${c.name}</td><td>${c.coastLength_km} كم</td><td>${c.majorPorts.join(', ')}</td></tr>`).join('')}
  </table>
</div>

<div class="card">
  <h3 class="gold">الأهمية الاستراتيجية</h3>
  <p><strong>اقتصادية:</strong> ${arabianGulf.strategicSignificance.economic}</p>
  <p><strong>إسلامية:</strong> ${arabianGulf.strategicSignificance.islamic}</p>
  <p><strong>تاريخية:</strong> ${arabianGulf.strategicSignificance.historical}</p>
</div>

<div class="no-harm">
  <h3 class="gold">ضوابط لا ضرر ولا ضرار</h3>
  <p><strong>المقاصد المشروعة:</strong></p>
  <ul>${arabianPeninsula.noHarm.allowedPurposes.map(p => `<li>${p}</li>`).join('')}</ul>
  <p><strong>محظور:</strong></p>
  <ul>${fullData.noHarm.forbiddenUseCases.map(u => `<li>${u}</li>`).join('')}</ul>
</div>

<p style="text-align:center; color:#555; margin-top:30px">منظومة شيخة — وحدها لله — ${new Date().getFullYear()}</p>
</body></html>`;

    const reportPath = path.join(REPORTS_DIR, 'sheikha-arabian-boundaries-report.html');
    fs.writeFileSync(reportPath, htmlReport, 'utf8');

    console.log('✅ حدود الجزيرة العربية والخليج العربي رُقِّمت بالكتاب والسنة');
    console.log(`   📄 البيانات: ${path.relative(ROOT_DIR, outputPath)}`);
    console.log(`   📊 التقرير: ${path.relative(ROOT_DIR, reportPath)}`);
    console.log(`   🔒 SHA256: ${hash.slice(0, 16)}...`);
}

main();
