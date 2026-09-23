    'use strict';

    const rarityModel = Object.freeze({
  "classes": [
    "NON_RARE",
    "LIMITED",
    "SCARCE",
    "RARE",
    "VERY_RARE",
    "CRITICAL_RARE"
  ],
  "humanValueClassificationAllowed": false,
  "noArtificialScarcity": true,
  "noMonopoly": true,
  "personWorthClassificationAllowed": false,
  "rareResourceConservation": true,
  "reuseAndRecycling": true,
  "supplierDiversification": true,
  "weights": {
    "alternativesInverse": 0.08,
    "availabilityInverse": 0.12,
    "criticality": 0.1,
    "domainSpecialization": 0.07,
    "ecosystemScarcity": 0.08,
    "renewalDifficulty": 0.1,
    "replaceabilityInverse": 0.1,
    "supplierConcentration": 0.1,
    "supplyRisk": 0.1,
    "talentScarcity": 0.08,
    "toolingScarcity": 0.07
  }
});

    function clamp(value) {
  const n = Number(value);
  return Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));
}

function score(input = {}) {
  const w = rarityModel.weights;
  return Number((
    (100 - clamp(input.availability)) * w.availabilityInverse +
    (100 - clamp(input.alternatives)) * w.alternativesInverse +
    clamp(input.supplierConcentration) * w.supplierConcentration +
    clamp(input.criticality) * w.criticality +
    clamp(input.renewalDifficulty) * w.renewalDifficulty +
    clamp(input.ecosystemScarcity) * w.ecosystemScarcity +
    clamp(input.talentScarcity) * w.talentScarcity +
    clamp(input.toolingScarcity) * w.toolingScarcity +
    clamp(input.domainSpecialization) * w.domainSpecialization +
    (100 - clamp(input.replaceability)) * w.replaceabilityInverse +
    clamp(input.supplyRisk) * w.supplyRisk
  ).toFixed(2));
}

function classify(value) {
  const s = clamp(value);
  if (s < 20) return 'NON_RARE';
  if (s < 40) return 'LIMITED';
  if (s < 60) return 'SCARCE';
  if (s < 75) return 'RARE';
  if (s < 90) return 'VERY_RARE';
  return 'CRITICAL_RARE';
}

    module.exports = { rarityModel, clamp, score, classify };
