import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../types/page-builder";
import type { ComponentConfig } from "@measured/puck";
import { StoreLocatorPageRender } from "./StoreLocatorPageRender";
import { VISUAL_EDITOR_SETTINGS } from "packages/page-builder/src/constants/visual-editor";

const enableEditDefaultWidget: boolean = Boolean(VISUAL_EDITOR_SETTINGS.ENABLE_EDIT_WIDGET);

export interface IStoreLocatorPageConfig {
  response: {
    data: any;
  } | null;
  config: IPageOrWidgetConfig;
  googleMapKey?: string;
}

export type IStoreLocatorRenderProps = IStoreLocatorPageConfig & IRenderProps;

export const StoreLocatorPageConfig: ComponentConfig<IStoreLocatorPageConfig> = {
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
      id: "StoreLocatorPage",
      widgetConfig: null,
    },
  },
  permissions: {
    delete:  enableEditDefaultWidget,
    drag:  true,
    duplicate:  enableEditDefaultWidget,
    insert:  enableEditDefaultWidget,
  },
  label: "Store Locator Page",
  render: (props: IStoreLocatorRenderProps) => {
    return <StoreLocatorPageRender {...props}/>;
  },
};
