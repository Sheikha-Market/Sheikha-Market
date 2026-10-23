# Sheikha Studio Independent Product V1

## القرار المعماري

`Sheikha Studio` هو منتج التطوير الأساسي. إضافة VS Code وVisual Studio وCoder ومحركات المحررات ومزودو النماذج محولات موارد اختيارية وقابلة للاستبدال، وليست أصل المنتج ولا مخزن حالته النظامية.

## الطبقات

1. `SHEIKHA_RUNTIME_AND_PROJECT_WORKSPACE`: الحالة النظامية والمشروعات والأدلة.
2. `SHEIKHA_STUDIO_PRODUCT_V1`: سجل الأدوات والتوجيه والبوابات.
3. `SHEIKHA_NATIVE_WEB_ADAPTER` و`SHEIKHA_CLI_ADAPTER`: السطحان الأساسيان.
4. `VSCODE_EXTENSION_ADAPTER`: أدوات مؤقتة إلى حين التكافؤ.
5. `CODER_REMOTE_WORKSPACE_ADAPTER`: مساحة تطوير بعيدة اختيارية.
6. `VISUAL_STUDIO_COMPATIBILITY_ADAPTER`: توافق مشروعات وتصحيح اختياري.
7. `MODEL_ROUTER`: اختيار مزود LLM دون جعل مزود واحد أصل النظام.

## الأدوات

يتضمن السجل 22 أداة في التحرير، الملفات، الطرفية، المهام، التصحيح، الاختبارات، التشخيص، Git، المراجعة، LSP، الشات، الوكلاء، MCP، RAG، البيانات، API، الحاويات، النشر، المراقبة وEnterprise Inspector.

التغطية الحالية: `17/22` أداة أصلية أو متاحة في Runtime، و`5/22` تعتمد محولات محكومة مؤقتًا. النسبة `77.27%` لا تعني أن واجهة Studio المستقلة اجتازت الإنتاج.

## بوابة الاستقلال

لا تصبح Studio مستقلة للإنتاج قبل اجتياز:

- تشغيل محرر فعلي مستقل وحفظ واستعادة الملفات.
- عزل الطرفية وحدود الصلاحيات.
- debugger فعلي واختبارات تكامل.
- إقلاع دون Extension Host.
- حفظ الحالة والتعافي من الانقطاع.
- تحميل وأمان ومراقبة وRollback.

## الحالة التجارية

الحالة الحالية: `FOUNDATION_ACTIVE_ADAPTER_ASSISTED` و`commercialPilotReady=true` و`productionReady=false`.

يمكن عرض Pilot محدود مع الإفصاح عن المحولات الخارجية. لا يجوز وصف المنتج بأنه بديل مكتمل لـVisual Studio أو VS Code أو Coder حتى تجتاز كل أداة أصلية اختبار تكافؤ وظيفي مستقل.
