import { VISUAL_EDITOR_SETTINGS } from "packages/page-builder/src/constants/visual-editor";
import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../../types/page-builder";

import { ProductListPageRender } from "./ProductListPageRender";
import type { ComponentConfig } from "@measured/puck";

const enableEditDefaultWidget: boolean = Boolean(VISUAL_EDITOR_SETTINGS.ENABLE_EDIT_WIDGET);

export interface IProductListPageConfig {
  displayCategory: boolean;
  displayFacets: boolean;
  displayReview: boolean;
  displaySKU: boolean;
  response: {
    data: any;
  } | null;
  config: IPageOrWidgetConfig
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
      hasConfigurable: false,
      id: "ProductListPage",
      widgetConfig: null,
    },
  },
  permissions: {
    delete:  enableEditDefaultWidget,
    drag:  true,
    duplicate:  enableEditDefaultWidget,
    insert:  enableEditDefaultWidget,
  },
  label: "Product List Page",
  render: (props: IProductListRenderProps) => {
    return <ProductListPageRender {...props} />;
  },
};
