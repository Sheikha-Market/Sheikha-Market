# VPS Deployment Guide
## For Server 31.97.190.74

**Last Updated:** May 13, 2026
**Target:** Sheikha-Market/sheikha-main-portal via Neural Cell Network

---

## Prerequisites

- Ubuntu 22.04 LTS (or compatible Linux)
- Git installed
- Node.js 22.x (to be verified/installed)
- PM2 CLI
- ~2GB free disk space
- Network access to GitHub.com

---

## Step 1: Initial Setup

### 1.1 Create deployment directory

```bash
mkdir -p /opt/sheikha-main-portal
cd /opt/sheikha-main-portal

# Set ownership
sudo chown -R $(whoami):$(whoami) /opt/sheikha-main-portal
```

### 1.2 Clone from accessible remote

```bash
# Clone using HTTPS (most reliable for VPS)
git clone https://github.com/Sheikha-Market/sheikha-main-portal.git app
cd app

# Verify remotes
git remote -v
```

**Expected output:**
```
origin  https://github.com/Sheikha-Market/sheikha-main-portal.git (fetch)
origin  https://github.com/Sheikha-Market/sheikha-main-portal.git (push)
```

### 1.3 Add enterprise reference (optional, read-only)

```bash
git remote add enterprise https://github.com/Sheikha-top/sheikha-enterprise-portal.git
git fetch enterprise --no-tags

# Verify
git remote -v
```

---

## Step 2: Environment Configuration

### 2.1 Create `.env` file

```bash
cat > .env << 'EOF'
# Runtime Configuration
NODE_ENV=production
PORT=8080
LOG_LEVEL=info

# Observability
SHEIKHA_OBSERVABILITY_ENABLED=true
SHEIKHA_METRICS_DIR=/opt/sheikha-main-portal/app/data/runtime-metrics

# Runtime
SHEIKHA_RUNTIME_STRICT_FINGERPRINT=true
SHEIKHA_SUPPRESS_OPTIONAL_WARNINGS=false

# Server
SERVER_MAX_MEMORY_MB=512
SERVER_MAX_OLD_SPACE_SIZE=512

# Deployment Ring
SHEIKHA_RING=production
SHEIKHA_DEPLOYMENT_ENVIRONMENT=vps

# Optional: GitHub webhook secret (if using webhooks)
GITHUB_WEBHOOK_SECRET=your-secret-here
EOF

chmod 600 .env
```

### 2.2 Verify Node.js version

```bash
# Check if Node.js is installed
node --version

# Expected: v22.x.x
# If not installed, use Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 22
nvm use 22
```

---

## Step 3: Install Dependencies

```bash
cd /opt/sheikha-main-portal/app

# Install Node modules
npm install --production

# Verify key packages
npm list pm2
npm list node
```

---

## Step 4: PM2 Configuration

### 4.1 Verify ecosystem.config.js

The deployment should have `ecosystem.config.js` at the root. Verify:

```bash
cat ecosystem.config.js | head -30
```

**Critical settings to confirm:**
- `max_memory_restart: "512M"`
- `node_args: "--max-old-space-size=512"`
- `env: { PORT: 8080 }`

### 4.2 Start with PM2

```bash
# Start the application
pm2 start ecosystem.config.js --env production

# Verify status
pm2 status

# Save configuration for auto-restart on reboot
pm2 save

# Enable auto-start on system boot
pm2 startup systemd -u $(whoami) --hp /home/$(whoami)
```

**Expected output from `pm2 status`:**
```
┌─────┬──────────────────────┬──────┬───────┬──────────┬──────────┐
│ id  │ name                 │ mode │ status│ ↺        │ memory   │
├─────┼──────────────────────┼──────┼───────┼──────────┼──────────┤
│ 0   │ sheikha-main-portal  │ fork │ online│ 0        │ 84.0 MB  │
└─────┴──────────────────────┴──────┴───────┴──────────┴──────────┘
```

---

## Step 5: Health Verification

### 5.1 Check local endpoints

```bash
# Check if server is listening
netstat -tlnp | grep 8080
# or
ss -tlnp | grep 8080

# Test local endpoints
curl -s http://127.0.0.1:8080/api/live | jq .
curl -s http://127.0.0.1:8080/api/health | jq .
curl -s http://127.0.0.1:8080/api/ready | jq .
```

**Expected responses:**
```json
{
  "success": true,
  "live": true,
  "pid": [number],
  "uptimeSeconds": [number]
}
```

### 5.2 Check observability

```bash
curl -s http://127.0.0.1:8080/api/observability/summary | jq .

# Check metrics files exist
ls -la /opt/sheikha-main-portal/app/data/runtime-metrics/
```

**Expected output:**
```
memory.ndjson
event-loop.ndjson
restart.ndjson
drift.ndjson
latency.ndjson
```

---

## Step 6: Firewall & Network

### 6.1 Configure firewall (if applicable)

```bash
# For UFW
sudo ufw allow 8080/tcp
sudo ufw allow 22/tcp  # SSH (if not already enabled)

# Verify
sudo ufw status
```

### 6.2 Configure reverse proxy (optional but recommended)

If you want to expose port 80 (HTTP) or 443 (HTTPS), use Nginx:

```bash
# Install Nginx
sudo apt-get update
sudo apt-get install -y nginx

# Create config file
sudo cat > /etc/nginx/sites-available/sheikha << 'EOF'
server {
    listen 80;
    server_name _;  # Replace with your domain

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Observability
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Observability endpoint (public)
    location /api/observability/summary {
        proxy_pass http://127.0.0.1:8080;
        access_log /var/log/nginx/observability.log;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/sheikha /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 7: Updates & Maintenance

### 7.1 Update deployment branch

```bash
cd /opt/sheikha-main-portal/app

# Fetch latest changes from accessible origin
git fetch origin

# Checkout desired branch
git checkout stable/runtime-baseline  # or stable/production

# Pull latest
git pull origin stable/runtime-baseline

# Restart PM2
pm2 restart sheikha-main-portal
```

### 7.2 Sync strategic docs from enterprise (if needed)

```bash
# Fetch from enterprise (read-only)
git fetch enterprise main:enterprise-main

# View available docs
git show enterprise-main:docs/VISION.md | head -20

# Optional: Keep strategic docs in sync
git merge -X theirs enterprise-main -- docs/VISION.md docs/FOUNDATIONS.md
```

### 7.3 Check logs

```bash
# PM2 logs
pm2 logs sheikha-main-portal

# Application logs
tail -f /opt/sheikha-main-portal/app/logs/*.log

# Observability metrics
tail -f /opt/sheikha-main-portal/app/data/runtime-metrics/latency.ndjson
```

---

## Step 8: Monitoring

### 8.1 Monitor process

```bash
# Real-time monitoring
pm2 monit

# Status check (every minute)
watch -n 60 'pm2 status'
```

### 8.2 Monitor metrics

```bash
# Create a dashboard script
cat > monitor.sh << 'EOF'
#!/bin/bash
while true; do
  clear
  echo "=== Sheikha Observability Dashboard ==="
  echo "Timestamp: $(date)"
  echo ""

  echo "--- PM2 Status ---"
  pm2 status | tail -3
  echo ""

  echo "--- Health Check ---"
  curl -s http://127.0.0.1:8080/api/health | jq '.status' || echo "OFFLINE"
  echo ""

  echo "--- Recent Metrics ---"
  tail -3 /opt/sheikha-main-portal/app/data/runtime-metrics/memory.ndjson | jq '.heapPercent' 2>/dev/null || echo "N/A"

  sleep 5
done
EOF

chmod +x monitor.sh
./monitor.sh
```

---

## Step 9: GitHub Webhook Integration (Optional)

### 9.1 Create webhook handler

```bash
cat > webhook-handler.js << 'EOF'
const http = require('http');
const { execSync } = require('child_process');
const crypto = require('crypto');

const SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'your-secret';
const WEBHOOK_PORT = 9000;
const APP_DIR = '/opt/sheikha-main-portal/app';

http.createServer((req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end('Method Not Allowed');
    return;
  }

  if (req.url !== '/webhook') {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  // Verify signature
  const signature = req.headers['x-hub-signature-256'];
  const payload = [];

  req.on('data', chunk => payload.push(chunk));
  req.on('end', () => {
    const body = Buffer.concat(payload).toString('utf-8');
    const hash = 'sha256=' + crypto
      .createHmac('sha256', SECRET)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      res.writeHead(401);
      res.end('Unauthorized');
      return;
    }

    // Handle webhook
    try {
      const event = JSON.parse(body);

      if (event.ref === 'refs/heads/stable/runtime-baseline') {
        console.log('[Webhook] Deploying stable/runtime-baseline...');

        execSync(`cd ${APP_DIR} && git pull origin stable/runtime-baseline`, {
          stdio: 'inherit'
        });

        execSync('pm2 restart sheikha-main-portal', {
          stdio: 'inherit'
        });

        res.writeHead(200);
        res.end('Deployed');
      } else {
        res.writeHead(200);
        res.end('OK');
      }
    } catch (err) {
      console.error('[Webhook Error]', err);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  });
}).listen(WEBHOOK_PORT);

console.log(`Webhook listening on port ${WEBHOOK_PORT}`);
EOF

# Start webhook handler with PM2
pm2 start webhook-handler.js --name "sheikha-webhook" --env production
pm2 save
```

### 9.2 Configure GitHub webhook

1. Go to repository Settings → Webhooks
2. Click "Add webhook"
3. Payload URL: `http://31.97.190.74:9000/webhook` (replace with your IP)
4. Content type: `application/json`
5. Secret: your webhook secret
6. Events: Push events only
7. Active: ✅

---

## Troubleshooting

### Port 8080 already in use

```bash
# Find process using port 8080
lsof -i :8080

# Kill process
kill -9 [PID]

# Or use different port in .env
PORT=8081
```

### Out of memory

```bash
# Increase heap size in ecosystem.config.js
# max_memory_restart: "1G"
# node_args: "--max-old-space-size=1024"

pm2 restart sheikha-main-portal
```

### Git authentication fails

```bash
# Use token instead
git config credential.helper store
git pull origin

# Or use SSH key (if available)
# ssh-add ~/.ssh/github_key
```

### PM2 won't start on boot

```bash
# Reinstall PM2 startup
pm2 startup systemd -u $(whoami) --hp /home/$(whoami)

# Save config
pm2 save

# Reboot to test
sudo reboot
```

---

## Maintenance Schedule

| Task | Frequency | Command |
|------|-----------|---------|
| Check health | Every hour | `curl http://127.0.0.1:8080/api/live` |
| Pull updates | Weekly | `git pull origin stable/runtime-baseline` |
| Clean logs | Monthly | `pm2 logs --lines 0` |
| Review metrics | Daily | `/api/observability/summary` |
| Restart PM2 | Monthly | `pm2 restart all` |

---

## Next Steps

1. ✅ Deploy to VPS using this guide
2. ✅ Configure webhook for auto-deployment
3. ✅ Set up monitoring dashboard
4. ⚠️ Sync enterprise docs monthly
5. ⚠️ Monitor observability metrics
6. ⚠️ Update neural cell sync policy as needed

---

**Support:** Contact DevOps team or refer to `docs/deployment/MULTI-REPO-SYNC-POLICY.md`

**Emergency Rollback:**
```bash
git reset --hard [last-good-commit]
pm2 restart sheikha-main-portal
```
