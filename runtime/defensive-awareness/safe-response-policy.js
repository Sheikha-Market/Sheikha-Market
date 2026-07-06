const level = (process.argv[2] || "LOW").toUpperCase();

const responses = {
  LOW: ["monitor", "educate"],
  MEDIUM: ["monitor", "educate", "human_review"],
  HIGH: ["preserve_evidence", "notify_admin", "human_review", "safe_counter_narrative"],
  CRITICAL: ["preserve_evidence", "notify_admin", "restrict_access_if_authorized", "urgent_human_review", "report_if_real_threat"]
};

console.log(JSON.stringify({
  system: "SHEIKHA_SAFE_RESPONSE_POLICY_V1",
  mode: "DEFENSE_AND_REPORTING_ONLY",
  level,
  actions: responses[level] || responses.LOW,
  note: "لا قتال ولا إيذاء. الإجراء دفاعي: رصد، توعية، حفظ دليل، بلاغ للجهات المختصة عند وجود تهديد حقيقي."
}, null, 2));
