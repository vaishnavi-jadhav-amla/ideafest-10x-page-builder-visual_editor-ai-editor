import { AREA, errorStack, logServer } from "@znode/logger/server";
import { ContentContainers_detailsByContainerKey, FilterTuple, WebStoreWidgets_containersByWidgetKey } from "@znode/clients/v2";
import { IAdSpace, IContentContainer } from "@znode/types/content-container";

import { CONTENT_CONTAINER } from "@znode/constants/content-container";
import { convertCamelCase, FilterCollection, FilterKeys, FilterOperators, generateTagName } from "@znode/utils/server";
import { extractValuesByCodes, getSavedUserSession } from "@znode/utils/common";
import { getPortalDetails } from "../portal";
import { IWidget } from "@znode/types/widget";
import { CACHE_KEYS } from "@znode/constants/cache-keys";

export async function getContentContainer(widget: IWidget): Promise<IContentContainer | null> {
  try {
    const { widgetKey, cmsMappingId, typeOfMapping } = widget;
    const portalData = await getPortalDetails();
    const userDetails = await getSavedUserSession();
    let profileId;
    if (userDetails && userDetails.userId && userDetails.userId > 0) {
      profileId = userDetails.profileId;
    }
    else {
      profileId = portalData.profileId;
    }
    const updatedCMSMappingId = cmsMappingId  ? Number(cmsMappingId) : Number(portalData?.portalId);

    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(FilterKeys.CacheTags, FilterOperators.Contains, generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.CONTAINER_KEY}, ${CACHE_KEYS.DYNAMIC_TAG}, ${CACHE_KEYS.PAGE_MAPPING}`, portalData.storeCode || "", widgetKey, "ContainersByWidgetKey", String(cmsMappingId)));
    const containerKey = (await WebStoreWidgets_containersByWidgetKey(widgetKey, updatedCMSMappingId, portalData?.localeCode, typeOfMapping, cacheInvalidator.filterTupleArray as FilterTuple[])) as string;

    if (!containerKey) return null; // Pet0001
    cacheInvalidator.add(FilterKeys.CacheTags, FilterOperators.Contains, generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.CONTAINER_KEY}, ${CACHE_KEYS.DYNAMIC_TAG}, ${CACHE_KEYS.PAGE_MAPPING}`, portalData.storeCode || "", containerKey, "DetailsByContainerKey", String(cmsMappingId)));
    const contentContainerData = await ContentContainers_detailsByContainerKey(containerKey, portalData.localeCode, portalData.storeCode, profileId, cacheInvalidator.filterTupleArray as FilterTuple[]);
    const containerData = convertCamelCase(contentContainerData);
    const contentContainerName = containerData?.contentContainerName || "";

    if (!contentContainerName) return null;

    let result: IContentContainer | null = null;
    const attributeKeys = ["attributeCode", "attributeValue"];
    switch (contentContainerName) {
      case CONTENT_CONTAINER.HOME_PAGE_TICKER: {
        const attributeCodes = ["HomePageTicker"];
        const attributeValues = extractValuesByCodes(containerData?.attributes, attributeKeys, attributeCodes);
        result = { title: attributeValues.HomePageTicker ?? "" };

        break;
      }
      case CONTENT_CONTAINER.HOME_PAGE_PROMO: {
        const attributeCodes = ["PromoLargeImage", "PromoSmallImage", "PromoTitle1", "PromoCTALinkURL", "PromoCTAText"];
        const attributeValues = extractValuesByCodes(containerData?.attributes, attributeKeys, attributeCodes);
        result = {
          containerKey: containerKey || "",
          largeImageUrl: attributeValues.PromoLargeImage || "",
          smallImageUrl: attributeValues.PromoSmallImage || "",
          homePageTitle: attributeValues.PromoTitle1 || "",
          ctaLink: attributeValues.PromoCTALinkURL || "",
          ctaText: attributeValues.PromoCTAText || "",
        };
        break;
      }
      case CONTENT_CONTAINER.AD_SPACE: {
        const attributeCodes = ["AdSpaceImage1", "AdSpaceImage2", "TitleForImage1", "TextForImage1", "TitleForImage2", "TextForImage2", "CTALinkURL1", "CTALinkURL2"];
        const adSpaces: Array<IAdSpace> = [];
        const attributeValues = extractValuesByCodes(containerData?.attributes, attributeKeys, attributeCodes);
        if (attributeValues?.CTALinkURL1) {
          const adSpace: IAdSpace = {
            id: attributeValues.CTALinkURL1 || "",
            image: attributeValues.AdSpaceImage1 || "",
            title: attributeValues.TitleForImage1,
            ctaLink: attributeValues.CTALinkURL1,
            text: attributeValues.TextForImage1,
          };
          adSpaces.push(adSpace);
        }
        if (attributeValues?.CTALinkURL2) {
          const adSpace: IAdSpace = {
            id: attributeValues.CTALinkURL2,
            image: attributeValues.AdSpaceImage2 || "",
            title: attributeValues.TitleForImage2,
            ctaLink: attributeValues.CTALinkURL2,
            text: attributeValues.TextForImage2,
          };
          adSpaces.push(adSpace);
        }

        result = adSpaces;
        break;
      }
    }

    return result;
  } catch (error) {
    logServer.error(AREA.WIDGET, errorStack(error));
    return null;
  }
}
