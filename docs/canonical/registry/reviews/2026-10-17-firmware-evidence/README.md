# مراجعة أدلة الفيرموير والنواة V29.7–V32.2

SHEIKHA Global Runtime Platform · SHEIKHA UGIT-RP · 17 أكتوبر 2026

الحالة: `STATIC_REVIEW_COMPLETE_NATIVE_FIRMWARE_PROOF_HOLD`. اكتملت المراجعة القرائية المحددة؛ **استبدال OVMF وتشغيل حماية NX والتفوق على البديل المرجعي لم تثبت بهذه الأدلة**. لم تُشغّل محركات التفعيل أو اختبارات البناء التاريخية أو QEMU، ولم تُعدّل النواة أو OVMF أو SQLite أو V2 أو إعدادات الجهاز.

المرجع: [السجل الجذري](../../ROOT-SOURCE-OF-TRUTH.md). تحفظ [القياسات والبصمات](observation.json) القراءات المفصلة، وتحفظ [خطة القبول](acceptance-plan.json) عشر بوابات مقترحة ما زالت مفتوحة. هذه حزمة مراجعة؛ لا تتضمن صورة ROM جديدة أو إصلاحًا للحارس أو سكربت تفعيل.

## النتيجة المثبتة وحدودها

| الدليل | ما تأكد بالقراءة الحالية | الحد |
|---|---|---|
| النواة الأصلية V27.6 | ELF32/i386، نقطة الدخول `0x101000`، البصمة تطابق `ab4cdc5b…` | مقطع الدخول معلن بأذونات RWE، وعدد المقاطع التي تجمع W+X هو1؛ لا اختبار runtime |
| OVMF CODE/VARS 4M | البصمتان تطابقان `9be5f162…` و`5d2ac383…` | تطابق المرجع لا يثبت استبداله |
| حزمة V29.7.5 وZIP | الملفات السبعة متطابقة بين الأرشيف والمجلد المرحّل | مصادر ووثائق فقط؛ لا ELF أو تقرير اختبارات محفوظ داخل الأرشيف |
| ELF المختبري المرسل | المسار `/tmp/sheikha-firmware-lQojf1mR/output/sheikha_lab_hardened.elf` غائب | لا تأكيد حالي لبصمة `44e656b7…` أو إعادة اعتماد22/22 |
| سجل UEFI V29.7 | بصمة السجل تطابق `dd87ee09…`، وملفاته الأربعة تطابق القيم داخله | سجل محلي يستخدم OVMF؛ يصرح بعدم إثبات handoff للنواة أو إقلاع OS كامل |
| مانيفستات V30.1–V32.2 | 21 من22 تطابق مفاتيحها المحددة في V2 | المطابقة نسبة ملفات فقط؛ ليست نسبة اكتمال القدرات |
| محركات المراحل الـ22 | كتابة catalog في SQLite وJSON وحساب بصمات | لا بناء ROM أو compiler/QEMU أو تفعيل خدمة/شبكة/عزل في هذه المحركات |

فُحصت ترويسات [ELF الأصلي](/home/sheikha/sheikha-foundation-lab/SHEIKHA_SOVEREIGN_AI_FOUNDATION_V1/architecture_protection_v1/sheikha_os_minikernel_v27_6/sheikha_minikernel_v276.elf) قراءةً مستقلة، دون استخدام الحارس القديم. مقطعاه: R بحجم12بايت عند `0x100000`، ثم RWE بحجم ذاكرة16512بايت وبيانات ملف117بايت عند `0x101000`. تقع بياناتهما المخزنة داخل نهاية الملف. لا تعرض [شفرة الأصل](/home/sheikha/sheikha-foundation-lab/SHEIKHA_SOVEREIGN_AI_FOUNDATION_V1/architecture_protection_v1/sheikha_os_minikernel_v27_6/kernel_v276.S) إعداد paging/NX؛ تهيئ stack وتطبع علامة عبر UART وتطلب خروج QEMU.

بحث الملف المختبري المفقود اقتصر على المسار المذكور والنمط `/tmp/sheikha-firmware-*/output/sheikha_lab_hardened.elf`. لا يحكم ذلك على كل مواضع الجهاز. يحدد [linker المختبر](/home/sheikha/sheikha-package-staging/SHEIKHA_FIRMWARE_HARDENING_V29_7_5/src/lab_linker.ld) مقاطع4/5/6، لكن assembly المختبري يهيئ stack ثم يدخل حلقة `hlt`؛ ليس إعادة بناء مكافئة وظيفيًا للأصل. بقي خبر نجاح22اختبارًا وبصمة ELF المختبر منقولين من المحادثة، دون إعادة تشغيل في هذه المراجعة.

## ما يعنيه البديل تقنيًا

OVMF تنفيذ firmware للآلات الافتراضية مبني على EDK II، بينما UEFI يحدد واجهة وخدمات بين firmware والـloader. لذلك يجب تحديد هل المنتج ROM يبدأ من reset، أم تطبيق EFI يعمل داخل firmware آخر، وما التوافق الذي يدعيه. نجاح تطبيق EFI داخل OVMF لا يثبت استبدال OVMF. [EDK II OvmfPkg](https://github.com/tianocore/edk2/blob/master/OvmfPkg/README)، [UEFI System Table](https://uefi.org/specs/UEFI/2.11/04_EFI_System_Table.html).

أذونات `PF_R/PF_W/PF_X` في ELF وصف بنيوي؛ التطبيق الفعلي يتوقف على إدارة الذاكرة. إثبات NX في x86 يحتاج إعداد paging وخصائص المعالج واختبار fault مناسب. عنوان reset `0xFFFFFFF0` يخص سياق x86 الموثق، ولا يمثل ROM عالميًا لـARM وRISC-V؛ عنوان reset في RISC-V تحدده المنصة/التنفيذ. [gABI، صلاحيات المقاطع](https://gabi.xinuos.com/elf/07-pheader.html#segment-permissions)، [Intel SDM، §§4.13.2 و9.1.4](https://www.intel.com/content/dam/support/us/en/documents/processors/pentium4/sb/25366821.pdf)، [RISC-V Reset](https://docs.riscv.org/reference/isa/priv/machine.html#_reset).

[سجل V29.7](/home/sheikha/sheikha-foundation-lab/SHEIKHA_SOVEREIGN_AI_FOUNDATION_V1/architecture_protection_v1/sheikha_firmware_v29_7/BOOT_OBSERVATION_V29_7.json) يسجل علامة نجاح `ExitBootServices` في `QEMU_TCG_OVMF_X86_64`، ويصرح بأن السجل الكامل المنفصل والشاهد الخارجي والتوقيع المستقل غير متاحة. كما يصرح بأن handoff إلى النواة الأصلية وإقلاع OS كامل غير مثبتين. وجود Multiboot header يخص عقد تحميل مختلف، ولا يسد هذه الفجوة وحده. [عقد Multiboot لحالة الآلة](https://www.gnu.org/software/grub/manual/multiboot/html_node/Machine-state.html).

## تسوية سجل V2

الاستثناء الوحيد في مقارنة المانيفستات الـ22:

| V31.1 | SHA-256 |
|---|---|
| الملف الحالي | `400cb1f2883b77f816cfcc825cc44a2addd35d78e626056d97199c6ea703e387` |
| القيمة المسجلة في V2 | `0d79923bc11f8c0eeb63fa32e3c6d12dc25f70113dbdf2d1d8f3f945e0a3ac6e` |

يتضمن [المانيفست الحالي](/home/sheikha/sheikha_os_ecosystem/01_foundry_baremetal_kernel/sheikha_v31_1_activated_kernel_manifest.json:11) حقول IP و`base_architecture_status` و`authority_state/production_state` إضافية عن قاموس [المحرك](/home/sheikha/sheikha_os_ecosystem/01_foundry_baremetal_kernel/sheikha_v31_1_kernel_activation_and_master_closure_engine.py:66). ثبت اختلاف الشكل والبصمة؛ لم يثبت وقت التعديل أو سببه أو منفذه. بقي V2 والملف كما هما.

قيم DB التاريخية داخل21مانيفستًا تطابق مفاتيح DB المقابلة في V2؛ هذه مقارنة **قيم مسجلة** وليست إثباتًا لحالة DB الحالية. استثناء V30.6 لا يحتوي أصلًا بصمة DB أو timestamp داخل manifest: يحسب [المحرك البصمة](/home/sheikha/sheikha_os_ecosystem/01_foundry_baremetal_kernel/sheikha_v30_6_ultimate_omni_master_closure_engine.py:66)، ثم يكتب قاموسًا ثابتًا من [السطر69](/home/sheikha/sheikha_os_ecosystem/01_foundry_baremetal_kernel/sheikha_v30_6_ultimate_omni_master_closure_engine.py:69)، ويحفظ بصمة DB في V2 فقط. يمكن إذن ثبات manifest مع تغير DB دون تناقض.

كانت بصمة ملف SQLite في هذه القراءة `39c19d0c7d810c524edd96a291856945aae983bc66e3f2d054283036613228b9`، وتختلف عن [قراءة V36 السابقة](../2026-10-17-v36-cloud-review/observation.json). لم يُفتح اتصال SQLite ولم تظهر sidecars في الملاحظة المحددة؛ قُرئ الملف كبايتات مع ثبات metadata أثناء قراءته. الملاحظات منفصلة زمنيًا وليست snapshot ذرية للمنظومة، ولا تثبت سبب التغير. لم تُستبدل أي baseline تاريخية.

## المحركات تسجل حالات؛ لا تنفذ القدرات المعلنة

| المرحلة | السلوك في الشفرة المفحوصة |
|---|---|
| V30.1 وV30.2 | بصمات firmware/kernel ونتيجة22/22 وعددW+X المختبري ثوابت؛ لا يعيد المحرك قياسها |
| V30.3 | أربعة أوصاف في قاموس ثم إدراج SQL وإعلان `REPLACED_BY...SPEC`؛ لا إنتاج ROM |
| V30.9 وV31.1 | خمسة محاور ثابتة لكل مرحلة؛ لا تحويل مصادر إلى native أو تشغيل kernel |
| V31.9 | إنشاء جدولي شهادات وتراخيص دون إدراج فيهما؛ الإدراج في سجل المحاور فقط |
| V32.0 | خمسة أوصاف أمنية؛ لا تهيئة air gap أوW^X أوwatchdog أوsystemd |
| V32.1 | إنشاء جدول أصول وجدول entries دون ترحيل أو تحقق اتزان؛ لا INSERT فيهما بهذا المحرك |
| V32.2 | خمسة عناوين مواصفات عامة؛ لا حدود قبول أو قياسات مطابقة |

المراجع الأساسية: [V30.3:26](/home/sheikha/sheikha_os_ecosystem/01_foundry_baremetal_kernel/sheikha_v30_3_sovereign_firmware_engine.py:26)، [V30.9:26](/home/sheikha/sheikha_os_ecosystem/01_foundry_baremetal_kernel/sheikha_v30_9_pure_native_engine.py:26)، [V31.9:50](/home/sheikha/sheikha_os_ecosystem/01_foundry_baremetal_kernel/sheikha_v31_9_credentials_engine.py:50)، [V32.0:22](/home/sheikha/sheikha_os_ecosystem/01_foundry_baremetal_kernel/sheikha_v32_0_cybersecurity_engine.py:22)، [V32.1:50](/home/sheikha/sheikha_os_ecosystem/01_foundry_baremetal_kernel/sheikha_v32_1_sovereign_finance_engine.py:50)، [V32.2:26](/home/sheikha/sheikha_os_ecosystem/01_foundry_baremetal_kernel/sheikha_v32_2_specifications_engine.py:26).

عدم الإدراج هنا وصف لسلوك الكاتب، لا ادعاء بأن الجداول الحالية فارغة؛ لم يُستعلم عن محتوى DB. والنتيجة تخص المصادر الـ22 المحددة، لا جميع مشاريع النواة أو EDA أو الشبكات الأخرى. وجود شفرة native في موضع آخر يحتاج مراجعة وإثباتًا منفصلين.

بصمة وصف من نوع `code:description:status:timestamp` توثق بايتات الوصف، ولا تثبت تصنيع شريحة أو امتلاك ترخيص أو صلاحية حالة أمنية. كتابة DB ثم manifest ثم V2 تتم في خطوات منفصلة، مع `INSERT OR REPLACE` دون سجل revisions مستقل في هذه المحركات. عبارات `authority_granted=false` لا تمثل حارسًا سابقًا للكتابة إذا كانت مجرد قيم تُكتب بعد `commit`. والمرجعية المعلنة للكتاب والسنة تسجل مرجعية المشروع؛ ليست نصوص الحالة موافقة شرعية أو نظامية مثبتة.

## فجوات حارس V29.7.5

الفحص ساكن مع مراجعة مستقلة ثانية؛ لم تُنفذ حالات استغلال أو اختبارات جديدة. قرار HOLD الصريح وجميع التفويضاتfalse في [الحارس:47](/home/sheikha/sheikha-package-staging/SHEIKHA_FIRMWARE_HARDENING_V29_7_5/src/guard.py:47) يظلان قائمين، رغم قصور مؤشر `lab_structural_hardening_pass`:

- [entry:23](/home/sheikha/sheikha-package-staging/SHEIKHA_FIRMWARE_HARDENING_V29_7_5/src/guard.py:23) قد يقع داخل RW أوBSS؛ لا يشترط مقطعًا تنفيذيًا وبيانات كود مخزنة. تُهمل المحاذاة والعنوان الفيزيائي، ويقتصر التداخل على البايتات الافتراضية. مجموعة flags لا تفرض ثلاثة LOAD بالضبط.
- [Multiboot:28](/home/sheikha/sheikha-package-staging/SHEIKHA_FIRMWARE_HARDENING_V29_7_5/src/guard.py:28) قد يقبل ترويسة تتجاوز أول8192بايت، ولا يتحقق من flags والحقول الإضافية المطلوبة.
- [CLI:50](/home/sheikha/sheikha-package-staging/SHEIKHA_FIRMWARE_HARDENING_V29_7_5/src/guard.py:50) يخرج بصفر حتى عند فشل المؤشر أو اختلاف الأصل/firmware؛ الاستثناء فقط يعطي2. لذلك exit0 أو رسالة COMPLETE ليسا بوابة قبول.
- فحص الرابط النهائي منفصل عن القراءة، دون حماية سلسلة المجلدات أو ثبات الملف؛ وسكربت البناء لا يفرض أن مجلد المخرجات خارج المصدر.
- تبني الاختبارات fixture واحدًا، ولا تغطي الحالات السابقة. اختبار [unchanged_original_ref:42](/home/sheikha/sheikha-package-staging/SHEIKHA_FIRMWARE_HARDENING_V29_7_5/tests/test_guard.py:42) يفحص طول ثابت البصمة، لا سلامة الملف الأصلي قبل التشغيل وبعده.

## مسار القبول المقترح

تبدأ [الخطة](acceptance-plan.json) بتسمية هدف واحد وعقد المنتج، وحفظ الأدلة وتسوية V31.1، وتقوية الفاحص. ثم تتطلب صورة ROM قابلة لإعادة البناء، وتتبع reset وتسليمًا فعليًا للنواة، واختبارات صلاحيات صفحات أثناء التنفيذ. يليها إثبات لوحة فعلية محددة مع التعافي؛ لكل ISA إضافية أدلتها الخاصة.

تربط الخطة المتطلبات بالأثر والاختبار والمراجع والمسؤول المقترح. وتفصل تصنيف المواد والأدوات وخطوط الإنتاج عن إثبات تصنيعها، وتفصل المالية والشهادات عن نجاح firmware. وصف «أفضل» يتطلب مقارنة بنفس الهدف والوظائف مع baseline موثق؛ لم تُجرَ هذه المقارنة.

**المغلق: المراجعة القرائية وتوثيق نتائجها. المفتوح: الإصلاحات وإثبات البديل وحماية runtime والاعتماد التشغيلي.** لم تُعدّل الحزم السابقة أو المصادر الخارجية، واقتصر التغيير على هذا الملحق ورابطه في السجل الجذري.
