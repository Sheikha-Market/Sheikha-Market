'use strict';

/**
 * اختبارات نظام الإسراء والمعراج والرؤية النبوية الكاملة
 * بسم الله الرحمن الرحيم
 */

const { SheikhaIsraMirajSystem } = require('../runtime/prophetic-vision/v1/sheikha-isra-miraj-system.js');
const { SheikhaSunnahActivationEngine } = require('../runtime/prophetic-vision/v1/sheikha-sunnah-activation-engine.js');

describe('نظام الإسراء والمعراج والرؤية النبوية الكاملة', () => {
  let israMiraj, sunnahEngine;

  beforeEach(() => {
    israMiraj = new SheikhaIsraMirajSystem();
    sunnahEngine = new SheikhaSunnahActivationEngine();
  });

  // ══════════════════════════════════════════════════════════════
  // 1. الأساس والهوية
  // ══════════════════════════════════════════════════════════════
  describe('الأساس والهوية — Foundation & Identity', () => {
    test('نظام الإسراء يحمل الأساس القرآني الراسخ', () => {
      const status = israMiraj.getFullStatus();
      expect(status.foundation).toBe('QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS');
      expect(status.tier).toBe('OMEGA_SUPREME_INFINITE');
    });

    test('محرك السنة يحمل الأساس القرآني الراسخ', () => {
      const status = sunnahEngine.getEngineStatus();
      expect(status.foundation).toBe('QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS');
      expect(status.tier).toBe('OMEGA_SUPREME_INFINITE');
    });

    test('كلا النظامين يتشاركان نفس الأساس', () => {
      expect(israMiraj.foundation).toBe(sunnahEngine.foundation);
    });

    test('النظام يحمل الحالة الصحيحة', () => {
      expect(israMiraj.status).toContain('PROPHETIC');
      expect(sunnahEngine.status).toContain('SUNNAH');
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 2. رحلة الإسراء — من الحرام إلى الأقصى
  // ══════════════════════════════════════════════════════════════
  describe('رحلة الإسراء — من المسجد الحرام إلى الأقصى', () => {
    test('رحلة الإسراء تحتوي على محطات مسجلة', () => {
      const status = israMiraj.getFullStatus();
      expect(status.isra_journey.stations).toBeGreaterThan(0);
    });

    test('نقطة الانطلاق هي المسجد الحرام', () => {
      expect(israMiraj.isra_journey.has('MASJID_AL_HARAM')).toBe(true);
      expect(israMiraj.isra_journey.get('MASJID_AL_HARAM').reference).toContain('الإسراء');
    });

    test('نقطة الوصول هي المسجد الأقصى', () => {
      expect(israMiraj.isra_journey.has('MASJID_AL_AQSA')).toBe(true);
      const aqsa = israMiraj.isra_journey.get('MASJID_AL_AQSA');
      expect(aqsa.event).toContain('الأنبياء');
    });

    test('البراق وسيلة الإسراء مسجلة', () => {
      expect(israMiraj.isra_journey.has('AL_BURAQ')).toBe(true);
    });

    test('رحلة الإسراء تحتوي على 8 محطات أو أكثر', () => {
      expect(israMiraj.isra_journey.size).toBeGreaterThanOrEqual(8);
    });

    test('محطة المسجد الأقصى تحمل إحداثيات جغرافية', () => {
      const aqsa = israMiraj.isra_journey.get('MASJID_AL_AQSA');
      expect(aqsa.coordinates).toBeDefined();
      expect(aqsa.coordinates.lat).toBeGreaterThan(0);
      expect(aqsa.coordinates.lng).toBeGreaterThan(0);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 3. محطات المعراج — السموات السبع
  // ══════════════════════════════════════════════════════════════
  describe('محطات المعراج — الصعود عبر السموات', () => {
    test('المعراج يحتوي على 10 محطات أو أكثر', () => {
      expect(israMiraj.miraj_stations.size).toBeGreaterThanOrEqual(10);
    });

    test('السماء الأولى يسكنها آدم عليه السلام', () => {
      const first = israMiraj.miraj_stations.get('FIRST_HEAVEN');
      expect(first.prophet).toContain('آدم');
      expect(first.level).toBe(1);
    });

    test('السماء السابعة يسكنها إبراهيم عليه السلام', () => {
      const seventh = israMiraj.miraj_stations.get('SEVENTH_HEAVEN');
      expect(seventh.prophet).toContain('إبراهيم');
      expect(seventh.level).toBe(7);
    });

    test('سدرة المنتهى مسجلة ومرجعها سورة النجم', () => {
      const sidra = israMiraj.miraj_stations.get('SIDRAT_AL_MUNTAHA');
      expect(sidra).toBeDefined();
      expect(sidra.reference).toContain('النجم');
      expect(sidra.divine_presence).toBe(true);
    });

    test('التجلي الإلهي يحتوي على هبة الصلاة الخمس', () => {
      const divine = israMiraj.miraj_stations.get('DIVINE_ENCOUNTER');
      expect(divine.gifts).toContain('فريضة الصلاة');
      expect(divine.divine_presence).toBe(true);
    });

    test('البيت المعمور مسجل في المعراج', () => {
      expect(israMiraj.miraj_stations.has('BAYT_AL_MAMUR')).toBe(true);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 4. الأنبياء الذين لقيهم النبي ﷺ
  // ══════════════════════════════════════════════════════════════
  describe('الأنبياء الذين لقيهم النبي ﷺ في المعراج', () => {
    test('لقي النبي ﷺ 8 أنبياء في المعراج', () => {
      expect(israMiraj.prophets_encountered.size).toBe(8);
    });

    test('آدم في السماء الأولى', () => {
      const adam = israMiraj.prophets_encountered.get('ADAM');
      expect(adam.heaven).toBe(1);
      expect(adam.title).toContain('أبو البشر');
    });

    test('موسى في السماء السادسة', () => {
      const musa = israMiraj.prophets_encountered.get('MUSA');
      expect(musa.heaven).toBe(6);
      expect(musa.lesson).toContain('تخفيض');
    });

    test('يوسف في السماء الثالثة', () => {
      const yusuf = israMiraj.prophets_encountered.get('YUSUF');
      expect(yusuf.heaven).toBe(3);
    });

    test('إبراهيم في السماء السابعة', () => {
      const ibrahim = israMiraj.prophets_encountered.get('IBRAHIM');
      expect(ibrahim.heaven).toBe(7);
      expect(ibrahim.title).toContain('خليل الله');
    });

    test('كل نبي له درس مستخلص', () => {
      israMiraj.prophets_encountered.forEach(prophet => {
        expect(prophet.lesson).toBeDefined();
        expect(prophet.lesson.length).toBeGreaterThan(0);
      });
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 5. المنح الإلهية
  // ══════════════════════════════════════════════════════════════
  describe('المنح الإلهية في المعراج', () => {
    test('المنح الإلهية مسجلة — 5 منح أو أكثر', () => {
      expect(israMiraj.divine_gifts.size).toBeGreaterThanOrEqual(5);
    });

    test('فريضة الصلاة الخمس مسجلة كمنحة إلهية', () => {
      const salah = israMiraj.divine_gifts.get('SALAH_5');
      expect(salah).toBeDefined();
      expect(salah.name).toContain('الصلاة');
      expect(salah.impact).toBe('FOUNDATIONAL_PILLAR');
    });

    test('خواتيم البقرة مسجلة كمنحة إلهية', () => {
      const closing = israMiraj.divine_gifts.get('QURAN_CLOSING');
      expect(closing).toBeDefined();
      expect(closing.reference).toContain('مسلم');
    });

    test('إمامة الأنبياء منحة مسجلة', () => {
      const leadership = israMiraj.divine_gifts.get('LEADERSHIP_OF_PROPHETS');
      expect(leadership).toBeDefined();
      expect(leadership.impact).toBe('PROPHETIC_SUPREMACY');
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 6. ما رأى النبي ﷺ
  // ══════════════════════════════════════════════════════════════
  describe('مشاهد النبي ﷺ في الإسراء والمعراج', () => {
    test('مشاهد الإسراء تشمل 10 مشاهد أو أكثر', () => {
      expect(israMiraj.prophetic_sights.size).toBeGreaterThanOrEqual(10);
    });

    test('الجنة والنار مشاهد مسجلة', () => {
      expect(israMiraj.prophetic_sights.has('PARADISE_JANNAH')).toBe(true);
      expect(israMiraj.prophetic_sights.has('HELLFIRE_JAHANNAM')).toBe(true);
    });

    test('عقاب آكلي الربا مشهد مسجل', () => {
      const riba = israMiraj.prophetic_sights.get('RIBA_PUNISHERS');
      expect(riba.category).toBe('SINS_CONSEQUENCES');
    });

    test('كل مشهد له درس وتصنيف', () => {
      israMiraj.prophetic_sights.forEach(sight => {
        expect(sight.lesson).toBeDefined();
        expect(sight.category).toBeDefined();
      });
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 7. علامات الساعة الصغرى
  // ══════════════════════════════════════════════════════════════
  describe('علامات الساعة الصغرى', () => {
    test('علامات الساعة الصغرى مسجلة — 20 علامة أو أكثر', () => {
      expect(israMiraj.signs_minor.size).toBeGreaterThanOrEqual(20);
    });

    test('وفاة النبي ﷺ أولى العلامات ومتحققة', () => {
      const death = israMiraj.signs_minor.get('DEATH_PROPHET');
      expect(death.status).toBe('FULFILLED');
    });

    test('فتح بيت المقدس علامة متحققة', () => {
      const conquest = israMiraj.signs_minor.get('CONQUEST_JERUSALEM');
      expect(conquest.status).toBe('FULFILLED');
    });

    test('انتشار الربا علامة جارية', () => {
      const riba = israMiraj.signs_minor.get('RIBA_EVERYWHERE');
      expect(riba.status).toBe('ONGOING');
    });

    test('ظهور الفرات عن جبل ذهب علامة معلقة', () => {
      const euphrates = israMiraj.signs_minor.get('EUPHRATES_GOLD');
      expect(euphrates.status).toBe('PENDING');
    });

    test('قياس تقدم العلامات يعمل بشكل صحيح', () => {
      const progress = israMiraj.measureSignsProgress();
      expect(progress.minor_signs.total).toBeGreaterThan(0);
      expect(progress.minor_signs.fulfilled).toBeGreaterThan(0);
      expect(progress.minor_signs.ongoing).toBeGreaterThan(0);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 8. علامات الساعة الكبرى
  // ══════════════════════════════════════════════════════════════
  describe('علامات الساعة الكبرى — العشرة الكبار', () => {
    test('علامات الساعة الكبرى 10 علامات', () => {
      expect(israMiraj.signs_major.size).toBe(10);
    });

    test('خروج المهدي العلامة الأولى الكبرى', () => {
      const mahdi = israMiraj.signs_major.get('AL_MAHDI');
      expect(mahdi.order).toBe(1);
      expect(mahdi.status).toBe('PENDING');
    });

    test('الدجال العلامة الثانية', () => {
      const dajjal = israMiraj.signs_major.get('DAJJAL');
      expect(dajjal.order).toBe(2);
    });

    test('نزول عيسى عليه السلام العلامة الثالثة', () => {
      const isa = israMiraj.signs_major.get('ISA_DESCENT');
      expect(isa.order).toBe(3);
      expect(isa.events).toBeDefined();
      expect(isa.events.length).toBeGreaterThan(0);
    });

    test('يأجوج ومأجوج العلامة الرابعة', () => {
      const gog = israMiraj.signs_major.get('YAJUJ_MAJUJ');
      expect(gog.order).toBe(4);
      expect(gog.reference).toContain('الكهف');
    });

    test('نفخ الصور العلامة الأخيرة — العاشرة', () => {
      const trumpet = israMiraj.signs_major.get('TRUMPET_BLAST');
      expect(trumpet.order).toBe(10);
    });

    test('جميع العلامات الكبرى لم تتحقق بعد', () => {
      const progress = israMiraj.measureSignsProgress();
      expect(progress.major_signs.all_pending).toBe(true);
    });

    test('طلوع الشمس من المغرب يُغلق باب التوبة', () => {
      const sun = israMiraj.signs_major.get('SUN_FROM_WEST');
      expect(sun.impact).toContain('التوبة');
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 9. أهداف النبي ﷺ
  // ══════════════════════════════════════════════════════════════
  describe('أهداف النبي ﷺ في حياته وبعثته', () => {
    test('أهداف النبي ﷺ مسجلة — 12 هدف أو أكثر', () => {
      expect(israMiraj.prophetic_goals.size).toBeGreaterThanOrEqual(12);
    });

    test('حفظ القرآن هدف محقق مستمر', () => {
      const quran = israMiraj.prophetic_goals.get('QURAN_PRESERVATION');
      expect(quran.status).toBe('FULFILLED_ONGOING');
    });

    test('نشر التوحيد هدف في تقدم', () => {
      const tawheed = israMiraj.prophetic_goals.get('TAWHEED_SPREAD');
      expect(tawheed.status).toBe('IN_PROGRESS');
      expect(tawheed.metric).toBeDefined();
    });

    test('تحرير المسجد الأقصى هدف عاجل', () => {
      const aqsa = israMiraj.prophetic_goals.get('MASJID_AQSA_LIBERATION');
      expect(aqsa.urgency).toBe('CRITICAL');
    });

    test('إقامة العدل ورفع الظلم هدف نبوي محوري', () => {
      const justice = israMiraj.prophetic_goals.get('JUSTICE_ESTABLISHMENT');
      expect(justice.reference).toContain('النحل');
    });

    test('الرحمة للعالمين هدف مرجعه الآية 21:107', () => {
      const mercy = israMiraj.prophetic_goals.get('MERCY_TO_ALL_WORLDS');
      expect(mercy.reference).toContain('21:107');
    });

    test('قياس تقدم الأهداف النبوية يعمل', () => {
      const progress = israMiraj.measurePropheticGoalsProgress();
      expect(progress.total).toBeGreaterThan(0);
      expect(progress.in_progress).toBeGreaterThan(0);
      expect(progress.critical.length).toBeGreaterThan(0);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 10. السنة النبوية المصنفة
  // ══════════════════════════════════════════════════════════════
  describe('السنة النبوية المصنفة', () => {
    test('تصنيفات السنة مسجلة — 8 تصنيفات', () => {
      expect(israMiraj.sunnah_registry.size).toBe(8);
    });

    test('سنن الصلاة مسجلة', () => {
      expect(israMiraj.sunnah_registry.has('SALAH_SUNNAH')).toBe(true);
    });

    test('سنن الحكم والقيادة مسجلة', () => {
      expect(israMiraj.sunnah_registry.has('GOVERNANCE_SUNNAH')).toBe(true);
    });

    test('السنن الفردية في محرك السنة مسجلة', () => {
      expect(sunnahEngine.individual_sunnah.size).toBeGreaterThanOrEqual(7);
    });

    test('قيام الليل سنة فردية مسجلة', () => {
      expect(sunnahEngine.individual_sunnah.has('TAHAJJUD')).toBe(true);
      const tahajjud = sunnahEngine.individual_sunnah.get('TAHAJJUD');
      expect(tahajjud.reference).toContain('الإسراء');
    });

    test('الاستغفار اليومي سنة مسجلة', () => {
      const tawbah = sunnahEngine.individual_sunnah.get('TAWBAH_DAILY');
      expect(tawbah).toBeDefined();
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 11. السنن الاجتماعية والحوكمة
  // ══════════════════════════════════════════════════════════════
  describe('السنن الاجتماعية والحوكمة والاقتصاد', () => {
    test('السنن الاجتماعية مسجلة — 6 سنن أو أكثر', () => {
      expect(sunnahEngine.social_sunnah.size).toBeGreaterThanOrEqual(6);
    });

    test('كفالة اليتيم سنة اجتماعية مسجلة', () => {
      const orphan = sunnahEngine.social_sunnah.get('ORPHAN_CARE');
      expect(orphan.reference).toContain('البخاري');
    });

    test('سنن الحوكمة تتضمن الشورى والعدل', () => {
      expect(sunnahEngine.governance_sunnah.has('SHURA_SYSTEM')).toBe(true);
      expect(sunnahEngine.governance_sunnah.has('JUSTICE_SYSTEM')).toBe(true);
    });

    test('نظام الزكاة سنة اقتصادية مسجلة', () => {
      const zakat = sunnahEngine.economic_sunnah.get('ZAKAT_SYSTEM');
      expect(zakat.beneficiaries).toBe(8);
      expect(zakat.rate).toContain('2.5%');
    });

    test('تحريم الربا سنة اقتصادية مسجلة', () => {
      expect(sunnahEngine.economic_sunnah.has('PROHIBITION_RIBA')).toBe(true);
    });

    test('نظام الوقف الإسلامي سنة اقتصادية', () => {
      const waqf = sunnahEngine.economic_sunnah.get('WAQF_SYSTEM');
      expect(waqf.reference).toContain('صدقة جارية');
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 12. إرث الخلفاء الراشدين
  // ══════════════════════════════════════════════════════════════
  describe('إرث الخلفاء الراشدين المهديين', () => {
    test('الخلفاء الراشدون الأربعة مسجلون', () => {
      expect(israMiraj.caliphs_legacy.size).toBe(4);
    });

    test('أبو بكر الصديق مسجل بإنجازاته', () => {
      const abu_bakr = israMiraj.caliphs_legacy.get('ABU_BAKR_SIDDIQ');
      expect(abu_bakr.title).toContain('الصديق');
      expect(abu_bakr.achievements.length).toBeGreaterThan(0);
    });

    test('عمر الفاروق مسجل بإنجازاته وعدله', () => {
      const umar = israMiraj.caliphs_legacy.get('UMAR_IBN_KHATTAB');
      expect(umar.title).toContain('الفاروق');
      expect(umar.impact_score).toBe(10);
    });

    test('عثمان مسجل بإنجاز توحيد المصحف', () => {
      const uthman = israMiraj.caliphs_legacy.get('UTHMAN_IBN_AFFAN');
      expect(uthman.achievements.some(a => a.includes('القرآن'))).toBe(true);
    });

    test('علي مسجل بإنجاز العلم والقضاء', () => {
      const ali = israMiraj.caliphs_legacy.get('ALI_IBN_ABI_TALIB');
      expect(ali.title).toContain('باب مدينة العلم');
    });

    test('تطبيقات الخلفاء في محرك السنة مسجلة', () => {
      expect(sunnahEngine.caliph_implementations.size).toBeGreaterThanOrEqual(6);
    });

    test('جمع القرآن تطبيق أبي بكر مسجل', () => {
      const quran = sunnahEngine.caliph_implementations.get('ABU_BAKR_QURAN');
      expect(quran.impact).toBe('PRESERVATION_OF_REVELATION');
    });

    test('توحيد المصحف تطبيق عثمان مسجل', () => {
      const mushaf = sunnahEngine.caliph_implementations.get('UTHMAN_MUSHAF');
      expect(mushaf.copies_sent).toBe(7);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 13. مقاييس الأمة الإسلامية
  // ══════════════════════════════════════════════════════════════
  describe('مقاييس الأمة الإسلامية', () => {
    test('مقاييس الأمة مسجلة — 8 مقاييس أو أكثر', () => {
      expect(israMiraj.ummah_metrics.size).toBeGreaterThanOrEqual(8);
    });

    test('عدد المسلمين في العالم مسجل', () => {
      const pop = israMiraj.ummah_metrics.get('UMMAH_POPULATION');
      expect(pop.current).toBeGreaterThan(1000000000);
    });

    test('عدد المساجد في العالم مسجل', () => {
      const mosques = israMiraj.ummah_metrics.get('MOSQUES_COUNT');
      expect(mosques.current).toBeGreaterThan(1000000);
    });

    test('حفظة القرآن مسجلون', () => {
      const hafiz = israMiraj.ummah_metrics.get('QURAN_MEMORIZERS');
      expect(hafiz.current).toBeGreaterThan(1000000);
    });

    test('الكتب الستة مسجلة بعدد أحاديثها', () => {
      const hadith = israMiraj.ummah_metrics.get('HADITH_BOOKS');
      expect(hadith.major_collections).toBe(6);
      expect(hadith.names).toContain('البخاري');
      expect(hadith.names).toContain('مسلم');
    });

    test('نسبة تحقق العلامات الصغرى مسجلة', () => {
      const signs = israMiraj.ummah_metrics.get('SIGNS_FULFILLED');
      expect(signs.total_minor).toBeGreaterThan(0);
      expect(signs.percentage_fulfilled).toBeGreaterThan(50);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 14. محركات التفعيل والقياس
  // ══════════════════════════════════════════════════════════════
  describe('محركات التفعيل والرصد والقياس', () => {
    test('محركات التفعيل مسجلة — 5 محركات أو أكثر', () => {
      expect(sunnahEngine.activation_engines.size).toBeGreaterThanOrEqual(5);
    });

    test('محرك رصد علامات الساعة مسجل', () => {
      expect(sunnahEngine.activation_engines.has('SIGNS_MONITOR')).toBe(true);
    });

    test('محرك نبض الأمة مسجل', () => {
      expect(sunnahEngine.activation_engines.has('UMMAH_PULSE')).toBe(true);
    });

    test('محرك أهداف النبي ﷺ مسجل', () => {
      const goals_engine = sunnahEngine.activation_engines.get('PROPHETIC_GOALS_ENGINE');
      expect(goals_engine.priority).toContain('CRITICAL');
    });

    test('محرك مخطط الخلفاء الراشدين مسجل', () => {
      const blueprint = sunnahEngine.activation_engines.get('CALIPHS_BLUEPRINT');
      expect(blueprint.blueprint_elements.length).toBeGreaterThan(0);
    });

    test('نماذج القياس مسجلة — 4 نماذج أو أكثر', () => {
      expect(sunnahEngine.measurement_models.size).toBeGreaterThanOrEqual(4);
    });

    test('مؤشر الإيمان نموذج قياسي', () => {
      const iman = sunnahEngine.measurement_models.get('IMAN_INDEX');
      expect(iman.components.length).toBeGreaterThan(0);
      expect(iman.scale).toBe('0-100');
    });

    test('مؤشر الحوكمة الراشدة يقيس بمعيار عمر', () => {
      const rashidi = sunnahEngine.measurement_models.get('RASHIDI_INDEX');
      expect(rashidi.benchmark).toContain('عمر');
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 15. التكامل الشامل — النظام الكامل
  // ══════════════════════════════════════════════════════════════
  describe('التكامل الشامل — الرؤية النبوية الكاملة', () => {
    test('getFullStatus يعيد هيكلاً كاملاً', () => {
      const status = israMiraj.getFullStatus();
      expect(status.isra_journey).toBeDefined();
      expect(status.miraj_structure).toBeDefined();
      expect(status.signs_of_hour).toBeDefined();
      expect(status.prophetic_mission).toBeDefined();
      expect(status.ummah_metrics).toBeDefined();
      expect(status.quranic_references).toBeDefined();
    });

    test('المراجع القرآنية مرفقة بالنظام', () => {
      const status = israMiraj.getFullStatus();
      expect(status.quranic_references.isra).toContain('17:1');
      expect(status.quranic_references.miraj).toContain('53:');
      expect(status.quranic_references.mission).toContain('21:107');
    });

    test('عدد الأنبياء الملقيين في وضع النظام', () => {
      const status = israMiraj.getFullStatus();
      expect(status.miraj_structure.prophets_met).toBe(8);
    });

    test('عدد العلامات الكبرى في وضع النظام', () => {
      const status = israMiraj.getFullStatus();
      expect(status.signs_of_hour.major_total).toBe(10);
    });

    test('عدد أهداف النبي في وضع النظام', () => {
      const status = israMiraj.getFullStatus();
      expect(status.prophetic_mission.goals_total).toBeGreaterThanOrEqual(12);
    });

    test('getEngineStatus يعيد هيكلاً كاملاً لمحرك السنة', () => {
      const status = sunnahEngine.getEngineStatus();
      expect(status.sunnah_structure.total_sunnah).toBeGreaterThan(0);
      expect(status.caliphs.caliphs_covered).toBe(4);
      expect(status.engines).toBeGreaterThan(0);
      expect(status.measurement_models).toBeGreaterThan(0);
    });

    test('كلا النظامين يتشاركان نفس المراجع الزمنية', () => {
      const s1 = israMiraj.getFullStatus();
      const s2 = sunnahEngine.getEngineStatus();
      expect(s1.timestamp).toBeDefined();
      expect(s2.timestamp).toBeDefined();
    });
  });
});
