#!/usr/bin/env python3
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import argparse
import hashlib
import json
import re
import sys

def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()

    with path.open("rb") as handle:
        while True:
            chunk = handle.read(1024 * 1024)
            if not chunk:
                break
            digest.update(chunk)

    return digest.hexdigest()

def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Index an existing local EDK II checkout without network access "
            "or source modification."
        )
    )
    parser.add_argument("source", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    source = args.source.expanduser().resolve()
    output = args.output.expanduser().resolve()

    if not source.is_dir():
        raise SystemExit(f"EDK II source directory not found: {source}")

    package_dirs = sorted(
        path
        for path in source.iterdir()
        if path.is_dir() and (
            path.name.endswith("Pkg") or path.name == "BaseTools"
        )
    )

    records = []
    protocol_header_count = 0
    ppi_header_count = 0
    guid_header_count = 0
    dec_count = 0
    dsc_count = 0
    fdf_count = 0
    inf_count = 0

    for package in package_dirs:
        package_record = {
            "name": package.name,
            "path": str(package),
            "decFiles": [],
            "dscFiles": [],
            "fdfFiles": [],
            "infFileCount": 0,
            "protocolHeaderCount": 0,
            "ppiHeaderCount": 0,
            "guidHeaderCount": 0,
        }

        for path in package.rglob("*"):
            if not path.is_file():
                continue

            suffix = path.suffix.lower()
            relative = str(path.relative_to(source))

            if suffix == ".dec":
                package_record["decFiles"].append(relative)
                dec_count += 1
            elif suffix == ".dsc":
                package_record["dscFiles"].append(relative)
                dsc_count += 1
            elif suffix == ".fdf":
                package_record["fdfFiles"].append(relative)
                fdf_count += 1
            elif suffix == ".inf":
                package_record["infFileCount"] += 1
                inf_count += 1

            parts = {part.lower() for part in path.parts}

            if suffix == ".h" and "protocol" in parts:
                package_record["protocolHeaderCount"] += 1
                protocol_header_count += 1
            elif suffix == ".h" and "ppi" in parts:
                package_record["ppiHeaderCount"] += 1
                ppi_header_count += 1
            elif suffix == ".h" and "guid" in parts:
                package_record["guidHeaderCount"] += 1
                guid_header_count += 1

        records.append(package_record)

    record = {
        "schemaVersion": "1.0.0",
        "system": "SHEIKHA_EDK2_LOCAL_SOURCE_INDEX_V1",
        "classification": "LOCAL_SOURCE_INVENTORY_ONLY",
        "source": str(source),
        "sourceModified": False,
        "networkAccessUsed": False,
        "packageCount": len(records),
        "decFileCount": dec_count,
        "dscFileCount": dsc_count,
        "fdfFileCount": fdf_count,
        "infFileCount": inf_count,
        "protocolHeaderCount": protocol_header_count,
        "ppiHeaderCount": ppi_header_count,
        "guidHeaderCount": guid_header_count,
        "packages": records,
        "registrationDoesNotMeanImplemented": True,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    }

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(record, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"EDK2_LOCAL_PACKAGE_COUNT={len(records)}")
    print(f"EDK2_DEC_FILE_COUNT={dec_count}")
    print(f"EDK2_DSC_FILE_COUNT={dsc_count}")
    print(f"EDK2_FDF_FILE_COUNT={fdf_count}")
    print(f"EDK2_INF_FILE_COUNT={inf_count}")
    print(f"EDK2_PROTOCOL_HEADER_COUNT={protocol_header_count}")
    print(f"EDK2_PPI_HEADER_COUNT={ppi_header_count}")
    print(f"EDK2_GUID_HEADER_COUNT={guid_header_count}")
    print("SOURCE_MODIFIED=false")
    print("NETWORK_ACCESS_USED=false")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
