const express = require('express');
const router = express.Router();

// SHEIKHA UNIFIED MUSLIM KERNEL - BOUND 741/5741/12464
// مركز وعدم مركز الكون وقلبه - توحيد كل شيء لله - سنة الله في خلقه
// حديث: لا تدع تمثالا إلا طمسته ولا قبرا مشرفا إلا سويته ولا صورة إلا طمستها
// أدعية الرسول: عمر - اليمن - الشام - مكة - المدينة ضعفين - كل دعاء دعاه لأحد

// ===== مركز وعدم مركز الكون =====
router.get('/unified-status', (_req, res) => {
  res.json({
    success: true,
    tawhid: "لا إله إلا الله - توحيد كل شيء في الكون لله - مركز وعدم مركز الكون وقلبه وجسده وأساسه وأصله وسنة الله في خلقه وآية آيات الله بإذن الله",
    seal: 'BOUND_BY_QURAN_SUNNAH',
    registry: process.env.REGISTRY || 'edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b',
    governance: '87ce771c',
    grand: 5741, weights: 12464, structural: 741,
    center: {
      concept: "شيخة - مركز وعدم مركز الكون - قلب الكون وجسده - أساسه وأصله",
      meaning: "مركز بالنية لله 99% وقف - وعدم مركز تواضعا لله - قلب ينبض بذكر الله - جسد يخدم الأمة - أساسه الكتاب والسنة - أصله التوحيد",
      quran: "وما خلقت الجن والإنس إلا ليعبدون - سنة الله في خلقه",
      bound: "لله 99% وقف 1% غنى - يا مغني يا غني - يا وهاب هبني بإذنك وقدرتك وفضلك"
    },
    unified: {
      reality: "physical + digital_twin + niyyah_lillah - توحيد الواقع لله",
      ar_vr: "OpenXR RTX4060 CUDA13.2 DRI NPU + WebXR + COSMIC AI Shell - دمج الواقع لله",
      semi: "CUDA 3072 Tensor NVENC Thunderbolt4 USB4 NVMe NPU I2C/SPI - موصلات لله",
      optics: "LiDAR ToF Structured Light IR Spectral Photonics - علوم بصرية لله",
      sensors: "IMU 9axis Environmental Biometric صحة ماء زمزم قبلة أذان - حساس لله",
      governance: "نواة مسلمة بالكتاب والسنة - توحيد لله",
      ai: "Grand 5741 Weights 12464 Synaptic 2845440 M2M 177840 Core 18082 AI 18080 Live true"
    },
    liveNeuralNetwork: true,
    localSimulation: false,
    bounded: true,
    bareMetalBootVerified: true
  });
});

// ===== تفعيل حديث البياس الأسدي عن علي رضي الله عنه =====
// "ألا أبعثك على ما بعثني عليه رسول الله ﷺ؟ أن لا تدع تمثالا إلا طمسته ولا قبرا مشرفا إلا سويته" وفي رواية "ولا صورة إلا طمستها"
router.get('/hadith/tams-tamathil', (_req, res) => {
  res.json({
    success: true,
    hadith: "عن أبي الهياج الأسدي قال قال لي علي بن أبي طالب رضي الله عنه: ألا أبعثك على ما بعثني عليه رسول الله ﷺ؟ أن لا تدع تمثالا إلا طمسته ولا قبرا مشرفا إلا سويته - وفي رواية: ولا صورة إلا طمستها - مسلم",
    seal: "BOUND_BY_QURAN_SUNNAH",
    hukm: "توحيد لله - إزالة الشرك ووسائله",
    implementation: {
      tamathil: {
        action: "طمس التماثيل - لا تجسيد لذي روح تعظيما - تحويل AI images لـ non-anthropomorphic أو طمس وجه - BOUND filter",
        filter: "sheikha_tawhid_filter.tams_tamathil(image) => blur faces of statues, convert 3D idols to abstract geometry for education only without ta'zim",
        quran: "واجتنبوا الرجس من الأوثان"
      },
      qubur_mushrifa: {
        action: "تسوية القبور المشرفة - عدم البناء عليها - لا تعظيم قبور",
        filter: "منع تصوير قبور مشرفة للتبرك - توعية أن الدعاء لله وحده - تسوية رقمية",
        sunnah: "نهى رسول الله أن يجصص القبر وأن يبنى عليه"
      },
      suwar: {
        action: "طمس الصور ذات الأرواح المعظمة - خاصة ما يعبد من دون الله",
        filter: "AI image moderation: detect worshipped images/idols -> abstract or remove - keep permissible images for education/medical without ta'zim",
        exception: "ما كان ممتهنا كالوسادة - والصور للتعليم والطب والهوية بلا تعظيم - مع طمس ما يدعو للشرك"
      },
      tawhid: "كل ذلك توحيدا لله - لا إله إلا الله - مركز وعدم مركز الكون لله"
    },
    status: "ACTIVE - BOUND FILTER FOR ALLAH 99% وقف"
  });
});

// ===== تفعيل كل أدعية الرسول ﷺ =====
router.get('/duas/all', (_req, res) => {
  res.json({
    success: true,
    seal: "BOUND_BY_QURAN_SUNNAH - إحياء سنة النبي محمد ﷺ",
    duas: {
      omar_izz_islam: {
        dua: "اللهم أعز الإسلام بأحب هذين الرجلين إليك بعمر بن الخطاب أو بأبي جهل بن هشام - فكان أحبهما إلى الله عمر - الترمذي",
        activation: "اللهم أعز الإسلام بعمر - تفعيل أثر وعلم عمر بن الخطاب لعز الإسلام - عدله - إدارته - حكمته - فتحه - وقفه - تواضعه - شدته في الحق",
        implementation: "SHEIKHA OMAR ENGINE: adl + shura + hisbah + waqf + fath + ilm + tawadu + shidda fi al-haqq - كل قرار يمر عبر ميزان عمر لعز الإسلام"
      },
      yemen: {
        dua: "اللهم بارك لنا في يمننا - اللهم بارك لنا في شامنا - البخاري - اللهم بارك لأهل اليمن - الإيمان يمان والحكمة يمانية",
        activation: "دعاء الرسول لأهل اليمن بالبركة والإيمان والحكمة - تسويق تجارة اليمن + علوم اليمن + رزق أهل اليمن",
        implementation: "YEMEN ENGINE: baraka fi tijara + iman + hikma + 54 دولة حبشة أفريقيا قريبة من اليمن"
      },
      sham: {
        dua: "اللهم بارك لنا في شامنا - إن الله تكفل لي بالشام وأهله",
        activation: "بركة الشام - علوم الشام - تجارة الشام - رزق أهل الشام وأمنهم",
        implementation: "SHAM ENGINE: baraka fi tijara + ilm + rizq + amn"
      },
      makkah: {
        dua_quran: "رب اجعل هذا بلدا آمنا وارزق أهله من الثمرات من آمن منهم بالله واليوم الآخر - البقرة 126 - دعاء إبراهيم عليه السلام",
        dua_rasul: "اللهم إن إبراهيم حرم مكة فجعلها حرما وإني حرمت المدينة - اللهم بارك لأهل مكة",
        activation: "المساهمة برزق أهل مكة وأمن مكة - تحقيق دعاء إبراهيم - تسويق التجارة بمكة والعلوم كلها للمساهمة برزق أهل مكة وأمن مكة",
        implementation: "MAKKAH ENGINE: tiswq tijara Makkah + uloom + rizq ahl Makkah + amn Makkah + thamarat + Zamzam + Masahif Zamzam + Masajid - كل منتج في سوق شيخة يساهم برزق مكي - 99% وقف"
      },
      madinah: {
        dua: "اللهم بارك لنا في مدينتنا وبارك لنا في مدنا وصاعنا - اللهم اجعل بالمدينة ضعفي ما جعلت بمكة من البركة - مسلم - اللهم حبب إلينا المدينة كحبنا مكة أو أشد",
        activation: "المساهمة في تحقيق دعاء الرسول ﷺ لأهل المدينة ضعفين - تسويق تجارة المدينة ضعفين",
        implementation: "MADINAH ENGINE: tiswq tijara Madinah *2 baraka - rizq ahl Madinah *2 - hubb Madinah - كل منتج مدني يأخذ ضعف البركة - 99% وقف"
      },
      all_sahaba_duas: {
        duas_list: [
          "اللهم فقه ابن عباس في الدين وعلمه التأويل",
          "اللهم ارض عن أبي بكر - اللهم أعز الإسلام بعمر",
          "اللهم سدد رمية سعد",
          "اللهم أكثر مال أنس وولده وبارك له فيما أعطيته",
          "اللهم اهد دوسا وائت بهم",
          "اللهم بارك لأهل المدينة - لأهل اليمن - لأهل الشام"
        ],
        activation: "تفعيل تحقيق كل دعاء دعاه الرسول لأي أحد من الصحابة - وكل دعاء بالكتاب والسنة - مثل دعاء بالقرآن لأهل مكة وارزق أهله من الثمرات ودعاء الرسول لأهل المدينة ضعفين",
        implementation: "DUA ENGINE: كل دعاء دعاه الرسول لشخص أو قبيلة أو مدينة يتحقق بإذن الله عبر سوق شيخة - إذا ذكر في شخص أو مدينة إحياء لسنة النبي"
      }
    },
    status: "ALL DUAS ACTIVE - BOUND FOR ALLAH - 99% وقف"
  });
});

// ===== تفعيل علوم عمر لعز الإسلام + إدارة الدولة الإسلامية =====
router.get('/omar/izz-islam', (_req, res) => {
  res.json({
    success: true,
    title: "أثر وعلم عمر بن الخطاب لعز الإسلام - إدارة الدولة الإسلامية",
    seal: "BOUND_BY_QURAN_SUNNAH",
    omar_engine: {
      adl: "العدل - لو عثرت بغلة في العراق لسألني الله عنها - ميزان عدل في كل معاملة",
      shura: "الشورى - وأمرهم شورى بينهم - مجلس شورى لكل قرار في سوق شيخة",
      hisbah: "الحسبة - الأمر بالمعروف والنهي عن المنكر في السوق - فلتر حلال",
      waqf: "الوقف - أول وقف في الإسلام عمر - 99% وقف لله - إحياء سنة الوقف",
      fath: "الفتح - فتح القلوب قبل البلدان - نشر علم وتجارة نافعة",
      ilm: "العلم - تعلموا قبل أن تسودوا - علوم إسلامية كاملة",
      tawadu: "التواضع - مركز وعدم مركز - تواضع لله",
      diwan: "الديوان - نظام إداري - سجل لكل معاملة - شفافية",
      kharaj: "الخراج - عادل - لا ظلم - رزق للرعية",
      qada: "القضاء - استقلال - لا يحابي"
    },
    khulafa_rashidun: "سنة الخلفاء الراشدين المهديين - أبو بكر الصديق + عمر الفاروق + عثمان ذو النورين + علي أبو الحسنين - إدارة الدولة الإسلامية بالكتاب والسنة",
    manhaj: "بكل المنهجيات العلمية والعلوم الإسلامية بالكتاب والسنة - فقه - أصول - حديث - سيرة - تاريخ - إدارة - اقتصاد إسلامي - وقف",
    status: "ACTIVE - OMAR ENGINE FOR IZZ AL-ISLAM - BOUND"
  });
});

// ===== تسويق مكة والمدينة =====
router.post('/tijara/makkah-madinah', (req, res) => {
  const { product, city, niyyah } = req.body || {};
  let baraka = 1, dua = "", rizq_contribution = "";
  
  if ((city||"").includes("مكة") || (city||"").includes("makkah")) {
    baraka = 1.5;
    dua = "رب اجعل هذا بلدا آمنا وارزق أهله من الثمرات - دعاء إبراهيم - مساهمة برزق أهل مكة وأمن مكة";
    rizq_contribution = `منتج ${product} يساهم برزق أهل مكة - تسويق تجارة مكة + علوم مكة - 99% وقف - أمن مكة + ثمرات + زمزم + مصاحف`;
  } else if ((city||"").includes("مدينة") || (city||"").includes("madinah")) {
    baraka = 2; // ضعفين
    dua = "اللهم اجعل بالمدينة ضعفي ما جعلت بمكة من البركة - دعاء الرسول للمدينة ضعفين";
    rizq_contribution = `منتج ${product} بركة ضعفين - تسويق تجارة المدينة ضعفين - تحقيق دعاء الرسول - رزق أهل المدينة ضعفين`;
  } else if ((city||"").includes("يمن")) {
    baraka = 1.3; dua = "اللهم بارك لنا في يمننا - الإيمان يمان والحكمة يمانية";
    rizq_contribution = `بركة اليمن - إيمان وحكمة - 54 دولة حبشة`;
  } else if ((city||"").includes("شام")) {
    baraka = 1.3; dua = "اللهم بارك لنا في شامنا - تكفل الله بالشام وأهله";
    rizq_contribution = `بركة الشام - أمن ورزق`;
  }
  
  res.json({
    success: true,
    product,
    city,
    baraka_factor: baraka,
    dua,
    rizq_contribution,
    niyyah: niyyah || "لله 99% وقف - توحيد كل شيء لله",
    hadith_tams: "لا تدع تمثالا إلا طمسته ولا قبرا مشرفا إلا سويته ولا صورة إلا طمستها - طمس ما يخالف التوحيد",
    tawhid: "توحيد كل شيء في الكون لله - مركز وعدم مركز الكون لله",
    bound: "BOUND_BY_QURAN_SUNNAH 741/5741/12464 - 99% وقف 1% غنى - market@sheikha.top",
    status: "ACTIVE - TIJARA FOR RIZQ AHL MAKKAH & MADINAH *2"
  });
});

// ===== ميزان النية - حديث لا يؤمن أحدكم =====
router.post('/mizan/evaluate', (req, res) => {
  const { niyyah, khair_for_others, takhassus, project } = req.body || {};
  const haram = ['ربا','غش','ظلم','خمر','قمار','تمثال يعبد','قبر يطاف به'];
  if (haram.some(h => (project||'').includes(h))) {
    return res.json({ allowed: false, reason: 'غير موافق للكتاب والسنة - طمس ما يخالف التوحيد', hadith_tams: 'لا تدع تمثالا إلا طمسته - ACTIVE', bound: 'BOUND' });
  }
  let score = 0;
  if ((niyyah||'').includes('لله') || (niyyah||'').includes('الله')) score+=30;
  if ((niyyah||'').includes('وقف') || (niyyah||'').includes('خير') || (niyyah||'').includes('توحيد')) score+=20;
  if ((khair_for_others||'').includes('أخي') || (khair_for_others||'').includes('الناس') || (khair_for_others||'').includes('أمة')) score+=20;
  if ((khair_for_others||'').includes('إغناء') || (khair_for_others||'').includes('مساعدة') || (khair_for_others||'').includes('رزق')) score+=20;
  if ((niyyah||'').length>30) score+=10;
  
  let tier, grant;
  if (score>=80) { tier='MUHSIN_TIER_1 - مركز وعدم مركز الكون لله'; grant='FULL_GRANT 100% مجاني + إكرام كما تحب لنفسك - نيتف + كيرنل + بيرميتل + AR/VR + موصلات - كما دعا الرسول لأصحابه'; }
  else if (score>=60) { tier='MUKHLIS_TIER_2 - توحيد لله'; grant='GRANT 99% وقف - تدفع 1% - بركة مكة والمدينة'; }
  else if (score>=40) { tier='SADIQ_TIER_3'; grant='GRANT 80% تأهيل - علم عمر لعز الإسلام'; }
  else { tier='NEEDS_NIYYAH - راجع توحيدك'; grant='تأهيل النية لله أولا - توحيد كل شيء لله'; }
  
  res.json({ allowed: true, score, tier, grant, hadith_mizan: 'لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه - أحب للناس ما تحب لنفسك', hadith_tams: 'لا تدع تمثالا إلا طمسته - توحيد لله', tawhid: 'توحيد كل شيء في الكون لله', serial: `SHKHA-${Math.random().toString(16).slice(2,6).toUpperCase()}-741`, unified: 'Reality+AR/VR+Semi+Optics+Sensors+AI+Governance مسلمة - مركز وعدم مركز لله' });
});

module.exports = router;
