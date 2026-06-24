const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const input = process.argv.slice(2).join(" ").trim();

if (!input) {
  console.log('استخدم: node runtime/security-observatory/security-observatory.js "النص أو الحدث الأمني"');
  process.exit(1);
}

const rules = [
  { category: "تحريض أو عنف", weight: 50, terms: ["اقتل", "تفجير", "اغتيال", "هجوم"] },
  { category: "تهديد سيبراني", weight: 45, terms: ["اختراق", "تسريب", "سرقة بيانات", "malware", "ransomware"] },
  { category: "تصيد واحتيال", weight: 35, terms: ["رابط مزيف", "كلمة المرور", "حول الآن", "otp", "phishing"] },
  { category: "تسريب أسرار", weight: 60, terms: ["OPENAI_API_KEY", "JWT_SECRET", "PRIVATE KEY", "password="] }
];

let score = 0;
const matches = [];

for (const rule of rules) {
  const found = rule.terms.filter(t => input.toLowerCase().includes(t.toLowerCase()));
  if (found.length) {
    score += rule.weight;
    matches.push({ category: rule.category, found });
  }
}

score = Math.min(score, 100);

const level =
  score >= 80 ? "CRITICAL" :
  score >= 60 ? "HIGH" :
  score >= 30 ? "MEDIUM" :
  "LOW";

const report = {
  system: "SHEIKHA_SECURITY_OBSERVATORY_V1",
  mode: "DEFENSIVE_ONLY",
  timestamp: new Date().toISOString(),
  evidence_hash: crypto.createHash("sha256").update(input).digest("hex"),
  risk_score: score,
  risk_level: level,
  matches,
  allowed_actions: [
    "alert",
    "log",
    "human_review",
    "block_local_access_when_authorized",
    "rotate_secrets_when_authorized",
    "backup",
    "recover"
  ],
  prohibited_actions: [
    "no violence",
    "no retaliation",
    "no hacking back",
    "no doxxing",
    "no targeting people",
    "no unauthorized access"
  ]
};

fs.mkdirSync("reports/security-observatory", { recursive: true });
const file = path.join("reports/security-observatory", `security-report-${Date.now()}.json`);
fs.writeFileSync(file, JSON.stringify(report, null, 2), "utf8");

console.log("SHEIKHA SECURITY REPORT CREATED:", file);
console.log(JSON.stringify(report, null, 2));
