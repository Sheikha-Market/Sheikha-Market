const os = require("os");
const fs = require("fs");

function safeRead(file, fallback = "") {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return fallback;
  }
}

function detectGpuLinux() {
  const drm = safeRead("/proc/modules", "");
  const hasNvidia = drm.includes("nvidia");
  const hasAmd = drm.includes("amdgpu");
  const hasIntel = drm.includes("i915") || drm.includes("xe");
  return {
    nvidia: hasNvidia,
    amd: hasAmd,
    intel: hasIntel,
    available: hasNvidia || hasAmd || hasIntel
  };
}

function inspectRuntimeResources() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const cpus = os.cpus();

  return {
    system: "SHEIKHA_RUNTIME_RESOURCE_MANAGER",
    status: "ACTIVE",
    mode: "READ_ONLY_RESOURCE_INSPECTION",
    platform: os.platform(),
    arch: os.arch(),
    cpu: {
      cores: cpus.length,
      model: cpus[0]?.model || "unknown",
      loadavg: os.loadavg()
    },
    memory: {
      totalBytes: totalMem,
      freeBytes: freeMem,
      usedBytes: usedMem,
      usedRatio: Number((usedMem / totalMem).toFixed(4))
    },
    threads: {
      recommendedWorkerThreads: Math.max(1, Math.min(cpus.length - 1, 8)),
      maxDetectedLogicalCores: cpus.length
    },
    storage: {
      mountsDetected: safeRead("/proc/mounts", "")
        .split("\n")
        .filter(Boolean)
        .length
    },
    gpu: os.platform() === "linux"
      ? detectGpuLinux()
      : { available: "UNKNOWN_NON_LINUX", nvidia: false, amd: false, intel: false },
    schedulingPolicy: {
      safeDefault: true,
      cpuFallbackRequired: true,
      gpuOptional: true,
      noOvercommitByDefault: true,
      humanReviewForHighImpact: true
    },
    governance: {
      readOnly: true,
      noPrivilegeEscalation: true,
      noUnauthorizedAccess: true,
      noHarm: true,
      noGhaybClaims: true,
      auditRequired: true,
      tawhid: "الله وحده لا شريك له"
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  inspectRuntimeResources
};
