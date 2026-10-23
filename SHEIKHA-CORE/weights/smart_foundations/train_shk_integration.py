# -*- coding: utf-8 -*-
import json, hashlib, time
from pathlib import Path

reg_path = Path("blockchain/registry.json")
registry = json.loads(reg_path.read_text(encoding='utf-8'))

# تحسين كل وزن بربطه بـ SHK Chain
for code, entry in registry.items():
    if "shk_reward" not in entry:
        # كل وزن له مكافأة SHK حسب أهميته
        if "king" in code or "sovereign" in code or "gpt" in code or "llama" in code:
            reward = 100000
        elif "minister" in code or "engineer" in code or "doctor" in code:
            reward = 50000
        elif "cosmic" in code or "sheikha" in code:
            reward = 150000
        else:
            reward = 10000
        
        entry["shk_reward"] = reward
        entry["shk_chain_block"] = hashlib.sha256(f"{code}:{entry.get('hash','')}".encode()).hexdigest()[:12]
        entry["triple_entry"] = {
            "debit": f"Weight Asset {code}",
            "credit": f"SHK Treasury {reward} SHK",
            "witness": f"Blockchain Block {entry['shk_chain_block']}"
        }

# حفظ
reg_path.write_text(json.dumps(registry, indent=2, ensure_ascii=False), encoding='utf-8')
total_shk_rewards = sum(v.get("shk_reward",0) for v in registry.values())
print(f"✅ SHK Integration - Total weights: {len(registry)}")
print(f"✅ Total SHK Rewards allocated: {total_shk_rewards:,} SHK")
print(f"✅ Triple Entry Accounting linked for all weights")
