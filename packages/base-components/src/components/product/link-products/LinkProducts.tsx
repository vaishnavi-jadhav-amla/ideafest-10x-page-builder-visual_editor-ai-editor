"use client";

import React, { useEffect, useState } from "react";

import { CardSlider } from "../../common/card-slider";
import { Heading } from "../../common/heading";
import { IProductListCard } from "@znode/types/product";
import { ProductCard } from "../../common/product-card";
import { getLinkProductList } from "../../../http-request/product/product";
import { useProduct } from "../../../stores/product";

interface IProductList {
  name: string;
  products: IProductListCard[];
}
export interface IProductsPDP {
  productSku?: string;
  productId?: number;
}
function LinkProducts({ productSku, productId }: IProductsPDP) {
  const [productList, setProductList] = useState<IProductList[]>([]);

  const {
    setIsViewReplacementProductTriggered,
    product: { isViewReplacementProductTriggered },
  } = useProduct();
  const getProductList = async () => {
    const result = await getLinkProductList(String(productSku), productId || 0);
    setProductList(result as []);
  };

  useEffect(() => {
    document.getElementById("replacementProduct")?.addEventListener("click", function () {
      scrollOnReplacementProductList();
    });
    getProductList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isViewReplacementProductTriggered && productList?.length > 0) scrollOnReplacementProductList();
    return () => setIsViewReplacementProductTriggered(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isViewReplacementProductTriggered, productList?.length]);

  const scrollOnReplacementProductList = () => {
    const element = document.getElementById("replacementProductSuggestionList");
    if (element) {
      const targetRect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const newScrollPosition = targetRect.top + window.scrollY + targetRect.height / 4 - windowHeight / 2;
      window.scrollTo({
        top: newScrollPosition,
        behavior: "smooth",
      });
    }
    setIsViewReplacementProductTriggered(false);
  };

  return (
    <div id="replacementProductSuggestionList" className="no-print mt-5">
      {productList?.map(
        (productListData: IProductList, index: number) =>
          productListData.products?.length > 0 && (
            <div key={`${productListData.name}-${index}`}>
              <Heading name={productListData.name} customClass="text-center uppercase" level="h1" dataTestSelector={`hdgLinkProduct${index}`} showSeparator />
              <CardSlider>
                {productListData.products?.map((product: IProductListCard, i) => {
                  return (
                    <ProductCard
                      product={product}
                      key={product.sku}
                      id={i}
                      showButton={product.shouldShowViewDetails}
                      globalAttributes={{
                        loginToSeePricingAndInventory: String(product.globalAttributes?.loginToSeePricingAndInventory || "false"),
                        displayAllWarehousesStock: String(product.globalAttributes?.displayAllWarehousesStock || "false"),
                      }}
                    />
                  );
                })}
              </CardSlider>
            </div>
          )
      )}
    </div>
  );
}

export default React.memo(LinkProducts, (prevProps, nextProps) => prevProps.productSku === nextProps.productSku);
