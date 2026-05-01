/**
 * بسم الله الرحمن الرحيم
 * SHEIKHA BRAND ENGINE — منظومة هوية شيخة والعلامة التجارية
 * المالك: سلمان أحمد بن سلمان الراجح
 * "ادْعُ إِلَى سَبِيلِ رَبِّكَ بِالْحِكْمَةِ وَالْمَوْعِظَةِ الْحَسَنَةِ" النحل 125
 * تنبيه: لا صور ذوات أرواح — الهوية بالخط العربي والزخارف الهندسية الإسلامية
 */
'use strict';
class SheikhaBrandEngine {
    constructor() {
        this.name = 'Sheikha Brand Engine';
        this.nameAr = 'منظومة هوية شيخة والعلامة التجارية';
        this.version = '1.0.0';
        this.owner = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();
        this._init();
    }
    _init() {
        this.quranReferences = [
            {ayah:'ادْعُ إِلَى سَبِيلِ رَبِّكَ بِالْحِكْمَةِ وَالْمَوْعِظَةِ الْحَسَنَةِ',surah:'النحل',num:125,topic:'الدعوة بالحكمة'},
            {ayah:'وَمَنْ أَحْسَنُ قَوْلًا مِّمَّن دَعَا إِلَى اللَّهِ وَعَمِلَ صَالِحًا',surah:'فصلت',num:33,topic:'الدعوة الحسنة'},
            {ayah:'إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ',source:'صحيح مسلم',topic:'الجمال في الهوية'},
            {ayah:'وَأَحْسِنُوا إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ',surah:'البقرة',num:195,topic:'الإحسان في التصميم'}
        ];
        this.brandIdentity = {
            nameAr:'الهوية البصرية',nameEn:'Visual Identity',
            name:{ar:'شيخة',en:'Sheikha',meaning:'السيدة الشريفة الحكيمة — من الشيخ وهو العالم والحكيم'},
            logo:{
                concept:'خط عربي ثلثي فاخر لكلمة "شيخة" — بدون أي صور ذوات أرواح',
                elements:['خط عربي ثلثي','زخرفة هندسية إسلامية','نجمة ثمانية (رمز إسلامي)','لون أخضر سعودي + ذهبي'],
                note:'الشعار نص خطي فقط — امتثالاً لحديث "أشد الناس عذاباً يوم القيامة المصورون"'
            },
            colors:{
                primary:{name:'أخضر شيخة',hex:'#006c35',meaning:'الإسلام، النماء، السعودية'},
                secondary:{name:'ذهبي شيخة',hex:'#c9a42c',meaning:'الفخامة، التميز، الأصالة'},
                accent:{name:'أزرق شيخة',hex:'#1a5276',meaning:'الثقة، التقنية، العمق'},
                light:{name:'أبيض عاجي',hex:'#faf7f0',meaning:'النقاء، البساطة'},
                dark:{name:'كحلي شيخة',hex:'#1a1a2e',meaning:'الرسمية، العمق'}
            },
            typography:{
                arabic:{primary:'خط الثلث (للشعار)',secondary:'خط النسخ (للعناوين)',body:'خط الأميري / خط تجوال (للنصوص)'},
                english:{primary:'Playfair Display (headings)',body:'Inter / Open Sans (body text)'},
                principles:['وضوح القراءة أولاً','حجم خط مريح','تباعد مناسب للعربية','دعم RTL كامل']
            },
            patterns:{
                types:['زخارف هندسية إسلامية','أرابيسك','نجمات ثمانية','أنماط تكرارية هندسية','خطوط عربية زخرفية'],
                note:'كل الأنماط هندسية ونباتية فقط — لا رسوم ذوات أرواح أبداً'
            }
        };
        this.brandValues = {
            nameAr:'قيم العلامة التجارية',nameEn:'Brand Values',
            core:[
                {ar:'الإتقان',en:'Excellence',desc:'إتقان العمل عبادة — أعلى معايير الجودة'},
                {ar:'الأمانة',en:'Trust',desc:'الأمانة في حفظ البيانات والمعاملات'},
                {ar:'الإبداع',en:'Innovation',desc:'ابتكار حلول تقنية رائدة'},
                {ar:'الشمول',en:'Inclusivity',desc:'خدمة كل الفئات والمجتمعات'},
                {ar:'الأصالة',en:'Authenticity',desc:'جذور إسلامية عربية أصيلة'},
                {ar:'الجمال',en:'Beauty',desc:'إن الله جميل يحب الجمال — تصميم فاخر ومتقن'}
            ],
            promise:{ar:'تقنية أصيلة تخدم الإنسان وفق منهج الله',en:'Authentic technology serving humanity by divine guidance'},
            personality:['حكيمة','موثوقة','فخمة','مبتكرة','أصيلة','ودودة','قوية']
        };
        this.brandVoice = {
            nameAr:'صوت العلامة التجارية',nameEn:'Brand Voice',
            tone:['رسمي ومحترف','دافئ وودود','واثق وليس متعالياً','واضح ومباشر','ملهم ومحفز'],
            language:{
                arabic:'فصحى واضحة — ليست معقدة ولا عامية',
                english:'Professional, warm, clear',
                bilingual:'العربية أولاً دائماً — الإنجليزية مصاحبة'
            },
            doAndDont:{
                do:['استخدم البسملة في البداية','استخدم لغة محترمة','اذكر المصادر الشرعية','كن واضحاً ومباشراً','استخدم أمثلة عملية'],
                dont:['لا تستخدم عامية','لا تسخر أو تستهزئ','لا تبالغ في الوعود','لا تستخدم ألفاظ غربية بلا حاجة','لا تستخدم صور ذوات أرواح']
            }
        };
        this.reachStrategy = {
            nameAr:'استراتيجية الوصول والإيصال',nameEn:'Reach & Communication Strategy',
            channels:[
                {nameAr:'الموقع الرسمي',nameEn:'Official Website',url:'sheikha.sa',priority:1,desc:'الواجهة الرئيسية للتعريف بشيخة'},
                {nameAr:'تطبيق شيخة',nameEn:'Sheikha App',platforms:['iOS','Android','شيخة OS'],priority:1},
                {nameAr:'وسائل التواصل',nameEn:'Social Media',platforms:['X (Twitter)','LinkedIn','YouTube (بدون صور ذوات أرواح)','Telegram','Instagram (نصوص وزخارف فقط)'],priority:2},
                {nameAr:'البريد الإلكتروني',nameEn:'Email Marketing',types:['نشرة أسبوعية','تحديثات المنتج','محتوى تعليمي'],priority:2},
                {nameAr:'المؤتمرات والمعارض',nameEn:'Conferences & Exhibitions',events:['LEAP التقني','GITEX','معرض الرياض الدولي','مؤتمرات إسلامية','ندوات جامعية'],priority:3},
                {nameAr:'العلاقات العامة',nameEn:'Public Relations',activities:['بيانات صحفية','مقابلات','شراكات','رعايات'],priority:3},
                {nameAr:'المحتوى التعليمي',nameEn:'Educational Content',types:['مدونة','دورات تدريبية','أدلة استخدام','ندوات عبر الإنترنت'],priority:2},
                {nameAr:'الشراكات',nameEn:'Partnerships',types:['جامعات','جهات حكومية','شركات تقنية','منظمات إسلامية','غرف تجارية'],priority:3},
                {nameAr:'المساجد والمراكز الإسلامية',nameEn:'Mosques & Islamic Centers',desc:'تعريف بالمنظومة في الخطب والمحاضرات',priority:4},
                {nameAr:'الكلمة المنقولة',nameEn:'Word of Mouth',programs:['برنامج سفراء شيخة','مكافآت التوصية','شهادات مستخدمين'],priority:1}
            ]
        };
        this.brandGuidelines = {
            nameAr:'دليل الهوية',nameEn:'Brand Guidelines Document',
            sections:['استخدام الشعار','الألوان المعتمدة','الخطوط','الأنماط الزخرفية','صوت العلامة','القوالب الرسمية','بطاقات العمل','ترويسات','توقيعات بريدية','عروض تقديمية','لافتات رقمية'],
            rules:['لا تغيير ألوان الشعار','لا تشويه أو تدوير الشعار','مساحة آمنة حول الشعار','لا صور ذوات أرواح أبداً','البسملة في كل وثيقة رسمية','اللغة العربية أولاً']
        };
        this.shariaGuidelines = {
            principles:[
                'لا صور ذوات أرواح — حديث أشد الناس عذاباً يوم القيامة المصورون (متفق عليه)',
                'الهوية تعكس قيم الإسلام — الجمال والإتقان والأمانة',
                'الجمال مطلوب شرعاً — إن الله جميل يحب الجمال',
                'الصدق في الإعلان والتسويق — لا مبالغة ولا كذب',
                'لا تشبه بعلامات تجارية محرمة أو مخالفة',
                'لا موسيقى في الإعلانات — أناشيد إسلامية أو مؤثرات صوتية',
                'التواضع في العرض — لا تفاخر ولا كبر',
                'الهوية وسيلة لنشر الخير وليست غاية بذاتها'
            ]
        };
    }
    getDashboard() {
        return {
            engine:this.name,nameAr:this.nameAr,version:this.version,owner:this.owner,activatedAt:this.activatedAt,
            summary:{brandColors:Object.keys(this.brandIdentity.colors).length,brandValues:this.brandValues.core.length,reachChannels:this.reachStrategy.channels.length,guidelineSections:this.brandGuidelines.sections.length,personalityTraits:this.brandValues.personality.length,quranRefs:this.quranReferences.length,shariaPrinciples:this.shariaGuidelines.principles.length},
            brandIdentity:this.brandIdentity,brandValues:this.brandValues,brandVoice:this.brandVoice,reachStrategy:this.reachStrategy,brandGuidelines:this.brandGuidelines,quranReferences:this.quranReferences,shariaGuidelines:this.shariaGuidelines
        };
    }
}
module.exports = SheikhaBrandEngine;
