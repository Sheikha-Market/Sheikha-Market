'use strict';

const express = require('express');
const request = require('supertest');

const orchestrator = require('../core/orchestration/sheikha-root-orchestrator');
const orchestrationRoutes = require('../routes/runtime/orchestration/status.routes');

function app() {
  const instance = express();
  instance.use('/api/runtime/orchestration', orchestrationRoutes);
  return instance;
}

describe('Sheikha Root Orchestrator', () => {
  test('uses the real runtime-bus and canonical-loader contracts', () => {
    const result = orchestrator.status();
    expect(result).toMatchObject({
      status: 'active',
      orchestration: true,
      layers: {
        runtimeBus: true,
        neuralFabric: true,
        eventFabric: true,
        recoveryEngine: true,
        federation: true,
        synchronization: true,
        canonicalRuntimeLoader: true,
        orchestrationEngine: true
      },
      summary: {
        registered: 8,
        loaded: 8,
        failed: 0,
        failedLayers: []
      },
      offlineOperation: {
        githubRequired: false,
        gitlabRequired: false,
        externalCloudRequired: false,
        localOrchestrationIndependent: true
      },
      optionalIntegrations: {
        githubMcpToolsetsCatalogAvailable: true,
        githubMcpToolsetsRequired: false,
        externalSourceControlRequired: false
      }
    });
  });

  test('does not claim untested remote federation liveness', () => {
    const result = orchestrator.status();
    expect(result.federation).toMatchObject({
      status: 'active',
      offlineOperation: {
        githubRequired: false,
        localRuntimeIndependent: true
      },
      liveness: {
        registered: 6,
        verifiedLive: 1,
        allRegisteredSystemsLive: false,
        registryStatusDoesNotClaimRemoteLiveness: true
      }
    });
    expect(result.federation.systems.find(
      (system) => system.id === 'github-mcp'
    )).toMatchObject({
      status: 'registered-optional-external',
      requiredForLocalRuntime: false,
      livenessVerified: false
    });
  });

  test('exposes evidence-based orchestration status at the canonical route', async () => {
    const response = await request(app())
      .get('/api/runtime/orchestration/status')
      .expect(200);
    expect(response.body).toMatchObject({
      success: true,
      status: 'active',
      orchestration: true,
      summary: {
        registered: 8,
        loaded: 8,
        failed: 0
      },
      offlineOperation: {
        githubRequired: false,
        localOrchestrationIndependent: true
      },
      governance: {
        readiness_is_evidence_based: true,
        optional_external_integrations_block_local_runtime: false
      }
    });
  });
});
