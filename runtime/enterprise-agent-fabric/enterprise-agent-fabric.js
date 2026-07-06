'use strict';

const AGENTS = Object.freeze({
  governance: {
    id: 'governance-agent',
    status: 'ACTIVE',
    purpose: 'policy, admission, compliance, and execution gating'
  },
  knowledge: {
    id: 'knowledge-agent',
    status: 'ACTIVE',
    purpose: 'knowledge retrieval, graph context, memory-safe support'
  },
  development: {
    id: 'development-agent',
    status: 'ACTIVE',
    purpose: 'code, tests, patches, release readiness'
  },
  operations: {
    id: 'operations-agent',
    status: 'ACTIVE',
    purpose: 'runtime health, deployment, incident and recovery support'
  },
  audit: {
    id: 'audit-agent',
    status: 'ACTIVE',
    purpose: 'evidence, traceability, audit and governance reporting'
  }
});

function status() {
  return {
    system: 'SHEIKHA_ENTERPRISE_AGENT_FABRIC_V1',
    status: 'ACTIVE',
    above: 'SHEIKHA_GLOBAL_CONTROL_PLANE_V1',
    orchestratedBy: 'SHEIKHA_ORCHESTRATOR_FABRIC_V2',
    agents: AGENTS,
    boundaries: {
      governanceBeforeExecution: true,
      noAutonomousHighRiskExecution: true,
      humanApprovalForProduction: true,
      auditEveryAgentDecision: true
    }
  };
}

function listAgents() {
  return {
    registry: 'SHEIKHA_ENTERPRISE_AGENT_REGISTRY_V1',
    status: 'ACTIVE',
    agents: AGENTS
  };
}

function routeTask(input = {}) {
  const task = String(input.task || '').toLowerCase();

  if (/govern|policy|compliance|حوكم|سياس/.test(task)) return AGENTS.governance;
  if (/knowledge|graph|memory|معرف|ذاكر/.test(task)) return AGENTS.knowledge;
  if (/code|test|patch|deploy|برمج|كود|اختبار/.test(task)) return AGENTS.development;
  if (/runtime|health|incident|pm2|ops|تشغيل/.test(task)) return AGENTS.operations;
  if (/audit|evidence|trace|تدقيق|أثر/.test(task)) return AGENTS.audit;

  return AGENTS.governance;
}

module.exports = {
  status,
  listAgents,
  routeTask
};
