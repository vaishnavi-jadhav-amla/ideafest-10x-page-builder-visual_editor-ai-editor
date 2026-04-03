import { WebStorePortalResponse } from "@znode/clients/v2";


/* eslint-disable @typescript-eslint/no-explicit-any */
export const globalPromiseMapKey = "__PortalDetailsPromises__";
export const globalResultCacheKey = "__portalDataCache__";
 
if (!(global as any)[globalPromiseMapKey]) {
  (global as any)[globalPromiseMapKey] = new Map<string, Promise<any>>();
}
if (!(global as any)[globalResultCacheKey]) {
  (global as any)[globalResultCacheKey] = new Map<string, WebStorePortalResponse>();
}
export const portalPromiseMap = (global as any)[globalPromiseMapKey] as Map<string, Promise<any>>;
export const portalDataCache = (global as any)[globalResultCacheKey] as Map<string, WebStorePortalResponse>;
