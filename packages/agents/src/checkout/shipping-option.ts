import { IShippingOption, IShippingRequest } from "@znode/types/shipping";
import { errorStack, logServer } from "@znode/logger/server";

import { Carts_shippingEstimatesByClassType } from "@znode/clients/cp";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { convertCamelCase } from "@znode/utils/server";

export async function getShippingOptions(shippingRequest: IShippingRequest): Promise<IShippingOption[]> {
  try {
    if (
      ((shippingRequest.isShippingEstimator && shippingRequest.shippingPostalCode) ||
        (shippingRequest.shippingCountryCode && shippingRequest.shippingStateCode && shippingRequest.shippingPostalCode)) &&
      shippingRequest.cartNumber
    ) {
      const shippingOptionList = await Carts_shippingEstimatesByClassType(ORDER_DATA_TYPE.CARTS, shippingRequest.cartNumber, shippingRequest.shippingPostalCode);
      const shippingOptions = convertCamelCase(shippingOptionList);
      if (shippingOptions?.length) {
        return shippingOptions;
      }
      return [] as IShippingOption[];
    }
    return [] as IShippingOption[];
  } catch (error) {
    logServer.error("Shipping Options Fetch Error", errorStack(error));
    return [] as IShippingOption[];
  }
}
