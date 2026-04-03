import { CommerceCollections_checkInventory, LineItems_copyLineItems, Orders_previousPurchase } from "@znode/clients/cp";
import { FilterCollection, FilterKeys, FilterOperators, convertCamelCase, convertPascalCase } from "@znode/utils/server";
import {
  IAddOnSku,
  IAddToCartApiResponse,
  IAddToCartPreviousPurchases,
  IAddToCartPreviousPurchasesResponse,
  IChildItem,
  IOrderPurchaseItem,
  IPaginationDetails,
  IPersonalization,
  IPreviousPurchasesList,
  IResponsePreviousPurchases,
  IValidationInventoryBody,
  InventoryMessages,
  InventoryStatus,
  InventoryValidationDetail,
} from "@znode/types/account/previous-purchases";
import { OUT_OF_OPTION, PRODUCT_TYPE } from "@znode/constants/product";

import { GENERAL_SETTINGS } from "@znode/constants/app";
import { IAttributeDetails } from "@znode/types/attribute";
import { IOrderSort } from "@znode/types/account";
import { convertDate } from "@znode/utils/component";
import dayjs from "dayjs";
import { getAttributeValue } from "@znode/utils/common";
import { getGeneralSettingList } from "../../general-setting/general-setting";
import { getPortalData } from "../../product/product";

const getDefaultDateRange = (dateDetails: { dateFormat?: string; timeFormat?: string; displayTimeZone?: string }): string => {
  const now = dayjs().tz(dateDetails.displayTimeZone);
  const start = now.subtract(7, "day");
  
  // Set start date to 12:00 AM and end date to 11:59 PM
  const startWithTime = start.startOf("day");
  const endWithTime = now.endOf("day");
  
  return `'${formatDateTime(startWithTime.toDate(), dateDetails)}' and '${formatDateTime(endWithTime.toDate(), dateDetails)}'`;
};

const formatDateTime = (date: Date | null, dateDetails: { dateFormat?: string; timeFormat?: string; displayTimeZone?: string }): string => {
  if (!date) return "";
  if (dateDetails.dateFormat && dateDetails.timeFormat && dateDetails.displayTimeZone) {
    return dayjs(date).tz(dateDetails.displayTimeZone)
.format(`${dateDetails.dateFormat} ${dateDetails.timeFormat}`);
  } else if (dateDetails.dateFormat && dateDetails.displayTimeZone) {
    // If timeFormat is not available, use default time format
    return dayjs(date).tz(dateDetails.displayTimeZone)
.format(`${dateDetails.dateFormat} HH:mm:ss`);
  }
  return dayjs(date).format();
};

export const getPreviousPurchases = async (pageSize: number, pageIndex: number, sortValue?: IOrderSort, search?: string, filterDays = ""): Promise<IResponsePreviousPurchases> => {
  try {
    const { dateFormat, displayTimeZone, timeFormat, priceRoundOff } = await getGeneralSettingList();
    const portalData = await getPortalData();
    if (filterDays.length === 0 || filterDays === "") {
      filterDays = getDefaultDateRange({ dateFormat, timeFormat: "hh:mm:ss A", displayTimeZone });
    }
    if (filterDays === "All Items") {
      filterDays = "";
    }
    const filters: FilterCollection = new FilterCollection();
    search && search.length > 0 && filters.add(FilterKeys.GlobalSearch, FilterOperators.Contains, String(search));
    filterDays && filters.add(FilterKeys.DatetimeRange, FilterOperators.Between, String(filterDays));
    const previousPurchasesData = await Orders_previousPurchase(filters.filterTupleArray, sortValue, pageIndex, pageSize);
    const { PaginationDetail = {}, PreviousPurchaseItemList: OrderPurchase } = previousPurchasesData || {};
    const { PageIndex, PageSize, TotalResults, TotalPages } = PaginationDetail as IPaginationDetails;
    const mappedOrdersList = convertCamelCase(OrderPurchase);
    const list = await mappedPreviousPurchasesItems(mappedOrdersList);
    const orderData = {
      orders: list,
      pageIndex: PageIndex,
      pageSize: PageSize,
      totalResults: TotalResults,
      totalPages: TotalPages,
      dateFormat,
      timeFormat,
      displayTimeZone,
      pageList: portalData.pageList || [],
      priceRoundOff
    };
    return orderData;
  } catch (error) {
    return {
      orders: [],
      pageList: [],
      pageIndex: 0,
      pageSize: 0,
      totalResults: 0,
      totalPages: 0,
      dateFormat: "MM/DD/YYYY",
      timeFormat: "HH:mm:ss",
      displayTimeZone: "UTC",
      priceRoundOff:GENERAL_SETTINGS.PRICE_ROUND_OFF,
    };
  }
};

function mapRegularCartItem(item: IOrderPurchaseItem, productType: string, displayTimeZone: string, dateFormat: string): IPreviousPurchasesList {
  const formattedDate = item.orderDate ? convertDate(item.orderDate, dateFormat, displayTimeZone) : "";
  const min = Number(getAttributeValue(item.attributeDetails as [], "MinimumQuantity", "attributeValue") ?? 0);
  const max = Number(getAttributeValue(item.attributeDetails as [], "MaximumQuantity", "attributeValue") ?? 0);
  return {
    productId: item.lineItemId,
    productImageUrl: item.productImagePath ?? "",
    productName: item.productName ?? "",
    productDescription: getProductSpecificDescription(productType, item),
    unitPrice: item.itemPrice,
    unitPricePurchased: item.unitPrice,
    sku: item.sku,
    orderDate: formattedDate,
    lastOrderedQty: item.quantity ?? 0,
    currencyCode: "",
    isInValid: false,
    minQty: min,
    maxQty: max,
    personalizedDetails: item.personalizedDetails,
    addOnSkuList: item.addOnSkuList,
    productType: productType,
    parentProductId: item.lineItemId,
    parentProductType: productType,
    parentSku: item.sku,
    isChildProduct: item.previousPurchaseChildItemList ? item.previousPurchaseChildItemList.length > 0 : false,
  };
}

export function getProductSpecificDescription(productType: string, item: IOrderPurchaseItem, isChildProduct?: boolean, childItem?: IChildItem, isGroupedProduct?: boolean): string {
  let description = "";
  const personalizationHtml = renderPersonalization(isChildProduct ? (childItem?.personalizedDetails as IPersonalization[]) : item.personalizedDetails || []);
  const addonsHtml = renderAddons(isChildProduct ? (childItem?.addOnSkuList as IAddOnSku[]) : item.addOnSkuList);

  switch (productType) {
    case PRODUCT_TYPE.GROUPED_PRODUCT_LABEL:
      description = `<div data-test-selector="divGroupedProductDescription${item.sku}">
                        <div data-test-selector="divGroupedProductName${item.sku}">${isChildProduct && childItem?.productName}</div>
                        <div data-test-selector="divGroupedProductPersonalization${item.sku}">${personalizationHtml}</div>
                        <div data-test-selector="divGroupedProductAddons${item.sku}">${addonsHtml}</div>
                      </div>`;
      break;
    case PRODUCT_TYPE.CONFIGURABLE_PRODUCT_LABEL:
    case PRODUCT_TYPE.SIMPLE_PRODUCT_LABEL:
      description = `<div data-test-selector="divConfigurableProductDescription${isChildProduct ? childItem?.sku : item.sku}">
                        <div data-test-selector="divConfigurableProductAttributes${isChildProduct ? childItem?.sku : item.sku}">
                          ${isGroupedProduct ? "" : generateConfigurableAttributesHTML((isChildProduct ? childItem?.attributeDetails : item.attributeDetails) as [])}
                        </div>
                        <div data-test-selector="divConfigurableProductPersonalization${isChildProduct ? childItem?.sku : item.sku}">${personalizationHtml}</div>
                        <div data-test-selector="divConfigurableProductAddons${isChildProduct ? childItem?.sku : item.sku}">${addonsHtml}</div>
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

function renderBundleChild(item: IOrderPurchaseItem): string {
  return item.previousPurchaseChildItemList && item.previousPurchaseChildItemList.length > 0
    ? item.previousPurchaseChildItemList.map((child) => `<p>Qty: ${child.quantity} | ${child.sku || ""} - ${child.productName}</p>`).join("")
    : "<div></div>";
}

const renderPersonalization = (personalizations: IPersonalization[]): string => {
  if (!personalizations || personalizations.length === 0) {
    return "";
  }

  return personalizations.map(({ code, value }) => `<p>${code ?? ""} : ${value ?? ""}</p>`).join("");
};

const renderAddons = (addons: IAddOnSku[]): string => {
  if (!addons || addons.length === 0) {
    return "";
  }

  return addons.map(({ groupName = "", productName }) => `<p class="semi-bold">${groupName} : ${productName ?? ""}</p>`).join("");
};

export function generateConfigurableAttributesHTML(attributes: IAttributeDetails[]): string {
  return attributes
    .filter((attr) => attr.isConfigurable)
    .map((attr) => `<div><strong>${attr.attributeName} : </strong> ${attr.attributeValue}</div>`)
    .join("");
}

function isGroupedOrConfigurableProduct(productType: string, item?: IOrderPurchaseItem): boolean {
  if (!item) {
    return false;
  }

  return (
    productType === PRODUCT_TYPE.GROUPED_PRODUCT_LABEL ||
    (productType === PRODUCT_TYPE.CONFIGURABLE_PRODUCT_LABEL && item.previousPurchaseChildItemList ? item.previousPurchaseChildItemList.length > 0 : false)
  );
}

export async function mappedPreviousPurchasesItems(cartItemList: IOrderPurchaseItem[] | undefined): Promise<IPreviousPurchasesList[]> {
  const formattedCartItems: IPreviousPurchasesList[] = [];
  const generalSetting = await getGeneralSettingList();
  const { dateFormat, displayTimeZone } = generalSetting || {};
  if (cartItemList && cartItemList.length > 0) {
    cartItemList.forEach((item: IOrderPurchaseItem) => {
      const productType: string = (item.attributeDetails.length > 0 ? getAttributeValue(item.attributeDetails as [], "ProductType", "attributeValue") : item.productType) as string;

      // If product is grouped or configurable with child items, handle mapping
      if (isGroupedOrConfigurableProduct(productType, item)) {
        if (item.productType === PRODUCT_TYPE.CONFIGURABLE_PRODUCT_LABEL) {
          const cartItem = mapConfigurableCartItem(item, productType, displayTimeZone, dateFormat);
          cartItem?.forEach((item) => formattedCartItems.push(item));
        } else {
          mapGroupProducts(item, formattedCartItems, productType, displayTimeZone, dateFormat);
        }
      } else {
        // Map regular cart item
        const cartItem = mapRegularCartItem(item, productType, displayTimeZone, dateFormat);
        formattedCartItems.push(cartItem);
      }
    });
  }

  return formattedCartItems;
}
function mapGroupProducts(product: IOrderPurchaseItem, cartItemsResponse: IPreviousPurchasesList[], productType: string, displayTimeZone: string, dateFormat: string) {
  if (product?.previousPurchaseChildItemList && product.previousPurchaseChildItemList.length > 0) {
    product.previousPurchaseChildItemList.forEach((childItem) => {
      const mappedChildItem = mapChildProduct(product, childItem, childItem.productType, displayTimeZone, dateFormat);

      cartItemsResponse.push(mappedChildItem);
    });
  }
}

function mapChildProduct(item: IOrderPurchaseItem, childItem: IChildItem, productType: string, displayTimeZone: string, dateFormat: string): IPreviousPurchasesList {
  const formattedDate = item.orderDate ? convertDate(item.orderDate, dateFormat, displayTimeZone) : "";
  const min = Number(getAttributeValue(childItem.attributeDetails as [], "MinimumQuantity", "attributeValue") ?? 0);
  const max = Number(getAttributeValue(childItem.attributeDetails as [], "MaximumQuantity", "attributeValue") ?? 0);
  return {
    productId: childItem.lineItemId,
    productImageUrl: childItem.productImagePath ?? "",
    productName:
      item.productType === PRODUCT_TYPE.GROUPED_PRODUCT_LABEL
        ? `<div><div class="font-semibold" data-test-selector="divParentProductName${item.sku}">${item.productName ?? ""}</div>
                      <div data-test-selector="divChildProduct${childItem.sku}">${childItem.productName}</div> </div>`
        : childItem.productName ?? "",
    productDescription: getProductSpecificDescription(
      productType,
      item,
      (item?.previousPurchaseChildItemList && item?.previousPurchaseChildItemList?.length > 0) ?? false,
      childItem,
      item.productType === PRODUCT_TYPE.GROUPED_PRODUCT_LABEL
    ),
    unitPrice: childItem.itemPrice,
    unitPricePurchased: childItem.unitPrice,
    sku: childItem.sku,
    orderDate: formattedDate,
    lastOrderedQty: childItem.quantity ?? 0,
    currencyCode: "",
    isInValid: false,
    minQty: min,
    maxQty: max,
    personalizedDetails: childItem.personalizedDetails,
    addOnSkuList: childItem.addOnSkuList,
    productType: productType,
    parentProductId: item.lineItemId,
    parentProductType: item.productType as string,
    parentSku: item.sku,
    isChildProduct: item.previousPurchaseChildItemList ? item.previousPurchaseChildItemList.length > 0 : false,
  };
}

function mapConfigurableCartItem(item: IOrderPurchaseItem, productType: string, displayTimeZone: string, dateFormat: string) {
  const childProductCartItem = item.previousPurchaseChildItemList?.map((childItem) => mapChildProduct(item, childItem, childItem.productType, displayTimeZone, dateFormat));
  return childProductCartItem;
}

export const validatedInventory = async (requestBody: IValidationInventoryBody[], revisionType: string) => {
  const responseList: { isSuccess: boolean; message: string; productId: string }[] = [];
  const inventoryChecked = await CommerceCollections_checkInventory(
    revisionType,
    requestBody.map((item) => ({ Sku: item.sku, Quantity: item.quantity }))
  );
  if (inventoryChecked.InventoryValidationDetails && inventoryChecked.InventoryValidationDetails.length > 0) {
    const messageDetails = getFinalInventoryMessage(convertCamelCase(inventoryChecked.InventoryValidationDetails));
    responseList.push({
      isSuccess: messageDetails.isSuccess,
      message: messageDetails.message,
      productId: "",
    });
  }
  return responseList;
};

const getTheValidationMessageByPriority = (
  validations: {
    validationMessage: string;
    validationCode: string;
    priority: number;
  }[]
): string => {
  if (!validations || validations.length === 0) return "";
  if (validations.length === 1) {
    return validations[0].validationMessage;
  }

  const sorted = validations.sort((a, b) => a.priority - b.priority);
  return sorted[0].validationMessage;
};
function extractValidationResults(response: IAddToCartPreviousPurchases): IAddToCartPreviousPurchasesResponse {
  const resultMap: IAddToCartPreviousPurchasesResponse = {};
  const items = response.copiedLineItemList;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const validations = item.validationDetails;
    if (resultMap && item.itemId) {
      resultMap[item.itemId] = {
        isSuccess: validations.length > 0 ? false : true,
        message: getTheValidationMessageByPriority(validations),
        itemId: item.itemId,
      };
    }
  }
  return resultMap;
}
export const addToCartPreviousPurchases = async (requestBody: IAddToCartPreviousPurchases): Promise<IAddToCartApiResponse> => {
  try {
    const response = await LineItems_copyLineItems("carts", convertPascalCase(requestBody));
    const resultMap = extractValidationResults(convertCamelCase(response));
    return {
      isSuccess: resultMap && Object.values(resultMap).every((item) => item.isSuccess),
      validation: resultMap,
    };
  } catch {
    return {
      isSuccess: false,
      validation: null,
    };
  }
};

const normalizeMessage = (msg: InventoryMessages, type: string) => {
  const defaultMessages: { [key: string]: string } = {
    inStockMsg: "In Stock",
    backOrderMsg: "Back Order",
    outOfStockMsg: "Out of Stock",
  };
  const inventoryMessage = msg[type] || defaultMessages[type];
  return inventoryMessage;
};

function getInventoryStatus(detail: InventoryValidationDetail): InventoryStatus | null {
  const { validationCode, validationMessages, inStockQuantity, sku } = detail;

  if (validationCode === OUT_OF_OPTION.DISABLE_PURCHASING) {
    if (inStockQuantity > 0) {
      return { sku: sku, message: normalizeMessage(validationMessages[0], "inStockMsg"), isInStock: true, qty: inStockQuantity };
    } else {
      return { sku: sku, message: normalizeMessage(validationMessages[0], "outOfStockMsg"), isOutOfStock: true, qty: 0 };
    }
  }

  if (validationCode === OUT_OF_OPTION.ALLOW_BACK_ORDERING) {
    if (inStockQuantity > 0) {
      return { sku: sku, message: normalizeMessage(validationMessages[0], "inStockMsg"), isInStock: true, qty: 0 };
    } else {
      return { sku: sku, message: normalizeMessage(validationMessages[0], "backOrderMsg"), isBackOrder: true, qty: 0 };
    }
  }

  if (validationCode === OUT_OF_OPTION.DONT_TRACK_INVENTORY) {
    return { sku: sku, message: normalizeMessage(validationMessages[0], "inStockMsg"), isInStock: true, qty: 0 };
  }

  return null;
}

function getFinalInventoryMessage(allDetails: InventoryValidationDetail[]): { message: string; isSuccess: boolean } {
  const statuses = allDetails.map(getInventoryStatus).filter(Boolean) as InventoryStatus[];
  let hasOutOfStock = false;
  let hasBackOrder = false;
  let message = "";

  for (const status of statuses) {
    if (status.isOutOfStock) {
      hasOutOfStock = true;
      message = status.message;
    } else if (status.isBackOrder) {
      hasBackOrder = true;
      message = status.message;
    } else {
      message = status.message;
    }
  }

  if (hasOutOfStock) return { message: message, isSuccess: false };
  if (hasBackOrder) return { message: message, isSuccess: true };
  return { message: message, isSuccess: true };
}
