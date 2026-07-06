# 🔒 Unified Environment Configuration
## منع التعارض والاختلافات

**تاريخ التوحيد:** 2026-05-11
**النسخة:** 1.0.0 (أول نسخة production مستقرة)

---

## ✅ المعايير الموحدة

### 1. Node.js
- **الإصدار:** v22.22.2 LTS
- **الإدارة:** NVM (Node Version Manager)
- **التحقق المحلي:**
  ```bash
  nvm use 22
  node -v  # يجب أن يعود: v22.22.2
  ```
- **التحقق على VPS:**
  ```bash
  ssh root@31.97.190.74 node -v  # يجب أن يعود: v22.22.2
  ```

### 2. PM2
- **الإصدار:** 6.0.14+
- **تشغيل:** عبر `ecosystem.config.js` فقط
- **الأوامر المسموحة فقط:**
  ```bash
  npx pm2 start ecosystem.config.js
  npx pm2 restart sheikha-main-portal
  npx pm2 logs sheikha-main-portal
  npx pm2 status
  ```
- **الأوامر الممنوعة:**
  ```bash
  ❌ node server.js
  ❌ npm start
  ❌ systemctl start sheikha-main
  ❌ pm2 start server.js
  ```

### 3. المنفذ (Port)
- **المنفذ الموحد:** 8080
- **التشغيل على:** 0.0.0.0:8080 (جميع الواجهات)
- **بدون fallback أو auto-migration**

### 4. Git
- **الفرع الموحد:** `review/safe-analysis`
- **الـ Remote:**
  ```
  origin: https://github.com/Sheikha-top/sheikha-enterprise-portal.git
  ```
- **التحقق:**
  ```bash
  git branch  # يجب أن يعود: review/safe-analysis
  git remote -v
  ```

### 5. بيئة العمل (Environment Variables)
```bash
# الموحد على الجهازين
NODE_ENV=production|development
PORT=8080
SHEIKHA_RUNTIME=primary
HOST=127.0.0.1 (محلي) أو 0.0.0.0 (VPS)
```

### 6. مساحة العمل في VS Code (.vscode/settings.json)
```json
{
  "terminal.integrated.defaultProfile.linux": "bash",
  "files.autoSave": "afterDelay",
  "editor.formatOnSave": true,
  "git.autofetch": true,
  "npm.packageManager": "npm",
  "editor.tabSize": 2,
  "search.exclude": {
    "**/node_modules": true,
    "**/.git": true
  }
}
```

### 7. ملف تكوين PM2 (ecosystem.config.js)
```javascript
module.exports = {
  apps: [
    {
      name: "sheikha-main-portal",
      script: "./server.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: { NODE_ENV: "development", PORT: 8080 },
      env_production: { NODE_ENV: "production", PORT: 8080 }
    }
  ]
};
```

---

## 📋 قائمة التحقق (Pre-Deployment)

قبل كل push أو تغيير:

- [ ] `git branch` ← يجب أن يكون `review/safe-analysis`
- [ ] `node -v` ← يجب أن يكون `v22.22.2`
- [ ] `npx pm2 status` ← يجب أن يكون `online`
- [ ] `curl http://localhost:8080/api/status` ← يجب أن يستجيب
- [ ] لا استخدام `node server.js` أو `npm start`
- [ ] لا تعديل يدوي على المنفذ
- [ ] لا إنشاء متغيرات بيئة جديدة بدون توثيق

---

## 🚨 إذا حدث تعارض

### السيناريو 1: الخادم لا يعمل
```bash
# تحقق أولاً
npx pm2 status
npx pm2 logs sheikha-main-portal

# أعد التشغيل
npx pm2 restart sheikha-main-portal

# إذا استمر: حذف وأعد البدء
npx pm2 delete all
npx pm2 start ecosystem.config.js
```

### السيناريو 2: إصدار Node مختلف
```bash
nvm use 22
nvm alias default 22
npm install
npx pm2 restart sheikha-main-portal
```

### السيناريو 3: تضارب Git Branch
```bash
git fetch --all --prune
git checkout review/safe-analysis
git pull origin review/safe-analysis
```

### السيناريو 4: الملفات المحلية مختلفة عن الـ VPS
```bash
# نسخ الملفات الحالية إلى VPS
scp ecosystem.config.js root@31.97.190.74:/opt/sheikha/current/
scp .vscode/settings.json root@31.97.190.74:/opt/sheikha/current/.vscode/

# أعد تشغيل PM2 على VPS
ssh root@31.97.190.74 'cd /opt/sheikha/current && npx pm2 restart sheikha-main-portal'
```

---

## 📊 مقاييس المراقبة (Health Check)

### المحلي
```bash
curl http://localhost:8080/api/status
npx pm2 status
npx pm2 monit
```

### VPS
```bash
ssh root@31.97.190.74 'pm2 status && curl -s http://127.0.0.1:8080/api/status | jq'
```

---

## 🔄 عملية التحديث الموحدة

1. **تطوير محلي:**
   ```bash
   git checkout review/safe-analysis
   npm install
   npx pm2 start ecosystem.config.js
   ```

2. **اختبار:**
   ```bash
   curl http://localhost:8080/api/status
   npx pm2 logs sheikha-main-portal
   ```

3. **نشر على VPS:**
   ```bash
   git push origin review/safe-analysis
   ssh root@31.97.190.74 'cd /opt/sheikha/current && git pull && npm install && npx pm2 restart sheikha-main-portal'
   ```

4. **التحقق النهائي:**
   ```bash
   ssh root@31.97.190.74 'npx pm2 status && curl -s http://127.0.0.1:8080/api/status'
   ```

---

## 📅 السجل

| التاريخ | الحدث | الحالة |
|---------|-------|--------|
| 2026-05-11 | توحيد المنظومة الأولى | ✅ مكتمل |
| Node 22 + PM2 unified | VPS + Local | ✅ متطابق |
| ecosystem.config.js | موحد | ✅ موحد |
| Git Branch | review/safe-analysis | ✅ موحد |

---

**⚠️ ملاحظة مهمة:**
هذا الملف يجب أن يكون **نقطة مرجعية واحدة** للفريق. عند حدوث أي اختلاف، رجع إلى هذه المعايير الموحدة.
