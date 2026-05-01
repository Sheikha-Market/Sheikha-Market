# التشغيل على www.sheikha.top

## الهدف

تشغيل **سوق شيخه** (البوابة الرئيسية sheikha-main-portal) على النطاق **www.sheikha.top** بحيث يكون الموقع متاحاً للجميع على الإنترنت.

---

## الطريقة الموصى بها — النشر على VPS

### 1. المتطلبات

- **VPS** (سيرفر افتراضي) مع عنوان IP ثابت — المستخدم حالياً: `31.97.190.74`
- **نطاق** `sheikha.top` يشير إلى هذا الـ IP (سجل A لـ `sheikha.top` و `www.sheikha.top`)
- على جهازك: **SSH** و **rsync**

### 2. تنفيذ النشر

من مجلد المشروع الرئيسي (Sheikha):

```bash
cd ~/Library/CloudStorage/OneDrive-Personal/Sheikha
chmod +x deploy-main-portal-to-sheikha-top.sh
./deploy-main-portal-to-sheikha-top.sh
```

أو من أي مكان إذا عيّنت المسار:

```bash
/path/to/Sheikha/deploy-main-portal-to-sheikha-top.sh
```

### 3. ماذا يفعل السكربت؟

| الخطوة | الوصف |
|--------|--------|
| نسخ الملفات | يرفع محتويات `sheikha-main-portal/` إلى السيرفر (بدون node_modules و .git) |
| تثبيت Node.js | إن لم يكن مثبتاً على VPS (مثلاً Node 20) |
| تثبيت PM2 | لإدارة عملية Node وإعادة التشغيل التلقائي |
| npm install | تثبيت تبعيات المشروع على السيرفر |
| تشغيل التطبيق | `pm2 start server.js --name sheikha-main-portal` — الخادم يعمل على المنفذ **8080** |
| Nginx | إعداد موقع افتراضي لـ `www.sheikha.top` و `sheikha.top` مع التوجيه (proxy) إلى `localhost:8080` |
| SSL | تشغيل Certbot لـ Let's Encrypt للحصول على HTTPS (إن وُجد) |

### 4. بعد النشر

- **الموقع:** http://www.sheikha.top و **https://www.sheikha.top** (SSL مفعّل تلقائياً عبر Let's Encrypt)
- **التحقق من التطبيق:** `ssh root@31.97.190.74 'pm2 status'`
- **عرض السجلات:** `ssh root@31.97.190.74 'pm2 logs sheikha-main-portal'`
- **إعادة تشغيل التطبيق:** `ssh root@31.97.190.74 'pm2 restart sheikha-main-portal'`

### 5. تجنب طلب كلمة المرور في كل خطوة (SSH بمفتاح)

لتفعيل الدخول بمفتاح SSH مرة واحدة وتشغيل النشر بدون إدخال كلمة مرور متكررة:

```bash
# على جهازك — إنشاء مفتاح إن لم يكن موجوداً
ssh-keygen -t ed25519 -f ~/.ssh/sheikha_vps -N ""

# نسخ المفتاح إلى الـ VPS (ستُطلب كلمة مرور مرة واحدة)
ssh-copy-id -i ~/.ssh/sheikha_vps.pub root@31.97.190.74
```

ثم عند النشر استخدم: `ssh -i ~/.ssh/sheikha_vps root@31.97.190.74` أو أضف في `~/.ssh/config`:

```
Host sheikha-vps
    HostName 31.97.190.74
    User root
    IdentityFile ~/.ssh/sheikha_vps
```

بعدها النشر يعمل بدون طلب كلمة مرور: `ssh sheikha-vps 'pm2 status'`

### 6. تطبيقان على نفس السيرفر

على الـ VPS قد يظهر تطبيقان في PM2:
- **sheikha-main-portal** (المنفذ 8080) — البوابة الرئيسية؛ **Nginx يوجّه www.sheikha.top إليه**.
- **sheikha-website** (المنفذ 3000) — تطبيق قديم؛ إن لم تعد تحتاجه يمكن إيقافه: `ssh root@31.97.190.74 'pm2 delete sheikha-website'`.

---

## إعدادات يمكن تغييرها

يمكنك تعديل القيم في بداية السكربت أو عبر متغيرات البيئة:

| المتغير | الافتراضي | الوصف |
|---------|-----------|--------|
| VPS_IP | 31.97.190.74 | عنوان الـ VPS |
| VPS_USER | root | مستخدم SSH |
| VPS_DIR | /var/www/sheikha | مجلد التطبيق على السيرفر |
| DOMAIN | www.sheikha.top | النطاق |
| APP_PORT | 8080 | منفذ تطبيق Node (في server.js أيضاً) |

مثال:

```bash
VPS_IP=192.168.1.100 VPS_USER=deploy ./deploy-main-portal-to-sheikha-top.sh
```

---

## استكشاف الأخطاء

| المشكلة | ما تفعله |
|---------|----------|
| SSH لا يتصل | تحقق من الـ IP والمفتاح (مثلاً `ssh -i key root@31.97.190.74`) |
| الموقع لا يفتح | تحقق من DNS (أن sheikha.top يشير إلى الـ IP)، ومن Nginx: `ssh root@31.97.190.74 'systemctl status nginx'` |
| 502 Bad Gateway | التطبيق غير شغال؛ تحقق: `pm2 status` و `pm2 logs sheikha-main-portal` |
| المنفذ 8080 مستخدم | غيّر PORT في server.js على السيرفر أو أوقف العملية التي تستخدم 8080 |

---

## التشغيل المحلي فقط (بدون نشر)

للتجربة على جهازك فقط:

```bash
cd sheikha-main-portal
bash شغل-البوابة.sh
```

ثم افتح: **http://localhost:8080**

---

مرتبط بـ: [تشغيل-الآن.txt](../تشغيل-الآن.txt)، [استكشاف-أخطاء-Node-والتشغيل.md](./استكشاف-أخطاء-Node-والتشغيل.md)، [شغل-الموقع.md](./شغل-الموقع.md).
