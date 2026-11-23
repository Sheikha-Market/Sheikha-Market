"""Local assessment contracts: provenance, telemetry validation and exclusive output."""
import copy
from datetime import datetime, timedelta, timezone
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ENGINE = Path(__file__).resolve().parents[1] / "SHEIKHA-CORE/infrastructure/sheikha_omni_pillars_engine.py"
SPEC = importlib.util.spec_from_file_location("sheikha_omni_pillars_assessment", ENGINE)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)
NOW = datetime(2026, 10, 25, 12, 0, tzinfo=timezone.utc)


class PillarsAssessmentTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="sheikha-pillars-test-")
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.registry = self.root / "SHEIKHA-CORE/blockchain/registry.json"
        self.registry.parent.mkdir(parents=True)
        self.registry.write_text(json.dumps({"a": {"shk_reward": 10}, "b": {"shk_reward": 20}}))

    def assess(self, **kwargs):
        return MODULE.SheikhaUniversalIntegrator().assess(root=self.root, now=NOW, **kwargs)

    def telemetry(self):
        return {"source": "test-station", "observed_at": "2026-10-25T11:00:00Z",
                "measurements": {"soil_stress": {"value": 12.3, "unit": "kPa"},
                                 "robot_battery": {"value": 80, "unit": "%"},
                                 "chain_block_height": {"value": 2, "unit": "block"}}}

    def cli(self, *args):
        return subprocess.run([sys.executable, "-B", str(ENGINE), "--registry", str(self.registry), *args],
                              cwd=self.root, text=True, capture_output=True)

    def test_actual_metadata_and_declarations_do_not_assert_active_integrations(self):
        (self.root / "global-neural-governance-init.js").write_text("// presence only")
        report = self.assess()
        self.assertEqual(report["metadata_registry"]["metadata_records"], 2)
        self.assertEqual(report["metadata_registry"]["recorded_reward_units"], 30)
        self.assertEqual(report["declarations"]["pillars"], 12)
        self.assertEqual([report["declarations"][key] for key in ("minds", "foundries", "bots")], [8, 5, 58])
        self.assertTrue(all(value is None for value in report["verified_active_counts"].values()))
        self.assertEqual(len(report["pillars"]), 12)
        self.assertTrue(report["pillars"][0]["source_exists"])
        self.assertFalse(report["pillars"][0]["active_verified"])
        self.assertEqual(sum(map(len, report["layers"].values())), 12)
        self.assertIsNone(report["telemetry"])
        self.assertTrue(all(value is False for value in report["operations_performed"].values()))

    def test_demo_is_explicitly_synthetic_and_not_verified(self):
        report = self.assess(demo=True)
        self.assertEqual(report["mode"], "simulation")
        self.assertTrue(report["telemetry"]["simulation"])
        self.assertFalse(report["telemetry"]["verified"])
        self.assertEqual(report["telemetry"]["source"], "synthetic_example_not_hardware")
        with self.assertRaises(ValueError):
            self.assess(demo=True, telemetry=self.telemetry())

    def test_provided_telemetry_keeps_source_units_and_observation_time(self):
        sample = self.assess(telemetry=self.telemetry())["telemetry"]
        self.assertEqual(sample["age_seconds"], 3600)
        self.assertEqual(sample["observed_at"], "2026-10-25T11:00:00+00:00")
        self.assertEqual(sample["source"], "test-station")
        self.assertFalse(sample["verified"])
        self.assertFalse(sample["simulation"])
        self.assertEqual(sample["measurements"]["soil_stress"]["unit"], "kPa")

    def test_nonfinite_negative_boolean_and_wrong_units_are_rejected(self):
        for value in (-1, float("nan"), float("inf"), True, "12"):
            for name in MODULE.UNITS:
                with self.subTest(name=name, value=value):
                    data = self.telemetry()
                    data["measurements"][name]["value"] = value
                    with self.assertRaises(ValueError):
                        self.assess(telemetry=data)
        for name in MODULE.UNITS:
            data = self.telemetry()
            data["measurements"][name]["unit"] = "wrong"
            with self.subTest(name=name), self.assertRaises(ValueError):
                self.assess(telemetry=data)

    def test_battery_bounds_and_integer_chain_height(self):
        for value in (0, 100):
            data = self.telemetry()
            data["measurements"]["robot_battery"]["value"] = value
            self.assess(telemetry=data)
        for name, value in (("robot_battery", 100.1), ("chain_block_height", 2.5)):
            data = self.telemetry()
            data["measurements"][name]["value"] = value
            with self.assertRaises(ValueError):
                self.assess(telemetry=data)

    def test_timestamp_source_and_shape_validation(self):
        for value in (None, "bad-date", "2026-10-25T11:00:00", (NOW + timedelta(hours=1)).isoformat()):
            data = self.telemetry()
            data["observed_at"] = value
            with self.subTest(value=value), self.assertRaises(ValueError):
                self.assess(telemetry=data)
        for value in ("", " ", 3, "s" * 257):
            data = self.telemetry()
            data["source"] = value
            with self.assertRaises(ValueError):
                self.assess(telemetry=data)
        data = self.telemetry()
        data["measurements"]["unknown"] = {"value": 1, "unit": "%"}
        with self.assertRaises(ValueError):
            self.assess(telemetry=data)

    def test_hash_is_deterministic_excludes_integrity_and_detects_tampering(self):
        first = self.assess(demo=True)
        second = self.assess(demo=True)
        self.assertEqual(first, second)
        digest = first["integrity"]["sha256"]
        self.assertEqual(MODULE.canonical_hash(first), digest)
        first["integrity"]["sha256"] = "arbitrary"
        self.assertEqual(MODULE.canonical_hash(first), digest)
        tampered = copy.deepcopy(first)
        tampered["telemetry"]["measurements"]["soil_stress"]["value"] += 1
        self.assertNotEqual(MODULE.canonical_hash(tampered), digest)

    def test_registry_layouts_use_real_counts_and_rewards(self):
        rows = [{"shk_reward": 7}, {"shk_reward": 3}]
        for data in (rows, {"weights": rows}, {"records": {"a": rows[0], "b": rows[1]}},
                     {"ledger": rows}, {"blocks": rows}):
            self.registry.write_text(json.dumps(data))
            summary = self.assess()["metadata_registry"]
            self.assertEqual(summary["metadata_records"], 2)
            self.assertEqual(summary["recorded_reward_units"], 10)

    def test_registry_bad_rewards_ambiguous_shapes_and_duplicate_keys_rejected(self):
        for data in ({"a": {"shk_reward": True}}, {"a": {"shk_reward": "7"}},
                     {"a": {}}, {"weights": [], "ledger": []}, [1]):
            self.registry.write_text(json.dumps(data))
            with self.assertRaises(ValueError):
                self.assess()
        for raw in ('{"a":{"shk_reward":NaN}}', '{"a":{"shk_reward":1},"a":{"shk_reward":2}}'):
            self.registry.write_text(raw)
            with self.assertRaises(ValueError):
                self.assess()
        self.registry.unlink()
        with self.assertRaises(FileNotFoundError):
            self.assess()

    def test_default_cli_writes_nothing_and_preserves_old_archive(self):
        archive = self.registry.parent / "pillars_12/FABRIC_LIVE_SNAPSHOT.json"
        archive.parent.mkdir()
        archive.write_text("historical archive must survive")
        before = {str(path): path.read_bytes() for path in self.root.rglob("*") if path.is_file()}
        result = self.cli()
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report["mode"], "local_assessment")
        after = {str(path): path.read_bytes() for path in self.root.rglob("*") if path.is_file()}
        self.assertEqual(before, after)

    def test_output_is_exclusive_and_refuses_existing_file_or_symlink(self):
        output = self.root / "new-assessment.json"
        first = self.cli("--demo", "--output", str(output))
        self.assertEqual(first.returncode, 0, first.stderr)
        original = output.read_bytes()
        self.assertEqual(json.loads(original)["mode"], "simulation")
        self.assertEqual(output.stat().st_mode & 0o777, 0o600)
        second = self.cli("--output", str(output))
        self.assertNotEqual(second.returncode, 0)
        self.assertEqual(output.read_bytes(), original)
        link = self.root / "symlink.json"
        link.symlink_to(output)
        self.assertNotEqual(self.cli("--output", str(link)).returncode, 0)
        self.assertEqual(output.read_bytes(), original)

    def test_input_file_bounds_and_symlinks_are_rejected(self):
        link = self.root / "registry-link.json"
        link.symlink_to(self.registry)
        with self.assertRaises(ValueError):
            MODULE.registry_summary(link)
        self.registry.write_bytes(b" " * (MODULE.MAX_INPUT_BYTES + 1))
        with self.assertRaises(ValueError):
            self.assess()


if __name__ == "__main__":
    unittest.main()
