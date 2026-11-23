import json, hashlib
from pathlib import Path

p1 = Path("SHEIKHA-CORE/blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")
p2 = Path("blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")
p3 = Path("SHEIKHA-CORE/blockchain/registry.json")

cloud_weights = {
    "SHEIKHA_CORE_WEIGHT_0531_CLOUD_IAAS_PAAS_FOUNDATION": {
        "id": "SHEIKHA_CORE_WEIGHT_0531_CLOUD_IAAS_PAAS_FOUNDATION",
        "domain": "Sovereign_Cloud_Infrastructure",
        "title": "الوزن السيادي #0531: حوكمة البنية التحتية والمنصات كخدمة (IaaS & PaaS)",
        "specification": "Deterministic multi-runtime isolation across bare-metal nodes and local container fabrics",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_IAAS_PAAS_V76").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0532_CLOUD_SAAS_FAAS_MESH": {
        "id": "SHEIKHA_CORE_WEIGHT_0532_CLOUD_SAAS_FAAS_MESH",
        "domain": "Sovereign_Cloud_Software",
        "title": "الوزن السيادي #0532: شبكة البرمجيات والحوسبة الحدثية كخدمة (SaaS & FaaS)",
        "specification": "Multi-region serverless mesh distributing traffic across Saudi, US, Europe, and Asia clusters",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_SAAS_FAAS_V76").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0533_CLOUD_MAAS_AI_FEDERATION": {
        "id": "SHEIKHA_CORE_WEIGHT_0533_CLOUD_MAAS_AI_FEDERATION",
        "domain": "Sovereign_AI_Models",
        "title": "الوزن السيادي #0533: تزويد النماذج الذكية كخدمة (MaaS - Model-as-a-Service)",
        "specification": "Unified multi-AI federation coordinating Gemini, Meta, Codex, and Copilot under cryptographic audit",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_MAAS_FEDERATION_V76").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0534_SHEIKHA_SOVEREIGN_AS_A_SERVICE_S_SAAS": {
        "id": "SHEIKHA_CORE_WEIGHT_0534_SHEIKHA_SOVEREIGN_AS_A_SERVICE_S_SAAS",
        "domain": "S_SaaS_Sovereign_Architecture",
        "title": "الوزن السيادي #0534: نموذج إدارة السحابة السيادي الحصري (Sheikha S-SaaS)",
        "specification": "Unified Sovereign-as-a-Service layer binding cloud compute, trade pipelines, and AI under Quran and Sunnah governance",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_S_SAAS_INNOVATION_V76").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0535_S_SAAS_CHARITABLE_ENDOWMENT_PIPELINE": {
        "id": "SHEIKHA_CORE_WEIGHT_0535_S_SAAS_CHARITABLE_ENDOWMENT_PIPELINE",
        "domain": "Sharia_Cloud_Economics",
        "title": "الوزن السيادي #0535: التدفق الوقفي والزكوي التلقائي في نموذج S-SaaS",
        "specification": "Autonomous execution of 2.5% Zakat and 10% Waqf allocations directly embedded into cloud compute billing pipelines",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_S_SAAS_WAQF_V76").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    }
}

for p in [p1, p2, p3]:
    if p.exists():
        data = json.loads(p.read_text(encoding="utf-8"))
        data.update(cloud_weights)
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

h1 = hashlib.sha256(p1.read_bytes()).hexdigest()
print("================== ☁️ توثيق أوزان إدارة السحابة ونموذج S-SaaS لشيخة ==================")
print(f"✓ تم توثيق الأوزان الخمسة الجديدة بنجاح")
print(f"✓ إجمالي الأوزان المعتمدة في السجلات الثلاثة: {len(data)} وزناً سيادياً")
print(f"✓ البصمة التشفيرية المحدثة للوح المحفوظ: {h1}")
print("==================================================================================")
