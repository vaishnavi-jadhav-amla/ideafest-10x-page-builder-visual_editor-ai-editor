"use client";

import { IOrderDetails, IOrderReceiptParams, IPaymentHistory } from "@znode/types/account";
import InvoiceMe, { IRecord } from "../../checkout/payment/payment-internal/InvoiceMe";
import { ORDER, ORDER_DATA_TYPE } from "@znode/constants/order";
import { deleteCookie, getCookie } from "@znode/utils/component";
import { useCheckout, useModal, useToast, useUser } from "../../../stores";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Button from "../../common/button/Button";
import { GENERAL_SETTINGS } from "@znode/constants/app";
import { Heading } from "../../common/heading";
import { IAddress } from "@znode/types/address";
import { IUser } from "@znode/types/user";
import Link from "next/link";
import { LoadingSpinnerComponent } from "../../common/icons";
import { Modal } from "../../common/modal";
import { PAYMENT_SUBTYPE } from "@znode/constants/payment";
import PaymentApplicationLoader from "../../common/loader-component/PaymentApplicationLoader";
import PaymentHistory from "./payment-history/PaymentHistory";
import { QUOTE_STATUS } from "@znode/constants/quote";
import ReceiptBillingAddress from "./receipt-billing-address/ReceiptBillingAddress";
import ReceiptDetails from "./receipt-details/ReceiptDetails";
import ReceiptOrderSummary from "./receipt-order-summary/ReceiptOrderSummary";
import ReceiptShippingAddress from "./receipt-shipping-address/ReceiptShippingAddress";
import ReceiptTotal from "./receipt-total/ReceiptTotal";
import ReturnOrderProductList from "../return-order/return-receipt/return-order-product-list/ReturnOrderProductList";
import { getOrderTypeDetails } from "../../../http-request";
import { useTranslations } from "next-intl";

export function OrderReceipt(props: IOrderReceiptParams): JSX.Element | null {
  const { isReceipt = false, enableReturnOrderRequest = false, isPriceRoundOff = true } = props;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isUserSessionLoading } = useUser();
  const { openModal } = useModal();
  const { error } = useToast();

  const commonTranslation = useTranslations("Common");
  const orderTranslation = useTranslations("Orders");
  const paymentTranslation = useTranslations("Payment");

  const [order, setOrder] = useState<IOrderDetails | null>(null);
  const [paymentHistoryList, setPaymentHistoryList] = useState<IPaymentHistory[]>();
  const [showPaymentBtn, setShowPaymentBtn] = useState<boolean>(false);
  const [isOfflinePayment, setIsOfflinePayment] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<number>(0);
  const { setShippingAddressId, setBillingAddressId } = useCheckout();
  const [currentRecord, setCurrentRecord] = useState<IRecord>();
  const [showModel, setShowModel] = useState<boolean>(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [userDetails, setUserDetails] = useState<IUser | null>(user ?? null);

  const getOrderDetails = async () => {
    const orderNumber = props.orderId ?? getCookie(ORDER.USER_ORDER_RECEIPT_ORDER_ID);
    setOrderId(orderNumber);
    const isOfflinePayment = searchParams?.has("isOfflinePayment") ? Boolean(searchParams?.get("isOfflinePayment")) : false;
    setIsOfflinePayment(isOfflinePayment);
    if (orderNumber) {
      if (!isReceipt || isOfflinePayment) {
        const orderReceiptData = await getOrderTypeDetails({ orderType: ORDER_DATA_TYPE.ORDER, orderNumber: orderNumber });
        if (!orderReceiptData?.data) {
          router.push("/404");
        }
        if (orderReceiptData?.data) {
          setPaymentHistoryList(orderReceiptData?.data?.paymentList);
          const orderReceipt = orderReceiptData?.data;
          const paymentSubType = orderReceipt?.data?.paymentSubTypeCode;
          if (
            (paymentSubType && paymentSubType.toLowerCase() === PAYMENT_SUBTYPE.INVOICE_ME.toLowerCase()) ||
            paymentSubType?.toLowerCase() === PAYMENT_SUBTYPE.PURCHASE_ORDER.toLowerCase()
          ) {
            setShippingAddressId(orderReceipt?.shippingAddress?.addressId);
            setBillingAddressId(orderReceipt?.billingAddress?.addressId);
          }
          if (orderReceipt?.orderState !== QUOTE_STATUS.QUOTE_STATUS_CANCELED.toUpperCase()) {
            setShowPaymentBtn(true);
          }
        }
        return orderReceiptData;
      } else {
        const orderReceiptData = await getOrderTypeDetails({ orderType: ORDER_DATA_TYPE.ORDER, orderNumber: orderNumber });
        return orderReceiptData;
      }
    } else {
      window && (window.location.href = "/account/order/list");
    }
  };

  useEffect(() => {
    !isUserSessionLoading && user && setUserDetails(user);
  }, [isUserSessionLoading, user]);

  useEffect(() => {
    getOrderDetails().then((res) => {
      if (res?.data) {
        setOrder(res.data as IOrderDetails);
      }
    });
    return () => {
      deleteCookie(ORDER.USER_ORDER_RECEIPT_ORDER_ID);
    };
    // guestUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmitInvoicePay = async () => {
    const invoiceRecord = {
      orderNumber: order?.orderNumber as string,
      paymentType: order?.paymentSubTypeCode as string,
      remainingOrderAmount: order?.remainingOrderAmount as number,
      userId: userDetails?.userId as number,
      total: order?.total as number,
    };
    setCurrentRecord(invoiceRecord);
    setShowModel(true);
    openModal("invoiceMeModal");
  };

  const validateOrderDetails = () => {
    if (order?.isOrderEligibleForReturn) {
      router.push(`/account/return-order/create?orderNumber=${order.orderNumber}`);
    } else {
      error(commonTranslation("eligibleOrder"));
    }
  };

  const renderOrderReceipt = () => {
    const handleGiveFeedbackClick = () => {
      router.push("/feedback");
    };

    const getOrderDetailHref = () => {
      if (userDetails?.accountId) {
        return `/account/account-orders/details/${orderId}`;
      } else {
        return `/account/order/details/${orderId}?receiptModule=true`;
      }
    };

    return (
      <>
        {showModel && (
          <div>
            <Modal modalId="invoiceMeModal" maxHeight="lg" size="4xl" customClass="overflow-y-auto w-full">
              <InvoiceMe currentRecord={currentRecord} setPaymentProcessing={setPaymentProcessing} />
            </Modal>
          </div>
        )}
        <PaymentApplicationLoader isPaymentProcessing={paymentProcessing} />
        {isReceipt && (
          <>
            <div className="justify-between px-2 mt-4 mb-2 lg:flex" data-test-selector="divOrderCheckoutReceipt">
              <Heading dataTestSelector="hdgThankYouForPurchase" level="h1" customClass="xs:w-auto py-0" name={orderTranslation("thanksForPurchase")} />
              <div className="flex flex-col mt-3 sm:gap-2 lg:mt-0 no-print md:flex-row">
                <Button type="secondary" size="small" dataTestSelector="btnGiveFeedback" ariaLabel="order receipt feedback button" onClick={handleGiveFeedbackClick}>
                  {orderTranslation("giveFeedback")}
                </Button>
                <Link
                  href="/"
                  className="w-auto px-5 text-sm uppercase transition duration-300 ease-in-out btn btn-primary xs:mt-2 md:mt-0"
                  data-test-selector="btnContinueShopping"
                  prefetch={false}
                >
                  {orderTranslation("continueShopping")}
                </Link>
              </div>
            </div>
            <div className="px-2 pb-4">
              <p data-test-selector="paraThanksForShopping">
                {orderTranslation("thanksForShoppingAt")} {order?.storeName}. {orderTranslation("yourOrderNumberIs")}
                {userDetails?.userId ? (
                  <Link className="text-linkColor hover:text-hoverColor" href={getOrderDetailHref()} prefetch={false}>
                    <span className="underline">#{order?.orderNumber}</span>
                  </Link>
                ) : (
                  <span className="underline">#{order?.orderNumber}</span>
                )}
              </p>
              <p data-test-selector="paraEmailSent">
                {orderTranslation("anEmailReceiptHasBeenSentTo")} {order?.email ?? order?.userName}, {orderTranslation("pleaseKeepThisEmailForYourRecords")}
              </p>
            </div>
          </>
        )}
        {!isReceipt ? <Heading name={orderTranslation("orderDetails")} level="h2" customClass="uppercase" dataTestSelector="hdgOrderDetails" showSeparator /> : null}
        <div>
          <div className={"flex xs:flex-col md:flex-row gap-2 items-center justify-between mt-4"}>
            <p className="font-medium uppercase md:text-xl" data-test-selector="hdgTitleOrderReceipt">
              {orderTranslation("orderReceipt")} {order?.orderNumber} - {order?.storeName ?? ""} {commonTranslation("on")} {order?.createdDate}
            </p>
            {isReceipt ? (
              <div className="flex items-center justify-end gap-2 md:w-1/2">
                <div className="flex flex-col mt-3 lg:mt-0 no-print md:flex-row">
                  <Button
                    onClick={() => {
                      window.print();
                    }}
                    type="primary"
                    size="small"
                    className="w-full h-10 no-print"
                    dataTestSelector="btnPrint"
                    loaderColor="currentColor"
                    loaderWidth="20px"
                    loaderHeight="20px"
                    ariaLabel="order receipt print button"
                  >
                    {commonTranslation("print")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex xs:w-full lg:w-auto justify-end gap-2">
                {enableReturnOrderRequest && (
                  <Button
                    disabled={!order?.isOrderEligibleForReturn}
                    className="no-print"
                    type="primary"
                    size="small"
                    dataTestSelector="linkCreateReturn"
                    onClick={() => validateOrderDetails()}
                  >
                    {orderTranslation("createReturn")}
                  </Button>
                )}
                <Button
                  className="no-print"
                  type="primary"
                  dataTestSelector="btn-print"
                  onClick={(e) => {
                    e.preventDefault();
                    window.print();
                  }}
                >
                  {commonTranslation("print")}
                </Button>
                {(order?.paymentSubTypeCode?.toLowerCase() === PAYMENT_SUBTYPE.INVOICE_ME.toLowerCase() ||
                  order?.paymentSubTypeCode?.toLowerCase() === PAYMENT_SUBTYPE.PURCHASE_ORDER.toLowerCase()) &&
                  showPaymentBtn &&
                  isOfflinePayment && (
                    <Button
                      onClick={() => handleSubmitInvoicePay()}
                      type="primary"
                      size="small"
                      className="w-full h-10 ml-2 no-print"
                      disabled={Number(order?.remainingOrderAmount) <= 0}
                      dataTestSelector="btnMakePayment"
                      loaderColor="currentColor"
                      loaderWidth="20px"
                      loaderHeight="20px"
                      ariaLabel="make payment button"
                    >
                      {paymentTranslation("makePayment")}
                    </Button>
                  )}
              </div>
            )}
          </div>
          <div className="grid gap-4 mt-2 mb-4 md:grid-cols-3 print:grid-cols-1">
            <div className="col-span-1 p-3 rounded-md shadow-md" data-test-selector="divDetailsContainer">
              {order && <ReceiptDetails orderData={order} receiptDate={order.createdDate as string} />}
            </div>

            {!order?.isBillingAddressOptional && (
              <div className="col-span-1 p-3 rounded-md shadow-md md:block print:hidden" data-test-selector="divBillingAddressContainer">
                <ReceiptBillingAddress billingAddress={order?.address?.find((address: IAddress) => address?.isBilling === true) || ""} />
              </div>
            )}

            <div className="col-span-1 p-3 rounded-md shadow-md md:block print:hidden break-inside-avoid-page" data-test-selector="divShippingAddressContainer">
              <ReceiptShippingAddress
                shippingAddress={order?.address?.find((address: IAddress) => address?.isShipping === true) || ""}
                shippingConstraint={order?.shippingConstraintCode || ""}
                inHandDate={order?.inHandDate || ""}
                showShippingConstraint={order?.isShippingConstraint || false}
                shippingType={order?.shippingTypeName}
              />
            </div>
          </div>

          <div className="hidden print:grid print:grid-cols-2 print:gap-4 print:mt-4">
            {!order?.isBillingAddressOptional && (
              <div className="p-3 rounded-md shadow-md" data-test-selector="divBillingAddressContainerPrint">
                <ReceiptBillingAddress billingAddress={order?.address?.find((address: IAddress) => address?.isBilling === true) || ""} />
              </div>
            )}
            <div className="p-3 rounded-md shadow-md" data-test-selector="divShippingAddressContainerPrint">
              <ReceiptShippingAddress
                shippingAddress={order?.address?.find((address: IAddress) => address?.isShipping === true) || ""}
                shippingConstraint={order?.shippingConstraintCode || ""}
                inHandDate={order?.inHandDate || ""}
                showShippingConstraint={order?.isShippingConstraint || false}
                // generalSetting={generalSetting}
                shippingType={order?.shippingTypeName}
              />
            </div>
          </div>
          {order?.orderLineItems && order?.orderLineItems.length > 0 && (
            <div className="mb-4 print-next-page" data-test-selector="divOrderSummaryContainer">
              <ReceiptOrderSummary
                priceRoundOff={isPriceRoundOff ? GENERAL_SETTINGS.PRICE_ROUND_OFF : order.priceRoundOff}
                orderSummaryData={order.orderLineItems || []}
                orderNumber={order.orderNumber || ""}
                orderData={order || null}
              />
            </div>
          )}
          {order && order.orderLineItems && order.orderLineItems.length > 0 && (
            <ReceiptTotal priceRoundOff={isPriceRoundOff ? GENERAL_SETTINGS.PRICE_ROUND_OFF : order.priceRoundOff} receiptTotalData={order} currencyCode={order.currencyCode} />
          )}
        </div>
        {paymentHistoryList && paymentHistoryList?.length > 0 && <PaymentHistory paymentHistoryList={paymentHistoryList} currencyCode={order?.currencyCode} />}
      </>
    );
  };

  return !order ? (
    <LoadingSpinnerComponent minHeight="min-h-[50vh]" />
  ) : order?.orderNumber ? (
    <>
      {renderOrderReceipt()}
      {enableReturnOrderRequest && <ReturnOrderProductList priceRoundOff={isPriceRoundOff ? GENERAL_SETTINGS.PRICE_ROUND_OFF : order.priceRoundOff} isTrackReceipt={false} orderNumber={order?.orderNumber} />}
    </>
  ) : null;
}
