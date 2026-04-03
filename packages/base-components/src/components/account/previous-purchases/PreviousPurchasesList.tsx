"use client";

import AddToCartNotification from "../../add-to-cart-notification/AddToCartNotification";
import Button from "../../common/button/Button";
import { CustomImage } from "../../common/image/CustomImage";
import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import HeaderBar from "./header-section/HeaderSection";
import HeaderSort from "../../common/header-sort/HeaderSort";
import { Heading } from "../../common/heading/Heading";
import { IPurchaseProduct } from "@znode/types/account";
import { Input } from "../../common/input";
import InventoryChecked from "./InventoryChecked";
import Pagination from "../../common/pagination/Pagination";
import React from "react";
import TableWrapper from "../../common/table/TableWrapper";
import { usePreviousPurchases } from "./hook/usePreviousPurchasesList";
import { useTranslationMessages } from "@znode/utils/component";

function PreviousPurchasesList() {
  const previousPurchasesTranslations = useTranslationMessages("PreviousPurchases");
  const commonTranslations = useTranslationMessages("Common");
  const behaviorMsgTranslations = useTranslationMessages("BehaviorMsg");
  const {
    onColumnSort,
    onPageIndexChange,
    onPageSizeChange,
    items,
    loading,
    totalResults,
    column,
    selected,
    selectAll,
    selectSingleProduct,
    qtyMap,
    validationMessages,
    handleQtyChange,
    setQtyMap,
    setValidationMessages,
    handleAddToCart,
    handleSearch,
    handleFilterDayChange,
    handleSingleAddToCart,
    handledMoveAllProductToCart,
    stockMessage,
    setStockMessage,
    dateDetails,
    productDetails,
    isAddToCartLoading,
  } = usePreviousPurchases();

  const columns = [
    {
      title: (
        <input
          type="checkbox"
          checked={items && items.length > 0 && selected.length === items.length}
          onChange={selectAll}
          aria-label="Select all"
          data-test-selector="chkSelectAll"
          className="w-4 h-4"
        />
      ),
      dataIndex: "select",
      key: "select",
      width: 50,
      class: "text-center",
      render: (_: void, record: IPurchaseProduct) => {
        const validationMsg = validationMessages[record.productId] ?? "";
        return (
          <input
            onClick={(e) => e.stopPropagation()}
            type="checkbox"
            disabled={!!validationMsg || (Object.keys(stockMessage).length > 0 && stockMessage[record.productId]?.isInValid) || record.unitPricePurchased === null}
            aria-label="Select row"
            checked={selected.includes(record.productId)}
            onChange={() => selectSingleProduct(record.productId, record.sku)}
            data-test-selector={`chkSelectRow${record.productId}`}
            className="w-4 h-4"
          />
        );
      },
      displayOnMobile: true,
    },
    {
      title: commonTranslations("image"),
      heading: commonTranslations("image"),
      dataIndex: "productImageUrl",
      key: "productImageUrl",
      className: "text-center pl-4 no-print relative ",
      displayOnMobile: true,
      imageColumn: true,
      render: (productImageUrl: string) => {
        return (
          <CustomImage
            isLoader={false}
            src={productImageUrl}
            alt="Previous Purchases Image"
            className="product-img-thumbnail object-contain no-print"
            width={60}
            height={60}
            dataTestSelector={`imgPreviousPurchases${productImageUrl}`}
          />
        );
      },
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="ProductName" columnName={previousPurchasesTranslations("productName")} onSort={onColumnSort} />,
      heading: "Product Name",
      width: 400,
      dataIndex: "productName",
      key: "productName",
      displayOnMobile: true,

      render: (productName: string, record: IPurchaseProduct) => {
        const validationMsg = validationMessages[record.productId] ?? "";
        return (
          <div className="whitespace-normal break-words align-top min-w-fit md:min-w-[250px] relative">
            <span data-test-selector={`divProductName${record.productId}`} dangerouslySetInnerHTML={{ __html: productName }} />
            {record.productDescription && (
              <p className="mb-2 font-medium custom-word-break" data-test-selector={`paraChildProductDescription${record.productId}`}>
                <span data-test-selector={`divProductDescription${record.productId}`} dangerouslySetInnerHTML={{ __html: record.productDescription }} />
              </p>
            )}
            {validationMsg === behaviorMsgTranslations("behaviorErrorMsg") && <div className="text-red-500 w-full">{validationMsg}</div>}
          </div>
        );
      },
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="sku" columnName={previousPurchasesTranslations("sku")} onSort={onColumnSort} />,
      heading: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (sku: string) => <div className="whitespace-nowrap">{sku}</div>,
    },
    {
      title: previousPurchasesTranslations("availability"),
      heading: previousPurchasesTranslations("availability"),
      dataIndex: "availability",
      key: "availability",
      align: "left",
      render: (_availability: string, record: IPurchaseProduct) => {
        if (Object.keys(stockMessage).length > 0 && stockMessage[record.productId]?.message) {
          if (stockMessage[record.productId]?.message === behaviorMsgTranslations("behaviorErrorMsg")) {
            return <div className="text-red-600">-</div>;
          } else {
            return (
              <div className={stockMessage[record.productId]?.isInValid ? "text-red-600 capitalize" : "text-green-600 capitalize"}>{stockMessage[record.productId]?.message}</div>
            );
          }
        } else {
          return (
            <InventoryChecked
              setInvalidInventory={(productId: string, isInValid: boolean, message: string) => {
                setStockMessage((prev) => ({ ...prev, [productId]: { message: message, isInValid: isInValid } }));
                selected.includes(record.productId) && isInValid && selectSingleProduct(record.productId, record.sku);
              }}
              setValidationMessages={setValidationMessages}
              addOnList={productDetails[record.productId]?.addOnSkuList}
              productId={record.productId}
              sku={record.sku}
              qty={Number(qtyMap[record.productId] || record.lastOrderedQty)}
            />
          );
        }
      },
    },
    {
      title: <p className="">{previousPurchasesTranslations("lastOrderedQty")}</p>,
      heading: previousPurchasesTranslations("lastOrderedQty"),
      dataIndex: "lastOrderedQty",
      key: "lastOrderedQty",
      align: "left",
      render: (lastOrderedQty: number) => <div>{lastOrderedQty}</div>,
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="OrderDate" className="" columnName={previousPurchasesTranslations("orderDate")} onSort={onColumnSort} />,
      heading: "Order Date",
      dataIndex: "orderDate",
      className: "capitalize",
      key: "orderDate",
      render: (orderDate: string) => <div className="capitalize">{orderDate}</div>,
    },
    {
      title: previousPurchasesTranslations("orderedPrice"),
      heading: previousPurchasesTranslations("orderedPrice"),
      dataIndex: "unitPrice",
      key: "unitPrice",
      showCurrencyCode: true,
      align: "left",
      render: (unitPrice: number, record: IPurchaseProduct) => (
        <FormatPriceWithCurrencyCode priceRoundOff={Number(dateDetails?.priceRoundOff)} price={unitPrice} currencyCode={record?.currencyCode || "USD"} />
      ),
    },
    {
      title: <p className="">{previousPurchasesTranslations("unitPrice")}</p>,
      heading: previousPurchasesTranslations("unitPrice"),
      dataIndex: "unitPricePurchased",
      key: "unitPricePurchased",
      showCurrencyCode: true,
      align: "left",
      render: (unitPricePurchased: number, record: IPurchaseProduct) =>
        record.unitPricePurchased === null ? (
          <div className="text-red-500">{previousPurchasesTranslations("errorPriceNotSet")}</div>
        ) : (
          <FormatPriceWithCurrencyCode priceRoundOff={Number(dateDetails?.priceRoundOff)} price={unitPricePurchased} currencyCode={record?.currencyCode || "USD"} />
        ),
    },
    {
      title: previousPurchasesTranslations("action"),
      heading: previousPurchasesTranslations("action"),
      dataIndex: "action",
      key: "action",
      displayOnMobile: true,
      align: "left",
      render: (_reorder: number, record: IPurchaseProduct) => {
        const qty = qtyMap[record.productId];
        const validationMsg = validationMessages[record.productId] ?? "";
        const maxQty = record.maxQty ?? 0;
        const minQty = record.minQty ?? 0;

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-start items-start gap-4 mb-2">
              <div className="flex flex-col items-start justify-center gap-2">
                <Input
                  type="number"
                  disabled={
                    (Object.keys(stockMessage).length > 0 && stockMessage[record.productId]?.isInValid) ||
                    record.unitPricePurchased === null ||
                    validationMsg === behaviorMsgTranslations("behaviorErrorMsg")
                  }
                  value={qty}
                  defaultValue={qty}
                  onChange={(e) => handleQtyChange(record.productId, e.target.value, maxQty, minQty)}
                  className="border-gray-200 p-2 w-16 text-center rounded-custom outline-none hover:outline-none hover:border-gray-200 hover:ring-0  focus:outline-none focus:ring-0 focus:border-transparent
    focus-visible:outline-none focus-visible:ring-0 focus-visible:border-transparent"
                  id={`qty-${record.productId}`}
                  dataTestSelector={`txtReOrderQuantity${record?.sku}`}
                />
                {Number(qty) > 0 && !validationMsg && (
                  <Button
                    htmlType="button"
                    className="whitespace-nowrap text-xs p-0"
                    type="link"
                    disabled={(Object.keys(stockMessage).length > 0 && stockMessage[record.productId]?.isInValid) || record.unitPricePurchased === null}
                    onClick={() => {
                      setQtyMap((prev) => ({ ...prev, [record.productId]: "" }));
                      handleQtyChange(record.productId, "", maxQty, minQty);
                      setValidationMessages((prev) => {
                        const newValidation = { ...prev };
                        delete newValidation[record.productId];
                        return newValidation;
                      });
                    }}
                    dataTestSelector={"btnClearQty" + record?.productId}
                  >
                    {previousPurchasesTranslations("clearQty")}
                  </Button>
                )}
              </div>
              <Button
                type="primary"
                dataTestSelector={"btnAddToCart" + record?.productId}
                showLoadingText={true}
                disabled={!!validationMsg || (Object.keys(stockMessage).length > 0 && stockMessage[record.productId]?.isInValid) || record.unitPricePurchased === null}
                loaderColor="currentColor"
                loaderWidth="20px"
                loaderHeight="20px"
                loading={isAddToCartLoading === record.productId}
                onClick={() => {
                  handleSingleAddToCart(record.productId);
                }}
                ariaLabel="Add to Cart"
                className="whitespace-nowrap"
              >
                {commonTranslations("addToCart")}
              </Button>
            </div>
            {validationMsg !== behaviorMsgTranslations("behaviorErrorMsg") && <div className="text-red-500 max-w-[230px]">{validationMsg}</div>}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Heading level="h2" customClass="uppercase" showSeparator name={previousPurchasesTranslations("previousPurchases")} dataTestSelector="hdgPreviousPurchases" />
      <div className="my-2">
        <HeaderBar
          dateDetails={dateDetails}
          handleAddToCart={() => handleAddToCart()}
          moveAllProductToCart={() => handledMoveAllProductToCart()}
          handleSearch={(text: string) => handleSearch(text)}
          handleFilterDayChange={(text: string) => handleFilterDayChange(text)}
        />
      </div>
      <TableWrapper
        isStyle={false}
        customClassName="m-0 p-0 !mt-0 print:border border-red-600"
        isActionPanel={false}
        columns={columns as []}
        loading={loading}
        expandedRowByKey="productId"
        data={items as []}
        isRender={true}
        emptyText={previousPurchasesTranslations("noRecordsFound")}
      />
      {items.length > 0 && <Pagination totalResults={totalResults} onPageSizeChange={onPageSizeChange} onPageIndexChange={onPageIndexChange} />}
      <AddToCartNotification />
    </div>
  );
}

export default PreviousPurchasesList;
