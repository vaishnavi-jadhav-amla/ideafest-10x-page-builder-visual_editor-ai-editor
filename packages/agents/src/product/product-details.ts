import { AREA, errorStack, logServer } from "@znode/logger/server";
import { ExpandCollection, FilterCollection, FilterKeys, FilterOperators, convertCamelCase, generateTagName, getPortalHeader } from "@znode/utils/server";
import { IAttributeDetails, IBaseAttribute, IConfigurableAttribute } from "@znode/types/attribute";
import { IAttributesDetails, ICustomerReviewResponse, IInventoryDetails, IProductPortalData, IPromotion } from "@znode/types/product";
import { INVENTORY, PRODUCT, PRODUCT_REVIEW, PRODUCT_TYPE } from "@znode/constants/product";
import { IProductDetails, IPublishBundleProductsDetails } from "@znode/types/product-details";
import { PublishProducts_inventoryCountByProductSku, PublishProducts_publishedProductsByPublishProductId } from "@znode/clients/v2";
import { checkAddOnInventory, getProductFinalPrice } from "../add-on/add-on";
import { getAttributeValue, getSavedUserSession, stringToBoolean, stringToBooleanV2 } from "@znode/utils/common";

import { CACHE_KEYS } from "@znode/constants/cache-keys";
import { CustomersReviews_customersReviewsGet } from "@znode/clients/v2";
import { FilterTuple } from "@znode/clients/v1";
import { IPortalDetail } from "@znode/types/portal";
import { IProductReview } from "@znode/types/product-details";
import { IUser } from "@znode/types/user";
import { PAGINATION } from "@znode/constants/pagination";
import { convertDateTime } from "@znode/utils/component";
import { getCatalogCode } from "../category";
import { getGeneralSettingList } from "../general-setting";
import { getGroupProductList } from "./group-product";
import { getHighlightListFromAttributes } from "./product-helper";
import { getPortalDetails } from "../portal/portal";
import { getProductExpands } from "../widget";
import { mapProductDetails } from "./mapper";
import { getProductFilters } from "./product-filters";

//Fetch product details with inventory, pricing, and configuration handling

export async function getRecentlyViewProductList(productId: number, portalDetails: IPortalDetail, userSession: IUser | null, catalogCode: string, filters: FilterTuple[] = []) {
  try {
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(
      FilterKeys.CacheTags,
      FilterOperators.Contains,
      generateTagName(`${CACHE_KEYS.PUBLISH_PRODUCT}, ${CACHE_KEYS.CATALOG}, ${CACHE_KEYS.DYNAMIC_TAG}`, productId.toString(), catalogCode, "PublishedProductsByPublishProductId")
    );
    const expand: ExpandCollection = await getProductExpands();
    const productResponse = await PublishProducts_publishedProductsByPublishProductId(productId, expand, filters, cacheInvalidator.filterTupleArray as FilterTuple[]);
    const productData = convertCamelCase(productResponse);
    const isAllWarehousesStock = portalDetails?.globalAttributes?.find(
      (a: IAttributeDetails) => a.attributeCode?.toLowerCase() === PRODUCT.DISPLAY_ALL_WAREHOUSES_STOCK.toLowerCase()
    )?.attributeValue;
    const isLoginToSeePricing = portalDetails?.globalAttributes?.find(
      (a) => a.attributeCode?.toLowerCase() === PRODUCT.LOGIN_TO_SEE_PRICING_AND_INVENTORY.toLowerCase()
    )?.attributeValue;
    productData.displayAllWarehousesStock = isAllWarehousesStock || false;
    productData.isLoginToSeePricing = typeof isLoginToSeePricing === "string" ? stringToBooleanV2(isLoginToSeePricing) : false;
    if (!productData) return null;
    const userId: number = userSession?.userId ?? 0;
    if (!userId && productData.isLoginToSeePricing) {
      productData.retailPrice = 0;
      productData.salesPrice = 0;
    }
    productData.isConfigurable = productData.isConfigurableProduct;
    productData.configurableProductSku = productData.configurableproductSku;
    const productDetails = enrichProductDetails(productData, portalDetails);
    productDetails.isCallForPricing = typeof productDetails.isCallForPricing === "string" ? stringToBooleanV2(productDetails.isCallForPricing) : false;
    productDetails.storeName = portalDetails.name;
    const globalProductMessage = portalDetails.globalAttributes?.find((a) => a.attributeCode?.toLowerCase() === PRODUCT.GLOBAL_PRODUCT_MESSAGE.toLowerCase())?.attributeValue;
    const productInfo = { ...productDetails, globalProductMessage };
    const outOfStockOption = getAttributeValue(productDetails.attributes, PRODUCT.OUT_OF_STOCK_OPTIONS, "selectValues", 0, "code") || "";
    const disablePurchasing = outOfStockOption === INVENTORY.DISABLE_PURCHASING;
    const allowBackOrdering = outOfStockOption === INVENTORY.ALLOW_BACK_ORDERING;
    const isDonTrackInventory = outOfStockOption === INVENTORY.DONT_TRACK_INVENTORY;
    const isCallForPricingPromotion = productData?.promotions?.some((x: IPromotion) => x.promotionType?.toLowerCase() === PRODUCT.CALL_FOR_PRICING_MESSAGE.toLowerCase());
    productInfo.isCallForPricingPromotion = isCallForPricingPromotion;
    productInfo.disablePurchasing = disablePurchasing;
    productInfo.allowBackOrdering = allowBackOrdering;
    productInfo.dontTrackInventory = isDonTrackInventory;
    productInfo.isConfigurableProduct = productData.isConfigurableProduct;
    return productInfo;
  } catch (error) {
    logServer.error(AREA.RECENTLY_VIEWED_PRODUCT, errorStack(error));
    return null;
  }
}

export async function getProductDetails(productId: number, portalDetails?: IPortalDetail, userSession?: IUser | null) {
  try {
    const userData = userSession ? userSession : await getSavedUserSession();
    const portalData = portalDetails ? portalDetails : await getPortalDetails();
    const { localeId } = await getPortalHeader();
    portalData.localeId = localeId;
    const catalogCode = await getCatalogCode(portalData, userData as IUser);
    if (!portalData) return null;
    const filters = await getProductFilters(portalData, productId, userData as IUser);
    const cacheInvalidator = new FilterCollection();
    cacheInvalidator.add(
      FilterKeys.CacheTags,
      FilterOperators.Contains,
      generateTagName(
        `${CACHE_KEYS.PUBLISH_PRODUCT}, ${CACHE_KEYS.CATALOG}, ${CACHE_KEYS.DYNAMIC_TAG}`,
        productId.toString(),
        catalogCode || "",
        "PublishedProductsByPublishProductId"
      )
    );

    const expand: ExpandCollection = await getProductExpands();
    const productResponse = await PublishProducts_publishedProductsByPublishProductId(productId, expand, filters, cacheInvalidator.filterTupleArray as FilterTuple[]);
    const productData = convertCamelCase(productResponse);
    if (productData && productData.hasError) return null;
    const isAllWarehousesStock = portalData?.globalAttributes?.find(
      (a: IAttributeDetails) => a.attributeCode?.toLowerCase() === PRODUCT.DISPLAY_ALL_WAREHOUSES_STOCK.toLowerCase()
    )?.attributeValue;
    const isLoginToSeePricing = portalData?.globalAttributes?.find(
      (a) => a.attributeCode?.toLowerCase() === PRODUCT.LOGIN_TO_SEE_PRICING_AND_INVENTORY.toLowerCase()
    )?.attributeValue;

    productData.displayAllWarehousesStock = isAllWarehousesStock || false;
    productData.isLoginToSeePricing = typeof isLoginToSeePricing === "string" ? stringToBoolean(isLoginToSeePricing) : false;

    if (!productData) return null;
    const userId: number = userData?.userId ?? 0;
    if (!userId && productData.isLoginToSeePricing) {
      productData.retailPrice = 0;
      productData.salesPrice = 0;
    }
    const frequentlyBought = String(getAttributeValue(productData.attributes, "FrequentlyBought", "attributeValues") || "");
    const youMayAlsoLike = String(getAttributeValue(productData.attributes, "YouMayAlsoLike", "attributeValues") || "");
    const replacementproductSuggestions = String(getAttributeValue(productData.attributes, "ProductSuggestions", "attributeValues") || "");
    const productType = getAttributeValue(productData.attributes, PRODUCT.PRODUCT_TYPE, "selectValues");
    let groupProductList = null;
    if (productType === PRODUCT_TYPE.GROUPED_PRODUCT) {
      groupProductList = await getGroupProductList(productId, portalData as IPortalDetail);
    }
    productData.isConfigurable = productData.isConfigurableProduct;
    productData.configurableProductSku = productData.configurableproductSku;
    const productDetails = enrichProductDetails(productData, portalData);
    productDetails.isCallForPricing = typeof productDetails.isCallForPricing === "string" ? stringToBoolean(productDetails.isCallForPricing) : false;
    productDetails.storeName = portalData.name;
    const inventoryDetails = await fetchInventoryData(productDetails?.sku);
    if (inventoryDetails) {
      Object.assign(productDetails, mapProductInventory(inventoryDetails));
    }

    const addonProducts = await mappedProductAddOns(productDetails);
    const wishlistData = await mappedProductWishList(productDetails, userData || {});
    productDetails.wishListId = wishlistData.wishListId;
    productDetails.isAddedInWishList = wishlistData.isAddedInWishList;
    productDetails.storeCode = portalData.storeCode;
    productDetails.frequentlyBought = frequentlyBought;
    productDetails.youMayAlsoLike = youMayAlsoLike;
    productDetails.replacementProductSuggestions = replacementproductSuggestions;
    if (productDetails.publishBundleProducts && productDetails.publishBundleProducts?.length > 0) {
      productDetails.publishBundleProducts = productDetails.publishBundleProducts.map(
        (bundleProduct: IPublishBundleProductsDetails) => bundleProduct && mapBundledProductInventoryDetails(bundleProduct)
      );
    }
    const globalProductMessage = portalData.globalAttributes?.find((a) => a.attributeCode?.toLowerCase() === PRODUCT.GLOBAL_PRODUCT_MESSAGE.toLowerCase())?.attributeValue;
    const productInfo = { ...productDetails, ...addonProducts, globalProductMessage, groupProductList };
    const outOfStockOption = getAttributeValue(productDetails.attributes, PRODUCT.OUT_OF_STOCK_OPTIONS, "selectValues", 0, "code") || "";

    const disablePurchasing = outOfStockOption === INVENTORY.DISABLE_PURCHASING;
    const allowBackOrdering = outOfStockOption === INVENTORY.ALLOW_BACK_ORDERING;
    const isDonTrackInventory = outOfStockOption === INVENTORY.DONT_TRACK_INVENTORY;
    const isCallForPricingPromotion = productData?.promotions?.some((x: IPromotion) => x.promotionType?.toLowerCase() === PRODUCT.CALL_FOR_PRICING_MESSAGE.toLowerCase());
    productInfo.isCallForPricingPromotion = isCallForPricingPromotion;
    productInfo.disablePurchasing = disablePurchasing;
    productInfo.allowBackOrdering = allowBackOrdering;
    productInfo.dontTrackInventory = isDonTrackInventory;
    return mapProductDetails(productInfo);
  } catch (error) {
    logServer.error(
      AREA.PRODUCT,
      `The error occurred in the getProductDetails() method with parameters productId:${productId}, name:${portalDetails?.name}, storeCode:${portalDetails?.storeCode}, userName:${
        userSession?.userName
      } in product-details.ts file. ${errorStack(error)}`
    );
    return null;
  }
}

const mapBundledProductInventoryDetails = (bundleProduct: IPublishBundleProductsDetails) => {
  const bundleAttributes = bundleProduct.attributes || [];
  const bundleProductName = bundleAttributes?.find((bundleAttribute: IAttributeDetails) => bundleAttribute.attributeCode === PRODUCT.PRODUCT_NAME)?.attributeValues ?? "";
  const bundleProductSKU = bundleAttributes?.find((bundleAttribute: IAttributeDetails) => bundleAttribute.attributeCode === PRODUCT.SKU)?.attributeValues ?? "";
  const bundleProductQuantity = bundleProduct.associatedQuantity ?? 0;
  const typicalLeadTime = Number(
    bundleAttributes.filter((x: IAttributeDetails) => x.attributeCode?.toLowerCase() === PRODUCT.TYPICAL_LEAD_TIME.toLowerCase()).at(0)?.attributeValues
  );
  const childProductType =
    bundleAttributes
      ?.filter((x: IAttributeDetails) => x.attributeCode?.toLowerCase() === PRODUCT.PRODUCT_TYPE.toLowerCase())
      .at(0)
      ?.selectValues?.at(0)?.code ?? "";

  const outOfStockOption =
    bundleAttributes
      ?.filter((x) => x.attributeCode === PRODUCT.OUT_OF_STOCK_OPTIONS)
      .at(0)
      ?.selectValues?.at(0)?.code ?? INVENTORY.DONT_TRACK_INVENTORY;

  const isObsolete = String(bundleAttributes?.find((a) => a.attributeCode === PRODUCT.IS_OBSOLETE)?.attributeValues);
  bundleProduct.isObsolete = isObsolete === "undefined" ? false : JSON.parse(isObsolete);
  const inStockQty = bundleProduct?.quantity ?? 0;
  const disablePurchasing = outOfStockOption === INVENTORY.DISABLE_PURCHASING;
  const allowBackOrdering = outOfStockOption === INVENTORY.ALLOW_BACK_ORDERING;
  const isDontTrackInventory = outOfStockOption === INVENTORY.DONT_TRACK_INVENTORY;
  const warehouseName = bundleProduct?.defaultWarehouseName ?? "";
  const publishProductId = bundleProduct?.publishProductId ?? 0;
  const parentSku = bundleProduct?.parentBundleSku ?? "";
  const retailPrice = bundleProduct?.retailPrice ?? 0;
  return {
    ...bundleProduct,
    outOfStockOption,
    bundleProductName,
    bundleProductSKU,
    bundleProductQuantity,
    typicalLeadTime,
    childProductType,
    inStockQty,
    disablePurchasing,
    allowBackOrdering,
    warehouseName,
    publishProductId,
    parentSku,
    retailPrice,
    isDontTrackInventory,
  };
};

// Enrich product details with attributes, pricing, inventory, etc.
const enrichProductDetails = (productData: IProductDetails, portalData: IProductPortalData): IProductDetails => {
  let productDetails = convertCamelCase(productData) ?? {};
  productDetails = {
    ...productDetails,
    ...mapProductAttributes(productDetails.attributes),
    highlightList: getHighlightListFromAttributes(productDetails.attributes, productDetails.sku, productDetails.znodeProductId),
    enableAddToCartForSliders: portalData.portalFeatureValues?.enableAddToCartOptionForProductSliders ?? false,
  };

  return enableConfigurableAttributes(productDetails);
};

export function filterPersonalizationAttribute(isPersonalizedList: IAttributesDetails[] = []) {
  return isPersonalizedList.map((val) => ({
    attributeName: val.attributeName,
    attributeTypeName: val.attributeTypeName,
    isPersonalizable: val.isPersonalizable,
    controlProperty: {
      id: val.controlProperty?.id,
      htmlAttributes: val.controlProperty?.htmlAttributes,
    },
  }));
}

// Enable configurable product attributes
const enableConfigurableAttributes = (productDetails: IProductDetails): IProductDetails => {
  const { znodeCategoryIds = [], znodeProductCategoryIds = [], isConfigurable, configurableData } = productDetails ?? {};

  const hasValidCategories = znodeCategoryIds.length > 0 && znodeProductCategoryIds.length > 0 && isConfigurable;

  if (!hasValidCategories || !configurableData?.configurableAttributes) {
    return productDetails;
  }

  configurableData.configurableAttributes.forEach((attribute: IConfigurableAttribute) => {
    attribute?.configurableAttributes?.forEach((attributeValue) => {
      attributeValue.isDisabled = false;
    });
  });

  return productDetails;
};

// Map product wishlist
export const mappedProductWishList = async (product: IProductDetails, userData: IUser) => {
  const wishListItem = userData?.wishList?.find((x) => x?.sku === product.sku) ?? null;

  return {
    isAddedInWishList: !!wishListItem,
    wishListId: wishListItem?.userWishListId ?? undefined,
  };
};

// Fetch inventory data
const fetchInventoryData = async (sku: string) => {
  const inventoryData = await PublishProducts_inventoryCountByProductSku(sku, 0);
  return convertCamelCase(inventoryData?.ParentProductInventoryDetailResponse);
};

// Map product inventory data
const mapProductInventory = (inventoryDetails: IInventoryDetails) => {
  return {
    maximumQuantity: inventoryDetails.maxOrderQty,
    minimumQuantity: inventoryDetails.minOrderQty,
    allowBackOrdering: inventoryDetails.allowBackOrdering,
    disablePurchasing: inventoryDetails.disablePurchasing,
    dontTrackInventory: inventoryDetails.dontTrackInventory,
    inStockQty: inventoryDetails.inStockQty,
  };
};

// Map product attributes
const mapProductAttributes = (attributes: IAttributeDetails[]) => {
  const videoList = [];
  const video1 = getAttributeValue(attributes, `${PRODUCT.VIDEO}1`, "attributeValues");
  const video2 = getAttributeValue(attributes, `${PRODUCT.VIDEO}2`, "attributeValues");
  if (video1) {
    videoList.push({ attributeCode: "Video1", attributeValues: video1 as string });
  }
  if (video2) {
    videoList.push({ attributeCode: "Video2", attributeValues: video2 as string });
  }
  const personalizeList = attributes && attributes.filter((attr: IAttributesDetails) => attr.attributeTypeName === "Text" && attr?.isPersonalizable === true);
  const isPersonalize = filterPersonalizationAttribute(personalizeList);
  return {
    isLoginRequired: getAttributeValue(attributes, PRODUCT.LOGIN_TO_SEE_PRICING_AND_INVENTORY, "attributeValues") ?? false,
    minimumQuantity: getAttributeValue(attributes, PRODUCT.MINIMUM_QUANTITY, "attributeValues"),
    maximumQuantity: getAttributeValue(attributes, PRODUCT.MAXIMUM_QUANTITY, "attributeValues"),
    brandName: getAttributeValue(attributes, PRODUCT.BRAND, "selectValues", 0),
    isObsolete: getAttributeValue(attributes, PRODUCT.IS_OBSOLETE, "attributeValues") === "true",
    isCallForPricing: getAttributeValue(attributes, PRODUCT.CALL_FOR_PRICING, "attributeValues"),
    allWarehousesStock: getAttributeValue(attributes, PRODUCT.DISPLAY_ALL_WAREHOUSE_STOCK, "attributeValues"),
    stockNotification: getAttributeValue(attributes, PRODUCT.ENABLE_INVENTORY_STOCK_NOTIFICATION, "attributeValues"),
    productType: getAttributeValue(attributes, PRODUCT.PRODUCT_TYPE, "selectValues", 0),
    typicalLeadTime: getAttributeValue(attributes, PRODUCT.TYPICAL_LEAD_TIME, "attributeValues"),
    dynamicAttribute: getCustomFields(attributes),
    videoList: videoList,
    isPersonalize,
    isDownloadable: getAttributeValue(attributes, PRODUCT.IS_DOWNLOADABLE, "attributeValues") === "true",
  };
};

// Map product add-ons and final price
const mappedProductAddOns = async (productDetails: IProductDetails) => {
  const addOnSKU = (productDetails?.addOns?.filter((x) => x.isRequired)?.map((y) => y.addOnValues?.find((x) => x.isDefault)?.sku) ?? []).join(",");

  if (addOnSKU && productDetails.quantity && productDetails.quantity > 0) {
    const inventoryResponse = await checkAddOnInventory(productDetails, addOnSKU, productDetails.minimumQuantity ?? 0);

    if (inventoryResponse) {
      Object.assign(productDetails, {
        InventoryMessage: inventoryResponse.inventoryMessage,
        AllowBackOrdering: inventoryResponse.allowBackOrder,
        TrackInventory: inventoryResponse.trackInventory,
        ShowAddToCart: inventoryResponse.showAddToCart,
      });
    }
  }

  const finalPriceData = getProductFinalPrice(productDetails, productDetails.addOns ?? [], productDetails.minimumQuantity ?? 0, addOnSKU);

  Object.assign(productDetails, {
    ProductPrice: finalPriceData.productPrice ?? 0,
    ShowAddToCart: finalPriceData.showAddToCart,
    InventoryMessage: finalPriceData.inventoryMessage,
    IsCallForPricing: finalPriceData.isCallForPricing,
  });

  const isDisplayVariantsOnGrid = String(productDetails?.attributes?.find((x) => x.attributeCode === INVENTORY.DISPLAY_VARIANTS_ON_GRID)?.attributeValues);
  productDetails.isDisplayVariantsOnGrid = isDisplayVariantsOnGrid !== "undefined" ? JSON.parse(isDisplayVariantsOnGrid) : false;

  return productDetails.isConfigurableProduct && !productDetails.isDisplayVariantsOnGrid
    ? getConfigurableValues(productDetails) // TODO: Configurable Product Data
    : productDetails;
};

// Get custom fields from attributes
const getCustomFields = (attributes: IBaseAttribute[]) => attributes?.filter((attribute) => attribute.isCustomField) ?? [];

export function getConfigurableValues(viewModel: IProductDetails) {
  try {
    const attribute = viewModel?.attributes
      ?.filter((x) => x.isConfigurable && x.configurableAttribute && x.configurableAttribute.length > 0)
      ?.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    viewModel.configurableData = { configurableAttributes: [] };
    if (attribute) {
      attribute.forEach((item) => {
        viewModel?.configurableData?.configurableAttributes?.push(item);
      });
    }
    if (viewModel.isDefaultConfigurableProduct) {
      viewModel?.configurableData?.configurableAttributes?.forEach((x) => {
        if (x.attributeValues) {
          x.selectedAttributeValue = [x.attributeValues];
        } else {
          x.selectedAttributeValue = [];
        }
      });
    } else {
      viewModel?.configurableData?.configurableAttributes?.forEach((x) => {
        if (x?.configurableAttribute && x?.configurableAttribute.length > 0 && x.configurableAttribute[0]?.attributeValue) {
          x.selectedAttributeValue = [x.configurableAttribute[0].attributeValue];
        } else {
          x.selectedAttributeValue = [];
        }
      });
    }
  } catch (error) {
    logServer.error(AREA.PRODUCT, `The error occurred in the getConfigurableValues() method in product-details.ts file. ${errorStack(error)}`);
  }
}

export async function getProductReviewListForPDP(portalId: number, localeId: number, productId: number, sortChoice: string, pageSize: number, pageIndex: number) {
  try {
    const portalData = await getPortalDetails();
    pageSize = pageSize == 0 ? (pageSize = 16) : pageSize;
    pageIndex = pageIndex == 0 ? (pageIndex = 1) : pageIndex;
    const filters: FilterTuple[] = getFilterForProductReviewList(portalId, productId);
    const sort = getSortForReviewList(sortChoice);
    const reviewList = convertCamelCase((await CustomersReviews_customersReviewsGet(portalData.cultureCode?.toString() || "", filters, sort, pageIndex, pageSize)) || {});
    let filteredReviewList = {};
    const generalSetting = await getGeneralSettingList();
    const customerReviewList: IProductReview[] = [];
    if (reviewList?.customerReviewList && reviewList.customerReviewList.length > 0) {
      reviewList.customerReviewList.forEach((productReview: IProductReview) => {
        const formattedDate = convertDateTime(productReview.createdDate || "", generalSetting.dateFormat, generalSetting.timeFormat, generalSetting.displayTimeZone);
        customerReviewList.push({ ...productReview, createdDate: formattedDate });
      });
    }
    filteredReviewList = {
      customerReviewList: customerReviewList,
      pageIndex: reviewList?.paginationDetail?.pageIndex || PAGINATION.DEFAULT_TABLE_PAGE_INDEX,
      pageSize: reviewList?.paginationDetail?.pageSize || PAGINATION.DEFAULT_TABLE_PAGE_SIZE,
      totalPages: reviewList?.paginationDetail?.totalPages || 0,
      totalResults: reviewList?.paginationDetail?.totalResults || 0,
    };
    return (filteredReviewList || {}) as ICustomerReviewResponse;
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));
    return {
      customerReviewList: [],
      pageIndex: 0,
      pageSize: 0,
      totalPages: 0,
      totalResults: 0,
    } as ICustomerReviewResponse;
  }
}

export function getFilterForProductReviewList(portalId: number, productId: number) {
  const filters: FilterCollection = new FilterCollection();
  if (portalId !== undefined && portalId > 0) filters.add(FilterKeys.PortalId, FilterOperators.Equals, portalId.toString());
  filters.add(FilterKeys.PublishProductId.toString(), FilterOperators.Equals, productId.toString());
  filters.add(FilterKeys.Status.toString(), FilterOperators.Is, "A");
  return filters.filterTupleArray;
}

export function getSortForReviewList(sortChoice: string) {
  if (sortChoice == null) {
    sortChoice = PRODUCT_REVIEW.NEWEST_FIRST;
  }

  const sortCollection: { [key: string]: string } = {};
  switch (sortChoice) {
    case PRODUCT_REVIEW.NEWEST_FIRST:
      sortCollection["CreatedDate"] = "DESC";
      break;
    case PRODUCT_REVIEW.OLDEST_FIRST:
      sortCollection["CreatedDate"] = "ASC";
      break;
    case PRODUCT_REVIEW.HIGHEST_RATING_FIRST:
      sortCollection["Rating"] = "DESC";
      break;
    case PRODUCT_REVIEW.LOWEST_RATING_FIRST:
      sortCollection["Rating"] = "ASC";
      break;
  }
  return sortCollection;
}
