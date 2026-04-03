import { IOrderDetails, IOrderLineItem } from "@znode/types/account";
import { ANALYTICS_EVENTS } from "@znode/constants/analytics-event";
import { sendAnalyticsEvent } from "@znode/utils/component";
import { useEffect } from "react";
import { ViewReceiptDetails } from "./ViewReceiptDetails";

const ReceiptDetails = ({ orderData, receiptDate }: { orderData: IOrderDetails; receiptDate: string }) => {
  const productDetails =
    orderData && orderData.orderLineItems && orderData.orderLineItems.length > 0
      ? orderData.orderLineItems.map((item: IOrderLineItem) => {
          return {
            id: item?.id,
            price: item?.price,
            name: item?.name,
            quantity: item?.quantity,
            total: item?.total,
            sku: item?.sku,
            description: item?.description,
          };
        })
      : [];

  const purchaseData = {
    transactionId: orderData?.trackingNumber,
    affiliation: orderData?.storeName,
    revenue: orderData?.total,
    shipping: orderData?.shippingCost,
    tax: orderData?.taxCost,
    currency: orderData.currencyCode ?? "USD",
    items: productDetails,
  };

  useEffect(() => {
    sendAnalyticsEvent({
      event: ANALYTICS_EVENTS.PURCHASE,
      ecommerce: {
        purchase: {
          actionField: {
            id: purchaseData.transactionId,
            affiliation: purchaseData.affiliation,
            revenue: purchaseData.revenue,
            shipping: purchaseData.shipping,
            tax: purchaseData.tax,
            currency: purchaseData.currency,
          },
          products: purchaseData.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderData]);

  return <ViewReceiptDetails orderData={orderData} receiptDate={receiptDate} />;
};

export default ReceiptDetails;
