import { IFilterTuple } from "@znode/types/filter";
import { IStoreList, IStoreLocator, IStoreLocatorFilter, IStoreRadius } from "@znode/types/store-locator";
import { convertCamelCase, convertPascalCase, FilterCollection, FilterKeys, FilterOperators } from "@znode/utils/server";
import { FilterTuple, WebStoreLocatorResponse } from "@znode/clients/v1";
import { WebStoreLocator_list } from "@znode/clients/v2";
import { AREA, errorStack, logServer } from "@znode/logger/server";

export async function getStores(portalId: number): Promise<IStoreLocator> {
  const radiusList: IStoreRadius[] | [] = getDistances();
  const storeLocatorFilterData: IStoreLocatorFilter = {
    city: "",
    state: "",
    postalCode: "",
    radiusList,
    portalId: portalId,
  };
  try {
    const portalData = await getPortalList(storeLocatorFilterData);
    const portalDataConfig: IStoreList[] = convertCamelCase(portalData?.StoreLocatorList || []);
    const filteredPortalData = portalDataConfig.map((val) => {
      return {
        mapQuestURL: val.mapQuestURL,
        stateName: val.stateName,
        cityName: val.cityName,
        address1: val.address1,
        phoneNumber: val.phoneNumber,
        storeName: val.storeName,
        postalCode: val.postalCode,
        storeLocatorList: val.storeLocatorList,
        countryName: val.countryName,
        latitude: val.latitude,
        longitude: val.longitude,
        storeLocationCode: val.storeLocationCode,
      };
    });

    return {
      city: storeLocatorFilterData.city,
      state: storeLocatorFilterData.state,
      postalCode: storeLocatorFilterData.postalCode,
      stores: portalData ? filteredPortalData : [],
      radiusList: getDistances(),
    };
  } catch (error) {
    logServer.error(AREA.STORE, errorStack(error));
    return {
      city: storeLocatorFilterData.city,
      state: storeLocatorFilterData.state,
      postalCode: storeLocatorFilterData.postalCode,
      stores: [],
      radiusList: getDistances(),
    };
  }
}

function getDistances(): IStoreRadius[] {
  const distanceDictionary = getDistanceDictionary();
  const convertedArray: IStoreRadius[] = Object.keys(distanceDictionary).map(
    (key) =>
      ({
        text: distanceDictionary[key],
        value: key,
        selected: key === "0", // Change the condition here if you want to set a different key as selected
      } as IStoreRadius)
  );

  return convertedArray;
}

/**
 * Provides a dictionary of distances.
 * @returns A promise that resolves to an object containing distance key-value pairs.
 */
function getDistanceDictionary(): { [key: string]: string } {
  return {
    "5": "5 Miles",
    "10": "10 Miles",
    "25": "25 Miles",
    "50": "50 Miles",
    "75": "75 Miles",
    "100": "100 Miles",
  };
}

async function getPortalList(storeLocatorFilter: IStoreLocatorFilter): Promise<WebStoreLocatorResponse> {
  const sortCollection = { displayOrder: "asc" };
  const filters: FilterTuple[] = getFiltersForStoreLocators(storeLocatorFilter);
  return await WebStoreLocator_list(convertPascalCase(filters), sortCollection);
}

function getFiltersForStoreLocators(storeLocatorFilters: IStoreLocatorFilter): IFilterTuple[] {
  const filters: FilterCollection = new FilterCollection();

  if (storeLocatorFilters.portalId) {
    filters.add(FilterKeys.PortalId, FilterOperators.Equals, storeLocatorFilters.portalId.toString());
  }

  filters.add(FilterKeys.IsActive, FilterOperators.Is, "true");

  if (storeLocatorFilters.postalCode) {
    filters.add(FilterKeys.PostalCode, FilterOperators.Is, sanitizeInput(storeLocatorFilters.postalCode));
  }

  if (storeLocatorFilters.city) {
    filters.add(FilterKeys.CityName, FilterOperators.Is, sanitizeInput(storeLocatorFilters.city));
  }

  if (storeLocatorFilters.state) {
    filters.add(FilterKeys.StateName, FilterOperators.Is, sanitizeInput(storeLocatorFilters.state));
  }
  return filters.filterTupleArray;
}

/**
 * Sanitizes input by escaping single quotes to prevent SQL injection.
 * @param input The input string to sanitize.
 * @returns The sanitized input string.
 */
function sanitizeInput(input: string): string {
  return input.replace("'", "''");
}
