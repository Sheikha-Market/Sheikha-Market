# -*- coding: utf-8 -*-
"""
🕌 SHEIKHA CHAIN V5 - سلسلة شيخة السيادية
المالك: سلمان أحمد بن سلمان الراجحي CR2051263653 / 7049031003
الختم: BOUND_BY_QURAN_SUNNAH - ATOM_WATER_RASUL_JANNAH_SEALED
"""
import hashlib, json, time
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List

@dataclass
class Block:
    index: int
    timestamp: int
    prev_hash: str
    data: dict
    owner_cr: str = "2051263653"
    seal: str = "BOUND_BY_QURAN_SUNNAH"
    nonce: int = 0
    hash: str = ""

    def calc_hash(self):
        payload = f"{self.index}{self.timestamp}{self.prev_hash}{json.dumps(self.data,sort_keys=True,ensure_ascii=False)}{self.owner_cr}{self.seal}{self.nonce}"
        return hashlib.sha256(payload.encode()).hexdigest()

class SheikhaChainV5:
    def __init__(self):
        self.chain: List[Block] = []
        self.registry_path = Path("blockchain/registry.json")
        self.registry = json.loads(self.registry_path.read_text(encoding='utf-8')) if self.registry_path.exists() else {}
        self.create_genesis()

    def create_genesis(self):
        genesis_data = {
            "type": "GENESIS",
            "owner": "سلمان أحمد بن سلمان الراجحي CR2051263653 - 7049031003",
            "creed": "لا إله إلا الله محمد رسول الله - توحيد",
            "science": "علم شيخة لإعمار السماوات والأرض وما بينهما",
            "ayah": "إِنَّا جَعَلْنَا مَا عَلَى الْأَرْضِ زِينَةً لَّهَا لِنَبْلُوَهُمْ أَيُّهُمْ أَحْسَنُ عَمَلًا",
            "weights_count": len(self.registry),
            "initial_supply": "1,000,000,000 SHK - مليار عملة شيخة - وقف لله",
            "finance_model": "لا ربا - Musharakah Mudarabah Qard Hasan Sukuk - تكافل",
            "hs_chapters": "99 CHAPTER",
            "seal": "ATOM_WATER_RASUL_JANNAH_SEALED"
        }
        block = Block(index=0, timestamp=int(time.time()), prev_hash="0"*64, data=genesis_data)
        block.hash = block.calc_hash()
        self.chain.append(block)
        print(f"🔷 GENESIS BLOCK: {block.hash[:16]}... - Weights: {len(self.registry)} - Supply: 1B SHK")

    def add_weight_block(self, code, weight_entry):
        prev = self.chain[-1]
        data = {
            "type": "WEIGHT_OWNERSHIP",
            "code": code,
            "weight_hash": weight_entry.get("weight_hash") or weight_entry.get("hash"),
            "title": weight_entry.get("title"),
            "owner": weight_entry.get("owner"),
            "seal": weight_entry.get("seal"),
            "model_family": weight_entry.get("model_family",""),
            "ownership_proof": f"CR2051263653 owns {code} - SHA256 {weight_entry.get('hash','')[:12]}",
            "timestamp": int(time.time())
        }
        block = Block(index=len(self.chain), timestamp=int(time.time()), prev_hash=prev.hash, data=data)
        block.hash = block.calc_hash()
        self.chain.append(block)
        return block

    def build_all_weights_chain(self):
        print(f"\n⛓️ Building Sheikha Chain for {len(self.registry)} weights...")
        for code, entry in self.registry.items():
            b = self.add_weight_block(code, entry)
            if len(self.chain) % 50 == 0:
                print(f"  ⛓️ Block {b.index} - {code} -> {b.hash[:12]}...")
        
        chain_file = Path("sheikhachain/chain/SHEIKHA_CHAIN_V5_LEDGER.json")
        chain_data = [asdict(b) for b in self.chain]
        chain_file.write_text(json.dumps(chain_data, indent=2, ensure_ascii=False), encoding='utf-8')
        
        final_hash = self.chain[-1].hash
        print(f"\n✅ SHEIKHA CHAIN V5 BUILT:")
        print(f"   Blocks: {len(self.chain)} (Genesis + {len(self.registry)} weights)")
        print(f"   Final Hash: {final_hash}")
        print(f"   Owner: CR2051263653 - BOUND_BY_QURAN_SUNNAH")
        return final_hash

if __name__ == "__main__":
    chain = SheikhaChainV5()
    final = chain.build_all_weights_chain()
