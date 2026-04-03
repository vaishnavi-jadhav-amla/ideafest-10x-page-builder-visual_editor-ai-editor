import { sendSuccess } from "@znode/utils/server";

export const mockRoutesMap = new Map<string, () => Promise<Response>>();

mockRoutesMap.set("cart/get-cart-items", async () => {
  const response = await import("@znode/constants/api-mocks/cart/get-cart-items.json");
  return sendSuccess(response.default, "Cart items retrieved successfully.");
});

mockRoutesMap.set("cart/get-cart-number", async () => {
  const cartNumber = "C-10092025-6556";
  return sendSuccess(cartNumber, "Cart number retrieved successfully");
});

mockRoutesMap.set("cart/cart-summary", async () => {
  const response = await import("@znode/constants/api-mocks/cart/cart-summary.json");
  return sendSuccess(response.default, "Cart summary retrieved successfully");
});

mockRoutesMap.set("checkout-address/address-list", async () => {
  const response = await import("@znode/constants/api-mocks/checkout-address/address-list.json");
  return sendSuccess(response.default);
});

mockRoutesMap.set("common/get-country", async () => {
  const response = await import("@znode/constants/api-mocks/common/get-country.json");
  return sendSuccess(response?.default?.data ?? [], "Country list retrieved successfully.");
});
