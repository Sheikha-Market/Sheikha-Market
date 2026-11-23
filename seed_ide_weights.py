import json, hashlib
from pathlib import Path

p1 = Path("SHEIKHA-CORE/blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")
p2 = Path("blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")

ide_weights = {
    "SHEIKHA_CORE_WEIGHT_0516_SOVEREIGN_IDE_CORE": {
        "id": "SHEIKHA_CORE_WEIGHT_0516_SOVEREIGN_IDE_CORE",
        "domain": "Developer_Environment_IDE",
        "title": "الوزن السيادي #0516: محرر وبيئة تطوير شيخة السيادية (Sheikha IDE V70)",
        "specification": "Native browser-based secure IDE aligned with VS Code and GitHub Copilot",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_IDE_CORE_V70").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0517_MULTI_AI_HARMONIZER": {
        "id": "SHEIKHA_CORE_WEIGHT_0517_MULTI_AI_HARMONIZER",
        "domain": "Multi_Agent_Federation",
        "title": "الوزن السيادي #0517: منسق الذكاءات المشتركة (Gemini, Meta, Codex, Copilot)",
        "specification": "Harmonization gateway enforcing Sharia and technical truth across disparate LLMs",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_MULTI_AI_V70").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    }
}

for p in [p1, p2]:
    if p.exists():
        data = json.loads(p.read_text(encoding="utf-8"))
        data.update(ide_weights)
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

h1 = hashlib.sha256(p1.read_bytes()).hexdigest()
print(f"✓ تم توثيق أوزان محرر وبيئة تطوير شيخة بنجاح")
print(f"✓ إجمالي الأوزان المسجلة: {len(data)} وزناً سيادياً")
print(f"✓ الهاش التشفيري الجديد: {h1}")
