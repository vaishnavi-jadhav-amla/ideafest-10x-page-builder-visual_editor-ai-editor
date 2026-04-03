/* eslint-disable no-console */
import { createClient, createSentinel, RedisClientType, RedisSentinelType } from "redis4";

let client: RedisSentinelType | RedisClientType;

const getSentinelNodes = (): { host: string; port: number }[] => {
  const sentinels = process.env.REDIS_SENTINELS || "";
  return sentinels.split(",").map((entry) => {
    const [host, port] = entry.split(":");
    return { host, port: Number(port || "26379") };
  });
};

export const redisSubscriberClient = async () => {
  if (!client) {
    if (process.env.REDIS_SENTINEL_ENABLED === "true") {
      client = createSentinel({
        name: String(process.env.REDIS_MASTER_NAME || "mymaster"),
        sentinelRootNodes: getSentinelNodes(),
      });
    } else {
      client = createClient({
        url: process.env.REDIS_CONNECTION_STRING,
      });
    }

    client.on("error", (err) => console.error("Redis Sentinel Error:", err));

    try {
      await client.connect();
      console.log("Connected to Redis via Sentinel");
    } catch (err) {
      console.error("Failed to connect to Redis Sentinel:", err);
      throw err;
    }
  } 

  return client;
};
