import { convertPascalCase, sendError, sendSuccess } from "@znode/utils/server";
import { IPaymentManagerCaptureRequest } from "@znode/types/payment";
import { PaymentGateway_capture } from "@znode/clients/payment";
import { getSavedUserSession } from "@znode/utils/common";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { CommerceCollections_classDetailsByClassType } from "@znode/clients/cp";
import { Payments_payments } from "@znode/clients/cp";
import { PAYMENT_STATUS, PAYMENT_SUBTYPE } from "@znode/constants/payment";
import { convertCamelCase } from "@znode/utils/server";
export async function POST(request: Request) {
    try {
        const requestObject = await request.json();
        const userData = await getSavedUserSession();
        if (userData?.userId && requestObject.orderType === ORDER_DATA_TYPE.APPROVAL_ROUTING && requestObject.orderNumber && requestObject.configurationSetCode) {
            const orderDetails = await CommerceCollections_classDetailsByClassType(ORDER_DATA_TYPE.APPROVAL_ROUTING, requestObject.orderNumber);
            if (orderDetails?.PaymentDetails?.PaymentStatusCode?.toLowerCase() === PAYMENT_STATUS.AUTHORIZED.toLowerCase() && orderDetails?.PaymentDetails?.PaymentTransactionToken) {
                const response = await PaymentGateway_capture(requestObject.configurationSetCode as string, { transactionId: orderDetails.PaymentDetails?.PaymentTransactionToken } as IPaymentManagerCaptureRequest);
                const captureResponse = convertCamelCase(response);
                if (captureResponse && captureResponse?.isSuccess) {
                    const payment = {
                        classNumber: orderDetails.ClassNumber as string,
                        paymentDetails: {
                            PaymentSubTypeCode: PAYMENT_SUBTYPE.CREDIT_CARD,
                            ConfigurationSetCode: requestObject.configurationSetCode as string,
                            PaymentTransactionToken: captureResponse.PaymentTransactionToken,
                            PaymentStatusCode: PAYMENT_STATUS.CAPTURED,
                            PurchaseOrderNumber: orderDetails.PaymentDetails?.PurchaseOrderNumber,
                            ExternalTransactionId: captureResponse.ExternalTransactionId
                        },
                        billingAddressId: orderDetails.Address?.find((x) => x.IsBilling === true)?.AddressId ?? 0
                    };
                    const paymentRequestModel = convertPascalCase(payment);
                    const orderUpdateResponse = await Payments_payments(paymentRequestModel);
                    const updateResponse = convertCamelCase(orderUpdateResponse);
                    if (updateResponse && updateResponse.isSuccess) {
                        return sendSuccess(updateResponse, "Order updated successfully.");
                    }
                    else {
                        return sendError("Failed to update order.", 403);
                    }
                } else {
                    return sendError("Failed to capture payment.", 403);
                }
            }
            else {
                return sendError("Failed to capture payment.", 403);
            }
        } else {
            return sendError(`Invalid User ID ${userData?.userId}.`, 403);
        }
    } catch (error) {
        return sendError("An error occurred while capturing payment" + String(error), 500);
    }
}