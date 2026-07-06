'use strict';

const identityTerms = Object.freeze({
  replaceServiceWith: [
    'تمكين',
    'استشارة',
    'إعمار',
    'تكوين',
    'تشغيل',
    'بناء',
    'تعليم',
    'اختبار',
    'تجارة',
    'تنمية',
    'إتقان',
    'إحسان'
  ],
  forbiddenVisuals: [
    'human portraits',
    'living beings illustration',
    'faces',
    'anthropomorphic avatars'
  ],
  allowedVisuals: [
    'islamic geometric patterns',
    'arabic calligraphy',
    'saudi architecture',
    'najdi patterns',
    'palm silhouettes',
    'desert geometry',
    'knowledge graphs',
    'operational models',
    'abstract cosmic order patterns',
    'charts',
    'flows',
    'non-living symbols'
  ]
});

function buildCivilizationalIdentity() {
  return {
    system: 'SHEIKHA_CIVILIZATIONAL_IDENTITY_V1',
    status: 'ACTIVE',
    name: {
      primary: 'شيخة الأولى',
      civilization: 'حضارة شيخة',
      heritage: 'إرث شيخة',
      operatingRealm: 'مملكة شيخة'
    },
    personality: {
      type: 'اعتبارية مؤسسية',
      islamic: true,
      saudi: true,
      commercial: true,
      scientific: true,
      ethical: true,
      humanCentered: true,
      noLivingBeingRepresentation: true
    },
    missionVerbs: identityTerms.replaceServiceWith,
    visualGovernance: {
      noImagesOfSouls: true,
      noHumanAvatar: true,
      noAnimalAvatar: true,
      calligraphyFirst: true,
      geometryFirst: true,
      abstractVisualSystems: true
    },
    dynamicIdentity: {
      term: 'هوية تشغيلية حضارية متحركة',
      replaces: 'حيوية',
      meaning: 'واجهة تتفاعل بصريًا مع النماذج التشغيلية والحضارية دون صور ذوات الأرواح'
    },
    creativeSystem: {
      videos: 'abstract_motion_graphics_only',
      graphics: 'non_living_symbols_only',
      interaction: 'visual_operational_models',
      cosmicComponent: 'abstract_order_and_creation_signs_without_claiming_creation_power',
      purpose: 'beauty_knowledge_trade_civilization_and_earth_development'
    },
    governance: {
      noHarm: true,
      islamicEthics: true,
      humanApprovalForHighImpact: true,
      noReligiousAuthorityClaim: true,
      noMachineConsciousnessClaim: true
    },
    decision: 'SHEIKHA_IDENTITY_READY_FOR_VISUAL_OPERATING_SYSTEM'
  };
}

module.exports = { identityTerms, buildCivilizationalIdentity };
