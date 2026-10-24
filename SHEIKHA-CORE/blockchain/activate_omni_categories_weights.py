# -*- coding: utf-8 -*-
# ===================================================================================
# 🕌 SHEIKHA OMNI-CATEGORIES, NANO-QUANTUM & CIVILIZATION WEIGHTS ENGINE
# Owner: Salman Ahmed bin Salman Al-Rajhi (CR: 2051263653 | Unified ID: 7049031003)
# Creed: LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH
# Seal: BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED
# ===================================================================================

import os, json, hashlib, time

def main():
    print("===================================================================================")
    print("🕌 [SHEIKHA-WEIGHTS] تفعيل أوزان الفئات المتكاملة، النانو-روبوتك، وإعمار الأرض...")
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

    # مصفوفة فئات الإعمار الكوني الشامل
    comprehensive_categories = [
        # 1. فئة المقياس الفيزيائي والنانوي
        ("category_quantum_planck", "فئة مقياس بلانك والحوسبة الكمية النقطية", "Planck Length & Zero-Entropy Information", 500000),
        ("category_quantum_particles", "فئة الجسيمات الأولية (كواركات، إلكترونات، نيوترينو، فوتونات، غلوونات)", "Standard Model Gauge & Matter Matrix", 480000),
        ("category_nano_robotics", "فئة أسراب النانو روبوتك الذاتية لمعالجة السبائك والأساسات", "Every Nano = Smart Autonomous Robot", 520000),

        # 2. فئة عمارة الأرض والمواد الفائقة
        ("category_pearl_foundry", "فئة مسابك سبائك Pearl Metal 15000MT والتصنيع الذاتي", "Advanced Metallurgy & Nano-Coatings", 460000),
        ("category_smart_foundations", "فئة الأساسات الإنشائية الحية ومجسات SBC 303 (ESP32/HX711/MPU6050)", "Substructure Living Geotechnical AI", 450000),
        ("category_body_twin_mesh", "فئة الجسد التوأمي (206 عظمة / 600 عضلة / 86B عصبون)", "Full Biometric Structural Equilibrium", 470000),

        # 3. فئة إدارة الدول والدبلوماسية والحوكمة
        ("category_royal_diwan", "فئة إدارة شؤون الدولة والديوان الملكي والقرارات العليا", "Sovereign Executive Decision Cortex", 600000),
        ("category_ministries_joint", "فئة الوزارات والهيئات واللجان التكاملية المشتركة (DGA/SDAIA/SAMA)", "Integrated Inter-Ministerial Governance", 550000),
        ("category_diplomacy_nations", "فئة السفراء المعتمدين والمجالس الدولية (UN/GCC/WTO/OPEC)", "Universal Sovereign Diplomatic Mesh", 540000),

        # 4. فئة الملاحة والرحلات وسلاسل الإمداد
        ("category_quraysh_trade", "فئة رحلتي الشتاء والصيف الملاحية والقوافل الذكية", "Winter & Summer Strategic Trade Corridors", 490000),
        ("category_hs_customs_global", "فئة مصفوفة التصنيف الجمركي العالمي وسلاسل التوريد (HS 01-99)", "Automated Tariffs & Incoterms Engine", 440000),
        ("category_islamic_fintech", "فئة القيد المحاسبي الثلاثي وإلغاء الربا وعملة SHK الأصولية", "Triple-Entry Blockchain Halal Ledger", 580000)
    ]

    added = 0
    for key, title, spec, reward in comprehensive_categories:
        w_id = f"omni_{key}"
        if w_id not in registry:
            payload = f"{w_id}:{title}:{spec}:{time.time()}"
            w_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()
            registry[w_id] = {
                "id": w_id,
                "category_domain": "Universal_Civilization_and_Earth_Revival",
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

    print(f"✨ تم تفعيل وتثبيت فئات الأوزان الكلية الجديدة: +{added}")
    print(f"📊 إجمالي الأوزان السيادية المعتمدة في السجل: {total_count}")
    print(f"💰 إجمالي المكافآت الأصولية لعملة SHK: {total_shk:,} SHK")
    print("===================================================================================")

if __name__ == "__main__":
    main()
