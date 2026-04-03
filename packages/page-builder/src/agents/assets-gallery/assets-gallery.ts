import { AREA, errorStack, logServer } from "@znode/logger/server";
import { Media_list, MediaManagerModel } from "@znode/clients/v1";
import { COMMON } from "@znode/constants/common";
import { FilterKeys, FilterOperators, FilterCollection, ExpandCollection, ExpandKeys } from "@znode/utils/server";

export async function getImages(pageIndex: number, pageSize: number, mediaType: string, query?: string) {
  try {
    const sortCollection: { [key: string]: string } = {};
    sortCollection["mediapathid"] = COMMON.ASC;
    const expands = new ExpandCollection();
    expands.add("");

    const filters: FilterCollection = new FilterCollection();
    if (mediaType) filters.add(FilterKeys.MediaType, FilterOperators.Is, mediaType);
    if (query) filters.add(FilterKeys.FileName, FilterOperators.Contains, query);

    const mediaData = await Media_list(expands, filters.filterTupleArray, sortCollection, pageIndex, pageSize);
    const mediaList = mediaData.MediaList?.MediaList || [];
    const imagesData =
      mediaList?.map((media: MediaManagerModel) => ({
        mediaServerPath: media.MediaServerPath,
        fileName: media.FileName,
      })) || [];
    const totalResults = mediaData.MediaList?.TotalResults || 0;

    return {
      imagesData: imagesData,
      totalResults: totalResults,
    };
  } catch (error) {
    logServer.error(AREA.WIDGET, errorStack(error));
    return null;
  }
}
