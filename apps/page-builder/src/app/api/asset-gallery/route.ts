import { sendError, sendSuccess } from "@znode/utils/server";
import { SETTINGS } from "@znode/constants/settings";
import { getImages } from "packages/page-builder/src/agents/assets-gallery";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageIndex = searchParams.get("pageIndex") ? Number(searchParams.get("pageIndex")) : SETTINGS.MEDIA_IMAGE_PAGE_INDEX;
    const pageSize = searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : SETTINGS.MEDIA_IMAGE_PAGE_SIZE;
    const mediaType = searchParams.get("mediaType") ?? "";
    const query = searchParams.get("query") !== "undefined" ? searchParams.get("query") : "";

    const mediaImagesList = await getImages(pageIndex, pageSize, mediaType, query ?? "");
    return sendSuccess(mediaImagesList, "Images retrieved successfully");
  } catch (error) {
    return sendError("An error occurred while fetching the media images." + String(error), 500);
  }
}
