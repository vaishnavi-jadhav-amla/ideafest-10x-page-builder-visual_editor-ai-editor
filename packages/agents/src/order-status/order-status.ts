import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IOrderStatusDetail, IOrderStatusRequest } from "@znode/types/order-status";
import { mapCalculation, mappedCartItems } from "../cart";

import { ICalculateSummary } from "@znode/types/account";
import { IPortalDetail } from "@znode/types/portal";
import { Orders_orderTrackingDetailsByClassNumber } from "@znode/clients/v1";
import { convertCamelCase } from "@znode/utils/server";
import { getGeneralSettingList } from "../general-setting";
import { getPortalDetails } from "../portal";
import { mappedOrderDetails } from "../account/order/mapper";

export async function trackOrder(payload: IOrderStatusRequest) {
  try {
    const { orderNumber, email } = payload;
    const response = convertCamelCase(await Orders_orderTrackingDetailsByClassNumber(orderNumber.trim(), email.trim()));
    if (!response?.hasError && response?.lineItemDetails) {
      response.lineItemDetails = mappedCartItems(response.lineItemDetails);
      const portalData = await getPortalDetails();
      const summary = getSummary(response, portalData);
      const generalSetting = await getGeneralSettingList();
      const orderDetailsData = mappedOrderDetails(response, summary as ICalculateSummary, portalData, generalSetting);
      return orderDetailsData;
    } else return null;
  } catch (err) {
    logServer.error(AREA.TRACK_ORDER, errorStack(err));
    return null;
  }
}

const getSummary = (orderDetails: IOrderStatusDetail, portalData: IPortalDetail) => {
  const { costFactorResponse: costs, orderDiscounts: discounts, subTotal, total } = orderDetails;
  const obj = {
    costs: costs,
    discounts: discounts,
    subTotal: Number(subTotal),
    total: Number(total),
  };
  return mapCalculation(obj, portalData?.currencyCode, true);
};
