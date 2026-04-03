import { getPortalHeader, sendSuccess } from "@znode/utils/server"; // Import sendError for error handling
import { getStores } from "@znode/agents/store-locator";
import { IStoreLocator } from "@znode/types/store-locator";

export async function GET() {
  // Fetch the list of stores using getStores
  const portalData = await getPortalHeader();
  const storeData: IStoreLocator = await getStores(portalData.portalId);

  return sendSuccess({ data: storeData }, "Store list retrieved successfully.");
}
