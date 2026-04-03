import CreateEditOrderTemplate from "@znode/base-components/account/order-templates/CreateEditOrderTemplate";
import React from "react";
import { NextIntlClientProvider } from "next-intl";
import { fetchMessages } from "@znode/utils/server";

export default async function CreateOrderTemplatePage() {
  const messages = await fetchMessages(["OrderTemplates", "Common", "BehaviorMsg", "DynamicFormTemplate"]);

  return (
    <NextIntlClientProvider locale="en" messages={{ ...messages }}>
      <CreateEditOrderTemplate classNumber={undefined} />
    </NextIntlClientProvider>
  );
}
