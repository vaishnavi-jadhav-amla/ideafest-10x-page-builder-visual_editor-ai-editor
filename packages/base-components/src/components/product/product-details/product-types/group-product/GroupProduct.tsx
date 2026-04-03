"use client";

import { IAttributeDetails, IBaseAttribute } from "@znode/types/attribute";
import { IChildProductData, IFilteredAttributeList, IGroupProductsDetails, IProductDetails, IProductInventoryMessage } from "@znode/types/product-details";
import { INVENTORY, PRODUCT } from "@znode/constants/product";
import React, { ChangeEvent, useEffect, useState } from "react";

import AddToCart from "../../add-to-cart/AddToCart";
import GroupChildProductInput from "./GroupChildProductInput";
import { InventoryDetails } from "../../inventory/inventory-detail/InventoryDetail";
import { Modal } from "../../../../common/modal/Modal";
import { Price } from "../../../price/Price";
import ProductDetailsInventory from "../../inventory/product-details-inventory/ProductDetailsInventory";
import TypicalLeadTiming from "../../../../typical-lead-timing/TypicalLeadTiming";
import { stringToBooleanV2 } from "@znode/utils/common";
import { useProduct } from "../../../../../stores/product";
import { useTranslations } from "next-intl";
import { useUser } from "../../../../../stores/user-store";
import { CustomImage } from "../../../../common/image";


interface IGroupProduct {
  groupProductDetails: IGroupProductsDetails[];
  product: IProductDetails;
  loginRequired: boolean | undefined;
  stockNotification?: boolean;
  setInputField?: (_state: boolean) => void;
  filteredAttribute?: IFilteredAttributeList | undefined;
  attributes?: IBaseAttribute[];
  productInventoryMessage?: IProductInventoryMessage;
}

const GroupProduct: React.FC<IGroupProduct> = ({ groupProductDetails, product, loginRequired, stockNotification, productInventoryMessage }) => {
  const t = useTranslations("Common");
  const { setSelectedAddons } = useProduct();

  const { user } = useUser();
  const [groupProductData, setGroupProductData] = useState<IChildProductData[]>([]);
  const isParentObsolete = String(product.isObsolete) === "true";
  const parentSku = product?.sku;
  const [emptyInput, setEmptyInput] = useState(false);
  const [isGroupProductValidList, setIsGroupProductValidList] = useState(true);

  useEffect(() => {
    return () => {
      setEmptyInput(false);
      setSelectedAddons([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setInputField = (state: boolean) => {
    setEmptyInput(state);
  };

  const getProductData = (event: ChangeEvent<HTMLInputElement>, productSku: string | undefined, validationMessage: string, productId: number, inStockQty: number) => {
    const productQuantity = Number(event.target.value);

    // if (productQuantity <= 0) return; // If the quantity is less than or equal to 0, no need to proceed

    const productData: IChildProductData = {
      sku: String(productSku),
      productId: productId,
      quantity: productQuantity,
      inStockQty: inStockQty,
      isValid: validationMessage === "" ? true : false,
    };

    setGroupProductData((prevGroupProductData) => {
      // If groupProductData already contains the productSku, update the quantity, else add new product
      const updatedGroupProductData = prevGroupProductData.some((item) => item.sku === productSku)
        ? prevGroupProductData.map((item) => (item.sku === productSku ? productData : item))
        : [...prevGroupProductData, productData]; // Add new product if not found

      return updatedGroupProductData;
    });
  };

  const renderGroupAttributes = (groupProduct: IGroupProductsDetails) => {
    const groupAttributes = groupProduct?.attributes;
    const outOfStockOption = groupAttributes
      ?.filter((x) => x.attributeCode === PRODUCT.OUT_OF_STOCK_OPTIONS)
      .at(0)
      ?.selectValues?.at(0)?.code;

    const isObsolete = String(groupAttributes?.find((a) => a.attributeCode === PRODUCT.IS_OBSOLETE)?.attributeValues);
    groupProduct.isObsolete = isObsolete === "undefined" ? false : JSON.parse(isObsolete);

    const groupProductName = groupAttributes?.find((groupAttribute: IAttributeDetails) => groupAttribute?.attributeCode === PRODUCT.PRODUCT_NAME);
    const groupProductSKU = groupAttributes?.find((groupAttribute: IAttributeDetails) => groupAttribute?.attributeCode === PRODUCT.SKU);
    const groupProductPrice = groupProduct.salesPrice ? (groupProduct.salesPrice as number) : (groupProduct.retailPrice as number);
    const currencyCode = groupProduct.currencyCode;
    const inStockQty = groupProduct?.quantity || 0;
    const groupDisablePurchasing = outOfStockOption === INVENTORY.DISABLE_PURCHASING ? true : false;
    const groupAllowBackOrdering = outOfStockOption === INVENTORY.ALLOW_BACK_ORDERING ? true : false;
    const productType = groupAttributes
      ?.filter((x) => x.attributeCode === PRODUCT.PRODUCT_TYPE)
      .at(0)
      ?.selectValues?.at(0)?.code;
    const typicalLeadTime = Number(groupAttributes?.filter((x) => x.attributeCode === PRODUCT.TYPICAL_LEAD_TIME).at(0)?.attributeValues);
    const minQuantity = Number(groupProduct?.attributes?.filter((x) => x.attributeCode === PRODUCT.MINIMUM_QUANTITY).at(0)?.attributeValues);
    const maxQuantity = Number(groupProduct?.attributes?.filter((x) => x.attributeCode === PRODUCT.MAXIMUM_QUANTITY).at(0)?.attributeValues);
    const isCallForPricing = groupAttributes?.find((groupAttribute) => groupAttribute.attributeCode === "CallForPricing")?.attributeValues;
    const retailPrice = groupProduct.retailPrice as number;
    const salesPrice = groupProduct.salesPrice;

    return (
      <>
        <Modal size="xl" modalId="InventoryDetails">
          {<InventoryDetails productId={groupProduct.publishProductId} productName={groupProductName?.attributeValues as string} productSku={parentSku} />}
        </Modal>
        <td className="w-1/2 px-5 py-5 text-sm bg-white">
          <div className="flex flex-col items-baseline gap-4 lg:flex-row md:items-center">
            <CustomImage className="w-16 h-16" src={groupProduct.imageThumbNailPath || ""} alt="Product" dataTestSelector={`imgProductImage${groupProduct?.publishProductId}`}  />
            <div className="flex flex-col space-y-2" data-test-selector={`divProduct${groupProduct?.publishProductId}`}>
              {groupProductName && (
                <p className="font-medium break-words" data-test-selector={`paraGroupProductName${groupProduct?.publishProductId}`}>
                  {groupProductName.attributeValues}
                </p>
              )}
              <div className="flex gap-3 text-sm">
                <p className="min-w-[60px] font-medium" data-test-selector={`paraSKULabel${groupProduct?.publishProductId}`}>
                  {t("sku")}:
                </p>
                {groupProductSKU && <p className="break-all">{groupProductSKU?.attributeValues}</p>}
              </div>
              {isParentObsolete === false && (
                <>
                  {(!loginRequired || user) && (
                    <div className="flex gap-3 text-xs">
                      <p className="min-w-[60px] font-medium" data-test-selector={`paraInventoryLabel${groupProduct?.publishProductId}`}>
                        {t("labelInventory")}:
                      </p>
                      {groupProduct && (
                        <div>
                          <p className="pb-1" data-test-selector={`paraDefaultInventoryCount$${groupProduct?.publishProductId}`}>
                            <span className="font-semibold text-green-500">{groupProduct.defaultInventoryCount} </span>
                            {groupProduct?.defaultWarehouseName}
                          </p>
                          <ProductDetailsInventory
                            productName={groupProduct?.name ?? ""}
                            productId={groupProduct?.publishProductId as number}
                            inStockQuantity={inStockQty}
                            allowBackOrdering={groupAllowBackOrdering}
                            disablePurchasing={groupDisablePurchasing}
                            retailPrice={groupProductPrice}
                            customClass="text-xs"
                            isObsolete={groupProduct.isObsolete as boolean}
                            stockNotification={stockNotification as boolean}
                            sku={parentSku}
                            childProductSku={groupProductSKU?.attributeValues}
                            productInventoryMessage={productInventoryMessage}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {!Number.isNaN(typicalLeadTime) && (
                    <div className="flex gap-5 text-xs">
                      <TypicalLeadTiming typicalLeadTime={typicalLeadTime} productType={productType as string} customLabelWidth="w-32" />
                      TypicalLeadTiming
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </td>
        <td className="w-1/4 px-5 py-5 text-sm bg-white border-b border-gray-200">
          {(!loginRequired || user) && !(isCallForPricing === PRODUCT.TRUE_VALUE) && (
            <div className="text-sm" data-test-selector="divPrice">
              {product.isLoginToSeePricing && !user ? null : (
                <Price retailPrice={retailPrice} currencyCode={currencyCode} salesPrice={salesPrice} id={groupProduct?.publishProductId} />
              )}
            </div>
          )}
        </td>
        <td className="w-1/4 px-5 py-5 text-sm bg-white border-b border-gray-200">
          <div className="flex flex-col">
            <GroupChildProductInput
              disabled={stringToBooleanV2(isObsolete)}
              minQuantity={minQuantity}
              maxQuantity={maxQuantity}
              inStockQuantity={inStockQty}
              disablePurchasing={groupDisablePurchasing}
              retailPrice={groupProductPrice}
              groupProductSKU={groupProductSKU}
              handleBlurInput={getProductData}
              emptyInput={emptyInput}
              setInputField={setInputField}
              publishProductId={groupProduct?.publishProductId}
            />
          </div>
        </td>
      </>
    );
  };
  useEffect(() => {
    if (groupProductData.length > 0) {
      setIsGroupProductValidList(groupProductData.every((product) => product.isValid));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupProductData]);

  const renderGroupProducts = (groupProductDetails: IGroupProductsDetails[]) => {
    return groupProductDetails.map((groupProduct: IGroupProductsDetails) => {
      return (
        <tr className="border-t border-gray-200 border-x" data-test-selector={`rowGroupProduct${groupProduct.publishProductId}`} key={groupProduct.publishProductId}>
          {renderGroupAttributes(groupProduct)}
        </tr>
      );
    });
  };

  let isCallForPricingPromotion = false;
  const promotionCallForPricing = product.promotions?.filter((x) => x.promotionType?.toLowerCase() === "Call For Pricing".toLowerCase()).at(0)?.promotionType;
  if (promotionCallForPricing) isCallForPricingPromotion = true;
  return (
    <>
      <div className="mt-3 overflow-x-auto shadow-md rounded-cardBorderRadius">
        <table className="min-w-full leading-normal" data-test-selector="tblGroupProductGrid" role="presentation">
          <tr className="border border-b-2 border-gray-200">
            <td
              className="px-5 py-3 text-sm font-bold tracking-wider text-left text-gray-700 uppercase bg-gray-100"
              data-test-selector="tblHd
              Product"
            >
              {t("product")}
            </td>
            <td
              className="px-5 py-3 text-sm font-bold tracking-wider text-left text-gray-700 uppercase bg-gray-100"
              data-test-selector="tblHd
              Price"
            >
              {t("price")}
            </td>
            <td
              className="w-1/4 px-5 py-3 text-sm font-bold tracking-wider text-left text-gray-700 uppercase bg-gray-100"
              data-test-selector="tblHd
              Quantity"
            >
              {t("quantity")}
            </td>
          </tr>

          <tbody>{renderGroupProducts(groupProductDetails)}</tbody>
        </table>
      </div>
      <div className="mt-2">
        <AddToCart
          productDetails={product}
          showQuantityBox={true}
          configurableErrorMessage={""}
          isCallForPricingPromotion={isCallForPricingPromotion}
          isProductCompare={false}
          groupProductData={groupProductData}
          isGroupListValid={isGroupProductValidList}
          isLoginToSeePricing={product.isLoginToSeePricing}
        />
      </div>
    </>
  );
};

export default GroupProduct;
