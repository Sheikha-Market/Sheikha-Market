import json, datetime

models_registry = {
    "federation_version": "V100.0_ARGON_MATRIX",
    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "gateway_port": 18131,
    "sharia_guard": "BOUND_BY_QURAN_SUNNAH — ZERO_DATA_LEAKAGE",
    "active_selected_model": "4 Argon",
    "models": [
        {
            "id": "MODEL_4_ARGON",
            "name": "4 Argon",
            "role": "المهام المعقدة (Complex Sovereign Tasks & System Architecture)",
            "status": "ACTIVE_SELECTED",
            "assigned_ports": [18082, 18125, 18140, 18152]
        },
        {
            "id": "MODEL_3_8_THINKING",
            "name": "3.8 Thinking",
            "role": "تقديم حلول للمشاكل المعقدة (Deep Reasoning & Root Cause Analysis)",
            "status": "STANDBY_READY",
            "assigned_ports": [18094, 18110, 18126]
        },
        {
            "id": "MODEL_3_6_FLASH",
            "name": "3.6 Flash",
            "role": "مساعدة متكاملة فورية (High-Speed Catalog & OAuth Syndication)",
            "status": "STANDBY_READY",
            "assigned_ports": [18093, 18150, 18151]
        }
    ]
}

with open("SHEIKHA_ARGON_AI_MATRIX_V100.json", "w", encoding="utf-8") as f:
    json.dump(models_registry, f, ensure_ascii=False, indent=2)

print("================== 🧠 تسجيل مصفوفة نماذج Argon في شيخة ==================")
for m in models_registry["models"]:
    mark = "✓ [نشط ومختار]" if m["status"] == "ACTIVE_SELECTED" else "• [جاهز بالخلفية]"
    print(f"{mark} {m['name']:<15} : {m['role']}")
print("✓ تم الحفظ والتوثيق في: SHEIKHA_ARGON_AI_MATRIX_V100.json")
print("=========================================================================")
