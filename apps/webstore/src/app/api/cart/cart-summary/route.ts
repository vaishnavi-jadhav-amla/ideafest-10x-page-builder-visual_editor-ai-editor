import { sendError, sendSuccess } from "@znode/utils/server";

import { COMMON } from "@znode/constants/common";
import { getCartSummary } from "@znode/agents/cart";
import { stringToBooleanV2 } from "@znode/utils/common";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const cartNumber = searchParams.get("cartNumber");
    const isCart = searchParams.get("isCart") ?? COMMON.FALSE_VALUE;
    const isFromQuote = searchParams.get("isFromQuote") ?? COMMON.FALSE_VALUE;
    const isTaxEmpty = searchParams.get("isTaxEmpty") ?? COMMON.FALSE_VALUE;
    const isShippingOptionSelected = searchParams.get("isShippingOptionSelected") ?? COMMON.FALSE_VALUE;

    if (!cartNumber) {
      return sendError("Invalid cart number", 400);
    }
    const summary = await getCartSummary(
      cartNumber,
      stringToBooleanV2(isCart),
      stringToBooleanV2(isShippingOptionSelected ?? COMMON.FALSE_VALUE),
      stringToBooleanV2(isFromQuote),
      stringToBooleanV2(isTaxEmpty)
    );

    return sendSuccess(summary, "Cart summary retrieved successfully");
  } catch (error) {
    return sendError("An error occurred while fetching the cart summary" + String(error), 500);
  }
}
