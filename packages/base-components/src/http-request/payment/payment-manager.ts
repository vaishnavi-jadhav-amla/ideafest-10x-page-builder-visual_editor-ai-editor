import {IBooleanResponse, ISavedCardDetailsResponse, ITokenResponse} from "@znode/types/payment";

import { ISubmitPaymentModel } from "@znode/types/checkout";
import { httpRequest } from "../base";
import { objectToQueryString } from "@znode/utils/component";
import { IUpdateOrderPayment } from "@znode/types/order";

export const create = async (paymentRequest: ISubmitPaymentModel): Promise<IUpdateOrderPayment> => {
  const paymentResponse = await httpRequest<IUpdateOrderPayment>({
    endpoint: "/api/payment-manager/create",
    method: "POST",
    body: { paymentRequest },
  });
  return paymentResponse;
};

export const clientToken = async (props: { configurationSetCode: string, customerGuid: string }): Promise<ITokenResponse> => {
  const queryString: string = objectToQueryString(props);
  const tokenResponse = await httpRequest<ITokenResponse>({ 
    endpoint: `/api/payment-manager/gateway-token?${queryString}`
  });
  return tokenResponse;
};

export const savedCardDetails = async (props: { customerGuid: string, configurationSetCode: string }): Promise<ISavedCardDetailsResponse> => {
  const queryString: string = objectToQueryString(props);
  const savedCardDetailsResponse = await httpRequest<ISavedCardDetailsResponse>({ 
    endpoint: `/api/payment-manager/saved-credit-card?${queryString}`
  });
  return savedCardDetailsResponse;

};

export const deleteSavedCreditCard = async (props: { customerGuid: string, configurationSetCode: string, paymentMethodToken: string }): Promise<IBooleanResponse> => {
  const queryString: string = objectToQueryString(props);
  const deleteSavedCardDetailsResponse = await httpRequest<IBooleanResponse>({ 
    endpoint: `/api/payment-manager/delete-saved-credit-card?${queryString}`,
    method: "DELETE",
  });
  return deleteSavedCardDetailsResponse;

};