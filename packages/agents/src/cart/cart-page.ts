import { ICartPageDetailsResponse } from "@znode/types/cart-page-details";
import { getSavedUserSession } from "@znode/utils/common";
import { getCartPageSettings } from "./cart-page-settings/cart-page-settings";
import { removeSelectedShippingOption } from "./remove-selected-shipping-option";

export async function getCartPageDetails(): Promise<ICartPageDetailsResponse> {
  const user = await getSavedUserSession();
  await removeSelectedShippingOption(user);

  const cartPagePortalDetails = await getCartPageSettings();
  return { cartPagePortalDetails, user };
}
