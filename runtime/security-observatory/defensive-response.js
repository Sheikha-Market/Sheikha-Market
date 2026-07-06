const level = (process.argv[2] || "LOW").toUpperCase();

const plans = {
  LOW: ["log", "monitor"],
  MEDIUM: ["log", "alert", "human_review"],
  HIGH: ["log", "alert", "backup", "restrict_suspicious_access", "human_review"],
  CRITICAL: ["log", "alert", "backup", "isolate_affected_service", "rotate_secrets", "incident_review"]
};

const plan = plans[level] || plans.LOW;

console.log(JSON.stringify({
  system: "SHEIKHA_DEFENSIVE_RESPONSE_V1",
  mode: "DEFENSIVE_ONLY",
  risk_level: level,
  response_plan: plan,
  note: "كل إجراء يحتاج صلاحية نظامية ومراجعة بشرية عند التأثير على المستخدمين أو الخدمات."
}, null, 2));
