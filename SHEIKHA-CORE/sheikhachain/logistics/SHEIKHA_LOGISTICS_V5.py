# -*- coding: utf-8 -*-
import json, hashlib, time
from pathlib import Path

class SheikhaLogisticsV5:
    def __init__(self):
        self.owner = "CR2051263653 - 7049031003"
        self.seal = "BOUND_BY_QURAN_SUNNAH"
        # رحلة الشتاء والصيف - الآية
        self.routes = {
            "Winter_Summer": {"ayah": "رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ", "route": "اليمن - الشام - مكة - HS ALL"},
            "Maritime_Jeddah": {"port": "ميناء جدة الإسلامي - HS ALL - 130M طن", "to": "Suez - Europe - Africa"},
            "Maritime_Dammam": {"port": "ميناء الدمام - Jubail - HS 27-28-84-85 - نفط بتروكيماويات", "to": "Asia - Jebel Ali"},
            "Land_SAR": {"line": "سار SAR - قطار الشمال الجنوب - 2750km - HS 26 معادن", "cargo": "Maaden Phosphate"},
            "Air_Cargo": {"hub": "مطار الملك خالد - GACA - IATA - HS 30-90 - High Value", "to": "Global"},
            "Digital_HS": {"route": "رقمي - HS Code 01-99 - كل منتج - Blockchain Waybill SHK_WAYBILL"}
        }
        self.inc_terms = ["EXW", "FOB", "CIF", "CFR", "DAP", "DDP", "FCA", "CPT"]
        self.laws = ["WCO HS", "WTO", "Incoterms 2020", "IATA DGR", "IMO IMDG", "SBC Logistics", "ZATCA Customs", "SASO SABER", "GAC Competition"]
        self.tech = ["ROS2 AGV AMR", "LiDAR SLAM", "Digital Twin", "IoT Sensors HS 90", "Pearl Metal Packaging HS 71", "Chip Foundry Tracking", "AI Route Optimization"]

    def build_logistics_weights(self):
        reg_path = Path("blockchain/registry.json")
        registry = json.loads(reg_path.read_text(encoding='utf-8'))
        
        logistics_defs = [
            ("LOGISTICS_MARITIME", "وزن الملاحة البحرية - HS 89 سفن - IMO", "Mawani - 10 موانئ - Autonomous Maritime - 15000 TEU - SHK_WAYBILL"),
            ("LOGISTICS_AIR_IATA", "وزن الشحن الجوي - IATA - HS 88 طائرات", "GACA - Saudia Cargo - 15M طن - خطر DGR - تبريد HS 30"),
            ("LOGISTICS_LAND_SAR_TRUCK", "وزن النقل البري والسكك - سار - شاحنات", "SAR 2750km - Truck Fleet ROS2 - TGA - Foundry Jubail to Dammam"),
            ("LOGISTICS_WAREHOUSING", "وزن التخزين والمستودعات - WMS - HS ALL", "مستودع روبوتي - AGV - ASRS - Pearl Metal Storage - 100k SKU"),
            ("LOGISTICS_CUSTOMS_ZATCA", "وزن الجمارك والتخليص - ZATCA - WCO", "HS Code تصنيف - رسوم - SABER SASO - Blockchain Customs - SHK"),
            ("LOGISTICS_TRADE_ROUTE_OPT", "وزن تحسين خطوط التجارة - رحلة الشتاء والصيف", "AI Route - 99 Chapter HS - كل دولة - تكلفة وقت مخاطر - حلال"),
            ("LOGISTICS_PACKAGING_PEARL", "وزن التغليف واللؤلؤ المعدني - HS 48 71", "Pearl Metal Packaging - 15000 MT - تغليف فاخر - حماية - HS ALL"),
            ("LOGISTICS_SENSORS_IOT", "وزن الحساسات والتتبع - IoT - HS 90", "100+ مستشعر - Temp Humidity GPS Shock - Real-time Blockchain"),
            ("LOGISTICS_LAWS_METHODOLOGIES", "وزن القوانين والمنهجيات - بالكتاب والسنة", "WCO WTO IATA IMO Incoterms - فقه البيوع - لا غرر - أمانة التاجر الصدوق"),
            ("LOGISTICS_AUTOMATION_ROBOTIC", "وزن الأتمتة الروبوتية - AGV AMR Drone", "ROS2 - Autonomy - Foundry to Port - بدون سائق - 24/7"),
        ]
        
        for code, title, spec in logistics_defs:
            h = hashlib.sha256(f"{code}:{title}:{spec}:{time.time()}".encode()).hexdigest()
            registry[code.lower()+"_expert"] = {
                "code": code, "title": title, "spec": spec,
                "weight_hash": h, "hash": h, "owner": self.owner, "seal": self.seal,
                "ayah": "رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ", "shk_reward": 40000,
                "hs_chapters": "ALL 99", "timestamp": int(time.time())
            }
            print(f"🔒 [LOGISTICS] {code} -> {h[:12]}...")

        reg_path.write_text(json.dumps(registry, indent=2, ensure_ascii=False), encoding='utf-8')
        print(f"✅ Logistics weights - Total: {len(registry)}")
        return registry

if __name__ == "__main__":
    log = SheikhaLogisticsV5()
    log.build_logistics_weights()
