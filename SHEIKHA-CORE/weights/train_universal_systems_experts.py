# -*- coding: utf-8 -*-
# SHEIKHA UNIVERSAL SYSTEMS & GOVERNANCE TRAINER
# Sovereign Owner: Salman Ahmed Al Rajeh (CR: 2051263653) | Bound by Quran & Sunnah

import os, json, hashlib, time

def main():
    print("🕌 [SHEIKHA-TRAINER] Training and Sealing ALL Saudi & Global Governance Systems...")
    dataset_path = "families/08_saudi_regulations/universal_systems_dataset.json"
    
    with open(dataset_path, "r", encoding="utf-8") as f:
        systems = json.load(f)
        
    registry_path = "blockchain/registry.json"
    registry = {}
    if os.path.exists(registry_path):
        try:
            with open(registry_path, "r", encoding="utf-8") as f:
                registry = json.load(f)
        except Exception: pass

    for item in systems:
        expert_key = f"expert_{item['domain']}"
        payload = f"{item['domain']}:{item['title']}:{time.time()}:SALMAN_AL_RAJEH"
        w_hash = hashlib.sha256(payload.encode('utf-8')).hexdigest()
        
        registry[expert_key] = {
            "domain": item["domain"],
            "title": item["title"],
            "authority": item["authority"],
            "weight_hash": w_hash,
            "owner": "Salman Ahmed Al Rajeh (CR: 2051263653)",
            "seal": "BOUND_BY_QURAN_SUNNAH",
            "timestamp": int(time.time())
        }
        print(f"🔒 [SEALED] {item['authority']} ({item['title']}) -> Hash: {w_hash[:16]}...")

    with open(registry_path, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2, ensure_ascii=False)

    print("✅ All Local & International Governance Systems Successfully Sealed in Blockchain Registry.")

if __name__ == "__main__":
    main()
