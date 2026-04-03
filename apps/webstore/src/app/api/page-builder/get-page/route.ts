import { get } from "@znode/cache";
import { sendSuccess } from "@znode/utils/server";


export const dynamic = "force-dynamic";

export async function GET(req: Request) {

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.searchParams);

    const publicId = searchParams.get("publicId") || "";
    const prefixKey = searchParams.get("prefixKey") || "";

    const responseJson = await get(prefixKey, publicId);


  return sendSuccess(responseJson);
}
