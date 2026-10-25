# -*- coding: utf-8 -*-
# ===================================================================================
# 🕌 SHEIKHACHAIN DUAL-LEDGER PARALLEL SYNCHRONIZER & COMPUTATIONAL MINING V51.0
# Owner & IP Holder: Salman Ahmed bin Salman Al-Rajhi (CR: 2051263653 | Unified ID: 7049031003)
# Creed: LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH
# Seal: BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED
# ===================================================================================

import os, json, hashlib, time, shutil

def main():
    print("===================================================================================")
    print("🕌 [SHEIKHA-CHAIN-SYNC] تفعيل تزامن منظومة شيخة شين وحوسبة التعدين المزدوجة...")
    print("===================================================================================")

    core_reg = "SHEIKHA-CORE/blockchain/registry.json"
    root_reg = "blockchain/registry.json"

    # قراءة السجل الأساسي المعتمد
    target_path = core_reg if os.path.exists(core_reg) else root_reg
    registry = {}
    if os.path.exists(target_path):
        try:
            with open(target_path, "r", encoding="utf-8") as f:
                content = json.load(f)
                if isinstance(content, dict):
                    registry = content
                elif isinstance(content, list):
                    registry = {item.get("id", f"weight_{i}"): item for i, item in enumerate(content)}
        except Exception:
            registry = {}

    owner = "سلمان أحمد بن سلمان الراجح (CR: 2051263653)"
    seal = "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED"

    # حزمة أوزان التعدين الكوني ومعدن شيخة وحوسبة الاستخلاص الفائقة
    parallel_mining_weights = [
        ("MINING_ARABIAN_SHIELD_DEEP", "تعدين خامات الدرع العربي العميقة واستخلاص المعادن النادرة", "Deep Geo-Magnetic Ore Survey", 600000),
        ("PEARL_METAL_NANO_ALLOY", "سبيكة Pearl Metal النانوية الذاتية الالتئام والترميم", "Molecular Structural Metallurgy", 650000),
        ("POGS_COMPUTE_MINING_GRID", "شبكة حوسبة التعدين اللامركزية لإثبات الحوكمة والسيادة", "Distributed Proof of Governed Sovereignty", 700000),
        ("CELLULAR_ATP_ENERGY_HARVEST", "تكامل حصاد الطاقة الحيوية والأيض الغذائي مع كفاءة الحوسبة", "Bio-Caloric & Thermal Energy Coupling", 550000),
        ("COSMIC_EQUILIBRIUM_INTEGRITY", "ميزان الفطرة الكونية الشامل لعمارة الأرض والسماوات وما بينهما", "Cosmic Creation Physical Homeostasis", 750000)
    ]

    added = 0
    for key, title, spec, rew in parallel_mining_weights:
        w_id = f"SHEIKHA_DUAL_MINING_{key}"
        if w_id not in registry:
            payload = f"{w_id}:{title}:{spec}:{time.time()}"
            w_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()
            registry[w_id] = {
                "id": w_id,
                "domain": "Parallel_Blockchain_and_Metals_Mining",
                "title": title,
                "specification": spec,
                "commercial_license": True,
                "shk_reward": rew,
                "weight_hash": w_hash,
                "owner": owner,
                "seal": seal,
                "timestamp": int(time.time())
            }
            added += 1

    # حفظ السجل المحدث في المسارين بالتوازي وبشكل متطابق
    for path in [core_reg, root_reg]:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(registry, f, indent=2, ensure_ascii=False)

    total_w = len(registry)
    total_shk = sum(x.get("shk_reward", 0) for x in registry.values() if isinstance(x, dict))

    print(f"✨ تم تثبيت أوزان التعدين بالتوازي: +{added}")
    print(f"📊 إجمالي الأوزان السيادية المعتمدة: {total_w}")
    print(f"💰 إجمالي المكافآت الأصولية لعملة SHK: {total_shk:,} SHK")
    print(f"🔗 تم مزامنة السجلين: {core_reg} ⟷ {root_reg}")
    print("===================================================================================")

if __name__ == "__main__":
    main()
