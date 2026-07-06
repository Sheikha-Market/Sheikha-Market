const GOVERNANCE = {
  tawhid: "الله وحده لا شريك له",
  noGhaybClaims: true,
  noHarm: true,
  auditRequired: true
};

const COMMANDS = {
  "فعّل": "ACTIVATE",
  "أوقف": "STOP",
  "تحقق": "VALIDATE",
  "ارصد": "OBSERVE",
  "حلل": "ANALYZE",
  "قِس": "MEASURE",
  "اكتب": "WRITE",
  "تقرير": "REPORT"
};

function parseSheikhaArabic(input) {
  const text = String(input || "").trim();

  const command = Object.keys(COMMANDS).find((word) => text.startsWith(word));
  const action = command ? COMMANDS[command] : "UNKNOWN";

  return {
    system: "SHEIKHA_ARABIC_PROGRAMMING_RUNTIME",
    status: action === "UNKNOWN" ? "NEEDS_CLARIFICATION" : "PARSED",
    input: text,
    command: command || null,
    action,
    governance: GOVERNANCE,
    allowed: action !== "UNKNOWN",
    explanation: action === "UNKNOWN"
      ? "لم يتم التعرف على الأمر البرمجي العربي."
      : `تم تفسير الأمر '${command}' كإجراء '${action}' تحت الحوكمة.`
  };
}

module.exports = {
  parseSheikhaArabic,
  COMMANDS,
  GOVERNANCE
};
