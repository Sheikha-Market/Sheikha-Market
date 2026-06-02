const { createClient } = require('redis');

let client;

async function getClient() {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
    });

    client.on('error', (err) => {
      console.error('[REDIS]', err.message);
    });

    await client.connect();
  }

  return client;
}

async function health() {
  const startedAt = Date.now();

  try {
    const redis = await getClient();
    await redis.ping();

    return {
      success: true,
      status: 'connected',
      latencyMs: Date.now() - startedAt
    };
  } catch (error) {
    return {
      success: false,
      status: 'unavailable',
      error: error.message,
      latencyMs: Date.now() - startedAt
    };
  }
}

module.exports = { getClient, health };
