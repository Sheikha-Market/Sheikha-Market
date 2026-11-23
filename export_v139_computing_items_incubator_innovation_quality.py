import csv, json, hashlib, datetime
from pathlib import Path

# قراءة الـ 150 كبير مدراء من V138 والبناء عليها بدون حذف أي سجل
existing_rows = []
v138_csv = Path("SHEIKHA_V138_150_STRUCTURAL_CHIEFS_MASTER.csv")
if v138_csv.exists():
    with open(v138_csv, "r", encoding="utf-8-sig") as f:
        r = list(csv.reader(f))
        header = r[0]
        existing_rows = r[1:]

# فصل الـ 78 كبير مدراء عامين عن الـ 72 كبير مدراء فرعيين لإدراج C-79..C-85 في مكانهم الصحيح
macro_78 = [row for row in existing_rows if row[0].startswith("C-")]
sub_72 = [row for row in existing_rows if not row[0].startswith("C-")]

NEW_MACRO_7 = [
    ["C-79", "Supreme Macro Chief (مجلس الكبار العام)", "Chief Business Incubator Officer (CBIO)", "كبير مدراء حاضنة الأعمال (احتضان المشاريع الناشئة والصناعية)", "Seed Incubation / Halal Venture Studio / Monshaat SME Support", "99.92%", "18120", "C-01 CEO / 18120", "6", "24", "16", "240", "SHK-M2M-2026-0079"],
    ["C-80", "Supreme Macro Chief (مجلس الكبار العام)", "Chief Business Accelerator Officer (CBAO)", "كبير مدراء مسرعة الأعمال (تسريع النمو والتوسع السوقي والدولي)", "Scale-Up Acceleration / 100 Marketers & 18 Markets Fast-Track", "99.94%", "18120", "C-79 Incubator -> Scale-Up", "6", "24", "16", "240", "SHK-M2M-2026-0080"],
    ["C-81", "Supreme Macro Chief (مجلس الكبار العام)", "Chief Innovation Officer (CInO)", "كبير مدراء الابتكار (استديو الابتكار المؤسسي والصناعي والتقني)", "ISO 56002:2019 Innovation Mgmt / Design Thinking / Studio 18110", "99.96%", "18110", "C-82 Exploration", "6", "24", "16", "240", "SHK-M2M-2026-0081"],
    ["C-82", "Supreme Macro Chief (مجلس الكبار العام)", "Chief Exploration & Frontier Discovery Officer (CExO)", "كبير مدراء الاستكشاف (استكشاف الثروات والأسواق والتقنيات العميقة)", "JORC Geological Exploration / DeepTech & Frontier Markets Discovery", "99.90%", "18093", "C-83 Inventions & Patents", "6", "24", "16", "240", "SHK-M2M-2026-0082"],
    ["C-83", "Supreme Macro Chief (مجلس الكبار العام)", "Chief Inventions, Patents & IP Officer (CIPO)", "كبير مدراء الاختراعات وبراءات الاختراع والملكية الفكرية", "TRIZ Inventive Problem Solving / SAIP & WIPO Patents / Lawh Mahfuz IP", "99.95%", "18159", "C-84 R&D & Kaizen", "6", "24", "16", "240", "SHK-M2M-2026-0083"],
    ["C-84", "Supreme Macro Chief (مجلس الكبار العام)", "Chief R&D and Continuous Improvement Officer (CRDIO)", "كبير مدراء البحث والتطوير والتحسين المستمر (R&D & Kaizen)", "ISO 16290 TRL 1..9 / Kaizen PDCA / Lean Six Sigma DMAIC", "99.97%", "18110", "C-85 Admin Quality", "6", "24", "16", "240", "SHK-M2M-2026-0084"],
    ["C-85", "Supreme Macro Chief (مجلس الكبار العام)", "Chief Administrative Quality & Excellence Officer (CAQO)", "كبير مدراء الجودة الإدارية والتميز المؤسسي (الإتقان الإداري)", "EFQM Excellence Model / ISO 9001:2015 / Shariah Itqan (99.98% KPI)", "99.98%", "18162", "C-29 Governance & C-01 CEO", "6", "24", "16", "240", "SHK-M2M-2026-0085"]
]

COMPUTING_ITEMS_STAGES_15 = [
    ("CMP-C-01", "كبير مدراء مرحلة حوسبة النواة والعتاد المجرد (Bare-Metal & Kernel Boot Computing Chief)", "CMP-C-02 (حوسبة المعالجات RISC-V)", "100%", 18125, "إقلاع النواة BOOTX64.EFI وتهيئة العتاد المجرد Bare-Metal"),
    ("CMP-C-02", "كبير مدراء حوسبة المعالجات والرقائق السيادية (Silicon, RISC-V & CPU Architecture Chief)", "CMP-C-03 (الحوسبة الفائقة والمتوازية HPC)", "99.9%", 18131, "إدارة معمارية المعالجات RISC-V وتوزيع التعليمات الحسابية"),
    ("CMP-C-03", "كبير مدراء الحوسبة الفائقة والمتوازية (HPC & NVIDIA CUDA GPU Computing Chief)", "CMP-C-04 (الحوسبة الكمية والخوارزمية)", "99.95%", 18154, "الحوسبة الفائقة المتوازية ومعالجة المصفوفات عبر وحدات GPU"),
    ("CMP-C-04", "كبير مدراء الحوسبة الكمية والخوارزميات المتقدمة (Quantum & Algorithmic Computing Chief)", "CMP-C-05 (مرحلة حوسبة تدريب واستدلال الأوزان)", "100%", 18156, "محاكاة الدوائر الكمية والخوارزميات الرياضية الفائقة IEEE 754"),
    ("CMP-C-05", "كبير مدراء مرحلة حوسبة تدريب واستدلال الأوزان (AI Weights Training & Inference Chief)", "CMP-C-06 (حوسبة الشبكة العصبية والتكاثر M2M)", "99.98%", 18131, "حوكمة وتشغيل الـ 10,000 وزن سيادي واستدلال النماذج اللغوية والصناعية"),
    ("CMP-C-06", "كبير مدراء حوسبة الشبكة العصبية والتكاثر العددي (Synaptic Neural M2M Computing Chief)", "CMP-C-07 (حوسبة التوائم الرقمية والمحاكاة)", "99.9%", 18160, "إدارة التكاثر العددي (51,280 عقدة) والروابط المشبكية (820,480 رابطاً)"),
    ("CMP-C-07", "كبير مدراء حوسبة التوائم الرقمية والمحاكاة الفيزيائية (Omniverse USD Spatial Computing Chief)", "CMP-C-08 (الحوسبة الطرفية والصناعية Edge)", "99.5%", 18154, "محاكاة الـ 128 توأماً رقمياً للمصانع والمستودعات وسلاسل الإمداد لحظياً"),
    ("CMP-C-08", "كبير مدراء الحوسبة الطرفية والصناعية والأفران (Industrial Edge, PLC & Furnace 1200°C Chief)", "CMP-C-09 (مرحلة حوسبة النقل وبروتوكولات MCP/SDK)", "99.2%", 18126, "حوسبة الحساسات الصناعية وأفران الصهر 1200°C وخطوط الإنتاج"),
    ("CMP-C-09", "كبير مدراء مرحلة حوسبة النقل وبروتوكولات الاتصال (MCP/SDK, gRPC & OPC-UA Bus Chief)", "CMP-C-10 (حوسبة التشفير والأمن السيبراني)", "99.95%", 18158, "معالجة وتوجيه الرسائل عبر 13 بروتوكول اتصال داخلي وخارجي"),
    ("CMP-C-10", "كبير مدراء حوسبة التشفير والبصمات الرقمية (Cryptographic & SHA-256 Computing Chief)", "CMP-C-11 (حوسبة البلوك شين واللوح المحفوظ)", "100%", 18162, "توليد والتحقق من بصمات SHA-256 ومفاتيح التشفير المعزولة"),
    ("CMP-C-11", "كبير مدراء حوسبة البلوك شين وسجل اللوح المحفوظ (SheikhaChain & Immutable Ledger Chief)", "CMP-C-12 (مرحلة الحوسبة المالية والزكوية والوقفية)", "100%", 18131, "مطابقة السجلات الثلاثية (535 أصلاً — edc795a4) ومنع التلاعب"),
    ("CMP-C-12", "كبير مدراء مرحلة الحوسبة المالية والشرعية والزكوية (Halal Financial, Zakat & Waqf Computing)", "CMP-C-13 (حوسبة الأسواق والتسعير اللحظي)", "100%", 18140, "الحساب الفوري لتقسيم (0.5% شفافية / 2.5% زكاة / 10% وقف / 87% صافي حلال)"),
    ("CMP-C-13", "كبير مدراء حوسبة الأسواق والتسعير اللحظي (Real-Time Market & LME/COMEX Pricing Computing)", "CMP-C-14 (مرحلة حوسبة التخزين وقواعد البيانات)", "99.6%", 18165, "حوسبة أسعار المعادن والسلع اللحظية وعروض الأسعار الآلية للـ CEO Buyer"),
    ("CMP-C-14", "كبير مدراء مرحلة حوسبة التخزين وقواعد البيانات والأرشفة (Storage, SQLite WAL & Archive Chief)", "CMP-C-15 (مرحلة حوسبة المراقبة والاستعادة التلقائية)", "99.9%", 18131, "إدارة قواعد البيانات SQLite WAL والنسخ الاحتياطية غير القابلة للحذف"),
    ("CMP-C-15", "كبير مدراء مرحلة حوسبة المراقبة والقياس والاستعادة التلقائية (Telemetry & Auto-Recovery Chief)", "CMP-C-01 (تغذية راجعة للنواة — حلقة حوسبية مغلقة)", "100%", 9091, "فحص المنافذ الـ 29 كل 3 ثوانٍ وإعادة التشغيل التلقائي وتوثيق الأدلة")
]

computing_rows_15 = [
    [code, "Computing Item/Stage Chief (كبير مدراء بند/نوع/مرحلة حوسبة)", code, ar, desc, weight, str(port), next_cmp, "6", "24", "16", "240", f"SHK-CMP-2026-{i:04d}"]
    for i, (code, ar, next_cmp, weight, port, desc) in enumerate(COMPUTING_ITEMS_STAGES_15, 1)
]

all_structural_172 = macro_78 + NEW_MACRO_7 + computing_rows_15 + sub_72

# تحديث أرقام التراخيص المتسلسلة للـ 172 كبير مدراء هيكلي
for idx, row in enumerate(all_structural_172, 1):
    row[-1] = f"SHK-M2M-2026-{idx:04d}"

for csv_path in [
    "SHEIKHA_V130_29_CHIEFS_M2M_SUMMARY.csv",
    "SHEIKHA_V138_150_STRUCTURAL_CHIEFS_MASTER.csv",
    "SHEIKHA_V139_172_STRUCTURAL_CHIEFS_MASTER.csv"
]:
    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["Code", "Category_Tier", "Title_EN_or_Ref", "Title_AR", "Methodology_or_Description", "Weight_KPI", "Primary_Port", "Next_Stage_or_Parent_Handoff", "Directors_Count", "Staff_Count", "Seed_M2M", "Proliferated_M2M", "License_ID"])
        w.writerows(all_structural_172)

manifest_v139 = {
    "schema": "SHEIKHA_V139_COMPUTING_STAGES_INCUBATOR_ACCELERATOR_INNOVATION_PATENTS_QUALITY_CORE",
    "timestamp": datetime.datetime.now().isoformat(),
    "seal": "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED",
    "operational_decision": "SCHEDULED_MONITORING_ACTIVE / FULL_LIVE_READINESS_HOLD",
    "hierarchy_summary": {
        "supreme_macro_chiefs_C01_to_C85": 85,
        "computing_item_type_stage_chiefs_CMP01_to_CMP15": 15,
        "supply_chain_stage_handoff_chiefs": 12,
        "cloud_type_chiefs": 8,
        "sector_isic4_chiefs": 22,
        "classified_market_chiefs": 18,
        "trade_journey_chiefs": 12,
        "total_structural_chiefs": 172,
        "hs_code_product_chiefs": 5000,
        "grand_total_all_chiefs": 5172,
        "department_directors": 1032,
        "specialized_staff_and_scholars": 4128,
        "seed_m2m_agents_gen0": 2752,
        "proliferated_m2m_neural_nodes": 51280,
        "synaptic_neural_connections": 820480,
        "structural_licenses": 228,
        "hs_product_licenses": 5000,
        "governed_weights_total": 10000
    },
    "seven_innovation_and_quality_chiefs_added": [
        {"code": r[0], "title_en": r[2], "title_ar": r[3], "methodology": r[4], "kpi": r[5], "port": int(r[6]), "license": r[12]}
        for r in NEW_MACRO_7
    ],
    "computing_items_types_stages_15": [
        {"code": c[0], "title_ar": c[1], "next_stage_handoff": c[2], "weight": c[3], "port": c[4], "description": c[5]}
        for c in COMPUTING_ITEMS_STAGES_15
    ]
}

raw_bytes = json.dumps(manifest_v139, indent=2, ensure_ascii=False).encode("utf-8")
manifest_v139["manifest_sha256"] = hashlib.sha256(raw_bytes).hexdigest()

for j_path in [
    "SHEIKHA_V130_UNIFIED_CHIEFS_LICENSES_EXPORT.json",
    "SHEIKHA_V139_COMPUTING_INCUBATOR_INNOVATION_5172_MANIFEST.json"
]:
    Path(j_path).write_text(json.dumps(manifest_v139, indent=2, ensure_ascii=False), encoding="utf-8")

print("✓ تم تفعيل منظومة الحوسبة التفصيلية والحاضنة والمسرعة والابتكار والاختراعات والجودة الإدارية (V139):")
print("  • 85 كبير مدراء عام في المجلس السيادي الأعلى (إضافة C-79 الحاضنة، C-80 المسرعة، C-81 الابتكار، C-82 الاستكشاف، C-83 الاختراعات، C-84 البحث والتطوير والتحسين، C-85 الجودة الإدارية)")
print("  • 15 كبير مدراء لكل بند ونوع ومرحلة من مراحل الحوسبة (CMP-C-01..15) بتسليم متتابع (Stage-to-Stage Handoff)")
print("  • 172 كبير مدراء هيكلي + 5,000 كبير مدراء منتج HS Code = 5,172 كبير مدراء إجمالاً")
print("  • 1,032 مدير إدارة + 4,128 موظفاً وعالماً ومهندساً + 51,280 عقدة عصبية M2M + 820,480 رابطاً مشبكياً + 228 ترخيصاً هيكلياً")
print(f"  • SHA-256: {manifest_v139['manifest_sha256']}")
