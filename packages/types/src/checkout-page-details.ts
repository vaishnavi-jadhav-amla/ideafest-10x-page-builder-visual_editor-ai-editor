import { ICartSettings } from "./cart";
import { ICheckoutRecaptcha } from "./common";
import { IGeneralSetting } from "./general-setting";
import { IPaymentOption } from "./payment";
import { IUser } from "./user";

export interface ICheckoutPageDetailsResponse {
  checkoutPortalData: ICartSettings | null;
  paymentOptions: IPaymentOption[];
  enableShippingAddressSuggestion: boolean;
  approvalType: string | undefined;
  enableApprovalRouting: boolean;
  orderLimit: number | undefined;
  recaptchaDetails: ICheckoutRecaptcha | undefined;
  userDetails: IUser;
  generalSetting: IGeneralSetting;
  isEditing?: boolean;
}
