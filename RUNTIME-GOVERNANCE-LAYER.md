# SHEIKHA Integrated Runtime Operations Layer

## الهدف
توحيد دورة التشغيل بين المحلي وGitHub وVPS وPM2 ضمن مسار واحد قابل للمراقبة والاسترجاع.

## الفرع المرجعي
- الفرع المعتمد للإنتاج: stable/runtime-baseline
- يمنع تشغيل PM2 الإنتاجي من أي فرع آخر.

## دورة التشغيل المعتمدة
1. Edit
2. Commit
3. Push إلى stable/runtime-baseline
4. CI checks
5. Deploy إلى VPS
6. Health gates (/api/live + /api/server/health)
7. Runtime report generation
8. Rollback تلقائي عند الفشل

## سياسات النشر
- deploy workflow يعمل فقط عند push على stable/runtime-baseline.
- النشر يعتمد git fetch + git reset --hard origin/stable/runtime-baseline على VPS.
- بعد النشر يتم فحص health gates.
- عند فشل health gates يتم rollback إلى commit السابق تلقائيا.
- كل نشر ينتج تقرير JSON في:
  - /opt/sheikha/runtime-reports/

## سياسات rollback
- لا restore عشوائي من نسخ غير موثقة.
- rollback الرسمي عبر:
  - scripts/rollback-deployment.sh
- للوضع غير التفاعلي:
  - ROLLBACK_CONFIRM=yes

## طبقة المراقبة الموحدة
- logs/runtime/
- logs/errors/
- logs/health/
- logs/security/

التقرير المحلي الموحد:
- scripts/runtime-ops-report.sh

## حدود المرحلة الحالية
- لا Kubernetes حاليا.
- لا Distributed AI Mesh حاليا.
- لا auto-scaling cluster حاليا.

## شروط الانتقال للتوسع
- Git clean
- PM2 stable
- Deploy stable
- Rollback stable
- Logs stable
