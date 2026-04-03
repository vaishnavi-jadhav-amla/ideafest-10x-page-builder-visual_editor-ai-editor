import { VISUAL_EDITOR_SETTINGS } from "packages/page-builder/src/constants/visual-editor";
import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../../types/page-builder";

import { ProductDetailsPageRender } from "./ProductDetailsPageRender";
import type { ComponentConfig } from "@measured/puck";

const enableEditDefaultWidget:boolean = Boolean(VISUAL_EDITOR_SETTINGS.ENABLE_EDIT_WIDGET);


// TODO: this is not widget so we need to move config in other directory? need confirmation
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
      hasConfigurable: false,
      id: "ProductDetailsPage",
      widgetConfig: null,
    },
  },
  permissions: {
    delete:  enableEditDefaultWidget,
    drag:  true,
    duplicate:  enableEditDefaultWidget,
    insert:  false,
  },
  label: "Product Details Page",
  render: (props: IProductDetailsPageRenderProps) => {
    return <ProductDetailsPageRender {...props} />;
  },
};
