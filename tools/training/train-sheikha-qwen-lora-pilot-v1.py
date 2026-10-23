#!/usr/bin/env python3
import hashlib
import json
import os
from pathlib import Path

import torch
from datasets import Dataset
from huggingface_hub import hf_hub_download
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    Trainer,
    TrainingArguments,
    default_data_collator,
)

ROOT = Path(__file__).resolve().parents[2]
DATASET = ROOT / os.environ.get(
    "SHEIKHA_LLM_DATASET",
    "data/sheikha-ai-training/sheikha-arabic-sft-pilot-v1.jsonl",
)
BASE_MODEL = "Qwen/Qwen2.5-0.5B-Instruct"
OUTPUT = ROOT / os.environ.get(
    "SHEIKHA_LLM_OUTPUT",
    "runtime/sheikha-ai-governor/v1/llm-training/qwen2.5-0.5b-lora-pilot-v1",
)
CACHE = ROOT / "runtime/sheikha-ai-governor/v1/llm-training/cache"
REPORT = ROOT / os.environ.get(
    "SHEIKHA_LLM_REPORT",
    "runtime/sheikha-ai-governor/v1/llm-training/sheikha-qwen-lora-pilot-v1-report.json",
)


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    if not torch.cuda.is_available():
        raise RuntimeError("CUDA_REQUIRED")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    CACHE.mkdir(parents=True, exist_ok=True)
    os.environ["HF_HOME"] = str(CACHE)
    records = [json.loads(line) for line in DATASET.read_text(encoding="utf-8").splitlines() if line.strip()]
    license_path = Path(hf_hub_download(BASE_MODEL, "LICENSE", cache_dir=CACHE))
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, cache_dir=CACHE)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    quantization = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16,
        bnb_4bit_use_double_quant=True,
    )
    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        cache_dir=CACHE,
        quantization_config=quantization,
        device_map="auto",
        dtype=torch.bfloat16,
    )
    model = prepare_model_for_kbit_training(model)
    model = get_peft_model(model, LoraConfig(
        r=8,
        lora_alpha=16,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    ))

    def encode(row):
        prompt_text = tokenizer.apply_chat_template([
            {"role": "user", "content": row["prompt"]},
        ], tokenize=False, add_generation_prompt=True)
        full_text = tokenizer.apply_chat_template([
            {"role": "user", "content": row["prompt"]},
            {"role": "assistant", "content": row["completion"]},
        ], tokenize=False, add_generation_prompt=False)
        encoded = tokenizer(
            full_text, truncation=True, max_length=384,
            padding="max_length",
        )
        prompt_length = len(tokenizer(
            prompt_text, truncation=True, max_length=384,
        )["input_ids"])
        encoded["labels"] = [
            token if index >= prompt_length and mask else -100
            for index, (token, mask) in enumerate(zip(
                encoded["input_ids"], encoded["attention_mask"]
            ))
        ]
        return encoded

    raw_training_data = Dataset.from_list(records)
    training_data = raw_training_data.map(
        encode,
        remove_columns=raw_training_data.column_names
    )
    max_steps = max(1, int(os.environ.get("SHEIKHA_LLM_MAX_STEPS", "24")))
    args = TrainingArguments(
        output_dir=str(OUTPUT / "checkpoints"),
        per_device_train_batch_size=1,
        gradient_accumulation_steps=2,
        max_steps=max_steps,
        learning_rate=float(os.environ.get("SHEIKHA_LLM_LEARNING_RATE", "5e-5")),
        bf16=True,
        logging_steps=1,
        save_steps=max_steps,
        save_total_limit=1,
        report_to=[],
        seed=20260829,
    )
    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=training_data,
        data_collator=default_data_collator,
    )
    metrics = trainer.train().metrics
    model.save_pretrained(OUTPUT / "adapter")
    tokenizer.save_pretrained(OUTPUT / "adapter")
    artifact_files = sorted((OUTPUT / "adapter").glob("*"))
    artifact_hashes = {path.name: sha256(path) for path in artifact_files if path.is_file()}
    report = {
        "system": "SHEIKHA_QWEN_LORA_PILOT_V1",
        "status": "TRAINING_EXECUTED_NOT_PRODUCTION_PROMOTED",
        "baseModel": BASE_MODEL,
        "baseModelLicense": "Apache-2.0",
        "baseModelLicenseSha256": sha256(license_path),
        "dataset": str(DATASET.relative_to(ROOT)),
        "datasetLicense": os.environ.get("SHEIKHA_LLM_DATASET_LICENSE", "SHEIKHA-LOCAL-ORIGINAL"),
        "datasetSha256": sha256(DATASET),
        "records": len(records),
        "method": "QLORA_4BIT_NF4",
        "steps": max_steps,
        "metrics": metrics,
        "gpu": torch.cuda.get_device_name(0),
        "artifact": str((OUTPUT / "adapter").relative_to(ROOT)),
        "artifactHashes": artifact_hashes,
        "commercialReadiness": "EVALUATION_AND_HUMAN_LEGAL_REVIEW_REQUIRED",
        "productionApproved": False,
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
