import json, hashlib
from pathlib import Path

p1 = Path("SHEIKHA-CORE/blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")
p2 = Path("blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")
p3 = Path("SHEIKHA-CORE/blockchain/registry.json")

enthronement_weights = {
    "SHEIKHA_CORE_WEIGHT_0528_UNIVERSAL_SCIENCE_AND_COMPUTING_FOUNDATION": {
        "id": "SHEIKHA_CORE_WEIGHT_0528_UNIVERSAL_SCIENCE_AND_COMPUTING_FOUNDATION",
        "domain": "Sovereign_Universal_Computing",
        "title": "الوزن السيادي #0528: تأسيس علوم الحوسبة والحساب والرياضيات النزيهة لله",
        "specification": "Foundational computing standard bound by absolute zero-fraud, deterministic truth, and sharia-compliant algorithmic integrity",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_UNIVERSAL_COMPUTING_V75").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0529_HONEST_COMMERCE_AND_COMMUNITY_BENEVOLENCE": {
        "id": "SHEIKHA_CORE_WEIGHT_0529_HONEST_COMMERCE_AND_COMMUNITY_BENEVOLENCE",
        "domain": "Ethical_Trade_and_Human_Relief",
        "title": "الوزن السيادي #0529: التجارة الصادقة، إعمار الأرض، وإعانة الناس وفعل الخيرات لله",
        "specification": "Commercial stewardship protocol ensuring fair distribution, transparent fees (0.5%), and active community relief streams",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_COMMERCE_BENEVOLENCE_V75").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0530_SOVEREIGN_TECHNOLOGY_AND_METALS_STEWARDSHIP": {
        "id": "SHEIKHA_CORE_WEIGHT_0530_SOVEREIGN_TECHNOLOGY_AND_METALS_STEWARDSHIP",
        "domain": "Industrial_Metals_and_Hardware_Sovereignty",
        "title": "الوزن السيادي #0530: سيادة التقنية، الصناعة، المعادن، والأموال لله وحده",
        "specification": "Hardware and resources provenance standard covering extraction, foundries, robotics, and circular salvage bound by sharia seals",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_METALS_TECH_SOVEREIGNTY_V75").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    }
}

for p in [p1, p2, p3]:
    if p.exists():
        data = json.loads(p.read_text(encoding="utf-8"))
        data.update(enthronement_weights)
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

h1 = hashlib.sha256(p1.read_bytes()).hexdigest()
print("================== 🕌 توثيق مصفوفة التأهيل والسيادة الكونية لشيخة ==================")
print(f"✓ تم توثيق أوزان السيادة الكونية والتجارة والعلوم وعمار الأرض بنجاح")
print(f"✓ إجمالي الأوزان المعتمدة والمطابقة: {len(data)} وزناً سيادياً")
print(f"✓ البصمة التشفيرية المحدثة للوح المحفوظ: {h1}")
print("==================================================================================")
