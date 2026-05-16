# Repo Integration Topology

## الهدف
تنظيم التكامل بين الريبو المحلي وGitHub والسيرفر عبر قنوات واضحة:
- قناة قراءة/كتابة (rw)
- قناة قراءة فقط (ro)

## الريبو المعتمدة
1. portal-enterprise
- path: .
- branch: stable/runtime-baseline
- remotes:
  - origin (rw)
  - enterprise (rw)
  - github (ro)
  - gitlab (ro)

2. sheikha-market-mirror
- path: Sheikha-Market
- branch: main
- remotes:
  - origin (rw)
  - upstream-read (ro)

## الأوامر
- تدقيق البنية:
  - npm run ops:repo:topology:audit
- تطبيق البنية:
  - npm run ops:repo:topology:apply
- مزامنة fetch فقط:
  - npm run ops:repo:topology:sync
- مزامنة مع push لقنوات rw:
  - npm run ops:repo:topology:sync:push

## مبدأ الحماية
- كل remote معرف كـ ro يتم ضبط push-url له إلى no_push://read-only-remote
- هذا يمنع الدفع غير المقصود على قنوات القراءة فقط.

## التقارير
تُحفظ تقارير التكامل في:
- logs/runtime/repo-topology-audit.json
- logs/runtime/repo-topology-apply.json
- logs/runtime/repo-topology-sync.json
