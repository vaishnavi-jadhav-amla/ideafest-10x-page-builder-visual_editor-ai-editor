import { IAddOnSkuResponseModel, ICartItem, ICartItemListResponse, ICartItemValidation, ICartSummary, IPersonalizationModel } from "@znode/types/cart";
import { PRODUCT, PRODUCT_TYPE } from "@znode/constants/product";

import { DISCOUNT_TYPE } from "@znode/constants/checkout";
import { IAttributeDetails } from "@znode/types/attribute";
import { PAYMENT } from "@znode/constants/payment";
import { VALIDATION_ERROR } from "@znode/constants/cart";
import { convertCamelCase } from "@znode/utils/server";
import { getAttributeValue } from "@znode/utils/common";
import { getCostFactorByType } from "./cart-helper";

// Function to format cart items
export function mappedCartItems(cartItemList: ICartItemListResponse[] | undefined, isFromSavedCart?: boolean): ICartItem[] {
  const formattedCartItems: ICartItem[] = [];
  if (cartItemList && cartItemList.length > 0) {
    cartItemList.forEach((item: ICartItemListResponse) => {
      const productType: string = getAttributeValue(item.attributes || [], "ProductType", "attributeValue") as string;

      // If product is grouped or configurable with child items, handle mapping
      if (isGroupedOrConfigurableProduct(productType, item)) {
        if (item.productType === PRODUCT_TYPE.CONFIGURABLE_PRODUCT_LABEL) {
          const cartItem = mapConfigurableCartItem(item, productType, isFromSavedCart);
          cartItem?.forEach((item) => formattedCartItems.push(item));
        } else {
          mapGroupProducts(item, formattedCartItems, productType, isFromSavedCart);
        }
      } else {
        // Map regular cart item
        const cartItem = mapRegularCartItem(item, productType, isFromSavedCart);
        formattedCartItems.push(cartItem);
      }
    });
  }

  return formattedCartItems;
}

// Check if the product is grouped or configurable with child items
export function isGroupedOrConfigurableProduct(productType: string, item?: ICartItemListResponse): boolean {
  if (!item) {
    return false;
  }

  return (
    productType === PRODUCT_TYPE.GROUPED_PRODUCT_LABEL ||
    (productType === PRODUCT_TYPE.CONFIGURABLE_PRODUCT_LABEL && item.childItemList !== undefined ? item.childItemList.length > 0 : false)
  );
}

function mapConfigurableCartItem(item: ICartItemListResponse, productType: string, isFromSavedCart?: boolean) {
  const childProductCartItem = item.childItemList?.map((childItem) => ({
    productLink: item.seoUrl ? (isFromSavedCart ? `/${item.seoUrl}` : item.seoUrl) : `/product/${item.znodeProductId}`,
    productId: childItem.znodeProductId ?? 0,
    productImageUrl: childItem.productImagePath ?? "",
    productName: childItem.productName ?? "",
    productDescription: getProductSpecificDescription(productType, childItem),
    unitPrice: childItem.unitPrice,
    totalPrice: childItem.totalPrice,
    addon: childItem.addOnSkuList ?? [],
    personalization: childItem.personalizedDetails ?? [],
    quantity: childItem.quantity ?? 0,
    availableQuantity: childItem.availableQuantity ?? 0,
    cartItemId: childItem.cartItemId ?? childItem.itemId ?? "",
    maximumQuantity: getAttributeValue(childItem.attributes || [], "MaximumQuantity", "attributeValue") as number,
    minimumQuantity: getAttributeValue(childItem.attributes || [], "MinimumQuantity", "attributeValue") as number,
    uom: getAttributeValue(item.attributes || [], "UOM", "attributeValue") as string,
    outOfStockOption: getAttributeValue(item.attributes || [], PRODUCT.OUT_OF_STOCK_OPTIONS, "attributeDefaultValueCode") as string,
    sku: childItem.sku,
    productType: productType,
    showSku: shouldShowSku(childItem, productType),
    itemPrice: childItem.itemPrice,
    hasValidationErrors: validateSimpleProductBehavior(childItem, productType),
    isOutOfStock: validateProductQuantity(childItem, productType),
    shippingCost: childItem.shippingCost,
    orderLineItemState: childItem?.statusCode,
    isConfigurable: true,
    orderLineItemStateName: childItem?.statusName,
  }));
  return childProductCartItem;
}
// Map regular cart item
function mapRegularCartItem(item: ICartItemListResponse, productType: string, isFromSavedCart?: boolean): ICartItem {
  return {
    productLink: item.seoUrl ? (isFromSavedCart ? `/${item.seoUrl}` : item.seoUrl) : `/product/${item.znodeProductId}`,
    productId: item.znodeProductId ?? 0,
    productImageUrl: item.productImagePath ?? "",
    addon: item.addOnSkuList ?? [], 
    personalization: item.personalizedDetails ?? [],
    productName: item.productName ?? "",
    productDescription: getProductSpecificDescription(productType, item),
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
    quantity: item.quantity ?? 0,
    availableQuantity: item.availableQuantity ?? 0,
    cartItemId: item.cartItemId ?? item.itemId ?? "",
    maximumQuantity: getAttributeValue(item.attributes || [], "MaximumQuantity", "attributeValue") as number,
    minimumQuantity: getAttributeValue(item.attributes || [], "MinimumQuantity", "attributeValue") as number,
    outOfStockOption: getAttributeValue(item.attributes || [], PRODUCT.OUT_OF_STOCK_OPTIONS, "attributeDefaultValueCode") as string,
    uom: getAttributeValue(item.attributes || [], "UOM", "attributeValue") as string,
    sku: item.sku,
    productType: productType,
    showSku: shouldShowSku(item, productType),
    itemPrice: item.itemPrice,
    hasValidationErrors: validateSimpleProductBehavior(item, productType),
    isOutOfStock: validateProductQuantity(item, productType),
    shippingCost: item.shippingCost,
    orderLineItemState: productType === PRODUCT_TYPE.BUNDLE_PRODUCT_LABEL ? item?.childItemList?.[0]?.statusCode : item?.statusCode,
    orderLineItemStateName: productType === PRODUCT_TYPE.BUNDLE_PRODUCT_LABEL ? item?.childItemList?.[0]?.statusName : item?.statusName,
  };
}

export const validateProductQuantity = (item: ICartItemListResponse, productType: string): boolean => {
  const hasOutOfStock = (list?: Array<{ validationDetails?: ICartItemValidation[] }>): boolean =>
    list?.some((el) => el.validationDetails?.some((vd) => vd.errorCode === VALIDATION_ERROR.ERROR_OUT_OF_STOCK)) ?? false;

  if (productType === PRODUCT_TYPE.BUNDLE_PRODUCT_LABEL) {
    const isChildOutOfStock = hasOutOfStock(item.childItemList);
    const isParentOutOfStock = hasOutOfStock([item]);
    return isChildOutOfStock || isParentOutOfStock;
  }

  if (item.addOnSkuList?.length) {
    return hasOutOfStock(item.addOnSkuList);
  }

  return hasOutOfStock([item]);
};


export const validateSimpleProductBehavior = (item: ICartItemListResponse, productType: string) => {
  let isInvalidProduct;
  if (productType === PRODUCT_TYPE.BUNDLE_PRODUCT_LABEL) {
    isInvalidProduct = item?.childItemList?.some((item) => item.validationDetails && item.validationDetails.length > 0) || hasProductValidation(item.validationDetails);
  } else {
    isInvalidProduct = hasProductValidation(item.validationDetails);
  }
  const isInvalidAddOn = hasAddOnValidation(item.addOnSkuList || []);
  return isInvalidProduct || isInvalidAddOn;
};

function hasAddOnValidation(addOnSkuList: IAddOnSkuResponseModel[]): boolean {
  return addOnSkuList.some((addOnSku) => addOnSku?.validationDetails && addOnSku.validationDetails.length > 0);
}

const hasProductValidation = (cartItemValidation: ICartItemValidation[] | undefined): boolean => {
  return cartItemValidation ? cartItemValidation.some(() => true) : false;
};

// Map grouped or configurable products
function mapGroupProducts(product: ICartItemListResponse, cartItemsResponse: ICartItem[], productType: string, isFromSavedCart?: boolean) {
  if (product?.childItemList && product.childItemList.length > 0) {
    product.childItemList.forEach((childItem) => {
      const mappedChildItem = mapChildProduct(product, childItem, productType, isFromSavedCart);

      cartItemsResponse.push(mappedChildItem);
    });
  }
}

// Map child product in a grouped or configurable product
function mapChildProduct(parentItem: ICartItemListResponse, childItem: ICartItemListResponse, productType: string, isFromSavedCart?: boolean): ICartItem {
  return {
    productId: parentItem.znodeProductId || 0,
    productLink: parentItem.seoUrl
      ? isFromSavedCart
        ? `/${encodeURIComponent(parentItem.seoUrl)}`
        : encodeURIComponent(parentItem.seoUrl)
      : `/product/${parentItem.znodeProductId}`,
    productImageUrl: childItem.productImagePath ?? "",
    productName: (getAttributeValue(parentItem.attributes || [], "ProductName", "attributeValue") as string) || childItem.productName || "",
    productDescription: getProductSpecificDescription(productType, childItem, childItem.productName),
    unitPrice: childItem.unitPrice,
    itemPrice: childItem.itemPrice,
    quantity: childItem.quantity ?? 0,
    availableQuantity: childItem.availableQuantity ?? 0,
    addon: childItem.addOnSkuList ?? [],
    personalization: childItem.personalizedDetails ?? [],
    outOfStockOption: getAttributeValue(childItem.attributes || [], PRODUCT.OUT_OF_STOCK_OPTIONS, "attributeDefaultValueCode") as string,
    cartItemId: childItem.cartItemId ?? childItem.itemId ?? "",
    maximumQuantity: getAttributeValue(childItem.attributes || [], "MaximumQuantity", "attributeValue") as number,
    minimumQuantity: getAttributeValue(childItem.attributes || [], "MinimumQuantity", "attributeValue") as number,
    sku: childItem.sku,
    productType: getAttributeValue(childItem.attributes || [], PRODUCT.PRODUCT_TYPE, "attributeValue") as string,
    totalPrice: childItem.totalPrice,
    showSku: productType !== PRODUCT_TYPE.GROUPED_PRODUCT_LABEL,
    hasValidationErrors: hasProductValidation(childItem.validationDetails) || hasAddOnValidation(parentItem.addOnSkuList || []),
    isOutOfStock: validateProductQuantity(childItem, productType),
    orderLineItemState: productType === PRODUCT_TYPE.CONFIGURABLE_PRODUCT_LABEL ? parentItem?.statusCode : childItem?.statusCode,
    orderLineItemStateName: childItem?.statusName,
  };
}

// Helper to determine if SKU should be displayed
function shouldShowSku(item: ICartItemListResponse, productType: string): boolean {
  return item.addOnSkuList?.length ? true : productType !== PRODUCT_TYPE.BUNDLE_PRODUCT;
}
export function generateConfigurableAttributesHTML(attributes: IAttributeDetails[]): string {
  return attributes
    .filter((attr) => attr.isConfigurable)
    .map((attr) => `<div><span>${attr.attributeName} : </span> ${attr.attributeValue}</div>`)
    .join("");
}

// Helper to get product-specific description
export function getProductSpecificDescription(productType: string, item: ICartItemListResponse | ICartItem, childProductName?: string): string {
  let description = "";
  const personalizationHtml = renderPersonalization(item.personalizedDetails || []);
  const addonsHtml = renderAddons(item.addOnSkuList || []);

  switch (productType) {
    case PRODUCT_TYPE.GROUPED_PRODUCT_LABEL:
      description = `<div data-test-selector="divGroupedProductDescription${item.sku}">
                      <div data-test-selector="divGroupedProductName${item.sku}">${childProductName ?? "-"}</div>
                      <div data-test-selector="divGroupedProductPersonalization${item.sku}">${personalizationHtml}</div>
                      <div data-test-selector="divGroupedProductAddons${item.sku}">${addonsHtml}</div>
                    </div>`;
      break;
    case PRODUCT_TYPE.CONFIGURABLE_PRODUCT_LABEL:
    case PRODUCT_TYPE.SIMPLE_PRODUCT_LABEL:
      description = `<div data-test-selector="divConfigurableProductDescription${item.sku}">
                      <div data-test-selector="divConfigurableProductAttributes${item.sku}">
                        ${generateConfigurableAttributesHTML(item.attributes || [])}
                      </div>
                      <div data-test-selector="divConfigurableProductPersonalization${item.sku}">${personalizationHtml}</div>
                      <div data-test-selector="divConfigurableProductAddons${item.sku}">${addonsHtml}</div>
                    </div>`;
      break;
    case PRODUCT_TYPE.BUNDLE_PRODUCT_LABEL:
      description = `<div data-test-selector="divBundleProductDescription${item.sku}">
                      <div data-test-selector="divBundleProductChild${item.sku}">${renderBundleChild(item)}</div>
                      <div data-test-selector="divBundleProductPersonalization${item.sku}">${personalizationHtml}</div>
                      <div data-test-selector="divBundleProductAddons${item.sku}">${addonsHtml}</div>
                    </div>`;
      break;
    default:
      description = `<div data-test-selector="divDefaultProductDescription${item.sku}">
                      <div data-test-selector="divDefaultProductText${item.sku}">${item.productDescription ?? ""}</div>
                    </div>`;
  }

  return description;
}

// Helper to render bundle child
function renderBundleChild(item: ICartItemListResponse | ICartItem): string {
  return item.childItemList && item.childItemList.length > 0
    ? item.childItemList.map((child) => `<p>Qty: ${child.quantity} | ${child.sku || ""} - ${child.productName}</p>`).join("")
    : "<div></div>";
}

const renderPersonalization = (personalizations: IPersonalizationModel[]): string => {
  if (!personalizations || personalizations.length === 0) {
    return "";
  }

  return personalizations.map(({ code, value }) => `<p>${code ?? ""} : ${value ?? ""}</p>`).join("");
};

const renderAddons = (addons: IAddOnSkuResponseModel[]): string => {
  if (!addons || addons.length === 0) {
    return "";
  }

  return addons.map(({ groupName = "", productName }) => `<p class="semi-bold">${groupName} : ${productName ?? ""}</p>`).join("");
};

export function mapCalculation(cartSummary: ICartSummary, portalCurrencyCode?: string, isFromTrackOrder= false): ICartSummary {
  const { costs, discounts, ...rest } = cartSummary;
  let total = cartSummary.total;
  const totalDiscount = getCostFactorByType(costs, "TotalDiscount") || 0;
  const shippingCost = getCostFactorByType(costs, "ShippingCost") || 0;
  const handlingFee = getCostFactorByType(costs, "HandlingFee") || 0;
  const taxCost = getCostFactorByType(costs, "TaxCost");
  const importDuty = getCostFactorByType(costs, "ImportDuty");
  const shippingDiscount = getCostFactorByType(costs, "ShippingDiscount");
  const csrDiscountAmount = getCostFactorByType(costs, "CSRDiscount");
  const taxSummaryList = convertCamelCase(getCostFactorByType(costs, "TaxSummaryList"));
  const taxMessageList = convertCamelCase(getCostFactorByType(costs, "TaxMessageList"));
  const returnCharges = getCostFactorByType(costs, "ReturnCharges") || 0;

  const giftCardAmount = discounts
    ?.filter((item) => item.isApplied === "True" && item.isValid === "True" && item.discountType === DISCOUNT_TYPE.GIFT_CARD)
    .reduce((sum, item) => sum + (item.appliedAmount ?? 0), 0);

  const hasDiscount: boolean = totalDiscount > 0;
  const currencyCode = portalCurrencyCode ?? PAYMENT.UNITED_STATES_SUFFIX;
  if (!isFromTrackOrder) {
    total = (total || total === 0) && giftCardAmount ? total + giftCardAmount : total;
  }
  const orderTotalWithoutVoucher = total && giftCardAmount ? total - giftCardAmount : total;

  return {
    ...rest,
    costs,
    discounts,
    totalDiscount,
    shippingCost,
    handlingFee,
    hasDiscount,
    total,
    currencyCode,
    importDuty,
    taxCost,
    shippingDiscount,
    giftCardAmount,
    orderTotalWithoutVoucher,
    csrDiscountAmount,
    taxSummaryList,
    taxMessageList,
    returnCharges,
  };
}
