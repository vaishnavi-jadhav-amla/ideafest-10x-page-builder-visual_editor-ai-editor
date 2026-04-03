import { AREA, errorStack, logServer } from "@znode/logger/server";
import { CommerceCollectionClassDetailResponseModel, CostFactorResponse } from "packages/clients/src/types/interface";
import { CommerceCollections_classDetailsByClassType, CommerceCollections_listByClassType, Payments_paymentTransactionHistoryByClassNumber } from "@znode/clients/cp";
import { ExpandCollection, ExpandKeys, FilterCollection, FilterKeys, FilterOperators, convertCamelCase, convertPascalCase } from "@znode/utils/server";
import { IOrder, IOrderDetails, IOrderLineItem, IOrderSearchByKey, IOrderSort, IOrdersList, IOrdersResponse } from "@znode/types/account";
import { Order_getOrderReceiptByOrderId, RMAConfiguration_getReasonForReturnList, RMAReturn_isOrderEligibleForReturn } from "@znode/clients/v1";
import { mapToOrdersList, mappedOrderDetails } from "./mapper";

import { IFilterTuple } from "@znode/types/filter";
import { IQuoteModel } from "@znode/types/quote";
import { PRODUCT_TYPE } from "@znode/constants/product";
import { getGeneralSettingList } from "../../general-setting";
import { getPortalDetails } from "../../portal/portal";
import { getSavedUserSession } from "@znode/utils/common";
import { isQuoteValidForConvertToOrder } from "./order-helper";
import { mappedCartItems } from "../../cart/mapper";
import { validateOrderNumber } from "../return-order/return-order";

//Get order history list.
export async function orderHistory(
  accountId: string | null,
  pageSize: number,
  pageIndex: number,
  isEnableReturnRequest = false,
  sortValue?: IOrderSort,
  searchByKey?: IOrderSearchByKey[]
): Promise<IOrdersResponse> {
  try {
    const session = await getSavedUserSession();
    const userId: number = session?.userId ?? 0;
    // filter support for status, date and account
    const filters: IFilterTuple[] = getFilters(userId, searchByKey as [IOrderSearchByKey], accountId);
    const generalSetting = await getGeneralSettingList();
    const orderList = await CommerceCollections_listByClassType("Orders", convertPascalCase(filters), sortValue, pageIndex, pageSize);

    const { PaginationDetail = {}, CollectionDetails = [] } = orderList || {};
    const { PageIndex, PageSize, TotalResults, TotalPages } = PaginationDetail;

    const mappedOrdersList: IOrdersList[] = (convertCamelCase(CollectionDetails) as IOrder[]).map((order: IOrder) => {
      return mapToOrdersList(order, generalSetting);
    });

    const orderData = {
      orders: mappedOrdersList,
      isEnableReturnRequest: isEnableReturnRequest,
      pageIndex: PageIndex,
      pageSize: PageSize,
      totalResults: TotalResults,
      totalPages: TotalPages,
    };
    return orderData as IOrdersResponse;
  } catch (error) {
    logServer.error(AREA.ORDER, errorStack(error));
    return {
      orders: [] as IOrdersList[],
      pageIndex: 1,
      pageSize: 0,
      totalResults: 0,
      totalPages: 0,
    } as IOrdersResponse;
  }
}

//Get the order details

function getAttributeValues(attributeKeys: string, AttributesArray: CostFactorResponse[] | undefined) {
  if (AttributesArray && AttributesArray.length > 0) {
    let value = "";
    for (const obj of AttributesArray) {
      if (obj.Name === attributeKeys) {
        value = obj.Value || "";
        break;
      }
    }
    return value;
  } else {
    return "";
  }
}

export async function getOrder(orderNumber: string) {
  try {
    const portalData = await getPortalDetails();

    const generalSetting = await getGeneralSettingList();
    const commerceCollectionClassDetail = (await CommerceCollections_classDetailsByClassType("Orders", orderNumber)) as CommerceCollectionClassDetailResponseModel;

    if (commerceCollectionClassDetail?.LineItemDetails) {
      commerceCollectionClassDetail.LineItemDetails = mappedCartItems(convertCamelCase(commerceCollectionClassDetail.LineItemDetails));
    }
    const paymentHistoryList = convertCamelCase(await Payments_paymentTransactionHistoryByClassNumber(orderNumber));
    commerceCollectionClassDetail.EnableConvertToOrder = isQuoteValidForConvertToOrder(commerceCollectionClassDetail as IQuoteModel);
    const detail = convertCamelCase(commerceCollectionClassDetail);
    const summary = convertCamelCase({
      Total: commerceCollectionClassDetail?.Total,
      SubTotal: commerceCollectionClassDetail?.SubTotal,
      ImportDuty: getAttributeValues("ImportDuty", commerceCollectionClassDetail?.CostFactorResponse),
      TaxCost: getAttributeValues("TaxCost", commerceCollectionClassDetail?.CostFactorResponse),
      ShippingCost: getAttributeValues("ShippingCost", commerceCollectionClassDetail?.CostFactorResponse),
      CSRDiscount: getAttributeValues("CSRDiscount", commerceCollectionClassDetail?.CostFactorResponse),
      HandlingFee: getAttributeValues("HandlingFee", commerceCollectionClassDetail?.CostFactorResponse),
      TotalDiscount: Number(getAttributeValues("TotalDiscount", commerceCollectionClassDetail?.CostFactorResponse) || 0),
      ShippingDiscount: getAttributeValues("ShippingDiscount", commerceCollectionClassDetail?.CostFactorResponse),
      GiftCardAmount: Number(getAttributeValues("VoucherAmount", commerceCollectionClassDetail?.CostFactorResponse) || 0),
      TaxSummaryList: (() => {
        const taxList = getAttributeValues("TaxSummaryList", commerceCollectionClassDetail?.CostFactorResponse);
        try {
          return taxList && taxList.trim() !== "" ? JSON.parse(taxList) : [];
        } catch {
          return [];
        }
      })(),
    });
    if (!detail?.hasError) {
      const orderDetailsData = mappedOrderDetails(detail, summary, portalData, generalSetting, paymentHistoryList?.paymentHistory);
      return {
        ...orderDetailsData,
        isOrderEligibleForReturn: (await validateOrderNumber(orderDetailsData.classNumber ?? "", orderDetailsData.statusCode ?? "")).isSuccess,
        priceRoundOff: generalSetting.priceRoundOff,
      };
    } else {
      throw new Error("Order Number is incorrect.");
    }
  } catch (error) {
    logServer.error(AREA.ORDER, errorStack(error));
    return null;
  }
}

function getFilters(userId: number, searchBy?: [{ key: string; value: string; type: string; columns: { status: string; date: string } }], accountId: string | null) {
  const filters: FilterCollection = new FilterCollection();
  if (userId > 0) {
    filters.add(FilterKeys.UserId, FilterOperators.Equals, userId.toString());
    accountId && filters.add(FilterKeys.AccountId, FilterOperators.Equals, accountId || "");
  }

  if (searchBy && searchBy.length > 0) {
    searchBy.forEach((val) => {
      filters.add(val?.type === "status" ? val?.columns?.status : val?.columns?.date, String(val?.key), String(val?.value));
    });
  }
  return filters.filterTupleArray;
}

export async function getOrderExpands() {
  const expands = new ExpandCollection();
  expands.add(ExpandKeys.ZnodeOmsOrderLineItems);
  expands.add(ExpandKeys.Store);
  expands.add(ExpandKeys.ZnodePaymentType);
  expands.add(ExpandKeys.ZnodePaymentSetting);
  expands.add(ExpandKeys.ZnodeOmsOrderState);
  expands.add(ExpandKeys.ZnodeShipping);
  expands.add(ExpandKeys.IsFromOrderReceipt);
  expands.add(ExpandKeys.PortalTrackingPixel);
  expands.add(ExpandKeys.IsWebStoreOrderReceipt);
  return expands;
}

//Check if the order is eligible for return
export async function isOrderEligibleForReturn(orderNumber: string, portalId: number) {
  try {
    if (orderNumber !== undefined) {
      const session = await getSavedUserSession();
      const userId = session?.userId ?? 0;

      if (userId > 0) {
        return (await RMAReturn_isOrderEligibleForReturn(userId, portalId, orderNumber))?.IsSuccess;
      } else {
        return false;
      }
    }
    return false;
  } catch (error) {
    logServer.error(AREA.ORDER, errorStack(error));
    return false;
  }
}

//Bind Reason For Return
export async function getReasonList() {
  try {
    const filters = new FilterCollection();
    filters.add(FilterKeys.IsActive, FilterOperators.Equals, FilterKeys.ActiveTrueValue);
    const sort: { [key: string]: string } = { Name: "ASC" };
    const reasonList = await RMAConfiguration_getReasonForReturnList(undefined, filters.filterTupleArray, sort, undefined, undefined);
    if (reasonList.RequestStatusList !== null && reasonList.RequestStatusList.length > 0) {
      const responseData = reasonList.RequestStatusList.map((item: { RmaReasonCode: string; Reason: string }) => {
        const { RmaReasonCode, Reason } = item;
        return {
          reasonCode: RmaReasonCode,
          reason: Reason,
        };
      });
      return responseData;
    } else {
      return [];
    }
  } catch (error) {
    logServer.error(AREA.ORDER, errorStack(error));
    return [];
  }
}

export async function orderCheckoutReceipt(orderId: number): Promise<IOrderDetails | null> {
  try {
    if (orderId) {
      const order = await Order_getOrderReceiptByOrderId(orderId);
      const orderResponse = convertCamelCase(order);
      if (orderResponse.order) {
        const orderLineItemList = createSingleOrderLineItem(orderResponse.order);
        orderResponse.order.orderLineItems = orderLineItemList;
      }
      return orderResponse.order;
    } else {
      return null;
    }
  } catch (error) {
    logServer.error(AREA.ORDER, errorStack(error));
    return null;
  }
}

export function createSingleOrderLineItem(order: IOrderDetails) {
  const childLineItems = order.orderLineItems?.filter((x) => x.parentOmsOrderLineItemsId !== null);
  const bundleLineItems = order.orderLineItems?.filter((x) => x.productType === PRODUCT_TYPE.BUNDLE_PRODUCT);
  const orderLineItemList: IOrderLineItem[] = [];
  if (bundleLineItems) {
    bundleLineItems.forEach((lineItem) => {
      const bundleLineItem = order.orderLineItems?.find((x) => x.sku === lineItem?.sku);
      if (bundleLineItem) childLineItems?.push(bundleLineItem);
    });
    if (childLineItems) {
      childLineItems.forEach((childLineItem) => {
        childLineItem.personaliseValueList = order.orderLineItems?.find((oli) => oli.omsOrderLineItemsId === childLineItem.parentOmsOrderLineItemsId)?.personaliseValueList;
        orderLineItemList.push(childLineItem);
      });
    }
  }
  return orderLineItemList;
}
