"""Safely preview or add 55 metadata records; no model training or deployment."""

import argparse
import datetime
import hashlib
import json
import math
import os
from pathlib import Path
import stat
import sys
import tempfile

# Static definitions copied from add_advanced_weights.py without executing it.
sheikha_lang = [
    ("sheikha-lang-compiler-core", "مترجم لغة شيخة الأساسي - Sheikha Lang Compiler", 80000, "HS 8524 Software", "SBC Compiler", "206 bones typing"),
    ("sheikha-lang-lexer-parser", "المحلل اللغوي والنحوي للغة شيخة", 60000, "HS 8524 Lexer", "SBC Parser", "600 muscles logic"),
    ("sheikha-lang-quranic-syntax", "قواعد نحوية قرآنية - كتابة كود بالعربية", 90000, "HS 8524 Quranic", "SBC Syntax", "86B neurons arabic"),
    ("sheikha-lang-halal-runtime", "بيئة تشغيل حلال - لا ربا لا غرر", 75000, "HS 8524 Halal", "SBC Runtime", "100k heartbeats halal"),
    ("sheikha-lang-sharia-type-system", "نظام أنواع شرعي - Sharia Type System", 70000, "HS 8524 Types", "SBC Types", "206 bones sharia"),
    ("sheikha-lang-ast-quranic", "شجرة البنية القرآنية AST", 65000, "HS 8524 AST", "SBC AST", "600 muscles structure"),
    ("sheikha-lang-ide-vscode", "بيئة تطوير متكاملة للغة شيخة VSCode", 55000, "HS 8524 IDE", "SBC IDE", "86B neurons IDE"),
    ("sheikha-lang-package-manager", "مدير حزم شيخة - Sheikha Package Manager", 50000, "HS 8524 Packages", "SBC Packages", "100k heartbeats package"),
    ("sheikha-lang-stdlib-islamic", "المكتبة القياسية الإسلامية", 85000, "HS 8524 StdLib", "SBC Library", "206 bones library"),
    ("sheikha-lang-docs-arabic", "توثيق عربي كامل للغة شيخة", 40000, "HS 4901 Docs", "SBC Docs", "600 muscles docs"),
]

all_langs = [
    ("prog-python-advanced", "بايثون متقدم - AI/ML", 70000, "HS 8524 Python", "SBC AI", "86B neurons python"),
    ("prog-rust-systems", "رست - أنظمة آمنة", 80000, "HS 8524 Rust", "SBC Systems", "206 bones rust"),
    ("prog-go-cloud", "جو - حوسبة سحابية", 65000, "HS 8524 Go", "SBC Cloud", "600 muscles go"),
    ("prog-typescript-fullstack", "تايبسكريبت - فول ستاك", 60000, "HS 8524 TS", "SBC Fullstack", "86B neurons TS"),
    ("prog-c-cpp-embedded", "C/C++ - أنظمة مدمجة", 85000, "HS 8524 C++", "SBC Embedded", "100k heartbeats embedded"),
    ("prog-solidity-blockchain", "سوليديتي - بلوك تشين", 90000, "HS 8524 Solidity", "SBC Blockchain", "206 bones solidity"),
    ("prog-swift-kotlin-mobile", "سويفت وكوتلن - موبايل", 55000, "HS 8524 Mobile", "SBC Mobile", "600 muscles mobile"),
    ("prog-java-enterprise", "جافا - مؤسسات", 60000, "HS 8524 Java", "SBC Enterprise", "86B neurons java"),
    ("prog-sql-nosql-data", "قواعد بيانات متقدمة", 70000, "HS 8524 DB", "SBC Data", "100k heartbeats data"),
    ("prog-wasm-edge", "WebAssembly - حواف", 75000, "HS 8524 WASM", "SBC Edge", "206 bones wasm"),
    ("prog-assembly-optimization", "أسمبلي - تحسين قصوى", 80000, "HS 8524 ASM", "SBC Optimization", "600 muscles asm"),
    ("prog-haskell-functional", "هاسكل - برمجة وظيفية", 65000, "HS 8524 Haskell", "SBC Functional", "86B neurons functional"),
    ("prog-cuda-gpu", "كودا - GPU", 85000, "HS 8524 CUDA", "SBC GPU", "100k heartbeats GPU"),
    ("prog-verilog-hardware", "فيريلوج - عتاد", 80000, "HS 8524 Verilog", "SBC Hardware", "206 bones hardware"),
    ("prog-all-langs-polyglot", "بوليجلوت - كل اللغات", 100000, "HS 8524 Polyglot", "SBC Polyglot", "600 muscles polyglot"),
]

advanced_compute = [
    ("compute-quantum-supremacy", "حوسبة كمية - تفوق كمي", 150000, "HS 8471 Quantum", "SBC Quantum", "86B neurons quantum"),
    ("compute-supercomputer-hpc", "حاسوب فائق HPC - Exascale", 120000, "HS 8471 HPC", "SBC HPC", "206 bones HPC"),
    ("compute-neuromorphic-brain", "حوسبة عصبية - محاكاة دماغ", 130000, "HS 8471 Neuromorphic", "SBC Brain", "86B neurons brain"),
    ("compute-photonic-light", "حوسبة ضوئية - بالضوء", 110000, "HS 8471 Photonic", "SBC Photonic", "600 muscles light"),
    ("compute-dna-biological", "حوسبة حيوية DNA", 100000, "HS 8471 DNA", "SBC BioCompute", "100k heartbeats DNA"),
    ("compute-edge-fog", "حوسبة حافة وضباب", 70000, "HS 8471 Edge", "SBC Edge", "206 bones edge"),
    ("compute-confidential-tee", "حوسبة سرية TEE", 80000, "HS 8471 TEE", "SBC Confidential", "600 muscles confidential"),
    ("compute-serverless-faas", "بدون خادم FaaS", 60000, "HS 8471 FaaS", "SBC Serverless", "86B neurons faas"),
    ("compute-distributed-grid", "حوسبة موزعة Grid", 75000, "HS 8471 Grid", "SBC Distributed", "100k heartbeats grid"),
    ("compute-ai-supercluster", "عنقود ذكاء خارق", 140000, "HS 8471 AI Cluster", "SBC Supercluster", "206 bones supercluster"),
]

advanced_eng = [
    ("eng-aerospace-orbital", "هندسة فضائية مدارية", 130000, "HS 8802 Aerospace", "SBC Orbital", "600 muscles aerospace"),
    ("eng-nano-molecular", "هندسة نانوية جزيئية", 120000, "HS 8541 Nano", "SBC Nano", "86B neurons nano"),
    ("eng-robotics-humanoid", "روبوتات شبيهة بالإنسان", 110000, "HS 8479 Humanoid", "SBC Humanoid", "206 bones humanoid"),
    ("eng-biomedical-bionic", "هندسة طبية حيوية - أطراف صناعية", 100000, "HS 9021 Bionic", "SBC Bionic", "100k heartbeats bionic"),
    ("eng-nuclear-fusion", "هندسة اندماج نووي", 150000, "HS 8401 Fusion", "SBC Fusion", "600 muscles fusion"),
    ("eng-civil-smartcity", "هندسة مدنية مدينة ذكية 【entity-NEOM¦canonical_name=NEOM】", 90000, "HS 7308 SmartCity", "SBC SmartCity", "206 bones smartcity"),
    ("eng-materials-metamaterials", "مواد خارقة Metamaterials", 85000, "HS 3921 Metamaterials", "SBC Materials", "86B neurons materials"),
    ("eng-optical-lidar", "هندسة بصرية ليدار", 70000, "HS 9013 Lidar", "SBC Optical", "600 muscles optical"),
    ("eng-acoustic-quantum", "هندسة صوتية كمية", 65000, "HS 8518 Acoustic", "SBC Acoustic", "100k heartbeats acoustic"),
    ("eng-genetic-crispr", "هندسة وراثية كريسبر", 110000, "HS 3822 CRISPR", "SBC Genetic", "206 bones genetic"),
]

advanced_mgmt = [
    ("mgmt-agile-scrum-sovereign", "إدارة رشيقة سيادية", 60000, "HS 8524 Agile", "SBC Agile", "86B neurons agile"),
    ("mgmt-okrs-kpi-quantum", "أهداف كمية OKRs كمية", 55000, "HS 8524 OKR", "SBC OKR", "600 muscles okr"),
    ("mgmt-supply-chain-ai", "سلسلة إمداد بالذكاء", 80000, "HS 8428 Supply", "SBC SupplyChain", "206 bones supply"),
    ("mgmt-finance-defi-halal", "مالية لامركزية حلال DeFi", 90000, "HS 8470 DeFi", "SBC HalalFi", "100k heartbeats halalfi"),
    ("mgmt-hr-talent-neural", "موارد بشرية عصبية", 50000, "HS 8524 HR", "SBC HR", "86B neurons HR"),
    ("mgmt-risk-quantum", "إدارة مخاطر كمية", 70000, "HS 8524 Risk", "SBC Risk", "600 muscles risk"),
    ("mgmt-product-exponential", "إدارة منتج أسية", 75000, "HS 8524 Product", "SBC Product", "206 bones product"),
    ("mgmt-operations-sre", "تشغيل SRE موثوقية", 65000, "HS 8524 SRE", "SBC SRE", "100k heartbeats SRE"),
    ("mgmt-strategy-neom", "استراتيجية نيوم 2030", 100000, "HS 8524 Strategy", "SBC Strategy", "86B neurons strategy"),
    ("mgmt-governance-quranic", "حوكمة قرآنية - BOUND_BY_QURAN_SUNNAH", 120000, "HS 8524 Governance", "SBC Governance", "206 bones governance"),
]

all_new = sheikha_lang + all_langs + advanced_compute + advanced_eng + advanced_mgmt
CONTAINERS = ("weights", "ledger", "records", "blocks")


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON key: {key}")
        result[key] = value
    return result


def reject_constant(value):
    raise ValueError(f"Invalid JSON number: {value}")


def records_view(data):
    """Return the original record collection and optional wrapper, without migration."""
    if isinstance(data, list):
        return data, None
    if not isinstance(data, dict):
        raise ValueError("Registry must be an object or a list")
    containers = [key for key in CONTAINERS if key in data
                  and isinstance(data[key], (dict, list))
                  and not (isinstance(data[key], dict) and "shk_reward" in data[key])]
    if len(containers) > 1:
        raise ValueError("Ambiguous registry: multiple record containers")
    if containers:
        key = containers[0]
        other_records = [name for name, value in data.items() if name != key
                         and isinstance(value, dict) and "shk_reward" in value]
        if other_records:
            raise ValueError("Ambiguous registry: wrapped and flat records mixed")
        return data[key], data
    return data, None


def validate_records(records):
    values = records.values() if isinstance(records, dict) else records
    for index, record in enumerate(values):
        if not isinstance(record, dict):
            raise ValueError(f"Record {index} must be an object")
        reward = record.get("shk_reward")
        if (isinstance(reward, bool) or not isinstance(reward, (int, float))
                or (isinstance(reward, float) and not math.isfinite(reward))
                or reward < 0):
            raise ValueError(f"Record {index} has an invalid shk_reward")


def metadata_record(spec, index):
    id_, name, shk, hs, sbc, body = spec
    metadata = {
        "id": id_, "name": name, "shk_reward": shk,
        "hs_chapter": hs, "sbc_clause": sbc, "body_twin_effort": body,
        "seal": "BOUND_BY_QURAN_SUNNAH - ATOM_WATER_RASUL_JANNAH_SEALED",
    }
    canonical = json.dumps(metadata, ensure_ascii=False, sort_keys=True,
                           separators=(",", ":"), allow_nan=False).encode("utf-8")
    return {
        **metadata, "index": index,
        "weight_hash": hashlib.sha256(canonical).hexdigest(),
        "hash_scope": "metadata_only_not_neural_tensors",
        "hash_algorithm": "sha256", "hash_fields": sorted(metadata),
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "amoy_bridge": {"ready": False, "chain": "Polygon Amoy",
                        "contract": "WeightRegistry", "status": "not_deployed"},
    }


def file_identity(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_size,
            info.st_mtime_ns, info.st_ctime_ns)


def snapshot(path):
    info = path.lstat()
    if not stat.S_ISREG(info.st_mode):
        raise ValueError("Registry must be a regular file, not a symlink")
    raw = path.read_bytes()
    if file_identity(info) != file_identity(path.lstat()):
        raise RuntimeError("Registry changed while being read; no update made")
    return raw, info


def require_unchanged(path, original, info):
    current, current_info = snapshot(path)
    if current != original or file_identity(current_info) != file_identity(info):
        raise RuntimeError("Registry changed since preview; no update made")


def atomic_write(path, data, original, info):
    payload = (json.dumps(data, ensure_ascii=False, indent=2, allow_nan=False)
               + "\n").encode("utf-8")
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=path.parent,
                                         prefix=f".{path.name}.pending-",
                                         delete=False) as output:
            temporary = Path(output.name)
            os.fchmod(output.fileno(), stat.S_IMODE(info.st_mode))
            output.write(payload)
            output.flush()
            os.fsync(output.fileno())
        require_unchanged(path, original, info)
        with tempfile.NamedTemporaryFile(dir=path.parent,
                                         prefix=f"{path.name}.backup-",
                                         delete=False) as backup:
            backup.write(original)
            backup.flush()
            os.fsync(backup.fileno())
            backup_path = Path(backup.name)
        require_unchanged(path, original, info)
        os.replace(temporary, path)
        temporary = None
        return backup_path
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--registry", type=Path,
                        default=Path(__file__).absolute().parent / "blockchain/registry.json")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--dry-run", action="store_true", help="Preview only (default)")
    mode.add_argument("--apply", action="store_true", help="Write with a unique backup")
    parser.add_argument("--exclude-id", action="append", default=[],
                        help="Exclude a proposed ID; repeat for multiple exclusions")
    args = parser.parse_args(argv)
    try:
        proposal_ids = {spec[0] for spec in all_new}
        if len(proposal_ids) != len(all_new):
            raise ValueError("Proposal contains duplicate IDs")
        unknown = set(args.exclude_id) - proposal_ids
        if unknown:
            raise ValueError("Unknown excluded IDs: " + ", ".join(sorted(unknown)))
        original, info = snapshot(args.registry)
        data = json.loads(original, object_pairs_hook=unique_object,
                          parse_constant=reject_constant)
        records, wrapper = records_view(data)
        validate_records(records)
        values = list(records.values()) if isinstance(records, dict) else records
        existing_count = len(records)
        existing_ids = set(records) if isinstance(records, dict) else set()
        for record in values:
            for field in ("id", "code"):
                if isinstance(record.get(field), str):
                    existing_ids.add(record[field])
        added = skipped = 0
        excluded = set(args.exclude_id)
        for spec in all_new:
            if spec[0] in excluded:
                continue
            if spec[0] in existing_ids:
                skipped += 1
                continue
            record = metadata_record(spec, len(records) + 1)
            if isinstance(records, dict):
                records[spec[0]] = record
            else:
                records.append(record)
            existing_ids.add(spec[0])
            added += 1
        values = records.values() if isinstance(records, dict) else records
        total_shk = sum(record["shk_reward"] for record in values)
        if wrapper is not None and added:
            for key, value in (("total_weights", len(records)),
                               ("total_shk_rewards", total_shk)):
                if key in wrapper:
                    wrapper[key] = value
        print("Mode: " + ("apply" if args.apply else "dry-run (no files changed)"))
        print(f"Existing weights: {existing_count}")
        print(f"Added: {added}; Skipped existing: {skipped}; Excluded: {len(excluded)}")
        print(f"Total weights: {len(records)}")
        print(f"Total SHK: {total_shk}")
        print("Counts and SHA-256 describe metadata; no neural weights, tokens or deployment are created.")
        if args.apply and added:
            backup = atomic_write(args.registry, data, original, info)
            print(f"Backup: {backup}")
        elif args.apply:
            print("No changes needed; no backup created.")
        return 0
    except (OSError, ValueError, RuntimeError) as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
