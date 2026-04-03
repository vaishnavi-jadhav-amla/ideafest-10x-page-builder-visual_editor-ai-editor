import { fetchMessages, getPortalHeader } from "@znode/utils/server";

import Client from "../../client";
import { ISearchParams } from "@znode/types/search-params";
import { NextIntlClientProvider } from "next-intl";
import { NotFound } from "@znode/base-components/components/not-found";
import React from "react";
import { getPageStructure } from "@znode/page-builder/utils/get-page-structure";

const localeMessages = ["Common", "Product", "FacetChipList", "Facet", "Pagination", "WishList"];

export default async function BrandDetailsPage({ params, searchParams }: Readonly<{ params: { id: number | string }; searchParams: ISearchParams }>) {
  const themeName = (await getPortalHeader()).themeName || process.env.DEFAULT_THEME;

  const url = "brand/" + params.id;
  let configType = "brand-details";
  const { pageStructure, isNotFound, viewCustom404, updatedConfigType } = await getPageStructure(url, searchParams, themeName, configType);
  configType = updatedConfigType;
  if (isNotFound) return <NotFound viewCustom404={viewCustom404} />;

  const messages = await fetchMessages(localeMessages);
  return (
    <NextIntlClientProvider
      messages={{
        ...messages,
      }}
    >
      <Client data={pageStructure.data} themeName={themeName || ""} configType={configType} />
    </NextIntlClientProvider>
  );
}
