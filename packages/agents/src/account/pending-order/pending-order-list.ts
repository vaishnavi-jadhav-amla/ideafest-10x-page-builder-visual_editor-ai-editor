import { getGeneralSettingList } from "../../general-setting";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { ICollectionDetails, IPendingOrderList } from "@znode/types/account";
import { IFilterTuple } from "@znode/types/filter";
import { convertDate } from "@znode/utils/component";
import { convertCamelCase, convertPascalCase, FilterCollection, FilterKeys, FilterOperators } from "@znode/utils/server";
import { PENDING_APPROVAL_STATUS } from "@znode/constants/pending-order";
import { CommerceCollections_listByClassType } from "@znode/clients/cp";
import { ORDER_DATA_TYPE } from "@znode/constants/order";

export async function getPendingOrderList(
  status: string,
  pageSize?: number,
  pageIndex?: number,
  sortValue?: { [key: string]: string },
  searchByKey?: { key: string; value: string; type: string; columns: { status: string; date: string } }[]
) {
  try {
    const filters = getFilters(searchByKey, status);
    const orderList = await CommerceCollections_listByClassType(ORDER_DATA_TYPE.APPROVAL_ROUTING, convertPascalCase(filters), sortValue, pageIndex, pageSize);

    if (!orderList) {
      return {
        collectionDetails: [],
        totalResults: 0,
      } as IPendingOrderList;
    }
    const pendingOrderListData = convertCamelCase(orderList);

    const generalSetting = await getGeneralSettingList();

    const formatOrder = (order: ICollectionDetails) => ({
      createdDate: convertDate(order?.createdDate || "", generalSetting?.dateFormat, generalSetting?.displayTimeZone),
      classNumber: order.classNumber,
      className: order.className,
      classStatus: order.classStatus,
      orderType: order.orderType,
      total: order.total,
      customerName: order.customerName,
      accountName: order.accountName,
      cultureCode: order.currencyCode,
    });

    const orderListData = pendingOrderListData?.collectionDetails?.map(formatOrder);

    const pendingOrderList = {
      collectionDetails: orderListData,
      totalResults: pendingOrderListData?.paginationDetail?.totalResults,
    };

    return pendingOrderList;
  } catch (error) {
    logServer.error(AREA.PENDING_ORDER, errorStack(error));
    return {
      collectionDetails: [],
      totalResults: 0,
    } as IPendingOrderList;
  }
}

export function getFilters(
  searchBy?: {
    key: string;
    value: string;
    type: string;
    columns: { status: string; date: string };
  }[],
  status?: string
): IFilterTuple[] {
  const filters: FilterCollection = new FilterCollection();
  if (status === PENDING_APPROVAL_STATUS.PENDING_ORDER || status === PENDING_APPROVAL_STATUS.PENDING_PAYMENT)
    filters.add(FilterKeys.StatusCode, FilterOperators.Equals, String(status));

  if (searchBy && searchBy.length > 0) {
    searchBy.forEach((val) => {
      filters.add(val?.type !== "Date" ? val?.columns?.status : val?.columns?.date, String(val?.key), val?.value);
    });
  }
  return filters.filterTupleArray;
}
