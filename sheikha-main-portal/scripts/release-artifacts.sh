#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${ROOT_DIR}/dist/release"
mkdir -p "${DIST_DIR}"

cp "${ROOT_DIR}/scripts/install.sh" "${DIST_DIR}/install.sh"
cp "${ROOT_DIR}/scripts/uninstall.sh" "${DIST_DIR}/uninstall.sh"
cp "${ROOT_DIR}/LICENSE-SHEIKHA.md" "${DIST_DIR}/LICENSE-SHEIKHA.md"

if [[ -f "${ROOT_DIR}/dist/deb/"*.deb ]]; then
    cp "${ROOT_DIR}"/dist/deb/*.deb "${DIST_DIR}/" || true
fi

(cd "${DIST_DIR}" && sha256sum * > checksums.sha256)
echo "✅ Release artifacts prepared in ${DIST_DIR}"
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${ROOT_DIR}/dist/release"
STAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "${OUT_DIR}"

echo "==> Generating SBOM"
(
    cd "${ROOT_DIR}"
    npx --yes @cyclonedx/cyclonedx-npm --output-file "${OUT_DIR}/sbom.cdx.json"
)

echo "==> Generating checksums"
(
    cd "${ROOT_DIR}"
    tar --exclude=".git" --exclude="node_modules" --exclude="dist" -czf "${OUT_DIR}/sheikha-main-portal-${STAMP}.tar.gz" .
    sha256sum "${OUT_DIR}/sheikha-main-portal-${STAMP}.tar.gz" > "${OUT_DIR}/checksums.sha256"
)

echo "✅ Artifacts ready: ${OUT_DIR}"
