import { NextIntlClientProvider } from "next-intl";
import { fetchMessages } from "@znode/utils/server";
import { QuoteOrderList } from "@znode/base-components/account/quote";

export default async function QuoteOrderListPage() {
  const messages = await fetchMessages(["Common", "Pagination", "Quote", "SwitchAccount"]);
  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <QuoteOrderList />
    </NextIntlClientProvider>
  );
}
