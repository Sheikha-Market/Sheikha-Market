'use strict';

const models = ['GLM-5.3-Flash', 'GLM-5.2', 'DeepSeek-V4-Vision-Exp', 'Claude Opus 4.8', 'GPT-5.6 Terra', 'Gemini 3.7 Flash'];
const rows = [
  ['Coding', 'Terminal Bench 2.1', 84.3, 81.0, 83.9, 85.0, 87.4, 85.8],
  ['Coding', 'DeepSWE v1.1', 63.4, 46.2, 59.3, 58.0, 69.6, 65.3],
  ['Coding', 'NL2Repo', 56.3, 48.9, 57.7, 69.7, null, null],
  ['Agentic', 'Toolathlon Verified', 78.4, 59.9, 75.9, 76.2, 74.9, null],
  ['Agentic', 'AutomationBench v1.0.6', 48.8, 26.2, 38.8, 41.0, 37.2, 52.3],
  ['Agentic', 'Agents Last Exam', 26.3, 20.4, 27.3, 27.0, 28.0, null],
  ['Agentic', 'HLE w/ Tools', 55.3, 54.7, 55.1, 57.9, null, null],
  ['Agentic', 'GDPval-AA v2', 1773, 1504, 1675, 1582, 1571, 1527],
  ['Vision', 'OfficeQA Pro', 62.4, null, 57.9, 48.9, null, null],
  ['Vision', 'CharXiv Reasoning w/ Tools', 89.4, null, 80.4, 89.9, 88.0, 88.7],
  ['Vision', 'Chartography w/ Tools', 78.0, null, 64.3, 75.0, 68.0, 65.0],
  ['Vision', 'BabyVision', 53.4, null, 35.1, 46.8, 61.6, 70.9],
  ['Vision', 'MVBench', 77.8, null, 69.4, 67.1, 75.0, 82.2],
].map(([category, name, ...values]) => ({ category, name, values,
  unit: name === 'GDPval-AA v2' ? 'points' : 'percent', sheikha: null,
  sheikhaStatus: 'NOT_RUN', evidenceClass: 'USER_SUPPLIED_PUBLISHER_TABLE_NOT_INDEPENDENTLY_REPRODUCED' }));

module.exports = { models, rows,
  source: 'https://huggingface.co/zai-org/GLM-5.3-Flash/blob/main/README.md',
  aggregateRanking: null,
  executionPrerequisites: ['PINNED_DATASET_AND_LICENSE', 'ISOLATED_HARNESS_AND_NETWORK_APPROVAL',
    'MODEL_REVISION_AND_SYSTEM_PROMPT', 'TOOL_AND_JUDGE_VERSIONS', 'APPROVED_BUDGET',
    'REPEATED_RUNS_WITH_UNCERTAINTY', 'CONTAMINATION_REVIEW', 'INDEPENDENT_REVIEW'],
};
