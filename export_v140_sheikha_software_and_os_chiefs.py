import csv, json, hashlib, datetime
from pathlib import Path

existing_rows = []
v139_csv = Path("SHEIKHA_V139_172_STRUCTURAL_CHIEFS_MASTER.csv")
if v139_csv.exists():
    with open(v139_csv, "r", encoding="utf-8-sig") as f:
        r = list(csv.reader(f))
        existing_rows = r[1:]

macro_85 = [row for row in existing_rows if row[0].startswith("C-")]
sub_87 = [row for row in existing_rows if not row[0].startswith("C-")]

NEW_MACRO_SW_OS_2 = [
    [
        "C-86",
        "Supreme Macro Chief (مجلس الكبار العام)",
        "Chief Sheikha Software Officer (CSSwO)",
        "كبير مدراء Sheikha Software (البرمجيات السيادية والتطبيقات والمنصات وحزم MCP/SDK)",
        "ISO/IEC 12207 / DevSecOps / S-SaaS 8-Platforms / MCP & SDK Servers / PWA 18152",
        "100%",
        "18110",
        "C-87 Sheikha OS & 18082 Core",
        "6", "24", "16", "240",
        "SHK-M2M-2026-0086"
    ],
    [
        "C-87",
        "Supreme Macro Chief (مجلس الكبار العام)",
        "Chief Sheikha OS Officer (CSOSO)",
        "كبير مدراء Sheikha OS (نظام تشغيل شيخة السيادي والنواة المجردة Bare-Metal Kernel)",
        "sheikha_kernel.c / BOOTX64.EFI / Kernel & Boot Contracts V1 / Root CLI V65.3 / Podman OS",
        "100%",
        "18125",
        "C-86 Sheikha Software & C-51 Computing",
        "6", "24", "16", "240",
        "SHK-M2M-2026-0087"
    ]
]

SWOS_LAYERS_8 = [
    ("SWOS-C-01", "كبير مدراء طبقة الإقلاع الموثوق لنظام شيخة (Sheikha OS UEFI & BOOTX64.EFI Layer Chief)", "SWOS-C-02 (نواة sheikha_kernel.c)", "100%", 18125, "إقلاع آمن عبر bare-metal/images/esp/EFI/BOOT/BOOTX64.EFI وعقد الإقلاع اللغوي V1"),
    ("SWOS-C-02", "كبير مدراء طبقة النواة المجردة لنظام شيخة (Sheikha OS Bare-Metal Kernel C Layer Chief)", "SWOS-C-03 (طبقة التجريد والكبسولات Runtime)", "100%", 18125, "إدارة النواة bare-metal/kernel/entry/sheikha_kernel.c وعقد النواة SHEIKHA-KERNEL-CONTRACT-V1"),
    ("SWOS-C-03", "كبير مدراء طبقة التجريد والكبسولات والحاويات (Sheikha OS Podman & Systemd Runtime Chief)", "SWOS-C-04 (طبقة الجذر والأوامر Sheikha CLI)", "99.95%", 18156, "إدارة كبسولات Podman وخدمة الحارس المستمر sheikha-sovereign-guard.service"),
    ("SWOS-C-04", "كبير مدراء طبقة سطر الأوامر السيادي والحزم (Sheikha OS Root CLI V65.3 & Linux Packages Chief)", "SWOS-C-05 (طبقة الخوادم والـ 29 منفذاً)", "100%", 18082, "تشغيل أداة الجذر sheikha-cli.js والتحقق الأصلي لحزم لينكس V5"),
    ("SWOS-C-05", "كبير مدراء طبقة الخوادم والبرمجيات الوسيطة (Sheikha Software Middleware & 29-Ports Daemons Chief)", "SWOS-C-06 (برمجيات الذكاء الاصطناعي والأوزان)", "99.98%", 18158, "إدارة خوادم بايثون ونود جي إس الـ 29 وربط MCP/SDK مع عزل المسارات الصارم 404"),
    ("SWOS-C-06", "كبير مدراء برمجيات الذكاء الاصطناعي ومعمارية MoE (Sheikha AI Software & MoE Weights Chief)", "SWOS-C-07 (البرمجيات التجارية والمالية والشرعية)", "99.96%", 18131, "تشغيل sheikha_moe_architecture.py وsheikha_omni_pillars_engine.py والـ 10,000 وزن"),
    ("SWOS-C-07", "كبير مدراء البرمجيات التجارية والمحاسبية والشرعية (Sheikha ERP, ZATCA, Waqf & Checkout Software Chief)", "SWOS-C-08 (واجهات المستخدم وتجربة البرمجيات)", "100%", 18163, "برمجيات تقسيم الدفاتر الأربعة (0.5/2.5/10/87%) والفوترة الإلكترونية ZATCA Phase 2 والـ BOL"),
    ("SWOS-C-08", "كبير مدراء واجهات البرمجيات وتطبيقات الويب والجوال (Sheikha UI/UX Dashboards & Mobile PWA Chief)", "SWOS-C-01 (تغذية راجعة لنظام التشغيل Sheikha OS)", "99.94%", 18152, "إدارة لوحات التحكم التفاعلية HTML/React وتطبيقات PWA ومزامنة المتاجر")
]

swos_rows_8 = [
    [code, "Sheikha OS & Software Layer Chief (كبير مدراء طبقة نظام تشغيل وبرمجيات)", code, ar, desc, weight, str(port), next_layer, "6", "24", "16", "240", f"SHK-SWOS-2026-{i:04d}"]
    for i, (code, ar, next_layer, weight, port, desc) in enumerate(SWOS_LAYERS_8, 1)
]

all_structural_182 = macro_85 + NEW_MACRO_SW_OS_2 + swos_rows_8 + sub_87

for idx, row in enumerate(all_structural_182, 1):
    row[-1] = f"SHK-M2M-2026-{idx:04d}"

for csv_path in [
    "SHEIKHA_V130_29_CHIEFS_M2M_SUMMARY.csv",
    "SHEIKHA_V139_172_STRUCTURAL_CHIEFS_MASTER.csv",
    "SHEIKHA_V140_182_STRUCTURAL_CHIEFS_MASTER.csv"
]:
    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["Code", "Category_Tier", "Title_EN_or_Ref", "Title_AR", "Methodology_or_Description", "Weight_KPI", "Primary_Port", "Next_Stage_or_Parent_Handoff", "Directors_Count", "Staff_Count", "Seed_M2M", "Proliferated_M2M", "License_ID"])
        w.writerows(all_structural_182)

manifest_v140 = {
    "schema": "SHEIKHA_V140_SHEIKHA_SOFTWARE_AND_SHEIKHA_OS_SOVEREIGN_CORE",
    "timestamp": datetime.datetime.now().isoformat(),
    "seal": "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED",
    "operational_decision": "SCHEDULED_MONITORING_ACTIVE / FULL_LIVE_READINESS_HOLD",
    "sheikha_software_and_os_governance": {
        "C_86_chief_sheikha_software_officer": {
            "code": "C-86",
            "title_ar": "كبير مدراء Sheikha Software",
            "title_en": "Chief Sheikha Software Officer (CSSwO)",
            "port": 18110,
            "core_assets": [
                "mcp-servers/sheikha-mcp-server.js",
                "mcp-servers/sheikha-sdk-server.js",
                "lib/sheikha-core-runtime.js",
                "SHEIKHA-CORE/families/weights/sheikha_moe_architecture.py",
                "SHEIKHA-CORE/infrastructure/sheikha_omni_pillars_engine.py",
                "8 Sovereign Platforms & 29 Python/Node Microservices"
            ],
            "directors": 6,
            "software_engineers_and_staff": 24,
            "proliferated_m2m_nodes": 240,
            "license": "SHK-M2M-2026-0086"
        },
        "C_87_chief_sheikha_os_officer": {
            "code": "C-87",
            "title_ar": "كبير مدراء Sheikha OS",
            "title_en": "Chief Sheikha Operating System Officer (CSOSO)",
            "port": 18125,
            "os_version": "sheikha-operating-system@1.0.51 (Root CLI V65.3)",
            "core_assets": [
                "bare-metal/kernel/entry/sheikha_kernel.c",
                "bare-metal/images/esp/EFI/BOOT/BOOTX64.EFI",
                "bare-metal/images/sheikha-bare-metal-seed-v1.img",
                "bare-metal/contracts/SHEIKHA-KERNEL-CONTRACT-V1.json",
                "bare-metal/contracts/SHEIKHA-LANGUAGE-BOOT-CONTRACT-V1.json",
                "cli/sheikha/sheikha-cli.js",
                "distribution/pipeline/sheikha-linux-package-native-verification-v5.js"
            ],
            "directors": 6,
            "kernel_and_os_engineers": 24,
            "proliferated_m2m_nodes": 240,
            "license": "SHK-M2M-2026-0087"
        },
        "swos_architecture_layers_8": [
            {"code": l[0], "title_ar": l[1], "next_layer_handoff": l[2], "weight": l[3], "port": l[4], "description": l[5]}
            for l in SWOS_LAYERS_8
        ]
    },
    "hierarchy_summary": {
        "supreme_macro_chiefs_C01_to_C87": 87,
        "sheikha_os_and_software_layer_chiefs_SWOS01_to_08": 8,
        "computing_item_type_stage_chiefs_CMP01_to_15": 15,
        "supply_chain_stage_handoff_chiefs": 12,
        "cloud_type_chiefs": 8,
        "sector_isic4_chiefs": 22,
        "classified_market_chiefs": 18,
        "trade_journey_chiefs": 12,
        "total_structural_chiefs": 182,
        "hs_code_product_chiefs": 5000,
        "grand_total_all_chiefs": 5182,
        "department_directors": 1092,
        "specialized_staff_and_engineers": 4368,
        "seed_m2m_agents_gen0": 2912,
        "proliferated_m2m_neural_nodes": 53680,
        "synaptic_neural_connections": 858880,
        "structural_licenses": 238,
        "hs_product_licenses": 5000,
        "governed_weights_total": 10000
    }
}

raw_bytes = json.dumps(manifest_v140, indent=2, ensure_ascii=False).encode("utf-8")
manifest_v140["manifest_sha256"] = hashlib.sha256(raw_bytes).hexdigest()

for j_path in [
    "SHEIKHA_V130_UNIFIED_CHIEFS_LICENSES_EXPORT.json",
    "SHEIKHA_V140_SHEIKHA_SOFTWARE_AND_OS_5182_MANIFEST.json"
]:
    Path(j_path).write_text(json.dumps(manifest_v140, indent=2, ensure_ascii=False), encoding="utf-8")

print("✓ تم تفعيل كبير مدراء Sheikha Software (C-86) وكبير مدراء Sheikha OS (C-87) وطبقاتهما الـ 8 (V140):")
print("  • C-86: كبير مدراء Sheikha Software (Port 18110 — S-SaaS, MCP/SDK, MoE AI, ERP, ZATCA, PWA)")
print("  • C-87: كبير مدراء Sheikha OS (Port 18125 — sheikha_kernel.c, BOOTX64.EFI, Root CLI V65.3, Podman Runtime)")
print("  • SWOS-C-01..08: 8 كبار مدراء لطبقات نظام التشغيل والبرمجيات بتسليم متتابع (Layer-to-Layer Handoff)")
print("  • الإجمالي الموحد: 182 كبير مدراء هيكلي + 5,000 كبير مدراء منتج HS Code = 5,182 كبير مدراء")
print("  • 1,092 مدير إدارة + 4,368 مهندساً وعالماً وموظفاً + 53,680 عقدة عصبية M2M + 858,880 رابطاً مشبكياً + 238 ترخيصاً")
print(f"  • SHA-256: {manifest_v140['manifest_sha256']}")
