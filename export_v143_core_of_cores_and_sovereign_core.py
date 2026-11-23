import csv, json, hashlib, datetime
from pathlib import Path

seen_codes = set()
macro_rows = []
sub_rows = []

for candidate in ["SHEIKHA_V142_206_STRUCTURAL_CHIEFS_MASTER.csv", "SHEIKHA_V141_197_STRUCTURAL_CHIEFS_MASTER.csv"]:
    p = Path(candidate)
    if p.exists():
        with open(p, "r", encoding="utf-8-sig") as f:
            reader = list(csv.reader(f))
            for row in reader[1:]:
                if not row or len(row) < 12:
                    continue
                code = row[0].strip()
                if code in seen_codes:
                    continue
                seen_codes.add(code)
                if code.startswith("C-"):
                    macro_rows.append(row)
                else:
                    sub_rows.append(row)
        break

NEW_MACRO_CORE_2 = [
    [
        "C-94",
        "Supreme Macro Chief (مجلس الكبار العام — نواة النوى)",
        "Chief Core of Cores Sovereign Officer (CCCSO)",
        "كبير مدراء Core of Cores (نواة النوى وجوهرة السيادة وجذر الحقيقة واللوح المحفوظ)",
        "Root of Trust / Quran & Sunnah Supreme Seal / Triple-Mirror Lawh Mahfuz 535 (edc795a4) / Unified Decision Gate",
        "100%",
        "18082",
        "OWNER 7049031003 & C-01 CEO & C-95 Core",
        "6", "24", "16", "240",
        "SHK-M2M-2026-0094"
    ],
    [
        "C-95",
        "Supreme Macro Chief (مجلس الكبار العام — النواة المركزية)",
        "Chief Sovereign Core Engine Officer (CSCEO)",
        "كبير مدراء Core (النواة السيادية SHEIKHA-CORE ومحرك 18082 ومعمارية MoE وOmni-Pillars)",
        "sheikha_core_engine.py (18082) / lib/sheikha-core-runtime.js / sheikha_moe_architecture.py / sheikha_omni_pillars_engine.py",
        "100%",
        "18082",
        "C-94 Core of Cores & All 29 Sovereign Ports",
        "6", "24", "16", "240",
        "SHK-M2M-2026-0095"
    ]
]

for r in NEW_MACRO_CORE_2:
    if r[0] not in seen_codes:
        seen_codes.add(r[0])
        macro_rows.append(r)

CORE_PILLARS_12 = [
    ("CORE-C-01", "كبير مدراء ركن التوحيد والختم القرآني والنبوي في نواة النوى (Core of Cores Tawheed & Shariah Seal Chief — W-CORE-01)", "CORE-C-02 (جذر الحقيقة المرجعي)", "100%", 18135, "حوكمة الختم الأعلى BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED فوق كل نوى النظام"),
    ("CORE-C-02", "كبير مدراء جذر الحقيقة المرجعي لنواة النوى (Core of Cores Root Source of Truth Chief — W-CORE-02)", "CORE-C-03 (نواة اللوح المحفوظ والتطابق الثلاثي)", "100%", 18082, "حوكمة docs/canonical/registry/ROOT-SOURCE-OF-TRUTH.md ومنع أي انحراف مرجعي"),
    ("CORE-C-03", "كبير مدراء نواة اللوح المحفوظ والتطابق الثلاثي (Core of Cores Lawh Mahfuz Triple-Mirror Chief — W-CORE-03)", "CORE-C-04 (نواة الأوزان الذاتية 876)", "100%", 18131, "مطابقة السجلات الثلاثة (Base == Master == Mirror) لـ 535 أصلاً ببصمة edc795a4"),
    ("CORE-C-04", "كبير مدراء نواة الأوزان الذاتية السيادية (Core of Cores Self-Sovereign Weights 876 Chief — W-CORE-04)", "CORE-C-05 (محرك النواة المركزي 18082)", "100%", 18131, "قيادة الـ 876 وزناً ذاتياً سيادياً (94.75% — SHA 0c8ca22b) الحاكمة على الـ 10,000 وزن"),
    ("CORE-C-05", "كبير مدراء محرك النواة المركزي ووقت التشغيل (Sovereign Core Engine 18082 & Runtime Chief — W-CORE-05)", "CORE-C-06 (نواة معمارية مزيج الخبراء MoE)", "100%", 18082, "تشغيل sheikha_core_engine.py وlib/sheikha-core-runtime.js كقلب نابض للمنظومة"),
    ("CORE-C-06", "كبير مدراء نواة معمارية مزيج الخبراء والأوزان (SHEIKHA-CORE MoE Architecture Chief — W-CORE-06)", "CORE-C-07 (نواة الركائز الشاملة Omni-Pillars)", "99.98%", 18131, "إدارة SHEIKHA-CORE/families/weights/sheikha_moe_architecture.py وتوجيه الاستدلال"),
    ("CORE-C-07", "كبير مدراء نواة الركائز الشاملة والبنية التحتية (SHEIKHA-CORE Omni-Pillars Engine Chief — W-CORE-07)", "CORE-C-08 (نواة سلسلة شيخة SheikhaChain)", "99.98%", 18094, "إدارة SHEIKHA-CORE/infrastructure/sheikha_omni_pillars_engine.py وربط القطاعات"),
    ("CORE-C-08", "كبير مدراء نواة سلسلة البلوك شين السيادية (SHEIKHA-CORE SheikhaChain Engine Chief — W-CORE-08)", "CORE-C-09 (نواة الأساسات الذكية AI Foundations)", "100%", 18131, "إدارة SHEIKHA-CORE/sheikhachain/core/sheikha_chain_engine.py وتوثيق الكتل"),
    ("CORE-C-09", "كبير مدراء نواة الأساسات الذكية ووقت التشغيل (Core AI Foundations Runtime Chief — W-CORE-09)", "CORE-C-10 (نواة التسوية الذرية والوقف الثابت)", "99.97%", 18156, "حوكمة docs/architecture/SHEIKHA-CORE-AI-FOUNDATIONS-RUNTIME.md ومحرك الأرجون"),
    ("CORE-C-10", "كبير مدراء نواة التسوية الذرية والوقف الثابت (Core Atomic Settlement & Fixed Waqf Chief — W-CORE-10)", "CORE-C-11 (نواة التوجيه الصارم وعزل المسارات)", "100%", 18140, "حوكمة المعادلة النووية (0.5% شفافية + 2.5% زكاة + 10% وقف ثابت SHA 0cf8bc3c + 87% حلال)"),
    ("CORE-C-11", "كبير مدراء نواة التوجيه الصارم والشبكة السيادية (Core Strict Routing 404 & SO_REUSEADDR Chief — W-CORE-11)", "CORE-C-12 (نواة الحارس الحيوي والاستعادة الفورية)", "100%", 18082, "ضمان 13/13 و29/29 API 200 مع Strict 404 لأي مسار غير مسجل ومنع TIME_WAIT"),
    ("CORE-C-12", "كبير مدراء نواة الحارس الحيوي والاستعادة التلقائية (Core 24/7 Watchdog & 6s Auto-Recovery Chief — W-CORE-12)", "CORE-C-01 (تغذية راجعة لنواة النوى — حلقة مغلقة)", "100%", 9091, "مراقبة النواة والـ 29 منفذاً كل 3 ثوانٍ واستعادتها تلقائياً مع توثيق الأدلة")
]

for i, (code, ar, next_h, weight, port, desc) in enumerate(CORE_PILLARS_12, 1):
    if code not in seen_codes:
        seen_codes.add(code)
        sub_rows.append([
            code,
            "Core of Cores & Sovereign Core Pillar Chief (كبير مدراء ركن نواة النوى والنواة)",
            code, ar, desc, weight, str(port), next_h,
            "6", "24", "16", "240", f"SHK-CORE-2026-{i:04d}"
        ])

all_structural_220 = macro_rows + sub_rows
for idx, row in enumerate(all_structural_220, 1):
    row[-1] = f"SHK-M2M-2026-{idx:04d}"

for csv_path in ["SHEIKHA_V142_206_STRUCTURAL_CHIEFS_MASTER.csv", "SHEIKHA_V143_220_STRUCTURAL_CHIEFS_MASTER.csv"]:
    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["Code", "Category_Tier", "Title_EN_or_Ref", "Title_AR", "Methodology_or_Description", "Weight_KPI", "Primary_Port", "Next_Stage_or_Parent_Handoff", "Directors_Count", "Staff_Count", "Seed_M2M", "Proliferated_M2M", "License_ID"])
        w.writerows(all_structural_220)

# إضافة الأوزان الـ 12 لنواة النوى والنواة إلى جدول الأوزان التأسيسية ليصبح 36 وزناً (12 Core + 12 OS + 12 Systems Mfg)
CORE_WEIGHTS_12 = [
    ("W-CORE-01", "Core of Cores Weight", "وزن التوحيد والختم القرآني والنبوي في نواة النوى", "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED", "100%", 18135, "C-94 / CORE-C-01"),
    ("W-CORE-02", "Core of Cores Weight", "وزن جذر الحقيقة المرجعي (Root Source of Truth Weight)", "docs/canonical/registry/ROOT-SOURCE-OF-TRUTH.md", "100%", 18082, "C-94 / CORE-C-02"),
    ("W-CORE-03", "Core of Cores Weight", "وزن نواة اللوح المحفوظ والتطابق الثلاثي (535 Assets)", "SHEIKHA-CORE/blockchain/registry.json (edc795a4)", "100%", 18131, "C-94 / CORE-C-03"),
    ("W-CORE-04", "Core of Cores Weight", "وزن الأوزان الذاتية السيادية الحاكمة (876 Self Weights)", "Self Sovereign Weights 94.75% (SHA 0c8ca22b)", "100%", 18131, "C-94 / CORE-C-04"),
    ("W-CORE-05", "Sovereign Core Weight", "وزن محرك النواة المركزي ووقت التشغيل (Core Engine 18082)", "sheikha_core_engine.py + lib/sheikha-core-runtime.js", "100%", 18082, "C-95 / CORE-C-05"),
    ("W-CORE-06", "Sovereign Core Weight", "وزن نواة معمارية مزيج الخبراء (MoE Architecture Weight)", "SHEIKHA-CORE/families/weights/sheikha_moe_architecture.py", "99.98%", 18131, "C-95 / CORE-C-06"),
    ("W-CORE-07", "Sovereign Core Weight", "وزن نواة الركائز الشاملة (Omni-Pillars Engine Weight)", "SHEIKHA-CORE/infrastructure/sheikha_omni_pillars_engine.py", "99.98%", 18094, "C-95 / CORE-C-07"),
    ("W-CORE-08", "Sovereign Core Weight", "وزن نواة سلسلة شيخة (SheikhaChain Core Engine Weight)", "SHEIKHA-CORE/sheikhachain/core/sheikha_chain_engine.py", "100%", 18131, "C-95 / CORE-C-08"),
    ("W-CORE-09", "Sovereign Core Weight", "وزن نواة الأساسات الذكية (Core AI Foundations Runtime)", "docs/architecture/SHEIKHA-CORE-AI-FOUNDATIONS-RUNTIME.md", "99.97%", 18156, "C-95 / CORE-C-09"),
    ("W-CORE-10", "Sovereign Core Weight", "وزن نواة التسوية الذرية والوقف الثابت (SHA 0cf8bc3c)", "sheikha_settlement_18140.py + sheikha_waqf_ledger_18142.py", "100%", 18140, "C-94 / CORE-C-10"),
    ("W-CORE-11", "Sovereign Core Weight", "وزن نواة التوجيه الصارم وعزل المسارات (Strict 404 & SO_REUSEADDR)", "ensure_all_29_sovereign_ports_v130.py", "100%", 18082, "C-95 / CORE-C-11"),
    ("W-CORE-12", "Sovereign Core Weight", "وزن نواة الحارس الحيوي والاستعادة الفورية (6s Auto-Recovery)", "sheikha_24_7_watchdog_daemon.py", "100%", 9091, "C-94 / CORE-C-12")
]

existing_weights = []
w_csv = Path("SHEIKHA_V142_OS_AND_SYSTEMS_MANUFACTURING_WEIGHTS_24.csv")
if w_csv.exists():
    with open(w_csv, "r", encoding="utf-8-sig") as f:
        r = list(csv.reader(f))
        existing_weights = r[1:]

with open("SHEIKHA_V143_CORE_OS_AND_SYSTEMS_WEIGHTS_36.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["Weight_ID", "Weight_Domain", "Weight_Name_AR", "Target_Contract_or_Engine", "Weight_Score", "Primary_Port", "Governing_Chief", "Shariah_Seal"])
    for row in CORE_WEIGHTS_12:
        w.writerow(list(row) + ["BOUND_BY_QURAN_SUNNAH"])
    for row in existing_weights:
        if not row[0].startswith("W-CORE-"):
            w.writerow(row)

total_struct = len(all_structural_220)
hs_chiefs = 5000
grand_chiefs = total_struct + hs_chiefs
directors_cnt = total_struct * 6
staff_cnt = total_struct * 24
seeds_cnt = total_struct * 16
nodes_cnt = (seeds_cnt * 15) + (hs_chiefs * 2)
synaptic_cnt = nodes_cnt * 16
licenses_cnt = 56 + total_struct

manifest_v143 = {
    "schema": "SHEIKHA_V143_CORE_OF_CORES_AND_SOVEREIGN_CORE_ENGINE_GOVERNANCE",
    "timestamp": datetime.datetime.now().isoformat(),
    "seal": "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED",
    "operational_decision": "SCHEDULED_MONITORING_ACTIVE / FULL_LIVE_READINESS_HOLD",
    "core_of_cores_and_core_leadership": {
        "C_94_chief_core_of_cores_officer": {
            "code": "C-94",
            "title_ar": "كبير مدراء Core of Cores (نواة النوى وجوهرة السيادة وجذر الحقيقة)",
            "title_en": "Chief Core of Cores Sovereign Officer (CCCSO)",
            "port": 18082,
            "secondary_port": 18135,
            "kpi": "100%",
            "core_of_cores_anchors": [
                "docs/canonical/registry/ROOT-SOURCE-OF-TRUTH.md",
                "SHEIKHA-CORE/blockchain/registry.json (535 Assets — SHA edc795a4)",
                "SHEIKHA-CORE/blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json",
                "Self Sovereign Weights 876 (94.75% — SHA 0c8ca22b)",
                "bare-metal/contracts/SHEIKHA-UNIFIED-GOVERNANCE-DECISION-CONTRACT-V1.json"
            ],
            "license": "SHK-M2M-2026-0094"
        },
        "C_95_chief_sovereign_core_officer": {
            "code": "C-95",
            "title_ar": "كبير مدراء Core (النواة السيادية SHEIKHA-CORE ومحرك 18082)",
            "title_en": "Chief Sovereign Core Engine Officer (CSCEO)",
            "port": 18082,
            "secondary_port": 18131,
            "kpi": "100%",
            "core_engine_files": [
                "sheikha_core_engine.py (Port 18082)",
                "lib/sheikha-core-runtime.js",
                "SHEIKHA-CORE/families/weights/sheikha_moe_architecture.py",
                "SHEIKHA-CORE/infrastructure/sheikha_omni_pillars_engine.py",
                "SHEIKHA-CORE/sheikhachain/core/sheikha_chain_engine.py",
                "docs/architecture/SHEIKHA-CORE-AI-FOUNDATIONS-RUNTIME.md"
            ],
            "license": "SHK-M2M-2026-0095"
        },
        "core_weights_matrix_12": [
            {"id": w[0], "domain": w[1], "name_ar": w[2], "target": w[3], "score": w[4], "port": w[5], "chief": w[6]}
            for w in CORE_WEIGHTS_12
        ]
    },
    "hierarchy_summary": {
        "supreme_macro_chiefs_C01_to_C95": len(macro_rows),
        "specialized_layer_and_stage_chiefs": len(sub_rows),
        "total_structural_chiefs": total_struct,
        "hs_code_product_chiefs": hs_chiefs,
        "grand_total_all_chiefs": grand_chiefs,
        "department_directors": directors_cnt,
        "specialized_staff_and_engineers": staff_cnt,
        "seed_m2m_agents_gen0": seeds_cnt,
        "proliferated_m2m_neural_nodes": nodes_cnt,
        "synaptic_neural_connections": synaptic_cnt,
        "structural_licenses": licenses_cnt,
        "hs_product_licenses": hs_chiefs,
        "core_of_cores_and_core_weights": 12,
        "sheikha_os_weights": 12,
        "systems_manufacturing_weights": 12,
        "governed_weights_total": 10000
    }
}

raw_bytes = json.dumps(manifest_v143, indent=2, ensure_ascii=False).encode("utf-8")
manifest_v143["manifest_sha256"] = hashlib.sha256(raw_bytes).hexdigest()

for j_path in [
    "SHEIKHA_V130_UNIFIED_CHIEFS_LICENSES_EXPORT.json",
    "SHEIKHA_V143_CORE_OF_CORES_AND_CORE_MANIFEST.json"
]:
    Path(j_path).write_text(json.dumps(manifest_v143, indent=2, ensure_ascii=False), encoding="utf-8")

print("✓ تم تفعيل كبير مدراء Core of Cores (C-94) وكبير مدراء Core (C-95) وأركانهما الـ 12 وأوزانهما الـ 12 (V143):")
print("  • C-94: كبير مدراء Core of Cores (نواة النوى وجذر الحقيقة واللوح المحفوظ — Port 18082 / 18135)")
print("  • C-95: كبير مدراء Core (النواة السيادية SHEIKHA-CORE ومحرك 18082 ومعمارية MoE وOmni-Pillars)")
print("  • CORE-C-01..12 + W-CORE-01..12: 12 كبير مدراء و12 وزناً تأسيسياً لنواة النوى والنواة (بإجمالي 36 وزناً تأسيسياً مع OS وصناعة الأنظمة)")
print(f"  • الإجمالي الموحد: {total_struct} كبير مدراء هيكلي ({len(macro_rows)} عام + {len(sub_rows)} متخصص) + 5,000 مدير منتج = {grand_chiefs} كبير مدراء")
print(f"  • الكوادر والعقد: {directors_cnt} مدير إدارة | {staff_cnt} مهندساً وموظفاً | {nodes_cnt} عقدة M2M | {synaptic_cnt:,} رابطاً مشبكياً (تجاوز حاجز المليون!) | {licenses_cnt} ترخيصاً")
print(f"  • SHA-256: {manifest_v143['manifest_sha256']}")
