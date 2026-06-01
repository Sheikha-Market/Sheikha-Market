module.exports = {
  apps: [
    {
      name: "sheikha-main-portal",
      script: "./server.js",
      cwd: "/home/sheikha/Projects/sheikha/sheikha-main-portal",
      instances: 4,
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
      node_args: "--max-old-space-size=4096",
      env: {
        NODE_ENV: "production",
        PORT: 8080,
        OLLAMA_HOST: "127.0.0.1:11434",
        SHEIKHA_CORE_MODEL: "Sheikha-Core",
        AI_LLM_MODEL: "Sheikha-Core",
        SHEIKHA_RUNTIME_MODE: "governed-fast-operational"
      }
    },
    {
      name: "sheikha-universal-api",
      script: "./server.js",
      cwd: "/home/sheikha/Projects/sheikha/sheikha-main-portal",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 9191,
        SHEIKHA_UNIVERSAL_API: "true",
        OLLAMA_HOST: "127.0.0.1:11434"
      }
    }
  ]
};
