import { PAYMENT_STATUS, PAYMENT_TRANSACTION_STATUS, PAYMENT_TRANSACTION_TYPE } from "@znode/constants/payment";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IPaymentResponse, IVoidRefundPaymentRequest } from "@znode/types/payment";
import { convertCamelCase, convertPascalCase } from "@znode/utils/server";
import { PaymentGateway_refund, PaymentGateway_transactionStatusDetails, PaymentGateway_void } from "packages/clients/src/znode-client/payment-manager/payment-gateway";

export async function voidRefundPayment(paymentRequestModel: IVoidRefundPaymentRequest): Promise<IPaymentResponse> {
  try {
    const paymentManagerRefundRequest = convertPascalCase({
      transactionId: paymentRequestModel.paymentTransactionToken,
      isCompleteOrderRefund: true,
    });

    const { paymentStatusCode, configurationSetCode, paymentTransactionToken } = paymentRequestModel;

    if (paymentStatusCode === PAYMENT_STATUS.CAPTURED) {
      const transactionStatusDetails = await PaymentGateway_transactionStatusDetails(configurationSetCode, paymentTransactionToken);

      const { transactionStatus, transactionType } = convertCamelCase(transactionStatusDetails);

      const isSettled = transactionStatus === PAYMENT_TRANSACTION_STATUS.SETTLED;
      const isSucceeded = transactionStatus === PAYMENT_TRANSACTION_STATUS.SUCCEEDED;
      const isSubmittedForSettlement = transactionStatus === PAYMENT_TRANSACTION_STATUS.SUBMITTED_FOR_SETTLEMENT;

      const isCaptured = transactionType === PAYMENT_TRANSACTION_TYPE.CAPTURED;
      const isPurchase = transactionType === PAYMENT_TRANSACTION_TYPE.PURCHASE;
      const isSale = transactionType === PAYMENT_TRANSACTION_TYPE.SALE;

      // Transaction is settled and either captured or sale
      if (isSettled && (isCaptured || isSale)) {
        return convertCamelCase(await PaymentGateway_refund(configurationSetCode, paymentManagerRefundRequest));
      }

      // Void eligible scenarios
      if (((!isSettled || isSubmittedForSettlement) && (isCaptured || isSale)) || (isSucceeded && (isCaptured || isPurchase))) {
        try {
          const voidResponse = convertCamelCase(await PaymentGateway_void(configurationSetCode, paymentManagerRefundRequest));

          if (!voidResponse?.isSuccess) {
            // Fallback to refund if void fails
            return convertCamelCase(await PaymentGateway_refund(configurationSetCode, paymentManagerRefundRequest));
          }

          return voidResponse;
        } catch (error) {
          logServer.error(AREA.PAYMENT, errorStack(error));
        }
      }
    } else if (paymentStatusCode === PAYMENT_STATUS.AUTHORIZED) {
      // Void directly if payment was only authorized
      return convertCamelCase(await PaymentGateway_void(configurationSetCode, paymentManagerRefundRequest));
    }

    return { isSuccess: false } as IPaymentResponse;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return { isSuccess: false } as IPaymentResponse;
  }
}

