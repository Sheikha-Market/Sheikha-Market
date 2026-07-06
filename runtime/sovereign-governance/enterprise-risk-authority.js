const event = process.argv.slice(2).join(" ") || "normal";

const weights = [
  ["اختراق", 40],
  ["تسريب", 40],
  ["تحويل مشبوه", 35],
  ["دخول غير مصرح", 35],
  ["تعطل خدمة", 25],
  ["مفتاح سري", 45],
  ["JWT_SECRET", 45],
  ["PRIVATE KEY", 45]
];

let score = 0;
const matched = [];

for (const [term, weight] of weights) {
  if (event.toLowerCase().includes(term.toLowerCase())) {
    score += weight;
    matched.push(term);
  }
}

score = Math.min(score, 100);

const level =
  score >= 80 ? "CRITICAL" :
  score >= 60 ? "HIGH" :
  score >= 30 ? "MEDIUM" :
  "LOW";

console.log(JSON.stringify({
  system: "SHEIKHA_ENTERPRISE_RISK_AUTHORITY_V1",
  mode: "RISK_ASSESSMENT_ONLY",
  event,
  matched,
  risk_score: score,
  risk_level: level,
  decision:
    level === "CRITICAL" ? "LOCKDOWN_AND_REVIEW" :
    level === "HIGH" ? "BLOCK_AND_REVIEW" :
    level === "MEDIUM" ? "CHALLENGE_AND_MONITOR" :
    "LOG_ONLY",
  timestamp: new Date().toISOString()
}, null, 2));
