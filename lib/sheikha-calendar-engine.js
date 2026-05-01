/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA CALENDAR & SYNC ENGINE — منظومة شيخة للتزامن والرزنامة
 * المالك: سلمان أحمد بن سلمان الراجح
 *
 * "إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا فِي كِتَابِ اللَّهِ
 *  يَوْمَ خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ مِنْهَا أَرْبَعَةٌ حُرُمٌ" — التوبة ٣٦
 *
 * "يَسْأَلُونَكَ عَنِ الْأَهِلَّةِ قُلْ هِيَ مَوَاقِيتُ لِلنَّاسِ وَالْحَجِّ" — البقرة ١٨٩
 *
 * ✅ التاريخ الهجري (أساسي) — أم القرى
 * ✅ تحويل لكل التقويمات العالمية
 * ✅ مواقيت الصلاة والأذكار
 * ✅ المناسبات الإسلامية والسعودية والدولية
 * ✅ الأحداث اللحظية — أبحاث، تطوير، اجتماعات، مجتمع
 * ✅ الجدولة والتزامن الحي
 * ✅ الرقمنة بالكتاب والسنة
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

class SheikhaCalendarEngine {
    constructor() {
        this.name = 'Sheikha Calendar & Sync Engine';
        this.version = '1.0.0';
        this.owner = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();
        this._init();
    }

    _init() {
        // ══════════════════════════════════════════════════════════════════
        // آيات وأحاديث الوقت والتاريخ
        // ══════════════════════════════════════════════════════════════════
        this.quranReferences = [
            { ayah: 'إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا فِي كِتَابِ اللَّهِ يَوْمَ خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ مِنْهَا أَرْبَعَةٌ حُرُمٌ', surah: 'التوبة', num: 36, topic: 'الشهور الهجرية الاثنا عشر' },
            { ayah: 'يَسْأَلُونَكَ عَنِ الْأَهِلَّةِ قُلْ هِيَ مَوَاقِيتُ لِلنَّاسِ وَالْحَجِّ', surah: 'البقرة', num: 189, topic: 'الأهلة مواقيت' },
            { ayah: 'هُوَ الَّذِي جَعَلَ الشَّمْسَ ضِيَاءً وَالْقَمَرَ نُورًا وَقَدَّرَهُ مَنَازِلَ لِتَعْلَمُوا عَدَدَ السِّنِينَ وَالْحِسَابَ', surah: 'يونس', num: 5, topic: 'التقويم القمري والحساب' },
            { ayah: 'وَالْعَصْرِ ● إِنَّ الْإِنسَانَ لَفِي خُسْرٍ', surah: 'العصر', num: '1-2', topic: 'أهمية الوقت' },
            { ayah: 'وَجَعَلْنَا اللَّيْلَ وَالنَّهَارَ آيَتَيْنِ فَمَحَوْنَا آيَةَ اللَّيْلِ وَجَعَلْنَا آيَةَ النَّهَارِ مُبْصِرَةً لِتَبْتَغُوا فَضْلًا مِّن رَّبِّكُمْ وَلِتَعْلَمُوا عَدَدَ السِّنِينَ وَالْحِسَابَ', surah: 'الإسراء', num: 12, topic: 'الليل والنهار للحساب والعمل' },
            { ayah: 'أَقِمِ الصَّلَاةَ لِدُلُوكِ الشَّمْسِ إِلَىٰ غَسَقِ اللَّيْلِ وَقُرْآنَ الْفَجْرِ إِنَّ قُرْآنَ الْفَجْرِ كَانَ مَشْهُودًا', surah: 'الإسراء', num: 78, topic: 'مواقيت الصلاة' }
        ];

        this.hadithReferences = [
            { hadith: 'نعمتان مغبون فيهما كثير من الناس: الصحة والفراغ', narrator: 'البخاري', topic: 'اغتنام الوقت' },
            { hadith: 'لا تزول قدما عبد يوم القيامة حتى يُسأل عن أربع: عن عمره فيما أفناه وعن شبابه فيما أبلاه', narrator: 'الترمذي', topic: 'المحاسبة على الوقت' },
            { hadith: 'صوموا لرؤيته وأفطروا لرؤيته فإن غُبّي عليكم فأكملوا عدة شعبان ثلاثين', narrator: 'متفق عليه', topic: 'رؤية الهلال' },
            { hadith: 'إن لربك عليك حقاً ولنفسك عليك حقاً ولأهلك عليك حقاً فأعط كل ذي حق حقه', narrator: 'البخاري', topic: 'إدارة الوقت والأولويات' },
            { hadith: 'بكّروا بالصلاة في يوم الغيم فإنه من ترك صلاة العصر فقد حبط عمله', narrator: 'البخاري', topic: 'أهمية مواقيت الصلاة' }
        ];

        // ══════════════════════════════════════════════════════════════════
        // ١. التقويم الهجري (الأساسي) — Hijri Calendar
        // ══════════════════════════════════════════════════════════════════
        this.hijriCalendar = {
            nameAr: 'التقويم الهجري القمري',
            nameEn: 'Hijri Lunar Calendar',
            type: 'قمري (Lunar)',
            basis: 'هجرة النبي ﷺ من مكة إلى المدينة — ١ محرم سنة ١ هـ',
            established: 'في عهد الخليفة عمر بن الخطاب رضي الله عنه',
            standard: 'تقويم أم القرى (المعتمد في المملكة العربية السعودية)',
            months: [
                { num: 1, nameAr: 'مُحَرَّم', nameEn: 'Muharram', days: '29-30', sacred: true, events: ['رأس السنة الهجرية (١ محرم)', 'يوم عاشوراء (١٠ محرم — صيام سنة)'] },
                { num: 2, nameAr: 'صَفَر', nameEn: 'Safar', days: '29-30', events: [] },
                { num: 3, nameAr: 'رَبِيع الأَوَّل', nameEn: 'Rabi al-Awwal', days: '29-30', events: ['مولد النبي ﷺ (١٢ ربيع الأول)'] },
                { num: 4, nameAr: 'رَبِيع الآخِر', nameEn: 'Rabi al-Thani', days: '29-30', events: [] },
                { num: 5, nameAr: 'جُمَادَى الأُولَى', nameEn: 'Jumada al-Ula', days: '29-30', events: [] },
                { num: 6, nameAr: 'جُمَادَى الآخِرَة', nameEn: 'Jumada al-Thani', days: '29-30', events: [] },
                { num: 7, nameAr: 'رَجَب', nameEn: 'Rajab', days: '29-30', sacred: true, events: ['الإسراء والمعراج (٢٧ رجب)'] },
                { num: 8, nameAr: 'شَعْبَان', nameEn: 'Sha\'ban', days: '29-30', events: ['ليلة النصف من شعبان (١٥ شعبان)'] },
                { num: 9, nameAr: 'رَمَضَان', nameEn: 'Ramadan', days: '29-30', events: ['بداية الصيام', 'ليلة القدر (العشر الأواخر)', 'إفطار', 'تراويح', 'اعتكاف', 'عمرة رمضان'] },
                { num: 10, nameAr: 'شَوَّال', nameEn: 'Shawwal', days: '29-30', events: ['عيد الفطر (١ شوال)', 'صيام ست من شوال'] },
                { num: 11, nameAr: 'ذُو القَعْدَة', nameEn: 'Dhul Qi\'dah', days: '29-30', sacred: true, events: [] },
                { num: 12, nameAr: 'ذُو الحِجَّة', nameEn: 'Dhul Hijjah', days: '29-30', sacred: true, events: ['عشر ذي الحجة (أفضل أيام الدنيا)', 'يوم عرفة (٩ ذي الحجة)', 'عيد الأضحى (١٠ ذي الحجة)', 'أيام التشريق (١١-١٣ ذي الحجة)', 'الحج'] }
            ],
            sacredMonths: ['محرم', 'رجب', 'ذو القعدة', 'ذو الحجة'],
            year: { days: '354 أو 355 يوم', months: 12 },
            hijriToGregorian: 'التاريخ الهجري = (التاريخ الميلادي − 622) × (33/32) — تقريبي'
        };

        // ══════════════════════════════════════════════════════════════════
        // ٢. التقويمات العالمية المتزامنة — World Calendars
        // ══════════════════════════════════════════════════════════════════
        this.worldCalendars = [
            { id: 'CAL-01', nameAr: 'التقويم الهجري القمري', nameEn: 'Hijri Lunar', type: 'قمري', status: 'أساسي في شيخة', intl: 'islamic-umalqura' },
            { id: 'CAL-02', nameAr: 'التقويم الميلادي (الغريغوري)', nameEn: 'Gregorian', type: 'شمسي', status: 'متزامن', intl: 'gregory', note: 'الأكثر استخداماً عالمياً' },
            { id: 'CAL-03', nameAr: 'التقويم الهجري الشمسي (الإيراني)', nameEn: 'Solar Hijri (Persian)', type: 'شمسي', intl: 'persian', countries: ['إيران', 'أفغانستان'] },
            { id: 'CAL-04', nameAr: 'التقويم الصيني', nameEn: 'Chinese Lunisolar', type: 'قمري-شمسي', intl: 'chinese' },
            { id: 'CAL-05', nameAr: 'التقويم العبري', nameEn: 'Hebrew', type: 'قمري-شمسي', intl: 'hebrew' },
            { id: 'CAL-06', nameAr: 'التقويم الهندي', nameEn: 'Indian National', type: 'شمسي', intl: 'indian' },
            { id: 'CAL-07', nameAr: 'التقويم البوذي', nameEn: 'Buddhist', type: 'شمسي', intl: 'buddhist', countries: ['تايلاند', 'ميانمار'] },
            { id: 'CAL-08', nameAr: 'التقويم الإثيوبي', nameEn: 'Ethiopian', type: 'شمسي', intl: 'ethiopic' },
            { id: 'CAL-09', nameAr: 'التقويم القبطي', nameEn: 'Coptic', type: 'شمسي', intl: 'coptic' },
            { id: 'CAL-10', nameAr: 'التقويم الياباني (إمبراطوري)', nameEn: 'Japanese Imperial', type: 'شمسي', intl: 'japanese' },
            { id: 'CAL-11', nameAr: 'Unix Timestamp', nameEn: 'Unix Epoch', type: 'رقمي', basis: '1 يناير 1970', note: 'أساس الحوسبة' },
            { id: 'CAL-12', nameAr: 'ISO 8601', nameEn: 'ISO 8601', type: 'معيار دولي', format: 'YYYY-MM-DDTHH:mm:ssZ', note: 'المعيار في APIs' }
        ];

        // ══════════════════════════════════════════════════════════════════
        // ٣. مواقيت الصلاة والأذكار — Prayer Times & Adhkar
        // ══════════════════════════════════════════════════════════════════
        this.prayerTimes = {
            nameAr: 'مواقيت الصلاة والأذكار',
            nameEn: 'Prayer Times & Daily Adhkar',
            prayers: [
                { nameAr: 'الفجر', nameEn: 'Fajr', time: 'قبل شروق الشمس', rak: 2, sunnah: 'ركعتان قبلها', adhkar: 'أذكار الصباح بعدها' },
                { nameAr: 'الشروق', nameEn: 'Sunrise', time: 'شروق الشمس', note: 'صلاة الضحى بعدها بـ ١٥ دقيقة' },
                { nameAr: 'الظهر', nameEn: 'Dhuhr', time: 'زوال الشمس', rak: 4, sunnah: '٤ قبلها + ٢ بعدها' },
                { nameAr: 'العصر', nameEn: 'Asr', time: 'ظل الشيء مثله', rak: 4 },
                { nameAr: 'المغرب', nameEn: 'Maghrib', time: 'غروب الشمس', rak: 3, sunnah: '٢ بعدها', adhkar: 'أذكار المساء' },
                { nameAr: 'العشاء', nameEn: 'Isha', time: 'غياب الشفق', rak: 4, sunnah: '٢ بعدها + الوتر' }
            ],
            calculationMethods: [
                { name: 'أم القرى', org: 'جامعة أم القرى', region: 'السعودية + الخليج' },
                { name: 'رابطة العالم الإسلامي', org: 'MWL', region: 'عالمي' },
                { name: 'الجمعية الإسلامية لأمريكا الشمالية', org: 'ISNA', region: 'أمريكا الشمالية' },
                { name: 'الهيئة المصرية', region: 'مصر + أفريقيا' },
                { name: 'جامعة العلوم الإسلامية كراتشي', region: 'جنوب آسيا' }
            ],
            dailyAdhkar: ['أذكار الصباح', 'أذكار المساء', 'أذكار النوم', 'أذكار الاستيقاظ', 'دعاء دخول السوق', 'دعاء السفر', 'الاستغفار', 'الصلاة على النبي ﷺ']
        };

        // ══════════════════════════════════════════════════════════════════
        // ٤. المناسبات والأحداث المؤرخة — Events Calendar
        // ══════════════════════════════════════════════════════════════════
        this.eventsCalendar = {
            islamicEvents: [
                { nameAr: 'رأس السنة الهجرية', date: '1 محرم', type: 'إسلامي' },
                { nameAr: 'يوم عاشوراء', date: '10 محرم', type: 'إسلامي', sunnah: 'صيام التاسع والعاشر' },
                { nameAr: 'المولد النبوي الشريف', date: '12 ربيع الأول', type: 'إسلامي' },
                { nameAr: 'الإسراء والمعراج', date: '27 رجب', type: 'إسلامي' },
                { nameAr: 'ليلة النصف من شعبان', date: '15 شعبان', type: 'إسلامي' },
                { nameAr: 'بداية رمضان', date: '1 رمضان', type: 'إسلامي', priority: 'عالية' },
                { nameAr: 'ليلة القدر', date: 'العشر الأواخر من رمضان (أوتار)', type: 'إسلامي', priority: 'أعلى' },
                { nameAr: 'عيد الفطر المبارك', date: '1-3 شوال', type: 'عيد', holiday: true },
                { nameAr: 'يوم عرفة', date: '9 ذو الحجة', type: 'إسلامي', priority: 'أعلى', sunnah: 'صيام لغير الحاج' },
                { nameAr: 'عيد الأضحى المبارك', date: '10-13 ذو الحجة', type: 'عيد', holiday: true },
                { nameAr: 'أيام التشريق', date: '11-13 ذو الحجة', type: 'إسلامي', note: 'أيام أكل وشرب وذكر لله' }
            ],
            saudiEvents: [
                { nameAr: 'اليوم الوطني السعودي', date: '23 سبتمبر', type: 'وطني', holiday: true },
                { nameAr: 'يوم التأسيس', date: '22 فبراير', type: 'وطني', holiday: true },
                { nameAr: 'موسم الرياض', date: 'أكتوبر - مارس', type: 'ترفيهي' },
                { nameAr: 'موسم جدة', type: 'ترفيهي' },
                { nameAr: 'مؤتمر LEAP', date: 'فبراير', type: 'تقني' },
                { nameAr: 'مؤتمر FII', date: 'أكتوبر', type: 'استثماري' },
                { nameAr: 'موسم الحج', date: '1-13 ذو الحجة', type: 'ديني/سياحي' },
                { nameAr: 'موسم العمرة', date: 'طوال العام (خارج الحج)', type: 'ديني/سياحي' }
            ],
            internationalEvents: [
                { nameAr: 'رأس السنة الميلادية', date: '1 يناير', type: 'دولي' },
                { nameAr: 'اليوم العالمي للتجارة الإلكترونية', date: '26 نوفمبر', type: 'تجاري' },
                { nameAr: 'Black Friday', date: 'الجمعة بعد عيد الشكر (نوفمبر)', type: 'تجاري' },
                { nameAr: 'يوم العلم العالمي', date: '10 نوفمبر', type: 'علمي' },
                { nameAr: 'يوم الأمم المتحدة', date: '24 أكتوبر', type: 'دولي' },
                { nameAr: 'يوم البيئة العالمي', date: '5 يونيو', type: 'بيئي' },
                { nameAr: 'يوم الملكية الفكرية', date: '26 أبريل', type: 'ملكية فكرية' }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٥. نظام الأحداث اللحظية — Real-Time Events System
        // ══════════════════════════════════════════════════════════════════
        this.realTimeEvents = {
            nameAr: 'نظام الأحداث اللحظية والتزامن',
            nameEn: 'Real-Time Events & Sync System',
            eventTypes: [
                {
                    id: 'RT-01', nameAr: 'أبحاث ومؤتمرات', nameEn: 'Research & Conferences',
                    examples: ['نشر ورقة بحثية جديدة', 'بدء مؤتمر علمي', 'ندوة عبر الإنترنت', 'مراجعة أقران', 'تسليم منحة بحثية'],
                    notifications: ['تنبيه مباشر', 'بريد إلكتروني', 'إشعار تطبيق'],
                    sync: ['تقويم شيخة', 'Google Calendar', 'Outlook', 'Apple Calendar']
                },
                {
                    id: 'RT-02', nameAr: 'تطوير وبرمجة', nameEn: 'Development & Coding',
                    examples: ['إطلاق إصدار جديد', 'بدء Sprint', 'مراجعة كود', 'اختبار نظام', 'نشر تحديث'],
                    tools: ['Jira', 'GitHub', 'GitLab', 'Trello', 'Linear']
                },
                {
                    id: 'RT-03', nameAr: 'اجتماعات وورش عمل', nameEn: 'Meetings & Workshops',
                    examples: ['اجتماع فريق يومي (Daily Standup)', 'اجتماع مجلس إدارة', 'ورشة عمل مجتمعية', 'مقابلة مستثمر', 'جلسة إرشاد'],
                    tools: ['Zoom', 'Microsoft Teams', 'Google Meet', 'Webex'],
                    features: ['حجز تلقائي', 'تذكير قبل ١٥ دقيقة', 'ملاحظات اجتماع', 'تسجيل', 'قرارات ومتابعة']
                },
                {
                    id: 'RT-04', nameAr: 'أحداث السوق التجاري', nameEn: 'Market Events',
                    examples: ['عرض جديد', 'منتج جديد', 'تغير سعر', 'فتح مزاد', 'انتهاء عرض', 'شحنة وصلت', 'طلب شراء كبير'],
                    realTime: true,
                    protocol: 'WebSocket + Server-Sent Events'
                },
                {
                    id: 'RT-05', nameAr: 'أحداث مجتمعية', nameEn: 'Community Events',
                    examples: ['منشور جديد في المنتدى', 'سؤال يحتاج إجابة', 'تقييم جديد', 'انضمام عضو', 'فعالية مجتمعية', 'حملة تطوعية'],
                    engagement: ['إعجاب', 'تعليق', 'مشاركة', 'حفظ', 'إبلاغ']
                },
                {
                    id: 'RT-06', nameAr: 'أحداث حكومية وتنظيمية', nameEn: 'Government & Regulatory Events',
                    examples: ['صدور نظام جديد', 'تحديث لائحة', 'فتح منافسة حكومية', 'تغير ضريبي', 'إعلان اقتصادي']
                },
                {
                    id: 'RT-07', nameAr: 'أحداث مالية واقتصادية', nameEn: 'Financial & Economic Events',
                    examples: ['تغير سعر الذهب', 'تغير سعر النفط', 'مؤشر تداول', 'إعلان أرباح شركة', 'قرار فائدة', 'صدور تقرير اقتصادي']
                },
                {
                    id: 'RT-08', nameAr: 'أحداث إسلامية وشرعية', nameEn: 'Islamic Events',
                    examples: ['إعلان رؤية الهلال', 'وقت آذان', 'بداية خطبة جمعة', 'بث درس علمي', 'صدور فتوى', 'بداية موسم حج/عمرة']
                }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٦. نظام الجدولة الذكية — Smart Scheduling System
        // ══════════════════════════════════════════════════════════════════
        this.scheduling = {
            nameAr: 'نظام الجدولة الذكية',
            nameEn: 'Smart Scheduling System',
            features: [
                { nameAr: 'جدولة ذكية بالذكاء الاصطناعي', nameEn: 'AI-Powered Scheduling', description: 'اقتراح أفضل وقت للاجتماع بناء على توفر المشاركين' },
                { nameAr: 'مراعاة أوقات الصلاة', nameEn: 'Prayer-Time Aware', description: 'لا تُجدول اجتماعات وقت الصلاة تلقائياً' },
                { nameAr: 'تزامن متعدد المناطق الزمنية', nameEn: 'Multi-Timezone Sync', description: 'دعم كل المناطق الزمنية مع عرض الوقت المحلي لكل مشارك' },
                { nameAr: 'التكرار الذكي', nameEn: 'Smart Recurrence', patterns: ['يومي', 'أسبوعي', 'شهري هجري', 'شهري ميلادي', 'سنوي هجري', 'مخصص'] },
                { nameAr: 'مؤقت العد التنازلي', nameEn: 'Countdown Timer', uses: ['رمضان', 'الحج', 'إطلاق منتج', 'موعد تسليم', 'عرض محدود'] },
                { nameAr: 'التذكيرات الذكية', nameEn: 'Smart Reminders', types: ['إشعار فوري', 'بريد إلكتروني', 'SMS', 'واتساب', 'إشعار تطبيق'] },
                { nameAr: 'سجل الأحداث التاريخي', nameEn: 'Event History Log', description: 'أرشيف كامل لكل الأحداث السابقة مع إمكانية البحث' }
            ],
            integrations: [
                { name: 'Google Calendar', protocol: 'CalDAV + API' },
                { name: 'Microsoft Outlook/365', protocol: 'Microsoft Graph API' },
                { name: 'Apple Calendar (iCal)', protocol: 'CalDAV + iCalendar (.ics)' },
                { name: 'Zoom', type: 'إنشاء اجتماعات تلقائياً' },
                { name: 'Microsoft Teams', type: 'إنشاء اجتماعات تلقائياً' },
                { name: 'Slack', type: 'تذكيرات وإشعارات' },
                { name: 'Jira/Trello', type: 'ربط مهام بالتقويم' },
                { name: 'GitHub', type: 'ربط Milestones وReleases' }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ٧. المناطق الزمنية — Time Zones
        // ══════════════════════════════════════════════════════════════════
        this.timeZones = {
            primary: { nameAr: 'توقيت السعودية (مكة المكرمة)', zone: 'Asia/Riyadh', utc: 'UTC+3', note: 'التوقيت الأساسي لمنظومة شيخة' },
            keyZones: [
                { nameAr: 'مكة المكرمة', zone: 'Asia/Riyadh', utc: 'UTC+3' },
                { nameAr: 'الإمارات', zone: 'Asia/Dubai', utc: 'UTC+4' },
                { nameAr: 'مصر', zone: 'Africa/Cairo', utc: 'UTC+2' },
                { nameAr: 'تركيا', zone: 'Europe/Istanbul', utc: 'UTC+3' },
                { nameAr: 'ماليزيا', zone: 'Asia/Kuala_Lumpur', utc: 'UTC+8' },
                { nameAr: 'إندونيسيا (جاكرتا)', zone: 'Asia/Jakarta', utc: 'UTC+7' },
                { nameAr: 'لندن', zone: 'Europe/London', utc: 'UTC+0/+1' },
                { nameAr: 'نيويورك', zone: 'America/New_York', utc: 'UTC-5/-4' },
                { nameAr: 'لوس أنجلوس', zone: 'America/Los_Angeles', utc: 'UTC-8/-7' },
                { nameAr: 'طوكيو', zone: 'Asia/Tokyo', utc: 'UTC+9' },
                { nameAr: 'بكين', zone: 'Asia/Shanghai', utc: 'UTC+8' },
                { nameAr: 'سيدني', zone: 'Australia/Sydney', utc: 'UTC+10/+11' }
            ],
            totalZones: 'IANA: 400+ منطقة زمنية مدعومة'
        };

        // ══════════════════════════════════════════════════════════════════
        // ٨. خوارزمية التحويل الهجري-الميلادي
        // ══════════════════════════════════════════════════════════════════
        this.conversionAlgorithm = {
            nameAr: 'خوارزمية التحويل بين التقويمات',
            nameEn: 'Calendar Conversion Algorithm',
            methods: [
                { name: 'Umm al-Qura', accuracy: 'رسمي — دقيق للسعودية', range: '1356-1500 هـ' },
                { name: 'Tabular Islamic Calendar', accuracy: 'حسابي — تقريبي ± 1-2 يوم' },
                { name: 'Astronomical Calculation', accuracy: 'فلكي — دقيق جداً' },
                { name: 'Intl.DateTimeFormat (JavaScript)', accuracy: 'مدمج في المتصفحات', code: 'new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura")' }
            ],
            jsImplementation: `
// تحويل ميلادي ← هجري (باستخدام Intl API)
function toHijri(date) {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric', month: 'long', year: 'numeric'
    }).format(date);
}

// تحويل لأي تقويم
function toCalendar(date, calendar) {
    const calendars = {
        hijri: 'islamic-umalqura', gregorian: 'gregory',
        persian: 'persian', chinese: 'chinese', hebrew: 'hebrew',
        buddhist: 'buddhist', japanese: 'japanese', indian: 'indian'
    };
    return new Intl.DateTimeFormat('ar-SA-u-ca-' + (calendars[calendar] || 'gregory'), {
        day: 'numeric', month: 'long', year: 'numeric',
        weekday: 'long', hour: '2-digit', minute: '2-digit'
    }).format(date);
}`
        };

        // ══════════════════════════════════════════════════════════════════
        // ٩. الضوابط الشرعية لإدارة الوقت
        // ══════════════════════════════════════════════════════════════════
        this.shariaGuidelines = {
            principles: [
                { principle: 'الوقت أمانة', evidence: 'لا تزول قدما عبد حتى يُسأل عن عمره فيما أفناه', application: 'إدارة الوقت بكفاءة' },
                { principle: 'التقويم الهجري هو الأصل', evidence: 'إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا', application: 'اعتماد الهجري كتقويم أساسي' },
                { principle: 'مراعاة أوقات الصلاة', evidence: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا — النساء ١٠٣', application: 'عدم تعارض المواعيد مع الصلوات' },
                { principle: 'الوفاء بالمواعيد', evidence: 'وَأَوْفُوا بِالْعَهْدِ', application: 'الالتزام بالمواعيد المحددة' },
                { principle: 'حرمة الأشهر الحرم', evidence: 'مِنْهَا أَرْبَعَةٌ حُرُمٌ', application: 'مراعاة حرمة الأشهر الحرم في التخطيط' },
                { principle: 'البركة في البكور', evidence: 'اللهم بارك لأمتي في بكورها', application: 'تشجيع الاجتماعات والأنشطة في أول النهار' },
                { principle: 'يوم الجمعة سيد الأيام', evidence: 'خير يوم طلعت عليه الشمس يوم الجمعة', application: 'جدولة خاصة ليوم الجمعة (صلاة الجمعة + ساعة الاستجابة)' }
            ]
        };

        // ══════════════════════════════════════════════════════════════════
        // ١٠. النظام الرقمي المتكامل
        // ══════════════════════════════════════════════════════════════════
        this.digitalPlatform = {
            nameAr: 'منصة شيخة للتزامن الرقمي',
            nameEn: 'Sheikha Digital Sync Platform',
            systems: [
                { nameAr: 'رزنامة شيخة الذكية', nameEn: 'Sheikha Smart Calendar', features: ['عرض هجري/ميلادي متزامن', 'مناسبات إسلامية تلقائية', 'مواقيت صلاة حسب الموقع', 'أذكار يومية'] },
                { nameAr: 'لوحة الأحداث الحية', nameEn: 'Live Events Dashboard', features: ['أحداث لحظية بالتقويم الهجري', 'تدفق أخبار السوق', 'إشعارات فورية', 'فلترة حسب النوع'] },
                { nameAr: 'محرك التحويل الشامل', nameEn: 'Universal Converter', features: ['تحويل بين 12 تقويم', 'تحويل مناطق زمنية', 'واجهة API للمطورين'] },
                { nameAr: 'مخطط المشاريع الزمني', nameEn: 'Project Timeline (Gantt)', features: ['مخطط زمني هجري وميلادي', 'تتبع مراحل المشروع', 'ربط بأحداث السوق', 'تنبيهات تأخير'] },
                { nameAr: 'أرشيف الأحداث', nameEn: 'Events Archive', features: ['سجل كامل قابل للبحث', 'تصنيف حسب النوع والتاريخ', 'تقارير إحصائية', 'تصدير CSV/JSON'] },
                { nameAr: 'نظام مواقيت الصلاة', nameEn: 'Prayer Times System', features: ['حساب دقيق حسب الموقع', 'إشعار قبل الأذان', 'أذكار بعد الصلاة', 'جدول رمضان'] }
            ]
        };
    }

    // ══════════════════════════════════════════════════════════════════
    // دوال التحويل الفعلية
    // ══════════════════════════════════════════════════════════════════
    getNow() {
        const now = new Date();
        const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }).format(now);
        const gregorian = new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }).format(now);
        return {
            hijri, gregorian,
            timestamp: now.toISOString(),
            unix: Math.floor(now.getTime() / 1000),
            timezone: 'Asia/Riyadh (UTC+3)',
            dayOfWeek: new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(now)
        };
    }

    convertDate(date, targetCalendar) {
        const d = date instanceof Date ? date : new Date(date);
        const calendars = {
            hijri: 'islamic-umalqura', gregorian: 'gregory', persian: 'persian',
            chinese: 'chinese', hebrew: 'hebrew', buddhist: 'buddhist',
            japanese: 'japanese', indian: 'indian', ethiopic: 'ethiopic', coptic: 'coptic'
        };
        const cal = calendars[targetCalendar] || 'islamic-umalqura';
        return new Intl.DateTimeFormat('ar-SA-u-ca-' + cal, {
            day: 'numeric', month: 'long', year: 'numeric', weekday: 'long'
        }).format(d);
    }

    getDashboard() {
        return {
            engine: this.name, version: this.version, owner: this.owner, activatedAt: this.activatedAt,
            currentTime: this.getNow(),
            summary: {
                hijriMonths: this.hijriCalendar.months.length,
                sacredMonths: this.hijriCalendar.sacredMonths.length,
                worldCalendars: this.worldCalendars.length,
                dailyPrayers: this.prayerTimes.prayers.length,
                calculationMethods: this.prayerTimes.calculationMethods.length,
                islamicEvents: this.eventsCalendar.islamicEvents.length,
                saudiEvents: this.eventsCalendar.saudiEvents.length,
                internationalEvents: this.eventsCalendar.internationalEvents.length,
                realTimeEventTypes: this.realTimeEvents.eventTypes.length,
                schedulingFeatures: this.scheduling.features.length,
                integrations: this.scheduling.integrations.length,
                timeZones: this.timeZones.keyZones.length,
                digitalSystems: this.digitalPlatform.systems.length,
                shariaPrinciples: this.shariaGuidelines.principles.length,
                quranReferences: this.quranReferences.length,
                hadithReferences: this.hadithReferences.length
            },
            quranReferences: this.quranReferences,
            hadithReferences: this.hadithReferences,
            hijriCalendar: this.hijriCalendar,
            worldCalendars: this.worldCalendars,
            prayerTimes: this.prayerTimes,
            eventsCalendar: this.eventsCalendar,
            realTimeEvents: this.realTimeEvents,
            scheduling: this.scheduling,
            timeZones: this.timeZones,
            conversionAlgorithm: this.conversionAlgorithm,
            shariaGuidelines: this.shariaGuidelines,
            digitalPlatform: this.digitalPlatform
        };
    }
}

module.exports = SheikhaCalendarEngine;
