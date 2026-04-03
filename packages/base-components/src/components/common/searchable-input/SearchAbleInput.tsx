/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Control, Controller, UseFormWatch } from "react-hook-form";
import { ISearchProduct, ISelectedProduct } from "@znode/types/quick-order";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { formatTestSelector, getAttributeValue } from "@znode/utils/common";
import { getProductsDataBySku, getSuggestions } from "../../../http-request";

import ImageWrapper from "../image/Image";
import { LoadingSpinner } from "../icons";
import { NavLink } from "../nav-link";
import { PRODUCT_TYPE } from "@znode/constants/product";
import { debounce } from "@znode/utils/component";
import { useToast } from "../../../stores/toast";

interface ISearchAbleInput {
  control: Control<any>;
  watch?: UseFormWatch<any>;
  name: string;
  isSearchProductEnabled: string;
  userCurrentLocation?: { latitude: number; longitude: number };
  availableStoreLocation?: { StoreLocatorList: string[] };
  onSelect: (_arg1: any) => void;
  onChangeSKUDebounced: (_arg1: string) => void;
  onChangeSKU?: (_arg1: string) => void;
  onInputBlur?: (_arg1: any, _arg2?: any) => void;
  dynamicKey: string;
  disableRedirection?: boolean;
  showFullWidthResults?: boolean;
  onSearchSuggestionFetched?: (_arg1: boolean) => void;
  hasRestrictConfigProduct?: boolean;
  id?: number;
}

// eslint-disable-next-line max-lines-per-function
export function SearchableInput({
  control,
  name,
  onSelect,
  isSearchProductEnabled,
  dynamicKey,
  onChangeSKU,
  onChangeSKUDebounced,
  disableRedirection,
  showFullWidthResults = false,
  onInputBlur,
  onSearchSuggestionFetched,
  hasRestrictConfigProduct,
  id,
}: ISearchAbleInput) {
  const [searchResults, setSearchResults] = useState<ISearchProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectionInProgress, setSelectionInProgress] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ sku: string } | null>();
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [skuSearch, setSkuSearch] = useState("");
  const [searchingProductIsInProgress, setSearchingProductIsInProgress] = useState(false);
  const [isOnBlurTriggered, setIsOnBlurTriggered] = useState(false);
  const selectionLoadingRef = useRef<boolean>();

  const { error } = useToast();
  const listRef = useRef<HTMLDivElement>(null);
  const fetchSearchResults = async (searchTerm: string): Promise<ISearchProduct[]> => {
    try {
      const advSliderData = await getSuggestions({ searchTerm: searchTerm });
      if (hasRestrictConfigProduct) {
        const advSliderCloneData = advSliderData.filter((product: ISearchProduct) => {
          const productType = product.attributes ? getAttributeValue(product.attributes, "ProductType", "selectValues") : PRODUCT_TYPE.SIMPLE_PRODUCT;
          if (productType === PRODUCT_TYPE.CONFIGURABLE_PRODUCT) return false;
          return true;
        });
        return advSliderCloneData;
      }
      return advSliderData;
    } catch (err) {
      return [];
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      setSelectedItemIndex((prevIndex) => (prevIndex < searchResults.length - 1 ? prevIndex + 1 : prevIndex));
    } else if (event.key === "ArrowUp") {
      setSelectedItemIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
    } else if (event.key === "Enter") {
      handleSelect(searchResults[selectedItemIndex]);
    }
  };
  const getProductDetailsBySku = async (inputSku: string) => {
    if (!inputSku) {
      return { hasError: true } as ISelectedProduct;
    }
    const searchProductData = await getProductsDataBySku({ inputSku: inputSku });
    return searchProductData || {};
  };

  const fetchData = async (query: string) => {
    try {
      setSearchingProductIsInProgress(true);
      setIsOnBlurTriggered(false);
      setSearchResults([]);
      const updatedQuery: string = query?.trim() || "";
      const response: ISearchProduct[] = (await fetchSearchResults(updatedQuery)) || [];
      if (response && response.length > 0) {
        setSearchResults(response || []);
        setSelectedItemIndex(-1);
      } else {
        setSearchResults([]);
      }
      const responseLength = response.length;
      onSearchSuggestionFetched && onSearchSuggestionFetched(responseLength == 0 ? true : false);
    } catch (err) {
      error(`Error fetching data: ${err}`);
    } finally {
      setSearchingProductIsInProgress(false);
    }
  };

  const onSubmit = (data: string) => {
    data !== "" && isSearchProductEnabled && fetchData(data);
  };

  useEffect(() => {
    !isOnBlurTriggered && searchResults && searchResults.length > 0 && setIsOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResults, isOnBlurTriggered]);

  const handleSelect = (value: ISearchProduct) => {
    selectionLoadingRef.current = true;
    setIsOnBlurTriggered(false);
    setSelectionInProgress(true);
    setSelectedItem({ sku: value?.sku });
    getProductDetailsBySku(value?.sku).then((val: ISelectedProduct) => {
      if (!val?.hasError) onSelect(val);
      setIsOpen(false);
      setSelectionInProgress(false);
      selectionLoadingRef.current = false;
      setSelectedItem(null);
    });
  };

  const handleOnChange = (value: string) => {
    onChangeSKUDebounced(value);
    onSubmit(value);
    setSkuSearch(value);
  };

  const handleOnBlur = (field: string) => {
    setIsOnBlurTriggered(true);
    onInputBlur && onInputBlur(field, selectionLoadingRef.current ? true : false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnInputBlur = useCallback(debounce(handleOnBlur, 300), []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedChangeOnSku = useCallback(debounce(handleOnChange, 1000), []);

  const handleClickOutside = async (event: MouseEvent) => {
    if (event && event.target && !(event.target as HTMLElement)?.classList.contains("searchable-component")) {
      setIsOpen(false);
      setSelectedItemIndex(-1);
      setSearchResults([]);
    }
  };

  useEffect(() => {
    if (listRef.current && selectedItemIndex !== -1) {
      const selectedListItem = listRef.current.children[selectedItemIndex];
      if (selectedListItem) {
        selectedListItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedItemIndex]);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className={"w-full relative"} data-test-selector="divEnterSkuContainer">
      <Controller
        name={`search.${name}`}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <>
            <input
              className={`input h-10  px-2 py-1 w-full searchable-component ${searchingProductIsInProgress ? "pr-10" : ""}`}
              {...field}
              type="text"
              autoComplete="off"
              key={dynamicKey}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                field.onChange(e.target.value);
                onChangeSKU && onChangeSKU(e.target.value);
                debouncedChangeOnSku(e.target.value);
              }}
              onBlur={() => {
                field.onBlur();
                debouncedOnInputBlur(field.value);
              }}
              placeholder="Enter SKU"
              data-test-selector={`txtEnterSku${id}`}
            />
            <div className="flex justify-end absolute bottom-[20px] right-[10px] h-[10px]">{searchingProductIsInProgress && <LoadingSpinner width="20px" height="20px" />}</div>
          </>
        )}
      />
      {isOpen && skuSearch.length > 0 && searchResults && searchResults.length > 0 && (
        <div
          data-test-selector="divSkuSuggestionList"
          ref={listRef}
          className={
            // eslint-disable-next-line max-len
            `flex ${
              showFullWidthResults ? "w-[18.9rem]" : "w-[92vw] md:w-full"
            } flex-col max-h-screen md:max-h-screen-50 rounded-t-none overflow-auto border border-t-0 border-gray-300 rounded-cardBorderRadius absolute bg-white z-10 searchable-component custom-scroll`
          }
        >
          {searchResults.map((result, index) => (
            <div
              key={index}
              onClick={() => handleSelect(result)}
              data-test-selector={`skuSuggestion${index}`}
              className={`flex justify-start gap-3 items-center cursor-pointer searchable-component px-4 py-2 border-b border-gray-300 hover:bg-gray-100 ${
                index === selectedItemIndex ? "bg-gray-100" : ""
              }`}
            >
              <div className="mr-4 searchable-component w-12">
                {disableRedirection ? (
                  <ImageWrapper imageLargePath={result?.imageThumbNailPath || ""} seoTitle={result.name} cssClass="h-12 object-contain" dataTestSelector={`${result.name}`} />
                ) : (
                  <NavLink url={`/category/${result?.categoryIds?.[0]}`} dataTestSelector={formatTestSelector("linkImage", result.name || "")} ariaLabel={`${result.name}`}>
                    <ImageWrapper imageLargePath={result?.imageThumbNailPath || ""} seoTitle={result.name} cssClass="h-12 object-contain" dataTestSelector={`${result.name}}`} />{" "}
                  </NavLink>
                )}
              </div>
              <div className={"flex items-start flex-col gap-1 searchable-component w-fit"}>
                {disableRedirection ? (
                  <>
                    <p className={"searchable-component font-bold"}>
                      {result?.name} | <span className={"searchable-component text-sm"}>{result?.sku}</span>
                    </p>
                    <div>in {result.categoryName}</div>
                  </>
                ) : (
                  <NavLink url={`/category/${result?.categoryIds?.[0]}`} dataTestSelector={formatTestSelector("link", result.name || "")} ariaLabel={`${result.categoryName}`}>
                    <p className={"searchable-component font-bold"}>
                      {result?.name} | <span className={"searchable-component text-sm"}>{result?.sku}</span>
                    </p>
                    <div>in {result.categoryName}</div>
                  </NavLink>
                )}
              </div>
              <div className="flex justify-end">{selectionInProgress && selectedItem?.sku == result?.sku && <LoadingSpinner width="20px" height="20px" />}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
