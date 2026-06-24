const goals = [
  { goal: "security", priority: 1, status: "ACTIVE" },
  { goal: "governance", priority: 1, status: "ACTIVE" },
  { goal: "resilience", priority: 2, status: "ACTIVE" },
  { goal: "continuity", priority: 2, status: "ACTIVE" },
  { goal: "knowledge", priority: 3, status: "ACTIVE" }
];

console.log(JSON.stringify({
  system: "SHEIKHA_STRATEGY_AUTHORITY_V1",
  status: "ACTIVE",
  goals,
  timestamp: new Date().toISOString()
}, null, 2));
