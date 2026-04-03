import { ISaveShippingDetails, IShippingOption, IShippingRequest } from "@znode/types/shipping";

import { httpRequest } from "../base";

export const getShippingOptions = async (shippingRequest: IShippingRequest): Promise<IShippingOption[]> => {
  const shippingOptionsData = await httpRequest<IShippingOption[]>({
    endpoint: "/api/shipping-options",
    method: "POST",
    body: { shippingRequest },
  });

  return shippingOptionsData;
};

export const saveShippingDetails = async (updateShippingDetailsRequest: ISaveShippingDetails): Promise<boolean> => {
  const response = await httpRequest<boolean>({
    endpoint: "/api/save-shipping-details",
    method: "POST",
    body: { updateShippingDetailsRequest },
  });

  return response;
};
