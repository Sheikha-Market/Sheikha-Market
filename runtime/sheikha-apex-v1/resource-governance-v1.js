'use strict';

const RARITY_LEVELS = Object.freeze([
  { min: 0, max: 24, id: 'NOT_RARE', ar: 'غير نادر' },
  { min: 25, max: 49, id: 'MODERATE_RARITY', ar: 'متوسط الندرة' },
  { min: 50, max: 74, id: 'RARE', ar: 'نادر' },
  { min: 75, max: 89, id: 'VERY_RARE', ar: 'شديد الندرة' },
  { min: 90, max: 100, id: 'ULTRA_RARE', ar: 'فائق الندرة' }
]);

function clamp(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) throw new TypeError('rarity input must be finite');
  return Math.max(0, Math.min(100, x));
}

function classifyRarity(score) {
  const s = Math.round(clamp(score) * 100) / 100;
  const level = RARITY_LEVELS.find((x) => s >= x.min && s <= x.max);
  return { score: s, ...level };
}

function diagnoseRarity(input = {}) {
  const availability = clamp(input.availability);
  const alternatives = clamp(input.alternatives);
  const supplierConcentration = clamp(input.supplierConcentration);
  const criticality = clamp(input.criticality);
  const renewalDifficulty = clamp(input.renewalDifficulty);

  const score =
    (100 - availability) * 0.30 +
    (100 - alternatives) * 0.20 +
    supplierConcentration * 0.20 +
    criticality * 0.15 +
    renewalDifficulty * 0.15;

  return {
    ...classifyRarity(score),
    dimensions: {
      availability,
      alternatives,
      supplierConcentration,
      criticality,
      renewalDifficulty
    },
    commercialDecisionAllowedFromRarityAlone: false,
    humanReviewRequiredForHighImpactAllocation: true
  };
}

const RESOURCE_POLICY = Object.freeze({
  noMonopoly: true,
  noArtificialScarcity: true,
  noHoardingForPriceManipulation: true,
  supplierDiversification: true,
  fairTransparentAccess: true,
  conserveRareResources: true,
  renewRareResources: true,
  specialistDevelopment: true,
  knowledgeTransfer: true,
  alternativesInvestment: true,
  reuseAndRecycling: true,
  ownershipAndLicensesPreserved: true,
  highImpactAllocationHumanReview: true
});

module.exports = {
  RARITY_LEVELS,
  RESOURCE_POLICY,
  classifyRarity,
  diagnoseRarity
};
