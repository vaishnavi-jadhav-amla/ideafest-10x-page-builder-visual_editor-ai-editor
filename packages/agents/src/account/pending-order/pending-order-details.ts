import { mappedCartItems } from "../../cart/mapper";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { convertCamelCase } from "@znode/utils/server";
import { getGeneralSettingList } from "../../general-setting";
import { getCartSummary } from "../../cart";
import { CommerceCollections_classDetailsByClassType } from "@znode/clients/cp";
import { mappedOrderDetails } from "../order/mapper";
import { getPortalDetails } from "../../portal/portal";

export async function pendingOrderReceiptDetails(orderType: string, cartNumber: string) {
  try {
    const portalData = await getPortalDetails();

    const [commerceCollectionClassDetail, calculateSummery] = await Promise.all([CommerceCollections_classDetailsByClassType(orderType, cartNumber), getCartSummary(cartNumber)]);

    const orderDetails = convertCamelCase(commerceCollectionClassDetail);
    const calculatedSummary = convertCamelCase(calculateSummery);

    if (orderDetails?.lineItemDetails) {
      orderDetails.lineItemDetails = mappedCartItems(orderDetails.lineItemDetails);
    }
    const generalSetting = await getGeneralSettingList();

    const orderDetailsData = mappedOrderDetails(orderDetails, calculatedSummary, portalData, generalSetting);
    return orderDetailsData;
  } catch (error) {
    logServer.error(AREA.PENDING_ORDER, errorStack(error));
    return {};
  }
}
