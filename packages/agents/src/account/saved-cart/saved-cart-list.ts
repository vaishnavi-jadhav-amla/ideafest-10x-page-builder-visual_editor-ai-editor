import { getGeneralSettingList } from "../../general-setting";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { convertDate } from "@znode/utils/component";
import { FilterCollection, FilterKeys, FilterOperators, convertCamelCase, convertPascalCase } from "@znode/utils/server";
import { CommerceCollections_listByClassType } from "@znode/clients/cp";
import { ISavedCartCollectionDetails, ISavedCartList } from "@znode/types/account";
import { CLASSTYPE } from "@znode/constants/checkout";

/**
 * get saved cart.
 * @returns list of saved cart
 */
export async function getSavedCart(userId: number) {
  try {
    return await getSavedCartList(userId);
  } catch (error) {
    logServer.error(AREA.SAVED_CART, errorStack(error));
    return {} as ISavedCartList;
  }
}

export async function getSavedCartList(
  userId: number,
  pageSize?: number,
  pageIndex?: number,
  sortValue?: { [key: string]: string },
  searchByKey?: [{ key: string; value: string; type: string; columns: { status: string; date: string } }]
): Promise<ISavedCartList> {
  if (!userId) {
    return handleGetSavedCartListFailure();
  }

  try {
    const filters = getFilters(userId, searchByKey);
    const formattedFilters = convertPascalCase(filters);

    const savedCartListResponse = await CommerceCollections_listByClassType(CLASSTYPE.SAVED_CARTS, formattedFilters, sortValue, pageIndex, pageSize);
    const formattedData = savedCartListResponse ? convertCamelCase(savedCartListResponse) : handleGetSavedCartListFailure();

    const savedCartList: ISavedCartList = {
      paginationDetail: formattedData.paginationDetail,
      collectionDetails: await mapCollectionDetails(formattedData.collectionDetails),
    };

    return savedCartList;
  } catch (error) {
    logServer.error(AREA.SAVED_CART, errorStack(error));
    return { collectionDetails: undefined } as ISavedCartList;
  }
}

export function getFilters(userId: number, searchBy?: [{ key: string; value: string; type: string; columns: { status: string; date: string } }]) {
  const filters: FilterCollection = new FilterCollection();
  if (userId > 0) filters.add(FilterKeys.UserId, FilterOperators.Equals, userId.toString());

  if (searchBy && searchBy.length > 0) {
    searchBy.forEach((val) => {
      filters.add(val?.type === "status" ? val?.columns?.status : val?.columns?.date, String(val?.key), String(val?.value));
    });
  }
  return filters.filterTupleArray;
}

export function handleGetSavedCartListFailure() {
  logServer.error(AREA.SAVED_CART, "Failed to get saved cart list.");
  return { collectionDetails: undefined } as ISavedCartList;
}

async function mapCollectionDetails(collectionDetails: ISavedCartCollectionDetails[]) {
  const generalSetting = await getGeneralSettingList();

  return collectionDetails.map((detail) => ({
    quantity: detail.quantity,
    createdDate: convertDate(detail.createdDate || "", generalSetting?.dateFormat, generalSetting?.displayTimeZone) || "",
    modifiedDate: convertDate(detail.modifiedDate || "", generalSetting?.dateFormat, generalSetting?.displayTimeZone) || "",
    classNumber: detail.classNumber,
    className: detail.className,
  }));
}
