import importlib.util
from contextlib import redirect_stdout
import io
import json
import os
from pathlib import Path
import shutil
import tempfile
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "scratch", ROOT / "tools/training/train-sheikha-foundation-scratch-v1.py")
scratch = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(scratch)


class FoundationScratchTests(unittest.TestCase):
    def test_cuda_request_never_falls_back_to_cpu(self):
        import torch
        with patch.object(torch.cuda, "is_available", return_value=False):
            with self.assertRaisesRegex(ValueError, "NO_CPU_FALLBACK"):
                scratch.training_device(torch, "cuda")
        with self.assertRaisesRegex(ValueError, "DEVICE_MUST"):
            scratch.run_training(self.directory / "bad-device", device="external")

    @unittest.skipUnless(os.environ.get("SHEIKHA_TEST_CUDA") == "1", "Explicit local GPU test only")
    def test_cuda_training_updates_weights_and_reloads(self):
        report = scratch.run_training(self.directory / "gpu", steps=3, profile="micro", device="cuda")
        self.assertEqual(report["device"], "cuda:0")
        self.assertEqual(report["gpuExecution"]["optimizerStepsVerified"], 3)
        self.assertGreater(report["gpuExecution"]["cudaEventMilliseconds"], 0)
        self.assertGreater(report["gpuExecution"]["peakAllocatedBytes"], 0)
        self.assertTrue(report["weightsChangedFromRandomInitialization"])
        self.assertTrue(report["checkpointReloadLogitsExactlyEqual"])
        verified = scratch.run_training(None, profile="micro", device="cuda", verify=self.directory / "gpu" / report["checkpoint"])
        self.assertEqual(verified["weightsSha256"], report["weightsSha256"])
        self.assertEqual(verified["validation"], report["validationAfter"])
    @classmethod
    def setUpClass(cls):
        cls.directory = Path(tempfile.mkdtemp(prefix="sheikha-scratch-tests-"))
        cls.old_private = scratch.PRIVATE
        scratch.PRIVATE = cls.directory

    @classmethod
    def tearDownClass(cls):
        scratch.PRIVATE = cls.old_private
        shutil.rmtree(cls.directory)

    def test_problem_and_record_splits_do_not_overlap(self):
        corpus = scratch.make_corpus()
        identities = [set(r["problemId"] for r in rows) for rows in corpus.values()]
        self.assertFalse(identities[0] & identities[1])
        self.assertFalse(identities[0] & identities[2])
        self.assertFalse(identities[1] & identities[2])
        for rows in corpus.values():
            for row in rows:
                a, b = map(int, row["problemId"].split(":"))
                self.assertEqual(str(a + b), row["answer"])
        self.assertEqual(scratch.corpus_manifest(corpus), scratch.corpus_manifest(scratch.make_corpus()))

    def test_outputs_cannot_be_public_or_overwrite(self):
        with self.assertRaisesRegex(ValueError, "PRIVATE_REPORT"):
            scratch.private_path(ROOT / "public/model")
        existing = self.directory / "existing"
        existing.mkdir(mode=0o700)
        with self.assertRaisesRegex(ValueError, "ALREADY_EXISTS"):
            scratch.private_path(existing)

    def test_symlink_and_insecure_directory_rejected(self):
        link = self.directory / "linked"
        link.symlink_to(self.directory)
        with self.assertRaisesRegex(ValueError, "SYMLINK"):
            scratch.private_path(link / "output")
        insecure = self.directory / "insecure"
        insecure.mkdir(mode=0o700)
        insecure.chmod(0o755)
        with self.assertRaisesRegex(ValueError, "MODE_700"):
            scratch.private_path(insecure / "output")

    def test_exclusive_writes_and_hardlink_rejection(self):
        path = self.directory / "exclusive.json"
        scratch.write_new(path, b"{}")
        with self.assertRaises(FileExistsError):
            scratch.write_new(path, b"replaced")
        self.assertEqual(path.stat().st_mode & 0o777, 0o600)
        os.link(path, self.directory / "hardlink.json")
        with self.assertRaisesRegex(ValueError, "PRIVATE_FILE_INVALID"):
            scratch.read_private(path)

    def test_bounds_rejected_before_training(self):
        for steps in (0, 1001, True, 1.5):
            with self.assertRaisesRegex(ValueError, "STEPS"):
                scratch.run_training(self.directory / "invalid", steps=steps)
        for seconds in (0, 301, True, 1.5):
            with self.assertRaisesRegex(ValueError, "BUDGET"):
                scratch.run_training(self.directory / "invalid", max_seconds=seconds)

    def test_byte_tokenization_masks_padding_without_truncating(self):
        import torch
        rows = [{"prompt": "x = ", "answer": "1"},
                {"prompt": "\u062c\u0645\u0639 1 2 = ", "answer": "3"}]
        inputs, count = scratch.batch(rows, torch)
        self.assertTrue(bool((inputs["labels"][~inputs["attention_mask"]] == -100).all()))
        self.assertGreater(count, 0)
        with self.assertRaisesRegex(ValueError, "NO_SILENT_TRUNCATION"):
            scratch.batch([{"prompt": "x" * 100, "answer": "1"}], torch)

    def test_real_training_resume_and_independent_reload(self):
        full = scratch.run_training(self.directory / "full", steps=4)
        first = scratch.run_training(self.directory / "first", steps=2)
        resumed = scratch.run_training(self.directory / "resumed", steps=2,
                                      resume=self.directory / "first" / first["checkpoint"])
        self.assertEqual(full["weightsSha256"], resumed["weightsSha256"])
        self.assertEqual(full["trainingTargetTokensSeen"], resumed["trainingTargetTokensSeen"])
        self.assertTrue(full["checkpointReloadLogitsExactlyEqual"])
        self.assertTrue(full["weightsChangedFromRandomInitialization"])
        self.assertFalse(full["pretrainedWeightsLoaded"])
        self.assertFalse(full["release"]["commercialProductionApproved"])
        self.assertFalse(full["release"]["largeLlmTrainingComplete"])
        self.assertFalse(full["ownership"]["legalTitleCertified"])
        checkpoint = self.directory / "full" / full["checkpoint"]
        verified = scratch.run_training(None, verify=checkpoint)
        self.assertEqual(verified["weightsSha256"], full["weightsSha256"])
        self.assertEqual(verified["validation"], full["validationAfter"])
        with patch.object(sys, "argv", ["trainer", "--verify", str(checkpoint)]):
            captured = io.StringIO()
            with redirect_stdout(captured):
                self.assertEqual(scratch.main(), 0)
            self.assertEqual(json.loads(captured.getvalue())["validation"], full["validationAfter"])
        for directory in (self.directory / "full", self.directory / "first", self.directory / "resumed"):
            for path in directory.rglob("*"):
                self.assertEqual(path.stat().st_mode & 0o777, 0o700 if path.is_dir() else 0o600)
        model_file = checkpoint / "model.safetensors"
        with model_file.open("ab") as stream:
            stream.write(b"tampered")
        with self.assertRaisesRegex(ValueError, "HASH_MISMATCH"):
            scratch.run_training(None, verify=checkpoint)

    def test_budget_stop_is_not_completion_and_still_checkpoints(self):
        with patch.object(scratch.time, "monotonic", side_effect=[0, 2, 3, 4]):
            result = scratch.run_training(self.directory / "stopped", steps=2, max_seconds=1)
        self.assertEqual(result["status"], "BUDGET_STOPPED_CHECKPOINT_SAVED")
        self.assertEqual(result["stepsCompleted"], 0)
        self.assertFalse(result["weightsChangedFromRandomInitialization"])
        self.assertTrue((self.directory / "stopped" / result["checkpoint"] / "checkpoint.json").exists())

    def test_unknown_profile_and_cross_profile_resume_are_rejected(self):
        with self.assertRaisesRegex(ValueError, "UNKNOWN_BOUNDED_PROFILE"):
            scratch.run_training(self.directory / "large", profile="7b")
        result = scratch.run_training(self.directory / "micro", steps=1, profile="micro")
        self.assertLess(result["parameters"], 200_000)
        with self.assertRaisesRegex(ValueError, "PROVENANCE"):
            scratch.run_training(self.directory / "wrong-profile", steps=1, profile="mini",
                                 resume=self.directory / "micro" / result["checkpoint"])

    def test_interrupted_partial_optimizer_is_discarded(self):
        import torch

        def interrupted_step(optimizer, *args, **kwargs):
            with torch.no_grad():
                optimizer.param_groups[0]["params"][0].add_(100)
            raise KeyboardInterrupt()

        with patch.object(torch.optim.AdamW, "step", interrupted_step):
            result = scratch.run_training(self.directory / "interrupted", steps=2)
        self.assertEqual(result["status"], "INTERRUPTED_CHECKPOINT_SAVED")
        self.assertEqual(result["stepsCompleted"], 0)
        self.assertFalse(result["weightsChangedFromRandomInitialization"])


if __name__ == "__main__":
    unittest.main()
