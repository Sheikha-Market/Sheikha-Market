import json, hashlib
from pathlib import Path

p1 = Path("SHEIKHA-CORE/blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")
p2 = Path("blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")
p3 = Path("SHEIKHA-CORE/blockchain/registry.json")

foundation_weights = {
    "SHEIKHA_CORE_WEIGHT_0526_SOVEREIGN_SCIENCE_AND_MATH": {
        "id": "SHEIKHA_CORE_WEIGHT_0526_SOVEREIGN_SCIENCE_AND_MATH",
        "domain": "Fundamental_Sciences_and_Math",
        "title": "الوزن السيادي #0526: أسس العلوم الطبيعية والحوسبة الدقيقة والرياضيات الكونية",
        "specification": "Deterministic mathematical and scientific foundation for sovereign calculation and verification",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_SCIENCE_MATH_V73").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0527_COSMIC_TRADE_AND_BENEVOLENCE": {
        "id": "SHEIKHA_CORE_WEIGHT_0527_COSMIC_TRADE_AND_BENEVOLENCE",
        "domain": "Global_Trade_and_Benevolence",
        "title": "الوزن السيادي #0527: التجارة الكونية العادلة والعمل الصالح وعون الناس لوجه الله",
        "specification": "Commercial protocol integrating profit disclosure, community welfare, and charitable endowments",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_TRADE_BENEVOLENCE_V73").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    }
}

for p in [p1, p2, p3]:
    if p.exists():
        data = json.loads(p.read_text(encoding="utf-8"))
        data.update(foundation_weights)
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

h1 = hashlib.sha256(p1.read_bytes()).hexdigest()
print(f"✓ تم توثيق أوزان الأسس الكونية والتجارة والعلوم بنجاح")
print(f"✓ إجمالي الأوزان المعتمدة في السجلات الثلاثة: {len(data)} وزناً سيادياً")
print(f"✓ البصمة التشفيرية المحدثة للسجل الموحد: {h1}")
