import { IOrderDetails } from "@znode/types/account";
import { Heading } from "../../../common/heading";
import { useTranslationMessages } from "@znode/utils/component";
import { useTranslations } from "next-intl";

export const ViewReceiptDetails = ({ orderData, receiptDate, isFromOrderStatus = false }: { orderData: IOrderDetails; receiptDate: string; isFromOrderStatus?: boolean }) => {
  const orderTranslation = useTranslations("Orders");
  const commonTranslation = useTranslationMessages("Common");
  return (
    <>
      {!isFromOrderStatus && <Heading name={commonTranslation("details")} level="h3" dataTestSelector="hdgDetails" customClass="uppercase" showSeparator />}

      <div className={isFromOrderStatus ? "px-3 pt-0 pb-3" : "p-2"}>
        {orderData?.accountName && (
          <div className="grid grid-cols-12 pb-2">
            <p className="col-span-5 font-medium" data-test-selector="paraDateLabel">
              {commonTranslation("account")}:
            </p>
            <p data-test-selector="paraAccountName" className="col-span-7 px-2">
              {orderData?.accountName}
            </p>
          </div>
        )}
        <div className="grid grid-cols-12 pb-2">
          <p className="col-span-5 font-medium" data-test-selector="paraDateLabel">
            {commonTranslation("date")}:
          </p>
          <p data-test-selector="paraDate" className="col-span-7 px-2">
            {receiptDate ?? "-"}
          </p>
        </div>
        <div className="grid grid-cols-12 pb-2">
          <p className="col-span-5 font-medium" data-test-selector="paraOrderLabel">
            {commonTranslation("order")}:
          </p>
          <p data-test-selector="paraOrderNumber" className="col-span-7 px-2">
            {orderData.orderNumber ?? "-"}
          </p>
        </div>
        <div className="grid grid-cols-12 pb-2">
          <p className="col-span-5 font-medium" data-test-selector="paraOrderStatusLabel">
            {orderTranslation("orderStatus")}:
          </p>
          <p data-test-selector="paraOrderNumber" className="col-span-7 px-2">
            {orderData.orderState ?? "-"}
          </p>
        </div>
        <div className="grid grid-cols-12 pb-2">
          <p className="col-span-5 font-medium" data-test-selector="paraPaymentLabel">
            {commonTranslation("payment")}:
          </p>
          <p data-test-selector="paraPayment" className="col-span-7 px-2">
            {orderData.paymentDisplayName ?? "-"}
          </p>
        </div>
        {orderData.calculateSummary.giftCardAmount && orderData.calculateSummary.giftCardAmount !== 0 ? (
          Array.isArray(orderData.voucherNumber) && orderData.voucherNumber.length > 0 ? (
          <div className="grid grid-cols-12 pb-2">
            <p className="col-span-5 font-medium" data-test-selector="paraVoucherNumberLabel">
              {commonTranslation("voucherNumber")}:
            </p>
            <p data-test-selector="paraVoucherNumber" className="col-span-7 px-2">
              {Array.isArray(orderData.voucherNumber) ? orderData.voucherNumber.join(", ") : orderData.voucherNumber}
            </p>
          </div>
          ) : null
        ) : null}
        <div className="grid grid-cols-12 pb-2">
          <p className="col-span-5 font-medium" data-test-selector="paraTrackingLabel">
            {commonTranslation("trackingNumber")}:
          </p>
          <p data-test-selector="paraTrackingNumber" className="col-span-7 px-2">
            {orderData.trackingNumber ?? "-"}
          </p>
        </div>
        {orderData.jobName ? (
          <div className="grid grid-cols-12 pb-2">
            <p className="col-span-5 font-medium" data-test-selector="paraTrackingLabel">
              {commonTranslation("jobOrProjectName")}:
            </p>
            <p data-test-selector="paraJobName" className="col-span-7 px-2">
              {orderData.jobName ?? "-"}
            </p>
          </div>
        ) : null}
        {((Array.isArray(orderData.couponCode) && orderData.couponCode.length > 0) || (typeof orderData.couponCode === "string" && orderData.couponCode.trim() !== "")) && (
          <div className="grid grid-cols-12 pb-2">
            <p className="col-span-5 font-medium" data-test-selector="paraCouponCodeLabel">
              {commonTranslation("couponCode")}:
            </p>
            <p data-test-selector="paraCouponCode" className="col-span-7 px-2">
              {Array.isArray(orderData.couponCode) ? orderData.couponCode.join(", ") : orderData.couponCode}
            </p>
          </div>
        )}
      </div>
    </>
  );
};
