/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { clearDataInGlobalCache } from "@znode/utils/server";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    console.log("request data for revalidation received from API ---> ", requestData);
    if(requestData.EventType === "Cache")
    {
    const validJsonString = requestData.Payload.replace(/'/g, "\"");
    const deserializedPayload = JSON.parse(validJsonString);
    const tag : string[] = deserializedPayload.Tag || [];
    tag.push("webstoreGlobal");
    tag.forEach((tag) => {
      revalidateTag(tag);
    });
    clearDataInGlobalCache();
    console.log("data evicted with tag ->", tag);
    return new Response("revalidated successfully ", {status: 200 });
  }
    return new Response("event triggered Successfully", { status: 200 });
  } catch (error) {
    return new Response("failed to Revalidated.", { status: 500 });
  }
}
