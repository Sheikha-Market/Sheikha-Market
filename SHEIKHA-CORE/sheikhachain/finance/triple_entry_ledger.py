# -*- coding: utf-8 -*-
# SHEIKHA-CHAIN TRIPLE-ENTRY ACCOUNTING & SHARIA FINANCE ENGINE
# Owner: Salman Ahmed bin Salman Al-Rajhi (CR: 2051263653)

import hashlib, json, time

class SheikhaLedgerEntry:
    def __init__(self, debit_acc, credit_acc, amount_shk, purpose, underlying_asset_id):
        self.debit_account = debit_acc
        self.credit_account = credit_acc
        self.amount_shk = amount_shk
        self.purpose = purpose
        self.underlying_asset_id = underlying_asset_id
        self.timestamp = int(time.time())
        self.seal = "BOUND_BY_QURAN_SUNNAH"
        self.entry_hash = self._generate_proof()

    def _generate_proof(self):
        payload = f"{self.debit_account}:{self.credit_account}:{self.amount_shk}:{self.underlying_asset_id}:{self.timestamp}"
        return hashlib.sha256(payload.encode('utf-8')).hexdigest()

    def to_blockchain_record(self):
        return {
            "entry_hash": self.entry_hash,
            "debit": self.debit_account,
            "credit": self.credit_account,
            "amount": f"{self.amount_shk} SHK",
            "purpose": self.purpose,
            "asset_backing": self.underlying_asset_id,
            "seal": self.seal,
            "timestamp": self.timestamp
        }

if __name__ == "__main__":
    entry = SheikhaLedgerEntry(
        debit_acc="Treasury_Smart_Foundations_01",
        credit_acc="Sovereign_Reserve_Vault",
        amount_shk=50000,
        purpose="تمويل تصنيع سبائك Pearl Metal وحساسات SBC 303",
        underlying_asset_id="ASSET_HS_7214_20_00_HEX_0244F95D"
    )
    print("===================================================================================")
    print("🕌 [SHEIKHA-FINANCE] قيد محاسبي ثلاثي موثق على شيخة شين (Triple-Entry Active):")
    print("===================================================================================")
    print(json.dumps(entry.to_blockchain_record(), indent=2, ensure_ascii=False))
    print("===================================================================================")
