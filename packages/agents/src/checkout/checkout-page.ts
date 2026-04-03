import { getSavedUserSession } from "@znode/utils/common";
import { getPortalHeader } from "@znode/utils/server";
import { getGeneralSettingList } from "../general-setting";
import { getCheckoutRequiredUserDetails } from "./checkout";
import { getPaymentConfigurations } from "../payment";
import { getCartPageSettings } from "../cart";
import { ICheckoutPageDetailsResponse } from "@znode/types/checkout-page-details";

export async function getCheckoutPageDetails(): Promise<ICheckoutPageDetailsResponse> {
  const portalHeader = await getPortalHeader();
  const checkoutPortalData = await getCartPageSettings(true);
  const generalSetting = await getGeneralSettingList();
  const userDetails = (await getSavedUserSession()) ?? {};

  const { enableShippingAddressSuggestion, approvalType, enableApprovalRouting, orderLimit, recaptchaDetails } = await getCheckoutRequiredUserDetails();
  const paymentOptions = await getPaymentConfigurations(portalHeader.portalId, portalHeader.storeCode);

  return {
    paymentOptions,
    enableShippingAddressSuggestion,
    approvalType,
    enableApprovalRouting,
    orderLimit,
    recaptchaDetails,
    userDetails,
    generalSetting,
    checkoutPortalData,
  };
}
