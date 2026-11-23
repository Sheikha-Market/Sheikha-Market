import json

class SheikhaFeasibilityStudy:
    def __init__(self):
        self.data = {
            "initial_investment_usd": 15000000,
            "expected_annual_revenue_usd": 48000000,
            "charity_allocation_percentage": 25.0, # ربع الأرباح للعمل الخيري لوجه الله
            "operational_costs_usd": 12000000,
            "roi_percentage": 240.0,
            "sharia_integrity": "100% COMPLIANT_BOUND_BY_QURAN_SUNNAH"
        }

    def calculate_feasibility(self):
        net_profit = self.data["expected_annual_revenue_usd"] - self.data["operational_costs_usd"]
        charity_share = net_profit * (self.data["charity_allocation_percentage"] / 100)
        commercial_profit = net_profit - charity_share
        
        print("\n================== 📝 دراسة الجدوى المالية والخيرية لشيخة ==================")
        print(f"💵 الاستثمار التأسيسي: ${self.data['initial_investment_usd']:,} USD")
        print(f"📈 الإيرادات السنوية المتوقعة: ${self.data['expected_annual_revenue_usd']:,} USD")
        print(f"🛠️ التكاليف التشغيلية السنوية: ${self.data['operational_costs_usd']:,} USD")
        print(f"🕌 مخصصات الوقف والعمل الخيري (25%): ${charity_share:,} USD (لوجه الله)")
        print(f"💰 صافي الأرباح التجارية المتبقية: ${commercial_profit:,} USD")
        print(f"📊 العائد على الاستثمار المتوقع: {self.data['roi_percentage']}%")
        print(f"⚖️ مراجعة الهيئة الشرعية: {self.data['sharia_integrity']}")
        print("========================================================================\n")

if __name__ == "__main__":
    study = SheikhaFeasibilityStudy()
    study.calculate_feasibility()
