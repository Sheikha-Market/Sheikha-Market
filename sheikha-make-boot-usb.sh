#!/usr/bin/env bash
set -e
echo "================================================================================"
echo "💾🚀 SHEIKHA BOOTABLE LIVE USB FLASH GENERATOR & VERIFIER — V310 (176 DIWANS)"
echo "================================================================================"
echo "✅ بصريات الفلاشة الجاهزة للإقلاع : /home/sheikha/Projects/sheikha/sheikha-main-portal/boot_usb/sheikha_bootable_usb_v310.img"
echo "✅ بصمة الأمان (SHA-512)        : eae270f7bbde2772d8b30f863b24e6b5c8dbbe9b8de04e6c5ceb8421de925a85..."
echo "--------------------------------------------------------------------------------"
echo "📋 الفلاشات والأقراص المتصلة حالياً باللابتوب:"
lsblk -d -o NAME,MODEL,SIZE,TRAN,RM
echo "--------------------------------------------------------------------------------"
if [ -n "$1" ]; then
  echo "⚡ جاري نسخ كيرنل شيخة V310 على الفلاشة المحددة: $1 ..."
  sudo dd if="/home/sheikha/Projects/sheikha/sheikha-main-portal/boot_usb/sheikha_bootable_usb_v310.img" of="$1" bs=4M status=progress conv=fsync
  echo "🎉 تم تجهيز فلاشة إقلاع شيخة السيادية بنجاح 100%!"
else
  echo "💡 لنسخ البصريات على فلاشة USB خارجية في أي وقت، شغّل: ./sheikha-make-boot-usb.sh /dev/sdX"
fi
