import { NextIntlClientProvider } from "next-intl";
import { OrderHistory } from "@znode/base-components/account/order";
import { fetchMessages } from "@znode/utils/server";

export default async function OrderListPage() {
  const messages = await fetchMessages(["OrderHistory", "Common", "Pagination", "Orders", "Payment", "Discount"]);

  return (
    <NextIntlClientProvider locale="en" messages={{ ...messages }}>
      <OrderHistory />
    </NextIntlClientProvider>
  );
}
