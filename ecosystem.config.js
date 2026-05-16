module.exports = {
  apps: [
    {
      name: "sheikha-main-portal",
      script: "server.js",
      // Use repository path on each host (local dev or VPS) instead of a hardcoded machine-specific path.
      cwd: process.env.SHEIKHA_APP_CWD || __dirname,
      env_file: ".env.runtime",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      node_args: "--max-old-space-size=512",
      env: {
        NODE_ENV: "development",
        PORT: 8080
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 8080
      }
    }
  ]
};
