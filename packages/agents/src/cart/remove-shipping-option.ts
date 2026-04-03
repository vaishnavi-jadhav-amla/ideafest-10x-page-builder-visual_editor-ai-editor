import { AREA, errorStack, logServer } from "@znode/logger/server";
import { Shippings_removeShippingByClassNumber } from "@znode/clients/cp";

export async function removeShippingByClassNumber(classNumber: string | undefined) {
  try {
    let status = false;
    if (classNumber) {
      const removeShippingResponse = await Shippings_removeShippingByClassNumber(classNumber);
      status = removeShippingResponse?.IsSuccess || false;
    }
    return status;
  } catch (error) {
    logServer.error(AREA.CHECKOUT, errorStack(error));
    return false;
  }
}
