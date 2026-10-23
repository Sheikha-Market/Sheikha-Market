# -*- coding: utf-8 -*-
import os, hashlib, json, time

class SovereignMoE:
    def __init__(self):
        self.registry = {}

    def register_expert_weights(self, expert_name, base_model, lora_path):
        proof_key = f"{expert_name}:{base_model}:{time.time()}"
        weight_hash = hashlib.sha256(proof_key.encode('utf-8')).hexdigest()
        self.registry[expert_name] = {
            "base_model": base_model,
            "lora_path": lora_path,
            "weight_hash": weight_hash,
            "ownership": "Salman Ahmed Al Rajeh (CR: 2051263653)"
        }
        print(f"🔒 [WEIGHTS] Registered Sovereign Weights for {expert_name}: {weight_hash[:16]}")
        return weight_hash

if __name__ == "__main__":
    moe = SovereignMoE()
    moe.register_expert_weights("Construction_Expert", "Llama-3.1-8B", "./families/02_construction")
