const { MongoClient } = require('mongodb');

let client = null;

function uri() {
  return process.env.MONGODB_URL
    || 'mongodb://sheikha:SheikhaMongo_2026!@127.0.0.1:27017/admin';
}

async function getClient() {
  if (client) {
    return client;
  }

  client = new MongoClient(uri(), {
    serverSelectionTimeoutMS: 2000
  });

  await client.connect();
  return client;
}

async function health() {
  const startedAt = Date.now();

  try {
    const mongo = await getClient();
    const result = await mongo.db('admin').command({ ping: 1 });

    return {
      success: result.ok === 1,
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

module.exports = { getClient, health };
