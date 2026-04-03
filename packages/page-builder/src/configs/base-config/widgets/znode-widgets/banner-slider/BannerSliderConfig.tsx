import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../types/page-builder";

import { BannerSliderWrapper } from "./BannerSliderRender";
import type { ComponentConfig } from "@measured/puck";
import DataStateHandler from "packages/page-builder/src/component/data-handler/DataStateHandler";
import { ISliderBanners } from "@znode/types/slider-banner";
import { WIDGET_CONFIGURATION_MESSAGES } from "@znode/page-builder/constants";

export interface ICarouselConfig {
  axis: "horizontal" | "vertical";
  showThumbs: boolean;
  showArrows: boolean;
  transitionTime: number;
  swipeScrollTolerance: number;
  interval: number;
  selectedItem: number;
  showIndicators: boolean;
  infiniteLoop: boolean;
  autoPlay: boolean;
  swipeable: boolean;
  stopOnHover: boolean;
  useKeyboardArrows: boolean;
  showStatus: boolean;
  emulateTouch: boolean;
  autoFocus: boolean;
}

export interface IBannerSliderConfig extends ICarouselConfig {
  response: {
    data: ISliderBanners | null;
  } | null;
  config: IPageOrWidgetConfig;
}

export type IBannerSliderRenderProps = IRenderProps & IBannerSliderConfig;

export const BannerSliderConfig: ComponentConfig<IBannerSliderConfig> = {
  fields: {
    axis: {
      type: "radio",
      label: "Scroll Axis",
      options: [
        { label: "Horizontal", value: "horizontal" },
        { label: "Vertical", value: "vertical" },
      ],
    },
    showThumbs: {
      type: "radio",
      label: "Thumbnails",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    showArrows: {
      type: "radio",
      label: "Arrows",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    selectedItem: {
      type: "number",
      label: "Start from Selected Item",
    },
    infiniteLoop: {
      type: "radio",
      label: "Infinite Loop",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    interval: {
      type: "number",
      label: "Interval (ms)",
    },
    showIndicators: {
      type: "radio",
      label: "Indicators",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    autoPlay: {
      type: "radio",
      label: "Auto Play",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    transitionTime: {
      type: "number",
      label: "Transition Time (ms)",
    },
    swipeScrollTolerance: {
      type: "number",
      label: "Swipe Scroll Tolerance",
    },
    showStatus: {
      type: "radio",
      label: "Pagination",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    stopOnHover: {
      type: "radio",
      label: "Stop on Hover",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    swipeable: {
      type: "radio",
      label: "Swipeable",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    useKeyboardArrows: {
      type: "radio",
      label: "Use Keyboard Arrows",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    emulateTouch: {
      type: "radio",
      label: "Emulate Touch",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    autoFocus: {
      type: "radio",
      label: "Auto Focus",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    config: {
      type: "custom",
      render: () => <></>,
    },
    response: {
      type: "custom",
      render: () => <></>,
    },
  },
  defaultProps: {
    axis: "horizontal",
    showThumbs: true,
    showArrows: true,
    autoFocus: false,
    infiniteLoop: true,
    interval: 2000,
    selectedItem: 0,
    transitionTime: 2000,
    swipeScrollTolerance: 10,
    showStatus: true,
    showIndicators: true,
    stopOnHover: true,
    swipeable: true,
    useKeyboardArrows: true,
    emulateTouch: true,
    autoPlay: true,
    response: null,
    
    config: {
      type: "Widget",
      id: "BannerSliderWidget",
      hasConfigurable: true,
      widgetConfig: {
        masterWidgetKey: "555",
        widgetKey: "555", //! don't remove, update widget key when user click on settings icon
        widgetCode: "BannerSlider",
        displayName: "Banner Slider",
      },
      
    },
  },
  label: "Banner Slider",
  permissions: {
    duplicate: false
  },
  render: (props: IBannerSliderRenderProps) => {
    const { response, ...restProps } = props;

    const defaultData = {};
    const updatedResponseData = (response?.data?.sliderBanners ?? response?.data?.commonSliderData) || defaultData;

    return (
      <DataStateHandler response={updatedResponseData} emptyMessage={WIDGET_CONFIGURATION_MESSAGES.BANNER_SLIDER_CONFIGURATION_REQUIRED}>
        <BannerSliderWrapper response={response} key={props.id} {...restProps} />
      </DataStateHandler>
    );
  },
};
