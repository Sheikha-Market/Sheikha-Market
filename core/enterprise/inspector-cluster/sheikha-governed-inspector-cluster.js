"use strict";

const {
  buildCentralInspector
} = require("../central-inspector/sheikha-central-inspector");

const CLUSTER_LAYERS = Object.freeze([
  "central-inspection",
  "governance-boundary",
  "safety-supervision",
  "development-governance",
  "operational-guard",
  "corrective-production-line",
  "audit-evidence",
  "no-harm-gate"
]);

function buildNoHarmGate() {
  return {
    principle: "لا ضرر ولا ضرار",
    status: "ACTIVE",
    blocks: [
      "SECRET_LEAK",
      "UNAUTHORIZED_ACCESS",
      "PRIVILEGE_ESCALATION",
      "DESTRUCTIVE_MUTATION",
      "PRODUCTION_CHANGE_WITHOUT_REVIEW",
      "UNSAFE_OPERATION",
      "UNREVIEWED_HIGH_IMPACT_ACTION"
    ],
    allows: [
      "READ_ONLY_INSPECTION",
      "PLAN_ONLY_REPAIR",
      "AUDITED_DIAGNOSTIC",
      "HUMAN_REVIEWED_CORRECTION"
    ]
  };
}

function buildCorrectiveProductionLine() {
  return {
    system: "SHEIKHA_CORRECTIVE_PRODUCTION_LINE",
    status: "ACTIVE",
    mode: "GOVERNED_PLAN_ONLY_REPAIR_PIPELINE",
    stages: [
      {
        order: 1,
        name: "detect",
        goal: "كشف الخطأ أو الخطر أو البطء"
      },
      {
        order: 2,
        name: "classify",
        goal: "تصنيف الخطورة والتأثير"
      },
      {
        order: 3,
        name: "govern",
        goal: "تطبيق حدود الحوكمة قبل أي إصلاح"
      },
      {
        order: 4,
        name: "isolate",
        goal: "عزل الضرر ومنع التسريب أو الامتداد"
      },
      {
        order: 5,
        name: "plan",
        goal: "إنشاء خطة إصلاح آمنة"
      },
      {
        order: 6,
        name: "review",
        goal: "مراجعة بشرية للإجراءات عالية الأثر"
      },
      {
        order: 7,
        name: "verify",
        goal: "اختبار الإصلاح قبل اعتماده"
      },
      {
        order: 8,
        name: "audit",
        goal: "تسجيل الأثر والدليل"
      }
    ],
    executionPolicy: {
      readOnlyDefault: true,
      planOnlyByDefault: true,
      noDirectProductionMutation: true,
      humanReviewForHighImpact: true,
      rollbackRequired: true,
      testsRequired: true,
      auditRequired: true
    }
  };
}

function buildGovernedInspectorCluster(options = {}) {
  const central = buildCentralInspector(options);
  const noHarmGate = buildNoHarmGate();
  const correctiveLine = buildCorrectiveProductionLine();

  const ready =
    central.status === "ACTIVE" &&
    noHarmGate.status === "ACTIVE" &&
    correctiveLine.status === "ACTIVE";

  return {
    system: "SHEIKHA_GOVERNED_INSPECTOR_CLUSTER",
    version: "1.0.0",
    status: ready ? "ACTIVE" : "DEGRADED",
    mode: "CENTRAL_SUPERVISORY_GOVERNANCE_AND_CORRECTIVE_RUNTIME_CLUSTER",
    architecture: {
      goal:
        "إنشاء وحدة إشرافية رقابية حاكمة تمنع الأخطاء والتسريبات والضرر، وتحوّل الأعطال إلى خط إنتاج إصلاحي آمن.",
      layers: CLUSTER_LAYERS,
      operatingModel:
        "Inspect → Govern → Prevent Harm → Plan Repair → Verify → Audit"
    },
    centralInspector: {
      status: central.status,
      summary: central.summary
    },
    noHarmGate,
    correctiveProductionLine: correctiveLine,
    supervision: {
      runtime: true,
      security: true,
      governance: true,
      development: true,
      deployment: true,
      liveChat: true,
      ai: true,
      storage: true,
      network: true,
      audit: true
    },
    boundaries: {
      noSecretExposure: true,
      noEnvDump: true,
      noCredentialLogging: true,
      noUnauthorizedAccess: true,
      noPrivilegeEscalation: true,
      noShellExecutionByDefault: true,
      noFileMutationByDefault: true,
      noProductionChangeWithoutReview: true
    },
    readiness: {
      centralInspectorReady: central.status === "ACTIVE",
      governanceClusterReady: true,
      noHarmGateReady: true,
      correctiveLineReady: true,
      auditReady: true,
      overall: ready
        ? "GOVERNED_INSPECTOR_CLUSTER_READY"
        : "GOVERNED_INSPECTOR_CLUSTER_DEGRADED"
    },
    governance: {
      principle: "لا ضرر ولا ضرار",
      readOnlyDefault: true,
      planOnlyRepair: true,
      humanReviewForHighImpact: true,
      auditRequired: true,
      tawhid: "الله وحده لا شريك له"
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  buildGovernedInspectorCluster,
  buildNoHarmGate,
  buildCorrectiveProductionLine,
  CLUSTER_LAYERS
};
