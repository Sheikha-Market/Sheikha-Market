const APP_ROOT = __dirname;

module.exports = {
  apps: [
    {
      name: "sheikha-main-portal",
      script: "./server.js",
      cwd: APP_ROOT,
      instances: 4,
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
      node_args: "--max-old-space-size=4096",
      env: {
        NODE_ENV: "production",
        PORT: 8080,
        OLLAMA_HOST: "http://127.0.0.1:11434",
        SHEIKHA_CORE_MODEL: "Sheikha-Core",
        AI_LLM_MODEL: "Sheikha-Core",
        SHEIKHA_RUNTIME_MODE: "governed-fast-operational",
        SHEIKHA_ENABLE_PIPELINE_LAYER: "true",
        SHEIKHA_ENABLE_MLOPS_LAYER: "true",
        SHEIKHA_ENABLE_GOVERNANCE_LAYER: "true",
        SHEIKHA_ENABLE_ENTERPRISE_CONTROL_PLANE: "true",
        SHEIKHA_CLUSTER_SCOPE_AI_SYSTEM: "true",
        SHEIKHA_CLUSTER_SCOPE_VSCODE_CHAT: "true"
      }
    },
    {
      name: "sheikha-universal-api",
      script: "./server.js",
      cwd: APP_ROOT,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 9191,
        SHEIKHA_UNIVERSAL_API: "true",
        OLLAMA_HOST: "http://127.0.0.1:11434",
        SHEIKHA_ENABLE_PIPELINE_LAYER: "true",
        SHEIKHA_ENABLE_MLOPS_LAYER: "true",
        SHEIKHA_ENABLE_GOVERNANCE_LAYER: "true",
        SHEIKHA_ENABLE_ENTERPRISE_CONTROL_PLANE: "true"
      }
    }
  ]
};
