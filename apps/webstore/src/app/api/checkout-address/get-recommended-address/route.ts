import { getRecommendedAddress } from "@znode/agents/address";
import { sendError, sendSuccess } from "@znode/utils/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const { userEnteredAddress } = requestBody;

    if (userEnteredAddress) {
      const recommendedAddress = await getRecommendedAddress(userEnteredAddress);
      return sendSuccess(recommendedAddress);
    } else {
      return sendError("Request body is missing while fetching recommended address details", 404);
    }
  } catch (error) {
    return sendError("An error occurred while fetching recommended address details" + String(error), 500);
  }
}
