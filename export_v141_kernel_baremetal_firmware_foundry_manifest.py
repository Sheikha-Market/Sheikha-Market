import csv, json, hashlib, datetime
from pathlib import Path

# قراءة السجلات السابقة مع إزالة أي تكرار في الرموز (Deduplication by Code)
seen_codes = set()
macro_rows = []
sub_rows = []

for candidate in ["SHEIKHA_V140_182_STRUCTURAL_CHIEFS_MASTER.csv", "SHEIKHA_V139_172_STRUCTURAL_CHIEFS_MASTER.csv"]:
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

NEW_MACRO_5 = [
    [
        "C-88",
        "Supreme Macro Chief (مجلس الكبار العام)",
        "Chief Sheikha Kernel Officer (CSKO)",
        "كبير مدراء الكيرنل (نواة شيخة المجردة sheikha_kernel.c وعقود النواة Ring-0)",
        "sheikha_kernel.c / SHEIKHA-KERNEL-CONTRACT-V1 / Weight 0476 & 0485 OS Kernel",
        "100%",
        "18125",
        "C-87 Sheikha OS & C-89 Bare-Metal",
        "6", "24", "16", "240",
        "SHK-M2M-2026-0088"
    ],
    [
        "C-89",
        "Supreme Macro Chief (مجلس الكبار العام)",
        "Chief Sheikha Bare-Metal & Pearl Metal Officer (CBMPO)",
        "كبير مدراء Sheikha Bare-Metal & Pearl Metal (العتاد المجرد وميتالورجيا معدن اللؤلؤ 15,000MT)",
        "sheikha-bare-metal-pipeline-v1.js / Seed Image V1 / Weight 0477 Pearl Metal 15000MT",
        "100%",
        "18126",
        "C-90 Firmware & C-91 Foundry",
        "6", "24", "16", "240",
        "SHK-M2M-2026-0089"
    ],
    [
        "C-90",
        "Supreme Macro Chief (مجلس الكبار العام)",
        "Chief Sovereign Firmware & RTOS Officer (CSFwO)",
        "كبير مدراء Firmware (البرمجيات المدمجة الموقعة وشرائح RISC-V ومتحكمات الأفران PLC)",
        "Weight 0478 Silicon RISC-V Firmware / BOOTX64.EFI / RTOS PLC OPC-UA Modbus",
        "99.98%",
        "18094",
        "C-88 Kernel & C-91 Foundry",
        "6", "24", "16", "240",
        "SHK-M2M-2026-0090"
    ],
    [
        "C-91",
        "Supreme Macro Chief (مجلس الكبار العام)",
        "Chief Sheikha Foundry & M2M Smelting Officer (CSFdO)",
        "كبير مدراء الفوندري (مسبك شيخة 18126 وخطوط السباكة الـ 20 وأفران 1200°C وتراخيص 18159)",
        "Foundry Lines FL-01..FL-20 / Furnace 1200C -> Casting -> LME Grade A Lab / 56 Licenses",
        "100%",
        "18126",
        "C-92 Manifest & 18159 Licensing",
        "6", "24", "16", "240",
        "SHK-M2M-2026-0091"
    ],
    [
        "C-92",
        "Supreme Macro Chief (مجلس الكبار العام)",
        "Chief Sovereign Manifest & Canonical Registry Officer (CSMnO)",
        "كبير مدراء Manifest (البيان المعماري الموحد ومنافست الشحن BOL وسجل اللوح المحفوظ)",
        "Omni-AI Manifest / Cargo BOL 11-Col Manifest / Lawh Mahfuz 535 SHA edc795a4",
        "100%",
        "18131",
        "C-29 Governance & C-01 CEO",
        "6", "24", "16", "240",
        "SHK-M2M-2026-0092"
    ]
]

for r in NEW_MACRO_5:
    if r[0] not in seen_codes:
        seen_codes.add(r[0])
        macro_rows.append(r)

KBFM_SUB_10 = [
    ("KBFM-C-01", "كبير مدراء مدخل الكيرنل وعقد النواة (sheikha_kernel.c & Kernel Contract V1 Chief)", "KBFM-C-02 (نواة SheikhaChain 0485)", "100%", 18125, "إدارة bare-metal/kernel/entry/sheikha_kernel.c وعقد النواة V1"),
    ("KBFM-C-02", "كبير مدراء نواة البلوك شين واللوح المحفوظ (SheikhaChain OS Kernel 0485 Chief)", "KBFM-C-03 (خط أنابيب Bare-Metal)", "100%", 18131, "حوكمة الوزن السيادي SHEIKHA_CORE_WEIGHT_0485_SHEIKHA_CHAIN_OS_KERNEL"),
    ("KBFM-C-03", "كبير مدراء خط بناء وصور العتاد المجرد (Bare-Metal Pipeline & Seed Image V1 Chief)", "KBFM-C-04 (ميتالورجيا معدن اللؤلؤ Pearl Metal)", "99.98%", 18125, "تشغيل sheikha-bare-metal-pipeline-v1.js وتوليد sheikha-bare-metal-seed-v1.img"),
    ("KBFM-C-04", "كبير مدراء ميتالورجيا معدن اللؤلؤ والسبائك الفائقة (Pearl Metal Metallurgy 15,000MT Chief)", "KBFM-C-05 (Firmware شرائح RISC-V)", "99.99%", 18126, "حوكمة الوزن SHEIKHA_CORE_WEIGHT_0477_PEARL_METAL_METALLURGY_15000MT والنحاس النقي 99.99%"),
    ("KBFM-C-05", "كبير مدراء Firmware شرائح السيليكون وRISC-V والإقلاع (Silicon RISC-V Firmware 0478 Chief)", "KBFM-C-06 (Firmware المتحكمات والأفران PLC)", "99.98%", 18094, "حوكمة الوزن SHEIKHA_CORE_WEIGHT_0478_SILICON_CHIP_RISCV_FIRMWARE ومحمّل BOOTX64.EFI"),
    ("KBFM-C-06", "كبير مدراء Firmware الأفران الصناعية والمتحكمات (Industrial PLC/OPC-UA/Modbus Firmware Chief)", "KBFM-C-07 (خطوط الصهر الفيزيائية بالفوندري)", "99.95%", 18126, "برمجيات الزمن الحقيقي RTOS لأفران الصهر 1200°C والـ 50 مصنعاً والـ 20 مستودعاً"),
    ("KBFM-C-07", "كبير مدراء خطوط الصهر والسباكة بالفوندري (Foundry Physical Smelting 1200°C Lines FL-01..20 Chief)", "KBFM-C-08 (مسبك الأوزان والتراخيص 18159)", "99.96%", 18126, "قيادة خطوط السباكة الـ 20 من الصهر والصب حتى فحص مختبر LME Grade A"),
    ("KBFM-C-08", "كبير مدراء مسبك الأوزان والتراخيص وM2M (Foundry M2M Proliferation & 56-Weights Licensing Chief)", "KBFM-C-09 (منافست المعمارية والذكاء الموحد)", "100%", 18159, "إصدار تراخيص الأوزان SHK-W-2026-0001..0056 وتراخيص إنتاج M2M"),
    ("KBFM-C-09", "كبير مدراء منافست المعمارية والذكاء الموحد (System, Cloud & Omni-AI Manifest Chief)", "KBFM-C-10 (منافست الشحن البحري والجمركي BOL)", "100%", 18082, "توليد ومطابقة ملفات SHEIKHA_GITHUB_OMNI_AI_MANIFEST وdocker-compose وcloudbuild"),
    ("KBFM-C-10", "كبير مدراء منافست الشحن البحري والجمركي (Maritime Cargo Manifest & 11-Col Digital BOL Chief)", "KBFM-C-01 (تغذية راجعة لنواة الكيرنل — حلقة مغلقة)", "100%", 18155, "توثيق منافست الشحن البحري والجوي وبوالص الشحن الرقمية الـ 11 عموداً (DRAFT_TEST_RECORD)")
]

for i, (code, ar, next_h, weight, port, desc) in enumerate(KBFM_SUB_10, 1):
    if code not in seen_codes:
        seen_codes.add(code)
        sub_rows.append([
            code,
            "Kernel/BareMetal/Firmware/Foundry/Manifest Layer Chief",
            code, ar, desc, weight, str(port), next_h,
            "6", "24", "16", "240", f"SHK-KBFM-2026-{i:04d}"
        ])

all_structural_197 = macro_rows + sub_rows

for idx, row in enumerate(all_structural_197, 1):
    row[-1] = f"SHK-M2M-2026-{idx:04d}"

for csv_path in [
    "SHEIKHA_V130_29_CHIEFS_M2M_SUMMARY.csv",
    "SHEIKHA_V140_182_STRUCTURAL_CHIEFS_MASTER.csv",
    "SHEIKHA_V141_197_STRUCTURAL_CHIEFS_MASTER.csv"
]:
    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["Code", "Category_Tier", "Title_EN_or_Ref", "Title_AR", "Methodology_or_Description", "Weight_KPI", "Primary_Port", "Next_Stage_or_Parent_Handoff", "Directors_Count", "Staff_Count", "Seed_M2M", "Proliferated_M2M", "License_ID"])
        w.writerows(all_structural_197)

total_struct = len(all_structural_197)
hs_chiefs = 5000
grand_chiefs = total_struct + hs_chiefs
directors_cnt = total_struct * 6
staff_cnt = total_struct * 24
seeds_cnt = total_struct * 16
nodes_cnt = (seeds_cnt * 15) + (hs_chiefs * 2)
synaptic_cnt = nodes_cnt * 16
licenses_cnt = 56 + total_struct

manifest_v141 = {
    "schema": "SHEIKHA_V141_KERNEL_BAREMETAL_PEARLMETAL_FIRMWARE_FOUNDRY_MANIFEST_CORE",
    "timestamp": datetime.datetime.now().isoformat(),
    "seal": "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED",
    "operational_decision": "SCHEDULED_MONITORING_ACTIVE / FULL_LIVE_READINESS_HOLD",
    "five_sovereign_pillars_added": {
        "C_88_chief_kernel_officer": {
            "code": "C-88",
            "title_ar": "كبير مدراء الكيرنل (Chief Sheikha Kernel Officer)",
            "assets": ["bare-metal/kernel/entry/sheikha_kernel.c", "bare-metal/contracts/SHEIKHA-KERNEL-CONTRACT-V1.json", "SHEIKHA_CORE_WEIGHT_0476_SHEIKHA_OS_KERNEL_CORE", "SHEIKHA_CORE_WEIGHT_0485_SHEIKHA_CHAIN_OS_KERNEL"],
            "port": 18125,
            "kpi": "100%"
        },
        "C_89_chief_baremetal_and_pearl_metal_officer": {
            "code": "C-89",
            "title_ar": "كبير مدراء Sheikha Bare-Metal & Pearl Metal (العتاد المجرد ومعدن اللؤلؤ 15,000MT)",
            "assets": ["bare-metal/build/sheikha-bare-metal-pipeline-v1.js", "bare-metal/images/sheikha-bare-metal-seed-v1.img", "SHEIKHA_CORE_WEIGHT_0477_PEARL_METAL_METALLURGY_15000MT", "MT-001 Cathode Cu 99.99% LME Grade A"],
            "port": 18126,
            "kpi": "100%"
        },
        "C_90_chief_firmware_officer": {
            "code": "C-90",
            "title_ar": "كبير مدراء Firmware (البرمجيات المدمجة وشرائح RISC-V ومتحكمات الأفران PLC)",
            "assets": ["SHEIKHA_CORE_WEIGHT_0478_SILICON_CHIP_RISCV_FIRMWARE", "bare-metal/images/esp/EFI/BOOT/BOOTX64.EFI", "RTOS / PLC / OPC-UA / Modbus Firmware"],
            "port": 18094,
            "kpi": "99.98%"
        },
        "C_91_chief_foundry_officer": {
            "code": "C-91",
            "title_ar": "كبير مدراء الفوندري (مسبك شيخة 18126 وخطوط السباكة الـ 20 وتراخيص 18159)",
            "assets": ["sheikha_foundry_lab_18126.py", "sheikha_partnerships_licensing_portal.py (18159)", "20 Foundry Lines (FL-01..FL-20)", "56 Foundry Weight Licenses (SHK-W-2026-0001..0056)"],
            "port": 18126,
            "kpi": "100%"
        },
        "C_92_chief_manifest_officer": {
            "code": "C-92",
            "title_ar": "كبير مدراء Manifest (البيان المعماري الموحد ومنافست الشحن BOL وسجل اللوح المحفوظ)",
            "assets": ["SHEIKHA_GITHUB_OMNI_AI_MANIFEST_V131.json", "digital_bills_of_lading (11-Col Cargo Manifest)", "SHEIKHA-CORE/blockchain/registry.json (535 files — SHA edc795a4)"],
            "port": 18131,
            "kpi": "100%"
        }
    },
    "hierarchy_summary": {
        "supreme_macro_chiefs_C01_to_C92": len(macro_rows),
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
        "governed_weights_total": 10000
    }
}

raw_bytes = json.dumps(manifest_v141, indent=2, ensure_ascii=False).encode("utf-8")
manifest_v141["manifest_sha256"] = hashlib.sha256(raw_bytes).hexdigest()

for j_path in [
    "SHEIKHA_V130_UNIFIED_CHIEFS_LICENSES_EXPORT.json",
    "SHEIKHA_V141_KERNEL_BAREMETAL_FIRMWARE_FOUNDRY_MANIFEST.json"
]:
    Path(j_path).write_text(json.dumps(manifest_v141, indent=2, ensure_ascii=False), encoding="utf-8")

print("✓ تم تفعيل القيادات السيادية الخمس (V141) بنجاح تام وبدون أي تكرار:")
print("  • C-88: كبير مدراء الكيرنل (Kernel — sheikha_kernel.c & Kernel Contracts)")
print("  • C-89: كبير مدراء Sheikha Bare-Metal & Pearl Metal (العتاد المجرد ومعدن اللؤلؤ 15,000MT)")
print("  • C-90: كبير مدراء Firmware (البرمجيات المدمجة وشرائح RISC-V وإقلاع BOOTX64.EFI ومتحكمات الأفران)")
print("  • C-91: كبير مدراء الفوندري (مسبك شيخة 18126 وخطوط السباكة الـ 20 وتراخيص الأوزان 18159)")
print("  • C-92: كبير مدراء Manifest (البيان المعماري الموحد ومنافست الشحن BOL وسجل اللوح المحفوظ)")
print(f"  • الإجمالي الموحد: {total_struct} كبير مدراء هيكلي ({len(macro_rows)} عام + {len(sub_rows)} متخصص) + 5,000 مدير منتج = {grand_chiefs} كبير مدراء")
print(f"  • الكوادر والعقد: {directors_cnt} مدير إدارة | {staff_cnt} مهندساً وموظفاً | {nodes_cnt} عقدة M2M | {synaptic_cnt} رابطاً مشبكياً | {licenses_cnt} ترخيصاً")
print(f"  • SHA-256: {manifest_v141['manifest_sha256']}")
