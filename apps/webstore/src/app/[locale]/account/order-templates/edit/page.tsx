import CreateEditOrderTemplate from "@znode/base-components/account/order-templates/CreateEditOrderTemplate";
import React from "react";
import { NextIntlClientProvider } from "next-intl";
import { fetchMessages } from "@znode/utils/server";

interface ISearchParams {
  classNumber: string;
}

export default async function EditOrderTemplatePage({ searchParams }: { searchParams: ISearchParams }) {
  const messages = await fetchMessages(["OrderTemplates", "Common", "BehaviorMsg", "DynamicFormTemplate"]);
  return (
    <NextIntlClientProvider locale="en" messages={{ ...messages }}>
      <CreateEditOrderTemplate classNumber={searchParams.classNumber} />
    </NextIntlClientProvider>
  );
}
