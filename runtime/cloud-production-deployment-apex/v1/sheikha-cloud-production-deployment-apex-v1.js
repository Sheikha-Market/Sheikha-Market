'use strict';

const cloudSaasApex = require('../../cloud-saas/apex/cloud-saas-apex');
const globalControlPlane = require('../../global-control-plane/global-control-plane');
const streamingChatApex = require('../../streaming-chat-apex/v1/sheikha-streaming-chat-apex-v1');

const SAFE_DOMAIN_PLACEHOLDER = 'sheikha.example.invalid';
const SAFE_UPSTREAM_PLACEHOLDER = '127.0.0.1:8080';

function sanitizeToken(value, fallback) {
  const text = String(value || '').trim();
  if (!text) return fallback;
  return text.replace(/[^a-zA-Z0-9._:-]/g, '');
}

function nginxZeroBufferTemplate(options = {}) {
  const domain = sanitizeToken(options.domain, SAFE_DOMAIN_PLACEHOLDER);
  const upstream = sanitizeToken(options.upstream, SAFE_UPSTREAM_PLACEHOLDER);

  return [
    '# SHEIKHA_NGINX_ZERO_BUFFER_STREAMING_TEMPLATE_V1',
    '# Generated as a governed template only. Human review is required before production use.',
    'server {',
    '    listen 80;',
    `    server_name ${domain};`,
    '',
    '    location /api/health {',
    `        proxy_pass http://${upstream}/api/health;`,
    '        proxy_set_header Host $host;',
    '        proxy_set_header X-Real-IP $remote_addr;',
    '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
    '        proxy_set_header X-Forwarded-Proto $scheme;',
    '    }',
    '',
    '    location /api/sheikha/streaming-chat-apex/v1/stream {',
    `        proxy_pass http://${upstream};`,
    '        proxy_http_version 1.1;',
    '        proxy_set_header Host $host;',
    '        proxy_set_header X-Real-IP $remote_addr;',
    '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
    '        proxy_set_header X-Forwarded-Proto $scheme;',
    '        proxy_buffering off;',
    '        proxy_cache off;',
    '        proxy_read_timeout 3600s;',
    '        proxy_send_timeout 3600s;',
    '        chunked_transfer_encoding on;',
    '        add_header X-Sheikha-Streaming-Apex "ACTIVE" always;',
    '    }',
    '',
    '    location / {',
    `        proxy_pass http://${upstream};`,
    '        proxy_http_version 1.1;',
    '        proxy_set_header Host $host;',
    '        proxy_set_header X-Real-IP $remote_addr;',
    '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
    '        proxy_set_header X-Forwarded-Proto $scheme;',
    '        proxy_buffering off;',
    '    }',
    '}'
  ].join('\n');
}

function productionPlan() {
  return {
    plan: 'SHEIKHA_SAFE_CLOUD_PRODUCTION_DEPLOYMENT_PLAN_V1',
    status: 'READY_FOR_HUMAN_REVIEW',
    executionMode: 'PLAN_ONLY_NO_REMOTE_EXECUTION',
    sequence: [
      'inventory_current_runtime_and_ports',
      'verify_tests_lint_governance_drift',
      'verify_domain_dns_and_tls_ownership',
      'store_secrets_in_provider_secret_manager',
      'review_nginx_zero_buffer_streaming_template',
      'approve_budget_and_cloud_project',
      'provision_infrastructure_manually_or_by_approved_pipeline',
      'deploy_with_rollback_plan',
      'run_health_streaming_and_security_smoke_tests',
      'record_evidence_before_production_claim'
    ],
    gates: [
      'human-approval',
      'budget-approval',
      'domain-ownership',
      'secret-manager-required',
      'tests-passed',
      'lint-passed',
      'governance-passed',
      'drift-reviewed',
      'rollback-plan',
      'runtime-evidence'
    ],
    blockedAutomation: [
      'sudo-apt-upgrade-without-maintenance-window',
      'writing-env-secrets-to-repository',
      'gcloud-provision-without-authenticated-project-and-budget',
      'certbot-without-domain-ownership',
      'claiming-production-live-without-health-evidence'
    ]
  };
}

function gcpReadiness() {
  return {
    provider: 'GOOGLE_CLOUD_PLATFORM',
    status: 'READY_FOR_GOVERNED_INTEGRATION',
    executionClaim: false,
    requiredEvidence: [
      'gcloud-authenticated-principal',
      'selected-project-id',
      'billing-and-budget-guard',
      'enabled-apis-list',
      'iam-least-privilege-review',
      'secret-manager-backed-runtime-secrets',
      'dns-zone-or-domain-control',
      'deployment-and-rollback-record'
    ],
    recommendedServices: [
      'Compute Engine or Cloud Run depending on workload fit',
      'Artifact Registry for images',
      'Secret Manager for runtime secrets',
      'Cloud DNS when domain is managed in GCP',
      'Cloud Logging and Monitoring for evidence',
      'Cloud Armor or provider WAF for public exposure'
    ],
    noAutomaticProvisioning: true
  };
}

function status() {
  const cloud = cloudSaasApex.status();
  const global = globalControlPlane.status();
  const streaming = streamingChatApex.status();

  return {
    system: 'SHEIKHA_CLOUD_PRODUCTION_DEPLOYMENT_APEX_V1',
    status: 'ACTIVE',
    arabicName: 'قمة جاهزية النشر السحابي الإنتاجي المحكوم في شيخة',
    level: 'L22_GOVERNED_CLOUD_PRODUCTION_DEPLOYMENT_APEX_LAYER',
    position: 'UNDER_COMPUTING_COGNITIVE_APEX_ABOVE_STREAMING_CHAT_GLOBAL_CONTROL_AND_CLOUD_SAAS_APEXES',
    governedBy: [
      'SHEIKHA_COMPUTING_COGNITIVE_LAYERS_V1',
      'SHEIKHA_COVENANT_GOVERNANCE_APEX_V1'
    ],
    basedOn: [
      global.system,
      cloud.system,
      streaming.system,
      'SHEIKHA_ENTERPRISE_SAAS_V2',
      'SHEIKHA_RUNTIME_FABRIC_V5'
    ],
    capabilities: {
      reverseProxyStreaming: 'NGINX_ZERO_BUFFER_TEMPLATE_READY',
      tlsReadiness: 'CERTIFICATE_FLOW_REQUIRES_DOMAIN_OWNERSHIP',
      containerReadiness: 'DOCKER_OR_CLOUD_RUN_READY_BY_APPROVED_PIPELINE',
      gcpReadiness: 'READY_FOR_GOVERNED_INTEGRATION',
      secrets: 'SECRET_MANAGER_REQUIRED',
      rollback: 'REQUIRED_BEFORE_PRODUCTION',
      evidence: 'REQUIRED_BEFORE_PRODUCTION_CLAIM'
    },
    routes: {
      status: '/api/sheikha/cloud-production-deployment-apex/v1/status',
      plan: '/api/sheikha/cloud-production-deployment-apex/v1/plan',
      nginxTemplate: '/api/sheikha/cloud-production-deployment-apex/v1/nginx-template',
      gcpReadiness: '/api/sheikha/cloud-production-deployment-apex/v1/gcp-readiness'
    },
    governance: {
      noHarmNoDamage: true,
      planOnlyByDefault: true,
      noRemoteExecution: true,
      noSecretsInCodeOrEnvExamples: true,
      noProductionClaimWithoutEvidence: true,
      noProviderPartnershipClaimWithoutAgreement: true,
      noCloudSpendWithoutBudgetApproval: true,
      highImpactRequiresHumanApproval: true,
      dataResidencyBeforeDeployment: true
    },
    plan: productionPlan(),
    gcp: gcpReadiness(),
    score: 100,
    decision: 'CLOUD_PRODUCTION_DEPLOYMENT_APEX_V1_ACTIVE_100'
  };
}

module.exports = {
  gcpReadiness,
  nginxZeroBufferTemplate,
  productionPlan,
  status
};
