/* eslint-disable max-lines-per-function */
"use client";

import { INVENTORY, PRODUCT, PRODUCT_TYPE } from "@znode/constants/product";
import { useModal, useProduct } from "../../../../../stores";

import Button from "../../../../common/button/Button";
import { IProductInventoryInformation } from "@znode/types/product-details";
import { InventoryDetails } from "../inventory-detail/InventoryDetail";
import Link from "next/link";
import { Modal } from "../../../../common/modal/Modal";
import { StockNotification } from "../../stock-notification/StockNotification";
import { useTranslations } from "next-intl";

const ProductDetailsInventory = ({
  productName,
  inStockQuantity,
  allowBackOrdering,
  disablePurchasing,
  retailPrice,
  customClass,
  isObsolete,
  productType,
  bundleProductsData,
  productInventoryMessage,
  stockNotification,
  sku,
  childProductSku,
  isShow,
  productId,
  publishProductId,
  productUrl,
}: IProductInventoryInformation) => {
  const productTranslations = useTranslations("Product");
  const {
    setProductId,
    setIsViewReplacementProductTriggered,
    product: { productOutOfStock },
  } = useProduct();
  const inventoryParameters = ["isObsolete", "allowBackOrdering", "disablePurchasing"];

  const { openModal, closeModal } = useModal();


  const handleStockNotification = () => {
    openModal("StockNotification");
  };

  const handleInventoryModel = (productId: number) => {
    openModal(`BundledInventoryDetails${productId}`);
  };

   const inStockMessage = productInventoryMessage?.inStockMessage || productTranslations("textInStock");
   const outOfStockMessage = productInventoryMessage?.outOfStockMessage || productTranslations("textOutOfStock");
   const backOrderMessage = productInventoryMessage?.backOrderMessage || productTranslations("textBackOrderMessage");


  const modalClose = () => {
    closeModal();
    setIsViewReplacementProductTriggered(true);
  };
  const getMessage = (className: string, message: string | JSX.Element, inStockQuantity?: string | number, dataTestSelector?: string, renderMessage?: string, index?: number) => {
    return (
      <div className={`heading-4 py-0 ${className} ${customClass || ""}`} data-test-selector={dataTestSelector} key={`${index}-${message}`}>
        {message} {inStockQuantity && `(${inStockQuantity})`}{" "}
        {renderMessage === INVENTORY.IN_STOCK_MESSAGE_WITH_QTY && !isShow ? (
          <div
            className="text-gray-500 cursor-pointer text-underline"
            onClick={() => {
              setProductId(productId as number);
              handleInventoryModel(productId);
            }}
            data-test-selector={`divAllLocations${productId}`}
          >
            ({productTranslations("allLocations")})
          </div>
        ) : null}
      </div>
    );
  };

  const renderStockMessage = (renderMessage: string, index: number) => {
    const isRetailProduct = retailPrice !== null && productType !== PRODUCT_TYPE.GROUPED_PRODUCT;
    const isInStock = renderMessage === INVENTORY.IN_STOCK_MESSAGE;
    const isInStockWithQty = renderMessage === INVENTORY.IN_STOCK_MESSAGE_WITH_QTY;
    const isBackOrder = renderMessage === INVENTORY.BACK_ORDER_MESSAGE;
    const isOutOfStock = renderMessage === INVENTORY.STOCK_NOTIFICATION_MESSAGE;
    const isObsolete = renderMessage === PRODUCT.IS_OBSOLETE_MESSAGE;
    const isPriceNotSet = renderMessage === PRODUCT.PRICE_NOT_SET;

    if (isObsolete) {
      return getMessage(
        "text-errorColor",
        <>
          {productTranslations("isObsoleteMessage")}{" "}
          <Link href={productUrl || "#"} id={`replacementProduct-${productId}`} onClick={modalClose} className="text-linkColor hover:text-hoverColor text-sm underline">
            {productTranslations("obsoleteMsgLink")}
          </Link>{" "}
          {productTranslations("obsoleteMsgProduct")}
        </>,
        "",
        "divIsObsolete",
        renderMessage,
        index
      );
    }

    if (isRetailProduct) {
      if (isBackOrder) {
       return getMessage("text-green-600", backOrderMessage, "", "divTextBackOrder", renderMessage, index);
      }
      if (isInStock) {
         return getMessage("text-green-600", inStockMessage, "", "divInStock", renderMessage, index);
      }
      if (isInStockWithQty) {
        return getMessage("text-green-600", inStockMessage, inStockQuantity, "divInStock", renderMessage, index);
      }
      if (isOutOfStock) {
        return (
          <>
            {getMessage("text-errorColor", outOfStockMessage, "", "valOutOfStock", renderMessage, index)}
            {stockNotification && (
              <Button type="link" size="small" ariaLabel="stock notification button" dataTestSelector="StockNotificationBtnTest" onClick={handleStockNotification}>
                {productTranslations("stockNotification")}
              </Button>
            )}
          </>
        );
      }
    }
    if (isPriceNotSet && productType !== PRODUCT_TYPE.GROUPED_PRODUCT) {
      return getMessage("text-errorColor", productTranslations("priceNotSet"), "", "divPriceNotSet", renderMessage, index);
    }

    return null;
  };

  const validatedMessage = (inventoryParams: string, index: number): JSX.Element | null => {
    const shouldShowPriceNotSet = !bundleProductsData && retailPrice == null;
    const canShowInStockWithQty = inStockQuantity > 0 && ((retailPrice && retailPrice > 0) || productType === PRODUCT_TYPE.BUNDLE_PRODUCT);
    const canShowStockNotification = inStockQuantity <= 0 && ((retailPrice && retailPrice > 0) || productType === PRODUCT_TYPE.BUNDLE_PRODUCT);

    switch (inventoryParams) {
      case "isObsolete":
        return isObsolete ? renderStockMessage(PRODUCT.IS_OBSOLETE_MESSAGE, index) : null;

      case "disablePurchasing":
        if (isObsolete) return null;
        if (retailPrice === null) return renderStockMessage(PRODUCT.PRICE_NOT_SET, index);

        if (disablePurchasing) {
          if (canShowInStockWithQty) return renderStockMessage(INVENTORY.IN_STOCK_MESSAGE_WITH_QTY, index);
          if (canShowStockNotification) return renderStockMessage(INVENTORY.STOCK_NOTIFICATION_MESSAGE, index);
          if (shouldShowPriceNotSet) return renderStockMessage(PRODUCT.PRICE_NOT_SET, index);
          return null;
        }
        return allowBackOrdering ? null : renderStockMessage(INVENTORY.IN_STOCK_MESSAGE, index);

      case "allowBackOrdering":
        if (isObsolete || inStockQuantity < 0 || !allowBackOrdering) return null;
        return inStockQuantity > 0 ? renderStockMessage(INVENTORY.IN_STOCK_MESSAGE, index) : renderStockMessage(INVENTORY.BACK_ORDER_MESSAGE, index);

      default:
        return null;
    }
  };

  const getInventoryMessage = () =>
    productOutOfStock?.productId === publishProductId ? "" : inventoryParameters && inventoryParameters?.map((data: string, index: number) => validatedMessage(data, index));

  return (
    <>
      {getInventoryMessage()}
      {inStockQuantity <= 0 && ((retailPrice && retailPrice > 0) || productType === PRODUCT_TYPE.BUNDLE_PRODUCT) && disablePurchasing && (
        <Modal size="xl" modalId="StockNotification" maxHeight="lg" customClass="overflow-y-auto">
          <StockNotification sku={sku} childProductSku={childProductSku as string} />
        </Modal>
      )}
      {
        <Modal size="xl" modalId={`BundledInventoryDetails${productId}`}>
          {inStockQuantity && !isObsolete && <InventoryDetails productId={productId} productName={productName ?? ""} productSku={sku} />}
        </Modal>
      }
    </>
  );
};

export default ProductDetailsInventory;
