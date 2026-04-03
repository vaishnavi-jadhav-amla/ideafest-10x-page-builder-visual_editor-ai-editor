import { decodeId, isReturnOrderRequestEnabled } from "@znode/utils/common";

import { IPortalDetail } from "@znode/types/portal";
import { NextIntlClientProvider } from "next-intl";
import React from "react";
import ReturnReceipt from "@znode/base-components/account/return-order/return-receipt/ReturnReceipt";
import { fetchMessages } from "@znode/utils/server";
import { getPortalDetails } from "@znode/agents/portal";
import { getReturnReceiptDetails } from "@znode/agents/account/return-order/return-order";
import { redirect } from "next/navigation";

export default async function ReturnOrderReceiptPage({ params, searchParams }: Readonly<{ params: { id: string }; searchParams: { userId: string } }>) {
  const portalData: IPortalDetail = await getPortalDetails();
  const userId = decodeId(searchParams.userId);
  const enableReturnOrderRequest = isReturnOrderRequestEnabled(portalData);
  if (!enableReturnOrderRequest) {
    redirect("/404");
  }
  const returnReceiptResponse = await getReturnReceiptDetails("Returns", params?.id, Number(userId));
  if (!returnReceiptResponse ) {
    redirect("/404");
  }
  const messages = await fetchMessages(["Common", "ReturnOrder"]);
  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <ReturnReceipt priceRoundOff={returnReceiptResponse.priceRoundOff} returnReceiptDetails={returnReceiptResponse} isGuest={true} />
    </NextIntlClientProvider>
  );
}
