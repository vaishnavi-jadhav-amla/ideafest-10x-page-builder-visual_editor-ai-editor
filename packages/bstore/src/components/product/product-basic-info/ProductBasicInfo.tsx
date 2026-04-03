import { IConfigurableProduct, IFilteredAttributeList, IProductDetails } from "@znode/types/product-details";
import { INVENTORY, PRODUCT, PRODUCT_TYPE } from "@znode/constants/product";

import AddToCart from "@znode/base-components/components/product/product-details/add-to-cart/AddToCart";
import AdditionalProductDetails from "@znode/base-components/components/product/product-details/product-information/AdditionalProductDetails";
import AllLocationInventory from "@znode/base-components/components/product/product-details/inventory/all-location-inventory/AllLocationInventory";
import ConfigurableAttributeComponent from "@znode/base-components/components/product/product-details/product-types/configurable-product-attribute/ConfigurableProductAttribute";
import GlobalProductMessage from "@znode/base-components/components/global-product-message/GlobalProductMessage";
import { Heading } from "@znode/base-components/common/heading";
import { IAttributeDetails } from "@znode/types/attribute";
import { IOfferPrice } from "@znode/types/product";
import Link from "next/link";
import { LoginToSeePricing } from "@znode/base-components/components/common/login-to-see-pricing";
import { Price } from "@znode/base-components/components/product/price/Price";
import { ProductHighlights } from "@znode/base-components/components/product-highlights/ProductHighlights";
import RatingWrapper from "@znode/base-components/common/rating/RatingWrapper";
import TierPricing from "@znode/base-components/components/tier-pricing/TierPricing";
import { getAttributeValue } from "@znode/utils/common";
import { useTranslationMessages } from "@znode/utils/component";
import { useUser } from "@znode/base-components/stores";

const sanitizeAndSetInnerHTML = (attributeList: IAttributeDetails[], key: string) => {
  const attributeValue = getAttributeValue(attributeList, key, "attributeValues") as string;
  const attributeText = attributeValue !== "false" && attributeValue !== "true" ? attributeValue : "";
  return <div dangerouslySetInnerHTML={{ __html: String(attributeText || "") }}></div>;
};

export const ProductBasicInfo = ({
  productData,
  isQuickView = false,
  configurableProducts = [],
  closeQuickViewModal,
}: {
  productData: IProductDetails;
  isQuickView?: boolean;
  configurableProducts?: IConfigurableProduct[];
  closeQuickViewModal?: () => void;
}) => {
  const commonTranslations = useTranslationMessages("Common");
  const brandCode = getAttributeValue(productData?.attributes as [], PRODUCT.BRAND) as string;
  const brandName = getAttributeValue(productData?.attributes as [], PRODUCT.BRAND, undefined, undefined, "value") as string;
  const { user } = useUser();

  if (!productData) {
    return productData;
  }

  const combinationErrorMessage = productData?.configurableData?.combinationErrorMessage;
  const callForPricingMessage = productData?.promotions?.filter((x) => x.promotionType?.toLowerCase() === "Call For Pricing".toLowerCase()).at(0)?.promotionMessage;
  const {
    name,
    sku,
    znodeCategoryIds,
    categoryName,
    retailPrice,
    salesPrice,
    filteredAttribute,
    isConfigurableProduct,
    isLoginToSeePricing,
    configurableproductSku,
    isObsolete,
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
    promotions,
    productUrl,
    isBrandActive,
    currencyCode,
    isCallForPricing,
    globalProductMessage,
    groupProductList,
  } = productData || {};

  productData.configurableProductSKUs = productData?.configurableProductSKU;
  const isTierPriceShow = tierPriceList?.length !== 0;
  const newImageLargePath = productData?.imageLargePath ? productData.imageLargePath.replace(/\\/g, "/") : "";
  productData.imageLargePath = newImageLargePath || "";
  const unitOfMeasurement = getAttributeValue(productData.attributes as IAttributeDetails[], "UOM");
  const outOfStockOption = getAttributeValue(productData.attributes as IAttributeDetails[], PRODUCT.OUT_OF_STOCK_OPTIONS);
  const getRedirectionUrl = () => {
    if (productData && productData?.seoUrl) {
      return `/${productData.seoUrl}`;
    } else {
      return `/product/${productData?.publishProductId}`;
    }
  };

  const { attributeList } = filteredAttribute || ({ attributeList: [] } as IFilteredAttributeList);
  const inStockQtyData = quantity ?? inStockQty;
  const disablePurchasing = outOfStockOption === PRODUCT.DISABLE_PURCHASING;
  let isCallForPricingPromotion = false;
  const promotionCallForPricing = promotions?.filter((x) => x.promotionType?.toLowerCase() === "Call For Pricing".toLowerCase()).at(0)?.promotionType;
  if (promotionCallForPricing) isCallForPricingPromotion = true;
  if (!publishProductId) {
    return null;
  }
  return (
    <div className="mt-4 mb-4 md:flex print-flex-col">
      <div className="relative w-full md:w-2/5" data-test-selector={`divProductImage${publishProductId}`}>
        {/* Product Image removed for checking override PDP */}
      </div>
      <div className="w-full lg:w-3/5 md:ml-10">
        <Heading name={!combinationErrorMessage ? name : parentConfigurableProductName} level="h1" dataTestSelector="hdgProductName" />

        <div className="mb-2 sm:flex">
          <div data-test-selector="divSKU">
            <span className="heading-3 mr-1 pr-[2px]" data-test-selector="spnSKU">
              {commonTranslations("sku")}:
            </span>
            {isConfigurableProduct && getAttributeValue(productData.attributes as [], INVENTORY.DISPLAY_VARIANTS_ON_GRID, "attributeValues") === "false" && !combinationErrorMessage
              ? configurableproductSku
              : sku}
          </div>
          {!isConfigurableProduct && (
            <div className="sm:pl-3 sm:ml-3 sm:border-l-2 sm:border-zinc-700" data-test-selector="divCategory">
              <span className="heading-3" data-test-selector="spnCategory" role="heading" aria-level={3}>
                {commonTranslations("category")}:{" "}
              </span>
              <Link
                href={`/category/${znodeCategoryIds?.at(znodeCategoryIds.length - 1) || 0}`}
                className="text-sm underline text-linkColor hover:text-hoverColor decoration-linkColor hover:decoration-hoverColor"
                data-test-selector="linkCategoryName"
                onClick={closeQuickViewModal}
                aria-label={categoryName}
              >
                {categoryName}
              </Link>
            </div>
          )}
          {brandName && isBrandActive && (
            <div className="sm:pl-3 sm:ml-3 sm:border-l-2 sm:border-zinc-700" data-test-selector="divBrand">
              <span className="heading-3" data-test-selector={`spnBrand${brandName}`}>
                {commonTranslations("brand")}:{" "}
              </span>
              {brandCode ? (
                <Link
                  href={`/brand/${brandCode}`}
                  className="text-sm underline text-linkColor hover:text-hoverColor decoration-linkColor hover:decoration-hoverColor"
                  data-test-selector="linkBrandName"
                  aria-label={brandName}
                >
                  {brandName}
                </Link>
              ) : (
                brandName
              )}
            </div>
          )}
        </div>

        {!combinationErrorMessage && (
          <>
            <div className="mb-3 text-gray-500 text-md" data-test-selector="divProductDescription">
              {attributeList && sanitizeAndSetInnerHTML(productData.attributes as IAttributeDetails[], "ShortDescription")}
            </div>
            {highlightList && <ProductHighlights highlights={highlightList} productId={publishProductId as number} seoUrl={productData.seoUrl} />}
            {globalProductMessage ? <GlobalProductMessage message={globalProductMessage as string} /> : null}
          </>
        )}
        <div className="grid-cols-4 gap-6 mb-2 md:grid">
          <div className="col-span-2 text-lg" data-test-selector="divPrice">
            <LoginToSeePricing isLoginRequired={isLoginToSeePricing || false} isObsolete={isObsolete || false} productUrl={productUrl ?? ""} />
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
            {isConfigurableProduct && getAttributeValue(productData.attributes as [], INVENTORY.DISPLAY_VARIANTS_ON_GRID, "attributeValues") === "false" && (
              <ConfigurableAttributeComponent products={productData} />
            )}

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
            />
          )}
        </div>
        {(productType === PRODUCT_TYPE.SIMPLE_PRODUCT ||
          productType === PRODUCT_TYPE.BUNDLE_PRODUCT ||
          (isConfigurableProduct && getAttributeValue(productData.attributes as [], INVENTORY.DISPLAY_VARIANTS_ON_GRID, "attributeValues") === "false")) && (
          <div className="mb-1">
            <AddToCart
              productDetails={productData}
              showQuantityBox={true}
              configurableErrorMessage={combinationErrorMessage}
              isCallForPricingPromotion={isCallForPricingPromotion}
              isProductCompare={false}
            />
          </div>
        )}

        <div className="w-full">
          <AdditionalProductDetails
            isQuickView={isQuickView}
            filteredAttribute={filteredAttribute}
            errorMessage={combinationErrorMessage as string}
            product={productData}
            configurableProducts={configurableProducts}
          />
        </div>
      </div>
    </div>
  );
};
