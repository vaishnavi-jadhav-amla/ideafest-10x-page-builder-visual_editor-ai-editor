import { NextIntlClientProvider } from "next-intl";
import { VoucherDetails } from "@znode/base-components/account/voucher";
import { fetchMessages } from "@znode/utils/server";

export default async function VoucherDetailsPage({ params }: { params: { id: string } }) {
  const localeMessages = ["Common", "Voucher", "Pagination"];

  const messages = await fetchMessages(localeMessages);

  return (
    <NextIntlClientProvider locale="en-US" messages={{ ...messages }}>
      <VoucherDetails cardId={params.id} />
    </NextIntlClientProvider>
  );
}
