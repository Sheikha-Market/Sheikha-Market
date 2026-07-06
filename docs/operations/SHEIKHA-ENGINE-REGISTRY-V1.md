# SHEIKHA ENGINE REGISTRY V1

## الهدف

منع أخطاء Runtime من نوع:

`XXX is not defined`

واستبدالها بحالة محكومة:

`OPTIONAL_NOT_REGISTERED`

## القاعدة

لا يتم تشغيل أي Engine مباشرة بالاسم.  
كل Engine يجب أن يمر عبر Registry:

- registerEngine
- resolveEngine
- listEngines

## النتيجة

بدلاً من تلويث سجلات الإنتاج بـ ReferenceError، تصبح المحركات غير الجاهزة Optional وتظهر في تقرير واضح.

## الإنتاج

هذه الطبقة لا تعدل النظام الخارجي، ولا تعيد تشغيل الخدمات، ولا تفتح كتابة خارجية.
