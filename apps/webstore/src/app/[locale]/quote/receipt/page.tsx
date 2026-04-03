import { QuoteReceipt } from "@znode/base-components/account/quote";
import { fetchMessages } from "@znode/utils/server";
import { NextIntlClientProvider } from "next-intl";

export default async function QuoteReceiptPage() {
  const localeMessages = ["Quote", "Common", "Payment", "Orders", "MyAccount"];
  const messages = await fetchMessages(localeMessages);
  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <QuoteReceipt />
    </NextIntlClientProvider>
  );
}
