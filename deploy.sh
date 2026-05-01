#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# سكريبت نشر سوق شيخة
# Deploy Script for Sheikha Market
# ═══════════════════════════════════════════════════════════════════════════════

echo "🚀 بدء عملية النشر لسوق شيخة..."
echo ""

# التحقق من وجود vercel CLI
if command -v vercel &> /dev/null; then
    echo "✅ Vercel CLI موجود"
    echo "📤 جاري النشر إلى Vercel..."
    vercel --prod
elif command -v railway &> /dev/null; then
    echo "✅ Railway CLI موجود"
    echo "📤 جاري النشر إلى Railway..."
    railway up
elif command -v netlify &> /dev/null; then
    echo "✅ Netlify CLI موجود"
    echo "📤 جاري النشر إلى Netlify..."
    netlify deploy --prod
else
    echo ""
    echo "⚠️  لم يتم العثور على أداة نشر مثبتة"
    echo ""
    echo "📋 خيارات النشر المتاحة:"
    echo ""
    echo "1️⃣  Vercel (مجاني ومُوصى به):"
    echo "   npm install -g vercel"
    echo "   vercel login"
    echo "   vercel --prod"
    echo ""
    echo "2️⃣  Railway:"
    echo "   npm install -g @railway/cli"
    echo "   railway login"
    echo "   railway up"
    echo ""
    echo "3️⃣  Render:"
    echo "   - افتح https://render.com"
    echo "   - أنشئ Web Service جديد"
    echo "   - اربط مستودع GitHub"
    echo ""
    echo "4️⃣  DigitalOcean App Platform:"
    echo "   - افتح https://cloud.digitalocean.com/apps"
    echo "   - أنشئ تطبيق جديد"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════════"
    echo ""
    echo "🔧 للنشر اليدوي على VPS:"
    echo ""
    echo "1. ارفع الملفات إلى السيرفر:"
    echo "   scp -r . user@your-server:/var/www/sheikha"
    echo ""
    echo "2. على السيرفر:"
    echo "   cd /var/www/sheikha"
    echo "   npm install"
    echo "   pm2 start server.js --name sheikha"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════════"
fi
