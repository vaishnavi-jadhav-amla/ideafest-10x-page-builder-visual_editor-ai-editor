import CreateReturn from "@znode/base-components/account/return-order/CreateReturn";
import { IPortalDetail } from "@znode/types/portal";
import { ISearchParams } from "@znode/types/search-params";
import { NextIntlClientProvider } from "next-intl";
import { RETURN_ORDER } from "@znode/constants/return-order";
import React from "react";
import { fetchMessages } from "@znode/utils/server";
import { getPortalDetails } from "@znode/agents/portal";
import { isReturnOrderRequestEnabled } from "@znode/utils/common";
import { redirect } from "next/navigation";

export default async function CreateReturnPage({ searchParams }: { searchParams: ISearchParams }) {
  const portalData: IPortalDetail = await getPortalDetails();
  const enableReturnOrderRequest = isReturnOrderRequestEnabled(portalData);
  if (!enableReturnOrderRequest || !RETURN_ORDER.DISPLAY_DRAFT) {
    redirect("/404");
  }
  const messages = await fetchMessages(["Common", "ReturnOrder"]);
  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <CreateReturn isEditable={true} orderNumber={searchParams.orderNumber as string} />
    </NextIntlClientProvider>
  );
}
