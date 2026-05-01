const rootGovernance = require('./sheikha-root-governance-core');
const sharia = require('./sheikha-fiqh-engine');
const supreme = require('./sheikha-supreme-neural-governance-network');
const runtimeRoot = require('./sheikha-runtime-root-neural-network');

class SheikhaDecisionFlowEngine {
  constructor() {
    this.name = 'Sheikha Unified Decision Flow Engine';
    this.version = '1.0.0';
    this.flow = ['root-governance', 'sharia', 'supreme-neural', 'market-decision', 'final-verdict'];
  }

  decide(input = {}) {
    const root = rootGovernance.decide(input);
    const shariaResult = sharia.evaluate(input);
    const neural = supreme.decide(input.module || input.type || 'general');

    const blocked =
      root.allowed === false ||
      shariaResult.allowed === false ||
      neural.blocked === true;

    const verdict = blocked ? 'BLOCKED' : 'APPROVED';

    // تسجيل كل قرار في شبكة التدقيق الجذرية
    runtimeRoot.record({
      input,
      verdict,
      allowed: !blocked,
      flow: this.flow,
      stages: ['root-governance', 'sharia', 'supreme-neural', 'market-decision']
    });

    return {
      success: true,
      engine: this.name,
      version: this.version,
      verdict,
      allowed: !blocked,
      flow: this.flow,
      stages: {
        rootGovernance: root,
        sharia: shariaResult,
        supremeNeural: neural,
        marketDecision: {
          module: input.module || 'market',
          type: input.type || 'general',
          status: blocked ? 'stopped-before-execution' : 'ready-for-execution'
        }
      },
      audit: {
        principle: 'لا ضرر ولا ضرار',
        timestamp: new Date().toISOString()
      }
    };
  }
}

module.exports = new SheikhaDecisionFlowEngine();
