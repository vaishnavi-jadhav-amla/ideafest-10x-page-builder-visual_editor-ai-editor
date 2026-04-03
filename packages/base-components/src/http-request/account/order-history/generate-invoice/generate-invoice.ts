/* eslint-disable @typescript-eslint/no-explicit-any */
import { ICommerceCollectionClassDetail } from "@znode/types/order";
import { httpRequest } from "../../../base";

export const generateInvoiceDetails = async (orderNumbers: string): Promise<ICommerceCollectionClassDetail[] | any> => {
  const response = await httpRequest<ICommerceCollectionClassDetail[]>({
    endpoint: "/api/account/order/generate-invoice",
    method: "POST",
    body: { orderNumbers },
  });
  return response;
};
