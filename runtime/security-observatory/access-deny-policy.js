const event = process.argv.slice(2).join(" ") || "unknown access attempt";

const response = {
  system: "SHEIKHA_ACCESS_DENY_POLICY_V1",
  mode: "DEFENSE_ONLY",
  decision: "DENY_ACCESS",
  reason: "Unauthorized or suspicious access attempt",
  message_ar: "تم رفض الوصول. هذا النظام مخصص للمستخدمين المصرح لهم فقط.",
  actions: [
    "deny_access",
    "log_event",
    "preserve_evidence",
    "notify_admin",
    "require_human_review"
  ],
  prohibited: [
    "no retaliation",
    "no threats",
    "no hacking back",
    "no harassment",
    "no targeting people"
  ],
  event
};

console.log(JSON.stringify(response, null, 2));
