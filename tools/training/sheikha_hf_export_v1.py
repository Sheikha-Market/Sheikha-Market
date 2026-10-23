#!/usr/bin/env python3
"""Offline interoperability export for the three bounded Sheikha scratch profiles."""

import argparse
import importlib.util
import json
import os
from pathlib import Path
import sys
import time

SPEC = importlib.util.spec_from_file_location(
    "sheikha_scratch_export_source", Path(__file__).with_name("train-sheikha-foundation-scratch-v1.py"))
scratch = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(scratch)


def tokenizer():
    from tokenizers import Tokenizer, models, pre_tokenizers, decoders, processors
    from transformers import PreTrainedTokenizerFast
    from transformers.convert_slow_tokenizer import bytes_to_unicode

    vocab = {character: byte for byte, character in bytes_to_unicode().items()}
    vocab.update({"<pad>": scratch.PAD, "<eos>": scratch.EOS})
    backend = Tokenizer(models.BPE(vocab=vocab, merges=[]))
    backend.pre_tokenizer = pre_tokenizers.ByteLevel(add_prefix_space=False, use_regex=False)
    backend.decoder = decoders.ByteLevel()
    backend.post_processor = processors.TemplateProcessing(
        single="$A <eos>", special_tokens=[("<eos>", scratch.EOS)])
    # Literal special-token spellings in input must remain ordinary UTF-8 bytes.
    return PreTrainedTokenizerFast(
        tokenizer_object=backend, pad_token="<pad>", eos_token="<eos>", bos_token="<eos>",
        model_max_length=96, clean_up_tokenization_spaces=False, split_special_tokens=True)


def verify_tokenizer(value, corpus):
    probes = ["", "<eos>", "<pad>", "\x00\t\r\n", "  repeated  spaces  ",
              "\u0628\u0650\u0633\u0652\u0645\u0650", "\u00e9 e\u0301", "\U0001f30d", "\u202eRTL\u202c"]
    probes += [r["prompt"] + r["answer"] + "\n" for rows in corpus.values() for r in rows]
    for text in probes:
        raw = list(text.encode("utf-8"))
        if (value.encode(text, add_special_tokens=False) != raw
                or value.encode(text) != raw + [scratch.EOS]
                or value.decode(raw, clean_up_tokenization_spaces=False) != text):
            raise ValueError("BYTE_TOKENIZER_PARITY_FAILED")
    return len(probes)


def export_checkpoint(checkpoint, output, profile):
    os.umask(0o077)
    destination = scratch.private_path(output)
    source = scratch.private_path(checkpoint, existing=True)
    # This reconstructs provenance from the unchanged trainer and verifies real inference.
    verified = scratch.run_training(None, verify=source, profile=profile)
    weights = scratch.read_private(source / "model.safetensors")
    if scratch.digest(weights) != verified["weightsSha256"]:
        raise ValueError("SOURCE_CHANGED_AFTER_VERIFICATION")
    torch, config_class, model_class, load, _save = scratch.offline_libraries()
    config = config_class(**{**scratch.MODEL_CONFIG, **scratch.PROFILES[profile]})
    config.architectures = ["GPT2LMHeadModel"]
    original = model_class(config).eval()
    original.load_state_dict(load(weights), strict=True)
    corpus = scratch.make_corpus()
    original_tokenizer = tokenizer()
    checked_texts = verify_tokenizer(original_tokenizer, corpus)

    destination.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    destination.mkdir(mode=0o700)
    scratch.write_new(destination / "config.json", config.to_json_string().encode())
    scratch.write_new(destination / "model.safetensors", weights)
    original_tokenizer.save_pretrained(str(destination))
    from transformers import AutoModelForCausalLM, AutoTokenizer
    reloaded_tokenizer = AutoTokenizer.from_pretrained(
        str(destination), local_files_only=True, trust_remote_code=False)
    checked_texts += verify_tokenizer(reloaded_tokenizer, corpus)
    reloaded = AutoModelForCausalLM.from_pretrained(
        str(destination), local_files_only=True, trust_remote_code=False,
        use_safetensors=True, attn_implementation="eager").eval()
    for key, tensor in original.state_dict().items():
        if not torch.equal(tensor, reloaded.state_dict()[key]):
            raise ValueError("EXPORTED_WEIGHT_VALUE_CHANGED")
    probe, _count = scratch.batch(corpus["test"][:16], torch)
    with torch.no_grad():
        if not torch.equal(original(**probe).logits, reloaded(**probe).logits):
            raise ValueError("AUTOMODEL_LOGITS_PARITY_FAILED")
    validation = scratch.evaluate(reloaded, corpus["validation"], torch)
    if validation != verified["validation"]:
        raise ValueError("AUTOMODEL_VALIDATION_CHANGED")

    data_dir = destination / "dataset"
    data_dir.mkdir(mode=0o700)
    dataset_files = {}
    for split, rows in corpus.items():
        payload = b"".join((json.dumps(row, ensure_ascii=True) + "\n").encode() for row in rows)
        name = f"{split}.jsonl"
        scratch.write_new(data_dir / name, payload)
        dataset_files[split] = {"file": name, "records": len(rows), "sha256": scratch.digest(payload)}
    scratch.write_new(data_dir / "README.md", (
        "# Local arithmetic dataset\n\nDeterministic synthetic addition only. "
        "No customer data or teacher model outputs. Splits are by problem, not template.\n"
        "Fields: problemId, prompt, answer. Shared templates do not measure general intelligence.\n"
        "Local interoperability copy only; no permission to publish or reuse customer data.\n"
    ).encode())
    scratch.write_new(destination / "RIGHTS.md", (
        "# Rights review pending\n\nRequested owner of newly trained weights: SHEIKHA. "
        "No external base weights were used. Third-party architecture and software retain their licenses.\n"
        "This file is NOT a transfer, legal certificate, public license grant or sale authorization.\n"
        "No upload, customer-data use, redistribution or commercial release is authorized by this export.\n"
    ).encode())
    scratch.write_new(destination / "README.md", (
        "---\nlibrary_name: transformers\npipeline_tag: text-generation\nlicense: other\n"
        "license_name: pending-owner-review\nlicense_link: RIGHTS.md\n"
        "tags:\n- engineering-proof\n- from-scratch\n---\n"
        f"# Sheikha Foundation {profile.title()}\n\n"
        f"Parameters: {verified['parameters']}. Training steps: {verified['stepsCompleted']}.\n"
        "Random-initialized GPT-2 architecture, trained only on bounded synthetic addition. "
        "Not a large LLM, production model, benchmark leader or conversational assistant.\n\n"
        "## Local loading\n\n"
        "```python\nfrom transformers import AutoModelForCausalLM, AutoTokenizer\n"
        "# Set LOCAL_EXPORT to this private directory. Keep network disabled.\n"
        "tokenizer = AutoTokenizer.from_pretrained(LOCAL_EXPORT, local_files_only=True, trust_remote_code=False)\n"
        "model = AutoModelForCausalLM.from_pretrained(LOCAL_EXPORT, local_files_only=True,\n"
        "    trust_remote_code=False, use_safetensors=True, attn_implementation='eager')\n"
        "inputs = tokenizer('add 1 2 = ', add_special_tokens=False, return_tensors='pt')\n"
        "```\n\nContext: 96 BYTE tokens, not 96 words. Literal <eos>/<pad> spellings remain text. "
        "Default encoding adds EOS; generation prompts must use add_special_tokens=False. "
        "Output correctness is not guaranteed. Original checkpoint remains the resume source; "
        "optimizer state is deliberately excluded here.\n"
    ).encode())
    files = {}
    for file in sorted(destination.rglob("*")):
        if file.is_dir():
            scratch.private_path(file, existing=True)
        else:
            files[str(file.relative_to(destination))] = scratch.digest(scratch.read_private(file))
    manifest = {
        "schemaVersion": "1.0.0", "system": "SHEIKHA_HF_LOCAL_EXPORT_V1",
        "status": "LOCAL_AUTOMODEL_AND_TOKENIZER_PARITY_VERIFIED", "profile": profile,
        "parameters": verified["parameters"], "stepsCompleted": verified["stepsCompleted"],
        "sourceWeightsSha256": verified["weightsSha256"],
        "exportWeightsSha256": files["model.safetensors"], "files": files,
        "tokenizerParityTextsChecked": checked_texts, "tensorValuesExactlyEqual": True,
        "logitsExactlyEqual": True, "validation": validation, "dataset": dataset_files,
        "networkUsed": False, "uploaded": False, "externalSpendUsd": 0,
        "largeLlmComplete": False, "commercialReleaseApproved": False,
        "legalTitleCertified": False, "releaseGate": "RELEASE_DENY",
    }
    # Completion record is last; failed/incomplete exports must never be published.
    scratch.write_new(destination / "export-manifest.json", scratch.json_bytes(manifest))
    return manifest


def infer_local(model_dir, prompt, max_new_tokens=16):
    if (type(max_new_tokens) is not int or not 1 <= max_new_tokens <= 32
            or not isinstance(prompt, str) or not prompt
            or len(prompt.encode()) + max_new_tokens > 96):
        raise ValueError("BOUNDED_PROMPT_AND_GENERATION_REQUIRED")
    source = scratch.private_path(model_dir, existing=True)
    manifest = json.loads(scratch.read_private(source / "export-manifest.json"))
    expected_files = {"config.json", "model.safetensors", "tokenizer.json", "tokenizer_config.json",
                      "README.md", "RIGHTS.md", "dataset/README.md", "dataset/train.jsonl",
                      "dataset/validation.jsonl", "dataset/test.jsonl"}
    if (manifest.get("system") != "SHEIKHA_HF_LOCAL_EXPORT_V1"
            or manifest.get("profile") not in scratch.PROFILES
            or set(manifest.get("files", {})) != expected_files):
        raise ValueError("BOUNDED_EXPORT_MANIFEST_REQUIRED")
    files = {}
    for name in expected_files:
        scratch.private_path((source / name).parent, existing=True)
        files[name] = scratch.read_private(source / name)
        if scratch.digest(files[name]) != manifest["files"][name]:
            raise ValueError("EXPORT_FILE_INTEGRITY_MISMATCH")
    if (manifest.get("sourceWeightsSha256") != scratch.digest(files["model.safetensors"])
            or manifest.get("exportWeightsSha256") != manifest.get("sourceWeightsSha256")):
        raise ValueError("EXPORT_WEIGHT_BINDING_MISMATCH")
    torch, config_class, model_class, load, _save = scratch.offline_libraries()
    # Construct only our bounded architecture, never execute architecture/config from a repository.
    config = config_class(**{**scratch.MODEL_CONFIG, **scratch.PROFILES[manifest["profile"]]})
    model = model_class(config).eval()
    model.load_state_dict(load(files["model.safetensors"]), strict=True)
    ids, generated = list(prompt.encode()), []
    started = time.monotonic()
    stop = "TOKEN_LIMIT"
    with torch.no_grad():
        for _ in range(max_new_tokens):
            value = int(model(input_ids=torch.tensor([ids])).logits[0, -1].argmax())
            if value in (scratch.PAD, scratch.EOS, 10):
                stop = "EOS_PAD_OR_NEWLINE"
                break
            generated.append(value)
            ids.append(value)
    return {"system": "SHEIKHA_HF_LOCAL_INFERENCE_V1", "status": "LOCAL_INFERENCE_EXECUTED",
            "profile": manifest["profile"], "prompt": prompt,
            "completion": bytes(generated).decode("utf-8", errors="replace"),
            "generatedByteTokens": len(generated), "seconds": time.monotonic() - started,
            "stopReason": stop, "weightsSha256": manifest["sourceWeightsSha256"],
            "networkUsed": False, "customerDataUploaded": False, "outputCorrectnessGuaranteed": False,
            "integrityCheckIsNotCryptographicAttestation": True,
            "commercialProductionApproved": False, "largeLlmComplete": False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--checkpoint")
    parser.add_argument("--out", required=True)
    parser.add_argument("--profile", choices=sorted(scratch.PROFILES))
    parser.add_argument("--model", help="Local HF export for bounded private CPU inference")
    parser.add_argument("--prompt-file", help="Private JSON file with a single prompt field")
    parser.add_argument("--max-new-tokens", type=int, default=16)
    args = parser.parse_args()
    if args.model:
        if not args.prompt_file or args.checkpoint or args.profile:
            parser.error("INFERENCE_REQUIRES_MODEL_AND_PROMPT_FILE_ONLY")
    elif not args.checkpoint or not args.profile or args.prompt_file:
        parser.error("EXPORT_REQUIRES_CHECKPOINT_AND_PROFILE")
    try:
        if args.model:
            source = Path(os.path.abspath(args.prompt_file))
            destination = Path(os.path.abspath(args.out))
            scratch.private_path(source.parent, existing=True)
            scratch.private_path(destination.parent, existing=True)
            if destination.exists():
                raise ValueError("OUTPUT_ALREADY_EXISTS")
            data = json.loads(scratch.read_private(source))
            if not isinstance(data, dict) or set(data) != {"prompt"}:
                raise ValueError("PRIVATE_PROMPT_OBJECT_REQUIRED")
            result = infer_local(args.model, data["prompt"], args.max_new_tokens)
            scratch.write_new(destination, scratch.json_bytes(result))
            print(json.dumps({"status": result["status"], "profile": result["profile"],
                              "outputSha256": scratch.digest(scratch.json_bytes(result)),
                              "promptAndCompletionPrinted": False, "commercialProductionApproved": False}))
            return 0
        result = export_checkpoint(args.checkpoint, args.out, args.profile)
        print(json.dumps({k: result[k] for k in (
            "status", "profile", "parameters", "sourceWeightsSha256", "logitsExactlyEqual", "releaseGate")}))
        return 0
    except (ValueError, OSError, RuntimeError) as error:
        print(json.dumps({"status": "EXPORT_FAILED_NOT_RELEASED", "errorType": type(error).__name__}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
