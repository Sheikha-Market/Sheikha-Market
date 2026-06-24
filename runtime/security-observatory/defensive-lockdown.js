const level = (process.argv[2] || "HIGH").toUpperCase();

const actions = {
  HIGH: [
    "enable_monitoring",
    "backup_runtime_state",
    "restrict_non_essential_access",
    "notify_admin",
    "preserve_evidence"
  ],
  CRITICAL: [
    "enable_monitoring",
    "backup_runtime_state",
    "isolate_affected_services",
    "rotate_runtime_secrets",
    "lock_sensitive_exports",
    "notify_admin",
    "preserve_evidence",
    "start_recovery_plan"
  ]
};

console.log(JSON.stringify({
  system: "SHEIKHA_DEFENSIVE_LOCKDOWN_V1",
  mode: "DEFENSE_ONLY_NO_ATTACK",
  level,
  actions: actions[level] || actions.HIGH,
  forbidden: [
    "no hacking back",
    "no retaliation",
    "no violence",
    "no unauthorized access",
    "no data theft"
  ]
}, null, 2));
