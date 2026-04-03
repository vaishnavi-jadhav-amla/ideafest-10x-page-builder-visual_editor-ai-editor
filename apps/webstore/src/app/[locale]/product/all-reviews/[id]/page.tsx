import { NextIntlClientProvider } from "next-intl";
import { ProductReviewsList } from "@znode/base-components/components/product-reviews-list";
import React from "react";
import { fetchMessages } from "@znode/utils/server";

export default async function AllReviewsPage({ params }: { params: { id: string } }) {
  const messages = await fetchMessages(["ProductReviewsList", "Common"]);

  return (
    <NextIntlClientProvider messages={{ ...messages }}>
      <ProductReviewsList productId={params.id} />
    </NextIntlClientProvider>
  );
}
