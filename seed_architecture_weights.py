import json
import hashlib
from pathlib import Path

print("================== 🕌 توثيق وحوكمة أوزان المعمارية الشاملة لشيخة ==================")

p1 = Path("SHEIKHA-CORE/blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")
p2 = Path("blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")

arch_weights = {
    "SHEIKHA_CORE_WEIGHT_0531_ARCH_10_LAYERS_FOUNDATION": {
        "id": "SHEIKHA_CORE_WEIGHT_0531_ARCH_10_LAYERS_FOUNDATION",
        "domain": "Enterprise_Architecture_Core",
        "title": "الوزن السيادي #0531: هيكل الطبقات العشر الشامل لمنظومة شيخة التشغيلية",
        "specification": "Comprehensive 10-Layer Sovereign Operating System Blueprint",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_ARCH_10_LAYERS_V67").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0532_ARCH_100_ENGINES_MATRIX": {
        "id": "SHEIKHA_CORE_WEIGHT_0532_ARCH_100_ENGINES_MATRIX",
        "domain": "Engine_Matrix_Governance",
        "title": "الوزن السيادي #0532: مصفوفة وتكامل المحركات المائة والخدمات المتوازية لشيخة",
        "specification": "Inter-engine RPC and event orchestration matrix with sharia gatekeepers",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_ARCH_100_ENGINES_V67").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0533_ARCH_CROSS_DOMAIN_MESH": {
        "id": "SHEIKHA_CORE_WEIGHT_0533_ARCH_CROSS_DOMAIN_MESH",
        "domain": "Cross_Domain_Mesh",
        "title": "الوزن السيادي #0533: شبكة التعلم الآمن وتبادل المعرفة بين النطاقات الاثني عشر",
        "specification": "Strict zero-leakage cross-domain event mesh with immutable cryptographic provenance",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_ARCH_CROSS_DOMAIN_V67").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0534_ARCH_SELF_HEALING_AUTOMATION": {
        "id": "SHEIKHA_CORE_WEIGHT_0534_ARCH_SELF_HEALING_AUTOMATION",
        "domain": "Self_Healing_Automation",
        "title": "الوزن السيادي #0534: محرك التداوي الذاتي والمراقبة الحيوية للأقاليم السحابية",
        "specification": "Closed-loop systemd prober and failover orchestrator for global endpoints",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_ARCH_SELF_HEALING_V67").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0535_ARCH_DIGITAL_BOL_HS_TRACKING": {
        "id": "SHEIKHA_CORE_WEIGHT_0535_ARCH_DIGITAL_BOL_HS_TRACKING",
        "domain": "Customs_Supply_Chain_Architecture",
        "title": "الوزن السيادي #0535: ربط بوالص الشحن الرقمية بالتوائم الكونية ورموز HS الجمركية",
        "specification": "End-to-end provenance architecture from extraction node to customs clearance",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_ARCH_DIGITAL_BOL_V67").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    }
}

for p in [p1, p2]:
    if p.exists():
        data = json.loads(p.read_text(encoding="utf-8"))
        data.update(arch_weights)
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

h1 = hashlib.sha256(p1.read_bytes()).hexdigest()
h2 = hashlib.sha256(p2.read_bytes()).hexdigest()

print(f"✓ تم توثيق أوزان المعمارية والمحركات المائة بنجاح")
print(f"✓ إجمالي الأوزان المسجلة في السجل المركزي: {len(data)} وزناً سيادياً")
print(f"✓ تطابق البصمة SHA-256 بين السجل والمرآة: {h1 == h2} ({h1[:16]}...)")
print("==================================================================================")
