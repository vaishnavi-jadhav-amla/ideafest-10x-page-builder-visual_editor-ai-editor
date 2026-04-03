import { NextIntlClientProvider } from "next-intl";
import { PendingOrderReceipt } from "@znode/base-components/account/pending-order";
import { fetchMessages } from "@znode/utils/server";

export default async function PendingOrderReceiptPage({ params, searchParams }: Readonly<{ params: { id: string }; searchParams: { isPendingPayment: boolean } }>) {
  const messages = await fetchMessages(["ApprovalRouting", "Common", "Pagination", "Orders"]);

  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <PendingOrderReceipt orderNumber={params?.id} isPendingPayment={searchParams.isPendingPayment} receiptModule={false} />
    </NextIntlClientProvider>
  );
}
