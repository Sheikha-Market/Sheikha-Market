# قائمة التحقق: دورة تشغيل يومية وأسبوعية

## يوميًا

1. **فحص الجاهزية**:
   - `npm run ops:readiness`
   - `npm run ops:gov:readiness`

2. **فحص الصحة**:
   - `npm run ops:health:check`

3. **فحص الحوكمة**:
   - `npm run ops:gov:auto`

4. **فحص الأمان**:
   - `npm run ops:safety:cycle`

5. **فحص الذكاء الاصطناعي**:
   - `npm run ops:ai-guard`

6. **فحص العمليات الخلفية**:
   - `npm run ops:bg-guard`

7. **فحص الخادم**:
   - `npm run ops:server:pm2:status`

8. **فحص المراقبة**:
   - `npm run ops:monitor:status`

9. **فحص النماذج**:
   - `npm run ops:ollama:plan`

10. **فحص الشبكة العصبية**:
    - `npm run ops:neural:compare`

11. **فحص بوابة التشغيل العصبية**:
   - `npm run ops:neural:gate`

12. **فحص مؤقت watchdog**:
   - `npm run ops:watchdog:neural:status`

---

## أسبوعيًا

1. **تحديث الخادم**:
   - `npm run ops:server:pm2:restart`

2. **تحديث المراقبة**:
   - `npm run ops:monitor:stop`
   - `npm run ops:monitor:start`

3. **تحديث الحوكمة**:
   - `npm run ops:gov:auto:fix`

4. **تحديث الأمان**:
   - `npm run ops:safety:env`

5. **تحديث الذكاء الاصطناعي**:
   - `npm run ops:ai-guard:loop`

6. **تحديث العمليات الخلفية**:
   - `npm run ops:bg-guard:loop`

7. **تحديث النماذج**:
   - `npm run ops:ollama:apply`

8. **تحديث الشبكة العصبية**:
   - `npm run ops:neural:compare`

9. **نشر VPS مع بوابة حماية + rollback**:
   - `npm run ops:vps:deploy:dry`
   - `npm run ops:vps:deploy`

10. **تفعيل/تأكيد watchdog systemd**:
   - `sudo npm run ops:watchdog:neural:install`

---

## ملاحظات

- تأكد من تسجيل جميع المخرجات في ملفات السجل.
- قم بمراجعة أي أخطاء أو تحذيرات واتخاذ الإجراءات اللازمة.
- قم بتحديث هذه القائمة حسب الحاجة.