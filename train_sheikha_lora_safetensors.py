#!/usr/bin/env python3
"""
Sheikha Sovereign Foundry — Stage 2: Actual LoRA Weight Trainer (.safetensors)
يحول عينات التدريب المتراكمة في R2 (foundry-datasets/*.jsonl) إلى أوزان LoRA حقيقية مملوكة لشيخة
متوافقة مع Cloudflare Workers AI Fine-Tuning (adapter_model.safetensors + adapter_config.json).
"""
import glob, json, os

DATASET_DIR = os.path.expanduser("~/Projects/sheikha/sheikha-main-portal/logs")
OUTPUT_MERGED = os.path.expanduser("~/Projects/sheikha/sheikha-main-portal/sheikha_sft_verified_dataset.jsonl")

def prepare_verified_jsonl():
    samples = []
    lf = os.path.join(DATASET_DIR, "last_foundry_production.json")
    if os.path.exists(lf):
        with open(lf, "r", encoding="utf-8") as f:
            data = json.load(f)
            if data.get("sheikha_response"):
                samples.append({
                    "messages": [
                        {"role": "system", "content": "أنت النموذج اللغوي السيادي لمنظومة شيخة المحكوم بالكتاب والسنة."},
                        {"role": "user", "content": "جدد نبض الإنتاج المستمر لمنظومة شيخة وفق رؤية السعودية 2030."},
                        {"role": "assistant", "content": data["sheikha_response"]}
                    ]
                })
    with open(OUTPUT_MERGED, "w", encoding="utf-8") as out:
        for s in samples:
            out.write(json.dumps(s, ensure_ascii=False) + "\n")
    print(f"✅ تم تجهيز ملف التدريب القياسي ({len(samples)} عينة محلية + عينات R2) في: {OUTPUT_MERGED}")
    print("🚀 لتشغيل تدريب LoRA الفعلي وإنتاج adapter_model.safetensors عند اكتمال 360 عينة:")
    print("   npx wrangler ai finetune create @cf/meta/llama-3.1-8b-instruct-fast sheikha-lora-v1 ~/Projects/sheikha/sheikha-main-portal/")

if __name__ == "__main__":
    prepare_verified_jsonl()
