import { IProductDetails, IRecentlyViewedSkuProductList } from "@znode/types/product-details";
import { getLocalStorageData, setLocalStorageData } from "@znode/utils/component";

import { IProduct } from "@znode/types/product";

export function updateRecentViewedProducts(productData: IProductDetails | IProduct) {
  const recentViewProductsList = getLocalStorageData("RecentlyViewProducts");
  const recentViewProducts: IRecentlyViewedSkuProductList[] = recentViewProductsList ? JSON.parse(getLocalStorageData("RecentlyViewProducts")) : [];
  const isProductAlreadyExists = recentViewProducts.some((product) => product.sku === productData?.sku);
  if (!isProductAlreadyExists) {
    const recentlyViewProduct = mapRecentlyViewedProductDetail(productData);
    if (recentViewProducts.length <= 10) {
      recentViewProducts.push(recentlyViewProduct as IRecentlyViewedSkuProductList);
      setLocalStorageData("RecentlyViewProducts", JSON.stringify(recentViewProducts));
    } else {
      recentViewProducts.shift();
      recentViewProducts.push(recentlyViewProduct as IRecentlyViewedSkuProductList);
      setLocalStorageData("RecentlyViewProducts", JSON.stringify(recentViewProducts));
    }
  }
  return recentViewProducts?.filter((product) => product.sku !== productData.sku).reverse();
}

export function mapRecentlyViewedProductDetail(productData: IProductDetails | IProduct) {
  return {
    sku: productData.sku,
    publishProductId: productData.configurableProductId && productData.configurableProductId > 0 ? productData.configurableProductId : productData.publishProductId,
  };
}
