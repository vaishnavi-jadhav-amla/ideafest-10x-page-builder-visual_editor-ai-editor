import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../types/page-builder";
import type { ComponentConfig } from "@measured/puck";
import { CartPageRender } from "./CartPageRender";
import { ICartPageDetailsResponse } from "@znode/types/cart-page-details";

export interface ICartPageConfig {
  config: IPageOrWidgetConfig;
  response?: {
    data: ICartPageDetailsResponse | null;
  } | null;
}

export type ICartRenderProps = ICartPageConfig & IRenderProps;

export const CartPageConfig: ComponentConfig<ICartPageConfig> = {
  fields: {
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
      id: "CartPage",
      widgetConfig: null,
    },
  },
  permissions: {
    delete: false,
    drag: false,
    duplicate: false,
    insert: false,
  },
  label: "Cart Page",
  render: (props: ICartRenderProps) => {
    return <CartPageRender {...props} />;
  },
};
