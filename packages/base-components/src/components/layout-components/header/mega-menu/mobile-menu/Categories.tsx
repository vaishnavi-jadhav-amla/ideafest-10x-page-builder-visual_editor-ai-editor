import React, { Dispatch, SetStateAction, useState } from "react";

import { IMegaMenuCategory, ISubCategoryItemsData, ISubcategoryResponse } from "@znode/types/category";
import Link from "next/link";
import { ZIcons } from "../../../../common/icons";
import { formatTestSelector } from "@znode/utils/common";
import { setLocalStorageData } from "@znode/utils/component";
import { getWebStoreCategory } from "../../../../../http-request/category";
import { LoaderComponent } from "../../../../common/loader-component";

let controller: AbortController;
const categoryUrl = (seoPageName: string, categoryId: number) => {
  return seoPageName ? `/${seoPageName}` : `/category/${categoryId}`;
};
const Categories = ({
  category,
  setShowNavBar,
  breadcrumbTrail = [],
}: {
  category: IMegaMenuCategory;
  setShowNavBar?: Dispatch<SetStateAction<boolean>>;
  breadcrumbTrail: IMegaMenuCategory[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [subcategoryData, setSubcategoryData] = useState<ISubCategoryItemsData[]>([]);

  const fetchSubCategories = async (categoryCode: string) => {
    // Canceling the previous fetch request if it's still ongoing
    if (controller) controller.abort();
    controller = new AbortController();
    setIsFetching(true);
    try {
      //isAllCategory = false -> fetches the immediate subcategory for parent category.
      const isAllCategory = false;
      const data: ISubcategoryResponse = await getWebStoreCategory(categoryCode, isAllCategory);

      if (Array.isArray(data?.categories) && data?.categories.length > 0) {
        setSubcategoryData(data?.categories || []);
      } else setSubcategoryData([]);
    } catch (error) {
      setSubcategoryData([]);
    } finally {
      setIsFetching(false);
    }
  };

  const handleToggle = async (categoryCode: string) => {
    if (categoryCode && !isOpen) await fetchSubCategories(categoryCode);
    setIsOpen(!isOpen);
  };

  const getBreadCrumbHtml = () => {
    const categoryArray = [...breadcrumbTrail];
    const breadcrumbHtml = categoryArray
      .map((item) => `<a href="${categoryUrl(item?.seoDetails?.seoPageName || "", item?.publishCategoryId || 0)}" aria-label ="${item?.name}" >${item?.name}</a>`)
      .join(" / ");
    return breadcrumbHtml;
  };

  const redirectToCategory = () => {
    setIsOpen(!isOpen);
    setShowNavBar && setShowNavBar(false);
    setLocalStorageData("breadCrumbsDetails", JSON.stringify({ breadCrumbsTitle: getBreadCrumbHtml(), isCategoryFlow: true }));
  };

  return (
    <>
      <div className="flex justify-between border-b py-3.5" role={"button"} onClick={() => handleToggle(category.categoryCode || "")}>
        <Link
          className={`${!(category.subCategories && category.subCategories.length > 0) ? "w-full" : ""}`}
          data-test-selector={formatTestSelector("link", category.name || "")}
          href={categoryUrl(category.seoDetails?.seoPageName || "", category.publishCategoryId)}
          onClick={(e) => {
            e.stopPropagation();
            redirectToCategory();
          }}
        >
          {category.name}
        </Link>
        {category?.hasSubCategories ? (
          <div className={"text-white cursor-pointer"} data-test-selector={`${isOpen ? "hideCategory" : "showCategory"}${category.publishCategoryId}`}>
            {isOpen ? <ZIcons name="minus" data-test-selector="svgClose" /> : <ZIcons name="plus" strokeWidth={"3px"} data-test-selector="svgOpen" />}
          </div>
        ) : null}
      </div>
      {isFetching && (
        <div className="w-full mt-2">
          <LoaderComponent isLoading height="30px" width="30px" />
        </div>
      )}
      {isOpen && category.subCategories && (
        <div className="ml-6">
          {subcategoryData.map((subCategory: IMegaMenuCategory, index: number) => (
            <Categories key={index} category={subCategory} setShowNavBar={setShowNavBar} breadcrumbTrail={[...breadcrumbTrail, subCategory]} />
          ))}
        </div>
      )}
    </>
  );
};

export default Categories;
