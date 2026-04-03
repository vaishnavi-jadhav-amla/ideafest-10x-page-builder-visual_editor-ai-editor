import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IBooleanResponse, IPaymentManagerBankAccountResponse, IPaymentManagerCaptureRequest, IPaymentManagerPurchaseResponse, IPaymentResponse, ISavedCardDetailsResponse, ITokenResponse } from "@znode/types/payment";
import { mapAuthorizeRequest, mapBankAccountRequest, mapPaymentDetailsRequest, mapPurchaseRequest, mapVerifyRequest } from "./mapper";
import { PaymentGateway_authorize, PaymentGateway_capture, PaymentGateway_tokenByCustomerId, PaymentGateway_token, PaymentGateway_bankAccount, PaymentGateway_purchase, PaymentGateway_verify, PaymentGateway_getCreditCardDetails, PaymentGateway_deleteCreditCard } from "@znode/clients/payment";
import { ISubmitPaymentModel } from "@znode/types/checkout";
import { IUpdateOrderPayment } from "@znode/types/order";
import { PAYMENT_SETTING, PAYMENT_STATUS, PAYMENT_SUBTYPE, SPREEDLY_RESPONSE_CODE } from "@znode/constants/payment";
import { convertCamelCase } from "@znode/utils/server";

export async function createPayment(submitPaymentModel: ISubmitPaymentModel): Promise<IUpdateOrderPayment> {
  try {
    if (submitPaymentModel.paymentSubTypeCode.toLowerCase() === PAYMENT_SUBTYPE.ACH.toLowerCase()) {
      return createACHPayment(submitPaymentModel);
    } else {
      return createCreditCardPayment(submitPaymentModel);
    }
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return {} as IUpdateOrderPayment;
  }
}

export async function createACHPayment(submitPaymentModel: ISubmitPaymentModel): Promise<IUpdateOrderPayment> {
  let updatePaymentRequest: IUpdateOrderPayment | null;
  try {
    submitPaymentModel.paymentMethodToken = (await createBankAccount(submitPaymentModel.configurationSetCode, submitPaymentModel.paymentDetailsToken)) ?? "";
    if (submitPaymentModel) {
      const purchaseResponse = await createPurchase(submitPaymentModel);
      if (purchaseResponse?.transactionId && purchaseResponse?.transactionId !== "0") {
        const transactionStatus = purchaseResponse.isSuccess
          ? PAYMENT_STATUS.CAPTURED
          : purchaseResponse.responseCode === SPREEDLY_RESPONSE_CODE.DECLINED
          ? PAYMENT_STATUS.DECLINED
          : PAYMENT_STATUS.FAILED;
        const paymentResponse = { transactionId: purchaseResponse?.transactionId, externalTransactionId: purchaseResponse.externalTransactionId } as IPaymentResponse;
        updatePaymentRequest = await mapPaymentDetailsRequest(paymentResponse, transactionStatus, submitPaymentModel);
        return updatePaymentRequest ?? {} as IUpdateOrderPayment;
      }
    }
    return {} as IUpdateOrderPayment;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return {} as IUpdateOrderPayment;
  }
}

export async function createPurchase(submitPaymentModel: ISubmitPaymentModel) {
  let purchaseResponse: IPaymentManagerPurchaseResponse | null = null;

  const purchaseRequest = await mapPurchaseRequest(submitPaymentModel);
  try {
    if (
      submitPaymentModel?.configurationSetCode &&
      purchaseRequest?.gatewayCurrencyCode &&
      purchaseRequest?.orderId &&
      purchaseRequest?.paymentMethodToken &&
      purchaseRequest?.total
    ) {
      purchaseResponse = convertCamelCase(await PaymentGateway_purchase(submitPaymentModel?.configurationSetCode, purchaseRequest));
    }
    return purchaseResponse;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return purchaseResponse;
  }
}

export async function createBankAccount(configurationSetCode: string, bankDetailsToken: string): Promise<string | null> {
  let paymentMethodToken: string | null = null;
  try {
    if (configurationSetCode) {
      const bankAccountRequest = await mapBankAccountRequest(bankDetailsToken);
      if (bankAccountRequest) {
        const bankAccountResponse: IPaymentManagerBankAccountResponse = convertCamelCase(await PaymentGateway_bankAccount(configurationSetCode, bankAccountRequest));
        paymentMethodToken = bankAccountResponse.gatewayPaymentMethodToken ?? null;
        return paymentMethodToken;
      }
    }
    return paymentMethodToken;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return paymentMethodToken;
  }
}

export async function createCreditCardPayment(submitPaymentModel: ISubmitPaymentModel): Promise<IUpdateOrderPayment> {
  try {
    const selectedPaymentSetting: string | null = submitPaymentModel.creditCardVerification;
    if(selectedPaymentSetting !== null && selectedPaymentSetting !== undefined && selectedPaymentSetting !== "")
    {
      if(selectedPaymentSetting.toLowerCase() === PAYMENT_SETTING.VERIFY_ONLY.toLowerCase())
      {
        const verifyResponse = await verify(submitPaymentModel);
        if (verifyResponse?.transactionId && verifyResponse?.transactionId !== "0") {
          if(verifyResponse.responseCode === SPREEDLY_RESPONSE_CODE.DECLINED)
            return {isDeclined:true} as IUpdateOrderPayment;
          let updatedPaymentDetails: IUpdateOrderPayment | null = null;
          updatedPaymentDetails = await mapPaymentDetailsRequest(verifyResponse, PAYMENT_STATUS.VERIFIED, submitPaymentModel);
          return updatedPaymentDetails ?? {} as IUpdateOrderPayment;
        }else if(!verifyResponse.isSuccess)
          return { isPaymentVerified: false} as IUpdateOrderPayment;
        else return {} as IUpdateOrderPayment;
      }
      else if(selectedPaymentSetting.toLowerCase() === PAYMENT_SETTING.AUTHORIZE_ONLY.toLowerCase())
      {
        const authorizeResponse = await authorize(submitPaymentModel);
        if (authorizeResponse?.transactionId && authorizeResponse?.transactionId !== "0") {
          if(authorizeResponse.responseCode === SPREEDLY_RESPONSE_CODE.DECLINED)
            return {isDeclined:true} as IUpdateOrderPayment;
          let updatedPaymentDetails: IUpdateOrderPayment | null = null;
          updatedPaymentDetails = await mapPaymentDetailsRequest(authorizeResponse, PAYMENT_STATUS.AUTHORIZED, submitPaymentModel);
          return updatedPaymentDetails ?? {} as IUpdateOrderPayment;
        } else if(!authorizeResponse.isSuccess)
          return { isPaymentAuthorized: false} as IUpdateOrderPayment;
        else return {} as IUpdateOrderPayment;
      }
      else if(selectedPaymentSetting.toLowerCase() === PAYMENT_SETTING.VERIFY_AND_AUTHORIZE.toLowerCase())
      {
        const verifyResponse = await verify(submitPaymentModel);
        if (verifyResponse?.transactionId && verifyResponse?.transactionId !== "0") {
          if(verifyResponse.responseCode === SPREEDLY_RESPONSE_CODE.DECLINED)
            return {isDeclined:true} as IUpdateOrderPayment;
          let updatedPaymentDetails: IUpdateOrderPayment | null = null;
          const authorizeResponse = await authorize(submitPaymentModel);
          if (authorizeResponse?.transactionId) {
            if(authorizeResponse.responseCode === SPREEDLY_RESPONSE_CODE.DECLINED)
            return {isDeclined:true} as IUpdateOrderPayment;
            updatedPaymentDetails = await mapPaymentDetailsRequest(authorizeResponse, PAYMENT_STATUS.AUTHORIZED, submitPaymentModel);
            return updatedPaymentDetails ?? {} as IUpdateOrderPayment;
          } else if(!authorizeResponse.isSuccess)
          return { isPaymentAuthorized: false} as IUpdateOrderPayment;
        } else if(!verifyResponse.isSuccess)
          return { isPaymentVerified: false} as IUpdateOrderPayment;
        else return {} as IUpdateOrderPayment;
      }
      else if(selectedPaymentSetting.toLowerCase() === PAYMENT_SETTING.AUTHORIZE_AND_CAPTURE.toLowerCase())
      {
        const authorizeResponse = await authorize(submitPaymentModel);
        if (authorizeResponse?.transactionId && authorizeResponse?.transactionId !== "0") {
          if(authorizeResponse.responseCode === SPREEDLY_RESPONSE_CODE.DECLINED)
            return {isDeclined:true} as IUpdateOrderPayment;
          let updatedPaymentDetails: IUpdateOrderPayment | null = null;
          const captureResponse = await capture(submitPaymentModel.configurationSetCode, { transactionId: authorizeResponse.transactionId, orderId: submitPaymentModel?.orderNumber } as IPaymentManagerCaptureRequest);
          if (captureResponse?.transactionId) {
            if(captureResponse.responseCode === SPREEDLY_RESPONSE_CODE.DECLINED)
              return {isDeclined:true} as IUpdateOrderPayment;
            updatedPaymentDetails = await mapPaymentDetailsRequest(captureResponse, PAYMENT_STATUS.CAPTURED, submitPaymentModel);
            return updatedPaymentDetails ?? {} as IUpdateOrderPayment;
          } else if(!captureResponse.isSuccess)
          return { isPaymentCaptured: false} as IUpdateOrderPayment;
        } else if(!authorizeResponse.isSuccess)
          return { isPaymentAuthorized: false} as IUpdateOrderPayment;
        else return {} as IUpdateOrderPayment;
      }
      else if(selectedPaymentSetting.toLowerCase() === PAYMENT_SETTING.VERIFY_AUTHORIZE_AND_CAPTURE.toLowerCase())
      {
        const verifyResponse = await verify(submitPaymentModel);
        if (verifyResponse?.transactionId && verifyResponse?.transactionId !== "0") {
          if(verifyResponse.responseCode === SPREEDLY_RESPONSE_CODE.DECLINED)
            return {isDeclined:true} as IUpdateOrderPayment;
          let updatedPaymentDetails: IUpdateOrderPayment | null = null;
          const authorizeResponse = await authorize(submitPaymentModel);
          if (authorizeResponse?.transactionId && authorizeResponse?.transactionId !== "0") {
            if(authorizeResponse.responseCode === SPREEDLY_RESPONSE_CODE.DECLINED)
              return {isDeclined:true} as IUpdateOrderPayment;
            const captureResponse = await capture(submitPaymentModel.configurationSetCode, { transactionId: authorizeResponse.transactionId, orderId: submitPaymentModel?.orderNumber } as IPaymentManagerCaptureRequest);
            if (captureResponse?.transactionId) {
              if(captureResponse.responseCode === SPREEDLY_RESPONSE_CODE.DECLINED)
                return {isDeclined:true} as IUpdateOrderPayment;
              updatedPaymentDetails = await mapPaymentDetailsRequest(captureResponse, PAYMENT_STATUS.CAPTURED, submitPaymentModel);
              return updatedPaymentDetails ?? {} as IUpdateOrderPayment;
            } else if(!captureResponse.isSuccess)
                return { isPaymentCaptured: false} as IUpdateOrderPayment;
              else return {} as IUpdateOrderPayment;
          } else if(!authorizeResponse.isSuccess)
              return { isPaymentAuthorized: false} as IUpdateOrderPayment;
          else return {} as IUpdateOrderPayment;
        } else if(!verifyResponse.isSuccess)
            return { isPaymentVerified: false} as IUpdateOrderPayment;
        else return {} as IUpdateOrderPayment;
      }
    }
    else
    {
      const authorizeResponse = await authorize(submitPaymentModel);
      if (authorizeResponse?.transactionId && authorizeResponse?.transactionId !== "0") {
        if(authorizeResponse.responseCode === SPREEDLY_RESPONSE_CODE.DECLINED)
          return {isDeclined:true} as IUpdateOrderPayment;
        let updatedPaymentDetails: IUpdateOrderPayment | null = null;
        if (submitPaymentModel.isCapture) {
          const captureResponse = await capture(submitPaymentModel.configurationSetCode, { transactionId: authorizeResponse.transactionId, orderId: submitPaymentModel?.orderNumber } as IPaymentManagerCaptureRequest);
          if (captureResponse.transactionId) {
            updatedPaymentDetails = await mapPaymentDetailsRequest(captureResponse, PAYMENT_STATUS.CAPTURED, submitPaymentModel);
          }
        } else {
          updatedPaymentDetails = await mapPaymentDetailsRequest(authorizeResponse, PAYMENT_STATUS.AUTHORIZED, submitPaymentModel);
        }
        return updatedPaymentDetails ?? {} as IUpdateOrderPayment;
      } else return {} as IUpdateOrderPayment;
    }
    return {} as IUpdateOrderPayment;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return {} as IUpdateOrderPayment;
  }
}

export async function clientToken(configurationSetCode: string, customerGuid: string): Promise<ITokenResponse> {
  try {
    let tokenResponse: ITokenResponse;
    if (customerGuid && customerGuid != "") tokenResponse = convertCamelCase(await PaymentGateway_tokenByCustomerId(configurationSetCode, customerGuid));
    else tokenResponse = convertCamelCase(await PaymentGateway_token(configurationSetCode));
    return tokenResponse;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return {} as ITokenResponse;
  }
}

const authorize = async (submitPaymentModel: ISubmitPaymentModel): Promise<IPaymentResponse> => {
  try {
    let authorizeResponse = {} as IPaymentResponse;
    if (submitPaymentModel) {
      const authorizeRequest = (await mapAuthorizeRequest(submitPaymentModel)) || {};
      authorizeResponse = convertCamelCase(await PaymentGateway_authorize(submitPaymentModel.configurationSetCode, authorizeRequest));
    }
    return authorizeResponse;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return {} as IPaymentResponse;
  }
};

const capture = async (pluginIdentifier: string, requestModel: IPaymentManagerCaptureRequest): Promise<IPaymentResponse> => {
  try {
    const captureResponse: IPaymentResponse = convertCamelCase(await PaymentGateway_capture(pluginIdentifier, requestModel));
    return captureResponse;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return {} as IPaymentResponse;
  }
};

const verify = async (submitPaymentModel: ISubmitPaymentModel): Promise<IPaymentResponse> => {
  try {
    let verifyResponse = {} as IPaymentResponse;
    if (submitPaymentModel) {
      const verifyRequest = (await mapVerifyRequest(submitPaymentModel)) || {};
      verifyResponse = convertCamelCase(await PaymentGateway_verify(submitPaymentModel.configurationSetCode, verifyRequest));
    }
    return verifyResponse;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return {} as IPaymentResponse;
  }
};


export async function savedCardDetails(customerGuid : string, configurationSetCode: string): Promise<ISavedCardDetailsResponse> {
  try{
    let savedCardDetailsResponse = {} as ISavedCardDetailsResponse;
    if (customerGuid && customerGuid !== "" && configurationSetCode && configurationSetCode !== "")
      savedCardDetailsResponse = convertCamelCase(await PaymentGateway_getCreditCardDetails(configurationSetCode, customerGuid));
    return savedCardDetailsResponse;
  }catch(error){
    logServer.error(AREA.PAYMENT, errorStack(error));
    return {} as ISavedCardDetailsResponse;
  }
};

export async function deleteSavedCardDetails(customerGuid : string, configurationSetCode: string, paymentMethodToken: string): Promise<IBooleanResponse> {
  try{
    let deleteSavedCardDetailsResponse = {} as IBooleanResponse;
    if (customerGuid && customerGuid !== "" && configurationSetCode && configurationSetCode !== "" && paymentMethodToken && paymentMethodToken!== "")
      deleteSavedCardDetailsResponse = convertCamelCase(await PaymentGateway_deleteCreditCard(configurationSetCode, customerGuid, paymentMethodToken));
    return deleteSavedCardDetailsResponse;
  }catch(error){
    logServer.error(AREA.PAYMENT, errorStack(error));
    return {} as IBooleanResponse;
  }
};