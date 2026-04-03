import { IPortalDetail } from "@znode/types/portal";
import { NextIntlClientProvider } from "next-intl";
import { ReturnOrder } from "@znode/base-components/account/return-order";
import { fetchMessages } from "@znode/utils/server";
import { getPortalDetails } from "@znode/agents/portal";
import { isReturnOrderRequestEnabled } from "@znode/utils/common";
import { redirect } from "next/navigation";

export default async function ReturnOrderPage() {
  const portalData: IPortalDetail = await getPortalDetails();
  const enableReturnOrderRequest = isReturnOrderRequestEnabled(portalData);
  if (!enableReturnOrderRequest) {
    redirect("/404");
  }

  const messages = await fetchMessages(["Common", "Pagination", "ReturnOrder"]);

  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <ReturnOrder isDashboard={false} />
    </NextIntlClientProvider>
  );
}
