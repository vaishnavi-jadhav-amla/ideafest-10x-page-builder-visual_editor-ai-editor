import { FeatureCategories } from "@znode/base-components/znode-widget/category";
import { ICategoriesCarouselRenderProps } from "./CategoriesCarouselConfig";

export function CategoriesCarouselRender(props: Readonly<ICategoriesCarouselRenderProps>) {
  const { response, config: _c, id, puck: _p, ...swapperConfig } = props;

  if (!response?.data) {
    return null;
  }

  const categories = response?.data || [];

  return <FeatureCategories swapperConfig={swapperConfig} categories={categories} />;
}
