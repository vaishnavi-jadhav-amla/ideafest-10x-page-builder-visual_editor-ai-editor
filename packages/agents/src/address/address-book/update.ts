import { AREA, errorStack, logServer } from "@znode/logger/server";
import { WebStoreAccount_updateAccountAddress } from "@znode/clients/v1";
import { getAddressById } from "./get-address-by-id";
import { getSavedUserSession } from "@znode/utils/common";
import { convertCamelCase } from "@znode/utils/server";

/**
 * Updates the address with the Default Billing or Shipping flag based on the address ID.
 * @param addressId - The ID of the address to be updated.
 * @param isDefaultBilling - Whether the address should be set as the default billing address.
 * @param portalId - The ID of the portal.
 * @returns Updated address data or null if an error occurs.
 */
export async function updateAddressBillingShippingFlag(addressId: number, isDefaultBilling: boolean, portalId: number, userInfo: { accountId?: number; userId?: number }) {
  try {
    // Get the current user session.
    const currentUser = await getSavedUserSession();

    // Fetch the address by its ID.
    let userAddress = await getAddressById(addressId, portalId, userInfo);

    // If address is found, update its userId and set default flags accordingly.
    if (userAddress) {
      userAddress.userId = currentUser?.userId;

      if (isDefaultBilling) {
        userAddress.isDefaultBilling = true;
      } else {
        userAddress.isDefaultShipping = true;
      }
    }

    //Create/Update the address of the user
    const updatedAddress = await WebStoreAccount_updateAccountAddress(userAddress);
    userAddress = updatedAddress?.AccountAddress;
    if (userAddress) {
      userAddress.hasError = updatedAddress?.HasError;
    }

    if (userAddress?.addressId && userAddress?.addressId > 0) {
      userAddress.RoleName = currentUser?.roleName;
    }

    return convertCamelCase(userAddress);
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));
    return null;
  }
}
