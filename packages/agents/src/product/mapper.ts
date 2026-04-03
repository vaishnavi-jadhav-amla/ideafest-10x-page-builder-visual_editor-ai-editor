import { FilterTuple, ProductInventoryDetailResponse, PublishProduct_getProductInventory } from "@znode/clients/v1";
import { IHighlight, IProduct, IProductCard, IProductInventory, IProductListCard, IProductListResponse, IProductPortalData, IPromotion } from "@znode/types/product";
import { INVENTORY, PRODUCT, PRODUCT_TYPE } from "@znode/constants/product";
import { getAttributeValue, stringToBoolean, stringToBooleanV2 } from "@znode/utils/common";

/* eslint-disable no-unused-vars */
import { IBaseAttribute } from "@znode/types/attribute";
import { IGlobalAttributeValues } from "@znode/types/portal";
import { IProductDetails } from "@znode/types/product-details";
import { convertCamelCase } from "@znode/utils/server";
import { getProductFilters } from "./product";
import { IUser } from "@znode/types/user";

export const filterGlobalAttributes = (attributes: IGlobalAttributeValues[] | undefined, requiredAttributes: string[] = []) => {
  if (!attributes?.length || !requiredAttributes?.length) return [];

  return requiredAttributes.map((key) => attributes.find((attribute) => attribute.attributeCode?.toLowerCase() === key.toLowerCase())).filter(Boolean) as IGlobalAttributeValues[];
};

export const prepareProductList = (productList: IProductListResponse, portalData?: IProductPortalData) => ({
  productList: productList.products || [],
  totalProducts: productList.totalProductCount || 0,
  searchProfileId: productList.searchProfileId || null,
  totalCmsPages: productList.totalCMSPageCount || 0,
  pageNumber: productList.pageNumber || null,
  pageSize: productList.pageSize || null,
  globalAttributes: filterGlobalAttributes(portalData?.globalAttributes, ["LoginToSeePricingAndInventory", "DisplayAllWarehousesStock"]) || [],
});

export const mapAttributeValues = (attributes: IBaseAttribute[]) => {
  if (attributes && attributes.length > 0) {
    const filteredAttributes: IBaseAttribute[] = attributes.map((attribute: IBaseAttribute) => ({
      attributeCode: attribute.attributeCode,
      attributeName: attribute.attributeName,
      attributeValues: attribute.attributeValues,
      attributeTypeName: attribute.attributeTypeName,
      selectValues: attribute.selectValues,
      custom1: attribute.custom1,
      custom2: attribute.custom2,
      custom3: attribute.custom3,
      custom4: attribute.custom4,
      custom5: attribute.custom5,
    }));

    return filteredAttributes;
  }
  return [] as IBaseAttribute[];
};

export const mapPromotionValues = (promotions: IPromotion[]) => {
  if (promotions && promotions.length > 0) {
    const filteredPromotions: IPromotion[] = promotions.map((promotion: IPromotion) => ({
      publishProductId: promotion.publishProductId,
      promotionId: promotion.promotionId,
      promotionProductQuantity: promotion.promotionProductQuantity,
      promotionType: promotion.promotionType,
      promotionMessage: promotion.promotionMessage,
      expirationDate: promotion.expirationDate,
      activationDate: promotion.activationDate,
      createdBy: promotion.createdBy,
      createdDate: promotion.createdDate,
      modifiedBy: promotion.modifiedBy,
      modifiedDate: promotion.modifiedDate,
      custom1: promotion.custom1,
      custom2: promotion.custom2,
      custom3: promotion.custom3,
      custom4: promotion.custom4,
      custom5: promotion.custom5,
    }));

    return filteredPromotions;
  }
  return [] as IPromotion[];
};

export const mapProductData = (product: IProduct) => {
  const {
    categoryIds,
    categoryRelationshipIds,
    createdBy,
    externalId,
    createdDate,
    modifiedBy,
    modifiedDate,
    actionMode,
    version,
    boost,
    swatchAttributesValues,
    reOrderLevel,
    portalId,
    productId,
    obsoleteClass,
    currencySuffix,
    backOrderMessage,
    associatedProducts,
    priceView,
    ...remainingFields
  } = product;

  return remainingFields;
};

export const mapProductDetails = (productDetails: IProductDetails) => {
  const {
    version,
    versionId,
    shippingCost,
    parentProductAlternateImages,
    parentProductVideos,
    promotionId,
    categoryHierarchy,
    isDefaultConfigurableProduct,
    additionalCost,
    ordersDiscount,
    cartParameter,
    productPrice,
    pimProductId,
    znodeProductCategoryIds,
    createdBy,
    createdDate,
    modifiedBy,
    modifiedDate,
    actionMode,
    ...remainingFields
  } = productDetails;

  return remainingFields;
};

export const getRequiredAttributeList = (globalAttributes: IBaseAttribute[], requiredAttributes: string[]) => {
  if (!Array.isArray(globalAttributes) || !Array.isArray(requiredAttributes)) return [];
  return requiredAttributes.map((key) => globalAttributes.find((attribute) => attribute?.attributeCode?.toLowerCase() === key.toLowerCase())).filter(Boolean) as IBaseAttribute[];
};

const recentlyViewProductsAttributes: string[] = [
  PRODUCT.MAXIMUM_QUANTITY,
  PRODUCT.MINIMUM_QUANTITY,
  PRODUCT.DISABLE_PURCHASING,
  INVENTORY.ALLOW_BACK_ORDERING,
  PRODUCT.DONT_TRACK_INVENTORY,
  PRODUCT.CALL_FOR_PRICING,
  PRODUCT.OUT_OF_STOCK_OPTIONS,
];

export async function mapProductInformation(
  data: IProductListCard | IProductDetails,
  globalAttributes: IGlobalAttributeValues[],
  portalId: number,
  localeId: number,
  publishCatalogId: number,
  userDetails: IUser | null,
  recentlyViewProducts?: boolean,
) {
  const isUserLoggedIn = userDetails && userDetails.userId && userDetails.userId > 0 ? true : false;
  let inventoryList: ProductInventoryDetailResponse = {};
  const isGetAllLocationsInventory = globalAttributes?.find((a) => a.attributeCode?.toLowerCase() === PRODUCT.DISPLAY_ALL_WAREHOUSES_STOCK.toLowerCase())?.attributeValue;
  if (stringToBooleanV2(isGetAllLocationsInventory) && !recentlyViewProducts) {
    const filters: FilterTuple[] = await getProductFilters(portalId, localeId, publishCatalogId || 0, undefined, undefined, isGetAllLocationsInventory);
    inventoryList = await PublishProduct_getProductInventory(data.publishProductId as number, undefined, filters);
  }
  const isLoginRequiredForPricingAndInventory =
    globalAttributes.find((a) => a.attributeCode?.toLowerCase() === PRODUCT.LOGIN_TO_SEE_PRICING_AND_INVENTORY.toLowerCase())?.attributeValue || "";

  const outOfStockOption = getAttributeValue(data.attributes, PRODUCT.OUT_OF_STOCK_OPTIONS, "selectValues", 0, "code") || "";

  const disablePurchasing = outOfStockOption === INVENTORY.DISABLE_PURCHASING;
  const allowBackOrdering = outOfStockOption === INVENTORY.ALLOW_BACK_ORDERING;
  const isDonTrackInventory = outOfStockOption === INVENTORY.DONT_TRACK_INVENTORY;
  const isObsolete = stringToBoolean(getAttributeValue(data.attributes, PRODUCT.IS_OBSOLETE, "attributeValues") as string);
  return {
    addOns: data.addOns ?? [],
    globalAttributes: {
      loginToSeePricingAndInventory: isLoginRequiredForPricingAndInventory,
      displayAllWarehousesStock: isGetAllLocationsInventory,
    },
    isCallForPricing: getAttributeValue(data.attributes, PRODUCT.CALL_FOR_PRICING, "attributeValue"),
    allWarehousesStock: getAttributeValue(data.attributes, PRODUCT.DISPLAY_ALL_WAREHOUSE_STOCK, "attributeValue"),
    stockNotification: getAttributeValue(data.attributes, PRODUCT.ENABLE_INVENTORY_STOCK_NOTIFICATION, "attributeValue"),
    productType: getAttributeValue(data.attributes, PRODUCT.PRODUCT_TYPE, "selectValues", 0),
    isObsolete,
    inventory: inventoryList.ProductInventory ? convertCamelCase(inventoryList.ProductInventory.Inventory) : [],
    seoTitle: data.seoTitle,
    znodeCatalogId: data.znodeCatalogId,
    productId: data.productId,
    brandName: data.brandName,
    defaultWarehouseCount: data.defaultWarehouseCount,
    name: data.name,
    highlightList: data.highlightList,
    quantity: data.quantity,
    rating: data.rating,
    imageSmallPath: data.imageSmallPath as string,
    seoUrl: data.seoUrl,
    publishProductId: data.publishProductId as number,
    totalReviews: data.totalReviews ?? 0,
    sku: data.sku,
    attributes: recentlyViewProducts ? getRequiredAttributeList(data.attributes, recentlyViewProductsAttributes) : data.attributes,
    allLocationQuantity: data.allLocationQuantity,
    currencySuffix: data.currencySuffix,
    shouldShowViewDetails: data.shouldShowViewDetails,
    znodeProductId: data.znodeProductId,
    promotions: data.promotions,
    retailPrice: !isUserLoggedIn && stringToBoolean(isLoginRequiredForPricingAndInventory) === true ? 0 : data.retailPrice,
    salesPrice: !isUserLoggedIn && stringToBoolean(isLoginRequiredForPricingAndInventory) === true ? 0 : data.salesPrice,
    disablePurchasing,
    allowBackOrdering,
    isDonTrackInventory,
    isConfigurableProduct: data.isConfigurableProduct,
    unitOfMeasurement: String(getAttributeValue(data.attributes, PRODUCT.UOM) || ""),
    isAddToCartDisabled: (disablePurchasing && Number(data.quantity) === 0) || isObsolete || false,
  };
}

export function getInventoryList(inventory: IProductInventory[]) {
  const uniqueWarehouses = new Map();
  for (const item of inventory) {
    const key = item.warehouseName;

    if (!uniqueWarehouses.has(key)) {
      uniqueWarehouses.set(key, item);
    }
  }
  return Array.from(uniqueWarehouses.values() || []);
}

export function mapProductCardDetails(data: IProduct, globalAttributes: IGlobalAttributeValues[], userId: number, highlight: IHighlight[]) {
  const isLoginRequiredForPricingAndInventory = globalAttributes.find(
    (a) => a.attributeCode?.toLowerCase() === PRODUCT.LOGIN_TO_SEE_PRICING_AND_INVENTORY.toLowerCase()
  )?.attributeValue;
  const isGetAllLocationsInventory = globalAttributes?.find((a) => a.attributeCode?.toLowerCase() === PRODUCT.DISPLAY_ALL_WAREHOUSES_STOCK.toLowerCase())?.attributeValue;
  const outOfStockOption = getAttributeValue(data.attributes || [], PRODUCT.OUT_OF_STOCK_OPTIONS, "selectValues", 0, "code") || "";
  const disablePurchasing = outOfStockOption === INVENTORY.DISABLE_PURCHASING;
  const allowBackOrdering = outOfStockOption === INVENTORY.ALLOW_BACK_ORDERING;
  const isDonTrackInventory = outOfStockOption === INVENTORY.DONT_TRACK_INVENTORY;
  const isObsolete = stringToBooleanV2(getAttributeValue(data.attributes || [], PRODUCT.IS_OBSOLETE, "attributeValues") as string);
  const product: IProductCard = {
    isCallForPricing: stringToBooleanV2(getAttributeValue(data.attributes || [], PRODUCT.CALL_FOR_PRICING, "attributeValues")),
    allWarehousesStock: stringToBooleanV2(getAttributeValue(data.attributes || [], PRODUCT.DISPLAY_ALL_WAREHOUSE_STOCK, "attributeValue")),
    unitOfMeasurement: String(getAttributeValue(data.attributes, PRODUCT.UOM) || ""),
    stockNotification: String(getAttributeValue(data.attributes || [], PRODUCT.ENABLE_INVENTORY_STOCK_NOTIFICATION, "attributeValue") || ""),
    productType: String(getAttributeValue(data.attributes || [], PRODUCT.PRODUCT_TYPE, "selectValues", 0) || ""),
    isObsolete,
    inventory: stringToBooleanV2(isGetAllLocationsInventory) ? getInventoryList(data.inventory || []) : [],
    seoTitle: String(data.seoTitle || ""),
    znodeCatalogId: Number(data.znodeCatalogId || 0),
    productId: data.productId,
    brandName: String(data.brandName || ""),
    defaultWarehouseCount: data.defaultWarehouseCount,
    name: data.name,
    quantity: data.quantity || 0,
    rating: data.rating || 0,
    imageSmallPath: data.imageSmallPath as string,
    seoUrl: String(data.seoUrl || ""),
    publishProductId: data.publishProductId as number,
    totalReviews: data.totalReviews ?? 0,
    sku: data.sku,
    allLocationQuantity: data.allLocationQuantity,
    currencySuffix: String(data.currencySuffix || ""),
    shouldShowViewDetails: data.shouldShowViewDetails || false,
    znodeProductId: data.znodeProductId || 0,
    promotions: data.promotions || [],
    retailPrice: !userId && isLoginRequiredForPricingAndInventory === "true" ? 0 : data.retailPrice,
    salesPrice: !userId && isLoginRequiredForPricingAndInventory === "true" ? 0 : data.salesPrice,
    disablePurchasing,
    allowBackOrdering,
    isDonTrackInventory,
    isAddToCartDisabled: (disablePurchasing && Number(data.quantity) === 0) || isObsolete || false,
    isConfigurableProduct: getAttributeValue(data.attributes, PRODUCT.PRODUCT_TYPE, "selectValues", 0, "code") === PRODUCT_TYPE.CONFIGURABLE_PRODUCT || false,
    isActive: stringToBooleanV2(getAttributeValue(data.attributes || [], PRODUCT.IS_ACTIVE, "attributeValues") as string),
    highlightList: highlight || [],
  };
  return product as IProductCard;
}
