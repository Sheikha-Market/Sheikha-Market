import json
import uuid
import datetime

class SheikhaBillOfLading:
    def __init__(self, exporter, importer, hs_code, commodity, weight_kg):
        self.bol_number = f"SHK-BOL-{str(uuid.uuid4())[:8].upper()}"
        self.exporter = exporter
        self.importer = importer
        self.hs_code = hs_code
        self.commodity = commodity
        self.weight_kg = weight_kg
        self.timestamp = datetime.datetime.utcnow().isoformat()
        
    def generate_document(self):
        doc = {
            "bol_number": self.bol_number,
            "timestamp": self.timestamp,
            "parties": {
                "exporter": self.exporter,
                "importer": self.importer
            },
            "cargo_details": {
                "hs_code": self.hs_code,
                "commodity": self.commodity,
                "weight_kg": self.weight_kg
            },
            "status": "CUSTOMS_CLEARED_BY_SHEIKHA_AI",
            "compliance_seal": "APPROVED_BY_SHARIA_AND_INTERNATIONAL_LAW"
        }
        return doc

if __name__ == "__main__":
    # محاكاة شحنة قضبان النحاس من الدمام إلى الأسواق الدولية
    bol = SheikhaBillOfLading(
        exporter="مجمع الجبيل الصناعي للمعادن (السعودية)",
        importer="شركة المقاولات التقنية المحدودة (دولي)",
        hs_code="7403.11",
        commodity="قضبان النحاس النقي عالي التوصيل",
        weight_kg=25000
    )
    
    print("\n================== 🚢 بوليصة الشحن الرقمية الذكية لشيخة ==================")
    print(json.dumps(bol.generate_document(), indent=2, ensure_ascii=False))
    print("========================================================================\n")
