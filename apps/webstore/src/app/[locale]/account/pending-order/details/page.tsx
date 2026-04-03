import { PendingOrderReceipt } from "@znode/base-components/account/pending-order";
import { ISearchParams } from "@znode/types/search-params";
import { stringToBooleanV2 } from "@znode/utils/common";
import { getResourceMessages } from "@znode/utils/server";
import { NextIntlClientProvider } from "next-intl";

type NestedSearchParams = {
  searchParams: {
    orderNumber?: string;
    isPendingPayment?: string;
    receiptModule?: string;
  };
} & ISearchParams;

export default async function PendingOrdersReceipt(searchParams: NestedSearchParams) {
  const { orderNumber = "", isPendingPayment = "false", receiptModule = "" } = searchParams.searchParams || {};
  const pendingOrderMessages = await getResourceMessages("ApprovalRouting");
  const commonMessages = await getResourceMessages("Common");
  const paginationMessages = await getResourceMessages("Pagination");
  const orderMessages = await getResourceMessages("Orders");

  return (
    <NextIntlClientProvider messages={{ ...pendingOrderMessages, ...commonMessages, ...paginationMessages, ...orderMessages }}>
      <PendingOrderReceipt
        orderNumber={orderNumber}
        isPendingPayment={stringToBooleanV2(isPendingPayment)}
        receiptModule={stringToBooleanV2(receiptModule)}
        isSeeApproverHistoryEnabled={true}
      />
    </NextIntlClientProvider>
  );
}
