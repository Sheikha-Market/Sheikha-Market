'use strict';

const fs = require('fs');
const path = require('path');
const {
  executePipeline,
  normalizeIntelligenceMode,
  intentForMode
} = require('../runtime/execution/sheikha-execution-pipeline-v1');

const ROOT = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

describe('Sheikha Governed Intelligence Execution Loop V1', () => {
  test('registry defines a truthful runtime and research boundary', () => {
    const registry = readJson(
      'runtime/governed-intelligence-execution-loop/v1/sheikha-governed-intelligence-execution-loop-v1.json'
    );

    expect(registry.system).toBe('SHEIKHA_GOVERNED_INTELLIGENCE_EXECUTION_LOOP_V1');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.truthfulness.generativeAiRuntimeActive).toBe(true);
    expect(registry.truthfulness.agenticRuntimeBounded).toBe(true);
    expect(registry.truthfulness.actualAgiReached).toBe(false);
    expect(registry.truthfulness.actualAsiReached).toBe(false);
  });

  test('all intelligence modes and the full impact loop are registered', () => {
    const modes = readJson(
      'runtime/governed-intelligence-execution-loop/v1/registries/intelligence-mode-execution-registry.json'
    );
    const loop = readJson(
      'runtime/governed-intelligence-execution-loop/v1/registries/execution-impact-loop-registry.json'
    );

    expect(modes.modes.map((item) => item.mode)).toEqual(expect.arrayContaining([
      'generative', 'rag', 'agentic', 'multi-agent', 'agi-research', 'asi-research'
    ]));
    expect(loop.loop.map((item) => item.stage)).toEqual([
      'DISCOVER', 'RETRIEVE', 'GENERATE', 'PLAN', 'DELEGATE', 'AUTHORIZE',
      'EXECUTE', 'VERIFY', 'MEASURE', 'LEARN', 'IMPROVE'
    ]);
  });

  test('chat pipeline applies explicit bounded agentic and multi-agent modes', () => {
    expect(normalizeIntelligenceMode('agent')).toBe('agentic');
    expect(intentForMode('نفذ المهمة', 'agentic')).toBe('AGENTIC_PLAN');

    const agentic = executePipeline({ message: 'حلل المشروع', mode: 'agentic', workspaceRoot: ROOT });
    const multiAgent = executePipeline({ message: 'راجع التكامل', mode: 'multi-agent', workspaceRoot: ROOT });

    expect(agentic.intelligenceMode).toBe('agentic');
    expect(agentic.answer).toContain('خطة Agentic محكومة');
    expect(agentic.governance.humanReviewRequiredForExecution).toBe(true);
    expect(multiAgent.intelligenceMode).toBe('multi-agent');
    expect(multiAgent.answer).toContain('تنسيق Multi-Agent محكوم');
  });

  test('AGI and ASI modes remain research-only in runtime responses', () => {
    const agi = executePipeline({ message: 'صمم معيار تقييم', mode: 'agi-research', workspaceRoot: ROOT });
    const asi = executePipeline({ message: 'صمم تحليل مخاطر', mode: 'asi-research', workspaceRoot: ROOT });

    expect(agi.answer).toContain('AGI غير متحقق');
    expect(asi.answer).toContain('ASI غير متحقق');
    expect(agi.claimStatus.actualAgiReached).toBe(false);
    expect(asi.claimStatus.actualAsiReached).toBe(false);
  });

  test('extension SDK MCP route and generated report are integrated', () => {
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const mcp = readJson('runtime/sdk-fabric-mcp-integration/v1/registries/mcp-tool-catalog.json');
    const sdk = readJson('runtime/sdk-fabric-mcp-integration/v1/registries/sdk-fabric-map.json');
    const extension = readText('sheikha-vscode-extension/src/chat/sheikhaChatProvider.js');
    const report = readJson(
      'runtime/governed-intelligence-execution-loop/v1/sheikha-governed-intelligence-execution-loop-v1-report.json'
    );
    const route = fabric.routes.find((item) => item.name === 'governed-intelligence-execution-loop-v1');

    expect(route).toMatchObject({
      mount: '/api/intelligence/execution-loop',
      module: 'routes/governed-intelligence-execution-loop/status.routes.js',
      priority: 243
    });
    expect(mcp.tools).toEqual(expect.arrayContaining([
      'build_agentic_execution_plan',
      'coordinate_multi_agent_roles',
      'run_intelligence_execution_impact_loop'
    ]));
    expect(sdk.fabricTargets).toContain('governed_intelligence_execution_loop');
    ['generative', 'rag', 'agentic', 'multi-agent', 'agi-research', 'asi-research']
      .forEach((mode) => expect(extension).toContain(`data-mode="${mode}"`));
    expect(report.decision).toBe('GOVERNED_INTELLIGENCE_EXECUTION_LOOP_ACTIVE_100');
  });
});
