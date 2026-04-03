import { BlogDetailsPageRender } from "./BlogDetailsPageRender";
import type { ComponentConfig } from "@measured/puck";
import { VISUAL_EDITOR_SETTINGS } from "packages/page-builder/src/constants/visual-editor";
import { IRenderProps } from "packages/page-builder/src/types/page-builder";

const enableEditDefaultWidget:boolean = Boolean(VISUAL_EDITOR_SETTINGS.ENABLE_EDIT_WIDGET);


export interface IBlogDetailsPageConfig {
  response: {
    data: null | any;
  } | null;
  config: {
    type: "Page" | "Widget";
    id: string;
    widgetConfig: any | null;
  };
}

export type BlogDetailsPageRenderProps = IRenderProps & IBlogDetailsPageConfig;

export const BlogDetailsPageConfig: ComponentConfig<IBlogDetailsPageConfig> = {
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
      id: "BlogDetailsPage",
      widgetConfig: null,
    },
  },
  permissions: {
    delete: enableEditDefaultWidget,
    drag: true,
    duplicate: enableEditDefaultWidget,
    insert: enableEditDefaultWidget,
  },
  label: "Blog Details",
  render: (props: BlogDetailsPageRenderProps) => {
    return <BlogDetailsPageRender key={props.id} {...props} />;
  },
};
