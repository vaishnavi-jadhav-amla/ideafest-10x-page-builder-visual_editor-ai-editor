import { ADDRESS } from "@znode/constants/address";
import { IAddress, IAddressList } from "@znode/types/address";
import { IShoppingCart } from "@znode/types/shopping";
import { IUpdateAddressResponse } from "@znode/types/user";

export function mapAddressListViewModel(address: IAddress, addressType: string) {
  const addressListViewModel: IAddressList = {};
  address.stateCode = address.stateName;

  if (address.useSameAsShippingAddress) {
    addressListViewModel.shippingAddress = address;
    addressListViewModel.billingAddress = address;
  } else {
    // Clear billing or shipping flags if they're separately managed
    if (addressType === ADDRESS.SHIPPING_ADDRESS_TYPE) {
      addressListViewModel.shippingAddress = { ...address, isBilling: false, useSameAsShippingAddress: false };
      if (addressListViewModel.billingAddress) {
        addressListViewModel.billingAddress.useSameAsShippingAddress = false;
      }
    } else if (addressType === ADDRESS.BILLING_ADDRESS_TYPE) {
      addressListViewModel.billingAddress = { ...address, isShipping: false, useSameAsShippingAddress: false };
      if (addressListViewModel.shippingAddress) {
        addressListViewModel.shippingAddress.useSameAsShippingAddress = false;
      }
    }
  }
  return addressListViewModel;
}

export function getUpdateAddressResponse(
  addressModel: IAddress,
  status: boolean,
  errorMessage: string,
  addressType: string,
  successMessage: string,
  cartModelResponseData?: IShoppingCart
) {
  const updateAddressResponse: IUpdateAddressResponse = {
    status: status,
    error: errorMessage,
    addressType: addressType,
    addressModel: addressModel,
    cartModelResponseData: cartModelResponseData,
    successMessage: successMessage,
  };
  return updateAddressResponse;
}
