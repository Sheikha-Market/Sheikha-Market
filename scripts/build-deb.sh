#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PKG_ROOT="${ROOT_DIR}/packaging/deb"
OUT_DIR="${ROOT_DIR}/dist"
BUILD_DIR="${ROOT_DIR}/packaging/.build/sheikha-main-portal"

mkdir -p "${OUT_DIR}"
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}/DEBIAN" "${BUILD_DIR}/opt/sheikha/sheikha-main-portal"

cp "${PKG_ROOT}/DEBIAN/control" "${BUILD_DIR}/DEBIAN/control"
cp "${PKG_ROOT}/DEBIAN/postinst" "${BUILD_DIR}/DEBIAN/postinst"
cp "${PKG_ROOT}/DEBIAN/prerm" "${BUILD_DIR}/DEBIAN/prerm"
chmod 755 "${BUILD_DIR}/DEBIAN/postinst" "${BUILD_DIR}/DEBIAN/prerm"

rsync -a --delete \
  --exclude ".git" \
  --exclude "node_modules" \
  --exclude "dist" \
  --exclude "packaging/.build" \
  "${ROOT_DIR}/" "${BUILD_DIR}/opt/sheikha/sheikha-main-portal/"

dpkg-deb --build "${BUILD_DIR}" "${OUT_DIR}/sheikha-main-portal_1.0.0_amd64.deb"
sha256sum "${OUT_DIR}/sheikha-main-portal_1.0.0_amd64.deb" > "${OUT_DIR}/sheikha-main-portal_1.0.0_amd64.deb.sha256"

echo "✅ Debian package built in ${OUT_DIR}"
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PKG_ROOT="${ROOT_DIR}/dist/deb/sheikha-main-portal"
APP_DST="${PKG_ROOT}/opt/sheikha/sheikha-main-portal"
VERSION="${1:-1.0.0}"

rm -rf "${PKG_ROOT}"
mkdir -p "${APP_DST}" "${PKG_ROOT}/DEBIAN"

rsync -a --delete \
    --exclude ".git" \
    --exclude "node_modules" \
    --exclude "dist" \
    --exclude "logs" \
    --exclude "uploads" \
    --exclude "quarantine" \
    "${ROOT_DIR}/" "${APP_DST}/"

cp "${ROOT_DIR}/packaging/deb/DEBIAN/control" "${PKG_ROOT}/DEBIAN/control"
cp "${ROOT_DIR}/packaging/deb/DEBIAN/postinst" "${PKG_ROOT}/DEBIAN/postinst"
cp "${ROOT_DIR}/packaging/deb/DEBIAN/prerm" "${PKG_ROOT}/DEBIAN/prerm"

sed -i "s/^Version: .*/Version: ${VERSION}/" "${PKG_ROOT}/DEBIAN/control"

chmod 755 "${PKG_ROOT}/DEBIAN/postinst" "${PKG_ROOT}/DEBIAN/prerm"
find "${PKG_ROOT}" -type d -exec chmod 755 {} \;

OUT_DIR="${ROOT_DIR}/dist/deb"
mkdir -p "${OUT_DIR}"
OUT_FILE="${OUT_DIR}/sheikha-main-portal_${VERSION}_amd64.deb"
dpkg-deb --build "${PKG_ROOT}" "${OUT_FILE}"

echo "✅ Built: ${OUT_FILE}"
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PKG_ROOT="${ROOT_DIR}/packaging/deb"
BUILD_ROOT="${ROOT_DIR}/.build/deb"
DIST_DIR="${ROOT_DIR}/dist"
PKG_NAME="sheikha-main-portal"
PKG_VERSION="1.0.0"
OUT_FILE="${DIST_DIR}/${PKG_NAME}_${PKG_VERSION}_amd64.deb"

rm -rf "${BUILD_ROOT}"
mkdir -p "${BUILD_ROOT}/opt/sheikha/sheikha-main-portal" "${DIST_DIR}"

rsync -a \
  --exclude ".git" \
  --exclude "node_modules" \
  --exclude ".build" \
  --exclude "dist" \
  --exclude "logs" \
  --exclude "uploads" \
  --exclude "quarantine" \
  "${ROOT_DIR}/" "${BUILD_ROOT}/opt/sheikha/sheikha-main-portal/"

mkdir -p "${BUILD_ROOT}/DEBIAN"
cp "${PKG_ROOT}/DEBIAN/control" "${BUILD_ROOT}/DEBIAN/control"
cp "${PKG_ROOT}/DEBIAN/postinst" "${BUILD_ROOT}/DEBIAN/postinst"
cp "${PKG_ROOT}/DEBIAN/prerm" "${BUILD_ROOT}/DEBIAN/prerm"
chmod 755 "${BUILD_ROOT}/DEBIAN/postinst" "${BUILD_ROOT}/DEBIAN/prerm"

dpkg-deb --build "${BUILD_ROOT}" "${OUT_FILE}"
echo "✅ Built: ${OUT_FILE}"
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PKG_ROOT="${ROOT_DIR}/packaging/deb"
OUT_DIR="${ROOT_DIR}/dist"
APP_DIR="${PKG_ROOT}/opt/sheikha/sheikha-main-portal"

rm -rf "${APP_DIR}"
mkdir -p "${APP_DIR}" "${OUT_DIR}"

rsync -a --delete \
    --exclude ".git" \
    --exclude "node_modules" \
    --exclude "dist" \
    --exclude "packaging/deb/opt" \
    "${ROOT_DIR}/" "${APP_DIR}/"

chmod 0755 "${PKG_ROOT}/DEBIAN/postinst" "${PKG_ROOT}/DEBIAN/prerm"
chmod 0755 "${APP_DIR}/scripts/install.sh" "${APP_DIR}/scripts/uninstall.sh" "${APP_DIR}/scripts/validate-release.sh" || true

PKG_NAME="sheikha-main-portal_1.0.0_amd64.deb"
dpkg-deb --build "${PKG_ROOT}" "${OUT_DIR}/${PKG_NAME}"
echo "✅ built: ${OUT_DIR}/${PKG_NAME}"
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PKG_ROOT="${ROOT_DIR}/packaging/deb"
BUILD_DIR="${ROOT_DIR}/packaging/build/sheikha-main-portal"
OUT_DIR="${ROOT_DIR}/packaging/dist"

mkdir -p "${BUILD_DIR}" "${OUT_DIR}"
rm -rf "${BUILD_DIR:?}"/*

mkdir -p "${BUILD_DIR}/opt/sheikha/sheikha-main-portal"
mkdir -p "${BUILD_DIR}/etc/systemd/system"
mkdir -p "${BUILD_DIR}/DEBIAN"

cp -r "${ROOT_DIR}/server.js" "${BUILD_DIR}/opt/sheikha/sheikha-main-portal/"
cp -r "${ROOT_DIR}/package.json" "${ROOT_DIR}/package-lock.json" "${BUILD_DIR}/opt/sheikha/sheikha-main-portal/"
cp -r "${ROOT_DIR}/public" "${BUILD_DIR}/opt/sheikha/sheikha-main-portal/"
cp -r "${ROOT_DIR}/lib" "${BUILD_DIR}/opt/sheikha/sheikha-main-portal/"
cp -r "${ROOT_DIR}/routes" "${BUILD_DIR}/opt/sheikha/sheikha-main-portal/"
cp -r "${ROOT_DIR}/middleware" "${BUILD_DIR}/opt/sheikha/sheikha-main-portal/"
cp -r "${ROOT_DIR}/config" "${BUILD_DIR}/opt/sheikha/sheikha-main-portal/"
cp -r "${ROOT_DIR}/data" "${BUILD_DIR}/opt/sheikha/sheikha-main-portal/"
cp -r "${ROOT_DIR}/scripts" "${BUILD_DIR}/opt/sheikha/sheikha-main-portal/"
cp "${ROOT_DIR}/.env.example" "${BUILD_DIR}/opt/sheikha/sheikha-main-portal/"
cp "${ROOT_DIR}/docs/security/سياسة-أمن-المعلومات-شيخة.md" "${BUILD_DIR}/opt/sheikha/sheikha-main-portal/"

cat > "${BUILD_DIR}/etc/systemd/system/sheikha.service" <<'EOF'
[Unit]
Description=Sheikha Core Service
After=network.target

[Service]
Type=simple
User=sheikha
Group=sheikha
WorkingDirectory=/opt/sheikha/sheikha-main-portal
Environment=NODE_ENV=production
EnvironmentFile=/opt/sheikha/sheikha-main-portal/.env
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=read-only
ReadWritePaths=/opt/sheikha/sheikha-main-portal/data /opt/sheikha/sheikha-main-portal/logs /opt/sheikha/sheikha-main-portal/uploads /opt/sheikha/sheikha-main-portal/quarantine
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

cp "${PKG_ROOT}/DEBIAN/control" "${BUILD_DIR}/DEBIAN/control"
cp "${PKG_ROOT}/DEBIAN/postinst" "${BUILD_DIR}/DEBIAN/postinst"
cp "${PKG_ROOT}/DEBIAN/prerm" "${BUILD_DIR}/DEBIAN/prerm"

chmod 0755 "${BUILD_DIR}/DEBIAN/postinst" "${BUILD_DIR}/DEBIAN/prerm"

PKG_VERSION="$(awk -F': ' '/^Version:/ {print $2}' "${BUILD_DIR}/DEBIAN/control")"
DEB_FILE="${OUT_DIR}/sheikha-main-portal_${PKG_VERSION}_amd64.deb"
dpkg-deb --build "${BUILD_DIR}" "${DEB_FILE}"

echo "✅ Built: ${DEB_FILE}"
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PKG_ROOT="${ROOT_DIR}/packaging/deb"
BUILD_DIR="${ROOT_DIR}/dist/deb"
APP_DIR="${PKG_ROOT}/opt/sheikha/sheikha-main-portal"

rm -rf "${APP_DIR}" "${BUILD_DIR}"
mkdir -p "${APP_DIR}" "${BUILD_DIR}" "${PKG_ROOT}/etc/systemd/system"

rsync -a --delete \
    --exclude ".git" \
    --exclude "node_modules" \
    --exclude "dist" \
    --exclude "packaging/deb/opt" \
    "${ROOT_DIR}/" "${APP_DIR}/"

cat > "${PKG_ROOT}/etc/systemd/system/sheikha.service" <<'EOF'
[Unit]
Description=Sheikha Core Service
After=network.target

[Service]
Type=simple
User=sheikha
Group=sheikha
WorkingDirectory=/opt/sheikha/sheikha-main-portal
Environment=NODE_ENV=production
EnvironmentFile=/opt/sheikha/sheikha-main-portal/.env
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=read-only
ReadWritePaths=/opt/sheikha/sheikha-main-portal/data /opt/sheikha/sheikha-main-portal/logs /opt/sheikha/sheikha-main-portal/uploads /opt/sheikha/sheikha-main-portal/quarantine
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

chmod 0755 "${PKG_ROOT}/DEBIAN/postinst" "${PKG_ROOT}/DEBIAN/prerm"

PACKAGE_NAME="sheikha-main-portal_1.0.0_amd64.deb"
dpkg-deb --build "${PKG_ROOT}" "${BUILD_DIR}/${PACKAGE_NAME}"
echo "✅ Built ${BUILD_DIR}/${PACKAGE_NAME}"
