import { sendError, sendSuccess } from "@znode/utils/server";

import { IStockNotificationRequest } from "@znode/types/product";
import { getPortalDetails } from "@znode/agents/portal/portal";
import { submitStockRequest } from "@znode/agents/product";

export async function POST(request: Request) {
  try {
    const payload: IStockNotificationRequest = await request.json();
    
    const portalData = await getPortalDetails();
    if (portalData) {
      const { portalId, publishCatalogId } = portalData;
      payload.portalId = portalId;
      payload.catalogId = publishCatalogId;
      const submitData = await submitStockRequest(payload);
      return sendSuccess(
        {
          isSuccess: submitData,
        },
        "Stock notification submitted successfully"
      );
    }
    return sendError("Invalid Portal ID", 403);
  } catch (error) {
    return sendError("An error occurred while submitting the stock notification. " + String(error), 500);
  }
}
