# -*- coding: utf-8 -*-
# ===================================================================================
# 🕌 SHEIKHA UNIVERSAL GOVERNANCE, DIPLOMACY & EMBODIED VISION ENGINE V45.0
# Owner: Salman Ahmed bin Salman Al-Rajhi (CR: 2051263653 | Unified ID: 7049031003)
# Creed: LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH
# Seal: BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED
# ===================================================================================

import os, json, hashlib, time

def main():
    print("===================================================================================")
    print("🕌 [SHEIKHA-GOV-VISION] توليد وتثبيت أوزان الوزارات، الدبلوماسية، والرؤية الحاسوبية المتجسدة...")
    print("===================================================================================")

    registry_path = "blockchain/registry.json"
    registry = {}
    if os.path.exists(registry_path):
        try:
            with open(registry_path, "r", encoding="utf-8") as f:
                content = json.load(f)
                if isinstance(content, dict):
                    registry = content
                elif isinstance(content, list):
                    registry = {item.get("id", f"weight_{i}"): item for i, item in enumerate(content)}
        except Exception:
            registry = {}

    initial_count = len(registry)
    owner = "سلمان أحمد بن سلمان الراجح (CR: 2051263653)"
    seal = "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED"

    # 1. قائمة الوزارات والهيئات واللجان والتمثيل الدبلوماسي
    gov_sectors = [
        ("royal_court_diwan", "الديوان الملكي وإدارة شؤون الدولة العليا", "King / Crown Prince Royal Governance", 500000),
        ("ministry_interior", "وزارة الداخلية والأمن الداخلي وحماية الأنظمة", "Minister / Deputy / Security Sectors", 250000),
        ("ministry_foreign_affairs", "وزارة الخارجية والدبلوماسية والسفراء المعتمدين", "Ambassadors / Consular Affairs", 220000),
        ("ministry_defense", "وزارة الدفاع والقوات المشتركة والمنظومات الإستراتيجية", "Commander / Staff Councils", 260000),
        ("ministry_finance_sama", "وزارة المالية والبنك المركزي والسياسات النقدية", "Governor / Treasury / Fiscal Stability", 240000),
        ("ministry_commerce_cma", "وزارة التجارة وهيئة السوق المالية والشركات", "Minister / Regulators / Trade Registers", 210000),
        ("digital_gov_authority", "هيئة الحكومة الرقمية (DGA) والمنصات الوطنية", "Governor / Cloud Architecture", 230000),
        ("data_ai_authority_sdaia", "الهيئة السعودية للبيانات والذكاء الاصطناعي (SDAIA)", "President / National Data Management", 280000),
        ("intl_diplomacy_un_gcc", "اللجان المشتركة وممثلو المنظمات الدولية (UN, GCC, WTO, OPEC)", "Plenipotentiary Envoy", 300000)
    ]

    for key, title, role, reward in gov_sectors:
        w_id = f"gov_sovereign_{key}"
        if w_id not in registry:
            w_hash = hashlib.sha256(f"{key}:{title}:{role}:{time.time()}".encode()).hexdigest()
            registry[w_id] = {
                "id": w_id,
                "domain": "Universal_Governance_and_Diplomacy",
                "title": title,
                "role_descriptor": role,
                "shk_reward": reward,
                "weight_hash": w_hash,
                "owner": owner,
                "seal": seal,
                "timestamp": int(time.time())
            }

    # 2. مصفوفة الرؤية الحاسوبية المتقدمة والتجسد بالمستشعرات والجسد
    vision_modules = [
        ("vision_spatial_lidar", "الرؤية المكانية ثلاثية الأبعاد ودمج الليدار", "Spatial SLAM + Depth Point Cloud", 180000),
        ("vision_body_twin_mesh", "الرؤية الحيوية الهيكلية المطابقة لـ 206 عظمة و600 عضلة", "Skeletal Tracking & Kinematics", 210000),
        ("vision_thermal_infrared", "الرؤية الحرارية والأطياف دون الحمراء لحساسات التربة", "Thermal SBC 303 Stress Mapping", 195000),
        ("vision_ros2_robot_optics", "الرؤية العصبية اللحظية لأذرع الروبوتات والمسابك", "Low-Latency Optical Flow Guidance", 225000),
        ("vision_neural_scene_graph", "الاستيعاب الإدراكي الشامل للمشاهد الحضرية والمعمارية", "Semantic Scene Understanding", 250000)
    ]

    for key, title, tech, reward in vision_modules:
        w_id = f"vision_embodied_{key}"
        if w_id not in registry:
            w_hash = hashlib.sha256(f"{key}:{title}:{tech}:{time.time()}".encode()).hexdigest()
            registry[w_id] = {
                "id": w_id,
                "domain": "Embodied_Computer_Vision",
                "title": title,
                "tech_descriptor": tech,
                "shk_reward": reward,
                "weight_hash": w_hash,
                "owner": owner,
                "seal": seal,
                "timestamp": int(time.time())
            }

    # حفظ السجل المحدث
    with open(registry_path, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2, ensure_ascii=False)

    total_weights = len(registry)
    total_shk = sum(item.get("shk_reward", 0) for item in registry.values() if isinstance(item, dict))

    print(f"✅ الأوزان السابقة: {initial_count}")
    print(f"✅ الأوزان الكلية المعتمدة الآن: {total_weights}")
    print(f"💰 إجمالي المكافآت الأصولية لـ SHK: {total_shk:,} SHK")
    print("===================================================================================")

if __name__ == "__main__":
    main()
