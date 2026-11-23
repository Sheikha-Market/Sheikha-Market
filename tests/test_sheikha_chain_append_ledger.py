"""Offline disposable-ledger tests. Never instantiate the repository's real ledger."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

ENGINE = Path(__file__).resolve().parents[1] / "SHEIKHA-CORE/sheikhachain/core/sheikha_chain_engine.py"
spec = importlib.util.spec_from_file_location("local_append_ledger_fixture", ENGINE)
engine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)


class AppendLedgerTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="sheikha-ledger-fixture-")
        self.addCleanup(self.temporary.cleanup)
        self.directory = Path(self.temporary.name) / "blocks"

    def chain(self):
        return engine.SheikhaChain(ledger_dir=self.directory)

    def snapshot(self):
        return {p.name: p.read_bytes() for p in self.directory.iterdir() if p.is_file() and not p.is_symlink()}

    def test_restart_loads_genesis_and_appends_next_indices_without_changing_history(self):
        first = self.chain()
        genesis_bytes = self.snapshot()["block_00000000.json"]
        self.assertEqual(first.chain[0].index, 0)
        self.assertEqual(first.mine_sovereign_block({"fixture": 1}).index, 1)
        before = self.snapshot()
        script = ("import importlib.util,sys; s=importlib.util.spec_from_file_location('fixture',sys.argv[1]); "
                  "m=importlib.util.module_from_spec(s); s.loader.exec_module(m); "
                  "c=m.SheikhaChain(ledger_dir=sys.argv[2]); print(c.mine_sovereign_block({'fixture':2}).index)")
        result = subprocess.run([sys.executable, "-B", "-c", script, str(ENGINE), str(self.directory)],
                                check=True, capture_output=True, text=True, timeout=10)
        self.assertEqual(result.stdout.strip(), "2")
        restarted = self.chain()
        self.assertEqual([block.index for block in restarted.chain], [0, 1, 2])
        self.assertEqual(self.snapshot()["block_00000000.json"], genesis_bytes)
        for name, payload in before.items():
            self.assertEqual(self.snapshot()[name], payload)
        self.assertEqual(restarted.scope, "LOCAL_APPEND_LEDGER")

    def test_stale_instances_reload_for_append_and_explicit_conflicts_never_overwrite(self):
        first, stale = self.chain(), self.chain()
        self.assertEqual(first.mine_sovereign_block(["fixture one"]).index, 1)
        self.assertEqual(stale.mine_sovereign_block(["fixture two"]).index, 2)
        before = self.snapshot()
        candidate = first.chain[-1]
        with self.assertRaises(engine.LedgerConflictError):
            stale.persist_block(candidate)
        self.assertEqual(self.snapshot(), before)
        first.create_genesis_block()
        self.assertEqual(len(first.chain), 3)
        self.assertEqual(self.snapshot(), before)

    def test_two_processes_serialize_initialization_and_appends(self):
        script = ("import importlib.util,sys; s=importlib.util.spec_from_file_location('fixture',sys.argv[1]); "
                  "m=importlib.util.module_from_spec(s); s.loader.exec_module(m); "
                  "c=m.SheikhaChain(ledger_dir=sys.argv[2]); print(c.mine_sovereign_block({'fixture':sys.argv[3]}).index)")
        workers = [subprocess.Popen([sys.executable, "-B", "-c", script, str(ENGINE), str(self.directory), str(i)],
                                    stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True) for i in range(2)]
        indices = []
        for worker in workers:
            out, err = worker.communicate(timeout=10)
            self.assertEqual(worker.returncode, 0, err)
            indices.append(int(out.strip()))
        self.assertEqual(sorted(indices), [1, 2])
        self.assertEqual([block.index for block in self.chain().chain], [0, 1, 2])

    def test_malformed_gapped_unknown_and_symlinked_entries_fail_without_repair(self):
        self.chain().mine_sovereign_block({"fixture": 1})
        block = self.directory / "block_00000001.json"
        original = block.read_bytes()
        block.write_bytes(b"{malformed")
        before = self.snapshot()
        with self.assertRaises(engine.LedgerError): self.chain()
        self.assertEqual(self.snapshot(), before)
        block.write_bytes(original)
        block.rename(self.directory / "block_00000002.json")
        before = self.snapshot()
        with self.assertRaisesRegex(engine.LedgerError, "LEDGER_INDEX_GAP"): self.chain()
        self.assertEqual(self.snapshot(), before)
        (self.directory / "block_00000002.json").rename(block)
        unknown = self.directory / "unrecognized.txt"
        unknown.write_text("fixture only")
        before = self.snapshot()
        with self.assertRaisesRegex(engine.LedgerError, "UNKNOWN_LEDGER_ENTRY"): self.chain()
        self.assertEqual(self.snapshot(), before)
        unknown.unlink()
        block.unlink()
        outside = Path(self.temporary.name) / "outside.json"
        outside.write_bytes(original)
        block.symlink_to(outside)
        with self.assertRaises(engine.LedgerError): self.chain()
        self.assertEqual(outside.read_bytes(), original)

    def test_hash_state_link_and_genesis_witness_are_checked(self):
        self.chain().mine_sovereign_block({"fixture": 1})
        block = self.directory / "block_00000001.json"
        original = block.read_bytes()
        for field, value in [("index", 9), ("hash", "f" * 64), ("state_root", "f" * 64),
                             ("previous_hash", "f" * 64)]:
            data = json.loads(original); data[field] = value
            block.write_text(json.dumps(data))
            before = self.snapshot()
            with self.assertRaises(engine.LedgerError): self.chain()
            self.assertEqual(self.snapshot(), before)
        block.write_bytes(original)
        genesis = self.directory / "block_00000000.json"
        data = json.loads(genesis.read_bytes()); data["data"]["verified_weights_count"] = 0
        data["state_root"] = hashlib.sha256(engine._canonical(data["data"])).hexdigest()
        fake = object.__new__(engine.SheikhaBlock); fake.__dict__.update(data)
        data["hash"] = fake.calculate_hash()
        genesis.write_text(json.dumps(data))
        before = self.snapshot()
        with self.assertRaisesRegex(engine.LedgerError, "GENESIS_WITNESS_MISMATCH"): self.chain()
        self.assertEqual(self.snapshot(), before)

    def test_default_path_is_source_relative_independent_of_working_directory(self):
        expected = ENGINE.parent.parent / "blocks"
        self.assertEqual(engine.DEFAULT_LEDGER_DIR, expected)
        previous = os.getcwd()
        try:
            os.chdir(self.temporary.name)
            with mock.patch.object(engine, "_open_ledger_directory", side_effect=engine.LedgerError("FIXTURE_STOP")) as opened:
                with self.assertRaisesRegex(engine.LedgerError, "FIXTURE_STOP"):
                    engine.SheikhaChain()
                self.assertEqual(Path(opened.call_args.args[0]), expected)
        finally:
            os.chdir(previous)

    def test_directory_symlinks_and_nonfinite_or_oversized_appends_are_refused(self):
        chain = self.chain()
        alias = Path(self.temporary.name) / "alias"
        alias.symlink_to(self.directory, target_is_directory=True)
        before = self.snapshot()
        with self.assertRaises(engine.LedgerError): engine.SheikhaChain(ledger_dir=alias)
        with self.assertRaises(engine.LedgerError): chain.mine_sovereign_block({"fixture": float("nan")})
        with mock.patch.object(engine, "MAX_BLOCK_BYTES", 2000):
            with self.assertRaises(engine.LedgerError): chain.mine_sovereign_block("x" * 2001)
        self.assertEqual(self.snapshot(), before)


if __name__ == "__main__":
    unittest.main()
