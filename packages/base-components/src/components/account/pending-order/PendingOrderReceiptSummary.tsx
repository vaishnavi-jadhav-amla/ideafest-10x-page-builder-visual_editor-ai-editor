"use client";

import { useEffect, useState } from "react";

import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import { Heading } from "../../common/heading";
import { IOrderLineItem } from "@znode/types/account";
import RenderPersonalizedItems from "../../common/personalized-item/RenderPersonalizedItems";
import { useTranslations } from "next-intl";

interface IPendingOrderSummaryData {
  customOrderSummaryTableData: ICustomTableData;
  isPendingPayment: string;
  shoppingCartItems?: IOrderLineItem[];
}
interface ICustomLabel {
  item: string;
  description: string;
  shipping: string;
  quantity: string;
  price: string;
  totalPrice: string;
}
interface ICustomParams {
  showShipping: boolean;
  descriptionColSize: number;
  label: ICustomLabel;
}
interface ICustomColumns {
  hideItem: boolean;
  hideDescription: boolean;
  hideQty: boolean;
  hideShipping: boolean;
  hidePrice: boolean;
  hideTotal: boolean;
  hideStatus: boolean;
  hideTracking: boolean;
  custom: ICustomParams;
  count: number;
}
interface ICustomTableData {
  cols: ICustomColumns;
  hideReOrder: boolean;
}

const getFormattedDescription = (text: string | undefined) => {
  const formattedDescription = text ? text.replace(/&lt;\/?br&gt;/g, "<br/>") : "";
  return formattedDescription;
};

export const PendingOrderReceiptSummary: React.FC<IPendingOrderSummaryData> = ({ customOrderSummaryTableData, shoppingCartItems }) => {
  const pendingOrderTranslation = useTranslations("ApprovalRouting");
  const commonTranslation = useTranslations("Common");

  const toCamelCase = (label: string) => label.charAt(0).toLowerCase() + label.slice(1);

  const priceLabel = customOrderSummaryTableData?.cols?.custom?.label?.price || "itemPrice";
  const formattedLabel = toCamelCase(priceLabel);

  const totalPrice = customOrderSummaryTableData?.cols?.custom?.label?.totalPrice || "totalPrice";
  const formattedPrice = toCamelCase(totalPrice);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMobileViewColumnName = (columnName: string) => {
    return (
      <p className="w-1/3 mb-0 font-semibold text-left text-gray-600 " data-test-selector={`paraTitle${columnName}`}>
        {commonTranslation(columnName)}
      </p>
    );
  };

  const renderTableData = () => {
    return (
      <div className={`grid grid-cols-${customOrderSummaryTableData?.cols?.count || 10} gap-4`} data-test-selector="divTitleContainer">
        <div className="col-span-2">
          <p className="text-sm font-semibold text-gray-600" data-test-selector="paraTitleItem">
            {commonTranslation("item")}
          </p>
        </div>
        <div className={`col-span-${customOrderSummaryTableData?.cols?.custom?.descriptionColSize || 2}`}>
          <p className="text-sm font-semibold text-gray-600" data-test-selector="paraTitleDescription">
            {commonTranslation("description")}
          </p>
        </div>
        <div className="col-span-1">
          <p className="text-sm font-semibold text-center text-gray-600" data-test-selector="paraTitleQuantity">
            {commonTranslation("quantity")}
          </p>
        </div>
        {customOrderSummaryTableData?.cols?.custom?.showShipping && (
          <div className="col-span-1">
            <p className="text-sm font-semibold text-center text-gray-600" data-test-selector="paraTitleShipping">
              {commonTranslation("shipping")}
            </p>
          </div>
        )}
        <div className="col-span-1">
          <p className="text-sm font-semibold text-center text-gray-600" data-test-selector="paraTitleItemPrice">
            {commonTranslation("itemPrice")}
          </p>
        </div>
        <div className="col-span-1">
          <p className="text-sm font-semibold text-right text-gray-600" data-test-selector="paraTitleTotalPrice">
            {commonTranslation("totalPrice")}
          </p>
        </div>
        <div className="col-span-1"></div>
      </div>
    );
  };

  const renderOrderListItems = () => {
    return (
      shoppingCartItems &&
      shoppingCartItems?.map((lineItem: IOrderLineItem, i: number) => {
        const { name, sku, description, quantity, price, shippingCost } = lineItem;
        return (
          <div
            className={`grid grid-cols-${customOrderSummaryTableData?.cols?.count || 10} ${
              isMobile ? "w-full flex border-b my-4 justify-between" : ""
            } gap-4 border-b border-zinc-300 py-4`}
            key={i}
            data-test-selector="divOrderedItemsContainer"
          >
            <div className="flex justify-between sm:col-span-2 xs:col-span-10 gap-14 ">
              {isMobile ? getMobileViewColumnName("item") : ""}
              <p className={`text-sm font-semibold ${isMobile ? "justify-self-end text-right" : ""}`} data-test-selector={`paraProductName${sku}`}>
                {name}
                {lineItem?.personaliseValuesDetail && lineItem?.personaliseValuesDetail.length > 0 && (
                  <div className="py-2 text-sm">
                    <RenderPersonalizedItems data={lineItem.personaliseValuesDetail} />
                  </div>
                )}
              </p>
            </div>
            <div
              className={`col-span-${customOrderSummaryTableData?.cols?.custom?.descriptionColSize || 2}  ${
                isMobile ? "flex justify-between gap-14 xs:col-span-10 text-right" : ""
              }`}
              data-test-selector={`divProductDescription${sku}`}
            >
              {isMobile ? getMobileViewColumnName("description") : ""}
              <div className="text-sm" dangerouslySetInnerHTML={{ __html: getFormattedDescription(description) || "-" }}></div>
            </div>
            <div className="flex justify-between sm:col-span-1 xs:col-span-10 sm:block ">
              {isMobile ? getMobileViewColumnName("quantity") : ""}
              <p className="text-sm sm:text-center" data-test-selector={`paraProductQuantity${sku}`}>
                {quantity}
              </p>
            </div>
            {customOrderSummaryTableData?.cols?.custom?.showShipping && (
              <div className="flex justify-between sm:col-span-1 xs:col-span-10 sm:block">
                {isMobile ? getMobileViewColumnName("shipping") : ""}
                <p className="text-sm sm:text-center" data-test-selector={`paraProductShippingCost${sku}`}>
                  <FormatPriceWithCurrencyCode price={shippingCost || 0} currencyCode={"USD"} />
                </p>
              </div>
            )}
            <div className="flex justify-between sm:col-span-1 xs:col-span-10 sm:block">
              {isMobile ? getMobileViewColumnName(formattedLabel ?? "itemPrice") : ""}
              <p className="text-sm sm:text-center" data-test-selector={`paraProductPrice${sku}`}>
                <FormatPriceWithCurrencyCode price={price || 0} currencyCode={"USD"} />
              </p>
            </div>
            <div className="flex justify-between sm:col-span-1 xs:col-span-10 sm:block">
              {isMobile ? getMobileViewColumnName(formattedPrice ?? "totalPrice") : ""}
              <p className="text-sm sm:text-right " data-test-selector={`paraProductTotalPrice${sku}`}>
                <FormatPriceWithCurrencyCode price={price && price * (quantity || 0)} currencyCode={"USD"} />
              </p>
            </div>
          </div>
        );
      })
    );
  };

  return (
    <>
      <Heading
        name={pendingOrderTranslation("productsInPendingOrder")}
        level="h2"
        customClass="uppercase tracking-wide"
        dataTestSelector={"hdgProductsInPendingOrder"}
        showSeparator
      />
      <div className="mx-2">
        {!isMobile ? renderTableData() : null}
        {renderOrderListItems()}
      </div>
    </>
  );
};
