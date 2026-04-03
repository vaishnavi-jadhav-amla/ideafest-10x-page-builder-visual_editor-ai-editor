import { IMegaMenuCategory } from "@znode/types/category";
import { WebStoreCategoryModel } from "@znode/clients/v1";

export const mapCategories = (categories: WebStoreCategoryModel[]) => {
  const categoryList = categories.map((category) => ({
    categoryCode: category.CategoryCode,
    name: category.Name,
    seoDetails: {
      seoPageName: category.SEODetails?.SEOPageName,
    },
    publishCategoryId: category.PublishCategoryId,
    subCategories: category?.SubCategories && category?.SubCategories.length ? mapCategories(category?.SubCategories) : [],
    hasSubCategories: category?.HasChildCategories,
  })) as IMegaMenuCategory[];

  return categoryList;
};
