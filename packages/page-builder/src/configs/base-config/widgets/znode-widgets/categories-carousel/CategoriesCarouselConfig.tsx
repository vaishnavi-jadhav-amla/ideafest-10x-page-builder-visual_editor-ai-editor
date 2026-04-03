import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../types/page-builder";

import { CategoriesCarouselRender } from "./CategoriesCarouselRender";
import type { ComponentConfig } from "@measured/puck";
import DataStateHandler from "packages/page-builder/src/component/data-handler/DataStateHandler";
import { IFeatureCategoriesData } from "@znode/types/category";
import { WIDGET_CONFIGURATION_MESSAGES } from "@znode/page-builder/constants";

interface ISwapperConfig {
  spaceBetween: number;
  slidesPerView: number;
  hasNavigationEnable: boolean;
  hasPaginationEnable: boolean;
  hasGrid: boolean;
}

export interface ICategoriesCarouselConfig extends ISwapperConfig {
  response: {
    data: IFeatureCategoriesData[] | null;
  } | null;
  config: IPageOrWidgetConfig;
}

export type ICategoriesCarouselRenderProps = IRenderProps & ICategoriesCarouselConfig;

export const CategoriesCarouselConfig: ComponentConfig<ICategoriesCarouselConfig> = {
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
      id: "CategoriesWidget",
      hasConfigurable: true,
      widgetConfig: {
        masterWidgetKey: "1992",
        widgetKey: "1992", //! don't remove, update widget key when user click on settings icon
        widgetCode: "CategoryList",
        displayName: "category List",
      },
    },
  },
  label: "Categories Carousel",
  render: (props: ICategoriesCarouselRenderProps) => {
    const { response, ...restProps } = props;

    const defaultData: IFeatureCategoriesData[] = [];
    const updatedResponseData = response?.data || defaultData;

    return (
      <DataStateHandler response={updatedResponseData} emptyMessage={WIDGET_CONFIGURATION_MESSAGES.CATEGORIES_CAROUSEL_CONFIGURATION_REQUIRED}>
        <CategoriesCarouselRender response={response} {...restProps} />
      </DataStateHandler>
    );
  },
};