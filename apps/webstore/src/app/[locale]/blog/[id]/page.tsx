import React from "react";
import { ISearchParams } from "@znode/types/search-params";
import { fetchMessages, getPortalHeader } from "@znode/utils/server";
import { NextIntlClientProvider } from "next-intl";
import Client from "../../client";
import { NotFound } from "@znode/base-components/components/not-found";
import { getPageStructure } from "@znode/page-builder/utils/get-page-structure";

const localeMessages = ["Blog", "Common"];

export default async function BlogDetailsPage({ params, searchParams }: Readonly<{ params: { id: number }; searchParams: ISearchParams }>) {
  const url = "blog/" + params.id;
  const themeName = (await getPortalHeader()).themeName || process.env.DEFAULT_THEME;

  let configType = "blog-details";
  const { pageStructure, isNotFound, viewCustom404, updatedConfigType } = await getPageStructure(
    url,
    searchParams,
    themeName, // theme1, theme2
    configType
  );
  configType = updatedConfigType;
  if (isNotFound) return <NotFound viewCustom404={viewCustom404} />;

  const messages = await fetchMessages(localeMessages);
  return (
    <NextIntlClientProvider
      locale="en"
      messages={{
        ...messages,
      }}
    >
      <Client data={pageStructure.data} themeName={themeName || ""} configType={configType} />
    </NextIntlClientProvider>
  );
}
