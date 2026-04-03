import {
  ICreateReturnResponse,
  IRequestProductReturnDetails,
  IReturnCalculateRequestModel,
  IReturnCalculateResponse,
  IReturnOrderResponse,
  IReturnReceiptData,
} from "@znode/types/order";

import { httpRequest } from "../base";

export const getOrderDetailsByClassNumber = async (classType: string, classNumber: string, isValidNumber: string ) => {
  const orderDetails = await httpRequest<IReturnOrderResponse>({
    endpoint: `/api/return-order/get-details-class-number?classType=${classType}&classNumber=${classNumber}&isValidNumber=${isValidNumber}`,
  });
  return orderDetails;
};
export const getReturnOrderReceiptDetails = async (classType: string, classNumber: string) => {
  const returnOrderDetails = await httpRequest<IReturnReceiptData>({
    endpoint: `/api/return-order/receipt?classType=${classType}&classNumber=${classNumber}`,
  });
  return returnOrderDetails;
};

export const createReturnOrder = async (requestBody: {
  orderNumber: string;
  returnStateCode: string;
  returnLineItems: IRequestProductReturnDetails[];
  note: string;
}): Promise<ICreateReturnResponse> => {
  const paymentResponse = await httpRequest<ICreateReturnResponse>({
    endpoint: "/api/return-order/create",
    method: "POST",
    body: requestBody,
  });
  return paymentResponse;
};
export const updateDetailsReturnOrder = async (requestBody: {
  returnNumber: string;
  returnStateCode: string;
  returnLineItems: IRequestProductReturnDetails[];
  note: string;
}): Promise<ICreateReturnResponse> => {
  const paymentResponse = await httpRequest<ICreateReturnResponse>({
    endpoint: "/api/return-order/update",
    method: "POST",
    body: requestBody,
  });
  return paymentResponse;
};

export const getCalculationDetails = async (requestBody: IReturnCalculateRequestModel): Promise<IReturnCalculateResponse> => {
  const calculationDetails = await httpRequest<IReturnCalculateResponse>({
    endpoint: "/api/account/return-order/calculate",
    method: "POST",
    body: requestBody,
  });
  return calculationDetails;
};

export const deleteReturnOrder = async (returnNumber: string): Promise<boolean> => {
  const queryString = `returnNumber=${encodeURIComponent(returnNumber)}`;

  const deleteReturnOrderResponse = await httpRequest<boolean>({
    endpoint: `/api/return-order/delete?${queryString}`,
    method: "DELETE",
  });

  return deleteReturnOrderResponse;
};

export const validateOrderNumberAndLineItems = async (requestBody: {
  orderNumber: string;
  userId: number;
  returnStateCode?: string;
  returnLineItems?: IRequestProductReturnDetails[];
}): Promise<ICreateReturnResponse> => {
  const paymentResponse = await httpRequest<ICreateReturnResponse>({
    endpoint: "/api/return-order/validate",
    method: "POST",
    body: requestBody,
  });
  return paymentResponse;
};

export const getEligibleOrderList = async () => {
  const eligibleOrderList = await httpRequest({
    endpoint: "/api/return-order/eligible-order-list",
  });
  return eligibleOrderList;
};
