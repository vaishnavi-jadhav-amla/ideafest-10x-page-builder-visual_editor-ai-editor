"use client";

import { IProductInventoryProps } from "@znode/types/product-details";
import ProductDetailsInventory from "../product-details-inventory/ProductDetailsInventory";
import { useUser } from "../../../../../stores/user-store";

const ProductInventory = ({
  loginRequired,
  retailPrice,
  isObsolete,
  disablePurchasing,
  allowBackOrdering,
  inStockQty,
  stockNotification,
  sku,
  productUrl,
  productType,
  productInventoryMessage,
  publishProductId,
}: IProductInventoryProps) => {
  const { user } = useUser();

  const shouldShowInventory = !loginRequired || user;

  if (shouldShowInventory) {
    return (
      <ProductDetailsInventory
        isShow={true}
        inStockQuantity={inStockQty || 0}
        allowBackOrdering={allowBackOrdering as boolean}
        disablePurchasing={disablePurchasing as boolean}
        retailPrice={retailPrice as number}
        isObsolete={JSON.parse(String(isObsolete)) || false}
        stockNotification={stockNotification || false}
        sku={sku || ""}
        productUrl={productUrl}
        productType={productType}
        productInventoryMessage={productInventoryMessage}
        productId={0}
        publishProductId={publishProductId}
      />
    );
  }
};
export default ProductInventory;
