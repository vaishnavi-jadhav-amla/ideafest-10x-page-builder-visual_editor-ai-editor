import { BrandDetailsPageRender } from "./BrandDetailsPageRender";
import type { ComponentConfig } from "@measured/puck";
import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../../types/page-builder";
import { VISUAL_EDITOR_SETTINGS } from "packages/page-builder/src/constants/visual-editor";

const enableEditDefaultWidget:boolean = Boolean(VISUAL_EDITOR_SETTINGS.ENABLE_EDIT_WIDGET);

export interface IBrandDetailsPageConfig {
  response: {
    data: any;
  } | null;
  config: IPageOrWidgetConfig;
}

export type IBrandDetailsPageRenderProps = IBrandDetailsPageConfig & IRenderProps;

export const BrandDetailsPageConfig: ComponentConfig<IBrandDetailsPageConfig> = {
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
  defaultProps: {
    response: null,
    config: {
      type: "Page",
      hasConfigurable: false,
      id: "BrandDetailsPage",
      widgetConfig: null,
    },
  },
  permissions: {
    delete:  enableEditDefaultWidget,
    drag:  true,
    duplicate:  enableEditDefaultWidget,
    insert:  enableEditDefaultWidget,
  },
  label: "Brand Details",
  render: (props: IBrandDetailsPageRenderProps) => {
    return <BrandDetailsPageRender {...props} />;
  },
};
