const fs = require("fs");
const path = require("path");

const DEFAULT_ROOT = process.cwd();

function walkJsonFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walkJsonFiles(fullPath, results);
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      results.push(fullPath);
    }
  }

  return results;
}

function safeReadJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    return {
      error: error.message,
      file
    };
  }
}

function discoverRuntimeDefinitions(options = {}) {
  const root = options.root || DEFAULT_ROOT;
  const runtimeDir = path.join(root, options.runtimeDir || "runtime");

  const files = walkJsonFiles(runtimeDir);

  const definitions = files.map((file) => {
    const data = safeReadJson(file);
    const relativePath = path.relative(root, file);

    return {
      file: relativePath,
      system: data.system || null,
      version: data.version || null,
      status: data.status || "UNKNOWN",
      active: data.status === "ACTIVE",
      maturity: data.maturity?.overall || null,
      hasGovernance: Boolean(data.governance || data.foundation || data.controls),
      error: data.error || null
    };
  });

  const active = definitions.filter((item) => item.active);
  const invalid = definitions.filter((item) => item.error);
  const inactive = definitions.filter((item) => !item.active && !item.error);

  return {
    system: "SHEIKHA_RUNTIME_DISCOVERY_ENGINE",
    status: "ACTIVE",
    mode: "READ_ONLY_DISCOVERY",
    totals: {
      files: definitions.length,
      active: active.length,
      inactive: inactive.length,
      invalid: invalid.length
    },
    definitions,
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
  discoverRuntimeDefinitions,
  walkJsonFiles
};
