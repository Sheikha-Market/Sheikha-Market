#!/bin/bash
# SHEIKHA BOOT ISO BUILDER - CUSTOM PER USER - BOUND 741
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
KERNEL_ROOT="$(dirname "$SCRIPT_DIR")"
OUT_DIR="$SCRIPT_DIR"
VERSION="v1-BOUND-741-CUSTOM-FACTORY-$(date +%Y%m%d)"
ISO_NAME="sheikha-native-${VERSION}.iso"
echo "🕋 Building SHEIKHA BOOT ISO - Custom Factory - BOUND 741 - غرسها من شيخه وباسم شيخه"

# === تخصيص حسب المستخدم إذا مرر serial ===
SERIAL=${1:-}
if [ -n "$SERIAL" ]; then
  echo "Custom ISO for SERIAL: $SERIAL"
  ISO_CFG="$KERNEL_ROOT/boot/iso_configs/${SERIAL}.iso.json"
  if [ -f "$ISO_CFG" ]; then
    echo "Found ISO config: $ISO_CFG"
    cat "$ISO_CFG"
  fi
fi

# === بناء EFI ===
mkdir -p /tmp/sheikha-iso/EFI/BOOT /tmp/sheikha-iso/EFI/Sheikha
cp "$SCRIPT_DIR/sheikha_boot_splash.txt" /tmp/sheikha-iso/
cp "$SCRIPT_DIR/startup.nsh" /tmp/sheikha-iso/
echo "EFI placeholder BOUND 741 - غرسها من شيخه" > /tmp/sheikha-iso/EFI/BOOT/BOOTX64.EFI
echo "EFI placeholder BOUND 741 - توحيد لله" > /tmp/sheikha-iso/EFI/Sheikha/sheikha.efi

# === ISO - tar.gz مؤقتا حتى تثبيت xorriso ===
tar -czf "$OUT_DIR/${ISO_NAME}.tar.gz" -C /tmp/sheikha-iso .
echo "✅ ISO Built: $OUT_DIR/${ISO_NAME}.tar.gz - BOUND - غرسها من شيخه"
ls -lh "$OUT_DIR/${ISO_NAME}.tar.gz"
# إذا كان serial مخصص انسخ كمان نسخة باسمه
if [ -n "$SERIAL" ]; then
  cp "$OUT_DIR/${ISO_NAME}.tar.gz" "$OUT_DIR/sheikha-native-${SERIAL}-BOUND.iso.tar.gz"
  echo "✅ Custom ISO for $SERIAL: $OUT_DIR/sheikha-native-${SERIAL}-BOUND.iso.tar.gz"
fi
rm -rf /tmp/sheikha-iso
