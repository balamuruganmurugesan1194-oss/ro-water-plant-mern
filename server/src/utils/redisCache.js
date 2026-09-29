import Redis from "ioredis";

let client;

const getClient = () => {
  if (!process.env.REDIS_URL) return null;
  if (!client) {
    client = new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
    client.on("error", (error) => console.error("REDIS ERROR", error.message));
  }
  return client;
};

export const cacheGet = async (key) => {
  const redis = getClient();
  if (!redis) return null;
  try {
    if (redis.status === "wait") await redis.connect();
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("REDIS GET ERROR", error.message);
    return null;
  }
};

export const cacheSet = async (key, value, ttlSeconds = 30) => {
  const redis = getClient();
  if (!redis) return;
  try {
    if (redis.status === "wait") await redis.connect();
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    console.error("REDIS SET ERROR", error.message);
  }
};
