#!/usr/bin/env python3
"""Private single-host job queue; only the bounded offline smoke recipe executes."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import socket
import sqlite3
import time
import uuid

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_HOME = ROOT / "reports/private/sheikha-foundry-cells-v1"
RECIPE = "scratch-gpt2-arithmetic-smoke-v1"
MAX_PENDING = 1000


def private_home(value):
    raw = Path(value).absolute()
    if any(p.is_symlink() for p in [raw, *raw.parents]):
        raise ValueError("SYMLINK_STATE_PATH_DENIED")
    home = raw.resolve()
    for exposed in [ROOT / "public", ROOT / "runtime", ROOT / ".git"]:
        if home == exposed or exposed in home.parents:
            raise ValueError("PUBLIC_OR_GIT_STATE_PATH_DENIED")
    home.mkdir(parents=True, exist_ok=True, mode=0o700)
    if home.stat().st_uid != os.getuid():
        raise ValueError("STATE_OWNER_REQUIRED")
    home.chmod(0o700)
    return home


def connect(home):
    db_path = home / "jobs.sqlite3"
    if db_path.is_symlink():
        raise ValueError("SYMLINK_DATABASE_DENIED")
    db = sqlite3.connect(db_path, timeout=10, isolation_level=None)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA journal_mode=WAL")
    db.execute("PRAGMA synchronous=FULL")
    db.execute("""CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY, recipe TEXT NOT NULL, state TEXT NOT NULL,
        steps INTEGER NOT NULL, created REAL NOT NULL, updated REAL NOT NULL,
        host TEXT, pid INTEGER, error TEXT, result TEXT
    )""")
    db_path.chmod(0o600)
    return db


def atomic_json(path, data):
    temp = path.with_name(path.name + ".tmp-" + uuid.uuid4().hex)
    with temp.open("x", encoding="utf-8") as out:
        json.dump(data, out, ensure_ascii=True, indent=2, allow_nan=False)
        out.write("\n")
        out.flush()
        os.fsync(out.fileno())
    os.replace(temp, path)
    sync_directory(path.parent)


def sync_directory(directory):
    descriptor = os.open(directory, os.O_RDONLY | os.O_DIRECTORY)
    try:
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def digest(path):
    result = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            result.update(block)
    return result.hexdigest()


def enqueue(db, steps=20):
    if type(steps) is not int or not 1 <= steps <= 100:
        raise ValueError("SMOKE_STEPS_MUST_BE_1_TO_100")
    job_id = uuid.uuid4().hex
    now = time.time()
    db.execute("BEGIN IMMEDIATE")
    try:
        pending = db.execute("SELECT count(*) FROM jobs WHERE state IN ('QUEUED','RUNNING')").fetchone()[0]
        if pending >= MAX_PENDING:
            raise ValueError("PENDING_QUEUE_LIMIT_REACHED")
        db.execute("INSERT INTO jobs (id,recipe,state,steps,created,updated) VALUES (?,?,?,?,?,?)",
                   (job_id, RECIPE, "QUEUED", steps, now, now))
        db.execute("COMMIT")
    except BaseException:
        db.execute("ROLLBACK")
        raise
    return job_id


def claim(db):
    # The transaction reserves the entire local smoke worker, not a GPU cluster.
    db.execute("BEGIN IMMEDIATE")
    try:
        running = db.execute("SELECT 1 FROM jobs WHERE state='RUNNING' LIMIT 1").fetchone()
        row = None if running else db.execute(
            "SELECT * FROM jobs WHERE state='QUEUED' AND recipe=? ORDER BY created,id LIMIT 1",
            (RECIPE,)).fetchone()
        if row:
            db.execute("UPDATE jobs SET state='RUNNING',host=?,pid=?,updated=? WHERE id=?",
                       (socket.gethostname(), os.getpid(), time.time(), row["id"]))
        db.execute("COMMIT")
        return dict(row) if row else None
    except BaseException:
        db.execute("ROLLBACK")
        raise


def recover(db, job_id):
    db.execute("BEGIN IMMEDIATE")
    try:
        row = db.execute("SELECT * FROM jobs WHERE id=?", (job_id,)).fetchone()
        if not row or row["state"] not in ("RUNNING", "INTERRUPTED", "FAILED"):
            raise ValueError("RECOVERABLE_JOB_REQUIRED")
        if row["host"] != socket.gethostname():
            raise ValueError("RECOVERY_REQUIRES_ORIGINAL_HOST")
        if row["state"] == "RUNNING":
            try:
                os.kill(row["pid"], 0)
            except ProcessLookupError:
                pass
            else:
                raise ValueError("WORKER_STILL_ALIVE_OR_PID_REUSED")
        db.execute("UPDATE jobs SET state='QUEUED',error=NULL,updated=? WHERE id=?",
                   (time.time(), job_id))
        db.execute("COMMIT")
    except BaseException:
        db.execute("ROLLBACK")
        raise


def train_smoke(home, job, heartbeat):
    os.environ.update(HF_HUB_OFFLINE="1", TRANSFORMERS_OFFLINE="1",
                      HF_HUB_DISABLE_TELEMETRY="1", WANDB_DISABLED="true")
    import torch
    from transformers import GPT2Config, GPT2LMHeadModel

    torch.set_num_threads(2)
    torch.manual_seed(73)
    directory = home / "artifacts" / job["id"]
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    symbols = "0123456789+=;"
    vocabulary = {symbol: index + 1 for index, symbol in enumerate(symbols)}
    lines = [f"{a:02d}+{b:02d}={a+b:03d};" for a in range(20) for b in range(10)]
    encoded = torch.tensor([[vocabulary[c] for c in line] for line in lines])
    train, heldout = encoded[:180], encoded[180:]
    model = GPT2LMHeadModel(GPT2Config(
        vocab_size=len(vocabulary) + 1, n_positions=32, n_ctx=32,
        n_embd=64, n_layer=2, n_head=4, bos_token_id=None,
        eos_token_id=None, pad_token_id=0, use_cache=False,
    )).to("cpu")
    optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4)
    checkpoint_manifest = directory / "checkpoint.json"
    start = 0
    if checkpoint_manifest.exists():
        record = json.loads(checkpoint_manifest.read_text())
        if record.get("jobId") != job["id"] or record.get("recipe") != RECIPE:
            raise ValueError("CHECKPOINT_BINDING_MISMATCH")
        start = record["step"]
        if type(start) is not int or not 0 <= start <= job["steps"]:
            raise ValueError("CHECKPOINT_STEP_INVALID")
        checkpoint = directory / f"checkpoint-{start}.pt"
        if checkpoint.is_symlink() or digest(checkpoint) != record["sha256"]:
            raise ValueError("CHECKPOINT_DIGEST_MISMATCH")
        state = torch.load(checkpoint, map_location="cpu", weights_only=True)
        model.load_state_dict(state["model"])
        optimizer.load_state_dict(state["optimizer"])
        torch.set_rng_state(state["rng"])

    started = time.monotonic()
    model.eval()
    with torch.no_grad():
        initial_loss = model(heldout, labels=heldout).loss.item()
    last_loss = None
    model.train()
    for step in range(start, job["steps"]):
        if time.monotonic() - started > 300:
            raise TimeoutError("SMOKE_TIME_BUDGET_EXCEEDED")
        batch = train[torch.randint(len(train), (8,))]
        optimizer.zero_grad(set_to_none=True)
        loss = model(batch, labels=batch).loss
        if not torch.isfinite(loss):
            raise ValueError("NONFINITE_TRAINING_LOSS")
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        last_loss = loss.item()
        if (step + 1) % 5 == 0 or step + 1 == job["steps"]:
            checkpoint = directory / f"checkpoint-{step+1}.pt"
            temp = directory / (checkpoint.name + ".tmp")
            torch.save({"model": model.state_dict(), "optimizer": optimizer.state_dict(),
                        "rng": torch.get_rng_state()}, temp)
            with temp.open("rb") as stream:
                os.fsync(stream.fileno())
            os.replace(temp, checkpoint)
            sync_directory(directory)
            atomic_json(checkpoint_manifest, {"jobId": job["id"], "recipe": RECIPE,
                        "step": step + 1, "sha256": digest(checkpoint)})
            for old in directory.glob("checkpoint-*.pt"):
                if old != checkpoint:
                    old.unlink()
            heartbeat()
    model.eval()
    with torch.no_grad():
        final_loss = model(heldout, labels=heldout).loss.item()
    model.save_pretrained(directory / "model", safe_serialization=True)
    atomic_json(directory / "vocabulary.json", vocabulary)
    files = sorted((directory / "model").glob("*"))
    for path in files:
        if path.is_file():
            path.chmod(0o600)
            with path.open("rb") as stream:
                os.fsync(stream.fileno())
    sync_directory(directory / "model")
    result = {
        "system": "SHEIKHA_FOUNDRY_CELLS_SMOKE_V1", "jobId": job["id"],
        "status": "SMALL_RANDOM_INIT_TRAINING_EXECUTED_NOT_PROMOTED",
        "recipe": RECIPE, "parameters": sum(p.numel() for p in model.parameters()),
        "device": "cpu", "steps": job["steps"], "resumedFromStep": start,
        "trainingRecords": len(train), "heldoutRecords": len(heldout),
        "datasetOrigin": "GENERATED_ARITHMETIC_NO_CUSTOMER_OR_PROVIDER_CONTENT",
        "initialHeldoutLossThisAttempt": initial_loss, "finalHeldoutLoss": final_loss,
        "lastTrainingLoss": last_loss, "seconds": time.monotonic() - started,
        "artifactHashes": {p.name: digest(p) for p in files if p.is_file()},
        "productionApproved": False, "largeLlmTrained": False,
        "paidResourceProvisioned": False, "externalDataTransfer": False,
    }
    atomic_json(directory / "result.json", result)
    return result


def worker_once(home, db, trainer=train_smoke):
    if shutil.disk_usage(home).free < 1024**3:
        raise ValueError("ONE_GIB_FREE_DISK_REQUIRED")
    memory = Path("/proc/meminfo").read_text().splitlines()
    available_kib = next((int(line.split()[1]) for line in memory if line.startswith("MemAvailable:")), 0)
    if available_kib < 2 * 1024**2:
        raise ValueError("TWO_GIB_AVAILABLE_RAM_REQUIRED")
    job = claim(db)
    if not job:
        return {"status": "IDLE_OR_WORKER_ALREADY_ACTIVE", "trainingExecuted": False}

    def heartbeat():
        db.execute("UPDATE jobs SET updated=? WHERE id=? AND state='RUNNING'",
                   (time.time(), job["id"]))

    try:
        result = trainer(home, job, heartbeat)
        db.execute("UPDATE jobs SET state='SUCCEEDED',updated=?,result=? WHERE id=?",
                   (time.time(), json.dumps(result), job["id"]))
        return result
    except BaseException as exc:
        state = "INTERRUPTED" if isinstance(exc, (KeyboardInterrupt, SystemExit)) else "FAILED"
        db.execute("UPDATE jobs SET state=?,updated=?,error=? WHERE id=?",
                   (state, time.time(), type(exc).__name__, job["id"]))
        raise


def status(db):
    counts = dict(db.execute("SELECT state,count(*) FROM jobs GROUP BY state").fetchall())
    return {
        "system": "SHEIKHA_FOUNDRY_CELLS_V1", "queue": counts,
        "durability": "SQLITE_WAL_FULL_SINGLE_HOST_NOT_NETWORK_FILESYSTEM",
        "maxConcurrentSmokeWorkers": 1, "perWorkerCpuThreads": 2,
        "maxPendingSmokeJobs": MAX_PENDING,
        "executableRecipes": [RECIPE], "automaticPromotion": False,
        "externalProvisioning": False, "multiTenantSecurityBoundary": False,
        "gpuTraining": "EXISTING_GOVERNED_SCHEDULER_SEPARATE_QUALITY_GATE",
        "largeDistributedTrainingReady": False,
    }


def main():
    os.umask(0o077)
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--home", default=str(DEFAULT_HOME))
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("init")
    commands.add_parser("status")
    enqueue_parser = commands.add_parser("enqueue-smoke")
    enqueue_parser.add_argument("--steps", type=int, default=20)
    commands.add_parser("worker-once")
    recover_parser = commands.add_parser("recover")
    recover_parser.add_argument("job_id")
    args = parser.parse_args()
    home = private_home(args.home)
    with connect(home) as db:
        if args.command == "enqueue-smoke":
            output = {"jobId": enqueue(db, args.steps), "status": "QUEUED_NOT_EXECUTED"}
        elif args.command == "worker-once":
            output = worker_once(home, db)
        elif args.command == "recover":
            recover(db, args.job_id)
            output = {"jobId": args.job_id, "status": "QUEUED_FOR_EXPLICIT_RETRY"}
        else:
            output = status(db)
        print(json.dumps(output, indent=2, ensure_ascii=True, allow_nan=False))


if __name__ == "__main__":
    main()
