import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { getCountries } from "@znode/agents/common";

export async function GET() {
  try {
    const { portalId } = await getPortalHeader();
    const countryList = await getCountries(portalId);
    return sendSuccess(countryList, "Country list retrieved successfully.");
  } catch (error) {
    return sendError("An error occurred while fetching the list of country. " + String(error), 500);
  }
}
