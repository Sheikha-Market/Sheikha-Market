/**
 * 🚀 Test Server - Sheikha Cloud API (Dev Mode)
 * Standalone API server for testing - Runs on port 3001
 * No authentication required for development/testing
 */

const SheikhaCloudAPI = require('./js/sheikha-cloud-api.js');

// Create API instance
const api = new SheikhaCloudAPI();
api.port = 3001; // Use different port

// Override auth middleware for dev mode
console.log(`
╔═══════════════════════════════════════════╗
║  🌐☁️ Sheikha Cloud API — Test Server    ║
║  Port: 3001 (Development Mode)           ║
║  Auth: DISABLED (for testing)            ║
╚═══════════════════════════════════════════╝
`);

// Start the API server
api.start();
