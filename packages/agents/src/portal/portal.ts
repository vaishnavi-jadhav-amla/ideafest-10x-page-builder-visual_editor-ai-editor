import { AREA, errorStack, logServer } from "@znode/logger/server";
import { ApplicationTypesEnum, ZnodePublishStatesEnum } from "@znode/types/enums";
import { Domains_domains, Portals_robotsTxtByStoreCode, WebStorePortalResponse, WebStorePortals_V2_1_applicationByStoreCode, WebStorePortals_applicationByStoreCode } from "@znode/clients/v2";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FilterCollection, FilterKeys, FilterOperators, convertCamelCase, generateCacheKey, generateTagName, getPortalHeader } from "@znode/utils/server";
import { IPortalDetail, ISchemaDetails } from "@znode/types/portal";
import { globalPromiseMapKey, globalResultCacheKey } from "./global";

import { CACHE_KEYS } from "@znode/constants/cache-keys";
import { FilterTuple } from "@znode/clients/v1";
import { headers } from "next/headers";
import { mapPortalApplicationValues } from "./mapper";
import { PRODUCT } from "@znode/constants/product";

export function mapRequiredPortalValues(portalData: any, properties: []): any {
  const result: any = {};

  properties.forEach((property: any) => {
    if (typeof property === "string") {
      result[property] = portalData[property];
    } else if (property.key && property.value) {
      const nestedAttribute = portalData?.GlobalAttributes?.Attributes?.find((attr: { AttributeCode: any }) => attr.AttributeCode === property.value);
      if (nestedAttribute) {
        result[property.value] = nestedAttribute?.AttributeValue;
      }
    }
  });

  return convertCamelCase(result);
}

export async function getRobotsTxt(storeCode: string) {
  const cacheInvalidator = new FilterCollection();
  cacheInvalidator.add(
    FilterKeys.CacheTags,
    FilterOperators.Contains,
    generateTagName(`${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.DYNAMIC_TAG}`, storeCode as string, "RobotsTxtByStoreCode")
  );
  const robotsTxtDetails = await Portals_robotsTxtByStoreCode(storeCode, undefined, cacheInvalidator.filterTupleArray as FilterTuple[]);
  if (robotsTxtDetails !== null || robotsTxtDetails !== undefined) {
    const robotText = robotsTxtDetails && robotsTxtDetails?.RobotsTxtContent;
    return robotText;
  } else return "";
}

export async function getMetaData() {
  const metaData = await getPortalDetails();
  if (metaData !== null || metaData !== undefined) {
    const { websiteTitle, websiteDescription, mediaServerUrl, faviconImage, defaultRobotTag } = metaData;
    const metaInfo = {
      websiteTitle,
      websiteDescription,
      mediaServerUrl,
      faviconImage,
      defaultRobotTag,
    };
    return metaInfo;
  } else return null;
}



export async function getPortalDetails(requiredProperties?: any): Promise<IPortalDetail> {
  try {
    const portalHeaders = await getPortalHeader();
    let storeCode = portalHeaders.storeCode;
    const portalDetailsPromises = (global as any)[globalPromiseMapKey] as Map<string, Promise<any>>;
    const portalDataCache = (global as any)[globalResultCacheKey] as Map<string, WebStorePortalResponse>;
 

    if (!storeCode) {
        const host = headers().get("host");

      const filters = new FilterCollection();
      filters.add(FilterKeys.DomainName, FilterOperators.Contains, String(host));
      const cacheInvalidator = new FilterCollection();
      cacheInvalidator.add(FilterKeys.CacheTags, FilterOperators.Contains, generateCacheKey(CACHE_KEYS.DOMAIN_LIST));

      const domainList = await Domains_domains(
        filters.filterTupleArray as FilterTuple[],
        undefined,
        undefined,
        undefined,
        cacheInvalidator.filterTupleArray as FilterTuple[]
      );

      storeCode = domainList?.Domains?.[0]?.StoreCode || "";
    }

    if (!storeCode) {
      logServer.error(AREA.PORTAL, `error occurred in getPortalDetails with ${storeCode}  and portal headers ${JSON.stringify(portalHeaders)}`);

    }

    if (portalDataCache.has(storeCode)) {
      const data =  portalDataCache.get(storeCode);
           const mapped = requiredProperties
          ? mapRequiredPortalValues(data, requiredProperties)
          : mapPortalApplicationValues(data);
          return mapped;
    }

    if (portalDetailsPromises.has(storeCode)) {
      return portalDetailsPromises.get(storeCode);
    }

  
    const portalDetailsPromise = (async () => {
      try {
        let applicationType = ApplicationTypesEnum.WebStore;
        if (portalHeaders.publishState === ZnodePublishStatesEnum.Preview) {
          applicationType = ApplicationTypesEnum.WebstorePreview;
        }

        const cacheInvalidator = new FilterCollection();
        cacheInvalidator.add(
          FilterKeys.CacheTags,
          FilterOperators.Contains,
          generateTagName(
            `${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.GET_PORTAL_APPROVAL_DETAILS_BY_ID}, ${CACHE_KEYS.DYNAMIC_TAG}`,
            storeCode,
            storeCode,
            "PortalApplicationByStoreCode"
          )
        );

        storeCode = !storeCode ? "null" : storeCode;
       
        let portalData = await WebStorePortals_applicationByStoreCode(
          storeCode,
          Number(applicationType),
          portalHeaders.localeCode,
          cacheInvalidator.filterTupleArray as FilterTuple[]
        );

        portalData  = enrichLoginToSeePricingGlobalAttribute(portalData);

       if(portalData && portalData.StoreCode)
       {
          portalDataCache.set(storeCode, portalData);
            const mapped = requiredProperties
          ? mapRequiredPortalValues(portalData, requiredProperties)
          : mapPortalApplicationValues(portalData);
           return mapped;

       }
       else
       {
        logServer.error(AREA.PORTAL, `error in portal getPortalDetails ${Number(applicationType)} with storeCode-${storeCode} and locale code--${portalHeaders.localeCode} with portal response ${JSON.stringify(portalData)}`);
        throw new Error("error in portal response");
       }
       
      } catch (error) {
        logServer.error(AREA.PORTAL, `exception in portal agent ${errorStack(error)}   with portal response ${JSON.stringify(await getPortalHeader())}`);
        portalDetailsPromises.delete(storeCode);
        return {} as IPortalDetail;
      } finally {
        portalDetailsPromises.delete(storeCode);
      }
    })();

    // Cache in-flight promise
    portalDetailsPromises.set(storeCode, portalDetailsPromise);
    return portalDetailsPromise;
  } catch (error) {
    logServer.error(AREA.PORTAL, errorStack(error));
    return {} as IPortalDetail;
  }
}

function enrichLoginToSeePricingGlobalAttribute(
  portalData: WebStorePortalResponse
): WebStorePortalResponse {
  if (!portalData || !portalData.IsBStore) {
    return portalData;
  }

  const attributes = portalData.GlobalAttributes?.Attributes ?? [];

  return {
    ...portalData,
    GlobalAttributes: {
      ...portalData.GlobalAttributes,
      Attributes: [
        ...attributes,
        {
          AttributeCode: PRODUCT.LOGIN_TO_SEE_PRICING_AND_INVENTORY,
          AttributeValue: String(!portalData.IsBStoreShowPricingAndInventory)
        }
      ]
    }
  };
}

/**
 * @description This function fetches portal details including multi-select global attributes.
 */
export async function getPortalDetailsV2(requiredProperties?: any): Promise<IPortalDetail> {
  try {
    const portalHeaders = await getPortalHeader();
        const portalDetailsPromises = (global as any)[globalPromiseMapKey] as Map<string, Promise<any>>;
    const portalDataCache = (global as any)[globalResultCacheKey] as Map<string, WebStorePortalResponse>;
    let storeCode = portalHeaders.storeCode;

    if (!storeCode) {
      const host = headers().get("host");
      const filters = new FilterCollection();
      filters.add(FilterKeys.DomainName, FilterOperators.Contains, String(host));
      const cacheInvalidator = new FilterCollection();
      cacheInvalidator.add(FilterKeys.CacheTags, FilterOperators.Contains, generateCacheKey(CACHE_KEYS.DOMAIN_LIST));

      const domainList = await Domains_domains(
        filters.filterTupleArray as FilterTuple[],
        undefined,
        undefined,
        undefined,
        cacheInvalidator.filterTupleArray as FilterTuple[]
      );

      storeCode = domainList?.Domains?.[0]?.StoreCode || "";
    }

    if (!storeCode) {
      logServer.error(AREA.PORTAL, `error occurred in getPortalDetailsV2 with ${storeCode}  and portal headers ${JSON.stringify(portalHeaders)}`);
    }

    if (portalDataCache.has(storeCode)) {
          const data =  portalDataCache.get(storeCode);
           const mapped = requiredProperties
          ? mapRequiredPortalValues(data, requiredProperties)
          : mapPortalApplicationValues(data);
          return mapped;
    }

    if (portalDetailsPromises.has(storeCode)) {
      return portalDetailsPromises.get(storeCode);
    }

  
    const portalDetailsPromise = (async () => {
      try {
        let applicationType = ApplicationTypesEnum.WebStore;
        if (portalHeaders.publishState === ZnodePublishStatesEnum.Preview) {
          applicationType = ApplicationTypesEnum.WebstorePreview;
        }

        const cacheInvalidator = new FilterCollection();
        cacheInvalidator.add(
          FilterKeys.CacheTags,
          FilterOperators.Contains,
          generateTagName(
            `${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.GET_PORTAL_APPROVAL_DETAILS_BY_ID}, ${CACHE_KEYS.DYNAMIC_TAG}`,
            storeCode,
            storeCode,
            "PortalApplicationByStoreCode"
          )
        );

        storeCode = !storeCode ? "null" : storeCode;
        const portalData = await WebStorePortals_V2_1_applicationByStoreCode(
          storeCode,
          Number(applicationType),
          portalHeaders.localeCode,
          cacheInvalidator.filterTupleArray as FilterTuple[]
        );

        
      if(!portalData || ! portalData.StoreCode)
      {
        logServer.error(AREA.PORTAL, `error in portal getPortalDetailsV2 ${Number(applicationType)} with storeCode-${storeCode} and locale code--${portalHeaders.localeCode} with portal response ${JSON.stringify(portalData)}`);
      }

      portalDataCache.set(storeCode, portalData);
      
        const mapped = requiredProperties
          ? mapRequiredPortalValues(portalData, requiredProperties)
          : mapPortalApplicationValues(portalData);

        portalDataCache.set(storeCode, mapped);
        return mapped;
      } catch (error) {
        logServer.error(AREA.PORTAL, ` exception in portal agent ${errorStack(error)}  with portal response ${JSON.stringify(await getPortalHeader())}`);
        return {} as IPortalDetail;
      } finally {
        portalDetailsPromises.delete(storeCode);
      }
    })();

    portalDetailsPromises.set(storeCode, portalDetailsPromise);
    return portalDetailsPromise;
  } catch (error) {
    logServer.error(AREA.PORTAL, errorStack(error));
    return {} as IPortalDetail;
  }
}

export async function getSchemaDetails() {
  const schemaDetails = await getPortalDetails();
  if (schemaDetails) {
    const { storeName, websiteLogo, customerServicePhoneNumber, customerServiceEmail } = schemaDetails;
    const schemaInfo = {
      storeName,
      websiteLogo,
      customerServicePhoneNumber,
      customerServiceEmail,
    } as ISchemaDetails;
    return schemaInfo;
  }
  return {} as ISchemaDetails;
}
