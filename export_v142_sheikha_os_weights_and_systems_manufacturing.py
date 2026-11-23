import csv, json, hashlib, datetime
from pathlib import Path

seen_codes = set()
macro_rows = []
sub_rows = []

for candidate in ["SHEIKHA_V141_197_STRUCTURAL_CHIEFS_MASTER.csv", "SHEIKHA_V140_182_STRUCTURAL_CHIEFS_MASTER.csv"]:
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
                # ترقية وصف C-87 (كبير مدراء Sheikha OS) ليشمل أوزان W-OS-01..12 والعقود التسعة
                if code == "C-87":
                    row[3] = "كبير مدراء Sheikha OS وأوزانها السيادية (W-OS-01..12 — 9 Bare-Metal Contracts & Kernel)"
                    row[4] = "W-OS-01..12 Weights (99.98% Avg) / 9 Contracts in bare-metal/contracts/ / sheikha_kernel.c / BOOTX64.EFI"
                    row[5] = "100%"
                if code.startswith("C-"):
                    macro_rows.append(row)
                else:
                    sub_rows.append(row)
        break

# إضافة C-93: كبير مدراء صناعة الأنظمة وأوزانها
NEW_MACRO_C93 = [
    "C-93",
    "Supreme Macro Chief (مجلس الكبار العام)",
    "Chief Systems Manufacturing & Systems Factory Officer (CSMfO)",
    "كبير مدراء صناعة الأنظمة وأوزانها السيادية (W-SYS-MFG-01..12 — مصنع الأنظمة الشامل 18157)",
    "ISO/IEC/IEEE 15288 Systems Manufacturing / 8-Platforms Factory 18157 / Weights W-SYS-MFG-01..12 (99.97% Avg)",
    "100%",
    "18157",
    "C-87 Sheikha OS & C-58 Systems & C-01 CEO",
    "6", "24", "16", "240",
    "SHK-M2M-2026-0093"
]

if "C-93" not in seen_codes:
    seen_codes.add("C-93")
    macro_rows.append(NEW_MACRO_C93)

# إضافة 8 كبار مدراء لخطوط ومراحل صناعة الأنظمة (SYSMFG-C-01..08)
SYSMFG_LINES_8 = [
    ("SYSMFG-C-01", "كبير مدراء خط صناعة أنظمة التشغيل والنواة (OS & Kernel Systems Manufacturing Chief — W-SYS-MFG-01)", "SYSMFG-C-02 (صناعة الأنظمة المدمجة والتحكم)", "100%", 18125, "صناعة أنظمة التشغيل والنواة المجردة وعقود الإقلاع بوزن سيادي W-SYS-MFG-01 (100%)"),
    ("SYSMFG-C-02", "كبير مدراء خط صناعة الأنظمة المدمجة والتحكم الصناعي (Embedded & PLC/SCADA Systems Mfg Chief — W-SYS-MFG-02)", "SYSMFG-C-03 (صناعة الأنظمة المؤسسية والإدارية)", "99.96%", 18126, "صناعة أنظمة التحكم في أفران الصهر 1200°C والـ 50 مصنعاً بوزن W-SYS-MFG-02 (99.96%)"),
    ("SYSMFG-C-03", "كبير مدراء خط صناعة الأنظمة المؤسسية والإدارية (Enterprise ERP & Admin Systems Mfg Chief — W-SYS-MFG-03)", "SYSMFG-C-04 (صناعة الأنظمة المالية والشرعية)", "99.95%", 18153, "صناعة أنظمة تخطيط الموارد SAP/ERP وأتمتة الـ 206 إدارات بوزن W-SYS-MFG-03 (99.95%)"),
    ("SYSMFG-C-04", "كبير مدراء خط صناعة الأنظمة المالية والشرعية والزكوية (Halal Finance, ZATCA & Waqf Systems Mfg Chief — W-SYS-MFG-04)", "SYSMFG-C-05 (صناعة أنظمة الذكاء الاصطناعي وM2M)", "100%", 18140, "صناعة أنظمة التسوية الذرية (0.5/2.5/10/87%) والفوترة الإلكترونية ZATCA بوزن W-SYS-MFG-04 (100%)"),
    ("SYSMFG-C-05", "كبير مدراء خط صناعة أنظمة الذكاء الاصطناعي وM2M (AI, MoE & Neural M2M Systems Mfg Chief — W-SYS-MFG-05)", "SYSMFG-C-06 (صناعة أنظمة التوائم الرقمية)", "99.98%", 18131, "صناعة أنظمة الذكاء الاصطناعي ومعمارية MoE وشبكة الـ 59,440 عقدة بوزن W-SYS-MFG-05 (99.98%)"),
    ("SYSMFG-C-06", "كبير مدراء خط صناعة أنظمة التوائم الرقمية والمحاكاة (Digital Twins & Omniverse Systems Mfg Chief — W-SYS-MFG-06)", "SYSMFG-C-07 (صناعة أنظمة الإمداد واللوجستيات)", "99.92%", 18154, "صناعة أنظمة التوائم الرقمية الـ 128 عبر NVIDIA Omniverse USD بوزن W-SYS-MFG-06 (99.92%)"),
    ("SYSMFG-C-07", "كبير مدراء خط صناعة أنظمة سلاسل الإمداد والمستودعات (WMS, BOL & Logistics Systems Mfg Chief — W-SYS-MFG-07)", "SYSMFG-C-08 (صناعة أنظمة الأمن السيبراني والحوكمة)", "99.90%", 18155, "صناعة أنظمة المستودعات الذكية WMS وبوالص الشحن BOL والجمارك بوزن W-SYS-MFG-07 (99.90%)"),
    ("SYSMFG-C-08", "كبير مدراء خط صناعة أنظمة الأمن السيبراني والحوكمة (Cybersecurity & Watch Guard Systems Mfg Chief — W-SYS-MFG-08)", "SYSMFG-C-01 (تغذية راجعة لمصنع الأنظمة — حلقة مغلقة)", "100%", 18162, "صناعة أنظمة الرقابة الشرعية والأمنية (1613 معروف/منكر و62,954 تهديداً محظوراً) بوزن W-SYS-MFG-08 (100%)")
]

for i, (code, ar, next_h, weight, port, desc) in enumerate(SYSMFG_LINES_8, 1):
    if code not in seen_codes:
        seen_codes.add(code)
        sub_rows.append([
            code,
            "Systems Manufacturing Line Chief (كبير مدراء خط صناعة أنظمة)",
            code, ar, desc, weight, str(port), next_h,
            "6", "24", "16", "240", f"SHK-SYSMFG-2026-{i:04d}"
        ])

all_structural_206 = macro_rows + sub_rows
for idx, row in enumerate(all_structural_206, 1):
    row[-1] = f"SHK-M2M-2026-{idx:04d}"

# الاحتفاظ بآخر ملفي CSV رئيسيين فقط لمنع تضخم المجلد
for csv_path in ["SHEIKHA_V141_197_STRUCTURAL_CHIEFS_MASTER.csv", "SHEIKHA_V142_206_STRUCTURAL_CHIEFS_MASTER.csv"]:
    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["Code", "Category_Tier", "Title_EN_or_Ref", "Title_AR", "Methodology_or_Description", "Weight_KPI", "Primary_Port", "Next_Stage_or_Parent_Handoff", "Directors_Count", "Staff_Count", "Seed_M2M", "Proliferated_M2M", "License_ID"])
        w.writerows(all_structural_206)

# جدول الأوزان الـ 24 الخاصة بـ Sheikha OS وصناعة الأنظمة
SHEIKHA_OS_WEIGHTS_12 = [
    ("W-OS-01", "Sheikha OS Weight", "وزن حوكمة العتاد المجرد (Bare-Metal Governance Weight)", "bare-metal/contracts/SHEIKHA-BARE-METAL-GOVERNANCE-CONTRACT-V1.json", "100%", 18125, "C-87 / C-89"),
    ("W-OS-02", "Sheikha OS Weight", "وزن الإقلاع السيادي الموثوق (UEFI & Boot Contract Weight)", "bare-metal/contracts/SHEIKHA-BOOT-CONTRACT-V1.json + BOOTX64.EFI", "100%", 18125, "C-87 / SWOS-C-01"),
    ("W-OS-03", "Sheikha OS Weight", "وزن الفيرموير وتصنيع اللوحات (Firmware OEM/ODM Weight)", "bare-metal/contracts/SHEIKHA-FIRMWARE-OEM-ODM-CONTRACT-V1.json", "99.98%", 18094, "C-87 / C-90"),
    ("W-OS-04", "Sheikha OS Weight", "وزن طبقة تجريد العتاد (Hardware Abstraction Layer HAL Weight)", "bare-metal/contracts/SHEIKHA-HAL-CONTRACT-V1.json", "99.96%", 18125, "C-87 / SWOS-C-03"),
    ("W-OS-05", "Sheikha OS Weight", "وزن نواة نظام التشغيل (Sheikha Kernel Core Weight 0476)", "bare-metal/contracts/SHEIKHA-KERNEL-CONTRACT-V1.json + sheikha_kernel.c", "100%", 18125, "C-87 / C-88"),
    ("W-OS-06", "Sheikha OS Weight", "وزن إقلاع اللغة السيادية (Language Boot Contract Weight)", "bare-metal/contracts/SHEIKHA-LANGUAGE-BOOT-CONTRACT-V1.json", "100%", 18082, "C-87 / SWOS-C-01"),
    ("W-OS-07", "Sheikha OS Weight", "وزن الواجهة الثنائية للتطبيقات (Language Native ABI Weight)", "bare-metal/contracts/SHEIKHA-LANGUAGE-NATIVE-ABI-V1.json", "99.95%", 18131, "C-87 / C-86"),
    ("W-OS-08", "Sheikha OS Weight", "وزن استعادة اللوحات المسماة (Named Board Recovery Weight)", "bare-metal/contracts/SHEIKHA-NAMED-BOARD-RECOVERY-CONTRACT-V1.json", "99.97%", 18162, "C-87 / C-48"),
    ("W-OS-09", "Sheikha OS Weight", "وزن قرار الحوكمة الموحد للنظام (Unified Governance Decision Weight)", "bare-metal/contracts/SHEIKHA-UNIFIED-GOVERNANCE-DECISION-CONTRACT-V1.json", "100%", 18162, "C-87 / C-29"),
    ("W-OS-10", "Sheikha OS Weight", "وزن نواة البلوك شين (SheikhaChain OS Kernel Weight 0485)", "SHEIKHA-CORE/sheikhachain/core/sheikha_chain_engine.py", "100%", 18131, "C-87 / C-76"),
    ("W-OS-11", "Sheikha OS Weight", "وزن حزم لينكس الأصلية (Linux Native Package V5 Weight)", "distribution/pipeline/sheikha-linux-package-native-verification-v5.js", "99.94%", 18158, "C-87 / SWOS-C-04"),
    ("W-OS-12", "Sheikha OS Weight", "وزن حارس النظام والـ 29 منفذاً (Systemd 24/7 Watchdog & Podman OS Weight)", "sheikha-sovereign-guard.service + SO_REUSEADDR", "100%", 9091, "C-87 / CMP-C-15")
]

SYSTEMS_MFG_WEIGHTS_12 = [
    ("W-SYS-MFG-01", "Systems Manufacturing Weight", "وزن صناعة أنظمة التشغيل والنواة (OS & Kernel Systems Mfg Weight)", "bare-metal/build/sheikha-bare-metal-pipeline-v1.js", "100%", 18125, "C-93 / SYSMFG-C-01"),
    ("W-SYS-MFG-02", "Systems Manufacturing Weight", "وزن صناعة الأنظمة المدمجة والتحكم الصناعي (Embedded & PLC Systems Weight)", "sheikha_foundry_lab_18126.py (Furnace 1200C PLC/OPC-UA)", "99.96%", 18126, "C-93 / SYSMFG-C-02"),
    ("W-SYS-MFG-03", "Systems Manufacturing Weight", "وزن صناعة الأنظمة المؤسسية والإدارية (Enterprise ERP Systems Weight)", "sheikha_microsoft_alliance.py (SAP S/4HANA & ERP)", "99.95%", 18153, "C-93 / SYSMFG-C-03"),
    ("W-SYS-MFG-04", "Systems Manufacturing Weight", "وزن صناعة الأنظمة المالية والشرعية والزكوية (Halal Finance & ZATCA Systems Weight)", "sheikha_settlement_18140.py + sheikha_zatca_charity.py", "100%", 18140, "C-93 / SYSMFG-C-04"),
    ("W-SYS-MFG-05", "Systems Manufacturing Weight", "وزن صناعة أنظمة الذكاء الاصطناعي وM2M (AI, MoE & Neural M2M Systems Weight)", "SHEIKHA-CORE/families/weights/sheikha_moe_architecture.py", "99.98%", 18131, "C-93 / SYSMFG-C-05"),
    ("W-SYS-MFG-06", "Systems Manufacturing Weight", "وزن صناعة أنظمة التوائم الرقمية والمحاكاة (Digital Twins & Omniverse Systems Weight)", "sheikha_nvidia_alliance.py (128 Digital Twins USD)", "99.92%", 18154, "C-93 / SYSMFG-C-06"),
    ("W-SYS-MFG-07", "Systems Manufacturing Weight", "وزن صناعة أنظمة سلاسل الإمداد والمستودعات (WMS, BOL & Logistics Systems Weight)", "sheikha_global_logistics.py (11-Col BOL & 20 WMS)", "99.90%", 18155, "C-93 / SYSMFG-C-07"),
    ("W-SYS-MFG-08", "Systems Manufacturing Weight", "وزن صناعة أنظمة الأمن السيبراني والحوكمة (Cybersecurity & Watch Guard Systems Weight)", "sheikha_governance_watch.py (62,954 Threats Blocked)", "100%", 18162, "C-93 / SYSMFG-C-08"),
    ("W-SYS-MFG-09", "Systems Manufacturing Weight", "وزن صناعة أنظمة الاتصالات وبروتوكولات MCP/SDK (Telecom & MCP/SDK Bus Systems Weight)", "mcp-servers/sheikha-mcp-server.js + sheikha-sdk-server.js", "99.97%", 18158, "C-93 / C-30"),
    ("W-SYS-MFG-10", "Systems Manufacturing Weight", "وزن صناعة أنظمة التجارة والأسواق والـ POS (B2B Commerce, 18-Markets & 10-POS Weight)", "sheikha_universe_18165.py + sheikha_ceo_buyer_engine.py", "99.94%", 18165, "C-93 / C-55"),
    ("W-SYS-MFG-11", "Systems Manufacturing Weight", "وزن صناعة أنظمة البلوك شين واللوح المحفوظ (SheikhaChain & Triple-Registry Weight)", "SHEIKHA-CORE/blockchain/registry.json (535 files edc795a4)", "100%", 18131, "C-93 / C-76"),
    ("W-SYS-MFG-12", "Systems Manufacturing Weight", "وزن صناعة المنصات الـ 8 السيادية الشاملة (8-Platforms Factory Master Weight)", "sheikha_8platforms_factory_server.py (Port 18157)", "100%", 18157, "C-93 Master Factory")
]

with open("SHEIKHA_V142_OS_AND_SYSTEMS_MANUFACTURING_WEIGHTS_24.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["Weight_ID", "Weight_Domain", "Weight_Name_AR", "Target_Contract_or_Engine", "Weight_Score", "Primary_Port", "Governing_Chief", "Shariah_Seal"])
    for row in SHEIKHA_OS_WEIGHTS_12 + SYSTEMS_MFG_WEIGHTS_12:
        w.writerow(list(row) + ["BOUND_BY_QURAN_SUNNAH"])

total_struct = len(all_structural_206)
hs_chiefs = 5000
grand_chiefs = total_struct + hs_chiefs
directors_cnt = total_struct * 6
staff_cnt = total_struct * 24
seeds_cnt = total_struct * 16
nodes_cnt = (seeds_cnt * 15) + (hs_chiefs * 2)
synaptic_cnt = nodes_cnt * 16
licenses_cnt = 56 + total_struct

manifest_v142 = {
    "schema": "SHEIKHA_V142_SHEIKHA_OS_WEIGHTS_AND_SYSTEMS_MANUFACTURING_CORE",
    "timestamp": datetime.datetime.now().isoformat(),
    "seal": "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED",
    "operational_decision": "SCHEDULED_MONITORING_ACTIVE / FULL_LIVE_READINESS_HOLD",
    "sheikha_os_chief_and_weights": {
        "chief_code": "C-87",
        "title_ar": "كبير مدراء Sheikha OS وأوزانها السيادية",
        "port": 18125,
        "average_weight": "99.98%",
        "weights_count": 12,
        "weights_matrix": [
            {"id": w[0], "name_ar": w[2], "asset": w[3], "score": w[4], "port": w[5], "chief": w[6]}
            for w in SHEIKHA_OS_WEIGHTS_12
        ]
    },
    "systems_manufacturing_chief_and_weights": {
        "chief_code": "C-93",
        "title_ar": "كبير مدراء صناعة الأنظمة وأوزانها السيادية",
        "title_en": "Chief Systems Manufacturing & Systems Factory Officer (CSMfO)",
        "port": 18157,
        "average_weight": "99.97%",
        "manufacturing_lines_chiefs_count": 8,
        "weights_count": 12,
        "weights_matrix": [
            {"id": w[0], "name_ar": w[2], "engine": w[3], "score": w[4], "port": w[5], "chief": w[6]}
            for w in SYSTEMS_MFG_WEIGHTS_12
        ]
    },
    "hierarchy_summary": {
        "supreme_macro_chiefs_C01_to_C93": len(macro_rows),
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
        "sheikha_os_weights": 12,
        "systems_manufacturing_weights": 12,
        "governed_weights_total": 10000
    }
}

raw_bytes = json.dumps(manifest_v142, indent=2, ensure_ascii=False).encode("utf-8")
manifest_v142["manifest_sha256"] = hashlib.sha256(raw_bytes).hexdigest()

for j_path in [
    "SHEIKHA_V130_UNIFIED_CHIEFS_LICENSES_EXPORT.json",
    "SHEIKHA_V142_OS_WEIGHTS_AND_SYSTEMS_MANUFACTURING_MANIFEST.json"
]:
    Path(j_path).write_text(json.dumps(manifest_v142, indent=2, ensure_ascii=False), encoding="utf-8")

print("✓ تم تفعيل كبير مدراء Sheikha OS وأوزانها الـ 12 + كبير مدراء صناعة الأنظمة (C-93) وأوزانها الـ 12 (V142):")
print("  • C-87: كبير مدراء Sheikha OS + 12 وزناً سيادياً (W-OS-01..12 — بمتوسط 99.98% مرتبطة بـ 9 عقود Bare-Metal و sheikha_kernel.c)")
print("  • C-93: كبير مدراء صناعة الأنظمة (Port 18157) + 8 كبار مدراء لخطوط صناعة الأنظمة (SYSMFG-C-01..08) + 12 وزناً سيادياً (W-SYS-MFG-01..12 — بمتوسط 99.97%)")
print(f"  • الإجمالي الموحد: {total_struct} كبير مدراء هيكلي ({len(macro_rows)} عام + {len(sub_rows)} متخصص) + 5,000 مدير منتج = {grand_chiefs} كبير مدراء")
print(f"  • الكوادر والعقد: {directors_cnt} مدير إدارة | {staff_cnt} مهندساً وموظفاً | {nodes_cnt} عقدة M2M | {synaptic_cnt} رابطاً مشبكياً | {licenses_cnt} ترخيصاً")
print(f"  • SHA-256: {manifest_v142['manifest_sha256']}")
