/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
// src/redisCrud.ts



import { redisClient } from "./db";

// Create or Update a record (Insert or Update)
export async function createOrUpdate<T>(keyPrefix: string, id: string, data: T): Promise<void> {

  const client = await redisClient();
  const key = `${keyPrefix}:${id}`;
  try {
    const cacheExpiry = Number(process.env.CACHE_EXPIRY);
    const stringifiedData = convertValuesToString(data as Record<string, any>);
    const minified  = JSON.stringify(stringifiedData) ;
    await client.set(key, minified, {EX: cacheExpiry});
    console.log(`Data inserted/updated for key: ${key}`);
  } catch (error) {
    console.error("Error inserting/updating data:", error);
  }
}

function convertValuesToString(data: Record<string, any>): Record<string, string> {
    return Object.entries(data).reduce((acc, [key, value]) => {
      // Check if the value is an object or array and serialize it as JSON
      if (typeof value === "object" && value !== null) {
        acc[key] = JSON.stringify(value);
      } else {
        acc[key] = String(value); // Convert non-objects to strings
      }
      return acc;
    }, {} as Record<string, string>);
  }


  export async function getField<T>(keyPrefix: string, id: string, field: string): Promise<T | string | null> {
    const client = await redisClient();
   
  const key = `${keyPrefix}:${id}`;
  try {
    const value = await client.hGet(key, field) || "";
  
    if (value === null) {
      console.log(`No data found for field: ${field} in key: ${key}`);
      return null;
    }
  
    // Try to parse the value as JSON
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      // If parsing fails, return the value as-is (assume it's a string)
      return value;
    }
  } catch (error) {
    console.error("Error retrieving field:", error);
    return null;
  }
}




// Read/Get all fields from a Redis hash
export async function getDetails<T>(keyPrefix: string, id: string): Promise<T | null> {
  const client = await redisClient();

  const key = `${keyPrefix}:${id}`;
  try {
    const result = await client.hGetAll(key) || "";
    if (Object.keys(result).length === 0) {
      console.log(`No data found for key: ${key}`);
      return null;
    }
    const parsedData = parseStringValues<T>(result);
    return parsedData;

  } catch (error) {
    console.error("Error retrieving data:", error);
    return null;
  }
}
export async function get<T>(keyPrefix: string, id: string): Promise<T | null> {

  const client = await redisClient();
  const key = `${keyPrefix}:${id}`;
  try {
    const jsonString = await client.get(key) || "";

  
    if (jsonString) {
      const details = JSON.parse(jsonString);
      const parsedObject: any = Object.fromEntries(
        Object.entries(details).map(([key, value]) => {
          if (value === null || value === undefined || value === "") {
            return [key, value]; // Keep as is
          }
      
          try {
            return [key, typeof value === "string" ? JSON.parse(value) : value];
          } catch {
            return [key, value]; // Retain original value if parsing fails
          }
        })
      );

      return parsedObject;
    }
    return null; // Key doesn't exist
  } catch (error) {
    console.error("Error retrieving data:", error);
    return null;
  }
}


export function parseStringValues<T>(data: Record<string, string>): T {
  return Object.entries(data).reduce((acc, [key, value]) => {
    try {
      // Attempt to parse JSON values back into objects
      acc[key as keyof T] = JSON.parse(value);
    } catch {
      // If parsing fails, assign the string value directly
      acc[key as keyof T] = value as unknown as T[keyof T];
    }
    return acc;
  }, {} as T);
}



// Delete a record (entire hash)
export async function deleteKey(keyPrefix: string, id: string): Promise<void> {
  const client = await redisClient();

  const key = `${id}`;
  try {
    await client.del(key);
    console.log(`Deleted key: ${key}`);
  } catch (error) {
    console.error("Error deleting key:", error);
  }
}

// Delete specific fields from a Redis hash
export async function deleteFields(keyPrefix: string, id: string, fields: string[]): Promise<void> {
  const client = await redisClient();

  const key = `${keyPrefix}:${id}`;
  try {
    await client.hDel(key, fields);
    console.log(`Deleted fields: ${fields.join(", ")} from key: ${key}`);
  } catch (error) {
    console.error("Error deleting fields:", error);
  }
}

export async function deleteKeysByPrefix(keyPrefix: string): Promise<void> {
  if (keyPrefix === "")
    return await deleteAllKeys();

  const client = await redisClient();
  const pattern = `${keyPrefix.toLocaleLowerCase()}*`;
  let cursor  = "0"; // Start cursor at "0"

  try {
    do {
    const scanResult = await client.scan(cursor, { MATCH:pattern, COUNT: 100 });
    console.log("SCAN Result:", scanResult);

    cursor = scanResult.cursor; // Update cursor for next iteration
    const keys = scanResult.keys;

      if (keys.length > 0) {
        // Delete all keys in the current batch
        await client.del(keys);
        console.log(`Deleted keys: ${keys.join(", ")}`);
      }
    } while (cursor !== "0"); // Continue until cursor loops back to "0"

    console.log(`All keys with prefix "${keyPrefix}" have been deleted.`);
  } catch (error) {
    console.error(`Error deleting keys with prefix "${keyPrefix}":`, error);
  }
}

export async function deleteAllKeys(): Promise<void> {
  const client = await redisClient();
  let cursor = "0"; // Start cursor at "0"

  try {
    do {
    const scanResult = await client.scan(cursor, { COUNT: 100 });
    console.log("SCAN Result:", scanResult);

    cursor = scanResult.cursor; // Update cursor for next iteration
    const keys = scanResult.keys;

      if (keys.length > 0) {
        // Delete all keys in the current batch
        await client.del(keys);
        console.log(`Deleted keys: ${keys.join(", ")}`);
      }
    } while (cursor !== "0"); // Continue until cursor loops back to "0"

    console.log("All keys have been deleted.");
  } catch (error) {
    console.error("Error deleting keys", error);
  }
}

export async function getKeysByPrefix(keyPrefix: string): Promise<string[]> {
  const client = await redisClient();
  const pattern = `${keyPrefix.toLocaleLowerCase()}*`;
  let cursor = "0"; // Start cursor at "0"
  const keys: string[] = [];

  try {
    do {
      const scanResult = await client.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = scanResult.cursor; // Update cursor for next iteration
      keys.push(...scanResult.keys); // Collect keys
    } while (cursor !== "0"); // Continue until cursor loops back to "0"

    console.log(`Keys with prefix "${keyPrefix}":`, keys);
    return keys;
  } catch (error) {
    console.error(`Error retrieving keys with prefix "${keyPrefix}":`, error);
    return [];
  }
}