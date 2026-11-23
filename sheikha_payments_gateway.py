import json
import datetime

class SheikhaPaymentsGateway:
    def __init__(self, tx_amount_usd):
        self.tx_amount_usd = tx_amount_usd
        self.transparent_fee_rate = 0.005 # نسبة أجور شفافة وثابتة 0.5% لتغطية التكاليف الإدارية فقط دون ربا
        self.sharia_evidence = "البيع بالتراضي والإفصاح الكامل عن الأجور عملاً بالحديث: «البَيِّعَانِ بِالخِيَارِ مَا لَمْ يَتَفَرَّقَا»"

    def process_payment(self):
        processing_fee = self.tx_amount_usd * self.transparent_fee_rate
        net_seller_receive = self.tx_amount_usd - processing_fee
        
        tx_doc = {
            "transaction_date": datetime.datetime.utcnow().isoformat(),
            "amount_gross_usd": self.tx_amount_usd,
            "transparent_fees_usd": processing_fee,
            "net_seller_receive_usd": net_seller_receive,
            "sharia_evidence": self.sharia_evidence,
            "status": "PAID_AND_SHARIA_VERIFIED",
            "disclosure_cleared": True
        }
        return tx_doc

if __name__ == "__main__":
    # محاكاة لعملية دفع بقيمة 120 ألف دولار لشراء شحنة نحاس معاد تدويره بالدمام
    gateway = SheikhaPaymentsGateway(tx_amount_usd=120000)
    
    print("\n================== 💰 بوابة مدفوعات وقنوات أجور شيخة الشفافة ==================")
    print(json.dumps(gateway.process_payment(), indent=2, ensure_ascii=False))
    print("========================================================================\n")
