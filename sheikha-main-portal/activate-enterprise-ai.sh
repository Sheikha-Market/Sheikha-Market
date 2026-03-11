#!/bin/bash

# 🚀 Sheikha Enterprise AI Development System Activation
# نظام التطوير الذكي المتكامل - تفعيل سريع

set -e

echo "════════════════════════════════════════════════════════════"
echo "🚀 تفعيل نظام التطوير الذكي المتكامل"
echo "Enterprise AI Development System Activation"
echo "════════════════════════════════════════════════════════════"
echo ""

# 1. Check VS Code
echo "📋 1️⃣ فحص VS Code..."
if ! command -v code &> /dev/null; then
    echo "❌ VS Code غير مثبت"
    exit 1
fi
echo "✅ VS Code مثبت"
echo ""

# 2. Verify Node.js
echo "📋 2️⃣ فحص Node.js..."
node --version
npm --version
echo "✅ Node.js جاهز"
echo ""

# 3. Install npm dependencies
echo "📋 3️⃣ تثبيت المتطلبات..."
npm install --legacy-peer-deps
echo "✅ المتطلبات مثبتة"
echo ""

# 4. Run VSCode Doctor
echo "📋 4️⃣ تشخيص النظام (VSCode Doctor)..."
npm run dev:vscode:doctor
echo "✅ التشخيص اكتمل"
echo ""

# 5. Run integration readiness
echo "📋 5️⃣ فحص جهوزية النظام..."
npm run ops:readiness
echo "✅ النظام جاهز"
echo ""

# 6. Create VS Code workspace file if not exists
if [ ! -f "sheikha-main-portal.code-workspace" ]; then
    echo "📋 6️⃣ إنشاء ملف الـ Workspace..."
    cat > sheikha-main-portal.code-workspace << 'WORKSPACE'
{
	"folders": [
		{
			"path": ".",
			"name": "🚀 Sheikha: Enterprise AI Portal"
		}
	],
	"settings": {
		"editor.formatOnSave": true,
		"editor.inlineSuggest.enabled": true,
		"github.copilot.enable": {
			"*": true,
			"plaintext": false
		}
	}
}
WORKSPACE
    echo "✅ ملف الـ Workspace تم إنشاؤه"
else
    echo "✅ ملف الـ Workspace موجود بالفعل"
fi
echo ""

# 7. Summary
echo "════════════════════════════════════════════════════════════"
echo "✨ التفعيل اكتمل بنجاح!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📌 الخطوات التالية:"
echo ""
echo "1️⃣ افتح الـ Workspace:"
echo "   code sheikha-main-portal.code-workspace"
echo ""
echo "2️⃣ دع VS Code يثبت الـ Extensions الموصى بها"
echo "   (ستظهر رسالة في أسفل يمين VS Code)"
echo ""
echo "3️⃣ اضغط F5 لبدء Debugging"
echo "   واختر أحد الخيارات الـ 6"
echo ""
echo "4️⃣ استخدم Copilot:"
echo "   • Ctrl+I -> اطلب من AI"
echo "   • Ctrl+/ -> تعليق سريع"
echo "   • Ctrl+. -> إصلاح ذكي"
echo ""
echo "5️⃣ اقرأ الدليل الكامل:"
echo "   cat ENTERPRISE-AI-DEVELOPER-GUIDE.md"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "🎯 أنت الآن جاهز للتطوير بمستوى Enterprise مع AI! 🤖"
echo "════════════════════════════════════════════════════════════"
echo ""
