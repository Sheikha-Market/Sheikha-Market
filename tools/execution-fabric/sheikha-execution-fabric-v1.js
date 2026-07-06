const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout: 20000 }).trim();
  } catch (error) {
    if (error.stdout) {
      return String(error.stdout).trim();
    }

    return `ERROR: ${error.message}`;
  }
}

function safeReadJson(relativePath) {
  const filePath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureDir(relativePath) {
  fs.mkdirSync(path.join(process.cwd(), relativePath), { recursive: true });
}

function writeJson(relativePath, value) {
  const filePath = path.join(process.cwd(), relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

function writeText(relativePath, value) {
  const filePath = path.join(process.cwd(), relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value);
}

function toRelative(filePath) {
  return path.relative(process.cwd(), filePath).replace(/\\/g, '/');
}

function listFilesFromFs(relativePath, predicate = () => true) {
  const root = path.join(process.cwd(), relativePath);
  const files = [];

  function scan(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const entryPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scan(entryPath);
        return;
      }

      if (entry.isFile()) {
        const relativeFile = toRelative(entryPath);
        if (predicate(relativeFile)) {
          files.push(relativeFile);
        }
      }
    });
  }

  if (!fs.existsSync(root)) {
    return [];
  }

  scan(root);
  return files.sort();
}

function listFiles(relativePath) {
  const filesystemFiles = listFilesFromFs(relativePath);

  if (filesystemFiles.length > 0) {
    return filesystemFiles;
  }

  return sh(`git ls-files ${relativePath}`)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function listRuntimeJson() {
  return listFilesFromFs('runtime', (file) => file.endsWith('.json'));
}

function countByPrefix(files, prefix) {
  return files.filter((file) => file.startsWith(prefix)).length;
}

function collectPrGovernance() {
  const reviewFiles = listFiles('runtime/pr-governance/reviews');

  const prNumbers = [
    ...new Set(
      reviewFiles
        .map((file) => {
          const match = file.match(/runtime\/pr-governance\/reviews\/pr-(\d+)\//);
          return match ? Number(match[1]) : null;
        })
        .filter((value) => Number.isInteger(value))
    )
  ].sort((a, b) => a - b);

  return prNumbers.map((pr) => {
    const decision = safeReadJson(`runtime/pr-governance/reviews/pr-${pr}/review-decision.json`);
    const autonomous = safeReadJson(`runtime/pr-governance/autonomous/pr-${pr}-autonomous-review.json`);
    const curated = safeReadJson(`runtime/curated-merge-engine/v1/pr-${pr}/curated-merge-plan.json`);
    const risk = safeReadJson(`runtime/pr-governance/reviews/pr-${pr}/analysis/pr${pr}-diff-risk-summary.json`);

    return {
      pr,
      title: decision?.title || `PR ${pr}`,
      state: decision?.state || 'UNKNOWN_FROM_LOCAL_RECORD',
      risk: autonomous?.risk || (risk ? 'HIGH' : 'REQUIRES_REVIEW'),
      decision:
        risk?.curatedMergeDecision?.decision ||
        decision?.finalDecision ||
        autonomous?.decision ||
        curated?.decision ||
        decision?.initialDecision ||
        'REQUIRES_CLASSIFICATION',
      rawMergeAllowed:
        decision?.mergeAllowedRaw === true ||
        autonomous?.mergeAllowed === true ||
        curated?.mergeAllowedRaw === true,
      curatedMergeRequired:
        decision?.curatedMergeRequired === true ||
        autonomous?.curatedMergeRequired === true ||
        curated?.decision === 'CURATED_MERGE' ||
        risk?.curatedMergeDecision?.rawMergeAllowed === false,
      evidence: {
        decision: Boolean(decision),
        autonomous: Boolean(autonomous),
        curated: Boolean(curated),
        risk: Boolean(risk)
      }
    };
  });
}

function collectFabricRoutes() {
  const registry = safeReadJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
  const routes = registry?.routes || [];

  return {
    total: routes.length,
    topPriority: [...routes]
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, 12)
      .map((route) => ({
        name: route.name,
        mount: route.mount,
        module: route.module,
        priority: route.priority
      })),
    duplicateMounts: Object.entries(
      routes.reduce((acc, route) => {
        acc[route.mount] = (acc[route.mount] || 0) + 1;
        return acc;
      }, {})
    )
      .filter(([, count]) => count > 1)
      .map(([mount, count]) => ({ mount, count }))
  };
}

function collectRouteStats() {
  const routeFiles = listFiles('routes')
    .filter((file) => file.endsWith('.js'));

  return {
    totalRouteFiles: routeFiles.length,
    governanceRoutes: countByPrefix(routeFiles, 'routes/governance/'),
    runtimeRoutes: countByPrefix(routeFiles, 'routes/runtime/'),
    fabricRoutes: countByPrefix(routeFiles, 'routes/fabric/'),
    dataFabricRoutes: countByPrefix(routeFiles, 'routes/data-fabric/'),
    sample: routeFiles.slice(0, 20)
  };
}

function collectKnowledgeState() {
  const runtimeJson = listRuntimeJson();

  return {
    runtimeJsonArtifacts: runtimeJson.length,
    knowledgeArtifacts: countByPrefix(runtimeJson, 'runtime/knowledge/'),
    prGovernanceArtifacts: countByPrefix(runtimeJson, 'runtime/pr-governance/'),
    architectureFreezeArtifacts: countByPrefix(runtimeJson, 'runtime/architecture-freeze/'),
    fabricArtifacts: countByPrefix(runtimeJson, 'runtime/fabric-bootstrap/'),
    developmentGovernanceArtifacts: countByPrefix(runtimeJson, 'runtime/development-governance/'),
    executionFabricArtifacts: countByPrefix(runtimeJson, 'runtime/execution-fabric/')
  };
}

function buildRoadmap(findings) {
  const roadmap = [
    {
      id: 'SEF-RM-001',
      priority: 'HIGH',
      title: 'Keep high-risk PRs in curated merge mode',
      reason: 'PR governance shows raw merge is not allowed for reviewed high-risk PRs.',
      status: 'ACTIVE'
    },
    {
      id: 'SEF-RM-002',
      priority: 'HIGH',
      title: 'Promote knowledge capture after every governance run',
      reason: 'Execution Fabric now writes reports, lessons, decisions, and roadmap entries into Knowledge V1.',
      status: 'ACTIVE'
    },
    {
      id: 'SEF-RM-003',
      priority: 'MEDIUM',
      title: 'Add endpoint or CLI wrapper for Execution Fabric reports',
      reason: 'The generator is operational; exposing a governed route or npm script can standardize use.',
      status: 'PLANNED'
    }
  ];

  if (findings.fabric.duplicateMounts.length > 0) {
    roadmap.push({
      id: 'SEF-RM-004',
      priority: 'MEDIUM_HIGH',
      title: 'Review duplicate Fabric mounts',
      reason: 'Duplicate mounts require explicit governance because precedence may depend on registration order.',
      status: 'REVIEW_REQUIRED'
    });
  }

  return roadmap;
}

function buildLessons(findings) {
  return [
    {
      id: 'SEF-LL-001',
      lesson: 'Knowledge should be captured as reports, indexes, decisions, and lessons, not as self-modifying runtime behavior.',
      source: 'SHEIKHA_EXECUTION_FABRIC_V1',
      appliesTo: ['knowledge', 'operation_loop', 'architecture_intelligence']
    },
    {
      id: 'SEF-LL-002',
      lesson: 'High-risk PRs must stay blocked from raw merge until curated source patches and human approval are complete.',
      source: 'PR governance reports',
      appliesTo: findings.prs.map((pr) => `PR-${pr.pr}`)
    },
    {
      id: 'SEF-LL-003',
      lesson: 'Fabric Bootstrap remains the primary route mount source; route growth should be observed through generated reports.',
      source: 'Fabric route scan',
      appliesTo: ['fabric', 'routes', 'runtime']
    }
  ];
}

function buildDecisions(findings) {
  return [
    {
      id: 'SEF-DEC-001',
      decision: 'Activate SHEIKHA_EXECUTION_FABRIC_V1 as a report-generating execution layer.',
      status: 'ACTIVE',
      evidence: 'runtime/execution-fabric/v1/sheikha-execution-fabric-v1.json'
    },
    {
      id: 'SEF-DEC-002',
      decision: 'Knowledge Capture, Knowledge Indexing, Lessons Learned, Decision Tracking, and Improvement Tracking are approved; self-modifying runtime behavior is not approved.',
      status: 'ACTIVE',
      evidence: 'runtime/knowledge/v1/reports/sheikha-execution-fabric-report.json'
    },
    {
      id: 'SEF-DEC-003',
      decision: 'Generated reports must update Knowledge V1 targets for human review.',
      status: 'ACTIVE',
      evidence: 'runtime/knowledge/v1/registry/sheikha-knowledge-registry.json'
    }
  ];
}

function renderMarkdown(report) {
  const prRows = report.findings.prs
    .map((pr) => `| #${pr.pr} | ${pr.risk} | ${pr.decision} | ${pr.rawMergeAllowed ? 'YES' : 'NO'} | ${pr.curatedMergeRequired ? 'YES' : 'NO'} |`)
    .join('\n');

  const roadmapRows = report.roadmap
    .map((item) => `| ${item.id} | ${item.priority} | ${item.status} | ${item.title} |`)
    .join('\n');

  return [
    '# SHEIKHA Execution Fabric V1 Report',
    '',
    `Generated at: ${report.timestamp}`,
    '',
    `Branch: ${report.git.branch}`,
    '',
    `Last commit: ${report.git.lastCommit}`,
    '',
    '## Summary',
    '',
    `- Runtime JSON artifacts: ${report.findings.knowledge.runtimeJsonArtifacts}`,
    `- Route files: ${report.findings.routes.totalRouteFiles}`,
    `- Fabric routes: ${report.findings.fabric.total}`,
    `- PRs reviewed: ${report.findings.prs.length}`,
    '',
    '## PR Governance',
    '',
    '| PR | Risk | Decision | Raw Merge | Curated Merge |',
    '| --- | --- | --- | --- | --- |',
    prRows || '| none | none | none | NO | NO |',
    '',
    '## Roadmap',
    '',
    '| ID | Priority | Status | Title |',
    '| --- | --- | --- | --- |',
    roadmapRows,
    '',
    '## Rule',
    '',
    'Knowledge capture is allowed and required. Self-modifying runtime and self-rewriting behavior remain blocked by governance.'
  ].join('\n') + '\n';
}

const findings = {
  knowledge: collectKnowledgeState(),
  prs: collectPrGovernance(),
  fabric: collectFabricRoutes(),
  routes: collectRouteStats(),
  files: {
    knowledgeDefinitions: listFiles('runtime/knowledge'),
    architectureDefinitions: listFiles('runtime/architecture-intelligence'),
    operationDefinitions: listFiles('runtime/operation-loop'),
    editorDefinitions: listFiles('runtime/editor-core')
  }
};

const report = {
  report: 'SHEIKHA_EXECUTION_FABRIC_V1_REPORT',
  status: 'ACTIVE',
  fabric: 'SHEIKHA_EXECUTION_FABRIC_V1',
  timestamp: new Date().toISOString(),
  git: {
    branch: sh('git branch --show-current'),
    status: sh('git status -sb --untracked-files=no'),
    lastCommit: sh('git log --oneline -1')
  },
  findings,
  decisions: buildDecisions(findings),
  lessonsLearned: buildLessons(findings),
  roadmap: buildRoadmap(findings),
  guardrails: {
    knowledgeCapture: true,
    knowledgeIndexing: true,
    lessonsLearned: true,
    decisionTracking: true,
    improvementTracking: true,
    selfModifyingRuntime: false,
    selfRewritingSystem: false,
    humanApprovalForHighRisk: true
  }
};

const knowledgeRegistry = {
  registry: 'SHEIKHA_KNOWLEDGE_REGISTRY_V1',
  status: 'ACTIVE',
  generatedBy: 'SHEIKHA_EXECUTION_FABRIC_V1',
  generatedAt: report.timestamp,
  entries: [
    {
      id: 'SKV1-REPORT-001',
      type: 'execution_report',
      path: 'runtime/knowledge/v1/reports/sheikha-execution-fabric-report.json'
    },
    {
      id: 'SKV1-REPORT-002',
      type: 'execution_report_markdown',
      path: 'runtime/knowledge/v1/reports/sheikha-execution-fabric-report.md'
    },
    {
      id: 'SKV1-DEC-001',
      type: 'decision_registry',
      path: 'runtime/knowledge/v1/decisions/sheikha-decision-registry.json'
    },
    {
      id: 'SKV1-LESSON-001',
      type: 'lessons_learned',
      path: 'runtime/knowledge/v1/lessons/sheikha-lessons-learned.json'
    },
    {
      id: 'SKV1-ROADMAP-001',
      type: 'roadmap',
      path: 'runtime/knowledge/v1/roadmaps/sheikha-roadmap-v1.json'
    }
  ],
  rules: {
    stable_ids_required: true,
    evidence_path_required: true,
    human_review_required_for_high_risk: true
  }
};

ensureDir('runtime/knowledge/v1/registry');
ensureDir('runtime/knowledge/v1/decisions');
ensureDir('runtime/knowledge/v1/lessons');
ensureDir('runtime/knowledge/v1/roadmaps');
ensureDir('runtime/knowledge/v1/reports');

writeJson('runtime/knowledge/v1/reports/sheikha-execution-fabric-report.json', report);
writeText('runtime/knowledge/v1/reports/sheikha-execution-fabric-report.md', renderMarkdown(report));
writeJson('runtime/knowledge/v1/registry/sheikha-knowledge-registry.json', knowledgeRegistry);
writeJson('runtime/knowledge/v1/decisions/sheikha-decision-registry.json', {
  registry: 'SHEIKHA_DECISION_REGISTRY_V1',
  status: 'ACTIVE',
  generatedBy: 'SHEIKHA_EXECUTION_FABRIC_V1',
  generatedAt: report.timestamp,
  decisions: report.decisions
});
writeJson('runtime/knowledge/v1/lessons/sheikha-lessons-learned.json', {
  registry: 'SHEIKHA_LESSONS_LEARNED_V1',
  status: 'ACTIVE',
  generatedBy: 'SHEIKHA_EXECUTION_FABRIC_V1',
  generatedAt: report.timestamp,
  lessons: report.lessonsLearned
});
writeJson('runtime/knowledge/v1/roadmaps/sheikha-roadmap-v1.json', {
  roadmap: 'SHEIKHA_ROADMAP_V1',
  status: 'ACTIVE',
  generatedBy: 'SHEIKHA_EXECUTION_FABRIC_V1',
  generatedAt: report.timestamp,
  items: report.roadmap
});

console.log(JSON.stringify({
  status: report.status,
  fabric: report.fabric,
  prReviewed: report.findings.prs.length,
  fabricRoutes: report.findings.fabric.total,
  runtimeJsonArtifacts: report.findings.knowledge.runtimeJsonArtifacts,
  outputs: [
    'runtime/knowledge/v1/reports/sheikha-execution-fabric-report.json',
    'runtime/knowledge/v1/reports/sheikha-execution-fabric-report.md',
    'runtime/knowledge/v1/registry/sheikha-knowledge-registry.json',
    'runtime/knowledge/v1/decisions/sheikha-decision-registry.json',
    'runtime/knowledge/v1/lessons/sheikha-lessons-learned.json',
    'runtime/knowledge/v1/roadmaps/sheikha-roadmap-v1.json'
  ]
}, null, 2));
