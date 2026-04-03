/* eslint-disable no-console */
import { deleteKeyPrefix } from "@znode/cache";
import { clearDataInGlobalCache } from "@znode/utils/server";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
    try {
        const requestData = await request.json();
        console.log("request data for revalidation received from API ---> ", requestData);
        revalidateTag("webstoreGlobal");
        clearDataInGlobalCache();
        await deleteKeyPrefix("");
        return new Response("revalidated successfully ", { status: 200 });
    } catch (error) {
        return new Response("failed to revalidate.", { status: 500 });
    }
}