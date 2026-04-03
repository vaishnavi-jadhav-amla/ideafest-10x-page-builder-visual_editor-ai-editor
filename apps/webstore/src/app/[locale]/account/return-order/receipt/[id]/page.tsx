import { IPortalDetail } from "@znode/types/portal";
import { NextIntlClientProvider } from "next-intl";
import React from "react";
import ReturnReceipt from "@znode/base-components/account/return-order/return-receipt/ReturnReceipt";
import { fetchMessages } from "@znode/utils/server";
import { getPortalDetails } from "@znode/agents/portal";
import { getReturnReceiptDetails } from "@znode/agents/account/return-order/return-order";
import { isReturnOrderRequestEnabled } from "@znode/utils/common";
import { redirect } from "next/navigation";

export default async function ReturnOrderReceiptPage({ params }: Readonly<{ params: { id: string } }>) {
  const portalData: IPortalDetail = await getPortalDetails();
  const enableReturnOrderRequest = isReturnOrderRequestEnabled(portalData);
  if (!enableReturnOrderRequest) {
    redirect("/404");
  }
  const messages = await fetchMessages(["Common", "ReturnOrder"]);
  const returnReceiptResponse = await getReturnReceiptDetails("Returns", params?.id);
  if (!returnReceiptResponse) {
    redirect("/404");
  }
  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <ReturnReceipt returnReceiptDetails={returnReceiptResponse} priceRoundOff={returnReceiptResponse.priceRoundOff} />
    </NextIntlClientProvider>
  );
}
