import { ISearchParams } from "@znode/types/search-params";
import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import React from "react";
import { SEO_TYPES } from "@znode/constants/seo-types";
import { fetchMessages, getPortalHeader } from "@znode/utils/server";
import { getSeoData } from "@znode/agents/robot-tag/robot-tag";
import Client from "../../client";
import { NotFound } from "@znode/base-components/components/not-found";
import { getPageStructure } from "@znode/page-builder/utils/get-page-structure";
import { JsonLd } from "@znode/base-components/common/schema";
import { productSchema } from "@znode/utils/component";
import { headers } from "next/headers";
import { fetchAndMapPDPPrice } from "@znode/agents/common";

export async function generateMetadata({ params }: { params: { id: number }; searchParams: ISearchParams }): Promise<Metadata | null> {
  const seoDetails = await getSeoData(undefined, params.id, SEO_TYPES.PRODUCT);
  return seoDetails;
}

const localeMessages = ["Product", "Common", "Pagination", "Addon", "Price", "WishList", "Inventory", "Email", "WishList"];
async function ProductDetailPage({ params, searchParams }: { params: { id: number }; searchParams: ISearchParams }) {
  const themeName = (await getPortalHeader()).themeName || process.env.DEFAULT_THEME;

  const url = "product/" + params.id;
  let configType = "product";
  const { pageStructure, isNotFound, viewCustom404, updatedConfigType } = await getPageStructure(
    url,
    searchParams,
    themeName, // theme1, theme2
    configType
  );
  configType = updatedConfigType;
  if (isNotFound) return <NotFound viewCustom404={viewCustom404} />;

  const messages = await fetchMessages(localeMessages);
  const headersList = headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const currentUrl = `${protocol}://${host}`;
  const contentArray = pageStructure.data.content;

  // Find the ProductDetailsPage block
  const productDetailsBlock = contentArray.find((block) => block.type === "ProductDetailsPage");

  // Access productBasicDetails
  const productDataResponse = productDetailsBlock?.props?.response?.data;
  const productBasicDetails = productDataResponse?.productBasicDetails;

  if (process.env.ENABLE_REAL_TIME_PRICING !== "false") {
    if (productDataResponse?.productBasicDetails?.sku) {
      productDataResponse.productBasicDetails = await fetchAndMapPDPPrice(productBasicDetails);
    }
  }

  const productData = productSchema(productBasicDetails, currentUrl || "");

  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <Client data={pageStructure.data} themeName={themeName || ""} configType={configType} />
      <JsonLd jsonLdData={productData} />
    </NextIntlClientProvider>
  );
}

export default ProductDetailPage;
