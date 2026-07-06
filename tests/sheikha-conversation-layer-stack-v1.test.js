'use strict';

const fs = require('fs');
const path = require('path');
const {
  buildConversationLayerStack,
  buildLayerContext,
  cosine,
  redact,
  retrieveKnowledge,
  sparseVector,
  tokenize
} = require('../runtime/conversation-engine/sheikha-conversation-layer-stack-v1');
const {
  buildGroundedRagAnswer
} = require('../runtime/execution/sheikha-execution-pipeline-v1');

const ROOT = path.join(__dirname, '..');

describe('Sheikha Conversation Layer Stack V1', () => {
  test('registry defines layers 1 through 8 with truthful PostgreSQL and vector claims', () => {
    const registry = JSON.parse(fs.readFileSync(
      path.join(ROOT, 'runtime/conversation-engine/sheikha-conversation-layer-stack-v1.json'),
      'utf8'
    ));

    expect(registry.layers.map((item) => item.layer)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(registry.layers[4].truthfulState).toBe('adapter-active-runtime-env-dependent');
    expect(registry.layers[5].engine).toBe('SHEIKHA_HASHED_SPARSE_VECTOR_V1');
    expect(registry.truthfulness.externalEmbeddingsClaimed).toBe(false);
    expect(registry.highestOperationalLayer).toMatchObject({
      name: 'SHEIKHA_ORCHESTRATOR_FABRIC_V2',
      level: 11
    });
    expect(registry.apexControlPlane.level).toBe(10);
    expect(registry.foundryPlane.name).toBe('SHEIKHA_FOUNDRY_V3');
    expect(registry.orchestratorPlane.name).toBe('SHEIKHA_SUPREME_ORCHESTRATOR_V1');
  });

  test('builds all layers and exposes evidence trace', async () => {
    const stack = await buildConversationLayerStack('حوكمة المعرفة وسلسلة الإمداد', {
      rootDir: ROOT,
      governance: {
        allowed: true,
        engine: 'SHEIKHA_GOVERNANCE_OF_GOVERNANCE_V1'
      }
    });
    const context = buildLayerContext(stack);

    expect(stack.status).toBe('ACTIVE');
    expect(stack.layers).toHaveLength(8);
    expect(stack.layers.map((item) => item.name)).toEqual([
      'CONVERSATION_ENGINE',
      'MEMORY_FABRIC',
      'KNOWLEDGE_STORE',
      'KNOWLEDGE_GRAPH',
      'POSTGRESQL',
      'VECTOR_STORE',
      'ENTERPRISE_GOVERNANCE',
      'EVIDENCE_OBSERVABILITY'
    ]);
    expect(context.requestId).toBe(stack.requestId);
    expect(stack.highestOperationalLayer.apexLevel).toBe(11);
    expect(context.evidence.layerTrace).toHaveLength(7);
    expect(['READY_NOT_CONFIGURED', 'CONNECTED', 'UNAVAILABLE']).toContain(context.postgresql.status);
  });

  test('local sparse vectors produce deterministic cosine similarity', () => {
    const first = sparseVector(tokenize('سلسلة الإمداد والمعادن'));
    const same = sparseVector(tokenize('سلسلة الإمداد والمعادن'));
    const different = sparseVector(tokenize('تعليم البرمجة'));

    expect(cosine(first, same)).toBeCloseTo(1, 8);
    expect(cosine(first, different)).toBeLessThan(1);
  });

  test('grounded RAG answer includes sources and vector scores', () => {
    const answer = buildGroundedRagAnswer('ما الحوكمة؟', {
      requestId: 'REQ-1',
      knowledge: [{ source: 'docs/governance.md', title: 'Governance', score: 3, excerpt: 'دليل حوكمة موثق.' }],
      vectors: [{ source: 'docs/governance.md', title: 'Governance', score: 0.8 }]
    });

    expect(answer).toContain('docs/governance.md');
    expect(answer).toContain('vector score: 0.8');
    expect(answer).toContain('لا تُستكمل المعلومات الناقصة بالتخمين');
  });

  test('knowledge store falls back to committed Knowledge Engine V2 registries', () => {
    const knowledge = retrieveKnowledge('No drift Stability Layer', ROOT);

    expect(knowledge.status).toBe('ACTIVE');
    expect(['RAG_INDEX', 'KNOWLEDGE_ENGINE_V2_REGISTRIES']).toContain(knowledge.sourceMode);
    expect(knowledge.documents).toBeGreaterThan(0);
    expect(knowledge.results.length).toBeGreaterThan(0);
  });

  test('redacts common secret shapes before memory or model context', () => {
    expect(redact('token=abc123456 password:secret-value')).toContain('token=[REDACTED]');
    expect(redact('token=abc123456 password:secret-value')).toContain('password=[REDACTED]');
  });
});
