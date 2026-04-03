/* eslint-disable @typescript-eslint/no-explicit-any */
import { objectToQueryString } from "@znode/utils/component";
import { httpRequest } from "../../base";
import { IAddress, IAddressData, IAddressList } from "@znode/types/address";
import { IShoppingCart } from "@znode/types/shopping";

export const getAddressList = async (userId: number, isAddressBook: boolean) => {
  const addressDetails = await httpRequest<IAddressList>({ endpoint: "/api/account/address/get-address-list", body: { userId, isAddressBook } });
  return addressDetails;
};

export const deleteAddress = async (props: { addressId: number }) => {
  const deleteAddress = await httpRequest<string>({ endpoint: "/api/account/address/delete-address", body: props });
  return deleteAddress;
};

export const updateAddressBookBillingShippingFlag = async (addressId: number, isDefaultBillingAddress?: boolean) => {
  const requestBody = {
    addressId: addressId ?? 0,
    isDefaultBillingAddress: isDefaultBillingAddress ?? false,
  };
  const queryString: string = objectToQueryString(requestBody);
  const deleteAddress = await httpRequest<IAddressData>({ endpoint: `/api/account/address/update-address-type?${queryString}` });
  return deleteAddress;
};

/**
 * Saves an address to the user's address book.
 * @param address The address to be saved.
 * @param addressType The type of address to be saved (e.g. billing, shipping).
 * @param cartModel The cart model containing the address.
 * @returns The saved address.
 */
export const saveUserAddressBookAddress = async (address: IAddress, addressType: string, cartModel: IShoppingCart) => {
  const addressDetails = await httpRequest<IAddress>({ endpoint: "/api/account/address/save-address-book", body: { address, addressType, cartModel } });
  return addressDetails;
};
