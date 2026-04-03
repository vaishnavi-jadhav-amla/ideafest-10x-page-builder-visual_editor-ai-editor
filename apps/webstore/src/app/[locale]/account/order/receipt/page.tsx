import { NextIntlClientProvider } from "next-intl";
import { OrderReceipt } from "@znode/base-components/account/order-receipt";
import { fetchMessages } from "@znode/utils/server";

export default async function OrderReceiptPage({ params }: Readonly<{ params: { id: number } }>) {
    const messages = await fetchMessages(["Common", "Orders", "Payment"]);

  return (
    <NextIntlClientProvider locale="en" messages={{...messages}}>
      <OrderReceipt orderId={params?.id} isReceipt={true} />
    </NextIntlClientProvider>
  );
}
