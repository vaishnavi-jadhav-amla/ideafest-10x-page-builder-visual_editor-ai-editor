import { BreadCrumbs } from "../../common/breadcrumb";
import { ICartSettings } from "@znode/types/cart";
import { IUser } from "@znode/types/user";
import { ICheckoutPageDetailsResponse } from "@znode/types/checkout-page-details";
import { Checkout } from "../../checkout";

type ICheckoutPageProps = ICheckoutPageDetailsResponse;

export function CheckoutPage(props: ICheckoutPageProps) {
  const {
    approvalType,
    checkoutPortalData,
    enableApprovalRouting,
    enableShippingAddressSuggestion,
    generalSetting,
    orderLimit,
    paymentOptions,
    recaptchaDetails,
    userDetails,
    isEditing = false,
  } = props;

  const BreadCrumbsData = {
    title: "Checkout",
    routingLabel: "Home",
    routingPath: "/",
  };

  return (
    <>
      <BreadCrumbs customPath={BreadCrumbsData} />
      <Checkout
        paymentOptions={paymentOptions}
        enableShippingAddressSuggestion={enableShippingAddressSuggestion}
        approvalType={approvalType}
        orderLimit={orderLimit}
        enableApprovalRouting={enableApprovalRouting}
        recaptchaDetails={recaptchaDetails}
        loginToSeePriceAndInventory={checkoutPortalData?.loginToSeePricingAndInventory}
        userDetails={userDetails as IUser}
        checkoutPortalData={checkoutPortalData as ICartSettings}
        generalSetting={generalSetting}
        isEditing={isEditing}
      />
    </>
  );
}
