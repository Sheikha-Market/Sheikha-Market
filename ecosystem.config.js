module.exports = {
  apps: [
    {
      name: "sheikha-main-portal",
      script: "server.js",
      cwd: "/home/sheikha/Projects/sheikha/sheikha-main-portal",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
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
