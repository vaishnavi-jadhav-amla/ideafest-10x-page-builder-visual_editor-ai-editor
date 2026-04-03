import { getPaymentConfigurationByCode } from "@znode/agents/payment/payment-configuration";
import { sendError, sendSuccess } from "@znode/utils/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentConfigurationCode = searchParams.get("configurationSetCode");
    if (paymentConfigurationCode) {
      const paymentConfiguration = await getPaymentConfigurationByCode(paymentConfigurationCode);
      return sendSuccess(paymentConfiguration, "Payment configurations retrieved successfully.");
    }  else {
      return sendError(`Invalid ConfigurationCode: ${paymentConfigurationCode}`, 404);
    }
  } catch(error) {
    return sendError("Internal server error." + String(error), 500);
  }
}
