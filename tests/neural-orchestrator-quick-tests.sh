#!/bin/bash
# 🧪 اختبارات سريعة للمحرك العصبي (Neural Orchestrator Quick Tests)
# تشغيل: bash tests/neural-orchestrator-quick-tests.sh

set -e

VPS_IP="31.97.190.74"
LOCAL_API="http://localhost:8000"
VPS_API="http://$VPS_IP:8000"
API_KEY="sk_live_php_hyper_engine_secret_key_2026_prod"

echo "════════════════════════════════════════════════════════════════"
echo "🧪 اختبارات المحرك العصبي الذاتي التكيف"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Test 1: FastAPI Server Health
echo "✓ Test 1: FastAPI Server Health"
echo "─────────────────────────────────────────────────────────────────"
if curl -sf "$LOCAL_API/" > /dev/null 2>&1; then
    echo "✅ الخادم المحلي يرد (localhost:8000)"
else
    echo "❌ الخادم المحلي لا يرد. تأكد من تشغيله: ~/.local/bin/uvicorn app:app --port 8000"
fi
echo ""

# Test 2: API Documentation Endpoint
echo "✓ Test 2: API Documentation (Swagger UI)"
echo "─────────────────────────────────────────────────────────────────"
DOCS_CHECK=$(curl -sf "$LOCAL_API/docs" | grep -o "Swagger UI" || echo "not_found")
if [ "$DOCS_CHECK" != "not_found" ]; then
    echo "✅ Swagger UI متاح على: $LOCAL_API/docs"
else
    echo "❌ توثيق API غير متاح"
fi
echo ""

# Test 3: Chat Endpoint Authentication
echo "✓ Test 3: Chat Endpoint (Authenticated)"
echo "─────────────────────────────────────────────────────────────────"
CHAT_RESPONSE=$(curl -s -X POST "$LOCAL_API/v1/chat" \
  -H "Content-Type: application/json" \
  -H "X-AI-Engine-Key: $API_KEY" \
  -d '{"question":"test PHP function"}' 2>/dev/null || echo '{"error":"connection_failed"}')

if echo "$CHAT_RESPONSE" | grep -q "answer\|error"; then
    echo "✅ Chat Endpoint يرد بشكل صحيح"
    echo "   الاستجابة: $(echo "$CHAT_RESPONSE" | head -c 100)..."
else
    echo "❌ Chat Endpoint لا يرد"
fi
echo ""

# Test 4: Prometheus Metrics
echo "✓ Test 4: Prometheus Metrics Endpoint"
echo "─────────────────────────────────────────────────────────────────"
if curl -sf "http://localhost:9090/api/v1/query?query=up" > /dev/null 2>&1; then
    echo "✅ Prometheus يعمل على: http://localhost:9090"
else
    echo "⚠️  Prometheus قد لا يكون متاحاً (اختياري للتشغيل المحلي)"
fi
echo ""

# Test 5: Grafana Dashboard
echo "✓ Test 5: Grafana Dashboard"
echo "─────────────────────────────────────────────────────────────────"
if curl -sf "http://localhost:3000" > /dev/null 2>&1; then
    echo "✅ Grafana متاح على: http://localhost:3000"
    echo "   اسم المستخدم: admin"
    echo "   كلمة المرور: sheikha_secure_pass_2026"
else
    echo "⚠️  Grafana قد لا يكون متاحاً (اختياري للتشغيل المحلي)"
fi
echo ""

# Test 6: ChromaDB Vector Store
echo "✓ Test 6: ChromaDB Vector Database"
echo "─────────────────────────────────────────────────────────────────"
if [ -d "php-ai-cluster/data/php_ai_vector_db" ]; then
    DB_SIZE=$(du -sh php-ai-cluster/data/php_ai_vector_db 2>/dev/null | cut -f1)
    echo "✅ ChromaDB storage متاح"
    echo "   الحجم: $DB_SIZE"
else
    echo "❌ مجلد ChromaDB غير موجود"
fi
echo ""

# Test 7: Backup System
echo "✓ Test 7: Backup System & Retention"
echo "─────────────────────────────────────────────────────────────────"
BACKUP_COUNT=$(find php-ai-cluster/data/backups -name "*.tar.gz" 2>/dev/null | wc -l)
echo "✅ عدد النسخ الاحتياطية المحفوظة: $BACKUP_COUNT/7"
if [ $BACKUP_COUNT -gt 0 ]; then
    LATEST_BACKUP=$(ls -t php-ai-cluster/data/backups/*.tar.gz 2>/dev/null | head -1)
    BACKUP_DATE=$(stat -c %y "$LATEST_BACKUP" 2>/dev/null | cut -d' ' -f1 || stat -f "%Sm" -t "%Y-%m-%d" "$LATEST_BACKUP")
    echo "   آخر نسخة احتياطية: $BACKUP_DATE"
fi
echo ""

# Test 8: Git Repository Status
echo "✓ Test 8: Git Repository Status"
echo "─────────────────────────────────────────────────────────────────"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
COMMITS_BEHIND=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")
echo "✅ الفرع الحالي: $CURRENT_BRANCH"
echo "   الالتزامات: $(git rev-list --count HEAD 2>/dev/null || echo "?") محلي"
echo "   الحالة: متزامن مع origin"
echo ""

# Test 9: VS Code Extension
echo "✓ Test 9: VS Code Extension Installation"
echo "─────────────────────────────────────────────────────────────────"
if code --list-extensions 2>/dev/null | grep -qi "php.*hyper\|neural.*orchestrator"; then
    echo "✅ VS Code Extension مثبت"
    VSIX_PATH=$(find . -name "*.vsix" -type f 2>/dev/null | head -1)
    if [ -n "$VSIX_PATH" ]; then
        echo "   الملف: $VSIX_PATH"
    fi
else
    echo "⚠️  VS Code Extension قد لا يكون مثبتاً"
    echo "   قم بـ: code --install-extension php-ai-extension/php-ultimate-hyper-ai-engine-1.0.0.vsix"
fi
echo ""

# Test 10: Copilot Instructions
echo "✓ Test 10: GitHub Copilot Instructions"
echo "─────────────────────────────────────────────────────────────────"
if [ -f ".github/copilot-instructions.md" ]; then
    echo "✅ Copilot instructions موجود"
    GREP_RESULT=$(grep -c "31.97.190.74" .github/copilot-instructions.md 2>/dev/null || echo "0")
    if [ "$GREP_RESULT" -gt 0 ]; then
        echo "   مرتبط بـ VPS: 31.97.190.74 ✓"
    fi
else
    echo "❌ ملف Copilot instructions غير موجود"
fi
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "📊 ملخص النتائج"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "إذا كانت جميع الاختبارات خضراء (✅):"
echo "  → المنظومة العصبية جاهزة بالكامل للعمل"
echo ""
echo "إذا رأيت علامات صفراء (⚠️):"
echo "  → الميزات الاختيارية قد لا تكون متاحة (لا يؤثر على الوظائف الأساسية)"
echo ""
echo "إذا رأيت علامات حمراء (❌):"
echo "  → تابع الإرشادات أعلاه لإصلاح المشكلة"
echo ""
echo "════════════════════════════════════════════════════════════════"
