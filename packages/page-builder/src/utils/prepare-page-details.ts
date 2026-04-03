import { getPortalDetails } from "@znode/agents/portal";
import { IPageStructure } from "@znode/types/visual-editor";
import { prepareHeaderData } from "./prepare-header-data";
import { getCartPageDetails, getGlobalAttributeValue } from "@znode/agents/cart";
import { CART_PORTAL_FLAGS } from "@znode/constants/cart";
import { IPortalDetail } from "@znode/types/portal";
import { getCheckoutPageDetails } from "@znode/agents/checkout";

export async function preparePageData(preparedDataCache: IPageStructure) {
  const portalDetails = await getPortalDetails();
  await prepareHeaderData(preparedDataCache);
  await prepareCategoryData(preparedDataCache, portalDetails);
  await prepareProductData(preparedDataCache, portalDetails);
  await prepareCartData(preparedDataCache);
  await prepareCheckoutData(preparedDataCache);
  return preparedDataCache;
}

async function prepareCategoryData(preparedDataCache: IPageStructure, portalDetails: IPortalDetail) {
  if (preparedDataCache.key.includes("category") && Array.isArray(preparedDataCache.data?.content)) {
    const loginToSeePricingAndInventory = getGlobalAttributeValue(portalDetails, CART_PORTAL_FLAGS.LOGIN_TO_SEE_PRICING_INVENTORY);
    const productListPage = preparedDataCache.data.content.map((item, index) => ({ index, item })).find(({ item }) => item?.type === "ProductListPage");
    if (productListPage && productListPage.item?.props?.response?.data) {
      const { index } = productListPage;
      preparedDataCache.data.content[index].props.response.data.isEnableCompare = portalDetails.enableCompare;
      preparedDataCache.data.content[index].props.response.data.productsData.loginToSeePricingAndInventory = loginToSeePricingAndInventory;
      preparedDataCache.data.content[index].props.response.data.sortList = portalDetails.sortList;
    }
  }
}

async function prepareProductData(preparedDataCache: IPageStructure, portalDetails: IPortalDetail) {
  if (preparedDataCache.key.includes("product") && Array.isArray(preparedDataCache.data?.content)) {
    const loginToSeePricingAndInventory = getGlobalAttributeValue(portalDetails, CART_PORTAL_FLAGS.LOGIN_TO_SEE_PRICING_INVENTORY);
    const productDetailsPage = preparedDataCache.data.content.map((item, index) => ({ index, item })).find(({ item }) => item?.type === "ProductDetailsPage");
    if (productDetailsPage && productDetailsPage.item?.props?.response?.data) {
      const { index } = productDetailsPage;
      preparedDataCache.data.content[index].props.response.data.productBasicDetails.isLoginToSeePricing = loginToSeePricingAndInventory;
    }
  }
}

async function prepareCartData(preparedDataCache: IPageStructure) {
  try {
    if (preparedDataCache.key.includes("cart") && Array.isArray(preparedDataCache.data?.content)) {
      const { cartPagePortalDetails, user } = await getCartPageDetails();
      const content = preparedDataCache?.data?.content ?? [];
      const index = content.findIndex((item) => item?.type === "CartPage");
      const cartPage = index !== -1 ? { index, item: content[index] } : null;
      // const cartPage = preparedDataCache.data.content.map((item, index) => ({ index, item })).find(({ item }) => item?.type === "CartPage");
      if (cartPage && cartPage.item?.props?.response) {
        const { index } = cartPage;
        preparedDataCache.data.content[index].props.response.data = { cartPagePortalDetails, user };
      }
    }
  } catch (err) {
    return preparedDataCache;
  }
}

async function prepareCheckoutData(preparedDataCache: IPageStructure) {
  try {
    if (preparedDataCache.key.includes("checkout") && Array.isArray(preparedDataCache.data?.content)) {
      const {
        paymentOptions,
        enableShippingAddressSuggestion,
        approvalType,
        enableApprovalRouting,
        orderLimit,
        recaptchaDetails,
        userDetails,
        generalSetting,
        checkoutPortalData,
      } = await getCheckoutPageDetails();
      const content = preparedDataCache?.data?.content || [];
      const index = content.findIndex((item) => item?.type === "CheckoutPage");
      const checkoutPage = index !== -1 ? { index, item: content[index] } : null;
      // const checkoutPage = preparedDataCache.data.content.map((item, index) => ({ index, item })).find(({ item }) => item?.type === "CheckoutPage");
      if (checkoutPage && checkoutPage.item?.props?.response) {
        const { index } = checkoutPage;

        preparedDataCache.data.content[index].props.response.data = {
          paymentOptions,
          enableShippingAddressSuggestion,
          approvalType,
          enableApprovalRouting,
          orderLimit,
          recaptchaDetails,
          userDetails,
          generalSetting,
          checkoutPortalData,
        };
      }
    }
  } catch (err) {
    return preparedDataCache;
  }
}
