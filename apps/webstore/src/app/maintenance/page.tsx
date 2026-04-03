import React from "react";
import Client from "../[locale]/client";
import { getPage } from "@znode/page-builder/utils/get-page";
import { ISearchParams } from "@znode/types/search-params";

import { getPortalHeader } from "@znode/utils/server";
import { IPageStructure } from "@znode/types/visual-editor";
import { NotFound } from "@znode/base-components/components/not-found";

export default async function MaintenancePage({ searchParams }: Readonly<{ params: { id: number }; searchParams: ISearchParams }>) {
  const themeName = (await getPortalHeader()).themeName || process.env.DEFAULT_THEME;

  const url = "maintenance";
  const pageStructure: IPageStructure = await getPage({
    url,
    searchParams: searchParams,
    theme: themeName as string,
    pageCode: "maintenance",
  });

  if (!pageStructure.data.content?.length) {
    return <NotFound />;
  }

  return (
    <Client data={pageStructure.data} themeName={themeName || ""} configType="maintenance" />
  );
}