class SheikhaFiqhEngine {
  constructor() {
    this.name = 'Sheikha Fiqh Engine';
    this.version = '1.0.0';
    this.sources = ['Quran', 'Sunnah', 'Khulafaa Rashideen'];
  }

  evaluate(ctx = {}) {
    const text = JSON.stringify(ctx).toLowerCase();
    const rules = [
      { id: 'NO_RIBA', pass: !/(riba|ربا|فائدة ربوية)/i.test(text), message: 'منع الربا' },
      { id: 'NO_GHARAR', pass: !/(gharar|غرر|مجهول)/i.test(text), message: 'منع الغرر الفاحش' },
      { id: 'NO_HARM', pass: !ctx.harm, message: 'لا ضرر ولا ضرار' },
      { id: 'TRUTH', pass: ctx.truth !== false, message: 'وجوب الصدق والأمانة' },
      { id: 'CONSENT', pass: ctx.consent !== false, message: 'التراضي في البيع' },
      { id: 'OWNERSHIP', pass: ctx.ownership !== false, message: 'تحقق الملك أو التفويض' }
    ];

    const failed = rules.filter(r => !r.pass);
    return {
      success: true,
      allowed: failed.length === 0,
      verdict: failed.length ? 'blocked' : 'allowed',
      engine: this.name,
      version: this.version,
      sources: this.sources,
      failed,
      passed: rules.filter(r => r.pass),
      timestamp: new Date().toISOString()
    };
  }
}

const engine = new SheikhaFiqhEngine();
module.exports = engine;
module.exports.SheikhaFiqhEngine = SheikhaFiqhEngine;
