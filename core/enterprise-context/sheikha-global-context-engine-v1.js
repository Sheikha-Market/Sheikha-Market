'use strict';

function normalizeContext(input = {}) {
  const user = input.user || {};
  const organization = input.organization || {};
  const workspace = input.workspace || {};
  const entity = input.entity || {};
  const runtime = input.runtime || {};

  return {
    system: 'SHEIKHA_GLOBAL_CONTEXT_ENGINE_V1',
    status: 'ACTIVE',
    mode: 'UNIFIED_ENTERPRISE_CONTEXT',
    context: {
      organization: {
        id: organization.id || 'default-org',
        name: organization.name || 'Sheikha Enterprise'
      },
      user: {
        id: user.id || 'anonymous',
        name: user.name || 'مستخدم',
        role: user.role || 'trader'
      },
      workspace: {
        id: workspace.id || 'dashboard',
        viewMode: workspace.viewMode || (user.role === 'developer' || user.role === 'admin' ? 'developer' : 'human'),
        language: workspace.language || 'ar',
        direction: workspace.direction || 'rtl'
      },
      entity: {
        type: entity.type || 'none',
        id: entity.id || null,
        name: entity.name || null,
        sector: entity.sector || null
      },
      runtime: {
        environment: runtime.environment || 'local',
        service: runtime.service || 'sheikha-main-portal',
        health: runtime.health || 'unknown'
      }
    },
    rules: {
      sharedAcrossModules: true,
      contextualAssistantEnabled: true,
      governanceAware: true,
      auditReady: true,
      humanModeDefault: true,
      noHarm: true
    }
  };
}

function buildContextBindings(contextReport = normalizeContext()) {
  const ctx = contextReport.context;

  return {
    system: 'SHEIKHA_GLOBAL_CONTEXT_BINDINGS_V1',
    status: 'READY',
    bindings: {
      marketplace: {
        entity: ctx.entity,
        organization: ctx.organization
      },
      productKnowledge: {
        entity: ctx.entity,
        language: ctx.workspace.language
      },
      governance: {
        entity: ctx.entity,
        role: ctx.user.role
      },
      aiAssistant: {
        user: ctx.user,
        entity: ctx.entity,
        workspace: ctx.workspace
      },
      analytics: {
        organization: ctx.organization,
        entity: ctx.entity,
        runtime: ctx.runtime
      },
      ide: {
        workspace: ctx.workspace,
        role: ctx.user.role,
        entity: ctx.entity
      }
    }
  };
}

function canAccessDeveloperContext(contextReport = normalizeContext()) {
  const role = contextReport.context.user.role;
  return role === 'developer' || role === 'admin';
}

module.exports = {
  normalizeContext,
  buildContextBindings,
  canAccessDeveloperContext
};
