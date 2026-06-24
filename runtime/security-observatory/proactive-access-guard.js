const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const actor = process.argv[2] || "unknown";
const reason = process.argv.slice(3).join(" ") || "unauthorized_or_suspicious_access";

const message = `
تم منع الوصول.

هذا النظام محمي ومخصص للمستخدمين المصرح لهم فقط.
أي محاولة دخول أو استخدام غير مصرح به يتم توثيقها ومراجعتها وفق السياسات المعتمدة.
لا تتضمن هذه الرسالة أي تهديد أو إساءة، وإنما إشعار نظامي بالحماية ومنع الاستخدام غير المصرح.
`.trim();

const report = {
  system: "SHEIKHA_PROACTIVE_ACCESS_GUARD_V1",
  mode: "DEFENSIVE_ACCESS_CONTROL_ONLY",
  decision: "BLOCK_AND_NOTIFY",
  actor_hash: crypto.createHash("sha256").update(actor).digest("hex"),
  reason,
  message_ar: message,
  actions: [
    "block_access",
    "show_policy_message",
    "log_event",
    "preserve_evidence",
    "notify_admin",
    "require_human_review"
  ],
  forbidden: [
    "no threats",
    "no insults",
    "no retaliation",
    "no hacking back",
    "no harassment",
    "no targeting people"
  ],
  timestamp: new Date().toISOString()
};

fs.mkdirSync("reports/security-observatory", { recursive: true });

const file = path.join(
  "reports/security-observatory",
  `access-guard-${Date.now()}.json`
);

fs.writeFileSync(file, JSON.stringify(report, null, 2), "utf8");

console.log(message);
console.log("\nREPORT:", file);
console.log(JSON.stringify(report, null, 2));
