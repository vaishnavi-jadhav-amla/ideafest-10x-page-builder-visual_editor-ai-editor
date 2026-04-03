import {createPayment } from "@znode/agents/payment/payment-manager";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const { paymentRequest } = requestBody || {};
    const paymentResponse = await createPayment(paymentRequest);
    return sendSuccess(paymentResponse, "Payment created successfully.");
  } catch(error) {
    return sendError("Internal server error." + String(error), 500);
  }
}