# بسم الله الرحمن الرحيم

# دليل التشغيل الآمن الموحد — Sheikha Production Secure Runbook

هذا الدليل يوحّد تشغيل المنظومة على:
- VPS Ubuntu 24.04
- Docker Compose الإنتاجي
- الشبكة العصبية الجذرية
- طبقة السحابة `/api/cloud` و`/api/cloud-neural`
- MCP / SDK / IDE
- VS Code / GitHub / GitHub Copilot
- المراقبة والنسخ الاحتياطي والاستعادة
- التوسع إلى العقد عالية القدرة والحوسبة الضخمة

## 1) تقسية VPS

نفّذ على الخادم بصلاحية root:

```bash
cd /path/to/Sheikha-Market/sheikha-main-portal
export SHEIKHA_ADMIN_USER=sheikhaops
export SHEIKHA_ADMIN_PUBKEY="ssh-ed25519 AAAA..."
export SHEIKHA_SSH_ALLOWED_CIDRS="1.2.3.4/32"
bash scripts/harden-ubuntu-vps.sh
```

يشمل ذلك:
- إنشاء مستخدم إداري غير root
- فرض SSH keys فقط
- إيقاف `PermitRootLogin` و`PasswordAuthentication`
- تفعيل UFW على 22/80/443 فقط
- تفعيل fail2ban وauditd وunattended-upgrades وtimesyncd

## 2) توليد أسرار الإنتاج

```bash
cd /path/to/Sheikha-Market/sheikha-main-portal
node scripts/generate-production-env.js
chmod 600 infra/docker/compose/prod/.env
```

المتغيرات المهمة:
- `JWT_SECRET`
- `PASSWORD_SALT`
- `SHEIKHA_SDK_TOKEN`
- `SHEIKHA_IDE_TOKEN`
- `BACKUP_PASSPHRASE`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_AI_API_KEY`
- `GOOGLE_PROJECT_ID`
- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_MAPS_API_KEY`
- `GA4_MEASUREMENT_ID`
- `GA4_API_SECRET`
- `GOOGLE_PAY_MERCHANT_ID`

## 3) تشغيل البنية الإنتاجية

```bash
cd /path/to/Sheikha-Market/sheikha-main-portal/infra/docker/compose/prod
docker compose build main-portal
COMPOSE_PROFILES=mcp docker compose up -d nginx postgres redis main-portal mcp-sdk mcp-ide prometheus grafana loki otel-collector
```

## 4) بوابة القبول التشغيلية

يجب نجاح ما يلي:
- `GET /api/health`
- `GET /api/neural-root/health`
- `GET /api/cloud/health`
- `GET /api/cloud-neural`
- `GET /sdk/health`
- `GET /ide/health`

اختبار دخاني:

```bash
npm run server:smoke -- http://127.0.0.1:8080
```

تحقق Google endpoint-by-endpoint بعد ضبط `.env` الحقيقي:

```bash
curl -fsS http://127.0.0.1:8080/api/ai/gemini | jq
curl -fsS http://127.0.0.1:8080/api/cloud | jq
curl -fsS http://127.0.0.1:8080/api/maps | jq
curl -fsS http://127.0.0.1:8080/api/analytics | jq
curl -fsS http://127.0.0.1:8080/api/email | jq
curl -fsS http://127.0.0.1:8080/api/payment/googlepay | jq
```

## 5) MCP / SDK / IDE

- `mcp-servers/sheikha-mcp-server.js` → تكامل MCP stdio
- `mcp-servers/sheikha-sdk-server.js` → HTTP SDK
- `mcp-servers/sheikha-ide-server.js` → HTTP IDE

الحماية:
- الصحة فقط عامة
- بقية المسارات محمية بـ Bearer token
- الربط الافتراضي محلي `127.0.0.1` خارج Docker
- CORS مقيّد عبر `SHEIKHA_MCP_ALLOWED_ORIGIN`

تشغيل PM2:

```bash
npm run sdk:pm2:start
npm run ide:pm2:start
```

## 6) VS Code / Coder / GitHub / Copilot

- إضافة VS Code موجودة في `sheikha-vscode-extension/`
- GitHub workflows الأساسية:
  - `.github/workflows/sheikha-cloud-agent.yml`
  - `.github/workflows/neural-root-activation.yml`
- GitHub Copilot وCloud Agent يبقيان المسار الرسمي للتطوير المؤتمت

الاستخدام الموصى به:
- VS Code / Coder لواجهة التطوير
- GitHub Actions للتحقق والنشر
- Copilot/Cloud Agent للأتمتة والتحقق
- MCP SDK / IDE للتكامل البرمجي الداخلي والمؤسسي

## 7) المراقبة والإنذار

المكونات:
- Prometheus
- Grafana
- Loki
- OpenTelemetry

تمت إضافة لوحة:
- `infra/observability/grafana/dashboards/sheikha-operations.json`

وإنذارات:
- تعطل `main-portal`
- تعطل `neural-root`
- تعطل `cloud`
- تعطل `cloud-neural`
- تعطل `mcp-sdk`
- تعطل `mcp-ide`

## 8) النسخ الاحتياطي والاستعادة

نسخ مشفر:

```bash
export BACKUP_PASSPHRASE='...'
npm run ops:backup:encrypted
```

اختبار استعادة:

```bash
export BACKUP_PASSPHRASE='...'
npm run ops:restore:drill -- /absolute/path/to/backup.tar.gz.enc
```

RPO المقترح: 24 ساعة  
RTO المقترح: 4 ساعات

## 9) العقد المهمة في الخطة

الحد الأدنى التشغيلي:
- Main Portal
- PostgreSQL
- Redis
- Neural Root Runtime
- Cloud Router
- Cloud Neural Router
- MCP SDK
- MCP IDE
- Prometheus / Grafana / Loki / OTel

التوسع المتقدم:
- Copilot Server
- Ollama / GPU nodes
- Hyperscale foundation
- Distributed runtime fabric

## 10) الحوسبة الضخمة والعقد عالية القدرة

للتوسع نحو الحوسبة الضخمة:
- استخدم `scripts/activate-hyperscale-foundation.js`
- افصل عقد GPU/HPC عن الـ VPS الأساسي
- اجعل الـ VPS طبقة تحكم، لا طبقة تدريب ثقيل
- مرّر الاتصالات عبر TLS وشبكات داخلية أو VPN/Bastion

## 11) مبادئ الحوكمة

- لا ضرر ولا ضرار
- الصدق والشفافية
- الأمانة في الأسرار والمفاتيح
- منع كشف البيانات الحساسة في السجلات
- اعتماد سجل مراجعة لكل تغيير إنتاجي
