"use strict";

const {
  buildGovernedInspectorCluster
} = require("../inspector-cluster/sheikha-governed-inspector-cluster");

const HEALTH_STAGES = Object.freeze([
  {
    order: 1,
    name: "كشف",
    id: "detect",
    goal: "كشف الخلل أو البطء أو التسريب أو السلوك غير الآمن"
  },
  {
    order: 2,
    name: "تشخيص",
    id: "diagnose",
    goal: "تحديد السبب الجذري ونطاق التأثير"
  },
  {
    order: 3,
    name: "فرز",
    id: "triage",
    goal: "ترتيب الأولوية حسب الخطورة والأثر"
  },
  {
    order: 4,
    name: "عزل",
    id: "isolate",
    goal: "منع امتداد الضرر وحماية الأسرار والبيانات"
  },
  {
    order: 5,
    name: "دواء",
    id: "remedy",
    goal: "اقتراح العلاج الآمن دون تنفيذ مباشر خطر"
  },
  {
    order: 6,
    name: "تداوي",
    id: "treatment",
    goal: "تطبيق خطة علاجية محكومة ومراجعة عند الأثر العالي"
  },
  {
    order: 7,
    name: "تعافي",
    id: "recover",
    goal: "إعادة النظام إلى حالة مستقرة"
  },
  {
    order: 8,
    name: "تحقق",
    id: "verify",
    goal: "اختبار نجاح العلاج وعدم رجوع الخلل"
  },
  {
    order: 9,
    name: "مناعة",
    id: "immunize",
    goal: "منع تكرار الخلل بإضافة حدود وقواعد وفحوص"
  },
  {
    order: 10,
    name: "توثيق",
    id: "audit",
    goal: "تسجيل الدليل في Master Log وتحويله إلى حوكمة إصلاحية"
  }
]);

const CORRECTIVE_GOVERNANCE_RULES = Object.freeze([
  "NO_SECRET_EXPOSURE",
  "NO_ENV_DUMP",
  "NO_CREDENTIAL_LOGGING",
  "NO_UNAUTHORIZED_ACCESS",
  "NO_PRIVILEGE_ESCALATION",
  "NO_DESTRUCTIVE_ACTION_WITHOUT_REVIEW",
  "NO_PRODUCTION_MUTATION_WITHOUT_APPROVAL",
  "TESTS_REQUIRED_BEFORE_PROMOTION",
  "ROLLBACK_PLAN_REQUIRED",
  "MASTER_LOG_REQUIRED",
  "REGISTRY_TRACE_REQUIRED",
  "NO_HARM_GATE_REQUIRED"
]);

function buildHealthFinding(input = {}) {
  const severity = input.severity || "LOW";

  return {
    id: input.id || "finding-general-health",
    title: input.title || "General runtime health finding",
    severity,
    domain: input.domain || "runtime",
    rootCause: input.rootCause || "NOT_ANALYZED",
    impact: input.impact || "UNKNOWN",
    safeToAutoRepair: severity === "LOW",
    humanReviewRequired: ["HIGH", "CRITICAL"].includes(severity),
    timestamp: new Date().toISOString()
  };
}

function buildHealingPrescription(finding = {}) {
  const highImpact = finding.humanReviewRequired === true;

  return {
    findingId: finding.id,
    system: "SHEIKHA_HEALING_PRESCRIPTION",
    status: "READY",
    mode: highImpact
      ? "HUMAN_REVIEW_REQUIRED"
      : "PLAN_ONLY_SAFE_REMEDY",
    medicine: {
      detect: true,
      isolate: true,
      remedyPlan: true,
      recoveryPlan: true,
      verificationPlan: true,
      immunizationPlan: true
    },
    actions: [
      {
        order: 1,
        action: "CREATE_SNAPSHOT",
        required: true
      },
      {
        order: 2,
        action: "APPLY_GOVERNANCE_BOUNDARY",
        required: true
      },
      {
        order: 3,
        action: "PREPARE_REMEDY_PLAN",
        required: true
      },
      {
        order: 4,
        action: "RUN_TESTS",
        required: true
      },
      {
        order: 5,
        action: "WRITE_MASTER_LOG",
        required: true
      },
      {
        order: 6,
        action: "UPDATE_REGISTRY_TRACE",
        required: true
      }
    ],
    restrictions: {
      noDirectShellExecution: true,
      noDirectProductionMutation: true,
      noSecretExposure: true,
      noDestructiveActionWithoutReview: true,
      noHarm: true
    }
  };
}

function buildRegistryIntegration() {
  return {
    system: "SHEIKHA_RECOVERY_REGISTRY_INTEGRATION",
    status: "ACTIVE",
    registryTraceRequired: true,
    registers: [
      "health-finding",
      "root-cause",
      "healing-prescription",
      "recovery-plan",
      "verification-result",
      "immunization-rule",
      "governance-corrective-policy"
    ],
    readiness: {
      registryIntegrationReady: true,
      correctiveTraceReady: true,
      overall: "RECOVERY_REGISTRY_INTEGRATION_READY"
    }
  };
}

function buildMasterLogIntegration() {
  return {
    system: "SHEIKHA_RECOVERY_MASTER_LOG_INTEGRATION",
    status: "ACTIVE",
    masterLogRequired: true,
    logEvents: [
      "HEALTH_FINDING_DETECTED",
      "ROOT_CAUSE_ANALYZED",
      "HEALING_PRESCRIPTION_CREATED",
      "RECOVERY_PLAN_GOVERNED",
      "VERIFICATION_COMPLETED",
      "IMMUNIZATION_RULE_CREATED",
      "CORRECTIVE_GOVERNANCE_PROMOTED"
    ],
    evidenceRequired: true,
    readiness: {
      masterLogIntegrationReady: true,
      evidenceChainReady: true,
      overall: "RECOVERY_MASTER_LOG_INTEGRATION_READY"
    }
  };
}

function buildCorrectiveGovernanceReport(input = {}) {
  const cluster = buildGovernedInspectorCluster(input);
  const finding = buildHealthFinding(input.finding || {});
  const prescription = buildHealingPrescription(finding);
  const registry = buildRegistryIntegration();
  const masterLog = buildMasterLogIntegration();

  const ready =
    cluster.status === "ACTIVE" &&
    prescription.status === "READY" &&
    registry.status === "ACTIVE" &&
    masterLog.status === "ACTIVE";

  return {
    system: "SHEIKHA_RECOVERY_HEALTH_GOVERNANCE",
    version: "1.0.0",
    status: ready ? "ACTIVE" : "DEGRADED",
    mode: "SELF_HEALING_HEALTH_AND_CORRECTIVE_GOVERNANCE_CONTROL_PLANE",
    purpose:
      "طبقة صحة عامة وتعافي ذاتي تحول الاكتشاف والتقارير إلى حوكمة إصلاحية آمنة مرتبطة بالـ Registry و Master Log.",
    healthStages: HEALTH_STAGES,
    finding,
    prescription,
    registryIntegration: registry,
    masterLogIntegration: masterLog,
    correctiveGovernance: {
      status: "ACTIVE",
      rules: CORRECTIVE_GOVERNANCE_RULES,
      reportToGovernance: true,
      promoteReportToPolicy: true,
      noHarmGate: "لا ضرر ولا ضرار",
      planOnlyDefault: true,
      humanReviewForHighImpact: true
    },
    recovery: {
      selfHealingEnabled: true,
      automaticRepairScope: "LOW_RISK_PLAN_ONLY",
      highImpactRequiresHumanReview: true,
      rollbackRequired: true,
      verificationRequired: true,
      immunizationRequired: true
    },
    readiness: {
      healthDetectionReady: true,
      medicineLayerReady: true,
      treatmentPipelineReady: true,
      selfHealingReady: true,
      registryIntegrationReady:
        registry.readiness.overall === "RECOVERY_REGISTRY_INTEGRATION_READY",
      masterLogIntegrationReady:
        masterLog.readiness.overall === "RECOVERY_MASTER_LOG_INTEGRATION_READY",
      correctiveGovernanceReady: true,
      overall: ready
        ? "RECOVERY_HEALTH_GOVERNANCE_READY"
        : "RECOVERY_HEALTH_GOVERNANCE_DEGRADED"
    },
    governance: {
      principle: "لا ضرر ولا ضرار",
      readOnlyDefault: true,
      planOnlyRepair: true,
      noSecretExposure: true,
      noUnauthorizedAccess: true,
      noPrivilegeEscalation: true,
      noProductionMutationWithoutApproval: true,
      auditRequired: true,
      masterLogRequired: true,
      registryTraceRequired: true,
      tawhid: "الله وحده لا شريك له"
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  buildCorrectiveGovernanceReport,
  buildHealthFinding,
  buildHealingPrescription,
  buildRegistryIntegration,
  buildMasterLogIntegration,
  HEALTH_STAGES,
  CORRECTIVE_GOVERNANCE_RULES
};
