import importlib.util
from pathlib import Path
import unittest

SPEC = importlib.util.spec_from_file_location("lora_smoke", Path(__file__).resolve().parents[1] / "tools/training/sheikha-lora-composition-smoke-v1.py")
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class SyntheticCompositionTests(unittest.TestCase):
    def test_no_train_holdout_overlap(self):
        for task in ("arithmetic", "sequence"):
            train = {tuple(row) for row in MODULE.examples(task, 0, 32)}
            heldout = {tuple(row) for row in MODULE.examples(task, 32, 16)}
            self.assertEqual(len(train), 32)
            self.assertEqual(len(heldout), 16)
            self.assertFalse(train & heldout)

    def test_vocabulary_bounds_and_determinism(self):
        for task in ("arithmetic", "sequence"):
            rows = MODULE.examples(task, 0, 256)
            self.assertEqual(rows, MODULE.examples(task, 0, 256))
            self.assertTrue(all(len(row) == 7 and all(0 <= token < 32 for token in row) for row in rows))

    def test_invalid_requests(self):
        for args in (("unknown", 0, 1), ("arithmetic", -1, 1), ("sequence", 0, 0), ("sequence", 0, 257)):
            with self.assertRaises(ValueError):
                MODULE.examples(*args)


if __name__ == "__main__":
    unittest.main()
