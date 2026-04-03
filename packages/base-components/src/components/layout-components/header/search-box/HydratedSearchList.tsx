"use client";

import { ISearchBrand, ISearchCategory, ISearchContent } from "@znode/types/search-params";

import Link from "next/link";
import { useTranslations } from "next-intl";

export const HydratedSearchList = (props: {
  categories: (ISearchCategory | ISearchBrand | ISearchContent)[];
  handleClick: () => void;
  hydratedKey: string;
  isMobile: boolean;
  title: string;
  isContent?: boolean;
}) => {
  const { categories, handleClick, isMobile, title } = props || {};
  const searchMessage = useTranslations("Search");

  return (
    <>
      <h1 className={`${isMobile ? "mb-0 pt-0" : "mb-3 pt-3"} mx-3 font-bold text-lg`}>{searchMessage(title)}</h1>
      <div className={`hydratedSearchNavigation ${isMobile ? "overflow-x-auto grid grid-flow-col auto-cols-max overscroll-contain pb-3 pt-2 mb-1" : ""}`}>
        {categories?.map((history, index) => (
          <div
            key={index}
            className="px-2 py-1 cursor-pointer text-sm w-fit flex items-center"
            onClick={() => handleClick()}
            data-test-selector={`searchHistorySuggestion${index}`}
          >
            <Link href={history?.link || "#"} className="exclude-click" data-test-selector="linkProductDetail">
              <div className="flex border border-black border-solid rounded px-2 hover:bg-black hover:text-white text-black">
                {history.type === "Category" && "categoryName" in history ? history.categoryName : history.type === "Brand" && "brandName" in history ? history.brandName : null}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
};
