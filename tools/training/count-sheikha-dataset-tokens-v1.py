#!/usr/bin/env python3
import hashlib
import json
from pathlib import Path

from transformers import AutoTokenizer

ROOT = Path(__file__).resolve().parents[2]
DATASET = ROOT / "data/sheikha-ai-training/sheikha-arabic-commercial-curriculum-v2.jsonl"
OUTPUT = ROOT / "runtime/sheikha-ai-governor/v1/llm-training/sheikha-arabic-commercial-curriculum-v2-token-evidence.json"
TOKENIZER_ID = "Qwen/Qwen2.5-0.5B-Instruct"
TOKENIZER = ROOT / "runtime/sheikha-ai-governor/v1/llm-training/qwen2.5-0.5b-lora-curriculum-v2/adapter"

tokenizer = AutoTokenizer.from_pretrained(str(TOKENIZER), local_files_only=True)
if tokenizer.vocab_size < 1000:
    raise RuntimeError("LOCAL_TOKENIZER_VOCAB_INCOMPLETE")
records = 0
token_count = 0
for line in DATASET.read_text(encoding="utf-8").splitlines():
    if not line.strip():
        continue
    payload = json.loads(line)
    token_count += len(tokenizer.encode(json.dumps(payload, ensure_ascii=False), add_special_tokens=True))
    records += 1

dataset_sha = hashlib.sha256(DATASET.read_bytes()).hexdigest()
base = {
    "system": "SHEIKHA_DATASET_TOKEN_EVIDENCE_V1",
    "dataset": str(DATASET.relative_to(ROOT)),
    "datasetSha256": dataset_sha,
    "records": records,
    "tokenizer": TOKENIZER_ID,
    "tokenizerArtifact": str(TOKENIZER.relative_to(ROOT)),
    "tokenizerJsonSha256": hashlib.sha256((TOKENIZER / "tokenizer.json").read_bytes()).hexdigest(),
    "tokenCount": token_count,
    "method": "EXACT_LOCAL_TOKENIZER_ENCODING_OF_CANONICAL_JSON_RECORDS",
    "networkUsed": False,
}
base["evidenceSha256"] = hashlib.sha256(
    json.dumps(base, ensure_ascii=False, sort_keys=True).encode("utf-8")
).hexdigest()
OUTPUT.write_text(json.dumps(base, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(base, ensure_ascii=False, indent=2))
