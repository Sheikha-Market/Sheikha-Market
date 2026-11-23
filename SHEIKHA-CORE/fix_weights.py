# -*- coding: utf-8 -*-
import os, sys, json, hashlib, time

# إضافة المسار التنفيذي الحالي للنظام
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from weights.merge_weights import SovereignMoE

def main():
    print("🔒 [SHEIKHA-CORE] Initiating Derived Weight Ownership Registration...")
    moe = SovereignMoE()
    
    # تسجيل أوزان الخبراء الخمسة الأساسية
    experts = [
        ("construction_expert", "Llama-3.1-8B", "./families/02_construction"),
        ("body_twin_expert", "Qwen2.5-7B", "./families/05_body"),
        ("computing_math_expert", "DeepSeek-R1-Distill", "./families/03_computing"),
        ("sensors_iot_expert", "Llama-3.1-8B", "./families/04_sensors"),
        ("robotics_expert", "Llama-3.1-8B", "./families/06_robotics")
    ]
    
    records = []
    for expert, model, path in experts:
        w_hash = moe.register_expert_weights(expert, model, path)
        records.append({"expert": expert, "hash": w_hash})
        
    print("✅ [SHEIKHA-CORE] All 5 Derived Expert Weights Successfully Sealed & Registered.")
    return records

if __name__ == "__main__":
    main()
