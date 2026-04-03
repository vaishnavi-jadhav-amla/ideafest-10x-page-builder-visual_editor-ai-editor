import { IAnonymousUserAddressResponse } from "@znode/types/user";
import { setCart } from "../cart/cart-helper";
import { IAddress } from "@znode/types/address";

const isNonEmptyAddress = (address: IAddress) => Object.keys(address || {}).length > 0;

const buildAddressObject = (userAddressResponse: IAnonymousUserAddressResponse, shippingAddress: IAddress, billingAddress: IAddress) => {
  if (userAddressResponse.shippingAddressId && userAddressResponse.billingAddressId) {
    return {
      shippingAddress,
      billingAddress,
    };
  } else if (userAddressResponse.shippingAddressId) {
    return {
      shippingAddress,
      ...(isNonEmptyAddress(billingAddress) && { billingAddress }),
    };
  } else {
    return {
      billingAddress,
      ...(isNonEmptyAddress(shippingAddress) && { shippingAddress }),
    };
  }
};

export const processUserAddressResponse = async (userAddressResponse: IAnonymousUserAddressResponse, cartNumber: string, shippingAddress: IAddress, billingAddress: IAddress) => {
  if (userAddressResponse && !userAddressResponse.hasError) {
    const address = buildAddressObject(userAddressResponse, shippingAddress, billingAddress);
    await setCart(address, true, cartNumber);
    return true;
  }
  return false;
};
