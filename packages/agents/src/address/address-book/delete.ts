import { AREA, errorStack, logServer } from "@znode/logger/server";
import { Account_deleteAccountAddress, WebStoreAccount_deleteAddress } from "@znode/clients/v1";
import { IAddress, IDeleteAccountAddress } from "@znode/types/address";

import { ADDRESS } from "@znode/constants/address";
import { convertCamelCase, convertPascalCase } from "@znode/utils/server";
import { getAddressById } from "./get-address-by-id";
import { getSavedUserSession } from "@znode/utils/common";

/**
 * Delete address on the basis of addressId.
 * @param addressId
 * @returns message
 */

export async function deleteAddress(addressId: number, portalId: number, userInfo: { accountId?: number; userId?: number }) {
  try {
    if (addressId <= 0) return "";

    const addressDetails = await getAddressById(addressId, portalId, userInfo);
    if (!addressDetails) return ADDRESS.ERROR_DELETE_ADDRESS;

    // Check if the address is the default shipping and billing address
    if (addressDetails.isDefaultShipping && addressDetails.isDefaultBilling) {
      return ADDRESS.ERROR_DELETE_SHIPPING_ADDRESS_AND_DELETE_BILLING_ADDRESS;
    }
    if (addressDetails.isDefaultShipping) {
      return ADDRESS.ERROR_DELETE_SHIPPING_ADDRESS;
    }
    if (addressDetails.isDefaultBilling) {
      return ADDRESS.ERROR_DELETE_BILLING_ADDRESS;
    }

    // Attempt to delete the address
    const isDeleted = await deleteUserAddress(addressId, convertCamelCase(addressDetails));
    return isDeleted ? ADDRESS.SUCCESS_DELETE_ADDRESS : ADDRESS.ERROR_DELETE_ADDRESS;
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));
    return "";
  }
}

// Delete the address on the basis of AddressId.
export async function deleteUserAddress(addressId: number, addressDetails: IAddress) {
  try {
    const currentUser = await getSavedUserSession();
    if (!currentUser || !addressDetails) {
      logServer.error(AREA.USER, "User session or address details are undefined.");
      return false;
    }

    let isDeleted = false;

    //If account id is greater than 0 delete account address else delete user address.
    if (currentUser.accountId !== undefined && currentUser.accountId > 0 && addressDetails.accountAddressId && addressDetails.accountAddressId > 0) {
      const deleteAccountAddressModel: IDeleteAccountAddress = {
        ids: addressDetails.accountAddressId.toString(),
        portalId: currentUser.portalId || 0,
      };
      const deleteAccountResponse = await Account_deleteAccountAddress(convertPascalCase(deleteAccountAddressModel));
      isDeleted = deleteAccountResponse.IsSuccess === true;
    } else if (currentUser.userId !== undefined) {
      const deleteUserResponse = await WebStoreAccount_deleteAddress(addressId, currentUser.userId);
      const formattedResponse = convertCamelCase(deleteUserResponse);
      isDeleted = formattedResponse?.isSuccess || false;
    }
    return isDeleted;
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));
    return false;
  }
}
