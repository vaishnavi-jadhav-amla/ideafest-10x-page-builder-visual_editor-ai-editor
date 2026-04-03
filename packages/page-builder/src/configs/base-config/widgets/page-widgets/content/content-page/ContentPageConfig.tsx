import { VISUAL_EDITOR_SETTINGS } from "packages/page-builder/src/constants/visual-editor";
import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../../types/page-builder";

import { ContentPageRender } from "./ContentPageRender";
import type { ComponentConfig } from "@measured/puck";

const enableEditDefaultWidget:boolean = Boolean(VISUAL_EDITOR_SETTINGS.ENABLE_EDIT_WIDGET);

export interface IContentDetailsPageConfig {
  response: {
    data: any;
  } | null;
  config: IPageOrWidgetConfig;
}

export type IContentPageRenderProps = IContentDetailsPageConfig & IRenderProps;

export const ContentPageConfig: ComponentConfig<IContentDetailsPageConfig> = {
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
      id: "ContentPage",
      widgetConfig: null,
    },
  },
  permissions: {
    delete:  enableEditDefaultWidget,
    drag:  true,
    duplicate:  enableEditDefaultWidget,
    insert:  enableEditDefaultWidget,
  },
  label: "Content Details Page",
  render: () => {
    return <ContentPageRender />;
  },
};
