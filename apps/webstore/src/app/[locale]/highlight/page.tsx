import { NextIntlClientProvider } from "next-intl";
import { HighlightInfo } from "@znode/base-components/components/highlight/HighlightInfo";
import { IProductHighlightsSearchParams } from "@znode/types/product";
import { getHighlightInfo } from "@znode/agents/product";
import { fetchMessages, getPortalHeader } from "@znode/utils/server";
import { getCatalogCode } from "@znode/agents/category";

export default async function HighlightInfoPage({ searchParams }: { searchParams: IProductHighlightsSearchParams }) {
  const messages = await fetchMessages(["Product"]);
  const portalData = await getPortalHeader();
  const catalogCode = await getCatalogCode(portalData);
  const highlightsData = await getHighlightInfo(searchParams.highlightCode, searchParams.productId, catalogCode);
  const { description, highlightName } = highlightsData;

  return (
    <NextIntlClientProvider messages={messages}>
      {highlightName && description ? (
        <HighlightInfo name={highlightName} description={description} productId={searchParams.productId} seoUrl={searchParams.productSeoUrl} />
      ) : null}
    </NextIntlClientProvider>
  );
}
