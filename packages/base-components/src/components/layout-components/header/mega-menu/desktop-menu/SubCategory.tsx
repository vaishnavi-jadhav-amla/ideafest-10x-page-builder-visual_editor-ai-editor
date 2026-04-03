import { IMegaMenuCategory, ISubCategoryData, ISubCategoryItemsData } from "@znode/types/category";
import React from "react";

import { NavLink } from "../../../../common/nav-link";
import { setLocalStorageData, useTranslationMessages } from "@znode/utils/component";
import { LoaderComponent } from "../../../../common/loader-component";
import { NoRecordFound } from "../../../../common/no-record-found";

const categoryUrl = (seoPageName: string, categoryId: number) => {
  return seoPageName ? `/${seoPageName}` : `/category/${categoryId}`;
};

const SubCategory: React.FC<ISubCategoryData> = ({ setIsMenuShown, subCategories = [], isFetching = false, parentCategoryData }) => {
  const commonMessages = useTranslationMessages("Common");

  const getBreadCrumbHtml = (categoryData: IMegaMenuCategory[]) => {
    const categoryArray = [{ ...parentCategoryData }, ...categoryData];
    const breadcrumbHtml = categoryArray
      .map((item) => `<a href="${categoryUrl(item?.seoDetails?.seoPageName || "", item?.publishCategoryId || 0)}" aria-label ="${item?.name}" >${item?.name}</a>`)
      .join(" / ");
    return breadcrumbHtml;
  };

  const redirectToCategory = (categoryData: IMegaMenuCategory[]) => {
    setIsMenuShown(false);

    setLocalStorageData("breadCrumbsDetails", JSON.stringify({ breadCrumbsTitle: getBreadCrumbHtml(categoryData), isCategoryFlow: true }));
  };

  const renderSubCategory = (subCategory: ISubCategoryItemsData[]) => {
    if (subCategory.length === 0) return <NoRecordFound text={commonMessages("noRecordsFound")} align="center" customClass="w-full h-max shop-department-wrapper" />;
    return subCategory.map((subCategoryData: ISubCategoryItemsData) => {
      return (
        <div className="max-w-60 mr-6 mb-2 shop-department-wrapper" key={subCategoryData.publishCategoryId}>
          <div className="text-megaMenuLinkColor mb-3" data-test-selector="divSubCategories">
            <NavLink
              dataTestSelector={`link${subCategoryData.name.replace(/\s/g, "")}${subCategoryData.publishCategoryId}`}
              className="font-bold shop-department-wrapper"
              url={categoryUrl(subCategoryData.seoDetails?.seoPageName || "", subCategoryData.publishCategoryId)}
              onClick={() => redirectToCategory([subCategoryData] as IMegaMenuCategory[])}
              ariaLabel={`${subCategoryData.name}`}
            >
              {subCategoryData.name}
            </NavLink>
          </div>
          {subCategoryData.subCategories && subCategoryData.subCategories.length > 0 && (
            <ul className="mb-2 font-medium border-none text-megaMenuLinkColor shop-department-wrapper">
              {subCategoryData.subCategories.map((childCategoryData: ISubCategoryItemsData) => (
                <li className="mb-2 border-none shop-department-wrapper" key={childCategoryData.publishCategoryId}>
                  <NavLink
                    dataTestSelector={`link${subCategoryData.name.replace(/\s/g, "")}${subCategoryData.publishCategoryId}`}
                    className="font-medium shop-department-wrapper"
                    url={categoryUrl(childCategoryData?.seoDetails?.seoPageName || "", childCategoryData.publishCategoryId)}
                    onClick={() => redirectToCategory([subCategoryData, childCategoryData] as IMegaMenuCategory[])}
                    ariaLabel={`${childCategoryData.name}`}
                  >
                    {childCategoryData.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    });
  };

  return (
    <div
      className="z-20 flex flex-wrap w-full p-4 capitalize bg-white shop-department-wrapper max-h-[calc(100vh-235px)] overflow-y-auto custom-scroll"
      data-test-selector="divSubCategory"
    >
      {isFetching ? (
        <div className="w-full">
          <LoaderComponent isLoading />
        </div>
      ) : (
        renderSubCategory(subCategories)
      )}
    </div>
  );
};

export default SubCategory;
