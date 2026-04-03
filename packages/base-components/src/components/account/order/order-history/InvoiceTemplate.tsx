"use client";

import { IOrderInvoiceData, IOrderProductDetail, IRecords } from "@znode/types/account/order";
import { useEffect, useState } from "react";

import { ADDRESS } from "@znode/constants/address";
import { CHECKOUT } from "@znode/constants/checkout";
import { FormatPriceWithCurrencyCode } from "../../../common/format-price";
import { useTranslationMessages } from "@znode/utils/component";

export function InvoiceTemplate({ orderData, contentPageHeight }: { orderData: IOrderInvoiceData[]; contentPageHeight: number }) {
  const orderHistoryTranslation = useTranslationMessages("OrderHistory");
  const orderTranslation = useTranslationMessages("Orders");
  const commonTranslation = useTranslationMessages("Common");
  const [receiptsDetail, setReceiptsDetails] = useState<JSX.Element[]>([]);
  const renderDetailsColumn = (columnDetails: IRecords[]) => {
    return columnDetails?.map((item, index) => {
      return (
        <div className="col-span-6" key={index} data-test-selector="divInvoiceDetails">
          <span>
            <b>{orderHistoryTranslation(item.name)} : </b>
          </span>
          {item.value}
        </div>
      );
    });
  };

  const renderBillingColumn = (billingDetails: IRecords[]) => {
    return billingDetails?.map((item, index) => {
      return (
        <div className="col-span-6" key={index} data-test-selector="divBillingDetails">
          <span>{item.name ? `${orderHistoryTranslation(item.name)} : ` : ""}</span>
          <span className={item?.name === "Email" ? "tracking-tight" : ""}>{item.value}</span>
        </div>
      );
    });
  };

  const renderShippingColumn = (shippingColumnDetails: IRecords[]) => {
    return shippingColumnDetails?.map((item, index) => {
      return (
        <div className="col-span-6" key={index} data-test-selector="divShippingDetails">
          <span>
            <b>{orderHistoryTranslation(item.name)} : </b>
          </span>
          {item.name === "shippingConstraints" ? (CHECKOUT.SHIP_COMPLETE ? orderTranslation("shipComplete") : orderTranslation("shipPartial")) : item.value}
        </div>
      );
    });
  };

  const renderProductDetails = (productDetails: IOrderProductDetail[], currencyCode: string) => {
    return productDetails?.map((item, index: number) => {
      return (
        <div className="grid grid-cols-12 text-xs" key={index} data-test-selector="divProductDetailsContainer">
          <div className="col-span-3 p-1" dangerouslySetInnerHTML={{ __html: item.item }}></div>
          <div className="col-span-3 p-1 text-[12px]" dangerouslySetInnerHTML={{ __html: item.description }}></div>
          <div className="col-span-1 p-1"></div>
          <div className="col-span-1 p-1 text-center">{item.quantity}</div>
          <div className="col-span-2 p-1 text-center">
            <FormatPriceWithCurrencyCode price={item.price || 0} currencyCode={currencyCode || "USD"} />
          </div>
          <div className="col-span-2 p-1 text-center">
            <FormatPriceWithCurrencyCode price={item.total || 0} currencyCode={currencyCode || "USD"} />
          </div>
        </div>
      );
    });
  };

  const renderProductPricing = (
    productPricingDetails: {
      name: string;
      value: number;
    }[],
    currencyCode: string
  ) => {
    return productPricingDetails?.map((item: {name: string; value: {shippingCost: number; shippingMethod: string} | number}, index) => {
      if (item.name === "csrDiscount" && Number(item.value) === 0) return null;

      const POSITIVE_KEYS = ["shipping", "handlingCharges", "tax"];
      const NEGATIVE_KEYS = ["discountSubTotal", "csrDiscount", "voucherAmount", "shippingDiscount"];

      const isPositive = POSITIVE_KEYS.includes(item.name);
      const isNegative = NEGATIVE_KEYS.includes(item.name);

      const value = typeof item.value === "object" && item.value !== null ? item.value.shippingCost : item.value;

      let sign = "";
      if (isPositive) sign = "+";
      else if (isNegative) sign = "-";

      return (
        <div className="flex justify-between col-span-6 whitespace-normal" key={index} data-test-selector="divProductPricingDetail">
          {item.name === "csrDiscount" ? (
            <div>
              <span>{orderHistoryTranslation("csr")}</span>&nbsp;
              <span>{orderHistoryTranslation("discount")}</span>
            </div>
          ) : item.name === "shipping" && typeof item.value === "object" && item.value !== null ? (
            <div>
              {orderHistoryTranslation(item.name)} ({item.value.shippingMethod})
            </div>
          ) : (
            <div>{orderHistoryTranslation(item.name)}</div>
          )}
          <div>
            <b>{sign}</b>
            {<FormatPriceWithCurrencyCode price={value || 0} currencyCode={currencyCode || "USD"} />}
          </div>
        </div>
      );
    });
  };

  const renderOrderTotals = (orderTotalDetails: { name: string; value: number }[], currencyCode: string) => {
    return orderTotalDetails.map((item, index) => {
      return (
        <div className="flex justify-between col-span-6 text-lg text-errorColor" key={index} data-test-selector="divOrderTotals">
          <div>
            <b>{orderHistoryTranslation(item.name)}</b>
          </div>
          <div>
            <b>
              <FormatPriceWithCurrencyCode price={item.value || 0} currencyCode={currencyCode || "USD"} />
            </b>
          </div>
        </div>
      );
    });
  };

  const getDetails = async (item: IOrderInvoiceData, idx: number) => {
    const isBillingAddressOptional = item.hideBillingAddress?.find((address) => address.name === ADDRESS.IS_BILLING_ADDRESS_OPTIONAL)?.value;
    return (
    <div key={idx} className={`h-[${contentPageHeight}px]`}>
        <div data-test-selector="divOrderNumber">
          <b className="pr-3 text-2xl">
            {orderHistoryTranslation("order")} {item.orderNumber} -{" "}
          </b>
          <span className="text-xl text-gray-500 lowercase">{commonTranslation("on")} </span>
          <span className="text-xl text-gray-500">{item?.orderDate}</span>
        </div>
        <div className="mt-3 mb-2 text-xl font-semibold text-left border-b-2 border-red-500"></div>
        <div className="grid grid-cols-12">
          <div className="col-span-6" data-test-selector="divDetailsHeading">
            {" "}
            {commonTranslation("details")} :
          </div>
          {!isBillingAddressOptional && (
            <div className="col-span-6" data-test-selector="divBillingToHeading">
              {" "}
              {orderHistoryTranslation("billingTo")} :
            </div>
          )}
        </div>
        <div className="mt-2 mb-1 text-left border-b-2 border-gray-800"></div>
        <div className="grid grid-cols-12 text-sm">
          <div className="col-span-6" data-test-selector="divDetailsColumn">
            {renderDetailsColumn(item.detailsColumn)}
          </div>
          {!isBillingAddressOptional && (
            <div className="col-span-6" data-test-selector="divBillingColumn">
              {renderBillingColumn(item.billingColumn?.map((item) => ({ value: item.value, name: item?.name || "" })) || [])}
            </div>
          )}
        </div>
        <div className="mt-5 border-2 break-inside-avoid-page">
          <div className="p-2 bg-gray-100 rounded-sm">
            <div className="-mt-3 text-left" data-test-selector="divShippingToHeading">
              {orderHistoryTranslation("shippingTo")} :
            </div>
            <div className="mt-2 mb-1 text-left border-b-2 border-gray-800"></div>
            <div className="grid grid-cols-12 text-sm mb-1">
              <div className="col-span-6" data-test-selector="divShippingToDetails">
                {renderBillingColumn(item.shippingColumn?.map((item) => ({ value: item.value, name: item?.name || "" })) || [])}
              </div>
              <div className="col-span-6">{renderShippingColumn(item.shippingColumn2)}</div>
            </div>
          </div>
          <div className="p-2" data-test-selector="divProductDetailsContainer">
            <div className="grid grid-cols-12 pb-2 text-sm border-b-2 border-gray-100">
              <div className="col-span-3 font-bold" data-test-selector="divItemHeading">
                {commonTranslation("item")}
              </div>
              <div className="col-span-3 font-bold" data-test-selector="divDescriptionHeading">
                {commonTranslation("description")}
              </div>
              <div className="col-span-1"></div>
              <div className="col-span-1 font-bold text-center" data-test-selector="divQuantityHeading">
                {commonTranslation("quantity")}
              </div>
              <div className="col-span-2 font-bold text-center" data-test-selector="divPriceHeading">
                {commonTranslation("price")}
              </div>
              <div className="col-span-2 font-bold text-center" data-test-selector="divTotalHeading">
                {commonTranslation("total")}
              </div>
            </div>
            {renderProductDetails(item.productDetails, item.currencyCode)}
          </div>
        </div>
        <div className="grid grid-cols-12 p-2 mb-3 text-sm" data-test-selector="divOrderTotalContainer">
          <div className="col-span-6"></div>
          <div className="col-span-6">
            {renderProductPricing(item.productPricing, item.currencyCode)}
            <div className="mt-2 -mb-2 text-left border-b-2 border-gray-800"></div>
            {renderOrderTotals(item.orderTotal, item.currencyCode)}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchDetails = async () => {
      // Simulate Asynchronous Computation for Each Order Detail
      const tasks = orderData?.map(
        (item: IOrderInvoiceData, idx) =>
          new Promise<JSX.Element>((resolve) => {
            resolve(getDetails(item, idx));
          })
      );

      // Gathering All Order Details JSX
      const results = await Promise.all(tasks);
      setReceiptsDetails(results);
    };

    fetchDetails();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderData]);

  return <>{receiptsDetail}</>;
}
