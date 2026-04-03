import { ATTRIBUTE } from "@znode/constants/attribute";
import { NextIntlClientProvider } from "next-intl";
import { OrderReceipt } from "@znode/base-components/account/order-receipt";
import { SETTINGS } from "@znode/constants/settings";
import { fetchMessages } from "@znode/utils/server";
import { getPortalDetails } from "@znode/agents/portal";
import { redirect } from "next/navigation";

export default async function AccountOrderDetailPage({ params }: Readonly<{ params: { id: number } }>) {

  if (!params?.id) {
    return redirect("/404");
  }

  const [messages, portalData] = await Promise.all([
    fetchMessages(["Common", "Orders", "Payment", "MyAccount", "Promotions", "Discount", "ReturnOrder"]),
    getPortalDetails(),
  ]);

  const globalAttributes = portalData?.globalAttributes ?? [];

  const enableReturnOrderRequest = globalAttributes.some(
    attr => attr.attributeCode === SETTINGS.ENABLE_RETURN_ORDER_REQUEST && attr.attributeValue === ATTRIBUTE.TRUE_VALUE
  );

  return (
    <NextIntlClientProvider messages={messages}>
      <OrderReceipt
        orderId={params.id}
        isReceipt={false}
        isPriceRoundOff={false}
        enableReturnOrderRequest={enableReturnOrderRequest}
      />
    </NextIntlClientProvider>
  );
}