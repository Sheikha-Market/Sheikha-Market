# -*- coding: utf-8 -*-
# ===================================================================================
# 🕌 SHEIKHA UNIVERSAL OMNI-WEIGHTS ENGINE V58.0
# Owner: Salman Ahmed bin Salman Al-Rajhi (CR: 2051263653 | Unified ID: 7049031003)
# Creed: LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH
# Seal: BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED
# ===================================================================================

import os, json, hashlib, time

def main():
    print("===================================================================================")
    print("🕌 [SHEIKHA-OMNI-WEIGHTS] تأصيل أوزان العلوم الشرعية، الكونية، الإنسانية، والتنموية...")
    print("===================================================================================")

    reg_paths = ["blockchain/registry.json", "../blockchain/registry.json"]
    primary_reg = reg_paths[0] if os.path.exists(reg_paths[0]) else reg_paths[1]
    
    registry = {}
    if os.path.exists(primary_reg):
        try:
            with open(primary_reg, "r", encoding="utf-8") as f:
                content = json.load(f)
                if isinstance(content, dict):
                    registry = content.get("weights", content) if "weights" in content and isinstance(content["weights"], dict) else content
                elif isinstance(content, list):
                    registry = {item.get("id", f"weight_{i}"): item for i, item in enumerate(content) if isinstance(item, dict)}
        except Exception:
            registry = {}

    owner = "سلمان أحمد بن سلمان الراجح (CR: 2051263653)"
    seal = "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED"

    # مصفوفة الأوزان السيادية الشاملة وفق طلبات الناظر
    omni_categories = [
        # 1. أوزان القرآن الكريم والسنة النبوية والسيرة والخلفاء الراشدين
        ("SHARIA_QURAN_6236_AYAH", "ميزان آيات القرآن العظيم (114 سورة و6236 آية) ودلالاتها في عمارة الكون", "Divine Quranic Governance Framework", 1000000),
        ("SHARIA_SUNNAH_RASUL_LIFE", "سيرة النبي محمد ﷺ وسنته الشريفة وأخلاقه وأمانته وأدب المعاملات", "Comprehensive Sunnah & Prophetic Biography", 950000),
        ("SHARIA_KHULAFAA_RASHIDOON", "سنة الخلفاء الراشدين المهديين (أبو بكر، عمر، عثمان، علي) ونماذج الحوكمة والقضاء", "Rightly Guided Caliphs Governance Models", 900000),
        ("DAWAH_GLOBAL_ISLAM_CALL", "التعريف بالدين الإسلامي الحنيف ونشره بالرحمة والحكمة والموعظة الحسنة لكافة الأمم", "Universal Islamic Dawah & Dialogue", 850000),

        # 2. أوزان الملفات والفيديوهات والتصاميم المعمارية المرفقة
        ("MEDIA_COSMIC_BLUEPRINT_WATER", "النموذج الهندسي الكوني: وجعلنا من الماء كل شيء حي والتوازن الطبيعي والتربة والزراعة", "Water-Soil-Canopy Cosmic Integration (FAO-56)", 880000),
        ("MEDIA_CAMPUS_DESIGN_CENTER", "مركز التصميم والتقنية والمعرفة: صرح العمارة الساحلية المستدامة والطاقة النظيفة", "Modern Coastal Knowledge & Design Campus", 850000),
        ("MEDIA_KINGDOM_MAP_2030", "مملكة شيخة العربية السعودية: الاتجاهات الخمسة والوزارات الـ 19 والهيئات والرؤية الممتدة", "Majestic Kingdom Holistic Architecture & Ministries", 920000),
        ("MEDIA_SOVEREIGN_INCUBATOR_V35", "غرفة العمليات والجامعة والحاضنة التقنية الفائقة V35.2 والتوأم الرقمي", "Incubator, University & Global Situational Center", 870000),
        ("MEDIA_SOOQ_SHEIKHA_METALS", "سوق شيخة للمعادن وخامات الدرع العربي وسبائك Pearl Metal وسلاسل الإمداد الدولية", "Global Metal Supply Chain & Industrial Trading", 890000),

        # 3. أوزان الإدارة والمبيعات والاستراتيجيات والهيكلة والبناء
        ("MGMT_STRATEGY_GLOBAL_SALES", "استراتيجيات الإدارة الحديثة، المبيعات الذكية، ونظم التوسع والنمو المؤسسي", "Advanced Sovereign Management & Sales Architecture", 780000),
        ("STRUCT_CIVIL_SBC303_BUILD", "الهندسة الإنشائية والتشييد وتكامل مجسات الأساسات الخرسانية SBC 303 والمدن الذكية", "Civil Engineering & Structural Foundation Sensors", 820000),
        ("AGRI_EARTH_REVIVAL_FARMING", "الزراعة المستدامة، استصلاح الأراضي الجافة، وإعادة الجزيرة مروجاً وأنهاراً", "Regenerative Arid Agriculture & Afforestation", 800000),

        # 4. أوزان رفع الدول والبنية الرقمية ورؤية السعودية 2030+ والوطنية
        ("VISION_SAUDI_2030_PLUS", "مستهدفات رؤية المملكة العربية السعودية 2030+، البرامج الوطنية، والسيادة الصناعية والتقنية", "Saudi Vision 2030+ Strategic Realization Engine", 950000),
        ("NATION_LOVE_LOYALTY_MATRIX", "قيم حب الوطن، المواطنة الإيجابية، الولاء، وتنمية مقدرات الأوطان والشعوب", "Patriotism, Sovereignty & National Heritage Preservation", 820000),
        ("DIALECTS_SAUDI_AND_GLOBAL", "التعريف بربوع المملكة بكل اللهجات (النجدية، الحجازية، الشرقية، الجنوبية، الشمالية) وبكل لسان عالمي", "Multilingual & Multi-Dialect Cultural Diplomacy", 840000),
        ("DIGITAL_NATION_ELEVATION", "رفع البنية التحتية الرقمية للدول النامية وتوطين تقنيات الحوسبة والسحابة", "Global Sovereign Digital Infrastructure Framework", 880000),

        # 5. أوزان الإنسانية ومكارم الأخلاق ورعاية الإنسان من الولادة
        ("HUMANITY_GOOD_MORALS_CARE", "الأخلاق الحسنة، حفظ الكرامة الإنسانية، التكافل، والعمل الخيري والإغاثات الدولية", "Global Humanitarian Relief & Ethical Excellence", 860000),
        ("PRE_NATAL_PARENTAL_GUIDE", "الرعاية التربوية والصحية للوالدين والتحضير للإنجاب ورعاية الجنين في بطن الأم", "Pre-Natal Preparation & Parental Holistic Care", 750000),
        ("INFANT_CHILD_ROBOT_MENTOR", "روبوتات الرعاية المبكرة للطفل بالقيم الأخلاقية، والتعليم التفاعلي، ورسالة الإيمان", "Early Childhood Ethical & Robotic Development", 780000),
        ("LIFECYCLE_TWIN_EDUCATION_WORK", "التوأم الرقمي للإنسان: المدرسة، الجامعة، التوظيف، والتجارة وإتقان العمل", "Human Lifecycle Digital Twin: School to Enterprise", 830000),
        ("THERAPEUTIC_MEDICAL_ROBOTS", "الروبوتات العلاجية والطبية وإتقان الرعاية الصحية والوقاية العصبية والجسدية", "Therapeutic & Advanced Medical Robotics Engine", 870000)
    ]

    added = 0
    for key, title, spec, rew in omni_categories:
        w_id = f"SHEIKHA_OMNI_{key}"
        if w_id not in registry:
            payload = f"{w_id}:{title}:{spec}:{time.time()}"
            w_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()
            registry[w_id] = {
                "id": w_id,
                "domain": "Sovereign_Omni_Civilization_and_Cosmic_Creation",
                "title": title,
                "specification": spec,
                "shk_reward": rew,
                "weight_hash": w_hash,
                "owner": owner,
                "seal": seal,
                "timestamp": int(time.time())
            }
            added += 1

    for p in reg_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            json.dump(registry, f, indent=2, ensure_ascii=False)

    clean_w = [x for x in registry.values() if isinstance(x, dict)]
    total_w = len(clean_w)
    total_shk = sum(x.get("shk_reward", 0) for x in clean_w)

    print(f"✨ تم تثبيت وتأصيل أوزان شيخة الكونية الشاملة: +{added}")
    print(f"📊 إجمالي الأوزان السيادية المعتمدة في السجل: {total_w}")
    print(f"💰 إجمالي المكافآت الأصولية لعملة SHK: {total_shk:,} SHK")
    print("===================================================================================")

if __name__ == "__main__":
    main()
