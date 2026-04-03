import { createOrUpdate } from "@znode/cache";
import { sendError } from "@znode/utils/server";

export async function POST(request: Request) {
    try {
        const dataResponse = await request.json();
        const publicId = dataResponse.publicId;
        const prefixKey = dataResponse.prefixKey;
        const jsonData = dataResponse.data;

        await createOrUpdate(prefixKey, publicId, jsonData);

    } catch (error) {
      return sendError("An error occurred while fetching the blog." + String(error), 500);
    }
  }