"use client";

import { IApproverButtonStates, IApproverList, IOrderDetails } from "@znode/types/account";
import { ORDER, ORDER_DATA_TYPE } from "@znode/constants/order";
import { copyOrderDetails, updateOrderStatus } from "../../../http-request/account";
import { useEffect, useState } from "react";

import Button from "../../common/button/Button";
import { CHECKOUT } from "@znode/constants/checkout";
import DisplayAddress from "../../address/display/DisplayAddress";
import { Heading } from "../../common/heading";
import Link from "next/link";
import { LoadingSpinnerComponent } from "../../common/icons";
import { Modal } from "../../common/modal/Modal";
import { PENDING_APPROVAL_STATUS } from "@znode/constants/pending-order";
import { PendingOrderDetails } from "./PendingOrderDetails";
import { PendingOrderReceiptSummary } from "./PendingOrderReceiptSummary";
import ReceiptTotal from "../order-receipt/receipt-total/ReceiptTotal";
import { getApproverActions } from "../../../http-request/account/pending-order/approver-actions/approver-actions";
import { getApproverList } from "../../../http-request/account/pending-order/approver-list/approver-list";
import { getCookie } from "@znode/utils/component";
import { getSavedUserSessionCallForClient } from "@znode/utils/common";
import { pendingOrderDetails } from "../../../http-request/account/pending-order/pending-order-details/pending-order-details";
import { capturePayment } from "../../../http-request/account/pending-order/capture-payment/capture-payment";
import { voidPayment } from "../../../http-request/account/pending-order/void-payment/void-payment";
import { useModal } from "../../../stores/modal";
import { useRouter } from "next/navigation";
import { useToast } from "../../../stores/toast";
import { useTranslations } from "next-intl";
import { getPaymentConfigurationsByCode } from "../../../http-request/index";
import { PAYMENT_PLUGIN, PAYMENT_STATUS, PAYMENT_SUBTYPE, PAYMENT_SETTING } from "@znode/constants/payment";
// eslint-disable-next-line no-unused-vars, max-lines-per-function
export const PendingOrderReceipt = ({
  orderNumber,
  isPendingPayment,
  receiptModule,
  isSeeApproverHistoryEnabled = false,
}: {
  orderNumber: string;
  isPendingPayment: boolean;
  receiptModule: boolean;
  isSeeApproverHistoryEnabled?: boolean;
}) => {
  const [comment, setComment] = useState<string>("");
  const { openModal } = useModal();
  const DynamicElementText = {
    subHeading: "SUB_HEADING",
    heading: "HEADING",
    title: "TITLE",
  };

  const pendingOrderTranslation = useTranslations("ApprovalRouting");
  const commonTranslation = useTranslations("Common");
  const orderTranslation = useTranslations("Orders");

  const router = useRouter();
  const { error, success } = useToast();

  const [receiptData, setReceiptData] = useState<IOrderDetails | null>(null);
  const [approverList, setApproverList] = useState<IApproverList[]>();
  const [isApproverHistoryLoading, setIsApproverHistoryLoading] = useState<boolean>(false);
  const [approveLoading, setApproveLoading] = useState<boolean>(false);
  const [rejectLoading, setRejectLoading] = useState<boolean>(false);
  const [convertToOrderLoading, setConvertToOrderLoading] = useState<boolean>(false);
  const [captureRequired, setCaptureRequired] = useState<boolean>(false);
  const [voidRequired, setVoidRequired] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | undefined>("");
  const [loading, setLoading] = useState(true);
  const [actionButtons, setActions] = useState<IApproverButtonStates>();
  const [orderId, setOrderId] = useState<string>("");
  const shippingConstraint = receiptData?.shippingConstraintCode
    ? receiptData.shippingConstraintCode === CHECKOUT.SHIP_COMPLETE
      ? orderTranslation("shipComplete")
      : orderTranslation("shipPartial")
    : "-";

  const fetchDetails = async () => {
    const pendingOrderID = orderNumber && orderNumber !== "" ? orderNumber : (orderId && orderId !== "" && orderId) || "";
    const pendingOrderNumber = pendingOrderID !== "" ? pendingOrderID : getCookie(ORDER.USER_PENDING_ORDER_RECEIPT_ORDER_ID) || "";
    setOrderId(pendingOrderNumber);
    const orderDetails = await pendingOrderDetails({ orderType: ORDER_DATA_TYPE.APPROVAL_ROUTING, orderNumber: pendingOrderNumber });
    if (orderDetails?.classNumber === "" || orderDetails === undefined) router.push("/404");
    if (orderDetails) setReceiptData(orderDetails);
    if (orderDetails) {
      if (orderDetails.paymentStatusCode?.toLowerCase() === PAYMENT_STATUS.AUTHORIZED.toLowerCase() && orderDetails.paymentSubTypeCode.toLowerCase() === PAYMENT_SUBTYPE.CREDIT_CARD.toLowerCase()) {
        setVoidRequired(true);
        const configurationSet = await getPaymentConfigurationsByCode({ configurationSetCode: orderDetails.configurationSetCode as string });
        if (configurationSet?.pluginName && configurationSet?.pluginName?.toLowerCase() === PAYMENT_PLUGIN.SPREEDLY.toLowerCase()) {
          if (configurationSet.creditCardVerification === PAYMENT_SETTING.AUTHORIZE_AND_CAPTURE || configurationSet.creditCardVerification === PAYMENT_SETTING.VERIFY_AUTHORIZE_AND_CAPTURE) {
            setCaptureRequired(true);
          }
        }
        else if (configurationSet?.isCapture === true) {
          setCaptureRequired(true);
        }
      }
    }
    setLoading(false);
  };

  async function getUserName() {
    const currentUser = await getSavedUserSessionCallForClient();
    setUserName(currentUser?.userName);
  }

  const getApproverListFunction = async () => {
    setIsApproverHistoryLoading(true);
    const approverList = await getApproverList({ orderNumber: orderNumber });
    setApproverList(approverList);
    setIsApproverHistoryLoading(false);
  };

  const getApproverActionButtons = async () => {
    const actionButtons = await getApproverActions(orderNumber);
    setActions(actionButtons);
  };

  useEffect(() => {
    fetchDetails();
    getUserName();
    getApproverActionButtons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <LoadingSpinnerComponent minHeight="min-h-[50vh]" />;
  }

  const customOrderSummaryTableData = {
    cols: {
      hideItem: true,
      hideDescription: true,
      hideQty: true,
      hideShipping: true,
      hidePrice: true,
      hideTotal: true,
      hideStatus: true,
      hideTracking: true,
      custom: {
        showShipping: true,
        descriptionColSize: 4,
        label: {
          item: "Items",
          description: "Description",
          shipping: "Shipping",
          quantity: "Qty",
          price: "Price",
          totalPrice: "TotalPrice",
        },
      },
      count: 10,
    },
    hideReOrder: true,
  };

  const callSeeApproverHistory = async () => {
    setIsApproverHistoryLoading(true);
    try {
      await getApproverListFunction();
    } finally {
      openModal("SeeApproverHistory");
    }
  };

  const getPendingPaymentData = (elements: string) => {
    let elementsText = "";
    const isPaymentPending = isPendingPayment;

    switch (elements) {
      case DynamicElementText.subHeading:
        elementsText = isPaymentPending ? "greetingsPendingPaymentRequestDetails" : "greetingsOrderRequestDetails";
        break;
      case DynamicElementText.heading:
        elementsText = isPaymentPending ? "greetingsPendingPaymentRequest" : "greetingsOrderRequest";
        break;
      case DynamicElementText.title:
        elementsText = isPaymentPending ? "greetingsPendingPayment" : "greetingsPendingOrder";
        break;
    }
    return pendingOrderTranslation(elementsText);
  };

  const approveButtonOnClick = async () => {
    setApproveLoading(true);
    let response;
    if (receiptData) {
      response = await updateOrderStatus({ orderType: ORDER_DATA_TYPE.APPROVAL_ROUTING, orderNumber: orderNumber, status: "APPROVED" });
    }
    setApproveLoading(false);
    if (response?.isSuccess) {
      router.push("/account/pending-order/list");
      success(pendingOrderTranslation("recordUpdatedSuccessfully"));
    } else {
      error(pendingOrderTranslation("errorInUpdatingRecord"));
    }
  };

  const rejectButtonOnClick = async () => {
    setRejectLoading(true);
    let response;
    if (voidRequired === true) {
      const voidResponse = await voidPayment({ configurationSetCode: receiptData?.configurationSetCode as string, orderType: ORDER_DATA_TYPE.APPROVAL_ROUTING, orderNumber: orderNumber });
      if (voidResponse.isSuccess !== true) {
        error(pendingOrderTranslation("errorInVoidingPayment"));
        setConvertToOrderLoading(false);
        return;
      }
    }
    if (receiptData) {
      response = await updateOrderStatus({ orderType: ORDER_DATA_TYPE.APPROVAL_ROUTING, orderNumber: orderNumber, status: "REJECTED" });
    }
    setRejectLoading(false);
    if (response?.isSuccess) {
      router.push("/account/pending-order/list");
      success(pendingOrderTranslation("recordUpdatedSuccessfully"));
    } else {
      error(pendingOrderTranslation("errorInUpdatingRecord"));
    }
  };

  const convertToOrder = async () => {
    setConvertToOrderLoading(true);
    if (captureRequired === true) {
      const response = await capturePayment({ configurationSetCode: receiptData?.configurationSetCode as string, orderType: ORDER_DATA_TYPE.APPROVAL_ROUTING, orderNumber: orderNumber });
      if (response.isSuccess !== true) {
        error(pendingOrderTranslation("errorInCapturingPayment"));
        setConvertToOrderLoading(false);
        return;
      }
    }
    await updateOrderStatus({ orderType: ORDER_DATA_TYPE.APPROVAL_ROUTING, orderNumber: orderNumber, status: "APPROVED" });
    const order = await copyOrderDetails({ orderType: ORDER_DATA_TYPE.APPROVAL_ROUTING, orderNumber: orderNumber });
    setConvertToOrderLoading(false);
    if (order.isSuccess) {
      router.push("/account/pending-order/list");
      success(pendingOrderTranslation("recordUpdatedSuccessfully"));
    } else {
      error(pendingOrderTranslation("errorInUpdatingRecord"));
    }
  };

  const approvalSection = (receiptData: IOrderDetails) => {
    return (
      <div className="p-2 mx-2 my-4 border-t border-cardBorderColor rounded-cardBorderRadius">
        {receiptData?.userName !== userName && receiptData?.orderState === ORDER.PENDING_APPROVAL && (
          <>
            <label className="text-lg font-semibold tracking-wide uppercase" data-test-selector="lblApproverComments">
              {pendingOrderTranslation("labelApproverComments")}:
            </label>

            <textarea
              rows={4}
              className="w-full p-2 mt-1 border border-gray-400 h-50"
              data-test-selector="txtApproverComments"
              onChange={(e) => {
                const value = e.target.value;
                if (value) {
                  setComment(value);
                }
              }}
              value={comment}
            />
          </>
        )}
        {receiptData?.userName !== userName && actionButtons && (
          <div className="flex justify-end gap-2 py-2">
            {actionButtons.showRejectButton && (
              <Button
                type="secondary"
                size="small"
                className="md:w-28"
                onClick={() => {
                  rejectButtonOnClick();
                }}
                dataTestSelector="btnRejectApprover"
                ariaLabel="pending order button"
                loading={rejectLoading}
                loaderColor="currentColor"
                loaderWidth="20px"
                loaderHeight="20px"
              >
                {pendingOrderTranslation("buttonReject")}
              </Button>
            )}
            {actionButtons.showApproveButton && (
              <Button
                type="primary"
                size="small"
                className="md:w-28"
                onClick={() => {
                  approveButtonOnClick();
                }}
                ariaLabel="approve button"
                dataTestSelector="btnApprove"
                loading={approveLoading}
                loaderColor="currentColor"
                loaderWidth="20px"
                loaderHeight="20px"
              >
                {pendingOrderTranslation("buttonApprove")}
              </Button>
            )}
            {actionButtons.showPlaceOrderButton && (
              <Button
                type="primary"
                size="small"
                className="md:w-64"
                onClick={() => {
                  convertToOrder();
                }}
                ariaLabel="approve and place order button"
                dataTestSelector="btnApproveAndPlaceOrder"
                loading={convertToOrderLoading}
                loaderColor="currentColor"
                loaderWidth="20px"
                loaderHeight="20px"
              >
                {pendingOrderTranslation("approveAndPlaceOrder")}
              </Button>
            )}
          </div>
        )}
        {receiptData?.convertedClassNumber && (
          <div className="col-span-1 pr-8 mr-8">
            <h4 className="font-semibold">{pendingOrderTranslation("labelConvertedToOrder")}:</h4>
            <div className="flex items-center gap-2">
              <h6>
                <span className="text-sm font-medium">Order number:</span>
              </h6>
              {receiptData?.userName !== userName && receiptData?.orderState === ORDER.APPROVED ? (
                <div data-test-selector="divOrderNumber" className="text-sm font-medium">
                  {receiptData?.convertedClassNumber}
                </div>
              ) : (
                <Link
                  className="underline cursor-pointer text-linkColor text-sm font-medium"
                  href={`/account/order/details/${receiptData?.convertedClassNumber}?receiptModule=false`}
                  data-test-selector="linkOrderNumber"
                >
                  {receiptData?.convertedClassNumber}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex-col items-start justify-start gap-2 lg:flex" data-test-selector="divQuoteOrderReceipt">
        {!receiptModule && (
          <h1 className="mt-4 mb-4 text-2xl font-semibold uppercase" data-test-selector="hdgQuoteThankYouPara">
            {getPendingPaymentData(DynamicElementText.heading)}
          </h1>
        )}
        {!receiptModule && (
          <div>
            {orderTranslation("thanksForShoppingAt")} {receiptData?.storeName ?? "-"}. {getPendingPaymentData(DynamicElementText.title)}
            <Link
              className="text-linkColor hover:text-hoverColor underline pl-2"
              href={
                receiptData?.orderState.toLowerCase() === PENDING_APPROVAL_STATUS.PENDING_PAYMENT_LABEL.toLowerCase()
                  ? `/account/pending-payment/details?orderNumber=${orderId}&isPendingPayment=true&receiptModule=true`
                  : `/account/pending-order/details?orderNumber=${orderId}&isPendingPayment=false&receiptModule=true`
              }
            >
              #{orderId}
            </Link>
          </div>
        )}
        {!receiptModule && getPendingPaymentData(DynamicElementText.subHeading) && (
          <div className={`${isPendingPayment ? "flex flex-wrap" : ""}`}>
            {getPendingPaymentData(DynamicElementText.subHeading).split(",")[0]}
            {isPendingPayment ? (
              <Link className="text-linkColor hover:text-hoverColor pl-1" href="/account/pending-payment/list" data-test-selector="linkPendingPaymentHistory">
                {getPendingPaymentData(DynamicElementText.subHeading).split(",")[1]}
              </Link>
            ) : (
              <Link className="text-linkColor hover:text-hoverColor underline pl-1" href="/account/pending-order/list" data-test-selector="linkPendingOrderHistory">
                {pendingOrderTranslation("pendingOrderHistory")}
              </Link>
            )}
            {getPendingPaymentData(DynamicElementText.subHeading).split(",").length > 1 ? (
              <div className="pl-1">{getPendingPaymentData(DynamicElementText.subHeading).split(",")[2]} </div>
            ) : null}
          </div>
        )}

        {!receiptModule && (
          <div className="flex flex-col gap-2 w-full py-5 md:flex-row">
            <Button
              onClick={() => router.push("/feedback")}
              type="secondary"
              size="small"
              className="px-14 "
              dataTestSelector="btnGiveFeedback"
              loaderColor="currentColor"
              loaderWidth="20px"
              loaderHeight="20px"
              ariaLabel="feedback button"
            >
              {orderTranslation("giveFeedback")}
            </Button>
            <Button
              onClick={() => router.push("/")}
              type="primary"
              size="small"
              className="xs:px-14 xs:mb-3 md:mb-0"
              dataTestSelector="btnContinueShopping"
              loaderColor="currentColor"
              loaderWidth="20px"
              loaderHeight="20px"
              ariaLabel="continue shopping button"
            >
              {orderTranslation("continueShopping")}
            </Button>
          </div>
        )}
      </div>
      {receiptModule ? (
        <Heading name={pendingOrderTranslation("pendingOrderDetails")} dataTestSelector="hdgPendingOrderDetails" customClass="uppercase" level="h2" showSeparator />
      ) : null}

      <div className="items-center justify-between lg:flex">
        <Heading
          name={`${pendingOrderTranslation("pendingOrderDetails")} #${orderId || "-"} - ${receiptData?.storeName || "-"} ${commonTranslation("on")} ${receiptData?.createdDate || ""
            }`}
          customClass="uppercase"
          level="h2"
          dataTestSelector="hdgPendingOrderInfo"
        />

        {receiptModule && !isPendingPayment && isSeeApproverHistoryEnabled ? (
          <Button
            onClick={() => {
              callSeeApproverHistory();
            }}
            type="primary"
            size="small"
            className="w-full md:w-auto whitespace-nowrap no-print"
            dataTestSelector="btnSeeApproverHistory"
            loading={isApproverHistoryLoading}
            loaderColor="currentColor"
            showLoadingText={true}
            loaderWidth="20px"
            loaderHeight="20px"
            ariaLabel="See approver history"
          >
            {pendingOrderTranslation("seeApproverHistory")}
          </Button>
        ) : null}
      </div>

      {receiptData ? (
        <div>
          <div className="justify-between mb-4 lg:flex">
            {receiptData && (
              <div className="w-full pt-2 mr-2">
                <PendingOrderDetails pendingOrderDetails={receiptData} />
              </div>
            )}

            {!receiptData?.isBillingAddressOptional ? (
              <div className="w-full pt-2 ml-2">
                <Heading name={commonTranslation("billingTo")} customClass="tracking-wide uppercase" dataTestSelector="hdgBillingTo" level="h3" showSeparator />
                <div className="p-2">
                  <DisplayAddress userAddress={receiptData.billingAddress} addressType="Billing" />
                </div>
              </div>
            ) : null}
          </div>

          <div className="justify-between mb-2 lg:flex" data-test-selector="divReturnOrderReceipt">
            <div className="w-full px-2 pb-2 mr-2">
              <Heading name={commonTranslation("shippingTo")} customClass="tracking-wide uppercase" dataTestSelector="hdgShippingTo" level="h3" showSeparator />
              <div className="flex gap-2 xs:flex-col md:flex-row">
                <div className="p-2 md:w-1/2">
                  <DisplayAddress userAddress={receiptData.shippingAddress} addressType="Shipping" />
                </div>

                <div className="mt-3 md:mt-0 p-2 md:w-1/2">
                  {receiptData.isShippingConstraint ? (
                    <>
                      <div className="flex pb-2">
                        <p className="w-48 font-medium" data-test-selector="paraQuoteNumberLabel">
                          {commonTranslation("inHandsDate")} :
                        </p>
                        <p data-test-selector="paraInHandDate">{receiptData?.inHandDate || "-"}</p>
                      </div>
                      <div className="flex pb-2">
                        <p className="w-48 font-medium" data-test-selector="paraQuoteNumberLabel">
                          {orderTranslation("shippingConstraints")} :
                        </p>
                        <p data-test-selector="paraShippingConstraint">{shippingConstraint}</p>
                      </div>
                    </>
                  ) : null}
                  <div className="flex pb-2">
                    <p className="w-48 font-medium" data-test-selector="paraQuoteNumberLabel">
                      {orderTranslation("shippingMethod")} :
                    </p>
                    <p data-test-selector="paraShippingMethod">{receiptData?.shippingTypeName || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:p-2 mb-2" data-test-selector="divOrderSummaryContainer">
            <PendingOrderReceiptSummary
              customOrderSummaryTableData={customOrderSummaryTableData}
              isPendingPayment={String(isPendingPayment)}
              shoppingCartItems={receiptData?.orderLineItems}
            />
          </div>
          <div className="px-2">
            <ReceiptTotal receiptTotalData={receiptData} isPendingPayment={String(isPendingPayment)} currencyCode={"USD"} />
          </div>
          <Modal modalId="SeeApproverHistory" size="6xl" maxHeight="xl">
            <>
              <Heading name="Approver History" dataTestSelector="hdgApproverHistory" />
              <div className="flex gap-4 w-100">
                {approverList && approverList?.length > 0 ? (
                  <div>
                    <table className="min-w-full border-0 table-auto" data-test-selector="tblUserApproverHistory">
                      <thead>
                        <tr className="border-b border-cardBorderColor">
                          <th className="p-4">{pendingOrderTranslation("approvalOrder")}</th>
                          <th className="p-4">{pendingOrderTranslation("approverName")}</th>
                          <th className="p-4">{pendingOrderTranslation("textPendingOrderStatus")}</th>
                          <th className="p-4">{pendingOrderTranslation("textApprovalTime")}</th>
                        </tr>
                      </thead>
                      {approverList?.map((val: IApproverList, index: number) => {
                        return (
                          <tr className="border-b border-cardBorderColor" key={index}>
                            <td className="p-4">{val?.approverOrder || "-"}</td>
                            <td className="p-4">{val?.approverName || "-"}</td>
                            <td className="p-4">{val?.statusCode || "-"}</td>
                            <td className="p-4">{val?.statusCode !== PENDING_APPROVAL_STATUS.PENDING_ORDER_STATUS ? val?.approvalDate : "-"}</td>
                          </tr>
                        );
                      })}
                    </table>
                  </div>
                ) : (
                  <p>{pendingOrderTranslation("textNoApprovers")}</p>
                )}
              </div>
            </>
          </Modal>
        </div>
      ) : (
        <LoadingSpinnerComponent minHeight="min-h-[50vh]" />
      )}
      {receiptData && approvalSection(receiptData)}
    </>
  );
};
