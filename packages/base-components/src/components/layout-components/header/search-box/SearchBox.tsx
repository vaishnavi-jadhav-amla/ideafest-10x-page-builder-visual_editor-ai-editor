/* eslint-disable max-len */
/* eslint-disable max-lines-per-function */
"use client";

import {
  IHydratedSearchActivityModel,
  IHydratedSearchModel,
  IHydratedSearchProductModel,
  ISearchBrand,
  ISearchCategory,
  ISearchContent,
  ISearchProduct,
} from "@znode/types/search-params";
import { LoadingSpinner, SearchIcon, ZIcons } from "../../../common/icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { getHydratedSuggestionSearch, getHydratedTypeaheadSearchContent, getSearchRedirectURL } from "../../../../http-request/search-hydrated";
import { useParams, usePathname, useRouter } from "next/navigation";

import { AREA } from "@znode/logger/server";
import { BarcodeScanner } from "../barcode-scanner/BarcodeScanner";
import Button from "../../../common/button/Button";
import { CustomImage } from "../../../common/image";
import { DynamicVoiceSearch } from "../search/Search";
import { HydratedSearchList } from "./HydratedSearchList";
import { IProductListCard } from "@znode/types/product";
import { ISearchFacetsResponse, ITypeaheadHoveredValuesRef } from "@znode/types/search-typeahead";
import Input from "../../../common/input/Input";
import Link from "next/link";
import { TypeaheadSearch } from "./TypeaheadSearch";
import { debounce } from "lodash";
import { logClient } from "@znode/logger";
import { useTranslations } from "next-intl";
import { SETTINGS } from "@znode/constants/settings";

interface SearchBoxProps {
  finalTranscriptValue: string;
  voiceSearchMessage: string;
  transcript: string;
  handleAfterRedirectVoiceEvent: () => void;
  isVoiceSearchStarted: boolean;
  isMobile: boolean;
  hasBarcode: boolean;
  hasVoiceSearch: boolean;
  setVoiceSearchMessage: React.Dispatch<React.SetStateAction<string>>;
  setVoiceTranscriptValue: React.Dispatch<React.SetStateAction<string>>;
  setFinalTranscriptValue: React.Dispatch<React.SetStateAction<string>>;
  setIsVoiceSearchStarted: React.Dispatch<React.SetStateAction<boolean>>;
  dataTestSelector?: string;
  isTypeaheadSearch?: boolean;
  isHydratedSearch?: boolean;
}

export function SearchBox({
  finalTranscriptValue,
  voiceSearchMessage,
  transcript,
  handleAfterRedirectVoiceEvent,
  isVoiceSearchStarted,
  isMobile,
  hasBarcode,
  hasVoiceSearch,
  setVoiceSearchMessage,
  setVoiceTranscriptValue,
  setFinalTranscriptValue,
  setIsVoiceSearchStarted,
  dataTestSelector,
  isTypeaheadSearch,
  isHydratedSearch,
}: SearchBoxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { searchTerm: searchParam } = params || {};
  const [searchTerm, setSearchTerm] = useState("");
  const [productList, setProductList] = useState<ISearchProduct[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [persistSearchHistory, setPersistSearchHistory] = useState("");
  const [popularSearch, setPopularSearch] = useState<IHydratedSearchActivityModel[]>([]);
  const [popularProducts, setPopularProducts] = useState<IHydratedSearchProductModel[]>([]);
  const [popularCategories, setPopularCategories] = useState<ISearchCategory[]>([]);
  const [popularBrands, setPopularBrands] = useState<ISearchBrand[]>([]);
  const [suggestedSearch, setSuggestedSearch] = useState<IHydratedSearchActivityModel[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<IHydratedSearchProductModel[]>([]);
  const [suggestedCategories, setSuggestedCategories] = useState<ISearchCategory[]>([]);
  const [suggestedContent, setSuggestedContent] = useState<ISearchContent[]>([]);
  const [searchProductTotalCount, setSearchProductTotalCount] = useState<number>();
  const [isMySearchesEnabled, setIsMySearchesEnabled] = useState<boolean>(false);
  const [mySearchesResultCount, setMySearchesResultCount] = useState<number>(0);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [isSearchAutocompleteOpen, setIsSearchAutocompleteOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const searchMessage = useTranslations("Search");
  const searchRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLUListElement>(null);
  const autocompleteRefSearch = useRef<HTMLDivElement>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  const [selectedItemIndexHistory, setSelectedItemIndexHistory] = useState(-1);
  const [hydratedSearchActivity, setHydratedSearchActivity] = useState<IHydratedSearchActivityModel[]>([]);
  const [hydratedFacetList, setHydratedFacetList] = useState<ISearchFacetsResponse[]>([]);
  const [hydratedCategoryList, setHydratedCategoryList] = useState<ISearchCategory[]>([]);
  const [hydratedSearchProductList, setHydratedSearchProductList] = useState<IProductListCard[]>([]);
  const [loginToSeePricing, setLoginToSeePricing] = useState<string>("false");
  const [hydratedTotalProductCount, setHydratedTotalProductCount] = useState<number>(0);
  const [hydratedSkuList, setHydratedSkuList] = useState<string[]>([]);
  const [isAllowIndexing, setIsAllowIndexing] = useState<boolean>(false);
  const isOnlyWhitespace = searchTerm.trim() === "";
  const isTypeaheadSearchEnabledRef = useRef<boolean>(false);
  const typeaheadHoveredValuesRef = useRef<ITypeaheadHoveredValuesRef>({ hoveredSearchKeyword: "", hoveredValue: "" });

  useEffect(() => {
    if (isAutocompleteOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isAutocompleteOpen]);

  useEffect(() => {
    const history = localStorage.getItem("searchHistory");
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
    isTypeaheadSearchEnabledRef.current = isTypeaheadSearch || false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pathname.includes("/search/")) {
      setSearchTerm("");
    }
  }, [pathname]);

  useEffect(() => {
    searchParam && setSearchTerm(decodeURIComponent(searchParam?.toString()));
  }, [searchParam]);

  useEffect(() => {
    if (persistSearchHistory && persistSearchHistory !== "") {
      const history = localStorage.getItem("searchHistory");
      const latestSearch = (history && JSON.parse(history)) || [];
      latestSearch.push(persistSearchHistory);
      localStorage.setItem("searchHistory", JSON.stringify(latestSearch));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistSearchHistory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isLink = target instanceof HTMLAnchorElement;
      const isExcludedElement = isLink || target.closest(".exclude-click");

      const isClickOutside =
        !isExcludedElement &&
        searchRef.current &&
        !searchRef.current.contains(target) &&
        (!autocompleteRef.current || !autocompleteRef.current.contains(target)) &&
        (!autocompleteRefSearch.current || !autocompleteRefSearch.current.contains(target));

      if (isClickOutside) {
        setIsLoading(false);
        setIsAutocompleteOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputText = event.target.value;
    setSearchTerm(inputText);
    setSelectedItemIndex(-1);
    setSelectedItemIndexHistory(-1);
    setIsInputFocused(true);

    if (inputText && inputText.length < 3) {
      setIsSearchAutocompleteOpen(false);
      return;
    } else if (inputText.length === 0 || inputText === "") {
      getHydratedSearch();
    } else {
      setIsSearchAutocompleteOpen(true);
    }

    setIsLoading(true);
    debouncedInputSearch(inputText);
  };

  const handleLoading = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const updateSearchTeamInHistory = (searchTerm: string) => {
    const updatedHistory = !searchHistory.includes(searchTerm) ? [searchTerm, ...searchHistory.slice(0, 4)] : searchHistory;
    if (searchTerm) {
      setPersistSearchHistory(searchTerm);
      setSearchHistory(updatedHistory);
    }
  };

  //Redirecting to a specific search when click on popular search.
  const handlePopularSearchClicked = async (searchTerm: string) => {
    const redirectURL = await getSearchRedirectURL({ searchTerm: searchTerm.trim() });
    if (redirectURL.length > 0) {
      window.location.href = redirectURL;
      setIsSearchAutocompleteOpen(false);
      if (searchTerm.length >= 3) {
        setIsSearchAutocompleteOpen(true);
      }
    } else {
      handleSearchNavigation(searchTerm);
    }
    setSearchTerm(searchTerm);
  };

  const handleSearchTerm = async () => {
    if (!isOnlyWhitespace) {
      setIsLoading(true);
      const redirectURL = await getSearchRedirectURL({ searchTerm: searchTerm.trim() });
      if (redirectURL.length > 0) {
        window.location.href = redirectURL;
        setIsSearchAutocompleteOpen(false);
        if (searchTerm.length >= 3) {
          setIsSearchAutocompleteOpen(true);
        }
      } else {
        handleSearchNavigation(searchTerm);
        setIsSearchAutocompleteOpen(false);
      }
      updateSearchTeamInHistory(searchTerm.trim());
      handleAfterRedirectVoiceEvent();
      handleLoading();
    } else {
      logClient.error(searchMessage("searchError"));
    }
  };

  const onSearchHistoryClicked = (searchTerm: string) => {
    const searchHistoryTerm = searchTerm.trim() === "";
    if (!searchHistoryTerm) {
      setIsLoading(true);
      setSearchTerm(searchTerm);
      handleSearchTerm();
      handleLoading();
    } else {
      logClient.error(searchMessage("searchError"));
    }
  };

  const onSearchFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    const inputText = event.target.value;
    setIsSearchAutocompleteOpen(false);
    if (inputText !== "") {
      setSearchTerm(inputText);
      if (inputText.length >= 3) {
        setIsSearchAutocompleteOpen(true);
      }
    }
    setIsAutocompleteOpen(true);
    setIsInputFocused(true);
    setSelectedItemIndexHistory(-1);
    setSelectedItemIndex(-1);
    if (searchRef.current?.value !== inputText || (searchTerm?.length >= 3 && hydratedSearchProductList?.length === 0 && suggestedProducts?.length === 0)) {
      typeaheadHoveredValuesRef.current = { hoveredSearchKeyword: "", hoveredValue: "" };
      setIsLoading(true);
      debouncedInputSearch(inputText);
    }
  };
  const getHydratedSearch = async () => {
    try {
      if (searchTerm.length === 0 && isHydratedSearch) {
        setIsLoading(true);
        const searchResult = await getHydratedSuggestionSearch({});
        if (searchResult) {
          setPopularSearch(searchResult?.hydratedSearchActivityList || []);
          setPopularProducts(searchResult?.hydratedSearchProductList || []);
          setPopularCategories(searchResult?.hydratedSearchCategoryList || []);
          setPopularBrands(searchResult?.hydratedSearchBrandList || []);
          setIsMySearchesEnabled(searchResult?.isMySearchesEnabled || false);
          setMySearchesResultCount(searchResult?.mySearchesResultCount || 0);
          setIsLoading(false);
        }
      } else if (searchTerm.length >= 3) {
        setIsSearchAutocompleteOpen(true);
      }
    } catch {
      setIsLoading(false);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(async (term: string) => {
    setIsSearchAutocompleteOpen(false);
    if (term && term.trim() !== "") {
      setIsLoading(true);
      if (term.length >= 3) {
        setIsSearchAutocompleteOpen(true);
      }
      const searchResult = await fetchSearchResults(term);
      if (searchResult) {
        setSuggestedSearch(searchResult?.hydratedSearchActivityList || []);
        setSuggestedProducts(searchResult?.hydratedSearchProductList || []);
        setSuggestedCategories(searchResult?.hydratedSearchCategoryList || []);
        setSuggestedContent(searchResult?.hydratedSearchContentList || []);
        setSearchProductTotalCount(searchResult?.totalProductCount);
      }
      setIsAutocompleteOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedHandleSearch = useCallback(debounce(handleSearch, 600), []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedInputSearch = useCallback(
    debounce(async (inputText: string) => {
      try {
        const searchResult = await fetchSearchResults(inputText);
        if (isTypeaheadSearchEnabledRef.current !== searchResult.isTypeaheadSearchEnabled) {
          isTypeaheadSearchEnabledRef.current = searchResult.isTypeaheadSearchEnabled || false;
        }
        if (searchResult) {
          if (searchResult.isTypeaheadSearchEnabled) {
            if (isTypeaheadSearchEnabledRef.current) typeaheadHoveredValuesRef.current = { hoveredSearchKeyword: "", hoveredValue: "" };
            setHydratedSearchActivity(searchResult?.hydratedSearchActivityList || []);
            setHydratedCategoryList(searchResult?.hydratedSearchCategoryList || []);
            setHydratedFacetList(searchResult?.hydratedFacetList || []);
            setHydratedSearchProductList((searchResult?.hydratedSearchProductList as IProductListCard[]) || []);
            setLoginToSeePricing(JSON.stringify(searchResult?.loginToSeePricing));
            setHydratedTotalProductCount(searchResult?.totalProductCount || 0);
            setHydratedSkuList(searchResult?.hydratedSkuList || []);
            setIsAllowIndexing(searchResult?.isAllowIndexing || false);
          } else {
            setSuggestedSearch(searchResult?.hydratedSearchActivityList || []);
            setSuggestedProducts(searchResult?.hydratedSearchProductList || []);
            setSuggestedCategories(searchResult?.hydratedSearchCategoryList || []);
            setSuggestedContent(searchResult?.hydratedSearchContentList || []);
            setSearchProductTotalCount(searchResult?.totalProductCount);
          }
        }
      } catch (error) {
        logClient.error("Error fetching search results");
      } finally {
        setIsLoading(false);
      }
    }, 600),
    []
  );

  const fetchSearchResults = async (searchTerm: string) => {
    try {
      const hydratedSearch = await getHydratedTypeaheadSearchContent({ searchTerm: searchTerm.trim() });
      return hydratedSearch as IHydratedSearchModel;
    } catch (error) {
      logClient.error(AREA.SEARCH, String(error));
      return {} as IHydratedSearchModel;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        if (isInputFocused && isAutocompleteOpen && searchHistory && searchHistory.length > 0) {
          setSelectedItemIndexHistory((prevIndex) => (prevIndex < searchHistory.length - 1 ? prevIndex + 1 : prevIndex));
        } else {
          setSelectedItemIndex((prevIndex) => (prevIndex < productList.length - 1 ? prevIndex + 1 : prevIndex));
        }
        break;
      case "ArrowUp":
        if (isInputFocused && isAutocompleteOpen && searchHistory && searchHistory.length > 0) {
          setSelectedItemIndexHistory((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
        } else {
          setSelectedItemIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
        }
        break;
      case "Enter":
        if (isInputFocused && isAutocompleteOpen && searchHistory && searchHistory.length > 0) {
          onSearchHistoryClicked(searchHistory[selectedItemIndexHistory] || searchTerm || "");
          document.body.classList.remove("overflow-hidden");
        } else {
          if (!isOnlyWhitespace) {
            setIsLoading(true);
            setSearchTerm((productList && productList[selectedItemIndex]?.name) || searchTerm || "");
            setIsInputFocused(false);
            setIsAutocompleteOpen(((productList && productList[selectedItemIndex]?.name) || searchTerm || "").trim() !== "");
            debouncedHandleSearch(searchTerm);
            handleSearchTerm();
            handleOnBlur();
            router.push(`/search/search-term/${encodeURIComponent(encodeURIComponent(searchTerm))}`);
          } else {
            logClient.error(searchMessage("searchError"));
          }
        }
        setIsAutocompleteOpen(true);
        setIsInputFocused(false);
        setSelectedItemIndexHistory(-1);
        setSelectedItemIndex(-1);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (autocompleteRef.current && selectedItemIndex !== -1) {
      const selectedListItem = autocompleteRef.current.children[selectedItemIndex];
      if (selectedListItem) {
        selectedListItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedItemIndex]);

  useEffect(() => {
    if (autocompleteRefSearch.current && selectedItemIndexHistory !== -1) {
      const selectedListItem = autocompleteRefSearch.current.children[selectedItemIndexHistory];
      if (selectedListItem) {
        selectedListItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedItemIndexHistory]);

  const handleOnBlur = () => {
    setIsInputFocused(false);
    setIsAutocompleteOpen(false);
    setProductList([]);
  };

  useEffect(() => {
    if (finalTranscriptValue && finalTranscriptValue !== "") {
      setSearchTerm(finalTranscriptValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalTranscriptValue]);

  useEffect(() => {
    if (searchTerm && searchTerm !== "" && finalTranscriptValue !== "") {
      handleSearchTerm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  function getSearchInputPlaceHolderValue(): string {
    return voiceSearchMessage && voiceSearchMessage !== "" ? voiceSearchMessage : searchMessage("searchByPartName");
  }

  function getSearchInputValue(): string {
    return isVoiceSearchStarted && transcript.length > -1 ? transcript : searchTerm;
  }

  const handleSearchClick = () => {
    setIsAutocompleteOpen(false);
    setIsInputFocused(false);
  };

  const handleSearchNavigation = (searchTerm: string) => {
    router.push(`/search/search-term/${encodeURIComponent(encodeURIComponent(searchTerm.trim()))}`);
  };

  const handleSearchSuggestionKeywordClicked = () => {
    setHydratedSearchProductList([]);
    setSuggestedProducts([]);
    setHydratedTotalProductCount(0);
    setSearchProductTotalCount(0);
  };

  const handleClearClick = () => {
    setSearchTerm("");
    handleOnBlur();
  };

  const gridPopularSearch =
    popularProducts?.length === 0 && popularCategories?.length === 0 && popularBrands?.length === 0
      ? "grid-cols-1 w-full"
      : popularProducts?.length === 0 || (popularCategories?.length === 0 && popularBrands?.length === 0)
      ? "grid-cols-2 w-full"
      : "grid-cols-3";

  const gridSuggestedSearch =
    suggestedProducts?.length === 0 && suggestedCategories?.length === 0 && suggestedContent?.length === 0
      ? "grid-cols-1 w-full"
      : suggestedProducts?.length === 0 || (suggestedCategories?.length === 0 && suggestedContent?.length === 0)
      ? "grid-cols-2 w-full"
      : "grid-cols-3  w-full";

  return (
    <div className="relative w-full">
      <div className="flex w-full">
        <div className="flex items-center w-full border-2 rounded border-inputBorderColor searchInput">
          {isLoading ? (
            <div className="absolute top-1/2 transform -translate-y-1/2 xs:focus:ring-0 pl-2 pb-1">
              <LoadingSpinner width="30px" height="30px" viewBox="0 0 130 80" />
            </div>
          ) : (
            <Button
              type="text"
              size="small"
              dataTestSelector="btnSearchIcon"
              startIcon={<SearchIcon viewBox="0 0 30 30" dataTestSelector={`${dataTestSelector}`} color="#757575" />}
              onClick={handleSearchTerm}
              className="px-2 py-2 absolute top-1/2 transform -translate-y-1/2"
              ariaLabel="search icon"
            />
          )}
          <Input
            inputRef={searchRef}
            type="text"
            placeholder={getSearchInputPlaceHolderValue()}
            value={getSearchInputValue()}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              onSearchFocus(e);
              getHydratedSearch();
            }}
            className={`w-full pt-1 pb-1 pl-10 placeholder-black md:block xs:border-none shadow-right-none max-[640px]:text-base ${
              hasBarcode || hasVoiceSearch ? "pr-[75px]" : "pr-2"
            }`}
            dataTestSelector={`txt${dataTestSelector}`}
            ariaLabel="search box"
          />
        </div>
        {/* Voice Search and Barcode Scanner */}
        <div className="flex items-center space-x-2 rounded-tr rounded-br shadow-left-none absolute right-[2px] bg-white top-[2px] bottom-[2px]">
          {isMobile && isInputFocused && isAutocompleteOpen && (
            <Button
              type="text"
              size="small"
              dataTestSelector="btnClearSearch"
              className="ml-2 p-2 exclude-click"
              startIcon={<ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="svgClearSearch" />}
              onClick={() => {
                handleClearClick();
              }}
              ariaLabel="clear search button"
            />
          )}
          {hasBarcode && <BarcodeScanner dataTestSelector={`${dataTestSelector}`} />}
          {hasVoiceSearch && (
            <DynamicVoiceSearch
              setVoiceSearchMessage={setVoiceSearchMessage}
              setVoiceTranscriptValue={setVoiceTranscriptValue}
              setFinalTranscriptValue={setFinalTranscriptValue}
              finalTranscriptValue={finalTranscriptValue}
              setIsVoiceSearchStarted={setIsVoiceSearchStarted}
            />
          )}
        </div>
      </div>
      {searchTerm.length >= 3 &&
        isInputFocused &&
        isAutocompleteOpen &&
        isSearchAutocompleteOpen &&
        isTypeaheadSearchEnabledRef.current &&
        ((hydratedSearchActivity && hydratedSearchActivity?.length > 0) ||
          (hydratedCategoryList && hydratedCategoryList?.length > 0) ||
          (hydratedSearchProductList && hydratedSearchProductList?.length > 0)) && (
          <TypeaheadSearch
            hydratedSearchActivityList={hydratedSearchActivity}
            hydratedFacetList={hydratedFacetList}
            hydratedSearchCategoryList={hydratedCategoryList}
            hydratedSearchProductList={hydratedSearchProductList}
            setHydratedSearchProductList={setHydratedSearchProductList}
            searchTerm={searchTerm}
            hydratedTotalProductCount={hydratedTotalProductCount}
            loginToSeePricing={loginToSeePricing}
            hydratedSkuList={hydratedSkuList}
            setHydratedTotalProductCount={setHydratedTotalProductCount}
            isAllowIndexing={isAllowIndexing}
            setIsAutocompleteOpen={setIsAutocompleteOpen}
            onHover={debouncedInputSearch}
            setHydratedFacetList={setHydratedFacetList}
            setHydratedCategoryList={setHydratedCategoryList}
            setHydratedSkuList={setHydratedSkuList}
            handleClickOutside={handleOnBlur}
            isMobile={isMobile}
            typeaheadHoveredValuesRef={typeaheadHoveredValuesRef}
          />
        )}
      {searchTerm.length >= 3 &&
        isInputFocused &&
        isAutocompleteOpen &&
        isSearchAutocompleteOpen &&
        !isTypeaheadSearchEnabledRef.current &&
        ((suggestedSearch && suggestedSearch?.length > 0) || suggestedProducts?.length > 0 || suggestedCategories?.length > 0) && (
          <div
            className={`${
              isMobile ? "gap-0" : gridSuggestedSearch
            } grid gap-3 bg-white absolute border border-gray-300 border-t-0 shadow-md max-h-[70vh] overflow-y-auto z-10 exclude-click lg:w-[770px] xl:w-full`}
          >
            <div className={`${isMobile ? "overflow-x-auto" : ""} bg-[#f1f1f1]`}>
              <div ref={autocompleteRefSearch}>
                <h1 className={`${isMobile ? "mt-3" : "my-3"} mx-2 font-bold text-lg`}>{searchMessage("suggestedSearches")}</h1>
                {suggestedSearch?.length > 0 ? (
                  <div className={`${isMobile ? "overflow-x-auto grid grid-flow-col auto-cols-max overscroll-contain py-3" : ""}`}>
                    {suggestedSearch?.map((history, index) => (
                      <div
                        key={index}
                        className={"px-2 py-1 cursor-pointer text-black text-sm flex items-center"}
                        onClick={() => {
                          handlePopularSearchClicked(history?.searchKeyword || "");
                          setIsAutocompleteOpen(false);
                          handleSearchSuggestionKeywordClicked();
                        }}
                        data-test-selector={`suggestedSearch${index}`}
                      >
                        <div className="flex px-2 border border-black border-solid rounded hover:bg-black hover:text-white text-black custom-word-break">
                          {history?.searchKeyword}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-sm text-gray-500">{searchMessage("noSuggestion")}</div>
                )}
              </div>
            </div>
            {suggestedProducts?.length > 0 && (
              <div className="overflow-x-auto">
                <div className="flex">
                  <h1 className={`${isMobile ? "mt-0" : "my-3"} mx-2 mb-2 text-lg font-bold`}>{searchMessage("products")}</h1>
                  <span
                    className={`${isMobile ? "mt-0" : " my-3"} pt-1 mx-3 mb-2 text-sm text-blue-600 underline`}
                    onClick={() => {
                      setIsAutocompleteOpen(false);
                      setIsInputFocused(false);
                    }}
                  >
                    {searchProductTotalCount && searchProductTotalCount != null && searchProductTotalCount > 10 && (
                      <Link href={`/search/search-term/${encodeURIComponent(encodeURIComponent(searchTerm.trim()))}`}>
                        {searchMessage("allProducts")} ({searchProductTotalCount})
                      </Link>
                    )}
                  </span>
                </div>
                <div className={`${isMobile ? "overflow-x-auto flex" : ""}`}>
                  {suggestedProducts.map((history, index) => (
                    <div
                      key={history?.productId}
                      className={`${isMobile ? "w-40" : "flex"} px-2 py-1 hover:bg-gray-100 text-black text-sm items-center`}
                      data-test-selector={`searchSuggestedProduct${index}`}
                      onClick={() => {
                        setIsAutocompleteOpen(false);
                        setIsInputFocused(false);
                      }}
                    >
                      <Link
                        href={(history?.seoUrl && `/${history?.seoUrl}`) || `/product/${history?.productId}`}
                        className={`w-full ${isMobile ? "" : "flex"} exclude-click`}
                        data-test-selector="linkProductDetail"
                      >
                        {" "}
                        <div className={`${isMobile ? "border border-solid border-slate-500 w-28 h-28" : "h-14 w-14"} p-1`}>
                          <CustomImage
                            src={history?.imagePath || ""}
                            alt={`${history?.productName} ${index}`}
                            className="object-contain w-auto m-auto h-full"
                            width={250}
                            height={500}
                            imageWrapperClass="relative h-full"
                            dataTestSelector={`imgSuggestedProduct${index}`}
                          />
                        </div>
                        <div className={`${isMobile ? "mt-3" : ""} ml-2 w-fit underline text-sm`} data-test-selector={`divSuggestedProductName${index}`}>
                          {history?.productName}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              {suggestedCategories?.length > 0 && (
                <HydratedSearchList categories={suggestedCategories} hydratedKey={"CategoryName"} handleClick={handleSearchClick} title={"categories"} isMobile={isMobile} />
              )}
              {suggestedContent?.length > 0 && (
                <HydratedSearchList
                  categories={suggestedContent}
                  hydratedKey={"contentPageName"}
                  handleClick={handleSearchClick}
                  title={"Content"}
                  isMobile={isMobile}
                  isContent={true}
                />
              )}
            </div>
          </div>
        )}

      {!isLoading &&
      isInputFocused &&
      isAutocompleteOpen &&
      !isSearchAutocompleteOpen &&
      searchTerm.length < 3 &&
      (popularSearch?.length || (searchHistory?.length && isMySearchesEnabled) || popularCategories?.length || popularBrands?.length || popularProducts?.length) ? (
        <div
          className={`${
            isMobile ? "gap-0" : gridPopularSearch
          } grid gap-3 absolute border border-inputBorderColor border-t-0 bg-white shadow-md max-h-[70vh] overflow-y-auto z-10 w-full custom-scroll exclude-click lg:w-[770px] xl:w-full`}
        >
          <div className={`${isMobile ? "overflow-x-auto" : ""} bg-[#f1f1f1]`}>
            <div ref={autocompleteRefSearch} className="">
              {isMySearchesEnabled && searchHistory && searchHistory.length > 0 && (
                <>
                  <h1 className={`${isMobile ? "mt-3" : "my-3"} mx-3 font-bold text-lg`}>{searchMessage("mySearches")}</h1>
                  <div className={`${isMobile ? "overflow-x-auto grid grid-flow-col auto-cols-max overscroll-contain py-3" : ""}`}>
                    {Array.isArray(searchHistory) &&
                      searchHistory.slice(0, mySearchesResultCount).map((history, index) => (
                        <div
                          key={index}
                          className={`px-3 py-1  cursor-pointer text-sm ${index !== searchHistory.length - 1 ? "" : ""} flex items-center ${
                            index === selectedItemIndexHistory ? "bg-gray-100" : ""
                          }`}
                          onClick={() => {
                            handlePopularSearchClicked(history);
                            setIsAutocompleteOpen(false);
                            setIsInputFocused(false);
                            handleSearchSuggestionKeywordClicked();
                          }}
                          data-test-selector={`mySearchHistory${index}`}
                        >
                          <div className="flex px-2 border border-black border-solid rounded hover:bg-black hover:text-white text-black">
                            <div className="mt-1 mr-2">
                              <ZIcons name="corner-up-left" strokeWidth={"1.5px"} />
                            </div>
                            {history}
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
              {popularSearch && popularSearch?.length > 0 && (
                <>
                  <h1 className={`${isMobile ? "mt-3" : "my-3"} px-3 font-bold text-lg`}>{searchMessage("popularSearches")}</h1>
                  <div className={`${isMobile ? "overflow-x-auto grid grid-flow-col auto-cols-max overscroll-contain py-3" : ""}`}>
                    {popularSearch?.map((history, index) => (
                      <div
                        key={index}
                        className={`px-3 py-1 cursor-pointer text-sm ${index !== popularSearch.length - 1 ? "" : ""} flex items-center`}
                        onClick={() => {
                          handlePopularSearchClicked(history?.searchKeyword || " ");
                          setIsAutocompleteOpen(false);
                          setIsInputFocused(false);
                          handleSearchSuggestionKeywordClicked();
                        }}
                        data-test-selector={`searchPopularSearches${index}`}
                      >
                        <div className="flex px-2 border border-black border-solid rounded hover:bg-black hover:text-white text-black">{history?.searchKeyword}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          {popularProducts && popularProducts?.length > 0 && (
            <div className="overflow-x-auto overflow-y-hidden">
              <h1 className="mx-2 my-3 mb-2 text-lg font-bold">{searchMessage("popularProducts")}</h1>
              <div className={`${isMobile ? "overflow-x-auto flex" : ""}`}>
                {popularProducts.map((history, index) => (
                  <div
                    key={index}
                    className={`${isMobile ? "w-40 mb-3" : "flex"} px-2 py-1 hover:bg-gray-100 text-black text-sm items-center`}
                    data-test-selector={`searchPopularProducts${index}`}
                    onClick={() => {
                      setIsAutocompleteOpen(false);
                      setIsInputFocused(false);
                    }}
                  >
                    <Link
                      href={(history?.seoUrl && `/${history?.seoUrl}`) || `/product/${history?.productId}`}
                      className={`w-full ${isMobile ? "" : "flex"} exclude-click`}
                      data-test-selector="linkProductDetail"
                    >
                      <div className={`${isMobile ? "border border-solid border-slate-500 w-28 h-28" : "h-14 w-14"} p-1`}>
                        <CustomImage
                          src={`${history?.imagePath}`}
                          alt=""
                          className="object-contain w-auto m-auto h-full"
                          width={250}
                          height={500}
                          imageWrapperClass="relative h-full"
                          dataTestSelector={`imgCategory${index}`}
                        />
                      </div>
                      <div className={`${isMobile ? "mt-3" : ""} ml-2 w-fit underline text-sm`}>{history?.productName}</div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            {popularCategories && popularCategories?.length > 0 && (
              <HydratedSearchList categories={popularCategories} hydratedKey={"CategoryName"} handleClick={handleSearchClick} title={"popularCategories"} isMobile={isMobile} />
            )}
            {popularBrands && popularBrands?.length > 0 && (
              <HydratedSearchList categories={popularBrands} hydratedKey={"BrandName"} handleClick={handleSearchClick} title={"popularBrands"} isMobile={isMobile} />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SearchBox;
