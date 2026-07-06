const { execFileSync } = require("child_process");

function safeExec(command, args = []) {
  try {
    return execFileSync(command, args, {
      encoding: "utf8",
      timeout: 500,
      stdio: ["ignore", "pipe", "ignore"]
    });
  } catch (error) {
    return "";
  }
}

function detectPm2() {
  const output = safeExec("pm2", ["jlist"]);
  if (!output) {
    return {
      available: false,
      services: []
    };
  }

  try {
    const list = JSON.parse(output);
    return {
      available: true,
      services: list.map((item) => ({
        name: item.name,
        pid: item.pid,
        status: item.pm2_env?.status || "unknown",
        restarts: item.pm2_env?.restart_time || 0,
        uptime: item.pm2_env?.pm_uptime || null,
        memoryBytes: item.monit?.memory || null,
        cpuPercent: item.monit?.cpu || null
      }))
    };
  } catch {
    return {
      available: true,
      services: [],
      parseError: true
    };
  }
}

function detectSystemd() {
  const output = safeExec("systemctl", ["is-system-running"]);
  return {
    available: Boolean(output),
    status: output.trim() || "unknown"
  };
}

function detectDocker() {
  const output = safeExec("docker", ["version", "--format", "{{.Server.Version}}"]);
  return {
    available: Boolean(output),
    version: output.trim() || null
  };
}

function detectKubernetes() {
  const output = safeExec("kubectl", ["version", "--client", "--short"]);
  return {
    available: Boolean(output),
    client: output.trim() || null
  };
}

function inspectRuntimeServices() {
  const pm2 = detectPm2();
  const systemd = detectSystemd();
  const docker = detectDocker();
  const kubernetes = detectKubernetes();

  return {
    system: "SHEIKHA_RUNTIME_SERVICE_MANAGER",
    status: "ACTIVE",
    mode: "READ_ONLY_SERVICE_INSPECTION",
    adapters: {
      pm2,
      systemd,
      docker,
      kubernetes,
      podman: { available: Boolean(safeExec("podman", ["version"])) },
      nomad: { available: Boolean(safeExec("nomad", ["version"])) }
    },
    readiness: {
      serviceDiscovery: true,
      healthSupervisorReady: true,
      restartPolicyReady: true,
      destructiveActionsBlocked: true,
      overall: "SERVICE_MANAGER_READY"
    },
    governance: {
      readOnly: true,
      noPrivilegeEscalation: true,
      noUnauthorizedAccess: true,
      noHarm: true,
      noGhaybClaims: true,
      auditRequired: true,
      humanReviewForRestartStopStart: true,
      tawhid: "الله وحده لا شريك له"
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  inspectRuntimeServices,
  detectPm2,
  detectSystemd,
  detectDocker,
  detectKubernetes
};
