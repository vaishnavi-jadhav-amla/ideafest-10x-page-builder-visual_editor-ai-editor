import { AREA, errorStack, logServer } from "@znode/logger/server";

import { Carts_countByClassType } from "@znode/clients/cp";
import { ORDER_DATA_TYPE } from "@znode/constants/order";

export async function getCartCount(cartNumber: string, initiator?: string): Promise<number> {
  if (!cartNumber || cartNumber === "undefined" ) {
    logServer.info(AREA.CART, `Cart count for cartNumber:${cartNumber} not updated from ${initiator}.`);
    return 0;
  }

  try {   
    const response = await Carts_countByClassType(ORDER_DATA_TYPE.CARTS, cartNumber);
    return response?.CartCount || 0;
  } catch (error) {
    logServer.error(AREA.CART, errorStack(error));
    return 0;
  }
}
