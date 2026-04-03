import { IConfigParam } from "../types/page-builder";
import { getRootConfig as getCommonRootConfig } from "./base-config/config/root-config";

const configCache = new Map<string, any>();

const themeConfigLoaders: Record<string, () => Promise<(params: IConfigParam) => Promise<any>>> = {
  theme1: async () => (await import("./theme1-config/config/root-config")).getRootConfig,
  theme2: async () => (await import("./theme2-config/config/root-config")).getRootConfig,
  safetygear: async () => (await import("./safetygear-config/config/root-config")).getRootConfig,
  bstore: async () => (await import("./bstore-config/config/root-config")).getRootConfig,
};

export async function getConfig(params: IConfigParam) {
  const cacheKey = `${params.theme}-${params.configType}`;
  if (configCache.has(cacheKey)) {
    return configCache.get(cacheKey);
  }

  const theme = params.theme.toLowerCase();

  const loader = themeConfigLoaders[theme];
  const rootConfigGetter = loader ? await loader() : getCommonRootConfig;

  const resolvedConfig = await rootConfigGetter(params);

  configCache.set(cacheKey, resolvedConfig);
  return resolvedConfig;
}