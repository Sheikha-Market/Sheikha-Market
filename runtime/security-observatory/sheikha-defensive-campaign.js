const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const actor = process.argv[2] || "unknown";
const event = process.argv.slice(3).join(" ") || "suspicious_event";

const riskTerms = ["اختراق", "تسريب", "احتيال", "تحويل مشبوه", "دخول غير مصرح", "JWT_SECRET", "PRIVATE KEY"];
const matched = riskTerms.filter(t => event.toLowerCase().includes(t.toLowerCase()));
const riskScore = Math.min(matched.length * 35, 100);

const level =
  riskScore >= 80 ? "CRITICAL" :
  riskScore >= 50 ? "HIGH" :
  riskScore >= 25 ? "MEDIUM" :
  "LOW";

const decision =
  level === "CRITICAL" ? "BLOCK_FREEZE_REVIEW" :
  level === "HIGH" ? "BLOCK_AND_REVIEW" :
  level === "MEDIUM" ? "CHALLENGE_AND_REVIEW" :
  "LOG_ONLY";

const report = {
  system: "SHEIKHA_DEFENSIVE_CAMPAIGN_V1",
  arabic_name: "غزوة شيخة الدفاعية - اسم رمزي للحماية فقط",
  mode: "DEFENSE_ONLY_NO_ATTACK",
  actor_hash: crypto.createHash("sha256").update(actor).digest("hex"),
  event,
  matched,
  riskScore,
  level,
  decision,
  allowed_actions: [
    "deny_unauthorized_access",
    "block_suspicious_session",
    "freeze_suspicious_transaction_for_review",
    "require_mfa",
    "notify_admin",
    "preserve_evidence",
    "human_review",
    "recover_services"
  ],
  forbidden_actions: [
    "no violence",
    "no threats",
    "no hacking back",
    "no retaliation",
    "no harassment",
    "no targeting people",
    "no unauthorized access"
  ],
  message_ar: "تم اتخاذ إجراء أمني احترازي لحماية النظام والمستخدمين. تم تسجيل الحدث وإحالته للمراجعة وفق السياسات المعتمدة.",
  timestamp: new Date().toISOString()
};

fs.mkdirSync("reports/security-observatory", { recursive: true });
const file = path.join("reports/security-observatory", `defensive-campaign-${Date.now()}.json`);
fs.writeFileSync(file, JSON.stringify(report, null, 2), "utf8");

console.log(JSON.stringify(report, null, 2));
