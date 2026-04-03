import { sendError, sendSuccess } from "@znode/utils/server";

import { getPortalDetails } from "@znode/agents/portal/portal";

export async function GET() {
  try {
    
    const portalData = await getPortalDetails();
    const { portalLocales } = portalData;
    const PortalDetails = {
      portalLocales: portalLocales,
      portalId: portalData.portalId,
      localeId: portalData.localeId,
      outOfStockMessage: portalData.outOfStockMessage,
      inStockMessage: portalData.inStockMessage,
      backOrderMessage: portalData.backOrderMessage,
    };
    return sendSuccess(PortalDetails, "Portal details received successfully.");
  } catch (error) {
    return sendError("An error occurred while fetching the portal details" + String(error), 500);
  }
}
