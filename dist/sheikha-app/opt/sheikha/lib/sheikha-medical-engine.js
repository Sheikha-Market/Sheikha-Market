/**
 * بسم الله الرحمن الرحيم
 * SHEIKHA MEDICAL ENGINE — منظومة شيخة الطبية والمعالجة
 * المالك: سلمان أحمد بن سلمان الراجح
 * "وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ" الإسراء 82
 * حديث: "أشد الناس عذابا يوم القيامة المصورون" — متفق عليه
 * تنبيه: هذه المنظومة لا تستخدم صور ذوات الأرواح — تعمل بالنصوص والرسوم الهندسية والأيقونات المجردة فقط
 */
'use strict';
class SheikhaMedicalEngine {
    constructor() {
        this.name = 'Sheikha Medical Engine';
        this.nameAr = 'منظومة شيخة الطبية والمعالجة';
        this.version = '1.0.0';
        this.owner = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();
        this._init();
    }
    _init() {
        this.quranReferences = [
            {ayah:'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ',surah:'الإسراء',num:82,topic:'الشفاء بالقرآن'},
            {ayah:'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ',surah:'الشعراء',num:80,topic:'الشفاء من الله'},
            {ayah:'يَخْرُجُ مِن بُطُونِهَا شَرَابٌ مُّخْتَلِفٌ أَلْوَانُهُ فِيهِ شِفَاءٌ لِّلنَّاسِ',surah:'النحل',num:69,topic:'العسل شفاء'},
            {ayah:'قُلْ هُوَ لِلَّذِينَ آمَنُوا هُدًى وَشِفَاءٌ',surah:'فصلت',num:44,topic:'القرآن هدى وشفاء'},
            {ayah:'وَيَشْفِ صُدُورَ قَوْمٍ مُّؤْمِنِينَ',surah:'التوبة',num:14,topic:'شفاء الصدور'}
        ];
        this.hadithReferences = [
            {hadith:'ما أنزل الله داء إلا أنزل له شفاء',source:'صحيح البخاري',topic:'لكل داء دواء'},
            {hadith:'تداووا عباد الله فإن الله لم يضع داء إلا وضع له شفاء',source:'سنن أبي داود',topic:'الأمر بالتداوي'},
            {hadith:'عليكم بهذه الحبة السوداء فإن فيها شفاء من كل داء إلا السام',source:'صحيح البخاري',topic:'الحبة السوداء'},
            {hadith:'الشفاء في ثلاثة: شربة عسل وشرطة محجم وكية بنار',source:'صحيح البخاري',topic:'الطب النبوي'},
            {hadith:'أشد الناس عذابا يوم القيامة المصورون',source:'متفق عليه',topic:'تحريم التصوير — المنظومة لا تستخدم صور ذوات الأرواح'},
            {hadith:'من تطبب ولم يعلم منه طب فهو ضامن',source:'سنن أبي داود',topic:'ضرورة التأهيل الطبي'}
        ];
        this.propheticMedicine = {
            nameAr:'الطب النبوي',nameEn:'Prophetic Medicine',
            remedies:[
                {nameAr:'العسل',nameEn:'Honey',evidence:'قرآني + نبوي',uses:['التئام الجروح','مضاد للبكتيريا','علاج المعدة','تقوية المناعة']},
                {nameAr:'الحبة السوداء',nameEn:'Black Seed (Nigella Sativa)',evidence:'نبوي',uses:['تقوية المناعة','مضاد التهاب','مضاد أكسدة','صحة الجهاز التنفسي']},
                {nameAr:'الحجامة',nameEn:'Cupping (Hijama)',evidence:'نبوي',uses:['تنقية الدم','علاج الصداع','آلام الظهر','تنشيط الدورة الدموية']},
                {nameAr:'زيت الزيتون',nameEn:'Olive Oil',evidence:'قرآني + نبوي',uses:['صحة القلب','مضاد أكسدة','ترطيب','صحة الجلد']},
                {nameAr:'التمر',nameEn:'Dates',evidence:'قرآني + نبوي',uses:['طاقة سريعة','حديد','ألياف','تقوية الجسم']},
                {nameAr:'ماء زمزم',nameEn:'Zamzam Water',evidence:'نبوي',uses:['شفاء بإذن الله','بركة','تقوية']},
                {nameAr:'الرقية الشرعية',nameEn:'Ruqyah',evidence:'قرآني + نبوي',uses:['علاج العين','علاج الحسد','علاج المس','شفاء عام']},
                {nameAr:'الصيام',nameEn:'Fasting',evidence:'قرآني + نبوي',uses:['تنظيف الجسم','تجديد الخلايا','صحة القلب','ضبط السكر']},
                {nameAr:'السواك',nameEn:'Miswak',evidence:'نبوي',uses:['صحة الفم','مضاد بكتيريا','تبييض','تقوية اللثة']},
                {nameAr:'الكمأة (الفقع)',nameEn:'Truffles',evidence:'نبوي',uses:['علاج العين','ماؤها شفاء']}
            ]
        };
        this.medicalSpecialties = {
            nameAr:'التخصصات الطبية',nameEn:'Medical Specialties',
            categories:[
                {nameAr:'الطب الباطني',nameEn:'Internal Medicine',subs:['قلب','غدد صماء','جهاز هضمي','كلى','صدرية','أمراض دم','روماتيزم','أمراض معدية']},
                {nameAr:'الجراحة',nameEn:'Surgery',subs:['جراحة عامة','قلب','مخ وأعصاب','عظام','تجميل (بدون صور)','أوعية دموية','صدرية','أطفال']},
                {nameAr:'طب الأطفال',nameEn:'Pediatrics',subs:['حديثي الولادة','أمراض أطفال','تطعيمات','نمو وتطور']},
                {nameAr:'النساء والتوليد',nameEn:'OB/GYN',subs:['ولادة','أمراض نسائية','عقم','حمل عالي الخطورة']},
                {nameAr:'الطب النفسي',nameEn:'Psychiatry',subs:['اكتئاب','قلق','وسواس','إدمان','طب نفسي أطفال'],note:'العلاج بالقرآن والذكر أساسي مع العلاج الطبي'},
                {nameAr:'طب العيون',nameEn:'Ophthalmology',subs:['شبكية','ماء أبيض','ليزك','قرنية']},
                {nameAr:'الأنف والأذن والحنجرة',nameEn:'ENT',subs:['سمع','جيوب أنفية','حنجرة','توازن']},
                {nameAr:'الجلدية',nameEn:'Dermatology',subs:['أكزيما','صدفية','فطريات','ليزر']},
                {nameAr:'طب الطوارئ',nameEn:'Emergency Medicine',subs:['إصابات','حالات حرجة','سموم','حروق']},
                {nameAr:'الأشعة والتصوير الطبي',nameEn:'Radiology',subs:['أشعة سينية','رنين مغناطيسي','أشعة مقطعية','ألتراساوند'],note:'التصوير الطبي للضرورة العلاجية جائز شرعاً'},
                {nameAr:'المختبرات',nameEn:'Laboratory Medicine',subs:['تحاليل دم','أحياء دقيقة','كيمياء حيوية','أنسجة']},
                {nameAr:'الصيدلة',nameEn:'Pharmacy',subs:['صيدلة سريرية','أدوية','أعشاب طبية','صيدلة إسلامية'],note:'التأكد من خلو الأدوية من المحرمات (كحول، جيلاتين خنزير)'}
            ]
        };
        this.digitalHealth = {
            nameAr:'الصحة الرقمية',nameEn:'Digital Health Systems',
            systems:[
                {id:'MED-01',nameAr:'السجل الطبي الإلكتروني',nameEn:'Electronic Health Record (EHR)',features:['سجل شامل مشفر','تاريخ مرضي كامل','مشاركة آمنة بين مقدمي الخدمة','تنبيهات حساسية وتفاعلات']},
                {id:'MED-02',nameAr:'الطب عن بعد',nameEn:'Telemedicine',features:['استشارات مرئية (بضوابط شرعية)','وصفات إلكترونية','متابعة مرضى مزمنين','طوارئ عن بعد']},
                {id:'MED-03',nameAr:'ذكاء اصطناعي طبي',nameEn:'Medical AI',features:['تشخيص مساعد بالذكاء الاصطناعي','تحليل صور طبية','تنبؤ مخاطر صحية','اقتراح علاجات'],note:'AI مساعد وليس بديلاً عن الطبيب'},
                {id:'MED-04',nameAr:'صيدلية ذكية',nameEn:'Smart Pharmacy',features:['فحص تفاعلات أدوية','تنبيه حساسية','بدائل حلال','تتبع أدوية']},
                {id:'MED-05',nameAr:'أجهزة مراقبة صحية',nameEn:'Health Monitoring Devices',features:['ساعة شيخة الصحية','قياس ضغط ذكي','مراقبة سكر مستمرة','تخطيط قلب محمول']},
                {id:'MED-06',nameAr:'نظام مواعيد ذكي',nameEn:'Smart Appointment System',features:['حجز ذكي','تذكيرات','أولوية الطوارئ','مراعاة أوقات الصلاة']},
                {id:'MED-07',nameAr:'سجل تطعيمات',nameEn:'Immunization Registry',features:['جدول تطعيمات','تذكيرات','شهادات رقمية','تتبع']},
                {id:'MED-08',nameAr:'إدارة المستشفيات',nameEn:'Hospital Management',features:['أسرّة','عمليات','طوارئ','موظفين','مخزون أدوية']}
            ]
        };
        this.emergencyProtocols = {
            nameAr:'بروتوكولات الطوارئ',nameEn:'Emergency Protocols',
            levels:[
                {level:'أحمر',nameEn:'Red',desc:'حالة حرجة — تهديد حياة فوري',response:'استجابة فورية < 1 دقيقة'},
                {level:'برتقالي',nameEn:'Orange',desc:'حالة خطرة — عاجلة جداً',response:'< 10 دقائق'},
                {level:'أصفر',nameEn:'Yellow',desc:'حالة عاجلة',response:'< 30 دقيقة'},
                {level:'أخضر',nameEn:'Green',desc:'حالة غير عاجلة',response:'< 2 ساعة'},
                {level:'أزرق',nameEn:'Blue',desc:'حالة بسيطة',response:'< 4 ساعات'}
            ]
        };
        this.shariaGuidelines = {
            principles:[
                'التداوي مشروع ومأمور به — "تداووا عباد الله"',
                'الشفاء من الله وحده — الطبيب سبب والله هو الشافي',
                'الرقية الشرعية علاج أصيل وليست بديلاً عن الطب',
                'تحريم تصوير ذوات الأرواح — استخدام رسوم هندسية وأيقونات مجردة فقط',
                'خلو الأدوية من المحرمات إلا للضرورة القصوى',
                'ستر العورات في الفحص الطبي — الضرورة تقدر بقدرها',
                'معالجة المرأة بطبيبة إن أمكن',
                'الصدق في التشخيص والعلاج — أمانة',
                'حفظ سر المريض واجب شرعي وقانوني',
                'لا ضرر ولا ضرار — قاعدة فقهية طبية'
            ]
        };
    }
    getDashboard() {
        return {
            engine:this.name,nameAr:this.nameAr,version:this.version,owner:this.owner,activatedAt:this.activatedAt,
            summary:{propheticRemedies:this.propheticMedicine.remedies.length,medicalSpecialties:this.medicalSpecialties.categories.length,digitalSystems:this.digitalHealth.systems.length,emergencyLevels:this.emergencyProtocols.levels.length,quranRefs:this.quranReferences.length,hadithRefs:this.hadithReferences.length,shariaPrinciples:this.shariaGuidelines.principles.length},
            propheticMedicine:this.propheticMedicine,medicalSpecialties:this.medicalSpecialties,digitalHealth:this.digitalHealth,emergencyProtocols:this.emergencyProtocols,quranReferences:this.quranReferences,hadithReferences:this.hadithReferences,shariaGuidelines:this.shariaGuidelines
        };
    }
}
module.exports = SheikhaMedicalEngine;
