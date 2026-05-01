# Sheikha VPS Upload and Import

Use these commands to upload and import the latest Sheikha bundle to:
- Host: `31.97.190.74`
- User: `root`
- Path: `/opt/sheikha/imports`

## 1) Local: select latest bundle

```bash
cd "/Users/salmanalrajeh/Library/CloudStorage/OneDrive-Personal/Sheikha/sheikha-main-portal"
BUNDLE="$(ls -1t releases/sheikha-important-bundle-*.tar.gz | head -1)"
echo "$BUNDLE"
```

## 2) Upload to VPS

```bash
ssh root@31.97.190.74 "mkdir -p /opt/sheikha/imports"
scp "$BUNDLE" root@31.97.190.74:/opt/sheikha/imports/
scp "${BUNDLE}.sha256" root@31.97.190.74:/opt/sheikha/imports/
```

## 3) Verify checksum on VPS

```bash
ssh root@31.97.190.74 "\
cd /opt/sheikha/imports && \
sha256sum -c $(basename ${BUNDLE}.sha256)"
```

## 4) Extract to target app path

```bash
ssh root@31.97.190.74 "\
mkdir -p /opt/sheikha/main-portal && \
tar -xzf /opt/sheikha/imports/$(basename $BUNDLE) -C /opt/sheikha/main-portal"
```

## 5) Quick startup check (optional)

```bash
ssh root@31.97.190.74 "\
cd /opt/sheikha/main-portal && \
node -v && \
node -c server.js"
```

## Notes
- If SSH key is not configured, the terminal will ask for password.
- This bundle includes server, MCP configs, engine classification, AI/neural/agent files, and key state/training JSON files.
