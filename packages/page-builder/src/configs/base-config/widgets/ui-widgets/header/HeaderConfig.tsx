import type { ComponentConfig } from "@measured/puck";
import { IPageOrWidgetConfig, IRenderProps } from "../../../../../types/page-builder";
import { HeaderRender } from "./HeaderRender";

export type IHeaderConfig = {
  response: {
    data: any;
  } | null;
  config: IPageOrWidgetConfig;
};

export type IHeaderRenderProps = IHeaderConfig & IRenderProps;

export const HeaderConfig: ComponentConfig<IHeaderConfig> = {
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
      hasConfigurable: false,
      type: "Layout",
      id: "HeaderLayout",
      widgetConfig: null,
    },
  },
  permissions: {
    drag: false,
    duplicate: false,
    delete: false,
    insert: false,
  },
  render: (props: IHeaderRenderProps) => {
    return <HeaderRender {...props} />;
  },
};

export const getHeaderConfig = (hasDropZoneDisabled?: boolean): ComponentConfig<IHeaderConfig> => {
  return {
    ...HeaderConfig,
    render: (props: IHeaderRenderProps) => {
      return <HeaderRender {...props} hasDropZoneDisabled={hasDropZoneDisabled} />;
    },
  };
};
