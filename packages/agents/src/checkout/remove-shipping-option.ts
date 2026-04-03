import { Shippings_removeShippingByClassNumber } from "@znode/clients/cp";
import { errorStack, logServer } from "@znode/logger/server";

export async function removeShippingByClassNumber(cartNumber: string): Promise<boolean> {
  try {
    let status = false;
    if (cartNumber) {
      const removeShippingResponse = await Shippings_removeShippingByClassNumber(cartNumber);
      status = removeShippingResponse?.IsSuccess || false;
    }
    return status;
  } catch (error) {
    logServer.error("Failed to remove Shipping Options.", errorStack(error));
    return false;
  }
}
