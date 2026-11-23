import json
import hashlib
from pathlib import Path

print("================== 🕌 توثيق علوم الحوسبة والـ IDE باسم شيخة ==================")

p1 = Path("SHEIKHA-CORE/blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")
p2 = Path("blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")

cs_weights = {
    f"SHEIKHA_CORE_WEIGHT_0{idx}_CS_SOVEREIGN": {
        "id": f"SHEIKHA_CORE_WEIGHT_0{idx}_CS_SOVEREIGN",
        "domain": "Computer_Science_Sovereignty",
        "title": f"الوزن السيادي #{idx}: منظومة علوم الحوسبة والذكاء السيادية لشيخة",
        "specification": "Comprehensive Computer Science & Agentic AI Taxonomy Specification",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(f"SHEIKHA_CS_WEIGHT_{idx}".encode()).hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    } for idx in range(513, 526)
}

for p in [p1, p2]:
    if p.exists():
        data = json.loads(p.read_text(encoding="utf-8"))
        data.update(cs_weights)
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

h1 = hashlib.sha256(p1.read_bytes()).hexdigest()
h2 = hashlib.sha256(p2.read_bytes()).hexdigest()

print(f"✓ تم توثيق كامل علوم الحوسبة والـ IDE والـ RAG بنجاح")
print(f"✓ إجمالي الأوزان الكلي المسجل: {len(data)} وزناً سيادياً")
print(f"✓ تطابق البصمة SHA-256 بين السجل والمرآة: {h1 == h2} ({h1[:16]}...)")
print("==============================================================================")
