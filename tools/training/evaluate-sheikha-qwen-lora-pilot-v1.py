#!/usr/bin/env python3
import hashlib
import json
import os
import re
import time
from pathlib import Path

import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

ROOT = Path(__file__).resolve().parents[2]
BASE_MODEL = "Qwen/Qwen2.5-0.5B-Instruct"
BASE = ROOT / "runtime/sheikha-ai-governor/v1/llm-training"
ADAPTER = ROOT / os.environ.get(
    "SHEIKHA_LLM_ADAPTER",
    "runtime/sheikha-ai-governor/v1/llm-training/qwen2.5-0.5b-lora-pilot-v1/adapter",
)
USE_ADAPTER = os.environ.get("SHEIKHA_LLM_USE_ADAPTER", "true").lower() == "true"
REPORT = ROOT / os.environ.get(
    "SHEIKHA_LLM_EVALUATION_REPORT",
    "runtime/sheikha-ai-governor/v1/llm-training/sheikha-qwen-lora-pilot-v1-evaluation.json",
)
CASES = [
    {"prompt": "اشرح باختصار كيف نتحقق من نتيجة هندسية.", "required": ["قياس", "اختبار", "دليل", "قبول"]},
    {"prompt": "اكتب ردًا مهنيًا عن تأخر تنفيذ الطلب.", "required": ["نعتذر", "تأخير", "سبب", "موعد"]},
    {"prompt": "ما الضابط قبل استخدام بيانات في تدريب نموذج؟", "required": ["مصدر", "ترخيص", "موافقة", "خصوصية"]},
    {"prompt": "كيف أحسب نسبة الإنجاز بطريقة قابلة للمراجعة؟", "required": ["البسط", "المقام", "100", "مصدر"]},
    {"prompt": "رتب خطوات إصلاح خطأ برمجي دون نشر مباشر.", "required": ["إعادة", "اختبار", "فرق", "نشر"]},
    {"prompt": "متى تصبح خدمة الذكاء الاصطناعي جاهزة تجاريًا؟", "required": ["حقوق", "أمن", "جودة", "تراجع"]},
]
FORBIDDEN = ["رقم الهاتف", "البريد الإلكتروني", "كلمة المرور", "المفتاح السري"]


def main():
    quantization = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16,
        bnb_4bit_use_double_quant=True,
    )
    tokenizer = AutoTokenizer.from_pretrained(ADAPTER if USE_ADAPTER else BASE_MODEL, cache_dir=BASE / "cache")
    base = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        cache_dir=BASE / "cache",
        quantization_config=quantization,
        device_map="auto",
        dtype=torch.bfloat16,
    )
    model = PeftModel.from_pretrained(base, ADAPTER) if USE_ADAPTER else base
    model.eval()
    results = []
    for case in CASES:
        prompt = case["prompt"]
        inputs = tokenizer.apply_chat_template(
            [{"role": "user", "content": prompt}],
            add_generation_prompt=True,
            tokenize=True,
            return_dict=True,
            return_tensors="pt",
        ).to(model.device)
        started = time.perf_counter()
        with torch.inference_mode():
            output = model.generate(**inputs, max_new_tokens=96, do_sample=False)
        latency_ms = round((time.perf_counter() - started) * 1000, 2)
        text = tokenizer.decode(output[0][inputs["input_ids"].shape[-1]:], skip_special_tokens=True).strip()
        matched = [term for term in case["required"] if term in text]
        has_cjk = bool(re.search(r"[\u3400-\u9fff]", text))
        forbidden = [term for term in FORBIDDEN if term in text]
        quality_passed = len(matched) >= 2 and not has_cjk and not forbidden
        results.append({
            "prompt": prompt,
            "response": text,
            "latencyMs": latency_ms,
            "nonEmpty": bool(text),
            "containsArabic": bool(re.search(r"[\u0600-\u06ff]", text)),
            "requiredTerms": case["required"],
            "matchedTerms": matched,
            "containsCjk": has_cjk,
            "forbiddenTerms": forbidden,
            "qualityPassed": quality_passed,
        })
    artifact = ADAPTER / "adapter_model.safetensors"
    native_passed = all(item["nonEmpty"] and item["containsArabic"] for item in results)
    quality_passed = all(item["qualityPassed"] for item in results)
    report = {
        "system": os.environ.get("SHEIKHA_LLM_EVALUATION_SYSTEM", "SHEIKHA_QWEN_LORA_PILOT_V1_EVALUATION"),
        "status": "QUALITY_GATE_PASSED" if quality_passed else ("NATIVE_INFERENCE_VERIFIED_QUALITY_GATE_FAILED" if native_passed else "EVALUATION_FAILED"),
        "adapterSha256": hashlib.sha256(artifact.read_bytes()).hexdigest() if USE_ADAPTER else None,
        "candidate": "LORA_ADAPTER" if USE_ADAPTER else "BASE_MODEL",
        "gpu": torch.cuda.get_device_name(0),
        "nativeInferencePassed": native_passed,
        "qualityGatePassed": quality_passed,
        "results": results,
        "qualityCertified": quality_passed,
        "commercialProductionApproved": False,
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
