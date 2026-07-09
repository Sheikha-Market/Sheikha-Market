'use strict';

const FOUNDATION = 'QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS';

class SheikhaCapabilityProductUnification {
  constructor() {
    this.system = 'SHEIKHA_CAPABILITY_PRODUCT_UNIFICATION';
    this.foundation = FOUNDATION;
    this.capability_registry = new Map();
    this.product_registry = new Map();
    this.capability_product_links = new Map();
    this.energy_registry = new Map();
    this.improvement_cycles = [];

    this._initialize();
  }

  _initialize() {
    this._registerCapabilities();
    this._registerProducts();
    this._registerCapabilityProductLinks();
    this._registerEnergyRegistry();
  }

  _registerCapabilities() {
    const capabilities = [
      { id: 'CAP_GOVERNANCE', name: 'Governance', domain: 'governance', maturity: 95 },
      { id: 'CAP_RESEARCH', name: 'Research and Science', domain: 'research', maturity: 94 },
      { id: 'CAP_ENGINEERING', name: 'Engineering and Integration', domain: 'engineering', maturity: 96 },
      { id: 'CAP_PRODUCTIZATION', name: 'Productization', domain: 'product', maturity: 93 },
      { id: 'CAP_COMMERCIAL', name: 'Commercial Enablement', domain: 'commercial', maturity: 92 },
      { id: 'CAP_NONCOMMERCIAL', name: 'Non-Commercial Benefit', domain: 'social', maturity: 97 },
      { id: 'CAP_CONTINUOUS_IMPROVEMENT', name: 'Continuous Improvement', domain: 'quality', maturity: 96 }
    ];

    capabilities.forEach(capability => this.capability_registry.set(capability.id, capability));
  }

  _registerProducts() {
    const products = [
      { id: 'PROD_GOVERNANCE_SUITE', name: 'Governance Suite', type: 'COMMERCIAL', readiness: 95 },
      { id: 'PROD_DIGITAL_CERTIFICATION', name: 'Digital Certification Service', type: 'COMMERCIAL', readiness: 94 },
      { id: 'PROD_CIVILIZATION_KNOWLEDGE_HUB', name: 'Civilization Knowledge Hub', type: 'NON_COMMERCIAL', readiness: 96 },
      { id: 'PROD_UMMAH_IMPACT_ENGINE', name: 'Ummah Impact Engine', type: 'NON_COMMERCIAL', readiness: 97 },
      { id: 'PROD_UNIFIED_OPERATIONS_PORTAL', name: 'Unified Operations Portal', type: 'COMMERCIAL', readiness: 95 }
    ];

    products.forEach(product => this.product_registry.set(product.id, product));
  }

  _registerCapabilityProductLinks() {
    const links = [
      { capability_id: 'CAP_GOVERNANCE', product_id: 'PROD_GOVERNANCE_SUITE', strength: 0.98 },
      { capability_id: 'CAP_RESEARCH', product_id: 'PROD_CIVILIZATION_KNOWLEDGE_HUB', strength: 0.97 },
      { capability_id: 'CAP_ENGINEERING', product_id: 'PROD_UNIFIED_OPERATIONS_PORTAL', strength: 0.99 },
      { capability_id: 'CAP_PRODUCTIZATION', product_id: 'PROD_DIGITAL_CERTIFICATION', strength: 0.96 },
      { capability_id: 'CAP_COMMERCIAL', product_id: 'PROD_GOVERNANCE_SUITE', strength: 0.95 },
      { capability_id: 'CAP_NONCOMMERCIAL', product_id: 'PROD_UMMAH_IMPACT_ENGINE', strength: 0.99 },
      { capability_id: 'CAP_CONTINUOUS_IMPROVEMENT', product_id: 'PROD_UNIFIED_OPERATIONS_PORTAL', strength: 0.97 }
    ];

    links.forEach((link, idx) => {
      this.capability_product_links.set(`LINK_${idx + 1}`, link);
    });
  }

  _registerEnergyRegistry() {
    this.energy_registry.set('COMMERCIAL_ENERGY', {
      revenue_enablement: 95,
      market_readiness: 94,
      partner_scalability: 93,
      composite_score: 94
    });

    this.energy_registry.set('NON_COMMERCIAL_ENERGY', {
      social_impact: 98,
      education_benefit: 97,
      civilization_value: 99,
      composite_score: 98
    });
  }

  measureCapabilities() {
    const capabilities = Array.from(this.capability_registry.values());
    const avgMaturity = capabilities.reduce((sum, c) => sum + c.maturity, 0) / capabilities.length;

    return {
      total_capabilities: capabilities.length,
      average_maturity_score: Number(avgMaturity.toFixed(2)),
      fully_modeled: capabilities.length >= 7
    };
  }

  measureProducts() {
    const products = Array.from(this.product_registry.values());
    const commercial = products.filter(product => product.type === 'COMMERCIAL');
    const nonCommercial = products.filter(product => product.type === 'NON_COMMERCIAL');

    return {
      total_products: products.length,
      commercial_products: commercial.length,
      non_commercial_products: nonCommercial.length,
      fully_modeled: products.length >= 5 && commercial.length >= 3 && nonCommercial.length >= 2
    };
  }

  measureEnergy() {
    const commercial = this.energy_registry.get('COMMERCIAL_ENERGY');
    const nonCommercial = this.energy_registry.get('NON_COMMERCIAL_ENERGY');

    return {
      commercial_energy_score: commercial.composite_score,
      non_commercial_energy_score: nonCommercial.composite_score,
      unified_energy_score: Number(((commercial.composite_score + nonCommercial.composite_score) / 2).toFixed(2))
    };
  }

  runContinuousImprovementCycle() {
    const cycle = {
      cycle_id: `CYCLE_${this.improvement_cycles.length + 1}`,
      target: 'BETTER_AND_PRECISE_AND_EXCELLENT',
      governance_reference: ['النساء 4:58', 'النحل 16:90'],
      quality_gate: 'NO_HARM_NO_CONFLICT',
      status: 'APPLIED',
      timestamp: new Date().toISOString()
    };

    this.improvement_cycles.push(cycle);
    return cycle;
  }

  generateUnifiedModel() {
    const capabilityMetrics = this.measureCapabilities();
    const productMetrics = this.measureProducts();
    const energyMetrics = this.measureEnergy();

    return {
      system: this.system,
      foundation: this.foundation,
      quran_sunnah_digitalization: true,
      quran_sunnah_references: ['النساء 4:58', 'النحل 16:90', 'حديث لا ضرر ولا ضرار'],
      capability_metrics: capabilityMetrics,
      product_metrics: productMetrics,
      energy_metrics: energyMetrics,
      capability_product_links: this.capability_product_links.size,
      continuous_improvement_cycles: this.improvement_cycles.length,
      unified_readiness: capabilityMetrics.fully_modeled && productMetrics.fully_modeled,
      timestamp: new Date().toISOString()
    };
  }

  getStatus() {
    const model = this.generateUnifiedModel();
    return {
      ...model,
      continuous_improvement_active: this.improvement_cycles.length > 0,
      optimized_for_commercial_and_non_commercial: model.energy_metrics.unified_energy_score >= 90
    };
  }
}

module.exports = {
  SheikhaCapabilityProductUnification,
  FOUNDATION
};
