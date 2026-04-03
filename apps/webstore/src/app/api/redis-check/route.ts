
import { redisClient } from "packages/cache/src/redis/db";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const client = await redisClient();
    const key = searchParams.get("key");
    const index = searchParams.get("index") || "";


    if(!client.isOpen)
      return new Response("redis failed, no connection established", { status: 200 });

    if(!key)
      return new Response("redis succeeded, connection established", { status: 200 });

    if(key == "delete")
    {
      await client.del(index);
      return new Response(`key deleted ${index}`, { status: 200 });
    }

    if(key == "get")
    {
      const data = await client.hGetAll(index);
      return new Response(`key fetched with key ${index} and value ${JSON.stringify(data)}`, { status: 200 });
    }

    if(key == "deleteAll")
    {
      await client.flushAll();
      return new Response("deleted all keys", { status: 200 });
    }
    
    if(key == "getAll")
    {
      const allKeys = await client.keys("*");
      return new Response(`all keys  ${allKeys}`, { status: 200 });
    }

    
    return new Response("event triggered Successfully ", { status: 200 });
  } catch (error) {
    return new Response("failed to Revalidated.", { status: 500 });
  }
}
