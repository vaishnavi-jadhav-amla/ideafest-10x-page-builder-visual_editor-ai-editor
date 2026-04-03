import { getOfflinePaymentConfigurations } from "@znode/agents/payment/payment-configuration";
export const dynamic = "force-dynamic";
import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

export async function GET() {
    try {
        const portalHeader = await getPortalHeader();
        if (portalHeader.portalId) {
            const paymentConfigurationList = await getOfflinePaymentConfigurations(portalHeader.portalId);
            return sendSuccess(paymentConfigurationList, "Payment configurations retrieved successfully.");
        }
        return sendError("Invalid Portal Id", 403);
    } catch (error) {
        return sendError("Internal server error." + String(error), 500);
    }
}