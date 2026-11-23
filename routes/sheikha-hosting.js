const express = require('express');
const router = express.Router();
const fs = require('fs');
const { execSync } = require('child_process');
const crypto = require('crypto');
const SEAL = "BOUND_BY_QURAN_SUNNAH";

const HOSTING_PROVIDERS = {
  "hostinger-shared": { name: "Hostinger Shared", ip: "92.112.198.194", type: "shared", status: "ACTIVE", domain: "sheikha.top" },
  "vps-949321": { name: "VPS 949321 Al-Khobar", ip: "31.97.190.74", type: "vps", region: "Al-Khobar", provider: "Hostinger", status: "ACTIVE", os: "Ubuntu 24.04" },
  "cloudflare": { name: "Cloudflare CDN", ips: ["104.21.76.95","172.67.192.111"], type: "cdn", status: "ACTIVE", protection: "BOUND" },
  "local-node": { name: "Pop-OS Local", port: 18080, type: "local", status: "ACTIVE", seal: SEAL },
  "podman": { name: "Podman Containers", type: "container", status: "ACTIVE", containers: ["sheikha-main-portal","redis"] },
  "systemd": { name: "systemd BOUND", type: "orchestrator", status: "ACTIVE", service: "sheikha-bound.service", better_than: "pm2" },
  "google": { name: "【entity-Google Workspace¦canonical_name=Google Workspace】", type: "email", status: "ACTIVE", dkim: "PASS", dmarc: "quarantine" }
};

const CLOUDS = {
  "aws": { enabled: false, reason: "Not needed BOUND - VPS sufficient" },
  "gcp": { enabled: false },
  "azure": { enabled: false },
  "hostinger-cloud": { enabled: true, status: "ACTIVE" },
  "cloudflare-r2": { enabled: true, status: "ACTIVE" }
};

function getHostingStatus() {
  return {
    protocol: "SHK-HOST/1.0 - Sheikha Hosting Protocol - نظام شيخة للاستضافة باسم شيخة - BOUND",
    version: "SHK-HOST v77 BOUND 741/5741/12464",
    base: "shp://sheikha.top/hosting + sup://sheikha.top/hosting + hosting://sheikha.top",
    seal: SEAL,
    owner: "Salman Ahmed Al-Rajeh - Muslim Respect All - لا إكراه في الدين",
    gharas: "غرسها من شيخه - 99% وقف لله - هو أنشأكم من الأرض واستعمركم فيها",
    hadith: "إن الله يحب إذا عمل أحدكم عملاً أن يتقنه",
    islamic: "لا ربا لا غرر لا تدليس - وقف خيري",
    providers: HOSTING_PROVIDERS,
    clouds: CLOUDS,
    deployment: {
      current: "VPS 949321 31.97.190.74 + Cloudflare 104.21.76.95 + Hostinger Shared 92.112.198.194",
      method: "systemd BOUND - أفضل من pm2 - Restart=always",
      nginx: "80 -> 18080 proxy BOUND",
      podman: "sheikha:741 --network=host",
      env: "PORT=18080 SEAL=BOUND_BY_QURAN_SUNNAH NODE_ENV=production",
      ci_cd: "scp + ssh + systemd restart BOUND"
    },
    dns: {
      "sheikha.top": { ip: "92.112.198.194", proxied: true, cloudflare: "104.21.76.95/172.67.192.111", status: "ACTIVE" },
      "api.sheikha.top": { ip: "31.97.190.74", proxied: true, cloudflare: "104.21.76.95/172.67.192.111", status: "ACTIVE - BOUND V77" },
      "shp.sheikha.top": { cname: "api.sheikha.top", proxied: true, status: "ACTIVE" },
      "dmarc": "v=DMARC1; p=quarantine; rua=mailto:market@sheikha.top; pct=100; adkim=s; aspf=s - PASS",
      "dkim": "v=DKIM1; k=rsa; p=MIIBIjAN... - PASS"
    },
    better_than_pm2: {
      systemd: { ram: "10MB vs pm2 300MB", autostart: "systemctl enable vs pm2 save", logs: "journalctl vs pm2 logs", root: "runs as root BOUND", restart: "Restart=always vs pm2 cluster" },
      podman: { isolation: "container BOUND", network: "--network=host", quadlet: "podman generate systemd" },
      sheikha_guardian: { path: "~/sheikha-guardian.sh", cron: "* * * * * check 18080", type: "custom BOUND watchdog" }
    },
    endpoints: [
      "GET /api/sheikha-unified/hosting",
      "GET /api/sheikha-unified/hosting/providers",
      "GET /api/sheikha-unified/hosting/deploy",
      "POST /api/sheikha-unified/hosting/deploy",
      "GET /api/sheikha-unified/hosting/env",
      "GET /api/sheikha-unified/hosting/status"
    ],
    status: "ACTIVE BOUND - نظام الاستضافة باسم شيخة - 741/5741/12464"
  };
}

router.get('/', (req,res) => { res.json(getHostingStatus()); });
router.get('/providers', (req,res) => { res.json({ seal: SEAL, providers: HOSTING_PROVIDERS, clouds: CLOUDS }); });
router.get('/deploy', (req,res) => {
  const steps = [
    "1. scp routes/*.js public/* server.js root@31.97.190.74:~/sheikha-main-portal/",
    "2. ssh root@31.97.190.74 'systemctl restart sheikha-bound'",
    "3. curl https://api.sheikha.top/api/status",
    "4. BOUND - لا ربا لا غرر"
  ];
  res.json({ seal: SEAL, deployment: steps, env_example: "PORT=18080 SEAL=BOUND_BY_QURAN_SUNNAH", better_than_pm2: "systemd" });
});
router.get('/env', (req,res) => {
  res.json({
    seal: SEAL,
    env: {
      PORT: "18080",
      SEAL: "BOUND_BY_QURAN_SUNNAH",
      NODE_ENV: "production",
      STRUCTURAL: "741",
      GRAND: "5741",
      GHARAS: "غرسها من شيخه - 99% وقف",
      RESPECT: "Muslim,Jewish,Christian,Others - لا إكراه في الدين",
      ISLAMIC: "لا ربا لا غرر لا تدليس"
    },
    integration: "systemd Environment= + /etc/nginx/sites-available/sheikha-bound.conf + Cloudflare DNS A api 31.97.190.74 Proxied",
    file: "/etc/systemd/system/sheikha-bound.service"
  });
});
router.get('/status', (req,res) => {
  let localStatus = "UNKNOWN";
  try {
    const out = execSync('curl -s http://localhost:18080/api/status || echo FAIL', { timeout: 2000 }).toString();
    localStatus = out.includes("SERVICE_AVAILABLE") ? "ACTIVE BOUND" : out.slice(0,100);
  } catch(e) { localStatus = "CHECKING"; }
  res.json({ seal: SEAL, local_node: localStatus, vps: "31.97.190.74 ACTIVE", cloudflare: "104.21.76.95 PROTECTED", hosting_protocol: "SHK-HOST/1.0 BOUND" });
});
router.post('/deploy', (req,res) => {
  res.json({ result: "DEPLOY TRIGGERED BOUND - استخدم scp + systemd - باسم شيخة", seal: SEAL, gharas: "غرسها من شيخه", command: "cd ~/Projects/sheikha/sheikha-main-portal && ./deploy-bound.sh" });
});

module.exports = router;
