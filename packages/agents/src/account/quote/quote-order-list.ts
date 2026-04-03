import { AREA, errorStack, logServer } from "@znode/logger/server";
import { FilterCollection, FilterKeys, FilterOperators, convertCamelCase } from "@znode/utils/server";

import { convertDate } from "@znode/utils/component";
import { getGeneralSettingList } from "../../general-setting";
import { CommerceCollections_listByClassType } from "@znode/clients/cp";
import { ORDER_DATA_TYPE } from "@znode/constants/order";

export async function getUserQuoteList(
  accountId: string,
  userId: number,
  pageSize: number,
  pageIndex: number,
  sortValue: { [key: string]: string },
  searchByKey?: [{ key: string; value: string; type: string; columns: { status: string; date: string } }]
) {
  try {
    const filters = getFilters(accountId, userId, searchByKey);
    const quoteList = await CommerceCollections_listByClassType(ORDER_DATA_TYPE.QUOTE, filters, sortValue, pageIndex, pageSize);
    const quoteListData = convertCamelCase(quoteList);
    const generalSetting = await getGeneralSettingList();
    const quoteHistoryList = {
      ...quoteListData,
      collectionDetails: quoteListData?.collectionDetails?.map((quote: { expirationDate: string; createdDate: string }) => ({
        ...quote,
        expirationDate: convertDate(quote?.expirationDate, generalSetting?.dateFormat, generalSetting?.displayTimeZone),
        createdDate: convertDate(quote?.createdDate, generalSetting?.dateFormat, generalSetting?.displayTimeZone),
        totalResults: quoteListData?.paginationDetails?.totalResults,
      })),
    };
    if (quoteHistoryList) return quoteHistoryList;
    else return {};
  } catch (error) {
    logServer.error(AREA.QUOTE, errorStack(error));
    return {};
  }
}

function getFilters(accountId: string, userId: number, searchBy?: [{ key: string; value: string; type: string; columns: { status: string; date: string } }]) {
  const filters: FilterCollection = new FilterCollection();
  if (userId > 0) {
    filters.add(FilterKeys.UserId, FilterOperators.Equals, userId.toString());
    accountId && filters.add(FilterKeys.AccountId, FilterOperators.Equals, accountId);
  }

  if (searchBy && searchBy.length > 0) {
    searchBy.forEach((val) => {
      filters.add(val?.type == "status" ? val?.columns?.status : val?.columns?.date, String(val?.key), String(val?.value));
    });
  }
  return filters.filterTupleArray;
}
