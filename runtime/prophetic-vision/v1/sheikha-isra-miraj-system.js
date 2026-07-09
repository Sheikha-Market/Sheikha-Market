'use strict';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SHEIKHA — نظام الإسراء والمعراج والرؤية النبوية الكاملة
 * Isra & Mi'raj + Complete Prophetic Vision System
 *
 * بسم الله الرحمن الرحيم
 * "سُبْحَانَ الَّذِي أَسْرَى بِعَبْدِهِ لَيْلاً مِّنَ الْمَسْجِدِ الْحَرَامِ
 *  إِلَى الْمَسْجِدِ الأَقْصَى الَّذِي بَارَكْنَا حَوْلَهُ لِنُرِيَهُ مِنْ آيَاتِنَا"
 * سورة الإسراء: 1
 *
 * Foundation : QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS
 * Tier       : OMEGA_SUPREME_INFINITE
 * ═══════════════════════════════════════════════════════════════════════════
 */

const QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS = 'QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS';

class SheikhaIsraMirajSystem {
  constructor() {
    this.system = 'SHEIKHA_ISRA_MIRAJ_PROPHETIC_VISION';
    this.tier = 'OMEGA_SUPREME_INFINITE';
    this.foundation = QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS;
    this.status = 'PROPHETIC_VISION_ACTIVE';

    this.isra_journey = new Map();         // رحلة الإسراء
    this.miraj_stations = new Map();       // محطات المعراج
    this.prophets_encountered = new Map(); // الأنبياء الذين لقيهم
    this.divine_gifts = new Map();         // المنح الإلهية
    this.prophetic_sights = new Map();     // ما رأى النبي ﷺ
    this.signs_minor = new Map();          // علامات الساعة الصغرى
    this.signs_major = new Map();          // علامات الساعة الكبرى
    this.prophetic_goals = new Map();      // أهداف النبي ﷺ
    this.sunnah_registry = new Map();      // سجل السنة النبوية
    this.caliphs_legacy = new Map();       // إرث الخلفاء الراشدين
    this.ummah_metrics = new Map();        // مقاييس الأمة

    this._initialize();
  }

  _initialize() {
    this._registerIsraJourney();
    this._registerMirajStations();
    this._registerProphetsEncountered();
    this._registerDivineGifts();
    this._registerPropheticSights();
    this._registerMinorSigns();
    this._registerMajorSigns();
    this._registerPropheticGoals();
    this._registerSunnahRegistry();
    this._registerCaliphsLegacy();
    this._registerUmmahMetrics();
  }

  // ══════════════════════════════════════════════════════════════
  // رحلة الإسراء — من المسجد الحرام إلى المسجد الأقصى
  // ══════════════════════════════════════════════════════════════
  _registerIsraJourney() {
    const stations = [
      {
        id: 'MASJID_AL_HARAM',
        name: 'المسجد الحرام — مكة المكرمة',
        reference: 'الإسراء 17:1',
        event: 'نقطة الانطلاق — بدأ الإسراء من المسجد الحرام',
        significance: 'قبلة المسلمين وبيت الله الحرام',
        coordinates: { lat: 21.4225, lng: 39.8262 }
      },
      {
        id: 'AL_HIJR',
        name: 'الحجر — حِجر إسماعيل',
        reference: 'صحيح البخاري',
        event: 'موضع نوم النبي ﷺ حين جاءه جبريل بالبراق',
        significance: 'بدء الرحلة العظيمة'
      },
      {
        id: 'AL_BURAQ',
        name: 'البراق',
        reference: 'صحيح مسلم',
        event: 'مركبة الإسراء — دابة بيضاء فوق الحمار ودون البغل',
        significance: 'وسيلة النقل المعجزة بين المسجدين'
      },
      {
        id: 'YATHRIB_MEDINA',
        name: 'يثرب — المدينة المنورة',
        reference: 'سيرة ابن هشام',
        event: 'مرور النبي ﷺ بالمدينة في الإسراء',
        significance: 'دار الهجرة المستقبلية'
      },
      {
        id: 'MADYAN',
        name: 'مدين',
        reference: 'روايات السيرة',
        event: 'مرور على أرض مدين — أرض النبي شعيب',
        significance: 'ربط الأنبياء والمسيرة النبوية'
      },
      {
        id: 'MOUNT_SINAI',
        name: 'طور سيناء',
        reference: 'روايات السيرة',
        event: 'المرور بالطور حيث كلّم الله موسى',
        significance: 'موقع الوحي الإلهي لموسى عليه السلام'
      },
      {
        id: 'BETHLEHEM',
        name: 'بيت لحم',
        reference: 'روايات السيرة',
        event: 'مرور بمكان ولادة عيسى عليه السلام',
        significance: 'ربط نبوة عيسى برحلة النبي ﷺ'
      },
      {
        id: 'MASJID_AL_AQSA',
        name: 'المسجد الأقصى — القدس الشريف',
        reference: 'الإسراء 17:1 + صحيح مسلم',
        event: 'وصول النبي ﷺ وصلاة ركعتين وإمامة الأنبياء جميعاً',
        significance: 'قبلة المسلمين الأولى وثالث الحرمين الشريفين',
        coordinates: { lat: 31.7761, lng: 35.2358 }
      }
    ];

    stations.forEach(s => this.isra_journey.set(s.id, s));
    console.log(`✅ سجّلت ${this.isra_journey.size} محطات رحلة الإسراء`);
  }

  // ══════════════════════════════════════════════════════════════
  // محطات المعراج — الصعود عبر السموات السبع
  // ══════════════════════════════════════════════════════════════
  _registerMirajStations() {
    const heavens = [
      {
        level: 1,
        id: 'FIRST_HEAVEN',
        name: 'السماء الأولى',
        prophet: 'آدم عليه السلام',
        prophet_id: 'ADAM',
        description: 'أبو البشر — رأى النبي ﷺ أرواح بنيه يمنة ويسرة',
        event: 'استقبل آدم النبيَّ ﷺ ورحّب به',
        reference: 'صحيح البخاري ومسلم'
      },
      {
        level: 2,
        id: 'SECOND_HEAVEN',
        name: 'السماء الثانية',
        prophet: 'يحيى وعيسى عليهما السلام',
        prophet_id: 'YAHYA_ISA',
        description: 'ابنا الخالة — يحيى بن زكريا وعيسى ابن مريم',
        event: 'الترحيب والتصديق المتبادل بين الأنبياء',
        reference: 'صحيح البخاري ومسلم'
      },
      {
        level: 3,
        id: 'THIRD_HEAVEN',
        name: 'السماء الثالثة',
        prophet: 'يوسف عليه السلام',
        prophet_id: 'YUSUF',
        description: 'أُعطي شطر الحسن — صاحب أجمل صورة في الخلق',
        event: 'لقاء يوسف ورحلة الحسن والصبر',
        reference: 'صحيح البخاري ومسلم'
      },
      {
        level: 4,
        id: 'FOURTH_HEAVEN',
        name: 'السماء الرابعة',
        prophet: 'إدريس عليه السلام',
        prophet_id: 'IDRIS',
        description: 'رفعه الله مكاناً علياً — مريم 19:57',
        event: 'لقاء إدريس في السماء الرابعة',
        reference: 'صحيح مسلم'
      },
      {
        level: 5,
        id: 'FIFTH_HEAVEN',
        name: 'السماء الخامسة',
        prophet: 'هارون عليه السلام',
        prophet_id: 'HARUN',
        description: 'أخو موسى ووزيره — محبوب في قومه',
        event: 'لقاء هارون والترحيب',
        reference: 'صحيح البخاري ومسلم'
      },
      {
        level: 6,
        id: 'SIXTH_HEAVEN',
        name: 'السماء السادسة',
        prophet: 'موسى عليه السلام',
        prophet_id: 'MUSA',
        description: 'كليم الله — بكى لكثرة من يدخل الجنة من أمة محمد',
        event: 'بكاء موسى فرحاً بفضل أمة محمد ﷺ',
        reference: 'صحيح البخاري ومسلم'
      },
      {
        level: 7,
        id: 'SEVENTH_HEAVEN',
        name: 'السماء السابعة',
        prophet: 'إبراهيم عليه السلام',
        prophet_id: 'IBRAHIM',
        description: 'خليل الله — مسنداً ظهره إلى البيت المعمور',
        event: 'إبراهيم عند البيت المعمور حيث يدخله كل يوم 70,000 ملك',
        reference: 'صحيح البخاري ومسلم'
      },
      {
        level: 8,
        id: 'SIDRAT_AL_MUNTAHA',
        name: 'سِدرة المنتهى',
        prophet: null,
        description: 'شجرة النبق — ينتهي عندها علم الخلائق',
        event: 'غشيها من أمر الله ما غشيها — النجم 53:16',
        reference: 'النجم 53:14-16 + صحيح البخاري',
        divine_presence: true
      },
      {
        level: 9,
        id: 'BAYT_AL_MAMUR',
        name: 'البيت المعمور',
        prophet: null,
        description: 'يدخله كل يوم 70,000 ملك لا يعودون إليه',
        event: 'رأى البيت المعمور فوق الكعبة مباشرة',
        reference: 'الطور 52:4 + صحيح البخاري'
      },
      {
        level: 10,
        id: 'DIVINE_ENCOUNTER',
        name: 'المقام الأعلى — التجلي الإلهي',
        prophet: null,
        description: 'ما أوحى إلى عبده ما أوحى — النجم 53:10',
        event: 'تلقّي فريضة الصلاة 50 ثم 5 تساوي 50 في الميزان',
        reference: 'النجم 53:1-18 + صحيح البخاري',
        divine_presence: true,
        gifts: ['فريضة الصلاة', 'خواتيم البقرة', 'المغفرة لمن لا يشرك بالله']
      }
    ];

    heavens.forEach(h => this.miraj_stations.set(h.id, h));
    console.log(`✅ سجّلت ${this.miraj_stations.size} محطات المعراج`);
  }

  // ══════════════════════════════════════════════════════════════
  // الأنبياء الذين لقيهم النبي ﷺ في المعراج
  // ══════════════════════════════════════════════════════════════
  _registerProphetsEncountered() {
    const prophets = [
      { id: 'ADAM', name: 'آدم عليه السلام', heaven: 1, title: 'أبو البشر', lesson: 'أصل الإنسانية وعهد الفطرة' },
      { id: 'YAHYA', name: 'يحيى عليه السلام', heaven: 2, title: 'سيد الشهداء', lesson: 'التقوى والزهد والشهادة' },
      { id: 'ISA', name: 'عيسى عليه السلام', heaven: 2, title: 'روح الله وكلمته', lesson: 'الرحمة والإيمان الخالص' },
      { id: 'YUSUF', name: 'يوسف عليه السلام', heaven: 3, title: 'الصدّيق', lesson: 'الصبر والعفو والحكمة' },
      { id: 'IDRIS', name: 'إدريس عليه السلام', heaven: 4, title: 'النبي المرفوع', lesson: 'العلم والرفعة الروحية' },
      { id: 'HARUN', name: 'هارون عليه السلام', heaven: 5, title: 'وزير موسى', lesson: 'التعاون والأخوة النبوية' },
      { id: 'MUSA', name: 'موسى عليه السلام', heaven: 6, title: 'كليم الله', lesson: 'الاجتهاد في تخفيف الأمة — طلب التخفيض من 50 إلى 5' },
      { id: 'IBRAHIM', name: 'إبراهيم عليه السلام', heaven: 7, title: 'خليل الله وأبو الأنبياء', lesson: 'التوحيد الخالص والإسلام الكامل' }
    ];

    prophets.forEach(p => this.prophets_encountered.set(p.id, p));
    console.log(`✅ سجّلت ${this.prophets_encountered.size} أنبياء في المعراج`);
  }

  // ══════════════════════════════════════════════════════════════
  // المنح الإلهية التي تلقاها النبي ﷺ في المعراج
  // ══════════════════════════════════════════════════════════════
  _registerDivineGifts() {
    const gifts = [
      {
        id: 'SALAH_5',
        name: 'فريضة الصلاة الخمس',
        reference: 'صحيح البخاري ومسلم',
        description: 'فُرضت 50 صلاة ثم خُففت بشفاعة موسى إلى 5 بأجر 50',
        significance: 'عمود الإسلام وصلة العبد بربه — ركن من أركان الإسلام الخمسة',
        impact: 'FOUNDATIONAL_PILLAR'
      },
      {
        id: 'QURAN_CLOSING',
        name: 'خواتيم سورة البقرة',
        reference: 'صحيح مسلم',
        description: 'آمن الرسول بما أُنزل إليه من ربه والمؤمنون — البقرة 2:285-286',
        significance: 'كنز تحت العرش لم يُعطَه نبي قبله',
        impact: 'DIVINE_KNOWLEDGE'
      },
      {
        id: 'FORGIVENESS_TAWHEED',
        name: 'المغفرة لمن مات لا يشرك بالله',
        reference: 'صحيح مسلم',
        description: 'بشارة المؤمنين الموحدين بالمغفرة الإلهية',
        significance: 'أساس العقيدة الإسلامية — التوحيد مفتاح الجنة',
        impact: 'UMMAH_SALVATION'
      },
      {
        id: 'LEADERSHIP_OF_PROPHETS',
        name: 'إمامة الأنبياء في المسجد الأقصى',
        reference: 'صحيح مسلم',
        description: 'صلّى النبي ﷺ إماماً بجميع الأنبياء والمرسلين',
        significance: 'إثبات خاتمية النبوة وأفضلية النبي ﷺ',
        impact: 'PROPHETIC_SUPREMACY'
      },
      {
        id: 'RAFRAFAH',
        name: 'الرفرفة الخضراء والرقي إلى ما فوق سدرة المنتهى',
        reference: 'روايات المعراج',
        description: 'الوصول إلى مستوى لم يصله جبريل عليه السلام',
        significance: 'القرب الإلهي الأعلى لنبي من البشر',
        impact: 'SUPREME_DIVINE_PROXIMITY'
      }
    ];

    gifts.forEach(g => this.divine_gifts.set(g.id, g));
    console.log(`✅ سجّلت ${this.divine_gifts.size} منح إلهية في المعراج`);
  }

  // ══════════════════════════════════════════════════════════════
  // ما رأى النبي ﷺ في الإسراء والمعراج
  // ══════════════════════════════════════════════════════════════
  _registerPropheticSights() {
    const sights = [
      {
        id: 'PARADISE_JANNAH',
        name: 'الجنة',
        category: 'AFTERLIFE',
        description: 'رأى النبي ﷺ الجنة وما أعدّ الله فيها لأهل الإيمان',
        lesson: 'التشويق للعبادة والعمل الصالح',
        reference: 'صحيح البخاري ومسلم'
      },
      {
        id: 'HELLFIRE_JAHANNAM',
        name: 'النار',
        category: 'AFTERLIFE',
        description: 'رأى النبي ﷺ جهنم وما فيها من عذاب للمذنبين',
        lesson: 'التحذير من المعاصي والتنفير منها',
        reference: 'صحيح البخاري ومسلم'
      },
      {
        id: 'RIBA_PUNISHERS',
        name: 'عقاب آكلي الربا',
        category: 'SINS_CONSEQUENCES',
        description: 'رأى قوماً بطونهم كالبيوت يتقلبون عليها آل فرعون',
        lesson: 'تحريم الربا وشدة عقوبته',
        reference: 'مسند أحمد'
      },
      {
        id: 'ZINA_PUNISHERS',
        name: 'عقاب الزناة',
        category: 'SINS_CONSEQUENCES',
        description: 'رأى رجالاً ونساء يُعذَّبون',
        lesson: 'تحريم الزنا وفداحة عواقبه',
        reference: 'مسند أحمد'
      },
      {
        id: 'BACKBITERS_PUNISHED',
        name: 'عقاب المغتابين',
        category: 'SINS_CONSEQUENCES',
        description: 'رأى قوماً يخمشون وجوههم وصدورهم بأظافر من نحاس',
        lesson: 'تحريم الغيبة والنميمة',
        reference: 'مسند أحمد'
      },
      {
        id: 'GOOD_DEEDS_SMELL',
        name: 'رائحة المشاطة في قصة ماشطة بنت فرعون',
        category: 'GOOD_DEEDS',
        description: 'رائحة طيبة من قصة الإيمان والشهادة',
        lesson: 'ثبات المؤمن أمام الطاغوت',
        reference: 'مسند أحمد وابن حبان'
      },
      {
        id: 'NILE_EUPHRATES_RIVERS',
        name: 'أصول الأنهار الكبرى من الجنة',
        category: 'COSMIC_SIGNS',
        description: 'النيل والفرات أصلهما من الجنة',
        lesson: 'بركة الأرض وصلتها بالغيب',
        reference: 'صحيح البخاري'
      },
      {
        id: 'FULL_MOON_BEAUTY',
        name: 'رؤية البيت المعمور والكواكب',
        category: 'COSMIC_SIGNS',
        description: 'البيت المعمور فوق الكعبة يعمره كل يوم 70,000 ملك',
        lesson: 'عظمة الخلق وكثرة العباد',
        reference: 'صحيح البخاري'
      },
      {
        id: 'QURAN_REVEALED_COMPLETE',
        name: 'رؤية مكانة القرآن',
        category: 'DIVINE_KNOWLEDGE',
        description: 'إدراك أن القرآن كلام الله المحفوظ في اللوح المحفوظ',
        lesson: 'قدسية القرآن وصونه إلى قيام الساعة',
        reference: 'البروج 85:21-22'
      },
      {
        id: 'DEATH_OF_UMMAH',
        name: 'رؤية أحوال الأمة',
        category: 'UMMAH_FUTURE',
        description: 'رأى ما ستعيشه الأمة من فتن ومن انتصارات',
        lesson: 'التحذير والتبشير معاً للأمة',
        reference: 'أحاديث متعددة'
      }
    ];

    sights.forEach(s => this.prophetic_sights.set(s.id, s));
    console.log(`✅ سجّلت ${this.prophetic_sights.size} مشاهد من الإسراء والمعراج`);
  }

  // ══════════════════════════════════════════════════════════════
  // علامات الساعة الصغرى
  // ══════════════════════════════════════════════════════════════
  _registerMinorSigns() {
    const minor = [
      { id: 'DEATH_PROPHET', name: 'وفاة النبي ﷺ', status: 'FULFILLED', year: '11 هـ', category: 'PROPHETIC' },
      { id: 'CONQUEST_JERUSALEM', name: 'فتح بيت المقدس', status: 'FULFILLED', year: '15-16 هـ', category: 'CONQUEST' },
      { id: 'PLAGUE_AMWAS', name: 'طاعون عَمَواس', status: 'FULFILLED', year: '18 هـ', category: 'CALAMITY' },
      { id: 'CONQUEST_EGYPT', name: 'فتح مصر والعراق والشام', status: 'FULFILLED', year: '20-23 هـ', category: 'CONQUEST' },
      { id: 'FALSE_PROPHETS', name: 'ظهور المتنبئين الكذابين — 30+', status: 'ONGOING', category: 'SIGNS' },
      { id: 'FIRE_HIJAZ', name: 'ظهور نار من الحجاز تضيء أعناق الإبل ببُصرى', status: 'FULFILLED', year: '654 هـ', category: 'PHYSICAL' },
      { id: 'KNOWLEDGE_VANISH', name: 'رفع العلم وموت العلماء', status: 'ONGOING', category: 'KNOWLEDGE' },
      { id: 'SPREAD_IGNORANCE', name: 'فشوّ الجهل', status: 'ONGOING', category: 'KNOWLEDGE' },
      { id: 'ALCOHOL_SPREAD', name: 'انتشار الخمور', status: 'ONGOING', category: 'MORALITY' },
      { id: 'ZINA_OPEN', name: 'ظهور الزنا علناً', status: 'ONGOING', category: 'MORALITY' },
      { id: 'TIME_SHRINK', name: 'تقارب الزمن حتى تكون السنة كالشهر', status: 'ONGOING', category: 'TIME' },
      { id: 'KILLING_INCREASE', name: 'كثرة القتل الهَرج', status: 'ONGOING', category: 'VIOLENCE' },
      { id: 'EARTHQUAKES', name: 'كثرة الزلازل', status: 'ONGOING', category: 'PHYSICAL' },
      { id: 'WEALTH_ABUNDANCE', name: 'كثرة المال وتدفقه حتى يُهمّ الواحد من يقبل زكاته', status: 'PARTIAL', category: 'ECONOMY' },
      { id: 'BUILDINGS_COMPETE', name: 'تطاول الحفاة العراة في البنيان', status: 'ONGOING', category: 'CIVILIZATION' },
      { id: 'SLAVE_BIRTH', name: 'أن تلد الأمة ربتها', status: 'INTERPRETED', category: 'SOCIAL' },
      { id: 'EUPHRATES_GOLD', name: 'حسر الفرات عن جبل من ذهب', status: 'PENDING', category: 'PHYSICAL' },
      { id: 'ROMAN_CONQUEST', name: 'غزوة روميّة كبرى', status: 'PENDING', category: 'CONQUEST' },
      { id: 'WOMEN_OUTNUMBER', name: 'كثرة النساء وقلة الرجال حتى يكون لخمسين امرأة قيّم واحد', status: 'ONGOING', category: 'DEMOGRAPHIC' },
      { id: 'RIBA_EVERYWHERE', name: 'فشوّ الربا حتى لا يسلم منه أحد', status: 'ONGOING', category: 'ECONOMY' },
      { id: 'FITNAH_FAST', name: 'كثرة الفتن المتلاحقة', status: 'ONGOING', category: 'SIGNS' },
      { id: 'LAND_EAST_SINK', name: 'خسف بالمشرق', status: 'PENDING', category: 'PHYSICAL' },
      { id: 'LAND_WEST_SINK', name: 'خسف بالمغرب', status: 'PENDING', category: 'PHYSICAL' },
      { id: 'LAND_ARABIA_SINK', name: 'خسف بجزيرة العرب', status: 'PENDING', category: 'PHYSICAL' },
      { id: 'ARAB_LAND_GREEN', name: 'عودة جزيرة العرب مروجاً وأنهاراً', status: 'ONGOING', category: 'ENVIRONMENT' },
      { id: 'MAHDI_SMALL', name: 'علامات ظهور المهدي الصغرى — اضطراب عام', status: 'ONGOING', category: 'MAHDI_PRECURSOR' }
    ];

    minor.forEach(s => this.signs_minor.set(s.id, s));
    console.log(`✅ سجّلت ${this.signs_minor.size} علامة من علامات الساعة الصغرى`);
  }

  // ══════════════════════════════════════════════════════════════
  // علامات الساعة الكبرى — العشرة الكبار
  // ══════════════════════════════════════════════════════════════
  _registerMajorSigns() {
    const major = [
      {
        id: 'AL_MAHDI',
        order: 1,
        name: 'خروج المهدي',
        nameAr: 'الإمام المهدي',
        status: 'PENDING',
        description: 'رجل من أهل البيت النبوي اسمه محمد بن عبدالله يملأ الأرض قسطاً وعدلاً',
        reference: 'أبو داود والترمذي وابن ماجة',
        role: 'إعادة الخلافة الراشدة وملء الأرض بالعدل',
        duration: '7 أو 8 أو 9 سنوات',
        signs: ['اضطراب في الحكم', 'خروج من المدينة إلى مكة', 'البيعة بين الركن والمقام']
      },
      {
        id: 'DAJJAL',
        order: 2,
        name: 'خروج الدجال',
        nameAr: 'المسيح الدجال',
        status: 'PENDING',
        description: 'أعور العين اليمنى — أعظم فتنة منذ خلق آدم إلى قيام الساعة',
        reference: 'صحيح البخاري ومسلم',
        role: 'فتنة الإيمان الكبرى — يدعي الألوهية',
        protection: ['حفظ أول وآخر سورة الكهف', 'الفرار إلى المدينة أو مكة']
      },
      {
        id: 'ISA_DESCENT',
        order: 3,
        name: 'نزول عيسى ابن مريم عليه السلام',
        nameAr: 'نزول المسيح الحق',
        status: 'PENDING',
        description: 'ينزل عند المنارة البيضاء شرقي دمشق فيقتل الدجال ويكسر الصليب',
        reference: 'صحيح البخاري ومسلم',
        role: 'قتل الدجال وإقامة العدل وتطبيق شريعة الإسلام',
        events: ['كسر الصليب', 'قتل الخنزير', 'وضع الجزية', 'حكم بالقرآن والسنة', 'الزواج وله ذرية']
      },
      {
        id: 'YAJUJ_MAJUJ',
        order: 4,
        name: 'خروج يأجوج ومأجوج',
        nameAr: 'يأجوج ومأجوج',
        status: 'PENDING',
        description: 'يخرجون من حيث فتح السد — يشربون البحيرات ويفسدون في الأرض',
        reference: 'الكهف 18:99-100 + صحيح مسلم',
        role: 'آخر فتنة بشرية كبرى على الأرض',
        end: 'يُهلكهم الله بالنغف في رقابهم بدعاء عيسى'
      },
      {
        id: 'THREE_SINKINGS',
        order: 5,
        name: 'ثلاث خسوفات — شرق وغرب وجزيرة العرب',
        status: 'PENDING',
        description: 'خسف أرضي كبير في ثلاثة مواضع مختلفة',
        reference: 'صحيح مسلم'
      },
      {
        id: 'DUKHAN',
        order: 6,
        name: 'الدخان',
        nameAr: 'الدخان الكبير',
        status: 'PENDING',
        description: 'دخان يملأ السماء يُصيب المؤمن كالزكام ويُعذّب الكافر',
        reference: 'الدخان 44:10-11'
      },
      {
        id: 'SUN_FROM_WEST',
        order: 7,
        name: 'طلوع الشمس من مغربها',
        status: 'PENDING',
        description: 'تطلع الشمس من مغربها فيُغلق باب التوبة',
        reference: 'صحيح البخاري ومسلم',
        impact: 'إغلاق باب التوبة والإيمان بعد ذلك'
      },
      {
        id: 'DABBAH',
        order: 8,
        name: 'خروج دابة الأرض',
        nameAr: 'الدابة',
        status: 'PENDING',
        description: 'تُكلّم الناس وتَسِم المؤمن والكافر',
        reference: 'النمل 27:82'
      },
      {
        id: 'FIRE_YEMEN',
        order: 9,
        name: 'نار تخرج من قَعر عدن تحشر الناس',
        status: 'PENDING',
        description: 'نار تسوق الناس إلى المحشر',
        reference: 'صحيح مسلم'
      },
      {
        id: 'TRUMPET_BLAST',
        order: 10,
        name: 'نفخ الصور',
        nameAr: 'النفخ في الصور',
        status: 'PENDING',
        description: 'النفخة الأولى: الصعق والموت. النفخة الثانية: البعث والنشور',
        reference: 'الزمر 39:68 + يس 36:51-52'
      }
    ];

    major.forEach(s => this.signs_major.set(s.id, s));
    console.log(`✅ سجّلت ${this.signs_major.size} علامات من علامات الساعة الكبرى`);
  }

  // ══════════════════════════════════════════════════════════════
  // أهداف النبي ﷺ في حياته وما أراد تحقيقه
  // ══════════════════════════════════════════════════════════════
  _registerPropheticGoals() {
    const goals = [
      {
        id: 'TAWHEED_SPREAD',
        name: 'نشر التوحيد الخالص في الأرض كلها',
        reference: 'آل عمران 3:19',
        status: 'IN_PROGRESS',
        achieved: 'أسلمت الجزيرة العربية كاملة في حياته ﷺ',
        remaining: 'بقية العالم في انتظار الدعوة',
        metric: { target: 8000000000, current_estimate: 1900000000, unit: 'نفوس' }
      },
      {
        id: 'QURAN_PRESERVATION',
        name: 'حفظ القرآن الكريم إلى قيام الساعة',
        reference: 'الحجر 15:9',
        status: 'FULFILLED_ONGOING',
        achieved: 'القرآن محفوظ بأمر إلهي منذ 14 قرناً',
        metric: { books_printed: 'مئات الملايين', huffaz: 'أكثر من 10 ملايين حافظ' }
      },
      {
        id: 'JUSTICE_ESTABLISHMENT',
        name: 'إقامة العدل ورفع الظلم',
        reference: 'النحل 16:90',
        status: 'IN_PROGRESS',
        achieved: 'رسّخ مفهوم العدل الإسلامي — القانون واحد للجميع',
        remaining: 'تطبيق كامل ينتظر عودة الخلافة الراشدة'
      },
      {
        id: 'UMMAH_UNITY',
        name: 'وحدة الأمة الإسلامية كجسد واحد',
        reference: 'صحيح البخاري — مثل المؤمنين في توادهم',
        status: 'IN_PROGRESS',
        achieved: 'إرساء مبدأ الأخوة الإسلامية',
        remaining: 'تجاوز الفرقة والخلافات السياسية'
      },
      {
        id: 'EDUCATION_SPREAD',
        name: 'نشر العلم وتعليم الأمة',
        reference: 'العلق 96:1 + حديث طلب العلم فريضة',
        status: 'IN_PROGRESS',
        achieved: 'بنى أول نظام تعليمي في الإسلام — المسجد مدرسة',
        metric: { muslims_educated: 'أكثر من مليار متعلم' }
      },
      {
        id: 'MERCY_TO_ALL_WORLDS',
        name: 'نشر الرحمة الإسلامية للعالمين',
        reference: 'الأنبياء 21:107 — رحمة للعالمين',
        status: 'IN_PROGRESS',
        achieved: 'نموذج الرحمة النبوية في معاملة الأعداء والضعفاء',
        remaining: 'تجسيد الرحمة النبوية في الحكومات والمجتمعات'
      },
      {
        id: 'WEAK_PROTECTION',
        name: 'حماية المستضعفين — المرأة والطفل واليتيم والفقير',
        reference: 'النساء 4:75',
        status: 'IN_PROGRESS',
        achieved: 'وضع منظومة حقوق متكاملة قبل 14 قرناً',
        remaining: 'تطبيق كامل في المجتمعات الإسلامية'
      },
      {
        id: 'SHURA_GOVERNANCE',
        name: 'إرساء نظام الشورى في الحكم',
        reference: 'الشورى 42:38',
        status: 'PARTIALLY_ACHIEVED',
        achieved: 'طبّقه الخلفاء الراشدون بأمانة',
        remaining: 'إحياء الشورى الحقيقية في العالم الإسلامي'
      },
      {
        id: 'HALAL_ECONOMY',
        name: 'بناء اقتصاد إسلامي بلا ربا وبالزكاة',
        reference: 'البقرة 2:275-276',
        status: 'IN_PROGRESS',
        achieved: 'نظام الزكاة والصدقة والوقف الإسلامي',
        remaining: 'استئصال الربا من الاقتصادات الإسلامية'
      },
      {
        id: 'AKHLAQ_REFORM',
        name: 'إتمام مكارم الأخلاق',
        reference: 'حديث: إنما بُعثت لأتمم مكارم الأخلاق',
        status: 'IN_PROGRESS',
        achieved: 'الأخلاق النبوية نموذجاً للبشرية',
        remaining: 'تجسيد الأخلاق النبوية في المجتمعات المعاصرة'
      },
      {
        id: 'MASJID_AQSA_LIBERATION',
        name: 'تحرير المسجد الأقصى ورعايته',
        reference: 'الإسراء 17:1',
        status: 'PENDING',
        achieved: 'فتح عمر للقدس 15-16 هـ',
        remaining: 'التحرير الكامل من الاحتلال — بشارة نبوية مؤكدة',
        urgency: 'CRITICAL'
      },
      {
        id: 'ROME_CONQUEST',
        name: 'فتح رومية (روما/القسطنطينية) والتبشير بها',
        reference: 'حديث: لتُفتحنّ القسطنطينية',
        status: 'PARTIAL',
        achieved: 'فتح القسطنطينية عام 857 هـ — محمد الفاتح',
        remaining: 'فتح رومية في آخر الزمان'
      }
    ];

    goals.forEach(g => this.prophetic_goals.set(g.id, g));
    console.log(`✅ سجّلت ${this.prophetic_goals.size} هدف من أهداف النبي ﷺ`);
  }

  // ══════════════════════════════════════════════════════════════
  // سجل السنة النبوية المصنفة
  // ══════════════════════════════════════════════════════════════
  _registerSunnahRegistry() {
    const sunnah_categories = [
      {
        id: 'SALAH_SUNNAH',
        category: 'العبادات',
        name: 'سنن الصلاة',
        count: 12,
        examples: ['التراويح', 'الضحى', 'قيام الليل', 'سنة الفجر', 'ذكر ما بعد الصلاة'],
        impact: 'تعميق الصلة بالله وتصفية النفس'
      },
      {
        id: 'FASTING_SUNNAH',
        category: 'العبادات',
        name: 'سنن الصيام',
        count: 5,
        examples: ['صيام الاثنين والخميس', 'أيام البيض', 'صيام عاشوراء', 'صيام ست من شوال'],
        impact: 'تزكية النفس وضبط الشهوات'
      },
      {
        id: 'SADAQAH_SUNNAH',
        category: 'الاجتماعيات',
        name: 'سنن الصدقة والكرم',
        count: 8,
        examples: ['إطعام الطعام', 'ابتسامة الأخ صدقة', 'إزالة الأذى عن الطريق', 'الوقف'],
        impact: 'تماسك المجتمع وسد حاجات المحتاجين'
      },
      {
        id: 'FAMILY_SUNNAH',
        category: 'الأسرة',
        name: 'سنن الحياة الأسرية',
        count: 15,
        examples: ['التبسم للزوجة', 'مساعدة أهل البيت', 'العدل بين الأبناء', 'تكريم المرأة'],
        impact: 'بناء الأسرة المسلمة المتماسكة'
      },
      {
        id: 'TRADE_SUNNAH',
        category: 'المعاملات',
        name: 'سنن التجارة والمعاملات',
        count: 10,
        examples: ['الصدق في البيع', 'النهي عن الغش', 'الوفاء بالعقود', 'منح الميسرة للمعسر'],
        impact: 'اقتصاد عادل ونزيه ومبارك'
      },
      {
        id: 'DAILY_SUNNAH',
        category: 'السلوك اليومي',
        name: 'سنن الحياة اليومية',
        count: 40,
        examples: ['البسملة', 'الاستياك', 'النوم على الشق الأيمن', 'دعاء الطعام والشراب'],
        impact: 'ربط الحياة اليومية بالعبادة'
      },
      {
        id: 'GOVERNANCE_SUNNAH',
        category: 'السياسة والحكم',
        name: 'سنن الحكم والقيادة',
        count: 12,
        examples: ['الشورى', 'العدل بين الرعية', 'سماع المظالم', 'اختيار الكفء الأمين'],
        impact: 'حوكمة إسلامية عادلة ورشيدة'
      },
      {
        id: 'WARFARE_SUNNAH',
        category: 'الجهاد والعلاقات الدولية',
        name: 'سنن الحرب والسلم والمعاهدات',
        count: 20,
        examples: ['النهي عن قتل المدنيين', 'إحسان المعاملة للأسرى', 'الوفاء بالمعاهدات'],
        impact: 'أخلاقيات الحرب والسلام الإسلامية'
      }
    ];

    sunnah_categories.forEach(s => this.sunnah_registry.set(s.id, s));
    console.log(`✅ سجّلت ${this.sunnah_registry.size} تصنيفات للسنة النبوية`);
  }

  // ══════════════════════════════════════════════════════════════
  // إرث الخلفاء الراشدين المهديين
  // ══════════════════════════════════════════════════════════════
  _registerCaliphsLegacy() {
    const caliphs = [
      {
        id: 'ABU_BAKR_SIDDIQ',
        name: 'أبو بكر الصديق رضي الله عنه',
        period: '11-13 هـ — 632-634 م',
        title: 'الصديق — خليفة رسول الله',
        achievements: [
          'تثبيت الإسلام وقتال المرتدين وحروب الردة',
          'جمع القرآن الكريم في مصحف واحد',
          'بدء الفتوحات الإسلامية — العراق والشام',
          'توحيد الجزيرة العربية تحت راية الإسلام'
        ],
        key_principle: 'الصدق المطلق والتمسك بسنة النبي ﷺ',
        impact_score: 10,
        reference: 'سيرة الخلفاء الراشدين — ابن كثير'
      },
      {
        id: 'UMAR_IBN_KHATTAB',
        name: 'عمر بن الخطاب رضي الله عنه',
        period: '13-23 هـ — 634-644 م',
        title: 'الفاروق — أمير المؤمنين',
        achievements: [
          'فتح العراق والشام ومصر وفارس وأجزاء من آسيا',
          'فتح بيت المقدس وحماية كنائسه ومعابده',
          'تأسيس بيت المال وديوان الجند',
          'إصلاح القضاء وتأسيس الشرطة',
          'تأسيس التقويم الهجري',
          'تحديد الخراج والعشور والجزية بنظام عادل',
          'التواضع والعدل المطلق — الرعاء والأمراء سواء'
        ],
        key_principle: 'العدل المطلق وخدمة الرعية',
        impact_score: 10,
        reference: 'الفاروق عمر — محمد حسين هيكل'
      },
      {
        id: 'UTHMAN_IBN_AFFAN',
        name: 'عثمان بن عفان رضي الله عنه',
        period: '23-35 هـ — 644-656 م',
        title: 'ذو النورين — أمير المؤمنين',
        achievements: [
          'توحيد مصحف القرآن الكريم ونشره في الأمصار',
          'التوسع في الفتوحات — فارس وأذربيجان وأرمينيا',
          'تأسيس القوة البحرية الإسلامية',
          'بناء الأسطول الإسلامي الأول',
          'المضي في بناء المسجد النبوي'
        ],
        key_principle: 'الكرم المطلق والحياء والتمسك بالقرآن',
        impact_score: 9,
        reference: 'سيرة الخلفاء الراشدين'
      },
      {
        id: 'ALI_IBN_ABI_TALIB',
        name: 'علي بن أبي طالب رضي الله عنه',
        period: '35-40 هـ — 656-661 م',
        title: 'أسد الله — باب مدينة العلم',
        achievements: [
          'حفظ منظومة الفقه الإسلامي وتدوينه',
          'القضاء المتقن والحكمة في الفصل بين الناس',
          'الثبات على مبادئ العدل رغم الفتنة',
          'إرساء مبادئ الحكمة والعلم في الإسلام'
        ],
        key_principle: 'العلم والحكمة والشجاعة والعدل',
        impact_score: 10,
        reference: 'نهج البلاغة + سيرة الخلفاء الراشدين'
      }
    ];

    caliphs.forEach(c => this.caliphs_legacy.set(c.id, c));
    console.log(`✅ سجّلت ${this.caliphs_legacy.size} خلفاء راشدين مهديين`);
  }

  // ══════════════════════════════════════════════════════════════
  // مقاييس الأمة الإسلامية
  // ══════════════════════════════════════════════════════════════
  _registerUmmahMetrics() {
    const metrics = [
      {
        id: 'UMMAH_POPULATION',
        name: 'عدد المسلمين في العالم',
        current: 1900000000,
        target: 'إبلاغ الرسالة للبشرية جمعاء',
        unit: 'نفس',
        percentage_of_world: 24,
        trend: 'GROWING'
      },
      {
        id: 'QURAN_MEMORIZERS',
        name: 'حفظة القرآن الكريم',
        current: 10000000,
        target: 'زيادة مستمرة',
        unit: 'حافظ',
        trend: 'GROWING'
      },
      {
        id: 'MOSQUES_COUNT',
        name: 'عدد المساجد في العالم',
        current: 3600000,
        target: 'مسجد في كل حي',
        unit: 'مسجد',
        trend: 'GROWING'
      },
      {
        id: 'ISLAMIC_COUNTRIES',
        name: 'الدول ذات الأغلبية المسلمة',
        current: 57,
        organization: 'منظمة التعاون الإسلامي',
        unit: 'دولة',
        trend: 'STABLE'
      },
      {
        id: 'ZAKAT_DISTRIBUTED',
        name: 'الزكاة والصدقات الموزعة سنوياً',
        current_estimate_usd: 600000000000,
        unit: 'دولار',
        trend: 'GROWING',
        note: 'إمكانية التقليل من الفقر العالمي إذا نُظِّمت'
      },
      {
        id: 'HADITH_BOOKS',
        name: 'كتب الحديث النبوي المحفوظة',
        major_collections: 6,
        names: ['البخاري', 'مسلم', 'أبو داود', 'الترمذي', 'النسائي', 'ابن ماجة'],
        total_hadith: 60000,
        unit: 'حديث نبوي',
        status: 'PRESERVED'
      },
      {
        id: 'SIGNS_FULFILLED',
        name: 'علامات الساعة الصغرى المتحققة',
        total_minor: 26,
        fulfilled: 12,
        ongoing: 11,
        pending: 3,
        percentage_fulfilled: 88,
        unit: 'علامة'
      },
      {
        id: 'CALIPHS_ACHIEVEMENTS',
        name: 'إنجازات الخلفاء الراشدين المُطبَّقة',
        total_achievements: 20,
        still_active: ['تدوين القرآن', 'التقويم الهجري', 'منظومة الزكاة', 'نظام القضاء'],
        unit: 'إنجاز'
      }
    ];

    metrics.forEach(m => this.ummah_metrics.set(m.id, m));
    console.log(`✅ سجّلت ${this.ummah_metrics.size} مقاييس للأمة الإسلامية`);
  }

  // ══════════════════════════════════════════════════════════════
  // محركات الرصد والقياس
  // ══════════════════════════════════════════════════════════════
  measureSignsProgress() {
    const minor_arr = Array.from(this.signs_minor.values());
    const major_arr = Array.from(this.signs_major.values());
    return {
      minor_signs: {
        total: minor_arr.length,
        fulfilled: minor_arr.filter(s => s.status === 'FULFILLED').length,
        ongoing: minor_arr.filter(s => s.status === 'ONGOING').length,
        pending: minor_arr.filter(s => s.status === 'PENDING').length,
        partial: minor_arr.filter(s => ['PARTIAL', 'PARTIAL_ACHIEVED', 'INTERPRETED', 'PARTIAL'].includes(s.status)).length
      },
      major_signs: {
        total: major_arr.length,
        pending: major_arr.filter(s => s.status === 'PENDING').length,
        all_pending: major_arr.every(s => s.status === 'PENDING'),
        first_expected: 'AL_MAHDI'
      }
    };
  }

  measurePropheticGoalsProgress() {
    const goals = Array.from(this.prophetic_goals.values());
    return {
      total: goals.length,
      fulfilled: goals.filter(g => g.status === 'FULFILLED_ONGOING').length,
      in_progress: goals.filter(g => g.status === 'IN_PROGRESS').length,
      partial: goals.filter(g => g.status === 'PARTIALLY_ACHIEVED' || g.status === 'PARTIAL').length,
      pending: goals.filter(g => g.status === 'PENDING').length,
      critical: goals.filter(g => g.urgency === 'CRITICAL').map(g => g.id)
    };
  }

  getFullStatus() {
    return {
      system: this.system,
      tier: this.tier,
      foundation: this.foundation,
      status: this.status,
      isra_journey: {
        stations: this.isra_journey.size,
        start: 'MASJID_AL_HARAM',
        end: 'MASJID_AL_AQSA'
      },
      miraj_structure: {
        heavens_traversed: this.miraj_stations.size,
        prophets_met: this.prophets_encountered.size,
        divine_gifts: this.divine_gifts.size,
        sights_witnessed: this.prophetic_sights.size
      },
      signs_of_hour: {
        minor_total: this.signs_minor.size,
        major_total: this.signs_major.size,
        progress: this.measureSignsProgress()
      },
      prophetic_mission: {
        goals_total: this.prophetic_goals.size,
        progress: this.measurePropheticGoalsProgress(),
        sunnah_categories: this.sunnah_registry.size,
        caliphs_catalogued: this.caliphs_legacy.size
      },
      ummah_metrics: {
        total_metrics: this.ummah_metrics.size,
        population: this.ummah_metrics.get('UMMAH_POPULATION')?.current,
        mosques: this.ummah_metrics.get('MOSQUES_COUNT')?.current,
        hafiz: this.ummah_metrics.get('QURAN_MEMORIZERS')?.current
      },
      quranic_references: {
        isra: 'الإسراء 17:1',
        miraj: 'النجم 53:1-18',
        signs: 'الأنبياء 21:96-97 + التكوير 81:1-14',
        mission: 'الأنبياء 21:107 + التوبة 9:33'
      },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { SheikhaIsraMirajSystem, QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS };
