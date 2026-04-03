import { ICartSummary } from "@znode/types/cart";
import { httpRequest } from "../../base";

export const getCartSummary = async (cartNumber: string, isCart = false, isShippingOptionSelected = false, isFromQuote = false, isTaxEmpty = false) => {
  const response = await httpRequest<ICartSummary>({
    endpoint: `/api/cart/cart-summary?cartNumber=${cartNumber}&isCart=${isCart}&isShippingOptionSelected=${isShippingOptionSelected}&isFromQuote=${isFromQuote}&isTaxEmpty=${isTaxEmpty}`,
  });
  return response || [];
};
