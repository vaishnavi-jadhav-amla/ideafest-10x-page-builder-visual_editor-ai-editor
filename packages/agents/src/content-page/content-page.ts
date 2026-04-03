import { AREA, errorStack, logServer } from "@znode/logger/server";

import { ContentPages_contentPagesByPageCode, FilterTuple } from "@znode/clients/v2";
import { IPortalDetail } from "@znode/types/portal";
import { IWidget } from "@znode/types/widget";
import { WebStoreContentPages_webstoreContentPagesByStoreCode } from "packages/clients/src/znode-client/V2/webstore-content-pages";
import { getSavedUserSession } from "@znode/utils/common";
import { FilterCollection, FilterKeys, FilterOperators, generateTagName } from "@znode/utils/server";
import { CACHE_KEYS } from "@znode/constants/cache-keys";

export async function getContentPageText(params: IWidget) {
  try {
    const contentPageData = await WebStoreContentPages_webstoreContentPagesByStoreCode("", undefined, undefined);

    const data = contentPageData.ContentPageList?.find(
      (i) => i.ContentPageId === params.cmsMappingId && i.TypeOFMapping === params.typeOfMapping && i.WidgetsKey === params.widgetKey && i.LocaleId === 7
    );
    return data?.Text || "";
  } catch (error) {
    logServer.error(AREA.CONTENT_PAGE_TEXT, errorStack(error));
    return null;
  }
}

export async function validateContentByProfile(contentPageCode: string, portalData: IPortalDetail) {
  try {
    const user = await getSavedUserSession();
    const cacheInvalidator = new FilterCollection();
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    cacheInvalidator.add(
      FilterKeys.CacheTags,
      FilterOperators.Contains,
      generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.CONTENT_PAGE},${CACHE_KEYS.DYNAMIC_TAG}`, portalData.storeCode || "", contentPageCode, "ContentPagesByPageCode")
    );
    const contentPageData = await ContentPages_contentPagesByPageCode(
      contentPageCode,
      (user?.userId as number) || 0,
      portalData?.storeCode,
      portalData?.localeCode,
      cacheInvalidator.filterTupleArray as FilterTuple[]
    );

    //if page expired or have future activation date or don't have any content page data it will return false
    return !(
      contentPageData?.CMSContentPagesId === 0 ||
      contentPageData?.CMSContentPagesId === undefined ||
      (contentPageData?.ExpirationDate && new Date(contentPageData.ExpirationDate).getTime() < currentDate.getTime()) ||
      (contentPageData?.ActivationDate && new Date(contentPageData.ActivationDate).getTime() > currentDate.getTime())
    );
  } catch (error) {
    logServer.error(AREA.CONTENT_PAGE_TEXT, errorStack(error));
    return null;
  }
}
