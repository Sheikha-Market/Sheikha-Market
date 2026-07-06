'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_EXPONENTIAL_ACCOUNTING_ENGINE_V1',
    status: 'ACTIVE',
    role: 'GOVERNED_EXPONENTIAL_ACCOUNTING_AND_GROWTH_ENGINE',
    capabilities: [
      'compound_growth',
      'exponential_projection',
      'scenario_comparison',
      'risk_flags',
      'accounting_summary'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      noFuturePredictionClaim: true,
      calculationOnly: true,
      noRibaAutomation: true,
      noFinancialAdviceClaim: true
    }
  };
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function calculateExponentialAccounting(input = {}) {
  const principal = Math.max(0, toNumber(input.principal, 0));
  const rate = toNumber(input.rate, 0);
  const periods = Math.max(0, Math.floor(toNumber(input.periods, 0)));
  const contribution = Math.max(0, toNumber(input.contribution, 0));

  const rows = [];
  let balance = principal;

  for (let period = 1; period <= periods; period += 1) {
    const opening = balance;
    const growth = opening * rate;
    balance = opening + growth + contribution;

    rows.push({
      period,
      opening: Number(opening.toFixed(2)),
      growth: Number(growth.toFixed(2)),
      contribution: Number(contribution.toFixed(2)),
      closing: Number(balance.toFixed(2))
    });
  }

  return {
    success: true,
    system: 'SHEIKHA_EXPONENTIAL_ACCOUNTING_ENGINE_V1',
    calculationType: 'EXPONENTIAL_COMPOUND_ACCOUNTING',
    input: { principal, rate, periods, contribution },
    summary: {
      initialPrincipal: Number(principal.toFixed(2)),
      finalBalance: Number(balance.toFixed(2)),
      totalContribution: Number((contribution * periods).toFixed(2)),
      totalGrowth: Number((balance - principal - contribution * periods).toFixed(2))
    },
    rows,
    governance: {
      calculationOnly: true,
      noFuturePredictionClaim: true,
      noRibaAutomation: true,
      note: 'هذا قياس حسابي وسيناريو محاسبي، وليس تنبؤاً بالغيب ولا توصية مالية.'
    }
  };
}

module.exports = {
  status,
  calculateExponentialAccounting
};
