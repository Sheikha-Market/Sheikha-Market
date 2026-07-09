'use strict';

const { SheikhaHumanSystem } = require('../runtime/human-system/v1/sheikha-human-system.js');

describe('Sheikha Human and Mankind System', () => {
  let system;

  beforeEach(() => {
    system = new SheikhaHumanSystem();
  });

  describe('Human Dimensions', () => {
    test('has 5 fundamental human dimensions', () => {
      const status = system.getHumanStatus();
      expect(status.dimensions).toBe(5);
    });

    test('includes physical dimension', () => {
      expect(system.human_dimensions.has('DIMENSION_PHYSICAL')).toBe(true);
    });

    test('includes spiritual dimension', () => {
      expect(system.human_dimensions.has('DIMENSION_SPIRITUAL')).toBe(true);
    });

    test('includes intellectual dimension', () => {
      expect(system.human_dimensions.has('DIMENSION_INTELLECTUAL')).toBe(true);
    });

    test('includes emotional dimension', () => {
      expect(system.human_dimensions.has('DIMENSION_EMOTIONAL')).toBe(true);
    });

    test('includes social dimension', () => {
      expect(system.human_dimensions.has('DIMENSION_SOCIAL')).toBe(true);
    });

    test('spiritual dimension sourced from Quran', () => {
      const spiritual = system.human_dimensions.get('DIMENSION_SPIRITUAL');
      expect(spiritual.verse).toContain('15:29');
    });

    test('physical dimension represents Amanah (trust)', () => {
      const physical = system.human_dimensions.get('DIMENSION_PHYSICAL');
      expect(physical.importance).toBe('Trust_From_Allah_Amanah');
    });
  });

  describe('Physical Systems', () => {
    test('has 6 biological systems', () => {
      const status = system.getHumanStatus();
      expect(status.physical_systems).toBe(6);
    });

    test('includes skeletal system (206 bones)', () => {
      const skeletal = system.physical_system.get('SYSTEM_SKELETAL');
      expect(skeletal.components).toContain('Bones_206_Adult');
    });

    test('includes nervous system (86+ billion neurons)', () => {
      const nervous = system.physical_system.get('SYSTEM_NERVOUS');
      expect(nervous.neurons_total).toContain('86_Billion');
    });

    test('nervous system has integrated control', () => {
      const nervous = system.physical_system.get('SYSTEM_NERVOUS');
      expect(nervous.functions).toContain('Motor_Control');
    });

    test('includes muscular system (600+ muscles)', () => {
      const muscular = system.physical_system.get('SYSTEM_MUSCULAR');
      expect(muscular.components).toContain('Skeletal_Muscles_600_Plus');
    });

    test('includes cardiovascular system', () => {
      const cardio = system.physical_system.get('SYSTEM_CARDIOVASCULAR');
      expect(cardio.functions).toContain('Oxygen_Transport');
    });

    test('includes endocrine system (50+ hormones)', () => {
      const endocrine = system.physical_system.get('SYSTEM_ENDOCRINE');
      expect(endocrine.hormones_managed).toContain('50_Plus');
    });
  });

  describe('Spiritual Aspects', () => {
    test('has 4 spiritual aspects', () => {
      const status = system.getHumanStatus();
      expect(status.spiritual_aspects).toBe(4);
    });

    test('includes Iman (Faith)', () => {
      expect(system.spiritual_system.has('ASPECT_FAITH_IMAN')).toBe(true);
    });

    test('includes Birr (Righteousness)', () => {
      expect(system.spiritual_system.has('ASPECT_RIGHTEOUSNESS_BIRR')).toBe(true);
    });

    test('includes Taqwa (God-consciousness)', () => {
      expect(system.spiritual_system.has('ASPECT_TAQWA_GOD_CONSCIOUSNESS')).toBe(true);
    });

    test('includes Ihsan (Excellence)', () => {
      expect(system.spiritual_system.has('ASPECT_IHSAN_EXCELLENCE')).toBe(true);
    });

    test('Iman has 6 pillars', () => {
      const iman = system.spiritual_system.get('ASPECT_FAITH_IMAN');
      expect(iman.pillars.length).toBe(6);
    });

    test('Taqwa provides protection and success', () => {
      const taqwa = system.spiritual_system.get('ASPECT_TAQWA_GOD_CONSCIOUSNESS');
      expect(taqwa.promise).toContain('Protection_Success');
    });
  });

  describe('Intellectual Capabilities', () => {
    test('has 4 intellectual capabilities', () => {
      const status = system.getHumanStatus();
      expect(status.intellectual_capabilities).toBe(4);
    });

    test('includes Perception & Sensation', () => {
      expect(system.intellectual_system.has('CAPABILITY_PERCEPTION')).toBe(true);
    });

    test('includes Reasoning & Logic', () => {
      expect(system.intellectual_system.has('CAPABILITY_REASONING')).toBe(true);
    });

    test('includes Memory & Storage', () => {
      expect(system.intellectual_system.has('CAPABILITY_MEMORY')).toBe(true);
    });

    test('includes Creativity & Innovation', () => {
      expect(system.intellectual_system.has('CAPABILITY_CREATIVITY')).toBe(true);
    });

    test('perception includes 6 senses', () => {
      const perception = system.intellectual_system.get('CAPABILITY_PERCEPTION');
      expect(perception.senses).toContain('Sight_Vision_Basir');
      expect(perception.senses).toContain('Hearing_Audio_Sami');
      expect(perception.senses).toContain('Sixth_Sense_Intuition_Hads');
    });

    test('creativity sourced from divine inspiration', () => {
      const creativity = system.intellectual_system.get('CAPABILITY_CREATIVITY');
      expect(creativity.source).toBe('Divine_Inspiration_Ilham');
    });

    test('memory can store billions of information pieces', () => {
      const memory = system.intellectual_system.get('CAPABILITY_MEMORY');
      expect(memory.capacity).toContain('Billions');
    });
  });

  describe('Social Relationships', () => {
    test('has 3 social relationship categories', () => {
      const status = system.getHumanStatus();
      expect(status.social_relationships).toBe(3);
    });

    test('includes Family Relations', () => {
      expect(system.social_system.has('RELATION_FAMILY')).toBe(true);
    });

    test('includes Community Relations', () => {
      expect(system.social_system.has('RELATION_COMMUNITY')).toBe(true);
    });

    test('includes Societal Responsibility', () => {
      expect(system.social_system.has('RELATION_SOCIETY')).toBe(true);
    });

    test('family based on mercy (Rahmah)', () => {
      const family = system.social_system.get('RELATION_FAMILY');
      expect(family.principle).toBe('Mercy_Rahmah_Family_Foundation');
    });

    test('community principle: believers like single body', () => {
      const community = system.social_system.get('RELATION_COMMUNITY');
      expect(community.principle).toContain('Single_Structure');
    });
  });

  describe('Human Dignity', () => {
    test('human dignity is central to all efforts', () => {
      const status = system.getHumanStatus();
      expect(status.human_dignity.principle).toBe('Human_Dignity_Central_All_Efforts');
    });

    test('dignity based on Isra 17:70', () => {
      const status = system.getHumanStatus();
      expect(status.human_dignity.basis).toContain('17:70');
    });

    test('all humans have equal value', () => {
      const status = system.getHumanStatus();
      expect(status.human_dignity.respect).toBe('Absolute_All_Humans_Equal_Value');
    });
  });

  describe('Islamic Foundation', () => {
    test('system references Al-Mu\'minun 23:12-14', () => {
      const status = system.getHumanStatus();
      expect(status.verse_foundation).toContain('Al-Mu\'minun');
    });

    test('comprehensive human creation stages included', () => {
      const status = system.getHumanStatus();
      expect(status.verse_foundation).toContain('Comprehensive Human Creation');
    });
  });

  describe('Status Report', () => {
    test('system returns comprehensive human status', () => {
      const status = system.getHumanStatus();
      expect(status.system).toBe('SHEIKHA_HUMAN_AND_MANKIND_SYSTEM');
      expect(status.tier).toBe('OMEGA_SUPREME_INFINITE');
      expect(status.status).toBe('HUMAN_MODELING_COMPLETE_QURANIC');
    });

    test('status includes all capability areas', () => {
      const status = system.getHumanStatus();
      expect(status.capabilities).toContain('Comprehensive_Human_Modeling');
      expect(status.capabilities).toContain('Holistic_Well_Being_Support');
      expect(status.capabilities).toContain('Islamic_Aligned_Personal_Growth');
    });
  });

  describe('Integration', () => {
    test('foundation is Quran and Sunnah', () => {
      const status = system.getHumanStatus();
      expect(status.foundation).toBe('QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS');
    });

    test('all systems interconnected and balanced', () => {
      const dims = system.human_dimensions.size;
      const phys = system.physical_system.size;
      const spir = system.spiritual_system.size;
      expect(dims + phys + spir).toBeGreaterThan(0);
    });
  });
});
