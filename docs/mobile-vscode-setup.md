# بسم الله الرحمن الرحيم
# دليل إعداد VS Code على الجوال — منظومة شيخة
# ================================================================
# المالك: سلمان أحمد بن سلمان الراجح
# الدومين: sheikha.top | البريد: market@sheikha.top
# ================================================================

## ما هو code-server؟

**code-server** يحوّل VS Code إلى تطبيق ويب يعمل على السيرفر.  
تفتحه من **أي متصفح** على أي جهاز — جوال، تابلت، كمبيوتر آخر — بدون تثبيت أي شيء.

---

## البنية الكاملة

```
جهازك (السيرفر/الكمبيوتر)
    └── code-server يعمل على المنفذ 8443
            ↑
    شبكة WiFi المحلية
            ↓
جوالك (المتصفح) → http://192.168.X.X:8443
                      → أدخل كلمة المرور
                      → VS Code يفتح مباشرة !
```

---

## الإعداد من الصفر

### الخطوة 1 — الدخول لمجلد المشروع
```bash
cd /workspaces/sheikha/sheikha-main-portal
# أو على جهازك المحلي:
cd ~/sheikha-main-portal
```

### الخطوة 2 — تشغيل سكربت الإعداد الكامل
```bash
npm run ops:mobile:setup
```

**ما يفعله هذا الأمر تلقائياً:**
1. يتحقق من وجود Node.js و npm
2. يثبت `code-server` (إذا لم يكن مثبتاً)
3. يولّد كلمة مرور عشوائية آمنة (20 حرف)
4. يحفظ كلمة المرور في `~/.config/code-server/.password` (صلاحيات 600)
5. يكتب ملف الإعدادات في `~/.config/code-server/config.yaml`
6. يشغّل code-server في الخلفية
7. يعرض الرابط وكلمة المرور

### الخطوة 3 — احفظ بيانات الاتصال
عند انتهاء الإعداد ستظهر:
```
╔══════════════════════════════════════════════════╗
║         بيانات الاتصال من الجوال                ║
╠══════════════════════════════════════════════════╣
║ الرابط المحلي  : http://192.168.1.X:8443
║ كلمة المرور   : [كلمة المرور هنا]
║ المنفذ        : 8443
╚══════════════════════════════════════════════════╝
```
**احفظ كلمة المرور الآن في مكان آمن.**

---

## الاتصال من الجوال

### شرط أساسي
- جهازك والجوال **على نفس شبكة WiFi**
- أو استخدام tunnel (انظر قسم الوصول الخارجي)

### الخطوات
1. افتح **متصفح Chrome أو Safari** على الجوال
2. اكتب الرابط: `http://[IP الجهاز]:8443`
3. أدخل كلمة المرور
4. VS Code سيفتح في المتصفح!

### كيف أعرف IP الجهاز؟
```bash
hostname -I | awk '{print $1}'
# مثال: 192.168.1.105
```

---

## أوامر التحكم السريع

| الأمر | الوظيفة |
|-------|---------|
| `npm run ops:mobile:setup` | إعداد كامل من الصفر (مرة واحدة فقط) |
| `npm run ops:mobile:start` | تشغيل code-server |
| `npm run ops:mobile:stop` | إيقاف code-server |
| `npm run ops:mobile:restart` | إعادة تشغيل |
| `npm run ops:mobile:status` | فحص الحالة والرابط |
| `npm run ops:mobile:password` | عرض كلمة المرور |
| `npm run ops:mobile:logs` | عرض آخر 50 سطر من السجلات |

---

## ملفات الإعدادات

| الملف | المحتوى | الصلاحيات |
|-------|---------|-----------|
| `~/.config/code-server/config.yaml` | إعدادات الخادم | 600 (خاص) |
| `~/.config/code-server/.password` | كلمة المرور | 600 (خاص جداً) |
| `config/mobile-access.json` | معلومات الاتصال (بدون كلمة المرور) | 600 |
| `logs/code-server.log` | سجلات التشغيل | - |

---

## الوصول من خارج الشبكة المحلية

### الطريقة 1: GitHub Codespaces (الأسهل لمشروعك)
مشروعك موجود في Codespace بالفعل:
1. افتح `github.com/codespaces` من الجوال
2. اضغط على الـ Codespace الخاص بشيخة
3. VS Code يفتح في متصفح الجوال مباشرة — **بدون إعداد!**

### الطريقة 2: Cloudflare Tunnel (مجاني وآمن)
```bash
# تثبيت cloudflared
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# إنشاء tunnel مؤقت
cloudflared tunnel --url http://localhost:8443
# سيعطيك رابط عام مثل: https://xxx-yyy.trycloudflare.com
```

### الطريقة 3: ngrok
```bash
# تثبيت ngrok
npm install -g ngrok

# تشغيل tunnel
ngrok http 8443
# رابط عام مثل: https://xxxx.ngrok.io
```

---

## الأمان والسلامة

### ما تم تطبيقه تلقائياً:
- كلمة مرور عشوائية قوية (20 حرف) ومحفوظة بصلاحيات 600
- الاتصال محلي فقط (لا يُكشف للإنترنت بدون tunnel)
- ملف `config/mobile-access.json` لا يحتوي كلمة المرور

### توصيات إضافية:
- لا تشارك كلمة المرور
- لا تفعّل code-server على شبكات WiFi عامة (فنادق، مطاعم)
- إذا نسيت كلمة المرور: `npm run ops:mobile:password`
- لتغيير كلمة المرور: احذف `~/.config/code-server/.password` ثم أعد الإعداد

---

## حل المشكلات الشائعة

### المشكلة: الرابط لا يفتح من الجوال
```bash
# تحقق أن code-server يعمل
npm run ops:mobile:status

# تحقق من المنفذ
ss -tlnp | grep 8443

# تحقق من الـ IP
hostname -I
```

### المشكلة: خطأ "Wrong password"
```bash
# عرض كلمة المرور الصحيحة
npm run ops:mobile:password
```

### المشكلة: code-server لا يبدأ
```bash
# عرض السجلات
npm run ops:mobile:logs

# تثبيت يدوي
npm install -g code-server

# تشغيل مباشر بدون الأمر
code-server --bind-addr 0.0.0.0:8443 --auth password /workspaces/sheikha/sheikha-main-portal
```

---

## التشغيل التلقائي عند بدء النظام (اختياري)

### Linux (systemd)
```bash
# إنشاء service
sudo tee /etc/systemd/system/code-server.service << EOF
[Unit]
Description=code-server — Sheikha VS Code Mobile
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/workspaces/sheikha/sheikha-main-portal
ExecStart=$(which code-server) --config ~/.config/code-server/config.yaml /workspaces/sheikha/sheikha-main-portal
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# تفعيل
sudo systemctl enable code-server
sudo systemctl start code-server
sudo systemctl status code-server
```

---

## ملخص سريع (Cheat Sheet)

```bash
# إعداد لأول مرة
npm run ops:mobile:setup

# اعرف الرابط
npm run ops:mobile:status

# اعرف كلمة المرور
npm run ops:mobile:password

# أوقف الخادم
npm run ops:mobile:stop

# أعد تشغيله
npm run ops:mobile:restart
```

---

*آخر تحديث: مارس 2026 | منظومة شيخة — sheikha.top*
