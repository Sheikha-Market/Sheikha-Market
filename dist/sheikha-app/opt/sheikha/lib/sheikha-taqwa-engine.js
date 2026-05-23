/**
 * Sheikha Taqwa Engine — منظومة تقوى الله
 * إن أكرمكم عند الله أتقاكم
 * Owner: سلمان أحمد بن سلمان الراجح
 */

class SheikhaTaqwaEngine {
  constructor() {}

  taqwaFoundation = {
    quran: [
      { text: "إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ", ref: "الحجرات 13" },
      { text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ", ref: "الطلاق 2-3" },
      { text: "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَقُولُوا قَوْلًا سَدِيدًا", ref: "الأحزاب 70" },
      { text: "وَتَزَوَّدُوا فَإِنَّ خَيْرَ الزَّادِ التَّقْوَىٰ", ref: "البقرة 197" },
      { text: "إِنَّ اللَّهَ مَعَ الَّذِينَ اتَّقَوا وَّالَّذِينَ هُم مُّحْسِنُونَ", ref: "النحل 128" },
      { text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مِنْ أَمْرِهِ يُسْرًا", ref: "الطلاق 4" }
    ],
    hadith: [
      { text: "اتق الله حيثما كنت وأتبع السيئة الحسنة تمحها وخالق الناس بخلق حسن", ref: "الترمذي" },
      { text: "التقوى ههنا (وأشار إلى صدره ثلاث مرات)", ref: "مسلم" }
    ]
  };

  taqwaPillars = [
    { ar: "مراقبة الله", en: "God-consciousness in every action - every click, every transaction" },
    { ar: "الخوف والرجاء", en: "Fear of Allah's punishment for fraud + Hope in reward for honesty" },
    { ar: "الأمانة الرقمية", en: "Digital trust - protecting user data as if protecting a sacred trust" },
    { ar: "الصدق الرقمي", en: "Digital honesty - no fake reviews, no hidden fees" },
    { ar: "العدل الرقمي", en: "Digital justice - fair algorithms, no discrimination" },
    { ar: "الورع الرقمي", en: "Digital piety - avoiding doubtful matters in transactions" },
    { ar: "الإخلاص الرقمي", en: "Digital sincerity - building for Allah's pleasure, not just profit" }
  ];

  taqwaInBusiness = [
    { rule: "لا ربا", quran: "اللَّهُ يَحِلُّ الْبَيْعَ وَيُحَرِّمُ الرِّبَا", hadith: "الربا له سبعون باباً", digital: "No interest-based financing" },
    { rule: "لا غش", quran: "وَيْلٌ لِّلْمُطَفِّفِينَ", hadith: "من غشنا فليس منا", digital: "Transparent pricing, no hidden charges" },
    { rule: "لا احتكار", quran: "وَمَن يَحْتَكِرْ فَهُوَ خَاطِئٌ", hadith: "المحتكر ملعون", digital: "No artificial scarcity or price manipulation" },
    { rule: "لا غرر", quran: "إِنَّمَا الْبَيْعُ مِثْلٌ بِمِثْلٍ", hadith: "لا تبع ما ليس عندك", digital: "Clear terms, no gambling-like uncertainty" },
    { rule: "الوفاء بالعقود", quran: "أَوْفُوا بِالْعُقُودِ", hadith: "المسلمون عند شروطهم", digital: "Honor SLAs, refunds, warranties" },
    { rule: "العدل في الميزان", quran: "وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ", hadith: "الوزن بالقسط", digital: "Fair metrics, honest ratings, just algorithms" }
  ];

  taqwaRewards = [
    { fruit: "المخرج والرزق", ref: "الطلاق 2-3", desc: "way out + provision" },
    { fruit: "اليسر", ref: "الطلاق 4", desc: "ease" },
    { fruit: "التفريق بين الحق والباطل", ref: "الأنفال 29", desc: "distinguishing truth from falsehood" },
    { fruit: "المعية", ref: "النحل 128", desc: "Allah's company" },
    { fruit: "البشرى", ref: "يونس 63-64", desc: "good news" },
    { fruit: "التكفير والأجر", ref: "الأنفال 29", desc: "forgiveness + reward" }
  ];

  taqwaScore = {
    shariaCompliance: 100,
    honestyIndex: 100,
    trustIndex: 100,
    justiceIndex: 100,
    pietyIndex: 100,
    sincerityIndex: 100,
    overallTaqwa: 100
  };

  getDashboard() {
    return {
      title: "منظومة تقوى الله",
      motto: "إن أكرمكم عند الله أتقاكم",
      pillars: this.taqwaPillars.length,
      score: this.taqwaScore.overallTaqwa,
      businessRules: this.taqwaInBusiness.map(b => b.rule),
      rewards: this.taqwaRewards.map(r => r.fruit)
    };
  }

  getFullSystem() {
    return {
      foundation: this.taqwaFoundation,
      pillars: this.taqwaPillars,
      business: this.taqwaInBusiness,
      rewards: this.taqwaRewards,
      score: this.taqwaScore,
      dashboard: this.getDashboard()
    };
  }
}

module.exports = SheikhaTaqwaEngine;
