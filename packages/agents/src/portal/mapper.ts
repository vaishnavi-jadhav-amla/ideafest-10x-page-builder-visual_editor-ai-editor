import { AREA, logServer } from "@znode/logger/server";
import { IGlobalAttributeValues, IPageList, IPortalDetail, IPortalFeatureValues, IPortalLocale, IRecommendationSetting, ISortingOptions } from "@znode/types/portal";
import { convertCamelCase, getDefaultLocale } from "@znode/utils/server";

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LocaleModel } from "@znode/clients/v1";
import { SETTINGS } from "@znode/constants/settings";
import { SNAKE_CASE_PATTERN_REGEX } from "@znode/constants/regex";
import { WebStorePortalResponse } from "@znode/clients/v2";

export function mapPortalApplicationValues(portalData: WebStorePortalResponse | undefined) {
 if (portalData && portalData.StoreCode) {      
    const portalDetails: IPortalDetail = {
      portalId: portalData.PortalId as number,
      storeCode: portalData.StoreCode,
      publishCatalogId: portalData.PublishCatalogId as number,
      localeId: portalData.LocaleId as number,
      orderStatusId: portalData.OrderStatusId,
      defaultOrderStateId: portalData.DefaultOrderStateID,
      themeName: portalData.ThemeName,
      parentThemeName: portalData.ParentThemeName,
      orderStatus: portalData.OrderStatus,
      storeName: portalData.StoreName,
      customerServiceEmail: portalData.CustomerServiceEmail,
      mediaServerUrl: portalData.MediaServerUrl,
      customerServicePhoneNumber: portalData.CustomerServicePhoneNumber,
      profileId: portalData.ProfileId,
      portalFeatureValues: portalData.PortalFeatureValues,
      isEnabledTagManager: portalData.IsEnabledTagManager,
      containerId: portalData.ContainerId,
      analyticsUId: portalData.AnalyticsUId,
      analyticsIsActive: portalData.AnalyticsIsActive,
      publishStateName: portalData.PublishStateName as string,
      userVerificationTypeCodeValue: portalData.UserVerificationTypeCode as number,
      enableEnhancedEcommerce: portalData.EnableEnhancedEcommerce,
      isBStore: portalData.IsBStore,
      isBStoreRequestPage: portalData.IsBStoreRequestPage,
      isAutoApproved: portalData.IsAutoApproved,
      bStoreDomainName: portalData.BStoreDomainName,
      isParentStoreEnable: portalData.IsParentStoreEnable,
      portalThemeId: portalData.PortalThemeId,
      websiteLogo: portalData.WebsiteLogo,
      websiteTitle: portalData.WebsiteTitle,
      websiteDescription: portalData.WebsiteDescription,
      faviconImage: portalData.FaviconImage,
      portalLocales: portalData.PortalLocales as IPortalLocale[],
      currencyCode: portalData.CurrencyCode,
      outOfStockMessage: portalData.OutOfStockMessage,
      enableCompare: portalData.EnableCompare,
      enableAddressValidation: portalData.EnableAddressValidation,
      enableApprovalManagement: portalData.EnableApprovalManagement,
      globalAttributes: portalData.GlobalAttributes?.Attributes as IGlobalAttributeValues[],
      cultureCode: portalData.CultureCode,
      pageList: portalData.PageList as IPageList[],
      defaultRobotTag: portalData.DefaultRobotTag,
      recommendationSetting: portalData.RecommendationSetting as IRecommendationSetting,
      imageLargeUrl: portalData.ImageLargeUrl,
      imageMediumUrl: portalData.ImageMediumUrl,
      imageSmallUrl: portalData.ImageSmallUrl,
      imageThumbnailUrl: portalData.ImageThumbnailUrl,
      imageSmallThumbnailUrl: portalData.ImageSmallThumbnailUrl,
      portalProfileCatalogId: portalData.PortalProfileCatalogId,
      enableSaveForLater: portalData.EnableSaveForLater,
      isProductInheritanceEnabled: portalData.IsProductInheritanceEnabled,
      isAddToCartOptionForProductSlidersEnabled: portalData.IsAddToCartOptionForProductSlidersEnabled,
      isActive: portalData.IsActive,
      isEnabledAnalytics: portalData.AnalyticsIsActive,
      isEnabledEnhancedEcommerce: portalData.EnableEnhancedEcommerce,
      catalogCode: portalData.CatalogCode,
      localeCode: portalData.LocaleCode || getDefaultLocale(portalData.PortalLocales as IPortalLocale[]),
      portalProfileCatalogCode: portalData.PortalProfileCatalogCode as string,
      sortList: mapPortalSortList(convertCamelCase(portalData.SortList) || []),
      trackingPixelScript: portalData.TrackingPixelScriptCode,
      inStockMessage: portalData.InStockMessage,
      backOrderMessage: portalData.BackOrderMessage,
      isBStoreLoginRequired: portalData.IsBStoreLoginRequired,
      isUserAllowPurchase: portalData.IsUserAllowPurchase,
      openDate: portalData.OpenDate,
      closeDate: portalData.CloseDate,
      isLinkActive: portalData.IsLinkActive,
      isBStoreShowPricingAndInventory: portalData.IsBStoreShowPricingAndInventory,
      isBStoreAllowUserSelfRegister: portalData.IsBStoreAllowUserSelfRegister,
      isBStoreCustomizedCatalog: portalData.IsBStoreCustomizedCatalog,
      isBStoreApproved: portalData.IsBStoreApproved,
      bStoreGlobalAttributes: portalData.BStoreGlobalAttributes,
    };

    portalDetails.showShippingConstraints = portalData?.GlobalAttributes?.Attributes?.find(
      (a) => a?.AttributeCode?.toLowerCase() === SETTINGS.SHOW_SHIPPING_CONSTRAINT.toLowerCase()
    )?.AttributeValue;
    portalDetails.showPromotionSection = portalData?.GlobalAttributes?.Attributes?.find(
      (a) => a?.AttributeCode?.toLowerCase() === SETTINGS.SHOW_PROMOTION_SECTION.toLowerCase()
    )?.AttributeValue;
    return convertCamelCase(portalDetails);
  } else  {
    logServer.error(AREA.PORTAL, `exception in portal mapper ${JSON.stringify(portalData)}`);
    return {} as IPortalDetail;
  }
}

function mapPortalLocales(portalLocales: LocaleModel[] | undefined) {
  const portalLocaleList = portalLocales?.map((locale) => ({
    localeId: locale?.LocaleId,
    name: locale?.Name,
    code: locale?.Code,
    isActive: locale?.IsActive,
    isDefault: locale?.IsDefault,
    custom1: locale?.Custom1,
    custom2: locale?.Custom2,
    custom3: locale?.Custom3,
    custom4: locale?.Custom4,
    custom5: locale?.Custom5,
  })) as Array<IPortalLocale>;

  return portalLocaleList;
}

function mapPortalFeatureValues(portalFeatures: { [key: string]: boolean } | undefined) {
  let portalFeatureValues: IPortalFeatureValues = {};

  if (portalFeatures) {
    portalFeatureValues = {
      persistentCart: portalFeatures.persistentCart ?? false,
      enableProductInheritance: portalFeatures.enableProductInheritance ?? false,
      enableAddToCartOptionForProductSliders: portalFeatures.enableAddToCartOptionForProductSliders ?? false,
      enableProfileBasedSearch: portalFeatures.enableProfileBasedSearch ?? false,
      enableCMSPageResults: portalFeatures.enableCmsPageResults ?? false,
      enableBarcodeScanner: portalFeatures.enableBarcodeScanner,
      enableVoiceBasedSearch: portalFeatures.enableVoiceBasedSearch,
      enableTypeaheadSearchSettings: portalFeatures.enableTypeaheadSearchSettings,
      enableHydratedSearchSettings: portalFeatures.enableHydratedSearchSettings
    };
  }
  return portalFeatureValues;
}

function mapPortalPageList(pageList: IPageList[] | undefined) {
  const PerPageOptions = [
    {
      isDefault: true,
      pageValue: 8,
    },
    {
      isDefault: false,
      pageValue: 12,
    },
    {
      isDefault: false,
      pageValue: 16,
    },
    {
      isDefault: false,
      pageValue: 32,
    },
    {
      isDefault: false,
      pageValue: 64,
    },
  ];

  if (pageList && pageList.length === 0) {
    return PerPageOptions as [];
  }

  const portalPageList: IPageList[] =
    pageList?.map((page) => ({
      isDefault: page?.isDefault,
      pageValue: page?.pageValue,
    })) || [];
  const sortedPageList = portalPageList.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

  return sortedPageList;
}

function mapPortalSortList(sortingList: ISortingOptions[] | undefined) {
  const SortPageOptions = [
    {
      displayOrder: 1,
      sortDisplayName: "sortBy",
      sortValue: 0,
    },
    {
      displayOrder: 2,
      sortDisplayName: "highestRating",
      sortValue: 1,
    },
    {
      displayOrder: 3,
      sortDisplayName: "mostReview",
      sortValue: 2,
    },
    {
      displayOrder: 4,
      sortDisplayName: "priceHighToLow",
      sortValue: 3,
    },
    {
      DisplayOrder: 5,
      SortDisplayName: "priceLowToHigh",
      SortValue: 4,
    },
    {
      DisplayOrder: 6,
      SortDisplayName: "sortByNameAToZ",
      SortValue: 5,
    },
    {
      DisplayOrder: 7,
      SortDisplayName: "sortByNameZToA",
      SortValue: 6,
    },
    {
      DisplayOrder: 8,
      SortDisplayName: "outOfStock",
      SortValue: 7,
    },
    {
      DisplayOrder: 9,
      SortDisplayName: "inStock",
      SortValue: 8,
    },
  ];
  if (sortingList && sortingList.length === 0) {
    return SortPageOptions as [];
  }
  const sortingOptionList: ISortingOptions[] =
    (sortingList &&
      sortingList.map((options) => ({
        sortDisplayName: options?.sortDisplayName.replace(/[:,]/g, "").replace(/\s+/g, "_"),
        displayOrder: options?.displayOrder,
        sortValue: options?.sortValue,
      }))) ||
    [];
  const sortedOptionList = sortingOptionList.sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder));

  const convertDisplayNameToCamelCase = (sortedOptionData: ISortingOptions[]) => {
    return sortedOptionData.map((item) => ({
      ...item,
      sortDisplayName: item.sortDisplayName.toLowerCase().replace(SNAKE_CASE_PATTERN_REGEX.SNAKE_CASE_REGEX, (_, letter) => letter.toUpperCase()),
    }));
  };
  const updatedSortedOptionList = convertDisplayNameToCamelCase(sortedOptionList);
  return updatedSortedOptionList;
}

function mapGlobalAttributes(attributes: any) {
  const desiredAttributeCodes = [
    "EnableQuoteRequest",
    "RedirectPageOnLogin",
    "QuoteExpireInDays",
    "IsReCaptchaRequiredForCheckoutLoggedUser",
    "IsReCaptchaRequiredForGuestUser",
    "SiteKey",
    "SecretKey",
    "ShowPromotionSection",
    "LoginToSeePricingAndInventory",
    "IsCaptchaRequiredForLogin",
    "EnableReturnRequest",
    "DisplayAllWarehousesStock",
    "EnableUserOrderAnnualLimit",
    "EnableUserOrderLimit",
    "EnableInventoryStockNotification",
    "LoginRequired",
    "ShowEstimateShippingCost",
    "ShowShippingConstraints",
    "GlobalProductMessage",
    "EnableSocialMediaLogin",
    "IsCaptchaRequired",
    "EnableStoreShippingAddressSuggestion",
  ];

  const mappedAttributes = attributes?.Attributes?.reduce((result: any, currentAttribute: { AttributeCode: string; AttributeValue: any }) => {
    if (desiredAttributeCodes.includes(currentAttribute.AttributeCode) && !result.some((attr: any) => attr.AttributeCode === currentAttribute.AttributeCode)) {
      result.push({
        attributeCode: currentAttribute.AttributeCode,
        attributeValue: currentAttribute.AttributeValue,
      });
    }
    return result;
  }, []);

  return convertCamelCase(mappedAttributes);
}
