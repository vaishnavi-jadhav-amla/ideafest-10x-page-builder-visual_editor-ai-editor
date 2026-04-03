import { IAttributesDetails, IInventory, IProductListCard } from "@znode/types/product";

import { ISearchResponse } from "@znode/types/search-term";
import { INVENTORY, PRODUCT, PRODUCT_TYPE } from "@znode/constants/product";
import { getAttributeValue } from "packages/utils/src/common/attribute-helper";
import { stringToBooleanV2 } from "packages/utils/src/common/string-to-boolean";

export const getFilteredDataAttributes = (products: IAttributesDetails[], keys: string[]) => {
  if (products && products.length == 0) {
    return [];
  }
  const attributesList = products.filter((val: IAttributesDetails) => {
    return keys.includes(val?.attributeCode || "");
  });
  return attributesList;
};

export const getFilteredInventoryData = (inventoryData: IInventory[]) => {
  if (inventoryData && inventoryData.length == 0) {
    return [];
  }
  const filteredInventoryData = inventoryData.map((val: IInventory) => ({
    isDefaultWarehouse: val?.isDefaultWarehouse,
    warehouseName: val?.warehouseName,
    quantity: val?.quantity,
  }));
  const uniqueWarehouseNames = new Set();
  const uniqueInventory = filteredInventoryData.filter((item: IInventory) => {
    if (!uniqueWarehouseNames.has(item.warehouseName)) {
      uniqueWarehouseNames.add(item.warehouseName);
      return true;
    }
    return false;
  });
  return uniqueInventory;
};

export const getFilteredProductData = (searchResult: ISearchResponse) => {
  const productData = searchResult?.products?.map((product: IProductListCard) => {
    const outOfStockOption = getAttributeValue(product.attributes || [], PRODUCT.OUT_OF_STOCK_OPTIONS, "selectValues", 0, "code") || "";
    const disablePurchasing = outOfStockOption === INVENTORY.DISABLE_PURCHASING;
    const allowBackOrdering = outOfStockOption === INVENTORY.ALLOW_BACK_ORDERING;
    const isDonTrackInventory = outOfStockOption === INVENTORY.DONT_TRACK_INVENTORY;
    return {
      name: product?.name ?? "",
      znodeProductId: product?.znodeProductId ?? 0,
      imageSmallPath: product?.imageSmallPath ?? "",
      sku: product?.sku ?? "",
      highlightList: product?.highlightList ?? "",
      rating: product?.rating ?? "",
      productReviews: product?.productReviews ?? "",
      categoryIds: product?.categoryIds ?? "",
      productId: product?.publishProductId ?? "",
      publishProductId: product?.publishProductId ?? "",
      seoUrl: product?.seoUrl ?? "",
      retailPrice: product?.retailPrice ?? null,
      salesPrice: product?.salesPrice ?? null,
      quantity: product?.quantity,
      inventory: getFilteredInventoryData(product?.inventory || []),
      allLocationQuantity: product?.allLocationQuantity,
      attributes: getFilteredDataAttributes(product?.attributes || [], [
        "OutOfStockOptions",
        "DontTrackInventory",
        "DisablePurchasing",
        "IsObsolete",
        "ProductType",
        "UOM",
        "CallForPricing",
      ]),
      productType: String(getAttributeValue(product.attributes || [], PRODUCT.PRODUCT_TYPE, "selectValues", 0) || ""),
      disablePurchasing,
      allowBackOrdering,
      isDonTrackInventory,
      allWarehousesStock: stringToBooleanV2(getAttributeValue(product.attributes || [], PRODUCT.DISPLAY_ALL_WAREHOUSE_STOCK, "attributeValue")),
      unitOfMeasurement: String(getAttributeValue(product.attributes, PRODUCT.UOM) || ""),
      stockNotification: String(getAttributeValue(product.attributes || [], PRODUCT.ENABLE_INVENTORY_STOCK_NOTIFICATION, "attributeValue") || ""),
      isObsolete: stringToBooleanV2(getAttributeValue(product.attributes || [], PRODUCT.IS_OBSOLETE, "attributeValues") as string),
      isConfigurableProduct: getAttributeValue(product.attributes, PRODUCT.PRODUCT_TYPE, "selectValues", 0, "code") === PRODUCT_TYPE.CONFIGURABLE_PRODUCT || false,
      totalReviews: product?.totalReviews,
      seoTitle: product?.seoTitle || "",
      znodeCatalogId: product?.znodeCatalogId || 0,
      brandName: product?.brandName || "",
      defaultWarehouseCount: product.defaultWarehouseCount || 0,
      currencySuffix: product?.currencySuffix || "",
      shouldShowViewDetails: product?.shouldShowViewDetails || undefined,
      isCallForPricing: stringToBooleanV2(getAttributeValue(product?.attributes || [], PRODUCT.CALL_FOR_PRICING, "attributeValues")),
      discountAmount: product?.discountAmount || undefined,
      currencyCode: product?.currencyCode || "",
      promotions: product?.promotions || undefined,
      addOns: product?.addOns || [],
      globalAttributes: product?.globalAttributes || undefined,
    };
  });
  return {
    productList: productData || ([] as IProductListCard[]),
    totalProducts: searchResult?.paginationDetail?.totalResults || 0,
    totalCmsPages: searchResult?.paginationDetail?.totalPages || 0,
    pageNumber: searchResult.paginationDetail?.pageIndex || 0,
    pageSize: searchResult?.paginationDetail.pageSize || 0,
    pageList: searchResult.pageList || [],
    searchProfileId: null,
    sortList: searchResult.sortList || [],
  };
};
