import { useEffect, useState } from "react";

import { ATTRIBUTE } from "@znode/constants/attribute";
import Button from "../common/button/Button";
import { Heading } from "../common/heading";
import { IOrderDetails } from "@znode/types/account";
import { IUserSignUp } from "@znode/types/user";
import ReceiptBillingAddress from "../account/order-receipt/receipt-billing-address/ReceiptBillingAddress";
import ReceiptOrderSummary from "../account/order-receipt/receipt-order-summary/ReceiptOrderSummary";
import ReceiptShippingAddress from "../account/order-receipt/receipt-shipping-address/ReceiptShippingAddress";
import ReceiptTotal from "../account/order-receipt/receipt-total/ReceiptTotal";
import ReturnOrderProductList from "../account/return-order/return-receipt/return-order-product-list/ReturnOrderProductList";
import { SETTINGS } from "@znode/constants/settings";
import { Separator } from "../common/separator";
import { ViewReceiptDetails } from "../account/order-receipt/receipt-details/ViewReceiptDetails";
import { getUserSettings } from "../../http-request/user-settings/user-settings";
import { useRouter } from "next/navigation";
import { useToast } from "../../stores/toast";
import { useTranslationMessages } from "@znode/utils/component";
import { useUser } from "../../stores/user-store";
import { validateOrderNumberAndLineItems } from "../../http-request/order/order";

export function OrderStatusDetails({ order }: { order: IOrderDetails | null }) {
  const orderMessages = useTranslationMessages("Orders");
  const commonMessages = useTranslationMessages("Common");
  const { user } = useUser();
  const [isValidOrderNumber, setIsValidOrderNumber] = useState(true);
  const { error } = useToast();
  const router = useRouter();
  const [userSetting, setUserSetting] = useState<IUserSignUp>();

  const getUserSettingDetails = async () => {
    const userSettings = await getUserSettings();
    setUserSetting(userSettings);
  };

  useEffect(() => {
    getUserSettingDetails();
  }, []);

  const enableReturnOrderRequest =
    userSetting?.globalAttributes?.find((attr) => attr.attributeCode === SETTINGS.ENABLE_RETURN_ORDER_REQUEST)?.attributeValue === ATTRIBUTE.TRUE_VALUE;

  const validateOrderDetails = async () => {
    const request = {
      orderNumber: order?.orderNumber as string,
      userId: Number(order?.userId),
      returnStateCode: order?.statusCode as string,
    };
    const result = await validateOrderNumberAndLineItems(request);
    if (result.isSuccess) {
      setIsValidOrderNumber(result.isSuccess as boolean);
    } else {
      setIsValidOrderNumber(false);
    }
  };

  const handledRedirectToCreateReturn = () => {
    if (order?.isGuestUser) {
      if (isValidOrderNumber) {
        router.push(`/return/create?orderNumber=${order?.orderNumber}`);
      } else {
        error(commonMessages("eligibleOrder"));
      }
    } else if ((user?.userId ?? 0) > 0) {
      if (isValidOrderNumber) {
        router.push(`/account/return-order/create?orderNumber=${order?.orderNumber}`);
      } else {
        error(commonMessages("eligibleOrder"));
      }
    } else {
      error(commonMessages("loginToReturn"));
    }
  };

  useEffect(() => {
    enableReturnOrderRequest && validateOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  if (order && Object.keys(order).length === 0) return null;
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center">
        <p className="font-medium md:text-xl" data-test-selector="hdgTitleOrderReceipt">
          {commonMessages("order")}: {order?.orderNumber}
        </p>
        <div>
          {enableReturnOrderRequest && (
            <Button className="no-print" type="primary" size="small" dataTestSelector="btnPrint" onClick={handledRedirectToCreateReturn}>
              {commonMessages("createReturn")}
            </Button>
          )}
          <Button className="no-print ml-2" type="primary" size="small" dataTestSelector="btnPrint" onClick={() => window.print()}>
            {commonMessages("print")}
          </Button>
        </div>
      </div>
      <Separator size="xs" customClass="mt-2" />

      <div className="p-2.5 mb-3 bg-navBgColor">
        <label className="font-semibold text-[17px]">{orderMessages("status")}</label> : <span>{order?.orderState}</span>
      </div>

      <div className="grid gap-6 md:grid-cols-3 print:grid-cols-1 print:gap-0">
        <div>
          <Box title={orderMessages("orderDetails")}>
            <ViewReceiptDetails orderData={order as IOrderDetails} receiptDate={order?.createdDate ?? ""} isFromOrderStatus />
          </Box>
        </div>

        <div className="md:col-span-2 grid md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
          <div className="print:mt-4">
            <Box title={orderMessages("billingTo")}>
              <div className="px-3 pb-2 pt-0">
                <ReceiptBillingAddress billingAddress={order?.billingAddress || ""} isFromOrderStatus />
              </div>
            </Box>
          </div>

          <div className="print:mt-4">
            <Box title={orderMessages("shippingTo")}>
              <ReceiptShippingAddress
                shippingAddress={order?.shippingAddress || ""}
                shippingConstraint={order?.shippingConstraintCode ?? ""}
                showShippingConstraint={false}
                isFromOrderStatus
              />
            </Box>
          </div>
        </div>
      </div>

      {order?.orderLineItems && order?.orderLineItems.length > 0 && (
        <div className="mt-6 print:pb-10">
          <div className="print:break-inside-avoid">
            <Box title={orderMessages("orderSummary")}>
              <div className="px-3 pb-2 pt-0">
                <div data-test-selector="divOrderSummaryContainer">
                  <ReceiptOrderSummary
                    priceRoundOff={order?.priceRoundOff}
                    orderSummaryData={order?.orderLineItems || []}
                    orderNumber={order?.orderNumber ?? ""}
                    orderData={order || null}
                    isFromOrderStatus
                  />
                </div>
                <div className="p-3">
                  <ReceiptTotal priceRoundOff={order?.priceRoundOff} receiptTotalData={order as IOrderDetails} currencyCode={order?.currencyCode ?? "USD"} />
                </div>
              </div>
            </Box>
          </div>

          <div className="print:break-before-page">
            <ReturnOrderProductList priceRoundOff={Number(order?.priceRoundOff)} isTrackReceipt={true} orderNumber={order ? (order as IOrderDetails).orderNumber : ""} />
          </div>
        </div>
      )}
    </div>
  );
}

const Box = ({ children, title = "" }: { children: React.ReactNode; title: string }) => {
  return (
    <div className="custom-shadow rounded-[4px] h-full">
      <Heading name={title} customClass="uppercase py-3 px-2 " dataTestSelector="hdgTrackOrder" level="h3" showSeparator />
      {children}
    </div>
  );
};
