class SheikhaShariaGovernanceEngine {
  constructor() {
    this.sources = {
      quran: true,
      sunnah: true,
      khulafaa: true
    };

    this.rules = [
      {
        id: 'no_riba',
        check: (ctx) => !ctx.contains?.includes('riba'),
        message: 'منع الربا'
      },
      {
        id: 'no_gharar',
        check: (ctx) => !ctx.contains?.includes('gharar'),
        message: 'منع الغرر'
      },
      {
        id: 'no_harm',
        check: (ctx) => !ctx.harm,
        message: 'لا ضرر ولا ضرار'
      },
      {
        id: 'honesty',
        check: (ctx) => ctx.truth !== false,
        message: 'وجوب الصدق'
      }
    ];
  }

  evaluate(context = {}) {
    const results = this.rules.map(rule => ({
      rule: rule.id,
      pass: rule.check(context),
      message: rule.message
    }));

    const blocked = results.some(r => !r.pass);

    return {
      allowed: !blocked,
      results,
      timestamp: new Date().toISOString()
    };
  }
}

const engine = new SheikhaShariaGovernanceEngine();

module.exports = engine;
module.exports.SheikhaShariaGovernanceEngine = SheikhaShariaGovernanceEngine;
