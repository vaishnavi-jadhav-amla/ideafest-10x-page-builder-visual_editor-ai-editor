"use client";

import { getLocalStorageData, setLocalStorageData } from "@znode/utils/component";

import { CardSlider } from "../common/card-slider";
import { ICategory } from "@znode/types/category";
import { NavLink } from "../common/nav-link";
import noImage from "../../../assets/no-image.png";
import { CustomImage } from "../common/image";

const CategoryGrid = (props: { category: ICategory[] }) => {
  const { category } = props;

  const getBreadCrumbsDetails = () => {
    try {
      const data = getLocalStorageData("breadCrumbsDetails");
      if (!data) {
        return { breadCrumbsTitle: "", isCategoryFlow: false };
      }
      return JSON.parse(data);
    } catch (error) {
      return { breadCrumbsTitle: "", isCategoryFlow: false };
    }
  };
  const handledCategoryBreadCrumb = (category: ICategory) => {
    const breadCrumbData = getBreadCrumbsDetails();
    if (breadCrumbData.breadCrumbsTitle) {
      setLocalStorageData(
        "breadCrumbsDetails",
        JSON.stringify({ breadCrumbsTitle: `${breadCrumbData.breadCrumbsTitle} / <a href="${category?.categoryUrl}">${category?.categoryName}</a>`, isCategoryFlow: true })
      );
    }
  };
  const renderCategory = (categoriesData: ICategory[]) => {
    return categoriesData?.map((category: ICategory, i: number) => {
      const categoryName = category?.categoryName?.split("");
      return (
        <NavLink
          onClick={() => handledCategoryBreadCrumb(category)}
          url={category.categoryUrl || "#"}
          key={i}
          dataTestSelector={`link${category?.categoryCode}Category`}
          className="mb-2  min-h-[10.625rem]"
          ariaLabel={`${category?.categoryName}`}
        >
          <div className="col-span-1 w-full  px-0 mx-0 pl-1">
            <div className="relative h-full rounded overflow-hidden">
              <CustomImage
                src={category?.imageSmallPath || noImage}
                alt={`${category?.categoryName} Image`}
                className={`w-full max-h-[7.813rem] min-h-[7.813rem] m-auto object-cover ${categoryName?.length > 20 ? "h-full" : "h-w-fit"} max-w-[80%] sm:max-w-full`}
                dataTestSelector={`imgCategory${category?.categoryCode}`}
                width={200}
                height={300} 
                />
            </div>
            <p
              className="text-md xs:text-sm text-center font-semibold px-1 pt-2 pb-1 uppercase line-clamp-3 min-h-[2.813rem]"
              title={category?.categoryName}
              data-test-selector={`para${category?.categoryCode}Category`}
              aria-label={category?.categoryName}
            >
              {category?.categoryName}
            </p>
          </div>
        </NavLink>
      );
    });
  };

  return (Array.isArray(category) && category.length > 0 && (
    <div className="min-h-[13.75rem]">
      <CardSlider categoryGrid={true}>{renderCategory(category)}</CardSlider>
    </div>
  ));
};
export default CategoryGrid;