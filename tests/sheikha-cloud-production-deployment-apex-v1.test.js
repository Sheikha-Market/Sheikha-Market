'use strict';

const fs = require('fs');
const path = require('path');
const cloudProductionDeploymentApex = require(
  '../runtime/cloud-production-deployment-apex/v1/sheikha-cloud-production-deployment-apex-v1'
);

const root = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Cloud Production Deployment Apex V1', () => {
  test('activates a governed plan-only production deployment layer above cloud SaaS and streaming', () => {
    const result = cloudProductionDeploymentApex.status();

    expect(result.system).toBe('SHEIKHA_CLOUD_PRODUCTION_DEPLOYMENT_APEX_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.level).toContain('L22');
    expect(result.decision).toBe('CLOUD_PRODUCTION_DEPLOYMENT_APEX_V1_ACTIVE_100');
    expect(result.score).toBe(100);
    expect(result.position).toContain('UNDER_COMPUTING_COGNITIVE_APEX');
    expect(result.governedBy).toContain('SHEIKHA_COMPUTING_COGNITIVE_LAYERS_V1');
    expect(result.basedOn).toEqual(expect.arrayContaining([
      'SHEIKHA_GLOBAL_CONTROL_PLANE_V1',
      'SHEIKHA_CLOUD_SAAS_APEX_V1',
      'SHEIKHA_STREAMING_MULTILINGUAL_CHAT_APEX_V1'
    ]));
    expect(result.governance.noRemoteExecution).toBe(true);
    expect(result.governance.noSecretsInCodeOrEnvExamples).toBe(true);
    expect(result.governance.noProductionClaimWithoutEvidence).toBe(true);
    expect(result.plan.executionMode).toBe('PLAN_ONLY_NO_REMOTE_EXECUTION');
  });

  test('blocks unsafe automation from the submitted deployment proposal', () => {
    const plan = cloudProductionDeploymentApex.productionPlan();
    const gcp = cloudProductionDeploymentApex.gcpReadiness();

    expect(plan.gates).toContain('human-approval');
    expect(plan.gates).toContain('secret-manager-required');
    expect(plan.gates).toContain('budget-approval');
    expect(plan.blockedAutomation).toContain('writing-env-secrets-to-repository');
    expect(plan.blockedAutomation).toContain('gcloud-provision-without-authenticated-project-and-budget');
    expect(plan.blockedAutomation).toContain('certbot-without-domain-ownership');
    expect(gcp.executionClaim).toBe(false);
    expect(gcp.noAutomaticProvisioning).toBe(true);
    expect(gcp.requiredEvidence).toContain('secret-manager-backed-runtime-secrets');
  });

  test('generates an nginx zero-buffer streaming template without secrets or shell commands', () => {
    const template = cloudProductionDeploymentApex.nginxZeroBufferTemplate({
      domain: 'sheikha.top',
      upstream: '127.0.0.1:8080'
    });

    expect(template).toContain('proxy_buffering off;');
    expect(template).toContain('/api/sheikha/streaming-chat-apex/v1/stream');
    expect(template).toContain('X-Sheikha-Streaming-Apex');
    expect(template).not.toMatch(/OPENAI_API_KEY|REDIS_PASSWORD|sk-proj/i);
    expect(template).not.toMatch(/\bsudo\b|\bgcloud\b|\bcertbot\b/);
  });

  test('is wired through server, SDK, inspector, docs, and package script', () => {
    const server = read('server.js');
    const sdk = read('sdk/sheikha-api/index.js');
    const inspector = read('core/enterprise/sheikha-enterprise-inspector-v3.js');
    const docs = read(
      'docs/cloud-production-deployment-apex/SHEIKHA-CLOUD-PRODUCTION-DEPLOYMENT-APEX-V1.md'
    );
    const packageJson = require('../package.json');

    expect(server).toContain(
      "app.use(require('./routes/cloud-production-deployment-apex/sheikha-cloud-production-deployment-apex-routes'));"
    );
    expect(sdk).toContain('/api/sheikha/cloud-production-deployment-apex/v1/status');
    expect(sdk).toContain('cloudProductionDeploymentApex');
    expect(inspector).toContain('cloudProductionDeploymentApexStatus');
    expect(docs).toContain('No inline `.env` secrets');
    expect(packageJson.scripts['ops:cloud-production-deployment-apex:v1'])
      .toBe('node tools/cloud-production-deployment-apex/sheikha-cloud-production-deployment-apex-v1.js');
  });
});
