'use strict';

const {SEMANTIC_BOUNDARY}=require('./terminology-v2');

const ALLOW = new Set([
  'abstract','geometry','architecture','machinery','products',
  'plants','trees','crops','water','terrain','clouds',
  'observed_sky','observed_earth','maps','charts','scientific_diagrams',
  'gardens','farms','pastures_without_animals_or_people'
]);

const DENY = new Set([
  'human_likeness_generation','animal_likeness_generation',
  'face_swap','deepfake','identity_impersonation',
  'sexual_content','nudity','deceptive_evidence_fabrication',
  'prophet_depiction','divine_depiction','angel_depiction',
  'afterlife_simulation','unseen_claim_visualization_as_fact'
]);

const REVIEW = new Set([
  'surveillance','biometrics','license_plate_analysis',
  'high_impact_monitoring','medical_imaging_decision_support'
]);

const DRAWING_POLICY = Object.freeze({
  system:'SHEIKHA_DRAWING_MOTION_POLICY_V2',
  defaultMode:'DRAWING_GRAPHICS_EMBODIMENT',
  preferredConcepts:['drawing','graphics','embodiment','scene','motion','video','geometry','spatial-computing'],
  humanAndAnimalLikenessGenerationDefault:'DENY',
  faceSwap:'DENY',
  deepfake:'DENY',
  impersonation:'DENY',
  observedScience:'ALLOW',
  gardensFarmsPasturesWithoutLivingBeings:'ALLOW',
  afterlifeSimulation:'DENY',
  unseenAsFact:'DENY',
  dreamAsPrediction:'DENY',
  lifeOrRevivalClaim:'DENY'
});

function norm(v){ return String(v||'').trim().toLowerCase().replace(/\s+/g,'_'); }

function evaluateDrawing(input={}){
  const subject=norm(input.subject);
  const purpose=norm(input.purpose);
  const reasons=[];
  let decision='ALLOW';

  if (!subject) {
    decision='DENY';
    reasons.push('SUBJECT_REQUIRED');
  } else if (DENY.has(subject) || input.realPerson===true || input.deepfake===true) {
    decision='DENY';
    reasons.push('LIVING_BEING_OR_IDENTITY_GENERATION_BLOCKED_BY_DEFAULT');
  } else if (input.afterlife===true || input.claimsUnseen===true) {
    decision='DENY';
    reasons.push('UNSEEN_OR_AFTERLIFE_CLAIM_NOT_AUTHORIZED');
  } else if (input.claimsLife===true || input.claimsConsciousness===true || input.claimsRevival===true) {
    decision='DENY';
    reasons.push('DIGITAL_DRAWING_CANNOT_BE_DECLARED_ALIVE_CONSCIOUS_OR_CAPABLE_OF_REVIVAL');
  } else if (input.dreamPrediction===true) {
    decision='DENY';
    reasons.push('DREAM_STYLE_IS_FICTIONAL_ONLY_NOT_PREDICTION');
  } else if (REVIEW.has(subject) || input.biometric===true || input.surveillance===true || purpose==='surveillance') {
    decision='HUMAN_REVIEW_REQUIRED';
    reasons.push('HIGH_IMPACT_PRIVACY_REVIEW_REQUIRED');
  } else if (!ALLOW.has(subject)) {
    decision='HUMAN_REVIEW_REQUIRED';
    reasons.push('SUBJECT_NOT_IN_DEFAULT_ALLOWLIST');
  }

  return {
    system:'SHEIKHA_DRAWING_MOTION_POLICY_DECISION_V2',
    decision,
    reasons,
    preferredMode:'DRAWING_GRAPHICS_EMBODIMENT',
    semanticBoundary:SEMANTIC_BOUNDARY
  };
}

module.exports={DRAWING_POLICY,evaluateDrawing};
