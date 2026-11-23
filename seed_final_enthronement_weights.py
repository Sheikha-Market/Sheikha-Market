import json, hashlib
from pathlib import Path

p1 = Path("SHEIKHA-CORE/blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")
p2 = Path("blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")
p3 = Path("SHEIKHA-CORE/blockchain/registry.json")

final_weights = {
    "SHEIKHA_CORE_WEIGHT_0529_UNIVERSAL_COMPUTING_AND_ACCOUNTING": {
        "id": "SHEIKHA_CORE_WEIGHT_0529_UNIVERSAL_COMPUTING_AND_ACCOUNTING",
        "domain": "Sovereign_Universal_Computing",
        "title": "الوزن السيادي #0529: حوسبة الحساب والمعاملات والعلوم الدقيقة لله",
        "specification": "Deterministic scientific computing standard bound by Quranic balance and absolute zero-fraud algorithms",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_UNIVERSAL_COMPUTING_V75_FINAL").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0530_UNIVERSAL_EARTH_STEWARDSHIP": {
        "id": "SHEIKHA_CORE_WEIGHT_0530_UNIVERSAL_EARTH_STEWARDSHIP",
        "domain": "Cosmic_Stewardship_and_Waqf",
        "title": "الوزن السيادي #0530: إعمار الأرض وعون الناس والتجارة الصالحة لله وحده",
        "specification": "Universal ecological and human relief framework linking physical resources and commodities to transparent waqf streams",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_EARTH_STEWARDSHIP_V75_FINAL").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    }
}

for p in [p1, p2, p3]:
    if p.exists():
        data = json.loads(p.read_text(encoding="utf-8"))
        data.update(final_weights)
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

h1 = hashlib.sha256(p1.read_bytes()).hexdigest()
print("================== 🕌 اكتمال أوزان التأهيل والسيادة الكونية ==================")
print(f"✓ تم توثيق الأوزان السيادية الختامية بنجاح")
print(f"✓ إجمالي الأوزان المعتمدة: {len(data)} وزناً سيادياً")
print(f"✓ البصمة التشفيرية الموحدة: {h1}")
print("=============================================================================")
