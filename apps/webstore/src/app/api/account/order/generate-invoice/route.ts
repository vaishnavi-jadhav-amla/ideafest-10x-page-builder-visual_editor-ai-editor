import { sendError, sendSuccess } from "@znode/utils/server";

import { getOrderInvoiceDetails } from "@znode/agents/account/order/get-order-invoice";

export async function POST(request: Request) {
  try {
    const generateInvoiceRequestModel = await request.json();

    const invoiceData = await getOrderInvoiceDetails(generateInvoiceRequestModel?.orderNumbers);
    return sendSuccess(invoiceData, "Order invoice data fetching  successfully.");
  } catch (error) {
    return sendError("An error occurred while fetching the order invoice data " + String(error), 500);
  }
}
