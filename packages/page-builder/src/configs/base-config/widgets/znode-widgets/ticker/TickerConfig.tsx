import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../types/page-builder";

import type { ComponentConfig } from "@measured/puck";
import { TickerWrapper } from "./TickerRender";
import { WIDGET_CONFIGURATION_MESSAGES } from "../../../../../constants/constants";
import DataStateHandler from "../../../../../component/data-handler/DataStateHandler";
import { removeFirstWord } from "@znode/utils/common";

export interface ITickerConfig {
  response: {
    data: any;
  } | null;
  config: IPageOrWidgetConfig;
}

export type ITickerConfigRenderProps = ITickerConfig & IRenderProps;

export const TickerConfig: ComponentConfig<ITickerConfig> = {
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
        widgetCode: "HomePageTicker",
        typeOfMapping: "PortalMapping",
        displayName: "Home Page Ticker",
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
          data: {},
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
    response: null,
    config: {
      type: "Widget",
      id: "TickerWidget",
      hasConfigurable: false,
      widgetConfig: {
        masterWidgetKey: "1786",
        widgetKey: "1786", //! don't remove, update widget key when user click on settings icon
        typeOfMapping: "PortalMapping",
        widgetCode: "HomePageTicker",
        displayName: "Home Page Ticker",
      },
    },
  },
  permissions: {
    drag: false,
    insert: false,
  },
  label: "Ticker",
  render: (props: ITickerConfigRenderProps) => {
    const { response, ...restProps } = props;

    const defaultData: any = {};

    const updatedResponseData = response?.data || defaultData;
    return (
      <DataStateHandler response={updatedResponseData} emptyMessage={WIDGET_CONFIGURATION_MESSAGES.HOME_PAGE_TICKER_CONFIGURATION_REQUIRED}>
        <TickerWrapper {...restProps} response={response} />
      </DataStateHandler>
    );
  },
};

export const getTickerConfig = (permissions?: ComponentConfig["permissions"]): ComponentConfig<ITickerConfig> => {
  const updatedPermissions = TickerConfig?.permissions ? { ...TickerConfig?.permissions, ...permissions } : {};
  return {
    ...TickerConfig,
    permissions: updatedPermissions,
  };
};
