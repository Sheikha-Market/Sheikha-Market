import importlib.util
import os
from pathlib import Path
import socket
import tempfile
import unittest
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1] / "tools/training/sheikha-foundry-cells-v1.py"
SPEC = importlib.util.spec_from_file_location("foundry_cells", SCRIPT)
cells = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(cells)


class FoundryCellsTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.home = cells.private_home(Path(self.temp.name) / "private")
        self.db = cells.connect(self.home)

    def tearDown(self):
        self.db.close()
        self.temp.cleanup()

    def test_private_permissions(self):
        self.assertEqual(self.home.stat().st_mode & 0o777, 0o700)
        self.assertEqual((self.home / "jobs.sqlite3").stat().st_mode & 0o777, 0o600)

    def test_reject_public_and_git_state(self):
        for folder in ("runtime", "public", ".git"):
            with self.assertRaisesRegex(ValueError, "PUBLIC_OR_GIT"):
                cells.private_home(cells.ROOT / folder / "foundry-test")

    def test_reject_symlink_state(self):
        link = Path(self.temp.name) / "link"
        link.symlink_to(self.home)
        with self.assertRaisesRegex(ValueError, "SYMLINK"):
            cells.private_home(link / "child")

    def test_steps_are_bounded(self):
        for value in (0, -1, 101, 1.2, True, "20"):
            with self.assertRaises(ValueError):
                cells.enqueue(self.db, value)

    def test_queue_persists_across_connections(self):
        job_id = cells.enqueue(self.db)
        second = cells.connect(self.home)
        try:
            self.assertEqual(cells.claim(second)["id"], job_id)
        finally:
            second.close()

    def test_queue_admission_has_a_limit(self):
        with patch.object(cells, "MAX_PENDING", 1):
            cells.enqueue(self.db)
            with self.assertRaisesRegex(ValueError, "QUEUE_LIMIT"):
                cells.enqueue(self.db)
        self.assertEqual(cells.status(self.db)["queue"], {"QUEUED": 1})

    def test_low_disk_does_not_claim_job(self):
        cells.enqueue(self.db)
        with patch.object(cells.shutil, "disk_usage") as disk:
            disk.return_value.free = 1
            with self.assertRaisesRegex(ValueError, "FREE_DISK"):
                cells.worker_once(self.home, self.db)
        self.assertEqual(cells.status(self.db)["queue"], {"QUEUED": 1})

    def test_second_worker_cannot_claim_reserved_slot(self):
        cells.enqueue(self.db)
        cells.enqueue(self.db)
        second = cells.connect(self.home)
        try:
            self.assertIsNotNone(cells.claim(self.db))
            self.assertIsNone(cells.claim(second))
        finally:
            second.close()

    def test_no_duplicate_execution(self):
        cells.enqueue(self.db)
        called = []
        trainer = lambda _home, job, _beat: called.append(job["id"]) or {"ok": True}
        cells.worker_once(self.home, self.db, trainer)
        cells.worker_once(self.home, self.db, trainer)
        self.assertEqual(len(called), 1)

    def test_failure_does_not_retry_automatically(self):
        cells.enqueue(self.db)
        def trainer(*_):
            raise ValueError("TEST_FAILURE")
        with self.assertRaises(ValueError):
            cells.worker_once(self.home, self.db, trainer)
        self.assertIsNone(cells.claim(self.db))
        self.assertEqual(cells.status(self.db)["queue"], {"FAILED": 1})

    def test_live_worker_cannot_be_recovered(self):
        job_id = cells.enqueue(self.db)
        cells.claim(self.db)
        with self.assertRaisesRegex(ValueError, "STILL_ALIVE"):
            cells.recover(self.db, job_id)

    def test_dead_worker_recovery_is_explicit(self):
        job_id = cells.enqueue(self.db)
        cells.claim(self.db)
        with patch.object(cells.os, "kill", side_effect=ProcessLookupError):
            cells.recover(self.db, job_id)
        self.assertEqual(cells.claim(self.db)["id"], job_id)

    def test_other_host_cannot_recover(self):
        job_id = cells.enqueue(self.db)
        cells.claim(self.db)
        self.db.execute("UPDATE jobs SET host=? WHERE id=?", (socket.gethostname()+"-other", job_id))
        with self.assertRaisesRegex(ValueError, "ORIGINAL_HOST"):
            cells.recover(self.db, job_id)

    def test_no_promotion_or_cluster_claim(self):
        result = cells.status(self.db)
        self.assertFalse(result["automaticPromotion"])
        self.assertFalse(result["largeDistributedTrainingReady"])
        self.assertFalse(result["externalProvisioning"])

    @unittest.skipUnless(os.environ.get("SHEIKHA_FOUNDRY_TORCH_TEST") == "1", "Explicit bounded CPU test")
    def test_real_training_checkpoint_recovery(self):
        job_id = cells.enqueue(self.db, steps=10)
        def interrupted_trainer(home, job, heartbeat):
            def interrupt():
                heartbeat()
                raise KeyboardInterrupt()
            return cells.train_smoke(home, job, interrupt)
        with self.assertRaises(KeyboardInterrupt):
            cells.worker_once(self.home, self.db, interrupted_trainer)
        cells.recover(self.db, job_id)
        result = cells.worker_once(self.home, self.db)
        self.assertEqual(result["resumedFromStep"], 5)
        self.assertEqual(result["steps"], 10)
        self.assertFalse(result["productionApproved"])
        self.assertGreater(result["parameters"], 0)
        model_path = self.home / "artifacts" / job_id / "model/model.safetensors"
        self.assertEqual(cells.digest(model_path), result["artifactHashes"]["model.safetensors"])


if __name__ == "__main__":
    unittest.main()
