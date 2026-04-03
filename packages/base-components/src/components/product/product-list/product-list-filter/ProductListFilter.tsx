"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Heading } from "../../../common/heading";
import { IProductListFilterProps } from "@znode/types/product";
import { MODE } from "@znode/constants/mode";
import { PAGINATION } from "@znode/constants/pagination";
import ProductDisplayToggle from "../product-display-toggle/ProductDisplayToggle";
import { SETTINGS } from "@znode/constants/settings";
import { Separator } from "../../../common/separator";
import { ZIcons } from "../../../common/icons";
import { generateQueryString } from "@znode/utils/component";
import { useTranslations } from "next-intl";

export function ProductListFilter({ productData, selectedMode, viewChange }: IProductListFilterProps) {
  const productTranslations = useTranslations("Product");
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const { productList = [], totalProducts = 0, sortList = [] } = productData;
  const [currentMode, setCurrentMode] = useState(selectedMode || MODE.GRID_MODE);
  const pageSize: number = productData?.pageSize || Number(PAGINATION.DEFAULT_PAGINATION);
  const pageNumber: number = Number(searchParams?.get("pageNumber")) || PAGINATION.DEFAULT_TABLE_PAGE_INDEX;
  const sorting: number = Number(searchParams?.get("sort")) || 0;

  // actualPageSize refers to the actual no. of products gets displayed.
  let actualPageSize = pageSize;
  if (totalProducts < pageSize * pageNumber) {
    actualPageSize = totalProducts - pageSize * (pageNumber - 1);
  }
  useEffect(() => {
    const savedMode = sessionStorage.getItem("viewMode") || MODE.GRID_MODE;
    setCurrentMode(savedMode);
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`${generateQueryString(pathName, searchParams, event.target.value, "sort", pageSize?.toString())}`);
  };

  const handleViewChange = (mode: string) => {
    setCurrentMode(mode);
    sessionStorage.setItem("viewMode", mode);
    viewChange(mode);
  };

  if (!(Array.isArray(productList) && productList.length > 0)) return null;

  return (
    <>
      <div className="flex flex-col items-center justify-between sm:flex-row" data-test-selector="divShowProductList">
        <Heading
          customClass="w-full uppercase sm:w-auto text-center"
          dataTestSelector="hdgShowingResults"
          name={`${productTranslations("showing")} ${actualPageSize}
             ${productTranslations("of")} ${totalProducts} ${productTranslations("results")}`}
          level="h2"
        />
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center py-2 sm:ml-auto">
            <div className="relative text-base" data-test-selector="divFilterBy">
              <label className="mr-2 text-sm" htmlFor="sort" data-test-selector="lblFilterBy">
                {productTranslations("sortBy")}:
              </label>
              <select
                name="sort"
                className="appearance-none text-sm border-b px-1 pb-1 pr-6"
                id="sort"
                defaultValue={sorting}
                data-test-selector="selectSorting"
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange(e)}
              >
                {sortList &&
                  sortList.map((options, index) => (
                    <option key={`${index}_${options?.sortDisplayName}`} value={options.sortValue}>
                      {productTranslations(options?.sortDisplayName)}
                    </option>
                  ))}
              </select>
              <div className="absolute inset-y-0 right-0.5 flex items-center pointer-events-none">
                <ZIcons name="chevron-down" data-test-selector="svgSortArrowDown" color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} />
              </div>
            </div>
          </div>
          <div className="ml-auto">
            <ProductDisplayToggle selectedMode={currentMode} viewChange={handleViewChange} />
          </div>
        </div>
      </div>
      <Separator customClass="mt-0" />
    </>
  );
}
