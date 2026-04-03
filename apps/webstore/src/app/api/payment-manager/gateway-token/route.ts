import { clientToken } from "@znode/agents/payment";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerGuid = String(searchParams.get("customerGuid"));
    const configurationSetCode = String(searchParams.get("configurationSetCode"));
    if (configurationSetCode) {
      const paymentClientToken = await clientToken(configurationSetCode, customerGuid);
      return sendSuccess(paymentClientToken, "Payment token generated successfully.");
    } else {
      return sendError(`Invalid ConfigurationSetCode: ${configurationSetCode}`, 404);
    }
  } catch(error) {
    return sendError("Internal server error." + String(error), 500);
  }
}
