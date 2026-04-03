import { AREA, errorStack, logServer } from "@znode/logger/server";
import { ExpandCollection, ExpandKeys, convertCamelCase } from "@znode/utils/server";

import { Carts_calculateCartByCartNumber } from "@znode/clients/cp";
import { ICartSummary } from "@znode/types/cart";
import { getPortalDetails } from "../../portal";
import { mapCalculation } from "../mapper";

/**
 * Calculate Carts Details API allows users to obtain calculated details of a shopping cart,
 * including various financial components such as discounts, shipping, taxes, and vouchers.
 *
 * @param cartNumber - The unique identifier for the cart whose details are to be fetched.
 * @param isCart - Indicates that the request is from the cart page. If `true`, the API assumes
 *                 the context is the shopping cart page.
 * @param isShippingOptionSelected - Indicates whether a shipping option has been selected
 *                                   within the cart page's shipping estimator section.
 *                                   This parameter is not applicable to the checkout page.
 *
 * @returns A promise resolving to an `ICartSummary` object containing calculated cart details
 *          or `null` if an error occurs.
 */

export async function getCartSummary(cartNumber: string, isCart = false, isShippingOptionSelected = false, isFromQuote = false, isTaxEmpty = false): Promise<ICartSummary | null> {
  try {
    const portalData = await getPortalDetails();
    const expands: ExpandCollection = getCartSummaryExpands(isCart, isShippingOptionSelected, isFromQuote, isTaxEmpty);
    const cartSummaryData = await Carts_calculateCartByCartNumber(cartNumber, expands);
    const formattedCartSummaryData = convertCamelCase(cartSummaryData);
    const { costFactorResponse: costs, discountFactorResponse: discounts, cartId, subTotal, total } = formattedCartSummaryData;

    const cartSummary: ICartSummary = {
      cartId: cartId,
      costs: costs,
      discounts: discounts,
      subTotal: subTotal,
      total: total,
    };

    return mapCalculation(cartSummary, portalData?.currencyCode);
  } catch (error) {
    logServer.error(AREA.CART, errorStack(error));
    return null;
  }
}

export function getCartSummaryExpands(isCart: boolean, isShippingOptionSelected: boolean, isFromQuote?: boolean, isTaxEmpty = false) {
  const expands = new ExpandCollection();
  if (!isFromQuote) {
    expands.add(ExpandKeys.Discount);
    expands.add(ExpandKeys.Voucher);
  }

  if (!isCart || (isCart && isShippingOptionSelected)) {
    expands.add(ExpandKeys.Shipping);
  }

  if (!isCart) {
    !isTaxEmpty && expands.add(ExpandKeys.Tax);
    if (!isFromQuote) {
      expands.add(ExpandKeys.Voucher);
    }
  }

  return expands;
}
