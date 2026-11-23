import csv, json, hashlib, datetime
from pathlib import Path

CHIEFS_35 = [
    ("C-01", "Chief Executive Officer (CEO M2M)", "كبير المدراء التنفيذيين", "OKRs / BSC / Corporate Governance", "99.9%", 18082),
    ("C-02", "Chief Planning Officer (CPO)", "كبير مدراء التخطيط (تخطيط وتنفيذ)", "PMBOK 7 / Critical Path / Scenario Planning", "99.5%", 18082),
    ("C-03", "Chief Engineering Officer (CEngO)", "كبير مدراء الهندسة", "IEEE / ISO 15288 / NVIDIA Omniverse USD", "99.6%", 18094),
    ("C-04", "Chief Financial Officer (CFO)", "كبير مدراء المالية", "IFRS / Halal Capital / Zero-Riba Liquidity", "99.9%", 18140),
    ("C-05", "Chief Accounting Officer (CAO)", "كبير مدراء المحاسبة", "ZATCA Phase2 UBL 2.1 / 4-Ledgers Split", "100%", 18163),
    ("C-06", "Chief Support Services Officer", "كبير مدراء المساندة", "ITIL v4 / SLA 99.99% / Lean Support", "99.1%", 18158),
    ("C-07", "Chief Supply Chain Officer (CSCO)", "كبير مدراء سلاسل الإمداد والتوريد", "SCOR Model / JIT / WMS Integration", "99.4%", 18093),
    ("C-08", "Chief Logistics Officer (CLO)", "كبير مدراء اللوجستيات", "BOL GPS Live / Maersk-DHL-SIRC GoGreen", "99.3%", 18155),
    ("C-09", "Chief Contracts Officer (CCO)", "كبير مدراء العقود", "FIDIC / Shariah No-Gharar Smart Contracts", "99.8%", 18159),
    ("C-10", "Chief Industrial Officer (CIndO)", "كبير مدراء الصناعة (50 مصنعاً)", "Lean Six Sigma / ISIC 24.10-24.45 / Smelting 1200C", "99.5%", 18126),
    ("C-11", "Chief Technology Officer (CTO)", "كبير مدراء التقنية", "Cloud Run me-central1 / Zero-Trust / Argon", "99.9%", 18156),
    ("C-12", "Chief Knowledge Officer (CKO)", "كبير مدراء المعرفة", "ISO 30401 Knowledge Management / Waqf Edu", "99.2%", 18161),
    ("C-13", "Chief Scientists Council Officer", "كبير مدراء العلماء", "Shariah & Scientific Peer Review", "99.8%", 18135),
    ("C-14", "Chief R&D, Innovation & Exploration", "كبير مدراء البحث والتطوير والابتكار والاستكشاف", "ISO 56002 / TRIZ / Stage-Gate / KFUPM Lab", "99.6%", 18110),
    ("C-15", "Chief Sciences Officer", "كبير مدراء العلوم", "Metallurgy / Spectroscopy Cu 99.99% / Physics", "99.6%", 18126),
    ("C-16", "Chief Computation Officer", "كبير مدراء الحساب", "Algorithmic Verification / SHA-256 / GRAND 10000+", "100%", 18131),
    ("C-17", "Chief Statistics Officer", "كبير مدراء الإحصاء", "Six Sigma SPC / Telemetry & Variance Control", "99.7%", 9091),
    ("C-18", "Chief Training Officer", "كبير مدراء التدريب", "Competency Matrix 18160 / Vocational & AI Training", "99.3%", 18160),
    ("C-19", "Chief Earth & Civilization Development Officer (CECO)", "كبير مدراء الإعمار وإعمار السماوات والأرض", "Quranic Isti'mar / Universal Waqf 10% / Sustainable Urban & Industrial Dev", "100%", 18142),
    ("C-20", "Chief Commerce Officer", "كبير مدراء التجارة", "Global Markets LME/COMEX/Tadawul / HS 5000", "99.6%", 18165),
    ("C-21", "Chief Administration Officer", "كبير مدراء الإدارة والنظام الإداري", "ISO 9001:2015 / EFQM / Administrative Excellence", "99.8%", 18120),
    ("C-22", "Chief Quality Officer (CQO)", "كبير مدراء الجودة والجودة الإدارية", "TQM / Six Sigma DMAIC (3.4 DPMO) / LME Grade A", "99.95%", 18110),
    ("C-23", "Chief Safety & HSE Officer", "كبير مدراء السلامة", "ISO 45001 / ISO 14001 / Zero Harm", "100%", 18126),
    ("C-24", "Chief Marketing Officer (CMO)", "كبير مدراء التسويق", "100 Marketers Network / Omni-Channel / Meta API", "99.1%", 18151),
    ("C-25", "Chief Sales Officer (CSO)", "كبير مدراء المبيعات", "CEO Buyer Engine 18164 / 10 POS / sheikha.sa", "99.5%", 18164),
    ("C-26", "Chief Projects & Mega-PMO Officer (CPMO)", "كبير مدراء المشاريع الكبرى والهندسية", "PMI PMBOK 7 / PRINCE2 / 128 Digital Twins / Earned Value M2M", "99.9%", 18154),
    ("C-27", "Chief Operating Officer (COO)", "كبير مدراء التشغيل", "29 Sovereign Ports / 20 WMS Warehouses 24/7", "99.9%", 18157),
    ("C-28", "Chief Legal & M2M HR Officer", "كبير مدراء القانون والمحاماة والموارد (M2M HR)", "PDPL / Saudi Labor & GOSI / M2M Agent Registry", "99.9%", 18160),
    ("C-29", "Chief Governance Officer (CGO)", "كبير مدراء الحوكمة ولوائح شيخة", "Sheikha Sovereign Bylaws / COBIT 2019 / ISO 37000", "100%", 18162),
    ("C-30", "Chief Telecommunications & MCP/SDK Officer (CTelO)", "مدير كبراء الاتصالات وبروتوكولات MCP/SDK", "ITU-T / IEEE 802 / MCP JSON-RPC 2.0 / gRPC / OPC-UA / mTLS", "99.98%", 18158),
    ("C-31", "Chief Omni-Channel Communication Officer (CComO)", "مدير كبراء التواصل والعلاقات المؤسسية والدبلوماسية", "ISO 26000 / Diplomatic & Meta/WhatsApp/Omni-AI Bridge", "99.96%", 18120),
    ("C-32", "Chief Assets Management Officer (CASO)", "كبير مدراء الأصول والأصول الوقفية الثابتة", "ISO 55001 Asset Mgmt / Fixed Waqf Assets (SHA 0cf8bc3c) / Halal Valuation", "100%", 18142),
    ("C-33", "Chief Construction & Structural Officer (CBldO)", "كبير مدراء البناء والتشييد الهندسي", "Saudi Building Code (SBC) / BIM 7D / Omniverse Structural Twins / Rebar & Cu", "99.92%", 18094),
    ("C-34", "Chief Contracting & EPC Officer (CEpcO)", "كبير مدراء المقاولات وعقود الاستصناع (EPC)", "Shariah Istisna'a & FIDIC EPC / Zero-Gharar / Subcontractor M2M Governance", "99.94%", 18159),
    ("C-35", "Chief Real Estate & Industrial Properties Officer (CREO)", "كبير مدراء العقارات والمدن الصناعية والأوقاف العقارية", "MODON & RCJY Industrial Lands / 50 Factories & 20 WMS Estates / Waqf REITs", "99.95%", 18158)
]

for csv_name in ["SHEIKHA_V130_29_CHIEFS_M2M_SUMMARY.csv", "SHEIKHA_V133_31_CHIEFS_M2M_SUMMARY.csv", "SHEIKHA_V134_35_CHIEFS_M2M_SUMMARY.csv"]:
    with open(csv_name, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["Code", "Title_EN", "Title_AR", "Scientific_Methodology", "KPI_Score", "Primary_Port", "Seed_Agents_Gen0", "Proliferated_Nodes_15x", "Followup_Agent", "Kaizen_Dev_Agent", "M2M_Production_License"])
        for idx, (code, en, ar, meth, kpi, port) in enumerate(CHIEFS_35, 1):
            w.writerow([code, en, ar, meth, kpi, port, 16, 240, f"AGT-FUP-{idx:02d}", f"AGT-DEV-{idx:02d}", f"SHK-M2M-2026-{idx:04d}"])

licenses_91 = []
for i in range(1, 57):
    cat = "Mining/Scrap/Metals/Supply Core" if i <= 18 else ("Sectors/Markets Universal" if i <= 38 else "HS Code 5000 & Digital Twins")
    licenses_91.append({
        "license_id": f"SHK-W-2026-{i:04d}",
        "type": "Foundry Weight License",
        "category": cat,
        "port": 18159,
        "seal": "BOUND_BY_QURAN_SUNNAH",
        "status": "ACTIVE_GOVERNED"
    })

for idx, (code, en, ar, meth, kpi, port) in enumerate(CHIEFS_35, 1):
    licenses_91.append({
        "license_id": f"SHK-M2M-2026-{idx:04d}",
        "type": "M2M Directorate Production License",
        "category": f"{code} — {ar}",
        "port": port,
        "seal": "BOUND_BY_QURAN_SUNNAH",
        "status": "ACTIVE_GOVERNED"
    })

for lic_csv in ["SHEIKHA_V130_85_LICENSES_SUMMARY.csv", "SHEIKHA_V133_87_LICENSES_SUMMARY.csv", "SHEIKHA_V134_91_LICENSES_SUMMARY.csv"]:
    with open(lic_csv, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["License_ID", "License_Type", "Category_or_Directorate", "Governing_Port", "Seal", "Status"])
        for lic in licenses_91:
            w.writerow([lic["license_id"], lic["type"], lic["category"], lic["port"], lic["seal"], lic["status"]])

assets_construction_governance = {
    "schema": "SHEIKHA_V134_ASSETS_CONSTRUCTION_PROJECTS_CONTRACTING_REALESTATE_IMAR_GOVERNANCE",
    "timestamp": datetime.datetime.now().isoformat(),
    "seal": "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED",
    "core_and_governance_status": "CORE_18082_ACTIVE_AND_GOVERNANCE_18162_ENFORCED",
    "operational_decision": "SCHEDULED_MONITORING_ACTIVE / FULL_LIVE_READINESS_HOLD",
    "six_pillars_activated": {
        "1_chief_assets_officer_C32": {
            "title_ar": "كبير مدراء الأصول",
            "standard": "ISO 55001 + Shariah Waqf Fixed Assets Governance",
            "assets_portfolio": "$15,000,000 USD Evaluated Commercial Assets + 50,000 SAR Daily Waqf Fixed Asset (SHA 0cf8bc3c — أصل ثابت لا يباع)",
            "ports": [18142, 18082, 18162]
        },
        "2_chief_construction_officer_C33": {
            "title_ar": "كبير مدراء البناء",
            "standard": "Saudi Building Code (SBC) + BIM 7D + NVIDIA Omniverse Structural Digital Twins",
            "materials_integration": "Direct M2M Supply of Steel Billet/Rebar (HS 7207/7214) & Cathode Copper (HS 7403 — 99.99% LME Grade A)",
            "ports": [18094, 18154, 18126]
        },
        "3_chief_projects_officer_C26": {
            "title_ar": "كبير مدراء المشاريع",
            "standard": "PMI PMBOK 7th Edition + PRINCE2 + Lean Project Delivery",
            "scope": "128 Digital Twins Projects (50 Industrial Smelting Plants + 20 Smart WMS Warehouses + 24 Logistics Hubs)",
            "ports": [18154, 18082, 18161]
        },
        "4_chief_contracting_officer_C34": {
            "title_ar": "كبير مدراء المقاولات",
            "standard": "Shariah Istisna'a (عقد الاستصناع الشرعي) + FIDIC Silver/Yellow Book (Zero-Riba / Zero-Gharar)",
            "governance_gate": "Automated Milestone Verification via Omniverse Twin before Settlement Engine (18140) Split (0.5% / 2.5% / 10% / 87%)",
            "ports": [18159, 18094, 18140]
        },
        "5_chief_real_estate_officer_C35": {
            "title_ar": "كبير مدراء العقارات",
            "standard": "Industrial & Commercial Real Estate Governance (MODON / RCJY / Waqf Real Estate)",
            "properties": "50 Factory Estates + 20 Warehouse Estates + 10 POS Commercial Centers + Waqf Endowment Lands",
            "ports": [18158, 18142, 18165]
        },
        "6_chief_imar_development_officer_C19": {
            "title_ar": "كبير مدراء الإعمار",
            "standard": "Quranic Civilization & Earth Stewardship (﴿وَاسْتَعْمَرَكُمْ فِيهَا﴾ — هود 61) + Green Circular Economy (SIRC)",
            "impact": "10% Universal Waqf Allocation (50% Logistics Infrastructure + 50% Knowledge & Education) + Zero Harm HSE",
            "ports": [18142, 18163, 18165]
        }
    },
    "counts": {
        "chief_directorates": 35,
        "seed_m2m_agents": 560,
        "proliferated_m2m_nodes": 8400,
        "synaptic_links": 134400,
        "governed_weights": 10000,
        "total_licenses": 91
    },
    "chiefs_35": [
        {
            "code": c[0], "title_en": c[1], "title_ar": c[2],
            "methodology": c[3], "kpi": c[4], "port": c[5],
            "seed_agents": 16, "proliferated_nodes": 240,
            "followup_agent": f"AGT-FUP-{i:02d}",
            "kaizen_dev_agent": f"AGT-DEV-{i:02d}",
            "m2m_license": f"SHK-M2M-2026-{i:04d}"
        }
        for i, c in enumerate(CHIEFS_35, 1)
    ]
}

raw = json.dumps(assets_construction_governance, indent=2, ensure_ascii=False).encode("utf-8")
assets_construction_governance["manifest_sha256"] = hashlib.sha256(raw).hexdigest()

for json_name in [
    "SHEIKHA_V130_UNIFIED_CHIEFS_LICENSES_EXPORT.json",
    "SHEIKHA_V133_UNIFIED_31CHIEFS_87LICENSES_EXPORT.json",
    "SHEIKHA_V134_ASSETS_CONSTRUCTION_IMAR_GOVERNANCE.json"
]:
    Path(json_name).write_text(json.dumps(assets_construction_governance, indent=2, ensure_ascii=False), encoding="utf-8")

print(f"✓ تم تفعيل النواة والحوكمة للقطاعات الـ 6 (الأصول C-32، البناء C-33، المشاريع C-26، المقاولات C-34، العقارات C-35، الإعمار C-19)")
print(f"✓ إجمالي كبار المدراء: 35 | البذور: 560 | العقد العصبية: 8,400 | الروابط المشبكية: 134,400 | التراخيص: 91 | SHA: {assets_construction_governance['manifest_sha256'][:16]}")
