import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../types/page-builder";

import type { ComponentConfig } from "@measured/puck";
import DataStateHandler from "packages/page-builder/src/component/data-handler/DataStateHandler";
import { IProductList } from "@znode/types/product";
import { ProductsCarouselRender } from "./ProductsCarouselRender";
import { WIDGET_CONFIGURATION_MESSAGES } from "@znode/page-builder/constants";

interface ISwapperConfig {
  spaceBetween: number;
  slidesPerView: number;
  hasNavigationEnable: boolean;
  hasPaginationEnable: boolean;

  hasGrid: boolean;
}

export interface IProductsCarouselConfig extends ISwapperConfig {
  response: {
    data: IProductList | null;
  } | null;
  config: IPageOrWidgetConfig;
}

export type IProductsCarouselRenderProps = IProductsCarouselConfig & IRenderProps;

export const ProductsCarouselConfig: ComponentConfig<IProductsCarouselConfig> = {
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
      id: "ProductsCarouselWidget",
      hasConfigurable: true,
      widgetConfig: {
        masterWidgetKey: "666",
        widgetKey: "666", //! don't remove, update widget key when user click on settings icon
        widgetCode: "ProductList",
        displayName: "Product List",
      },
    },
  },
  label: "Products Carousel",
  render: (props: IProductsCarouselRenderProps) => {
    const { response, ...restProps } = props;

    const defaultData = {};
    const updatedResponseData = response?.data || defaultData;

    return (
      <DataStateHandler response={updatedResponseData} emptyMessage={WIDGET_CONFIGURATION_MESSAGES.PRODUCT_CAROUSEL_CONFIGURATION_REQUIRED}>
        <ProductsCarouselRender response={response} key={props.id} {...restProps} />
      </DataStateHandler>
    );
  },
};