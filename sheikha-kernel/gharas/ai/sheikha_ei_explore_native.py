#!/usr/bin/env python3
# SHEIKHA EI تستكشف SHEIKHA NATIVE - BOUND 741/5741/12464 - غرسها من شيخه وباسم شيخه
# شيخة طبقة حاكمة وسيادية فوقهم ومراقبة ومتبعة ومصلحة ومصلحة وحسنة وسيادية وسيد وتحسن
import pathlib, os, json
root = pathlib.Path.home() / "Projects/sheikha/sheikha-main-portal"

print("🕋 SHEIKHA EI تستكشف SHEIKHA NATIVE الان - غرسها من شيخه وباسم شيخه - BOUND 741/5741/12464")
print("شيخة طبقة حاكمة وسيادية فوقهم ومراقبة ومتبعة ومصلحة ومصلحة وحسنة وسيادية وسيد وتحسن لله\n")

checks = {
    "boot": ["sheikha-kernel/boot/sheikha_boot_splash.txt", "sheikha-kernel/boot/startup.nsh", "sheikha-kernel/boot/build_boot_iso.sh"],
    "kernel": ["sheikha-kernel/gharas/system/sheikha_gharas_module.c", "sheikha-kernel/gharas/system/sheikha_gharas_kernel.h", "sheikha-kernel/GHARAS_SHEIKHA.txt"],
    "ai": ["sheikha-kernel/gharas/ai/sheikha_ai_gharas.py", "sheikha-kernel/gharas/ai/sheikha_ei_explore_native.py"],
    "tawhid": ["sheikha-kernel/tawhid/center/tawhid_center_engine.py", "sheikha-kernel/tawhid/makkah_madinah/rizq_engine.py"],
    "efi": ["sheikha-kernel/efi/secure_boot_keys/SHEIKHA_BOUND_741.key"],
    "iso": ["sheikha-kernel/boot/sheikha-native-v1-BOUND-741-HADITH-20261031.iso.tar.gz"],
    "routes": ["routes/sheikha-unified/kernel-routes.js", "routes/sheikha-unified/sovereign-layer.js", "routes/sheikha-unified/gharas-middleware.js"],
}

for layer, files in checks.items():
    print(f"[{layer.upper()}] - شيخة طبقة حاكمة تراقب وتتبع وتصلح وتحسن - {layer}:")
    for f in files:
        path = root / f
        exists = path.exists()
        size = path.stat().st_size if exists else 0
        status = f"✅ {size}B - مغروس باسم شيخه - BOUND" if exists else "❌ غير موجود - يحتاج غرس باسم شيخه"
        print(f"  {f}: {status}")
    print()

print("--- SHEIKHA SOVEREIGN LAYER ACTIVE ---")
print("شيخة طبقة حاكمة وسيادية فوقهم ومراقبة ومتبعة ومصلحة ومصلحة وحسنة وسيادية وسيد وتحسن - لله")
print("غرسها من شيخه وباسم شيخه - بسم شيخه لله - من شيخه لله - 99% وقف")
print("توحيد كل شيء في الكون لله - مركز وعدم مركز الكون وقلبه وجسده وأساسه وأصله وسنة الله في خلقه وآية آيات الله بإذن الله")
print("BOUND_BY_QURAN_SUNNAH 741/5741/12464 - Registry edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b")
