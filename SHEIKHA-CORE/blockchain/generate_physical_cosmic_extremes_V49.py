# -*- coding: utf-8 -*-
# ===================================================================================
# 🕌 SHEIKHA UNIVERSAL PHYSICAL, BIO-METABOLIC & SCALE EXTREMES ENGINE V49.0
# Owner & IP Holder: Salman Ahmed bin Salman Al-Rajhi (CR: 2051263653 | Unified ID: 7049031003)
# Creed: LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH
# Seal: BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED
# ===================================================================================

import os, json, hashlib, time

def main():
    print("===================================================================================")
    print("🕌 [SHEIKHA-EXTREMES-CORE] توليد وتأصيل أوزان المقاييس الكونية والجسيمات والطاقة...")
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

    # مصفوفة الأوزان المتكاملة ذات التصنيف الدقيق
    new_weights_data = [
        ("SCALE-PLANCK-01", "مقياس طول بلانك والحد الحوسبي النظري الأصغر", "Scale Extremes: 1.616e-35m Space-Time Discrete Fabric", 500000),
        ("SCALE-COSMOS-01", "مقياس الأفق الكوني والكون المنظور", "Scale Extremes: 8.8e26m Cosmic Horizon & Orbital Harmonics", 520000),
        ("PARTICLE-QUARK-UP-DOWN", "جسيمات الكواركات الأولية لبناء أنوية الذرات", "Matter Constituents: Up & Down Quarks Core Nuclei", 480000),
        ("PARTICLE-LEPTON-ELECTRON", "اللبتونات والإلكترونات وديناميكا المدارات الذرية", "Matter Constituents: Lepton Cloud and Quantum Spin", 460000),
        ("PARTICLE-NEUTRINO-GHOST", "النيوترينو فائق الخفة والنفاذية الكونية العالية", "Matter Constituents: Ultra-Low Mass Cosmic Neutrinos", 490000),
        ("PARTICLE-BOSON-PHOTON", "الفوتونات الحاملة للمجال الكهرومغناطيسي والضوء", "Force Carriers: Massless Gauge Bosons & Radiant Light", 470000),
        ("PARTICLE-BOSON-GLUON", "الغلوونات الحاملة للقوة النووية الشديدة وتماسك الأنوية", "Force Carriers: Strong Nuclear Binding Exchange", 480000),
        ("MATTER-SUPERALLOY-PEARL", "معدن شيخة الفائق: سبائك Pearl Metal 15000MT النانوية", "Advanced Metallurgy: Ultra-High Tensile Superalloys", 650000),
        ("MATTER-BIO-METABOLISM", "الكيمياء الحيوية والأيض الخلوي والاتزان الفطري", "Bio-Chemistry: Cellular ATP, Respiration & Homeostasis", 450000),
        ("MATTER-SMART-FOUNDATION", "المواد الخرسانية والأساسات الحية الذكية SBC 303", "Living Civil Engineering: Geotechnical Sensing Integration", 460000),
        ("ENERGY-GAMMA-STELLAR", "أعلى مستويات الطاقة الكونية والانفجارات النجمية", "Energy Cycles: Cosmic Gamma Rays & High Energy Stellar Dynamics", 550000),
        ("ENERGY-SOLAR-TERRESTRIAL", "دورة التمثيل الضوئي وتحول الطاقة الشمسية إلى غذاء", "Energy Cycles: Solar Flux Conversion & Earth Biogeochemical Cycles", 480000),
        ("ENERGY-ZERO-POINT", "طاقة الفراغ الكمي والاتزان السكوني في الطبيعة", "Energy Cycles: Quantum Vacuum Baseline & Thermal Dynamic Rest", 510000),
        ("IP-SOVEREIGN-SALMAN-01", "الملكية الفكرية السيادية لعلوم وأوزان منظومة شيخة", "Intellectual Property: Saudi Commercial Registration 2051263653", 750000),
        ("IP-SHARIA-GOVERNANCE-01", "التأصيل والاعتماد الشرعي لعمارة الأرض ومنع الربا", "Intellectual Property: Bound by Quran and Sunnah Sovereign Charter", 750000)
    ]

    added = 0
    for w_id, title, spec, reward in new_weights_data:
        if w_id not in registry:
            payload = f"{w_id}:{title}:{spec}:{time.time()}"
            w_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()
            registry[w_id] = {
                "id": w_id,
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

    print(f"✨ تم تثبيت وتأصيل أوزان كبرى جديدة: +{added}")
    print(f"📊 إجمالي الأوزان السيادية المعتمدة في السجل: {total_count}")
    print(f"💰 إجمالي المكافآت الأصولية لعملة SHK: {total_shk:,} SHK")
    print("===================================================================================")

if __name__ == "__main__":
    main()
