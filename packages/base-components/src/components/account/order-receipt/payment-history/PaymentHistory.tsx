"use client";

import { Heading } from "../../../common/heading";
import { FormatPriceWithCurrencyCode } from "../../../common/format-price";
import { IPaymentHistory } from "@znode/types/account";
import { useTranslationMessages } from "@znode/utils/component";

const PaymentHistory = ({ paymentHistoryList, currencyCode }: { paymentHistoryList: IPaymentHistory[]; currencyCode?: string }) => {
  const commonTranslations = useTranslationMessages("Common");

  const renderOrderListItems = (paymentHistory: IPaymentHistory, i: number) => {
    return (
      <div className="grid grid-cols-10 gap-4 border-b border-zinc-300 py-4" key={i} data-test-selector="divPaymentHistoryContainer">
        <div className="col-span-2">
          <p className="text-sm" data-test-selector={`paraTransactionDate${i}`}>
            {paymentHistory.paymentDate}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-sm" data-test-selector={`paraPaymentType${i}`}>
            {paymentHistory.subTypeDisplayName}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-sm" data-test-selector={`paraPaymentStatus${i}`}>
            {commonTranslations("pending")}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-sm" data-test-selector={`paraPaymentAmount${i}`}>
            <FormatPriceWithCurrencyCode
              price={(paymentHistory?.paidAmount && Number(paymentHistory.paidAmount)) || 0}
              currencyCode={(currencyCode && String(currencyCode)) || "USD"}
            />
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-sm" data-test-selector={`paraPaymentRemainingAmount${i}`}>
            <FormatPriceWithCurrencyCode
              price={(paymentHistory?.remainingOrderAmount && Number(paymentHistory.remainingOrderAmount)) || 0}
              currencyCode={(currencyCode && String(currencyCode)) || "USD"}
            />
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <Heading name={commonTranslations("paymentHistory")} level="h3" customClass="xs:w-auto uppercase" dataTestSelector="hdgPaymentHistory" showSeparator />
      <div className="grid grid-cols-10 gap-4" data-test-selector="divTitleContainer">
        <div className="col-span-2">
          <p className="text-sm text-gray-600 font-semibold" data-test-selector="paraTitleOrderDate">
            {commonTranslations("date")}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-sm text-gray-600 font-semibold" data-test-selector="paraTitlePaymentType">
            {commonTranslations("paymentType")}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-sm text-gray-600 font-semibold" data-test-selector="paraTitlePaymentStatus">
            {commonTranslations("status")}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-sm text-gray-600 font-semibold" data-test-selector="paraTitleAmount">
            {commonTranslations("amount")}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-sm text-gray-600 font-semibold" data-test-selector="paraTitleAmountRemaining">
            {commonTranslations("remainingAmount")}
          </p>
        </div>
      </div>
      <div className="col-span-1"></div>
      {paymentHistoryList && paymentHistoryList?.map((paymentHistory: IPaymentHistory, i: number) => renderOrderListItems(paymentHistory, i))}
    </>
  );
};

export default PaymentHistory;
