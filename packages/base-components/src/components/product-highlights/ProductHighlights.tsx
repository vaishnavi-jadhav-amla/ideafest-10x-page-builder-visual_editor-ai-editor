/* eslint-disable max-len */
"use client";

import Image from "../common/image/Image";
import { getHighlightInfoByCode } from "../../http-request/highlight";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslationMessages } from "@znode/utils/component";
import { useModal } from "../../stores";

interface IProductHighlight {
  highlights?: IProductHighlights[];
  productId: number;
  seoUrl?: string;
  isQuickView?: boolean;
  sku?: string;
}
export interface IProductHighlights {
  highlightId?: number;
  mediaPath?: string;
  hyperlink?: string;
  highlightName?: string;
  highlightCode?: string;
  publishProductId?: number;
  displayPopup?: boolean;
  seoUrl?: string;
}
export const ProductHighlights = ({ highlights, productId, seoUrl, sku, isQuickView = false }: IProductHighlight) => {
  const [seeMore, setSeeMore] = useState<boolean>(false);
  const t = useTranslationMessages("Common");
  const router = useRouter();
  const { closeModal } = useModal();
  // Function to fetch highlight information
  const fetchHighlightInfo = async (highlightCode: string, publishProductId: number) => {
    return await getHighlightInfoByCode({ highlightCode, publishProductId });
  };

  // Function to handle redirection
  const handleHighlightRedirection = (data: IProductHighlights, highlightsAttribute: IProductHighlights, publishProductId: number, productSeoUrl: string) => {
    if (!highlightsAttribute?.highlightCode) return null;
    const { displayPopup, hyperlink } = highlightsAttribute;

    if (displayPopup) {
      if (hyperlink) window.open(highlightsAttribute.hyperlink, "_blank");
    } else {
      router.push(`/highlight?highlightCode=${data.highlightCode}&productId=${publishProductId}${productSeoUrl ? `&productSeoUrl=${productSeoUrl}` : ""}`);
      isQuickView && closeModal();
    }
  };

  // Main function to redirect to highlight page
  const redirectToHighlightPage = async (data: IProductHighlights) => {
    const publishProductId = productId || data?.publishProductId || 0;
    const url = seoUrl || data?.seoUrl || "";
    const highlightsAttribute = await fetchHighlightInfo(data.highlightCode || "", publishProductId);
    return handleHighlightRedirection(data, highlightsAttribute, publishProductId, url);
  };

  const getRedirectionHighlights = (data: IProductHighlights) => {
    return (
      <div
        className="cursor-pointer"
        onClick={() => {
          redirectToHighlightPage(data);
        }}
      >
        <Image
          imageLargePath={data?.mediaPath || ""}
          seoTitle={`${data?.highlightName || ""} ${sku} `}
          cssClass="h-6 w-6 object-contain"
          dataTestSelector={`${data?.highlightName}${productId || data?.publishProductId || 0}`}
          width={25}
          height={25}
          parentCSS=""
        />
      </div>
    );
  };

  const renderHighlights = () => {
    return (
      highlights &&
      highlights.map((renderedHighlightsData: IProductHighlights, index: number) => {
        if (seeMore === false && index > 3) return;
        const showMoreHighlights = seeMore === false && index === 3;
        return (
          <li
            key={index}
            className={` w-6 overflow-hidden ${showMoreHighlights ? "h-7  bg-gray-300 flex justify-center items-center cursor-pointer" : "h-9"}  `}
            title={`${showMoreHighlights ? t("seeMore") : renderedHighlightsData?.highlightName || ""}`}
            onClick={showMoreHighlights ? () => setSeeMore(true) : undefined}
            data-test-selector={showMoreHighlights ? "listShowMoreHighlights" : `list${renderedHighlightsData?.highlightCode || ""}Highlights`}
          >
            {showMoreHighlights ? `+${highlights?.length - index}` : getRedirectionHighlights(renderedHighlightsData)}
          </li>
        );
      })
    );
  };

  return highlights && highlights.length > 0 ? (
    <ul className="flex flex-wrap mt-3 space-x-4" data-test-selector={`listProductHighlightsContainer${productId}`}>
      {renderHighlights()}
    </ul>
  ) : null;
};
