"use client";

import { IPageList, ISortingOptions } from "@znode/types/portal";
import { useEffect, useState } from "react";

import { CMSSearchPages } from "./CMSSearchPages";
import { ISearchCMSPages } from "@znode/types/keyword-search";
import { ISearchTerm } from "@znode/types/search-term";
import { SearchCategoryFetcher } from "./SearchCategoryFetcher";
import { useSearchParams } from "next/navigation";

interface ISearchCategoryFetcher {
  searchResult: ISearchTerm;
  searchTerm: string;
  searchCMSPagesData: ISearchCMSPages;
  pageList?: IPageList[];
  sortList?: ISortingOptions[];
  showWishlist?: boolean;
}

export function CMSBasedSearchResults({ searchResult, searchTerm, searchCMSPagesData, ...rest }: ISearchCategoryFetcher) {
  const [activeTab, setActiveTab] = useState("productsTab");
  const { filteredProductData } = searchResult ?? {};
  const { totalProducts: totalProductCount = 0, pageList = [], pageSize } = filteredProductData ?? {};
  const { totalCMSPageCount } = searchCMSPagesData;

  const searchParams = useSearchParams();

  const handleTabClick = (str: string) => {
    setActiveTab(str);
  };

  useEffect(() => {
    if (searchParams.get("activeTab") === "pagesTab") {
      setActiveTab("pagesTab");
    }
  }, [searchParams]);

  return (
    <>
      <ul className="flex border-b border-inputBorderColor mb-3" data-test-selector="listSearchTabContainer">
        <li
          className={`cursor-pointer px-4 py-2 ${activeTab === "productsTab" ? "font-semibold border-b-2 border-black" : ""}`}
          onClick={() => handleTabClick("productsTab")}
          data-test-selector="listProductsTab"
        >{`${totalProductCount ?? 0} Products`}</li>
        <li
          className={`cursor-pointer px-4 py-2 ${activeTab === "pagesTab" ? "font-semibold border-b-2 border-black" : ""}`}
          onClick={() => handleTabClick("pagesTab")}
          data-test-selector="listPagesTab"
        >{`${totalCMSPageCount} Pages`}</li>
      </ul>

      {activeTab === "productsTab" && <SearchCategoryFetcher searchResult={searchResult} {...rest} />}
      {activeTab === "pagesTab" && <CMSSearchPages searchCMSPagesData={searchCMSPagesData} searchTerm={searchTerm} pageList={pageList} pageSize={pageSize} />}
    </>
  );
}
