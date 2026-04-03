import { PendingOrderList } from "@znode/base-components/account/pending-order";
import { getResourceMessages } from "@znode/utils/server";
import { NextIntlClientProvider } from "next-intl";

export default async function PendingOrderHistoryPage() {
  const pendingOrderMessages = await getResourceMessages("ApprovalRouting");
  const commonMessages = await getResourceMessages("Common");
  const paginationMessages = await getResourceMessages("Pagination");

  return (
    <NextIntlClientProvider locale="en" messages={{ ...pendingOrderMessages, ...commonMessages, ...paginationMessages }}>
      <PendingOrderList />
    </NextIntlClientProvider>
  );
}
