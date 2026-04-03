"use client";

import { IChildProductData, IProductDetails } from "@znode/types/product-details";
import React, { ChangeEvent } from "react";
import { sendAnalyticsEvent, useTranslationMessages } from "@znode/utils/component";

import { ANALYTICS_EVENTS } from "@znode/constants/analytics-event";
import AddOn from "../addon/Addon";
import Button from "../../../common/button/Button";
import Input from "../../../common/input/Input";
import { PRODUCT_TYPE } from "@znode/constants/product";
import Personalization from "./personalization/Personalization";
import { ValidationMessage } from "../../../common/validation-message";
import { formatTestSelector } from "@znode/utils/common";
import { useAddToCart } from "./useAddToCart";
import { useProduct } from "../../../../stores";

interface IBtnStyle {
  class?: string;
}
interface ProductDetailsProps {
  productDetails: IProductDetails;
  showQuantityBox?: boolean;
  btnStyle?: IBtnStyle;
  configurableErrorMessage?: string;
  gridAddToCart?: boolean;
  isCallForPricingPromotion?: boolean;
  isProductCard?: boolean;
  isProductCompare?: boolean;
  isAddToCartDisabled?: boolean;
  groupProductData?: IChildProductData[];
  isGroupListValid?: boolean;
  isDownloadable?: boolean;
  isLoginToSeePricing?: boolean;
}

function AddToCart({
  productDetails,
  showQuantityBox,
  btnStyle,
  configurableErrorMessage,
  gridAddToCart = false,
  isCallForPricingPromotion,
  isProductCard = false,
  isProductCompare,
  isAddToCartDisabled,
  groupProductData = [],
  isGroupListValid = true,
  isDownloadable = false,
  isLoginToSeePricing,
}: ProductDetailsProps) {
  const t = useTranslationMessages("Product");
  const {
    isLoading,
    handleInputChange,
    validationMessage,
    addOnError,
    personalizeCodesAndValues,
    setPersonalizeCodesAndValues,
    // productData,
    setAddToCartProduct,
    isAddToCartButton,
    isInputBox,
    qty,
    isAddonShow,
    setIsPersonalizedFormValid,
  } = useAddToCart({ productDetails, configurableErrorMessage, isCallForPricingPromotion, isProductCompare, groupProductData });
  const {
    product: { isAddToCart, isPersonalized, productOutOfStock },
  } = useProduct();
  const productData = (productDetails: IProductDetails) => {
    return {
      id: productDetails.sku,
      name: productDetails.name,
      brand: productDetails.brandName,
      quantity: productDetails.quantity,
      price: productDetails.retailPrice,
      variant: productDetails.configurableProductSKUs,
    };
  };
  const isAddToCartButtonDisabled = () => {
    const isPriceMissing = productDetails.retailPrice === null;
    return (
      isAddToCartButton ||
      isAddToCart ||
      (!isProductCard && isPersonalized) ||
      (isProductCard && isAddToCartDisabled) ||
      (!isProductCard && !isGroupListValid) ||
      isDownloadable ||
      isPriceMissing
    );
  };

  const isInputBoxData =
    showQuantityBox &&
    PRODUCT_TYPE.GROUPED_PRODUCT !== productDetails.productType &&
    PRODUCT_TYPE.GROUPED_PRODUCT !== productDetails.productType &&
    !productDetails.isDisplayVariantsOnGrid;

  return (
    <div className={isProductCard && isInputBoxData ? "flex items-center" : ""}>
      <div className={`flex gap-1 flex-col no-print ${btnStyle && btnStyle?.class ? btnStyle?.class : ""}`}>
        {!isProductCard && (
          <div className={`${isProductCompare ? "order-2" : "order-1"}`}>
            <Personalization
              attributes={productDetails.attributes}
              isProductCompare={isProductCompare || false}
              personalizeCodesAndValues={personalizeCodesAndValues}
              setPersonalizeCodesAndValues={setPersonalizeCodesAndValues}
              setIsPersonalizedFormValid={setIsPersonalizedFormValid}
            />
          </div>
        )}
        <div className={`${isProductCompare ? "order-1" : "order-2"} ${gridAddToCart ? "flex" : "flex items-center sm:mt-2"}`}>
          {isInputBoxData && (
            <Input
              defaultValue={productDetails.minimumQuantity || qty || ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, productDetails)}
              className={`px-3 input xs:w-20 ${isInputBox ? "bg-zinc-50 " : ""}`}
              dataTestSelector="txtProductQuantity"
              disabled={isInputBox}
              ariaLabel="product quantity"
            />
          )}
          <Button
            onClick={() => {
              setAddToCartProduct(productDetails);
              sendAnalyticsEvent({
                event: ANALYTICS_EVENTS.ADD_TO_CART_ITEM,
                ecommerce: {
                  currencyCode: productDetails.currencyCode,
                  add: {
                    products: [productData(productDetails)],
                  },
                },
              });
            }}
            type="primary"
            disabled={isAddToCartButtonDisabled() || validationMessage.length > 0}
            className={`xs:px-6 py-[7px] ${gridAddToCart || isProductCompare ? "" : `${!isInputBoxData ? "xs:ml-0" : "xs:ml-4"}`}  ${
              btnStyle && btnStyle?.class ? btnStyle?.class : ""
            }`}
            dataTestSelector={`btnAddToCart${productDetails.publishProductId}`}
            loading={isLoading}
            showLoadingText={true}
            loaderColor="currentColor"
            loaderWidth="20px"
            loaderHeight="20px"
            ariaLabel="Add to Cart"
          >
            {t("addToCart")}
          </Button>
        </div>
      </div>

      {validationMessage ? (
        <ValidationMessage message={validationMessage} dataTestSelector={`validationMessage${productDetails.publishProductId}`} />
      ) : productOutOfStock?.productId === productDetails.publishProductId ? (
        <div
          className={`text-errorColor heading-4 py-0 ${isInputBoxData ? "" : "text-center"}`}
          data-test-selector={formatTestSelector("div", `ProductOutOfStockMessage${productDetails.publishProductId}`)}
        >
          {productOutOfStock?.message}
        </div>
      ) : (
        ""
      )}
      {isAddonShow && !isProductCard && !configurableErrorMessage && (
        <AddOn addOnData={productDetails?.addOns || []} addOnError={addOnError} currencyCode={productDetails.currencyCode as string} isLoginToSeePricing={isLoginToSeePricing} />
      )}
    </div>
  );
}

export default AddToCart;
