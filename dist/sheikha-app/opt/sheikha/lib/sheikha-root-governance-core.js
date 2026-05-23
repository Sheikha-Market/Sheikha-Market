const sharia = require('./sheikha-fiqh-engine');
const supreme = require('./sheikha-supreme-neural-governance-network');

class SheikhaRootGovernanceCore {
  constructor() {
    this.name = 'Sheikha Root Governance Core';
    this.version = '1.0.0';
    this.owner = 'سلمان أحمد سلمان الراجح';
    this.sources = ['كتاب الله', 'سنة النبي ﷺ', 'سنة الخلفاء الراشدين المهديين'];
    this.principle = 'لا طاعة لمخلوق في معصية الخالق — لا ضرر ولا ضرار';
    this.scope = 'advisory-governance';
    this.layers = {
      ROOT: 'الميثاق والجذر',
      L0: 'الشريعة',
      L1: 'الفقه والمعاملات',
      L2: 'الحوكمة والقرار',
      L3: 'السوق والصفقات',
      L4: 'التوثيق والمراقبة'
    };
  }

  decide(input = {}) {
    const shariaResult = sharia.evaluate(input);
    const supremeResult = supreme.decide(input.module || input.type || 'general');

    return {
      success: true,
      allowed: shariaResult.allowed !== false,
      engine: this.name,
      owner: this.owner,
      sources: this.sources,
      principle: this.principle,
      scope: this.scope,
      layers: this.layers,
      sharia: shariaResult,
      supreme: supremeResult,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new SheikhaRootGovernanceCore();
