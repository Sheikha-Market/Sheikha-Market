#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

read_dmi_field() {
    local field_path="$1"
    if [[ -r "$field_path" ]]; then
        tr -d '\0' < "$field_path" | sed 's/^ *//;s/ *$//'
    fi
}

run_dmidecode_memory() {
    if ! command -v dmidecode >/dev/null 2>&1; then
        return 1
    fi

    if [[ "${EUID}" -eq 0 ]]; then
        dmidecode -t memory 2>/dev/null
        return 0
    fi

    if command -v sudo >/dev/null 2>&1 && sudo -n true >/dev/null 2>&1; then
        sudo -n dmidecode -t memory 2>/dev/null
        return 0
    fi

    return 1
}

to_gb_from_kb() {
    local kb="$1"
    awk -v kb="$kb" 'BEGIN { printf "%.1f", kb/1024/1024 }'
}

to_gb_from_mb() {
    local mb="$1"
    awk -v mb="$mb" 'BEGIN { printf "%.1f", mb/1024 }'
}

MANUFACTURER="$(read_dmi_field /sys/devices/virtual/dmi/id/sys_vendor || true)"
PRODUCT_NAME="$(read_dmi_field /sys/devices/virtual/dmi/id/product_name || true)"
PRODUCT_VERSION="$(read_dmi_field /sys/devices/virtual/dmi/id/product_version || true)"
BOARD_NAME="$(read_dmi_field /sys/devices/virtual/dmi/id/board_name || true)"
BIOS_VERSION="$(read_dmi_field /sys/devices/virtual/dmi/id/bios_version || true)"

TOTAL_MEM_KB="$(awk '/MemTotal:/ {print $2}' /proc/meminfo)"
TOTAL_MEM_GB="$(to_gb_from_kb "$TOTAL_MEM_KB")"

DMI_OUTPUT=""
HAS_DMI="false"
if DMI_OUTPUT="$(run_dmidecode_memory)"; then
    HAS_DMI="true"
fi

MAX_CAPACITY_RAW=""
MAX_CAPACITY_GB="unknown"
NUM_DEVICES="unknown"
INSTALLED_MODULES="unknown"
MEMORY_TYPES="unknown"
MODULE_SUMMARY="unknown"
FORM_FACTOR="unknown"

if [[ "$HAS_DMI" == "true" ]]; then
    MAX_CAPACITY_RAW="$(printf '%s\n' "$DMI_OUTPUT" | awk -F: '
        /Maximum Capacity:/ && $2 !~ /Unknown/ {gsub(/^ +| +$/, "", $2); print $2; exit}
    ')"

    if [[ -n "$MAX_CAPACITY_RAW" ]]; then
        if [[ "$MAX_CAPACITY_RAW" =~ ([0-9]+)[[:space:]]*GB ]]; then
            MAX_CAPACITY_GB="${BASH_REMATCH[1]}"
        elif [[ "$MAX_CAPACITY_RAW" =~ ([0-9]+)[[:space:]]*MB ]]; then
            MAX_CAPACITY_GB="$(to_gb_from_mb "${BASH_REMATCH[1]}")"
        elif [[ "$MAX_CAPACITY_RAW" =~ ([0-9]+)[[:space:]]*TB ]]; then
            MAX_CAPACITY_GB="$(( ${BASH_REMATCH[1]} * 1024 ))"
        fi
    fi

    NUM_DEVICES="$(printf '%s\n' "$DMI_OUTPUT" | awk -F: '
        /Number Of Devices:/ {gsub(/^ +| +$/, "", $2); print $2; exit}
    ')"
    NUM_DEVICES="${NUM_DEVICES:-unknown}"

    INSTALLED_MODULES="$(printf '%s\n' "$DMI_OUTPUT" | awk '
        /^Memory Device$/ {in_device=1; size=""; next}
        in_device && /^$/ {
            if (size != "" && size !~ /No Module Installed/ && size !~ /Not Installed/) count++;
            in_device=0;
        }
        in_device && /Size:/ {
            line=$0; sub(/^.*Size:[[:space:]]*/, "", line); size=line;
        }
        END { print count+0 }
    ')"

    MEMORY_TYPES="$(printf '%s\n' "$DMI_OUTPUT" | awk '
        /^Memory Device$/ {in_device=1; size=""; type=""; next}
        in_device && /^$/ {
            if (size != "" && size !~ /No Module Installed/ && size !~ /Not Installed/ && type != "") seen[type]=1;
            in_device=0;
        }
        in_device && /Size:/ {
            line=$0; sub(/^.*Size:[[:space:]]*/, "", line); size=line;
        }
        in_device && /^\tType:/ {
            line=$0; sub(/^.*Type:[[:space:]]*/, "", line); type=line;
        }
        END {
            out="";
            for (item in seen) {
                out = out (out ? ", " : "") item;
            }
            if (out == "") out = "unknown";
            print out;
        }
    ')"

    FORM_FACTOR="$(printf '%s\n' "$DMI_OUTPUT" | awk '
        /^Memory Device$/ {in_device=1; size=""; ff=""; next}
        in_device && /^$/ {
            if (size != "" && size !~ /No Module Installed/ && size !~ /Not Installed/ && ff != "") { print ff; exit }
            in_device=0;
        }
        in_device && /Size:/ {
            line=$0; sub(/^.*Size:[[:space:]]*/, "", line); size=line;
        }
        in_device && /Form Factor:/ {
            line=$0; sub(/^.*Form Factor:[[:space:]]*/, "", line); ff=line;
        }
    ')"
    FORM_FACTOR="${FORM_FACTOR:-unknown}"

    MODULE_SUMMARY="$(printf '%s\n' "$DMI_OUTPUT" | awk '
        function flush_device() {
            if (size != "" && size !~ /No Module Installed/ && size !~ /Not Installed/) {
                line = size;
                if (speed != "") line = line " @ " speed;
                if (locator != "") line = line " [" locator "]";
                lines[++count] = line;
            }
            size=""; speed=""; locator="";
        }
        /^Memory Device$/ { in_device=1; flush_device(); next }
        in_device && /^$/ { flush_device(); in_device=0; next }
        in_device && /Size:/ {
            line=$0; sub(/^.*Size:[[:space:]]*/, "", line); size=line;
        }
        in_device && /Speed:/ {
            line=$0; sub(/^.*Speed:[[:space:]]*/, "", line); speed=line;
        }
        in_device && /Locator:/ {
            line=$0; sub(/^.*Locator:[[:space:]]*/, "", line); locator=line;
        }
        END {
            flush_device();
            if (count == 0) {
                print "unknown";
            } else {
                for (i = 1; i <= count; i++) {
                    print lines[i];
                }
            }
        }
    ')"
fi

RECOMMENDATION="اطلب من الفني تأكيد DDR4 أو DDR5 ثم اشتر 64GB Kit = 2x32GB SO-DIMM."
RAM_TARGET="64GB (2x32GB) SO-DIMM"

if [[ "$MEMORY_TYPES" == *"DDR5"* ]]; then
    RECOMMENDATION="Crucial 64GB (2x32GB) SO-DIMM DDR5-5600 أو Kingston Fury Impact بنفس المواصفة."
    RAM_TARGET="64GB (2x32GB) SO-DIMM DDR5-5600"
elif [[ "$MEMORY_TYPES" == *"DDR4"* ]]; then
    RECOMMENDATION="Crucial 64GB (2x32GB) SO-DIMM DDR4-3200 أو Kingston Fury Impact بنفس المواصفة."
    RAM_TARGET="64GB (2x32GB) SO-DIMM DDR4-3200"
fi

MAX_NOTE=""
if [[ "$MAX_CAPACITY_GB" != "unknown" ]]; then
    if awk -v max="$MAX_CAPACITY_GB" 'BEGIN { exit !(max+0 < 64) }'; then
        MAX_NOTE="تنبيه: السعة القصوى الظاهرة أقل من 64GB، لا تشترِ قبل تأكيد فني مباشر."
    else
        MAX_NOTE="السعة القصوى الظاهرة تسمح غالبًا بالوصول إلى 64GB أو أكثر."
    fi
else
    MAX_NOTE="تعذر استخراج السعة القصوى تلقائيًا. شغّل السكربت بصلاحية sudo للحصول على تقرير أدق."
fi

echo "============================================================"
echo "SHEIKHA LAPTOP RAM CHECK"
echo "============================================================"
echo "Vendor            : ${MANUFACTURER:-unknown}"
echo "Product            : ${PRODUCT_NAME:-unknown} ${PRODUCT_VERSION:-}"
echo "Board              : ${BOARD_NAME:-unknown}"
echo "BIOS               : ${BIOS_VERSION:-unknown}"
echo "Current RAM        : ${TOTAL_MEM_GB} GB"
echo "Memory Type        : ${MEMORY_TYPES}"
echo "Form Factor        : ${FORM_FACTOR}"
echo "Memory Slots       : ${NUM_DEVICES}"
echo "Installed Modules  : ${INSTALLED_MODULES}"
echo "Max Capacity       : ${MAX_CAPACITY_GB} GB"
echo "------------------------------------------------------------"
echo "Installed DIMMs:"
printf '%s\n' "$MODULE_SUMMARY" | sed 's/^/  - /'
echo "------------------------------------------------------------"
echo "Recommended RAM    : ${RAM_TARGET}"
echo "Best Brand         : Crucial"
echo "Alt Brand          : Kingston Fury Impact"
echo "Max Capacity Note  : ${MAX_NOTE}"
echo "SSD Suggestion     : NVMe 2TB - Samsung 990 Pro / WD SN850X / Crucial T500"
echo "------------------------------------------------------------"
echo "Store Script:"
echo "  أريد ترقية اللابتوب إلى 64GB عبر 2x32 SO-DIMM، وأريد منكم"
echo "  تأكيد DDR4/DDR5 والحد الأقصى الرسمي قبل الدفع."

if [[ "$HAS_DMI" != "true" ]]; then
    echo "------------------------------------------------------------"
    echo "NOTE               : للحصول على نوع الرام والحد الأقصى بدقة أعلى،"
    echo "                     شغّل: sudo bash scripts/check-laptop-ram-upgrade.sh"
fi

echo "============================================================"