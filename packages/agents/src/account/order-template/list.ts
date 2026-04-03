import { getGeneralSettingList } from "../../general-setting";
import { CLASSTYPE } from "@znode/constants/checkout";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IOrderTemplateCollectionDetails, IOrderTemplateList } from "@znode/types/account/order-templates";
import { convertDate } from "@znode/utils/component";
import { FilterCollection, FilterKeys, FilterOperators, convertCamelCase, convertPascalCase } from "@znode/utils/server";
import { CommerceCollections_listByClassType } from "@znode/clients/cp";

export async function getOrderTemplateList(
  userId?: number,
  pageSize?: number,
  pageIndex?: number,
  sortValue?: { [key: string]: string },
  searchByKey?: [{ key: string; value: string; type: string; columns: { status: string; date: string } }]
): Promise<IOrderTemplateList> {
  if (!userId) {
    return handleGetOrderTemplateListFailure();
  }

  try {
    const filters = getFilters(userId, searchByKey);
    const formattedFilters = convertPascalCase(filters);

    const response = await CommerceCollections_listByClassType(CLASSTYPE.ORDER_TEMPLATE, formattedFilters, sortValue, pageIndex, pageSize);
    const formattedData = response ? convertCamelCase(response) : handleGetOrderTemplateListFailure();

    const orderTemplateList: IOrderTemplateList = {
      paginationDetail: formattedData.paginationDetail,
      collectionDetails: await mapCollectionDetails(formattedData.collectionDetails),
    };

    return orderTemplateList;
  } catch (error) {
    logServer.error(AREA.ORDER_TEMPLATES, errorStack(error));
    return { collectionDetails: undefined } as IOrderTemplateList;
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

export function handleGetOrderTemplateListFailure() {
  logServer.error(AREA.ORDER_TEMPLATES, "Failed to get order template list.");
  return { collectionDetails: undefined } as IOrderTemplateList;
}

async function mapCollectionDetails(collectionDetails: IOrderTemplateCollectionDetails[]) {
  const generalSetting = await getGeneralSettingList();

  return collectionDetails.map((detail) => ({
    quantity: detail.quantity,
    createdDate: convertDate(detail.createdDate || "", generalSetting?.dateFormat, generalSetting?.displayTimeZone),
    modifiedDate: convertDate(detail.modifiedDate || "", generalSetting?.dateFormat, generalSetting?.displayTimeZone),
    classNumber: detail.classNumber,
    className: detail.className,
  }));
}
