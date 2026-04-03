import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../types/page-builder";

import type { ComponentConfig } from "@measured/puck";
import DataStateHandler from "packages/page-builder/src/component/data-handler/DataStateHandler";
import { IOfferBanners } from "@znode/types/offer-banner";
import { OfferBannerWrapper } from "./OfferBannerRender";
import { WIDGET_CONFIGURATION_MESSAGES } from "@znode/page-builder/constants";

// TODO: avoid using repeated type ISwapperConfig
interface ISwapperConfig {
  spaceBetween: number;
  slidesPerView: number;
  hasNavigationEnable: boolean;
  hasPaginationEnable: boolean;
  hasGrid: boolean;
}

export interface IOfferBannerConfig extends ISwapperConfig {
  response: {
    data: IOfferBanners | null;
  } | null;
  config: IPageOrWidgetConfig;
}

export type IOfferBannerRenderProps = IOfferBannerConfig & IRenderProps;

export const OfferBannerConfig: ComponentConfig<IOfferBannerConfig> = {
  fields: {
    spaceBetween: {
      type: "number",
      label: "Card Space",
    },
    slidesPerView: {
      type: "number",
      label: "Slides Per View",
    },
    hasNavigationEnable: {
      type: "radio",
      label: "Navigation Enable",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    hasPaginationEnable: {
      type: "radio",
      label: "Pagination Enable",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    hasGrid: {
      type: "radio",
      label: "Grid Enable",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
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
  permissions: {
    duplicate: false
  },
  defaultProps: {
    response: null,
    spaceBetween: 50,
    slidesPerView: 2,
    hasNavigationEnable: true,
    hasPaginationEnable: true,
    hasGrid: false,
    config: {
      type: "Widget",
      id: "OfferBannerWidget",
      hasConfigurable: true,
      widgetConfig: {
        masterWidgetKey: "110",
        widgetKey: "110", //! don't remove, update widget key when user click on settings icon
        widgetCode: "OfferBanner",
        displayName: "Offer Banner",
      },
    },
  },
  label: "Offer Banner",
  render: (props: IOfferBannerRenderProps) => {
    const { response, ...restProps } = props;

    const defaultData: IOfferBanners = [];
    const updatedResponseData = response?.data || defaultData;

    return (
      <DataStateHandler response={updatedResponseData} emptyMessage={WIDGET_CONFIGURATION_MESSAGES.OFFER_BANNER_CONFIGURATION_REQUIRED}>
        <OfferBannerWrapper response={response} {...restProps} />
      </DataStateHandler>
    );
  },
};