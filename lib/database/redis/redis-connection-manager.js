const { createClient } = require('redis');

let client = null;

async function getClient() {
  if (client && client.isOpen) {
    return client;
  }

  client = createClient({
    socket: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT || 6379),
      connectTimeout: 2000,
      reconnectStrategy: false
    }
  });

  client.on('error', (err) => {
    console.error('[REDIS]', err.message);
  });

  await client.connect();

  return client;
}

async function health() {
  const startedAt = Date.now();

  try {
    const redis = await getClient();

    const result = await redis.ping();

    return {
      success: result === 'PONG',
      status: 'connected',
      latencyMs: Date.now() - startedAt,
      result
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

module.exports = {
  getClient,
  health
};
