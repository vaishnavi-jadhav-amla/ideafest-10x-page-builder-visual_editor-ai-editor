import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../types/page-builder";

import type { ComponentConfig } from "@measured/puck";
import DataStateHandler from "packages/page-builder/src/component/data-handler/DataStateHandler";
import { HomePagePromoRender } from "./HomePagePromoRender";
import { IHomePagePromo } from "@znode/types/content-container";
import { WIDGET_CONFIGURATION_MESSAGES } from "../../../../../constants/constants";
import { removeFirstWord } from "@znode/utils/common";

export interface IHomePagePromoConfig {
  response: {
    data: IHomePagePromo | null;
  } | null;
  config: IPageOrWidgetConfig;
}

export type IHomePagePromoConfigRenderProps = IHomePagePromoConfig & IRenderProps;

export const HomePagePromoConfig: ComponentConfig<IHomePagePromoConfig> = {
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
      return {};
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
        widgetCode: "HomePagePromo",
        typeOfMapping: "PortalMapping",
        displayName: "Home Page Promo",
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
        hasWidgetUpdated: true,
        response: {
          data: {} as IHomePagePromo,
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
      id: "HomePagePromoWidget",
      hasConfigurable: false,
      widgetConfig: {
        masterWidgetKey: "1788",
        widgetKey: "1788", //! don't remove, update widget key when user click on settings icon
        widgetCode: "HomePagePromo",
        displayName: "Home Page Promo",
      },
    },
  },
  label: "Home Page Promo",
  render: (props: IHomePagePromoConfigRenderProps) => {
    const { response, ...restProps } = props;

    const defaultData = {};

    const updatedResponseData = response?.data || defaultData;

    return (
      <DataStateHandler response={updatedResponseData} emptyMessage={WIDGET_CONFIGURATION_MESSAGES.HOME_PAGE_CONFIGURATION_REQUIRED}>
        <HomePagePromoRender response={response} {...restProps} />
      </DataStateHandler>
    );
  },
};