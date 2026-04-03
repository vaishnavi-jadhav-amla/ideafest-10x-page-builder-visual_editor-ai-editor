import { createOrUpdate, get } from "@znode/cache";
import { PAGE_CONSTANTS, ENABLE_GRANULAR_WIDGET_CACHING, CACHE_KEY_SHORTCODES } from "@znode/page-builder/constants";
import { IPortalDetail } from "@znode/types/portal";
import { getSavedUserSession } from "@znode/utils/common";
import { cookies } from "next/headers";
import { pageHandlers, preparedContentItem } from "./prepared-content-item";

export const generateCacheKey = async (pageCode: string, id: string | null, storeDetails: IPortalDetail): Promise<string> => {
  const session = await getSavedUserSession();
  const locale = cookies().get("NEXT_LOCALE")?.value || "en-US";
  const profileId = session?.profileId ?? 0;
  const accountId = session?.accountId ?? 0;
  const structureKey = ["product", "category"].includes(pageCode);
  const key = structureKey
    ? `${pageCode}_${CACHE_KEY_SHORTCODES.get(String(storeDetails.publishState))}_${locale}`
    : `${pageCode}_${id}_${accountId}_${CACHE_KEY_SHORTCODES.get(String(storeDetails.publishState))}_${locale}_${profileId}`;
  return key.toLocaleLowerCase();
};

export const mergeDynamicWidgetWithPageWidget = (contentData: any, pageWidget: any, widgetContent: any) => {
  const widgetArray = Array.isArray(widgetContent) ? widgetContent : Object.values(widgetContent);
  const updatedMap = new Map();

  for (const item of [...pageWidget, ...widgetArray]) {
    const key = item.id || item.props?.id || item.type;
    updatedMap.set(key, item);
  }

  const newContent: any[] = [];

  for (const originalItem of contentData.content) {
    const key = originalItem.id || originalItem.props?.id || originalItem.type;
    const updatedItem = updatedMap.get(key);
    newContent.push(updatedItem || originalItem);
  }

  contentData.content.length = 0;
  contentData.content.push(...newContent);
  return contentData;
};

export const separatePageAndWidgets = async (contentData: any, storeDetails: IPortalDetail, id: any, searchParams?: any, isDynamic?: boolean | undefined) => {
  const arr = contentData.content;
  const widgetItems = [];
  const pageWidget = [];
  const pageRelationship: { [key: string]: string } = { ProductListPage: "category", ProductDetailsPage: "product" };
  let pageItem: any = null;

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const type = item.type;

    if (!pageItem && ["ProductListPage", "ProductDetailsPage"].includes(type)) {
      pageItem = item;
      pageWidget.push(item);
    } else {
      widgetItems.push(item);
    }
  }

  let config = pageItem?.props?.config;
  let pageDetails = null;

  if (pageItem && config) {
    pageDetails = isDynamic ? null : await getPageContent(storeDetails, id, config, pageRelationship[config?.id]);
    if (!pageDetails) {
      const handler = pageHandlers.get(config.id);
      pageDetails = handler ? await handler(id, searchParams) : null;

      if (!isDynamic && pageDetails) {
        await setContentPage(storeDetails, pageDetails, id, config);
      }
    }
    pageItem.props.response = { data: pageDetails };
  }

  if (ENABLE_GRANULAR_WIDGET_CACHING) {
    const widgetDetails = await getPageContent(storeDetails, id, { type: "Widget" }, config?.id);

    if (!widgetDetails) {
      const widgetListWithData = await preparedContentItem(
        {
          content: widgetItems,
          root: contentData.root,
        },
        id,
        searchParams,
        contentData?.contentPageId,
        contentData?.pageVariant
      );

      if (widgetListWithData && config?.id) {
        await setContentPage(storeDetails, widgetListWithData.content, id, { type: "Widget" }, config.id);
      }

      return mergeDynamicWidgetWithPageWidget(contentData, pageWidget, widgetListWithData.content);
    }

    return mergeDynamicWidgetWithPageWidget(contentData, pageWidget, widgetDetails);
  }

  return mergeDynamicWidgetWithPageWidget(contentData, pageWidget, widgetItems);
};

// function isPageCacheable(pageCode: string) {
//   const { HOME, CATEGORY, LAYOUT, PRODUCT, CONTENT, CART, CHECKOUT } = PAGE_CONSTANTS.PAGE_CODES;
//   const pageCodes = [HOME, CATEGORY, LAYOUT, PRODUCT, CONTENT, CART, CHECKOUT];
//   return pageCodes.includes(pageCode);
// }

const CACHEABLE_PAGE_CODES = [
  PAGE_CONSTANTS.PAGE_CODES.HOME,
  PAGE_CONSTANTS.PAGE_CODES.CATEGORY,
  PAGE_CONSTANTS.PAGE_CODES.LAYOUT,
  PAGE_CONSTANTS.PAGE_CODES.PRODUCT,
  PAGE_CONSTANTS.PAGE_CODES.CONTENT,
  PAGE_CONSTANTS.PAGE_CODES.CART,
  PAGE_CONSTANTS.PAGE_CODES.CHECKOUT,
];

export function isPageCacheable(pageCode: string): boolean {
  return CACHEABLE_PAGE_CODES.includes(pageCode);
}
export const getContent = async (
  storeDetails: IPortalDetail,
  id: string | null,
  pageCode?: string,
  isDynamic?: boolean | undefined,
  searchParams?: any,
  contentPageCode?: string
): Promise<any> => {
  if (process.env.ENABLE_PAGE_CACHE === "true" && !isDynamic) {
    if (process.env.APP_NAME == "WEBSTORE" && isPageCacheable(pageCode || "")) {
      let cacheKey = await generateCacheKey(contentPageCode || pageCode || "", id, storeDetails);
      if (!storeDetails.storeCode) {
        return;
      }
      const preparedDataCache = await get(`str_${storeDetails.storeCode.toLocaleLowerCase()}` || "", cacheKey);
      if (preparedDataCache) {
        if (["category", "product"].includes(pageCode || "")) {
          await mapPageDetails(storeDetails, id, preparedDataCache, searchParams, pageCode, isDynamic);
        }
      }
      return preparedDataCache;
    }
  }
  return null;
};

export const setContent = async <T>(
  storeDetails: IPortalDetail,
  data: T,
  id: string | null,
  pageCode?: string,
  isDynamic?: boolean,
  searchParams?: any,
  contentPageCode?: string
): Promise<any> => {
  if (process.env.ENABLE_PAGE_CACHE === "true" && !isDynamic) {
    if (process.env.APP_NAME == "WEBSTORE" && isPageCacheable(pageCode || "")) {
      let cacheKey = await generateCacheKey(contentPageCode || pageCode || "", id, storeDetails ?? 0);
      const jsonData = {
        key: cacheKey,
        ...data,
      };
      storeDetails.storeCode && (await createOrUpdate(`str_${storeDetails.storeCode.toLocaleLowerCase()}` || "", cacheKey, jsonData));
    }
    if (data) {
      return await mapPageDetails(storeDetails, id, data, searchParams, pageCode, isDynamic);
    }
  }
};

export const mapPageDetails = async (storeDetails: IPortalDetail, id: any, preparedDataCache: any, searchParams?: any, pageCode?: string, isDynamic?: boolean | undefined) => {
  if (preparedDataCache?.data?.content && preparedDataCache.data.content.length == 0) {
    return preparedDataCache;
  }
  return await separatePageAndWidgets(preparedDataCache.data, storeDetails, id, searchParams, isDynamic);
};

export const getKeyType = (config: any, pageCode: string | undefined) => {
  const widgetType = CACHE_KEY_SHORTCODES.get(config?.id);
  if (!widgetType) {
    return;
  }
  return config?.type == "Page" ? widgetType : `${pageCode}_${config?.type}`;
};

export const getPageContent = async (storeDetails: IPortalDetail, id: string | null, config?: any, pageCode?: string, isDynamic?: boolean): Promise<any> => {
  if (process.env.ENABLE_PAGE_CACHE === "true" && !isDynamic) {
    if (
      process.env.APP_NAME == "WEBSTORE" &&
      (pageCode == PAGE_CONSTANTS.PAGE_CODES.HOME ||
        pageCode == PAGE_CONSTANTS.PAGE_CODES.CATEGORY ||
        pageCode == PAGE_CONSTANTS.PAGE_CODES.LAYOUT ||
        pageCode == PAGE_CONSTANTS.PAGE_CODES.PRODUCT ||
        pageCode == PAGE_CONSTANTS.PAGE_CODES.CONTENT ||
        config?.type == "Widget")
    ) {
      const prefixKey = config?.type == "Page" ? "Page" : "Widget";
      if (!storeDetails.storeCode) {
        return;
      }
      let cacheKey = await generateCacheKey(getKeyType(config, pageCode) ?? "", config?.type == "Page" ? id : String(storeDetails.storeCode.toLocaleLowerCase()), storeDetails);
      const preparedDataCache = await get(`${storeDetails.storeCode.toLocaleLowerCase()}_${prefixKey.toLocaleLowerCase()}` || "", cacheKey);
      return preparedDataCache;
    }
  }
};

export const setContentPage = async <T>(storeDetails: IPortalDetail, data: T, id: string | null, config?: any, pageCode?: string): Promise<any> => {
  const prefixKey = config?.type == "Page" ? "Page" : "Widget";
  if (process.env.ENABLE_PAGE_CACHE === "true") {
    if (!storeDetails.storeCode) {
      return;
    }
    let cacheKey = await generateCacheKey(getKeyType(config, pageCode) ?? "", config?.type == "Page" ? id : String(storeDetails.storeCode.toLocaleLowerCase()), storeDetails ?? 0);
    await createOrUpdate(`${storeDetails.storeCode.toLocaleLowerCase()}_${prefixKey.toLocaleLowerCase()}` || "", cacheKey, data);
  }
};
