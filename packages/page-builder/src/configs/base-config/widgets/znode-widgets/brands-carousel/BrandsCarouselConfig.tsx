import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../types/page-builder";

import type { ComponentConfig } from "@measured/puck";
import DataStateHandler from "packages/page-builder/src/component/data-handler/DataStateHandler";
import { IBrandList } from "@znode/types/brand";
import { BrandsCarouselRender } from "./BrandsCarouselRender";

interface ISwapperConfig {
  spaceBetween: number;
  slidesPerView: number;
  hasNavigationEnable: boolean;
  hasPaginationEnable: boolean;

  hasGrid: boolean;
}

export interface IBrandsCarouselConfig extends ISwapperConfig {
  response: {
    data: IBrandList | null;
  } | null;
  config: IPageOrWidgetConfig;
}

export type IBrandsCarouselRenderProps = IBrandsCarouselConfig & IRenderProps;

export const BrandsCarouselConfig: ComponentConfig<IBrandsCarouselConfig> = {
  fields: {
    spaceBetween: {
      type: "number",
      label: "Card Space",
    },
    slidesPerView: {
      type: "number",
      label: "Max Cards Per View",
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
      label: "Indicators",
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
    spaceBetween: 10,
    slidesPerView: 5,
    hasNavigationEnable: true,
    hasPaginationEnable: true,
    response: null,
    hasGrid: false,
    config: {
      type: "Widget",
      id: "BrandsCarouselWidget",
      hasConfigurable: true,
      widgetConfig: {
        masterWidgetKey: "999",
        widgetKey: "999", //! don't remove, update widget key when user click on settings icon
        widgetCode: "BrandList",
        displayName: "Brand List",
      },
    },
  },
  label: "Brands Carousel",
  render: (props: IBrandsCarouselRenderProps) => {
    const { response, ...restProps } = props;

    const defaultData = {};
    const updatedResponseData = response?.data || defaultData;

    return (
      <DataStateHandler response={updatedResponseData}>
        <BrandsCarouselRender response={response} key={props.id} {...restProps} />
      </DataStateHandler>
    );
  },
};