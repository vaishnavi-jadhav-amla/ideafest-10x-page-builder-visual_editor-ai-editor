import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { IAllLocationInventory } from "@znode/types/product";
import { SETTINGS } from "@znode/constants/settings";
import { allInventoryLocations } from "@znode/agents/product";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const { localeCode, storeCode, publishCatalogCode } = await getPortalHeader();
    const inventoryDetails: IAllLocationInventory = await allInventoryLocations(
      Number(productId),
      publishCatalogCode || "",
      localeCode || SETTINGS.DEFAULT_LOCALE,
      storeCode || ""
    );
    return sendSuccess(inventoryDetails, "inventory detail list retrieved successfully ");
  } catch (error) {
    return sendError("An error occurred while fetching the inventory details." + String(error), 500);
  }
}
