import { ATTRIBUTE } from "@znode/constants/attribute";
import { IPortalDetail } from "@znode/types/portal";
import { NextIntlClientProvider } from "next-intl";
import { OrderReceipt } from "@znode/base-components/account/order-receipt";
import { SETTINGS } from "@znode/constants/settings";
import { fetchMessages } from "@znode/utils/server";
import { getPortalDetails } from "@znode/agents/portal";
import { redirect } from "next/navigation";

export default async function OrderDetailPage({ params }: Readonly<{ params: { id: number } }>) {
  const messages = await fetchMessages(["Common", "Orders", "Payment", "MyAccount", "Promotions", "Discount", "ReturnOrder"]);
  if (params.id) {
      const portalData: IPortalDetail = await getPortalDetails();
      const enableReturnOrderRequest =
        portalData?.globalAttributes?.find((attr) => attr.attributeCode === SETTINGS.ENABLE_RETURN_ORDER_REQUEST)?.attributeValue === ATTRIBUTE.TRUE_VALUE;
    
    return (
      <NextIntlClientProvider locale="en" messages={{ ...messages }}>
        <OrderReceipt isPriceRoundOff={false} orderId={params?.id} isReceipt={false} enableReturnOrderRequest={enableReturnOrderRequest} />
      </NextIntlClientProvider>
    );
  }
  return redirect("/404");
}
