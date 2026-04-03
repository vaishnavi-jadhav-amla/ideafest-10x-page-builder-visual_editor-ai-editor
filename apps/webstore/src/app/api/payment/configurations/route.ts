import { sendError, sendSuccess } from "@znode/utils/server";

import { getPaymentConfigurations } from "@znode/agents/payment/payment-configuration";
import { getPortalDetails } from "@znode/agents/portal";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const portalHeader = await getPortalDetails();
    if (portalHeader) {
      const paymentConfigurationList = await getPaymentConfigurations(portalHeader.portalId, portalHeader.storeCode);
      return sendSuccess(paymentConfigurationList);
    }
    return sendError("Invalid Portal", 403);
  } catch (error) {
    return sendError("Internal server error." + String(error), 500);
  }
}
