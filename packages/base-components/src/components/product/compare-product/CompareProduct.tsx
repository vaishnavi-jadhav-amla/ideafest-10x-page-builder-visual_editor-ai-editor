import { setLocalStorageData, useTranslationMessages } from "@znode/utils/component";

import { CompareIcon } from "../../common/icons/Icons";
import { PRODUCT } from "@znode/constants/product";
import React from "react";
import { useModal } from "../../../stores/modal";
import { useProduct } from "../../../stores/product";

interface ICompareProduct {
  sku: string;
  productId: number;
  name: string;
  image: string;
  retailPrice?: number;
  salesPrice?: number;
}

function CompareProduct({ product, showIcon }: { product: ICompareProduct; showIcon: boolean }) {
  const { product: productDetails, updateCompareProduct, updateCompareProductMessage } = useProduct();
  const { openModal } = useModal();
  const productTranslation = useTranslationMessages("Product");
  const addCompareProduct = () => {
    const { compareProductList } = productDetails || {};
    if (compareProductList && compareProductList.length > 0) {
      if (compareProductList.length < PRODUCT.MAX_COMPARE_PRODUCT_LIMIT) {
        const productExist = compareProductList.find((item) => item.productId === product.productId);
        if (productExist) {
          openModal("ProductCompare");
          updateCompareProductMessage(productTranslation("productAlreadyExistMessage"));
          return;
        }
      } else {
        updateCompareProductMessage(productTranslation("productLimitMessage"));
        openModal("ProductCompare");
        return;
      }
    }
    const productData = {
      sku: product.sku,
      productId: product.productId,
      name: product.name,
      image: product.image,
      retailPrice: product.retailPrice as number,
      salesPrice: product.salesPrice as number,
    };
    updateCompareProduct(productData);
    updateCompareProductMessage(productTranslation("productAddedMessage"));
    const productList = productDetails.compareProductList ? [...productDetails.compareProductList, productData] : [productData];
    setLocalStorageData("compareProductList", JSON.stringify(productList));
    openModal("ProductCompare");
  };
  return (
    showIcon && (
      <div onClick={addCompareProduct}>
        <CompareIcon height="23px" width="23px" dataTestSelector="CompareProduct"/>
      </div>
    )
  );
}

export default CompareProduct;
