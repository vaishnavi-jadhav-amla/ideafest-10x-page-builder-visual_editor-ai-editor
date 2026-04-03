import { CHECKOUT } from "@znode/constants/checkout";
import { ICosts } from "@znode/types/cart";
import { IGuestUserDetails } from "@znode/types/user";
import { getLocalStorageData } from "@znode/utils/component";

export const getCostFactorValueByName = (costFactors: ICosts[] | undefined, name: string) => {
  if (costFactors && name) {
    const factor = costFactors.find((f: ICosts) => f.name === name);
    return factor?.value ? parseFloat(factor.value) : 0;
  }
  return undefined;
};

export const getCheckoutGuestUserDetails = async (inputCartNumber: string) => {
  if (inputCartNumber) {
    const guestUser = getLocalStorageData(CHECKOUT.GUEST_USER_KEY + inputCartNumber);
    const guestUserDetails: IGuestUserDetails | null = guestUser ? JSON.parse(guestUser) : null;
    return guestUserDetails;
  }
};
