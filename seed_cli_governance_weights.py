import json
import hashlib
from pathlib import Path

print("================== 🕌 توثيق وحوكمة أوزان Sheikha CLI السيادية ==================")

p1 = Path("SHEIKHA-CORE/blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")
p2 = Path("blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")

cli_weights = {
    "SHEIKHA_CORE_WEIGHT_0526_CLI_SOVEREIGN_ROOT": {
        "id": "SHEIKHA_CORE_WEIGHT_0526_CLI_SOVEREIGN_ROOT",
        "domain": "CLI_Root_Engine",
        "title": "الوزن السيادي #0526: النواة التنفيذية لأداة الطرفية السيادية (Sheikha CLI Core)",
        "specification": "Root execution multiplexer with multi-region telemetry and environment parity",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_CLI_ROOT_V65").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0527_CLI_PORTS_SENTINEL": {
        "id": "SHEIKHA_CORE_WEIGHT_0527_CLI_PORTS_SENTINEL",
        "domain": "Network_Port_Governor",
        "title": "الوزن السيادي #0527: راصد وموجّه المنافذ المحلية والكبسولات الموزعة (sheikha ports)",
        "specification": "Deterministic port allocation across 18082, 18093, 18094, 9091 and 18110",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_CLI_PORTS_V65").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0528_CLI_ANALYZE_DRIFT": {
        "id": "SHEIKHA_CORE_WEIGHT_0528_CLI_ANALYZE_DRIFT",
        "domain": "Registry_Consistency_Analyzer",
        "title": "الوزن السيادي #0528: كاشف ومطابق الانحراف في سجل اللوح المحفوظ المركزي (sheikha analyze)",
        "specification": "Cryptographic SHA-256 comparator across central registry and subsidiary mirrors",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_CLI_ANALYZE_V65").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0529_CLI_SHARIA_CLASSIFIER": {
        "id": "SHEIKHA_CORE_WEIGHT_0529_CLI_SHARIA_CLASSIFIER",
        "domain": "Sharia_Financial_Governance",
        "title": "الوزن السيادي #0529: مصنف وسائل الدفع والتحقق الشرعي من العقود (sheikha classify)",
        "specification": "Automated zero-riba filter and transparent margin checker for 25 payment rails",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_CLI_CLASSIFY_V65").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0530_CLI_SELF_GOVERNANCE": {
        "id": "SHEIKHA_CORE_WEIGHT_0530_CLI_SELF_GOVERNANCE",
        "domain": "Sovereign_Self_Governance",
        "title": "الوزن السيادي #0530: محرك الرقابة الذاتية ومكافحة الغرر (sheikha self-govern)",
        "specification": "Autonomous guardrail enforcing production hold until verifiable financial backing",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_CLI_SELF_GOVERN_V65").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    }
}

for p in [p1, p2]:
    if p.exists():
        data = json.loads(p.read_text(encoding="utf-8"))
        data.update(cli_weights)
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

h1 = hashlib.sha256(p1.read_bytes()).hexdigest()
h2 = hashlib.sha256(p2.read_bytes()).hexdigest()

print(f"✓ تم توثيق أوزان أداة الطرفية والحوكمة السيادية بنجاح")
print(f"✓ إجمالي الأوزان المسجلة في السجل المركزي: {len(data)} وزناً سيادياً")
print(f"✓ تطابق البصمة SHA-256 بين السجل والمرآة: {h1 == h2} ({h1[:16]}...)")
print("==============================================================================")
