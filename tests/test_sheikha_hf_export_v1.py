import importlib.util
import json
from pathlib import Path
import shutil
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("hf_export", ROOT / "tools/training/sheikha_hf_export_v1.py")
export = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(export)


class HfExportTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.directory = Path(tempfile.mkdtemp(prefix="sheikha-hf-export-test-"))
        cls.old_private = export.scratch.PRIVATE
        export.scratch.PRIVATE = cls.directory
        cls.training = export.scratch.run_training(cls.directory / "source", profile="micro", steps=2)
        cls.checkpoint = cls.directory / "source" / cls.training["checkpoint"]

    @classmethod
    def tearDownClass(cls):
        export.scratch.PRIVATE = cls.old_private
        shutil.rmtree(cls.directory)

    def test_real_export_reload_preserves_weights_logits_and_utf8(self):
        destination = self.directory / "hf-model"
        result = export.export_checkpoint(self.checkpoint, destination, "micro")
        self.assertEqual(result["sourceWeightsSha256"], self.training["weightsSha256"])
        self.assertEqual(result["exportWeightsSha256"], self.training["weightsSha256"])
        self.assertEqual(result["validation"], self.training["validationAfter"])
        self.assertTrue(result["logitsExactlyEqual"])
        self.assertTrue(result["tensorValuesExactlyEqual"])
        self.assertGreater(result["tokenizerParityTextsChecked"], 7000)
        self.assertFalse(result["networkUsed"])
        self.assertFalse(result["commercialReleaseApproved"])
        self.assertEqual(result["releaseGate"], "RELEASE_DENY")
        self.assertFalse((destination / "optimizer.safetensors").exists())
        for file in destination.rglob("*"):
            self.assertEqual(file.stat().st_mode & 0o777, 0o700 if file.is_dir() else 0o600)
        self.assertEqual(json.loads((destination / "config.json").read_text())["model_type"], "gpt2")
        for filename, expected in result["files"].items():
            self.assertEqual(export.scratch.digest((destination / filename).read_bytes()), expected)
        with self.assertRaisesRegex(ValueError, "ALREADY_EXISTS"):
            export.export_checkpoint(self.checkpoint, destination, "micro")

    def test_jsonl_is_loadable_by_hf_datasets_without_download(self):
        from datasets import load_dataset
        destination = self.directory / "dataset-copy"
        result = export.export_checkpoint(self.checkpoint, destination, "micro")
        loaded = load_dataset("json", data_files={name: str(destination / "dataset" / info["file"])
                              for name, info in result["dataset"].items()},
                              cache_dir=str(self.directory / "dataset-cache"))
        for split, rows in export.scratch.make_corpus().items():
            self.assertEqual(len(loaded[split]), len(rows))
            self.assertEqual(loaded[split][0], rows[0])

    def test_corrupt_checkpoint_has_no_success_record(self):
        copy = self.directory / "corrupt"
        shutil.copytree(self.checkpoint, copy)
        with (copy / "model.safetensors").open("ab") as stream:
            stream.write(b"bad")
        destination = self.directory / "bad-export"
        with self.assertRaisesRegex(ValueError, "HASH_MISMATCH"):
            export.export_checkpoint(copy, destination, "micro")
        self.assertFalse(destination.exists())

    def test_wrong_profile_and_public_output_are_denied(self):
        with self.assertRaisesRegex(ValueError, "PROVENANCE"):
            export.export_checkpoint(self.checkpoint, self.directory / "wrong", "mini")
        with self.assertRaisesRegex(ValueError, "PRIVATE_REPORT"):
            export.export_checkpoint(self.checkpoint, ROOT / "public/model-export", "micro")

    def test_local_inference_executes_without_egress_or_production_claim(self):
        destination = self.directory / "inference-model"
        export.export_checkpoint(self.checkpoint, destination, "micro")
        result = export.infer_local(destination, "add 1 2 = ", 8)
        self.assertEqual(result["status"], "LOCAL_INFERENCE_EXECUTED")
        self.assertLessEqual(result["generatedByteTokens"], 8)
        self.assertEqual(result["weightsSha256"], self.training["weightsSha256"])
        self.assertFalse(result["customerDataUploaded"])
        self.assertFalse(result["commercialProductionApproved"])
        self.assertFalse(result["outputCorrectnessGuaranteed"])

    def test_inference_bounds_are_enforced_before_loading(self):
        for prompt, count in [("x" * 90, 16), ("", 1), ("x", 33), ("x", True), ([], 1)]:
            with self.assertRaisesRegex(ValueError, "BOUNDED_PROMPT"):
                export.infer_local(self.directory / "not-present", prompt, count)

    def test_inference_rejects_path_escape_in_manifest(self):
        destination = self.directory / "escape-model"
        export.export_checkpoint(self.checkpoint, destination, "micro")
        path = destination / "export-manifest.json"
        manifest = json.loads(path.read_text())
        manifest["files"]["../secret"] = "a" * 64
        path.write_text(json.dumps(manifest))
        with self.assertRaisesRegex(ValueError, "MANIFEST_REQUIRED"):
            export.infer_local(destination, "x", 1)

    def test_inference_rejects_modified_tokenizer_without_completion(self):
        destination = self.directory / "tampered-tokenizer"
        export.export_checkpoint(self.checkpoint, destination, "micro")
        with (destination / "tokenizer.json").open("ab") as stream:
            stream.write(b"tampered")
        with self.assertRaisesRegex(ValueError, "INTEGRITY_MISMATCH"):
            export.infer_local(destination, "x", 1)


if __name__ == "__main__":
    unittest.main()
