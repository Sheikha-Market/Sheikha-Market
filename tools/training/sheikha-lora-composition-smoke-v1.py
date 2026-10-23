#!/usr/bin/env python3
"""Bounded offline PEFT training/merge experiment; never replaces a serving model."""

import hashlib
import json
import os
from pathlib import Path
import tempfile
from importlib.metadata import version


def examples(task, start, count):
    if task not in ("arithmetic", "sequence") or start < 0 or count < 1 or start + count > 256:
        raise ValueError("INVALID_SYNTHETIC_EXAMPLE_RANGE")
    rows = []
    for index in range(start, start + count):
        a, b = index % 16, index // 16
        result = (a + b) % 16 if task == "arithmetic" else a
        rows.append([1, 3 if task == "arithmetic" else 5, a + 8, b + 8, 4, result + 8, 2])
    return rows


def file_hash(file):
    hasher = hashlib.sha256()
    with file.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def run_smoke():
    for name in ("HF_HUB_OFFLINE", "TRANSFORMERS_OFFLINE", "HF_DATASETS_OFFLINE", "HF_HUB_DISABLE_TELEMETRY"):
        os.environ[name] = "1"
    os.environ["CUDA_VISIBLE_DEVICES"] = ""
    import torch
    from transformers import GPT2Config, GPT2LMHeadModel
    from peft import LoraConfig, PeftModel, get_peft_model

    previous_umask = os.umask(0o077)
    root = Path(__file__).resolve().parents[2] / "reports" / "private" / "lora-composition-smoke-v1"
    root.mkdir(mode=0o700, parents=True, exist_ok=True)
    lock = root / ".worker.lock"
    lock_fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    output = None
    try:
        output = Path(tempfile.mkdtemp(prefix="run-", dir=root))
        dataset = {task: {"train": examples(task, 0, 32), "heldout": examples(task, 32, 16)} for task in ("arithmetic", "sequence")}
        vocabulary = {"size": 32, "bos": 1, "eos": 2, "arithmetic": 3, "separator": 4, "sequence": 5, "integerTokens": {str(i): i + 8 for i in range(16)}, "naturalLanguageTokenizer": False}
        recipe = {"seed": 17, "stepsPerAdapter": 16, "learningRate": 0.01, "rank": 4, "alpha": 8, "method": "ties", "density": 1.0, "weights": [0.5, 0.5], "sourceSha256": file_hash(Path(__file__)), "versions": {name: version(name) for name in ("torch", "transformers", "peft", "safetensors")}}
        for name, value in (("dataset.json", dataset), ("vocabulary.json", vocabulary), ("recipe.json", recipe)):
            (output / name).write_text(json.dumps(value, indent=2) + "\n", encoding="utf-8")
        torch.set_num_threads(2)
        torch.manual_seed(17)
        base = GPT2LMHeadModel(GPT2Config(vocab_size=32, n_positions=32, n_layer=2, n_head=2, n_embd=32, bos_token_id=1, eos_token_id=2, pad_token_id=0, use_cache=False)).cpu()
        base.save_pretrained(output / "base", safe_serialization=True)
        base.name_or_path = str(output / "base")
        base_parameters = sum(parameter.numel() for parameter in base.parameters())
        settings = dict(task_type="CAUSAL_LM", r=4, lora_alpha=8, lora_dropout=0, target_modules=["c_attn"], fan_in_fan_out=True)
        model = get_peft_model(base, LoraConfig(**settings), adapter_name="arithmetic")
        model.add_adapter("sequence", LoraConfig(**settings))
        train = {task: torch.tensor(dataset[task]["train"]) for task in dataset}
        heldout = {task: torch.tensor(dataset[task]["heldout"]) for task in dataset}

        def loss(task):
            model.eval()
            with torch.no_grad():
                return float(model(input_ids=heldout[task], labels=heldout[task], attention_mask=torch.ones_like(heldout[task])).loss)

        with model.disable_adapter():
            before = {task: loss(task) for task in train}
        specialists = {}
        for task in train:
            model.set_adapter(task)
            model.train()
            optimizer = torch.optim.AdamW((p for p in model.parameters() if p.requires_grad), lr=0.01)
            for _ in range(16):
                optimizer.zero_grad(set_to_none=True)
                batch_loss = model(input_ids=train[task], labels=train[task], attention_mask=torch.ones_like(train[task])).loss
                if not bool(torch.isfinite(batch_loss)):
                    raise ValueError("NONFINITE_TRAINING_LOSS")
                batch_loss.backward()
                optimizer.step()
            specialists[task] = loss(task)

        model.add_weighted_adapter(["arithmetic", "sequence"], [0.5, 0.5], "combined", combination_type="ties", density=1.0)
        model.set_adapter("combined")
        merged = {task: loss(task) for task in train}
        model.save_pretrained(output / "adapters", selected_adapters=["arithmetic", "sequence", "combined"], safe_serialization=True)
        combined_path = output / "adapters" / "combined"
        model.eval()
        with torch.no_grad():
            expected = model(input_ids=heldout["arithmetic"]).logits.detach().clone()
        restored = PeftModel.from_pretrained(GPT2LMHeadModel.from_pretrained(output / "base", local_files_only=True), combined_path, local_files_only=True).cpu().eval()
        with torch.no_grad():
            actual = restored(input_ids=heldout["arithmetic"]).logits
        reload_equivalent = bool(torch.allclose(expected, actual, atol=1e-6, rtol=1e-5))
        if not reload_equivalent:
            raise ValueError("MERGED_ADAPTER_RELOAD_MISMATCH")
        result = {
            "system": "SHEIKHA_OFFLINE_LORA_COMPOSITION_SMOKE_V1", "status": "TRAINED_MERGED_AND_RELOADED_NOT_PROMOTED",
            "baseParameters": base_parameters, "device": "cpu", "seed": 17, "threads": 2,
            "trainingStepsPerAdapter": 16, "trainingRecordsPerTask": 32, "heldoutRecordsPerTask": 16,
            "dataOrigin": "GENERATED_TOKEN_PATTERNS_NO_CUSTOMER_OR_PROVIDER_DATA",
            "method": "PEFT_TIES_DENSITY_1_WEIGHTS_0.5_0.5", "randomInitialization": True,
            "baseHeldoutLoss": before, "specialistHeldoutLoss": specialists, "combinedHeldoutLoss": merged,
            "regressedTasksAgainstSpecialists": [task for task in train if merged[task] > specialists[task]],
            "reloadEquivalent": reload_equivalent, "files": {str(file.relative_to(output)): file_hash(file) for file in sorted(output.rglob("*")) if file.is_file()},
            "trainingExecuted": True, "mergeExecuted": True, "modelPromoted": False,
            "largeLlmTrained": False, "arabicQualityEvaluated": False, "commercialProductionReady": False,
            "externalResourceProvisioned": False, "externalTrainingDataUsed": False,
        }
        (output / "result.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
        return {"output": str(output), **result}
    except Exception:
        if output is not None:
            (output / "failed.json").write_text('{"status":"FAILED_NOT_PROMOTED"}\n', encoding="utf-8")
        raise
    finally:
        os.close(lock_fd)
        lock.unlink()
        os.umask(previous_umask)


if __name__ == "__main__":
    import sys
    if sys.argv[1:]:
        raise SystemExit("NO_ARGUMENTS_SUPPORTED_FIXED_OFFLINE_SMOKE_ONLY")
    print(json.dumps(run_smoke(), indent=2))
