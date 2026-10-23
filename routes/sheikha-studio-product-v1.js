'use strict';

const express = require('express');
const {
  STUDIO_TOOLS,
  TOOL_ADAPTERS,
  buildStudioProductStatus,
  planStudioToolRoute,
} = require('../runtime/sheikha-studio/core/sheikha-studio-product-v1');
const {
  SheikhaStudioWorkspace,
} = require('../runtime/sheikha-studio/core/sheikha-studio-workspace-v1');
const {
  buildDeveloperEcosystemStatus,
  buildLanguageCatalog,
} = require('../runtime/sheikha-studio/core/sheikha-studio-developer-ecosystem-v1');
const {
  SheikhaGitLabFederation,
} = require('../runtime/sheikha-studio/git-lab/sheikha-git-lab-federation');
const {
  buildSecurityToolingStatus,
} = require('../runtime/sheikha-studio/core/sheikha-studio-security-tooling-v1');
const {
  buildDualTrackPlan,
} = require('../runtime/sheikha-studio/core/sheikha-lmm-dual-track-production-v1');
const {
  buildProviderCatalog,
  draftSubscriptionAgreement,
} = require('../runtime/sheikha-studio/core/sheikha-model-provider-subscription-v1');
const {
  buildAzureReadiness,
  planAzureWorkflow,
} = require('../runtime/sheikha-studio/core/sheikha-azure-integration-fabric-v1');
const {
  buildTrustToolsStatus,
  planTrustOperation,
} = require('../runtime/sheikha-studio/core/sheikha-trust-tools-v1');
const {
  buildSheikhaFoundryStatus,
} = require('../runtime/sheikha-studio/core/sheikha-foundry-v1');
const {
  buildSheikhaCloudStatus,
  planCloudWorkload,
  activateLocalCloudCanary,
  inspectLocalCloudRuntime,
} = require('../runtime/sheikha-studio/core/sheikha-cloud-v1');
const {
  buildUnifiedEcosystemStatus,
  classifyResourceRarity,
} = require('../runtime/sheikha-studio/core/sheikha-unified-ecosystem-v1');

const router = express.Router();
const { buildRepositoryIntegrationRouter } = require('./sheikha-repository-integration-v1');
router.use('/repository-integrations', buildRepositoryIntegrationRouter());
const workspace = new SheikhaStudioWorkspace({
  root: process.cwd(),
  writeEnabled: process.env.SHEIKHA_STUDIO_WRITE_ENABLED === 'true',
});
const gitLabHub = new SheikhaGitLabFederation();

function sendWorkspaceError(res, error) {
  res.status(error.statusCode || 500).json({
    ok: false,
    error: error.code || 'WORKSPACE_OPERATION_FAILED',
    message: error.message,
  });
}

router.get('/status', (_req, res) => res.json({
  ok: true,
  data: buildStudioProductStatus(),
}));

router.get('/tools', (_req, res) => res.json({
  ok: true,
  data: {
    system: 'SHEIKHA_STUDIO_TOOL_CATALOG_V1',
    tools: STUDIO_TOOLS,
    adapters: TOOL_ADAPTERS,
  },
}));

router.get('/developer-ecosystem', (_req, res) => res.json({
  ok: true,
  data: buildDeveloperEcosystemStatus(),
}));

router.get('/foundry/status', (_req, res) => res.json({
  ok: true,
  data: buildSheikhaFoundryStatus(),
}));

router.get('/cloud/status', (_req, res) => res.json({
  ok: true,
  data: buildSheikhaCloudStatus(),
}));

router.get('/ecosystem/status', (_req, res) => res.json({
  ok: true,
  data: buildUnifiedEcosystemStatus(),
}));

router.post('/ecosystem/rarity/classify', express.json({ limit: '16kb' }), (req, res) => {
  const diagnosis = classifyResourceRarity(req.body || {});
  res.status(diagnosis.status === 'INSUFFICIENT_EVIDENCE' ? 422 : 200).json({
    ok: diagnosis.status !== 'INSUFFICIENT_EVIDENCE',
    data: diagnosis,
  });
});

router.post('/cloud/workloads/plan', express.json({ limit: '16kb' }), (req, res) => {
  const plan = planCloudWorkload(req.body || {});
  res.status(plan.status === 'UNKNOWN_CLOUD_SERVICE' ? 404 : 200).json({
    ok: plan.status !== 'UNKNOWN_CLOUD_SERVICE',
    data: plan,
  });
});

router.post('/cloud/local/activate', (_req, res) => {
  const activation = activateLocalCloudCanary({ studioControlPlaneHealthy: true });
  res.status(activation.activated ? 200 : 503).json({
    ok: activation.activated,
    data: activation,
  });
});

router.get('/cloud/local/runtime-evidence', async (_req, res) => {
  const evidence = await inspectLocalCloudRuntime();
  res.status(evidence.blockers.length ? 503 : 200).json({
    ok: evidence.blockers.length === 0,
    data: evidence,
  });
});

router.get('/languages', (req, res) => res.json({
  ok: true,
  data: buildLanguageCatalog(req.query),
}));

router.get('/git-lab-hub/status', (_req, res) => {
  const status = gitLabHub.getStatus();
  res.json({
    ok: true,
    data: {
      ...status,
      productionReady: false,
      commercialPilotReady: false,
      claimCorrection: 'Contracts and local governance are active; external providers require authenticated round-trip evidence.',
    },
  });
});

router.get('/security-tools', (_req, res) => res.json({
  ok: true,
  data: buildSecurityToolingStatus(),
}));

router.post('/lmm/dual-track-plan', express.json({ limit: '16kb' }), (req, res) => res.json({
  ok: true,
  data: buildDualTrackPlan(req.body || {}),
}));

router.get('/model-providers', (_req, res) => res.json({
  ok: true,
  data: buildProviderCatalog(),
}));

router.post('/model-providers/agreement', express.json({ limit: '16kb' }), (req, res) => {
  const agreement = draftSubscriptionAgreement(req.body || {});
  res.status(agreement.status === 'UNKNOWN_PROVIDER' ? 404 : 200).json({
    ok: agreement.status !== 'UNKNOWN_PROVIDER',
    data: agreement,
  });
});

router.get('/azure/status', (_req, res) => res.json({
  ok: true,
  data: buildAzureReadiness({
    ...process.env,
    SHEIKHA_AZURE_CLI_INSTALLED: 'true',
    SHEIKHA_AZD_INSTALLED: 'false',
  }),
}));

router.post('/azure/workflows/plan', express.json({ limit: '16kb' }), (req, res) => {
  const plan = planAzureWorkflow({
    ...(req.body || {}),
    environment: {
      ...process.env,
      ...(req.body?.environment || {}),
      SHEIKHA_AZURE_CLI_INSTALLED: 'true',
      SHEIKHA_AZD_INSTALLED: 'false',
    },
  });
  res.status(plan.status === 'UNKNOWN_WORKFLOW' ? 404 : 200).json({
    ok: plan.status !== 'UNKNOWN_WORKFLOW',
    data: plan,
  });
});

router.get('/trust-tools/status', (_req, res) => res.json({
  ok: true,
  data: buildTrustToolsStatus(),
}));

router.post('/trust-tools/plan', express.json({ limit: '16kb' }), (req, res) => {
  const plan = planTrustOperation(req.body || {});
  res.status(plan.status === 'UNKNOWN_OPERATION' ? 404 : 200).json({
    ok: plan.status !== 'UNKNOWN_OPERATION',
    data: plan,
  });
});

router.post('/tools/route', express.json({ limit: '16kb' }), (req, res) => {
  const plan = planStudioToolRoute(req.body || {});
  res.status(plan.status === 'UNKNOWN_TOOL' ? 404 : 200).json({
    ok: plan.status !== 'UNKNOWN_TOOL',
    data: plan,
  });
});

router.get('/workspace/status', (_req, res) => res.json({ ok: true, data: workspace.status() }));

router.get('/workspace/files', (req, res) => {
  try {
    res.json({ ok: true, data: workspace.list(req.query.path || '.') });
  } catch (error) {
    sendWorkspaceError(res, error);
  }
});

router.get('/workspace/file', (req, res) => {
  try {
    res.json({ ok: true, data: workspace.read(req.query.path) });
  } catch (error) {
    sendWorkspaceError(res, error);
  }
});

router.put('/workspace/file', express.json({ limit: '2100kb' }), (req, res) => {
  try {
    const data = workspace.write(req.body?.path, req.body?.content, req.body?.expectedSha256);
    res.json({ ok: true, data });
  } catch (error) {
    sendWorkspaceError(res, error);
  }
});

module.exports = router;
