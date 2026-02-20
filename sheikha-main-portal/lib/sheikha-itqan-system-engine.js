/**
 * Sheikha Itqan System Engine
 * منظومة شيخة للإتقان الأساسي والرقمي مرقمنة بالكتاب والسنة
 * Owner: سلمان أحمد بن سلمان الراجح
 */

class SheikhaItqanSystemEngine {
  constructor() {}

  islamicFoundation = {
    quran: [
      { ref: "النمل 88", text: "صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ" },
      { ref: "السجدة 7", text: "الَّذِي أَحْسَنَ كُلَّ شَيْءٍ خَلَقَهُ" },
      { ref: "البقرة 195", text: "وَأَحْسِنُوا إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ" },
      { ref: "الكهف 30", text: "إِنَّا لَا نُضِيعُ أَجْرَ مَنْ أَحْسَنَ عَمَلًا" }
    ],
    hadith: [
      { ref: "البيهقي", text: "إن الله يحب إذا عمل أحدكم عملاً أن يتقنه" },
      { ref: "مسلم", text: "المؤمن القوي خير وأحب إلى الله من المؤمن الضعيف" }
    ]
  };

  itqanDomains = [
    { id: "code", name: "إتقان الكود", quranBasis: "الكهف 30", hadithBasis: "البيهقي", metrics: { target: 100 }, practices: ["كتابة كود نظيف وقابل للصيانة", "اتباع معايير الترميز", "إعادة استخدام الكود", "مراجعة الكود"] },
    { id: "design", name: "إتقان التصميم", quranBasis: "السجدة 7", hadithBasis: "البيهقي", metrics: { target: 100 }, practices: ["تصميم واجهات واضحة", "تجربة مستخدم سلسة", "استجابة التصميم", "تناسق بصري"] },
    { id: "performance", name: "إتقان الأداء", quranBasis: "النمل 88", hadithBasis: "مسلم", metrics: { target: 100 }, practices: ["تحسين سرعة التحميل", "تقليل استهلاك الموارد", "تحسين الاستعلامات", "التخزين المؤقت"] },
    { id: "security", name: "إتقان الأمان", quranBasis: "البقرة 195", hadithBasis: "البيهقي", metrics: { target: 100 }, practices: ["حماية البيانات الحساسة", "مصادقة آمنة", "منع الثغرات", "تشفير الاتصالات"] },
    { id: "data", name: "إتقان البيانات", quranBasis: "الكهف 30", hadithBasis: "البيهقي", metrics: { target: 100 }, practices: ["سلامة البيانات", "نسخ احتياطي منتظم", "تنظيم الهيكل", "التحقق من الصحة"] },
    { id: "documentation", name: "إتقان التوثيق", quranBasis: "البقرة 195", hadithBasis: "البيهقي", metrics: { target: 100 }, practices: ["توثيق واضح", "تعليقات مفيدة", "دليل الاستخدام", "تحديث التوثيق"] },
    { id: "testing", name: "إتقان الاختبار", quranBasis: "النمل 88", hadithBasis: "البيهقي", metrics: { target: 100 }, practices: ["اختبار شامل", "اختبار آلي", "اختبار الحالات الحدية", "اختبار الانحدار"] },
    { id: "deployment", name: "إتقان النشر", quranBasis: "السجدة 7", hadithBasis: "مسلم", metrics: { target: 100 }, practices: ["نشر آلي", "بيئة متسقة", "تراجع سريع", "مراقبة الإنتاج"] },
    { id: "support", name: "إتقان الدعم", quranBasis: "البقرة 195", hadithBasis: "مسلم", metrics: { target: 100 }, practices: ["استجابة سريعة", "توثيق المشاكل", "حلول مستدامة", "متابعة المستخدمين"] },
    { id: "sharia", name: "إتقان الشريعة", quranBasis: "البقرة 195", hadithBasis: "البيهقي", metrics: { target: 100 }, practices: ["الامتثال الشرعي", "منع المحرمات", "الشفافية", "الاستشارة الشرعية"] }
  ];

  itqanLevels = [
    { id: "mubtadi", name: "مبتدئ", range: [60, 69], description: "بداية الإتقان" },
    { id: "mutaqaddim", name: "متقدم", range: [70, 79], description: "تقدم ملحوظ" },
    { id: "mutiqin", name: "متقن", range: [80, 89], description: "إتقان جيد" },
    { id: "muhsin", name: "محسن", range: [90, 95], description: "إحسان في العمل" },
    { id: "rabbani", name: "ربّاني", range: [96, 100], description: "أعلى درجات الإتقان" }
  ];

  zeroDefectsPolicy = {
    rules: [
      "لا يُقبل خطأ معروف في الإنتاج",
      "كل عيب يُوثق ويُصلح فوراً",
      "المراجعة قبل النشر إلزامية",
      "الاختبار الآلي يغطي المسارات الحرجة",
      "الثقة بالكود تبنى بالإتقان لا بالتسرع"
    ],
    basis: { quran: "النمل 88", hadith: "البيهقي" }
  };

  getDashboard() {
    return {
      title: "منظومة شيخة للإتقان",
      owner: "سلمان أحمد بن سلمان الراجح",
      domains: this.itqanDomains.map(d => ({ id: d.id, name: d.name, target: d.metrics.target })),
      levels: this.itqanLevels,
      zeroDefects: this.zeroDefectsPolicy.rules.length
    };
  }

  getFullSystem() {
    return {
      islamicFoundation: this.islamicFoundation,
      itqanDomains: this.itqanDomains,
      itqanLevels: this.itqanLevels,
      zeroDefectsPolicy: this.zeroDefectsPolicy,
      dashboard: this.getDashboard()
    };
  }
}

module.exports = SheikhaItqanSystemEngine;
