import { useTranslationMessages } from "@znode/utils/component";

import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import { Heading } from "../../common/heading";
import { IQuoteDetails } from "@znode/types/account";

export const QuoteDetails = ({ quoteDetailsData }: { quoteDetailsData: IQuoteDetails }) => {
  const quoteTranslations = useTranslationMessages("Quote");
  const commonTranslation = useTranslationMessages("Common");

  return (
    <>
      <Heading name={quoteTranslations("quoteDetails")} level="h3" dataTestSelector="hdgQuoteDetails" customClass="uppercase" showSeparator />
      <div>
         {quoteDetailsData?.accountName && (
           <div className="grid grid-cols-12 pb-2">
          <p className="col-span-4 font-medium" data-test-selector="paraQuoteNumberLabel">
              {commonTranslation("account")}:
            </p>
            <p data-test-selector="paraAccountName" className="col-span-7 px-2">
              {quoteDetailsData?.accountName}
            </p>
          </div>
        )}
        <div className="grid grid-cols-12 pb-2">
          <p className="col-span-4 font-medium" data-test-selector="paraQuoteNumberLabel">
            {quoteTranslations("quoteNumber")}:
          </p>
          <p data-test-selector="paraReturnNumber" className="col-span-7 px-2">
            {quoteDetailsData.quoteNumber}
          </p>
        </div>
        <div className="grid grid-cols-12 pb-2">
          <p className="col-span-4 font-medium" data-test-selector="paraQuoteStatusLabel">
            {quoteTranslations("quoteStatus")}:
          </p>
          <p data-test-selector="paraQuoteStatus" className="col-span-7 px-2">
            {quoteDetailsData.classStateName}
          </p>
        </div>
        <div className="grid grid-cols-12 pb-2">
          <p className="col-span-4 font-medium" data-test-selector="paraQuoteDateLabel">
            {quoteTranslations("quoteDate")}:
          </p>
          <p data-test-selector="paraQuoteDate" className="col-span-7 px-2">
            {quoteDetailsData.createdDate}
          </p>
        </div>
        <div className="grid grid-cols-12 pb-2">
          <p className="col-span-4 font-medium" data-test-selector="paraQuoteExpirationDateLabel">
            {quoteTranslations("quoteExpirationDate")}:
          </p>
          <p data-test-selector="paraQuoteExpirationDate" className="col-span-7 px-2">
            {quoteDetailsData.expirationDate}
          </p>
        </div>
        <div className="grid grid-cols-12 pb-2">
          <p className="col-span-4 font-medium" data-test-selector="paraQuoteTotal">
            {quoteTranslations("quoteTotal")}:
          </p>
          <p data-test-selector="paraQuoteTotal" className="col-span-7 px-2">
            {<FormatPriceWithCurrencyCode price={Number(quoteDetailsData?.total) || 0} currencyCode={"USD"} />}
          </p>
        </div>
        <div className="grid grid-cols-12 pb-2">
          <p className="col-span-4 font-medium" data-test-selector="paraQuoteCreatedByLabel">
            {quoteTranslations("quoteCreatedBy")}:
          </p>
          <p data-test-selector="paraQuoteCreatedBy" className="col-span-7 px-2 md:pt-0 md:px-2 print:pt-0 break-words whitespace-normal">
            {quoteDetailsData.userName ?? "-"}
          </p>
        </div>
        {quoteDetailsData.jobName ? (
          <div className="grid grid-cols-12 pb-2">
            <p className="col-span-4 font-medium" data-test-selector="paraQuoteCreatedByLabel">
              {quoteTranslations("jobOrProjectName")}:
            </p>
            <p data-test-selector="paraQuoteCreatedBy" className="col-span-7 px-2">
              {quoteDetailsData.jobName || "-"}
            </p>
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
};
