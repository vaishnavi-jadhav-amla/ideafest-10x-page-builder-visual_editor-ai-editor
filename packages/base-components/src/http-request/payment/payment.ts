import { objectToQueryString } from "@znode/utils/component";
import { httpRequest } from "../base";
import { IPaymentConfigurationSetDetails, IPaymentOption, IUpdateOfflinePaymentResponseModel } from "@znode/types/payment";
import { IUpdateOrderPayment } from "@znode/types/order";

export const getPaymentConfigurations = async (): Promise<IPaymentOption[]> => {
  const paymentConfigurations = await httpRequest<IPaymentOption[]>({
    endpoint: "/api/payment/configurations",
  });
  return paymentConfigurations;
};

export const getPaymentConfigurationsByCode = async (props: { configurationSetCode: string }): Promise<IPaymentConfigurationSetDetails> => {
  const queryString: string = objectToQueryString(props);
  const paymentConfigurations = await httpRequest<IPaymentConfigurationSetDetails>({
    endpoint: `/api/payment/configuration-by-code?${queryString}`,
  });
  return paymentConfigurations;
};

export const getOfflinePaymentConfigurations = async (): Promise<IPaymentOption[]> => {
  const paymentConfigurations = await httpRequest<IPaymentOption[]>({
    endpoint: "/api/payment/offline-configurations",
  });
  return paymentConfigurations;
};

export const updateOfflinePayments = async (paymentRequest: IUpdateOrderPayment): Promise<IUpdateOfflinePaymentResponseModel> => {
  const paymentResponse = await httpRequest<IUpdateOfflinePaymentResponseModel>({
    endpoint: "/api/payment/offline-payment",
    method: "POST",
    body: { paymentRequest },
  });
  return paymentResponse;
};