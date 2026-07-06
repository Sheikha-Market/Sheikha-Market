#!/usr/bin/env bash
set -euo pipefail

echo "=== DISK ==="
df -h /

echo
echo "=== BIGGEST HOME ITEMS ==="
du -xh ~ --max-depth=2 2>/dev/null | sort -hr | head -40

echo
echo "=== ARCHIVES TO REVIEW ==="
du -sh ~/sheikha-archives-to-review ~/sheikha-runtime-archive ~/sheikha-archives 2>/dev/null || true

echo
echo "=== CRITICAL LARGE FILES ==="
ls -lh ~/Salman_Alrajeh_Eternal_Legacy.zip 2>/dev/null || true
ls -lh ~/sheikha-archives-to-review/*.tar.gz 2>/dev/null || true

echo
echo "DECISION:"
echo "No files deleted."
echo "Move large archives to external disk, or delete only after manual confirmation."
