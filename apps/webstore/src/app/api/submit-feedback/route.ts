


import {submitCustomerFeedback} from "@znode/agents/customer-feedback";
import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

export async function POST(request: Request) {
  try {
    const requestModel = await request.json();
    const portalHeader =await getPortalHeader();
    const {storeCode}=portalHeader;
    const response = await submitCustomerFeedback(requestModel, storeCode||"");
    return sendSuccess(response);
  } catch (error) {
    return sendError("Internal server error."+ String(error), 500);
  }
}