import { IHomePagePromo } from "@znode/types/content-container";
import type { IRenderProps } from "../../../../../types/page-builder";

import type { ComponentConfig } from "@measured/puck";
import { HomePagePromoRender } from "./HomePagePromoRender";
import { baseUrlOfWidgets } from "../../../../../constants/constants";
import { httpRequest } from "@znode/base-components/http-request";

export interface IHomePagePromoConfig {
  title: string;
  response: {
    data: IHomePagePromo;
  } | null;
  config: {
    type: "Page" | "Widget";
    id: string;
    hasConfigurable: boolean;
    widgetConfig: any | null;
  };
}

export type IHomePagePromoConfigRenderProps = IHomePagePromoConfig & IRenderProps;

export const HomePagePromoConfig: ComponentConfig<IHomePagePromoConfig> = {
  fields: {
    title: {
      type: "text",
      label: "Title",
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
  resolveData: async ({ props }) => {
    if (props.response?.data) {
      return { props };
    }

    const widgetKey = "1788";

    const eventData = {
      type: "update",
      actionType: "customize_widget",
      category: "widget",
      data: {
        widgetName: "",
        widgetKey,
        widgetCode: "HomePagePromo",
        typeOfMapping: "PortalMapping",
        displayName: "Home Page Promo",
        cmsMappingId: "",
        localeId: "",
        publishCatalogId: "",
        properties: "",
        masterWidgetKey: widgetKey,
      },
    };
    if (window.parent) {
      window.parent.postMessage(eventData, "*");
    }

    const url = `${baseUrlOfWidgets.contentContainer}?widgetKey=1788&typeOfMapping=PortalMapping`;
    const response = await httpRequest<IHomePagePromo>({ endpoint: url });

    return {
      props: {
        response: {
          data: response || null,
        },
      },
    };
  },
  defaultProps: {
    response: null,
    title: "",
    config: {
      type: "Widget",
      id: "HomePagePromoWidget",
      hasConfigurable: false,
      widgetConfig: {
        widgetKey: "1788",
      },
    },
  },
  label: "Home Page Promo - Theme1 override",
  render: (props: IHomePagePromoConfigRenderProps) => {
    return <HomePagePromoRender {...props} />;
  },
};
