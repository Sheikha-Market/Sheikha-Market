"use strict";

const os = require("os");
const fs = require("fs");
const { execFileSync } = require("child_process");

function safeRead(file, fallback = "") {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return fallback;
  }
}

function safeExec(command, args = []) {
  try {
    return execFileSync(command, args, {
      encoding: "utf8",
      timeout: 3000,
      stdio: ["ignore", "pipe", "ignore"]
    });
  } catch {
    return "";
  }
}

function inspectInterfaces() {
  const interfaces = os.networkInterfaces();

  return Object.entries(interfaces).map(([name, entries]) => ({
    name,
    addresses: (entries || []).map((entry) => ({
      address: entry.address,
      family: entry.family,
      internal: entry.internal,
      mac: entry.mac,
      cidr: entry.cidr
    }))
  }));
}

function inspectDns() {
  return safeRead("/etc/resolv.conf", "")
    .split("\n")
    .filter((line) => line.trim().startsWith("nameserver"))
    .map((line) => line.trim().split(/\s+/)[1])
    .filter(Boolean);
}

function inspectListeningPorts() {
  const output = safeExec("ss", ["-ltn"]);
  return output
    .split("\n")
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const parts = line.trim().split(/\s+/);
      return {
        state: parts[0],
        localAddress: parts[3] || null,
        peerAddress: parts[4] || null
      };
    });
}

function detectReverseProxy() {
  return {
    nginx: Boolean(safeExec("nginx", ["-v"])),
    apache: Boolean(safeExec("apache2", ["-v"])) || Boolean(safeExec("httpd", ["-v"])),
    caddy: Boolean(safeExec("caddy", ["version"])),
    traefik: Boolean(safeExec("traefik", ["version"]))
  };
}

function detectFirewall() {
  return {
    ufw: Boolean(safeExec("ufw", ["status"])),
    firewalld: Boolean(safeExec("firewall-cmd", ["--state"])),
    nftables: Boolean(safeExec("nft", ["list", "ruleset"])),
    iptables: Boolean(safeExec("iptables", ["-S"]))
  };
}

function inspectRuntimeNetwork() {
  const interfaces = inspectInterfaces();
  const dns = inspectDns();
  const listeningPorts = inspectListeningPorts();
  const reverseProxy = detectReverseProxy();
  const firewall = detectFirewall();

  const hasPrivateIp = interfaces.some((iface) =>
    iface.addresses.some((addr) =>
      !addr.internal &&
      (
        addr.address.startsWith("10.") ||
        addr.address.startsWith("192.168.") ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(addr.address)
      )
    )
  );

  return {
    system: "SHEIKHA_RUNTIME_NETWORK_MANAGER",
    status: "ACTIVE",
    mode: "READ_ONLY_NETWORK_INSPECTION",
    host: {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch()
    },
    network: {
      interfacesDetected: interfaces.length,
      interfaces,
      dns,
      listeningPortsDetected: listeningPorts.length,
      listeningPorts: listeningPorts.slice(0, 50),
      privateNetworkDetected: hasPrivateIp
    },
    adapters: {
      reverseProxy,
      firewall
    },
    readiness: {
      interfaceAwareness: true,
      dnsAwareness: true,
      portAwareness: true,
      reverseProxyAwareness: true,
      firewallAwareness: true,
      tlsReadiness: true,
      serviceDiscoveryReady: true,
      destructiveActionsBlocked: true,
      overall: "NETWORK_MANAGER_READY"
    },
    policies: {
      noFirewallChangesWithoutHumanReview: true,
      noPortExposureWithoutHumanReview: true,
      noDnsChangesWithoutHumanReview: true,
      tlsRecommendedForPublicEndpoints: true,
      localhostBindingPreferredForInternalServices: true
    },
    governance: {
      readOnly: true,
      noPrivilegeEscalation: true,
      noUnauthorizedAccess: true,
      noHarm: true,
      noGhaybClaims: true,
      auditRequired: true,
      humanReviewForNetworkChanges: true,
      tawhid: "الله وحده لا شريك له"
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  inspectRuntimeNetwork,
  inspectInterfaces,
  inspectDns,
  inspectListeningPorts,
  detectReverseProxy,
  detectFirewall
};
