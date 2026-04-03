"use client";

import React, { useEffect, useState } from "react";

import { FormatPriceWithCurrencyCode } from "../../../../common/format-price/FormatPrice";
import { Heading } from "../../../../common/heading/Heading";
import { IReturnOrderProductList } from "@znode/types/order";
import Link from "next/link";
import { RETURN_ORDER_STATUS } from "@znode/constants/return-order";
import TableWrapper from "../../../../common/table/TableWrapper";
import { getReturnOrderProductList } from "../../../../../http-request";
import { useTranslationMessages } from "@znode/utils/component";

function ReturnOrderProductList({ isTrackReceipt = false, orderNumber, priceRoundOff }: { isTrackReceipt?: boolean; orderNumber?: string; priceRoundOff:number }) {
  const commonTranslations = useTranslationMessages("Common");
  const returnOrderTranslations = useTranslationMessages("ReturnOrder");

  const [productList, setProductList] = useState<IReturnOrderProductList[]>([]);

  const columns = [
    !isTrackReceipt && {
      title: returnOrderTranslations("returnNumber"),
      dataIndex: "returnNumber",
      heading: returnOrderTranslations("returnNumber"),
      width: 100,
      className: "whitespace-normal break-words ",
      displayOnMobile: true,
      key: "returnNumber",
      render: (returnNumber: string) => {
        return (
          <Link
            className="flex flex-wrap items-center justify-between underline cursor-pointer text-linkColor hover:text-hoverColor whitespace-nowrap"
            href={`/account/return-order/receipt/${returnNumber}?isReceiptDetails=true`}
            data-test-selector="linkReturnNumber"
            prefetch={true}
          >
            <div className="mr-2 ">{returnNumber}</div>
          </Link>
        );
      },
    },
    {
      title: commonTranslations("returnSku"),
      heading: commonTranslations("returnSku"),
      dataIndex: "sku",
      key: "sku",
      width: 200,
      displayOnMobile: true,
      className: "whitespace-nowrap",
      render: (sku: string) => <div className="whitespace-nowrap"> {sku}</div>,
    },
    {
      title: (
        <p data-test-selector="paraProductName" className={!isTrackReceipt ? "no-print" : ""}>
          {commonTranslations("productName")}
        </p>
      ),
      heading: commonTranslations("productName"),
      width: 400,
      dataIndex: "productName",
      className: !isTrackReceipt ? "no-print print:hidden" : "",
      key: "productName",
      render: (productName: string, record: IReturnOrderProductList) => {
        return (
          <div className={`whitespace-normal break-words align-top min-w-fit md:min-w-[250px] ${!isTrackReceipt ? "no-print print:hidden" : ""}`}>
            <span data-test-selector={`divProductDescription${record.productId}`} dangerouslySetInnerHTML={{ __html: productName }} />
            {record.productDescription && (
              <p className="mb-2 text-sm font-medium custom-word-break" data-test-selector={`paraChildProductDescription${record.productId}`}>
                <span data-test-selector={`divProductDescription${record.productId}`} dangerouslySetInnerHTML={{ __html: record.productDescription }} />
              </p>
            )}
          </div>
        );
      },
    },
    {
      title: <p className="no-print print:hidden">{commonTranslations("status")}</p>,
      heading: commonTranslations("status"),
      dataIndex: "status",
      className: "capitalize no-print print:hidden",
      key: "status",
      width: 100,
      render: (status: string) => {
        return <div className="no-print print:hidden">{isTrackReceipt ? "Returned" : status}</div>;
      },
    },
    {
      title: <p className="no-print">{commonTranslations("reason")}</p>,
      heading: commonTranslations("reason"),
      dataIndex: "reasonForReturn",
      width: 100,
      className: "no-print",
      key: "reasonForReturn",
      align: "left",
      render: (reasonForReturn: string) => {
        return <div className="capitalize no-print">{reasonForReturn}</div>;
      },
    },
    {
      title: <p className="no-print whitespace-nowrap print:hidden">{commonTranslations("trackingNumber")}</p>,
      heading: commonTranslations("trackingNumber"),
      dataIndex: "trackingNumber",
      key: "trackingNumber",
      className: "whitespace-normal break-words no-print print:hidden",
      width: 150,
      align: "left",
      render: (trackingNumber: string) => {
        return <div className="no-print print:hidden">{trackingNumber}</div>;
      },
    },
    {
      title: commonTranslations("quantity"),
      heading: commonTranslations("quantity"),
      dataIndex: "quantity",
      key: "quantity",
      className: "",
      width: 150,
      align: "left",
    },
    {
      title: commonTranslations("price"),
      heading: commonTranslations("price"),
      dataIndex: "price",
      key: "price",
      className: "",
      width: 150,
      showCurrencyCode: true,
      render: (price: number, record: IReturnOrderProductList) => (
        <FormatPriceWithCurrencyCode
          priceRoundOff={record.priceRoundOff || priceRoundOff}
          price={record.status === "REJECTED" ? 0 : price}
          currencyCode={record?.currencyCode || "USD"}
        />
      ),
    },
    {
      title: commonTranslations("taxCost"),
      heading: commonTranslations("taxCost"),
      dataIndex: "taxCost",
      key: "taxCost",
      width: 150,
      className: "",
      render: (taxCost: number, record: IReturnOrderProductList) => (
        <FormatPriceWithCurrencyCode
          priceRoundOff={record.priceRoundOff || priceRoundOff}
          price={record.status === "REJECTED" ? 0 : taxCost}
          currencyCode={record?.currencyCode || "USD"}
        />
      ),
    },
    !isTrackReceipt && {
      title: commonTranslations("shipping"),
      heading: commonTranslations("shipping"),
      dataIndex: "shippingCost",
      key: "shippingCost",
      width: 150,
      render: (shippingCost: number, record: IReturnOrderProductList) => (
        <FormatPriceWithCurrencyCode
          priceRoundOff={record.priceRoundOff || priceRoundOff}
          price={RETURN_ORDER_STATUS.IN_VALID_RETURN_ORDER_LINE_ITEM_STATUS.includes(record.status) ? 0 : shippingCost || 0}
          currencyCode={record?.currencyCode || "USD"}
        />
      ),
    },
    {
      title: commonTranslations("totalPrice"),
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "left",
      displayOnMobile: true,
      heading: commonTranslations("totalPrice"),
      showCurrencyCode: true,
      className: "whitespace-nowrap break-words",
      width: 150,
      render: (totalPrice: number, record: IReturnOrderProductList) => (
        <FormatPriceWithCurrencyCode priceRoundOff={record.priceRoundOff || priceRoundOff} price={totalPrice} currencyCode={"USD"} />
      ),
    },
  ].filter(Boolean);

  const fetchProductList = async () => {
    const response = await getReturnOrderProductList(orderNumber ?? "");
    setProductList(response);
  };

  useEffect(() => {
    if (orderNumber) {
      fetchProductList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  if (productList.length === 0) {
    return "";
  }

  return (
    <div className="custom-shadow rounded-[4px] mt-4 mb-6">
      <Heading name={commonTranslations("returnItemList")} customClass="uppercase py-3 px-2 " dataTestSelector="hdgReturnItemList" level="h3" />
      <TableWrapper
        customClassName="m-0 p-0 !mt-0 print:border"
        isActionPanel={false}
        columns={columns as []}
        loading={false}
        expandedRowByKey="productId"
        data={productList as []}
        isRender={false}
      />
    </div>
  );
}

export default ReturnOrderProductList;
