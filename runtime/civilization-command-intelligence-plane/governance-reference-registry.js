'use strict';

const REFERENCES = Object.freeze([
  {
    id: 'QURAN-16-090',
    locator: 'Quran 16:90',
    principles: ['justice', 'excellence', 'responsibility'],
    verification: 'STABLE_QURAN_REFERENCE'
  },
  {
    id: 'QURAN-04-058',
    locator: 'Quran 4:58',
    principles: ['trust', 'justice', 'rightful-duty'],
    verification: 'STABLE_QURAN_REFERENCE'
  },
  {
    id: 'QURAN-05-008',
    locator: 'Quran 5:8',
    principles: ['justice', 'impartiality'],
    verification: 'STABLE_QURAN_REFERENCE'
  },
  {
    id: 'QURAN-17-036',
    locator: 'Quran 17:36',
    principles: ['evidence', 'knowledge-before-claim', 'accountability'],
    verification: 'STABLE_QURAN_REFERENCE'
  },
  {
    id: 'QURAN-49-006',
    locator: 'Quran 49:6',
    principles: ['verification', 'harm-prevention'],
    verification: 'STABLE_QURAN_REFERENCE'
  },
  {
    id: 'SUNNAH-BUKHARI-001',
    locator: 'Sahih al-Bukhari, hadith 1',
    principles: ['intention', 'accountability'],
    verification: 'COLLECTION_NUMBERING_REQUIRES_EDITION_AWARENESS'
  },
  {
    id: 'SUNNAH-NAWAWI-032',
    locator: 'al-Nawawi Forty Hadith, hadith 32; reported by Ibn Majah',
    principles: ['no-harm', 'harm-prevention'],
    verification: 'COLLECTION_NUMBERING_REQUIRES_EDITION_AWARENESS'
  },
  {
    id: 'SUNNAH-ABU-DAWUD-4607',
    locator: 'Sunan Abi Dawud, hadith 4607',
    principles: ['prophetic-guidance', 'rightly-guided-caliphs-methodology'],
    verification: 'COLLECTION_NUMBERING_REQUIRES_EDITION_AWARENESS'
  }
]);

function status() {
  return {
    registry: 'SHEIKHA_GOVERNANCE_REFERENCE_REGISTRY_V1',
    status: 'ACTIVE_REFERENCE_ONLY',
    references: REFERENCES,
    boundaries: {
      noAutomatedFatwa: true,
      noClaimOfDivineAuthority: true,
      noClaimOfUnseenKnowledge: true,
      humanScholarlyReviewForReligiousInterpretation: true,
      collectionNumberingMayVaryByEdition: true,
      technicalControlsRequireIndependentEvidence: true
    }
  };
}

module.exports = { REFERENCES, status };
