import { IAddOnSkuListModel, IAddToCartChildItems, IProductDetails, ISelectedAddOn, ISkuDetailsParams } from "@znode/types/product-details";
import { IAddToCartRequest, IPersonalizedPayload } from "@znode/types/cart";
import getCookie, { setCookie } from "./cookies";

import { CART_COOKIE } from "@znode/constants/cookie";
import { ITemplateCartItems } from "@znode/types/account";
import { PRODUCT_TYPE } from "@znode/constants/product";

export const checkForExistingCartId = () => {
  const CartId = getCookie(CART_COOKIE.CART_ID);
  return CartId;
};

export const setCartCookie = (cartId: string | undefined, cartNumber: string | undefined) => {
  cartNumber && setCookie(CART_COOKIE.CART_NUMBER, cartNumber);
  cartId && setCookie(CART_COOKIE.CART_ID, cartId);
};

export const generatePayload = (productData: IProductDetails, cartId: string | undefined): IAddToCartRequest => {
  const payload: IAddToCartRequest = {
    cartId: !cartId ? CART_COOKIE.DEFAULT_CART_ID : cartId,
    skuDetails: [
      {
        sku: (productData.isConfigurableProduct ? productData.configurableproductSku : productData.sku) || "",
        addOnSkuListModel: setSelectedAddons(productData),
        personalizedDetails: setPersonalization(productData),
        productType: String(productData.productType) || "",
        addToCartChildItems: [],
        customData: [],
        groupCode: "",
        additionalCost: [],
      },
    ],
  };

  return setProductTypeSpecificParams(payload, productData);
};

export const generatePayloadMultipleProduct = (productData: IProductDetails[], cartId: string | undefined): IAddToCartRequest => {
  const skuDetailsList: ISkuDetailsParams[] = [];
  productData?.forEach((productData) => {
    skuDetailsList.push({
      sku: (productData.isConfigurableProduct ? productData.configurableproductSku : productData.sku) || "",
      addOnSkuListModel: setSelectedAddons(productData),
      personalizedDetails: setPersonalization(productData),
      productType: String(productData.productType) || "",
      addToCartChildItems: [],
      customData: [],
      groupCode: "",
      additionalCost: [],
      quantity: productData?.quantity,
    });
  });
  const payload: IAddToCartRequest = {
    cartId: !cartId ? CART_COOKIE.DEFAULT_CART_ID : cartId,
    skuDetails: skuDetailsList as ISkuDetailsParams[],
  };

  return payload;
};

const setSelectedAddons = (productData: IProductDetails): IAddOnSkuListModel[] => {
  if (productData.addOnProductSKUs && productData.addOnProductSKUs.length > 0) {
    const skuData = productData.addOnProductSKUs || [];
    return getSelectedAddons(skuData);
  }
  return [];
};

const getSelectedAddons = (selectedAddons: ISelectedAddOn[] | string): IAddOnSkuListModel[] => {
  if (Array.isArray(selectedAddons)) {
    return selectedAddons.map((selectedSku: ISelectedAddOn) => ({
      sku: selectedSku.sku,
      groupName: selectedSku.groupName,
    }));
  } else {
    return [];
  }
};

const setPersonalization = (productData: IProductDetails): IPersonalizedPayload[] => {
  const personalizedData: IPersonalizedPayload[] = productData.personalizeList || [];
  return personalizedData;
};

const setProductTypeSpecificParams = (payloadCart: IAddToCartRequest, productData: IProductDetails): IAddToCartRequest => {
  switch (productData?.productType) {
    case PRODUCT_TYPE.GROUPED_PRODUCT:
      if (
        productData &&
        payloadCart &&
        productData.groupProductList &&
        productData.groupProductList.length > 0 &&
        payloadCart?.skuDetails &&
        payloadCart.skuDetails.length > 0 &&
        productData.groupProductData
      ) {
        productData.groupProductData.forEach((product) => {
          payloadCart.skuDetails?.forEach((val: ISkuDetailsParams) => {
            const childItem: IAddToCartChildItems = {
              sku: product.sku,
              quantity: product.quantity || 1,
              addOnSkuListModel: product.addOnProductSKUs || [],
              personalizedDetails: product.personalizeList,
              customData: [],
              additionalCost: [],
            };
            val.addToCartChildItems.push(childItem);
            val.addOnSkuListModel = [];
            val.personalizedDetails = [];
          }
        );
        });
      }
      return payloadCart;
    default:
      if (productData.isConfigurableProduct) {
        if (payloadCart.skuDetails && productData.configurableProductId && !productData.isDisplayVariantsOnGrid) {
          payloadCart.skuDetails.forEach((val: ISkuDetailsParams) => {
            val.addToCartChildItems.push({
              sku: productData?.configurableproductSku,
              quantity: productData?.quantity,
              addOnSkuListModel: productData.addOnProductSKUs,
              personalizedDetails: productData.personalizeList,
              customData: [],
              additionalCost: [],
            } as IAddToCartChildItems);
          });
          payloadCart.skuDetails[0].productType = PRODUCT_TYPE.CONFIGURABLE_PRODUCT;
          payloadCart.skuDetails[0].sku = productData?.sku;
          payloadCart.skuDetails[0].addOnSkuListModel = [];
          payloadCart.skuDetails[0].personalizedDetails = [];
        } else if (productData.isDisplayVariantsOnGrid && productData.publishProductId && productData.configChildProductData?.length) {
          if (payloadCart?.skuDetails && payloadCart?.skuDetails[0]) {
            productData.configChildProductData.forEach((product) => {
              payloadCart.skuDetails?.forEach((val: ISkuDetailsParams) => {
                const childItem: IAddToCartChildItems = {
                  sku: product.sku,
                  quantity: product.quantity || 1,
                  addOnSkuListModel: product.addOnProductSKUs || [],
                  personalizedDetails: product.personalizeList,
                  customData: [],
                  additionalCost: [],
                };
                val.addToCartChildItems.push(childItem);
              });
            });
            payloadCart.skuDetails[0].productType = PRODUCT_TYPE.CONFIGURABLE_PRODUCT;
            payloadCart.skuDetails[0].sku = productData?.sku;
            payloadCart.skuDetails[0].addOnSkuListModel = [];
            payloadCart.skuDetails[0].personalizedDetails = [];
          }
        }
      } else {
        if (payloadCart.skuDetails && payloadCart.skuDetails[0]) {
          payloadCart.skuDetails[0].quantity = productData?.quantity;
        }
      }
      return payloadCart;
  }
};

export function bindSkuDetails(templateCartItems: ITemplateCartItems[]) {
  return templateCartItems?.map(mapCartItemToSkuDetail);
}

function mapCartItemToSkuDetail(cartItem: ITemplateCartItems) {
  return {
    Sku: cartItem.sku,
    AddOnSkuListModel: [],
    PersonalizedDetails: [],
    AddToCartChildItems: [],
    CustomData: [],
    GroupCode: "",
    AdditionalCost: [],
    Quantity: cartItem.quantity || 1,
    IsExistingItem: cartItem.isExistingItem || false,
  };
}
