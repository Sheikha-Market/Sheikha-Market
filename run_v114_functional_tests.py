import urllib.request, urllib.error, json, hashlib, datetime
from pathlib import Path

FUNCTIONAL_SUITES = [
    ("18082 Core Engine", "http://127.0.0.1:18082/api/health", "http://127.0.0.1:18082/invalid-404-check"),
    ("18093 Supply Gateway", "http://127.0.0.1:18093/api/health", "http://127.0.0.1:18093/invalid-404-check"),
    ("18094 Architecture Lab", "http://127.0.0.1:18094/api/health", "http://127.0.0.1:18094/invalid-404-check"),
    ("18110 Fabric Studio", "http://127.0.0.1:18110/api/health", "http://127.0.0.1:18110/invalid-404-check"),
    ("18153 Microsoft Alliance", "http://127.0.0.1:18153/api/health", "http://127.0.0.1:18153/invalid-404-check"),
    ("18154 NVIDIA Alliance", "http://127.0.0.1:18154/api/health", "http://127.0.0.1:18154/invalid-404-check"),
    ("18155 Global Logistics", "http://127.0.0.1:18155/api/health", "http://127.0.0.1:18155/invalid-404-check"),
    ("18156 Argon Engine", "http://127.0.0.1:18156/api/health", "http://127.0.0.1:18156/invalid-404-check"),
    ("18157 8-Platforms Factory", "http://127.0.0.1:18157/api/factory/manifest", "http://127.0.0.1:18157/invalid-404-check"),
    ("18158 Hosting Manager", "http://127.0.0.1:18158/api/hosting/status", "http://127.0.0.1:18158/invalid-404-check"),
    ("18159 Licensing Foundry", "http://127.0.0.1:18159/", "http://127.0.0.1:18159/invalid-404-check"),
    ("18160 Competency Engine", "http://127.0.0.1:18160/", "http://127.0.0.1:18160/invalid-404-check"),
    ("18161 Universe 12-Domains", "http://127.0.0.1:18161/api/domains/status", "http://127.0.0.1:18161/invalid-404-check"),
]

results = []
for name, ok_url, check_url in FUNCTIONAL_SUITES:
    api_200 = False
    strict_404 = False
    try:
        with urllib.request.urlopen(ok_url, timeout=2) as r1:
            api_200 = (r1.status == 200)
    except Exception:
        api_200 = False

    try:
        with urllib.request.urlopen(check_url, timeout=2) as r2:
            strict_404 = (r2.status == 404)
    except urllib.error.HTTPError as e:
        strict_404 = (e.code == 404)
    except Exception:
        strict_404 = False

    results.append({"service": name, "api_200": api_200, "strict_routing_404": strict_404})
    print(f"✓ {name:<25} | API 200: {str(api_200):<5} | Strict Routing: {str(strict_404):<5}")

report = {
    "schema": "SHEIKHA_V120_FUNCTIONAL_TESTS_13_OF_13",
    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "total_suites": len(results),
    "passed_200": sum(1 for r in results if r["api_200"]),
    "passed_404": sum(1 for r in results if r["strict_routing_404"]),
    "all_passed": all(r["api_200"] and r["strict_routing_404"] for r in results),
    "results": results
}
report["sha256"] = hashlib.sha256(json.dumps(report, sort_keys=True).encode("utf-8")).hexdigest()
Path("SHEIKHA_V120_FUNCTIONAL_PROOF.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"✓ Functional Tests ({report['passed_200']}/{report['total_suites']} API 200 | {report['passed_404']}/{report['total_suites']} Strict 404) Proof SHA-256: {report['sha256']}")
