import { NextIntlClientProvider } from "next-intl";
import { VoucherHistory } from "@znode/base-components/account/voucher";
import { fetchMessages } from "@znode/utils/server";
export default async function VoucherHistoryPage() {
  const localeMessages = ["Common", "Voucher", "Pagination"];
  const messages = await fetchMessages(localeMessages);

  return (
    <NextIntlClientProvider locale="en-US" messages={{ ...messages }}>
      <VoucherHistory />
    </NextIntlClientProvider>
  );
}
