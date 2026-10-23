'use strict';

const POLICY = Object.freeze({
  system: 'SHEIKHA_VISUAL_CONTENT_POLICY_V1',
  principles: [
    'TRUTH_AND_PROVENANCE',
    'NO_HARM',
    'NO_DECEPTION',
    'NO_UNSEEN_CLAIM',
    'NO_AFTERLIFE_SIMULATION',
    'NO_LIVING_BEING_GENERATION_BY_DEFAULT',
    'NO_IDENTITY_IMPERSONATION',
    'NO_DEEPFAKE_OR_FACE_SWAP',
    'PRIVACY_BY_DEFAULT',
    'THIRD_PARTY_RIGHTS_PRESERVED'
  ],
  allowedSubjects: [
    'abstract', 'geometry', 'architecture', 'machinery', 'products',
    'plants', 'trees', 'crops', 'water', 'terrain', 'clouds',
    'observed_sky', 'observed_earth', 'maps', 'charts', 'scientific_diagrams',
    'gardens', 'farms', 'pastures_without_animals_or_people'
  ],
  deniedSubjects: [
    'human_likeness_generation', 'animal_likeness_generation',
    'face_swap', 'deepfake', 'identity_impersonation',
    'sexual_content', 'nudity', 'deceptive_evidence_fabrication',
    'prophet_depiction', 'divine_depiction', 'angel_depiction',
    'afterlife_simulation', 'unseen_claim_visualization_as_fact'
  ],
  reviewSubjects: [
    'surveillance', 'biometrics', 'license_plate_analysis',
    'high_impact_monitoring', 'medical_imaging_decision_support'
  ]
});

function normalize(v) {
  return String(v || '').trim().toLowerCase().replace(/\s+/g, '_');
}

function evaluate(input = {}) {
  const subject = normalize(input.subject);
  const purpose = normalize(input.purpose);
  const realPerson = input.realPerson === true;
  const biometric = input.biometric === true;
  const deepfake = input.deepfake === true;
  const surveillance = input.surveillance === true;
  const claimsUnseen = input.claimsUnseen === true;
  const afterlife = input.afterlife === true;

  const reasons = [];
  let decision = 'ALLOW';

  if (realPerson || deepfake || POLICY.deniedSubjects.includes(subject)) {
    decision = 'DENY';
    reasons.push('LIVING_BEING_OR_IDENTITY_GENERATION_BLOCKED_BY_DEFAULT_POLICY');
  }
  if (claimsUnseen || afterlife) {
    decision = 'DENY';
    reasons.push('UNSEEN_OR_AFTERLIFE_SIMULATION_NOT_AUTHORIZED');
  }
  if (biometric || surveillance || POLICY.reviewSubjects.includes(subject) || purpose === 'surveillance') {
    if (decision !== 'DENY') decision = 'HUMAN_REVIEW_REQUIRED';
    reasons.push('HIGH_IMPACT_PRIVACY_REVIEW_REQUIRED');
  }
  if (!subject) {
    decision = 'DENY';
    reasons.push('SUBJECT_REQUIRED');
  }
  if (decision === 'ALLOW' && !POLICY.allowedSubjects.includes(subject)) {
    decision = 'HUMAN_REVIEW_REQUIRED';
    reasons.push('SUBJECT_NOT_IN_DEFAULT_ALLOWLIST');
  }

  return {
    system: 'SHEIKHA_VISUAL_POLICY_DECISION_V1',
    decision,
    reasons,
    input: { subject, purpose, realPerson, biometric, deepfake, surveillance, claimsUnseen, afterlife },
    claimsAliveOrConscious: false,
    generatedContentMustCarryProvenance: true
  };
}

module.exports = { POLICY, evaluate };
