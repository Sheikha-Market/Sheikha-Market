# Sheikha UEFI Integration Fabric V1

## النطاق

يسجل هذا الإصدار الفصول التسعة والثلاثين والملاحق من A إلى R في UEFI 2.11، ويربط كل بند بمزوده وحالة تنفيذه ودليله وحد السلامة ومتطلبات المرحلة التالية.

التسجيل لا يعني أن البروتوكول منفذ. لا توجد في هذا الإصدار شهادة مطابقة UEFI، ولا ادعاء بأن الشبكات أو Secure Boot أو تحديث الـFirmware أو جميع التعريفات قد اكتملت.

## الأساس المتحقق

- مسار Firmware Boot Manager إلى `EFI/BOOT/BOOTX64.EFI`.
- صورة GPT تحتوي EFI System Partition بنظام FAT32.
- تحقق بنيوي من EFI System Table وBoot Services وRuntime Services.
- استخدام محكوم لـGetMemoryMap وExitBootServices وLocateProtocol وHandleProtocol وSetWatchdogTimer.
- اكتشاف Loaded Image وDevice Path وGraphics Output.
- إخراج نصي في مرحلة UEFI ثم انتقال إلى نواة شيخة الأصلية وتوقف محكوم.
- تشغيل QEMU/OVMF بلا شبكة، مع بقاء الكتابة على القرص الفعلي معطلة.

## الحدود

- `DEFAULT_AUTHORIZATION=DENY`.
- لا تعديل لـBootOrder أو متغيرات NVRAM.
- لا تحديث Firmware ولا تسجيل مفاتيح Secure Boot.
- لا شبكة أصلية ولا USB stack أصلي حتى الآن.
- لا كتابة تلقائية إلى USB أو القرص الداخلي.
- لا حكم شرعي آلي؛ المرجعية المعلنة للصدق والأمانة ومنع الضرر والوفاء بالعقود، والأحكام الاجتهادية لمراجعة بشرية مؤهلة.

## الأدلة والواجهات

- السجل: `runtime/bare-metal/v2/uefi-integration/v1/sheikha-uefi-capability-registry-v1.json`
- التقرير: `runtime/bare-metal/v2/uefi-integration/v1/sheikha-uefi-integration-v1-report.json`
- الرسم: `runtime/bare-metal/v2/uefi-integration/v1/sheikha-uefi-architecture-graph-v1.json`
- العقد: `runtime/bare-metal/v2/contracts/sheikha-uefi-integration-fabric-v1-contract.json`
- API: `/api/sheikha/bare-metal/v2/uefi-integration/v1/status`
- الواجهة: `/boot-trial/`

## التدرج التنفيذي

1. U0: الأساس الحالي المتحقق في QEMU.
2. U1: Block I/O وملفات للقراءة فقط.
3. U2: تعداد ACPI وPCI للقراءة فقط.
4. U3: إدخال أصلي وHII محدود.
5. U4: Secure Boot بمفاتيح المالك وتوقيع وموافقة واختبار عتاد.
6. U5: شبكة أصلية معزولة ومفعلة صراحة بعقود TLS وحدود اتصال.
7. U6: دورة Firmware منفصلة عالية الأثر، مع استرداد وموافقة بشرية قبل أي تنفيذ.
