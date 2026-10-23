'use strict';

const CULTIVATION_STAGES = Object.freeze([
  'SOIL_PREPARATION',
  'SEED_REGISTRATION',
  'NURSERY_EXPERIMENT',
  'TRANSPLANT_OR_GRAFT',
  'MEASURED_IRRIGATION',
  'PRUNING_AND_CORRECTION',
  'VERIFIED_HARVEST',
  'CONTROLLED_PROPAGATION'
]);

const CULTIVATION_PATHS = Object.freeze({
  SEED_FROM_SCRATCH: {
    sourceAr: 'بذرة مملوكة أو منشأة من الصفر',
    speed: 'LONG',
    requirement: 'OWNED_OR_PERMISSIVELY_LICENSED_FOUNDATIONS'
  },
  LICENSED_TRANSPLANT: {
    sourceAr: 'أصل نام مرخص يعاد غرسه وتكييفه',
    speed: 'FAST',
    requirement: 'UPSTREAM_LICENSE_AND_PROVENANCE_VERIFIED'
  },
  GOVERNED_GRAFT: {
    sourceAr: 'تطعيم أصل مرخص بأدوات أو بيانات أو موائمات شيخة',
    speed: 'FASTEST_CONTROLLED',
    requirement: 'COMPATIBILITY_RIGHTS_AND_EVALUATION_VERIFIED'
  }
});

const CULTIVATION_LAWS = Object.freeze([
  'التربة هي البنية والحقوق والأمن والبيانات؛ لا غرس في تربة مجهولة.',
  'كل بذرة تسجل بمالك وغرض ومصدر وترخيص ومؤشر منفعة.',
  'الزارع دور مسؤول معلوم، ولا تمنح الآلة سلطة بشرية أو شرعية مستقلة.',
  'السقاية موارد محسوبة: وقت وحوسبة وبيانات ومال ومراجعة، وليست تشغيلًا بلا حدود.',
  'لا حصاد تجاري قبل اختبار الجودة والسلامة والحقوق وقابلية التسليم.',
  'لا تكاثر آلي لمنتج أو نموذج فاشل أو مجهول الترخيص.',
  'التقليم تصحيح موثق قابل للتراجع، لا حذف لأعمال المستخدم أو الأدلة.',
  'توقف مغرس لبوابة صحيحة لا يوقف المراعي الأخرى الجاهزة.',
  'لا يمثل هذا النموذج الجنة الغيبية؛ الجنات والمراعي أسماء تشغيلية دنيوية.',
  'لا ضرر ولا ادعاء اكتمال أو دخل أو علم لم يثبت بالدليل.'
]);

const INTEGRATED_HABITAT_DOMAINS = Object.freeze([
  {
    id: 'HUMAN_COMMUNITY',
    nameAr: 'مجتمع الإنسان والأسرة',
    includesAr: ['سكن', 'عمل', 'تعليم', 'عبادة', 'صحة', 'ضيافة', 'ترفيه مباح'],
    gate: 'ACCESSIBILITY_SAFETY_PRIVACY_AND_PUBLIC_SERVICES_APPROVED'
  },
  {
    id: 'FOOD_ORCHARDS',
    nameAr: 'بساتين ومحاصيل الغذاء',
    includesAr: ['نخيل وفاكهة', 'حبوب', 'خضروات', 'أعشاب', 'مشتل وبنك بذور'],
    gate: 'SOIL_WATER_CROP_AND_FOOD_SAFETY_PLAN_APPROVED'
  },
  {
    id: 'GRAZING_PASTURES',
    nameAr: 'مراعي الرعي والثروة الحيوانية',
    includesAr: ['مراع دورية', 'أعلاف', 'ماء للحيوان', 'ظل ومأوى', 'رعاية بيطرية'],
    gate: 'CARRYING_CAPACITY_ROTATION_AND_ANIMAL_WELFARE_APPROVED'
  },
  {
    id: 'WATER_NETWORK',
    nameAr: 'الأنهار والمياه',
    includesAr: ['مياه شرب', 'ري', 'خزانات', 'قنوات أو مجار مائية', 'صرف وإعادة استخدام'],
    gate: 'HYDROLOGY_QUALITY_RIGHTS_DRAINAGE_AND_FLOOD_PLAN_APPROVED'
  },
  {
    id: 'HOMES_AND_PALACES',
    nameAr: 'البيوت والدور والقصور الدنيوية',
    includesAr: ['بيوت ميسرة', 'مساكن أسرية', 'دور ضيافة', 'مبان عامة', 'قصور ضمن القدرة والأنظمة'],
    gate: 'LAND_TITLE_CODE_STRUCTURE_FIRE_AND_LIFECYCLE_COST_APPROVED'
  },
  {
    id: 'ECOLOGICAL_COMMONS',
    nameAr: 'المشاعات البيئية',
    includesAr: ['غابات وأحزمة خضراء', 'موائل', 'تربة حية', 'ملقحات', 'ممرات ومتنزهات'],
    gate: 'BIODIVERSITY_NATIVE_SPECIES_AND_INVASIVE_RISK_APPROVED'
  },
  {
    id: 'CIRCULAR_UTILITIES',
    nameAr: 'المرافق الدائرية',
    includesAr: ['طاقة', 'تبريد', 'نفايات', 'سماد عضوي', 'نقل واتصال'],
    gate: 'UTILITY_CAPACITY_EMISSIONS_RESILIENCE_AND_MAINTENANCE_APPROVED'
  }
]);

const DEFAULT_PLANNING_ASSUMPTIONS = Object.freeze({
  domesticWaterLitersPerPersonDay: 100,
  foodKgPerPersonDay: 0.8,
  electricityKwhPerPersonDay: 8,
  grossHousingM2PerPerson: 35,
  irrigationLitersPerCultivatedM2Day: 4,
  livestockWaterLitersPerHeadDay: 35,
  reserveFactor: 0.2,
  landAllocation: Object.freeze({
    housingAndServices: 0.2,
    foodOrchardsAndCrops: 0.25,
    grazingPastures: 0.3,
    ecologicalCommons: 0.15,
    waterAndUtilities: 0.1
  })
});

const AFTERLIFE_REFERENCE_REGISTRY = Object.freeze([
  {
    id: 'QURAN_03_015',
    topicAr: 'جنات وأنهار ورضوان الله',
    type: 'QURAN_REFERENCE',
    explanatoryTextApproved: false
  },
  {
    id: 'QURAN_09_072',
    topicAr: 'جنات ومساكن طيبة ورضوان الله',
    type: 'QURAN_REFERENCE',
    explanatoryTextApproved: false
  },
  {
    id: 'QURAN_32_017',
    topicAr: 'نعيم أخفي عن علم البشر',
    type: 'QURAN_REFERENCE',
    explanatoryTextApproved: false
  },
  {
    id: 'QURAN_43_071',
    topicAr: 'ما تشتهيه الأنفس وتلذ الأعين',
    type: 'QURAN_REFERENCE',
    explanatoryTextApproved: false
  },
  {
    id: 'QURAN_47_015',
    topicAr: 'مثل الجنة والأنهار المذكورة في القرآن',
    type: 'QURAN_REFERENCE',
    explanatoryTextApproved: false
  },
  {
    id: 'QURAN_65_012',
    topicAr: 'سبع سماوات ومن الأرض مثلهن',
    type: 'QURAN_REFERENCE',
    explanatoryTextApproved: false
  },
  {
    id: 'QURAN_76_012_022',
    topicAr: 'الجنة والنعيم والشراب والجزاء',
    type: 'QURAN_REFERENCE_RANGE',
    explanatoryTextApproved: false
  }
]);

const SACRED_UNSEEN_BOUNDARY = Object.freeze({
  system: 'SHEIKHA_SACRED_UNSEEN_REFERENCE_BOUNDARY_V1',
  purposeAr:
    'إثبات المراجع للتذكير وطلب الجنة والدعاء دون تحويل الغيب إلى نموذج هندسي.',
  afterlifeIsBetterThanWorldlyDesign: true,
  actualJannahSimulationAllowed: false,
  unseenGeometryOrPhysicsInferred: false,
  worldlyNamesProveAfterlifeLikeness: false,
  generatedSacredImageryIsAuthoritative: false,
  automatedTafsirOrFatwa: false,
  qualifiedScholarReviewRequired: true,
  directCitationTextRequiresSourceVerification: true,
  references: AFTERLIFE_REFERENCE_REGISTRY
});

function buildWorldlyCosmicScope() {
  return {
    system: 'SHEIKHA_WORLDLY_COSMIC_SCOPE_V1',
    status: 'TAXONOMY_ONLY_NOT_UNIVERSAL_OPERATIONAL_COVERAGE',
    scopes: [
      {
        id: 'EARTH_LOCAL',
        nameAr: 'المواقع والمدن والأقاليم على الأرض',
        operationalWhen: 'SITE_DATA_RIGHTS_INFRASTRUCTURE_AND_PERMITS_EXIST'
      },
      {
        id: 'EARTH_GLOBAL',
        nameAr: 'التنسيق العالمي للأرض',
        operationalWhen: 'JURISDICTION_PROVIDER_AND_DATA_AGREEMENTS_EXIST'
      },
      {
        id: 'NEAR_SPACE',
        nameAr: 'المدارات والاتصالات الفضائية القريبة',
        operationalWhen: 'LICENSED_SPACE_PROVIDER_GROUND_STATION_AND_PROTOCOL_EXIST'
      },
      {
        id: 'OBSERVED_COSMOS',
        nameAr: 'المعرفة الفلكية عن الكون المرصود',
        operationalWhen: 'VERIFIED_SCIENTIFIC_DATA_AND_INSTRUMENT_EVIDENCE_EXIST'
      },
      {
        id: 'UNSEEN_HEAVENS_AND_EARTHS',
        nameAr: 'السماوات والأرضون في المرجع الشرعي',
        operationalWhen: 'NEVER_AN_ENGINEERING_OR_CONTROL_CLAIM'
      }
    ],
    laws: [
      'لا تتحول عالمية الاسم إلى ادعاء تغطية تقنية لكل الكون.',
      'يمتد التشغيل فقط إلى مورد واتصال وعقد ودليل مثبت.',
      'العلم الفلكي المرصود يفصل عن الخبر الشرعي المتعلق بالغيب.',
      'لا سلطة للنظام على السماء أو الأرض أو البشر؛ يقدم أدوات محكومة فقط.'
    ],
    sacredBoundary: SACRED_UNSEEN_BOUNDARY
  };
}

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function buildHabitatResourceBalance(input = {}) {
  const assumptions = {
    ...DEFAULT_PLANNING_ASSUMPTIONS,
    ...(input.assumptions || {}),
    landAllocation: {
      ...DEFAULT_PLANNING_ASSUMPTIONS.landAllocation,
      ...(input.assumptions?.landAllocation || {})
    }
  };
  const population = Number(input.populationTarget || 0);
  const siteAreaM2 = Number(input.siteAreaM2 || 0);
  const livestockHeads = Number(input.livestockHeads || 0);
  const errors = [];
  const allocationTotal = Object.values(assumptions.landAllocation)
    .reduce((sum, value) => sum + Number(value), 0);

  if (population <= 0) errors.push('POSITIVE_POPULATION_REQUIRED');
  if (siteAreaM2 <= 0) errors.push('POSITIVE_SITE_AREA_REQUIRED');
  if (livestockHeads < 0) errors.push('NON_NEGATIVE_LIVESTOCK_REQUIRED');
  if (Math.abs(allocationTotal - 1) > 0.000001) {
    errors.push('LAND_ALLOCATION_MUST_EQUAL_ONE');
  }
  if (assumptions.reserveFactor < 0) {
    errors.push('NON_NEGATIVE_RESERVE_FACTOR_REQUIRED');
  }

  if (errors.length > 0) {
    return {
      system: 'SHEIKHA_HABITAT_RESOURCE_BALANCE_V1',
      status: 'INVALID_PLANNING_INPUT',
      errors,
      assumptions,
      engineeringApproved: false
    };
  }

  const areasM2 = Object.fromEntries(
    Object.entries(assumptions.landAllocation).map(([key, fraction]) => [
      key,
      round(siteAreaM2 * fraction)
    ])
  );
  const domesticWater = population *
    assumptions.domesticWaterLitersPerPersonDay;
  const irrigationWater = areasM2.foodOrchardsAndCrops *
    assumptions.irrigationLitersPerCultivatedM2Day;
  const livestockWater = livestockHeads *
    assumptions.livestockWaterLitersPerHeadDay;
  const baseWater = domesticWater + irrigationWater + livestockWater;
  const housingDemand = population * assumptions.grossHousingM2PerPerson;

  return {
    system: 'SHEIKHA_HABITAT_RESOURCE_BALANCE_V1',
    status: housingDemand <= areasM2.housingAndServices
      ? 'PLANNING_SCENARIO_BALANCED_FOR_AREA_ONLY'
      : 'PLANNING_SCENARIO_AREA_DEFICIT',
    planningScenarioOnly: true,
    assumptions,
    inputs: { population, siteAreaM2, livestockHeads },
    areasM2,
    dailyDemand: {
      domesticWaterLiters: round(domesticWater),
      irrigationWaterLiters: round(irrigationWater),
      livestockWaterLiters: round(livestockWater),
      totalWaterWithReserveLiters: round(
        baseWater * (1 + assumptions.reserveFactor)
      ),
      foodKg: round(population * assumptions.foodKgPerPersonDay),
      electricityKwh: round(
        population * assumptions.electricityKwhPerPersonDay *
          (1 + assumptions.reserveFactor)
      )
    },
    housing: {
      grossDemandM2: round(housingDemand),
      allocatedM2: areasM2.housingAndServices,
      areaMarginM2: round(areasM2.housingAndServices - housingDemand)
    },
    unresolvedEngineeringInputs: [
      'CLIMATE_AND_EVAPOTRANSPIRATION',
      'CROP_MIX_AND_YIELD',
      'SOIL_INFILTRATION_AND_SALINITY',
      'WATER_SOURCE_YIELD_AND_QUALITY',
      'PASTURE_CARRYING_CAPACITY',
      'BUILDING_DENSITY_AND_CODE',
      'ENERGY_LOAD_PROFILE_AND_GENERATION',
      'CAPEX_OPEX_AND_MAINTENANCE'
    ],
    engineeringApproved: false
  };
}

function buildHabitatPhases() {
  return [
    {
      id: 'H0_BASELINE',
      scopeAr: 'حقوق الأرض والمسح والماء والتربة والمناخ والسيول والسكان',
      exitGate: 'BASELINE_STUDIES_AND_RIGHTS_APPROVED'
    },
    {
      id: 'H1_LIVING_NUCLEUS',
      scopeAr: 'نواة سكن وخدمات وماء وطاقة وصرف وطوارئ',
      exitGate: 'OCCUPANCY_AND_UTILITY_SAFETY_ACCEPTED'
    },
    {
      id: 'H2_FOOD_NURSERY',
      scopeAr: 'مشتل وبنك بذور ومحاصيل تجريبية وتتبّع غذائي',
      exitGate: 'ONE_SEASON_YIELD_WATER_AND_FOOD_SAFETY_EVIDENCE'
    },
    {
      id: 'H3_ROTATIONAL_PASTURE',
      scopeAr: 'مرعى دوري محدود ومأوى وماء ورعاية بيطرية',
      exitGate: 'CARRYING_CAPACITY_AND_ANIMAL_WELFARE_ACCEPTED'
    },
    {
      id: 'H4_ORCHARDS_AND_COMMONS',
      scopeAr: 'بساتين دائمة وأحزمة خضراء وموائل ومسارات عامة',
      exitGate: 'SURVIVAL_BIODIVERSITY_AND_MAINTENANCE_TARGETS_MET'
    },
    {
      id: 'H5_HOMES_AND_HOSPITALITY',
      scopeAr: 'توسع المساكن ودور الضيافة والمباني العامة والقصور المعتمدة',
      exitGate: 'DEMAND_FINANCE_CODE_AND_LIFECYCLE_COST_ACCEPTED'
    },
    {
      id: 'H6_REGENERATIVE_EXPANSION',
      scopeAr: 'توسع مرحلي لا يتجاوز الماء والتربة والميزانية وسعة التشغيل',
      exitGate: 'INDEPENDENT_MULTI_SEASON_REGENERATIVE_REVIEW'
    }
  ];
}

const ENGINEERING_DISCIPLINES = Object.freeze([
  {
    id: 'MASTER_PLANNING',
    nameAr: 'التخطيط العام واستعمالات الأرض',
    deliverables: ['SITE_BASEMAP', 'LAND_USE_PLAN', 'PHASING_PLAN', 'ACCESS_AND_CIRCULATION_PLAN']
  },
  {
    id: 'AGRONOMY',
    nameAr: 'الزراعة والبساتين والمشاتل',
    deliverables: ['SOIL_AMENDMENT_PLAN', 'CROP_AND_TREE_SCHEDULE', 'NURSERY_PLAN', 'SEASONAL_OPERATIONS_PLAN']
  },
  {
    id: 'PASTURE_AND_VETERINARY',
    nameAr: 'المراعي والثروة الحيوانية',
    deliverables: ['CARRYING_CAPACITY', 'ROTATIONAL_GRAZING_PLAN', 'FEED_BALANCE', 'ANIMAL_WELFARE_AND_BIOSECURITY_PLAN']
  },
  {
    id: 'WATER_AND_CIVIL',
    nameAr: 'المياه والهندسة المدنية',
    deliverables: ['WATER_BALANCE', 'POTABLE_NETWORK', 'IRRIGATION_NETWORK', 'DRAINAGE_AND_FLOOD_MODEL', 'REUSE_NETWORK']
  },
  {
    id: 'ARCHITECTURE_AND_STRUCTURE',
    nameAr: 'العمارة والإنشاء',
    deliverables: ['HOUSING_PROGRAM', 'PUBLIC_BUILDING_PROGRAM', 'STRUCTURAL_BASIS', 'FIRE_AND_EGRESS_PLAN']
  },
  {
    id: 'ENERGY_AND_UTILITIES',
    nameAr: 'الطاقة والمرافق',
    deliverables: ['LOAD_PROFILE', 'GENERATION_AND_STORAGE_PLAN', 'COOLING_PLAN', 'WASTE_AND_COMPOST_PLAN']
  },
  {
    id: 'ENVIRONMENT_AND_RESILIENCE',
    nameAr: 'البيئة والمرونة',
    deliverables: ['BIODIVERSITY_BASELINE', 'NATIVE_SPECIES_PLAN', 'HAZARD_REGISTER', 'EMERGENCY_AND_RECOVERY_PLAN']
  },
  {
    id: 'COST_SCHEDULE_AND_PERMITS',
    nameAr: 'التكلفة والبرنامج والتراخيص',
    deliverables: ['QUANTITY_BASIS', 'CAPEX_OPEX_ESTIMATE', 'PROCUREMENT_PACKAGES', 'PERMIT_MATRIX', 'ACCEPTANCE_SCHEDULE']
  }
]);

function buildWorldlyEngineeringPlan(input = {}) {
  const blueprint = buildIntegratedHabitatBlueprint(input);
  const balance = buildHabitatResourceBalance(input);
  const blockers = [...blueprint.missingInputs];
  if (balance.status === 'INVALID_PLANNING_INPUT') {
    blockers.push(...balance.errors);
  }
  if (!input.topographicSurvey) blockers.push('TOPOGRAPHIC_SURVEY_REQUIRED');
  if (!input.hazardStudy) blockers.push('HAZARD_AND_FLOOD_STUDY_REQUIRED');
  if (!input.authorityHavingJurisdiction) {
    blockers.push('AUTHORITY_AND_PERMIT_JURISDICTION_REQUIRED');
  }

  return {
    system: 'SHEIKHA_WORLDLY_GARDENS_ENGINEERING_PLANNER_V1',
    status: blockers.length > 0
      ? 'ENGINEERING_INPUTS_REQUIRED'
      : (input.evidenceIndependentlyVerified === true
        ? 'ENGINEERING_BASIS_READY_FOR_DISCIPLINE_WORK'
        : 'ENGINEERING_BASIS_DECLARED_REQUIRES_INDEPENDENT_VERIFICATION'),
    scope: 'WORLDLY_PHYSICAL_AND_OPERATIONAL_PLANNING_ONLY',
    sacredLanguageIsolation: {
      afterlifeTextMayGenerateGeometry: false,
      afterlifeTextMayGenerateQuantities: false,
      afterlifeTextMayGenerateMaterialSpecification: false,
      afterlifeTextMayAuthorizeConstruction: false,
      namesAreTextualRemindersOnly: true,
      rule: 'SACRED_UNSEEN_TEXT_NEVER_ENTERS_ENGINEERING_CALCULATION'
    },
    inputs: {
      siteAreaM2: input.siteAreaM2 || null,
      location: input.location || null,
      populationTarget: input.populationTarget || null,
      livestockHeads: input.livestockHeads || 0
    },
    resourceBalance: balance,
    disciplines: ENGINEERING_DISCIPLINES,
    phases: buildHabitatPhases(),
    stageGates: [
      'CONCEPT_10_PERCENT',
      'SCHEMATIC_30_PERCENT',
      'COORDINATED_60_PERCENT',
      'PERMIT_90_PERCENT',
      'ISSUED_FOR_CONSTRUCTION_100_PERCENT',
      'AS_BUILT_AND_COMMISSIONED'
    ],
    qualityRules: [
      'NO_PERCENT_COMPLETE_WITHOUT_NAMED_DELIVERABLES',
      'INDEPENDENT_DISCIPLINE_CHECK_REQUIRED',
      'CROSS_DISCIPLINE_CLASH_REVIEW_REQUIRED',
      'QUANTITIES_TRACE_TO_DRAWINGS_AND_ASSUMPTIONS',
      'CONSTRUCTION_REQUIRES_SIGNED_PROFESSIONAL_APPROVAL',
      'CHANGES_REQUIRE_VERSION_IMPACT_AND_APPROVAL'
    ],
    evidenceIndependentlyVerified:
      input.evidenceIndependentlyVerified === true,
    blockers: unique(blockers),
    issuedForConstruction: false,
    physicalExecutionAuthorized: false
  };
}

function buildIntegratedHabitatBlueprint(input = {}) {
  const missingInputs = [];
  if (!input.siteAreaM2) missingInputs.push('SITE_AREA_REQUIRED');
  if (!input.location) missingInputs.push('LOCATION_AND_CLIMATE_REQUIRED');
  if (!input.populationTarget) missingInputs.push('POPULATION_TARGET_REQUIRED');
  if (!input.waterStudy) missingInputs.push('WATER_STUDY_REQUIRED');
  if (!input.soilStudy) missingInputs.push('SOIL_STUDY_REQUIRED');
  if (!input.budgetEnvelope) missingInputs.push('BUDGET_ENVELOPE_REQUIRED');
  if (!input.landRightsVerified) missingInputs.push('LAND_RIGHTS_REQUIRED');

  return {
    system: 'SHEIKHA_INTEGRATED_WORLDLY_HABITAT_BLUEPRINT_V1',
    status: missingInputs.length === 0
      ? 'CONCEPT_READY_FOR_DISCIPLINE_DESIGN'
      : 'CONCEPT_ONLY_SITE_INPUTS_REQUIRED',
    boundary: {
      actualJannahClaim: false,
      unseenRepresentationClaim: false,
      physicalConstructionExecuted: false,
      unrestrictedHumanDesireEntitlement: false,
      statementAr:
        'بيئة دنيوية للعيش الكريم والمنفعة والرغبات المشروعة ضمن الموارد والحقوق والسلامة.'
    },
    domains: INTEGRATED_HABITAT_DOMAINS,
    waterSeparation: {
      potable: 'INDEPENDENT_TESTED_NETWORK',
      irrigation: 'FIT_FOR_CROP_AND_SOIL_NETWORK',
      livestock: 'VETERINARY_QUALITY_REQUIREMENTS',
      reclaimed: 'RESTRICTED_BY_TREATMENT_CLASS_AND_USE',
      floodAndDrainage: 'MODELED_BEFORE_GRADING_OR_CONSTRUCTION'
    },
    foodLoop: [
      'SEED_AND_BREED_PROVENANCE',
      'SOIL_AND_FEED_PLAN',
      'GROW_AND_GRAZE_BY_CARRYING_CAPACITY',
      'HARVEST_AND_VETERINARY_OR_FOOD_SAFETY_CHECK',
      'STORE_DISTRIBUTE_AND_TRACE',
      'COMPOST_SAFE_ORGANIC_RESIDUES',
      'REPLENISH_SOIL_AND_REMEASURE'
    ],
    designOrder: [
      'LAND_WATER_CLIMATE_AND_POPULATION_BASELINE',
      'RIGHTS_ENVIRONMENTAL_AND_HAZARD_ASSESSMENT',
      'WATER_FOOD_ENERGY_AND_WASTE_BALANCES',
      'PASTURE_ORCHARD_HOUSING_AND_SERVICE_ZONING',
      'DISCIPLINE_ENGINEERING_AND_PERMITS',
      'SMALL_PILOT_AND_ONE_SEASON_MEASUREMENT',
      'PHASED_BUILD_WITH_INDEPENDENT_ACCEPTANCE',
      'OPERATE_MAINTAIN_REGENERATE_AND_EXPAND'
    ],
    phases: buildHabitatPhases(),
    missingInputs,
    automaticConstructionAuthorized: false
  };
}

function unique(items) {
  return [...new Set(items)];
}

function evaluatePlot(input = {}) {
  const blockers = [];
  const path = CULTIVATION_PATHS[input.path];

  if (!input.id) blockers.push('PLOT_ID_REQUIRED');
  if (!input.owner) blockers.push('ACCOUNTABLE_GROWER_REQUIRED');
  if (!path) blockers.push('CULTIVATION_PATH_REQUIRED');
  if (!input.rightsVerified) blockers.push('RIGHTS_AND_LICENSE_REQUIRED');
  if (!input.provenanceVerified) blockers.push('PROVENANCE_REQUIRED');
  if (!input.harmReviewPassed) blockers.push('HARM_REVIEW_REQUIRED');
  if (!input.successMetric) blockers.push('MEASURABLE_BENEFIT_REQUIRED');

  const nurseryReady = blockers.length === 0;
  const harvestBlockers = [...blockers];
  if (!input.qualityEvidence) harvestBlockers.push('QUALITY_EVIDENCE_REQUIRED');
  if (!input.deliveryEvidence) harvestBlockers.push('DELIVERY_EVIDENCE_REQUIRED');
  if (input.commercial && !input.commercialApproval) {
    harvestBlockers.push('COMMERCIAL_APPROVAL_REQUIRED');
  }

  const harvestReady = harvestBlockers.length === 0;
  const propagationBlockers = [...harvestBlockers];
  if (!input.reproducible) propagationBlockers.push('REPRODUCIBILITY_REQUIRED');
  if (!input.unitEconomicsVerified) {
    propagationBlockers.push('UNIT_ECONOMICS_REQUIRED');
  }

  return {
    id: input.id || null,
    nameAr: input.nameAr || input.id || null,
    owner: input.owner || null,
    path: input.path || null,
    pathDefinition: path || null,
    stage: harvestReady ? 'VERIFIED_HARVEST' :
      (nurseryReady ? 'NURSERY_EXPERIMENT' : 'SOIL_PREPARATION'),
    nursery: {
      ready: nurseryReady,
      blockers: unique(blockers)
    },
    harvest: {
      ready: harvestReady,
      blockers: unique(harvestBlockers)
    },
    propagation: {
      allowed: propagationBlockers.length === 0,
      blockers: unique(propagationBlockers)
    },
    continuousOperation: {
      automaticUnboundedTraining: false,
      automaticUnboundedSpending: false,
      recheckAllowed: true,
      safeHoldPreservesOtherPlots: true
    }
  };
}

function buildCultivationSystem(plots = []) {
  const evaluatedPlots = plots.map(evaluatePlot);
  const activePlots = evaluatedPlots.filter((plot) => plot.nursery.ready);
  const harvestReady = evaluatedPlots.filter((plot) => plot.harvest.ready);
  const propagationReady = evaluatedPlots.filter(
    (plot) => plot.propagation.allowed
  );

  return {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_PASTURES_ORCHARDS_CULTIVATION_RUNTIME_V1',
    status: activePlots.length > 0
      ? 'DIVERSIFIED_CULTIVATION_ACTIVE'
      : 'SOIL_PREPARATION_REQUIRED',
    worldlyMetaphorOnly: true,
    stages: CULTIVATION_STAGES,
    paths: CULTIVATION_PATHS,
    laws: CULTIVATION_LAWS,
    topology: {
      soil: 'INFRASTRUCTURE_RIGHTS_SECURITY_DATA',
      seeds: 'IDEAS_DATASETS_CODE_AND_DEMAND_SIGNALS',
      nursery: 'ISOLATED_EXPERIMENTS_AND_CANARIES',
      irrigation: 'SCHEDULED_COMPUTE_FEEDBACK_CAPITAL_AND_MAINTENANCE',
      farmer: 'NAMED_ACCOUNTABLE_HUMAN_OR_GOVERNED_SERVICE_ROLE',
      fruits: 'VERIFIED_BENEFIT_REVENUE_OR_REUSABLE_KNOWLEDGE',
      pastures: 'SHARED_LICENSED_KNOWLEDGE_COMPUTE_AND_TOOLING',
      orchards: 'DOMAIN_PRODUCT_PORTFOLIOS',
      propagation: 'REPEATABLE_RIGHTS_VERIFIED_SCALE_OUT'
    },
    continuityPolicy: {
      scheduler: 'MEASURE_REVIEW_IRRIGATE_PRUNE_RECHECK',
      noGlobalStopForSinglePlot: true,
      blockedPlotMayConsumePaidResources: false,
      highImpactHumanApprovalRequired: true,
      invariant: 'CONTINUE_ELIGIBLE_PLOTS_HOLD_BLOCKED_PLOTS'
    },
    integratedHabitat: buildIntegratedHabitatBlueprint(),
    worldlyCosmicScope: buildWorldlyCosmicScope(),
    metrics: {
      totalPlots: evaluatedPlots.length,
      activePlots: activePlots.length,
      harvestReadyPlots: harvestReady.length,
      propagationReadyPlots: propagationReady.length
    },
    plots: evaluatedPlots
  };
}

module.exports = {
  CULTIVATION_STAGES,
  CULTIVATION_PATHS,
  CULTIVATION_LAWS,
  INTEGRATED_HABITAT_DOMAINS,
  DEFAULT_PLANNING_ASSUMPTIONS,
  ENGINEERING_DISCIPLINES,
  AFTERLIFE_REFERENCE_REGISTRY,
  SACRED_UNSEEN_BOUNDARY,
  buildWorldlyCosmicScope,
  buildHabitatResourceBalance,
  buildHabitatPhases,
  buildWorldlyEngineeringPlan,
  buildIntegratedHabitatBlueprint,
  evaluatePlot,
  buildCultivationSystem
};
