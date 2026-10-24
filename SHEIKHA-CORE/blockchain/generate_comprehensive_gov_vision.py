# -*- coding: utf-8 -*-
# ===================================================================================
# 🕌 SHEIKHA UNIVERSAL GOV, DIPLOMACY, COMPUTER VISION & EMBODIED AI V46.0
# Owner: Salman Ahmed bin Salman Al-Rajhi (CR: 2051263653 | Unified ID: 7049031003)
# Creed: LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH
# Seal: BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED
# ===================================================================================

import os, json, hashlib, time

def main():
    print("===================================================================================")
    print("🕌 [SHEIKHA-EXPANSION] توليد وتثبيت أوزان إدارة الدول، الدبلوماسية، والرؤية المتجسدة...")
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

    # مصفوفة الوزارات والهيئات السعودية والدولية وممثلي اللجان
    ministries_data = [
        ("royal_court", "الديوان الملكي ورئاسة الدولة", ["الملك_رئيس_الدولة", "ولي_العهد_رئيس_الوزراء", "رئيس_الديوان"], 500000),
        ("interior", "وزارة الداخلية والقطاعات الأمنية", ["وزير_الداخلية", "وكيل_الوزارة", "مدير_الأمن_العام"], 250000),
        ("foreign_affairs", "وزارة الخارجية والسلك الدبلوماسي", ["وزير_الخارجية", "وكيل_العلاقات_الثنائية", "سفير_فوق_العادة"], 260000),
        ("defense", "وزارة الدفاع والمنظومات الإستراتيجية", ["وزير_الدفاع", "رئيس_هيئة_الأركان", "قائد_العمليات"], 270000),
        ("finance_central_bank", "وزارة المالية والبنك المركزي (SAMA)", ["وزير_المالية", "محافظ_البنك_المركزي", "وكيل_الخزينة"], 280000),
        ("commerce_investment", "وزارة التجارة والاستثمار والهيئات التابعة", ["وزير_التجارة", "محافظ_هيئة_المنشآت", "وكيل_الشركات"], 240000),
        ("digital_gov_sdaia", "هيئة الحكومة الرقمية (DGA) وسدايا (SDAIA)", ["محافظ_الحكومة_الرقمية", "رئيس_سدايا", "مدير_الذكاء_الوطني"], 300000),
        ("energy_industry", "وزارة الطاقة والصناعة والمحتوى المحلي", ["وزير_الطاقة", "وكيل_التعدين", "رئيس_هيئة_المحتوى"], 250000),
        ("municipalities_housing", "وزارة البلديات والإسكان وكود البناء SBC", ["وزير_البلديات", "أمين_المنطقة", "رئيس_كود_البناء_SBC"], 230000),
        ("transport_logistics", "وزارة النقل والخدمات اللوجستية والموانئ", ["وزير_النقل", "رئيس_هيئة_الموانئ", "وكيل_سلاسل_الإمداد"], 240000)
    ]

    added_gov = 0
    for entity_key, entity_title, roles, base_shk in ministries_data:
        for role in roles:
            w_id = f"gov_{entity_key}_{role}"
            if w_id not in registry:
                payload = f"{w_id}:{entity_title}:{role}:{time.time()}"
                w_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()
                registry[w_id] = {
                    "id": w_id,
                    "domain": "Universal_State_Governance",
                    "entity": entity_title,
                    "role_title": role,
                    "commercial_intelligence_provision": True,
                    "shk_reward": base_shk,
                    "weight_hash": w_hash,
                    "owner": owner,
                    "seal": seal,
                    "timestamp": int(time.time())
                }
                added_gov += 1

    # مصفوفة التمثيل الدولي والدبلوماسي والهيئات العالمية
    international_corps = [
        ("un_general_assembly", "الأمم المتحدة والمنظمات الدولية", "المندوب_الدائم_واللجان_الدولية", 320000),
        ("gcc_general_secretariat", "الأمانة العامة لمجلس التعاون الخليجي", "الأمين_العام_والتكامل_الإقليمي", 300000),
        ("opec_energy_council", "منظمة الدول المصدرة للنفط (OPEC)", "ممثل_شؤون_الطاقة_والإنتاج", 280000),
        ("wto_international_trade", "منظمة التجارة العالمية (WTO)", "سفير_التجارة_الدولية_وحماية_الأسواق", 270000),
        ("global_diplomacy_ambassadors", "السفارات المتبادلة والبعثات الدبلوماسية عبر القارات", "سفير_المملكة_لكل_دولة", 290000)
    ]

    added_diplomatic = 0
    for corp_key, corp_title, envoy_role, shk_val in international_corps:
        w_id = f"diplomatic_{corp_key}"
        if w_id not in registry:
            payload = f"{w_id}:{corp_title}:{envoy_role}:{time.time()}"
            w_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()
            registry[w_id] = {
                "id": w_id,
                "domain": "International_Diplomacy_and_Global_Councils",
                "organization": corp_title,
                "envoy_designation": envoy_role,
                "bilateral_trade_readiness": True,
                "shk_reward": shk_val,
                "weight_hash": w_hash,
                "owner": owner,
                "seal": seal,
                "timestamp": int(time.time())
            }
            added_diplomatic += 1

    # مصفوفة الرؤية الحاسوبية المتقدمة المتجسدة بالعتاد والمستشعرات
    vision_embodied_systems = [
        ("vision_multispectral_thermal", "الرؤية الحاسوبية متعددة الأطياف والحرارية لحساسات الأساسات", "SBC 303 Sub-surface Thermal Stress", 220000),
        ("vision_spatial_lidar_slam", "الملاحة المكانية للروبوتات وتوليد السحب النقطية ثلاثية الأبعاد", "Autonomous ROS2 Fleet SLAM", 250000),
        ("vision_biometric_body_mesh", "الرؤية الحيوية الهيكلية المطابقة للجسد التوأمي (206 عظمة / 600 عضلة)", "Human Digital Twin Kinematics", 240000),
        ("vision_foundry_optics_7nm", "البصريات العصبية المجهرية لمسابك تصنيع سبائك Pearl Metal 15000MT", "Micro-defect Laser Metrology", 260000),
        ("vision_sovereign_drone_corridor", "الاستطلاع البصري الذاتي لخطوط الملاحة والشحن الجوي والبحري", "Global Air/Maritime Navigation Sight", 230000)
    ]

    added_vision = 0
    for v_key, v_title, v_tech, v_shk in vision_embodied_systems:
        w_id = f"vision_core_{v_key}"
        if w_id not in registry:
            payload = f"{w_id}:{v_title}:{v_tech}:{time.time()}"
            w_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()
            registry[w_id] = {
                "id": w_id,
                "domain": "Embodied_Computer_Vision_and_Sensory",
                "system_name": v_title,
                "tech_implementation": v_tech,
                "hardware_coupling": ["ESP32", "HX711", "MPU6050", "ROS2_Cameras"],
                "shk_reward": v_shk,
                "weight_hash": w_hash,
                "owner": owner,
                "seal": seal,
                "timestamp": int(time.time())
            }
            added_vision += 1

    # حفظ السجل الكلي المحدث
    with open(reg_path, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2, ensure_ascii=False)

    total_count = len(registry)
    total_shk_sum = sum(x.get("shk_reward", 0) for x in registry.values() if isinstance(x, dict))

    print(f"🏛️ تم توليد وتسجيل أوزان الوزارات والوظائف الحكومية: +{added_gov}")
    print(f"🌍 تم توليد وتسجيل أوزان الدبلوماسية والسفراء والدول: +{added_diplomatic}")
    print(f"👁️ تم توليد وتسجيل أوزان الرؤية الحاسوبية المتجسدة: +{added_vision}")
    print(f"📊 إجمالي الأوزان السيادية المعتمدة في السجل: {total_count}")
    print(f"💰 إجمالي المكافآت الأصولية لعملة SHK: {total_shk_sum:,} SHK")
    print("===================================================================================")

if __name__ == "__main__":
    main()
