import { ISearchParams } from "@znode/types/search-params";
import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import React from "react";
import { SEO_SETTINGS, SEO_TYPES } from "@znode/constants/seo-types";
import { fetchMessages, getPortalHeader } from "@znode/utils/server";
import { getSeoData } from "@znode/agents/robot-tag/robot-tag";
import Client from "../../client";
import { NotFound } from "@znode/base-components/components/not-found";
import { validateAndGenerateSeoUrl } from "@znode/page-builder/utils/validate-and-generate-seo-url";
import { getPageStructure } from "@znode/page-builder/utils/get-page-structure";

export async function generateMetadata({ params }: { params: { id: number }; searchParams: ISearchParams }): Promise<Metadata | null> {
  const seoDetails = await getSeoData(undefined, params.id, SEO_TYPES.CONTENT_PAGE);
  return seoDetails;
}

const localeMessages = ["Product", "Common", "Pagination", "Addon", "Price", "WishList", "Inventory", "Email"];
async function ContentPage({ params, searchParams }: { params: { id: number }; searchParams: ISearchParams }) {
  const portalData = await getPortalHeader();
  const themeName = portalData.themeName || process.env.DEFAULT_THEME;

  let url = "content/" + params.id;
  const seoData = await validateAndGenerateSeoUrl(url);

  let contentPageCode;
  let contentPageId;
  if (seoData  && (seoData.seoId || seoData.seoCode)) {
    const seoTypeName = String(seoData.name).toLowerCase();
    const seoId = seoData.seoId;
    url = `${seoTypeName}/${seoId}`;
    if (seoTypeName === SEO_SETTINGS.CONTENT_PAGE) {
      contentPageCode = seoData.seoCode;
      contentPageId = seoData.seoId;
    }
  }

  const configType = "content";
  const { pageStructure, isNotFound, viewCustom404 } = await getPageStructure(
    url,
    searchParams,
    themeName, // theme1, theme2
    configType,
    contentPageCode,
    contentPageId
  );
  if (isNotFound) return <NotFound viewCustom404={viewCustom404} />;

  const messages = await fetchMessages(localeMessages);

  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <Client data={pageStructure.data} themeName={themeName || ""} configType={configType} />
    </NextIntlClientProvider>
  );
}

export default ContentPage;
