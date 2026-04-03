import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IGlobalAttributeValues, IPortalLocale } from "@znode/types/portal";
import { IPermissions, IUser } from "@znode/types/user";
import {
  getSavedUserSession,
  isPreviousPurchasesEnabledFromUserSettings,
  isQuoteRequestEnabledFromUserSettings,
  isReturnOrderRequestEnabledFromUserSettings,
} from "@znode/utils/common";

import { APP_NAME } from "@znode/constants/app";
import { IHeaderDetails } from "@znode/types/headers";
import ImageAssets from "@znode/utils/assets";
import { convertCamelCase } from "@znode/utils/server";
import { getMegaMenuCategories } from "../category";
import { getPortalDetails } from "../portal/portal";
import { mapGlobalAttributes } from "../common";
import { stringToBooleanV2 } from "@znode/utils/common";

export const defaultHeaderConfig = {
  logo: {
    url: ImageAssets.noImage,
  },
  search: {
    barcode: false,
    voiceBasedSearch: false,
    enableTypeaheadSearch: true,
    enableHydratedSearch: true,
  },
  changeLocale: {
    enable: true,
  },
  links: {
    quickOrder: {
      enable: false,
    },
    signIn: {
      enable: true,
    },
  },
};

export function checkPermissions(globalAttributesData: { attributes: IGlobalAttributeValues[] }) : IPermissions {
  const globalAttributes = globalAttributesData.attributes || [];
  if (globalAttributes.length > 0) {
    const attributesMap = mapGlobalAttributes(globalAttributes || []);
    const enablePreviousPurchases = isPreviousPurchasesEnabledFromUserSettings(attributesMap) ?? false;
    const enableQuoteRequest = isQuoteRequestEnabledFromUserSettings(attributesMap) ?? false;
    const enableReturnOrderRequest = isReturnOrderRequestEnabledFromUserSettings(attributesMap) ?? false;
    return {
      enablePreviousPurchases,
      enableQuoteRequest,
      enableReturnOrderRequest,
    };
  } else {
    return {
      enablePreviousPurchases: false,
      enableQuoteRequest: false,
      enableReturnOrderRequest: false,
    };
  }
}

export async function getHeaderInitialDetails(): Promise<IHeaderDetails> {
  try {
    const requiredProperties = [
      "PortalId",
      "LocaleId",
      "PortalLocales",
      "ContainerId",
      "AnalyticsUId",
      "IsEnabledTagManager",
      "AnalyticsIsActive",
      "EnableEnhancedEcommerce",
      "MediaServerUrl",
      "WebsiteLogo",
      "PortalFeatureValues",
      "TrackingPixelScriptCode",
      { key: "AttributeCode", value: "LoginRequired" },
      "GlobalAttributes",
    ];
    const portalData = await getPortalDetails(requiredProperties);
    const {
      portalLocales,
      containerId,
      analyticsUId,
      isEnabledTagManager,
      analyticsIsActive,
      enableEnhancedEcommerce,
      mediaServerUrl,
      websiteLogo,
      portalFeatureValues,
      trackingPixelScriptCode,
      loginRequired = false,
      globalAttributes,
    } = portalData || {};

    const globalAttributesDetails = convertCamelCase(globalAttributes);
    const permission = checkPermissions(globalAttributesDetails);
    const { enableBarcodeScanner, enableVoiceBasedSearch, enableHydratedSearchSettings, enableTypeaheadSearchSettings } = portalFeatureValues || {};
    const userData: IUser | null = await getSavedUserSession();
    const isLoginRequired = !userData?.userId && portalData?.loginRequired ? stringToBooleanV2(loginRequired) : false;

    const formattedPortalLocales =
      (portalLocales &&
        portalLocales.map((locale: IPortalLocale) => ({
          localeId: locale.localeId,
          name: locale.name,
          code: locale.code,
          isDefault: locale.isDefault,
          isActive: locale.isActive,
        }))) ||
      [];
    const analyticsInfo = {
      containerId: containerId || "",
      analyticsUId: analyticsUId || "",
      isEnabledTagManager: isEnabledTagManager || false,
      isEnabledAnalytics: analyticsIsActive || false,
      isEnabledEnhancedEcommerce: enableEnhancedEcommerce || false,
      trackingPixelScript: trackingPixelScriptCode || "",
    };
    const appName = process.env.APP_NAME;
    const { categories, isUserLoggedIn, isEnableQuoteRequest } =
      appName !== APP_NAME.PAGE_BUILDER ? await getMegaMenuCategories(userData, false) : { categories: [], isUserLoggedIn: false, isEnableQuoteRequest: false };

    if (mediaServerUrl && websiteLogo && websiteLogo !== "") {
      defaultHeaderConfig.logo.url = `${mediaServerUrl}${websiteLogo}`;
    }
    defaultHeaderConfig.search.barcode = enableBarcodeScanner || false;
    defaultHeaderConfig.search.voiceBasedSearch = enableVoiceBasedSearch || false;
    defaultHeaderConfig.search.enableHydratedSearch = enableHydratedSearchSettings || false;
    defaultHeaderConfig.search.enableTypeaheadSearch = enableTypeaheadSearchSettings || false;
    defaultHeaderConfig.links.quickOrder.enable = !isLoginRequired;
    return {
      configuration: defaultHeaderConfig || [],
      headerDetails: { categories, isUserLoggedIn, portalLocales: formattedPortalLocales, analyticsInfo, cartCount: 0, isEnableQuoteRequest, permission },
    };
  } catch (error) {
    logServer.error(AREA.HEADERS, errorStack(error));
    return {
      configuration: defaultHeaderConfig,
      headerDetails: {
        categories: [],
        isUserLoggedIn: false,
        portalLocales: [],
        analyticsInfo: {
          containerId: "",
          analyticsUId: "",
          isEnabledTagManager: false,
          isEnabledAnalytics: false,
          isEnabledEnhancedEcommerce: false,
          trackingPixelScript: "",
        },
        cartCount: 0,
        isEnableQuoteRequest: false,
        permission: null,
      },
    } as IHeaderDetails;
  }
}
