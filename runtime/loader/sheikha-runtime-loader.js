const registry = require("../registry/sheikha-runtime-registry");

function loadRuntime() {
  return {
    status: "ACTIVE",
    modules: registry
  };
}

module.exports = { loadRuntime };
