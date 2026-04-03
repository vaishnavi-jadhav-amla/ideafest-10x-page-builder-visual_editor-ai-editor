import { getSearchResult } from "@znode/agents/search";
import { ISearchParams } from "@znode/types/search-params";
import { ISearchTerm } from "@znode/types/search-term";
import {SearchCategoryFetcher} from "@znode/base-components/components/search-term";
/**
 *
 * @param props This will be used to render product details page. render page details.
 * @returns will return jsx component
 */

export default async function searchResultDisplay({ searchParams }: { searchParams: ISearchParams }) {
  const searchResult = await getSearchResult(searchParams);
  return <>{searchResult && <SearchCategoryFetcher searchResult={searchResult as ISearchTerm} />}</>;
}
