'use strict';

function weightQualification(items) {
  return { schema: 'SHEIKHA_NEWS_TO_WEIGHT_QUALIFICATION_V1', execution: 'PLANNING_ONLY',
    modelDownloads: false, trainingExecuted: false, ownershipTransferred: false,
    candidates: items.filter(item => item.releaseClass === 'MODEL').map(item => ({
      model: item.title, source: item.sourceUrl, observedDigest: item.contentDigest,
      upstreamRevision: item.upstreamRevision || null,
      task: item.sourceUrl.endsWith('/NeoMME-260M-Retriever') ? 'DOCUMENT_RETRIEVAL_NOT_GENERATIVE_LLM'
        : item.sourceUrl.endsWith('/Qwen-Image-2.1') ? 'VISUAL_GENERATION_NOT_GENERAL_LLM' : 'REQUIRES_CLASSIFICATION',
      licenseMetadata: item.license,
      commercialGate: item.sourceUrl.endsWith('/Qwen-Image-2.1') ? 'SEPARATE_COMMERCIAL_LICENSE_REQUIRED'
        : 'LICENSE_TEXT_AND_DERIVATIVE_RIGHTS_REVIEW_REQUIRED',
      sourceReview: item.sourceUrl.endsWith('/Qwen-Image-2.1')
        ? 'https://github.com/QwenLM/Qwen-Image-2.1/blob/main/LICENSE' : item.sourceUrl,
      baseWeightsOwner: 'UPSTREAM_RIGHTS_HOLDER_NOT_SHEIKHA',
      derivedWeights: 'CONDITIONAL_ON_BASE_LICENSE_DATA_RIGHTS_AND_SIGNED_CONTRACT',
      requiredBeforeTraining: ['EXPLICIT_BOUNDED_DOWNLOAD_AUTHORIZATION', 'PIN_UPSTREAM_REVISION_AND_FILE_SHA256',
        'REVIEW_LICENSE_AND_DATA_RIGHTS', 'LOCAL_MEMORY_AND_DEPENDENCY_PREFLIGHT', 'APPROVED_DATASET_AND_BUDGET',
        'ISOLATED_BASELINE_AND_HELD_OUT_EVALUATION', 'RECOVERY_AND_PRIVATE_CHECKPOINT_PLAN'],
      proposedAcceptance: item.sourceUrl.endsWith('/NeoMME-260M-Retriever')
        ? ['Arabic Recall@10 and nDCG@10 against current retrieval', 'P95 query latency and peak memory', 'Document isolation and held-out provenance']
        : ['Synthetic non-animate graphic assets only', 'Arabic text correctness and alpha-channel integrity', 'Time and peak GPU memory versus baseline'],
      deploymentAllowed: false
    })) };
}
module.exports = { weightQualification };
