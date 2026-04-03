import { NextIntlClientProvider } from "next-intl";
import { PendingPaymentHistory } from "@znode/base-components/account/pending-order";
import { fetchMessages } from "@znode/utils/server";

export default async function PendingPaymentHistoryPage() {
  const localeMessages = ["ApprovalRouting", "Common", "Pagination"];
  const messages = await fetchMessages(localeMessages);
  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <PendingPaymentHistory />
    </NextIntlClientProvider>
  );
}
