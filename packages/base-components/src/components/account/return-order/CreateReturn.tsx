"use client";

import { IRequestProductReturnDetails, IReturnCalculateResponse, IReturnDetails, IReturnProductList, IReturnReason } from "@znode/types/order";
import React, { useEffect, useState } from "react";
import { getCalculationDetails, getOrderDetailsByClassNumber } from "../../../http-request/order/order";
import { useRouter, useSearchParams } from "next/navigation";

import { BreadCrumbs } from "../../common/breadcrumb/BreadCrumbs";
import Button from "../../common/button/Button";
import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import { Heading } from "../../common/heading";
import Link from "next/link";
import { LoaderComponent } from "../../common/loader-component";
import OrderNumberSelection from "./OrderNumberSelection";
import ReturnProductActions from "./ReturnProductActions";
import ReturnProductList from "./ReturnProductList";
import ReturnProductTotal from "./ReturnProductTotal";
import { useTranslationMessages } from "@znode/utils/component";
import { useUser } from "../../../stores/user-store";

function CreateReturn({ isEditable, orderNumber, isGuest = false }: { isEditable: boolean; orderNumber: string; isGuest?: boolean }) {
  const commonTranslations = useTranslationMessages("Common");
  const returnOrderTranslations = useTranslationMessages("ReturnOrder");
  const { user } = useUser();
  const [calculateDetails, setCalculateDetails] = useState<IReturnCalculateResponse | null>({
    returnTotal: 0,
    returnSubTotal: 0,
    returnTaxCost: 0,
    returnShippingCost: 0,
    cultureCode: "",
    discount: 0,
    csrDiscount: 0,
    returnShippingDiscount: 0,
    returnCharges: 0,
    voucherAmount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [note, setNote] = useState<string>("");
  const [reasonList, setReasonList] = useState<IReturnReason[]>([]);
  const [returnDetails, setReturnDetails] = useState<IReturnDetails>({
    classNumber: null,
    convertedClassNumber: null,
    classType: null,
    orderNumber: null,
    note: null,
    orderStatus: null,
    orderDate: null,
    orderTotal: null,
    currencyCode: null,
    currencySuffix: null,
    total: 0,
    isEligible: false,
    isValidOrderNumber: false,
    priceRoundOff: 2,
    userId: 0,
  });
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);
  const [productList, setProductList] = useState<IReturnProductList[]>([]);
  const params = useSearchParams();
  const router = useRouter();
  const [requestLineItems, setRequestLineItems] = useState<IRequestProductReturnDetails[]>([]);

  const onChangeReasonForReturn = (reasonForReturnId: string, product: IReturnProductList, reason: string) => {
    setRequestLineItems((prevItems: IRequestProductReturnDetails[]) => {
      const updatedItems = prevItems.map((item: IRequestProductReturnDetails) =>
        item.lineItemId === product.productId ? { ...item, reasonCode: String(reasonForReturnId) } : item
      );
      if (!updatedItems.some((item: IRequestProductReturnDetails) => item.lineItemId === product.productId)) {
        updatedItems.push({
          lineItemId: product.productId,
          calculateId: product.calculateId,
          reasonCode: String(reasonForReturnId),
          quantity: Number(product.expectedReturnQuantity),
          reasonForReturn: reason,
        });
      }

      return updatedItems;
    });
  };

  const onChangeQuantity = (expectedReturnQuantity: string, product: IReturnProductList) => {
    if (String(expectedReturnQuantity) === "" || String(expectedReturnQuantity).match(/\D/g)) {
      setProductList((prevItems) => {
        return prevItems.map((item) =>
          item.sku === product.sku && item.calculateId === product.calculateId
            ? {
                ...item,
                quantity: expectedReturnQuantity === "" ? Number(0) : "",
                validationMessage: returnOrderTranslations("invalidQuantityMessage"),
              }
            : item
        );
      });
    } else if (Number(expectedReturnQuantity) > product.availableQty) {
      setProductList((prevItems) => {
        return prevItems.map((item) =>
          item.sku === product.sku && item.calculateId === product.calculateId
            ? {
                ...item,
                quantity: Number(expectedReturnQuantity),
                validationMessage: returnOrderTranslations("quantityMessage"),
              }
            : item
        );
      });
    } else {
      setRequestLineItems((prevItems) => {
        const updatedItems = prevItems.map((item) => (item.lineItemId === product.productId ? { ...item, quantity: Number(expectedReturnQuantity) } : item));
        if (!updatedItems.some((item) => item.lineItemId === product.productId)) {
          updatedItems.push({
            lineItemId: product.productId,
            calculateId: product.calculateId,
            reasonCode: product.reasonCode || reasonList[0].reasonCode,
            quantity: Number(expectedReturnQuantity) || 0,
            reasonForReturn: (product.reason as string) || reasonList[0].reason,
          });
        }
        return updatedItems;
      });
      setProductList((prevItems) => {
        return prevItems.map((item) =>
          item.sku === product.sku && item.calculateId === product.calculateId
            ? {
                ...item,
                quantity: Number(expectedReturnQuantity),
                totalPrice: Number(expectedReturnQuantity) * product.unitPrice,
                validationMessage: null,
              }
            : item
        );
      });
    }
  };

  const orderDetailsByClassNumber = async () => {
    let result;
    if (isEditable) {
      result = await getOrderDetailsByClassNumber("Returns", params.get("returnNumber") ?? "", selectedOrderNumber as string);
    } else {
      result = await getOrderDetailsByClassNumber("Orders", selectedOrderNumber ?? "", "");
    }
    if (!result.isMatch && isEditable) {
      isGuest && (user?.userId ?? 0) === 0 ? router.push("/") : router.push("/account/return-order");
    }
    if (result.orderNumber) {
      setReasonList(result.reasonList as IReturnReason[]);
      setProductList(result.productList as IReturnProductList[]);
      setReturnDetails({
        userId: result.userId,
        classNumber: result.classNumber,
        classType: result.classType,
        orderNumber: result.classNumber,
        orderStatus: result.orderStatus,
        orderDate: result.orderDate,
        note: result.note as string,
        orderTotal: String(result.orderTotal),
        currencyCode: result.currencyCode,
        currencySuffix: result.currencySuffix,
        total: result.total,
        convertedClassNumber: result.convertedClassNumber,
        isEligible: result.isEligible,
        isValidOrderNumber: result.isValidOrderNumber,
        priceRoundOff: result.priceRoundOff,
      });
      setNote(result.note as string);
    } else {
      isGuest && (user?.userId ?? 0) === 0 && router.push("/");
    }
    setCalculateDetails({
      returnTotal: 0,
      returnSubTotal: 0,
      returnTaxCost: 0,
      returnShippingCost: 0,
      cultureCode: "",
      discount: 0,
      csrDiscount: 0,
      returnShippingDiscount: 0,
      returnCharges: 0,
      voucherAmount: 0,
    });
    setIsLoading(false);
  };

  const isValidateLineItemsValidationMessage = () => {
    if (productList.length === 0) {
      return false;
    }
    return productList.some((item) => Number(item.validationMessage?.length) > 0);
  };

  useEffect(() => {
    isEditable && handleChangeOrderNumber(orderNumber);
    !isEditable && orderNumber.length > 0 && selectedOrderNumber === null && handleChangeOrderNumber(orderNumber);
    selectedOrderNumber && orderDetailsByClassNumber();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrderNumber]);

  const handleChangeOrderNumber = (orderNumber: string) => {
    setIsLoading(true);
    setSelectedOrderNumber(orderNumber);
  };

  const calculationDetails = async () => {
    const requestBody = {
      classNumber: selectedOrderNumber as string,
      returnCalculateLineItem: requestLineItems
        .map((item) => ({
          lineItemId: item.calculateId,
          reasonCode: item.reasonCode,
          expectedReturnQuantity: item.quantity,
          reasonForReturn: item.reasonForReturn,
        }))
        .filter((item) => item.expectedReturnQuantity > 0),
    };
    if (requestBody.returnCalculateLineItem.length > 0) {
      const response = await getCalculationDetails(requestBody);
      setCalculateDetails(response);
    } else {
      setCalculateDetails({
        returnTotal: 0,
        returnSubTotal: 0,
        returnTaxCost: 0,
        returnShippingCost: 0,
        cultureCode: "",
        discount: 0,
        csrDiscount: 0,
        returnShippingDiscount: 0,
        returnCharges: 0,
        voucherAmount: 0,
      });
    }
  };

  const handledEditPage = () => {
    const editedProductList = productList.map((items) => {
      return {
        lineItemId: items.productId,
        calculateId: items.calculateId,
        reasonCode: items.reasonCode || reasonList[0].reasonCode,
        quantity: Number(items.editQty) || 0,
        reasonForReturn: (items.reasonCode as string) || reasonList[0].reasonCode,
      };
    });
    requestLineItems.length === 0 && setRequestLineItems(editedProductList);
  };

  useEffect(() => {
    requestLineItems.length > 0 && calculationDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestLineItems]);
  useEffect(() => {
    isEditable && handledEditPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productList]);

  const renderContent = () => {
    if (isLoading && selectedOrderNumber) {
      return (
        <div className="mb-5 h-[50vh] w-full flex items-center justify-center">
          <LoaderComponent isLoading={isLoading} loaderText="Not Eligible for return" />
        </div>
      );
    }

    if (selectedOrderNumber) {
      return (
        <div>
          <div className="flex flex-col md:flex-row border-b p-2 py-5 text-sm">
            <label className="mr-6 font-semibold uppercase whitespace-nowrap" data-test-selector="lblOrderDetails">
              {returnOrderTranslations("orderDetails")} :
            </label>
            <div className="p-0 mt-4 md:mt-0 md:flex text-sm items-center flex-wrap gap-2">
              <div className="flex">
                <p className="font-medium min-w-28 md:min-w-12 whitespace-nowrap" data-test-selector="paraOrderNumberTitle">
                  {returnOrderTranslations("orderNumber")}
                </p>
                <p className="whitespace-nowrap mr-0 md:mr-3 flex">
                  :
                  {(user?.userId ?? 0) > 0 ? (
                    <Link
                      className="text-blue-600 underline ml-3"
                      href={`/account/order/details/${selectedOrderNumber}?receiptModule=true`}
                      data-test-selector="linkOrderNumber"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selectedOrderNumber}
                    </Link>
                  ) : (
                    <p className="ml-2" data-test-selector="paraOrderNumber">
                      {selectedOrderNumber}
                    </p>
                  )}
                </p>
              </div>
              <div className="flex mt-2 md:mt-0 items-start mr-0 md:mr-3">
                <p className="font-medium  min-w-28 md:min-w-12 whitespace-nowrap" data-test-selector="paraOrderDateTitle">
                  {returnOrderTranslations("orderDate")}
                </p>
                <p className="flex" data-test-selector="paraOrderDate">
                  : <div className="ml-3">{returnDetails.orderDate}</div>
                </p>
              </div>
              <div className="flex mt-2 md:mt-0 items-start">
                <p className="font-medium min-w-28 md:min-w-12 md:ml-0 whitespace-nowrap" data-test-selector="paraOrderTotalTitle">
                  {returnOrderTranslations("orderTotal")}
                </p>
                <p className="flex" data-test-selector="paraOrderTotal">
                  :
                  <div className="ml-3">
                    <FormatPriceWithCurrencyCode
                      priceRoundOff={returnDetails.priceRoundOff}
                      currencyCode={(returnDetails.currencyCode as string) || "USD"}
                      price={Number(returnDetails.orderTotal)}
                    />
                  </div>
                </p>
              </div>
            </div>
          </div>

          <div className="border-b text-sm" data-test-selector="divReturnOrder">
            <ReturnProductList
              priceRoundOff={returnDetails.priceRoundOff}
              isOrderNumberValid={returnDetails.isValidOrderNumber}
              isUpdate={requestLineItems.length > 0}
              productList={productList}
              reasonList={reasonList}
              onChangeReasonForReturn={(id, product, reason) => onChangeReasonForReturn(id, product, reason)}
              isEditable={isEditable}
              onChangeQuantity={(quantity, product) => onChangeQuantity(quantity, product)}
            />
          </div>
          <ReturnProductTotal priceRoundOff={returnDetails.priceRoundOff} calculateDetails={calculateDetails} currencyCode={(returnDetails.currencyCode as string) || "USD"} />
        </div>
      );
    }
    return "";
  };

  const breadCrumbsData = {
    title: returnOrderTranslations("createReturn"),
    routingLabel: "Home",
    routingPath: "/",
  };

  const isValidLineItemQty =
    isEditable && requestLineItems.length === 0 ? productList.some((item) => Number(item.editQty) > 0) : requestLineItems.some((item) => item.quantity > 0) || false;

  return (
    <>
      {isGuest && (user?.userId ?? 0) === 0 && <BreadCrumbs customPath={breadCrumbsData} />}
      <Heading
        level="h2"
        customClass="uppercase"
        showSeparator
        name={isEditable ? returnOrderTranslations("editReturn") : returnOrderTranslations("createReturn")}
        dataTestSelector="hdgReturnOrderHistory"
      />
      {!(returnDetails.isEligible && returnDetails.isValidOrderNumber) && selectedOrderNumber && !isLoading && (
        <div className="text-red-500 p-2 w-full text-center text-base bg-red-100">{returnOrderTranslations("orderNotEligible")}</div>
      )}
      <div className="border mt-4 ">
        <div className="text-right flex md:text-left flex-col md:flex-row md:flex md:items-start justify-between border-b p-2 bg-[#f3f4f6]">
          <div>
            <div className="flex flex-wrap items-center gap-2 md:w-full max-w-fit">
              <div className="uppercase text-left md:text-left" data-test-selector="divSelectYourOrderNumber">
                <span className="font-medium"> {returnOrderTranslations("selectYourOrderNumber")}</span>
              </div>
              <div className="w-52 md:w-64 text-left" data-test-selector="divTypeHeadOrderNumber">
                <OrderNumberSelection handleChangeOrderNumber={handleChangeOrderNumber} disabled={isEditable || isGuest} defaultSelection={selectedOrderNumber as string} />
              </div>
            </div>
          </div>
          <Button
            onClick={() => window.history.back()}
            className="tracking-wider text-sm ml-3 mt-2 md:mt-0 w-24"
            type="secondary"
            ariaLabel="back edit address button"
            dataTestSelector="btnCancel"
          >
            {commonTranslations("cancel")}
          </Button>
        </div>
        {renderContent()}
      </div>
      {!isLoading && selectedOrderNumber && (
        <>
          <div className="mt-4">
            <div className="font-bold mb-2" data-test-selector="divCreateReturnNotes">
              {commonTranslations("notes")}
            </div>
            <div>
              <textarea
                className="border p-2 w-full"
                disabled={!returnDetails.isValidOrderNumber}
                onChange={(e) => setNote(e.target.value)}
                defaultValue={returnDetails.note as string}
                aria-label="Notes"
                data-test-selector="textAreaReturnList"
              />
            </div>
          </div>
          {returnDetails.orderStatus !== "SUBMITTED" && (
            <ReturnProductActions
              userId={returnDetails.userId}
              isValid={!(returnDetails.isEligible && returnDetails.isValidOrderNumber)}
              isValidLineItems={isValidateLineItemsValidationMessage()}
              note={note}
              isEditable={isEditable}
              orderNumber={selectedOrderNumber}
              convertedClassNumber={returnDetails.classNumber as string}
              requestLineItems={requestLineItems}
              isGuest={isGuest}
              isValidInputQty={isValidLineItemQty}
            />
          )}
        </>
      )}
    </>
  );
}

export default CreateReturn;
