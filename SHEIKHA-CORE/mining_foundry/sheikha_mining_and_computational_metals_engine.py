# -*- coding: utf-8 -*-
# ===================================================================================
# 🕌 SHEIKHA MINING, PEARL METAL & COMPUTATIONAL EXTRACTION FABRIC V50.0
# Owner & IP Holder: Salman Ahmed bin Salman Al-Rajhi (CR: 2051263653 | Unified ID: 7049031003)
# Creed: LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH
# Seal: BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED
# ===================================================================================

import os, json, hashlib, time

def main():
    print("===================================================================================")
    print("🕌 [SHEIKHA-MINING-CORE] تفعيل تعدين شيخة، معدن شيخة، وحوسبة التعدين السيادية...")
    print("===================================================================================")

    reg_path = "blockchain/registry.json"
    registry = {}
    if os.path.exists(reg_path):
        try:
            with open(reg_path, "r", encoding="utf-8") as f:
                content = json.load(f)
                if isinstance(content, dict):
                    registry = content
                elif isinstance(content, list):
                    registry = {item.get("id", f"weight_{i}"): item for i, item in enumerate(content)}
        except Exception:
            registry = {}

    owner = "سلمان أحمد بن سلمان الراجح (CR: 2051263653)"
    seal = "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED"

    # مصفوفة أوزان التعدين، المعادن الفائقة، وحوسبة الطاقة الكونية
    mining_weights = [
        ("MINING_ARABIAN_SHIELD_ORES", "تعدين خامات الدرع العربي واستخراج المعادن النادرة والحديد", "Physical Ore Extraction & Geo-Survey", 550000),
        ("PEARL_METAL_SUPERALLOY_15K", "معدن شيخة وسبيكة Pearl Metal 15000MT فائقة المتانة والحرارة", "Sub-Micron Advanced Superalloy", 600000),
        ("COMPUTATIONAL_MINING_POGS", "حوسبة التعدين وإثبات السيادة الخوارزمي في SheikhaChain", "Proof of Governed Sovereignty (PoGS) Engine", 650000),
        ("BIO_ENERGY_ATP_METABOLISM", "دورة التمثيل الغذائي وتناغم الطاقة الحيوية في 86B عصبون", "Cellular Bio-Energetic Homeostasis", 520000),
        ("QUANTUM_NANO_METALLURGY", "النانو-ميتالورجي الذكي - أسراب الروبوتات النانوية المعالجة للمعدن", "Self-Healing Molecular Metallurgy", 580000),
        ("SCALE_EXTREME_COSMIC_BOUNDS", "ميزان مقاييس الكون: من طول بلانك الأصغر إلى الأفق المنظور الأكبر", "Planck to Observable Cosmos Continuum", 700000),
        ("NATURAL_FITRAH_EQUILIBRIUM", "الفطرة الطبيعية والميزان الكوني للطاقة والمادة والصحة", "Primordial Creation Environmental Balance", 500000)
    ]

    added = 0
    for key, title, spec, rew in mining_weights:
        w_id = f"SHEIKHA_{key}"
        if w_id not in registry:
            payload = f"{w_id}:{title}:{spec}:{time.time()}"
            w_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()
            registry[w_id] = {
                "id": w_id,
                "domain": "Mining_Metals_and_Computational_Extraction",
                "title": title,
                "specification": spec,
                "commercial_intelligence_licensed": True,
                "ip_owner": owner,
                "shk_reward": rew,
                "weight_hash": w_hash,
                "seal": seal,
                "timestamp": int(time.time())
            }
            added += 1

    with open(reg_path, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2, ensure_ascii=False)

    total_w = len(registry)
    total_shk = sum(x.get("shk_reward", 0) for x in registry.values() if isinstance(x, dict))

    print(f"✨ تم تثبيت وتفعيل أوزان تعدين ومعدن وحوسبة شيخة: +{added}")
    print(f"📊 إجمالي الأوزان السيادية المعتمدة في السجل: {total_w}")
    print(f"💰 إجمالي المكافآت الأصولية لعملة SHK: {total_shk:,} SHK")
    print("===================================================================================")

if __name__ == "__main__":
    main()
