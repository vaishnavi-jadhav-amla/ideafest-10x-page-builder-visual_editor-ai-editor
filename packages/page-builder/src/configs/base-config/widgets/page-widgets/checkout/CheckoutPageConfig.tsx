import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../types/page-builder";
import type { ComponentConfig } from "@measured/puck";
import { CheckoutPageRender } from "./CheckoutPageRender";
import { ICheckoutPageDetailsResponse } from "@znode/types/checkout-page-details";

export interface ICheckoutPageConfig {
  config: IPageOrWidgetConfig;
  response?: {
    data: ICheckoutPageDetailsResponse | null;
  } | null;
}

export type ICheckoutRenderProps = ICheckoutPageConfig & IRenderProps;

export const CheckoutPageConfig: ComponentConfig<ICheckoutPageConfig> = {
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
      id: "CheckoutPage",
      widgetConfig: null,
    },
  },
  permissions: {
    delete: false,
    drag: false,
    duplicate: false,
    insert: false,
  },
  label: "Checkout Page",
  render: (props: ICheckoutRenderProps) => {
    return <CheckoutPageRender {...props} />;
  },
};
