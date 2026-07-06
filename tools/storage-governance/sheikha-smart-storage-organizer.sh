#!/usr/bin/env bash
set -euo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
REPORT_DIR="$HOME/Projects/sheikha/sheikha-main-portal/runtime/storage-governance/reports"
mkdir -p "$REPORT_DIR"

echo "Detecting external disks..."

EXTERNAL_ROOT="$(df -h | awk '$6 ~ /^\/media|^\/mnt|^\/run\/media/ {print $6; exit}')"

if [ -z "${EXTERNAL_ROOT:-}" ]; then
  echo "ERROR: External disk not detected under /media, /mnt, or /run/media"
  echo "Run: lsblk -f"
  exit 1
fi

DEST="$EXTERNAL_ROOT/SHEIKHA_SMART_ARCHIVE"
LOCAL_KEEP="$HOME/sheikha-critical-keep"
mkdir -p "$DEST"/{archives,legacy,checksums,reports} "$LOCAL_KEEP"/{reports,manifests,recovery}

echo "External disk: $EXTERNAL_ROOT"
echo "Destination: $DEST"

REPORT="$REPORT_DIR/storage-organizer-$TS.md"

{
  echo "# SHEIKHA SMART STORAGE ORGANIZER REPORT"
  echo
  echo "Timestamp: $TS"
  echo "External Disk: $EXTERNAL_ROOT"
  echo
  echo "## Disk Before"
  df -h /
  echo
  echo "## Largest Items"
  du -xh "$HOME" --max-depth=2 2>/dev/null | sort -hr | head -40
} > "$REPORT"

copy_with_checksum () {
  SRC="$1"
  SUBDIR="$2"

  if [ ! -e "$SRC" ]; then
    echo "Skip missing: $SRC"
    return 0
  fi

  BASE="$(basename "$SRC")"
  TARGET="$DEST/$SUBDIR/$BASE"

  echo "Copying: $SRC"
  echo "To:      $TARGET"

  rsync -ah --info=progress2 "$SRC" "$TARGET"

  sha256sum "$SRC" > "$DEST/checksums/$BASE.source.sha256"
  sha256sum "$TARGET" > "$DEST/checksums/$BASE.external.sha256"

  echo "- Copied $SRC -> $TARGET" >> "$REPORT"
  echo "  - Source checksum: $DEST/checksums/$BASE.source.sha256" >> "$REPORT"
  echo "  - External checksum: $DEST/checksums/$BASE.external.sha256" >> "$REPORT"
}

copy_with_checksum "$HOME/Salman_Alrajeh_Eternal_Legacy.zip" "legacy"

for f in "$HOME"/sheikha-archives-to-review/*.tar.gz "$HOME"/sheikha-runtime-archive/*.tar.gz "$HOME"/sheikha-archives/*.tar.gz; do
  [ -e "$f" ] && copy_with_checksum "$f" "archives"
done

cp -a "$REPORT" "$LOCAL_KEEP/reports/"
cp -a "$REPORT" "$DEST/reports/"

git status --short > "$LOCAL_KEEP/manifests/git-status-$TS.txt" || true
df -h > "$LOCAL_KEEP/manifests/df-$TS.txt"
du -sh "$HOME"/* 2>/dev/null | sort -hr | head -80 > "$LOCAL_KEEP/manifests/home-size-$TS.txt"

echo
echo "DONE."
echo "No files deleted."
echo "Review report:"
echo "$REPORT"
echo
echo "After verification, deletion must be manual only."
