import { DefaultGlobalConfigurations_globalConfigurations, FilterTuple, GlobalSettings_codeGetByGroupCode } from "@znode/clients/v2";
import { CACHE_KEYS } from "@znode/constants/cache-keys";
import { COMMON } from "@znode/constants/common";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IDefaultGlobalConfig } from "@znode/types/global-setting";
import { convertCamelCase, FilterCollection, FilterKeys, FilterOperators, generateTagName, getPortalHeader } from "@znode/utils/server";

export async function getDefaultGlobalSettingData(key: string): Promise<string | null> {
  const globalSettings = await getGlobalConfigSettingDetails();

  if (globalSettings) {
    const defaultConfig = globalSettings.find((item) => item.featureName === key);
    if (defaultConfig) {
      return String(defaultConfig.featureValues);
    }
  }
  return null;
}

export async function getDesiredSetting(key: string): Promise<string> {
  const settings = await getAllDefaultGlobalSettingData();
  if (settings) return settings[key];

  return "False";
}

export async function getAllDefaultGlobalSettingData(): Promise<{ [key: string]: string } | null> {
  // Get the Default Global Setting Details.
  const globalSettings = await getGlobalConfigSettingDetails();

  if (globalSettings) {
    const result: { [key: string]: string } = {};

    globalSettings.forEach((item) => {
      if (item.featureName) result[item.featureName] = String(item.featureValues);
    });

    return result;
  }

  return null;
}

async function getGlobalConfigSettingDetails(): Promise<IDefaultGlobalConfig[]> {
  try {
    const portalData = await getPortalHeader();
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(FilterKeys.CacheTags, FilterOperators.Contains, generateTagName(`${CACHE_KEYS.PORTAL}`, portalData.storeCode || ""));
    const { DefaultGlobalConfigs } = await DefaultGlobalConfigurations_globalConfigurations(cacheInvalidator.filterTupleArray as FilterTuple[]);
    return convertCamelCase(DefaultGlobalConfigs);
  } catch (error) {
    logServer.error(AREA.ACCOUNT, errorStack(error));
    return [] as IDefaultGlobalConfig[];
  }
}

export async function getGoogleMapApiKey() {
  try {
    const data = await GlobalSettings_codeGetByGroupCode(COMMON.GOOGLE_MAP_SETTING, COMMON.ZNODE_GOOGLE_MAP_KEY);
    const googleMapApiKey = data.AttributeValue;
    const appName = process.env.APP_NAME;
    if (!googleMapApiKey) {
      logServer.warn(AREA.GOOGLE_MAP, "Google map api key is missing.");
      return null;
    }
    return { googleMapApiKey, appName };
  } catch (error) {
    logServer.error(AREA.GOOGLE_MAP, errorStack(error));
    return null;
  }
}
