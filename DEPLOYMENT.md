# شيخة — دليل النشر على VPS

## معلومات الخادم

- **العنوان**: `31.97.190.74`
- **النظام**: Ubuntu 24.04.4 LTS
- **المسار**: `/opt/sheikha/current`
- **المستخدم**: `root`

---

## إعداد SSH (مرة واحدة فقط)

### 1. إنشاء مفتاح SSH بدون Passphrase

```bash
# على الـ VPS
ssh-keygen -t ed25519 -C "sheikha-vps-deploy" -f ~/.ssh/github_vps -N ""
```

### 2. إضافة المفتاح العام إلى GitHub

```bash
# انسخ المفتاح العام
cat ~/.ssh/github_vps.pub
```

ثم:
1. اذهب إلى: **https://github.com/settings/keys**
2. اضغط **New SSH key**
3. أضف:
   - **Title**: `Sheikha VPS Deploy`
   - **Key**: ألصق محتوى `github_vps.pub`
4. اضغط **Add SSH key**

### 3. اختبر الاتصال

```bash
ssh -T git@github.com
# النتيجة المتوقعة: "Hi Sheikha-Market! You've successfully authenticated..."
```

---

## سير العمل اليومي

### الطريقة 1: نشر يدوي على VPS

```bash
# تسجيل دخول إلى VPS
ssh root@31.97.190.74

# الانتقال إلى المسار
cd /opt/sheikha/current

# سحب أحدث الكود من GitHub
git pull origin main

# التحقق من الحالة
git status

# إعادة تشغيل الخادم (إذا لزم)
npm restart
```

### الطريقة 2: استخدام Deploy Script (موصى به)

```bash
# من الجهاز المحلي
bash scripts/deploy-vps.sh
```

---

## CI/CD مع GitHub Actions

تم إعداد **GitHub Actions** في `.github/workflows/deploy.yml` لـ:
- ✅ اختبار الكود (lint, tests)
- ✅ بناء Docker image
- ✅ نشر تلقائي على VPS عند الـ push إلى `main`

---

## استكشاف الأخطاء

### خطأ: Permission denied (publickey)

**السبب**: المفتاح العام غير مضاف في GitHub

**الحل**:
```bash
# تأكد أن المفتاح موجود
cat ~/.ssh/github_vps.pub

# أضفه يدويًا في GitHub Settings
```

### خطأ: Could not resolve hostname github.com-sheikha

**السبب**: SSH config يستخدم alias غير معرّف

**الحل**: استخدم اسم الـ host الصحيح:
```bash
cat ~/.ssh/config
# يجب أن يحتوي على:
# Host github.com github.com-sheikha
#   HostName github.com
#   IdentityFile ~/.ssh/github_vps
```

### خطأ: Divergent branches

**السبب**: الفروع متباعدة بين المحلي والبعيد

**الحل**:
```bash
git config pull.rebase true
git pull origin main
```

---

## الأمان

⚠️ **تجنب**:
- ❌ لا تنقل المفتاح الخاص (`github_vps`)
- ❌ لا تحفظ passphrase في الملفات
- ❌ لا تقم برفع `.env` أو أي ملف سري

✅ **أفضل الممارسات**:
- ✅ استخدم مفتاح منفصل لكل بيئة (dev, staging, prod)
- ✅ استخدم GitHub Secrets للـ tokens والمفاتيح
- ✅ استخدم Deploy Keys بصلاحيات محدودة (read-only إذا أمكن)

---

## الملاحظات

- `main` هو الفرع الرسمي للإنتاج
- جميع التحديثات تمر عبر GitHub Actions قبل النشر
- احفظ سجل التغييرات في [CHANGELOG.md](CHANGELOG.md)

---

**آخر تحديث**: 15 مايو 2026
**المالك**: Sheikha Market / سلمان أحمد الراجح
