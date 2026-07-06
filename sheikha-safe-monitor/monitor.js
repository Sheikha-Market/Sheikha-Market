const fs = require("fs");
const crypto = require("crypto");

const input = process.argv.slice(2).join(" ").trim();

if (!input) {
  console.log("استخدم: node monitor.js \"النص المراد فحصه\"");
  process.exit(1);
}

const rules = [
  { name: "تحريض على العنف", weight: 50, terms: ["اقتل", "تفجير", "اغتيال", "سلاح", "هجوم"] },
  { name: "تكفير أو تطرف", weight: 35, terms: ["كافر", "مرتد", "خوارج", "استباحة الدم"] },
  { name: "تهديد مباشر", weight: 45, terms: ["سأقتلك", "نهاجم", "نحرق", "نفجر"] },
  { name: "احتيال أو تضليل", weight: 25, terms: ["حول الآن", "رابط مزيف", "اربح", "كلمة المرور"] }
];

let matches = [];
let score = 0;

for (const rule of rules) {
  const found = rule.terms.filter(t => input.includes(t));
  if (found.length) {
    matches.push({ category: rule.name, terms: found });
    score += rule.weight;
  }
}

score = Math.min(score, 100);

const level =
  score >= 80 ? "حرج" :
  score >= 50 ? "مرتفع" :
  score >= 25 ? "متوسط" :
  "منخفض";

const report = {
  system: "SHEIKHA_SAFE_MONITOR_V1",
  purpose: "رصد وبلاغ آمن فقط بدون إيذاء أو استهداف",
  timestamp: new Date().toISOString(),
  evidence_hash: crypto.createHash("sha256").update(input).digest("hex"),
  risk_score: score,
  risk_level: level,
  matches,
  recommendation:
    level === "حرج" || level === "مرتفع"
      ? "مراجعة بشرية عاجلة، وحفظ الدليل، والإبلاغ للجهات المختصة عند وجود تهديد حقيقي."
      : "متابعة وتوعية، ولا يُتخذ أي إجراء عقابي آلي.",
  prohibited_actions: [
    "لا قتال",
    "لا قتل",
    "لا اختراق",
    "لا تشهير",
    "لا استهداف أشخاص",
    "لا تنفيذ عقوبة آلية"
  ]
};

const file = `reports/report-${Date.now()}.json`;
fs.writeFileSync(file, JSON.stringify(report, null, 2), "utf8");

console.log("تم إنشاء تقرير آمن:");
console.log(file);
console.log(report);
