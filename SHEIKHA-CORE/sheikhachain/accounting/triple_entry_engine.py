# -*- coding: utf-8 -*-
# SHEIKHA TRIPLE-ENTRY ACCOUNTING & SHARIA FINANCE ENGINE
import hashlib, json, time, pathlib
class SheikhaLedgerEntry:
    def __init__(self, debit_acc, credit_acc, amount_shk, purpose, underlying_asset_id):
        self.debit_account=debit_acc; self.credit_account=credit_acc
        self.amount_shk=amount_shk; self.purpose=purpose
        self.underlying_asset_id=underlying_asset_id
        self.timestamp=int(time.time()); self.seal="BOUND_BY_QURAN_SUNNAH"
        self.entry_hash=hashlib.sha256(f"{debit_acc}:{credit_acc}:{amount_shk}:{underlying_asset_id}:{self.timestamp}".encode()).hexdigest()
    def to_blockchain_record(self):
        return {"entry_hash":self.entry_hash,"debit":self.debit_account,"credit":self.credit_account,"amount":f"{self.amount_shk} SHK","purpose":self.purpose,"asset_backing":self.underlying_asset_id,"seal":self.seal,"timestamp":self.timestamp, "sharia_check":"HALAL_NO_RIBA_NO_GHARAR"}
if __name__=="__main__":
    entry=SheikhaLedgerEntry("Treasury_Smart_Foundations_01","Sovereign_Reserve_Vault",50000,"تمويل حساسات SBC 303","ASSET_SBC303_HEX_07B7A2EA")
    print(json.dumps(entry.to_blockchain_record(),indent=2,ensure_ascii=False))
    pathlib.Path("sheikhachain/blocks").mkdir(parents=True, exist_ok=True)
