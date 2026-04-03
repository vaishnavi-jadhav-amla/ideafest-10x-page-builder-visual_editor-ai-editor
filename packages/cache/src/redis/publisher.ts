/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { redisClient } from "./db";
import { redisSubscriberClient } from "./subscriber";
import { RedisClientType, RedisSentinelType } from "redis4";

type HandlerFunction<T = any> = (parsed: T, raw: string) => void;

const subscribedChannels = new Set<string>();
let subscriber:  RedisSentinelType | RedisClientType;

export const subscribeToChannel = async <T = any>(
  channel: string,
  handler: HandlerFunction<T>
): Promise<void> => {
  if (subscribedChannels.has(channel)) return;

  if (!subscriber) {
      const baseClient = await redisSubscriberClient();

      // only connect if not already open
      if (!baseClient.isOpen) {
        await baseClient.connect();
      }

      subscriber = baseClient;
    }

  await subscriber.subscribe(channel, (message: string) => {
    try {
      const parsed = JSON.parse(message) as T;
      handler(parsed, message);
    } catch (err) {
      console.error(`[${channel}] Failed to parse message:`, message);
    }
  });

  subscribedChannels.add(channel);
  console.log(` Subscribed to Redis channel: ${channel}`);
};

export const publishEviction = async (keys: string[]) => {
  const client = await redisClient();
 const payload = JSON.stringify(keys);
  await client.publish("cache-eviction", payload);
};

