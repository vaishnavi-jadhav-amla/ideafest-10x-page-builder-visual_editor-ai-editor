import { BlogPageRender } from "./BlogPageRender";
import type { ComponentConfig } from "@measured/puck";
import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../../types/page-builder";
import { VISUAL_EDITOR_SETTINGS } from "packages/page-builder/src/constants/visual-editor";


const enableEditDefaultWidget:boolean = Boolean(VISUAL_EDITOR_SETTINGS.ENABLE_EDIT_WIDGET);

export interface IBlogPageConfig {
  response: {
    data: any;
  } | null;
  config: IPageOrWidgetConfig
}

export type IBlogPageRenderProps = IRenderProps & IBlogPageConfig;

export const BlogPageConfig: ComponentConfig<IBlogPageConfig> = {
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
      id: "BlogsPage",
      hasConfigurable:false,
      type: "Page",
      widgetConfig: null,
    },
  },
  permissions: {
    delete:  enableEditDefaultWidget,
    drag:  true,
    duplicate:  enableEditDefaultWidget,
    insert:  enableEditDefaultWidget,
  },
  label: "Blog Page",
  render: (props: IBlogPageRenderProps) => {
    return <BlogPageRender key={props.id} {...props} />;
  },
};
