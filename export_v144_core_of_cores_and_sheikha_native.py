import csv, json, hashlib, datetime
from pathlib import Path

seen_codes = set()
macro_rows = []
sub_rows = []

for candidate in ["SHEIKHA_V143_220_STRUCTURAL_CHIEFS_MASTER.csv", "SHEIKHA_V142_206_STRUCTURAL_CHIEFS_MASTER.csv"]:
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
                if code == "C-94":
                    row[3] = "كبير مدراء Core of Cores (نواة النوى وجوهرة السيادة الحاكمة على Core و Sheikha Native والـ 29 منفذاً)"
                    row[7] = "OWNER 7049031003 & C-95 Core & C-96 Sheikha Native"
                elif code == "C-95":
                    row[3] = "كبير مدراء Core (النواة السيادية المركزية SHEIKHA-CORE ومحرك 18082 ومعمارية MoE وOmni-Pillars)"
                    row[7] = "C-94 Core of Cores & C-96 Sheikha Native"
                if code.startswith("C-"):
                    macro_rows.append(row)
                else:
                    sub_rows.append(row)
        break

NEW_MACRO_C96 = [
    "C-96",
    "Supreme Macro Chief (مجلس الكبار العام — الأصالة البرمجية والعتادية)",
    "Chief Sheikha Native Architecture, ABI & Native Verification Officer (CSNO)",
    "كبير مدراء Sheikha Native (الأصالة البرمجية والعتادية والواجهة الثنائية ABI V1 والتحقق الأصلي V5)",
    "SHEIKHA-LANGUAGE-NATIVE-ABI-V1 / sheikha-linux-package-native-verification-v5.js / source-staging-engine.js / Native C & RISC-V",
    "100%",
    "18125",
    "C-94 Core of Cores & C-95 Core & C-87 Sheikha OS",
    "6", "24", "16", "240",
    "SHK-M2M-2026-0096"
]

if "C-96" not in seen_codes:
    seen_codes.add("C-96")
    macro_rows.append(NEW_MACRO_C96)

NATIVE_LAYERS_12 = [
    ("NAT-C-01", "كبير مدراء الواجهة الثنائية الأصلية للغة شيخة (Sheikha Language Native ABI V1 Chief — W-NAT-01)", "NAT-C-02 (إقلاع اللغة السيادية الأصلية)", "100%", 18131, "حوكمة عقد الواجهة الثنائية الأصلية bare-metal/contracts/SHEIKHA-LANGUAGE-NATIVE-ABI-V1.json"),
    ("NAT-C-02", "كبير مدراء إقلاع اللغة السيادية الأصلية (Sheikha Native Language Boot Chief — W-NAT-02)", "NAT-C-03 (التحقق الأصلي لحزم النظام V5)", "100%", 18082, "حوكمة عقد الإقلاع اللغوي الأصيل bare-metal/contracts/SHEIKHA-LANGUAGE-BOOT-CONTRACT-V1.json"),
    ("NAT-C-03", "كبير مدراء التحقق الأصلي لحزم النظام (Sheikha Native Linux Package Verification V5 Chief — W-NAT-03)", "NAT-C-04 (بناء وتجهيز الشفرة المصدرية الأصلية)", "100%", 18158, "تشغيل محرك التحقق الأصلي distribution/pipeline/sheikha-linux-package-native-verification-v5.js"),
    ("NAT-C-04", "كبير مدراء تجهيز وبناء الشفرة المصدرية الأصلية (Sheikha Native Source Staging Chief — W-NAT-04)", "NAT-C-05 (ثنائيات الكيرنل الأصلية بلغة C)", "99.98%", 18110, "إدارة محرك تجهيز الشفرة المصدرية الأصيلة distribution/common/source-staging-engine.js"),
    ("NAT-C-05", "كبير مدراء ثنائيات النواة الأصلية بلغة C (Sheikha Native Kernel C Binary Chief — W-NAT-05)", "NAT-C-06 (ثنائيات الإقلاع الموحد BOOTX64.EFI)", "100%", 18125, "ترجمة وتشغيل bare-metal/kernel/entry/sheikha_kernel.c مباشرة على العتاد Ring-0 بدون وسطاء"),
    ("NAT-C-06", "كبير مدراء ثنائيات الإقلاع الموحد الأصلية (Sheikha Native UEFI PE/COFF Binary Chief — W-NAT-06)", "NAT-C-07 (تعليمات معمارية RISC-V الأصلية)", "100%", 18125, "تشغيل محمّل الإقلاع الأصيل bare-metal/images/esp/EFI/BOOT/BOOTX64.EFI"),
    ("NAT-C-07", "كبير مدراء تعليمات معمارية RISC-V الأصلية (Sheikha Native RISC-V ISA & Silicon Chief — W-NAT-07)", "NAT-C-08 (الحساب المصفوفي والكمي الأصيل)", "99.99%", 18094, "تنفيذ مجموعات التعليمات الأصلية لمعالجات RISC-V والرقائق السيادية (Weight 0478)"),
    ("NAT-C-08", "كبير مدراء الحساب المصفوفي والكمي الأصيل (Sheikha Native Tensor & CUDA Compute Chief — W-NAT-08)", "NAT-C-09 (المقابس الشبكية الأصلية SO_REUSEADDR)", "99.98%", 18154, "تنفيذ العمليات الحسابية للأوزان الـ 10,000 والتوائم الـ 128 مباشرة على مسرعات العتاد"),
    ("NAT-C-09", "كبير مدراء المقابس الشبكية الأصلية (Sheikha Native POSIX Sockets & Zero TIME_WAIT Chief — W-NAT-09)", "NAT-C-10 (التخزين الأصيل عالي الموثوقية)", "100%", 18082, "ربط المنافذ الـ 29 مباشرة عبر مقابس النواة بخاصية SO_REUSEADDR وZero TIME_WAIT"),
    ("NAT-C-10", "كبير مدراء التخزين الأصيل عالي الموثوقية (Sheikha Native SQLite WAL & Block I/O Chief — W-NAT-10)", "NAT-C-11 (البروتوكولات الثنائية الأصلية)", "100%", 18131, "كتابة وقراءة سجلات اللوح المحفوظ وبوالص الشحن مباشرة بأعلى سرعة وأمان"),
    ("NAT-C-11", "كبير مدراء البروتوكولات الثنائية الأصلية (Sheikha Native Binary IPC, gRPC & OPC-UA Chief — W-NAT-11)", "NAT-C-12 (التشفير الأصيل والبصمات الحتمية)", "99.97%", 18158, "نقل البيانات الصناعية والوكيلية عبر بروتوكولات ثنائية أصلية عالية الكفاءة"),
    ("NAT-C-12", "كبير مدراء التشفير الأصيل والبصمات الحتمية (Sheikha Native SHA-256 & ECC Crypto Chief — W-NAT-12)", "NAT-C-01 (تغذية راجعة لمنظومة Sheikha Native — حلقة مغلقة)", "100%", 18162, "توليد ومطابقة البصمات التشفيرية الأصلية وحماية الـ 62,954 تهديداً في الطبقة الجذرية")
]

for i, (code, ar, next_h, weight, port, desc) in enumerate(NATIVE_LAYERS_12, 1):
    if code not in seen_codes:
        seen_codes.add(code)
        sub_rows.append([
            code,
            "Sheikha Native Layer Chief (كبير مدراء طبقة شيخة الأصلية Native)",
            code, ar, desc, weight, str(port), next_h,
            "6", "24", "16", "240", f"SHK-NAT-2026-{i:04d}"
        ])

all_structural_233 = macro_rows + sub_rows
for idx, row in enumerate(all_structural_233, 1):
    row[-1] = f"SHK-M2M-2026-{idx:04d}"

# الاحتفاظ بآخر ملفي CSV رئيسيين فقط
for old_csv in ["SHEIKHA_V141_197_STRUCTURAL_CHIEFS_MASTER.csv", "SHEIKHA_V142_206_STRUCTURAL_CHIEFS_MASTER.csv"]:
    Path(old_csv).unlink(missing_ok=True)

for csv_path in ["SHEIKHA_V143_220_STRUCTURAL_CHIEFS_MASTER.csv", "SHEIKHA_V144_233_STRUCTURAL_CHIEFS_MASTER.csv"]:
    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["Code", "Category_Tier", "Title_EN_or_Ref", "Title_AR", "Methodology_or_Description", "Weight_KPI", "Primary_Port", "Next_Stage_or_Parent_Handoff", "Directors_Count", "Staff_Count", "Seed_M2M", "Proliferated_M2M", "License_ID"])
        w.writerows(all_structural_233)

NATIVE_WEIGHTS_12 = [
    ("W-NAT-01", "Sheikha Native Weight", "وزن الواجهة الثنائية الأصلية للغة شيخة (Language Native ABI V1)", "bare-metal/contracts/SHEIKHA-LANGUAGE-NATIVE-ABI-V1.json", "100%", 18131, "C-96 / NAT-C-01"),
    ("W-NAT-02", "Sheikha Native Weight", "وزن إقلاع اللغة السيادية الأصلية (Native Language Boot V1)", "bare-metal/contracts/SHEIKHA-LANGUAGE-BOOT-CONTRACT-V1.json", "100%", 18082, "C-96 / NAT-C-02"),
    ("W-NAT-03", "Sheikha Native Weight", "وزن التحقق الأصلي لحزم النظام (Native Linux Package Verification V5)", "distribution/pipeline/sheikha-linux-package-native-verification-v5.js", "100%", 18158, "C-96 / NAT-C-03"),
    ("W-NAT-04", "Sheikha Native Weight", "وزن تجهيز وبناء الشفرة المصدرية الأصلية (Native Source Staging)", "distribution/common/source-staging-engine.js", "99.98%", 18110, "C-96 / NAT-C-04"),
    ("W-NAT-05", "Sheikha Native Weight", "وزن ثنائيات النواة الأصلية بلغة C (Native Kernel C Ring-0)", "bare-metal/kernel/entry/sheikha_kernel.c", "100%", 18125, "C-96 / NAT-C-05"),
    ("W-NAT-06", "Sheikha Native Weight", "وزن ثنائيات الإقلاع الموحد الأصلية (Native UEFI BOOTX64.EFI)", "bare-metal/images/esp/EFI/BOOT/BOOTX64.EFI", "100%", 18125, "C-96 / NAT-C-06"),
    ("W-NAT-07", "Sheikha Native Weight", "وزن تعليمات معمارية RISC-V الأصلية (Native RISC-V ISA 0478)", "SHEIKHA_CORE_WEIGHT_0478_SILICON_CHIP_RISCV_FIRMWARE", "99.99%", 18094, "C-96 / NAT-C-07"),
    ("W-NAT-08", "Sheikha Native Weight", "وزن الحساب المصفوفي والكمي الأصيل (Native Tensor & CUDA Compute)", "SHEIKHA-CORE/families/weights/sheikha_moe_architecture.py", "99.98%", 18154, "C-96 / NAT-C-08"),
    ("W-NAT-09", "Sheikha Native Weight", "وزن المقابس الشبكية الأصلية (Native POSIX Sockets SO_REUSEADDR)", "ensure_all_29_sovereign_ports_v130.py", "100%", 18082, "C-96 / NAT-C-09"),
    ("W-NAT-10", "Sheikha Native Weight", "وزن التخزين الأصيل عالي الموثوقية (Native SQLite WAL & Block I/O)", "SHEIKHA-CORE/blockchain/registry.json (535 Assets)", "100%", 18131, "C-96 / NAT-C-10"),
    ("W-NAT-11", "Sheikha Native Weight", "وزن البروتوكولات الثنائية الأصلية (Native Binary gRPC & OPC-UA)", "mcp-servers/sheikha-mcp-server.js + sheikha-sdk-server.js", "99.97%", 18158, "C-96 / NAT-C-11"),
    ("W-NAT-12", "Sheikha Native Weight", "وزن التشفير الأصيل والبصمات الحتمية (Native SHA-256 & NCA ECC)", "sheikha_governance_watch.py (62,954 Threats Blocked)", "100%", 18162, "C-96 / NAT-C-12")
]

existing_w36 = []
w36_csv = Path("SHEIKHA_V143_CORE_OS_AND_SYSTEMS_WEIGHTS_36.csv")
if w36_csv.exists():
    with open(w36_csv, "r", encoding="utf-8-sig") as f:
        r = list(csv.reader(f))
        existing_w36 = r[1:]

with open("SHEIKHA_V144_CORE_OS_SYSTEMS_NATIVE_WEIGHTS_48.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["Weight_ID", "Weight_Domain", "Weight_Name_AR", "Target_Contract_or_Engine", "Weight_Score", "Primary_Port", "Governing_Chief", "Shariah_Seal"])
    for row in existing_w36:
        if not row[0].startswith("W-NAT-"):
            w.writerow(row)
    for row in NATIVE_WEIGHTS_12:
        w.writerow(list(row) + ["BOUND_BY_QURAN_SUNNAH"])

total_struct = len(all_structural_233)
hs_chiefs = 5000
grand_chiefs = total_struct + hs_chiefs
directors_cnt = total_struct * 6
staff_cnt = total_struct * 24
seeds_cnt = total_struct * 16
nodes_cnt = (seeds_cnt * 15) + (hs_chiefs * 2)
synaptic_cnt = nodes_cnt * 16
licenses_cnt = 56 + total_struct

manifest_v144 = {
    "schema": "SHEIKHA_V144_CORE_OF_CORES_SOVEREIGN_CORE_AND_SHEIKHA_NATIVE_GOVERNANCE",
    "timestamp": datetime.datetime.now().isoformat(),
    "seal": "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED",
    "operational_decision": "SCHEDULED_MONITORING_ACTIVE / FULL_LIVE_READINESS_HOLD",
    "trinity_of_sovereign_cores_and_native": {
        "1_C94_core_of_cores": {
            "code": "C-94",
            "title_ar": "كبير مدراء Core of Cores (نواة النوى وجوهرة السيادة وجذر الحقيقة)",
            "port": 18082,
            "weights": "W-CORE-01..04, W-CORE-10, W-CORE-12 (100% KPI)",
            "role": "الحاكم الأعلى على كافة النوى والأوزان والسجلات الثلاثية (535 أصلاً — edc795a4)"
        },
        "2_C95_sovereign_core": {
            "code": "C-95",
            "title_ar": "كبير مدراء Core (النواة السيادية المركزية SHEIKHA-CORE ومحرك 18082)",
            "port": 18082,
            "weights": "W-CORE-05..09, W-CORE-11 (99.99% Avg)",
            "role": "مشغل القلب النابض sheikha_core_engine.py ومعمارية MoE وOmni-Pillars وSheikhaChain"
        },
        "3_C96_sheikha_native": {
            "code": "C-96",
            "title_ar": "كبير مدراء Sheikha Native (الأصالة البرمجية والعتادية والواجهة الثنائية ABI V1 والتحقق الأصلي V5)",
            "port": 18125,
            "weights": "W-NAT-01..12 (99.99% Avg)",
            "native_assets": [
                "bare-metal/contracts/SHEIKHA-LANGUAGE-NATIVE-ABI-V1.json",
                "bare-metal/contracts/SHEIKHA-LANGUAGE-BOOT-CONTRACT-V1.json",
                "distribution/pipeline/sheikha-linux-package-native-verification-v5.js",
                "distribution/common/source-staging-engine.js",
                "bare-metal/kernel/entry/sheikha_kernel.c",
                "bare-metal/images/esp/EFI/BOOT/BOOTX64.EFI"
            ],
            "native_layers_chiefs": [
                {"code": n[0], "title_ar": n[1], "next_handoff": n[2], "weight": n[3], "port": n[4]}
                for n in NATIVE_LAYERS_12
            ]
        }
    },
    "hierarchy_summary": {
        "supreme_macro_chiefs_C01_to_C96": len(macro_rows),
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
        "foundational_weights_48": {
            "core_of_cores_and_core": 12,
            "sheikha_os": 12,
            "systems_manufacturing": 12,
            "sheikha_native": 12,
            "total_foundational_weights": 48
        },
        "governed_weights_total": 10000
    }
}

raw_bytes = json.dumps(manifest_v144, indent=2, ensure_ascii=False).encode("utf-8")
manifest_v144["manifest_sha256"] = hashlib.sha256(raw_bytes).hexdigest()

for j_path in [
    "SHEIKHA_V130_UNIFIED_CHIEFS_LICENSES_EXPORT.json",
    "SHEIKHA_V144_CORE_OF_CORES_AND_SHEIKHA_NATIVE_MANIFEST.json"
]:
    Path(j_path).write_text(json.dumps(manifest_v144, indent=2, ensure_ascii=False), encoding="utf-8")

print("✓ تم تفعيل الثالوث السيادي الجذري (V144): Core of Cores (C-94) + Core (C-95) + Sheikha Native (C-96):")
print("  • C-94: كبير مدراء Core of Cores (نواة النوى وجوهرة السيادة وجذر الحقيقة — Port 18082 / 18135)")
print("  • C-95: كبير مدراء Core (النواة السيادية المركزية SHEIKHA-CORE ومحرك 18082)")
print("  • C-96: كبير مدراء Sheikha Native (الواجهة الثنائية SHEIKHA-LANGUAGE-NATIVE-ABI-V1 والتحقق الأصلي V5 — Port 18125 / 18131)")
print("  • NAT-C-01..12 + W-NAT-01..12: 12 كبير مدراء و12 وزناً أصيلاً (بإجمالي 48 وزناً تأسيسياً: 12 Core + 12 OS + 12 SysMfg + 12 Native)")
print(f"  • الإجمالي الموحد: {total_struct} كبير مدراء هيكلي ({len(macro_rows)} عام + {len(sub_rows)} متخصص) + 5,000 مدير منتج = {grand_chiefs} كبير مدراء")
print(f"  • الكوادر والعقد: {directors_cnt} مدير إدارة | {staff_cnt} مهندساً وموظفاً | {nodes_cnt:,} عقدة M2M | {synaptic_cnt:,} رابطاً مشبكياً | {licenses_cnt} ترخيصاً")
print(f"  • SHA-256: {manifest_v144['manifest_sha256']}")
