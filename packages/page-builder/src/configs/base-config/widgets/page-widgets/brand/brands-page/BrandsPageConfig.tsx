import { BrandsPageRender } from "./BrandsPageRender";
import type { ComponentConfig } from "@measured/puck";
import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../../types/page-builder";
import { VISUAL_EDITOR_SETTINGS } from "packages/page-builder/src/constants/visual-editor";

const enableEditDefaultWidget:boolean = Boolean(VISUAL_EDITOR_SETTINGS.ENABLE_EDIT_WIDGET);

export interface IBrandsPageConfig {
  response: {
    data: any;
  } | null;

  config: IPageOrWidgetConfig;
}

export type IBrandsPageRenderProps = IBrandsPageConfig & IRenderProps;

export const BrandsPageConfig: ComponentConfig<IBrandsPageConfig> = {
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
    if (props.response?.data) {
      return {
        props,
      };
    }

    return {};
  },
  defaultProps: {
    response: null,
    config: {
      type: "Page",
      hasConfigurable: false,
      id: "BrandListPage",
      widgetConfig: null,
    },
  },
  permissions: {
    delete:  enableEditDefaultWidget,
    drag:  true,
    duplicate:  enableEditDefaultWidget,
    insert:  enableEditDefaultWidget,
  },
  label: "Brand List Page",
  render: (props: IBrandsPageRenderProps) => {
    return <BrandsPageRender key={props.id} {...props} />;
  },
};
