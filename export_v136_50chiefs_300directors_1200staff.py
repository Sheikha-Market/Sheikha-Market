import csv, json, hashlib, datetime
from pathlib import Path

CHIEFS_50 = [
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
    ("C-19", "Chief Earth & Heavens Stewardship", "كبير مدراء إعمار السماوات والأرض وما بينهما", "Universal Waqf 10% / Green Circular Economy", "100%", 18142),
    ("C-20", "Chief Commerce Officer", "كبير مدراء التجارة", "Global Markets LME/COMEX/Tadawul / HS 5000", "99.6%", 18165),
    ("C-21", "Chief Administration Officer", "كبير مدراء الإدارة والنظام الإداري", "ISO 9001:2015 / EFQM / Administrative Excellence", "99.8%", 18120),
    ("C-22", "Chief Quality Officer (CQO)", "كبير مدراء الجودة والجودة الإدارية", "TQM / Six Sigma DMAIC (3.4 DPMO) / LME Grade A", "99.95%", 18110),
    ("C-23", "Chief Safety & HSE Officer", "كبير مدراء السلامة", "ISO 45001 / ISO 14001 / Zero Harm", "100%", 18126),
    ("C-24", "Chief Marketing Officer (CMO)", "كبير مدراء التسويق", "100 Marketers Network / Omni-Channel / Meta API", "99.1%", 18151),
    ("C-25", "Chief Sales Officer (CSO)", "كبير مدراء المبيعات", "CEO Buyer Engine 18164 / 10 POS / sheikha.sa", "99.5%", 18164),
    ("C-26", "Chief PMO Officer (CPMO)", "كبير مدراء مكتب المشاريع التقنية", "PMI PMBOK 7 / Agile / 128 Digital Twins", "99.9%", 18154),
    ("C-27", "Chief Operating Officer (COO)", "كبير مدراء التشغيل", "29 Sovereign Ports / 20 WMS Warehouses 24/7", "99.9%", 18157),
    ("C-28", "Chief Legal & Corporate Counsel Officer", "كبير مدراء القانون والمحاماة والشؤون القانونية", "Saudi Commercial Law / PDPL / Dispute Resolution", "99.9%", 18160),
    ("C-29", "Chief Governance Officer (CGO)", "كبير مدراء الحوكمة ولوائح شيخة", "Sheikha Sovereign Bylaws / COBIT 2019 / ISO 37000", "100%", 18162),
    ("C-30", "Chief Telecommunications & MCP/SDK Officer (CTelO)", "مدير كبراء الاتصالات وبروتوكولات MCP/SDK", "ITU-T / IEEE 802 / MCP JSON-RPC 2.0 / gRPC / OPC-UA / mTLS", "99.98%", 18158),
    ("C-31", "Chief Omni-Channel Communication Officer (CComO)", "مدير كبراء التواصل والعلاقات المؤسسية والدبلوماسية", "ISO 26000 / Diplomatic & Meta/WhatsApp/Omni-AI Bridge", "99.96%", 18120),
    ("C-32", "Chief Asset Officer (CASO)", "كبير مدراء الأصول والأصول الوقفية الثابتة", "ISO 55001 / EAM / IFRS 13 Fair Value / Fixed Waqf SHA 0cf8bc3c", "100%", 18142),
    ("C-33", "Chief Construction Officer (CBldO)", "كبير مدراء البناء والتشييد الهندسي", "Saudi Building Code (SBC) / BIM 7D / Omniverse Structural Twins", "99.92%", 18094),
    ("C-34", "Chief Mega-Projects Officer (CMPO)", "كبير مدراء المشاريع الكبرى والرأسمالية", "PMBOK Construction Ext / PRINCE2 / Earned Value M2M", "99.94%", 18154),
    ("C-35", "Chief Contracting & EPC Officer (CEpcO)", "كبير مدراء المقاولات وعقود الاستصناع (EPC)", "Shariah Istisna'a & FIDIC Red/Yellow/Silver / Zero-Gharar", "99.95%", 18159),
    ("C-36", "Chief Real Estate Officer (CREO)", "كبير مدراء العقارات والمدن الصناعية والأوقاف العقارية", "MODON & RCJY Industrial Lands / 50 Factories & 20 WMS Estates", "99.95%", 18158),
    ("C-37", "Chief Civilization & Imar Officer (CCIO)", "كبير مدراء الإعمار والتطوير الحضري والكوني", "Quranic Isti'mar / LEED Platinum / Universal Waqf 10% Infrastructure", "100%", 18165),
    ("C-38", "Chief Shariah & Fatwa Audit Officer (CSFO)", "كبير مدراء الشريعة والفتوى والرقابة الشرعية", "Quran & Sunnah / AAOIFI Shariah Standards / Zero-Riba Zero-Gharar Gate", "100%", 18135),
    ("C-39", "Chief Zakat & Universal Waqf Officer (CZWO)", "كبير مدراء الزكاة والوقف الكوني والعمل الخيري", "8 Zakat Masarif / Fixed Waqf Endowment / Charity Distribution M2M", "100%", 18141),
    ("C-40", "Chief Mining & Geological Exploration Officer (CMGO)", "كبير مدراء التعدين والجيولوجيا والثروات المعدنية", "JORC Code / MW-001..020 Ores / Copper & Gold & EV Battery Minerals", "99.7%", 18093),
    ("C-41", "Chief Scrap & Circular Recycling Officer (CSRO)", "كبير مدراء السكراب والتدوير والاقتصاد الدائري", "ISRI Scrap Specs / SW-001..015 HMS1&2 / WEEE & Copper Berry Recycling", "99.6%", 18126),
    ("C-42", "Chief Smelting & Foundry Metallurgy Officer (CSmO)", "كبير مدراء المصاهر والسباكة والتعدين الحراري", "Furnace 1200C / LME Grade A Cathode Cu 99.99% (MT-001) / ASTM Standards", "99.95%", 18126),
    ("C-43", "Chief Renewable Energy, Water & Sustainability (CEWO)", "كبير مدراء الطاقة المتجددة والمياه والاستدامة", "ISO 50001 Energy / Green Hydrogen & Solar Smelting / EU CBAM Zero-Carbon", "99.8%", 18142),
    ("C-44", "Chief Cybersecurity & Data Sovereignty Officer (CCSO)", "كبير مدراء الأمن السيبراني وحماية البيانات السيادية", "NCA ECC / ISO 27001 / SDAIA PDPL / DLP / 62,954 Threats Watch Guard", "100%", 18162),
    ("C-45", "Chief AI, Weights & Digital Twins Officer (CAIO)", "كبير مدراء الذكاء الاصطناعي والأوزان والتوائم الرقمية", "10,000 Sovereign Weights / 128 NVIDIA Omniverse Twins / Lawh Mahfuz Sync", "99.98%", 18131),
    ("C-46", "Chief Customs, Ports & Cross-Border Trade (CCPO)", "كبير مدراء الجمارك والموانئ والتجارة العابرة للحدود", "WCO HS Code 5000 / ZATCA Fasah / Digital BOL 11-Col / Incoterms 2020", "99.85%", 18155),
    ("C-47", "Chief Treasury, Settlement & Halal Payments (CTPO)", "كبير مدراء الخزينة والتسويات والمدفوعات الحلال", "Instant Split (0.5/2.5/10/87%) / Moyasar-Mada-ApplePay-Stripe / UBL 2.1", "100%", 18140),
    ("C-48", "Chief Risk, Compliance & Business Continuity (CRCO)", "كبير مدراء المخاطر والامتثال واستمرارية الأعمال", "ISO 31000 Risk / ISO 22301 Continuity / 24/7 Watchdog Auto-Recovery", "99.96%", 18162),
    ("C-49", "Chief Customer Experience & B2B Buyer Success (CCXO)", "كبير مدراء تجربة العميل ونجاح الشركاء وكبار المشترين", "12 CEO Buyer Personas / 10 POS Centers / SLA 99.99% / Omni-Channel", "99.7%", 18164),
    ("C-50", "Chief Human Resources & M2M Talent Officer (CHRO)", "كبير مدراء الموارد البشرية واستقطاب المواهب والـ M2M", "Saudi Labor Law / GOSI Automation / 300 Directors & 1,200 Staff & 12,000 M2M", "99.95%", 18160)
]

DIRECTOR_ROLES_6 = [
    ("DIR-PLN", "مدير إدارة التخطيط والسياسات القطاعية"),
    ("DIR-OPS", "مدير إدارة العمليات التنفيذية والميدانية"),
    ("DIR-ENG", "مدير إدارة الهندسة والتقنية والتوائم الرقمية"),
    ("DIR-QAC", "مدير إدارة الجودة الشاملة والامتثال الشرعي والحوكمي"),
    ("DIR-M2M", "مدير إدارة الأتمتة ووكلاء M2M وبروتوكولات MCP/SDK"),
    ("DIR-RPT", "مدير إدارة المتابعة ومؤشرات الأداء (OKRs/KPIs) والتطوير (Kaizen)")
]

STAFF_ROLES_6_GROUPS = [
    ("STF-SEN", "كبير مهندسين / خبير اختصاص أول (Senior Specialist)", 4),
    ("STF-ANL", "محلل أعمال وحوكمة وبيانات (Governance & Data Analyst)", 4),
    ("STF-FLD", "مشرف ميداني ومشغل منشأة / توأم رقمي (Field & Twin Operator)", 4),
    ("STF-FIN", "محاسب ومنسق عقود وفوترة إلكترونية (Finance & ZATCA Coordinator)", 4),
    ("STF-KZN", "وكيل ومختص متابعة وتطوير مستمر (Follow-up & Kaizen Specialist)", 4),
    ("STF-MCP", "مهندس ربط وتكامل آلي (MCP/SDK & M2M Automation Engineer)", 4)
]

# 1. تصدير ملف كبار المدراء الـ 50
for csv_file in ["SHEIKHA_V130_29_CHIEFS_M2M_SUMMARY.csv", "SHEIKHA_V134_37_CHIEFS_M2M_SUMMARY.csv", "SHEIKHA_V136_50_CHIEFS_M2M_SUMMARY.csv"]:
    with open(csv_file, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["Code", "Title_EN", "Title_AR", "Scientific_Methodology", "KPI_Score", "Primary_Port", "Department_Directors", "Specialized_Staff", "Seed_Agents_Gen0", "Proliferated_Nodes_15x", "Followup_Agent", "Kaizen_Dev_Agent", "M2M_Production_License"])
        for idx, (code, en, ar, meth, kpi, port) in enumerate(CHIEFS_50, 1):
            w.writerow([code, en, ar, meth, kpi, port, 6, 24, 16, 240, f"AGT-FUP-{idx:02d}", f"AGT-DEV-{idx:02d}", f"SHK-M2M-2026-{idx:04d}"])

# 2. تصدير ملف المدراء الـ 300 والموظفين الـ 1,200 بالتفصيل
directors_list = []
staff_list = []

with open("SHEIKHA_V136_300_DIRECTORS_AND_1200_STAFF_ROSTER.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["Record_ID", "Tier", "Chief_Code", "Directorate_AR", "Role_Title_AR", "Headcount_or_Units", "Governing_Port", "M2M_Binding", "Shariah_Seal"])
    for idx, (code, en, ar, meth, kpi, port) in enumerate(CHIEFS_50, 1):
        for d_idx, (d_code, d_title) in enumerate(DIRECTOR_ROLES_6, 1):
            rec_id = f"{code}-{d_code}-{d_idx:02d}"
            directors_list.append({"id": rec_id, "chief": code, "directorate": ar, "title": f"{d_title} — {ar}", "port": port})
            w.writerow([rec_id, "Department Director (مدير إدارة)", code, ar, f"{d_title} ({ar})", 1, port, f"M2M-DIR-{idx:02d}-{d_idx:02d}", "BOUND_BY_QURAN_SUNNAH"])
        for s_idx, (s_code, s_title, s_count) in enumerate(STAFF_ROLES_6_GROUPS, 1):
            rec_id = f"{code}-{s_code}-G{s_idx}"
            staff_list.append({"id": rec_id, "chief": code, "directorate": ar, "title": s_title, "count": s_count, "port": port})
            w.writerow([rec_id, "Specialized Staff (كادر وظيفي وتنفيذي)", code, ar, f"{s_title} — {ar}", s_count, port, f"M2M-STF-{idx:02d}-G{s_idx}", "BOUND_BY_QURAN_SUNNAH"])

# 3. تصدير التراخيص الـ 106 (56 Foundry + 50 M2M Directorates)
licenses_106 = []
for i in range(1, 57):
    cat = "Mining/Scrap/Metals/Supply Core" if i <= 18 else ("Sectors/Markets Universal" if i <= 38 else "HS Code 5000 & Digital Twins")
    licenses_106.append({"license_id": f"SHK-W-2026-{i:04d}", "type": "Foundry Weight License", "category": cat, "port": 18159, "seal": "BOUND_BY_QURAN_SUNNAH", "status": "ACTIVE_GOVERNED"})

for idx, (code, en, ar, meth, kpi, port) in enumerate(CHIEFS_50, 1):
    licenses_106.append({"license_id": f"SHK-M2M-2026-{idx:04d}", "type": "M2M Directorate Production License", "category": f"{code} — {ar}", "port": port, "seal": "BOUND_BY_QURAN_SUNNAH", "status": "ACTIVE_GOVERNED"})

for lic_csv in ["SHEIKHA_V130_85_LICENSES_SUMMARY.csv", "SHEIKHA_V134_91_LICENSES_SUMMARY.csv", "SHEIKHA_V136_106_LICENSES_SUMMARY.csv"]:
    with open(lic_csv, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["License_ID", "License_Type", "Category_or_Directorate", "Governing_Port", "Seal", "Status"])
        for lic in licenses_106:
            w.writerow([lic["license_id"], lic["type"], lic["category"], lic["port"], lic["seal"], lic["status"]])

manifest_v136 = {
    "schema": "SHEIKHA_V136_50CHIEFS_300DIRECTORS_1200STAFF_12000M2M_ENTERPRISE_CORE",
    "timestamp": datetime.datetime.now().isoformat(),
    "seal": "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED",
    "operational_decision": "SCHEDULED_MONITORING_ACTIVE / FULL_LIVE_READINESS_HOLD",
    "enterprise_workforce_and_m2m_hierarchy": {
        "chief_officers_count": 50,
        "department_directors_count": 300,
        "specialized_staff_and_employees_count": 1200,
        "total_human_and_primary_positions": 1550,
        "seed_m2m_agents_gen0": 800,
        "proliferated_m2m_neural_nodes": 12000,
        "synaptic_neural_connections": 192000,
        "governed_weights_total": 10000,
        "sovereign_licenses_total": 106,
        "gosi_monthly_automated_sar": 25000
    },
    "newly_added_strategic_chiefs_13": [
        f"{c[0]} — {c[2]} ({c[1]})" for c in CHIEFS_50[37:]
    ],
    "chiefs_50": [
        {
            "code": c[0], "title_en": c[1], "title_ar": c[2],
            "methodology": c[3], "kpi": c[4], "port": c[5],
            "directors_count": 6, "staff_count": 24,
            "seed_m2m": 16, "proliferated_m2m": 240,
            "license": f"SHK-M2M-2026-{i:04d}"
        }
        for i, c in enumerate(CHIEFS_50, 1)
    ]
}

raw_bytes = json.dumps(manifest_v136, indent=2, ensure_ascii=False).encode("utf-8")
manifest_v136["manifest_sha256"] = hashlib.sha256(raw_bytes).hexdigest()

for j_file in ["SHEIKHA_V130_UNIFIED_CHIEFS_LICENSES_EXPORT.json", "SHEIKHA_V136_ENTERPRISE_50CHIEFS_300DIRECTORS_1200STAFF.json"]:
    Path(j_file).write_text(json.dumps(manifest_v136, indent=2, ensure_ascii=False), encoding="utf-8")

print("✓ تم تفعيل الهيكل التنظيمي السيادي الشامل (V136):")
print("  • 50 كبير مدراء (C-01..C-50)")
print("  • 300 مدير إدارة متخصصة (6 مدراء لكل قطاع)")
print("  • 1,200 موظف ووكيل تنفيذي وميداني (24 موظفاً لكل قطاع)")
print("  • 800 بذرة M2M -> 12,000 عقدة عصبية -> 192,000 رابط مشبكي -> 106 تراخيص")
print(f"  • SHA-256: {manifest_v136['manifest_sha256']}")
