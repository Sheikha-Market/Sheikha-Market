const scores = {
  governance: 100,
  security: 95,
  risk: 90,
  compliance: 95,
  resilience: 85,
  operations: 90,
  knowledge: 80
};

const total = Object.values(scores).reduce((a, b) => a + b, 0);
const health_score = Math.round(total / Object.keys(scores).length);

console.log(JSON.stringify({
  system: "SHEIKHA_ENTERPRISE_HEALTH_INDEX_V1",
  status: "ACTIVE",
  scores,
  health_score,
  level: health_score >= 90 ? "EXCELLENT" : health_score >= 80 ? "STRONG" : "NEEDS_IMPROVEMENT",
  timestamp: new Date().toISOString()
}, null, 2));
