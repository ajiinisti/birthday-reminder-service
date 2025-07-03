// General Redis client for pub/sub, etc.
import { createClient } from 'redis';

// Used in other app parts (not BullMQ)
const rawRedisClient = createClient({ url: process.env.REDIS_URL });

let connected = false;
async function connectRedis() {
  if (!connected) {
    await rawRedisClient.connect();
    connected = true;
    console.log('✅ Redis connected');
  }
}

const bullmqConnection = {
  url: process.env.REDIS_URL,
};

export {
  rawRedisClient,
  connectRedis,
  bullmqConnection,
};