# -*- coding: utf-8 -*-
import json, hashlib, time
from pathlib import Path

reg_path = Path("blockchain/registry.json")
registry = json.loads(reg_path.read_text(encoding='utf-8'))

finance_weights = [
    ("FINANCE_TRIPLE_ENTRY", "وزن المحاسبة الثلاثية - Triple Entry - SHK Chain", "مدين دائن شاهد Blockchain - ZATCA VAT 15% - Qawaem - كل معاملة HS Code"),
    ("FINANCE_HS_99_WEIGHTS", "أوزان لكل HS Code - 99 فصل - كل منتج وزن", "HS 01 حيوانات 02 لحوم ... 27 نفط 72 حديد 84 ماكينات 85 كهرباء 90 أجهزة طبية - كل فصل وزن مستقل - تكامل مع SHK"),
    ("FINANCE_PROGRAMMING_COMPUTING", "وزن البرمجة والحوسبة والحساب - Computing", "أساسيات الحاسب Von Neumann - ALU - Chip 7nm - Python Rust Go - Sheikha Language - Bare Metal Kernel C - Cloud ROS2"),
    ("FINANCE_BODY_TWIN_HUMAN", "وزن الجسد البشري - داخل وخارج - Body Twin Full", "206 عظم 600 عضلة 78 عضو - جلد عين 576MP أذن أنف - قلب 5L/min دماغ 86B - روح وَنَفَخْتُ فِيهِ مِن رُّوحِي - توحيد لله"),
    ("FINANCE_SENSORS_ADVANCED", "وزن الحساسات المتقدمة والرقمية - 100+ Sensors", "LiDAR IMU Temp Gas Pressure Bio - HS 90 - ROS2 - Foundry - Body Twin - Smart Foundations"),
    ("FINANCE_MARKET_SECTORS_ALL", "وزن كل قطاع وكل سوق وكل دولة وكل كون", "12 قطاع HS - كل منتج - كل دولة 193 - كل كون - سماوات 7 أراضين 7 - علم شيخة"),
]

for code, title, spec in finance_weights:
    h = hashlib.sha256(f"{code}:{title}:{time.time()}".encode()).hexdigest()
    registry[code.lower()+"_expert"] = {
        "code": code, "title": title, "spec": spec,
        "weight_hash": h, "hash": h, "owner": "CR2051263653", "seal": "BOUND_BY_QURAN_SUNNAH",
        "shk_reward": 80000, "timestamp": int(time.time())
    }
    print(f"🔒 [FINANCE] {code} -> {h[:12]}...")

reg_path.write_text(json.dumps(registry, indent=2, ensure_ascii=False), encoding='utf-8')
print(f"✅ Finance HS Weights - Total: {len(registry)}")
