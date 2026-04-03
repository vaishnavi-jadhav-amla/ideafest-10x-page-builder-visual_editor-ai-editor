import { isArray } from "lodash";
import { IConfigParam } from "../types/page-builder";
import { getRootConfig as getBaseRootConfig } from "./base-config/config/root-config-layout";
import { getRootConfig as getTheme1RootConfig } from "./theme1-config/config/root-config-layout";
import { getRootConfig as getTheme2RootConfig } from "./theme2-config/config/root-config-layout";
import { getRootConfig as getSafetyGearRootConfig } from "./safetygear-config/config/root-config-layout";
import { getRootConfig as getBstoreRootConfig } from "./bstore-config/config/root-config-layout";

const configCache = new Map<string, any>();

const themeConfigMap = new Map([
    ["common", getBaseRootConfig],
    ["theme1", getTheme1RootConfig],
    ["theme2", getTheme2RootConfig],
    ["safetygear", getSafetyGearRootConfig],
    ["bstore", getBstoreRootConfig],
]);

export function getConfig(params: IConfigParam | IConfigParam[]) {
let layoutRootConfig;
  if(params && isArray(params)) {
   layoutRootConfig = params.map((param: IConfigParam) => {
    const cacheKey = `${param.theme}-${param.configType}`;
    if (configCache.has(cacheKey)) {
      return configCache.get(cacheKey);
    }
    const themeConfig = themeConfigMap.get(param.theme.toLowerCase()) || getBaseRootConfig;
    const rootConfig = themeConfig && themeConfig(param);
    configCache.set(cacheKey, rootConfig);
    return rootConfig
    });
  }
  else {
    const cacheKey = `${params.theme}-${params.configType}`;
    if (configCache.has(cacheKey)) {
    return configCache.get(cacheKey);
  }
  const themeConfig = themeConfigMap.get(params.theme.toLowerCase());
  const rootConfig = themeConfig && themeConfig(params) || getBaseRootConfig(params);
  configCache.set(cacheKey, rootConfig);
  layoutRootConfig = rootConfig;
  }

  return layoutRootConfig;
}