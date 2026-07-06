module.exports = {
  apps: [{
    name: "sheikha-main-portal",
    script: "server.js",
    watch: false,
    env: {
      NODE_ENV: "production",
      DISABLE_LOGGING: "true",
      NODE_OPTIONS: "--max-old-space-size=256 --no-deprecation"
    }
  }]
};
