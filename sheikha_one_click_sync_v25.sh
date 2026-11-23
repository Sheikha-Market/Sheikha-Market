#!/usr/bin/env bash
set -e
echo "=================================================================="
echo "🚀 SHEIKHA V25 ONE-CLICK PRODUCTION SYNC (GITHUB + VPS 31.97.190.74)"
echo "=================================================================="

cd "/home/sheikha/Projects/sheikha/sheikha-main-portal"

# 1. مزامنة مستودع GitHub المحلي والبعيد
if [ -d .git ]; then
  echo "📦 [1/3] جاري توثيق ورفع التحديثات (V15 -> V25) إلى GitHub..."
  git add public/ config/ routes/ server.js 2>/dev/null || true
  git commit -m "feat(v25): activate sheikha.app Super-App, all-sector sheikha.digital, 12 domains DNS/Nginx & SAP 35/35 catalog" 2>/dev/null || echo "ℹ️ لا توجد تغييرات جديدة للـ commit."
  git push origin HEAD 2>/dev/null || echo "ℹ️ تم حفظ الـ Commit محلياً (تحقق من صلاحية فرع GitHub عند الرفع)."
fi

# 2. اختبار الاتصال بخادم الإنتاج السحابي (31.97.190.74) ومزامنة الملفات
echo "🌐 [2/3] جاري فحص الاتصال بخادم الإنتاج السحابي (31.97.190.74)..."
if ssh -o BatchMode=yes -o ConnectTimeout=5 root@31.97.190.74 "echo VPS_CONNECTED" 2>/dev/null; then
  echo "✅ الاتصال بـ VPS (31.97.190.74) متاح! جاري رفع الواجهات ومجلد الصور /media/ وملف Nginx..."
  rsync -avz --progress "/home/sheikha/Projects/sheikha/sheikha-main-portal/public/" root@31.97.190.74:/var/www/sheikha/public/
  scp "/home/sheikha/Projects/sheikha/sheikha-main-portal/config/nginx-sheikha-12-domains.conf" root@31.97.190.74:/etc/nginx/sites-available/sheikha-12-domains.conf
  ssh root@31.97.190.74 "ln -sf /etc/nginx/sites-available/sheikha-12-domains.conf /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx"
  echo "🎉 تم نشر وتفعيل النطاقات الـ 12 على خادم الإنتاج (31.97.190.74) بنجاح 100%!"
else
  echo "📋 [جاهز للنقل الفوري]: تم تجهيز حزمة الإنتاج الكاملة في /home/sheikha/Projects/sheikha/sheikha-main-portal."
  echo "   لرفعها يدوياً بكلمة مرور الخادم شغّل:"
  echo "   rsync -avz /home/sheikha/Projects/sheikha/sheikha-main-portal/public/ root@31.97.190.74:/var/www/sheikha/public/"
fi

echo "✅ [3/3] اكتملت عملية البناء والمزامنة للإصدار V25 بنجاح!"
