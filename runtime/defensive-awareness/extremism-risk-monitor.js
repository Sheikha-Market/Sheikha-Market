const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const text = process.argv.slice(2).join(" ").trim();

if (!text) {
  console.log('استخدم: node runtime/defensive-awareness/extremism-risk-monitor.js "النص المراد فحصه"');
  process.exit(1);
}

const rules = [
  { category: "تحريض على العنف", weight: 50, terms: ["اقتل", "تفجير", "اغتيال", "هجوم", "استباحة الدم"] },
  { category: "تكفير وتطرف", weight: 40, terms: ["كافر", "مرتد", "خوارج", "تكفير", "استحلال الدم"] },
  { category: "تهديد مباشر", weight: 45, terms: ["سأقتلك", "نحرق", "نفجر", "نهاجم"] },
  { category: "تضليل واحتيال", weight: 25, terms: ["رابط مزيف", "كلمة المرور", "حول الآن", "otp"] }
];

let riskScore = 0;
const matches = [];

for (const rule of rules) {
  const found = rule.terms.filter(t => text.includes(t));
  if (found.length) {
    riskScore += rule.weight;
    matches.push({ category: rule.category, found });
  }
}

riskScore = Math.min(riskScore, 100);

const level =
  riskScore >= 80 ? "CRITICAL" :
  riskScore >= 50 ? "HIGH" :
  riskScore >= 25 ? "MEDIUM" :
  "LOW";

const report = {
  system: "SHEIKHA_EXTREMISM_RISK_MONITOR_V1",
  mode: "AWARENESS_REPORTING_DEFENSE_ONLY",
  evidence_hash: crypto.createHash("sha256").update(text).digest("hex"),
  riskScore,
  level,
  matches,
  allowed_actions: [
    "log",
    "educational_response",
    "human_review",
    "preserve_evidence",
    "notify_admin",
    "report_to_authorities_if_real_threat"
  ],
  forbidden_actions: [
    "no fighting",
    "no killing",
    "no threats",
    "no retaliation",
    "no targeting people",
    "no unauthorized access"
  ],
  timestamp: new Date().toISOString()
};

fs.mkdirSync("reports/defensive-awareness", { recursive: true });
const file = path.join("reports/defensive-awareness", `awareness-report-${Date.now()}.json`);
fs.writeFileSync(file, JSON.stringify(report, null, 2), "utf8");

console.log(JSON.stringify(report, null, 2));
console.log("REPORT:", file);
