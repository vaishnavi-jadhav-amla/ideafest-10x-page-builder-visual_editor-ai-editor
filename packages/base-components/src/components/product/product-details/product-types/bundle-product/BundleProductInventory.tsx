"use client";

import { IProductInventoryDetails } from "@znode/types/product";
import ProductDetailsInventory from "../../inventory/product-details-inventory/ProductDetailsInventory";
import { useTranslations } from "next-intl";
import { useUser } from "../../../../../stores/user-store";

export const BundleProductInventory = ({ loginRequired, productType, bundleProduct, bundleProductsData, stockNotification, childSku, productUrl, productInventoryMessage }: IProductInventoryDetails) => {
  const productTranslations = useTranslations("Product");
  const { user } = useUser();

  return (
    (!loginRequired || user) && (
      <div className="flex gap-4 md:gap-5">
        <p className="w-1/3 py-0 heading-4 lg:w-16" data-test-selector={`paraProductInventoryLabel${bundleProduct.publishProductId}`}>
          {productTranslations("labelInventory")}:
        </p>
        <div>
          <p className="pb-1 text-sm" data-test-selector={`paraWarehouseName${bundleProduct.publishProductId}`}>
            {bundleProduct.warehouseName}
          </p>
          <ProductDetailsInventory
            productName={bundleProduct?.name ?? ""}
            productId={bundleProduct?.publishProductId ?? 0}
            inStockQuantity={bundleProduct.inStockQty ?? 0}
            allowBackOrdering={bundleProduct.allowBackOrdering}
            disablePurchasing={bundleProduct.disablePurchasing}
            customClass="text-xs"
            isObsolete={bundleProduct?.isObsolete || false}
            productType={productType}
            bundleProductsData={bundleProductsData}
            stockNotification={stockNotification}
            sku={bundleProduct.parentSku ?? ""}
            childProductSku={childSku}
            productUrl={productUrl}
            retailPrice={bundleProduct.retailPrice}
            productInventoryMessage={productInventoryMessage}
          />
        </div>
      </div>
    )
  );
};
