'use strict';

function buildDualTrackPlan(input = {}) {
  const datasetLicensed = input.datasetLicensed === true;
  const privacyReviewApproved = input.privacyReviewApproved === true;
  const trainingApproval = input.trainingApproval === true;
  const gpuRouteVerified = input.gpuRouteVerified === true;
  const trainingBlockers = [
    ['LICENSED_DATASET_REQUIRED', datasetLicensed],
    ['PII_SECRET_REVIEW_REQUIRED', privacyReviewApproved],
    ['HUMAN_TRAINING_APPROVAL_REQUIRED', trainingApproval],
    ['GPU_TRAINING_ROUTE_REQUIRED', gpuRouteVerified],
  ].filter(([, passed]) => !passed).map(([blocker]) => blocker);
  return {
    system: 'SHEIKHA_LMM_DUAL_TRACK_PRODUCTION_V1',
    status: 'PILOT_SERVING_AND_TRAINING_SEPARATED',
    servingTrack: {
      canStartControlledPilot: true,
      routes: ['LOCAL_OLLAMA', 'APPROVED_EXTERNAL_MODEL_API', 'SHEIKHA_GOVERNED_ARABIC_ROUTER'],
      providerReplaceable: true,
      customerDataUsedForTrainingByDefault: false,
      fallbackRequired: true,
      productionClaim: 'CONTROLLED_COMMERCIAL_PILOT_ONLY',
    },
    trainingTrack: {
      executionAuthorized: trainingBlockers.length === 0,
      blockers: trainingBlockers,
      stages: [
        'LICENSE_AND_PROVENANCE', 'PII_SECRET_REVIEW', 'CURATION_AND_DEDUPLICATION',
        'TOKENIZATION', 'PILOT_TRAINING', 'ARABIC_QUALITY_EVALUATION', 'SAFETY_EVALUATION',
        'HUMAN_REVIEW', 'CANARY', 'PROMOTION_OR_ROLLBACK',
      ],
      automaticPromotion: false,
      continuousLearningFromLiveCustomerTraffic: false,
    },
    schedule: {
      controlledPilot: 'NOW_AFTER_SMOKE_AND_SECURITY_GATE',
      domainFineTuneEstimate: '2_TO_8_WEEKS_AFTER_LICENSED_DATASET',
      independentLargeModelEstimate: '7_TO_14_MONTHS_AFTER_FUNDED_CLUSTER_AND_CORPUS',
      estimatesAreCommitments: false,
    },
    commercialBoundaries: [
      'NO_TRAINING_ON_CUSTOMER_CONTENT_WITHOUT_OPT_IN_AND_CONTRACT',
      'NO_MODEL_PROMOTION_WITHOUT_REPRODUCIBLE_EVALUATION',
      'NO_CLAIM_OF_NEW_LARGE_MODEL_BEFORE_WEIGHTS_AND_EVIDENCE_EXIST',
    ],
  };
}

module.exports = { buildDualTrackPlan };
