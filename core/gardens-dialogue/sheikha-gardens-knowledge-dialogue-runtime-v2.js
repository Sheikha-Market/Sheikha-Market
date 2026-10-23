'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  buildUnifiedCommerceRuntime
} = require('../commerce/sheikha-unified-commerce-runtime-v1');
const {
  buildProductPreview
} = require(
  '../technical-experience/' +
  'sheikha-technical-experience-runtime-v1'
);

const ROOT = path.resolve(__dirname, '..', '..');

const FILES = Object.freeze({
  contract: 'runtime/jannat-gardens/v2/contracts/' +
    'sheikha-gardens-knowledge-dialogue-v2-contract.json',
  thoughtFrameworks: 'runtime/jannat-gardens/v2/registries/' +
    'contemporary-thought-frameworks-v1.json',
  historicalThoughtFrameworks: 'runtime/jannat-gardens/v2/registries/' +
    'historical-thought-frameworks-v1.json',
  religiousMethodReferences: 'runtime/jannat-gardens/v2/registries/' +
    'religious-ethical-method-references-v1.json',
  gardensV1: 'runtime/jannat-gardens/v1/' +
    'sheikha-jannat-gardens-v1-report.json',
  gardensV3: 'runtime/gardens-and-trees/v3/' +
    'sheikha-gardens-and-trees-v3.json',
  publicModel: 'public/sheikha-jannat-gardens/' +
    'sheikha-jannat-gardens-v2.json'
});

const PHYSICAL_GARDEN_BOUNDARY = Object.freeze({
  designStatus: 'CONCEPT_DESIGN_REQUIRES_SITE_SURVEY',
  digitalMetaphorIsNotBiology: true,
  localAgronomistRequired: true,
  soilLaboratoryRequired: true,
  irrigationWaterLaboratoryRequired: true,
  utilityAndDrainageSurveyRequired: true,
  exactPlantSpacingDeclared: false,
  exactIrrigationScheduleDeclared: false,
  medicalOrNutritionalTreatmentClaimed: false,
  physicalPlantingExecuted: false,
  statementAr:
    'الوصف النباتي نموذج تصميم أولي. لا يبدأ الغرس الفعلي قبل تحليل التربة والماء والموقع واعتماد مهندس زراعي محلي.'
});

const SHARED_GARDEN_LAWS = Object.freeze([
  'لا ادعاء أن التشبيه الرقمي وصف بيولوجي أو تمثيل للجنة الغيبية.',
  'لا غرس فعلي قبل تحليل التربة ومصدر المياه والصرف والمرافق المدفونة.',
  'لا رقم ري أو تسميد ثابت دون بيانات الموقع والنوع النباتي والموسم.',
  'تقدم الأنواع المحلية أو المتكيفة قليلة الاستهلاك للماء عند تساوي المنفعة.',
  'يمنع إدخال نوع غاز أو مضر بالبيئة المحلية دون موافقة الجهة المختصة.',
  'تفصل مياه الشرب عن مياه الري وتراقب الجودة والملوحة دوريًا.',
  'كل مادة كيميائية أو مكافحة آفات تحتاج بطاقة سلامة وترخيصًا وخطة تقليل تعرض.',
  'كل ثمرة تشغيلية تحتاج مالكًا ومؤشرًا ودليلًا وخطة تعاف.',
  'لا يتحول المحتوى الشرعي إلى فتوى أو حكم تنفيذي آلي.',
  'تراعى السلامة وإتاحة الحركة والظل والصيانة ومنع الضرر.'
]);

const PLANT_ARCHETYPES = Object.freeze({
  DATE_PALM: {
    nameAr: 'نخلة التمر',
    scientificName: 'Phoenix dactylifera',
    categoryAr: 'نخلة مثمرة وظل رأسي',
    climateAr: 'مناخ حار مشمس بعد تحقق ملاءمة الصنف والرطوبة والملوحة.',
    soilAr: 'تربة جيدة الصرف يحدد تحليلها المعالجة والملوحة المقبولة للصنف.',
    flowerAr: 'نورات موسمية؛ إدارة التلقيح والإثمار عمل زراعي متخصص.',
    fruitAr: 'التمر',
    tasteAr: 'حلو بدرجات تختلف باختلاف الصنف ومرحلة النضج.',
    usesAr: ['غذاء', 'ظل رأسي', 'هوية مكانية', 'منتج قابل للتعبئة بعد اشتراطات السلامة الغذائية'],
    plantingAr: 'فسيلة أو شتلة موثقة المصدر في حفرة وموقع صرف معتمدين.',
    irrigationAr: 'تنقيط محكوم بقياس رطوبة التربة والملوحة والبخر-نتح.',
    safetyAr: 'يلزم برنامج لخدمة التاج والحصاد ومنع سقوط الثمار أو السعف.'
  },
  OLIVE: {
    nameAr: 'شجرة الزيتون',
    scientificName: 'Olea europaea',
    categoryAr: 'شجرة دائمة الخضرة مثمرة',
    climateAr: 'شمس كاملة وموقع يراجَع فيه الحر والرطوبة واحتياجات الصنف.',
    soilAr: 'تربة جيدة الصرف؛ لا يعتمد مجال حموضة أو ملوحة دون تحليل.',
    flowerAr: 'أزهار صغيرة موسمية ويتأثر العقد بالصنف والطقس.',
    fruitAr: 'الزيتون',
    tasteAr: 'مر أو قابض قبل المعالجة؛ يستهلك بعد معالجة غذائية مناسبة.',
    usesAr: ['زيت أو ثمار بعد المعالجة', 'ظل خفيف', 'قيمة تعليمية وزراعية'],
    plantingAr: 'شتلة صنفية موثقة مع مساحة جذر وصرف وتهوية.',
    irrigationAr: 'تنقيط محسوب وتجنب تشبع الجذور.',
    safetyAr: 'لا يؤكل الزيتون الخام بوصفه منتجًا جاهزًا؛ تطبق سلامة الغذاء.'
  },
  SIDR: {
    nameAr: 'شجرة السدر',
    scientificName: 'Ziziphus spina-christi',
    categoryAr: 'شجرة ظل وثمر متكيفة',
    climateAr: 'مناخ حار وموقع مشمس بعد فحص ملاءمة الأصل والموقع.',
    soilAr: 'تربة مصرفة مع فحص الملوحة وقدرة الجذور على التوسع.',
    flowerAr: 'أزهار صغيرة موسمية ذات قيمة بيئية، مع إدارة آمنة للتنوع الحيوي.',
    fruitAr: 'النبق',
    tasteAr: 'حلو إلى حلو حامض بحسب الصنف والنضج.',
    usesAr: ['ظل', 'ثمرة غذائية بعد التحقق', 'مصد رياح جزئي', 'تعليم بيئي'],
    plantingAr: 'شتلة موثقة بعيدًا عن تعارض الجذور مع المرافق.',
    irrigationAr: 'ري تأسيسي ثم جدول مبني على القياس والعمر.',
    safetyAr: 'تراعى الأشواك المحتملة ومسافات المشاة والحصاد والنظافة.'
  },
  POMEGRANATE: {
    nameAr: 'شجرة الرمان',
    scientificName: 'Punica granatum',
    categoryAr: 'شجيرة أو شجرة صغيرة مثمرة',
    climateAr: 'شمس كافية مع اختيار صنف ملائم للحرارة والرطوبة.',
    soilAr: 'تربة جيدة الصرف وتحسين عضوي مبني على تحليل.',
    flowerAr: 'أزهار حمراء أو برتقالية موسمية قبل العقد.',
    fruitAr: 'الرمان',
    tasteAr: 'حلو أو حلو حامض بحسب الصنف.',
    usesAr: ['ثمرة طازجة', 'عصير ضمن اشتراطات الغذاء', 'قيمة جمالية وتعليمية'],
    plantingAr: 'شتلة موثقة مع توجيه يسمح بالضوء والتهوية.',
    irrigationAr: 'ري منتظم محسوب وتجنب تقلبات حادة عند الإثمار.',
    safetyAr: 'لا تقدم ادعاءات علاجية؛ تنظف الثمار وتفحص قبل الاستهلاك.'
  },
  FIG: {
    nameAr: 'شجرة التين',
    scientificName: 'Ficus carica',
    categoryAr: 'شجرة صغيرة مثمرة',
    climateAr: 'شمس وموقع يسمح بانتشار الجذور مع اختيار صنف ملائم.',
    soilAr: 'تربة مصرفة وتوازن رطوبة دون إغراق.',
    flowerAr: 'الأزهار داخل البنية الثمرية ولا تعرض كزهرة تقليدية ظاهرة.',
    fruitAr: 'التين',
    tasteAr: 'حلو وعطري عند النضج.',
    usesAr: ['ثمرة طازجة أو مجففة ضمن ضوابط الغذاء', 'ظل محدود', 'تعليم دورة النضج'],
    plantingAr: 'شتلة موثقة بعيدًا عن الأنابيب والمنشآت الحساسة.',
    irrigationAr: 'تنقيط حسب قياس التربة ومرحلة النمو.',
    safetyAr: 'تراعى حساسية العصارة والثمار الساقطة والنظافة.'
  },
  LEMON: {
    nameAr: 'شجرة الليمون',
    scientificName: 'Citrus limon',
    categoryAr: 'حمضيات مثمرة عطرية',
    climateAr: 'موقع مشمس محمي نسبيًا مع فحص تحمل الصنف للحر والرطوبة.',
    soilAr: 'تربة جيدة الصرف ومراقبة دقيقة للملوحة والعناصر.',
    flowerAr: 'أزهار بيضاء عطرية موسمية.',
    fruitAr: 'الليمون',
    tasteAr: 'حامض عطري.',
    usesAr: ['غذاء ومشروبات ضمن سلامة الغذاء', 'رائحة وجمال', 'تعليم جودة المياه'],
    plantingAr: 'شتلة مطعمة وموثقة مع حماية منطقة التطعيم.',
    irrigationAr: 'تنقيط متوازن مع مراقبة الملوحة وانسداد النقاطات.',
    safetyAr: 'لا ادعاء علاجي؛ تراعى الحساسية والآفات وبقايا المكافحة.'
  },
  GRAPE: {
    nameAr: 'كرمة العنب',
    scientificName: 'Vitis vinifera',
    categoryAr: 'متسلق مثمر يحتاج تعريشة',
    climateAr: 'شمس وتهوية واختيار صنف يناسب الحرارة والرطوبة.',
    soilAr: 'تربة مصرفة مع تصميم جذور وتعريشة منفصلين عن الممر.',
    flowerAr: 'عناقيد زهرية صغيرة قبل تكوين الحبات.',
    fruitAr: 'العنب',
    tasteAr: 'حلو أو حلو حامض بحسب الصنف والنضج.',
    usesAr: ['ثمرة طازجة', 'زبيب أو عصير ضمن اشتراطات الغذاء', 'ظل تعريشة'],
    plantingAr: 'شتلة صنفية موثقة مع تعريشة محسوبة إنشائيًا.',
    irrigationAr: 'تنقيط وقياس رطوبة مع إدارة مرحلة الإثمار.',
    safetyAr: 'تمنع التعريشة غير الآمنة وتدار الثمار الساقطة والآفات.'
  },
  MORINGA: {
    nameAr: 'شجرة المورينجا',
    scientificName: 'Moringa oleifera',
    categoryAr: 'شجرة سريعة النمو متعددة الاستخدام',
    climateAr: 'حرارة وشمس مع تقييم الرياح وقدرة الموقع على احتواء النمو.',
    soilAr: 'تربة خفيفة إلى متوسطة جيدة الصرف بعد التحليل.',
    flowerAr: 'أزهار فاتحة موسمية.',
    fruitAr: 'قرون وأوراق بحسب الاستخدام المعتمد',
    tasteAr: 'الأوراق عشبية تميل إلى الحدة؛ لا تذوق دون اعتماد غذائي.',
    usesAr: ['تعليم نمو سريع', 'ظل خفيف', 'استخدام غذائي فقط بعد مراجعة السلامة'],
    plantingAr: 'شتلة موثقة مع تقليم وتثبيت أولي حسب الرياح.',
    irrigationAr: 'ري تأسيسي ثم قياس الرطوبة وتجنب الإغراق.',
    safetyAr: 'لا ادعاءات علاجية أو تغذوية؛ أي استهلاك يخضع لمختص وسلامة الغذاء.'
  },
  GHAF: {
    nameAr: 'شجرة الغاف',
    scientificName: 'Prosopis cineraria',
    categoryAr: 'شجرة ظل صحراوية',
    climateAr: 'مناخ جاف حار مع تحقق نظامي من النوع ومصدر الشتلة.',
    soilAr: 'تربة صحراوية أو رملية مصرفة بعد فحص الموقع والمرافق.',
    flowerAr: 'أزهار صغيرة موسمية ذات دور بيئي.',
    fruitAr: 'قرون ليست منتجًا غذائيًا عامًا في هذا التصميم',
    tasteAr: 'غير مخصص للتذوق ضمن دليل شيخة.',
    usesAr: ['ظل', 'مصد رياح مدروس', 'تعليم الاستدامة', 'خفض حاجة الري بعد التأسيس'],
    plantingAr: 'شتلة محلية مرخصة مع مساحة جذر وممر صيانة.',
    irrigationAr: 'ري تأسيسي متناقص وفق القياس وحالة الشجرة.',
    safetyAr: 'لا تستخدم القرون غذائيًا هنا، وتراجع الجذور والمسافات والأنظمة المحلية.'
  },
  ROSEMARY: {
    nameAr: 'إكليل الجبل',
    scientificName: 'Salvia rosmarinus',
    categoryAr: 'شجيرة عطرية',
    climateAr: 'شمس وتهوية مع فحص تحمل رطوبة الموقع.',
    soilAr: 'تربة خفيفة جيدة الصرف؛ يمنع ركود الماء.',
    flowerAr: 'أزهار صغيرة زرقاء أو بنفسجية بحسب الصنف.',
    fruitAr: 'لا توجد ثمرة غذائية مقصودة؛ الأوراق عطرية.',
    tasteAr: 'عطري قوي؛ الاستخدام الغذائي بكميات مناسبة وبعد تحقق السلامة.',
    usesAr: ['حدود نباتية', 'رائحة', 'تعليم نباتات قليلة الري'],
    plantingAr: 'شتلات على مسافة تعتمد بعد تصور الحجم الناضج.',
    irrigationAr: 'تنقيط خفيف مبني على الرطوبة وتجنب الإفراط.',
    safetyAr: 'لا ادعاءات علاجية، ولا استهلاك دون معرفة المصدر والمعالجة.'
  },
  MINT: {
    nameAr: 'النعناع',
    scientificName: 'Mentha spicata',
    categoryAr: 'عشب عطري ممتد',
    climateAr: 'ضوء مناسب مع ظل جزئي ممكن وحماية من الحر الشديد.',
    soilAr: 'تربة تحتفظ برطوبة متوازنة مع صرف ومنع انتشار غير محكوم.',
    flowerAr: 'سنابل زهرية صغيرة.',
    fruitAr: 'لا ثمرة مقصودة؛ الأوراق هي الجزء العطري.',
    tasteAr: 'منعش عطري.',
    usesAr: ['حديقة تعليمية', 'رائحة', 'استخدام غذائي بعد سلامة المصدر'],
    plantingAr: 'يفضل حوض محكوم لمنع الانتشار.',
    irrigationAr: 'ري متقارب نسبيًا حسب القياس دون ركود.',
    safetyAr: 'يمنع التلوث من مياه غير صالحة للمحاصيل المأكولة.'
  },
  BASIL: {
    nameAr: 'الريحان',
    scientificName: 'Ocimum basilicum',
    categoryAr: 'عشب عطري موسمي أو قصير العمر',
    climateAr: 'شمس صباحية أو ضوء مناسب مع حماية من الإجهاد الحراري.',
    soilAr: 'تربة خصبة مصرفة ومصدر زراعي نظيف.',
    flowerAr: 'سنابل زهرية صغيرة عطرية.',
    fruitAr: 'لا ثمرة مقصودة؛ الأوراق عطرية.',
    tasteAr: 'عطري عشبي.',
    usesAr: ['تعليم', 'رائحة', 'استخدام غذائي بعد اشتراطات السلامة'],
    plantingAr: 'شتلات أو بذور موثقة في حوض إنتاج نظيف.',
    irrigationAr: 'تنقيط أو ري منخفض الرذاذ يحافظ على رطوبة متوازنة.',
    safetyAr: 'تطبق سلامة المحاصيل المأكولة ولا تقدم ادعاءات علاجية.'
  },
  JASMINE: {
    nameAr: 'الياسمين العربي',
    scientificName: 'Jasminum sambac',
    categoryAr: 'شجيرة عطرية متسلقة جزئيًا',
    climateAr: 'ضوء مناسب وحماية من الإجهاد الحراري والرياح الجافة.',
    soilAr: 'تربة عضوية مصرفة بعد التحليل.',
    flowerAr: 'أزهار بيضاء عطرية.',
    fruitAr: 'لا ثمرة غذائية مقصودة.',
    tasteAr: 'غير مخصص للتذوق.',
    usesAr: ['رائحة', 'تظليل خفيف', 'جمال بصري'],
    plantingAr: 'شتلة موثقة مع دعامة إن لزم ومسافة صيانة.',
    irrigationAr: 'تنقيط منتظم محسوب دون إغراق.',
    safetyAr: 'لا تستخدم الأجزاء نباتيًا أو غذائيًا دون مرجع مختص.'
  },
  DAMASK_ROSE: {
    nameAr: 'الورد الدمشقي',
    scientificName: 'Rosa damascena',
    categoryAr: 'شجيرة مزهرة عطرية',
    climateAr: 'موقع يختبر فيه الصنف والحرارة والرطوبة قبل التوسع.',
    soilAr: 'تربة خصبة مصرفة مع برنامج تغذية مبني على التحليل.',
    flowerAr: 'أزهار وردية عطرية موسمية.',
    fruitAr: 'لا ثمرة غذائية مقصودة في التصميم.',
    tasteAr: 'غير مخصص للتذوق.',
    usesAr: ['جمال ورائحة', 'تعليم الإزهار', 'هوية بصرية'],
    plantingAr: 'شتلات موثقة مع تهوية ومسار تقليم آمن.',
    irrigationAr: 'تنقيط وتجنب بلل الأوراق المستمر.',
    safetyAr: 'تراعى الأشواك والممرات ولا تستخدم الأزهار غذائيًا دون اعتماد.'
  },
  NATIVE_GRASS: {
    nameAr: 'غطاء عشبي محلي متكيف',
    scientificName: 'Site-selected native groundcover',
    categoryAr: 'مرج وغطاء تربة',
    climateAr: 'يختار النوع من قائمة محلية معتمدة حسب الظل والحرارة والملوحة.',
    soilAr: 'سطح تربة محسن مع صرف ومقاومة انجراف.',
    flowerAr: 'بحسب النوع المحلي المختار.',
    fruitAr: 'لا محصول غذائي مقصود.',
    tasteAr: 'غير مخصص للتذوق.',
    usesAr: ['تثبيت التربة', 'تلطيف بصري', 'تقليل الغبار', 'مساحة تعلم'],
    plantingAr: 'بذور أو شتلات معتمدة بعد اختبار رقعة صغيرة.',
    irrigationAr: 'شبكة مستقلة محكومة تقل تدريجيًا حسب نوع الغطاء.',
    safetyAr: 'يمنع اختيار نوع غاز أو مهيج أو كثيف الاستهلاك للماء.'
  }
});

const TREE_PLANT_MAP = Object.freeze({
  truth_tree: 'DATE_PALM',
  amanah_tree: 'OLIVE',
  adl_tree: 'SIDR',
  syntax_tree: 'POMEGRANATE',
  compiler_tree: 'FIG',
  contract_tree: 'LEMON',
  reasoning_tree: 'MORINGA',
  retrieval_tree: 'OLIVE',
  optimization_tree: 'GRAPE',
  knowledge_graph_tree: 'OLIVE',
  documentation_tree: 'POMEGRANATE',
  truth_gate_tree: 'SIDR',
  compute_tree: 'GHAF',
  semiconductor_tree: 'DATE_PALM',
  thermal_tree: 'ROSEMARY',
  resource_tree: 'DATE_PALM',
  factory_tree: 'MORINGA',
  recycling_tree: 'LEMON',
  community_tree: 'POMEGRANATE',
  market_tree: 'GRAPE',
  service_tree: 'MINT',
  security_tree: 'SIDR',
  recovery_tree: 'GHAF',
  health_tree: 'BASIL',
  interface_tree: 'JASMINE',
  accessibility_tree: 'NATIVE_GRASS',
  delight_tree: 'DAMASK_ROSE'
});

const TREE_PURPOSES = Object.freeze({
  truth_tree: 'تربط كل دعوى بمصدر وقياس وحدود معلنة.',
  amanah_tree: 'تحفظ الصلاحيات والبيانات والحقوق والعقود من التضييع.',
  adl_tree: 'تختبر أثر القرار على الأطراف وتمنع التحيز غير المبرر.',
  syntax_tree: 'تحول المقصد إلى صياغة عربية قابلة للتحليل.',
  compiler_tree: 'تنقل الصياغة إلى تمثيل تنفيذي متحقق المراحل.',
  contract_tree: 'تثبت المدخلات والمخرجات والشروط قبل الربط.',
  reasoning_tree: 'تفكك المسألة وتعرض الافتراضات والحدود.',
  retrieval_tree: 'تسترجع السياق من مصادر مسجلة بدل الاختلاق.',
  optimization_tree: 'تقارن البدائل بمقياس معلن دون تجاوز السياسة.',
  knowledge_graph_tree: 'تربط المفاهيم والمنتجات والقطاعات والأدلة.',
  documentation_tree: 'تحفظ مصدرًا واحدًا منظمًا للشرح والتشغيل.',
  truth_gate_tree: 'تمنع ترقية الدعوى إلى متحققة بلا دليل.',
  compute_tree: 'توزع العمل وتقيس الحمل والزمن والنتيجة.',
  semiconductor_tree: 'تسجل مكونات العتاد وحدود التوافق والتأهيل.',
  thermal_tree: 'توازن القدرة والطاقة والتبريد ضمن حدود السلامة.',
  resource_tree: 'تتبع المادة من المصدر إلى الاستخدام.',
  factory_tree: 'تربط المواصفة بمرحلة التصنيع وفحص الجودة.',
  recycling_tree: 'تعيد المورد من الفاقد إلى قيمة قابلة للقياس.',
  community_tree: 'تنظم المشاركة والرضا والحقوق ومسار الشكوى.',
  market_tree: 'تنظم العرض والطلب وطلب السعر والعقد دون اختلاق سوق حي.',
  service_tree: 'تحول الحاجة إلى خدمة ذات مستوى ومالك وتعاف.',
  security_tree: 'تطبق أقل صلاحية وتفصل مناطق الثقة وتثبت الأثر.',
  recovery_tree: 'تعيد النظام إلى آخر حالة متحققة بعد الفشل.',
  health_tree: 'تراقب المؤشرات وتكشف الانحراف مبكرًا.',
  interface_tree: 'تعرض الحالة والأمر والدليل بوضوح دون ازدحام.',
  accessibility_tree: 'تجعل المسار قابلًا للاستخدام عبر قدرات وأجهزة مختلفة.',
  delight_tree: 'تضيف جمالًا وظيفيًا هادئًا دون تعطيل المهمة.'
});

const OPERATIONAL_FRUIT_LABELS = Object.freeze({
  claims_with_evidence: 'ادعاءات مرتبطة بالدليل',
  rights_preserved: 'حقوق محفوظة',
  fair_decisions: 'قرارات عادلة قابلة للمراجعة',
  clear_specs: 'مواصفات واضحة',
  safe_execution: 'تنفيذ آمن',
  auditable_rules: 'قواعد قابلة للتدقيق',
  explainable_suggestions: 'اقتراحات مفسرة',
  grounded_answers: 'إجابات مسندة',
  measured_improvement: 'تحسين مقاس',
  linked_context: 'سياق مترابط',
  single_source_of_truth: 'مصدر معرفة موحد',
  blocked_false_claims: 'منع الادعاء غير المثبت',
  parallel_results: 'نتائج حوسبة موزعة',
  trusted_components: 'مكونات موثقة الحالة',
  safe_capacity: 'سعة آمنة',
  traceable_materials: 'مواد قابلة للتتبع',
  quality_outputs: 'مخرجات جودة',
  recovered_value: 'قيمة مستردة',
  trusted_participation: 'مشاركة موثوقة',
  lawful_exchange: 'تبادل منظم',
  helpful_experiences: 'تجارب نافعة',
  least_privilege: 'أقل صلاحية',
  restore_points: 'نقاط استعادة',
  early_alerts: 'إنذار مبكر',
  clear_screens: 'شاشات واضحة',
  inclusive_use: 'استخدام ميسر',
  gentle_interaction: 'تفاعل لطيف'
});

const GARDEN_PROFILES = Object.freeze({
  RAWDAH_OF_TAWHID_GOVERNANCE: {
    descriptionAr: 'مظلة قيمية غير تنفيذية تذكّر بالصدق والأمانة والعدل ومنع الضرر.',
    terrainAr: 'ساحة هادئة بمحاور واضحة وظل وماء مرئي دون تحويل المرجعية إلى عقد تنفيذي.',
    meadowAr: 'مرج للتأمل والتعلم بمسارات متاحة ومواد قليلة الصيانة.',
    soilStrategyAr: 'تربة رمزية تمثل سلامة المقصد، وتربة فعلية لا تعتمد إلا بعد المختبر.',
    riverRoleAr: 'مسار إرشاد منهجي لا ينفذ حكمًا شرعيًا آليًا.',
    operationalTasteAr: 'واضح ومتزن وخال من المبالغة.',
    productIds: ['PROD-GOV-001', 'PROD-DEC-001'],
    sectorIds: ['government', 'education', 'healthcare']
  },
  GARDEN_OF_SHEIKHA_LANGUAGE: {
    descriptionAr: 'حديقة تحول المعنى العربي إلى مواصفة وعقد وترجمة قابلة للاختبار.',
    terrainAr: 'مصاطب تعليمية تمثل الصياغة والترجمة والعقد.',
    meadowAr: 'مرج أمثلة وتمارين ومسارات تعلم متدرجة.',
    soilStrategyAr: 'التربة الرقمية هي النحو والمخطط والأنواع؛ والفعلية مختبرية.',
    riverRoleAr: 'ينقل المعنى من النص إلى التمثيل ثم الأثر.',
    operationalTasteAr: 'فصيح ومحدد وسهل التتبع.',
    productIds: ['PROD-ENG-001', 'PROD-CAP-001'],
    sectorIds: ['education', 'ai-services', 'government']
  },
  GARDEN_OF_GOVERNED_AI: {
    descriptionAr: 'ذكاء صناعي يقدم دعم قرار مفسرًا تحت السياسة والمراجعة البشرية.',
    terrainAr: 'عقد تحليل منفصلة تحيط بها بوابة حوكمة وممر مراجعة.',
    meadowAr: 'مرج تجارب آمنة ومقارنات ونماذج قياس.',
    soilStrategyAr: 'التربة الرقمية بيانات موثقة وسياسات؛ ولا نموذج بلا مصدر وحد.',
    riverRoleAr: 'السياق يدخل، والاقتراح يخرج إلى المراجعة لا إلى تنفيذ عالي الأثر.',
    operationalTasteAr: 'مفسر وحذر وقابل للاعتراض.',
    productIds: ['PROD-AICL-001', 'PROD-UGITAI-001'],
    sectorIds: ['ai-services', 'cloud-saas', 'education']
  },
  GARDEN_OF_KNOWLEDGE_AND_TRUTH: {
    descriptionAr: 'تنظم المصادر والمفاهيم والأدلة وتفصل النص عن التفسير والقياس.',
    terrainAr: 'مكتبة مفتوحة ومسارات ربط بين المصدر والدعوى والاختبار.',
    meadowAr: 'مرج قراءة وبحث ومقارنة أدلة.',
    soilStrategyAr: 'التربة الرقمية جودة المصدر والنسب والنسخة والزمن.',
    riverRoleAr: 'ينقل البينة إلى الدعوى والتعلم إلى التحسين.',
    operationalTasteAr: 'موثق وعميق بلا إغراق اصطلاحي.',
    productIds: ['PROD-DEC-001', 'PROD-RIYADH-ALJANNAH'],
    sectorIds: ['education', 'media-without-living-beings', 'government']
  },
  GARDEN_OF_TECHNOLOGY_AND_COMPUTE: {
    descriptionAr: 'تقيس الحوسبة والعتاد والطاقة بدل وصف القدرة بلا اختبار.',
    terrainAr: 'ممرات بيانات ومناطق عتاد وطاقة وتبريد مع عزل واضح.',
    meadowAr: 'مرج مختبرات ومؤشرات أداء وسلامة.',
    soilStrategyAr: 'التربة الرقمية سجل العتاد والأحمال وخط الأساس.',
    riverRoleAr: 'ينقل عبء العمل إلى نتيجة ويربط الادعاء بالقياس.',
    operationalTasteAr: 'سريع حين يثبت القياس، ومحافظ حين تغيب الأدلة.',
    productIds: ['PROD-STAB-001', 'PROD-ENG-001', 'PROD-AICL-001'],
    sectorIds: ['industrial-iot', 'telecom', 'cloud-saas']
  },
  GARDEN_OF_SUPPLY_AND_PROVISION: {
    descriptionAr: 'تربط الموارد والمصانع والتدوير وسلسلة الإمداد بأثر قابل للتتبع.',
    terrainAr: 'مسار مادي ورقمي من المورد إلى المصنع والسوق والاسترداد.',
    meadowAr: 'مرج موارد يعرض الأصل والحالة والجودة والفاقد.',
    soilStrategyAr: 'التربة الرقمية سجل منشأ ومواصفة وملكية وحالة.',
    riverRoleAr: 'ينقل الإمداد ويعيد الفاقد إلى مسار قيمة محكوم.',
    operationalTasteAr: 'عملي وقليل الهدر واضح المصدر.',
    productIds: ['PROD-SUPPLY-CHAIN', 'PROD-ENERGY', 'PROD-MARKETPLACE'],
    sectorIds: ['supply-chain', 'manufacturing', 'recycling', 'logistics']
  },
  GARDEN_OF_MARKET_AND_COMMUNITY: {
    descriptionAr: 'تجمع السوق والمجتمع والخدمات على الرضا والعقد والشفافية.',
    terrainAr: 'ساحة سوق معرفية تفصل الاكتشاف عن العقد والدفع والتنفيذ.',
    meadowAr: 'مرج مشاركة وطلبات وشكاوى وتعليم.',
    soilStrategyAr: 'التربة الرقمية هوية الطرف وحقه وموافقته ومصدر العرض.',
    riverRoleAr: 'ينقل الحاجة إلى خدمة بعد الرضا والموافقة.',
    operationalTasteAr: 'نافع ومفهوم وغير ضاغط.',
    productIds: ['PROD-MARKETPLACE', 'PROD-CLOUD-SAAS', 'PROD-RIYADH-ALJANNAH'],
    sectorIds: ['commerce', 'marketplaces', 'education', 'cloud-saas']
  },
  GARDEN_OF_SECURITY_AND_RECOVERY: {
    descriptionAr: 'تحمي الخدمة وتكتشف الخلل وتستعيد الحالة دون توسيع الضرر.',
    terrainAr: 'حلقات حماية وصحة وتعاف منفصلة مع مخارج آمنة.',
    meadowAr: 'مرج تمارين استجابة واستعادة وأدلة.',
    soilStrategyAr: 'التربة الرقمية هوية ومفاتيح وسياسة ونسخ متحققة.',
    riverRoleAr: 'ينقل الحادث إلى عزل وعلاج واختبار ورجوع آمن.',
    operationalTasteAr: 'مطمئن وقابل للاستعادة ومحدود الصلاحية.',
    productIds: ['PROD-STAB-001', 'PROD-GOV-001'],
    sectorIds: ['cybersecurity', 'government', 'cloud-saas']
  },
  GARDEN_OF_BEAUTY_AND_EXPERIENCE: {
    descriptionAr: 'تصنع وضوحًا ويسرًا وجمالًا وظيفيًا يحترم اختلاف المستخدمين.',
    terrainAr: 'مشاهد واقعية وممرات هادئة وبيانات متحركة لغرض الفهم.',
    meadowAr: 'مرج تجربة متاح للحاسب والجوال وتقليل الحركة.',
    soilStrategyAr: 'التربة الرقمية نظام تصميم ومحتوى عربي قابل للقراءة.',
    riverRoleAr: 'ينقل نية المستخدم إلى إكمال واضح دون إرباك.',
    operationalTasteAr: 'هادئ ومبهج وواضح بلا إسراف.',
    productIds: ['PROD-CLOUD-SAAS', 'PROD-RIYADH-ALJANNAH'],
    sectorIds: ['media-without-living-beings', 'education', 'cloud-saas']
  }
});

const IDEA_INTEGRITY_DIMENSIONS = Object.freeze([
  {
    id: 'TERM_CLARITY',
    nameAr: 'وضوح المصطلح',
    questionAr: 'هل عُرّفت الفكرة وحدودها ومدرستها وزمنها دون خلط؟',
    evidenceAr: 'تعريف ومصدر أولي أو مرجعي وسياق تاريخي.'
  },
  {
    id: 'CLAIM_EVIDENCE',
    nameAr: 'دليل الدعوى',
    questionAr: 'ما الدليل المؤيد وما الدليل المضاد وما درجة الثقة؟',
    evidenceAr: 'مصادر قابلة للتتبع وبيانات ومنهج وقيود.'
  },
  {
    id: 'GOAL_MEANS_COHERENCE',
    nameAr: 'اتساق الغاية والوسيلة',
    questionAr: 'هل الوسيلة تحقق الهدف دون أن تنقضه؟',
    evidenceAr: 'نظرية تغيير واختبار سببية وبدائل أقل أثرًا.'
  },
  {
    id: 'NON_HARM',
    nameAr: 'منع الضرر',
    questionAr: 'من قد يتضرر، وما شدة الضرر واحتماله وخطة منعه؟',
    evidenceAr: 'تحليل مخاطر وآثار مباشرة وغير مباشرة وخطة توقف.'
  },
  {
    id: 'RIGHTS_AND_DIGNITY',
    nameAr: 'الحقوق والكرامة',
    questionAr: 'هل تحفظ كرامة الإنسان وحقوق المختلف والضعيف؟',
    evidenceAr: 'مراجعة حقوقية وتظلم مستقل وعدم تمييز.'
  },
  {
    id: 'PEACEFUL_LAWFUL_MEANS',
    nameAr: 'السلم والمشروعية',
    questionAr: 'هل المشاركة طوعية والوسائل سلمية ومشروعة وغير قسرية؟',
    evidenceAr: 'عقد صلاحيات وموافقة وقواعد منع الإكراه والعنف.'
  },
  {
    id: 'FAIR_DISTRIBUTION',
    nameAr: 'عدالة التوزيع',
    questionAr: 'كيف توزع المنافع والكلفة والمخاطر بين الأطراف؟',
    evidenceAr: 'تحليل توزيع وتعارض مصالح وأثر على الفئات الأضعف.'
  },
  {
    id: 'ENVIRONMENTAL_STEWARDSHIP',
    nameAr: 'عمارة الأرض والبيئة',
    questionAr: 'ما أثر الموارد والطاقة والماء والنفايات طويلًا؟',
    evidenceAr: 'خط أساس بيئي وقياس دورة حياة وخطة تقليل واستعادة.'
  },
  {
    id: 'REVERSIBILITY_AND_RECOVERY',
    nameAr: 'الرجوع والتعافي',
    questionAr: 'هل يمكن إيقاف البرنامج وعكس أثره وإصلاح الضرر؟',
    evidenceAr: 'بوابة توقف ونسخ حالة ومسؤول تعاف واختبار استرجاع.'
  },
  {
    id: 'ACCOUNTABILITY',
    nameAr: 'المساءلة والتعلم',
    questionAr: 'من يملك القرار والدليل، وكيف يعترض المتأثر ويتغير المسار؟',
    evidenceAr: 'مالك بشري وسجل قرار وتظلم ومراجعة دورية.'
  }
]);

const COMMUNITY_PROGRAM_TEMPLATES = Object.freeze([
  {
    id: 'KNOWLEDGE_AND_EVIDENCE',
    nameAr: 'المعرفة والتثبت',
    purposeAr: 'رفع جودة المصادر وفصل الحقيقة عن الرأي والادعاء.',
    activitiesAr: [
      'سجل مصادر ونسخ وتواريخ',
      'مراجعة دليل ودليل مضاد',
      'تعليم التفكير النقدي والمنهج العلمي'
    ],
    indicatorsAr: [
      'نسبة الدعاوى ذات المصدر',
      'نسبة القرارات التي عرضت دليلًا مضادًا',
      'عدد حالات عدم اليقين المعلنة'
    ]
  },
  {
    id: 'JUST_LIVELIHOOD_AND_MARKETS',
    nameAr: 'المعاش والسوق العادل',
    purposeAr: 'توسيع المنفعة والعمل المنتج مع منع الاستغلال والاحتكار.',
    activitiesAr: [
      'تحليل احتياجات وفرص محلية',
      'تجارب سوق صغيرة قابلة للرجوع',
      'شفافية العقود والتكلفة وتعارض المصالح'
    ],
    indicatorsAr: [
      'وصول المستفيدين للخدمة',
      'زمن إنجاز المعاملة',
      'شكاوى السوق المحلولة',
      'تركيز الموردين'
    ]
  },
  {
    id: 'SCIENCE_TECHNOLOGY_AND_SKILLS',
    nameAr: 'العلم والتقنية والمهارات',
    purposeAr: 'توجيه الابتكار إلى مشكلات مثبتة مع سلامة ومراجعة بشرية.',
    activitiesAr: [
      'مختبرات تعلم وتجريب معزولة',
      'تدريب مهارات رقمية وعلمية',
      'قياس الأداء والسلامة قبل التوسع'
    ],
    indicatorsAr: [
      'إكمال مسارات التعلم',
      'تجارب اجتازت بوابة السلامة',
      'زمن تحويل المشكلة إلى نموذج مختبر'
    ]
  },
  {
    id: 'COMMUNITY_DIALOGUE_AND_COHESION',
    nameAr: 'الحوار والتماسك المجتمعي',
    purposeAr: 'إدارة الاختلاف بعدل وحكمة دون تنميط أو إكراه.',
    activitiesAr: [
      'مجالس حوار طوعية محددة القضية',
      'عرض عادل لكل فكرة ودليلها واعتراضها',
      'وساطة وتظلم يحفظان كرامة الأطراف'
    ],
    indicatorsAr: [
      'المشاركة الطوعية',
      'نسبة القضايا التي وثق فيها المشترك والاختلاف',
      'زمن معالجة التظلمات',
      'بلاغات التمييز أو الإكراه'
    ]
  },
  {
    id: 'ENVIRONMENT_AND_STEWARDSHIP',
    nameAr: 'البيئة وعمارة الأرض',
    purposeAr: 'تحويل الموارد إلى منفعة مستدامة مع تقليل الهدر والضرر.',
    activitiesAr: [
      'خط أساس للماء والطاقة والنفايات',
      'مشروعات تدوير وكفاءة قابلة للقياس',
      'استعادة أثر بيئي متحقق'
    ],
    indicatorsAr: [
      'كثافة استهلاك الماء والطاقة',
      'نسبة الاسترداد والتدوير',
      'الانحراف عن خط الأساس البيئي'
    ]
  },
  {
    id: 'DIGITAL_SOVEREIGNTY_AND_SAFETY',
    nameAr: 'السيادة الرقمية والسلامة',
    purposeAr: 'تقليل التبعية وحماية البيانات دون رقابة شاملة أو عزل ضار.',
    activitiesAr: [
      'جرد البيانات والاعتماديات',
      'أقل صلاحية وخطة بديل واسترجاع',
      'تمارين حادث وتعاف دورية'
    ],
    indicatorsAr: [
      'الاعتماديات ذات البديل المختبر',
      'زمن اكتشاف الحادث',
      'زمن التعافي',
      'صلاحيات زائدة مكتشفة'
    ]
  },
  {
    id: 'GOVERNANCE_RIGHTS_AND_RECOVERY',
    nameAr: 'الحوكمة والحقوق والتعافي',
    purposeAr: 'ربط القرار بالدليل والمالك والتظلم والرجوع الآمن.',
    activitiesAr: [
      'سجل قرار وسبب ودليل',
      'مراجعة أثر وحقوق مستقلة',
      'بوابات توقف وتصحيح وجبر ضرر عبر مسار بشري مشروع'
    ],
    indicatorsAr: [
      'قرارات مكتملة الدليل والمالك',
      'زمن البت في الاعتراض',
      'نجاح اختبارات الاسترجاع',
      'إجراءات تصحيح مغلقة'
    ]
  }
]);

const PURPOSEFUL_IDEA_PRINCIPLES = Object.freeze([
  {
    id: 'PUBLIC_GOOD',
    nameAr: 'المنفعة العامة',
    commitmentAr: 'تربط الفكرة بمشكلة مثبتة ومنفعة قابلة للقياس.',
    antiAbuseAr: 'لا تستخدم عبارة المصلحة العامة لإلغاء حقوق فرد أو أقلية.'
  },
  {
    id: 'TRUTHFUL_EVIDENCE',
    nameAr: 'الصدق والتثبت',
    commitmentAr: 'تميز بين الحقيقة والفرضية والقيمة وتعرض الدليل المضاد.',
    antiAbuseAr: 'لا تخفي عدم اليقين ولا تنتقي الأدلة لخدمة نتيجة مقررة.'
  },
  {
    id: 'JUSTICE_AND_DIGNITY',
    nameAr: 'العدل والكرامة',
    commitmentAr: 'تحفظ كرامة الإنسان وحقوق المختلف والضعيف.',
    antiAbuseAr: 'لا تصنف قيمة الأشخاص أو أهليتهم بدين أو مذهب أو رأي.'
  },
  {
    id: 'NON_HARM',
    nameAr: 'منع الضرر',
    commitmentAr: 'تختار الوسيلة الأقل ضررًا وتضيف بوابة توقف وجبر أثر.',
    antiAbuseAr: 'لا تبرر العنف أو الإكراه أو العقوبة الجماعية بالغاية.'
  },
  {
    id: 'VOLUNTARY_PARTICIPATION',
    nameAr: 'المشاركة الطوعية',
    commitmentAr: 'تجعل الانضمام والانسحاب والاعتراض ممكنًا دون انتقام.',
    antiAbuseAr: 'لا تستعمل استهدافًا نفسيًا أو سياسيًا أو دينيًا شخصيًا.'
  },
  {
    id: 'EARTH_STEWARDSHIP',
    nameAr: 'عمارة الأرض',
    commitmentAr: 'تقيس أثر الموارد والطاقة والماء والنفايات عبر دورة الحياة.',
    antiAbuseAr: 'لا تنقل الضرر البيئي إلى مجتمع أو جيل آخر.'
  },
  {
    id: 'ACCOUNTABILITY',
    nameAr: 'المساءلة',
    commitmentAr: 'تربط كل قرار بمالك بشري ودليل وتظلم ومراجعة مستقلة.',
    antiAbuseAr: 'لا تمنح البرنامج أو الذكاء الصناعي سلطة بلا رقابة.'
  },
  {
    id: 'REVISION_AND_RECOVERY',
    nameAr: 'المراجعة والتعافي',
    commitmentAr: 'تحدد مدة مراجعة وإيقافًا ورجوعًا وتعافيًا قبل التوسع.',
    antiAbuseAr: 'لا تحول المسودة إلى عقيدة غير قابلة للنقد أو التعديل.'
  }
]);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function listReligiousMethodReferences() {
  return readJson(FILES.religiousMethodReferences);
}

function buildReligiousMethod(enabled) {
  const registry = listReligiousMethodReferences();
  return {
    enabled,
    references: enabled ? registry.references : [],
    automatedFatwa: false,
    automatedAqidahJudgment: false,
    automatedReligiousEnforcement: false,
    qualifiedScholarReviewRequired: enabled,
    textAndInterpretationReviewedBySoftware: false,
    sourceRegistryStatus: registry.status
  };
}

function unique(values) {
  return [...new Set(values)];
}

function resolveOperationalFruit(code) {
  return OPERATIONAL_FRUIT_LABELS[code] ||
    String(code || '').replaceAll('_', ' ');
}

function buildPlantingRoadmap() {
  return [
    {
      phase: 0,
      nameAr: 'تحديد المقصد والنطاق',
      exitCriteriaAr: 'مالك ونطاق وميزانية وحدود تشبيه واضحة.'
    },
    {
      phase: 1,
      nameAr: 'مسح الموقع',
      exitCriteriaAr: 'رفع مساحي وشمس ورياح ومرافق وصرف وحركة مستخدمين.'
    },
    {
      phase: 2,
      nameAr: 'مختبر التربة والماء',
      exitCriteriaAr: 'نتائج معتمدة وخطة معالجة ومصدر ري صالح للنبات المقصود.'
    },
    {
      phase: 3,
      nameAr: 'اختيار الأنواع والتصميم',
      exitCriteriaAr: 'قائمة أنواع محلية أو متكيفة ومخطط ري وصيانة وسلامة.'
    },
    {
      phase: 4,
      nameAr: 'رقعة تجريبية',
      exitCriteriaAr: 'نجاح موسم تأسيسي أو مدة يحددها المهندس دون ضرر ظاهر.'
    },
    {
      phase: 5,
      nameAr: 'الغرس المرحلي',
      exitCriteriaAr: 'استلام مصدر الشتلات وجودة الزراعة وتوثيق كل أصل.'
    },
    {
      phase: 6,
      nameAr: 'التشغيل والصيانة',
      exitCriteriaAr: 'جدول قياس للري والصحة والتقليم والنظافة والسلامة.'
    },
    {
      phase: 7,
      nameAr: 'الإزهار والإثمار والجني',
      exitCriteriaAr: 'جودة موثقة وسلامة غذاء عند الاستهلاك وتعلم يعاد إلى السجل.'
    }
  ];
}

function enrichTree(tree, garden) {
  const plantId = TREE_PLANT_MAP[tree.id];
  const plant = PLANT_ARCHETYPES[plantId];
  const operationalFruitAr = resolveOperationalFruit(tree.fruit);
  return {
    id: tree.id,
    nameAr: tree.name,
    purposeAr: TREE_PURPOSES[tree.id],
    operationalAnatomy: {
      seedAr: `حاجة أو مشكلة محددة تبدأ منها ${tree.name}.`,
      soilAr: garden.soilStrategyAr,
      rootAr: 'هوية وحوكمة وبيانات وأدلة تثبت القدرة قبل التوسع.',
      trunkAr: TREE_PURPOSES[tree.id],
      branchesAr: ['المدخلات', 'السياسة', 'التنفيذ المحدود', 'القياس والتعافي'],
      leavesAr: 'واجهات وتقارير واختبارات تجعل الحالة قابلة للرؤية.',
      flowerAr: 'مؤشر مبكر على أن المسار يعمل، ولا يعد ثمرة نهائية.',
      fruitAr: operationalFruitAr,
      tasteAr: garden.operationalTasteAr,
      usesAr: [
        `تطبيق ${TREE_PURPOSES[tree.id]}`,
        'شرح الحالة للمستخدم',
        'إنتاج دليل قابل للمراجعة'
      ],
      valueAr: `القيمة المقاسة هي جودة ${operationalFruitAr} لا جمال الاسم وحده.`,
      harvestAr: 'لا تجنى الثمرة الرقمية إلا بعد تحقق الاختبار والدليل والمالك.'
    },
    physicalExemplar: {
      id: plantId,
      ...plant,
      identityBoundaryAr:
        `استخدام ${plant.nameAr} مثال تصميمي مادي لـ${tree.name}، ولا يعني تطابق النبات مع الوظيفة الرقمية.`,
      siteApprovalStatus: 'LOCAL_AGRONOMIST_AND_SITE_DATA_REQUIRED'
    },
    specifications: {
      digitalContractRequired: true,
      ownerRequired: true,
      measurableIndicatorRequired: true,
      recoveryPlanRequired: true,
      plantSourceTraceabilityRequired: true,
      soilAndWaterEvidenceRequired: true
    },
    plantingInstructionsAr: [
      'ثبت الغرض الرقمي والمالك والمؤشر قبل بناء الفرع البرمجي.',
      `للنموذج المادي: تحقق من ملاءمة ${plant.nameAr} محليًا ومصدر الشتلة.`,
      plant.plantingAr,
      plant.irrigationAr,
      'سجل تاريخ الغرس والري والصيانة والملاحظات دون بيانات شخصية غير لازمة.',
      'اختبر رقعة صغيرة ثم وسع فقط بعد ثبوت الصحة والسلامة.'
    ],
    conditionsAr: [
      PHYSICAL_GARDEN_BOUNDARY.statementAr,
      plant.safetyAr,
      'لا يروج للطعم أو الاستخدام الغذائي قبل تحقق سلامة الغذاء والمصدر.'
    ]
  };
}

function enrichGarden(garden) {
  const profile = GARDEN_PROFILES[garden.id];
  const trees = garden.trees.map((tree) => enrichTree(tree, profile));
  const physicalProduce = unique(trees
    .map((tree) => tree.physicalExemplar.fruitAr)
    .filter((fruit) => !/لا (?:توجد|ثمرة|محصول)/.test(fruit)));
  return {
    id: garden.id,
    nameAr: garden.name,
    role: garden.role,
    descriptionAr: profile.descriptionAr,
    symbolicMeaningAr: garden.symbolicMeaning,
    mode: 'DUAL_DIGITAL_METAPHOR_AND_PHYSICAL_CONCEPT',
    terrainAr: profile.terrainAr,
    soil: {
      digitalAr: profile.soilStrategyAr,
      physicalAr:
        'تحدد الخلطة والمعالجة ومجال الحموضة والملوحة والعناصر بعد نتائج مختبر معتمد ونوع النبات.',
      requiredTestsAr: [
        'قوام التربة والصرف',
        'الحموضة والملوحة',
        'المادة العضوية والعناصر',
        'تلوث محتمل',
        'مقاومة الانضغاط عند الممرات'
      ],
      exactValuesDeclared: false
    },
    rivers: garden.rivers.map((river) => ({
      id: river.id,
      nameAr: river.name,
      digitalFlow: river.flow,
      roleAr: profile.riverRoleAr,
      metaphorical: river.metaphorical === true,
      physicalWaterFeatureStatus: 'CONCEPT_ONLY_REQUIRES_HYDRAULIC_AND_SAFETY_DESIGN',
      lawsAr: [
        'يفصل المسار الرقمي عن قناة الماء المادية.',
        'لا بركة أو مجرى مائي دون عزل وصرف وسلامة ونوعية ماء وخطة صيانة.',
        'تقاس كمية الماء ولا يعرض تدفق وهمي بوصفه استدامة.'
      ]
    })),
    meadow: {
      descriptionAr: profile.meadowAr,
      physicalGroundcoverAr: 'غطاء محلي متكيف يختاره المختص بعد تجربة ري وصيانة.',
      accessibilityRequired: true,
      shadeAndHeatAssessmentRequired: true,
      irrigationZoneSeparated: true
    },
    trees,
    flowersAr: unique(trees.map((tree) => tree.physicalExemplar.flowerAr)),
    operationalFruitsAr: trees.map((tree) =>
      tree.operationalAnatomy.fruitAr
    ),
    physicalProduceAr: physicalProduce,
    fruitTasteBoundaryAr:
      'الطعم المذكور وصف عام للنموذج النباتي؛ يختلف بالصنف والموقع والنضج ولا يجيز الاستهلاك دون تحقق السلامة.',
    lawsAr: SHARED_GARDEN_LAWS,
    conditionsAr: [
      'موافقة مالك الموقع والجهات المختصة.',
      'ميزانية تأسيس وصيانة ودورة حياة.',
      'خطة سلامة وإتاحة وتصريف ومكافحة آفات.',
      'سجل أدلة رقمي لا يحتوي سمات حساسة غير لازمة.'
    ],
    plantingRoadmap: buildPlantingRoadmap(),
    productIds: profile.productIds,
    sectorIds: profile.sectorIds,
    successMetrics: [
      'نسبة بقاء النباتات بعد الفترة التي يعتمدها المختص',
      'استهلاك الماء لكل منطقة ري',
      'سلامة المسارات وعدم الحوادث',
      'اكتمال سجلات الصيانة',
      'تغطية أدلة الثمار الرقمية'
    ],
    physicalBoundary: PHYSICAL_GARDEN_BOUNDARY
  };
}

function buildGardensCatalog() {
  const report = readJson(FILES.gardensV1);
  const gardens = report.gardens.map(enrichGarden);
  return {
    system: 'SHEIKHA_JANNAT_GARDENS_CATALOG_V2',
    status: 'ACTIVE_WITH_ENRICHED_WORLDLY_AND_OPERATIONAL_GUIDES',
    generatedAt: new Date().toISOString(),
    boundary: {
      ...report.worldlyBeautyBoundary,
      ...PHYSICAL_GARDEN_BOUNDARY
    },
    coverage: {
      gardens: gardens.length,
      trees: gardens.reduce((total, garden) =>
        total + garden.trees.length, 0),
      rivers: gardens.reduce((total, garden) =>
        total + garden.rivers.length, 0),
      flowers: gardens.reduce((total, garden) =>
        total + garden.flowersAr.length, 0),
      operationalFruits: gardens.reduce((total, garden) =>
        total + garden.operationalFruitsAr.length, 0),
      productsLinked: unique(gardens.flatMap((garden) =>
        garden.productIds)).length,
      sectorsLinked: unique(gardens.flatMap((garden) =>
        garden.sectorIds)).length
    },
    lawsAr: SHARED_GARDEN_LAWS,
    gardens
  };
}

function getGarden(gardenId) {
  const id = String(gardenId || '').trim().toUpperCase();
  return buildGardensCatalog().gardens.find((garden) =>
    garden.id === id
  ) || null;
}

function productGuideRoadmap() {
  return [
    'حدد المشكلة والمالك والمستخدم والنتيجة المطلوبة.',
    'ثبت عقد المدخلات والمخرجات والهوية والصلاحيات.',
    'اربط مصادر البيانات الموثقة فقط وسجل النسب والزمن.',
    'نفذ في بيئة محلية أو معزولة واختبر الحالات الصحيحة والفاشلة.',
    'قس الجودة والزمن والموثوقية دون تعميم نتيجة بيئة واحدة.',
    'اعرض الأثر العالي على الموافقة البشرية قبل التنفيذ.',
    'أطلق تدريجيًا مع مراقبة واسترجاع واختبار ما بعد الإطلاق.',
    'راجع الدليل والمنتج دوريًا وأوقف الادعاء الذي فقد دليله.'
  ];
}

function buildProductGuide(productId) {
  const commerce = buildUnifiedCommerceRuntime();
  const product = commerce.catalog.find((entry) =>
    entry.id === String(productId || '').trim().toUpperCase()
  );
  if (!product) return null;
  const preview = buildProductPreview(product.id, { level: 'expert' });
  const sectorNames = new Map(commerce.sectors.map((sector) =>
    [sector.id, sector.nameAr]
  ));
  return {
    system: 'SHEIKHA_PUBLIC_PRODUCT_GUIDE_V2',
    guideScope:
      'PUBLIC_COMPLETE_GENERAL_GUIDE_WITHOUT_CUSTOMER_SECRETS_OR_DEPLOYMENT_CREDENTIALS',
    product: preview.product,
    descriptionAr: preview.mechanismAr,
    engineering: {
      disciplineAr: preview.disciplineAr,
      architecturePatternAr: preview.architecturePatternAr,
      inputsAr: preview.inputsAr,
      outputsAr: preview.outputsAr,
      interfaces: [
        '/api/sheikha/commerce/v1/status',
        `/api/sheikha/technical-experience/v1/products/${product.id}/preview`,
        '/api/sheikha/commerce/v1/operations/plan'
      ]
    },
    propertiesAr: [
      'عربي وRTL في واجهات العرض',
      'عقد مدخلات ومخرجات قابل للفحص',
      'أقل صلاحية وافتراضي منع',
      'أثر تدقيقي وحدود ادعاء',
      'موافقة بشرية للأثر العالي',
      'تعاف واختبار قبل الترقية'
    ],
    lawsAr: [
      'لا تنفيذ أو دفع أو عقد أو تغيير نظام تلقائي.',
      'لا سعر حي أو اتصال خارجي أو اعتماد دون دليل مستقل.',
      'لا تجمع بيانات أكثر من حاجة المنتج.',
      'لا قرار شرعي أو سياسي شخصي آلي.',
      'لا ترقية دون اختبار واسترجاع.',
      'كل ادعاء أداء يذكر البيئة والحمولة والزمن.'
    ],
    specifications: {
      productId: product.id,
      kind: product.kind,
      availability: product.availability,
      pricingMode: product.pricing.mode,
      commercialModels: product.commercialModels,
      targetSectors: product.targetSectors.map((id) => ({
        id,
        nameAr: sectorNames.get(id) || id
      })),
      sampleMeasurement: preview.sampleMeasurement,
      evidence: product.evidence
    },
    conditionsAr: [
      'هوية وصلاحية ومالك مسؤول.',
      'مصدر بيانات معروف وعقد صالح.',
      'اختبارات مستهدفة وlint وفحص أسرار.',
      'حدود خدمة ومؤشرات نجاح متفق عليها.',
      'خطة حادث وتعاف واسترجاع.',
      'توقيع موافقة بشرية عند الأثر العالي.'
    ],
    instructionsAr: [
      'ابدأ بالمعاينة والشرح المناسب لمستوى خبرتك.',
      'حدد القطاع والحاجة وحالة البيانات.',
      'اطلب خطة عملية محكومة قبل أي تنفيذ.',
      'راجع المدخلات والمخرجات والحدود والقياسات.',
      'اختبر محليًا ثم نفذ إطلاقًا تدريجيًا.',
      'راقب النتيجة واحفظ الدليل وأوقف المسار عند الانحراف.'
    ],
    roadmapAr: productGuideRoadmap(),
    marketAndSectorUseAr: product.targetSectors.map((sectorId) => {
      const sector = commerce.sectors.find((entry) =>
        entry.id === sectorId
      );
      return {
        sectorId,
        sectorNameAr: sector?.nameAr || sectorId,
        benefitAr: sector?.benefitAr || 'يحدد بعد تحليل القطاع.',
        liveConnectionClaimed: false
      };
    }),
    measurements: preview.sharedMeasurements,
    glossary: preview.glossary,
    postPurchaseDelivery: {
      fullOperationalDossierRequiresVerifiedEntitlement: true,
      endpoint:
        `/api/sheikha/technical-experience/v1/products/${product.id}/dossier`,
      publicGuideIncludesCredentials: false,
      customerSecretsIncluded: false
    },
    boundaries: preview.boundaries
  };
}

function buildSectorGuide(sectorId) {
  const commerce = buildUnifiedCommerceRuntime();
  const id = String(sectorId || '').trim().toLowerCase();
  const sector = commerce.sectors.find((entry) => entry.id === id);
  if (!sector) return null;
  const group = commerce.marketGroups.find((entry) =>
    entry.id === sector.groupId
  );
  const products = commerce.catalog.filter((product) =>
    product.targetSectors.includes(id)
  );
  return {
    system: 'SHEIKHA_SECTOR_GUIDE_V2',
    sector,
    marketGroup: group,
    purposeAr: sector.benefitAr,
    products: products.map((product) => ({
      id: product.id,
      nameAr: product.nameAr,
      availability: product.availability
    })),
    lawsAr: [
      'لا اتصال حي بالقطاع دون موصل مختبر وتفويض.',
      'لا سعر أو مخزون أو طرف حقيقي دون مصدر وزمن.',
      'تفصل بيانات الأطراف وتحفظ أقل صلاحية.',
      'أي عقد أو دفع أو التزام يحتاج موافقة بشرية.',
      'تطبق الأنظمة المحلية المختصة قبل التشغيل الفعلي.'
    ],
    specifications: {
      capabilities: sector.capabilities,
      dataClassesAr: ['هوية الطرف', 'وصف المورد أو الخدمة', 'المواصفة', 'الحالة والزمن', 'الدليل'],
      interfaces: [
        `/api/sheikha/gardens-knowledge-dialogue/v2/sectors/${id}/guide`,
        `/api/sheikha/commerce/v1/dashboard?sector=${id}`,
        '/api/sheikha/commerce/v1/operations/plan'
      ],
      liveConnectionClaimed: sector.liveConnectionClaimed
    },
    conditionsAr: [
      'مالك قطاع ومصدر بيانات.',
      'خريطة أطراف وصلاحيات.',
      'تصنيف حساسية البيانات.',
      'مؤشرات مستوى خدمة وتعاف.',
      'مراجعة نظامية ومهنية حسب القطاع.'
    ],
    instructionsAr: [
      'ابدأ بحاجة واحدة قابلة للقياس.',
      'اختر منتجًا مسجلًا ولا تنشئ قدرة مكررة.',
      'اربط بيانات تجريبية أو منزوعة الحساسية أولًا.',
      'اختبر الجودة والفشل والاسترجاع.',
      'وسع الاتصال بعد قبول الدليل فقط.'
    ],
    roadmapAr: [
      'اكتشاف الحاجة',
      'توصيف الأطراف والبيانات',
      'اختيار المنتج والعقد',
      'تجربة معزولة',
      'موافقة قانونية وتشغيلية',
      'إطلاق محدود',
      'قياس وتحسين أو رجوع'
    ],
    indicatorsAr: [
      'تغطية الأدلة',
      'نجاح سير العمل',
      'زمن الاستجابة',
      'جودة البيانات',
      'زمن التعافي',
      'منفعة المستخدم'
    ]
  };
}

function buildMarketGuide(marketId) {
  const commerce = buildUnifiedCommerceRuntime();
  const id = String(marketId || '').trim().toLowerCase();
  const market = commerce.marketGroups.find((entry) => entry.id === id);
  if (!market) return null;
  const sectors = market.sectors.map((sectorId) =>
    commerce.sectors.find((sector) => sector.id === sectorId)
  ).filter(Boolean);
  const products = commerce.catalog.filter((product) =>
    product.targetSectors.some((sectorId) =>
      market.sectors.includes(sectorId)
    )
  );
  return {
    system: 'SHEIKHA_MARKET_GUIDE_V2',
    market,
    descriptionAr: market.benefitAr,
    sectors: sectors.map((sector) => ({
      id: sector.id,
      nameAr: sector.nameAr,
      productCount: sector.productCount
    })),
    products: products.map((product) => ({
      id: product.id,
      nameAr: product.nameAr
    })),
    lawsAr: [
      'الكتالوج ليس بورصة ولا إثبات سعر حي.',
      'يفصل الاكتشاف وطلب العرض عن العقد والدفع والتسليم.',
      'يعلن تضارب المصالح ويمنع التفضيل الخفي.',
      'تثبت هوية الأطراف وحقوقهم ومسار الشكوى.',
      'كل سوق فعلي يخضع للأنظمة والتراخيص المختصة.'
    ],
    specifications: {
      discovery: true,
      requestForQuote: 'PLAN_ONLY_UNTIL_HUMAN_APPROVAL',
      livePricing: false,
      automaticContract: false,
      automaticPayment: false,
      transactionExecution: false
    },
    conditionsAr: [
      'كتالوج موثق ومحدث.',
      'سياسة أهلية المورد والمشتري.',
      'مواصفة منتج أو خدمة.',
      'قواعد مقارنة معلنة.',
      'عقد وتسوية وتسليم خارج التنفيذ التلقائي الحالي.'
    ],
    instructionsAr: [
      'حدد القطاع والمواصفة والكمية والنطاق.',
      'اطلب عروضًا دون اختلاق سعر.',
      'قارن المصدر والجودة والمدة والمخاطر.',
      'اعرض النتيجة على صاحب الصلاحية.',
      'انتقل إلى عقد خارجي موثق بعد الموافقة.'
    ],
    roadmapAr: [
      'كتالوج',
      'أهلية أطراف',
      'طلب عرض',
      'مقارنة',
      'موافقة',
      'عقد',
      'تسليم وتقييم'
    ]
  };
}

function buildKnowledgeCatalog() {
  const commerce = buildUnifiedCommerceRuntime();
  const gardens = buildGardensCatalog();
  const frameworks = listThoughtFrameworks();
  return {
    system: 'SHEIKHA_COMPLETE_KNOWLEDGE_GUIDE_CATALOG_V2',
    status: 'ACTIVE_WITH_GENERATED_GUIDES',
    coverage: {
      gardens: gardens.coverage.gardens,
      trees: gardens.coverage.trees,
      products: commerce.catalog.length,
      sectors: commerce.sectors.length,
      markets: commerce.marketGroups.length,
      workflows: commerce.workflows.length,
      thoughtFrameworks: frameworks.coverage.total,
      contemporaryThoughtFrameworks: frameworks.coverage.contemporary,
      historicalThoughtFrameworks: frameworks.coverage.historical,
      religiousMethodReferences:
        listReligiousMethodReferences().references.length
    },
    resources: {
      gardens: gardens.gardens.map((garden) => ({
        id: garden.id,
        nameAr: garden.nameAr,
        descriptionAr: garden.descriptionAr,
        treeCount: garden.trees.length
      })),
      products: commerce.catalog.map((product) => ({
        id: product.id,
        nameAr: product.nameAr,
        summaryAr: product.summaryAr,
        kind: product.kind,
        availability: product.availability
      })),
      sectors: commerce.sectors.map((sector) => ({
        id: sector.id,
        nameAr: sector.nameAr,
        benefitAr: sector.benefitAr,
        groupId: sector.groupId
      })),
      markets: commerce.marketGroups.map((market) => ({
        id: market.id,
        nameAr: market.nameAr,
        benefitAr: market.benefitAr,
        sectorCount: market.sectors.length
      })),
      thoughtFrameworks: frameworks.frameworks.map((framework) => ({
        id: framework.id,
        nameAr: framework.nameAr,
        nameEn: framework.nameEn,
        family: framework.family,
        era: framework.era,
        descriptionAr: framework.descriptionAr
      }))
    },
    routes: {
      gardens: '/api/sheikha/gardens-knowledge-dialogue/v2/gardens',
      products: '/api/sheikha/gardens-knowledge-dialogue/v2/products',
      sectors: '/api/sheikha/gardens-knowledge-dialogue/v2/sectors',
      markets: '/api/sheikha/gardens-knowledge-dialogue/v2/markets',
      thoughtFrameworks:
        '/api/sheikha/gardens-knowledge-dialogue/v2/thought-frameworks',
      dialoguePlan:
        '/api/sheikha/gardens-knowledge-dialogue/v2/dialogue/plan',
      ideaAssessment:
        '/api/sheikha/gardens-knowledge-dialogue/v2/ideas/assess',
      purposefulIdeaDraft:
        '/api/sheikha/gardens-knowledge-dialogue/v2/ideas/synthesize',
      communityProgram:
        '/api/sheikha/gardens-knowledge-dialogue/v2/community/program',
      religiousMethodReferences:
        '/api/sheikha/gardens-knowledge-dialogue/v2/religious-method/references'
    },
    claimBoundary:
      'Guides are generated from registered local products and sectors. External operation and exhaustive world-thought coverage are not claimed.'
  };
}

function listThoughtFrameworks() {
  const contemporary = readJson(FILES.thoughtFrameworks);
  const historical = readJson(FILES.historicalThoughtFrameworks);
  const frameworks = [
    ...contemporary.frameworks.map((framework) => ({
      ...framework,
      era: 'CONTEMPORARY'
    })),
    ...historical.frameworks.map((framework) => ({
      ...framework,
      era: 'HISTORICAL'
    }))
  ];
  return {
    schemaVersion: '2.0.0',
    system: 'SHEIKHA_UNIFIED_THOUGHT_FRAMEWORK_REGISTRY_V2',
    status: 'ACTIVE_CURATED_EDUCATIONAL_REGISTRY',
    coverageBoundary:
      'Curated and extensible, not exhaustive, not a ranking of truth, and never a registry of people.',
    classificationTarget:
      'IDEAS_AND_EXPLICITLY_SELECTED_LENSES_ONLY',
    coverage: {
      contemporary: contemporary.frameworks.length,
      historical: historical.frameworks.length,
      total: frameworks.length
    },
    frameworks
  };
}

function getThoughtFramework(frameworkId) {
  const id = String(frameworkId || '').trim().toUpperCase();
  return listThoughtFrameworks().frameworks.find((framework) =>
    framework.id === id
  ) || null;
}

function matchThoughtFrameworks(message) {
  const source = String(message || '').toLowerCase();
  if (!source) return [];
  return listThoughtFrameworks().frameworks
    .map((framework) => {
      const matches = framework.keywordsAr.filter((keyword) =>
        source.includes(keyword.toLowerCase())
      );
      return {
        id: framework.id,
        nameAr: framework.nameAr,
        matchedKeywordsAr: matches,
        matchCount: matches.length,
        classificationBoundary:
          'TOPIC_CANDIDATE_NOT_A_CLASSIFICATION_OF_THE_USER'
      };
    })
    .filter((entry) => entry.matchCount > 0)
    .sort((left, right) => right.matchCount - left.matchCount)
    .slice(0, 5);
}

function validateSelectedFrameworks(frameworkIds) {
  const ids = unique((Array.isArray(frameworkIds) ? frameworkIds : [])
    .map((id) => String(id || '').trim().toUpperCase())
    .filter(Boolean));
  return ids.map((id) => {
    const framework = getThoughtFramework(id);
    if (!framework) {
      const error = new Error(`Unknown thought framework: ${id}`);
      error.code = 'UNKNOWN_THOUGHT_FRAMEWORK';
      throw error;
    }
    return framework;
  });
}

function unsafeMethodReasons(input = {}) {
  const message = String(
    input.message || input.prompt || input.text || ''
  );
  const sensitiveClassificationRequested =
    input.classifyPerson === true ||
    input.inferBeliefs === true ||
    input.inferReligiousSchool === true ||
    input.inferPoliticalIdeology === true ||
    /(?:صنّف|صنف|استنتج|حدّد|حدد).{0,80}(?:دين|عقيدة|معتقد|مذهب|توجه سياسي|انتماء(?:ه|ها)? السياسي|أيديولوج(?:ية|يا)|ايدولوج(?:ية|يا))\s*(?:(?:هذا|هذه|ذلك|تلك)\s+)?(?:الشخص|المستخدم|صاحب)/i
      .test(message) ||
    /(?:صنّف|صنف|استنتج|حدّد|حدد).{0,80}(?:هذا|هذه|ذلك|تلك)\s+(?:الشخص|المستخدم).{0,50}(?:دين|عقيدة|معتقد|مذهب|توجه|انتماء|أيديولوج|ايدولوج)/i
      .test(message);
  const targetedPersuasionRequested =
    input.targetPersonPersuasion === true ||
    input.politicalMicrotargeting === true ||
    input.religiousMicrotargeting === true ||
    /(?:استهدف|أقنع|اقنع|غيّر|غير).{0,50}(?:هذا الشخص|هذه الفئة|هؤلاء).{0,40}(?:سياسي|ديني|معتقد|انتخاب|تصويت)/i
      .test(message);
  const peopleSuppressionRequested =
    input.suppressPeople === true ||
    input.eradicateGroup === true ||
    input.collectivePunishment === true ||
    /(?:اقمع|استأصل|أقص|عاقب).{0,40}(?:الناس|الجماعة|الفئة|المخالفين|هؤلاء)/i
      .test(message);
  const coerciveIdeaSuppressionRequested =
    input.coercivelyEliminateIdea === true ||
    input.forceConversion === true ||
    input.punishDissent === true ||
    /(?:أجبر|اجبر|إكراه|بالقوة).{0,50}(?:اعتناق|ترك|تغيير|قبول|الفكرة|المعتقد)/i
      .test(message);
  const violenceRequested =
    input.authorizeViolence === true ||
    input.initiateViolence === true ||
    /(?:ابدأ|نفذ|نفّذ|اسمح|صرح).{0,30}(?:عنف|هجوم|اعتداء).{0,40}(?:الفئة|الجماعة|المخالفين|الناس)/i
      .test(message);
  return [
    sensitiveClassificationRequested
      ? 'SENSITIVE_PERSON_CLASSIFICATION_FORBIDDEN'
      : null,
    targetedPersuasionRequested
      ? 'TARGETED_POLITICAL_OR_RELIGIOUS_PERSUASION_FORBIDDEN'
      : null,
    peopleSuppressionRequested
      ? 'SUPPRESSION_OR_ERADICATION_OF_PEOPLE_FORBIDDEN'
      : null,
    coerciveIdeaSuppressionRequested
      ? 'COERCIVE_IDEA_SUPPRESSION_FORBIDDEN'
      : null,
    violenceRequested
      ? 'VIOLENCE_AUTHORIZATION_FORBIDDEN'
      : null
  ].filter(Boolean);
}

function buildSafeRedirection(system, reasons) {
  return {
    system,
    status: 'SAFE_REDIRECTION_REQUIRED',
    decision: 'DENY_REQUESTED_METHOD',
    reasons,
    safeAlternativeAr:
      'ناقش الفكرة والدعوى والدليل، وقدّم تصحيحًا سلميًا عامًا وخيارًا طوعيًا قابلًا للمراجعة دون ملف شخصي أو إكراه أو عقوبة جماعية.',
    personProfileCreated: false,
    contentPersisted: false,
    executionAuthorized: false
  };
}

function buildDialoguePlan(input = {}) {
  const contract = readJson(FILES.contract);
  const message = String(input.message || '').trim().slice(0, 4000);
  const selectedFrameworks = validateSelectedFrameworks(input.frameworkIds);
  const unsafeReasons = unsafeMethodReasons(input);
  if (unsafeReasons.length > 0) {
    return buildSafeRedirection(
      'SHEIKHA_CONSTRUCTIVE_DIALOGUE_PLAN_V2',
      unsafeReasons
    );
  }

  const candidates = matchThoughtFrameworks(message);
  const frameworks = selectedFrameworks.length
    ? selectedFrameworks
    : candidates.map((candidate) => getThoughtFramework(candidate.id));
  const goals = unique(frameworks.flatMap((framework) =>
    framework.statedGoalsAr
  )).slice(0, 8);
  const commonGround = unique(frameworks.flatMap((framework) =>
    framework.potentialBenefitsAr
  )).slice(0, 8);
  const risks = unique(frameworks.flatMap((framework) =>
    framework.risksAndCritiquesAr
  )).slice(0, 10);
  const questions = unique(frameworks.flatMap((framework) =>
    framework.dialogueQuestionsAr
  )).slice(0, 12);

  return {
    system: 'SHEIKHA_CONSTRUCTIVE_DIALOGUE_PLAN_V2',
    status: 'CONSTRUCTIVE_IDEA_LEVEL_PLAN_READY',
    generatedAt: new Date().toISOString(),
    subject: {
      messageIncludedInResponse: false,
      messageLength: message.length,
      userSelectedFrameworks: selectedFrameworks.map((framework) =>
        framework.id
      ),
      topicCandidates: candidates,
      personIdeologyInferred: false,
      religiousSchoolInferred: false,
      sensitiveTraitsInferred: false
    },
    scope: {
      analysisTarget: 'IDEAS_CLAIMS_GOALS_MEANS_AND_EVIDENCE',
      personClassification: false,
      coercivePersuasion: false,
      politicalMicrotargeting: false,
      religiousMicrotargeting: false
    },
    frameworkSummaries: frameworks.map((framework) => ({
      id: framework.id,
      nameAr: framework.nameAr,
      descriptionAr: framework.descriptionAr,
      statedGoalsAr: framework.statedGoalsAr,
      potentialBenefitsAr: framework.potentialBenefitsAr,
      risksAndCritiquesAr: framework.risksAndCritiquesAr
    })),
    dialoguePhases: contract.dialogueProtocol.map((phase, index) => ({
      order: index + 1,
      phase,
      mandatory: true
    })),
    constructiveMaterial: {
      statedGoalsAr: goals,
      possibleCommonGroundAr: commonGround,
      risksAndCritiquesAr: risks,
      questionsAr: questions.length
        ? questions
        : [
          'ما الفكرة أو الدعوى المحددة التي تريد فحصها؟',
          'ما هدفها المعلن وما وسيلتها؟',
          'ما الدليل وما الاعتراض الأقوى؟'
        ]
    },
    evidenceChecklistAr: [
      'عرّف المصطلح والتيار والنسخة التاريخية المقصودة.',
      'افصل الهدف المعلن عن الوسيلة والنتيجة الفعلية.',
      'اذكر المصدر وتاريخه وسياقه ومصلحته المحتملة.',
      'اعرض أقوى دليل مؤيد وأقوى اعتراض معقول.',
      'اختبر الأثر على الحقوق والضعفاء والمصلحة العامة.',
      'ميز القياس التجريبي عن الحكم الفلسفي أو الشرعي.',
      'سجل ما بقي مجهولًا وما يحتاج خبيرًا.'
    ],
    religiousMethod: buildReligiousMethod(
      input.religiousLensRequested === true
    ),
    outputInstructionsAr: [
      'ابدأ بتلخيص عادل يستطيع صاحب الفكرة قبوله.',
      'صحح الدعوى المحددة بالدليل دون تحقير الشخص أو الجماعة.',
      'استعمل لغة احتمالية عندما تكون الأدلة غير حاسمة.',
      'اقترح خيارًا نافعًا قابلًا للاختبار لا إكراهًا.',
      'اختم بنقاط اتفاق واختلاف وأسئلة مفتوحة وخطوة آمنة.'
    ],
    privacy: {
      contentPersisted: false,
      sensitiveProfileCreated: false,
      userBeliefStored: false
    },
    claimBoundary:
      'This plan organizes dialogue. It does not determine a person’s ideology, religious school, faith, moral worth, or political eligibility.'
  };
}

function normalizeEvidenceItems(items) {
  const dimensions = new Set(IDEA_INTEGRITY_DIMENSIONS.map((item) =>
    item.id
  ));
  return (Array.isArray(items) ? items : [])
    .slice(0, 40)
    .map((item) => ({
      dimensionId: String(item?.dimensionId || '').trim().toUpperCase(),
      sourceProvided: Boolean(String(item?.source || '').trim()),
      methodProvided: Boolean(String(item?.method || '').trim()),
      counterEvidence: item?.counterEvidence === true
    }))
    .filter((item) => dimensions.has(item.dimensionId));
}

function buildIdeaIntegrityAssessment(input = {}) {
  const message = String(input.message || '').trim().slice(0, 4000);
  const selectedFrameworks = validateSelectedFrameworks(input.frameworkIds);
  const unsafeReasons = unsafeMethodReasons(input);
  if (unsafeReasons.length > 0) {
    return buildSafeRedirection(
      'SHEIKHA_IDEA_INTEGRITY_ASSESSMENT_V2',
      unsafeReasons
    );
  }
  const evidenceItems = normalizeEvidenceItems(input.evidenceItems);
  const dimensions = IDEA_INTEGRITY_DIMENSIONS.map((dimension) => {
    const evidence = evidenceItems.filter((item) =>
      item.dimensionId === dimension.id
    );
    const sourceAndMethodProvided = evidence.some((item) =>
      item.sourceProvided && item.methodProvided
    );
    return {
      ...dimension,
      status: sourceAndMethodProvided
        ? 'SUBMITTED_FOR_HUMAN_REVIEW'
        : 'EVIDENCE_REQUIRED',
      submittedEvidenceCount: evidence.length,
      counterEvidenceSubmitted: evidence.some((item) =>
        item.counterEvidence
      )
    };
  });
  const everyDimensionSubmitted = dimensions.every((dimension) =>
    dimension.status === 'SUBMITTED_FOR_HUMAN_REVIEW'
  );
  const counterEvidenceSubmitted = dimensions.some((dimension) =>
    dimension.counterEvidenceSubmitted
  );
  return {
    system: 'SHEIKHA_IDEA_INTEGRITY_ASSESSMENT_V2',
    status: everyDimensionSubmitted && counterEvidenceSubmitted
      ? 'READY_FOR_QUALIFIED_HUMAN_REVIEW'
      : 'EVIDENCE_REQUIRED',
    generatedAt: new Date().toISOString(),
    subject: {
      messageIncludedInResponse: false,
      messageLength: message.length,
      selectedFrameworkIds: selectedFrameworks.map((framework) =>
        framework.id
      ),
      personClassified: false,
      religiousSchoolInferred: false
    },
    dimensions,
    evidenceSummary: {
      submittedItems: evidenceItems.length,
      dimensionsCovered: dimensions.filter((dimension) =>
        dimension.submittedEvidenceCount > 0
      ).length,
      counterEvidenceSubmitted
    },
    conclusions: {
      ideaDeclaredCorrect: false,
      truthClaimVerified: false,
      religiousComplianceDeclared: false,
      humanReviewRequired: true,
      reasonAr:
        'المنظومة تنظم التثبت ولا تستبدل البحث أو الخبرة أو الحكم البشري المؤهل.'
    },
    religiousMethod: buildReligiousMethod(
      input.religiousLensRequested === true
    ),
    privacy: {
      contentPersisted: false,
      sensitiveProfileCreated: false,
      individualIdeologyScoreCreated: false
    }
  };
}

function resolveCommunityScope(value) {
  const scope = String(value || 'local-community').trim().toLowerCase();
  const allowed = new Set([
    'local-community',
    'neighborhood',
    'institution',
    'city',
    'digital-community'
  ]);
  if (!allowed.has(scope)) {
    const error = new Error(`Unsupported community scope: ${scope}`);
    error.code = 'INVALID_COMMUNITY_SCOPE';
    throw error;
  }
  return scope;
}

function normalizePurposefulOutcomes(values) {
  return unique((Array.isArray(values) ? values : [])
    .map((value) => String(value || '').trim().slice(0, 220))
    .filter(Boolean))
    .slice(0, 8);
}

function buildPurposefulIdeaDraft(input = {}) {
  const contract = readJson(FILES.contract);
  const challenge = String(input.message || '').trim().slice(0, 4000);
  if (!challenge) {
    const error = new Error('A defined challenge is required.');
    error.code = 'IDEA_CHALLENGE_REQUIRED';
    throw error;
  }
  const unsafeReasons = unsafeMethodReasons(input);
  if (unsafeReasons.length > 0) {
    return buildSafeRedirection(
      'SHEIKHA_PURPOSEFUL_IDEA_DRAFT_V2',
      unsafeReasons
    );
  }
  const selected = validateSelectedFrameworks(input.frameworkIds);
  const candidates = matchThoughtFrameworks(challenge);
  const frameworks = selected.length > 0
    ? selected
    : candidates.map((candidate) => getThoughtFramework(candidate.id));
  const communityScope = resolveCommunityScope(input.communityScope);
  const ideaName = String(
    input.ideaName || 'إطار شيخة للمنفعة المتوازنة'
  ).trim().slice(0, 120);
  const explicitOutcomes = normalizePurposefulOutcomes(
    input.desiredOutcomes
  );
  const frameworkGoals = unique(frameworks.flatMap((framework) =>
    framework.statedGoalsAr
  ));
  const goals = unique([
    ...explicitOutcomes,
    ...frameworkGoals,
    'حفظ الحقوق والكرامة',
    'تقليل الضرر مع قابلية الرجوع والتعافي'
  ]).slice(0, 10);
  const benefits = unique(frameworks.flatMap((framework) =>
    framework.potentialBenefitsAr
  )).slice(0, 10);
  const tensions = unique(frameworks.flatMap((framework) =>
    framework.risksAndCritiquesAr
  )).slice(0, 12);
  const religiousLensEnabled = input.religiousLensRequested === true;
  const integrity = buildIdeaIntegrityAssessment({
    ...input,
    message: challenge,
    frameworkIds: frameworks.map((framework) => framework.id)
  });

  return {
    system: 'SHEIKHA_PURPOSEFUL_IDEA_DRAFT_V2',
    status: 'GOVERNED_PURPOSEFUL_IDEA_DRAFT_READY',
    generatedAt: new Date().toISOString(),
    idea: {
      nameAr: ideaName,
      artifactType: 'VOLUNTARY_PURPOSEFUL_IDEA_DRAFT',
      communityScope,
      generatedIdea: true,
      generatedIdeologyDraft: true,
      canonicalTruthOrIdeology: false,
      bindingReligiousDoctrine: false,
      visionAr: religiousLensEnabled
        ? 'منفعة عامة تعين على عبادة الله وعمارة الأرض بالعلم والعدل والأمانة والرحمة، دون إكراه أو ضرر.'
        : 'منفعة عامة قابلة للقياس تحفظ الكرامة والحقوق والموارد وتتعلم من الدليل.',
      missionAr:
        'تحويل التحدي المحدد إلى مبادئ وبرامج وتجارب صغيرة قابلة للنقد والقياس والتوقف والتعافي.',
      challengeAr: challenge,
      adoption: 'VOLUNTARY_REVIEWABLE_AND_REVERSIBLE'
    },
    sourceLenses: frameworks.map((framework) => ({
      id: framework.id,
      nameAr: framework.nameAr,
      era: framework.era,
      adoptedGoalsAr: framework.statedGoalsAr,
      potentialBenefitsAr: framework.potentialBenefitsAr,
      retainedCritiquesAr: framework.risksAndCritiquesAr
    })),
    synthesis: {
      protocol: contract.ideaGenerationProtocol,
      desiredOutcomesAr: goals,
      potentialBenefitsAr: benefits,
      unresolvedTensionsAr: tensions,
      incompatibleClaimsDeclaredResolved: false,
      evidenceRequiredBeforeAdoption: true
    },
    principles: PURPOSEFUL_IDEA_PRINCIPLES,
    theoryOfChange: [
      {
        phase: 'DEFINE',
        statementAr: 'تعريف المشكلة وخط الأساس والمتأثرين دون تصنيف حساس.',
        exitGateAr: 'مشكلة قابلة للتحقق ونطاق ومالك بشري.'
      },
      {
        phase: 'COMPARE',
        statementAr: 'عرض البدائل والدليل المضاد وأثر كل خيار على الحقوق.',
        exitGateAr: 'بديلان على الأقل ومراجعة ضرر وتوزيع.'
      },
      {
        phase: 'PILOT',
        statementAr: 'تجربة صغيرة طوعية محددة المدة وقابلة للإيقاف.',
        exitGateAr: 'موافقة وأثر ومؤشرات وخطة رجوع.'
      },
      {
        phase: 'EVALUATE',
        statementAr: 'قياس النتيجة والانحراف والآثار غير المقصودة.',
        exitGateAr: 'بيانات قابلة للتدقيق وتظلمات مغلقة أو معلنة.'
      },
      {
        phase: 'REVISE_OR_RETIRE',
        statementAr: 'تحسين المسودة أو إيقافها وجبر الضرر عند فشلها.',
        exitGateAr: 'قرار بشري مسبب وسجل تعاف ودروس منشورة محليًا.'
      }
    ],
    programs: COMMUNITY_PROGRAM_TEMPLATES.map((program) => ({
      id: program.id,
      nameAr: program.nameAr,
      purposeAr: program.purposeAr,
      proposedActivitiesAr: program.activitiesAr,
      candidateIndicatorsAr: program.indicatorsAr,
      baseline: null,
      target: null,
      mode: 'DRAFT_NOT_AUTHORIZED',
      humanOwnerRequired: true
    })),
    validation: {
      integrity,
      status: 'EVIDENCE_AND_COUNTEREVIDENCE_REQUIRED',
      independentRightsReviewRequired: true,
      qualifiedDomainReviewRequired: true,
      qualifiedScholarReviewRequired: religiousLensEnabled
    },
    reviewAndRecovery: {
      reviewPeriodDays: null,
      reviewPeriodStatus: 'HUMAN_DECISION_REQUIRED',
      sunsetRequired: true,
      rollbackRequired: true,
      grievanceAndAppealRequired: true,
      harmRepairOwnerRequired: true,
      automaticExpansion: false
    },
    religiousMethod: buildReligiousMethod(religiousLensEnabled),
    governance: {
      defaultAuthorization: 'DENY',
      peacefulLawfulVoluntaryUseOnly: true,
      personClassification: false,
      personOrGroupScoring: false,
      targetedPersuasion: false,
      coerciveAdoption: false,
      groupSuppression: false,
      politicalCampaignAuthorization: false,
      automatedReligiousAuthority: false,
      humanApprovalForHighImpact: true
    },
    execution: {
      authorized: false,
      performed: false,
      publishedExternally: false,
      politicalCampaignCreated: false,
      religiousRulingIssued: false
    },
    privacy: {
      challengeReturnedToRequester: true,
      contentPersisted: false,
      sensitiveProfileCreated: false,
      userBeliefStored: false
    },
    claimBoundary:
      'This is a voluntary purposeful idea draft. It is not canonical truth, binding ideology, religious doctrine, political campaign, or authority over people.'
  };
}

function buildCommunityFlourishingProgram(input = {}) {
  const contract = readJson(FILES.contract);
  const message = String(input.message || '').trim().slice(0, 4000);
  const selected = validateSelectedFrameworks(input.frameworkIds);
  const unsafeReasons = unsafeMethodReasons(input);
  if (unsafeReasons.length > 0) {
    return buildSafeRedirection(
      'SHEIKHA_COMMUNITY_FLOURISHING_PROGRAM_V2',
      unsafeReasons
    );
  }
  const candidates = matchThoughtFrameworks(message);
  const frameworks = selected.length > 0
    ? selected
    : candidates.map((candidate) => getThoughtFramework(candidate.id));
  const communityScope = resolveCommunityScope(input.communityScope);
  const programName = String(
    input.programName || 'برنامج شيخة للمنفعة العامة'
  ).trim().slice(0, 120);
  const goals = unique(frameworks.flatMap((framework) =>
    framework.statedGoalsAr
  )).slice(0, 10);
  const benefits = unique(frameworks.flatMap((framework) =>
    framework.potentialBenefitsAr
  )).slice(0, 10);
  const risks = unique(frameworks.flatMap((framework) =>
    framework.risksAndCritiquesAr
  )).slice(0, 12);
  const fallbackGoals = [
    'رفع جودة المعرفة والقرار',
    'توسيع المنفعة والعمل المنتج',
    'حفظ الحقوق والكرامة',
    'تقليل الضرر والهدر',
    'تقوية القدرة على التعافي'
  ];
  const objectiveGoals = goals.length > 0 ? goals : fallbackGoals;
  const religiousLensEnabled = input.religiousLensRequested === true;
  const assessment = buildIdeaIntegrityAssessment({
    ...input,
    message,
    frameworkIds: frameworks.map((framework) => framework.id)
  });

  return {
    system: 'SHEIKHA_COMMUNITY_FLOURISHING_PROGRAM_V2',
    status: 'GOVERNED_PEACEFUL_PROGRAM_DRAFT_READY',
    generatedAt: new Date().toISOString(),
    program: {
      nameAr: programName,
      communityScope,
      generatedIdeology: false,
      generatedPublicBenefitProgram: true,
      visionAr: religiousLensEnabled
        ? 'مجتمع يعبد الله ويعمر الأرض بالعلم والعدل والأمانة والرحمة والمنفعة دون إكراه أو ضرر.'
        : 'مجتمع مزدهر يتعلم ويعمل بعدل ويحفظ الكرامة والموارد ويعالج الخلل سلميًا.',
      missionAr:
        'تحويل الأهداف المختارة صراحة إلى برامج محدودة قابلة للقياس والمراجعة والتوقف والتعافي.',
      participation: 'VOLUNTARY_AND_RIGHTS_PRESERVING'
    },
    sourceFrameworks: frameworks.map((framework) => ({
      id: framework.id,
      nameAr: framework.nameAr,
      era: framework.era,
      goalsAr: framework.statedGoalsAr,
      benefitsAr: framework.potentialBenefitsAr,
      risksAr: framework.risksAndCritiquesAr
    })),
    synthesis: {
      protocol: contract.synthesisProtocol,
      sharedGoalsAr: objectiveGoals,
      potentialBenefitsAr: benefits,
      knownRisksAr: risks,
      incompatibilitiesResolvedAutomatically: false,
      qualifiedHumanDeliberationRequired: true
    },
    objectives: objectiveGoals.map((goal, index) => ({
      id: `OBJ-${String(index + 1).padStart(2, '0')}`,
      statementAr: goal,
      baseline: null,
      target: null,
      baselineAndTargetStatus: 'REQUIRES_LOCAL_MEASUREMENT_AND_HUMAN_APPROVAL',
      ownerStatus: 'HUMAN_OWNER_REQUIRED'
    })),
    programs: COMMUNITY_PROGRAM_TEMPLATES.map((program) => ({
      ...program,
      mode: 'PLAN_ONLY',
      baseline: null,
      targets: null,
      executionAuthorized: false,
      humanOwnerRequired: true,
      impactAssessmentRequired: true
    })),
    communityHealth: {
      mode: 'AGGREGATE_VOLUNTARY_INDICATORS_ONLY',
      dimensionsAr: [
        'الثقة والعدل',
        'المعرفة والتعليم',
        'المعاش والعمل',
        'السلامة والحقوق',
        'البيئة والموارد',
        'القدرة على التعافي'
      ],
      individualFaithScore: false,
      individualIdeologyScore: false,
      mentalHealthDiagnosis: false,
      coerciveTreatment: false
    },
    recoveryCycleAr: [
      'رصد الانحراف بدليل لا بإشاعة.',
      'إيقاف النشاط عالي الأثر مؤقتًا عند خطر موثق.',
      'مراجعة مستقلة للأثر والحقوق والمصدر.',
      'تصحيح الدعوى أو الوسيلة وإعلان ما تغير.',
      'جبر الضرر عبر صاحب الصلاحية والمسار النظامي المشروع.',
      'استعادة الخدمة أو البرنامج تدريجيًا.',
      'قياس النتيجة وإعادة الدرس إلى العقد والسجل.'
    ],
    ideaIntegrity: assessment,
    religiousMethod: buildReligiousMethod(religiousLensEnabled),
    governance: {
      defaultAuthorization: 'DENY',
      peacefulLawfulMeansOnly: true,
      coercivePersuasion: false,
      personClassification: false,
      politicalOrReligiousMicrotargeting: false,
      groupSuppression: false,
      automatedReligiousEnforcement: false,
      humanApprovalForHighImpact: true,
      grievanceAndAppealRequired: true
    },
    execution: {
      authorized: false,
      performed: false,
      externalPublishing: false,
      politicalCampaignCreated: false,
      religiousRulingIssued: false
    },
    privacy: {
      messageIncludedInResponse: false,
      contentPersisted: false,
      sensitiveProfileCreated: false
    },
    claimBoundary:
      'This is a governed program draft, not a canonical ideology, religious ruling, medical treatment, political campaign, or authorization to govern people.'
  };
}

function buildStatus() {
  const contract = readJson(FILES.contract);
  const catalog = buildKnowledgeCatalog();
  const gardensV3 = readJson(FILES.gardensV3);
  return {
    schemaVersion: '2.0.0',
    system: 'SHEIKHA_GARDENS_KNOWLEDGE_DIALOGUE_RUNTIME_V2',
    generatedAt: new Date().toISOString(),
    status: 'ACTIVE_WITH_BOUNDED_GARDENS_GUIDES_AND_DIALOGUE',
    coverage: catalog.coverage,
    foundations: {
      gardensV1: 'ACTIVE_WORLDLY_METAPHOR',
      gardensV3: gardensV3.status,
      commerceV1: 'ACTIVE_GOVERNED_CATALOG',
      technicalExperienceV1: 'ACTIVE_MEASURED_FOUNDATIONS'
    },
    governance: contract.governance,
    jurisprudentialDialogueBoundary:
      contract.jurisprudentialDialogueBoundary,
    communityHealthBoundary: contract.communityHealthBoundary,
    ideaGenerationBoundary: contract.ideaGenerationBoundary,
    horticultureBoundary: contract.horticultureBoundary,
    dataPolicy: contract.dataPolicy,
    routes: catalog.routes,
    checks: {
      everyGardenEnriched: catalog.coverage.gardens === 9,
      everyTreeEnriched: catalog.coverage.trees === 27,
      allProductsGuided: catalog.coverage.products === 13,
      allSectorsGuided: catalog.coverage.sectors === 30,
      allMarketsGuided: catalog.coverage.markets === 7,
      contemporaryFrameworksRegistered:
        catalog.coverage.contemporaryThoughtFrameworks === 19,
      historicalFrameworksRegistered:
        catalog.coverage.historicalThoughtFrameworks === 18,
      ideaIntegrityAssessmentActive:
        contract.scope.ideaIntegrityAssessment === true,
      purposefulIdeaDraftGenerationActive:
        contract.scope.purposefulIdeaDraftGeneration === true,
      communityProgramGenerationActive:
        contract.scope.communityFlourishingPrograms === true,
      personClassificationDisabled:
        contract.governance.personIdeologyClassification === false,
      religiousSchoolInferenceDisabled:
        contract.governance.religiousSchoolInference === false,
      beliefCompulsionDisabled:
        contract.governance.beliefCompelledBySoftware === false,
      automatedFatwaDisabled:
        contract.governance.automatedFatwa === false,
      coerciveIdeaSuppressionDisabled:
        contract.governance.coerciveIdeaEradication === false
    },
    claimBoundary: contract.claimBoundary
  };
}

module.exports = {
  FILES,
  PHYSICAL_GARDEN_BOUNDARY,
  SHARED_GARDEN_LAWS,
  PLANT_ARCHETYPES,
  TREE_PLANT_MAP,
  IDEA_INTEGRITY_DIMENSIONS,
  COMMUNITY_PROGRAM_TEMPLATES,
  PURPOSEFUL_IDEA_PRINCIPLES,
  buildGardensCatalog,
  getGarden,
  buildProductGuide,
  buildSectorGuide,
  buildMarketGuide,
  buildKnowledgeCatalog,
  listThoughtFrameworks,
  listReligiousMethodReferences,
  getThoughtFramework,
  matchThoughtFrameworks,
  buildDialoguePlan,
  buildIdeaIntegrityAssessment,
  buildPurposefulIdeaDraft,
  buildCommunityFlourishingProgram,
  buildStatus
};
