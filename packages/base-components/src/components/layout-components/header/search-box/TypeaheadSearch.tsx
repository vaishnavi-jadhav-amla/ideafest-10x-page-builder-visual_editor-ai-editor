"use client";

import { IHydratedSearchActivityModel, IHydratedSearchModel, ISearchCategory } from "@znode/types/search-params";
import { IProductPricingDetailsResponse, ISearchFacetsResponse, ISearchFacetsValueResponse, ITypeaheadHoveredValuesRef } from "@znode/types/search-typeahead";
import { getHydratedTypeaheadSearchContent, getPrice } from "../../../../http-request/search-hydrated";
import { useCallback, useEffect, useState } from "react";

import { AREA } from "@znode/logger/server";
import Button from "../../../common/button/Button";
import { IProductListCard } from "@znode/types/product";
import { UpIcon } from "../../../common/icons";
import { formatTestSelector } from "@znode/utils/common";
import { logClient } from "@znode/logger";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { debounce } from "lodash";
import { TypeaheadProductCard } from "../../../common/product-card/TypeaheadProductCard";
interface ITypeaheadSearchModel {
  hydratedSearchActivityList?: IHydratedSearchActivityModel[];
  hydratedFacetList?: ISearchFacetsResponse[];
  hydratedSearchCategoryList?: ISearchCategory[];
  hydratedSearchProductList?: IProductListCard[];
  setHydratedSearchProductList?: React.Dispatch<React.SetStateAction<IProductListCard[]>>;
  searchTerm?: string;
  hydratedTotalProductCount?: number;
  hydratedSkuList?: string[];
  loginToSeePricing: string;
  setHydratedTotalProductCount?: React.Dispatch<React.SetStateAction<number>>;
  setIsAutocompleteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isAllowIndexing?: boolean;
  // eslint-disable-next-line no-unused-vars
  onHover: (arg1: string) => void;
  setHydratedFacetList?: React.Dispatch<React.SetStateAction<ISearchFacetsResponse[]>>;
  setHydratedCategoryList?: React.Dispatch<React.SetStateAction<ISearchCategory[]>>;
  setHydratedSkuList?: React.Dispatch<React.SetStateAction<string[]>>;
  handleClickOutside?: () => void;
  isMobile?: boolean;
  typeaheadHoveredValuesRef?: React.MutableRefObject<ITypeaheadHoveredValuesRef>;
}

interface ICategory {
  categoryName: string;
  categoryCode: string;
}
export const TypeaheadSearch = ({
  hydratedSearchActivityList,
  hydratedFacetList,
  hydratedSearchCategoryList,
  hydratedSearchProductList,
  setHydratedSearchProductList,
  searchTerm,
  loginToSeePricing,
  hydratedTotalProductCount,
  hydratedSkuList,
  setHydratedTotalProductCount,
  isAllowIndexing,
  setIsAutocompleteOpen,
  onHover,
  setHydratedFacetList,
  setHydratedCategoryList,
  setHydratedSkuList,
  handleClickOutside,
  isMobile,
  typeaheadHoveredValuesRef,
}: ITypeaheadSearchModel) => {
  const [hoveredValue, setHoveredValue] = useState<string | { attributeCode: string; attributeValue: string }>("");
  const [hoveredSearchKeyword, setHoveredSearchKeyword] = useState<string>("");
  const globalAttributes = { loginToSeePricingAndInventory: loginToSeePricing };
  const searchMessage = useTranslations("Search");
  const common = useTranslations("Common");
  const router = useRouter();
  const maxKeywordLength = 6;

  const hoveredValuesRefSetter = (hoveredSearchKeywordParam: string, hoveredValueParam: string | { attributeCode: string; attributeValue: string }) => {
    if (typeaheadHoveredValuesRef) {
      typeaheadHoveredValuesRef.current = { hoveredSearchKeyword: hoveredSearchKeywordParam, hoveredValue: hoveredValueParam };
    }
  };

  const getFilteredProductsList = async (data: string | { attributeCode: string; attributeValue: string }, isCategoryCode: string, searchTerm: string) => {
    const normalizedFilter = typeof data === "string" ? data : JSON.stringify(data);
    const hydratedSearch = await getHydratedTypeaheadSearchContent({ filter: normalizedFilter, isCategoryCode: isCategoryCode, searchTerm: searchTerm });

    setHydratedSearchProductList && setHydratedSearchProductList(hydratedSearch?.hydratedSearchProductList as IProductListCard[]);
    setHydratedSkuList && setHydratedSkuList(hydratedSearch?.hydratedSkuList || []);
    setHydratedTotalProductCount && setHydratedTotalProductCount(hydratedSearch?.totalProductCount as number);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedGetFilteredProductsList = useCallback(debounce(getFilteredProductsList, 600), []);

  const mapProductsWithPrice = (priceList: IProductPricingDetailsResponse[], hydratedSearchProductList?: IProductListCard[]) => {
    try {
      const pricingMap = new Map(priceList?.map((p: IProductPricingDetailsResponse) => [p.sku, p]));
      const enrichedProducts = hydratedSearchProductList?.map((product: IProductListCard) => {
        const pricing = pricingMap.get(product.sku);
        return {
          ...product,
          productPricingDetails: pricing,
        };
      });

      enrichedProducts && setHydratedSearchProductList && setHydratedSearchProductList(enrichedProducts as IProductListCard[]);
    } catch (error) {
      logClient.error(AREA.SEARCH, String(error));
      return {} as IHydratedSearchModel;
    }
  };

  const fetchPrice = async (skuList: string[], hydratedSearchProductList: IProductListCard[]) => {
    try {
      const skuListString = skuList?.join(",");
      const priceList = await getPrice({ skuList: skuListString });
      if (priceList) {
        mapProductsWithPrice(priceList as IProductPricingDetailsResponse[], hydratedSearchProductList as IProductListCard[]);
      }
    } catch (error) {
      logClient.error(AREA.SEARCH, String(error));
      return {} as IProductPricingDetailsResponse;
    }
  };

  useEffect(() => {
    !isAllowIndexing && hydratedSearchProductList && fetchPrice(hydratedSkuList as string[], hydratedSearchProductList);
    if (typeaheadHoveredValuesRef && typeaheadHoveredValuesRef.current) {
      const hoveredSearchKeyword = typeaheadHoveredValuesRef.current.hoveredSearchKeyword;
      const hoveredValue = typeaheadHoveredValuesRef.current.hoveredValue;
      setHoveredSearchKeyword(hoveredSearchKeyword || "");
      setHoveredValue(hoveredValue || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydratedSkuList]);

  const onFilterClick = (filter: ICategory | { attributeCode: string; attributeValue: string }, isCategoryCode: boolean) => {
    if (isCategoryCode) {
      const category = filter as ICategory;
      setIsAutocompleteOpen(false);
      router.push(
        `/search/search-term/${encodeURIComponent(encodeURIComponent(searchTerm as string))}?categoryCode=${encodeURIComponent(
          category.categoryCode
        )}&searchCategory=${encodeURIComponent(category.categoryCode)}&activeCategory=${encodeURIComponent(category.categoryName)}`
      );
    } else {
      const attribute = filter as { attributeCode: string; attributeValue: string };
      setIsAutocompleteOpen(false);
      router.push(
        `/search/search-term/${encodeURIComponent(encodeURIComponent(searchTerm as string))}?facetGroup=${encodeURIComponent(attribute.attributeCode)}|${encodeURIComponent(
          attribute.attributeValue
        )}`
      );
    }
  };

  const handleRedirect = (searchKeyword: string, hoveredFilter?: string | { attributeCode: string; attributeValue: string }) => {
    setIsAutocompleteOpen(false);
    if (hoveredFilter) {
      if (typeof hoveredFilter === "object") {
        router.push(
          `/search/search-term/${encodeURIComponent(encodeURIComponent(searchKeyword as string))}?facetGroup=${encodeURIComponent(
            hoveredFilter.attributeCode
          )}|${encodeURIComponent(hoveredFilter.attributeValue)}`
        );
      } else {
        router.push(`/search/search-term/${encodeURIComponent(encodeURIComponent(searchKeyword as string))}?categoryCode=${encodeURIComponent(hoveredFilter)}`);
      }
    } else router.push(`/search/search-term/${encodeURIComponent(encodeURIComponent(searchKeyword))}`);
  };

  const onSearchKeywordHover = async (searchKeyword: string) => {
    const filteredKeywordData = await getHydratedTypeaheadSearchContent({ searchTerm: searchKeyword });

    setHydratedSearchProductList && setHydratedSearchProductList((filteredKeywordData?.hydratedSearchProductList as IProductListCard[]) || []);
    setHydratedTotalProductCount && setHydratedTotalProductCount(filteredKeywordData?.totalProductCount as number);
    setHydratedFacetList && setHydratedFacetList(filteredKeywordData?.hydratedFacetList || []);
    setHydratedCategoryList && setHydratedCategoryList(filteredKeywordData?.hydratedSearchCategoryList || []);
    setHydratedSkuList && setHydratedSkuList(filteredKeywordData?.hydratedSkuList || []);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearchKeywordHover = useCallback(debounce(onSearchKeywordHover, 400), []);

  const updatedKeyword = (keyword: string): string => {
    if (!keyword) return "";
    let updatedKeyword = keyword;
    if (keyword.length > maxKeywordLength) {
      updatedKeyword = updatedKeyword.substring(0, maxKeywordLength) + "...";
    }
    return updatedKeyword;
  };

  const mobileViewLiClass = "px-2 cursor-pointer border border-black border-solid rounded hover:bg-black hover:text-white text-black text-sm ";
  const mobileViewUlClass = "grid grid-flow-col auto-cols-max overflow-x-auto overscroll-contain gap-3 items-center pl-3 ";

  return (
    <div className="grid grid-cols-5 gap-3 bg-white absolute border border-gray-300 border-t-0 shadow-md max-h-[70vh] md:max-h-[80vh] overflow-y-auto z-10 exclude-click w-full lg:w-[770px] xl:w-[1024px] 2xl:w-full">
      <div className={` ${isMobile ? "py-3" : ""} col-span-full sm:col-span-1 bg-[#f1f1f1]`}>
        <h1 className={`mb-1 text-lg font-bold ${isMobile ? "mx-3 pb-1 " : "border-b border-separatorColor py-3 pl-3"} `}>{searchMessage("suggestedSearches")}</h1>
        <ul className={`${isMobile ? mobileViewUlClass + "pb-5 " : "px-3"}  `} data-test-selector="listSearchKeywordContainer">
          {hydratedSearchActivityList && hydratedSearchActivityList.length > 0 ? (
            hydratedSearchActivityList?.map((searchTerms: { searchKeyword: string }, index: number) => {
              return (
                <li
                  className={`${hoveredSearchKeyword === searchTerms?.searchKeyword ? "text-hoverColor decoration-hoverColor underline" : ""} cursor-pointer w-full break-words ${
                    isMobile ? mobileViewLiClass + "my-1" : "mb-2"
                  } `}
                  onClick={() => {
                    handleRedirect(searchTerms?.searchKeyword);
                  }}
                  onMouseEnter={() => {
                    debouncedSearchKeywordHover(searchTerms?.searchKeyword);
                    setHoveredSearchKeyword(searchTerms?.searchKeyword);
                    setHoveredValue("");
                    hoveredValuesRefSetter(searchTerms?.searchKeyword, "");
                  }}
                  data-test-selector={`${formatTestSelector("list", searchTerms?.searchKeyword || "")}`}
                  key={index}
                >
                  {searchTerms?.searchKeyword}
                </li>
              );
            })
          ) : (
            <li
              onClick={() => {
                handleRedirect(searchTerm as string);
              }}
              onMouseEnter={() => {
                onHover(searchTerm as string);
                setHoveredSearchKeyword(searchTerm as string);
                setHoveredValue("");
                hoveredValuesRefSetter(searchTerm as string, "");
              }}
              data-test-selector={`${formatTestSelector("list", (searchTerm as string) || "")}`}
              className={`${hoveredSearchKeyword === searchTerm ? "text-hoverColor decoration-hoverColor underline" : ""} cursor-pointer w-fit ${
                isMobile ? mobileViewLiClass : ""
              } py-1`}
            >
              {searchTerm}
            </li>
          )}
        </ul>
      </div>
      <div className={`col-span-full sm:col-span-1 ${isMobile ? "order-3" : ""}`}>
        {hydratedSearchCategoryList && hydratedSearchCategoryList?.length > 0 ? (
          <>
            <h1 className={`mb-1 text-lg font-bold ${isMobile ? "mx-3 pb-1 " : "border-b border-separatorColor py-3 "} `}>{searchMessage("categories")}</h1>
            <ul className={`${isMobile ? mobileViewUlClass + "pb-5 " : "mb-3"}`}>
              {hydratedSearchCategoryList?.map((category: ICategory, index: number) => {
                return (
                  <li
                    onMouseEnter={() => {
                      setHoveredValue(category?.categoryCode);
                      hoveredValuesRefSetter(hoveredSearchKeyword || "", category?.categoryCode);
                      debouncedGetFilteredProductsList(category?.categoryCode, "true", typeaheadHoveredValuesRef?.current?.hoveredSearchKeyword || (searchTerm as string));
                    }}
                    className={`${
                      (typeof hoveredValue === "object" ? hoveredValue?.attributeValue : hoveredValue) === category?.categoryCode
                        ? "text-hoverColor decoration-hoverColor underline"
                        : ""
                    } cursor-pointer w-fit ${isMobile ? mobileViewLiClass : ""}   `}
                    onClick={() => onFilterClick(category, true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onFilterClick(category, true);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    key={index}
                    data-test-selector={`${formatTestSelector("list", category?.categoryCode as string)}`}
                  >
                    {category?.categoryName}
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <></>
        )}
        <div>
          {hydratedFacetList?.map((facet: { attributeCode: string; attributeValues: ISearchFacetsValueResponse[]; attributeName: string }, index: number) => {
            return (
              <>
                <h1 className={`pb-1 mb-1 text-lg font-bold ${isMobile ? "mx-3" : "border-b border-separatorColor"}`}>{facet?.attributeName}</h1>
                <ul className={`${isMobile ? mobileViewUlClass + "pb-5 " : "mb-3"}`} key={index}>
                  {facet?.attributeValues?.map((facetValue: { label: string; attributeValue: string }, index: number) => {
                    return (
                      <li
                        onMouseEnter={() => {
                          setHoveredValue({ attributeCode: facet?.attributeCode, attributeValue: facetValue?.attributeValue });
                          hoveredValuesRefSetter(hoveredSearchKeyword || "", { attributeCode: facet?.attributeCode, attributeValue: facetValue?.attributeValue });
                          debouncedGetFilteredProductsList(
                            { attributeCode: facet?.attributeCode, attributeValue: facetValue?.attributeValue },
                            "false",
                            typeaheadHoveredValuesRef?.current?.hoveredSearchKeyword || (searchTerm as string)
                          );
                        }}
                        className={`${
                          (typeof hoveredValue === "object" ? hoveredValue?.attributeValue : hoveredValue) === facetValue?.attributeValue
                            ? "text-hoverColor decoration-hoverColor underline"
                            : ""
                        } cursor-pointer w-fit ${isMobile ? mobileViewLiClass : ""} `}
                        onClick={() => onFilterClick({ attributeCode: facet?.attributeCode, attributeValue: facetValue?.attributeValue }, false)}
                        key={index}
                        data-test-selector={`${formatTestSelector("list", facet?.attributeCode as string)}`}
                      >
                        {facetValue?.label}
                      </li>
                    );
                  })}
                </ul>
              </>
            );
          })}
        </div>
      </div>
      <div className="col-span-full sm:col-span-3 grid grid-cols-4 gap-3">
        <div className={`col-span-4 ${isMobile ? "" : "py-3"}`}>
          <div className={` ${isMobile ? "" : "sticky inset-0 z-50"} flex items-start justify-between bg-white pb-1 `}>
            <span className={` pb-1 mb-1 w-fit text-nowrap text-lg font-bold ${isMobile ? "mx-3" : "pl-1"}`}>{common("productSuggestions")}</span>
            {hydratedTotalProductCount && hydratedTotalProductCount > 0 ? (
              <span className={`${!isMobile && "pr-5"} self-start group `}>
                <Button
                  type="link"
                  onClick={() => {
                    handleRedirect(hoveredSearchKeyword || searchTerm || "", hoveredValue);
                  }}
                  className=" no-underline text-link group-hover:text-hoverColor text-sm m-0 pt-0"
                  dataTestSelector="btnSearchResults"
                >
                  {searchMessage("see")} {hydratedTotalProductCount} {hoveredValue ? searchMessage("filtered") : ""} {searchMessage("resultsFor")} "
                  {updatedKeyword(hoveredSearchKeyword || searchTerm || "")}"{" "}
                  <span className="rotate-90 ">
                    <UpIcon customClassName="stroke-[#1E40AF] group-hover:stroke-hoverColor" />
                  </span>
                </Button>
              </span>
            ) : (
              <></>
            )}
            {!isMobile && (
              <button className="absolute top-0 right-0 pb-1 pr-2 text-gray-500 hover:text-gray-600 z-50" onClick={handleClickOutside} data-test-selector={"btnTypeaheadClose"}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    d="M14.348 5.652a.5.5 0 0 1 .708.708L10.707 10l4.349 4.348a.5.5 0 0 1-.708.708L10 10.707l-4.348 4.349a.5.5 0 0 1-.708-.708L9.293 10 4.944 5.652a.5.5 0 0 1 .708-.708L10 9.293l4.348-4.349z"
                  />
                </svg>
              </button>
            )}
          </div>
          <div
            className={`grid mr-1 ${
              isMobile ? "grid-flow-col auto-cols-max overflow-x-auto overscroll-contain gap-3 items-center pl-3" : "sm:grid-cols-2 md:grid-cols-3 "
            }  gap-1 `}
          >
            {hydratedSearchProductList &&
              hydratedSearchProductList?.map((product: IProductListCard) => {
                return (
                  <div key={product?.znodeProductId} className={`${isMobile ? "w-[40vw] h-full" : ""}`}>
                    <TypeaheadProductCard
                      product={product}
                      id={product?.znodeProductId ?? 0}
                      key={String(product?.znodeProductId ?? 0)}
                      isFromTypeaheadSearch={true}
                      globalAttributes={globalAttributes}
                      handleClickOutside={handleClickOutside}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
