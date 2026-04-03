import { BreadCrumbs } from "../common/breadcrumb";
import { CMSBasedSearchResults } from "./CMSBasedSearchResults";
import { Heading } from "../common/heading";
import { ISearchTerm } from "@znode/types/search-term";
import { SearchCategoryFetcher } from "./SearchCategoryFetcher";

interface ISearchCategoryFetchWrapper {
  searchResult: ISearchTerm;
  searchTerm: string;
}

export function SearchCategoryFetchWrapper({ searchResult, searchTerm }: ISearchCategoryFetchWrapper) {
  const message = `Search results for "${searchTerm}"`;
  const BreadCrumbsData = {
    title: "SEARCH",
    routingLabel: "Home",
    routingPath: "/",
  };

  return (
    <>
      <div className="mb-3 pb-1">
        <BreadCrumbs customPath={BreadCrumbsData} />
      </div>
      <Heading name={message} level="h1" dataTestSelector="hdgSearchResults" />
      {searchResult && searchResult.enableCMSPageSearch ? (
        <CMSBasedSearchResults
          searchResult={searchResult as ISearchTerm}
          searchTerm={searchTerm}
          searchCMSPagesData={searchResult?.searchCMSPagesData}
          pageList={searchResult?.filteredProductData?.pageList}
          sortList={searchResult?.filteredProductData?.sortList}
          showWishlist={true}
        />
      ) : (
        <SearchCategoryFetcher searchResult={searchResult} showWishlist={true} />
      )}
    </>
  );
}
