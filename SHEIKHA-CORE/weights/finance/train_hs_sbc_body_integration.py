# -*- coding: utf-8 -*-
# كل SHK مربوط بـ HS Code + SBC 303 + Body Twin
import json, hashlib, time
from pathlib import Path

reg_path = Path("blockchain/registry.json")
registry = json.loads(reg_path.read_text(encoding='utf-8'))

# خريطة HS Code -> منتج حقيقي
hs_products = {
    "72": "حديد تسليح - 1 طن = 1000 SHK",
    "73": "منتجات حديد - مسمار جسر",
    "68": "بلاط سيراميك - 1 م2 = 50 SHK",
    "25": "اسمنت - 1 كيس = 20 SHK",
    "32": "دهان - 1 جالون = 30 SHK",
    "84": "ماكينة - روبوت ROS2",
    "85": "شريحة - Chip 7nm",
    "71": "لؤلؤ معدني - 1 كغ = 5000 SHK",
    "90": "مستشعر - Body Twin",
    "27": "نفط - برميل = 80 SHK"
}

sbc_items = {
    "1": "خرسانة", "2": "حديد", "3": "بلاط", "4": "دهان", "5": "عزل",
    "6": "سباكة", "7": "كهرباء", "8": "تكييف", "9": "أبواب", "10": "نوافذ",
    "11": "مصاعد", "12": "سلامة", "13": "تشطيب", "14": "لاندسكيب"
}

body_effort = {
    "skeleton": "206 عظمة - هيكل",
    "muscles": "600 عضلة - حركة",
    "brain": "86B خلية - تفكير",
    "heart": "100k نبضة/يوم - ضخ",
    "hands": "27 عظمة/يد - إتقان",
    "eyes": "576MP - رؤية HS Code"
}

total_shk = 0
for code, entry in registry.items():
    shk = entry.get("shk_reward", 10000)
    total_shk += shk
    
    # ربط كل SHK
    hs_chapter = list(hs_products.keys())[hash(code) % len(hs_products)]
    sbc_item = list(sbc_items.keys())[hash(code) % len(sbc_items)]
    body_part = list(body_effort.keys())[hash(code) % len(body_effort)]
    
    entry["integration"] = {
        "HS_Code": f"Chapter {hs_chapter} - {hs_products[hs_chapter]} - منتج حقيقي ملموس",
        "SBC_303": f"بند {sbc_item} - {sbc_items[sbc_item]} - بناء حقيقي SBC 303 - إعمار الأرض",
        "Body_Twin": f"{body_part} - {body_effort[body_part]} - جهد بشري داخل وخارج - عرق جبين - وقل اعملوا",
        "SHK_value": f"{shk} SHK = {hs_products[hs_chapter]} + {sbc_items[sbc_item]} + {body_effort[body_part]}",
        "proof": f"SHK {shk} مربوط بـ 3: منتج HS + بناء SBC + جهد جسد - توحيد لله - BOUND_BY_QURAN_SUNNAH"
    }

reg_path.write_text(json.dumps(registry, indent=2, ensure_ascii=False), encoding='utf-8')
print(f"✅ INTEGRATION - كل SHK مربوط بـ HS + SBC + Body Twin")
print(f"✅ Total: {len(registry)} weights - Total SHK Rewards: {total_shk:,} SHK")
print(f"✅ Example: 1000 SHK = 1 طن حديد HS 72 + بند خرسانة SBC 303 + 206 عظمة هيكل + 600 عضلة")
