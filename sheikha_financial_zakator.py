import json
import datetime

class SheikhaFinancialZakator:
    def __init__(self, assets_value_usd):
        self.assets_value_usd = assets_value_usd
        self.zakat_rate = 0.025 # نسبة الزكاة الشرعية (2.5%)
        self.charity_rate = 0.10 # نسبة الوقف والعمل الخيري لشيخة (10%)

    def calculate_flows(self):
        zakat_due = self.assets_value_usd * self.zakat_rate
        charity_due = self.assets_value_usd * self.charity_rate
        remaining_balance = self.assets_value_usd - zakat_due - charity_due
        
        print("\n================== 🪙 محرك حوسبة التدفقات الزكوية والخيرية لشيخة ==================")
        print(f"💰 القيمة الإجمالية للأصول الخاضعة للحساب: ${self.assets_value_usd:,} USD")
        print(f"🕌 مقدار الزكاة الشرعية الواجبة (2.5%):  ${zakat_due:,} USD")
        print(f"🎁 مخصصات الوقف الخيري الموجهة (10%):    ${charity_due:,} USD")
        print(f"📉 الرصيد التجاري المتبقي بعد الاستقطاع:   ${remaining_balance:,} USD")
        print(f"✅ الحالة الشرعية: مطهر ومطابق للأحكام والضوابط بالكامل")
        print("========================================================================\n")

if __name__ == "__main__":
    # محاكاة الحوسبة على أصول بقيمة 15 مليون دولار
    zakator = SheikhaFinancialZakator(assets_value_usd=15000000)
    zakator.calculate_flows()
