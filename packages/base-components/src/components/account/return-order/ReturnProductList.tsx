"use client";

import { IReasonList, IReturnOrderProducts, IReturnProductList } from "@znode/types/order";
import React, { useState } from "react";

import Button from "../../common/button/Button";
import { CustomImage } from "../../common/image";
import { FormatPriceWithCurrencyCode } from "../../common/format-price/FormatPrice";
import { Input } from "../../common/input/Input";
import { RETURN_ORDER_STATUS } from "@znode/constants/return-order";
import TableWrapper from "../../common/table/TableWrapper";
import { Tooltip } from "../../common/tooltip/ToolTip";
import { ZIcons } from "../../common/icons/ZIcons";
import { useSearchParams } from "next/navigation";
import { useTranslationMessages } from "@znode/utils/component";

function ReturnProductList({
  productList,
  onChangeReasonForReturn,
  onChangeQuantity,
  isReceipt = false,
  isOrderNumberValid = false,
  isUpdate = false,
  reasonList,
  isEditable,
  priceRoundOff,
}: IReturnOrderProducts) {
  const commonTranslations = useTranslationMessages("Common");
  const returnOrderTranslations = useTranslationMessages("ReturnOrder");
  const searchParams = useSearchParams();
  const [focusedRow, setFocusedRow] = useState<string | null>(null);
  function isStatusInvalid(status: string): boolean {
    const invalidStatuses = RETURN_ORDER_STATUS.IN_VALID_RETURN_ORDER_LINE_ITEM_STATUS;
    return invalidStatuses.includes(status?.toUpperCase() ?? "");
  }
  const columns = [
    {
      title: commonTranslations("image"),
      heading: commonTranslations("image"),
      dataIndex: "imageUrl",
      key: "imageUrl",
      className: "text-center pl-4 no-print",
      displayOnMobile: true,
      width: 150,
      imageColumn: true,
      render: (imageUrl: string) => (
        <CustomImage
          src={imageUrl}
          alt="return Product Image"
          className="product-img-thumbnail cursor-pointer object-contain no-print"
          width={40}
          height={40}
          dataTestSelector={`imgProduct${imageUrl}`}
        />
      ),
    },
    {
      title: <p className="no-print">{commonTranslations("returnSku")}</p>,
      heading: commonTranslations("returnSku"),
      dataIndex: "sku",
      key: "sku",
      width: 200,
      className: "no-print",
      render: (sku: string) => (
        <p className="no-print bg-white" data-test-selector={`spnSku${sku}`}>
          {sku}
        </p>
      ),
    },
    {
      title: commonTranslations("productName"),
      heading: commonTranslations("productName"),
      width: 400,
      dataIndex: "productName",
      key: "productName",
      displayOnMobile: true,
      className: "print-align-top",
      render: (productName: string, record: IReturnProductList) => {
        return (
          <>
            <div
              className={
                record.isInvalid && !isReceipt
                  ? "whitespace-normal break-words align-top mb-[2.5rem] min-w-fit md:min-w-[250px]"
                  : "whitespace-normal break-words align-top min-w-fit md:min-w-[250px]"
              }
            >
              <div data-test-selector={`divProductName${record.productId}`} dangerouslySetInnerHTML={{ __html: productName }} />
              {record.productDescription && (
                <p className="mb-2 font-semibold" data-test-selector={`paraChildProductDescription${record.productId}`}>
                  <span data-test-selector={`divProductDescription${record.productId}`} dangerouslySetInnerHTML={{ __html: record.productDescription }} />
                </p>
              )}
            </div>
            {record.isInvalid && !isReceipt && <div className="text-red-500 p-2 w-full absolute left-0 bottom-0">{returnOrderTranslations("orderLineItemNotEligible")}</div>}
          </>
        );
      },
    },

    {
      title: <p className="print:hidden">{commonTranslations("status")}</p>,
      heading: commonTranslations("status"),
      dataIndex: "statusName",
      width: 150,
      className: "capitalize print:hidden",
      key: "statusName",
      render: (statusName: string) => {
        return <div className="capitalize print:hidden">{statusName}</div>;
      },
    },
    {
      title: commonTranslations("reason"),
      heading: commonTranslations("reason"),
      dataIndex: isReceipt ? "reasonForReturn" : "reasonCode",
      width: isReceipt ? 150 : 250,
      className: "print-align-top",
      key: isReceipt ? "reasonForReturn" : "reasonCode",
      align: isReceipt ? "center" : "left",

      render: (reasonCode: string, record: IReturnProductList) => {
        const isValidStatus = isStatusInvalid(record.status);
        return isReceipt ? (
          <div className="capitalize">{record.reasonForReturn}</div>
        ) : (
          <div className="relative w-full">
            <select
              disabled={isValidStatus || !isOrderNumberValid}
              onFocus={() => setFocusedRow(record.sku)}
              onBlur={() => setFocusedRow(null)}
              onChange={(e) =>
                onChangeReasonForReturn &&
                onChangeReasonForReturn(e.target.value, record, reasonList.find((reason: IReasonList) => reason.reasonCode === e.target.value)?.reason || "")
              }
              defaultValue={reasonCode}
              className="block appearance-none w-full h-10 bg-white border border-gray-400 hover:border-gray-500 px-3 pr-6 rounded-inputBorderRadius shadow-sm leading-tight focus:outline-none truncate min-w-[100px]"
              aria-label="Reason to return"
              style={{ maxWidth: "100%" }}
            >
              {reasonList.map((reason: IReasonList) => (
                <option onClick={() => setFocusedRow(null)} key={reason.reasonCode} value={reason.reasonCode} title={reason.reason} className="truncate">
                  {reason.reason}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500">
              <ZIcons
                name="chevron-down"
                className={`${focusedRow === record.sku ? "rotate-180 transition-transform" : "transition-transform"}`}
                data-test-selector="svgChevron-down"
              />
            </div>
          </div>
        );
      },
    },
    !isReceipt && {
      title: commonTranslations("unitPrice"),
      heading: commonTranslations("unitPrice"),
      dataIndex: "unitPrice",
      key: "unitPrice",
      className: "",
      width: 150,
      showCurrencyCode: true,
      align: "left",
      render: (unitPrice: number, record: IReturnProductList) => (
        <FormatPriceWithCurrencyCode priceRoundOff={priceRoundOff} price={record.status === "REJECTED" ? 0 : unitPrice} currencyCode={record?.currencyCode || "USD"} />
      ),
    },
    !isReceipt && {
      title: commonTranslations("availableQty"),
      heading: commonTranslations("availableQty"),
      dataIndex: "availableQty",
      key: "availableQty",
      width: 150,
      className: "",
      align: "left",
    },
    !isReceipt && {
      title: commonTranslations("returnQty"),
      heading: commonTranslations("returnQty"),
      dataIndex: "expectedReturnQuantity",
      key: "expectedReturnQuantity",
      className: "",
      align: "left",
      width: 150,
      render: (quantity: string, record: IReturnProductList) => {
        const isValidStatus = isStatusInvalid(record.status);

        return (
          <div className={record.validationMessage ? "w-[200px]" : ""}>
            <Input
              type="text"
              onBlur={(e) => onChangeQuantity && onChangeQuantity(e.target.value, record)}
              disabled={isValidStatus || !isOrderNumberValid}
              defaultValue={isEditable ? record.editQty : quantity || 0}
              className="border p-2 w-16 text-center rounded-custom"
              id="return-qty"
              dataTestSelector={`txtReturnShippedQuantity${record?.sku}`}
            />
            {record.validationMessage && <div className="text-red-500">{record.validationMessage}</div>}
          </div>
        );
      },
    },
    isReceipt && { title: commonTranslations("expectedQty"), heading: commonTranslations("expectedQty"), dataIndex: "availableQty", key: "availableQty", width: 200 },
    searchParams.has("isReceiptDetails") &&
      searchParams.get("isReceiptDetails") === "true" && {
        title: commonTranslations("confirmedQty"),
        heading: commonTranslations("confirmedQty"),
        dataIndex: "confirmedQuantity",
        width: 150,
        key: "confirmedQuantity",
      },
    searchParams.has("isReceiptDetails") &&
      searchParams.get("isReceiptDetails") === "true" && {
        title: <span className="no-print whitespace-nowrap">{commonTranslations("shippingReturned")}</span>,
        heading: commonTranslations("shippingReturned"),
        dataIndex: "isReturnShipping",
        className: "no-print",
        key: "isReturnShipping",
        render: (isReturnShipping: boolean, record: IReturnProductList) => (
          <div className="no-print">{isReturnShipping || record.isReturnShipping ? commonTranslations("yes") : commonTranslations("no")}</div>
        ),
      },
    searchParams.has("isReceiptDetails") &&
      searchParams.get("isReceiptDetails") === "true" && {
        title: commonTranslations("shipping"),
        heading: commonTranslations("shipping"),
        dataIndex: "shippingCost",
        key: "shippingCost",
        className: "print-align-top ",
        width: 150,
        render: (shippingCost: number, record: IReturnProductList) => (
          <FormatPriceWithCurrencyCode
            priceRoundOff={priceRoundOff}
            price={RETURN_ORDER_STATUS.IN_VALID_RETURN_ORDER_LINE_ITEM_STATUS.includes(record.status) || !record.isReturnShipping ? 0 : shippingCost || 0}
            currencyCode={record?.currencyCode || "USD"}
          />
        ),
      },
    {
      title: commonTranslations("totalPrice"),
      dataIndex: "totalPrice",
      key: "totalPrice",
      displayOnMobile: true,
      heading: commonTranslations("totalPrice"),
      showCurrencyCode: true,
      className: "print-align-top",
      width: 150,
      align: "left",
      render: (totalPrice: number, record: IReturnProductList) => (
        <FormatPriceWithCurrencyCode
          priceRoundOff={priceRoundOff}
          price={
            (RETURN_ORDER_STATUS.IN_VALID_RETURN_ORDER_LINE_ITEM_STATUS.includes(record.status)
              ? 0
              : isReceipt
              ? Number(record.confirmedQuantity) > 0
                ? Number(record.confirmedQuantity) * record.unitPrice
                : record.availableQty * record.unitPrice
              : isEditable
              ? isUpdate && totalPrice
                ? totalPrice
                : Number(record.editQty) * record.unitPrice
              : totalPrice) || 0
          }
          currencyCode={"USD"}
        />
      ),
    },
  ].filter(Boolean);

  const renderAction = (record: { orderNumber: string }) => {
    if (isReceipt || (searchParams.has("isReceiptDetails") && searchParams.get("isReceiptDetails") === "true")) {
      return "";
    }
    return (
      <div className="flex">
        <Button type="text" size="small" dataTestSelector={`btnView${record.orderNumber}`}>
          <Tooltip message={commonTranslations("view")}>
            <ZIcons name="eye" data-test-selector={`svgView${record.orderNumber}`} />
          </Tooltip>
        </Button>
      </div>
    );
  };
  return (
    <TableWrapper
      customClassName="m-0 p-0 !mt-0"
      isActionPanel={false}
      renderAction={renderAction}
      columns={columns as []}
      loading={true}
      expandedRowByKey="productId"
      data={productList as []}
      isRender={true}
    />
  );
}

export default ReturnProductList;
