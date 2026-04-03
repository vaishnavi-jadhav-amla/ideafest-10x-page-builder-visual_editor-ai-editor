import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import { Heading } from "../../common/heading/Heading";
import { IOrderDetails } from "@znode/types/account";
import { useTranslations } from "next-intl";

export const PendingOrderDetails = ({ pendingOrderDetails }: { pendingOrderDetails: IOrderDetails }) => {
  const pendingOrderTranslation = useTranslations("ApprovalRouting");
  const orderTranslation = useTranslations("Orders");

  return (
    <>
      <Heading
        name={pendingOrderTranslation("pendingOrderDetails")}
        customClass="uppercase"
        tracking-wide
        showSeparator
        level="h3"
        dataTestSelector="hdgPendingOrderDetails"
      />
      <div className="p-2">
        <div className="flex pb-2">
          <p className="w-48 font-medium" data-test-selector="paraPendingOrderNumber">
            {pendingOrderTranslation("pendingOrderNumber")} :
          </p>
          <p data-test-selector="paraPendingOrderNumber">{pendingOrderDetails.orderNumber}</p>
        </div>
        <div className="flex pb-2">
          <p className="w-48 font-medium" data-test-selector="paraPendingOrderStatus">
            {pendingOrderTranslation("orderStatus")} :
          </p>
          <p data-test-selector="paraPendingOrderStatus">{pendingOrderDetails?.orderState}</p>
        </div>
        <div className="flex pb-2">
          <p className="w-48 font-medium" data-test-selector="paraPendingOrderDate">
            {pendingOrderTranslation("pendingOrderDate")} :
          </p>
          <p data-test-selector="paraPendingOrderDate">{pendingOrderDetails.createdDate || "-"}</p>
        </div>
        <div className="flex pb-2">
          <p className="w-48 font-medium" data-test-selector="paraPendingOrderTotal">
            {pendingOrderTranslation("pendingOrderTotal")} :
          </p>
          <p data-test-selector="paraPendingOrderTotal">
            <FormatPriceWithCurrencyCode price={Number(pendingOrderDetails.total) || 0} currencyCode={"USD"} />
          </p>
        </div>
        <div className="flex pb-2">
          <p className="w-48 font-medium" data-test-selector="paraPaymentType">
            {pendingOrderTranslation("paymentType")} :
          </p>
          <p data-test-selector="paraPaymentType">{pendingOrderDetails?.paymentDisplayName}</p>
        </div>
        {pendingOrderDetails?.finalClassNumber && (
          <div className="flex pb-2">
            <p className="w-48 font-medium" data-test-selector="paraPaymentTrackingNumber">
              Payment Tracking Number :
            </p>
            <p data-test-selector="paraPaymentTrackingNumber">
              {pendingOrderDetails.finalClassNumber}
            </p>
          </div>
        )}
        <div className="flex pb-2">
          <p className="w-48 font-medium" data-test-selector="paraShippingMethod">
            {orderTranslation("shippingMethod")} :
          </p>
          <p data-test-selector="paraShippingMethod">{pendingOrderDetails?.shippingTypeName || "-"}</p>
        </div>

        <div className="flex pb-2">
          <p className="w-48 font-medium" data-test-selector="paraJobName">
            {pendingOrderTranslation("jobName")} :
          </p>
          <p data-test-selector="paraJobName">{pendingOrderDetails?.jobName || "-"}</p>
        </div>
      </div>
    </>
  );
};
