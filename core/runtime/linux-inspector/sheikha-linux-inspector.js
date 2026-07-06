const os = require("os");
const fs = require("fs");

function safeRead(file, fallback = null) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return fallback;
  }
}

function inspectLinuxRuntime() {
  const loadavg = os.loadavg();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  const uptime = os.uptime();
  const cpus = os.cpus();

  const mounts = safeRead("/proc/mounts", "")
    .split("\n")
    .filter(Boolean)
    .slice(0, 25)
    .map((line) => {
      const [device, mountPoint, type] = line.split(" ");
      return { device, mountPoint, type };
    });

  const netdev = safeRead("/proc/net/dev", "")
    .split("\n")
    .slice(2)
    .filter((line) => line.includes(":"))
    .map((line) => {
      const [iface, rest] = line.trim().split(":");
      const values = rest.trim().split(/\s+/).map(Number);
      return {
        interface: iface.trim(),
        rxBytes: values[0],
        txBytes: values[8]
      };
    });

  return {
    system: "SHEIKHA_LINUX_INSPECTOR_RUNTIME",
    status: "ACTIVE",
    mode: "READ_ONLY_SAFE_INSPECTION",
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    uptimeSeconds: uptime,
    cpu: {
      cores: cpus.length,
      model: cpus[0]?.model || "unknown",
      loadavg
    },
    memory: {
      totalBytes: totalMem,
      freeBytes: freeMem,
      usedBytes: usedMem,
      usedRatio: Number((usedMem / totalMem).toFixed(4))
    },
    storage: {
      mounts
    },
    network: {
      interfaces: netdev
    },
    governance: {
      readOnly: true,
      noPrivilegeEscalation: true,
      noUnauthorizedAccess: true,
      noHarm: true,
      auditRequired: true,
      tawhid: "الله وحده لا شريك له"
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  inspectLinuxRuntime
};
