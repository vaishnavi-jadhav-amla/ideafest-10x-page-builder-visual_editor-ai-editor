"use client";

import { IConfigurableProduct, IFilteredAttributeList, IProductDetails } from "@znode/types/product-details";
import { INVENTORY, PRODUCT, PRODUCT_TYPE } from "@znode/constants/product";
import { getLocalStorageData, useTranslationMessages } from "@znode/utils/component";
import { useUser, useWishListStore } from "../../../../stores";

import AddToCart from "../add-to-cart/AddToCart";
import AdditionalProductDetails from "./AdditionalProductDetails";
import AllLocationInventory from "../inventory/all-location-inventory/AllLocationInventory";
import ConfigurableAttributeComponent from "../product-types/configurable-product-attribute/ConfigurableProductAttribute";
import GlobalProductMessage from "../../../global-product-message/GlobalProductMessage";
import { Heading } from "../../../common/heading";
import { IAttributeDetails } from "@znode/types/attribute";
import { IOfferPrice } from "@znode/types/product";
import Link from "next/link";
import { LoginToSeePricing } from "../../../common/login-to-see-pricing";
import { Price } from "../../price/Price";
import { ProductHighlights } from "../../../product-highlights/ProductHighlights";
import ProductImage from "../../product-image/ProductImage";
import RatingWrapper from "../../../common/rating/RatingWrapper";
import TierPricing from "../../../tier-pricing/TierPricing";
import WishListButton from "../../../wishlist/WishlistButton";
import { getAttributeValue } from "@znode/utils/common";
import { shallow } from "zustand/shallow";
import { useEffect } from "react";
import { useStoreWithEqualityFn } from "zustand/traditional";

const sanitizeAndSetInnerHTML = (attributeList: IAttributeDetails[], key: string) => {
  const attributeValue = getAttributeValue(attributeList, key, "attributeValues") as string;
  const attributeText = attributeValue !== "false" && attributeValue !== "true" ? attributeValue : "";
  return <div dangerouslySetInnerHTML={{ __html: String(attributeText || "") }}></div>;
};

const ProductBasicInfo = ({
  productData,
  isQuickView = false,
  configurableProducts = [],
  closeQuickViewModal,
  breadCrumbsTitle,
}: {
  productData: IProductDetails;
  isQuickView?: boolean;
  breadCrumbsTitle?: string;
  configurableProducts?: IConfigurableProduct[];
  closeQuickViewModal?: () => void;
}) => {
  const commonTranslations = useTranslationMessages("Common");
  const brandCode = getAttributeValue(productData?.attributes as [], PRODUCT.BRAND) as string;
  const brandName = getAttributeValue(productData?.attributes as [], PRODUCT.BRAND, undefined, undefined, "value") as string;
  const { user } = useUser();

  const { isSkuInWishList, fetchWishList } = useStoreWithEqualityFn(
    useWishListStore,
    (state) => ({
      isSkuInWishList: state.isSkuInWishList,
      fetchWishList: state.fetchWishList,
    }),
    shallow
  );

  const existsInWishlist = productData?.sku ? isSkuInWishList(productData.sku) : false;

  useEffect(() => {
    user?.userName && productData && productData.sku && !existsInWishlist && fetchWishList([{ sku: productData.sku }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productData]);

  if (!productData) {
    return productData;
  }

  const combinationErrorMessage = productData?.configurableData?.combinationErrorMessage;
  const callForPricingMessage = productData?.promotions?.filter((x) => x.promotionType?.toLowerCase() === "Call For Pricing".toLowerCase()).at(0)?.promotionMessage;
  //TO DO : IsBrandActive
  const {
    name,
    alternateImages,
    sEOTitle,
    sku,
    retailPrice,
    salesPrice,
    filteredAttribute,
    isConfigurableProduct,
    isLoginToSeePricing,
    configurableproductSku,
    isObsolete,
    // brandName,
    rating,
    highlightList,
    publishProductId,
    totalReviews,
    tierPriceList,
    isLoginRequired,
    parentConfigurableProductName,
    displayAllWarehousesStock,
    defaultInventoryCount,
    defaultWarehouseName,
    quantity,
    inStockQty,
    productType,
    productUrl,
    // brandId,
    isBrandActive,
    imageLargePath,
    currencyCode,
    isCallForPricing,
    globalProductMessage,
    videoList,
    groupProductList,
    isDisplayVariantsOnGrid,
    isDownloadable,
    isCallForPricingPromotion,
  } = productData || {};
  const clonedProductData = JSON.parse(JSON.stringify(productData));
  clonedProductData.configurableProductSKUs = productData?.configurableProductSKU;
  const isTierPriceShow = tierPriceList?.length !== 0;
  const newImageLargePath = productData?.imageLargePath ? productData.imageLargePath.replace(/\\/g, "/") : "";
  clonedProductData.imageLargePath = newImageLargePath || "";
  const unitOfMeasurement = getAttributeValue(productData.attributes as IAttributeDetails[], "UOM");
  const outOfStockOption = getAttributeValue(productData.attributes as IAttributeDetails[], PRODUCT.OUT_OF_STOCK_OPTIONS);
  const getRedirectionUrl = () => {
    if (productData && productData?.seoUrl) {
      return `/${productData.seoUrl}`;
    } else {
      return `/product/${Number(productData.configurableProductId) > 0 ? productData.configurableProductId : productData?.publishProductId}`;
    }
  };
  const createBreadCrumbsDetails = () => {
    try {
      return JSON.parse(getLocalStorageData("breadCrumbsDetails"));
    } catch (error) {
      return { breadCrumbsTitle: "", isCategoryFlow: false };
    }
  };

  const { attributeList } = filteredAttribute || ({ attributeList: [] } as IFilteredAttributeList);
  const inStockQtyData = quantity ?? inStockQty;
  const disablePurchasing = outOfStockOption === PRODUCT.DISABLE_PURCHASING;
  if (!publishProductId) {
    return null;
  }
  const categoryNameDetails = (str: string): { href: string; text: string } => {
    const matches = [...str.matchAll(/<a[^>]*href=['"]([^'"]+)['"][^>]*>([^<]+)<\/a>/g)];

    if (matches.length > 0) {
      const lastMatch = matches[matches.length - 1];
      const href = lastMatch[1];
      const text = lastMatch[2];
      return { href, text };
    }
    return { href: "", text: "" };
  };
  const breadCrumbsDetails = createBreadCrumbsDetails();
  const categoryInformation =
    breadCrumbsDetails.breadCrumbsTitle.length > 0 ? categoryNameDetails(breadCrumbsDetails.breadCrumbsTitle) : categoryNameDetails((breadCrumbsTitle as string) || "");

  const quickViewCategoryInfo = categoryNameDetails(productData?.breadCrumbTitle || "");

  return (
    <div className="mt-4 mb-4 md:flex print-flex-col">
      <div className="relative w-full md:w-2/5" data-test-selector={`divProductImage${publishProductId}`}>
        <div className="absolute top-0 right-0 z-20 print:hidden">
          <WishListButton znodeProductId={publishProductId} sku={sku} fromQuickView={isQuickView} />
        </div>
        <ProductImage
          imageLargePath={imageLargePath as string}
          seoTitle={sEOTitle ?? ""}
          alternateImages={isQuickView ? [] : (alternateImages as [])}
          videos={isQuickView ? [] : videoList}
        />
        {/* TODO */}
        {/* <WishListButton znodeProductId={publishProductId} sku={sku} active={wishListId > 0} /> */}
      </div>
      <div className="w-full lg:w-3/5 md:ml-10">
        <Heading name={!combinationErrorMessage ? name : parentConfigurableProductName} level="h1" dataTestSelector="hdgProductName" />

        <div className="mb-2 sm:flex">
          <div data-test-selector="divSKU" className="flex items-center">
            <Heading name={`${commonTranslations("sku")}:`} dataTestSelector="spnSKU" level="h3" customClass="mr-1 pr-[2px] w-max p-0" />
            {isConfigurableProduct && getAttributeValue(productData.attributes as [], INVENTORY.DISPLAY_VARIANTS_ON_GRID, "attributeValues") === "false" && !combinationErrorMessage
              ? configurableproductSku
              : sku}
          </div>
          {!isConfigurableProduct && (isQuickView ? quickViewCategoryInfo?.href && quickViewCategoryInfo?.text : categoryInformation?.href && categoryInformation?.text) && (
            <div className="sm:pl-3 sm:ml-3 sm:border-l-2 sm:border-zinc-700 flex items-center" data-test-selector="divCategory">
              <Heading name={`${commonTranslations("category")}:`} dataTestSelector="spnCategory" level="h3" customClass="mr-1 pr-[2px] w-max p-0" />
              <Link
                href={isQuickView ? quickViewCategoryInfo.href : categoryInformation.href}
                className="text-sm underline text-linkColor hover:text-hoverColor decoration-linkColor hover:decoration-hoverColor"
                data-test-selector="linkCategoryName"
                onClick={closeQuickViewModal}
                aria-label={isQuickView ? quickViewCategoryInfo.text : categoryInformation.text}
              >
                {isQuickView ? quickViewCategoryInfo.text : categoryInformation.text}
              </Link>
            </div>
          )}
          {brandName && isBrandActive && (
            <div className="sm:pl-3 sm:ml-3 sm:border-l-2 sm:border-zinc-700 flex items-center" data-test-selector="divBrand">
              <Heading name={`${commonTranslations("brand")}:`} dataTestSelector={`spnBrand${brandName}`} level="h3" customClass="mr-1 pr-[2px] w-max p-0" />
              {brandCode ? (
                <Link
                  href={`/brand/${brandCode}`}
                  className="text-sm underline text-linkColor hover:text-hoverColor decoration-linkColor hover:decoration-hoverColor"
                  data-test-selector="linkBrandName"
                  onClick={closeQuickViewModal}
                  dangerouslySetInnerHTML={{ __html: brandName }}
                  aria-label={brandName}
                />
              ) : (
                brandName
              )}
            </div>
          )}
        </div>

        {!combinationErrorMessage && (
          <>
            <div className="mb-3 text-gray-500 text-md ignore-tailwind " data-test-selector="divProductDescription">
              {attributeList && sanitizeAndSetInnerHTML(productData.attributes as IAttributeDetails[], "ShortDescription")}
            </div>
            {highlightList && (
              <ProductHighlights
                highlights={highlightList}
                productId={productData.isConfigurable && !productData.isDisplayVariantsOnGrid ? Number(productData.configurableProductId) : publishProductId}
                seoUrl={productData.seoUrl}
                isQuickView
              />
            )}
            {globalProductMessage ? <GlobalProductMessage message={globalProductMessage as string} /> : null}
          </>
        )}
        <div className="lg:grid-cols-4 lg:gap-6 md:grid">
          <div className="col-span-2 text-lg" data-test-selector="divPrice">
            <LoginToSeePricing
              isLoginRequired={isLoginToSeePricing || false}
              isObsolete={isObsolete || false}
              productUrl={productUrl ?? ""}
              closeQuickViewModal={closeQuickViewModal}
            />
            {!combinationErrorMessage && (user?.userName || !isLoginToSeePricing || false) && (
              <Price
                retailPrice={retailPrice as number}
                currencyCode={currencyCode}
                salesPrice={salesPrice}
                loginRequired={Boolean(isLoginRequired || false)}
                isCallForPricing={isCallForPricing}
                callForPricingMessage={callForPricingMessage}
                productList={groupProductList || configurableProducts}
                isObsolete={isObsolete}
                unitOfMeasurement={unitOfMeasurement as string}
                id={publishProductId}
              />
            )}
            {!combinationErrorMessage && (
              <div className="flex items-center py-0 heading-4">
                <RatingWrapper
                  ratingCount={rating || 0}
                  totalReviews={totalReviews || 0}
                  showReview={true}
                  productUrl={isQuickView ? getRedirectionUrl() : "#"}
                  id={publishProductId}
                  productSku={sku}
                />
              </div>
            )}
          </div>
        </div>

        <div className="gap-2 lg:gap-6 mb-2 lg:grid-cols-4 md:grid">
          <div className="col-span-2" data-test-selector="divPrice">
            {!combinationErrorMessage && isTierPriceShow && (user?.userName || !isLoginToSeePricing || false) && (
              <TierPricing offerPricing={(tierPriceList as IOfferPrice[]) || []} productPrice={salesPrice || retailPrice || 0} loginRequired={isLoginRequired} />
            )}
          </div>
          {!combinationErrorMessage && displayAllWarehousesStock && productType === PRODUCT_TYPE.SIMPLE_PRODUCT && (
            <AllLocationInventory
              loginRequired={isLoginRequired}
              inStockQuantity={inStockQtyData}
              disablePurchasing={disablePurchasing}
              defaultInventoryCount={defaultInventoryCount}
              defaultWarehouseName={defaultWarehouseName}
              productId={publishProductId}
              productSku={sku}
              productName={name}
              displayAllWarehousesStock={String(displayAllWarehousesStock)}
            />
          )}
        </div>
        {isConfigurableProduct && !isDisplayVariantsOnGrid && (
          <div className="mt-2 lg:grid-cols-4 md:grid">
            <div className="col-span-4" data-test-selector="divPrice">
              {isConfigurableProduct && !isDisplayVariantsOnGrid && <ConfigurableAttributeComponent products={clonedProductData} isQuickView={isQuickView} />}
            </div>
          </div>
        )}
        {(productType === PRODUCT_TYPE.SIMPLE_PRODUCT ||
          productType === PRODUCT_TYPE.BUNDLE_PRODUCT ||
          (isConfigurableProduct && getAttributeValue(productData.attributes as [], INVENTORY.DISPLAY_VARIANTS_ON_GRID, "attributeValues") === "false")) && (
          <div className="mb-1">
            <AddToCart
              productDetails={clonedProductData}
              showQuantityBox={true}
              configurableErrorMessage={combinationErrorMessage}
              isCallForPricingPromotion={isCallForPricingPromotion}
              isProductCompare={false}
              {...(productType === PRODUCT_TYPE.SIMPLE_PRODUCT && { isDownloadable })}
              isLoginToSeePricing={isLoginToSeePricing}
            />
          </div>
        )}

        <div className="w-full">
          <AdditionalProductDetails
            isQuickView={isQuickView}
            filteredAttribute={filteredAttribute}
            errorMessage={combinationErrorMessage as string}
            product={clonedProductData}
            configurableProducts={configurableProducts}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductBasicInfo;
