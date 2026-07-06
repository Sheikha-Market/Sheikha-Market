#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
FILE="$ROOT/runtime/industrial-material-lifecycle-fabric/v1/sheikha-industrial-material-lifecycle-fabric-v1.js"
cd "$ROOT"

echo "== Activate SHEIKHA_PRODUCTION_OUTPUT_TAXONOMY_V56 =="

cp "$FILE" "$FILE.bak-production-output-v56-$(date +%Y%m%d%H%M%S)"

python3 - <<'PY'
from pathlib import Path

p = Path("runtime/industrial-material-lifecycle-fabric/v1/sheikha-industrial-material-lifecycle-fabric-v1.js")
s = p.read_text()

insert = r'''
function productionNaming(material = {}, factory = {}) {
  const state = classifyState(material);
  const stage = classifyStage(material);
  const factoryType = classifyFactory(factory);
  const name = String(material.name || 'مادة');

  const tab =
    stage === 'RAW_MATERIAL' ? 'تبويب المواد الأولية' :
    stage === 'SEMI_FINISHED' ? 'تبويب نصف المصنع' :
    stage === 'FINISHED' ? 'تبويب المنتجات' :
    stage === 'BYPRODUCT' ? 'تبويب المخرجات الجانبية' :
    stage === 'WASTE' ? 'تبويب اللقيط/النفايات' :
    stage === 'RECYCLED' ? 'تبويب المعاد تدويره' :
    'تبويب عام';

  const productionName =
    stage === 'RAW_MATERIAL' ? `مدخل إنتاج: ${name}` :
    stage === 'SEMI_FINISHED' ? `نصف مصنوع: ${name}` :
    stage === 'FINISHED' ? `منتج: ${name}` :
    stage === 'BYPRODUCT' ? `مخرج جانبي: ${name}` :
    stage === 'WASTE' ? `لقيط/مادة مراجعة: ${name}` :
    stage === 'RECYCLED' ? `مادة معاد تدويرها: ${name}` :
    `مادة صناعية: ${name}`;

  return {
    productionName,
    tab,
    industryName: factoryType,
    madeObjectClass: stage,
    materialState: state,
    produces: {
      mainProducts: material.mainProducts || [],
      byProducts: material.byProducts || [],
      assets: material.assets || [],
      materials: material.outputMaterials || [],
      wasteOrReview: material.wasteOrReview || []
    },
    accountingTabs: [
      'مواد داخلة',
      'تشغيل وتحويل',
      'منتجات رئيسية',
      'مخرجات جانبية',
      'موجودات',
      'نفايات/لقيط',
      'جودة وحوكمة'
    ],
    numberingRule: 'SHK-{FACTORY}-{STAGE}-{STATE}-{INPUT}-{SEQ}'
  };
}
'''

if "function productionNaming" not in s:
    marker = "function circularLifecyclePlan"
    if marker not in s:
        marker = "function analyze(input = {})"
    s = s.replace(marker, insert + "\n" + marker, 1)

s = s.replace(
"circularLifecycle: circularLifecyclePlan(material, factory)",
"circularLifecycle: circularLifecyclePlan(material, factory),\n    productionTaxonomy: productionNaming(material, factory)"
)

s = s.replace(
"circularLifecyclePlan\n};",
"circularLifecyclePlan,\n  productionNaming\n};"
)

p.write_text(s)
PY

echo "== Checks =="
node --check "$FILE"
node --check server.js

echo "== Restart =="
pm2 restart sheikha-main-portal --update-env
sleep 2

echo "== API production taxonomy test =="
curl -s -X POST http://127.0.0.1:8080/api/sheikha/industrial-material-lifecycle-fabric/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "factories": [
      {
        "name": "مصنع تدوير وتصنيع",
        "type": "mechanical",
        "materials": [
          {
            "name":"لقيط سكراب حديد",
            "description":"مختلط غير متسق خرده صلبه",
            "state":"solid",
            "stage":"waste",
            "mainProducts":["حديد معاد تدويره"],
            "byProducts":["شوائب مفروزة"],
            "assets":["حاوية فرز"],
            "outputMaterials":["خردة مصنفة"]
          },
          {
            "name":"مادة أولية ألمنيوم",
            "description":"خام متسق مورد غير نادر",
            "state":"solid",
            "stage":"raw",
            "mainProducts":["قطاع ألمنيوم"],
            "assets":["مخزون مواد أولية"]
          }
        ]
      }
    ]
  }' | jq '.factories[0].classifiedMaterials[] | {indexCode, name:.arabicGrammar["اسم"], tab:.productionTaxonomy.tab, productionName:.productionTaxonomy.productionName, produces:.productionTaxonomy.produces, lifecycle:.circularLifecycle.outputClass}'

echo "== Commit =="
git add "$FILE" activate-sheikha-material-circular-lifecycle-v55.sh activate-sheikha-production-output-taxonomy-v56.sh

git commit -m "Activate Sheikha production output taxonomy V56"
git push origin feature/extension-experience-apex-v1 || true

echo "== Done =="
