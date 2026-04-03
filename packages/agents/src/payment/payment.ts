import { AREA, errorStack, logServer } from "@znode/logger/server";
import { convertCamelCase, convertPascalCase } from "@znode/utils/server";

import { IFileUploadResponse, IUpdateBillingDetailsResponseModel, IUpdateOfflinePaymentResponseModel } from "@znode/types/payment";
import { IUpdateOrderPayment } from "@znode/types/order";
import { Payments_payments, Payments_paymentsPost } from "@znode/clients/cp";
import { UploadPOMedia } from "@znode/clients/v1";
import { getSavedUserSession } from "@znode/utils/common";

export async function updatePaymentDetails(paymentDetails: IUpdateOrderPayment): Promise<IUpdateBillingDetailsResponseModel> {
  try {
    if (paymentDetails) {
      const session = await getSavedUserSession();
      paymentDetails.userId = session?.userId ?? 0;
      const updateRequest = convertPascalCase(paymentDetails);
      const updatePaymentDetails = convertCamelCase(await Payments_payments(updateRequest));
      return updatePaymentDetails;
    }
    return { isSuccess: false } as IUpdateBillingDetailsResponseModel;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return { isSuccess: false } as IUpdateBillingDetailsResponseModel;
  }
}

export async function uploadPODocument(formData: FormData) {
  try {
    const poDocumentResponse: IFileUploadResponse = await UploadPOMedia(formData);
    if (poDocumentResponse && poDocumentResponse.FileUpload.length > 0) return poDocumentResponse.FileUpload[0]?.FileName;
  } catch (error) {
    logServer.error(AREA.CHECKOUT, errorStack(error));
  }
}

export async function updateOfflinePaymentDetails(paymentDetails: IUpdateOrderPayment): Promise<IUpdateOfflinePaymentResponseModel> {
  try {
    if (paymentDetails) {
      const session = await getSavedUserSession();
      paymentDetails.userId = session?.userId ?? 0;
      const updateRequest = convertPascalCase(paymentDetails);
      const updatePaymentDetails = convertCamelCase(await Payments_paymentsPost(updateRequest));
      return updatePaymentDetails;
    }
    return { isSuccess: false } as IUpdateOfflinePaymentResponseModel;
  } catch (error) {
    logServer.error(AREA.PAYMENT, errorStack(error));
    return { isSuccess: false } as IUpdateOfflinePaymentResponseModel;
  }
}
