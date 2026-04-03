/* eslint-disable @typescript-eslint/no-unused-vars */
import { CacheHandler } from "@neshca/cache-handler";
import { isImplicitTag } from "@neshca/cache-handler/helpers";
import IORedis from "ioredis";
const { commandOptions } = IORedis;

export const getSentinelNodes = () => {
  const sentinels = process.env.REDIS_SENTINELS || "";
  return sentinels.split(",").map((entry) => {
    const [host, port] = entry.split(":");
    return { host, port: Number(port) };
  });
};

CacheHandler.onCreation(async () => {
  const isSentinelEnabled = process.env.REDIS_SENTINEL_ENABLED === "true";

  const client = isSentinelEnabled
    ? new IORedis({
        sentinels: getSentinelNodes(),
        name: process.env.REDIS_SENTINEL_MASTER_NAME || "mymaster",
        password: process.env.REDIS_PASSWORD || undefined,
      })
    : new IORedis(process.env.REDIS_CONNECTION_STRING);

  client.on("error", (error) => {
    if (process.env.NEXT_PRIVATE_DEBUG_CACHE !== undefined) {
      console.error("Redis client error:", error);
    }
  });

  const keyPrefix = "";
  const sharedTagsKey = "_sharedTags_";
  const revalidatedTagsKey = `${keyPrefix}__revalidated_tags__`;

  function assertClientIsReady() {
    if (!client.status || client.status !== "ready") {
      throw new Error("Redis client is not ready or connection is lost.");
    }
  }

  async function deleteKeys(keys) {
    if (!keys.length) return;
    try {
      await client.del(...keys);
    } catch (error) {
      console.error("Error deleting keys:", error);
    }
  }

  const customRedisHandler = {
    name: isSentinelEnabled ? "redis-ioredis-sentinel" : "redis-ioredis-standalone",

    async get(key, { implicitTags }) {
      assertClientIsReady();

      const result = await client.get(keyPrefix + key);
      if (!result) return null;

      let cacheValue;
      try {
        cacheValue = JSON.parse(result);
      } catch (e) {
        console.error("Failed to parse cache value JSON:", e);
        return null;
      }

      if (!cacheValue) {
        return null;
      }

      const combinedTags = new Set([...cacheValue.tags, ...implicitTags]);

      if (combinedTags.size === 0) {
        return cacheValue;
      }

      const revalidationTimes = await client.hmget(
        revalidatedTagsKey,
        ...Array.from(combinedTags)
      );

      for (const timeString of revalidationTimes) {
        if (timeString && Number.parseInt(timeString, 10) > cacheValue.lastModified) {
          await client.unlink(keyPrefix + key);
          return null;
        }
      }

      return cacheValue;
    },

    async set(key, cacheHandlerValue) {
      assertClientIsReady();

      const fullKey = keyPrefix + key;
      const cacheExpiry = Number(process.env.CACHE_EXPIRY || 3600); // default to 5 min


      try {
        const operations = [
          client.set(fullKey, JSON.stringify(cacheHandlerValue), "EX", cacheExpiry),
        ];


        if (cacheHandlerValue.tags?.length) {
          operations.push(
            client.hset(sharedTagsKey, key, JSON.stringify(cacheHandlerValue.tags))
          );
        }

        await Promise.all(operations);
      } catch (ex) {
        console.error("Redis set error:", ex);
      }
    },

    async revalidateTag(tag) {
      assertClientIsReady();

      const splitTags = tag?.split(",");
      if (!splitTags || splitTags.length === 0) return;

      for (const tagItem of splitTags) {
        if (isImplicitTag(tagItem)) {
          await client.hset(revalidatedTagsKey, tagItem, Date.now().toString());
        }

        const tagsMap = new Map();
        let cursor = "0";

        do {
          const [nextCursor, tuples] = await client.hscan(sharedTagsKey, cursor, "COUNT", "100");
          cursor = nextCursor;

          for (let i = 0; i < tuples.length; i += 2) {
            const field = tuples[i];
            const value = tuples[i + 1];
            try {
              tagsMap.set(field, JSON.parse(value));
            } catch (err) {
              console.warn(`Skipping corrupted tag list for key ${field}:`, err);
            }
          }
        } while (cursor !== "0");

        const keysToDelete = [];
        const tagsToDelete = [];

        for (const [k, tags] of tagsMap.entries()) {
          if (tags.includes(tagItem)) {
            keysToDelete.push(keyPrefix + k);
            tagsToDelete.push(k);
          }
        }

        if (keysToDelete.length > 0) {
          await deleteKeys(keysToDelete);
          await client.hdel(sharedTagsKey, ...tagsToDelete);
        }
      }
    },
  };

  return {
    handlers: [customRedisHandler],
  };
});

export default CacheHandler;
