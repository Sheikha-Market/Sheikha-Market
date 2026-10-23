#!/usr/bin/env python3
import hashlib
import json
import re
from pathlib import Path

from datasets import load_dataset

ROOT = Path(__file__).resolve().parents[2]
SOURCE_FILE = ROOT / "data/sheikha-ai-training/source/cidar-train-v1.parquet"
TARGET = ROOT / "data/sheikha-ai-training/sheikha-cidar-arabic-sft-v1.jsonl"
MANIFEST = ROOT / "data/sheikha-ai-training/sheikha-cidar-arabic-sft-v1.manifest.json"
DATASET_ID = "arbml/CIDAR"
REVISION = "main"
SENSITIVE_PATTERNS = (
    re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"),
    re.compile(r"(?:\+?966|05)[0-9 \-]{8,12}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY")
)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    if not SOURCE_FILE.is_file():
        raise RuntimeError(f"CIDAR_SOURCE_REQUIRED:{SOURCE_FILE}")
    dataset = load_dataset(
        "parquet",
        data_files=str(SOURCE_FILE),
        split="train",
        cache_dir=str(
            ROOT / "runtime/sheikha-ai-governor/v1/llm-training/cache/datasets"
        )
    )
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    accepted = 0
    rejected = 0
    sensitive_rejected = 0
    with TARGET.open("w", encoding="utf-8") as output:
        for row in dataset:
            prompt = str(row.get("instruction") or "").strip()
            completion = str(row.get("output") or "").strip()
            if len(prompt) < 3 or len(completion) < 3:
                rejected += 1
                continue
            combined = f"{prompt}\n{completion}"
            if any(pattern.search(combined) for pattern in SENSITIVE_PATTERNS):
                sensitive_rejected += 1
                continue
            output.write(json.dumps({
                "prompt": prompt,
                "completion": completion,
                "source": DATASET_ID,
                "source_index": row.get("index"),
                "license": "Apache-2.0"
            }, ensure_ascii=False) + "\n")
            accepted += 1
    manifest = {
        "system": "SHEIKHA_CIDAR_ARABIC_SFT_DATASET_V1",
        "source": DATASET_ID,
        "sourceRevision": REVISION,
        "sourceLicense": "Apache-2.0",
        "sourceCard": "https://huggingface.co/datasets/arbml/CIDAR",
        "sourceFileSha256": digest(SOURCE_FILE),
        "recordsAccepted": accepted,
        "recordsRejected": rejected,
        "sensitiveRecordsRejected": sensitive_rejected,
        "datasetSha256": digest(TARGET),
        "commercialTrainingApprovedAutomatically": False,
        "remainingReviews": [
            "SAMPLE_QUALITY_REVIEW",
            "UPSTREAM_CONTENT_PROVENANCE_LEGAL_REVIEW"
        ]
    }
    MANIFEST.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
