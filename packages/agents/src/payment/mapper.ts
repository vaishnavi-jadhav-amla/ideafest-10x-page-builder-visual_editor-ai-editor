import { AREA, errorStack, logServer } from "@znode/logger/server";
import {
  IAuthorizePaymentRequest,
  IPaymentAddress,
  IPaymentDetails,
  IPaymentManagerBankAccountRequest,
  IPaymentManagerPurchaseRequest,
  IPaymentResponse,
  IVerifyPaymentRequest,
} from "@znode/types/payment";
import { PAYMENT, PAYMENT_PLUGIN } from "@znode/constants/payment";

import { ISubmitPaymentModel } from "@znode/types/checkout";
import { IUpdateOrderPayment } from "@znode/types/order";
import { getPortalDetails } from "../portal";

export const mapAuthorizeRequest = async (submitPaymentModel: ISubmitPaymentModel): Promise<IAuthorizePaymentRequest | null> => {
  try {
    if (submitPaymentModel) {
      const portalData = await getPortalDetails();
      const authorizeRequest = {
        configurationSetCode: submitPaymentModel.configurationSetCode,
        cardDetails: submitPaymentModel.cardDetails,
        billingAddress: submitPaymentModel.billingAddress,
        gatewayAuthenticationToken: submitPaymentModel.paymentMethodToken,
        total: submitPaymentModel.total,
        gatewayCurrencyCode: portalData.currencyCode ?? PAYMENT.UNITED_STATES_SUFFIX,
        orderId: submitPaymentModel.orderNumber,
        customerGuid: submitPaymentModel?.customerGuid,
        isSaveCreditCard: submitPaymentModel?.isSaveCreditCard,
        isSavedPaymentMethod: submitPaymentModel?.isSavedPaymentMethod
      } as IAuthorizePaymentRequest;
      if (submitPaymentModel.paymentPluginName.toLowerCase() !== PAYMENT_PLUGIN.SPREEDLY.toLowerCase())
        authorizeRequest.gatewayAuthenticationToken = submitPaymentModel.paymentMethodToken;
      else authorizeRequest.gatewayPaymentMethodToken = submitPaymentModel.paymentMethodToken;

      return authorizeRequest;
    }
    return null;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return null;
  }
};

export const mapBankAccountRequest = async (bankDetailsToken: string): Promise<IPaymentManagerBankAccountRequest | null> => {
  try {
    const decodedToken = String(Buffer.from(bankDetailsToken, "base64"));
    const bankDetails = decodedToken.split("|");
    if (bankDetails.length >= 5) {
      const bankAccountRequest = {
        firstName: bankDetails[0].toString(),
        lastName: bankDetails[1].toString(),
        bankAccountType: bankDetails[2].toString(),
        bankAccountNumber: bankDetails[3].toString(),
        bankRoutingNumber: bankDetails[4].toString(),
      } as IPaymentManagerBankAccountRequest;
      return bankAccountRequest;
    }
    return null;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return null;
  }
};

export const mapPurchaseRequest = async (submitPaymentModel: ISubmitPaymentModel): Promise<IPaymentManagerPurchaseRequest | null> => {
  try {
    const portalData = await getPortalDetails();
    const purchaseRequest = {
      paymentMethodToken: submitPaymentModel.paymentMethodToken,
      orderId: submitPaymentModel.orderNumber,
      total: submitPaymentModel.total,
      gatewayCurrencyCode: portalData.currencyCode ?? PAYMENT.UNITED_STATES_SUFFIX,
      billingAddress: {
        addressLine1: submitPaymentModel.billingAddress.addressLine1,
        addressLine2: submitPaymentModel.billingAddress.addressLine2,
        firstName: submitPaymentModel.billingAddress.firstName,
        lastName: submitPaymentModel.billingAddress.lastName,
        city: submitPaymentModel.billingAddress.city,
        country: submitPaymentModel.billingAddress.country,
        state: submitPaymentModel.billingAddress.state,
        zipCode: submitPaymentModel.billingAddress.zipCode,
      } as IPaymentAddress,
    } as IPaymentManagerPurchaseRequest;
    return purchaseRequest;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return null;
  }
};

export const mapPaymentDetailsRequest = async (paymentResponse: IPaymentResponse, transactionStatus: string, submitPaymentModel: ISubmitPaymentModel)
    : Promise<IUpdateOrderPayment | null> => {
    try {
        const transactionId = paymentResponse?.transactionId;
        const externalTransactionId = paymentResponse.externalTransactionId ?? "";
        if (transactionId && transactionStatus && submitPaymentModel) {
            const updatePayment = {
                paymentDetails: {
                    paymentTransactionToken: transactionId,
                    externalTransactionId: externalTransactionId,
                    paymentStatusCode: transactionStatus,
                    paymentSubTypeCode: submitPaymentModel.paymentSubTypeCode,
                } as IPaymentDetails
                , classNumber: submitPaymentModel.orderNumber
            } as IUpdateOrderPayment;
            return updatePayment;
        }
        return null;
    } catch (error) {
        logServer.error(AREA.PAYMENT, errorStack(error));
        return null;
    }
};

export const mapVerifyRequest = async (submitPaymentModel: ISubmitPaymentModel): Promise<IVerifyPaymentRequest | null> => {
  try {
    if (submitPaymentModel) {
      const portalData = await getPortalDetails();
      const verifyRequest = {
        configurationSetCode: submitPaymentModel.configurationSetCode,
        cardDetails: submitPaymentModel.cardDetails,
        billingAddress: submitPaymentModel.billingAddress,
        total: submitPaymentModel.total,
        gatewayCurrencyCode: portalData.currencyCode ?? PAYMENT.UNITED_STATES_SUFFIX,
        orderId: submitPaymentModel.orderNumber,
        retainOnSuccess: true,
        gatewayPaymentMethodToken: submitPaymentModel.paymentMethodToken,
        customerGuid: submitPaymentModel?.customerGuid,
        isSaveCreditCard: submitPaymentModel?.isSaveCreditCard,
        isSavedPaymentMethod: submitPaymentModel?.isSavedPaymentMethod
      } as IVerifyPaymentRequest;
      return verifyRequest;
    }
    return null;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return null;
  }
};