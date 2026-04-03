"use client";

import Button from "../common/button/Button";
import { Heading } from "../common/heading";
import { useRouter } from "next/navigation";
import { useTranslationMessages } from "@znode/utils/component";

interface IHighlightInfo {
  name: string;
  description: string;
  productId: number;
  seoUrl?: string;
}

export const HighlightInfo = ({ name, description, productId, seoUrl }: IHighlightInfo) => {
  const productTranslations = useTranslationMessages("Product");
  const productUrl = seoUrl ? "/" + seoUrl : `/product/${productId}`;
  const router = useRouter();

  return (
    <div className="pb-10 mb-10" data-test-selector="divHighlightsInfoContainer">
      <Heading name={name} level="h1" dataTestSelector={`hdgProduct${productId}`} />
      <div className="mb-5" dangerouslySetInnerHTML={{ __html: description }}></div>
      <Button
        type="secondary"
        size="small"
        onClick={() => {
          router.push(productUrl);
        }}
        dataTestSelector="btnBackToProduct"
        ariaLabel="back to blog list button"
      >
        {productTranslations("backToProductPage")}
      </Button>
    </div>
  );
};
