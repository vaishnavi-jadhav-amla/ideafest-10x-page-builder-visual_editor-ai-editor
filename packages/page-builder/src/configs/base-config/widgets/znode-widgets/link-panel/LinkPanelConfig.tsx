import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../types/page-builder";

import type { ComponentConfig } from "@measured/puck";
import { LinkPanelWrapper } from "./LinkPanelRender";
import {  WIDGET_CONFIGURATION_MESSAGES } from "../../../../../constants/constants";
import DataStateHandler from "../../../../../component/data-handler/DataStateHandler";

export interface ILinkPanelConfig {
  customClass: string;
  contentOrientation: "horizontal" | "vertical";
  response: {
    data: any;
  } | null;
  config: IPageOrWidgetConfig;
}

export type ILinkPanelRenderProps = ILinkPanelConfig & IRenderProps;

export const LinkPanelConfig: ComponentConfig<ILinkPanelConfig> = {
  fields: {
    contentOrientation: {
      type: "radio",
      label: "Orientation",
      options: [
        { label: "Vertical", value: "vertical" },
        { label: "Horizontal", value: "horizontal" },
      ],
    },
    customClass: {
      type: "text",
      label: "Custom Class",
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
    response: null,
    contentOrientation: "vertical",
    customClass: "",
    config: {
      type: "Widget",
      id: "LinkPanelWidget",
      hasConfigurable: true,
      widgetConfig: {
        masterWidgetKey: "2253",
        widgetKey: "2253", //! don't remove, update widget key when user click on settings icon
        typeOfMapping: "PortalMapping",
        widgetCode: "LinkPanel",
        displayName: "Link Panel",
      },
    },
  },
  permissions: {
    duplicate: false
  },
  label: "Link Panel",
  render: (props: ILinkPanelRenderProps) => {

    const defaultData: any = [];
    const updatedResponseData = props.response?.data || defaultData;

    return (
      <DataStateHandler response={updatedResponseData} emptyMessage={WIDGET_CONFIGURATION_MESSAGES.LINK_PANEL_CONFIGURATION_REQUIRED}>
        <LinkPanelWrapper {...props} />
      </DataStateHandler>
    );
  },
};

export const getLinkPanelConfig = (permissions: ComponentConfig["permissions"]): ComponentConfig<ILinkPanelConfig> => {
  const newPermissions = { ...LinkPanelConfig.permissions, ...permissions };
  return {
    ...LinkPanelConfig,
    permissions: newPermissions,
  };
};
