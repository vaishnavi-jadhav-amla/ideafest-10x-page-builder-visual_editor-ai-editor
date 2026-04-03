import { AREA, errorStack, logServer } from "@znode/logger/server";

import { Accounts_ordersByAccountCode } from "packages/clients/src/znode-client/commerce/orders";
import { FilterTuple } from "@znode/clients/v2";
import { IAccountOrdersList } from "@znode/types/account/account-orders";
import { IFilterTuple } from "@znode/types/filter";
import { IOrder } from "@znode/types/account";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { convertCamelCase } from "@znode/utils/server";
import { convertDateTime } from "@znode/utils/component";
import { getGeneralSettingList } from "../../general-setting";
import { getSavedUserSession } from "@znode/utils/common";
import { getUserFilters } from "../../common/common";
import { getPortalDetails } from "../../portal/portal";
import { CART_PORTAL_FLAGS } from "@znode/constants/cart";

/**
 * Get the order details.
 * @param userId
 * @param accountId
 * @returns Address List
 */
export async function getAccountUserOrderList(
  orderType: string,
  userId: number,
  pageSize?: number,
  pageIndex?: number,
  sortValue?: { [key: string]: string },
  searchByKey?: { key: string; value: string; type: string; columns: { status: string; date: string } }[]
): Promise<IAccountOrdersList | null> {
  try {
    const user = await getSavedUserSession();
    const accountId = user?.accountId;
    const filters: IFilterTuple[] = getUserFilters(undefined, undefined, userId ? userId : undefined, undefined, undefined, undefined, searchByKey,accountId);
    const orderResponse = await Accounts_ordersByAccountCode(ORDER_DATA_TYPE.ORDER, filters as FilterTuple[], sortValue, pageIndex, pageSize);
    const orderDetails = convertCamelCase(orderResponse);
    const accountOrderListResponse: IAccountOrdersList = {
      orderList: [],
      pageIndex: orderDetails.paginationDetail.pageIndex,
      pageSize: orderDetails.paginationDetail.pageSize,
      totalPages: orderDetails.paginationDetail.totalPages,
      totalResults: orderDetails.paginationDetail.totalResults,
    };
    if (!orderDetails || !orderDetails.collectionDetails || orderDetails.collectionDetails.length === 0) {
      return accountOrderListResponse;
    }
    const generalSetting = await getGeneralSettingList();
    const portalData = await getPortalDetails();
    const orderListData = orderDetails.collectionDetails.map((order: IOrder) => {
      return {
        orderNumber: order.classNumber,
        userName: order.customerName,
        orderState: order.classStatus,
        paymentStatus: order.paymentStatus,
        paymentType: order.paymentName,
        total: order.total,
        orderDate: convertDateTime(order.orderDate as string, generalSetting?.dateFormat, generalSetting?.timeFormat, generalSetting?.displayTimeZone),
        currencyCode: portalData?.currencyCode || CART_PORTAL_FLAGS.UNITED_STATES_SUFFIX,
        omsOrderId: order.omsOrderId,
      };
    });

    return {
      orderList: orderListData,
      pageIndex: orderDetails.paginationDetail.pageIndex,
      pageSize: orderDetails.paginationDetail.pageSize,
      totalPages: orderDetails.paginationDetail.totalPages,
      totalResults: orderDetails.paginationDetail.totalResults,
    };
  } catch (error) {
    logServer.error(AREA.ACCOUNT, errorStack(error));
    return {
      orderList: [],
      pageIndex: 0,
      pageSize: 0,
      totalPages: 0,
      totalResults: 0,
    };
  }
}
