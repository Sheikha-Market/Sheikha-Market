const os = require("os");

function inspectUniversalOS() {
  const platform = os.platform();

  return {
    system: "SHEIKHA_UNIVERSAL_OS_INSPECTOR",
    status: "ACTIVE",
    mode: "READ_ONLY_SAFE_CROSS_OS_INSPECTION",
    detected: {
      platform,
      type: os.type(),
      release: os.release(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptimeSeconds: os.uptime()
    },
    resources: {
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || "unknown",
        loadavg: os.loadavg()
      },
      memory: {
        totalBytes: os.totalmem(),
        freeBytes: os.freemem(),
        usedBytes: os.totalmem() - os.freemem()
      },
      networkInterfaces: Object.keys(os.networkInterfaces())
    },
    familySupport: {
      linux: platform === "linux" ? "ACTIVE" : "READY",
      macos: platform === "darwin" ? "ACTIVE" : "READY",
      windows: platform === "win32" ? "ACTIVE" : "READY",
      bsd: ["freebsd", "openbsd", "netbsd"].includes(platform) ? "ACTIVE" : "READY",
      supercomputerHpc: "READY_BY_NODE_ENVIRONMENT",
      cloud: "READY_BY_PROVIDER_ENVIRONMENT",
      edge: "READY_BY_DEVICE_ENVIRONMENT"
    },
    governance: {
      tawhid: "الله وحده لا شريك له",
      readOnly: true,
      noPrivilegeEscalation: true,
      noUnauthorizedAccess: true,
      noHarm: true,
      noGhaybClaims: true,
      auditRequired: true
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  inspectUniversalOS
};
