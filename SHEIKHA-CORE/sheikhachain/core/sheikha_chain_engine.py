# -*- coding: utf-8 -*-
# ===================================================================================
# 🕌 SHEIKHA-CHAIN SOVEREIGN PARALLEL LEDGER ENGINE V1.0
# Owner: Salman Ahmed bin Salman Al-Rajhi (CR: 2051263653 | Unified ID: 7049031003)
# Creed: LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH
# Seal: BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED
# ===================================================================================

import os, sys, json, time, hashlib

class SheikhaBlock:
    def __init__(self, index, previous_hash, timestamp, data, state_root, validator):
        self.index = index
        self.previous_hash = previous_hash
        self.timestamp = timestamp
        self.data = data
        self.state_root = state_root
        self.validator = validator
        self.seal = "BOUND_BY_QURAN_SUNNAH"
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        block_string = json.dumps({
            "index": self.index,
            "previous_hash": self.previous_hash,
            "timestamp": self.timestamp,
            "data": self.data,
            "state_root": self.state_root,
            "validator": self.validator,
            "seal": self.seal
        }, sort_keys=True).encode("utf-8")
        return hashlib.sha256(block_string).hexdigest()

class SheikhaChain:
    def __init__(self):
        self.chain_id = 7049031003
        self.owner = "سلمان أحمد بن سلمان الراجح (CR: 2051263653)"
        self.ledger_dir = "sheikhachain/blocks"
        self.chain = []
        self.create_genesis_block()

    def create_genesis_block(self):
        # الكتلة الصفرية المؤسسة (Genesis Block) الشاملة لكافة الأوزان الـ 62 والعلوم
        genesis_data = {
            "title": "SHEIKHA-CHAIN GENESIS SOVEREIGN BLOCK",
            "science": "علم شيخة لإعمار السماوات والأرض وما بينهما",
            "doctrine": "الكتاب والسنة النبوية الشريفة",
            "creed": "LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH",
            "owner": self.owner,
            "cr_number": "2051263653",
            "verified_weights_count": 62,
            "domains": [
                "العلوم الشرعية والتوحيد والعمارة",
                "أكواد البناء السعودي SBC 201-1201",
                "الأنظمة والوزارات السعودية DGA, NCA, SAMA, MC, CMA",
                "المعايير الدولية ISO, NIST, IBC, IEEE, ASME",
                "الحوسبة والرياضيات والفيزياء والمواد الفائقة Pearl Metal",
                "الجسد الرقمي التوأمي والأساسات الذكية والروبوتات ROS2"
            ]
        }
        state_root = hashlib.sha256(json.dumps(genesis_data, sort_keys=True).encode()).hexdigest()
        genesis_block = SheikhaBlock(
            index=0,
            previous_hash="0" * 64,
            timestamp=1792790000,
            data=genesis_data,
            state_root=state_root,
            validator="SOVEREIGN_AUTHORITY_SALMAN_AL_RAJHI"
        )
        self.chain.append(genesis_block)
        self.persist_block(genesis_block)

    def persist_block(self, block):
        os.makedirs(self.ledger_dir, exist_ok=True)
        block_file = os.path.join(self.ledger_dir, f"block_{block.index:08d}.json")
        with open(block_file, "w", encoding="utf-8") as f:
            json.dump(block.__dict__, f, indent=2, ensure_ascii=False)

    def mine_sovereign_block(self, transactions):
        prev_block = self.chain[-1]
        state_root = hashlib.sha256(json.dumps(transactions, sort_keys=True).encode()).hexdigest()
        new_block = SheikhaBlock(
            index=prev_block.index + 1,
            previous_hash=prev_block.hash,
            timestamp=int(time.time()),
            data=transactions,
            state_root=state_root,
            validator=self.owner
        )
        self.chain.append(new_block)
        self.persist_block(new_block)
        return new_block

if __name__ == "__main__":
    print("===================================================================================")
    print("🕌 [SHEIKHA-CHAIN] إطلاق محرك سلسلة كتل شيخة الموازية السيادية...")
    chain = SheikhaChain()
    genesis = chain.chain[0]
    print(f"✅ تم تأصيل وتثبيت الكتلة الصفرية (Genesis Block #0)")
    print(f"🔒 هاش الكتلة الصفرية: {genesis.hash}")
    print(f"🏛️ الناظر السيادي: {genesis.validator}")
    print(f"⚖️ مصفوفة الحوكمة: {genesis.seal}")
    print("===================================================================================")
