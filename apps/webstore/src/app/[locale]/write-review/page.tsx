import { NextIntlClientProvider } from "next-intl";
import { WriteReview } from "@znode/base-components/components/write-review/WriteReview";
import { getResourceMessages } from "@znode/utils/server";
import NotFound from "../../not-found";
import { getPublishProductDetails } from "@znode/agents/review";

export default async function WriteReviewPage({ searchParams }: Readonly<{ searchParams: { id: number; name: string; url: string; sku: string } }>) {
  const reviewMessages = await getResourceMessages("Review");
  const commonMessages = await getResourceMessages("Common");

  const publishProductId = Number(searchParams?.id) || 0;
  const productName = searchParams.name || "";

  if (!publishProductId) {
    return <NotFound />;
  }

  const productData = await getPublishProductDetails(publishProductId);
  if (!productData) {
    return <NotFound />;
  }

  return (
    <NextIntlClientProvider messages={{ ...reviewMessages, ...commonMessages }}>
      <WriteReview publishProductId={publishProductId} productName={productName || productData?.name || ""} sku={productData?.sku || ""} seoUrl={productData?.seoUrl || ""} />
    </NextIntlClientProvider>
  );
}
