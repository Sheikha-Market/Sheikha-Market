#!/usr/bin/env node
const fields = [
  'score',
  'risk',
  'stability',
  'rollbackComplexity',
  'performanceImpact',
  'observabilityQuality'
];

function parseArg(name, def) {
  const prefix = `--${name}=`;
  const raw = process.argv.find((a) => a.startsWith(prefix));
  if (!raw) return def;
  const v = Number(raw.slice(prefix.length));
  if (Number.isNaN(v)) {
    throw new Error(`Invalid number for ${name}`);
  }
  return v;
}

try {
  const input = {
    score: parseArg('score', 0),
    risk: parseArg('risk', 100),
    stability: parseArg('stability', 0),
    rollbackComplexity: parseArg('rollbackComplexity', 100),
    performanceImpact: parseArg('performanceImpact', 0),
    observabilityQuality: parseArg('observabilityQuality', 0)
  };

  for (const k of fields) {
    if (input[k] < 0 || input[k] > 100) {
      throw new Error(`${k} must be between 0 and 100`);
    }
  }

  const weighted = (
    input.score * 0.25 +
    (100 - input.risk) * 0.20 +
    input.stability * 0.20 +
    (100 - input.rollbackComplexity) * 0.15 +
    input.performanceImpact * 0.10 +
    input.observabilityQuality * 0.10
  );

  const result = {
    input,
    weightedDecisionScore: Number(weighted.toFixed(2))
  };

  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  console.error('[score-decision] ' + err.message);
  process.exit(1);
}
