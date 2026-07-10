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

const INTERPRETER_MODES = [
  "auto",
  "sheikha-program",
  "arabic-accounting",
  "arabic-math",
  "arabic-command"
];
const MAX_SOURCE_LENGTH = 8192;

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

function interpretSheikhaArabicProduction(input, options = {}) {
  const source = String(input || "").trim();
  const requestedMode = String(options.mode || "auto").trim().toLowerCase();

  if (!source) {
    return interpreterResult("INPUT_REQUIRED", requestedMode, {
      interpreted: false,
      message: "النص العربي أو برنامج شيخة مطلوب."
    });
  }
  if (source.length > MAX_SOURCE_LENGTH) {
    return interpreterResult("SOURCE_TOO_LARGE", requestedMode, {
      interpreted: false,
      message: `الحد الأعلى للنص هو ${MAX_SOURCE_LENGTH} حرفًا.`
    });
  }
  if (!INTERPRETER_MODES.includes(requestedMode)) {
    return interpreterResult("UNSUPPORTED_INTERPRETER_MODE", requestedMode, {
      interpreted: false,
      supportedModes: INTERPRETER_MODES
    });
  }
  const mode = requestedMode === "auto" ? detectInterpreterMode(source) : requestedMode;
  const formalReligiousBoundary = mode === "sheikha-program" &&
    hasFormalNonExecutableReligiousBoundary(source);
  if (requiresQualifiedReligiousReview(source) && !formalReligiousBoundary) {
    return interpreterResult("QUALIFIED_REVIEW_REQUIRED", requestedMode, {
      interpreted: false,
      executionAllowed: false,
      message: "الفتوى والحكم الشرعي الملزم يحتاجان مراجعة أهل العلم المؤهلين."
    });
  }

  try {
    if (mode === "sheikha-program") return interpretSheikhaProgram(source);
    if (mode === "arabic-accounting") return interpretArabicAccounting(source);
    if (mode === "arabic-math") return interpretArabicMath(source);
    if (mode === "arabic-command") return interpretArabicCommand(source);
    return interpreterResult("NEEDS_CLARIFICATION", mode, {
      interpreted: false,
      message: "لم يتحدد نوع التفسير العربي المطلوب.",
      supportedModes: INTERPRETER_MODES
    });
  } catch (error) {
    return interpreterResult("INTERPRETATION_BLOCKED", mode, {
      interpreted: false,
      executionAllowed: false,
      error: String(error && error.message ? error.message : error)
    });
  }
}

function detectInterpreterMode(source) {
  if (/^(?:بسم_الله|كيان|إجراء|مرجعية|سياسة|منهج)(?:\s|$)/m.test(source)) {
    return "sheikha-program";
  }
  if (/[٠-٩۰-۹0-9]/.test(source) &&
      /(?:زائد|ناقص|ضرب|قسمة|لوغاريتم|جذر|أس)/.test(source)) {
    return "arabic-math";
  }
  if (/حساب_/.test(source) && /(?:من|إلى|الى|على|في)/.test(source)) {
    return "arabic-accounting";
  }
  if (Object.keys(COMMANDS).some((command) => source.startsWith(command))) {
    return "arabic-command";
  }
  return "unknown";
}

function interpretSheikhaProgram(source) {
  const ast = parse(lex(source));
  const types = typeCheckAst(ast);
  if (!types.ok) {
    return interpreterResult("TYPE_CHECK_BLOCKED", "sheikha-program", {
      interpreted: false,
      executionAllowed: false,
      diagnostics: types.diagnostics
    });
  }

  const ir = lowerToIR(ast);
  const bytecode = compileIRToBytecode(ir);
  const vm = runBytecode(bytecode, {
    profile: "production",
    strictIsolation: true,
    live: false
  });

  return interpreterResult(vm.ok ? "INTERPRETED" : "GOVERNANCE_BLOCKED", "sheikha-program", {
    interpreted: vm.ok,
    executionAllowed: false,
    sourceLanguage: "العربية",
    astNodes: ast.body.length,
    irSteps: ir.steps.length,
    bytecodeInstructions: bytecode.instructions.length,
    output: vm.state.output,
    governanceViolations: vm.state.governance.violations,
    sandbox: {
      profile: vm.state.sandbox.profile,
      strict: vm.state.sandbox.strict
    }
  });
}

function interpretArabicAccounting(source) {
  const result = runArabicV2(source);
  const interpreted = result.result.status === "EXECUTED";
  return interpreterResult(interpreted ? "INTERPRETED" : "NEEDS_MORE_CONTEXT", "arabic-accounting", {
    interpreted,
    executionAllowed: false,
    sourceLanguage: "العربية",
    bytecodeStatus: result.program.status,
    runtimeStatus: result.result.status,
    ledger: result.result.ledger || [],
    traceLength: result.result.trace ? result.result.trace.length : 0
  });
}

function interpretArabicMath(source) {
  const result = evaluateSimpleArabicMath(source);
  const interpreted = result.status === "EVALUATED";
  return interpreterResult(interpreted ? "INTERPRETED" : "NEEDS_MORE_CONTEXT", "arabic-math", {
    interpreted,
    executionAllowed: false,
    sourceLanguage: "العربية",
    value: result.result,
    ir: result.compiled.ir
  });
}

function interpretArabicCommand(source) {
  const parsed = parseSheikhaArabic(source);
  return interpreterResult(parsed.allowed ? "INTERPRETED_DRY_RUN" : "NEEDS_CLARIFICATION", "arabic-command", {
    interpreted: parsed.allowed,
    executionAllowed: false,
    sourceLanguage: "العربية",
    command: parsed.command,
    action: parsed.action,
    explanation: parsed.explanation
  });
}

function requiresQualifiedReligiousReview(source) {
  return /(?:فتوى|أفتني|حكم\s+شرعي|حكم_شرعي|تحليل|تحريم)/u.test(source);
}

function hasFormalNonExecutableReligiousBoundary(source) {
  return /السلطة_البرمجية\s*:\s*لا/u.test(source) &&
    /الفتوى_الآلية\s*:\s*ممنوعة/u.test(source) &&
    /المراجعة_الشرعية\s*:\s*أهل_العلم/u.test(source);
}

function interpreterResult(status, mode, detail) {
  return {
    system: "SHEIKHA_ARABIC_PRODUCTION_INTERPRETER_V1",
    status,
    mode,
    arabicPrimary: true,
    externalExecution: false,
    automaticHighImpactDecision: false,
    valuesReferenceExecutable: false,
    automatedFatwaAllowed: false,
    declaredPurpose: "الخير والنفع لله وحده",
    declaredPurposeIsMachineVerifiableIntention: false,
    ...detail
  };
}

module.exports = {
  parseSheikhaArabic,
  interpretSheikhaArabicProduction,
  detectInterpreterMode,
  INTERPRETER_MODES,
  MAX_SOURCE_LENGTH,
  COMMANDS,
  GOVERNANCE
};
"use strict";

const { lex } = require("../../../sheikha-language/compiler/lexer");
const { parse } = require("../../../sheikha-language/compiler/parser");
const { typeCheckAst } = require("../../../sheikha-language/compiler/type-checker");
const { lowerToIR } = require("../../../sheikha-language/compiler/ir");
const { compileIRToBytecode } = require("../../../sheikha-language/compiler/bytecode");
const { runBytecode } = require("../../../sheikha-language/compiler/bytecode-vm");
const { evaluateSimpleArabicMath } = require("../sheikha-arabic/math/arabic-math-evaluator");
const { runArabicV2 } = require("../sheikha-arabic/vm/v2/run-arabic-v2");
