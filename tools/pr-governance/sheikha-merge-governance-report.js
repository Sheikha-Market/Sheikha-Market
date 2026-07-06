const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout: 20000 }).trim();
  } catch (error) {
    return `ERROR: ${error.message}`;
  }
}

function readJson(relativePath) {
  const filePath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readLines(relativePath) {
  const filePath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(filePath)) {
    return [];
  }

  return fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function listPrNumbers() {
  const reviewsDir = path.join(process.cwd(), 'runtime/pr-governance/reviews');
  if (!fs.existsSync(reviewsDir)) {
    return [];
  }

  return fs
    .readdirSync(reviewsDir)
    .map((name) => {
      const match = name.match(/^pr-(\d+)$/);
      return match ? Number(match[1]) : null;
    })
    .filter((number) => Number.isInteger(number))
    .sort((a, b) => a - b);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeDecision(pr, reviewDecision, autonomousReview, curatedPlan, diffRiskSummary) {
  if (diffRiskSummary?.curatedMergeDecision?.decision) {
    return diffRiskSummary.curatedMergeDecision.decision;
  }

  if (reviewDecision?.finalDecision) {
    return reviewDecision.finalDecision;
  }

  if (autonomousReview?.decision) {
    return autonomousReview.decision;
  }

  if (curatedPlan?.decision) {
    return curatedPlan.decision;
  }

  if (reviewDecision?.initialDecision) {
    return reviewDecision.initialDecision;
  }

  return `PR_${pr}_REQUIRES_DISCOVERY`;
}

function buildPrReport(pr) {
  const reviewDecision = readJson(`runtime/pr-governance/reviews/pr-${pr}/review-decision.json`);
  const autonomousReview = readJson(`runtime/pr-governance/autonomous/pr-${pr}-autonomous-review.json`);
  const curatedPlan =
    readJson(`runtime/curated-merge-engine/v1/pr-${pr}/curated-merge-plan.json`) ||
    readJson(`runtime/pr-governance/reviews/pr-${pr}/analysis/pr${pr}-curated-merge-plan.json`);
  const diffRiskSummary = readJson(`runtime/pr-governance/reviews/pr-${pr}/analysis/pr${pr}-diff-risk-summary.json`);
  const files = readLines(`runtime/pr-governance/reviews/pr-${pr}/files.txt`);

  const rawMergeAllowed =
    reviewDecision?.mergeAllowedRaw === true ||
    autonomousReview?.mergeAllowed === true ||
    curatedPlan?.mergeAllowedRaw === true
      ? true
      : false;

  const requiredActions = unique([
    ...(reviewDecision?.requiredChecks || []),
    ...(autonomousReview?.requiredActions || []),
    ...(curatedPlan?.requiredBeforeMerge || []),
    ...(diffRiskSummary?.curatedMergeDecision?.requiredBeforeAnyMerge || [])
  ]);

  const blockers = unique([
    ...(reviewDecision?.blockedRawMergeReasons || []),
    ...((diffRiskSummary?.riskSignals || []).map((signal) => signal.id)),
    ...(!rawMergeAllowed ? ['raw_merge_disabled_by_governance'] : [])
  ]);

  return {
    pr,
    title: reviewDecision?.title || `PR ${pr}`,
    state: reviewDecision?.state || 'UNKNOWN_FROM_LOCAL_RECORD',
    risk: autonomousReview?.risk || (diffRiskSummary ? 'HIGH' : 'REQUIRES_REVIEW'),
    decision: normalizeDecision(pr, reviewDecision, autonomousReview, curatedPlan, diffRiskSummary),
    rawMergeAllowed,
    curatedMergeRequired:
      reviewDecision?.curatedMergeRequired === true ||
      autonomousReview?.curatedMergeRequired === true ||
      curatedPlan?.decision === 'CURATED_MERGE' ||
      diffRiskSummary?.curatedMergeDecision?.rawMergeAllowed === false,
    fileCount: files.length || autonomousReview?.counts?.total || curatedPlan?.totalFiles || 0,
    counts: {
      autonomous: autonomousReview?.counts || null,
      curated: curatedPlan?.counts || null
    },
    sourceCandidates:
      curatedPlan?.sourceCandidates ||
      diffRiskSummary?.curatedMergeDecision?.sourceCandidatesForReview ||
      [],
    excluded:
      curatedPlan?.excluded ||
      diffRiskSummary?.curatedMergeDecision?.excludedFromRawMerge ||
      [],
    separateReview:
      curatedPlan?.separateReview ||
      diffRiskSummary?.curatedMergeDecision?.excludedFromRawMerge ||
      [],
    requiredActions,
    blockers,
    evidence: {
      reviewDecision: Boolean(reviewDecision),
      autonomousReview: Boolean(autonomousReview),
      curatedPlan: Boolean(curatedPlan),
      diffRiskSummary: Boolean(diffRiskSummary),
      filesList: files.length > 0
    },
    evidenceFiles: [
      `runtime/pr-governance/reviews/pr-${pr}/review-decision.json`,
      `runtime/pr-governance/autonomous/pr-${pr}-autonomous-review.json`,
      `runtime/curated-merge-engine/v1/pr-${pr}/curated-merge-plan.json`,
      `runtime/pr-governance/reviews/pr-${pr}/analysis/pr${pr}-diff-risk-summary.json`
    ]
  };
}

function parseOpenPullRequests(value) {
  if (!value || typeof value !== 'string' || value.startsWith('ERROR:')) {
    return [];
  }

  return value.split('\n').filter(Boolean).map((line) => {
    const [number, title, branch, state, updatedAt] = line.split('\t');
    return {
      number: Number(number),
      title,
      branch,
      state,
      updatedAt
    };
  });
}

function renderMarkdown(report) {
  const prRows = report.pullRequests
    .map(
      (pr) =>
        `| #${pr.pr} | ${pr.risk} | ${pr.decision} | ${pr.rawMergeAllowed ? 'YES' : 'NO'} | ${pr.curatedMergeRequired ? 'YES' : 'NO'} | ${pr.fileCount} |`
    )
    .join('\n');

  const prDetails = report.pullRequests
    .map((pr) => {
      const blockers = pr.blockers.length ? pr.blockers.map((item) => `- ${item}`).join('\n') : '- none';
      const actions = pr.requiredActions.length ? pr.requiredActions.map((item) => `- ${item}`).join('\n') : '- classify_pr';

      return [
        `## PR #${pr.pr}`,
        '',
        `Title: ${pr.title}`,
        '',
        `Decision: ${pr.decision}`,
        '',
        `Risk: ${pr.risk}`,
        '',
        `Raw merge allowed: ${pr.rawMergeAllowed ? 'YES' : 'NO'}`,
        '',
        `Curated merge required: ${pr.curatedMergeRequired ? 'YES' : 'NO'}`,
        '',
        'Blockers:',
        '',
        blockers,
        '',
        'Required actions:',
        '',
        actions
      ].join('\n');
    })
    .join('\n\n');

  return [
    '# SHEIKHA Merge Governance Detailed Report',
    '',
    `Generated at: ${report.timestamp}`,
    '',
    `Branch: ${report.git.branch}`,
    '',
    `Last commit: ${report.git.lastCommit}`,
    '',
    '## Governance Authority Chain',
    '',
    report.governanceAuthorityChain.map((item) => `- ${item}`).join('\n'),
    '',
    '## Merge Policy',
    '',
    Object.entries(report.mergePolicy)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join('\n'),
    '',
    '## Pull Request Summary',
    '',
    '| PR | Risk | Decision | Raw Merge | Curated Merge | Files |',
    '| --- | --- | --- | --- | --- | --- |',
    prRows || '| none | none | none | NO | NO | 0 |',
    '',
    '## Detailed PR Decisions',
    '',
    prDetails || 'No local PR review records found.',
    '',
    '## Final Governance Rule',
    '',
    report.finalGovernanceRule
  ].join('\n') + '\n';
}

const activationAudit = readJson('runtime/pr-governance/activation/sheikha-pr-governance-audit.json');
const prNumbers = listPrNumbers();
const pullRequests = prNumbers.map(buildPrReport);

const report = {
  report: 'SHEIKHA_MERGE_GOVERNANCE_DETAILED_REPORT',
  status: 'ACTIVE',
  analyst: 'SHEIKHA_MERGE_GOVERNANCE_ANALYST',
  purpose:
    'Identify who performs merge analysis and governance, summarize active PR decisions, and write a detailed merge governance report before any merge action.',
  timestamp: new Date().toISOString(),
  git: {
    branch: sh('git branch --show-current'),
    status: sh('git status -sb --untracked-files=no'),
    lastCommit: sh('git log --oneline -1')
  },
  baselines: {
    architectureFreezeV11: Boolean(readJson('runtime/architecture-freeze/v1.1/sheikha-architecture-freeze-v1.1.json')),
    architectureFreezeV13: Boolean(readJson('runtime/architecture-freeze/v1.3/sheikha-architecture-freeze-v1.3.json')),
    federalOrganizationV12: Boolean(readJson('runtime/federal-organization/v1.2/sheikha-federal-organization-v1.2.json')),
    quranSunnahGovernance: Boolean(readJson('runtime/quran-sunnah-governance/sheikha-quran-sunnah-governance.json')),
    chatCodeGovernance: Boolean(readJson('runtime/chat-code-governance/sheikha-chat-code-behavior-governance.json')),
    developmentProgrammingGovernance: Boolean(
      readJson('runtime/development-governance/sheikha-development-programming-governance.json')
    ),
    mergePrGovernanceSystem: Boolean(
      readJson('runtime/pr-governance/system/sheikha-merge-pr-governance-system-v1.json')
    ),
    mergePrGovernanceIndex: Boolean(
      readJson('runtime/pr-governance/system/sheikha-merge-pr-governance-index.json')
    ),
    technicalAdvisory: Boolean(readJson('runtime/technical-advisory/sheikha-technical-advisory-governance.json')),
    curatedMergeEngine: Boolean(readJson('runtime/curated-merge-engine/v1/sheikha-curated-merge-engine-v1.json')),
    patchEngine: Boolean(readJson('runtime/patch-engine/v1/sheikha-patch-engine-v1.json'))
  },
  governanceAuthorityChain: [
    'Quran Sunnah governance layer',
    'Chat and code behavior governance',
    'Architecture Freeze V1.3',
    'Federal Organization V1.2',
    'Development and programming governance',
    'PR activation governance',
    'Autonomous PR review',
    'Technical advisory governance',
    'Indexed merge PR governance system',
    'Curated merge engine',
    'Patch engine',
    'Human approval for high-risk actions'
  ],
  mergePolicy: {
    noAutoMerge: true,
    noRawMergeForHighRiskPr: true,
    humanApprovalRequired: true,
    secretScanRequired: true,
    lintRequired: true,
    testsRequired: true,
    freezeV13CompatibilityRequired: true,
    fabricAndRouteConflictChecksRequired: true
  },
  github: {
    openPullRequestsFromLastAudit: parseOpenPullRequests(activationAudit?.github?.openPullRequests || '')
  },
  pullRequests,
  summary: {
    totalReviewedPrs: pullRequests.length,
    rawMergeAllowedCount: pullRequests.filter((pr) => pr.rawMergeAllowed).length,
    curatedMergeRequiredCount: pullRequests.filter((pr) => pr.curatedMergeRequired).length,
    holdOrBlockedCount: pullRequests.filter((pr) => /HOLD|BLOCK|DO_NOT_MERGE|NOT_READY/.test(pr.decision)).length
  },
  finalGovernanceRule:
    'Sheikha may analyze and prepare merge plans, but no high-risk PR is merged raw. Merge requires governance checks, curated patching where needed, and human approval.'
};

const outDir = path.join(process.cwd(), 'runtime/pr-governance/activation');
fs.mkdirSync(outDir, { recursive: true });

const jsonOutput = path.join(outDir, 'sheikha-merge-governance-detailed-report.json');
const markdownOutput = path.join(outDir, 'sheikha-merge-governance-detailed-report.md');

fs.writeFileSync(jsonOutput, JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(markdownOutput, renderMarkdown(report));

console.log(JSON.stringify({
  status: report.status,
  analyst: report.analyst,
  reviewedPrs: report.summary.totalReviewedPrs,
  curatedMergeRequired: report.summary.curatedMergeRequiredCount,
  output: [
    'runtime/pr-governance/activation/sheikha-merge-governance-detailed-report.json',
    'runtime/pr-governance/activation/sheikha-merge-governance-detailed-report.md'
  ]
}, null, 2));
