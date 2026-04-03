import { ICategory, IMegaMenuCategory } from "@znode/types/category";

export const mapCategoryList = (categories: IMegaMenuCategory[]): IMegaMenuCategory[] => {
  return categories.map((category: IMegaMenuCategory) => {
    const { hasSubCategories, subCategories = [], publishCategoryId, name = "", seoDetails, categoryCode } = category;
    return {
      categoryCode,
      hasSubCategories: hasSubCategories || subCategories.length,
      publishCategoryId,
      name,
      categoryUrl: seoDetails?.seoPageName ? `/${seoDetails.seoPageName}` : `/category/${publishCategoryId}`,
      dataTestSelector: `${name.replace(/\s/g, "")}${publishCategoryId}`,
      subCategories: subCategories.length ? mapCategoryList(subCategories) : [],
    };
  }) as IMegaMenuCategory[];
};

export const mapCategoryData = (category: ICategory) => {
  const categoryUrl = category?.seoUrl ? "/" + category.seoUrl : `/category/${category?.publishCategoryId}`;
  return {
    categoryUrl,
    categoryName: category.categoryName,
    imageSmallPath: category.imageSmallPath,
    categoryCode: category.categoryCode,
  };
};
