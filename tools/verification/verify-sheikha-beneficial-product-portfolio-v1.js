'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '../..');
const inputPath = path.join(
  root,
  'runtime/commercial-sales/v1/sheikha-beneficial-product-portfolio-v1.json'
);
const reportPath = path.join(
  root,
  'runtime/commercial-sales/v1/sheikha-beneficial-product-portfolio-verification-v1.json'
);

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function main() {
  const source = fs.readFileSync(inputPath);
  const portfolio = JSON.parse(source.toString('utf8'));
  const fixedPriceProducts = portfolio.primaryProducts.filter(
    (product) => Number.isFinite(product.priceSar)
  );
  const economicsConsistent = fixedPriceProducts.every((product) =>
    product.priceSar > 0 &&
    product.variableCostAssumptionSar >= 0 &&
    product.contributionAssumptionSar ===
      product.priceSar - product.variableCostAssumptionSar
  );
  const diagnostic = fixedPriceProducts.find(
    (product) => product.id === 'SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1'
  );
  const computedBreakEven = Math.ceil(
    portfolio.planningEconomics.fixedCostCapAssumptionSar /
    diagnostic.contributionAssumptionSar
  );
  const shortGoals = Object.values(portfolio.shortTermGoals);
  const checks = {
    customerCountTruthful: portfolio.currentCustomersRecorded === 0,
    threeStageSequence: portfolio.sequence.join('|') ===
      'EXPERIMENT|STRENGTHEN_INFORMATION_FLOW|GENERATE_VERIFIED_REVENUE',
    primaryProductsPresent: portfolio.primaryProducts.length === 4,
    economicsConsistent,
    breakEvenConsistent:
      computedBreakEven === portfolio.planningEconomics.diagnosticOnlyBreakEvenUnits,
    assumptionsNotForecasts:
      portfolio.planningEconomics.notForecastOrGuarantee === true,
    shortTermGoalsMeasurable: shortGoals.every((goal) =>
      Object.values(goal).every((value) =>
        Number.isFinite(value) ||
        (Array.isArray(value) && value.every(Number.isFinite))
      )
    ),
    ownedModelStageGated: portfolio.longTermGoals.some((goal) =>
      goal.id === 'SHEIKHA_OWN_BASE_MODEL_PROGRAM' &&
      goal.stages.includes('100M') && goal.stages.includes('1B') &&
      goal.stages.includes('7B_DECISION')
    )
  };
  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);
  const report = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_BENEFICIAL_PRODUCT_PORTFOLIO_VERIFICATION_V1',
    checkedAt: new Date().toISOString(),
    status: failedChecks.length === 0 ? 'VERIFIED' : 'BLOCKED',
    inputSha256: sha256(source),
    checks,
    failedChecks,
    computed: {
      fixedPriceProductCount: fixedPriceProducts.length,
      diagnosticBreakEvenUnits: computedBreakEven
    },
    boundaries: {
      planningAssumptionsAreNotForecasts: true,
      customerAcquisitionExecutedByThisCheck: false,
      revenueReceivedByThisCheck: false
    }
  };
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (failedChecks.length) process.exitCode = 1;
}

main();
