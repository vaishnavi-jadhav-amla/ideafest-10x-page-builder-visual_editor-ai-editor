"use client";

import { Heading } from "../../common/heading";
import { Separator } from "../../common/separator";
import { ZIcons } from "../../common/icons";
import { useEffect, useState } from "react";
import { useTranslationMessages } from "@znode/utils/component";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PAGINATION } from "@znode/constants/pagination";
import { getCategoryList } from "../../../http-request";
import { ISearchCategoryDetails } from "@znode/types/facet";
import { useProduct } from "../../../stores";
export function SearchResultCategoryList({ pageSize }: { pageSize?: number | null }) {
  const facetTranslations = useTranslationMessages("Facet");
  const { setIsProductLoading, activeCategory } = useProduct();
  const [mainCategory, setMainCategory] = useState<ISearchCategoryDetails[]>([]);
  const [childCategoryData, setChildCategoryData] = useState<ISearchCategoryDetails[]>([]);
  const [parentCategoryData, setParentCategoryData] = useState<ISearchCategoryDetails[]>([]);
  const [isDisplaySubCategory, setIsDisplaySubCategory] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [showViewAll, setShowViewAll] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchTerm } = useParams();
  const facetGroup = searchParams.get("facetGroup") || "";
  const searchCategory = searchParams.get("searchCategory") || "";

  const replaceParam = (key: string, value: string, activeCategory: string) => {
    const current = new URLSearchParams(searchParams.toString());
    current.set(key, value);
    current.set("searchCategory", "");
    current.set("activeCategory", activeCategory);
    current.set("pageNumber", "1");
    current.set("pageSize", pageSize?.toString() || PAGINATION.DEFAULT_PAGINATION);
    router.replace(`?${current.toString()}`);
  };

  const getCategoryFacet = () => {
    const categoryCodeParam = searchParams.get("categoryCode") || "";
    fetchCategory(categoryCodeParam.split(">"), false);
  };

  // runs only on category facet removal from applied facet chip list
  useEffect(() => {
    if (activeCategory === "" && showViewAll) getCategoryFacet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  // Runs on initial and facet and navigate from typeahead search
  useEffect(() => {
    getCategoryFacet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facetGroup, searchCategory]);

  const updateCategoryParams = (categoryCodeParams: string) => {
    let activeCategory = "";
    setIsProductLoading(true, {});
    if (categoryCodeParams) {
      const categoryCodeList = categoryCodeParams.split(">");
      const categoryCode = categoryCodeList[categoryCodeList.length - 1];
      activeCategory =
        [...new Map([...mainCategory, ...childCategoryData, ...parentCategoryData].map((cat) => [cat.categoryCode, cat])).values()].find(
          (data) => data.categoryCode === categoryCode
        )?.categoryName ?? "";
    }
    replaceParam("categoryCode", categoryCodeParams, activeCategory);
  };

  const fetchCategory = async (categoryCodes = [] as string[], isUpdateParams = true) => {
    try {
      const categoryCodeParams = categoryCodes.join(">");
      if (isUpdateParams) {
        updateCategoryParams(categoryCodeParams);
      }
      const categoryData = await getCategoryList(searchTerm?.toString() || "", categoryCodeParams);
      const data = categoryData;
      let mainCategory: ISearchCategoryDetails[] = [];
      let childCategory: ISearchCategoryDetails[] = [];
      let parentCategory: ISearchCategoryDetails[] = [];
      let isShow = false;
      if (!data?.parentCategories.length) mainCategory = data?.categories || [];
      else {
        childCategory = data?.categories || [];
        isShow = true;
        parentCategory = data?.parentCategories || [];
      }
      setShowViewAll(isShow);
      setMainCategory(mainCategory);
      setChildCategoryData(childCategory);
      setParentCategoryData(parentCategory);
      setIsDisplaySubCategory(data?.isProductInheritanceEnabled ?? false);
    } catch (err) {
      setIsProductLoading(false, {});
    }
  };
  const renderList = () => {
    return showViewAll ? (
      <ul className="flex flex-col gap-1">
        <li
          className="flex items-center gap-1 cursor-pointer hover:underline font-medium"
          onClick={() => {
            fetchCategory();
            setShowViewAll(false);
          }}
        >
          <ZIcons name="chevron-right" data-test-selector="svgChevronRight" /> {facetTranslations("viewAll")}
        </li>
        {parentCategoryData.map((data, i) => {
          const lastIndex = parentCategoryData.length - 1;
          return (
            <li
              data-test-selector={`li-${data.categoryCode}`}
              className={`flex items-center gap-1 ${
                data.categoryCode === parentCategoryData[lastIndex].categoryCode ? "text-linkColor font-semibold ml-6" : "font-medium hover:underline cursor-pointer"
              }`}
              onClick={() => {
                if (lastIndex !== i) fetchCategory(parentCategoryData.slice(0, i + 1).map((data) => data.categoryCode));
              }}
            >
              {lastIndex !== i && <ZIcons name="chevron-right" data-test-selector="svgChevronRight" />} {data.categoryName}
            </li>
          );
        })}
        {childCategoryData.map((data) => (
          <li
            data-test-selector={`li-${data.categoryCode}`}
            className="ml-8 font-medium cursor-pointer"
            onClick={() => {
              fetchCategory([...parentCategoryData.map((data) => data.categoryCode), data.categoryCode]);
            }}
          >
            {data.categoryName} <span className="text-xs">({data.count})</span>
          </li>
        ))}
      </ul>
    ) : (
      <ul className="flex flex-col gap-1">
        {mainCategory.map((data: ISearchCategoryDetails, index: number) => {
          return (
            <li
              data-test-selector={`li-${data.categoryCode}`}
              key={`${data.categoryCode + index}`}
              className="w-full font-medium flex items-center gap-1 cursor-pointer hover:underline"
              onClick={() => {
                if (isDisplaySubCategory) fetchCategory([data.categoryCode]);
                else {
                  setShowViewAll(true);
                  setParentCategoryData([data]);
                  setChildCategoryData([]);
                  updateCategoryParams(data.categoryCode);
                }
              }}
            >
              {data?.categoryName} <span className="text-xs">({data.count})</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center cursor-pointer accordion-title" onClick={() => setIsActive(!isActive)}>
        <Heading customClass="uppercase" dataTestSelector="hdgCategories" name={facetTranslations("labelCategories")} level="h2" />
        <div className="mr-2.5">{isActive ? <ZIcons name="minus" /> : <ZIcons name="plus" />}</div>
      </div>
      <Separator customClass="mt-0" />
      {isActive && renderList()}
    </div>
  );
}
