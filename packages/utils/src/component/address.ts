import { IAddress, IAddressList } from "@znode/types/address";
import { getLocalStorageData, setLocalStorageData } from "./local-storage-helper";
import { CHECKOUT } from "@znode/constants/checkout";
import { IGuestUserDetails } from "@znode/types/user";

const validateRecommendedAddress = (isMatchedAddress: boolean, selector?: string, recommendedAddressSelector?: string) => {
  if (selector && recommendedAddressSelector) {
    if (!(selector.trim().toLocaleLowerCase() === recommendedAddressSelector.trim().toLocaleLowerCase())) {
      isMatchedAddress = false;
    }
    return isMatchedAddress;
  }
  return isMatchedAddress;
};

export const matchAddress = (recommendedAddress: IAddressList, address: IAddress) => {
  try {
    let isMatchedAddress = true;
    if (recommendedAddress.addressList && recommendedAddress.addressList.length > 0) {
      for (let i = 0; i < recommendedAddress.addressList?.length; i++) {
        isMatchedAddress = validateRecommendedAddress(isMatchedAddress, address?.address1, recommendedAddress.addressList[i]?.address1);
        isMatchedAddress = validateRecommendedAddress(isMatchedAddress, address?.address2, recommendedAddress.addressList[i]?.address2);
        isMatchedAddress = validateRecommendedAddress(isMatchedAddress, address?.cityName, recommendedAddress.addressList[i]?.cityName);
        isMatchedAddress = validateRecommendedAddress(isMatchedAddress, address?.stateName, recommendedAddress.addressList[i]?.stateName);
        isMatchedAddress = validateRecommendedAddress(isMatchedAddress, address?.countryName, recommendedAddress.addressList[i]?.countryName);
        isMatchedAddress = validateRecommendedAddress(isMatchedAddress, address?.postalCode, recommendedAddress.addressList[i]?.postalCode);
      }
    }
    return isMatchedAddress;
  } catch (error) {
    return {} as boolean;
  }
};

export function getGuestUserDetails(cartNumber?: string): IGuestUserDetails | null {
  const guestUser = getLocalStorageData(CHECKOUT.GUEST_USER_KEY + cartNumber);
  return guestUser ? JSON.parse(guestUser) : null;
}

export const saveGuestUserDetails = (cartNumber: string, guestUserDetails: IGuestUserDetails): void => {
  setLocalStorageData(CHECKOUT.GUEST_USER_KEY + cartNumber, JSON.stringify(guestUserDetails));
};
