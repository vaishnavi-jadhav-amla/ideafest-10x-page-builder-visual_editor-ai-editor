import { AREA, errorStack, logServer } from "@znode/logger/server";
import { CalculateReturnLineItemRequestModel, CostFactorResponse } from "packages/clients/src/types/interface";
import { CommerceCollections_listByClassType, CommerceCollections_v1ByClassType, Returns_calculateReturn, Returns_eligibleOrders } from "@znode/clients/cp";
import { FilterCollection, FilterKeys, FilterOperators, convertCamelCase } from "@znode/utils/server";
import { IReturnCalculateRequestModel, IReturnCalculateResponse } from "@znode/types/order";

import { CLASSTYPE } from "@znode/constants/checkout";
import { IFilterTuple } from "@znode/types/filter";
import { IPortalDetail } from "@znode/types/portal";
import { IReturnHistoryResponse } from "@znode/types/account";
import { convertDate } from "@znode/utils/component";
import { getGeneralSettingList } from "../../general-setting";
import { getSavedUserSession } from "@znode/utils/common";

export async function getReturnList(
  pageSize: number,
  pageIndex: number,
  sortValue: { [key: string]: string },
  searchByKey: [{ key: string; value: string; type: string; columns: { status: string; date: string } }],
  portalData: IPortalDetail
): Promise<IReturnHistoryResponse> {
  try {
    const portalId = portalData.portalId;
    const session = await getSavedUserSession();
    const userId: number = session?.userId || 0;
    const filters: IFilterTuple[] = await returnFilters(userId, portalId, searchByKey);
    const returnList = await CommerceCollections_listByClassType("Returns", filters, sortValue, pageIndex, pageSize);

    const returnOrderList = convertCamelCase(returnList);
    const { totalResults } = returnOrderList.paginationDetail || {};

    const generalSetting = await getGeneralSettingList();
    const { dateFormat, displayTimeZone } = generalSetting || {};

    const returnsData = returnOrderList?.collectionDetails?.map(
      (returnOrder: { classNumber: number; quantity: number; classStatus: string; orderDate: string; linkedClassNumber: string; statusCode: string }) => {
        const { classNumber, quantity, classStatus, orderDate, linkedClassNumber, statusCode } = returnOrder;

        const formattedReturnDate = convertDate(orderDate, dateFormat, displayTimeZone);

        return {
          returnNumber: classNumber,
          totalExpectedReturnQuantity: quantity,
          returnStatus: statusCode,
          returnName: classStatus ? classStatus : "",
          returnDate: formattedReturnDate,
          linkedClassNumber,
        };
      }
    );

    return { totalResults, returnList: returnsData || [] };
  } catch (error) {
    logServer.error(AREA.RETURN_ORDER, errorStack(error));
    return {
      totalResults: 0,
      returnList: [],
    };
  }
}

export async function returnFilters(userId: number, portalId?: number, searchBy?: [{ key: string; value: string; type: string; columns: { status: string; date: string } }]) {
  const filters: FilterCollection = new FilterCollection();
  if (userId !== undefined && userId > 0) filters.add(FilterKeys.UserId, FilterOperators.Equals, userId.toString());
  if (portalId !== undefined && portalId > 0) filters.add(FilterKeys.PortalId, FilterOperators.Equals, portalId.toString());
  if (searchBy && searchBy.length > 0) {
    searchBy.forEach((val) => {
      filters.add(val?.type === "status" ? val?.columns?.status : val?.columns?.date, String(val?.key), String(val?.value));
    });
  }
  return filters.filterTupleArray;
}

export const getReturnOrderCalculationDetails = async (returnOrder: IReturnCalculateRequestModel): Promise<IReturnCalculateResponse | null> => {
  try {
    const payload = {
      ClassNumber: returnOrder.classNumber as string,
      ReturnCalculateLineItem: [] as CalculateReturnLineItemRequestModel[],
    };
    if (returnOrder.returnCalculateLineItem && returnOrder.returnCalculateLineItem.length === 0) {
      return null;
    }
    if (payload.ReturnCalculateLineItem) {
      payload.ReturnCalculateLineItem = returnOrder.returnCalculateLineItem?.map((item) => ({
        LineItemId: String(item.lineItemId),
        ExpectedReturnQuantity: Number(item.expectedReturnQuantity ?? 0),
        ConfirmedQuantity: Number(item.confirmedQuantity ?? 0),
        IsShippingReturn: (item.isShippingReturn as boolean) || false,
      })) as CalculateReturnLineItemRequestModel[];
    }

    const calculateReturnOrder = await Returns_calculateReturn(payload);
    if (!calculateReturnOrder) {
      return null;
    }
    const calculationDetails = calculateReturnOrder.CostFactorDetails as CostFactorResponse[];
    const calculateInfo = {
      returnSubTotal: Number(getAttributeValues("ReturnSubTotal", calculationDetails) || 0),
      returnTaxCost: Number(getAttributeValues("ReturnTaxCost", calculationDetails) || 0),
      returnShippingCost: Number(getAttributeValues("ReturnShippingCost", calculationDetails) || 0),
      discount: Number(getAttributeValues("Discount", calculationDetails) || 0),
      csrDiscount: Number(getAttributeValues("CSRDiscount", calculationDetails) || 0),
      returnShippingDiscount: Number(getAttributeValues("ReturnShippingDiscount", calculationDetails) || 0),
      returnCharges: Number(getAttributeValues("ReturnCharges", calculationDetails) || 0),
      returnTotal: Number(getAttributeValues("ReturnTotal", calculationDetails) || 0),
    };
    return calculateInfo;
  } catch {
    return null;
  }
};

export async function deleteReturnOrder(classNumber: string) {
  try {
    if (!classNumber) return handleReturnOrderDeleteFailure();
    const deletedResponse = await CommerceCollections_v1ByClassType(CLASSTYPE.RETURNS, classNumber);
    const deletedResponseData = deletedResponse.DeletedItems?.some((item) => item.ClassNumber === classNumber && item.IsSuccess);
    if (deletedResponseData) {
      return deletedResponseData;
    }
    return false;
  } catch (error) {
    logServer.error(AREA.RETURN_ORDER, errorStack(error));
    return false;
  }
}
export async function getEligibleOrderList() {
  try {
    const orderListResponse = await Returns_eligibleOrders(undefined, undefined, undefined, undefined);
    if (orderListResponse && orderListResponse.EligibleOrdersDetailListResponseModel && orderListResponse.EligibleOrdersDetailListResponseModel.length > 0) {
      return orderListResponse.EligibleOrdersDetailListResponseModel.map((item) => ({ code: item.ClassNumber }));
    }
    return [];
  } catch (error) {
    logServer.error(AREA.RETURN_ORDER, errorStack(error));
    return [];
  }
}

export function handleReturnOrderDeleteFailure() {
  logServer.error(AREA.RETURN_ORDER, "Failed to delete return order.");
  return false;
}

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