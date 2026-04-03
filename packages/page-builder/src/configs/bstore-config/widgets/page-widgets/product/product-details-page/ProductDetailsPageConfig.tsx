import type { IRenderProps, IPageOrWidgetConfig } from "../../../../../../types/page-builder";

import { ProductDetailsPageRender } from "./ProductDetailsPageRender";
import type { ComponentConfig } from "@measured/puck";

export interface IProductDetailsPageConfig {
  response: {
    data: any;
  } | null;
  config: IPageOrWidgetConfig;
}

export type IProductDetailsPageRenderProps = IProductDetailsPageConfig & IRenderProps;

export const ProductDetailsPageConfig: ComponentConfig<IProductDetailsPageConfig> = {
  fields: {
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
    response: null,
    config: {
      type: "Page",
      id: "ProductDetailsPage",
      hasConfigurable: false,
      widgetConfig: null,
    },
  },
  label: "BStore: Product Details Page",
  render: (props: IProductDetailsPageRenderProps) => {
    return <ProductDetailsPageRender {...props} />;
  },
};
