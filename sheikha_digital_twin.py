import json
import uuid
import datetime

class SheikhaDigitalTwin:
    def __init__(self, product_name, hs_code, source):
        self.product_id = str(uuid.uuid4())
        self.hs_code = hs_code
        self.name = product_name
        self.source = source
        self.timeline = []
        self.add_milestone("ORIGIN_EXTRACTION", f"تم استخراج المورد من {source} وتوثيق الوزن المعرفي")

    def add_milestone(self, phase, description, location="SA-DAMMAM"):
        milestone = {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "phase": phase,
            "description": description,
            "location": location,
            "integrity_sealed": True
        }
        self.timeline.append(milestone)
        print(f"✅ [TOWAM DIGITAL] تم تفعيل مرحلة: {phase} | {description}")

    def export_twin_data(self):
        return json.dumps({
            "product_id": self.product_id,
            "hs_code": self.hs_code,
            "name": self.name,
            "timeline": self.timeline
        }, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    copper_twin = SheikhaDigitalTwin(
        product_name="قضبان النحاس عالية النقاء",
        hs_code="7403.11",
        source="منجم خامات المعادن بالمنطقة الشرقية"
    )
    copper_twin.add_milestone("TRANSPORT_TO_FOUNDRY", "شحن الخامات عبر الأسطول اللوجستي لشيخة", "SA-DAMMAM-PORT")
    copper_twin.add_milestone("FOUNDRY_PROCESSING", "صهر وتكرير النحاس بالفرن الصناعي بالجبيل", "SA-JUBAIL")
    copper_twin.add_milestone("WAREHOUSE_LOGISTICS", "تخزين المنتج النهائي بمستودع شيخة الذكي بالدمام", "SA-DAMMAM-DIST")
    
    print("\n📝 ملف تتبع التوأم الرقمي لشيخة:")
    print(copper_twin.export_twin_data())
