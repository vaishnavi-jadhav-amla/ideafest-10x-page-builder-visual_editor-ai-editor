import { IMegaMenuCategory, ISubCategoryItemsData } from "@znode/types/category";
import { NavLink } from "../../../../common/nav-link";
import { SETTINGS } from "@znode/constants/settings";
import SubCategory from "./SubCategory";
import { ZIcons } from "../../../../common/icons";
import { formatTestSelector } from "@znode/utils/common";
import { setLocalStorageData } from "@znode/utils/component";
import { useCategoryDetails } from "../../../../../stores";
import { useModal } from "../../../../../stores/modal";
import { useEffect, useState } from "react";

const categoryUrl = (seoPageName: string, categoryId: number) => {
  return seoPageName ? `/${seoPageName}` : `/category/${categoryId}`;
};
const DesktopCategory = () => {
  const { category, fetchCategories, hasAllCategoriesLoaded, loading } = useCategoryDetails();
  const { setIsMenuShown } = useModal();
  const [isShown, setIsShown] = useState(false);
  const [parentCategoryData, setParentCategoryData] = useState<IMegaMenuCategory | null>(null);
  const [subcategoryData, setSubcategoryData] = useState<ISubCategoryItemsData[]>([]);

  const redirectToCategory = (categoryData: IMegaMenuCategory) => {
    const breadcrumbHtml = `<a href="${categoryUrl(categoryData.seoDetails?.seoPageName || "", categoryData.publishCategoryId)}" aria-label ="${categoryData.name}" >${
      categoryData.name
    }</a>`;
    setIsMenuShown && setIsMenuShown(false);
    setLocalStorageData("breadCrumbsDetails", JSON.stringify({ breadCrumbsTitle: breadcrumbHtml, isCategoryFlow: true }));
  };

  useEffect(() => {
    if (hasAllCategoriesLoaded) showCategoryData(parentCategoryData?.publishCategoryId || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAllCategoriesLoaded]);

  const showCategoryData = (categoryId: number) => {
    if (hasAllCategoriesLoaded) {
      const filteredData = (category || []).find((data: IMegaMenuCategory) => data?.publishCategoryId === categoryId);
      setSubcategoryData(filteredData?.subCategories || []);
    }
  };

  const handleOnMouseEnter = async (categoryData: IMegaMenuCategory) => {
    if (categoryData.hasSubCategories) {
      setParentCategoryData(categoryData);
      setIsShown(true);
      showCategoryData(categoryData.publishCategoryId);

      if (!loading && !hasAllCategoriesLoaded) {
        await fetchCategories();
      }
    } else {
      setIsShown(false);
    }
  };

  const renderCategory = () => {
    return category.map((categoryData: IMegaMenuCategory, index: number) => {
      return (
        <li key={index} className="flex items-center justify-between px-4 py-2 border-none cursor-pointer text-megaMenuLinkColor shop-department-wrapper">
          <NavLink
            className="w-full font-medium uppercase text-start shop-department-wrapper"
            onMouseEnter={() => handleOnMouseEnter(categoryData)}
            url={categoryUrl(categoryData?.seoDetails?.seoPageName || "", categoryData.publishCategoryId)}
            onClick={() => redirectToCategory(categoryData)}
            dataTestSelector={formatTestSelector("link", categoryData.name || "")}
            ariaLabel={`${categoryData?.name}`}
          >
            {categoryData?.name}
          </NavLink>
          {categoryData?.hasSubCategories ? (
            <span
              tabIndex={0}
              role="button"
              className="cursor-pointer shop-department-wrapper shop-department-chevron"
              data-test-selector={`spn${categoryData.name.replace(/\s/g, "")}${categoryData.publishCategoryId}RightIcon`}
              onClick={(e) => {
                e.stopPropagation();
                handleOnMouseEnter(categoryData);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation();
                  handleOnMouseEnter(categoryData);
                }
              }}
            >
              <ZIcons className="shop-department-chevron" name="chevron-right" color={`${SETTINGS.ARROW_COLOR}`} />
            </span>
          ) : null}
        </li>
      );
    });
  };
  return (
    <>
      <div className="z-20 overflow-y-auto category bg-megaMenuBgColor custom-scroll shop-department-wrapper" data-test-selector="divCategoryMenus">
        {category && category.length > 0 ? <ul>{renderCategory()}</ul> : null}
      </div>
      {isShown && <SubCategory setIsMenuShown={setIsMenuShown} subCategories={subcategoryData} parentCategoryData={parentCategoryData} isFetching={loading} />}
      <div className="absolute left-0 w-full h-screen z-10 bg-black/[0.4]" onClick={() => setIsMenuShown(false)}></div>
    </>
  );
};
export default DesktopCategory;
