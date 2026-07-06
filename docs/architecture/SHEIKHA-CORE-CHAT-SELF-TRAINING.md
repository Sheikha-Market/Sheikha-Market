# Sheikha-Core Chat and Governed Self-Training

## الهدف

تفعيل Sheikha-Core كمسار الشات الأساسي داخل Sheikha، مع طابور تدريب ذاتي محكوم لا يرقّي النموذج تلقائياً إلا بعد مراجعة بشرية.

## المسارات

- `GET /api/sheikha/core-chat/status`
- `POST /api/sheikha/core-chat/ask`
- `GET /api/sheikha/self-training/status`
- `POST /api/sheikha/self-training/record`
- `POST /api/sheikha/self-training/review-plan`

## قاعدة الحوكمة

الأساس أن الله وحده الخالق والمالك والمدبر، وأن النظام أداة تحليل وتنظيم لا يدعي وعياً ولا غيباً ولا سلطة مستقلة. كل تدريب أو نشر أو تعديل مؤثر يحتاج مراجعة إنسانية، وتكون الحوكمة على منع الربا والغش والظلم والضرر والتزييف وانتهاك الخصوصية.

## دورة التدريب الذاتي

1. يرد Sheikha-Core على الشات.
2. تسجل العينة في `data/training/sheikha-core-self-training.ndjson`.
3. تنقح الأسرار والرموز الحساسة.
4. تفحص العينة بسياسات الحلال والخصوصية.
5. توضع في طابور مراجعة بشرية.
6. لا تصدر إلى dataset تدريبي إلا بعد اعتماد صريح.

## أوامر التشغيل

- `npm run sheikha:core-chat`
- `npm run sheikha:self-training`
- `npm run sheikha:ask -- "عرّف Sheikha-Core"`

## حدود الأمان

- لا تدريب تلقائي مباشر من المحادثات.
- لا حفظ أسرار أو مفاتيح أو كلمات مرور.
- لا استخدام بيانات شخصية بلا إذن.
- لا نشر ولا Git push ولا تعديل مؤثر بلا مراجعة.
