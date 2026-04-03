import { fetchMessages, getPortalHeader } from "@znode/utils/server";

import Client from "../../client";
import { ISearchParams } from "@znode/types/search-params";
import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { NotFound } from "@znode/base-components/components/not-found";
import { SEO_TYPES } from "@znode/constants/seo-types";
import { getSeoData } from "@znode/agents/robot-tag/robot-tag";
import { getPageStructure } from "@znode/page-builder/utils/get-page-structure";
import { productListSchema } from "@znode/utils/component";
import { JsonLd } from "@znode/base-components/common/schema";
import { headers } from "next/headers";
import { fetchAndMapPLPPrices } from "@znode/agents/common";

export async function generateMetadata({ params }: { params: { id: number } }): Promise<Metadata | null> {
  const seoDetails = await getSeoData(undefined, params.id, SEO_TYPES.CATEGORY);
  return seoDetails;
}

const localeMessages = ["Product", "Common", "Facet", "Pagination", "FacetChipList", "Addon", "Price", "WishList", "Inventory", "WishList"];
export default async function CategoryPage({ params, searchParams }: Readonly<{ params: { id: number }; searchParams: ISearchParams }>) {
  const url = "category/" + params.id;

  const themeName = (await getPortalHeader()).themeName || (process.env.DEFAULT_THEME as string);
  let configType = "category";
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

  // Find the ProductListPage block
  const productListBlock = contentArray.find((data) => data.type === "ProductListPage");

  //Access ProductList
  const productsListData = productListBlock && productListBlock.props.response.data.productsData;

  // Mapping realtime product prices.
  if (process.env.ENABLE_REAL_TIME_PRICING !== "false") {
    if (Array.isArray(productsListData?.productList) && productsListData.productList.length > 0) {
      productsListData.productList = await fetchAndMapPLPPrices(productsListData.productList);
    }
  }

  const jsonLdData = productListSchema(productsListData.productList, currentUrl || "");

  return (
    <NextIntlClientProvider
      messages={{
        ...messages,
      }}
    >
      <Client data={pageStructure.data} themeName={themeName || ""} configType={configType} />
      <JsonLd jsonLdData={jsonLdData} />
    </NextIntlClientProvider>
  );
}
