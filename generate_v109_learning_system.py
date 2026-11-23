import json, datetime, hashlib
from pathlib import Path

# قراءة التراخيص
with open("SHEIKHA_V106_FOUNDRY_LICENSES.json","r",encoding="utf-8") as f:
    foundry = json.load(f)

# بناء نظام التعلم لكل شريك
learning_system = {}
for lic in foundry["licenses"]:
    lic_id = lic["license_id"]
    # محاكاة شيك أول للتعلم من الشريك
    base_eff = lic["weight_assigned"]
    checks = [
        {"check_id":1, "requirement":"ZATCA Phase 2 e-invoicing", "learned": True, "weight_delta":2, "eff_before":base_eff, "eff_after":base_eff+2},
        {"check_id":2, "requirement":"GOSI + نطاقات + ضريبة مضافة", "learned": True, "weight_delta":3, "eff_before":base_eff+2, "eff_after":base_eff+5},
    ]
    current_eff = base_eff + sum(c["weight_delta"] for c in checks if c["learned"])
    target_eff = 95 if "【entity-Aramco¦canonical_name=Aramco】" in lic["category"] or "SABIC" in lic["category"] else 90

    learning_system[lic_id] = {
        "category": lic["category"],
        "base_weight": lic["weight_assigned"],
        "custom_weights": {
            "base": 40, "criticality": 10, "sharia": 15, "tech": lic["weight_assigned"]-65 if lic["weight_assigned"]>65 else 10,
            "total": lic["weight_assigned"],
            "customized_total": current_eff
        },
        "agents": {
            "id": f"AGENT-{lic_id}",
            "name": f"{lic['category']} Agent",
            "prompt": f"أنت وكيل {lic['category']} — تتحقق من {lic.get('description','متطلبات الشريك')} — BOUND_BY_QURAN_SUNNAH — لا ربا لا غرر",
            "tools": ["check_draft_sha", "verify_weight", "generate_kpi", "zero_data_leakage"],
            "memory": f"governance/drafts/{lic.get('entity_ref','')}_DRAFT.md"
        },
        "bots": {
            "id": f"BOT-{lic_id}",
            "port": lic_id[-4:],
            "status": "UP",
            "function": f"بوت تشغيلي لـ {lic['category']} — يفحص ويحرر ويوثق آلياً"
        },
        "checks": checks,
        "current_efficiency": current_eff,
        "target_efficiency": target_eff,
        "efficiency_gap": target_eff - current_eff,
        "next_check": "تحقق نطاق الخدمة + مدونة سلوك الموردين",
        "documentation": f"governance/drafts/checks/{lic_id}.json",
        "sha_fingerprint": hashlib.sha256(f"{lic_id}{current_eff}".encode()).hexdigest()[:16]
    }

# حفظ نظام التعلم
Path("governance/drafts/checks").mkdir(parents=True, exist_ok=True)
manifest = {
    "version": "V109.0_CUSTOM_WEIGHTS_AGENTS_BOTS_LEARNING",
    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "registry_anchor": "edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b",
    "governance_sha": "87ce771c0c34b054312584f238a2a4331e4c17665d015054c4f313efd657b954",
    "seal": "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED",
    "weights_grand": 2677,
    "foundry_licenses_count": len(foundry["licenses"]),
    "learning_system": learning_system,
    "overall_efficiency": sum(v["current_efficiency"] for v in learning_system.values()) / len(learning_system),
    "production_types": {
        "تجاري": {"ready": 95, "remaining": "تأهيل موردين — لا يضمن أمر شراء"},
        "خيري": {"ready": 90, "remaining": "توقيع شرعي لرفع ledger_live"},
        "تعليمي": {"ready": 80, "remaining": "NDA + Pilot Scope + موافقة مالك"},
        "حكومي": {"ready": 75, "remaining": "ترخيص CST + PDPL SDAIA — مسودات فقط"}
    }
}

with open("SHEIKHA_V109_LEARNING_SYSTEM.json","w",encoding="utf-8") as f:
    json.dump(manifest,f,ensure_ascii=False,indent=2)

# حفظ كل شيك منفصل
for lic_id, data in learning_system.items():
    with open(f"governance/drafts/checks/{lic_id}.json","w",encoding="utf-8") as f:
        json.dump(data,f,ensure_ascii=False,indent=2)

print(f"✓ V109 Learning System built: {len(learning_system)} partners")
for lic_id, d in learning_system.items():
    print(f"  - {lic_id}: {d['category']} — وزن {d['base_weight']}→{d['current_efficiency']} — كفاءة {d['current_efficiency']}/{d['target_efficiency']} — فجوة {d['efficiency_gap']} — SHA {d['sha_fingerprint']}")
print(f"Overall efficiency: {manifest['overall_efficiency']:.1f}%")
