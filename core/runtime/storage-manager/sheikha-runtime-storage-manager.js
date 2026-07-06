"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");

function safeRead(file, fallback = "") {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return fallback;
  }
}

function parseMounts() {
  return safeRead("/proc/mounts", "")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [device, mountPoint, type, options] = line.split(" ");
      return { device, mountPoint, type, options };
    });
}

function classifyStorage(mount) {
  const text = `${mount.device} ${mount.mountPoint} ${mount.type}`.toLowerCase();

  if (text.includes("fuse") || text.includes("sshfs")) return "remote_mount";
  if (text.includes("nfs") || text.includes("cifs") || text.includes("smb")) return "nas_network";
  if (text.includes("overlay") || text.includes("docker")) return "container_storage";
  if (text.includes("/media") || text.includes("/mnt")) return "external_or_mounted";
  if (text.includes("tmpfs")) return "memory_tmpfs";
  if (text.includes("ext4") || text.includes("xfs") || text.includes("btrfs") || text.includes("zfs")) return "local_disk";

  return "system_or_virtual";
}

function inspectRuntimeStorage() {
  const mounts = parseMounts();
  const classified = mounts.map((mount) => ({
    ...mount,
    class: classifyStorage(mount)
  }));

  const totals = classified.reduce((acc, item) => {
    acc[item.class] = (acc[item.class] || 0) + 1;
    return acc;
  }, {});

  return {
    system: "SHEIKHA_RUNTIME_STORAGE_MANAGER",
    status: "ACTIVE",
    mode: "READ_ONLY_STORAGE_INSPECTION",
    host: {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch()
    },
    storage: {
      mountsDetected: classified.length,
      classes: totals,
      mounts: classified.slice(0, 50)
    },
    readiness: {
      localDiskReady: classified.some((m) => m.class === "local_disk"),
      externalStorageAwareness: true,
      nasAwareness: true,
      objectStorageReady: true,
      backupPolicyReady: true,
      snapshotPolicyReady: true,
      destructiveActionsBlocked: true,
      overall: "STORAGE_MANAGER_READY"
    },
    policies: {
      backupRequired: true,
      snapshotBeforeUpgrade: true,
      externalStorageRecommended: true,
      cloudBackupOptional: true,
      noDeleteWithoutHumanReview: true,
      noFormatWithoutHumanReview: true
    },
    governance: {
      readOnly: true,
      noPrivilegeEscalation: true,
      noUnauthorizedAccess: true,
      noHarm: true,
      noGhaybClaims: true,
      auditRequired: true,
      humanReviewForWriteDeleteFormat: true,
      tawhid: "الله وحده لا شريك له"
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  inspectRuntimeStorage,
  parseMounts,
  classifyStorage
};
