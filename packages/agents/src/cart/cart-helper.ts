import { CHECKOUT } from "@znode/constants/checkout";
import { CART_COOKIE } from "@znode/constants/cookie";
import { ICartValidation, ICosts } from "@znode/types/cart";
import { IShoppingCart } from "@znode/types/shopping";
import { deleteCookie, getLocalStorageData, setLocalStorageData } from "@znode/utils/component";

export const getCostFactorByType = (costFactors: ICosts[] | undefined, factorName: string): number | undefined => {
  if (!costFactors || !factorName) return undefined;

  const costFactor = costFactors.find((factor: ICosts) => factor.name === factorName);
  if (!costFactor?.value) return factorName === "TaxSummaryList" ? undefined : 0;
  return (factorName === "TaxSummaryList" || factorName === "TaxMessageList")
    ? JSON.parse(costFactor.value)
    : parseFloat(costFactor.value);
};

export const getHighestPriorityCartValidation = (details: ICartValidation[]) => {
  if (details.length === 0) {
    return undefined;
  }
  return details.reduce((lowest, current) => {
    return current.priority < lowest.priority ? current : lowest;
  });
};

export const getCart = async (cartNumber: string): Promise<IShoppingCart | null> => {
  const isServer = typeof window === "undefined";
  if (!isServer) {
    if (cartNumber) {
      const cartKey = CHECKOUT.SESSION_KEY + cartNumber;
      const cartData = getLocalStorageData(cartKey);
      return cartData ? JSON.parse(cartData) : null;
    }
  }
  return null;
};

export const setCart = async (shoppingCart: IShoppingCart | undefined, isGuestUser = false, cartNumber: string) => {
  const isServer = typeof window === "undefined";
  if (!isServer && isGuestUser) {
    if (cartNumber && shoppingCart) {
      const shippingAddress = shoppingCart.shippingAddress;
      const billingAddress = shoppingCart.billingAddress;
      setLocalStorageData(CHECKOUT.SESSION_KEY + cartNumber, JSON.stringify({ shippingAddress, billingAddress }));
    }
  }
};

export function deleteCartCookies() {
  deleteCookie(CART_COOKIE.CART_NUMBER);
  deleteCookie(CART_COOKIE.CART_ID);
}
