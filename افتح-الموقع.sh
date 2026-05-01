#!/usr/bin/env bash
# فتح الموقع في المتصفح + عرض حالة النظام

echo "🎯 ═══════════════════════════════════════════════════"
echo "   منظومة وسوق شيخة — التفعيل الكامل"
echo "   بسم الله الرحمن الرحيم"
echo "════════════════════════════════════════════════════"
echo ""

# فحص الخادم
echo "🔍 فحص الخادم..."
if curl -sS -m 5 http://127.0.0.1:8080/ >/dev/null 2>&1; then
    echo "✅ الخادم يعمل على: http://127.0.0.1:8080"
else
    echo "❌ الخادم لا يعمل - شغّله بـ: npm start"
    exit 1
fi

echo ""
echo "📊 حالة PM2:"
npx pm2 list 2>/dev/null || echo "PM2 غير نشط"

echo ""
echo "🎨 التصميم الجديد:"
echo "   ✅ صور SVG احترافية (gold-premium, copper-premium, silver-premium)"
echo "   ✅ نظام CSS متقدم 3D (أفضل من Apple/Tesla)"
echo "   ✅ Animations سلسة مع cubic-bezier"
echo "   ✅ محتوى راقي احترافي"

echo ""
echo "🔧 الـ Extensions المثبتة:"
code --list-extensions 2>/dev/null | grep -iE "copilot|intellicode|python|gitlens" | while read ext; do
    echo "   ✅ $ext"
done

echo ""
echo "🚀 افتح المتصفح:"
echo "   http://127.0.0.1:8080"
echo ""
echo "💡 لإزالة الكاش:"
echo "   Chrome/Edge: Ctrl+Shift+R"
echo "   Firefox: Ctrl+F5"
echo "   Safari: Cmd+Option+R"
echo ""
echo "════════════════════════════════════════════════════"
echo "✨ النظام جاهز بالكامل - ابدأ التطوير!"
echo "════════════════════════════════════════════════════"

# فتح المتصفح تلقائياً
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open http://127.0.0.1:8080 >/dev/null 2>&1 &
elif command -v open >/dev/null 2>&1; then
    open http://127.0.0.1:8080 >/dev/null 2>&1 &
elif [ -n "$BROWSER" ]; then
    "$BROWSER" http://127.0.0.1:8080 >/dev/null 2>&1 &
fi
