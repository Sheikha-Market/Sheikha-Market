import json, datetime, hashlib
from pathlib import Path

# قراءة V105
with open("SHEIKHA_V105_WEIGHTS_FULL_AUTO.json","r",encoding="utf-8") as f:
    v105 = json.load(f)

# بناء تراخيص الفوندري لكل فئة مستهدفة
licenses = []
categories = [
    ("Supply Gateway - 【entity-Aramco¦canonical_name=Aramco】", "02_ARAMCO", 75, "مورد معادن/خدمات - التسجيل لا يضمن أمر شراء"),
    ("Supply Gateway - SABIC", "03_SABIC", 75, "مورد صناعي - العناية الواجبة"),
    ("Logistics Network - 【entity-Maersk¦canonical_name=Maersk】/【entity-DHL¦canonical_name=DHL】", "04_MAERSK", 70, "لوجستيات - قاعدة موردين"),
    ("Commerce Apps - 【entity-Shopify¦canonical_name=Shopify】", "05_SHOPIFY", 60, "تطبيقات تجار - مسار مطور بموافقة المستخدم"),
    ("University Lab - KFUPM", "06_KFUPM", 50, "بحث وتطوير - مشكلة صناعية"),
    ("Cloud & AI Exchange - 【entity-Microsoft¦canonical_name=Microsoft】/【entity-AWS¦canonical_name=AWS】/Google", "07_MICROSOFT", 80, "برامج سحابية SHEIKHAaaS - موصلات محكومة"),
    ("Digital Industry - 【entity-NVIDIA¦canonical_name=NVIDIA】", "13_NVIDIA", 70, "توأم رقمي - ملاحظة: Inception يستثني مزودي السحابة"),
    ("Governance & Licensing - Monshaat/CST/SDAIA", "01_MONSHAAT", 65, "دعم وتأهيل - ليست شراكة رسمية - مسودة داخلية"),
]

for idx, (cat, entity_id, weight, desc) in enumerate(categories, 1):
    lic_id = f"SHK-W-2026-{idx:04d}"
    payload = f"{lic_id}{cat}{weight}{v105['registry_anchor']}"
    sha = hashlib.sha256(payload.encode()).hexdigest()[:16]
    licenses.append({
        "license_id": lic_id,
        "type": "WEIGHT_LICENSE",
        "category": cat,
        "entity_ref": entity_id,
        "weight_assigned": weight,
        "built_by": "Sheikha Foundry V106",
        "built_for": "External Entity — باسم شيخة — مرخص",
        "description": desc,
        "registry_anchor": v105["registry_anchor"],
        "governance_sha": v105["governance_sha"],
        "seal": "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED",
        "transparency_fee": "0.5%",
        "zakat": "2.5%",
        "waqf": "10%",
        "attribution_required": "Built by Sheikha Foundry — Licensed Weight — CR 2051263653",
        "restrictions": ["لا ربا لا غرر", "لا إعادة بيع بدون ذكر المصدر", "ZERO_DATA_LEAKAGE", "لا تحكم في آلات حقيقية", "لا تسويات آلية"],
        "sha_fingerprint": sha,
        "validity": "2026-10-28 to 2027-10-28",
        "api": ["/api/weights/verify", "/api/factory/manifest", "/api/argon/status"],
        "status": "DRAFT_INTERNAL — ليست ترخيصاً مرسلاً"
    })

manifest = {
    "version": "V106.0_SHEIKHA_FOUNDRY_FULL",
    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "registry_anchor": v105["registry_anchor"],
    "governance_sha": v105["governance_sha"],
    "historical_535": 535,
    "v105_grand": 2677,
    "foundry_licenses_count": len(licenses),
    "licenses": licenses,
    "architecture": {
        "Layer0_Core": "18082 - 80 وزن - RISC-V",
        "Layer1_OS": "18140 Cloud OS + 18156 Argon Engine + 18157 Factory",
        "Layer2_Platforms": "8 منصات (Supply, Logistics, Cloud, University, Commerce, Green, Governance, Industry)",
        "Layer3_Alliances": "Google 18150, 【entity-Meta¦canonical_name=Meta】 18151, Tri 18152, 【entity-Microsoft¦canonical_name=Microsoft】 18153, 【entity-NVIDIA¦canonical_name=NVIDIA】 18154, Global 18155",
        "Layer4_Foundry": "SHK-W-* ترخيص أوزان باسم شيخة",
        "Layer5_External": "Diplomatic Mesh 18120 + Cloud Mgmt 18125 - مواثيق غير مرسلة"
    }
}

Path("governance").mkdir(exist_ok=True)
Path("governance/drafts").mkdir(exist_ok=True, parents=True)

with open("SHEIKHA_V106_FOUNDRY_LICENSES.json","w",encoding="utf-8") as f:
    json.dump(manifest,f,ensure_ascii=False,indent=2)

with open("governance/SHEIKHA_V106_FOUNDRY_MANIFEST.json","w",encoding="utf-8") as f:
    json.dump(manifest,f,ensure_ascii=False,indent=2)

print(f"✓ V106 Foundry built: {len(licenses)} licenses — GRAND still 2677 — saved to SHEIKHA_V106_FOUNDRY_LICENSES.json")
for lic in licenses:
    print(f"  - {lic['license_id']}: {lic['category']} = {lic['weight_assigned']} وزن — SHA {lic['sha_fingerprint']}")
