import { AREA, errorStack, logServer } from "@znode/logger/server";
import { AccountQuote_isLastApprover, FilterTuple, Portal_getPortalApprovalDetailsById } from "@znode/clients/v1";
import { CommerceCollections_generateFinalizeNumber, CommerceCollections_placeOrder, Payments_payments, Shippings_orderShipment } from "@znode/clients/cp";
import { FilterCollection, FilterKeys, FilterOperators, convertCamelCase, convertPascalCase, generateTagName } from "@znode/utils/server";
import { ICheckout, IConvertToOrder, IConvertedToOrderResponse, IGenerateFinalizeNumber } from "@znode/types/checkout";
import { IGlobalAttributeGroupModel, IGlobalAttributeModel } from "@znode/types/attribute";
import { IShoppingCart, IUpdateOrderPayment, IUpdateOrderShipment } from "@znode/types/shopping";
import { getCookie, getLocalStorageData, removeLocalStorageData, setCookie, setLocalStorageData } from "@znode/utils/component";

import { ADDRESS } from "@znode/constants/address";
import { CACHE_KEYS } from "@znode/constants/cache-keys";
import { CHECKOUT } from "@znode/constants/checkout";
import { COMMON } from "@znode/constants/common";
import { ICheckoutRecaptcha } from "@znode/types/common";
import { IPortalDetail } from "@znode/types/portal";
import { ISaveShippingDetails } from "@znode/types/shipping";
import { PAYMENT_SUBTYPE } from "@znode/constants/payment";
import { getAttributeValues } from "../common";
import { getPortalDetails } from "../portal";
import { getSavedUserSession } from "@znode/utils/common";
import { getShoppingCart } from "../shopping/shopping";
import { getUserGlobalAttributes } from "../user";
import { voidRefundPayment } from "../refund/payment-refund";

// Shippings_orderShipment

export function getMembersNameAndDescription(shippingConstraintObject: { [key: string]: string }) {
  const enumKeys = Object.keys(shippingConstraintObject);
  const result = enumKeys.map((key) => ({
    shippingConstraintCode: key,
    isSelected: false,
    description: shippingConstraintObject[key],
  }));
  return result;
}

export async function getUserCartDetails(checkoutModel: ICheckout, cartModel: IShoppingCart) {
  if (cartModel) {
    checkoutModel.orderStatus = cartModel?.orderStatus;
    checkoutModel.quoteId = cartModel?.omsQuoteId;
    checkoutModel.subTotal = cartModel?.subTotal;
    checkoutModel.total = cartModel?.total;
    checkoutModel.isLevelApprovedOrRejected = cartModel?.isLevelApprovedOrRejected;
    checkoutModel.inHandDate = cartModel?.inHandDate;
    checkoutModel.custom1 = cartModel?.custom1;
    checkoutModel.custom2 = cartModel?.custom2;
    checkoutModel.custom3 = cartModel?.custom3;
    checkoutModel.custom4 = cartModel?.custom4;
    checkoutModel.custom5 = cartModel?.custom5;
    const shippingConstraintsEnum: { [key: string]: string } = {
      ShipComplete: "ShipComplete",
      ShipPartial: "ShipPartial",
    };
    checkoutModel.shippingConstraints = getMembersNameAndDescription(shippingConstraintsEnum);
    if (cartModel.omsQuoteId && checkoutModel.quoteId && checkoutModel.quoteId > 0) {
      checkoutModel.isLastApprover = await AccountQuote_isLastApprover(cartModel?.omsQuoteId);
    } else checkoutModel.isLastApprover = cartModel?.isLastApprover ?? false;
  }
}

export async function getCart(portalData: IPortalDetail, userId?: number): Promise<IShoppingCart> {
  const isServer = typeof window === "undefined";
  if (!isServer) {
    if (!userId) {
      userId = (await getSavedUserSession())?.userId;
    }
    const cartData = getLocalStorageData(CHECKOUT.SESSION_KEY + (getCookie(CHECKOUT.COOKIE_MAPPING_ID) || userId || "")) || undefined;
    return cartData ? JSON.parse(cartData) : removeLocalStorageData(CHECKOUT.SESSION_KEY + (getCookie(CHECKOUT.COOKIE_MAPPING_ID) || userId || ""));
  }
  return getShoppingCart(portalData);
}

export function setCart(shoppingCart: IShoppingCart) {
  const isServer = typeof window === "undefined";
  if (!isServer && (shoppingCart?.userId || shoppingCart?.cookieMappingId) && shoppingCart?.shoppingCartItems && shoppingCart?.shoppingCartItems?.length > 0) {
    if (shoppingCart?.userId) setCookie(CHECKOUT.COOKIE_MAPPING_ID, shoppingCart?.cookieMappingId || "");
    setLocalStorageData(CHECKOUT.SESSION_KEY + (shoppingCart?.cookieMappingId || shoppingCart.userId), JSON.stringify(shoppingCart));
  }
}

export async function getUserInfo(checkoutModel: ICheckout, portalData?: IPortalDetail) {
  const session = await getSavedUserSession();
  if (session) {
    checkoutModel.userId = session.userId;
    checkoutModel.roleName = session.roleName;
    checkoutModel.permissionCode = session.permissionCode;
    checkoutModel.budgetAmount = session.budgetAmount;
    if (portalData?.enableApprovalManagement) {
      checkoutModel.enableApprovalRouting = portalData.enableApprovalManagement;
      const filters = new FilterCollection();
      filters.add(
        COMMON.CACHE_TAG,
        FilterOperators.Equals,
        generateTagName(`${CACHE_KEYS.GET_PORTAL_APPROVAL_DETAILS_BY_ID},${CACHE_KEYS.PORTAL}`, portalData.portalId.toString(), portalData.storeCode || "")
      );
      const cacheInvalidator = new FilterCollection();
      cacheInvalidator.add(
        FilterKeys.CacheTags,
        FilterOperators.Contains,
        generateTagName(
          `${CACHE_KEYS.GET_PORTAL_APPROVAL_DETAILS_BY_ID}, ${CACHE_KEYS.PORTAL}, ${CACHE_KEYS.DYNAMIC_TAG}`,
          portalData.storeCode || "",
          portalData.storeCode || "",
          "GetPortalApprovalDetailsById"
        )
      );

      const portalApproval = await Portal_getPortalApprovalDetailsById(
        portalData?.portalId,
        undefined,
        filters.filterTupleArray,
        undefined,
        cacheInvalidator.filterTupleArray as FilterTuple[]
      );
      const portalApprovalData = convertCamelCase(portalApproval);
      if (portalApprovalData?.portalApprovalModel?.portalApprovalTypeName === CHECKOUT.USERS && portalApprovalData?.portalApprovalModel?.enableApprovalManagement === true) {
        if (session?.isUserLevelApprovalEnabled !== null && session?.userLevelApprovalOrderLimit !== null) {
          checkoutModel.enableApprovalRouting = session.isUserLevelApprovalEnabled;
          checkoutModel.orderLimit = session.userLevelApprovalOrderLimit;
          portalApprovalData.portalApprovalModel.orderLimit = session.userLevelApprovalOrderLimit;
        }
      }
      if (
        portalApprovalData?.portalApprovalModel?.orderLimit === 0 ||
        (checkoutModel?.subTotal && checkoutModel?.subTotal >= (portalApprovalData?.portalApprovalModel?.orderLimit ?? 0))
      )
        checkoutModel.showPlaceOrderButton = false;
      else checkoutModel.showPlaceOrderButton = true;
      checkoutModel.orderLimit = portalApprovalData?.portalApprovalModel?.orderLimit ?? 0;
      checkoutModel.approvalType = portalApprovalData?.portalApprovalModel?.portalApprovalTypeName;
    } else checkoutModel.showPlaceOrderButton = true;
  }
  //For guest user place order button should be always visible.
  else checkoutModel.showPlaceOrderButton = true;
}

export async function getUserDetails(userId: number, portalData: IPortalDetail) {
  const checkoutModel: ICheckout = {};
  const cartModel = await getCart(portalData, userId);
  //Get customer required details from shopping cart.
  await getUserCartDetails(checkoutModel, cartModel);
  //Get customer information from session.
  await getUserInfo(checkoutModel, portalData);
  checkoutModel.shippingId = cartModel?.shippingId;
  checkoutModel.isPendingOrderRequest = checkoutModel.showPlaceOrderButton === false ? true : false;
  checkoutModel.custom1 = cartModel?.custom1;
  checkoutModel.custom2 = cartModel?.custom2;
  checkoutModel.custom3 = cartModel?.custom3;
  checkoutModel.custom4 = cartModel?.custom4;
  checkoutModel.custom5 = cartModel?.custom5;
  checkoutModel.isQuoteRequest = cartModel.isQuoteRequest;
  if (cartModel) cartModel.isPendingOrderRequest = checkoutModel.isPendingOrderRequest;

  await setCart(cartModel);
  return checkoutModel;
}

/** ----------------------------------------------- get user details required on checkout page ------------------------------------------------------------- */
export async function getCheckoutRequiredUserDetails(): Promise<{
  enableShippingAddressSuggestion: boolean;
  enableApprovalRouting: boolean;
  approvalType: string | undefined;
  orderLimit: number | undefined;
  recaptchaDetails?: ICheckoutRecaptcha;
}> {
  const user = await getSavedUserSession();
  const userId = user?.userId || 0;

  const portalData = await getPortalDetails();
  const userDetails = await getUserDetails(userId || 0, portalData);

  const attributeValues = await getAttributeValues(portalData?.globalAttributes || [], [
    "EnableStoreShippingAddressSuggestion",
    "IsReCaptchaRequiredForCheckoutLoggedUser",
    "IsReCaptchaRequiredForGuestUser",
    "SiteKey",
    "SecretKey",
  ]);

  const { EnableStoreShippingAddressSuggestion, IsReCaptchaRequiredForCheckoutLoggedUser, IsReCaptchaRequiredForGuestUser, SiteKey, SecretKey } =
    attributeValues ||
    ({} as {
      EnableStoreShippingAddressSuggestion: string;
      IsReCaptchaRequiredForCheckoutLoggedUser: string;
      IsReCaptchaRequiredForGuestUser: string;
      SiteKey: string;
      SecretKey: string;
    });

  const userGlobalAttributesGroup = convertCamelCase(await getUserGlobalAttributes(userId ?? 0));

  const userShippingAddressSuggestionValue = userGlobalAttributesGroup
    ?.find((a: IGlobalAttributeGroupModel) => a.groupCode === ADDRESS.USER_ADDRESS_SETTINGS)
    ?.attributes?.find((a: IGlobalAttributeModel) => a.attributeCode === ADDRESS.ENABLE_USER_SHIPPING_ADDRESS_SUGGESTION)?.attributeValue;

  const isRecaptchaRequired = () => {
    if (JSON.parse(IsReCaptchaRequiredForCheckoutLoggedUser || "false") && Number(userId) > 0) {
      return true;
    } else if (JSON.parse(IsReCaptchaRequiredForGuestUser || "false") && Number(userId) === 0) {
      return true;
    } else {
      return false;
    }
  };
  const enableUserShippingAddressSuggestion = userShippingAddressSuggestionValue ? JSON.parse(userShippingAddressSuggestionValue) : false;
  const enableShippingAddressSuggestion =
    (EnableStoreShippingAddressSuggestion ? JSON.parse(EnableStoreShippingAddressSuggestion) : false) && (enableUserShippingAddressSuggestion ?? false);

  // Return the required values

  return {
    enableShippingAddressSuggestion,
    enableApprovalRouting: userDetails.enableApprovalRouting || false,
    approvalType: userDetails.approvalType,
    orderLimit: userDetails.orderLimit,
    recaptchaDetails: {
      secretKey: SecretKey || "",
      siteKey: SiteKey || "",
      isRecaptchaRequiredForCheckout: isRecaptchaRequired(),
    },
  };
}

/** ----------------------------------------------- Update Shipping Details ------------------------------------------------------------- */
export async function updateShippingDetails(updateShippingDetailsRequest: ISaveShippingDetails) {
  try {
    let resultStatus = false;
    if (updateShippingDetailsRequest.cartNumber) {
      const updateOrderShipment: IUpdateOrderShipment = {
        classNumber: updateShippingDetailsRequest.cartNumber,
        shippingId: updateShippingDetailsRequest.shippingId,
      };

      if (updateShippingDetailsRequest.inHandDate && updateShippingDetailsRequest.shippingAddressId && updateShippingDetailsRequest.shippingConstraintCode) {
        updateOrderShipment.inHandDate = updateShippingDetailsRequest.inHandDate;
        updateOrderShipment.shippingConstraintCode = updateShippingDetailsRequest.shippingConstraintCode;
        updateOrderShipment.shippingAddressId = updateShippingDetailsRequest.shippingAddressId;
        updateOrderShipment.isShipCompletely = updateShippingDetailsRequest.isShipCompletely;
      }

      //Shippings_orderShipment is the API call to update ShippingAddressID and ShippingOptionID in the Database
      const updateShippingResponse = await Shippings_orderShipment(convertPascalCase(updateOrderShipment));

      if (updateShippingResponse?.IsSuccess) resultStatus = true;
      return resultStatus;
    }
    return resultStatus;
  } catch (error) {
    logServer.error(AREA.CHECKOUT, errorStack(error));
    return false;
  }
}

/** ----------------------------------------------- Update Shipping and billing address IDs ------------------------------------------------------------- */

export async function updateAddressIds(shippingAddressId: number, billingAddressId: number, cartNumber: string, shippingOptionId: number) {
  try {
    let resultStatus = false;
    if (shippingAddressId && cartNumber) {
      const updateOrderShipment: IUpdateOrderShipment = {
        classNumber: cartNumber,
        shippingAddressId: shippingAddressId,
        shippingId: shippingOptionId,
      };

      const updateOrderPayment: IUpdateOrderPayment = {
        classNumber: cartNumber,
        billingAddressId: billingAddressId,
      };

      const [updateShippingResponse, updateBillingResponse] = await Promise.all([
        Shippings_orderShipment(convertPascalCase(updateOrderShipment)),
        Payments_payments(convertPascalCase(updateOrderPayment)),
      ]);

      if (updateShippingResponse?.IsSuccess && updateBillingResponse?.IsSuccess) resultStatus = true;
      return resultStatus;
    }
    return resultStatus;
  } catch (error) {
    logServer.error(AREA.CHECKOUT, errorStack(error));
    return false;
  }
}

/** ----------------------------------------------- Update billing address id ------------------------------------------------------------- */
export async function updateBillingAddressId(billingAddressId: number, cartNumber: string) {
  try {
    let resultStatus = false;
    if (billingAddressId && cartNumber) {
      const session = await getSavedUserSession();
      const userId = session?.userId ? session?.userId : 0;

      if (userId) {
        const updateOrderPayment: IUpdateOrderPayment = {
          classNumber: cartNumber,
          userId: userId,
          billingAddressId: billingAddressId,
        };
        /** Payments_paymentsPut is the API call to update BillingAddressID in the Database */
        const updateBillingResponse = await Payments_payments(convertPascalCase(updateOrderPayment));
        const updateBillingData = convertCamelCase(updateBillingResponse);

        if (updateBillingData?.isSuccess) resultStatus = true;
        return resultStatus;
      }
    }
    return resultStatus;
  } catch (error) {
    logServer.error(AREA.ACCOUNT, errorStack(error));
    return false;
  }
}

/** --------------------------------------------------------------- Submit Order------------------------------------------------------------------------------ */
export async function placeOrder(convertToOrderRequestModel: IConvertToOrder, cartNumber: string): Promise<IConvertedToOrderResponse> {
  try {
    if (!convertToOrderRequestModel || !cartNumber) {
      return { isSuccess: false };
    }

    const userId = await getParentUserId();
    const placeOrderResponse = await CommerceCollections_placeOrder("carts", cartNumber, convertPascalCase(convertToOrderRequestModel), userId);

    const convertedPlaceOrderResponse = convertCamelCase(placeOrderResponse);
    const paymentDetails = convertToOrderRequestModel.paymentDetails;

    if (!paymentDetails) {
      return { isSuccess: false };
    }

    const paymentSubTypeCode = paymentDetails.paymentSubTypeCode;
    const isOnlinePayment = paymentSubTypeCode === PAYMENT_SUBTYPE.CREDIT_CARD || paymentSubTypeCode === PAYMENT_SUBTYPE.ACH;

    if (convertedPlaceOrderResponse?.hasError && isOnlinePayment) {
      const voidRefundResponse = await voidRefundPayment({
        configurationSetCode: paymentDetails.configurationSetCode,
        paymentTransactionToken: paymentDetails.paymentTransactionToken || "",
        paymentStatusCode: paymentDetails.paymentStatusCode,
      });

      const convertedVoidRefundResponse = convertCamelCase(voidRefundResponse);

      if (convertedVoidRefundResponse?.isSuccess) {
        // Order placement failed, but refund/void succeeded
        return { status: convertedVoidRefundResponse?.isSuccess };
      } else {
        return handleRefundVoidFailure();
      }
    }

    return convertedPlaceOrderResponse;
  } catch (error) {
    logServer.error(AREA.ORDER, errorStack(error));
    return { isSuccess: false };
  }
}

export function handleRefundVoidFailure() {
  logServer.error(AREA.ORDER, "Failed to void/refund payment after order creation failure.");
  return { isSuccess: false } as IConvertedToOrderResponse;
}

export async function placeOrderFromQuote(convertToOrderRequestModel: IConvertToOrder, cartNumber: string) {
  if (convertToOrderRequestModel && cartNumber) {
    const userId = await getParentUserId();
    const placeOrderResponse = await CommerceCollections_placeOrder("quotes", cartNumber, convertPascalCase(convertToOrderRequestModel), userId);
    return convertCamelCase(placeOrderResponse);
  } else {
    const errorPlaceOrderResponse: IConvertedToOrderResponse = { isSuccess: false };
    return errorPlaceOrderResponse;
  }
}

/** --------------------------------------------------------------- Generate Finalize Order Number------------------------------------------------------------------------------ */

export async function generateFinalizeNumber(cartNumber: string) {
  if (cartNumber) {
    const finalizeOrderNumberResponse = await CommerceCollections_generateFinalizeNumber("orders", cartNumber);
    return convertCamelCase(finalizeOrderNumberResponse);
  } else {
    const errorFinalizeNumberResponse: IGenerateFinalizeNumber = {
      isSuccess: false,
      classType: "",
      status: false,
    };
    return errorFinalizeNumberResponse;
  }
}

export const getParentUserId = async () => {
  const userSession = await getSavedUserSession();
  const crsUserId = userSession?.crsUserId ? userSession?.crsUserId : null;
  return crsUserId;
};
