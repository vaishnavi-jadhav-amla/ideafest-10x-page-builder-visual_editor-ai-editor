import { AREA, errorStack, logServer } from "@znode/logger/server";

import { WebStoreAccount_getAddress } from "@znode/clients/v1";
import { convertCamelCase } from "@znode/utils/server";
import { getCountries } from "../../common";

/**
 *Get address details on the basis of address id.
 * @param addressId
 * @returns Returns address details
 */
// eslint-disable-next-line no-unused-vars
export async function getAddressById(addressId: number, portalId: number, userInfo: { accountId?: number; userId?: number }) {
  try {
    if (addressId <= 0) return null;
    const addressResponse = await WebStoreAccount_getAddress(addressId);
    const formattedResponse = convertCamelCase(addressResponse);
    const countriesList = await getCountries(portalId);

    const { accountAddress } = formattedResponse;

    const validUser =
      accountAddress.dontAddUpdateAddress ||
      ((userInfo?.accountId && userInfo.accountId === accountAddress?.accountId) ||
      (accountAddress?.userId && userInfo?.userId === accountAddress.userId));
    if (!validUser) return { hasError: true };

    const addressDetails = {
      ...accountAddress,
      hasError: false,
      stateCode: accountAddress.stateCode ?? accountAddress.stateName,
      countries: countriesList,
    };

    return addressDetails;
  } catch (error) {
    logServer.error(AREA.CHECKOUT, errorStack(error));
    return null;
  }
}
