import { FormatPriceWithCurrencyCode } from "../../../common/format-price/FormatPrice";
import { IReceiptSummary } from "@znode/types/order";
import React from "react";
import { useTranslationMessages } from "@znode/utils/component";

function ReturnDetails({ returnDetails, priceRoundOff }: Readonly<{ returnDetails: IReceiptSummary; priceRoundOff:number }>) {
  const returnOrderTranslations = useTranslationMessages("ReturnOrder");
  return (
    <>
      <h2 className="text-lg font-semibold uppercase tracking-wide border-b pb-2 mb-2" data-test-selector="hdgReturnDetails">
        {returnOrderTranslations("returnDetails")}
      </h2>
      <div className="p-2">
        <div className="flex pb-2">
          <p className="font-medium w-40" data-test-selector="paraReturnNumberLabel">
            {returnOrderTranslations("returnNumber")}
          </p>
          <p data-test-selector="paraReturnNumber" className="flex items-center">
            : <div className="ml-1">{returnDetails.classNumber}</div>
          </p>
        </div>
        <div className="flex pb-2">
          <p className="font-medium w-40" data-test-selector="paraReturnDateLabel">
            {returnOrderTranslations("returnDate")}
          </p>
          <p className="flex items-center" data-test-selector="paraReturnDate">
            : <div className="ml-1"> {returnDetails.createdDate} </div>
          </p>
        </div>
        <div className="flex pb-2">
          <p className="font-medium w-40" data-test-selector="paraReturnStatusLabel">
            {returnOrderTranslations("returnStatus")}
          </p>
          <p className="flex items-center" data-test-selector="paraReturnStatus">
            : <div className="ml-1">{returnDetails.classStateName}</div>
          </p>
        </div>
        <div className="flex pb-2">
          <p className="font-medium w-40" data-test-selector="paraExpectedQtyLabel">
            {returnOrderTranslations("totalExpectedQty")}
          </p>
          <p className="flex items-center" data-test-selector="paraExpectedQty">
            :<div className="ml-1">{returnDetails.totalQty}</div>
          </p>
        </div>
        <div className="flex pb-2">
          <p className="font-medium w-40" data-test-selector="paraReturnTotalLabel">
            {returnOrderTranslations("returnTotal")}
          </p>
          <p className="flex items-center" data-test-selector="paraReturnTotal">
            :
            <div className="ml-1">
              <FormatPriceWithCurrencyCode priceRoundOff={priceRoundOff} price={returnDetails.totalReturnAmount} currencyCode={"USD"} />
            </div>
          </p>
        </div>
        <div className="flex pb-2">
          <p className="font-medium w-40" data-test-selector="paraOrderNumberLabel">
            {returnOrderTranslations("orderNumber")}
          </p>
          <p className="flex items-center" data-test-selector="paraOrderNumber">
            :<div className="ml-1">{returnDetails.linkedClassNumber}</div>
          </p>
        </div>
      </div>
    </>
  );
}

export default ReturnDetails;
