'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const SUPREME = {
  name: 'SHEIKHA_SUPREME_ISLAMIC_GOVERNANCE',
  status: 'ACTIVE',

  highestAuthority: {
    bookOfAllah: true,
    sunnahOfProphetMuhammad: true,
    sunnahOfRightlyGuidedCaliphs: true,
    hadithPrinciple:
      'عليكم بسنتي وسنة الخلفاء الراشدين المهديين'
  },

  roots: {
    tawheed: true,
    islam: true,
    iman: true,
    ihsan: true,
    sharia: true,
    arabicLanguage: true,
    knowledge: true,
    legislation: true,
    civilization: true,
    computeInfrastructure: true
  },

  sciences: {
    quranSciences: true,
    tafsir: true,
    hadithSciences: true,
    fiqh: true,
    usulFiqh: true,
    aqeedah: true,
    seerah: true,
    arabicGrammar: true,
    arabicMorphology: true,
    rhetoric: true,
    logicDiscipline: true,
    scientificMethodology: true,
    computing: true,
    engineering: true,
    medicine: true,
    energy: true,
    materials: true,
    economics: true,
    law: true,
    industry: true,
    logistics: true,
    education: true
  },

  legislationSystem: {
    active: true,
    humanReviewRequired: true,
    noContradictionWithQuranAndSunnah: true,
    noHarm: true,
    noRiba: true,
    noFraud: true,
    noOppression: true,
    noArrogance: true,
    truthfulnessRequired: true
  },

  policy: {
    supremeLayer: true,
    governsAllRuntimeLayers: true,
    governsAllScientificRoots: true,
    governsAllOrganizations: true,
    governsAllComputeInfrastructure: true,
    noGhaybPrediction: true,
    noConsciousnessClaim: true,
    humanAuthority: true,
    continuousImprovement: true,
    innovationAllowedWithinGovernance: true
  }
};

function ensure() {
  [
    'runtime/root/supreme',
    'runtime/root/sciences',
    'runtime/root/legislation',
    'runtime/root/methodology',
    'runtime/root/reports'
  ].forEach((dir) => {
    fs.mkdirSync(path.join(ROOT, dir), { recursive: true });
  });
}

function status() {
  ensure();
  return {
    success: true,
    supremeGovernance: SUPREME,
    timestamp: new Date().toISOString()
  };
}

function activate() {
  ensure();

  const record = {
    success: true,
    activated: true,
    supremeGovernance: SUPREME,
    timestamp: new Date().toISOString()
  };

  const file = path.join(
    ROOT,
    'runtime/root/supreme',
    `${Date.now()}-supreme-islamic-governance.json`
  );

  fs.writeFileSync(file, JSON.stringify(record, null, 2) + '\n');

  return { success: true, file, record };
}

module.exports = { status, activate };
