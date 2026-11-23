import json, hashlib
from pathlib import Path

p1 = Path("SHEIKHA-CORE/blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")
p2 = Path("blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")
p3 = Path("SHEIKHA-CORE/blockchain/registry.json")

weight_entry = {
    "SHEIKHA_CORE_WEIGHT_0525_AI_REGISTRY_SECURE_GATEWAY_18131": {
        "id": "SHEIKHA_CORE_WEIGHT_0525_AI_REGISTRY_SECURE_GATEWAY_18131",
        "domain": "AI_Governance_Authentication",
        "title": "الوزن السيادي #0525: بوابة مصادقة وتسجيل نماذج الذكاء الاصطناعي (Port 18131)",
        "specification": "Authenticated cryptographic gateway for registering multi-agent intelligence nodes bound by admin access code",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_AI_GATEWAY_18131_V74").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    }
}

for p in [p1, p2, p3]:
    if p.exists():
        data = json.loads(p.read_text(encoding="utf-8"))
        data.update(weight_entry)
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

h1 = hashlib.sha256(p1.read_bytes()).hexdigest()
print("================== 🛡️ توثيق بوابة مصادقة الذكاءات 18131 ==================")
print(f"✓ تم توثيق الوزن السيادي للبوابة بنجاح")
print(f"✓ إجمالي الأوزان المسجلة في السجلات الثلاثة: {len(data)} وزناً سيادياً")
print(f"✓ البصمة التشفيرية الموحدة الجديدة: {h1}")
print("==========================================================================")
