module.exports = {
  apps: [
    {
      name: 'sheikha-api',
      script: './server.js',
      instances: 'max',          // Use all CPU cores
      exec_mode: 'cluster',      // Cluster mode for load balancing
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      watch: false,              // Disable watch for performance
      max_memory_restart: '1G',  // Restart if memory exceeds 1GB
      error_file: './logs/sheikha-error.log',
      out_file: './logs/sheikha-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 3,
      min_uptime: '10s',
      gracefulShutdown: true
    }
  ]
};
