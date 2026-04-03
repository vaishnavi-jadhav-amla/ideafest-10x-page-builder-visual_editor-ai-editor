import { IWidget } from "@znode/types/widget";
import { FilterTuple, WebStoreWidgets_mediaWidgetByWidgetKey } from "@znode/clients/v2";
import { FilterCollection, FilterKeys, FilterOperators, generateTagName, getPortalHeader } from "@znode/utils/server";
import { CACHE_KEYS } from "@znode/constants/cache-keys";

export async function getMediaWidget(params: IWidget) {
  try {
    const { widgetKey, cmsMappingId, typeOfMapping } = params;
    const cacheInvalidator = new FilterCollection();
    const portalData= await getPortalHeader();
    cacheInvalidator.add(FilterKeys.CacheTags, FilterOperators.Contains, generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.DYNAMIC_TAG}`, portalData.storeCode || "", "MediaWidgetByWidgetKey"));
    const dataMedia = await WebStoreWidgets_mediaWidgetByWidgetKey(widgetKey, Number(cmsMappingId), typeOfMapping, cacheInvalidator.filterTupleArray as FilterTuple[]);
    if (!dataMedia) return null;

    return {
      mediaPath: dataMedia.MediaPath || "",
      displayName: dataMedia.DisplayName || "",
    };
  } catch (error) {
    return null;
  }
}
