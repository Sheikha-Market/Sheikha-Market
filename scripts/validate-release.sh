#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

echo "==> [1/6] npm audit"
npm audit --audit-level=high

echo "==> [2/6] basic runtime health script check"
node -e "console.log('node ok', process.version)"

echo "==> [3/6] generate SBOM"
npx @cyclonedx/cyclonedx-npm --output-file sbom.cdx.json

echo "==> [4/6] create checksums"
sha256sum package.json package-lock.json server.js > release-checksums.sha256

echo "==> [5/6] verify critical security docs"
test -f docs/security/سياسة-أمن-المعلومات-شيخة.md
test -f docs/security/دليل-الاستجابة-للحوادث-شيخة.md
test -f docs/security/نظام-التعليمات-والاجراءات-والقوانين-شيخة.md

echo "==> [6/6] verify install assets"
test -f scripts/install.sh
test -f scripts/uninstall.sh
test -f packaging/deb/DEBIAN/control

echo "✅ Release security gate passed."
