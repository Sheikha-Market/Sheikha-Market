import json
from pathlib import Path

CHIEF_DIRECTORATES = [
    ("C-01", "Chief Executive Officer (CEO M2M)", "كبير المدراء التنفيذيين", "OKRs / BSC / Corporate Governance", "99.8%"),
    ("C-02", "Chief Planning Officer (CPO)", "كبير مدراء التخطيط (تخطيط وتنفيذ)", "PMBOK / Critical Path / Scenario Planning", "99.2%"),
    ("C-03", "Chief Engineering Officer (CEngO)", "كبير مدراء الهندسة", "IEEE / ISO 15288 / NVIDIA Omniverse USD", "99.5%"),
    ("C-04", "Chief Financial Officer (CFO)", "كبير مدراء المالية", "IFRS / Halal Capital / Zero-Riba Liquidity", "99.9%"),
    ("C-05", "Chief Accounting Officer (CAO)", "كبير مدراء المحاسبة", "ZATCA Phase2 UBL 2.1 / 4-Ledgers Split", "100%"),
    ("C-06", "Chief Support Services Officer", "كبير مدراء المساندة", "ITIL v4 / SLA 99.99% / Lean Support", "98.7%"),
    ("C-07", "Chief Supply Chain Officer (CSCO)", "كبير مدراء سلاسل الإمداد والتوريد", "SCOR Model / JIT / WMS Integration", "99.1%"),
    ("C-08", "Chief Logistics Officer (CLO)", "كبير مدراء اللوجستيات", "BOL GPS Live / Maersk-DHL-SIRC GoGreen", "98.9%"),
    ("C-09", "Chief Contracts Officer (CCO)", "كبير مدراء العقود", "FIDIC / Shariah No-Gharar Smart Contracts", "99.6%"),
    ("C-10", "Chief Industrial Officer (CIndO)", "كبير مدراء الصناعة (50 مصنعاً)", "Lean Six Sigma / ISIC 24.10-24.45 / Smelting 1200C", "99.3%"),
    ("C-11", "Chief Technology Officer (CTO)", "كبير مدراء التقنية", "Cloud Run me-central1 / Zero-Trust / Argon", "99.9%"),
    ("C-12", "Chief Knowledge Officer (CKO)", "كبير مدراء المعرفة", "ISO 30401 Knowledge Management / Waqf Edu", "98.8%"),
    ("C-13", "Chief Scientists Council Officer", "كبير مدراء العلماء", "Shariah & Scientific Peer Review", "99.7%"),
    ("C-14", "Chief R&D, Innovation & Exploration", "كبير مدراء البحث والتطوير والابتكار والاستكشاف", "Stage-Gate / KFUPM Lab / Ore Exploration", "99.0%"),
    ("C-15", "Chief Sciences Officer", "كبير مدراء العلوم", "Metallurgy / Spectroscopy Cu 99.99% / Physics", "99.4%"),
    ("C-16", "Chief Computation Officer", "كبير مدراء الحساب", "Algorithmic Verification / SHA-256 / GRAND 10000+", "100%"),
    ("C-17", "Chief Statistics Officer", "كبير مدراء الإحصاء", "Six Sigma SPC / Telemetry & Variance Control", "99.5%"),
    ("C-18", "Chief Training Officer", "كبير مدراء التدريب", "Competency Matrix 18160 / Vocational & AI Training", "98.9%"),
    ("C-19", "Chief Earth & Heavens Stewardship", "كبير مدراء إعمار السماوات والأرض وما بينهما", "Universal Waqf 10% / Green Circular Economy", "99.9%"),
    ("C-20", "Chief Commerce Officer", "كبير مدراء التجارة", "Global Markets LME/COMEX/Tadawul / HS 5000", "99.4%"),
    ("C-21", "Chief Administration Officer", "كبير مدراء الإدارة", "ISO 9001:2015 / Kaizen / Process Excellence", "99.1%"),
    ("C-22", "Chief Quality Officer (CQO)", "كبير مدراء الجودة", "TQM / Six Sigma DMAIC / LME Grade A Lab", "99.9%"),
    ("C-23", "Chief Safety & HSE Officer", "كبير مدراء السلامة", "ISO 45001 / ISO 14001 / Zero Harm", "100%"),
    ("C-24", "Chief Marketing Officer (CMO)", "كبير مدراء التسويق", "100 Marketers Network / Omni-Channel / Meta API", "98.6%"),
    ("C-25", "Chief Sales Officer (CSO)", "كبير مدراء المبيعات", "CEO Buyer Engine 18164 / 10 POS / sheikha.sa", "99.3%"),
    ("C-26", "Chief Projects Officer (CPMO)", "كبير مدراء المشاريع", "PMI PMBOK 7 / PRINCE2 / 128 Digital Twins", "99.2%"),
    ("C-27", "Chief Operating Officer (COO)", "كبير مدراء التشغيل", "29 Sovereign Ports / 20 WMS Warehouses 24/7", "99.8%"),
    ("C-28", "Chief Legal & M2M HR Officer", "كبير مدراء القانون والمحاماة والموارد (M2M HR)", "PDPL / Saudi Labor & GOSI / M2M Agent Registry", "99.9%")
]

M2M_HIERARCHY = {
    "schema": "SHEIKHA_V128_M2M_ENTERPRISE_QUALITY_GOVERNANCE",
    "seal": "BOUND_BY_QURAN_SUNNAH",
    "total_m2m_workforce": 448,
    "breakdown": {
        "chief_officers": 28,
        "executive_and_department_directors": 84,
        "supervisors_and_monitors": 112,
        "engineers_technicians_craftsmen_producers_workers_coordinators_assistants": 168,
        "dedicated_followup_and_development_agents": 56
    },
    "scientific_methodologies_16": [
        "1. Itqan & Shariah Governance (BOUND_BY_QURAN_SUNNAH)",
        "2. ISO 9001:2015 Quality Management System",
        "3. Lean Six Sigma (DMAIC - 3.4 DPMO)",
        "4. Total Quality Management (TQM)",
        "5. Kaizen Continuous Improvement",
        "6. PDCA Cycle (Plan-Do-Check-Act)",
        "7. Balanced Scorecard (BSC - 4 Perspectives)",
        "8. Objectives & Key Results (OKRs)",
        "9. PMI PMBOK 7th Edition",
        "10. PRINCE2 Controlled Projects",
        "11. Agile / Scrum / Kanban",
        "12. SCOR Supply Chain Model",
        "13. ITIL v4 Service Management",
        "14. COBIT 2019 Enterprise IT Governance",
        "15. ISO 45001 & ISO 14001 (HSE & GoGreen)",
        "16. ISO/IEC 27001 & SDAIA PDPL (ZERO_DATA_LEAKAGE)"
    ],
    "licenses_and_certificates_64": {
        "foundry_sovereign_licenses": 38,
        "international_market_metal_certs": 18,
        "national_regulatory_and_iso_certs": 8,
        "identifiers": {
            "cr": "2051263653",
            "unified": "7049031003",
            "vat": "310000000000003",
            "zatca_phase2_uuid": "f18f8146-3bb7-8535-sheikha",
            "lme_grade": "LME Grade A Cu 99.99%",
            "lbma_grade": "LBMA Good Delivery Au 99.99%",
            "isri_grade": "ISRI 200-206 HMS1/HMS2"
        }
    },
    "directorates": [
        {
            "id": code,
            "title_en": en,
            "title_ar": ar,
            "methodology": meth,
            "kpi_score": kpi,
            "roles_active": [
                f"كبير المدراء ({ar})",
                "مدير تنفيذي تخطيط",
                "مدير تنفيذي تنفيذ",
                "مدير إدارة تخصصية",
                "مراقب جودة وأداء (Monitor M2M)",
                "مشرف ميداني (Supervisor M2M)",
                "مهندس / فني / حرفي / منتج / عامل",
                "منسق عمليات ومساعد إداري (Coordinator & Admin Assistant M2M)",
                f"وكيل المتابعة ({code}-FOLLOWUP-M2M)",
                f"وكيل التطوير والتحسين المستمر ({code}-KAIZEN-DEV-M2M)"
            ]
        }
        for code, en, ar, meth, kpi in CHIEF_DIRECTORATES
    ]
}

Path("sheikha_m2m_quality_hierarchy_v128.json").write_text(
    json.dumps(M2M_HIERARCHY, indent=2, ensure_ascii=False), encoding="utf-8"
)
print("✓ تم تفعيل وتوثيق هيكلة الـ 448 وكيلاً (M2M) والمنهجيات الـ 16 والتراخيص الـ 64 بنجاح")
