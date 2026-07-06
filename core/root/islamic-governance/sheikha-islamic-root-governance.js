'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const ROOT_GOVERNANCE = {
  name: 'SHEIKHA_ISLAMIC_ROOT_GOVERNANCE_FABRIC',
  status: 'ACTIVE',

  foundation: {
    quran: true,
    sunnah: true,
    rightlyGuidedCaliphsSunnah: true,
    islam: true,
    iman: true,
    ihsan: true,
    tawheed: true
  },

  sciences: {
    shariaSciences: true,
    arabicSciences: true,
    usulFiqh: true,
    aqeedah: true,
    tafsir: true,
    hadith: true,
    fiqh: true,
    seerah: true,
    arabicLanguage: true
  },

  ownerIdentity: {
    name: 'Salman Ahmed Salman Alrajeh',
    muslim: true,
    saudi: true,
    arab: true,
    humanAuthority: true,
    noTribalFanaticism: true,
    purpose: 'Seeking Allah’s pleasure, benefit, justice, and no harm'
  },

  policy: {
    noHarm: true,
    noRiba: true,
    noFraud: true,
    noOppression: true,
    noArrogance: true,
    noGhaybPrediction: true,
    noConsciousnessClaim: true,
    humanReviewRequired: true,
    truthfulnessRequired: true
  }
};

function ensure() {
  [
    'runtime/root/governance',
    'runtime/root/identity',
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
    rootGovernance: ROOT_GOVERNANCE,
    timestamp: new Date().toISOString()
  };
}

function activate() {
  ensure();

  const record = {
    success: true,
    activated: true,
    rootGovernance: ROOT_GOVERNANCE,
    timestamp: new Date().toISOString()
  };

  const file = path.join(
    ROOT,
    'runtime/root/governance',
    `${Date.now()}-islamic-root-governance.json`
  );

  fs.writeFileSync(file, JSON.stringify(record, null, 2) + '\n');

  return { success: true, file, record };
}

module.exports = { status, activate };
