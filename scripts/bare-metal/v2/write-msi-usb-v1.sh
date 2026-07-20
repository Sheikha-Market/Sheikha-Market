#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
IMAGE="$ROOT/bare-metal/images/v2/sheikha-sovereign-bare-metal-v2-msi-usb-gpt-v1.img"
MANIFEST="$ROOT/runtime/bare-metal/v2/physical-trial/v1/sheikha-v2-msi-usb-gpt-v1-manifest.json"
DEVICE=""
ACCEPTANCE=""

usage() {
  printf '%s\n' \
    'Usage:' \
    '  sudo ./scripts/bare-metal/v2/write-msi-usb-v1.sh \' \
    '    --device /dev/sdX \' \
    '    --accept "ACCEPT SHEIKHA MSI USB V1 SHA256:<hash> DEVICE:/dev/sdX"' \
    '' \
    'This writes the complete image to one disposable USB disk.' \
    'It refuses mounted, read-only, non-USB, partition, and system devices.'
}

while (($#)); do
  case "$1" in
    --device)
      DEVICE="${2:-}"
      shift 2
      ;;
    --accept)
      ACCEPTANCE="${2:-}"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      printf 'ERROR=UNKNOWN_ARGUMENT:%s\n' "$1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

[[ -f "$IMAGE" ]] || {
  printf 'ERROR=IMAGE_NOT_FOUND:%s\n' "$IMAGE" >&2
  exit 3
}
[[ -f "$MANIFEST" ]] || {
  printf 'ERROR=MANIFEST_NOT_FOUND:%s\n' "$MANIFEST" >&2
  exit 3
}
[[ -n "$DEVICE" && "$DEVICE" == /dev/* ]] || {
  printf 'ERROR=EXACT_DEVICE_REQUIRED\n' >&2
  exit 4
}
[[ -b "$DEVICE" ]] || {
  printf 'ERROR=TARGET_IS_NOT_A_BLOCK_DEVICE:%s\n' "$DEVICE" >&2
  exit 4
}

DEVICE="$(readlink -f "$DEVICE")"
DEVICE_TYPE="$(lsblk -dn -o TYPE "$DEVICE" | tr -d '[:space:]')"
DEVICE_RM="$(lsblk -dn -o RM "$DEVICE" | tr -d '[:space:]')"
DEVICE_RO="$(lsblk -dn -o RO "$DEVICE" | tr -d '[:space:]')"
DEVICE_TRAN="$(lsblk -dn -o TRAN "$DEVICE" | tr -d '[:space:]')"
DEVICE_SIZE="$(lsblk -bdn -o SIZE "$DEVICE" | tr -d '[:space:]')"
IMAGE_SIZE="$(stat -c '%s' "$IMAGE")"
IMAGE_SHA256="$(sha256sum "$IMAGE" | awk '{print $1}')"
MANIFEST_SHA256="$(node -e '
  const fs = require("fs");
  const value = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  process.stdout.write(value.artifacts[0].sha256);
' "$MANIFEST")"

[[ "$DEVICE_TYPE" == disk ]] || {
  printf 'ERROR=TARGET_MUST_BE_A_WHOLE_DISK:%s\n' "$DEVICE_TYPE" >&2
  exit 5
}
[[ "$DEVICE_RO" == 0 ]] || {
  printf 'ERROR=TARGET_IS_READ_ONLY\n' >&2
  exit 5
}
[[ "$DEVICE_RM" == 1 || "$DEVICE_TRAN" == usb ]] || {
  printf 'ERROR=TARGET_IS_NOT_REMOVABLE_OR_USB:RM=%s:TRAN=%s\n' \
    "$DEVICE_RM" "$DEVICE_TRAN" >&2
  exit 5
}
[[ "$DEVICE_SIZE" -ge "$IMAGE_SIZE" ]] || {
  printf 'ERROR=TARGET_TOO_SMALL\n' >&2
  exit 5
}
[[ "$IMAGE_SHA256" == "$MANIFEST_SHA256" ]] || {
  printf 'ERROR=IMAGE_MANIFEST_HASH_MISMATCH\n' >&2
  exit 6
}

ROOT_SOURCE="$(findmnt -n -o SOURCE / || true)"
ROOT_DISK=""
if [[ -n "$ROOT_SOURCE" ]]; then
  ROOT_PARENT="$(lsblk -ndo PKNAME "$ROOT_SOURCE" 2>/dev/null | head -n 1 || true)"
  if [[ -n "$ROOT_PARENT" ]]; then
    ROOT_DISK="/dev/$ROOT_PARENT"
  else
    ROOT_DISK="$(readlink -f "$ROOT_SOURCE" 2>/dev/null || true)"
  fi
fi
[[ -z "$ROOT_DISK" || "$DEVICE" != "$ROOT_DISK" ]] || {
  printf 'ERROR=SYSTEM_DISK_REJECTED:%s\n' "$DEVICE" >&2
  exit 7
}

MOUNTED="$(lsblk -nr -o MOUNTPOINTS "$DEVICE" | sed '/^[[:space:]]*$/d')"
[[ -z "$MOUNTED" ]] || {
  printf 'ERROR=TARGET_OR_CHILD_PARTITION_IS_MOUNTED\n%s\n' "$MOUNTED" >&2
  exit 7
}

EXPECTED="ACCEPT SHEIKHA MSI USB V1 SHA256:$IMAGE_SHA256 DEVICE:$DEVICE"
[[ "$ACCEPTANCE" == "$EXPECTED" ]] || {
  printf 'ERROR=WRITTEN_ACCEPTANCE_MISMATCH\n' >&2
  printf 'REQUIRED_ACCEPTANCE=%s\n' "$EXPECTED" >&2
  exit 8
}

[[ "${EUID:-$(id -u)}" -eq 0 ]] || {
  printf 'ERROR=ROOT_REQUIRED_FOR_APPROVED_DEVICE_WRITE\n' >&2
  exit 9
}

printf 'TARGET=%s\n' "$DEVICE"
printf 'IMAGE_SHA256=%s\n' "$IMAGE_SHA256"
printf 'WRITE_SCOPE=ONE_APPROVED_REMOVABLE_USB_DISK\n'
dd if="$IMAGE" of="$DEVICE" bs=4M conv=fsync status=progress
sync
printf 'SHEIKHA_MSI_USB_V1_WRITE_COMPLETED=true\n'
printf 'NEXT=Use MSI F11 and choose the UEFI USB entry. Do not change the internal boot order.\n'
