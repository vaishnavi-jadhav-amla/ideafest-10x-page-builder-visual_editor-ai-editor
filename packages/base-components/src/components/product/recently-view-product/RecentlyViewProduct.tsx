"use client";

import { IProductDetails, IRecentlyViewedSkuProductList } from "@znode/types/product-details";
import React, { useEffect, useState } from "react";

import { CardSlider } from "../../common/card-slider";
import { Heading } from "../../common/heading";
import { IProductListCard } from "@znode/types/product";
import { LoadingSpinnerComponent } from "../../common/icons";
import { ProductCard } from "../../common/product-card";
import { getRecentlyViewProducts } from "../../../http-request/product";
import { updateRecentViewedProducts } from "./RecentlyViewProductUtils";
import { useTranslationMessages } from "@znode/utils/component";

const RecentlyViewProduct = ({ productData }: { productData: IProductDetails }) => {
  const productTranslations = useTranslationMessages("Product");
  const [recentlyViewProducts, setRecentlyViewProducts] = useState<IRecentlyViewedSkuProductList[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    productData && setRecentlyViewProductsDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productData]);

  const setRecentlyViewProductsDetails = async () => {
    setIsLoading(true);
    const productList = updateRecentViewedProducts(productData);
    const result = productList && productList.length > 0 && await getRecentlyViewProducts(productList) || [];
    setRecentlyViewProducts(result as IRecentlyViewedSkuProductList[]);
    setIsLoading(false);
  };

  const renderRecentlyViewProducts = (productList: IProductListCard[]) => {
    return productList.map((recentlyViewProduct: IProductListCard, i: number) => {
      return (
        <ProductCard
          product={recentlyViewProduct}
          key={recentlyViewProduct.sku}
          id={i}
          showButton={recentlyViewProduct.shouldShowViewDetails}
          globalAttributes={{
            loginToSeePricingAndInventory: (recentlyViewProduct.globalAttributes && String(recentlyViewProduct.globalAttributes.loginToSeePricingAndInventory)) || "false",
            displayAllWarehousesStock: (recentlyViewProduct.globalAttributes && String(recentlyViewProduct.globalAttributes.displayAllWarehousesStock)) || "false",
          }}
        />
      );
    });
  };

  return (
    <>
      {recentlyViewProducts && !isLoading ? (
        recentlyViewProducts.length > 0 ? (
          <div className="no-print mt-5">
            <div>
              <Heading
                level="h1"
                showSeparator
                name={productTranslations("recentlyViewedProducts")}
                customClass="text-center uppercase"
                dataTestSelector="hdgRecentlyViewedProducts"
              />
              <CardSlider>{renderRecentlyViewProducts(recentlyViewProducts as IProductListCard[])}</CardSlider>
            </div>
          </div>
        ) : null
      ) : (
        <LoadingSpinnerComponent />
      )}
    </>
  );
};

export default RecentlyViewProduct;
