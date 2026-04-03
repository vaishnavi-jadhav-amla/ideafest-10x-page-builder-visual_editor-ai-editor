import dynamic from "next/dynamic";
import { IBundleProductDetails, IConfigurableProduct, IFilteredAttributeList, IProductDetails, IProductInventoryMessage } from "@znode/types/product-details";
import { PRODUCT, PRODUCT_TYPE } from "@znode/constants/product";

import { BundleInventory } from "../inventory/bundle-product-inventory/BundleInventory";
import { IAttributesDetails } from "@znode/types/product";
import { LoadingSpinnerComponent } from "../../../common/icons";
import ProductInventory from "../inventory/product-inventory/ProductInventory";
import TypicalLeadTiming from "../../../typical-lead-timing/TypicalLeadTiming";
import { getAttributeValue } from "@znode/utils/common";
//nx-ignore-next-line
const ConfigurableProductGrid = dynamic(() => import("../product-types/GridView/ConfigurableProductGrid").then((mod) => mod.default), { ssr: false });
//nx-ignore-next-line
const GroupProduct = dynamic(() => import("../product-types/group-product/GroupProduct").then((mod) => mod.default), { ssr: false });
//nx-ignore-next-line
const BundleProduct = dynamic(() => import("../product-types/bundle-product/BundleProduct").then((mod) => mod.BundleProduct), { ssr: false });
//nx-ignore-next-line
const ActionPanel = dynamic(() => import("../../../action-panel/ActionPanel").then((mod) => mod.default), { ssr: false });


interface ISearchParams {
  filteredAttribute: IFilteredAttributeList | undefined;
  errorMessage: string;
  product: IProductDetails;
  isQuickView: boolean;
  configurableProducts: IConfigurableProduct[];
}

const isDisplayVariantsOnGrid = (attributes: IAttributesDetails[]) => {
  const displayVariantsOnGrid = getAttributeValue(attributes, "DisplayVariantsOnGrid", "attributeValues");
  return displayVariantsOnGrid ?? "false";
};

const AdditionalProductDetails = ({ product, errorMessage, isQuickView, configurableProducts }: ISearchParams) => {
  if (!product) {
    return <LoadingSpinnerComponent />;
  }

  const {
    name,
    categoryId,
    categoryName,
    sku,
    retailPrice,
    attributes,
    publishBundleProducts,
    isConfigurableProduct,
    productType,
    allowBackOrdering,
    disablePurchasing,
    isObsolete,
    typicalLeadTime,
    quantity,
    stockNotification,
    configurableData,
    inStockMessage,
    outOfStockMessage,
    backOrderMessage,
    isLoginRequired,
    groupProductList,
    filteredAttribute,
    seoUrl,
    znodeProductId,
    publishProductId,
  }: IProductDetails = product;

  const productInventoryMessage: IProductInventoryMessage = { inStockMessage: inStockMessage as string, outOfStockMessage, backOrderMessage: backOrderMessage as string };
  const outOfStockOption = getAttributeValue(attributes as IAttributesDetails[], PRODUCT.OUT_OF_STOCK_OPTIONS, "selectValues");
  const inStockQty = quantity;
  const isDisablePurchasing = outOfStockOption === "DisablePurchasing";
  const isAllowBackOrdering = outOfStockOption === "AllowBackOrdering";

  const combinationErrorMessage = configurableData?.combinationErrorMessage || errorMessage;

  const childBundleItems = product?.publishBundleProducts;
  const productId = znodeProductId ? Number(znodeProductId) : publishProductId ? Number(publishProductId) : 0;
  const productUrl = seoUrl ? "/" + seoUrl : `/product/${productId}`;

  return (
    product && (
      <>
            {!combinationErrorMessage && productType !== PRODUCT_TYPE.BUNDLE_PRODUCT && isDisplayVariantsOnGrid(attributes || []) === "false" && (
            <ProductInventory
              inStockQty={inStockQty}
              loginRequired={isLoginRequired}
              allowBackOrdering={isAllowBackOrdering}
              disablePurchasing={isDisablePurchasing}
              retailPrice={retailPrice}
              isObsolete={isObsolete}
              stockNotification={stockNotification}
              sku={sku}
              productUrl={productUrl}
              productType={productType}
              productInventoryMessage={productInventoryMessage}
              publishProductId={product.publishProductId}
            />
          )}
        {isObsolete && productType === PRODUCT_TYPE.BUNDLE_PRODUCT && (
          <ProductInventory
            inStockQty={inStockQty}
            loginRequired={isLoginRequired}
            allowBackOrdering={allowBackOrdering || isAllowBackOrdering}
            disablePurchasing={disablePurchasing || isDisablePurchasing}
            retailPrice={retailPrice}
            isObsolete={isObsolete}
            stockNotification={stockNotification}
            sku={sku}
            productUrl={productUrl}
            productType={productType}
          />
        )}
        {productType === "BundleProduct" && !isObsolete && (
          <BundleInventory childBundleItems={childBundleItems} retailPrice={retailPrice} publishProductId={product.publishProductId} productInventoryMessage={productInventoryMessage}/>
        )}
        {!isObsolete && typicalLeadTime && typicalLeadTime > 0 && (
          <div className="flex gap-2 mt-1">
            <TypicalLeadTiming typicalLeadTime={typicalLeadTime} productType={productType || ""} />
          </div>
        )}
        {publishBundleProducts && productType === PRODUCT_TYPE.BUNDLE_PRODUCT && (
          <BundleProduct
            bundleProducts={publishBundleProducts as IBundleProductDetails[]}
            productType={productType}
            isParentObsolete={isObsolete || false}
            loginRequired={isLoginRequired || false}
            stockNotification={stockNotification || false}
            productUrl={productUrl}
            productInventoryMessage={productInventoryMessage}
          />
        )}
        {groupProductList && (
          <GroupProduct
            groupProductDetails={groupProductList}
            product={product}
            loginRequired={isLoginRequired}
            stockNotification={stockNotification}
            filteredAttribute={filteredAttribute}
            attributes={product.attributes}
            productInventoryMessage={productInventoryMessage}
          />
        )}
        {isConfigurableProduct && isDisplayVariantsOnGrid(attributes || []) === "true" && (
          <ConfigurableProductGrid configurableProductDetails={configurableProducts} product={product} loginRequired={isLoginRequired} />
        )}
        {!isQuickView && (
          <div className="mt-4 text-sm">
            <ActionPanel categoryName={categoryName || ""} productName={name || ""} categoryId={categoryId ?? 0} />
          </div>
        )}
      </>
    )
  );
};
export default AdditionalProductDetails;
