"use client";

import React, { useEffect, useState } from "react";
import { setLocalStorageData, useTranslationMessages } from "@znode/utils/component";

import Button from "../../common/button/Button";
import { ICompareProduct } from "@znode/types/product-details";
import ImageWrapper from "../../common/image/Image";
import { Price } from "../price/Price";
import SignInOrRegisterText from "../../sign-in-register-text/SignInOrRegisterText";
import { Tooltip } from "../../common/tooltip";
import { ZIcons } from "../../common/icons";
import { getCompareProductDetails } from "../../../http-request";
import { useProduct } from "../../../stores";
import { useRouter } from "next/navigation";
import useUserStore from "../../../stores/user-store";

export function CompareProductList() {
  const { product, deleteCompareProduct, updateCompareProductList } = useProduct();
  const productTranslation = useTranslationMessages("Product");
  const commonTranslation = useTranslationMessages("Common");
  const [isLoginToSeePricing, setIsLoginToSeePricing] = useState(false);
  const router = useRouter();
   const { user } = useUserStore();
  const compareProductList = () => {
    router.push("/compare-product");
  };

  const getProductList = async () => {
    if (product.compareProductList && product.compareProductList.length > 0) {
      const productListResponse = await getCompareProductDetails({ productList: product.compareProductList as ICompareProduct[], isProductList: true });
      setIsLoginToSeePricing(productListResponse.isLoginToSeePricing);
      setLocalStorageData("compareProductList", JSON.stringify(productListResponse?.productList));
      updateCompareProductList(productListResponse?.productList);
    }
  };

  useEffect(() => {
    getProductList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div data-test-selectors="divProductCompareContainer">
      {product.compareProductList && product.compareProductList.length > 0 && (
        <h3 className="font-semibold text-lg uppercase" data-test-selector="hdgCompareProduct">
          {productTranslation("compareProduct")}
        </h3>
      )}
      <div data-test-selector="divCompareProductContainer">
        {product.compareProductList &&
          product.compareProductList.length > 0 &&
          product.compareProductList.map((productInfo) => {
            return (
              <div
                className="flex gap-2 relative justify-between items-center p-4 border rounded-cardBorderRadius my-4 lg:relative"
                key={productInfo.productId}
                data-test-selector={`divProductCompareDetails${productInfo.productId}`}
              >
                <div className="flex gap-2">
                  <ImageWrapper
                    imageLargePath={productInfo?.image as string}
                    seoTitle={productInfo.name as string}
                    dataTestSelector={`${productInfo.productId}`}
                    cssClass="w-9 h-9 min-w-9 min-h-9 object-contain"
                  />
                  <div className="flex flex-col gap-2">
                    <div data-test-selector={`divProductCompareName${productInfo.productId}`} className="text-sm">
                      {productInfo.name || "-"}
                    </div>
                    {!productInfo.isCallForPricing && (
                      <div data-test-selector={`divProductComparePrice${productInfo.productId}`} className="text-sm">
                        {isLoginToSeePricing && !user ? (
                          <SignInOrRegisterText isReadyCheckoutTextShow={false} />
                        ) : (
                          productInfo.retailPrice !== null &&
                          productInfo.retailPrice !== 0 && (
                            <Price
                              retailPrice={Number(productInfo.retailPrice)}
                              currencyCode=""
                              isObsolete={false}
                              isCallForPricing={false}
                              salesPrice={Number(productInfo.salesPrice)}
                              id={productInfo.productId}
                            />
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  className="absolute -top-3 -right-2 bg-black text-white rounded-full p-1"
                  onClick={() => deleteCompareProduct(productInfo.productId)}
                  data-test-selector="btnRemoveCompareProduct"
                >
                  <Tooltip message={commonTranslation("remove")}>
                    <ZIcons name="x" color="white" width="13" height="13" data-test-selector={`svgRemoveProduct${product.productId}`} />
                  </Tooltip>
                </button>
              </div>
            );
          })}
        {product.compareProductList && product.compareProductList.length > 1 && (
          <div className="w-full">
            <Button
              type="primary"
              className="btn btn-primary w-full mb-4"
              dataTestSelector="btnCompare"
              onClick={compareProductList}
              loaderColor="currentColor"
              loaderWidth="20px"
              loaderHeight="20px"
            >
              {productTranslation("compare")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
