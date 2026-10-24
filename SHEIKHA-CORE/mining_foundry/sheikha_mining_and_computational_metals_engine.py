# -*- coding: utf-8 -*-
# ===================================================================================
# 🕌 SHEIKHA METAL MINING, PEARL SUPERALLOYS & COMPUTATIONAL MINING FABRIC V1.0
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

    # أوزان تعدين شيخة ومعدن شيخة وحوسبة التعدين المعتمدة
    mining_metal_weights = [
        ("W_MINE_RAW_ORES_ARABIAN_SHIELD", "تعدين واستكشاف خامات الذهب والنحاس والتيتانيوم في الدرع العربي", "HS Code 2601-2621 Direct Geochemical Telemetry", 650000),
        ("W_MINE_PEARL_METAL_SUPERALLOY", "معدن شيخة الفائق: سبيكة Pearl Metal 15000MT النانوية المتماسكة", "High-Entropy Nanostructured Superalloy Specification", 700000),
        ("W_MINE_COMPUTATIONAL_PROOF", "حوسبة التعدين السيادي: إثبات الاستخراج العيني PoGS وإلغاء الربا", "Energy-Efficient Triple-Entry Ledger Computational Mining", 680000),
        ("W_MINE_SMART_FOUNDATION_GEO", "تكامل تعدين المعادن مع تسليح الأساسات الذكية SBC 303 ومجسات ESP32", "Structural Steel & Load Cell HX711 Nanoscale Integration", 620000),
        ("W_MINE_AUTOMATED_ROS2_FOUNDRY", "أسراب روبوتات الصب والتشكيل الحراري المتقدم للسبائك عبر ROS2", "Automated Giga-Foundry Molten Metal Swarm Robotics", 640000)
    ]

    added = 0
    for w_id, title, spec, reward in mining_metal_weights:
        if w_id not in registry:
            payload = f"{w_id}:{title}:{spec}:{time.time()}"
            w_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()
            registry[w_id] = {
                "id": w_id,
                "category_domain": "Mining_Metallurgy_and_Computational_Extraction",
                "title": title,
                "specification": spec,
                "commercial_sale_license": True,
                "shk_reward": reward,
                "weight_hash": w_hash,
                "owner": owner,
                "seal": seal,
                "timestamp": int(time.time())
            }
            added += 1

    with open(reg_path, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2, ensure_ascii=False)

    total_count = len(registry)
    total_shk = sum(item.get("shk_reward", 0) for item in registry.values() if isinstance(item, dict))

    print(f"✨ تم تثبيت وتفعيل أوزان تعدين ومعدن وحوسبة شيخة: +{added}")
    print(f"📊 إجمالي الأوزان السيادية المعتمدة في السجل: {total_count}")
    print(f"💰 إجمالي المكافآت الأصولية لعملة SHK: {total_shk:,} SHK")
    print("===================================================================================")

if __name__ == "__main__":
    main()
