/**
 * Sheikha Quran & Dhikr Engine
 * منظومة شيخة لقراءة القرآن والذكر والباقيات الصالحات
 * Owner: سلمان أحمد بن سلمان الراجح
 */

class SheikhaQuranDhikrEngine {
  constructor() {}

  quranSystem = {
    totalSurahs: 114,
    totalAyat: 6236,
    readingPlans: {
      daily: { description: "جزء/يوم = ختمة/شهر", juzPerDay: 1 },
      weekly: { description: "ختمة أسبوعية", juzPerDay: 4 },
      monthly: { description: "ختمة شهرية", juzPerDay: 1 }
    },
    recitationModes: ["تلاوة", "تدبر", "حفظ", "مراجعة"],
    quranVerse: "إِنَّ هَذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ",
    quranSource: "الإسراء 9",
    hadiths: [
      { text: "خيركم من تعلم القرآن وعلمه", source: "البخاري" },
      { text: "اقرأوا القرآن فإنه يأتي يوم القيامة شفيعاً لأصحابه", source: "مسلم" }
    ]
  };

  adhkar = {
    morning: [
      { id: "am1", text: "أَعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيمِ", count: 1, source: "البخاري", reward: "حفظ", category: "أذكار الصباح" },
      { id: "am2", text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ", count: 1, source: "البخاري", reward: "من قرأها دبر الصبح", category: "أذكار الصباح" },
      { id: "am3", text: "بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ", count: 3, source: "أبو داود", reward: "حماية من الضرر", category: "أذكار الصباح" },
      { id: "am4", text: "رَضِيتُ بِاللهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ نَبِيًّا", count: 3, source: "أبو داود", reward: "رضا الله", category: "أذكار الصباح" },
      { id: "am5", text: "اللَّهُمَّ أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ", count: 1, source: "مسند أحمد", reward: "ثبات على الفطرة", category: "أذكار الصباح" },
      { id: "am6", text: "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ", count: 1, source: "أبو داود", reward: "شهادة عظيمة", category: "أذكار الصباح" },
      { id: "am7", text: "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ فَمِنْكَ وَحْدَكَ", count: 1, source: "أبو داود", reward: "شكر النعم", category: "أذكار الصباح" },
      { id: "am8", text: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ", count: 3, source: "أبو داود", reward: "كفاية وحماية", category: "أذكار الصباح" },
      { id: "am9", text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ", count: 3, source: "مسلم", reward: "ثقل الميزان", category: "أذكار الصباح" },
      { id: "am10", text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي اللَّهُمَّ عَافِنِي فِي سَمْعِي", count: 1, source: "الترمذي", reward: "عافية شاملة", category: "أذكار الصباح" }
    ],
    evening: [
      { id: "pm1", text: "أَعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيمِ", count: 1, source: "البخاري", reward: "حفظ", category: "أذكار المساء" },
      { id: "pm2", text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ", count: 1, source: "البخاري", reward: "من قرأها دبر المغرب", category: "أذكار المساء" },
      { id: "pm3", text: "بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ", count: 3, source: "أبو داود", reward: "حماية من الضرر", category: "أذكار المساء" },
      { id: "pm4", text: "رَضِيتُ بِاللهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ نَبِيًّا", count: 3, source: "أبو داود", reward: "رضا الله", category: "أذكار المساء" },
      { id: "pm5", text: "اللَّهُمَّ أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلَامِ", count: 1, source: "مسند أحمد", reward: "ثبات على الفطرة", category: "أذكار المساء" },
      { id: "pm6", text: "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ", count: 1, source: "أبو داود", reward: "شهادة عظيمة", category: "أذكار المساء" },
      { id: "pm7", text: "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ فَمِنْكَ وَحْدَكَ", count: 1, source: "أبو داود", reward: "شكر النعم", category: "أذكار المساء" },
      { id: "pm8", text: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ", count: 3, source: "أبو داود", reward: "كفاية وحماية", category: "أذكار المساء" },
      { id: "pm9", text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ", count: 3, source: "مسلم", reward: "ثقل الميزان", category: "أذكار المساء" },
      { id: "pm10", text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي اللَّهُمَّ عَافِنِي فِي سَمْعِي", count: 1, source: "الترمذي", reward: "عافية شاملة", category: "أذكار المساء" }
    ],
    afterPrayer: [
      { id: "ap1", text: "أَسْتَغْفِرُ اللَّهَ", count: 3, source: "مسلم", reward: "مغفرة الذنوب", category: "أذكار بعد الصلاة" },
      { id: "ap2", text: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ", count: 1, source: "مسلم", reward: "تحية عظيمة", category: "أذكار بعد الصلاة" },
      { id: "ap3", text: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", count: 10, source: "مسلم", reward: "عشر حسنات ومحو سيئات", category: "أذكار بعد الصلاة" },
      { id: "ap4", text: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَاللَّهُ أَكْبَرُ", count: 33, source: "البخاري ومسلم", reward: "ثقل الميزان", category: "أذكار بعد الصلاة" },
      { id: "ap5", text: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ", count: 1, source: "البخاري ومسلم", reward: "من قالها غفر له", category: "أذكار بعد الصلاة" }
    ],
    sleep: [
      { id: "sl1", text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", count: 1, source: "البخاري", reward: "حفظ في النوم", category: "أذكار النوم" },
      { id: "sl2", text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ", count: 3, source: "أبو داود", reward: "حماية من العذاب", category: "أذكار النوم" },
      { id: "sl3", text: "آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ", count: 1, source: "البخاري", reward: "حفظ حتى الصباح", category: "أذكار النوم" },
      { id: "sl4", text: "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ وَوَجَّهْتُ وَجْهِي إِلَيْكَ", count: 1, source: "البخاري ومسلم", reward: "توكل وراحة", category: "أذكار النوم" },
      { id: "sl5", text: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَاللَّهُ أَكْبَرُ", count: 33, source: "البخاري", reward: "ثقل الميزان", category: "أذكار النوم" }
    ],
    miscellaneous: [
      { id: "m1", text: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ", count: 1, source: "مسلم", reward: "دخول المسجد", category: "دخول المسجد" },
      { id: "m2", text: "بِسْمِ اللَّهِ", count: 1, source: "مسلم", reward: "عند الطعام", category: "الطعام" },
      { id: "m3", text: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا", count: 1, source: "مسلم", reward: "عند ركوب المركبة", category: "السفر" },
      { id: "m4", text: "بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ", count: 1, source: "البخاري", reward: "عند دخول المنزل", category: "دخول المنزل" },
      { id: "m5", text: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ", count: 1, source: "أبو داود", reward: "عند الخروج", category: "الخروج" },
      { id: "m6", text: "الْحَمْدُ لِلَّهِ الَّذِي أَذْهَبَ عَنِّي الْأَذَى", count: 1, source: "البخاري", reward: "بعد قضاء الحاجة", category: "قضاء الحاجة" },
      { id: "m7", text: "غُفْرَانَكَ الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي", count: 1, source: "أبو داود", reward: "بعد المرض", category: "بعد المرض" },
      { id: "m8", text: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ", count: 1, source: "مسلم", reward: "عند المصيبة", category: "المصيبة" }
    ]
  };

  baqiyatSalihat = [
    { text: "سُبْحَانَ اللَّهِ", hadith: "كلمتان خفيفتان على اللسان ثقيلتان في الميزان", reward: "حب الله", recommendedCount: 33 },
    { text: "الْحَمْدُ لِلَّهِ", hadith: "ملء السماوات وملء الأرض وملء ما شاء من شيء بعد", reward: "ثقل الميزان", recommendedCount: 33 },
    { text: "لَا إِلَٰهَ إِلَّا اللَّهُ", hadith: "أفضل الذكر لا إله إلا الله", reward: "كلمة التوحيد", recommendedCount: 100 },
    { text: "اللَّهُ أَكْبَرُ", hadith: "الله أكبر كبيراً والحمد لله كثيراً", reward: "تعظيم الله", recommendedCount: 33 },
    { text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", hadith: "كنز من كنوز الجنة", reward: "كنز عظيم", recommendedCount: 100 },
    { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ", hadith: "كلمتان خفيفتان على اللسان ثقيلتان في الميزان", reward: "حب الله", recommendedCount: 100 },
    { text: "أَسْتَغْفِرُ اللَّهَ", hadith: "من لزم الاستغفار جعل الله له من كل هم فرجاً", reward: "مغفرة ورزق", recommendedCount: 100 },
    { text: "الصَّلَاةُ عَلَى النَّبِيِّ ﷺ", hadith: "من صلى عليّ مرة صلى الله عليه عشراً", reward: "صلاة الله على المصلي", recommendedCount: 10 }
  ];

  digitalFeatures = {
    dailyQuranVerse: "عرض آية قرآنية يومية على الصفحة الرئيسية",
    adhkarReminders: "تذكيرات الأذكار (صباحاً ومساءً)",
    baqiCounter: "عداد الباقيات (تسبيح رقمي)",
    quranReadingTracker: "متتبع قراءة القرآن",
    fridayKahfReminder: "تذكير قراءة سورة الكهف يوم الجمعة"
  };

  getDashboard() {
    return {
      quran: { surahs: this.quranSystem.totalSurahs, ayat: this.quranSystem.totalAyat, verse: this.quranSystem.quranVerse },
      adhkarCount: Object.values(this.adhkar).flat().length,
      baqiyatCount: this.baqiyatSalihat.length,
      features: this.digitalFeatures
    };
  }

  getFullSystem() {
    return {
      quranSystem: this.quranSystem,
      adhkar: this.adhkar,
      baqiyatSalihat: this.baqiyatSalihat,
      digitalFeatures: this.digitalFeatures
    };
  }
}

module.exports = SheikhaQuranDhikrEngine;
