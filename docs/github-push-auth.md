# مصادقة Git مع GitHub (دفع التغييرات)

## المشكلة
عند تنفيذ `git push github main` يظهر:
```text
remote: Invalid username or token. Password authentication is not supported for Git operations.
fatal: Authentication failed for 'https://github.com/...'
```
**السبب:** GitHub لا يقبل كلمة مرور الحساب في عمليات Git منذ 2021 — يجب استخدام **رمز وصول شخصي (PAT)** أو **SSH**.

---

## الحل 1: استخدام Personal Access Token (PAT) مع HTTPS

1. **إنشاء رمز وصول:**
   - GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)** أو **Fine-grained**.
   - **Generate new token** — اختر صلاحية `repo` (على الأقل) للقراءة/الكتابة.
   - انسخ الرمز فوراً (لن يظهر مرة أخرى).

2. **تحديث عنوان الـ remote (بدون حفظ الرمز في الملف):**
   ```bash
   cd /home/sheikha/Projects/sheikha
   git remote set-url github https://github.com/Sheikha-Market/Sheikha-Market.git
   ```
   ثم عند أول `git push github main` أدخل:
   - **Username:** اسم مستخدم GitHub (مثلاً `Sheikha` أو الحساب الذي يملك المستودع).
   - **Password:** الصق **الرمز (PAT)** وليس كلمة مرور الحساب.

3. **حفظ المصادقة محلياً (اختياري):**
   ```bash
   git config --global credential.helper store
   ```
   بعد أول push ناجح سيحفظ Git اسم المستخدم والرمز في `~/.git-credentials` (احمِ الملف: `chmod 600 ~/.git-credentials`).

---

## الحل 2: استخدام SSH (موصى به للاستخدام الدائم)

1. **إنشاء مفتاح SSH (إن لم يكن موجوداً):**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/id_ed25519_github -N ""
   ```

2. **إضافة المفتاح العام إلى GitHub:**
   - انسخ المحتوى: `cat ~/.ssh/id_ed25519_github.pub`
   - GitHub → **Settings** → **SSH and GPG keys** → **New SSH key** → الصق المحتوى.

3. **تحديث remote لاستخدام SSH:**
   ```bash
   cd /home/sheikha/Projects/sheikha
   git remote set-url github git@github.com:Sheikha-Market/Sheikha-Market.git
   ```

4. **اختبار الدفع:**
   ```bash
   git push github main
   ```

---

## مزامنة الفرعين (origin = GitLab، github = GitHub)

إذا كان `origin/main` و `github/main` يشيران إلى commit مختلفين:

1. دفع إلى GitLab أولاً (إن كان مصدر الحقيقة):
   ```bash
   git push origin main
   ```
2. مزامنة GitHub:
   - إن كان المستودع على GitHub خلف GitLab: `git push github main`.
   - إن كان هناك تغييرات على GitHub تريد دمجها: `git pull github main --no-rebase` ثم حل التعارضات إن وجدت، ثم `git push origin main` و `git push github main`.

---

## ملخص الأوامر بعد إصلاح المصادقة

```bash
cd /home/sheikha/Projects/sheikha
git fetch origin main && git fetch github main
git push origin main
git push github main
```
