# Sheikha System — Bare Metal — Kernel Integration Roadmap V1

**التاريخ:** 2026-08-31  
**المعمارية الحالية:** x86_64 + UEFI  
**النطاق:** تكامل نظام شيخة، Sheikha Bare Metal، والنواة الأصلية  
**الحالة:** أساس QEMU موثق؛ نظام التشغيل العام والعتاد الفعلي غير مكتملين

## 1. التعريف

يتكون Sheikha System من ثلاث طائرات مستقلة ومتكاملة:

1. **Sheikha Native Plane:** UEFI، Boot، Kernel، HAL، الذاكرة، المقاطعات،
   الجدولة، العمليات، الملفات، التخزين، الشبكة والأمن.
2. **Sheikha Runtime Plane:** الخدمات والحوكمة والسجلات والمراقبة وواجهات API
   وتشغيل التطبيقات. يعمل حاليًا فوق Linux.
3. **Sheikha Product Plane:** الشات والتقارير وسوق شيخة والخدمات الصناعية
   والمنتجات التجارية.

لا تحتاج Product Plane إلى انتظار اكتمال Native Plane. ينتقل المنتج إلى النواة
الأصلية تدريجيًا عندما يثبت كل عقد وDriver واختبار، مع بقاء Linux منصة الإنتاج
المستقرة حتى اجتياز البديل.

## 2. الحالة المثبتة

### ما يعمل

- صورة UEFI حتمية `x86_64` بصيغة PE32+ ومسار `EFI/BOOT/BOOTX64.EFI`.
- صورة FAT12 قابلة للإقلاع في QEMU/OVMF.
- `ExitBootServices` ثم دخول النواة وإخراج Serial محدود.
- Paging بأربع طبقات وتغطية bootstrap لأول 4 GiB.
- تحميل CR3 وتنفيذ INVLPG موثقان في Serial على QEMU.
- عقد Kernel بلغة C11 مستقلة عن مكتبة النظام القياسية.
- ABI أولي للسواقات وفحص Smoke ناجح.
- أساس توافق عتاد x86_64 وسجلات بوابات لبقية المعماريات.

### ما لا يعمل أو لم يثبت

- لم يُنفذ إقلاع فعلي على جهاز MSI أو أي عتاد مادي.
- Secure Boot والتوقيع وإدارة المفاتيح وTPM attestation غير مثبتة.
- لا يوجد اكتمال لجميع ACPI/PCI/USB/NVMe/GPU/Wi-Fi/Ethernet/HID drivers.
- لا توجد حماية نهائية W^X أو عزل higher-half مكتمل.
- Scheduler والعمليات وSyscalls وVFS والشبكة ما زالت أساسات وليست نظامًا عامًا.
- لا يوجد تحديث ذري أو rollback أو recovery مثبت على العتاد.
- لا توجد شهادة سلامة أو توافق خارجية.

الحكم: `QEMU_RUNTIME_VERIFIED_SUBSET` وليس نظام تشغيل تجاريًا عامًا.

## 3. عقود التكامل

| العقد | المسؤولية | الحالة |
|---|---|---|
| Boot Contract | UEFI handoff وExitBootServices وعلامة النجاح | مثبت على QEMU |
| Kernel Contract | entry وSerial وhalt والتحقق من boot info | مثبت كأساس |
| HAL Contract | CPU وUART ثم توسع مضبوط للعتاد | UART/CPU فقط |
| Driver ABI | تسجيل Driver والصلاحيات والحدود | Smoke مثبت |
| Runtime ABI | رسائل وخدمات بين النواة وRuntime | مطلوب تصميم V1 |
| Product API | واجهات مستقرة للتطبيقات والمنتجات | يعمل فوق Linux |
| Evidence Contract | SHA-256 وSerial واختبارات وربط الإصدار | فعال للمرحلة 2B |

## 4. ترتيب الإقلاع والتشغيل

```text
Firmware / UEFI
  -> Sheikha Boot Manager
  -> Memory Map + ExitBootServices
  -> Sheikha Kernel Entry
  -> Paging + Interrupts + HAL
  -> Scheduler + Processes + Syscalls
  -> VFS + Storage + Network
  -> Sheikha Runtime Supervisor
  -> Governance / Audit / Recovery Services
  -> Sheikha Product Services and UI
```

الذكاء الصناعي يعمل في الطبقات العليا فقط. لا يملك صلاحية مستقلة لتعديل Firmware
أو مفاتيح Secure Boot أو kernel memory أو القرص الفعلي.

## 5. الجدول الزمني

التواريخ أهداف هندسية مشروطة بموارد التطوير والعتاد، وليست شهادة مسبقة.

### K0 — تثبيت الأساس: مكتملة

**الفترة:** حتى 2026-08-31

- UEFI/QEMU boot.
- CR3 وINVLPG.
- صورة حتمية وبصمات.
- Kernel/HAL/Driver ABI contracts.

**بوابة الخروج:** `PHASE2B_VERIFIED` — اجتازت ضمن QEMU فقط.

### K1 — الإقلاع المادي الآمن

**الفترة المستهدفة:** 2026-09-01 إلى 2026-09-14

- USB مخصص قابل للمحو يختاره المالك صراحة.
- كتابة الصورة بعد مطابقة المسار والحجم والبصمة.
- إقلاع MSI مع Secure Boot معطل مؤقتًا للاختبار فقط.
- تصوير شاشة الإقلاع وجمع Serial عند توفره.
- عدم لمس القرص الداخلي أو NVRAM.

**بوابة الخروج:** إقلاعان ناجحان متتاليان على العتاد نفسه، وصفر كتابة داخلية.

### K2 — نواة الذاكرة والمقاطعات الآمنة

**الفترة:** 2026-09-15 إلى 2026-10-31

- Frame allocator فعلي واختبار ضغط.
- W^X وNX وخرائط memory-type-aware.
- Higher-half أو عزل مكافئ مثبت.
- GDT/IDT والاستثناءات وTimer وpanic trace.
- إزالة identity map الواسعة بعد الانتقال الآمن.

**بوابة الخروج:** 24 ساعة QEMU stress، لا page fault غير معالج، واختبارات حدود.

### K3 — اكتشاف العتاد والسواقات الأساسية

**الفترة:** 2026-11-01 إلى 2027-02-28

- ACPI وPCI read-only enumeration.
- Framebuffer وKeyboard/HID.
- Block I/O read-only ثم write داخل image اختبارية فقط.
- NVMe/AHCI حسب عتاد الهدف.
- USB mass storage محدود.

**بوابة الخروج:** Matrix عتاد مسماة، وكل Driver له جهاز واختبار وفشل آمن.

### K4 — العمليات والملفات والشبكة

**الفترة:** 2027-03-01 إلى 2027-07-31

- Preemptive scheduler وuser mode وعزل العمليات.
- Syscall ABI مرقم ومستقر.
- VFS ونظام ملفات أولي وpermissions.
- TCP/IP محدود وDNS/TLS بمكتبات أو تنفيذ مراجع ومختبر.
- Runtime supervisor وخدمة logs وhealth.

**بوابة الخروج:** تشغيل تطبيق user-space غير موثوق دون سقوط النواة، وSoak 72 ساعة.

### K5 — Secure Boot وTPM والتحديث والتعافي

**الفترة:** 2027-05-01 إلى 2027-09-30، بالتوازي مع K4

- مفاتيح مملوكة للمالك ومحفوظة خارج المستودع.
- توقيع image ورفض image معدلة.
- TPM measured boot عند توفر الدعم.
- A/B update وrollback وrecovery image.
- Threat model وRed Team للنواة والـboot chain.

**بوابة الخروج:** رفض التوقيع الخاطئ، rollback ناجح، ومراجعة أمنية مستقلة.

### K6 — Sheikha System Developer Preview

**الفترة:** 2027-10-01 إلى 2027-12-31

- SDK وعقود Runtime.
- QEMU image للمطورين.
- وثائق build/debug/crash dump.
- دعم جهاز مرجعي x86_64 واحد فقط.

**بوابة الخروج:** 10 مطورين، 30 يومًا، وصفر فقد بيانات حرج.

### K7 — منتج Edge Appliance محدود

**الفترة:** 2028-01-01 إلى 2028-06-30

- جهاز مرجعي واحد ومهمة واحدة مثل بوابة تقارير صناعية محكومة.
- مراقبة وتحديث ودعم وSLA محدود.
- مراجعة قانونية وأمنية وتوافق عتاد.

**بوابة الخروج:** 3 عملاء تجريبيين وقبول موثق ومعدل نجاح 99.5% ضمن النطاق.

### K8 — نظام عام أوسع

**الفترة التقديرية:** 2028-07 إلى 2029-12 وما بعدها

- توسيع السواقات والمعماريات فقط حسب الطلب التجاري المثبت.
- aarch64 يبدأ في QEMU قبل أي عتاد.
- لا ادعاء دعم عالمي؛ كل جهاز له Matrix وتأهيل مستقل.

## 6. المنتجات الممكنة حسب النضج

| المنتج | أقرب مرحلة | نموذج التقديم |
|---|---|---|
| QEMU Bare-Metal Developer Lab | K2 | حزمة تطوير وتعليم غير إنتاجية |
| Boot/Kernel Evidence Toolkit | K2 | خدمة تدقيق وبناء أدلة |
| Sheikha Secure Edge Image | K5 | ترخيص لجهاز مرجعي واحد |
| Industrial Governed Gateway | K7 | جهاز + دعم + اشتراك |
| Kernel/Driver Porting Service | K3 | خدمة هندسية حسب العتاد |

لا يُباع Bare Metal الآن كنظام تشغيل عام. المنتجات التجارية الحالية للشات
والتقارير وسلاسل الإمداد تبقى على Linux، ويمكنها تمويل هذا المسار تدريجيًا.

## 7. الموارد

### الفريق الأدنى

- مهندس Kernel/Memory.
- مهندس UEFI/Secure Boot.
- مهندس Drivers/Hardware.
- مهندس Runtime/Toolchain.
- مهندس Security/Verification.
- إدارة منتج واختبار قانوني وتجاري حسب المرحلة.

يمكن لشخص واحد تنفيذ الأساس، لكنه لا يكفي لاعتماد نظام تجاري آمن ضمن الجدول.

### العتاد

- جهاز MSI الحالي للاختبار غير المدمر.
- وحدتا USB مخصصتان قابلتان للمحو.
- جهاز x86_64 مرجعي ثانٍ منخفض المخاطر.
- Serial adapter عند الحاجة.
- لاحقًا جهاز TPM 2.0 وعتاد شبكة/تخزين مسمى.

## 8. الحوكمة

1. القرص الداخلي وNVRAM والFirmware افتراضيًا `DENY`.
2. كل كتابة وسيط تحتاج مسار جهاز وبصمة وموافقة صريحة.
3. لا Secure Boot claim دون توقيع ورفض سلبي مثبتين.
4. لا Driver support claim دون جهاز فعلي واختبار وفشل آمن.
5. لا AI في boot critical path ولا صلاحية kernel مستقلة.
6. كل artifact يبنى مرة، يبصم، ثم يرقى بذات البصمة.
7. QEMU evidence لا يساوي physical evidence.
8. التسجيل أو source code لا يساوي implementation complete.

## 9. مؤشرات القياس

- نسبة Boot الناجح لكل منصة.
- زمن UEFI إلى kernel، ثم kernel إلى Runtime.
- crash-free hours وpanic count.
- تغطية اختبارات memory/interrupt/syscall/driver.
- عدد الأجهزة المؤهلة فعليًا، لا المسجلة.
- CVEs المفتوحة وMTTR.
- زمن rollback ونسبة نجاحه.
- تكلفة دعم كل جهاز وإيراد المنتج المرتبط به.

## 10. القرار

- **Sheikha System فوق Linux:** يستمر كمسار الإنتاج التجاري الحالي.
- **Sheikha Bare Metal:** يستمر كبرنامج R&D مرحلي.
- **Sheikha Kernel:** أساس حقيقي صغير، وليس Kernel عامًا مكتملًا.
- **الإجراء التالي:** K1 physical boot read-only بعد موافقة منفصلة على USB محدد.

الحالة الرسمية: `INTEGRATED_ROADMAP_ACTIVE_QEMU_FOUNDATION_PHYSICAL_BOOT_PENDING`.
