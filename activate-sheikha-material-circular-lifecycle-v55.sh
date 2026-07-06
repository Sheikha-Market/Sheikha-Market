#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_MATERIAL_CIRCULAR_LIFECYCLE_V55 =="

cp runtime/industrial-material-lifecycle-fabric/v1/sheikha-industrial-material-lifecycle-fabric-v1.js \
   runtime/industrial-material-lifecycle-fabric/v1/sheikha-industrial-material-lifecycle-fabric-v1.js.bak-circular-v55-$(date +%Y%m%d%H%M%S)

python3 - <<'PY'
from pathlib import Path

p = Path("runtime/industrial-material-lifecycle-fabric/v1/sheikha-industrial-material-lifecycle-fabric-v1.js")
s = p.read_text()

insert = r'''
function circularLifecyclePlan(material = {}, factory = {}) {
  const inputKind = classifyInputKind(material);
  const state = classifyState(material);
  const stage = classifyStage(material);
  const consistency = classifyConsistency(material);
  const supplierClass = classifySupplier(material);

  const recyclable =
    /scrap|recycle|معاد|سكراب|خرده|نفايات|waste/i.test(`${material.name || ''} ${material.description || ''} ${material.stage || ''}`) ||
    ['SOLID', 'POWDER', 'LIQUID'].includes(state);

  const sameProductAllowed =
    recyclable &&
    consistency === 'CONSISTENT' &&
    ['SOLID', 'POWDER'].includes(state);

  const otherProductAllowed =
    recyclable &&
    ['INCONSISTENT', 'UNKNOWN_CONSISTENCY'].includes(consistency);

  const outputClass =
    sameProductAllowed ? 'RECYCLE_TO_SAME_PRODUCT' :
    otherProductAllowed ? 'RECYCLE_TO_OTHER_PRODUCT' :
    recyclable ? 'RECYCLE_TO_BYPRODUCT_OR_FEEDSTOCK' :
    'DISPOSE_OR_REVIEW';

  return {
    lifecycle: [
      'RECEIVE',
      'IDENTIFY',
      'CLASSIFY',
      'SAMPLE_OR_INSPECT',
      'QUALITY_GATE',
      'STORAGE_ASSIGNMENT',
      'TRANSPORT_SELECTION',
      'PROCESS_ROUTE_SELECTION',
      'OUTPUT_CLASSIFICATION',
      'TRACE_AND_AUDIT'
    ],
    inputKind,
    state,
    stage,
    consistency,
    supplierClass,
    recyclable,
    outputClass,
    possibleRoutes: {
      sameProduct: sameProductAllowed,
      otherProduct: otherProductAllowed,
      byproduct: recyclable,
      wasteReview: !recyclable
    },
    requiredControls: [
      'LOT_NUMBER',
      'SOURCE_TRACE',
      'QUALITY_SPEC',
      'SAFETY_REVIEW',
      'ENVIRONMENTAL_REVIEW',
      'GOVERNANCE_APPROVAL'
    ],
    blocked: [
      'NO_HAZARDOUS_RECIPE',
      'NO_UNVERIFIED_CHEMICAL_PROCESS',
      'NO_DANGEROUS_OPERATING_PARAMETERS'
    ],
    storage: storageMethod(material),
    transport: transportMethod(material),
    targetFactoryType: classifyFactory(factory)
  };
}
'''

if "function circularLifecyclePlan" not in s:
    marker = "function analyze(input = {}) {"
    s = s.replace(marker, insert + "\n" + marker)

s = s.replace(
"conversion: material.target ? conversionPlan(material, material.target) : null",
"conversion: material.target ? conversionPlan(material, material.target) : null,\n    circularLifecycle: circularLifecyclePlan(material, factory)"
)

s = s.replace(
"module.exports = {",
"module.exports = {"
)

s = s.replace(
"transportMethod\n};",
"transportMethod,\n  circularLifecyclePlan\n};"
)

p.write_text(s)
PY

echo "== Checks =="
node --check runtime/industrial-material-lifecycle-fabric/v1/sheikha-industrial-material-lifecycle-fabric-v1.js
node --check server.js

echo "== Restart =="
pm2 restart sheikha-main-portal --update-env
sleep 2

echo "== API circular test =="
curl -s -X POST http://127.0.0.1:8080/api/sheikha/industrial-material-lifecycle-fabric/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "factories": [
      {
        "name": "Circular Factory",
        "type": "mechanical",
        "materials": [
          {"name":"لقيط سكراب حديد","description":"مختلط غير متسق خرده صلبه","state":"solid","stage":"waste"},
          {"name":"مادة أولية ألمنيوم","description":"خام متسق مورد غير نادر","state":"solid","stage":"raw"},
          {"name":"سائل مسترجع","description":"نفايات سائله قابلة للمراجعة","state":"liquid","stage":"waste"}
        ]
      }
    ]
  }' | jq '.factories[0].classifiedMaterials[] | {indexCode,name:.arabicGrammar.اسم,state,stage,output:.circularLifecycle.outputClass,routes:.circularLifecycle.possibleRoutes}'

echo "== Commit =="
git add runtime/industrial-material-lifecycle-fabric/v1/sheikha-industrial-material-lifecycle-fabric-v1.js \
  activate-sheikha-material-circular-lifecycle-v55.sh

git commit -m "Activate Sheikha material circular lifecycle V55"
git push origin feature/extension-experience-apex-v1 || true

echo "== Done =="
