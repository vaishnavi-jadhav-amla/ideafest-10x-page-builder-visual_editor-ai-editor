import React from "react";
import { NextIntlClientProvider } from "next-intl";
import { OrderTemplateHead } from "@znode/base-components/account/order-templates";
import OrderTemplateList from "@znode/base-components/account/order-templates/OrderTemplatesList";
import { fetchMessages } from "@znode/utils/server";

export default async function OrderTemplatePage() {
  const messages = await fetchMessages(["OrderTemplates", "Common", "Pagination"]);

  return (
    <NextIntlClientProvider locale="en" messages={{ ...messages }}>
      <OrderTemplateHead />
      <OrderTemplateList />
    </NextIntlClientProvider>
  );
}
