import { AREA, errorStack, logServer } from "@znode/logger/server";
import { ILinkData, IWidget } from "@znode/types/widget";

import { FilterTuple, WebStoreWidgets_linkWidgetsByWidgetKey } from "@znode/clients/v2";
import { convertCamelCase, FilterCollection, FilterKeys, FilterOperators, generateTagName } from "@znode/utils/server";
import { getPortalDetails } from "../portal/portal";
import { CACHE_KEYS } from "@znode/constants/cache-keys";

const requiredProperties = ["ImageThumbnailUrl", "LocaleCode", "StoreCode", "ProfileId"];

export async function getLinkData(params: IWidget): Promise<ILinkData[] | null> {
  try {

    const { cmsMappingId, typeOfMapping, widgetKey } = params;
    const portalData = await getPortalDetails(requiredProperties);
    const imageThumbnailUrl = portalData.imageThumbnailUrl;
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(FilterKeys.CacheTags, FilterOperators.Contains, generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.DYNAMIC_TAG}`, portalData.storeCode || "", "LinkWidgetsByWidgetKey"));

    const linkWidgetData = await WebStoreWidgets_linkWidgetsByWidgetKey(
      widgetKey,
      Number(cmsMappingId),
      portalData.localeCode as string,
      portalData.storeCode as string,
      typeOfMapping,
      String(portalData.profileId),
      cacheInvalidator.filterTupleArray as FilterTuple[]
    );
    const linkInfoList = convertCamelCase(linkWidgetData?.LinkDataList);
    
    if(!linkInfoList)
    {
      logServer.error(AREA.WIDGET, `failed to retrieve link widget in method getLinkData with params ${JSON.stringify(params)} and store code ${portalData.storeCode}`);
    }

    const linkDataList = linkInfoList ? linkInfoList.map((linkData: ILinkData) => ({
      ...linkData,
      mediaPath: linkData.mediaPath ? `${imageThumbnailUrl}${linkData.mediaPath}` : null,
    })): [];
    return linkDataList;
  } catch (error) {
    logServer.error(AREA.WIDGET, `error in link widget ${errorStack(error)}`);
    return null;
  }
}
