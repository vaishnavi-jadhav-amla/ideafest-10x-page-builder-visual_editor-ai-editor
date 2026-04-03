import type { IRenderProps, IPageOrWidgetConfig } from "../../../../../../types/page-builder";

import { ProductListPageRender } from "./ProductListPageRender";
import type { ComponentConfig } from "@measured/puck";

export interface IProductListPageConfig {
  displayCategory: boolean;
  displayFacets: boolean;
  displayReview: boolean;
  displaySKU: boolean;

  response: {
    data: any;
  } | null;
  config: IPageOrWidgetConfig;
}

export type IProductListRenderProps = IProductListPageConfig & IRenderProps;

export const ProductListPageConfig: ComponentConfig<IProductListPageConfig> = {
  fields: {
    displayCategory: {
      type: "radio",
      label: "Categories",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    displayFacets: {
      type: "radio",
      label: "Facets",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    displayReview: {
      type: "radio",
      label: "Reviews",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    displaySKU: {
      type: "radio",
      label: "SKU",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },

    response: {
      type: "custom",
      render: () => <></>,
    },
    config: {
      type: "custom",
      render: () => <></>,
    },
  },
  defaultProps: {
    displayCategory: true,
    displayFacets: true,
    displayReview: true,
    displaySKU: true,
    response: null,
    config: {
      type: "Page",
      id: "ProductListPage",
      hasConfigurable: false,
      widgetConfig: null,
    },
  },
  label: "BStore: Product List Page",
  render: (props: IProductListRenderProps) => {
    return <ProductListPageRender {...props} />;
  },
};
