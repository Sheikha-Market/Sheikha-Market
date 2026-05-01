/**
 * بسم الله الرحمن الرحيم
 * SHEIKHA QURAN & SUNNAH ENGINE — منظومة الكتاب والسنة
 * المالك: سلمان أحمد بن سلمان الراجح
 * "إِنَّ هَذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ" الإسراء 9
 */
'use strict';
class SheikhaQuranSunnahEngine {
    constructor() {
        this.name = 'Sheikha Quran & Sunnah Engine';
        this.nameAr = 'منظومة شيخة للكتاب والسنة';
        this.version = '1.0.0';
        this.owner = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();
        this._init();
    }
    _init() {
        this.quran = {
            nameAr:'القرآن الكريم',nameEn:'The Holy Quran',
            stats:{totalSurahs:114,totalAyahs:6236,totalJuz:30,totalHizb:60,totalPages:604,totalWords:77437,totalLetters:323671,revelationYears:23},
            surahTypes:{makki:86,madani:28},
            sciences:[
                {nameAr:'علم التفسير',nameEn:'Tafsir',desc:'شرح وبيان معاني القرآن',books:['تفسير ابن كثير','تفسير السعدي','تفسير الطبري','تفسير القرطبي','في ظلال القرآن','أضواء البيان']},
                {nameAr:'علم القراءات',nameEn:'Qiraat',desc:'أوجه قراءة القرآن المتواترة',count:'10 قراءات متواترة + 4 شاذة'},
                {nameAr:'علم التجويد',nameEn:'Tajweed',desc:'أحكام تلاوة القرآن',rules:['أحكام النون الساكنة والتنوين','أحكام الميم الساكنة','المدود','الوقف والابتداء','صفات الحروف','مخارج الحروف']},
                {nameAr:'أسباب النزول',nameEn:'Asbab al-Nuzul',desc:'الأحداث التي نزلت الآيات بسببها'},
                {nameAr:'الناسخ والمنسوخ',nameEn:'Nasikh wa Mansukh',desc:'الآيات الناسخة والمنسوخة'},
                {nameAr:'إعجاز القرآن',nameEn:'Quran Miracles',types:['إعجاز لغوي وبياني','إعجاز علمي','إعجاز عددي','إعجاز تشريعي','إعجاز غيبي']},
                {nameAr:'علم المكي والمدني',nameEn:'Makki & Madani',desc:'تصنيف السور حسب مكان النزول'},
                {nameAr:'أحكام القرآن',nameEn:'Ahkam al-Quran',desc:'الآيات المتعلقة بالأحكام الشرعية'}
            ],
            digitalFeatures:[
                'مصحف رقمي بخط عثماني عالي الجودة',
                'بحث بالآية والسورة والموضوع والكلمة',
                'تفسير متعدد (ابن كثير، السعدي، الطبري)',
                'تلاوة صوتية بأصوات عدة قراء',
                'إعراب القرآن الكامل',
                'أسباب النزول لكل آية',
                'ترجمة معاني القرآن بـ 50+ لغة',
                'حفظ تقدم القراءة والحفظ',
                'ورد يومي ذكي',
                'مشاركة الآيات',
                'وضع ليلي مريح للعين'
            ]
        };
        this.sunnah = {
            nameAr:'السنة النبوية',nameEn:'Prophetic Sunnah',
            hadithBooks:[
                {nameAr:'صحيح البخاري',nameEn:'Sahih al-Bukhari',compiler:'محمد بن إسماعيل البخاري',hadithCount:7563,rank:1,desc:'أصح كتاب بعد القرآن'},
                {nameAr:'صحيح مسلم',nameEn:'Sahih Muslim',compiler:'مسلم بن الحجاج',hadithCount:7500,rank:2},
                {nameAr:'سنن أبي داود',nameEn:'Sunan Abu Dawud',compiler:'أبو داود السجستاني',hadithCount:5274,rank:3},
                {nameAr:'سنن الترمذي',nameEn:'Jami at-Tirmidhi',compiler:'محمد بن عيسى الترمذي',hadithCount:3956,rank:4},
                {nameAr:'سنن النسائي',nameEn:'Sunan an-Nasai',compiler:'أحمد بن شعيب النسائي',hadithCount:5758,rank:5},
                {nameAr:'سنن ابن ماجه',nameEn:'Sunan Ibn Majah',compiler:'محمد بن يزيد ابن ماجه',hadithCount:4341,rank:6},
                {nameAr:'مسند أحمد',nameEn:'Musnad Ahmad',compiler:'أحمد بن حنبل',hadithCount:27647,rank:7},
                {nameAr:'موطأ مالك',nameEn:'Muwatta Malik',compiler:'مالك بن أنس',hadithCount:1720,rank:8}
            ],
            hadithSciences:[
                {nameAr:'علم الجرح والتعديل',nameEn:'Jarh wa Tadil',desc:'تقييم رواة الأحاديث'},
                {nameAr:'علم الرجال',nameEn:'Ilm al-Rijal',desc:'دراسة سير الرواة'},
                {nameAr:'مصطلح الحديث',nameEn:'Mustalah al-Hadith',desc:'قواعد قبول ورد الحديث',grades:['صحيح','حسن','ضعيف','موضوع','متواتر','آحاد','مرسل','منقطع','معلق','مدلس']},
                {nameAr:'غريب الحديث',nameEn:'Gharib al-Hadith',desc:'شرح الألفاظ الغريبة'},
                {nameAr:'ناسخ الحديث ومنسوخه',nameEn:'Nasikh wa Mansukh',desc:'الأحاديث الناسخة والمنسوخة'},
                {nameAr:'أسباب ورود الحديث',nameEn:'Asbab al-Wurud',desc:'مناسبات ورود الحديث'}
            ],
            digitalFeatures:[
                'بحث شامل في الكتب التسعة',
                'تخريج الأحاديث تلقائي',
                'درجة الحديث (صحيح/حسن/ضعيف)',
                'سلسلة الإسناد التفاعلية',
                'شرح الحديث من كتب الشروح',
                'أحاديث موضوعية (أبواب)',
                'حديث يومي',
                'بحث بالراوي والموضوع واللفظ'
            ]
        };
        this.fiqh = {
            nameAr:'الفقه الإسلامي',nameEn:'Islamic Jurisprudence',
            schools:[
                {nameAr:'المذهب الحنفي',nameEn:'Hanafi',founder:'أبو حنيفة النعمان',region:'تركيا، باكستان، الهند، وسط آسيا'},
                {nameAr:'المذهب المالكي',nameEn:'Maliki',founder:'مالك بن أنس',region:'شمال وغرب أفريقيا'},
                {nameAr:'المذهب الشافعي',nameEn:'Shafii',founder:'محمد بن إدريس الشافعي',region:'مصر، جنوب شرق آسيا، شرق أفريقيا'},
                {nameAr:'المذهب الحنبلي',nameEn:'Hanbali',founder:'أحمد بن حنبل',region:'السعودية، الخليج'}
            ],
            branches:['العبادات','المعاملات','الأحوال الشخصية','الجنايات','القضاء','السياسة الشرعية','الأطعمة والأشربة','اللباس والزينة']
        };
        this.aqeedah = {
            nameAr:'العقيدة الإسلامية',nameEn:'Islamic Creed (Aqeedah)',
            pillarsOfIslam:['الشهادتان','الصلاة','الزكاة','الصيام','الحج'],
            pillarsOfFaith:['الإيمان بالله','الإيمان بالملائكة','الإيمان بالكتب','الإيمان بالرسل','الإيمان باليوم الآخر','الإيمان بالقدر خيره وشره'],
            ihsan:'أن تعبد الله كأنك تراه فإن لم تكن تراه فإنه يراك'
        };
        this.adhkar = {
            nameAr:'الأذكار والأدعية',nameEn:'Adhkar & Duas',
            categories:['أذكار الصباح','أذكار المساء','أذكار بعد الصلاة','أذكار النوم','أذكار الاستيقاظ','دعاء دخول المسجد','دعاء الخروج من المسجد','دعاء السفر','دعاء الطعام','دعاء لبس الثوب','دعاء دخول الخلاء','الاستخارة','الرقية الشرعية','أدعية من القرآن','أدعية نبوية','تسبيح وتحميد وتهليل وتكبير'],
            digitalFeatures:['عداد تسبيح رقمي','تذكير بالأذكار','ورد يومي','مشاركة','صوتية']
        };
        this.seerah = {
            nameAr:'السيرة النبوية',nameEn:'Prophetic Biography',
            periods:['ما قبل البعثة','البعثة','الدعوة السرية','الدعوة الجهرية','الهجرة إلى الحبشة','الإسراء والمعراج','الهجرة إلى المدينة','بناء الدولة','الغزوات','فتح مكة','حجة الوداع','الوفاة'],
            references:['سيرة ابن هشام','زاد المعاد لابن القيم','الرحيق المختوم','فقه السيرة للغزالي','السيرة النبوية للصلابي']
        };
        this.shariaGuidelines = {
            principles:[
                'القرآن الكريم كلام الله — لا يمسه إلا المطهرون (رقمياً: احترام في العرض والتعامل)',
                'الدقة والتوثيق في نقل الآيات والأحاديث — التثبت واجب',
                'عدم تحريف أو تغيير نص القرآن أو الحديث الصحيح',
                'ذكر المصدر والتخريج لكل حديث',
                'بيان درجة الحديث (صحيح/حسن/ضعيف/موضوع)',
                'عدم الإفتاء بغير علم — الإحالة للعلماء المختصين',
                'احترام اختلاف المذاهب الفقهية المعتبرة',
                'لا صور ذوات أرواح — أشد الناس عذاباً يوم القيامة المصورون'
            ]
        };
    }
    getDashboard() {
        return {
            engine:this.name,nameAr:this.nameAr,version:this.version,owner:this.owner,activatedAt:this.activatedAt,
            summary:{quranSurahs:this.quran.stats.totalSurahs,quranAyahs:this.quran.stats.totalAyahs,quranSciences:this.quran.sciences.length,hadithBooks:this.sunnah.hadithBooks.length,hadithSciences:this.sunnah.hadithSciences.length,fiqhSchools:this.fiqh.schools.length,adhkarCategories:this.adhkar.categories.length,seerahPeriods:this.seerah.periods.length,shariaPrinciples:this.shariaGuidelines.principles.length},
            quran:this.quran,sunnah:this.sunnah,fiqh:this.fiqh,aqeedah:this.aqeedah,adhkar:this.adhkar,seerah:this.seerah,shariaGuidelines:this.shariaGuidelines
        };
    }
}
module.exports = SheikhaQuranSunnahEngine;
