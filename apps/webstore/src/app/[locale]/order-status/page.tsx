import { OrderStatus } from "@znode/base-components/components/order-status";
import { NextIntlClientProvider } from "next-intl";
import { fetchMessages } from "@znode/utils/server";

export default async function OrderStatusPage() {
  const localeMessages = ["Common", "Orders", "MyAccount"];
  const messages = await fetchMessages(localeMessages);
  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <OrderStatus />
    </NextIntlClientProvider>
  );
}
