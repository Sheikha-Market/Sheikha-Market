# -*- coding: utf-8 -*-
import hashlib, json, time
from pathlib import Path

class SHKTokenV5:
    def __init__(self):
        self.name = "Sheikha Coin"
        self.symbol = "SHK"
        self.decimals = 18
        self.total_supply = 1_000_000_000  # 1 مليار
        self.owner = "CR2051263653 - سلمان أحمد بن سلمان الراجحي"
        self.seal = "BOUND_BY_QURAN_SUNNAH"
        
        # توزيع حلال 100% - لا ربا
        self.distribution = {
            "Waqf_Lillah_وقف_لله": {"percent": 30, "amount": 300_000_000, "purpose": "وقف - صدقة جارية - إعمار الأرض - لا يباع"},
            "Foundry_Giga_الفاوندري": {"percent": 20, "amount": 200_000_000, "purpose": "Giga Foundry Pearl Metal Chip Robotics - صناعة"},
            "Incubator_حاضنة": {"percent": 15, "amount": 150_000_000, "purpose": "Qard Hasan 250k لكل رائد أعمال - Sukuk 1M - تمويل حلال"},
            "Weights_Ownership_ملكية_أوزان": {"percent": 15, "amount": 150_000_000, "purpose": "مكافأة ملكية الأوزان - كل وزن له SHK - إثبات ملكية"},
            "Community_Ummah_الأمة": {"percent": 10, "amount": 100_000_000, "purpose": "الأمة - توزيع للمسلمين - إثراء الناس - إنهاء الفقر"},
            "Team_Sheikha_فريق": {"percent": 5, "amount": 50_000_000, "purpose": "فريق شيخة - مطورين - علماء - مهندسين - Vesting 4 سنوات"},
            "Liquidity_Siula_سيولة": {"percent": 5, "amount": 50_000_000, "purpose": "سيولة - تبادل HS Code - تجارة"}
        }
        
        # نماذج التمويل الحلال
        self.halal_finance = {
            "Qard_Hasan": {"desc": "قرض حسن 250k SHK - بدون فائدة - للمشاريع الناشئة", "limit_per_venture": 250_000, "repayment": "ميسر - بدون ربا - وإن كان ذو عسرة فنظرة إلى ميسرة"},
            "Mudarabah": {"desc": "مضاربة - رب المال شيخة - العامل رائد الأعمال - ربح 70% للعامل 30% لشيخة", "profit_share": "70/30"},
            "Musharakah": {"desc": "مشاركة - شيخة شريك - كل واحد برأس مال - ربح حسب الاتفاق وخسارة حسب رأس المال"},
            "Sukuk": {"desc": "صكوك - 1M SHK - أصل ملموس - Pearl Metal Foundry - HS Code - عائد من ربح حقيقي لا فائدة"},
            "Salam_Istisna": {"desc": "سلم واستصناع - تمويل تصنيع - ادفع الآن تسلم HS Code لاحقا - Foundry"},
            "Takaful": {"desc": "تكافل - تأمين تعاوني - لا تأمين تجاري - تغطية مخاطر"},
            "Waqf": {"desc": "وقف - حبس الأصل وتسبيل المنفعة - أصل SHK يبقى وربحه لله - إعمار"}
        }

    def generate_token_contract(self):
        contract = {
            "name": self.name,
            "symbol": self.symbol,
            "total_supply": self.total_supply,
            "owner": self.owner,
            "unified_id": "7049031003",
            "seal": self.seal,
            "creed": "LA_ILAHA_ILLA_ALLAH",
            "distribution": self.distribution,
            "halal_finance": self.halal_finance,
            "accounting": "TRIPLE_ENTRY - كل معاملة 3 قيود - مدين دائن وشاهد blockchain",
            "blockchain": "【entity-Polygon¦canonical_name=Polygon】 Amoy - Sheikha Chain V5 L1 - EVM Compatible",
            "hs_integration": "كل معاملة SHK مربوطة بـ HS Code - من 01 إلى 99 - منتج حقيقي",
            "sbc_integration": "كل بناء ممول بـ SHK - SBC 303 14 بند",
            "body_twin": "SHK يمثل جهد الإنسان - داخل وخارج - عرق جبين - وقل اعملوا",
            "timestamp": int(time.time()),
            "contract_hash": hashlib.sha256(json.dumps(self.distribution, sort_keys=True).encode()).hexdigest()
        }
        Path("sheikhachain/token/SHK_TOKEN_CONTRACT_V5.json").write_text(json.dumps(contract, indent=2, ensure_ascii=False), encoding='utf-8')
        print(f"💰 SHK TOKEN CONTRACT - Total: {self.total_supply:,} SHK")
        for k,v in self.distribution.items():
            print(f"   {k}: {v['percent']}% = {v['amount']:,} SHK - {v['purpose'][:40]}")
        print(f"   Halal Models: {list(self.halal_finance.keys())}")
        print(f"   Contract Hash: {contract['contract_hash'][:16]}...")
        return contract

if __name__ == "__main__":
    token = SHKTokenV5()
    token.generate_token_contract()
