import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../types/page-builder";

import { AdSpaceRender } from "./AdSpaceRender";
import type { ComponentConfig } from "@measured/puck";
import DataStateHandler from "packages/page-builder/src/component/data-handler/DataStateHandler";
import type { IAdSpaces } from "@znode/types/content-container";
import { WIDGET_CONFIGURATION_MESSAGES } from "../../../../../constants/constants";
import { removeFirstWord } from "@znode/utils/common";

export interface IAdSpaceConfig {
  response: {
    data: IAdSpaces;
  } | null;
  config: IPageOrWidgetConfig;
}

export type TAdSpaceRenderProps = IAdSpaceConfig & IRenderProps;

export const AdSpaceConfig: ComponentConfig<IAdSpaceConfig> = {
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
  permissions: {
    duplicate: false
  },
  resolveData: async ({ props }) => {
    const masterWidgetKey = props?.config?.widgetConfig?.masterWidgetKey || "";
    const widgetKey = props?.config?.widgetConfig?.widgetKey;

    if (masterWidgetKey !== widgetKey) {
      return { props };
    }

    const id = removeFirstWord(props.id);
    const newWidgetKey = `${masterWidgetKey}-${id}`;

    const eventData = {
      type: "update",
      actionType: "customize_widget",
      category: "widget",
      data: {
        widgetName: "",
        widgetKey: newWidgetKey,
        widgetCode: "AdSpace",
        typeOfMapping: "PortalMapping",
        displayName: "AdSpace",
        cmsMappingId: "",
        localeId: "",
        publishCatalogId: "",
        properties: "",
        masterWidgetKey: masterWidgetKey,
      },
    };
    if (window.parent) {
      window.parent.postMessage(eventData, "*");
    }

    return {
      props: {
        response: {
          data: [],
        },
        config: {
          ...props.config,
          widgetConfig: {
            ...props.config.widgetConfig,
            widgetKey: newWidgetKey,
          },
        },
      },
    };
  },
  defaultProps: {
    response: {
      data: [],
    },
    config: {
      type: "Widget",
      id: "AdSpaceWidget",
      hasConfigurable: false,
      widgetConfig: {
        masterWidgetKey: "1787",
        widgetKey: "1787", //! don't remove, update widget key when user click on settings icon
        widgetCode: "AdSpace",
        displayName: "AdSpace",
      },
    },
  },
  label: "AdSpace",
  render: (props: TAdSpaceRenderProps) => {
    const { response, ...restProps } = props;

    const defaultData: IAdSpaces = [];

    const updatedResponseData = response?.data || defaultData;

    return (
      <DataStateHandler response={updatedResponseData} emptyMessage={WIDGET_CONFIGURATION_MESSAGES.ADSPACE_PAGE_CONFIGURATION_REQUIRED}>
        <AdSpaceRender response={response} {...restProps} />
      </DataStateHandler>
    );
  },
};