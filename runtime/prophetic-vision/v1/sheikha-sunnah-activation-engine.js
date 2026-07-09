'use strict';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SHEIKHA — محرك السنة النبوية والخلفاء الراشدين
 * Prophetic Sunnah Activation & Measurement Engine
 *
 * بسم الله الرحمن الرحيم
 * "لَقَدْ كَانَ لَكُمْ فِي رَسُولِ اللَّهِ أُسْوَةٌ حَسَنَةٌ"
 * سورة الأحزاب: 21
 *
 * Foundation : QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS
 * Tier       : OMEGA_SUPREME_INFINITE
 * ═══════════════════════════════════════════════════════════════════════════
 */

const QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS = 'QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS';

class SheikhaSunnahActivationEngine {
  constructor() {
    this.system = 'SHEIKHA_SUNNAH_ACTIVATION_ENGINE';
    this.tier = 'OMEGA_SUPREME_INFINITE';
    this.foundation = QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS;
    this.status = 'SUNNAH_ENGINE_ACTIVE';

    this.individual_sunnah = new Map();   // السنن الفردية
    this.social_sunnah = new Map();       // السنن الاجتماعية
    this.governance_sunnah = new Map();   // سنن الحوكمة
    this.economic_sunnah = new Map();     // السنن الاقتصادية
    this.spiritual_sunnah = new Map();    // السنن الروحية
    this.caliph_implementations = new Map(); // تطبيقات الخلفاء
    this.activation_engines = new Map();  // محركات التفعيل
    this.measurement_models = new Map();  // نماذج القياس

    this._initialize();
  }

  _initialize() {
    this._registerIndividualSunnah();
    this._registerSocialSunnah();
    this._registerGovernanceSunnah();
    this._registerEconomicSunnah();
    this._registerSpiritualSunnah();
    this._registerCaliphImplementations();
    this._registerActivationEngines();
    this._registerMeasurementModels();
  }

  // ══════════════════════════════════════════════════════════════
  // السنن الفردية
  // ══════════════════════════════════════════════════════════════
  _registerIndividualSunnah() {
    const sunnah = [
      {
        id: 'TAHAJJUD',
        name: 'قيام الليل — التهجد',
        frequency: 'يومي',
        time: 'الثلث الأخير من الليل',
        reference: 'الإسراء 17:79 + صحيح البخاري',
        impact: 'تعميق العلاقة بالله وصفاء القلب وحدة الذكاء',
        activation_steps: ['التبكير في النوم', 'الاستيقاظ قبل الفجر', 'الوضوء والصلاة', 'الدعاء والاستغفار'],
        modern_application: 'برمجة الفجر — إنتاجية الصباح الباكر'
      },
      {
        id: 'SIWAK',
        name: 'السواك',
        frequency: 'يومي متعدد',
        reference: 'صحيح البخاري — لولا أن أشق على أمتي لأمرتهم بالسواك',
        impact: 'صحة الفم والأسنان والتطهر',
        modern_application: 'النظافة الشخصية وصحة الجسم'
      },
      {
        id: 'MORNING_ADHKAR',
        name: 'أذكار الصباح والمساء',
        frequency: 'يومي صباح ومساء',
        reference: 'حصن المسلم — أدعية ثابتة بالسنة',
        impact: 'حماية نفسية وروحية وتثبيت التوكل',
        count: 'أكثر من 30 ذكراً صباحياً ومسائياً',
        modern_application: 'التأمل الإسلامي — mind wellness'
      },
      {
        id: 'VOLUNTARY_FASTING',
        name: 'صيام الاثنين والخميس',
        frequency: 'أسبوعي',
        reference: 'سنن الترمذي — إنه يوم تُعرض فيه الأعمال',
        impact: 'تزكية النفس وضبط النزوات وتقوية الإرادة',
        modern_application: 'الصيام المتقطع لصحة الجسم والعقل'
      },
      {
        id: 'SADAQAH_DAILY',
        name: 'الصدقة اليومية',
        frequency: 'يومي',
        reference: 'صحيح البخاري — على كل مسلم صدقة كل يوم',
        impact: 'الإبداع الاجتماعي وتطهير المال وبركته',
        forms: ['إطعام', 'كلمة طيبة', 'إزالة أذى', 'إرشاد ضال'],
        modern_application: 'خدمة المجتمع اليومية — CSR الفردي'
      },
      {
        id: 'QURAN_RECITATION',
        name: 'تلاوة القرآن يومياً',
        minimum: 'ختم القرآن في شهر على الأقل',
        reference: 'صحيح مسلم — اقرأوا القرآن فإنه يأتي شفيعاً',
        impact: 'تغذية الروح والعقل وحفظ الهوية الإسلامية',
        modern_application: 'برنامج ورد يومي + تدبر المعاني'
      },
      {
        id: 'TAWBAH_DAILY',
        name: 'الاستغفار والتوبة اليومية',
        count: 'أكثر من 100 مرة يومياً',
        reference: 'صحيح البخاري — كان يستغفر أكثر من سبعين مرة',
        impact: 'تصفية القلب من الذنوب والمحافظة على الصلة بالله',
        modern_application: 'محاسبة النفس اليومية — daily review'
      }
    ];

    sunnah.forEach(s => this.individual_sunnah.set(s.id, s));
    console.log(`✅ سجّلت ${this.individual_sunnah.size} سنن فردية`);
  }

  // ══════════════════════════════════════════════════════════════
  // السنن الاجتماعية
  // ══════════════════════════════════════════════════════════════
  _registerSocialSunnah() {
    const social = [
      {
        id: 'SALAM_SPREAD',
        name: 'نشر السلام',
        reference: 'صحيح مسلم — لا تدخلوا الجنة حتى تؤمنوا وحتى تحابوا',
        impact: 'بناء ثقافة السلام والألفة في المجتمع',
        scope: 'INDIVIDUAL_TO_COMMUNITY',
        modern_application: 'ثقافة الاستقبال والترحيب الإسلامية'
      },
      {
        id: 'VISITING_SICK',
        name: 'عيادة المرضى',
        reference: 'صحيح البخاري — حق المسلم على المسلم',
        impact: 'الدعم النفسي والتضامن الاجتماعي',
        scope: 'COMMUNITY',
        modern_application: 'شبكات الدعم المجتمعي'
      },
      {
        id: 'NAFAQAH_FAMILY',
        name: 'النفقة على الأسرة — أفضل صدقة',
        reference: 'صحيح البخاري — دينار تنفقه على أهلك أعظم أجراً',
        impact: 'استقرار الأسرة وتماسك المجتمع',
        scope: 'FAMILY'
      },
      {
        id: 'HELPING_NEIGHBOR',
        name: 'الإحسان إلى الجار',
        reference: 'صحيح البخاري — ما زال جبريل يوصيني بالجار',
        impact: 'بناء حارات ومجتمعات متلاحمة',
        scope: 'NEIGHBORHOOD'
      },
      {
        id: 'RECONCILIATION',
        name: 'الإصلاح بين الناس',
        reference: 'النساء 4:114 + صحيح الترمذي',
        impact: 'حل النزاعات وتحقيق السلم الاجتماعي',
        scope: 'COMMUNITY_TO_NATIONAL'
      },
      {
        id: 'ORPHAN_CARE',
        name: 'كفالة اليتيم',
        reference: 'صحيح البخاري — أنا وكافل اليتيم كهاتين',
        impact: 'رعاية الأطفال المحرومين وتأهيلهم',
        scope: 'SOCIAL_WELFARE'
      }
    ];

    social.forEach(s => this.social_sunnah.set(s.id, s));
    console.log(`✅ سجّلت ${this.social_sunnah.size} سنن اجتماعية`);
  }

  // ══════════════════════════════════════════════════════════════
  // سنن الحوكمة
  // ══════════════════════════════════════════════════════════════
  _registerGovernanceSunnah() {
    const governance = [
      {
        id: 'SHURA_SYSTEM',
        name: 'نظام الشورى',
        reference: 'الشورى 42:38 + آل عمران 3:159',
        principle: 'القرار المشترك بالتشاور لا بالاستبداد',
        application: 'مجالس تشريعية إسلامية — برلمانات شورى',
        modern_equivalent: 'الديمقراطية التشاركية المقيدة بالشريعة',
        caliph_model: 'عمر — كان يستشير الصحابة في كل كبيرة'
      },
      {
        id: 'JUSTICE_SYSTEM',
        name: 'منظومة القضاء الإسلامي',
        reference: 'النساء 4:58 + المائدة 5:8',
        principle: 'العدل بين الناس بلا محاباة',
        application: 'قضاء مستقل يطبق الشريعة بالعدل',
        caliph_model: 'علي — القانون واحد للخليفة وللرعية'
      },
      {
        id: 'BAYT_AL_MAL',
        name: 'بيت المال — الميزانية العامة',
        reference: 'التوبة 9:60',
        principle: 'المال العام أمانة للأمة لا ملكية للحاكم',
        application: 'نظام الزكاة والميزانية العامة',
        caliph_model: 'عمر — أسس بيت المال الأول'
      },
      {
        id: 'APPOINTMENT_COMPETENCE',
        name: 'تعيين الأكفأ الأمين لا الأقرب',
        reference: 'النساء 4:58 — أداء الأمانات إلى أهلها',
        principle: 'الكفاءة والأمانة معيار الاختيار',
        caliph_model: 'أبو بكر وعمر — اختيار القادة بالجدارة'
      },
      {
        id: 'ACCOUNTABILITY_SYSTEM',
        name: 'محاسبة الولاة والمسؤولين',
        reference: 'صحيح مسلم — كلكم راعٍ وكلكم مسؤول',
        principle: 'المسؤول يُحاسب أمام الأمة والله',
        caliph_model: 'عمر — كان يحاسب ولاته بنفسه'
      },
      {
        id: 'PROTECTION_MINORITIES',
        name: 'حماية أهل الذمة وحقوقهم',
        reference: 'وصية عمر عند وفاته',
        principle: 'الإسلام يكفل حقوق غير المسلمين',
        application: 'منظومة حقوق الأقليات الإسلامية',
        caliph_model: 'عمر — وصّى بأهل الذمة خيراً'
      }
    ];

    governance.forEach(g => this.governance_sunnah.set(g.id, g));
    console.log(`✅ سجّلت ${this.governance_sunnah.size} سنن الحوكمة`);
  }

  // ══════════════════════════════════════════════════════════════
  // السنن الاقتصادية
  // ══════════════════════════════════════════════════════════════
  _registerEconomicSunnah() {
    const economic = [
      {
        id: 'ZAKAT_SYSTEM',
        name: 'نظام الزكاة',
        reference: 'البقرة 2:43 + التوبة 9:103',
        rate: '2.5% من الأموال الزكوية',
        beneficiaries: 8,
        categories: ['الفقراء', 'المساكين', 'العاملون عليها', 'المؤلفة قلوبهم', 'الرقاب', 'الغارمون', 'في سبيل الله', 'ابن السبيل'],
        economic_impact: 'إعادة توزيع الثروة وتقليل الفقر',
        modern_gdp_potential: '600 مليار دولار سنوياً لو نُظِّمت'
      },
      {
        id: 'PROHIBITION_RIBA',
        name: 'تحريم الربا',
        reference: 'البقرة 2:275-279',
        principle: 'الاقتصاد القائم على الإنتاج الحقيقي لا الفوائد',
        modern_alternative: 'البنوك الإسلامية — المضاربة والمشاركة',
        impact: 'اقتصاد مستقر بلا فقاعات مالية'
      },
      {
        id: 'WAQF_SYSTEM',
        name: 'نظام الوقف الإسلامي',
        reference: 'صحيح البخاري — صدقة جارية',
        principle: 'الملكية المتجمدة لخدمة المجتمع إلى الأبد',
        historical_impact: 'أوقاف الإسلام موّلت الجامعات والمستشفيات',
        modern_application: 'Endowments — مؤسسات الوقف الحديثة'
      },
      {
        id: 'HONEST_TRADE',
        name: 'التجارة الصادقة',
        reference: 'التاجر الصدوق مع النبيين والصديقين والشهداء',
        principles: ['لا غش', 'لا تدليس', 'لا احتكار', 'الصدق في الوزن والكيل'],
        modern_application: 'أخلاقيات الأعمال — business ethics'
      },
      {
        id: 'DEBT_ETHICS',
        name: 'آداب الدَّيْن والوفاء به',
        reference: 'البقرة 2:282 — أطول آية في القرآن',
        principle: 'توثيق الديون والوفاء بها — الدَّين مسؤولية',
        modern_application: 'نظام عقود موثقة وشفافية مالية'
      }
    ];

    economic.forEach(e => this.economic_sunnah.set(e.id, e));
    console.log(`✅ سجّلت ${this.economic_sunnah.size} سنن اقتصادية`);
  }

  // ══════════════════════════════════════════════════════════════
  // السنن الروحية والتزكية
  // ══════════════════════════════════════════════════════════════
  _registerSpiritualSunnah() {
    const spiritual = [
      {
        id: 'TAWAKKUL',
        name: 'التوكل على الله مع الأخذ بالأسباب',
        reference: 'الترمذي — اعقلها وتوكل',
        principle: 'العمل الكامل + التوكل الكامل = نجاح الدنيا والآخرة'
      },
      {
        id: 'SABR',
        name: 'الصبر على المصائب والأذى',
        reference: 'البقرة 2:153-157 + حديث: عجباً لأمر المؤمن',
        principle: 'المؤمن لا يخسر في كل أحواله'
      },
      {
        id: 'SHUKR',
        name: 'الشكر — شكر النعمة',
        reference: 'إبراهيم 14:7 — لئن شكرتم لأزيدنكم',
        principle: 'الشكر سبب زيادة النعم',
        practice: ['اللسان', 'الجوارح', 'القلب']
      },
      {
        id: 'IHSAN_WORSHIP',
        name: 'الإحسان في العبادة',
        reference: 'حديث جبريل — الإحسان أن تعبد الله كأنك تراه',
        principle: 'الحضور القلبي في كل عبادة',
        impact: 'جودة لا كمية في العبادة'
      },
      {
        id: 'ZUHD',
        name: 'الزهد في الدنيا',
        reference: 'حديث: ما لي وللدنيا — كراكب استظل تحت شجرة',
        principle: 'عدم التعلق بالدنيا مع العمل فيها',
        balance: 'الزهد لا يعني الترك بل عدم الاستعباد للمادة'
      },
      {
        id: 'MURAQABAH',
        name: 'المراقبة الدائمة لله',
        reference: 'الفجر 89:14 — إن ربك لبالمرصاد',
        principle: 'الشعور الدائم بحضور الله في كل لحظة',
        impact: 'أعلى درجات الإيمان — مرحلة الإحسان'
      }
    ];

    spiritual.forEach(s => this.spiritual_sunnah.set(s.id, s));
    console.log(`✅ سجّلت ${this.spiritual_sunnah.size} سنن روحية`);
  }

  // ══════════════════════════════════════════════════════════════
  // تطبيقات الخلفاء الراشدين
  // ══════════════════════════════════════════════════════════════
  _registerCaliphImplementations() {
    const implementations = [
      {
        id: 'ABU_BAKR_RIDDA',
        caliph: 'أبو بكر الصديق',
        achievement: 'حروب الردة — صون وحدة الأمة',
        sunnah_applied: 'ثبات الحق رغم ضغط الأكثرية',
        lesson: 'الأمة تحتاج قائداً يثبت على الحق حين يرتد الناس',
        impact: 'NATION_SAVING',
        reference: 'ابن هشام وابن كثير'
      },
      {
        id: 'ABU_BAKR_QURAN',
        caliph: 'أبو بكر الصديق',
        achievement: 'جمع القرآن الكريم في مصحف',
        sunnah_applied: 'حفظ أمانة الوحي الإلهي',
        lesson: 'الحفاظ على مصادر المعرفة الأولى واجب',
        impact: 'PRESERVATION_OF_REVELATION',
        reference: 'صحيح البخاري'
      },
      {
        id: 'UMAR_JUSTICE',
        caliph: 'عمر بن الخطاب',
        achievement: 'تطبيق العدل المطلق — لا فرق بين العربي والعجمي',
        sunnah_applied: 'العدل ركيزة الحكم الإسلامي',
        lesson: 'الدولة القوية هي الدولة العادلة',
        famous_example: 'قضية مصارعة ولده مع المصري — نصر المظلوم',
        impact: 'JUSTICE_IMPLEMENTATION'
      },
      {
        id: 'UMAR_EXPANSION',
        caliph: 'عمر بن الخطاب',
        achievement: 'فتح نصف العالم القديم في 10 سنوات',
        sunnah_applied: 'إبلاغ رسالة الإسلام وتحرير الشعوب',
        area_km2: 5500000,
        impact: 'CIVILIZATION_EXPANSION',
        approach: 'الفتح بالإيمان لا بالقهر — إعطاء الناس حقوقهم'
      },
      {
        id: 'UTHMAN_MUSHAF',
        caliph: 'عثمان بن عفان',
        achievement: 'توحيد المصحف الشريف ونسخه وإرساله للأمصار',
        sunnah_applied: 'صون وحدة المصدر الإلهي',
        impact: 'QURAN_STANDARDIZATION',
        copies_sent: 7,
        destinations: ['المدينة', 'مكة', 'الكوفة', 'البصرة', 'الشام', 'اليمن', 'البحرين']
      },
      {
        id: 'ALI_KNOWLEDGE',
        caliph: 'علي بن أبي طالب',
        achievement: 'تدوين أصول الفقه الإسلامي والقضاء',
        sunnah_applied: 'العلم والحكمة في خدمة الأمة',
        impact: 'JURISPRUDENCE_FOUNDATION',
        famous_saying: 'قيمة كل امرئ ما يحسنه'
      }
    ];

    implementations.forEach(i => this.caliph_implementations.set(i.id, i));
    console.log(`✅ سجّلت ${this.caliph_implementations.size} تطبيقات للخلفاء الراشدين`);
  }

  // ══════════════════════════════════════════════════════════════
  // محركات التفعيل
  // ══════════════════════════════════════════════════════════════
  _registerActivationEngines() {
    const engines = [
      {
        id: 'SIGNS_MONITOR',
        name: 'محرك رصد علامات الساعة',
        function: 'رصد وتتبع تحقق علامات الساعة الصغرى والكبرى',
        inputs: ['أحداث عالمية', 'أخبار جيوسياسية', 'ظواهر طبيعية', 'تحولات اجتماعية'],
        outputs: ['تقرير يومي بتحقق العلامات', 'مؤشر الاقتراب من الساعة'],
        reference: 'القرآن والسنة + كتب العلامات'
      },
      {
        id: 'SUNNAH_TRACKER',
        name: 'محرك تتبع السنن',
        function: 'قياس مدى تطبيق السنة النبوية في الفرد والمجتمع',
        metrics: ['نسبة التطبيق الفردي', 'نسبة التطبيق الاجتماعي', 'نسبة التطبيق الحكومي'],
        outputs: ['تقرير أسبوعي للسنن المطبقة والمهجورة']
      },
      {
        id: 'UMMAH_PULSE',
        name: 'محرك نبض الأمة',
        function: 'قياس الحالة الصحية للأمة الإسلامية',
        indicators: ['وحدة الأمة', 'تطبيق الشريعة', 'نشر الدعوة', 'حماية المستضعفين'],
        outputs: ['مؤشر صحة الأمة — Ummah Health Index']
      },
      {
        id: 'PROPHETIC_GOALS_ENGINE',
        name: 'محرك أهداف النبي ﷺ',
        function: 'قياس مدى تحقق أهداف النبي ﷺ في كل عصر',
        goals: 12,
        outputs: ['نسبة الإنجاز لكل هدف', 'الأهداف الأكثر إلحاحاً'],
        priority: 'AQSA_LIBERATION = CRITICAL'
      },
      {
        id: 'CALIPHS_BLUEPRINT',
        name: 'محرك مخطط الخلفاء الراشدين',
        function: 'نمذجة نظام حكم الخلفاء الراشدين وقياس المسافة عنه',
        blueprint_elements: ['الشورى', 'العدل', 'بيت المال', 'محاسبة الولاة', 'حماية الذمة'],
        outputs: ['مؤشر الحوكمة الراشدة — Rashidi Governance Index']
      }
    ];

    engines.forEach(e => this.activation_engines.set(e.id, e));
    console.log(`✅ سجّلت ${this.activation_engines.size} محركات التفعيل والرصد`);
  }

  // ══════════════════════════════════════════════════════════════
  // نماذج القياس
  // ══════════════════════════════════════════════════════════════
  _registerMeasurementModels() {
    const models = [
      {
        id: 'IMAN_INDEX',
        name: 'مؤشر الإيمان',
        components: ['التوحيد', 'الصلاة', 'الزكاة', 'الصيام', 'الحج', 'الأخلاق'],
        scale: '0-100',
        reference: 'أركان الإسلام + شعب الإيمان'
      },
      {
        id: 'UMMAH_HEALTH_INDEX',
        name: 'مؤشر صحة الأمة',
        components: ['الوحدة', 'العدالة', 'العلم', 'الاقتصاد', 'الدعوة', 'القوة الدفاعية'],
        scale: '0-100',
        formula: 'مجموع المكونات / 6'
      },
      {
        id: 'RASHIDI_INDEX',
        name: 'مؤشر الحوكمة الراشدة',
        components: ['الشورى', 'العدل', 'الكفاءة', 'الأمانة', 'محاسبة المسؤولين'],
        scale: '0-100',
        benchmark: 'خلافة عمر بن الخطاب = 95/100'
      },
      {
        id: 'SIGNS_COMPLETION_INDEX',
        name: 'مؤشر اكتمال العلامات',
        components: ['علامات صغرى متحققة', 'علامات صغرى جارية', 'علامات كبرى متحققة'],
        scale: '0-100',
        note: 'الوصول إلى 100 يعني قرب الساعة'
      }
    ];

    models.forEach(m => this.measurement_models.set(m.id, m));
    console.log(`✅ سجّلت ${this.measurement_models.size} نماذج القياس`);
  }

  getEngineStatus() {
    return {
      system: this.system,
      tier: this.tier,
      foundation: this.foundation,
      status: this.status,
      sunnah_structure: {
        individual_sunnah: this.individual_sunnah.size,
        social_sunnah: this.social_sunnah.size,
        governance_sunnah: this.governance_sunnah.size,
        economic_sunnah: this.economic_sunnah.size,
        spiritual_sunnah: this.spiritual_sunnah.size,
        total_sunnah: (
          this.individual_sunnah.size +
          this.social_sunnah.size +
          this.governance_sunnah.size +
          this.economic_sunnah.size +
          this.spiritual_sunnah.size
        )
      },
      caliphs: {
        implementations: this.caliph_implementations.size,
        caliphs_covered: 4
      },
      engines: this.activation_engines.size,
      measurement_models: this.measurement_models.size,
      quranic_references: {
        uswah: 'الأحزاب 33:21',
        shura: 'الشورى 42:38',
        justice: 'النحل 16:90',
        economy: 'البقرة 2:275'
      },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { SheikhaSunnahActivationEngine, QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS };
