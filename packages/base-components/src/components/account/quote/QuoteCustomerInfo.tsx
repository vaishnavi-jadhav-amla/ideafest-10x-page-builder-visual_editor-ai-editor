import { Heading } from "../../common/heading";
import { IQuoteDetails } from "@znode/types/account";
import { useTranslationMessages } from "@znode/utils/component";

export const QuoteCustomerInfo = ({ quoteDetailsData }: { quoteDetailsData: IQuoteDetails }) => {
  const quoteTranslations = useTranslationMessages("Quote");
  const commonTranslation = useTranslationMessages("Common");

  return (
    <>
      <Heading name={quoteTranslations("customerInformation")} level="h3" dataTestSelector="hdgCustomerInfo" customClass="uppercase" showSeparator />

      <div>
        <div className="grid grid-cols-12 pb-2">
          <p className="col-span-4 font-medium" data-test-selector="paraCustomerNameLabel">
            {quoteTranslations("customerName")}:
          </p>
          <p data-test-selector="paraCustomerName" className="col-span-7 px-2">
            {quoteDetailsData.createdByFullName ?? "-"}
          </p>
        </div>
        <div className="grid grid-cols-12 pb-2">
          <p className="col-span-4 font-medium" data-test-selector="paraEmailLabel">
            {commonTranslation("email")}:
          </p>
          <p data-test-selector="paraEmail" className="col-span-7 px-2">
            {quoteDetailsData.userName}
          </p>
        </div>
        <div className="grid grid-cols-12 pb-2">
          <p className="col-span-4 font-medium" data-test-selector="paraPhoneNumberLabel">
            {quoteTranslations("phoneNumber")}:
          </p>
          <p data-test-selector="paraPhoneNumber" className="col-span-7 px-2">
            {quoteDetailsData.phoneNumber ?? "-"}
          </p>
        </div>
      </div>
    </>
  );
};
