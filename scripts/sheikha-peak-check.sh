#!/usr/bin/env bash
set -euo pipefail

# بسم الله الرحمن الرحيم
# فحص يومي لمؤشر القمة مع تقرير PASS/FAIL

BASE_URL="${SHEIKHA_BASE_URL:-http://127.0.0.1:8080}"
TOKEN="${SHEIKHA_ADMIN_JWT:-}"
TARGET="${SHEIKHA_SUMMIT_TARGET:-90}"
OUT_DIR="${SHEIKHA_PEAK_REPORT_DIR:-/tmp/sheikha-reports}"

mkdir -p "$OUT_DIR"
STAMP="$(date '+%F_%H-%M-%S')"
REPORT_FILE="${OUT_DIR}/peak-check-${STAMP}.txt"

if [[ -z "$TOKEN" ]]; then
    echo "❌ SHEIKHA_ADMIN_JWT غير مضبوط. ضع التوكن أولاً."
    echo "مثال: export SHEIKHA_ADMIN_JWT='...'"
    exit 2
fi

SUMMIT_JSON="$(curl -fsS -H "Authorization: Bearer ${TOKEN}" "${BASE_URL}/api/system/summit")"
INDICES_JSON="$(curl -fsS -H "Authorization: Bearer ${TOKEN}" "${BASE_URL}/api/system/indices")"
ENTERPRISE_JSON="$(curl -fsS -H "Authorization: Bearer ${TOKEN}" "${BASE_URL}/api/enterprise/dashboard")"
AUDIT_JSON="$(curl -fsS -H "Authorization: Bearer ${TOKEN}" "${BASE_URL}/api/enterprise/audit-chain")"

export SUMMIT_JSON INDICES_JSON ENTERPRISE_JSON AUDIT_JSON TARGET

python3 - <<'PY' > "$REPORT_FILE"
import json
import os
from datetime import datetime

target = int(os.environ.get('TARGET', '90'))

summit = json.loads(os.environ['SUMMIT_JSON'])
indices = json.loads(os.environ['INDICES_JSON'])
enterprise = json.loads(os.environ['ENTERPRISE_JSON'])
audit = json.loads(os.environ['AUDIT_JSON'])

def g(d, path, default=None):
    cur = d
    for p in path:
        if not isinstance(cur, dict) or p not in cur:
            return default
        cur = cur[p]
    return cur

summit_score = int(g(summit, ['data', 'sheikhaSummitIndex'], 0) or 0)
status = g(summit, ['data', 'status'], 'unknown')
compute = int(g(indices, ['data', 'indices', 'computePowerIndex'], 0) or 0)
global_reach = int(g(indices, ['data', 'indices', 'globalReachIndex'], 0) or 0)
governance = int(g(indices, ['data', 'indices', 'governanceComplianceIndex'], 0) or 0)
research = int(g(indices, ['data', 'indices', 'researchInnovationIndex'], 0) or 0)
sharia = int(g(indices, ['data', 'indices', 'shariaComplianceIndex'], 0) or 0)
regions = int(g(indices, ['data', 'context', 'regionsCount'], 0) or 0)
cloud = bool(g(indices, ['data', 'context', 'cloudSyncEnabled'], False))
enterprise_score = int(g(enterprise, ['data', 'enterpriseReadinessScore'], 0) or 0)
audit_ok = bool(g(audit, ['data', 'integrity', 'valid'], False))

checks = [
    ("SummitIndex", summit_score >= target, summit_score),
    ("EnterpriseReadiness", enterprise_score >= target, enterprise_score),
    ("ShariaCompliance", sharia >= 90, sharia),
    ("GlobalReach", global_reach >= 85, global_reach),
    ("AuditChain", audit_ok, "valid" if audit_ok else "invalid"),
    ("CloudSyncEnabled", cloud, str(cloud).lower()),
    ("RegionsCount", regions >= 3, regions),
]

passed = sum(1 for _, ok, _ in checks if ok)
total = len(checks)
overall = "PASS" if passed == total else "FAIL"

print("=== SHEIKHA PEAK CHECK REPORT ===")
print("time:", datetime.utcnow().isoformat() + "Z")
print("target:", target)
print("overall:", overall, f"({passed}/{total})")
print()
print("summit_status:", status)
print("summit_index:", summit_score)
print("enterprise_readiness:", enterprise_score)
print()
print("indices:")
print("  compute:", compute)
print("  globalReach:", global_reach)
print("  governance:", governance)
print("  research:", research)
print("  sharia:", sharia)
print()
print("context:")
print("  regionsCount:", regions)
print("  cloudSyncEnabled:", str(cloud).lower())
print("  auditChainValid:", str(audit_ok).lower())
print()
print("checks:")
for name, ok, value in checks:
    print(f"  - {name}: {'PASS' if ok else 'FAIL'} (value={value})")
PY

cat "$REPORT_FILE"
echo
echo "📄 report saved: $REPORT_FILE"
