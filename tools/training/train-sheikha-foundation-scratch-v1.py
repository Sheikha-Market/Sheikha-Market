#!/usr/bin/env python3
"""Bounded, offline, random-initialized training proof, not a large-model trainer."""

import argparse
import hashlib
import importlib.metadata
import json
import math
import os
from pathlib import Path
import random
import shutil
import stat
import sys
import time

ROOT = Path(__file__).resolve().parents[2]
PRIVATE = ROOT / "reports/private"
SEED = 20260914
PAD, EOS = 256, 257
MODEL_CONFIG = {
    "vocab_size": 258, "n_positions": 96, "n_embd": 192,
    "n_layer": 4, "n_head": 6, "resid_pdrop": 0.0,
    "embd_pdrop": 0.0, "attn_pdrop": 0.0, "use_cache": False,
    "bos_token_id": EOS, "eos_token_id": EOS, "pad_token_id": PAD,
    "attn_implementation": "eager",
}
TOKENIZER = {"type": "UTF8_BYTES_V1", "vocabSize": 258, "pad": PAD, "eos": EOS,
             "pretrainedTokenizerUsed": False}
OPTIMIZER_CONFIG = {"lr": 0.001, "weight_decay": 0.01}
PROFILES = {
    "micro": {"n_embd": 64, "n_layer": 2, "n_head": 2},
    "mini": {"n_embd": 128, "n_layer": 2, "n_head": 4},
    "seed": {"n_embd": 192, "n_layer": 4, "n_head": 6},
}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def json_bytes(value):
    return (json.dumps(value, sort_keys=True, ensure_ascii=True, indent=2,
                       allow_nan=False) + "\n").encode()


def private_path(value, *, existing=False):
    path = Path(os.path.abspath(value))
    if path == PRIVATE or PRIVATE not in path.parents:
        raise ValueError("PRIVATE_REPORT_SUBDIRECTORY_REQUIRED")
    # Reject symlinks before resolving: even a link back into private is not allowed.
    for parent in reversed((path, *path.parents)):
        if parent.is_symlink():
            raise ValueError("SYMLINK_FORBIDDEN")
        if (parent == PRIVATE or PRIVATE in parent.parents) and parent.exists():
            info = parent.stat()
            if info.st_uid != os.geteuid() or stat.S_IMODE(info.st_mode) != 0o700:
                raise ValueError("PRIVATE_DIRECTORY_OWNER_AND_MODE_700_REQUIRED")
            if not stat.S_ISDIR(info.st_mode):
                raise ValueError("DIRECTORY_REQUIRED")
    if existing and not path.is_dir():
        raise ValueError("CHECKPOINT_NOT_FOUND")
    if not existing and path.exists():
        raise ValueError("OUTPUT_ALREADY_EXISTS")
    return path


def write_new(path, data):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, "wb") as stream:
        stream.write(data)
        stream.flush()
        os.fsync(stream.fileno())


def read_private(path):
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    with os.fdopen(fd, "rb") as stream:
        info = os.fstat(stream.fileno())
        if (not stat.S_ISREG(info.st_mode) or info.st_nlink != 1
                or info.st_uid != os.geteuid() or stat.S_IMODE(info.st_mode) != 0o600
                or info.st_size > 64 * 1024 * 1024):
            raise ValueError("PRIVATE_FILE_INVALID")
        return stream.read()


def make_corpus():
    splits = {"train": [], "validation": [], "test": []}
    for a in range(48):
        for b in range(a, 48):
            bucket = int(digest(f"pair:{a}:{b}".encode())[:8], 16) % 10
            split = "test" if bucket == 0 else "validation" if bucket == 1 else "train"
            # Keep every representation of an arithmetic problem in the same split.
            prompts = [f"add {a} {b} = ", f"\u062c\u0645\u0639 {a} {b} = ",
                       f"assert {a} + {b} == "]
            for prompt in prompts:
                splits[split].append({"problemId": f"{a}:{b}", "prompt": prompt,
                                      "answer": str(a + b)})
    return splits


def corpus_manifest(corpus):
    return {
        "origin": "DETERMINISTIC_INTEGER_ADDITION_GENERATOR_V1",
        "customerDataUsed": False, "teacherModelOutputsUsed": False,
        "externalCorpusUsed": False, "legalTitleCertified": False,
        "splitUnit": "ARITHMETIC_PROBLEM_ALL_REPRESENTATIONS",
        "splits": {name: {"records": len(rows), "sha256": digest(json_bytes(rows)),
                          "datasetByteTokensIncludingEos": sum(
                              len((r["prompt"] + r["answer"] + "\n").encode()) + 1
                              for r in rows)} for name, rows in corpus.items()},
        "limitation": "SHARED_TEMPLATES_NOT_A_GENERAL_ARABIC_OR_SCIENCE_BENCHMARK",
    }


def offline_libraries():
    os.environ.setdefault("CUBLAS_WORKSPACE_CONFIG", ":4096:8")
    os.environ.update({"HF_HUB_OFFLINE": "1", "TRANSFORMERS_OFFLINE": "1",
                       "HF_HUB_DISABLE_TELEMETRY": "1", "WANDB_DISABLED": "true"})

    def deny_network(event, _args):
        if event in {"socket.connect", "socket.bind", "socket.getaddrinfo"}:
            raise PermissionError("TRAINING_PROCESS_NETWORK_FORBIDDEN")

    sys.addaudithook(deny_network)
    import torch
    from transformers import GPT2Config, GPT2LMHeadModel
    from safetensors.torch import load, save
    torch.set_num_threads(2)
    torch.use_deterministic_algorithms(True)
    return torch, GPT2Config, GPT2LMHeadModel, load, save


def training_device(torch, requested):
    if requested not in {"cpu", "cuda"}:
        raise ValueError("DEVICE_MUST_BE_CPU_OR_CUDA")
    if requested == "cuda":
        if not torch.cuda.is_available():
            raise ValueError("CUDA_REQUIRED_NO_CPU_FALLBACK")
        free, _ = torch.cuda.mem_get_info(0)
        if free < 512 * 1024 * 1024:
            raise ValueError("CUDA_FREE_MEMORY_BUDGET_UNAVAILABLE")
        torch.cuda.set_per_process_memory_fraction(0.25, 0)
        torch.backends.cuda.matmul.allow_tf32 = False
        torch.backends.cudnn.allow_tf32 = False
        torch.cuda.reset_peak_memory_stats(0)
    return torch.device("cuda:0" if requested == "cuda" else "cpu")


def batch(rows, torch, device="cpu"):
    sequences = [list((r["prompt"] + r["answer"] + "\n").encode()) + [EOS] for r in rows]
    width = max(map(len, sequences))
    if width > MODEL_CONFIG["n_positions"]:
        raise ValueError("RECORD_TOO_LONG_NO_SILENT_TRUNCATION")
    ids = torch.tensor([s + [PAD] * (width - len(s)) for s in sequences], device=device)
    mask = ids.ne(PAD)
    labels = ids.clone().masked_fill(~mask, -100)
    return {"input_ids": ids, "attention_mask": mask, "labels": labels}, sum(len(s) - 1 for s in sequences)


def evaluate(model, rows, torch):
    model.eval()
    total, count = 0.0, 0
    with torch.no_grad():
        for offset in range(0, len(rows), 16):
            inputs, tokens = batch(rows[offset:offset + 16], torch, next(model.parameters()).device)
            loss = float(model(**inputs).loss)
            if not math.isfinite(loss):
                raise ValueError("NONFINITE_EVALUATION")
            total += loss * tokens
            count += tokens
    return {"crossEntropyPerByteToken": total / count, "targetTokens": count,
            "records": len(rows)}


def exact_answers(model, rows, torch, count=32):
    correct = 0
    model.eval()
    with torch.no_grad():
        for row in rows[:count]:
            ids = list(row["prompt"].encode())
            generated = []
            for _ in range(8):
                next_id = int(model(input_ids=torch.tensor([ids], device=next(model.parameters()).device)).logits[0, -1].argmax())
                if next_id in (EOS, PAD, 10):
                    break
                generated.append(next_id)
                ids.append(next_id)
            answer = bytes(generated).decode("utf-8", errors="replace").strip()
            correct += answer == row["answer"]
    return {"correct": correct, "total": min(count, len(rows)),
            "method": "GREEDY_MAX_8_BYTES_FIRST_LOCKED_TEST_RECORDS"}


def weights_bytes(model, save):
    return save({key: value.detach().cpu().contiguous().clone()
                 for key, value in model.state_dict().items()})


def save_checkpoint(directory, model, optimizer, metadata, save, torch):
    directory.mkdir(mode=0o700)
    tensors, states = {}, {}
    state = optimizer.state_dict()
    for param, fields in state["state"].items():
        states[str(param)] = {}
        for key, value in fields.items():
            if not isinstance(value, torch.Tensor):
                raise ValueError("UNSUPPORTED_OPTIMIZER_STATE")
            name = f"{param}.{key}"
            tensors[name] = value.detach().cpu().contiguous()
            states[str(param)][key] = name
    files = {
        "model.safetensors": weights_bytes(model, save),
        "optimizer.safetensors": save(tensors),
        "optimizer.json": json_bytes({"state": states, "param_groups": state["param_groups"]}),
        "config.json": json_bytes(metadata["modelConfig"]),
        "tokenizer.json": json_bytes(TOKENIZER),
    }
    for name, data in files.items():
        write_new(directory / name, data)
    # Written last: incomplete checkpoints never become resumable.
    write_new(directory / "checkpoint.json", json_bytes({
        **metadata, "files": {name: digest(data) for name, data in files.items()}}))
    fd = os.open(directory, os.O_RDONLY | os.O_DIRECTORY)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def read_checkpoint(directory, expected):
    directory = private_path(directory, existing=True)
    meta = json.loads(read_private(directory / "checkpoint.json"))
    names = {"model.safetensors", "optimizer.safetensors", "optimizer.json", "config.json", "tokenizer.json"}
    if set(meta.get("files", {})) != names:
        raise ValueError("CHECKPOINT_FILE_SET_INVALID")
    files = {}
    for name in names:
        data = read_private(directory / name)
        if digest(data) != meta["files"][name]:
            raise ValueError("CHECKPOINT_HASH_MISMATCH")
        files[name] = data
    for key in ("schemaVersion", "sourceSha256", "versions", "seed", "initialWeightsSha256", "dataset", "profile", "modelConfig", "device"):
        if meta.get(key) != expected[key]:
            raise ValueError("CHECKPOINT_PROVENANCE_OR_ENVIRONMENT_MISMATCH")
    if (json.loads(files["config.json"]) != expected["modelConfig"]
            or json.loads(files["tokenizer.json"]) != TOKENIZER):
        raise ValueError("CHECKPOINT_CONFIG_MISMATCH")
    for key in ("stepsCompleted", "trainingTargetTokensSeen"):
        if type(meta.get(key)) is not int or meta[key] < 0:
            raise ValueError("CHECKPOINT_COUNTER_INVALID")
    return meta, files


def restore_checkpoint(files, model, optimizer, load):
    model.load_state_dict(load(files["model.safetensors"]), strict=True)
    metadata = json.loads(files["optimizer.json"])
    tensors = load(files["optimizer.safetensors"])
    optimizer.load_state_dict({
        "param_groups": metadata["param_groups"],
        "state": {int(param): {key: tensors[name] for key, name in fields.items()}
                  for param, fields in metadata["state"].items()},
    })
    group = optimizer.param_groups[0]
    if group["lr"] != OPTIMIZER_CONFIG["lr"] or group["weight_decay"] != OPTIMIZER_CONFIG["weight_decay"]:
        raise ValueError("OPTIMIZER_CONFIG_MISMATCH")


def run_training(output, steps=200, max_seconds=180, resume=None, verify=None, profile="seed", device="cpu"):
    if device not in {"cpu", "cuda"}:
        raise ValueError("DEVICE_MUST_BE_CPU_OR_CUDA")
    if profile not in PROFILES:
        raise ValueError("UNKNOWN_BOUNDED_PROFILE")
    model_config = {**MODEL_CONFIG, **PROFILES[profile]}
    if type(steps) is not int or not 1 <= steps <= 1000:
        raise ValueError("STEPS_MUST_BE_1_TO_1000")
    if type(max_seconds) is not int or not 1 <= max_seconds <= 300:
        raise ValueError("TRAINING_BUDGET_MUST_BE_1_TO_300_SECONDS")
    os.umask(0o077)
    if not verify:
        output = private_path(output)
        ancestor = output.parent
        while not ancestor.exists():
            ancestor = ancestor.parent
        required_bytes = max(256, (steps // 50 + 3) * 32) * 1024 * 1024
        if shutil.disk_usage(ancestor).free < required_bytes:
            raise ValueError("CHECKPOINT_DISK_BUDGET_UNAVAILABLE")
    torch, config_class, model_class, load, save = offline_libraries()
    device = training_device(torch, device)
    torch.manual_seed(SEED)
    model = model_class(config_class(**model_config)).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), **OPTIMIZER_CONFIG)
    corpus = make_corpus()
    metadata = {
        "schemaVersion": "1.0.0", "sourceSha256": digest(Path(__file__).read_bytes()),
        "profile": profile, "modelConfig": model_config,
        "device": str(device),
        "versions": {name: importlib.metadata.version(name) for name in ("torch", "transformers", "safetensors")},
        "seed": SEED, "dataset": corpus_manifest(corpus),
        "initialWeightsSha256": digest(weights_bytes(model, save)),
        "stepsCompleted": 0, "trainingTargetTokensSeen": 0,
    }
    origin = None
    if resume or verify:
        origin = str(resume or verify)
        previous, files = read_checkpoint(origin, metadata)
        restore_checkpoint(files, model, optimizer, load)
        metadata.update({k: previous[k] for k in ("stepsCompleted", "trainingTargetTokensSeen")})
        if verify:
            validation = evaluate(model, corpus["validation"], torch)
            return {"status": "LOCAL_CHECKPOINT_INTEGRITY_AND_RELOAD_VERIFIED",
                    "device": str(device),
                    "stepsCompleted": metadata["stepsCompleted"], "validation": validation,
                    "parameters": sum(p.numel() for p in model.parameters()),
                    "weightsSha256": digest(files["model.safetensors"]),
                    "thirdPartyAttestation": False, "commercialProductionApproved": False}
    output.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    output.mkdir(mode=0o700)
    write_new(output / "trainer-source.py", Path(__file__).read_bytes())
    for name, rows in corpus.items():
        write_new(output / f"{name}.json", json_bytes(rows))
    write_new(output / "dataset-manifest.json", json_bytes(metadata["dataset"]))
    start = time.monotonic()
    before = evaluate(model, corpus["validation"], torch)
    start_step = metadata["stepsCompleted"]
    status = "TRAINING_COMPLETE_ENGINEERING_PROOF_ONLY"
    checkpoints = []
    cuda_steps, cuda_milliseconds = 0, 0.0

    def checkpoint():
        path = output / f"checkpoint-{metadata['stepsCompleted']:06d}"
        if not path.exists():
            save_checkpoint(path, model, optimizer, metadata, save, torch)
            checkpoints.append(path.name)
        return path

    checkpoint()
    try:
        for step in range(start_step, start_step + steps):
            if time.monotonic() - start >= max_seconds:
                status = "BUDGET_STOPPED_CHECKPOINT_SAVED"
                break
            model.train()
            rows = random.Random(SEED + step).sample(corpus["train"], 8)
            inputs, tokens = batch(rows, torch, device)
            optimizer.zero_grad(set_to_none=True)
            if device.type == "cuda":
                started, ended = torch.cuda.Event(enable_timing=True), torch.cuda.Event(enable_timing=True)
                started.record()
            loss = model(**inputs).loss
            if not bool(torch.isfinite(loss)):
                raise ValueError("NONFINITE_TRAINING_LOSS")
            loss.backward()
            if device.type == "cuda" and (not loss.is_cuda or any(
                    not p.is_cuda or p.grad is None or not p.grad.is_cuda for p in model.parameters())):
                raise ValueError("CUDA_MODEL_LOSS_AND_GRADIENT_BINDING_FAILED")
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0, error_if_nonfinite=True)
            optimizer.step()
            if device.type == "cuda":
                ended.record()
                torch.cuda.synchronize(device)
                cuda_milliseconds += started.elapsed_time(ended)
                cuda_steps += 1
            metadata["stepsCompleted"] = step + 1
            metadata["trainingTargetTokensSeen"] += tokens
            if (step + 1) % 50 == 0:
                checkpoint()
                print(json.dumps({"step": step + 1, "loss": float(loss.detach())}), flush=True)
    except KeyboardInterrupt:
        status = "INTERRUPTED_CHECKPOINT_SAVED"
        # An interrupted optimizer step may be partial; discard it, not certify it.
        previous, files = read_checkpoint(output / checkpoints[-1], metadata)
        restore_checkpoint(files, model, optimizer, load)
        metadata.update({k: previous[k] for k in ("stepsCompleted", "trainingTargetTokensSeen")})
    final_checkpoint = checkpoint()
    train_seconds = time.monotonic() - start
    after = evaluate(model, corpus["validation"], torch)
    test = evaluate(model, corpus["test"], torch)
    answers = exact_answers(model, corpus["test"], torch)
    probe, _ = batch(corpus["test"][:2], torch, device)
    with torch.no_grad():
        expected_logits = model(**probe).logits.clone()
    checked, files = read_checkpoint(final_checkpoint, metadata)
    reloaded = model_class(config_class(**model_config)).to(device).eval()
    reloaded_optimizer = torch.optim.AdamW(reloaded.parameters(), **OPTIMIZER_CONFIG)
    restore_checkpoint(files, reloaded, reloaded_optimizer, load)
    with torch.no_grad():
        reloaded_logits = reloaded(**probe).logits
    if not torch.equal(expected_logits, reloaded_logits):
        raise ValueError("RELOADED_LOGITS_MISMATCH")
    changed = digest(files["model.safetensors"]) != metadata["initialWeightsSha256"]
    report = {
        "system": "SHEIKHA_FOUNDATION_FROM_SCRATCH_LOCAL_V1", "status": status,
        "modelId": f"Sheikha-Foundation-{profile.title()}-v1", "initialization": "RANDOM",
        "profile": profile,
        "parameters": sum(p.numel() for p in model.parameters()),
        "device": str(device), "threads": 2, "pretrainedWeightsLoaded": False,
        "gpuExecution": {"requested": device.type == "cuda", "optimizerStepsVerified": cuda_steps,
                         "cudaEventMilliseconds": cuda_milliseconds,
                         "modelLossAndGradientsOnCudaVerified": cuda_steps > 0,
                         "deviceName": torch.cuda.get_device_name(device) if device.type == "cuda" else None,
                         "peakAllocatedBytes": torch.cuda.max_memory_allocated(device) if device.type == "cuda" else 0,
                         "torchCudaVersion": torch.version.cuda, "thirdPartyAttestation": False},
        "resumedFrom": origin, "stepsThisRun": metadata["stepsCompleted"] - start_step,
        "stepsCompleted": metadata["stepsCompleted"], "stepsRequestedThisRun": steps,
        "trainingTargetTokensSeen": metadata["trainingTargetTokensSeen"],
        "trainingLoopAndInitialEvaluationSeconds": train_seconds,
        "totalRunSeconds": time.monotonic() - start,
        "budget": {"maxTrainingSeconds": max_seconds, "externalSpendAuthorizedUsd": 0,
                   "localElectricityCostMeasured": False, "finalEvaluationOutsideTrainingBudget": True},
        "validationBefore": before, "validationAfter": after,
        "test": test, "testExactAnswers": answers,
        "validationLossImproved": after["crossEntropyPerByteToken"] < before["crossEntropyPerByteToken"],
        "weightsChangedFromRandomInitialization": changed,
        "checkpointReloadLogitsExactlyEqual": True,
        "checkpoint": final_checkpoint.name, "checkpointSha256": digest(read_private(final_checkpoint / "checkpoint.json")),
        "weightsSha256": checked["files"]["model.safetensors"],
        "provenance": metadata,
        "ownership": {"requestedOwner": "SHEIKHA", "externalBaseWeightsUsed": False,
                      "thirdPartySoftwareUsed": True, "exclusiveArchitectureOwnershipClaimed": False,
                      "legalTitleCertified": False, "automaticCustomerWeightAssignment": False},
        "release": {"largeLlmTrainingComplete": False, "commercialProductionApproved": False,
                    "nonCommercialPublicReleaseApproved": False, "servingModelReplaced": False,
                    "humanEvaluationAndReleaseApprovalRequired": True},
    }
    write_new(output / "run-report.json", json_bytes(report))
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out")
    parser.add_argument("--steps", type=int, default=200)
    parser.add_argument("--profile", choices=sorted(PROFILES), default="seed")
    parser.add_argument("--device", choices=["cpu", "cuda"], default="cpu")
    parser.add_argument("--max-seconds", type=int, default=180)
    parser.add_argument("--resume", help="Existing private checkpoint directory; never overwrites it")
    parser.add_argument("--verify", help="Read-only checkpoint integrity and inference verification")
    parser.add_argument("--execute", action="store_true")
    args = parser.parse_args()
    if args.verify and (args.resume or args.execute or args.out):
        parser.error("VERIFY_CANNOT_EXECUTE_OR_RESUME_TRAINING")
    if not args.verify and not (args.execute and args.out):
        parser.error("EXPLICIT_EXECUTE_AND_NEW_PRIVATE_OUTPUT_REQUIRED")
    try:
        result = run_training(args.out, args.steps, args.max_seconds, args.resume, args.verify, args.profile, args.device)
        print(json.dumps({key: result[key] for key in (
            "status", "device", "gpuExecution", "parameters", "stepsCompleted", "validationBefore", "validationAfter",
            "testExactAnswers", "checkpoint", "weightsSha256", "totalRunSeconds", "validation"
        ) if key in result}, sort_keys=True))
        return 0 if result["status"] in {"TRAINING_COMPLETE_ENGINEERING_PROOF_ONLY",
                                            "LOCAL_CHECKPOINT_INTEGRITY_AND_RELOAD_VERIFIED"} else 2
    except (ValueError, OSError) as error:
        print(json.dumps({"status": "FAILED_NOT_RELEASED", "error": str(error)}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
