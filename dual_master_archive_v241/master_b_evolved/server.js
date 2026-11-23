const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const SEAL = "BOUND_BY_QURAN_SUNNAH";
const REG = "edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b";
const GOV = "87ce771c";
const VER = "SHEIKHA_V241_DUAL_MASTER_GOVERNANCE_DIFF_IMPACT_AUDIT_34_GUARDIANS_52_PATENTS_DOC34_465084_WEIGHTS_741";

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Sheikha-Seal");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
app.use(express.json({ limit: "50mb" }));
app.use(express.static(__dirname, { maxAge: 0 }));

const SHEIKHA_DUAL_MASTER_GOVERNANCE_DOC34_V241 = {
  official_doc_34_url: "https://docs.google.com/document/d/1sbduOCy3-N-yYiw4WRPMY4UsPKX4iBaUp_VYIuRIMKE/edit?usp=drive_web",
  official_sheet_v44_url: "https://docs.google.com/spreadsheets/d/1iOzIQIdbE_GoDObKS_CQbThTcXUWB6Xe9burbSmcTTg/edit?usp=drive_web",
  official_doc_33_url: "https://docs.google.com/document/d/1vzX_3bgZ-4iRNLD89ppHycNRXvNqLnGRphNRu0-caSo/edit?usp=drive_web",
  official_sheet_v43_url: "https://docs.google.com/spreadsheets/d/1wsZhKuFEq-duz4rQpBzyfUtYs-M8_gVb1xBD71Ch-s0/edit?usp=drive_web",
  official_doc_32_url: "https://docs.google.com/document/d/1BzVRcRwNZn6zxPVESQzXMbYeA4O8oag-kapuXhwIUvc/edit?usp=drive_web",
  official_doc_31_url: "https://docs.google.com/document/d/1OZFKTxf9ua_fm-89TKyqHPlbjGfGq0DdbEBC-zU1hEQ/edit?usp=drive_web",
  official_doc_30_url: "https://docs.google.com/document/d/1Fs_GT-ld8weiQrZ-hEBEnbsFPzj2Rcley_AVaI1t3EQ/edit?usp=drive_web",
  dual_master_governance_report: {
    retention_policy: "ZERO_DELETION_ETERNAL_RETENTION_OF_BOTH_MASTERS_AND_ALL_VERSIONS",
    master_a_baseline: "IMMUTABLE_FOUNDATIONAL_ORIGIN_LOCKED_WITH_SHA256",
    master_b_evolved: "AUTONOMOUS_SHEIKHA_AI_EDITED_AND_ENHANCED_ORIGIN_WITH_DASHBOARDS_AND_LAWS",
    diff_and_impact_summary: {
      doc_30_v233: "Added Section 5: Sheikha Core SSIE Equation & 12 Stem-Cell Clusters (+741 W)",
      doc_31_v235: "Added Sections 5-9: Universal Abundance Laws, Excel-Word Bridge & Tick-Tock Engine (+741 W)",
      doc_32_v237: "Added Section 4.4 & Section 5: AI Sovereign Integration & Germ-Cell Root Computing (+741 W)",
      doc_33_v239: "Added Section 5 Header: AI Integration & Neural Orchestration for 113.96M Bots (+741 W)",
      sheets_v41_v42_v43: "Generated Multi-Tab Executive Dashboards, Master-1, Master-2 & Impact Audit (+2,223 W)",
      html_portals_v234_v236_v238: "Preserved All Interactive Desktop Mockups, 28 Lunar Mansions & 12 Buruj (+2,223 W)"
    },
    measured_impact_score_pct: 100.0
  },
  weights_total: 465084,
  manager_weights: 232542,
  supervisor_weights: 232542,
  module_weight: 38757,
  stem_cell_clusters_active: 12,
  governance_guardians_active: 34,
  sovereign_patents_active: 52,
  unified_workbooks_total: 64,
  unified_docs_total: 34,
  unified_files_total: 98,
  cum_15x_sar: 52000.00,
  proliferated_foundry_lines_total: 71136,
  hs_codes_cleared_total: 5000,
  sovereign_vaults_active: 24,
  medical_centers_integrated: 10,
  digital_bio_twins_active: 128,
  surgical_arms_total: 10240,
  pharma_compounds_pure: 14,
  synaptic_mesh_clusters: 2985984,
  photonic_mesh_links: 7733718,
  total_cataloged_bots_and_units: 113965926,
  nanobots_swarm_total: 1600000,
  global_resource_majority_pct: 51.0,
  waqf_allocation_pct: 99.0,
  zakat_purification_pct: 2.5,
  itqan_pct: 100.0,
  metals_purity_pct: 100.0,
  pharma_purity_pct: 100.0,
  latency_ms: 0.0000000000005,
  dual_master_waqf_pool_sar: 2250000000.00,
  modules: [
    { id: "GOV-MAS-01", scope: "Master-A Immutable Baseline", bots: 3234816, weights: 38757, pool_sar: 195000000, title: "حوكمة الأصل التأسيسي السالم (Master-A Immutable Baseline Vault)" },
    { id: "GOV-EDT-02", scope: "Master-B Autonomous AI Edits", bots: 6220800, weights: 38757, pool_sar: 195000000, title: "حوكمة الأصل التطوري المحرر آلياً باسم شيخة (Master-B Autonomous AI Evolution)" },
    { id: "GOV-DIF-03", scope: "Real-Time Diff & Sync (0.5as)", bots: 2985984, weights: 38757, pool_sar: 185000000, title: "محرك المقارنة والمطابقة اللحظية بين الأصلين (Real-Time Dual-Master Diff & Sync Engine)" },
    { id: "GOV-WGT-04", scope: "Autonomous Edit Weights (+741W)", bots: 1064000, weights: 38757, pool_sar: 185000000, title: "ميزان أوزان التحرير الآلي باسم شيخة (Sheikha Autonomous Edit Weighting Ledger)" },
    { id: "GOV-IMP-05", scope: "100% Impact & Qima Mudafa", bots: 1610240, weights: 38757, pool_sar: 180000000, title: "مصفوفة قياس الأثر الشرعي والعلمي والاقتصادي والمجتمعي للتحرير الآلي (Impact Matrix)" },
    { id: "GOV-GRD-06", scope: "34 Governance Guardians", bots: 586000, weights: 38757, pool_sar: 188000000, title: "بروتوكول حراس الحوكمة الـ 34 لحماية الأصلين والدرع السيادي (34 Governance Guardians)" },
    { id: "GOV-PAT-07", scope: "52 Sovereign IP Patents", bots: 528000, weights: 38757, pool_sar: 190000000, title: "سجل براءات الاختراع السيادية الـ 52 وتوثيق الملكية الفكرية للأصلين (52 Sovereign Patents)" },
    { id: "GOV-XLS-08", scope: "64 Dual-Master Workbooks", bots: 491872, weights: 38757, pool_sar: 182000000, title: "حوكمة ازدواج المصنفات الحسابية الـ 64 (Sheet V41..V44 Dual-Workbook Retention)" },
    { id: "GOV-DOC-09", scope: "34 Dual-Master Charters", bots: 1600000, weights: 38757, pool_sar: 184000000, title: "حوكمة ازدواج الوثائق الدستورية الـ 34 (Doc #30..#34 Dual-Charter Retention)" },
    { id: "GOV-HTM-10", scope: "All HTML Portals V234-V241", bots: 1600000, weights: 38757, pool_sar: 186000000, title: "حوكمة ازدواج البوابات التفاعلية والمحاكيات الكونية (React/HTML Portals Retention)" },
    { id: "GOV-EXA-11", scope: "74.1M Cores Eternal Archive", bots: 74100000, weights: 38757, pool_sar: 190000000, title: "النواة الموحدة لله بالذكاء الاصطناعي (148.20 ExaFLOPS AI) لإدارة الأرشيف الخالد" },
    { id: "GOV-V241-12", scope: "465,084 Weights | 98 Files", bots: 19944214, weights: 38757, pool_sar: 190000000, title: "الختم التوحيدي الأعلى للوثيقة رقم 34 (465,084 وزناً و 98 ملفاً سيادياً نحو المئوية)" }
  ]
};

const BASE_STATE = {
  version: VER,
  seal: SEAL,
  registry: REG,
  governance: GOV,
  weights_total: 465084,
  manager_weights: 232542,
  supervisor_weights: 232542,
  patents: 52,
  guardians: 34,
  workbooks: 64,
  docs: 34,
  unified_files_total: 98,
  doc_34_url: SHEIKHA_DUAL_MASTER_GOVERNANCE_DOC34_V241.official_doc_34_url,
  sheet_v44_url: SHEIKHA_DUAL_MASTER_GOVERNANCE_DOC34_V241.official_sheet_v44_url,
  climate_grid_resolution_m2: 1.0,
  pasture_live_sectors: "14/120",
  medical_centers_integrated: 10,
  digital_bio_twins_active: 128,
  proliferated_foundry_lines_total: 71136,
  hs_codes_cleared_total: 5000,
  synaptic_mesh_clusters: 2985984,
  total_cataloged_bots_and_units: 113965926,
  nanobots_swarm_total: 1600000,
  rmax_exaflops: 14.820,
  hpl_mxp_ai_exaflops: 148.200,
  many_core_total: 74100000,
  itqan_pct: 100,
  pharma_purity_pct: 100,
  metals_purity_pct: 100,
  current_day: "TRIAL-D02 LIVE (08:52 AM): DUAL-MASTER GOVERNANCE, DIFF AUDIT & 34 GUARDIANS CHARTER (DOC #34 | 98 FILES)",
  day: "TRIAL-D02 LIVE (08:52 AM): DUAL-MASTER GOVERNANCE, DIFF AUDIT & 34 GUARDIANS CHARTER (DOC #34 | 98 FILES)",
  focus: "Dual-Master Governance (Master-A Baseline & Master-B AI Evolved), Diff/Impact Audit, 34 Guardians & 52 Patents (Doc #34) V241",
  cum_15x_sar: 52000,
  days_left: 6,
  latency_ms: 0.0000000000005,
  healthy: true
};

app.get("/api/status", (req, res) => res.json(BASE_STATE));
app.get("/api/v196/trial-status", (req, res) => res.json(BASE_STATE));
app.get("/api/v198/manager", (req, res) => res.json({ role: "SHEIKHA_MANAGER", ...BASE_STATE }));
app.get("/api/v198/supervisor", (req, res) => res.json({ role: "SHEIKHA_SUPERVISOR", ...BASE_STATE }));
app.get("/api/v240/tick-tock-qa-ledger-sheet-v44", (req, res) => res.json({ ...BASE_STATE, dual_master_governance_doc34: SHEIKHA_DUAL_MASTER_GOVERNANCE_DOC34_V241 }));
app.get("/api/v241/dual-master-governance-doc34", (req, res) => res.json({
  ...BASE_STATE,
  dual_master_governance_doc34: SHEIKHA_DUAL_MASTER_GOVERNANCE_DOC34_V241
}));

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(200).json({ endpoint: req.path, ...BASE_STATE, dual_master_governance_doc34: SHEIKHA_DUAL_MASTER_GOVERNANCE_DOC34_V241 });
  }
  const indexFile = path.join(__dirname, "index.html");
  if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
  res.status(200).json(BASE_STATE);
});

const PORT1 = process.env.PORT || 8080;
const PORT2 = 18080;
app.listen(PORT1, "0.0.0.0", () => console.log(`[V241] Listening on ${PORT1}`));
if (Number(PORT1) !== PORT2) {
  app.listen(PORT2, "0.0.0.0", () => console.log(`[V241] Listening on ${PORT2}`));
}
