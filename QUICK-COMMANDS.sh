#!/bin/bash
# بسم الله الرحمن الرحيم
# أوامر سريعة — Quick Commands for Sheikha Pixel Ecosystem

# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 التشغيل
# ═══════════════════════════════════════════════════════════════════════════════

# التوحيد القياسي (Local + Production)
# 1) تفعيل Node الموحد
# nvm use
# node -v   # expected: v22.22.2

# 2) التشغيل المحلي الموحّد
# pm2 delete all
# pm2 start ecosystem.config.js
# pm2 save

# 3) التشغيل الإنتاجي الموحّد
# pm2 start ecosystem.config.js --env production

# 4) الأمر الرسمي لإعادة التشغيل
# pm2 restart sheikha-main-portal

# 5) أوامر ممنوعة (تسبب تعارض runtime)
# - node server.js
# - npm start
# - systemctl start sheikha-main

# تشغيل الخادم (Legacy - غير موصى به بعد التوحيد)
# npm run dev

# تشغيل مع السجلات (Legacy - غير موصى به بعد التوحيد)
# npm run dev 2>&1 | tee logs/sheikha.log

# تشغيل على السيرفر البعيد (مهم: لا تشغّل من /root)
# ssh root@31.97.190.74
# cd /path/to/sheikha-main-portal
# ls package.json
# npm install
# pm2 start ecosystem.config.js --env production

# فحص الخدمة بعد التشغيل
# curl http://localhost:8080/api/health
# curl http://localhost:8080/api/status
# curl http://localhost:8080/api/pixel-system/status

# ═══════════════════════════════════════════════════════════════════════════════
# 🧪 الاختبارات
# ═══════════════════════════════════════════════════════════════════════════════

# اختبار المنظومة المتكاملة الكاملة
# node tests/pixel-ecosystem-integration.test.js

# اختبار نظام البكسل الأساسي
# node tests/pixel-system.test.js

# اختبار مع سجل مفصل
# node tests/pixel-ecosystem-integration.test.js 2>&1 | tee test-results.log

# ═══════════════════════════════════════════════════════════════════════════════
# 📚 السكريبتات الجاهزة
# ═══════════════════════════════════════════════════════════════════════════════

# 1. توليد وتحليل البكسلات
# node scripts/pixel-scripts.js generate product 10

# 2. توليد من قالب transaction
# node scripts/pixel-scripts.js generate transaction 5

# 3. توليد من قالب content
# node scripts/pixel-scripts.js generate content 3

# 4. تدريب نموذج والتنبؤ
# node scripts/pixel-scripts.js train

# 5. معالجة دفعة متقدمة
# node scripts/pixel-scripts.js batch

# 6. عرض حالة المنظومة
# node scripts/pixel-scripts.js status

# 7. تجميع ذكي للبكسلات
# node scripts/pixel-scripts.js cluster

# ═══════════════════════════════════════════════════════════════════════════════
# 🔌 استدعاءات API (curl)
# ═══════════════════════════════════════════════════════════════════════════════

# الحصول على حالة المنظومة
# curl http://localhost:8080/api/status

# تهيئة المنظومة
# curl -X POST http://localhost:8080/api/ecosystem/init

# لوحة التحكم
# curl http://localhost:8080/api/dashboard | jq .

# فحص التكيف الجغرافي + الشبكة العصبية الجذرية
# curl http://localhost:8080/api/adaptive/status | jq .
# curl -X POST http://localhost:8080/api/adaptive/resolve \
#   -H "Content-Type: application/json" \
#   -d '{"countryCode":"SA","timezone":"Asia/Riyadh"}' | jq .
# curl -X POST http://localhost:8080/api/adaptive/root-neural/activate \
#   -H "Content-Type: application/json" \
#   -d '{"countryCode":"SA"}' | jq .

# ───────────────────────────────────────────────────────────────────────────────
# AI Engine
# ───────────────────────────────────────────────────────────────────────────────

# تدريب نموذج
# curl -X POST http://localhost:8080/api/ai/train \
#   -H "Content-Type: application/json" \
#   -d '{
#     "trainingData": [
#       {"value": 100, "label": "high"},
#       {"value": 50, "label": "medium"},
#       {"value": 10, "label": "low"}
#     ],
#     "modelName": "test-model"
#   }' | jq .

# التنبؤ
# curl -X POST http://localhost:8080/api/ai/predict \
#   -H "Content-Type: application/json" \
#   -d '{
#     "input": {"value": 75},
#     "modelName": "test-model"
#   }' | jq .

# قائمة النماذج
# curl http://localhost:8080/api/ai/models | jq .

# ───────────────────────────────────────────────────────────────────────────────
# LLM Bridge
# ───────────────────────────────────────────────────────────────────────────────

# توليد أوامر ذكية
# curl -X POST http://localhost:8080/api/llm/generate-prompt \
#   -H "Content-Type: application/json" \
#   -d '{
#     "pixel": {
#       "id": "pixel-001",
#       "data": {"type": "gold", "weight": 100}
#     },
#     "context": {"operation": "analyze"}
#   }' | jq .

# معالجة استجابة LLM
# curl -X POST http://localhost:8080/api/llm/process-response \
#   -H "Content-Type: application/json" \
#   -d '{
#     "promptId": "prompt-1",
#     "aiResponse": "استجابة من النموذج اللغوي"
#   }' | jq .

# ───────────────────────────────────────────────────────────────────────────────
# Generation Engine
# ───────────────────────────────────────────────────────────────────────────────

# توليد بكسلات
# curl -X POST http://localhost:8080/api/generation/generate \
#   -H "Content-Type: application/json" \
#   -d '{"template":"product","count":5}' | jq .

# توليد بخيارات مخصصة
# curl -X POST http://localhost:8080/api/generation/generate \
#   -H "Content-Type: application/json" \
#   -d '{
#     "template":"product",
#     "count":3,
#     "options":{"category":"gold"}
#   }' | jq .

# الإحصائيات
# curl http://localhost:8080/api/generation/stats | jq .

# ───────────────────────────────────────────────────────────────────────────────
# Tools Manager
# ───────────────────────────────────────────────────────────────────────────────

# قائمة الأدوات
# curl http://localhost:8080/api/tools/list | jq .

# تنفيذ أداة analyze
# curl -X POST http://localhost:8080/api/tools/execute \
#   -H "Content-Type: application/json" \
#   -d '{
#     "toolName":"analyze",
#     "args":[{"id":"p1","data":{"value":100}}]
#   }' | jq .

# تنفيذ أداة optimize
# curl -X POST http://localhost:8080/api/tools/execute \
#   -H "Content-Type: application/json" \
#   -d '{
#     "toolName":"optimize",
#     "args":[{"id":"p1","data":{"value":100,"extra":null}}]
#   }' | jq .

# تنفيذ أداة compare
# curl -X POST http://localhost:8080/api/tools/execute \
#   -H "Content-Type: application/json" \
#   -d '{
#     "toolName":"compare",
#     "args":[
#       {"id":"p1","data":{"value":100}},
#       {"id":"p2","data":{"value":150}}
#     ]
#   }' | jq .

# ───────────────────────────────────────────────────────────────────────────────
# Scripts Manager
# ───────────────────────────────────────────────────────────────────────────────

# قائمة السكريبتات
# curl http://localhost:8080/api/scripts/list | jq .

# تنفيذ سكريبت batch-process
# curl -X POST http://localhost:8080/api/scripts/execute \
#   -H "Content-Type: application/json" \
#   -d '{
#     "scriptName":"batch-process",
#     "context":{"pixels":[...],"applyNeural":true}
#   }' | jq .

# ═══════════════════════════════════════════════════════════════════════════════
# 📊 اختبارات شاملة (مسارات متعددة)
# ═══════════════════════════════════════════════════════════════════════════════

# اختبار كامل - 1️⃣ الحالة
# curl http://localhost:8080/api/status | jq .

# اختبار كامل - 2️⃣ التهيئة
# curl -X POST http://localhost:8080/api/ecosystem/init | jq .

# اختبار كامل - 3️⃣ التوليد
# curl -X POST http://localhost:8080/api/generation/generate \
#   -H "Content-Type: application/json" \
#   -d '{"template":"product","count":3}' | jq .

# اختبار كامل - 4️⃣ الأدوات
# curl http://localhost:8080/api/tools/list | jq .

# اختبار كامل - 5️⃣ لوحة التحكم
# curl http://localhost:8080/api/dashboard | jq .

# ═══════════════════════════════════════════════════════════════════════════════
# 🔍 التحقق والتشخيص
# ═══════════════════════════════════════════════════════════════════════════════

# التحقق من أن الخادم يعمل
# curl -s http://localhost:8080/api/health

# التحقق من المنفذ 8080
# lsof -i :8080

# التحقق من جميع المتغيرات البيئية
# env | grep PIXEL

# عرض السجلات
# tail -f logs/sheikha.log

# عد الأسطر البرمجية
# wc -l lib/sheikha-pixel-*.js routes/pixel-*.js scripts/pixel-*.js

# ═══════════════════════════════════════════════════════════════════════════════
# 🐛 المسح والتنظيف
# ═══════════════════════════════════════════════════════════════════════════════

# حذف node_modules (إذا لزم الأمر)
# rm -rf node_modules

# إعادة تثبيت المتعلقات
# npm install

# تنظيف السجلات
# rm -f logs/*.log

# ═══════════════════════════════════════════════════════════════════════════════
# 📈 المراقبة المستمرة (Monitoring)
# ═══════════════════════════════════════════════════════════════════════════════

# مراقبة الخادم (كل 5 ثوانٍ)
# watch -n 5 'curl -s http://localhost:8080/api/status | jq .'

# مراقبة الأداء
# npm run dev & watch -n 5 'ps aux | grep node'

# ═══════════════════════════════════════════════════════════════════════════════
# 📦 النشر والإنتاج
# ═══════════════════════════════════════════════════════════════════════════════

# بناء للإنتاج
# npm run build

# بدء الإنتاج
# npm start

# نشر إلى Vercel
# vercel --prod

# نشر إلى Heroku
# git push heroku main

# ═══════════════════════════════════════════════════════════════════════════════
# 🧩 التعليمات السريعة
# ═══════════════════════════════════════════════════════════════════════════════

# 1️⃣ ابدأ الخادم
# npm run dev

# 2️⃣ في نافذة أخرى، اختبر الاتصال
# curl http://localhost:8080/api/status

# 3️⃣ شغّل الاختبارات
# node tests/pixel-ecosystem-integration.test.js

# 4️⃣ استخدم السكريبتات
# node scripts/pixel-scripts.js status

# 5️⃣ استدعِ API مباشرة
# curl -X POST http://localhost:8080/api/generation/generate \
#   -H "Content-Type: application/json" \
#   -d '{"template":"product","count":5}' | jq .

# ═══════════════════════════════════════════════════════════════════════════════
# 💡 نصائح مفيدة
# ═══════════════════════════════════════════════════════════════════════════════

# استخدم jq لتنسيق JSON بشكل جميل:
# curl ... | jq .

# حفظ النتائج في ملف:
# curl ... > results.json

# اختبر مع Pretty Print:
# curl ... | jq '.' > output.json && cat output.json

# اختبر مع timeout:
# timeout 30 node scripts/pixel-scripts.js train

# اختبر مع تسجيل الأخطاء:
# node tests/pixel-ecosystem-integration.test.js 2>&1 | tee test.log

# ═══════════════════════════════════════════════════════════════════════════════
# 📖 الملفات المرجعية
# ═══════════════════════════════════════════════════════════════════════════════

# دليل شامل:
# cat docs/PIXEL-ECOSYSTEM-GUIDE-AR.md

# دليل التكامل:
# cat PIXEL-ECOSYSTEM-INTEGRATION-GUIDE.md

# الملخص التنفيذي:
# cat PIXEL-ECOSYSTEM-EXECUTIVE-SUMMARY.md

# ملخص التكامل:
# cat PIXEL-ECOSYSTEM-INTEGRATION-SUMMARY.md

# ═══════════════════════════════════════════════════════════════════════════════
# 🎯 اختصارات لـ bashrc
# ═══════════════════════════════════════════════════════════════════════════════

# أضف هذه الأسطر إلى ~/.bashrc للاختصارات السريعة:

# alias sheikha-start='npm run dev'
# alias sheikha-test='node tests/pixel-ecosystem-integration.test.js'
# alias sheikha-status='curl http://localhost:8080/api/status | jq .'
# alias sheikha-generate='node scripts/pixel-scripts.js generate'
# alias sheikha-train='node scripts/pixel-scripts.js train'

# ثم استخدمها مباشرة:
# sheikha-start
# sheikha-test
# sheikha-status

# ═══════════════════════════════════════════════════════════════════════════════

echo "✅ أوامر سريعة لمنظومة البكسل الذكية"
echo ""
echo "📚 الاستخدام:"
echo ""
echo "1. ابدأ الخادم:        npm run dev"
echo "2. اختبر المنظومة:      node tests/pixel-ecosystem-integration.test.js"
echo "3. شغّل سكريبت:        node scripts/pixel-scripts.js status"
echo "4. استدعِ API:         curl http://localhost:8080/api/status"
echo ""
echo "📖 للمزيد، اقرأ أحد الملفات التالية:"
echo "   - docs/PIXEL-ECOSYSTEM-GUIDE-AR.md"
echo "   - PIXEL-ECOSYSTEM-EXECUTIVE-SUMMARY.md"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# 🔭 منظومة الاستكشاف والبحث — تشغيل سريع
# ═══════════════════════════════════════════════════════════════════════════════

echo "🔭 أوامر منظومة الاستكشاف والبحث"
echo ""
echo "1. دليل المنهجية:       cat docs/exploration/PLAYBOOK.md"
echo "2. قالب تجربة:          cat docs/exploration/templates/research-run.md"
echo "3. بدء دورة استكشاف:    bash tools/exploration/init-run.sh EXP-2026-001 earth-sky-space"
echo "4. التحقق التشغيلي:      pm2 status && curl http://127.0.0.1:8080/api/health"
echo "5. مراجعة السجلات:       pm2 logs sheikha-main-portal --lines 50 --nostream"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# 🧭 Runtime OS — أوامر موثوقية التشغيل المستمر
# ═══════════════════════════════════════════════════════════════════════════════

echo "🧭 Runtime OS Commands"
echo ""
echo "1. تهيئة hooks:           bash tools/setup-hooks.sh"
echo "2. تحديث البصمة:          bash tools/runtime/update-fingerprint.sh"
echo "3. تحقق runtime:          bash tools/runtime/verify-runtime.sh"
echo "4. جمع metrics:           bash tools/runtime/collect-runtime-metrics.sh"
echo "5. Contracts check:       curl http://127.0.0.1:8080/api/live"
echo "                          curl http://127.0.0.1:8080/api/ready"
echo "                          curl http://127.0.0.1:8080/api/version"
echo "                          curl http://127.0.0.1:8080/api/runtime"
echo ""
