# -*- coding: utf-8 -*-
# ===================================================================================
# 🕌 SHEIKHA-CHAIN SOVEREIGN PARALLEL LEDGER ENGINE V1.0
# Owner: Salman Ahmed bin Salman Al-Rajhi (CR: 2051263653 | Unified ID: 7049031003)
# Creed: LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH
# Seal: BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED
# ===================================================================================

import os, json, time, hashlib, re, stat, fcntl
from pathlib import Path
from contextlib import contextmanager

DEFAULT_LEDGER_DIR = Path(__file__).resolve().parent.parent / "blocks"
MAX_BLOCKS = 10000
MAX_BLOCK_BYTES = 4 * 1024 * 1024
MAX_LEDGER_BYTES = 128 * 1024 * 1024
GENESIS_WITNESS = "379c6ea1631db19370a585989a5e07e2b374c7df726e5e111005687466205769"
BLOCK_FIELDS = {"index", "previous_hash", "timestamp", "data", "state_root", "validator", "seal", "hash"}


class LedgerError(ValueError):
    """A local ledger failed validation; existing files are never repaired implicitly."""


class LedgerConflictError(LedgerError):
    """The proposed append no longer follows the persisted head."""


def _canonical(value):
    try:
        return json.dumps(value, sort_keys=True, allow_nan=False).encode("utf-8")
    except (TypeError, ValueError, OverflowError, RecursionError) as error:
        raise LedgerError("NON_CANONICAL_BLOCK_DATA") from error


def _unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise LedgerError("DUPLICATE_JSON_KEY")
        result[key] = value
    return result


def _open_ledger_directory(directory):
    """Open every path component without following symlinks, including parents."""
    parts = Path(os.path.abspath(os.fspath(directory))).parts
    if len(parts) > 64:
        raise LedgerError("LEDGER_DIRECTORY_DEPTH_LIMIT")
    fd = os.open(parts[0], os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        for component in parts[1:]:
            try:
                next_fd = os.open(component, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            except FileNotFoundError:
                try:
                    os.mkdir(component, 0o700, dir_fd=fd)
                except FileExistsError:
                    pass  # Another cooperating constructor may create the directory.
                next_fd = os.open(component, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            os.close(fd)
            fd = next_fd
        return fd
    except OSError as error:
        os.close(fd)
        raise LedgerError("UNSAFE_LEDGER_DIRECTORY") from error


def _validate_record(record, index, previous):
    if not isinstance(record, dict) or set(record) != BLOCK_FIELDS:
        raise LedgerError("INVALID_BLOCK_FIELDS")
    if type(record["index"]) is not int or record["index"] != index:
        raise LedgerError("BLOCK_INDEX_MISMATCH")
    if type(record["timestamp"]) is not int or not 0 <= record["timestamp"] <= 2**53 - 1:
        raise LedgerError("INVALID_BLOCK_TIMESTAMP")
    for key in ("hash", "previous_hash", "state_root"):
        if not isinstance(record[key], str) or re.fullmatch(r"[a-f0-9]{64}", record[key]) is None:
            raise LedgerError("INVALID_BLOCK_DIGEST")
    if not isinstance(record["validator"], str) or not 1 <= len(record["validator"]) <= 256:
        raise LedgerError("INVALID_BLOCK_VALIDATOR")
    if record["seal"] != "BOUND_BY_QURAN_SUNNAH":
        raise LedgerError("INVALID_BLOCK_SEAL")
    if record["previous_hash"] != (previous.hash if previous else "0" * 64):
        raise LedgerError("PREVIOUS_HASH_MISMATCH")
    if record["state_root"] != hashlib.sha256(_canonical(record["data"])).hexdigest():
        raise LedgerError("STATE_ROOT_MISMATCH")
    block = object.__new__(SheikhaBlock)
    block.__dict__.update(record)
    if block.hash != block.calculate_hash():
        raise LedgerError("BLOCK_HASH_MISMATCH")
    if index == 0 and block.hash != GENESIS_WITNESS:
        raise LedgerError("GENESIS_WITNESS_MISMATCH")
    return block


def _load_blocks(directory_fd):
    names = sorted(os.listdir(directory_fd))
    if len(names) > MAX_BLOCKS:
        raise LedgerError("LEDGER_BLOCK_LIMIT")
    chain, total_bytes = [], 0
    for index, name in enumerate(names):
        if re.fullmatch(r"block_[0-9]{8}\.json", name) is None:
            raise LedgerError("UNKNOWN_LEDGER_ENTRY")
        if name != f"block_{index:08d}.json":
            raise LedgerError("LEDGER_INDEX_GAP")
        try:
            fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=directory_fd)
        except OSError as error:
            raise LedgerError("UNSAFE_BLOCK_FILE") from error
        try:
            before = os.fstat(fd)
            if not stat.S_ISREG(before.st_mode) or before.st_nlink != 1 or before.st_size > MAX_BLOCK_BYTES:
                raise LedgerError("UNSAFE_OR_OVERSIZED_BLOCK_FILE")
            with os.fdopen(fd, "rb", closefd=False) as handle:
                payload = handle.read(MAX_BLOCK_BYTES + 1)
            after = os.fstat(fd)
            current = os.stat(name, dir_fd=directory_fd, follow_symlinks=False)
            for other in (after, current):
                if (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns, before.st_ctime_ns) != (
                    other.st_dev, other.st_ino, other.st_size, other.st_mtime_ns, other.st_ctime_ns
                ):
                    raise LedgerError("BLOCK_CHANGED_DURING_READ")
        finally:
            os.close(fd)
        total_bytes += len(payload)
        if len(payload) > MAX_BLOCK_BYTES or total_bytes > MAX_LEDGER_BYTES:
            raise LedgerError("LEDGER_SIZE_LIMIT")
        try:
            record = json.loads(payload, object_pairs_hook=_unique_object,
                                parse_constant=lambda value: (_ for _ in ()).throw(LedgerError("NONFINITE_JSON_NUMBER")))
        except (UnicodeError, json.JSONDecodeError, RecursionError) as error:
            raise LedgerError("MALFORMED_BLOCK_JSON") from error
        chain.append(_validate_record(record, index, chain[-1] if chain else None))
    return chain

class SheikhaBlock:
    def __init__(self, index, previous_hash, timestamp, data, state_root, validator):
        self.index = index
        self.previous_hash = previous_hash
        self.timestamp = timestamp
        self.data = data
        self.state_root = state_root
        self.validator = validator
        self.seal = "BOUND_BY_QURAN_SUNNAH"
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        block_string = _canonical({
            "index": self.index,
            "previous_hash": self.previous_hash,
            "timestamp": self.timestamp,
            "data": self.data,
            "state_root": self.state_root,
            "validator": self.validator,
            "seal": self.seal
        })
        return hashlib.sha256(block_string).hexdigest()

class SheikhaChain:
    """A locked local append-only JSON ledger, not distributed consensus or mining."""

    def __init__(self, ledger_dir=None):
        self.chain_id = 7049031003
        self.owner = "سلمان أحمد بن سلمان الراجح (CR: 2051263653)"
        self.ledger_dir = os.path.abspath(os.fspath(DEFAULT_LEDGER_DIR if ledger_dir is None else ledger_dir))
        self.scope = "LOCAL_APPEND_LEDGER"
        self.chain = []
        self.create_genesis_block()

    @contextmanager
    def _locked_ledger(self):
        fd = _open_ledger_directory(self.ledger_dir)
        try:
            fcntl.flock(fd, fcntl.LOCK_EX)
            yield fd
        finally:
            os.close(fd)  # Closing also releases the advisory directory lock.

    def create_genesis_block(self):
        with self._locked_ledger() as directory_fd:
            existing = _load_blocks(directory_fd)
            if existing:
                self.chain = existing
                return existing[0]
            genesis = self._new_genesis_block()
            _validate_record(genesis.__dict__, 0, None)
            self._append_exclusive(directory_fd, genesis, [])
            self.chain = [genesis]
            return genesis

    def _new_genesis_block(self):
        # Immutable historical witness. Its legacy weight-count text is not
        # independent evidence of trained weights, ownership, or live consensus.
        # الكتلة الصفرية المؤسسة (Genesis Block) الشاملة لكافة الأوزان الـ 62 والعلوم
        genesis_data = {
            "title": "SHEIKHA-CHAIN GENESIS SOVEREIGN BLOCK",
            "science": "علم شيخة لإعمار السماوات والأرض وما بينهما",
            "doctrine": "الكتاب والسنة النبوية الشريفة",
            "creed": "LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH",
            "owner": self.owner,
            "cr_number": "2051263653",
            "verified_weights_count": 62,
            "domains": [
                "العلوم الشرعية والتوحيد والعمارة",
                "أكواد البناء السعودي SBC 201-1201",
                "الأنظمة والوزارات السعودية DGA, NCA, SAMA, MC, CMA",
                "المعايير الدولية ISO, NIST, IBC, IEEE, ASME",
                "الحوسبة والرياضيات والفيزياء والمواد الفائقة Pearl Metal",
                "الجسد الرقمي التوأمي والأساسات الذكية والروبوتات ROS2"
            ]
        }
        state_root = hashlib.sha256(_canonical(genesis_data)).hexdigest()
        genesis_block = SheikhaBlock(
            index=0,
            previous_hash="0" * 64,
            timestamp=1792790000,
            data=genesis_data,
            state_root=state_root,
            validator="SOVEREIGN_AUTHORITY_SALMAN_AL_RAJHI"
        )
        return genesis_block

    def _append_exclusive(self, directory_fd, block, existing):
        if len(existing) >= MAX_BLOCKS:
            raise LedgerError("LEDGER_BLOCK_LIMIT")
        if block.index != len(existing):
            raise LedgerConflictError("APPEND_INDEX_CONFLICT")
        _validate_record(block.__dict__, len(existing), existing[-1] if existing else None)
        payload = json.dumps(block.__dict__, indent=2, ensure_ascii=False, allow_nan=False).encode("utf-8")
        if len(payload) > MAX_BLOCK_BYTES:
            raise LedgerError("BLOCK_SIZE_LIMIT")
        if sum(os.stat(f"block_{item.index:08d}.json", dir_fd=directory_fd, follow_symlinks=False).st_size
               for item in existing) + len(payload) > MAX_LEDGER_BYTES:
            raise LedgerError("LEDGER_SIZE_LIMIT")
        try:
            fd = os.open(f"block_{block.index:08d}.json", os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                         0o600, dir_fd=directory_fd)
        except FileExistsError as error:
            raise LedgerConflictError("APPEND_FILE_ALREADY_EXISTS") from error
        with os.fdopen(fd, "wb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.fsync(directory_fd)

    def persist_block(self, block):
        with self._locked_ledger() as directory_fd:
            existing = _load_blocks(directory_fd)
            self._append_exclusive(directory_fd, block, existing)
            self.chain = existing + [block]
        return block

    def mine_sovereign_block(self, transactions):
        """Compatibility name: append local data only, with no network or consensus."""
        canonical = _canonical(transactions)
        if len(canonical) > MAX_BLOCK_BYTES:
            raise LedgerError("BLOCK_SIZE_LIMIT")
        # Detach caller-owned mutable objects before validating and persisting.
        data = json.loads(canonical)
        with self._locked_ledger() as directory_fd:
            existing = _load_blocks(directory_fd)
            if not existing:
                raise LedgerError("GENESIS_REQUIRED")
            new_block = SheikhaBlock(index=len(existing), previous_hash=existing[-1].hash,
                                    timestamp=int(time.time()), data=data,
                                    state_root=hashlib.sha256(canonical).hexdigest(), validator=self.owner)
            self._append_exclusive(directory_fd, new_block, existing)
            self.chain = existing + [new_block]
            return new_block

if __name__ == "__main__":
    print("===================================================================================")
    print("[SHEIKHA-CHAIN] Local append ledger; no distributed consensus or physical mining.")
    chain = SheikhaChain()
    genesis = chain.chain[0]
    print(f"Validated persisted head: #{chain.chain[-1].index}; next append index: {chain.chain[-1].index + 1}")
    print(f"🔒 هاش الكتلة الصفرية: {genesis.hash}")
    print(f"🏛️ الناظر السيادي: {genesis.validator}")
    print(f"⚖️ مصفوفة الحوكمة: {genesis.seal}")
    print("===================================================================================")
