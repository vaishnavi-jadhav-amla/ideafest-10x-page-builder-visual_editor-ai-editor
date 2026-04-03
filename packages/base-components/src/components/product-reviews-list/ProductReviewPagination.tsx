"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";

import { PAGINATION } from "@znode/constants/pagination";
import { PRODUCT_REVIEW } from "@znode/constants/product";
import { useSearchParams } from "next/navigation";
import { useTranslationMessages } from "@znode/utils/component";
import { ZIcons } from "../common/icons";
import { SETTINGS } from "@znode/constants/settings";

const defaultPaginationCount = PAGINATION.DEFAULT_PAGINATION;
const arrowColor = PAGINATION.ARROW_COLOR;
const disabledArrowColor = PAGINATION.DISABLED_ARROW_COLOR;
export function ProductReviewPagination({
  totalResults,
  onPageSizeChange,
  onPageIndexChange,
  onPageSortChange,
}: {
  totalResults: string | number;
  onPageSizeChange: (_size: number) => void;
  onPageIndexChange: (_size: number) => void;
  onPageSortChange: (_sort: string) => void;
}) {
  const productReviewsListTranslations = useTranslationMessages("ProductReviewsList");
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<number>(Number(searchParams.get("pageSize") || defaultPaginationCount));
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLeftArrowDisabled, setLeftArrowDisabled] = useState(disabledArrowColor);
  const [isRightArrowDisabled, setRightArrowDisabled] = useState(arrowColor);
  const [sort, setSort] = useState(searchParams.get("sortBy") || PRODUCT_REVIEW.NEWEST_FIRST);

  const totalPages: number = Math.ceil(parseInt(`${totalResults}`) / selected);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelected(parseInt(event.target.value));
    setPageNumber(1);
    onPageSizeChange(parseInt(event.target.value));
  };

  const handleChangeFilter = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(event.target.value);
    setPageNumber(1);
    onPageSortChange(event.target.value);
    handleLeftClick();
  };

  const handleRightClick = () => {
    pageNumber === totalPages - 1 && setRightArrowDisabled(disabledArrowColor);

    if (pageNumber < totalPages) {
      setLeftArrowDisabled("#454545");
      setPageNumber((prevCount) => {
        const updatedCount = prevCount + 1;
        return updatedCount;
      });
    }
  };

  useEffect(() => {
    onPageIndexChange(pageNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  const handleLeftClick = () => {
    pageNumber !== totalPages - 1 && setRightArrowDisabled(arrowColor);
    pageNumber - 1 === 1 && setLeftArrowDisabled(disabledArrowColor);
    if (pageNumber > 1) {
      setPageNumber((prevCount) => {
        const updatedCount = prevCount - 1;
        return updatedCount;
      });
    }
  };

  const optionListSecondDropDown = [
    { name: productReviewsListTranslations("newestFirst"), value: PRODUCT_REVIEW.NEWEST_FIRST },
    { name: productReviewsListTranslations("oldestFirst"), value: PRODUCT_REVIEW.OLDEST_FIRST },
    { name: productReviewsListTranslations("highestRatingFirst"), value: PRODUCT_REVIEW.HIGHEST_RATING_FIRST },
    { name: productReviewsListTranslations("lowestRatingFirst"), value: PRODUCT_REVIEW.LOWEST_RATING_FIRST },
  ];

  const optionListFirstDropDown = [8, 12, 16, 32, 64];

  const renderDropDown = () => {
    return (
      <div className="relative">
        <select
          id="sortBy"
          value={sort}
          name="sortBy"
          data-test-selector="selectSortBy"
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChangeFilter(e)}
          aria-label="sortByDropDown"
          className="appearance-none h-10 ml-3 border rounded-sm pl-3 pr-5"
        >
          {optionListSecondDropDown.map((option) => (
            <option className="capitalize" key={option.value} value={option.value} data-test-selector="optShow8">
              {option.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0.5 flex items-center pointer-events-none">
          <ZIcons name="chevron-down" data-test-selector="svgPaginationArrowDown" color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center py-2 mt-5 bg-gray-100 sm:flex-row" data-test-selector="divItemPerPage">
      <div className="flex flex-row items-center font-semibold sm:flex-row xs:flex-col">
        <div className="flex">
          <div className="flex">
            <span className="pr-2 text-xl cursor-pointer" onClick={() => handleLeftClick()}>
              <ChevronLeft color={isLeftArrowDisabled} />
            </span>
            <span className="pl-2 text-xl cursor-pointer" onClick={() => handleRightClick()}>
              <ChevronRight color={isRightArrowDisabled} />
            </span>
          </div>
        </div>
        <div className="flex pr-4 text-base xs:outline-none">
          <div className="relative">
            <select
              id="PageSize"
              value={selected}
              name="PageSize"
              data-test-selector="selectPageSize"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange(e)}
              aria-label="pageSizeDropDown"
              className="appearance-none h-10 border rounded-sm pl-3 pr-5"
            >
              {optionListFirstDropDown.map((pageValue: number) => (
                <option key={pageValue} value={pageValue} data-test-selector={`optShow${pageValue}`}>
                  {productReviewsListTranslations("show")} {pageValue}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0.5 flex items-center pointer-events-none">
              <ZIcons name="chevron-down" data-test-selector="svgPageArrowDown" color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} />
            </div>
          </div>
          {optionListSecondDropDown.length > 0 && renderDropDown()}
        </div>
      </div>
    </div>
  );
}
