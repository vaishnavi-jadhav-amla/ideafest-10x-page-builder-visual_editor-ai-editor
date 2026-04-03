import { IOrderLineItems } from "./account";
import { IAddress } from "./address";
import { ICosts, IDiscounts } from "./cart";
import { IShipmentDetails } from "./order";
import { IPaymentDetails } from "./payment";

export interface IOrderStatusRequest {
  orderNumber: string;
  email: string;
}

export interface IOrderStatusDetail {
  classTypeCode: string | undefined;
  classNumber: string | undefined;
  accountId?: number | undefined;
  type?: string | undefined;
  origin?: string | undefined;
  createdDate: Date;
  classStateName?: string | undefined;
  userName: string | undefined;
  storeName: string | undefined;
  total: string | undefined;
  subTotal: string;
  createdByFullName: string | undefined;
  modifiedByFullName: string | undefined;
  assignToFullName: string | undefined;
  cultureCode: string | undefined;
  lineItemDetails: IOrderLineItems[] | undefined;
  orderShipments: IShipmentDetails;
  orderDiscounts: IDiscounts[];
  costFactorResponse: ICosts[];
  address: IAddress[] | undefined;
  expirationDate?: Date;
  phoneNumber?: string | undefined;
  inHandDate: Date | undefined;
  paymentDetails: IPaymentDetails;
  additionalInstructions?: { name: string; information: string };
  errorMessage?: string | undefined;
  assignToUserId?: number;
}
