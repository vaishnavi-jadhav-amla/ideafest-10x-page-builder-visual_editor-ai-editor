import { AREA, errorStack, logServer } from "@znode/logger/server";
import { Account_addressList, WebStoreAccount_getUserAddressList } from "@znode/clients/v1";
import { FilterCollection, FilterKeys, FilterOperators, convertCamelCase, ExpandCollection } from "@znode/utils/server";
import { IAddress } from "@znode/types/address";
import { IFilterTuple } from "@znode/types/filter";
import { getUserFilters } from "../../common";
import { getAccountAddressExpands, getAddressExpands, getAddressListData } from "../checkout/address";
import { IUser } from "@znode/types/user";
import { ADDRESS } from "@znode/constants/address";

/**
 * Get the list of addresses for a user or account.
 * @param userId - The ID of the user.
 * @param accountId - The ID of the account.
 * @returns The user's address list or an empty address object if no address is found.
 */

export async function getUserAddressList(userId: number, accountId: number) {
  try {
    let addressData;
    if (accountId > 0) {
      const expands: ExpandCollection = getAccountAddressExpands();
      const filters: FilterCollection = new FilterCollection();
      filters.add(FilterKeys.AccountId, FilterOperators.Equals, accountId.toString());
      const accountAddressResponse = await Account_addressList(expands, filters.filterTupleArray, undefined, undefined, undefined);
      addressData = convertCamelCase(accountAddressResponse);
    } else {
      //Get Address List of logged in user.
      const expands: ExpandCollection = getAddressExpands();
      const filters: IFilterTuple[] = getUserFilters(undefined, undefined, userId);
      const userAddressResponse = await WebStoreAccount_getUserAddressList(expands, filters, undefined, undefined, undefined);
      addressData = convertCamelCase(userAddressResponse);
      addressData.addressList = addressData.userAddressList;
    }
    if (addressData) {
      addressData.billingAddress = addressData.addressList?.find((address: IAddress) => address.isDefaultBilling);
      addressData.shippingAddress = addressData.addressList?.find((address: IAddress) => address.isDefaultShipping);
      return addressData;
    } else {
      const defaultAddress: IAddress = {
        userId: userId,
        accountId: accountId,
      };
      return defaultAddress;
    }
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));
    return null;
  }
}

export const getAddressListCount = async () => {
  const address = await getAddressListData(0, true);
  return address.addressList?.length || 0;
};

export const getUserAccessFlag = (userDetails: IUser): boolean => {
  if (userDetails && (!userDetails?.accountId || userDetails.roleName === ADDRESS.ADMINISTRATOR_ROLE_NAME)) return true;
  return false;
};
