import { ICheckoutRenderProps } from "./CheckoutPageConfig";
import { CheckoutPage } from "@znode/base-components/page-widget/checkout-page";
import { ICheckoutPageDetailsResponse } from "@znode/types/checkout-page-details";
import { useIsEditing } from "../../../../../utils/use-puck";

export function CheckoutPageRender(props: ICheckoutRenderProps) {
  const isEditing = useIsEditing(props.puck);

  if (!props.response || !props.response.data) {
    return null;
  }

  const data: ICheckoutPageDetailsResponse = props.response?.data;
  const approvalType = data.approvalType;
  const checkoutPortalData = data.checkoutPortalData;
  const paymentOptions = data.paymentOptions;
  const enableShippingAddressSuggestion = data.enableShippingAddressSuggestion;
  const enableApprovalRouting = data.enableApprovalRouting;
  const orderLimit = data.orderLimit;
  const recaptchaDetails = data.recaptchaDetails;
  const userDetails = data.userDetails;
  const generalSetting = data.generalSetting;

  return (
    <CheckoutPage
      isEditing={isEditing}
      approvalType={approvalType}
      checkoutPortalData={checkoutPortalData}
      paymentOptions={paymentOptions}
      enableShippingAddressSuggestion={enableShippingAddressSuggestion}
      enableApprovalRouting={enableApprovalRouting}
      orderLimit={orderLimit}
      recaptchaDetails={recaptchaDetails}
      userDetails={userDetails}
      generalSetting={generalSetting}
    />
  );
}