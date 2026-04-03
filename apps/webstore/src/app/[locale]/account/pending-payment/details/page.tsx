import { PendingOrderReceipt } from "@znode/base-components/account/pending-order";
import { NestedSearchParams } from "@znode/types/search-params";
import { stringToBooleanV2 } from "@znode/utils/common";
import { fetchMessages } from "@znode/utils/server";
import { NextIntlClientProvider } from "next-intl";

export default async function PendingOrdersReceipt(searchParams: NestedSearchParams) {
  const { orderNumber = "", isPendingPayment = "false", receiptModule = "" } = searchParams.searchParams || {};
  const localeMessages = ["ApprovalRouting", "Common", "Pagination", "Orders"];
  const messages = await fetchMessages(localeMessages);

  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <PendingOrderReceipt
        orderNumber={orderNumber}
        isPendingPayment={stringToBooleanV2(isPendingPayment)}
        receiptModule={stringToBooleanV2(receiptModule)}
        isSeeApproverHistoryEnabled={true}
      />
    </NextIntlClientProvider>
  );
}
