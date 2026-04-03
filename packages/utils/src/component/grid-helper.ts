import { PAGINATION } from "@znode/constants/pagination";
import { SETTINGS } from "@znode/constants/settings";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateQueryString = (path: string | null, searchParams: any, newValue: number | string | string[], type: string, pageSize = "" as string) => {
  const getQueryString = () => {
    let facetParams = searchParams.get("facetGroup");
    if (facetParams) facetParams = urlEncodeSpecialCharacters(facetParams);
    const searchTerm = searchParams.get("searchTerm");
    const sortParams = searchParams.get("sort");
    const pageSizeParams = pageSize || searchParams.get("pageSize") || PAGINATION.DEFAULT_PAGINATION;
    const pageNumberParams = searchParams.get("pageNumber") || PAGINATION.DEFAULT_TABLE_PAGE_INDEX;
    const brandNameParams = searchParams.get("brandName");

    const getLength = (value: number | string | string[]) => {
      if (Array.isArray(value)) {
        return value.length;
      } else return 0;
    };
    const lengthOfNewValue = getLength(newValue);

    switch (type) {
      case "facet":
        if (pageSizeParams && sortParams && lengthOfNewValue > 0) {
          return `${path}?facetGroup=${newValue}&fromSearch=true&sort=${sortParams}&pageSize=${pageSizeParams}&pageNumber=${SETTINGS.DEFAULT_TABLE_PAGE_INDEX}`;
        } else if (pageSizeParams && sortParams) {
          return `${path}?sort=${sortParams}&pageSize=${pageSizeParams}&pageNumber=${SETTINGS.DEFAULT_TABLE_PAGE_INDEX}`;
        } else if (pageSizeParams && lengthOfNewValue > 0) {
          return `${path}?facetGroup=${newValue}&fromSearch=true&pageSize=${pageSizeParams}&pageNumber=${SETTINGS.DEFAULT_TABLE_PAGE_INDEX}`;
        } else if (sortParams && lengthOfNewValue > 0) {
          return `${path}?facetGroup=${newValue}&fromSearch=true&sort=${sortParams}`;
        } else if (sortParams) {
          return `${path}?sort=${sortParams}`;
        } else if (pageSizeParams) {
          return `${path}?pageSize=${pageSizeParams}&pageNumber=${SETTINGS.DEFAULT_TABLE_PAGE_INDEX}`;
        } else {
          return `${path}?facetGroup=${newValue}&fromSearch=true`;
        }
        break;
      case "sort":
        if (facetParams && pageSizeParams && pageNumberParams) {
          return `${path}?facetGroup=${facetParams}&fromSearch=true&sort=${newValue}&pageSize=${pageSizeParams}&pageNumber=${PAGINATION.DEFAULT_TABLE_PAGE_INDEX}`;
        } else if (facetParams) {
          return `${path}?facetGroup=${facetParams}&fromSearch=true&sort=${newValue}`;
        } else if (searchTerm) {
          return `${path}?searchTerm=${searchTerm}&fromSearch=true&sort=${newValue}&pageSize=${pageSizeParams}&pageNumber=${PAGINATION.DEFAULT_TABLE_PAGE_INDEX}`;
        } else if (pageSizeParams) {
          return `${path}?sort=${newValue}&pageSize=${pageSizeParams}&pageNumber=${PAGINATION.DEFAULT_TABLE_PAGE_INDEX}`;
        } else {
          return `${path}?sort=${newValue}`;
        }
        break;
      case "pagination":
        if (facetParams && sortParams) {
          return `${path}?facetGroup=${facetParams}&fromSearch=true&sort=${sortParams}&pageSize=${newValue}&pageNumber=${SETTINGS.DEFAULT_TABLE_PAGE_INDEX}`;
        } else if (searchTerm) {
          return `${path}?searchTerm=${searchTerm}&sort=${sortParams}&pageSize=${newValue}&pageNumber=${SETTINGS.DEFAULT_TABLE_PAGE_INDEX}`;
        } else if (sortParams) {
          return `${path}?sort=${sortParams}&pageSize=${newValue}&pageNumber=1`;
        } else if (facetParams) {
          return `${path}?facetGroup=${facetParams}&fromSearch=true&pageSize=${newValue}&pageNumber=${SETTINGS.DEFAULT_TABLE_PAGE_INDEX}`;
        } else if (brandNameParams) {
          return `${path}?brandName=${brandNameParams}&pageSize=${newValue}&pageNumber=${SETTINGS.DEFAULT_TABLE_PAGE_INDEX}`;
        } else {
          return `${path}?pageSize=${newValue}&pageNumber=${SETTINGS.DEFAULT_TABLE_PAGE_INDEX}`;
        }
        break;
      case "pageNumber":
        if (facetParams && sortParams && pageSizeParams) {
          return `${path}?facetGroup=${facetParams}&fromSearch=true&sort=${sortParams}&pageSize=${pageSizeParams}&pageNumber=${newValue}`;
        } else if (searchTerm) {
          return `${path}?searchTerm=${searchTerm}&sort=${sortParams}&pageSize=${pageSizeParams}&pageNumber=${newValue}`;
        } else if (sortParams && pageSizeParams) {
          return `${path}?sort=${sortParams}&pageSize=${pageSizeParams}&pageNumber=${newValue}`;
        } else if (facetParams && pageSizeParams) {
          return `${path}?facetGroup=${facetParams}&fromSearch=true&pageSize=${pageSizeParams}&pageNumber=${newValue}`;
        } else if (facetParams) {
          return `${path}?facetGroup=${facetParams}&fromSearch=true&pageSize=${pageSizeParams}&pageNumber=${newValue}`;
        } else if (sortParams) {
          return `${path}?sort=${sortParams}&pageSize=${pageSizeParams}&pageNumber=${newValue}`;
        } else if (brandNameParams) {
          return `${path}?brandName=${brandNameParams}&pageSize=${pageSizeParams ?? SETTINGS.DEFAULT_PAGINATION}&pageNumber=${newValue}`;
        } else {
          return `${path}?pageSize=${pageSizeParams ?? SETTINGS.DEFAULT_PAGINATION}&pageNumber=${newValue}`;
        }
        break;
      default:
        return `${path}`;
    }
  };

  const categoryCode = searchParams.get("categoryCode");
  const activeCategory = searchParams.get("activeCategory");
  const searchCategory = searchParams.get("searchCategory");


  let queryString = getQueryString();
  if (categoryCode) queryString += `&categoryCode=${encodeURIComponent(categoryCode)}`;
  if(activeCategory) queryString += `&activeCategory=${encodeURIComponent(activeCategory)}`;
  if(searchCategory) queryString += `&searchCategory=${encodeURIComponent(searchCategory)}`;

  return queryString;
};

export const urlEncodeSpecialCharacters = (str: string) => {
  const encodedStr = encodeURIComponent(str);
  return encodedStr;
};
