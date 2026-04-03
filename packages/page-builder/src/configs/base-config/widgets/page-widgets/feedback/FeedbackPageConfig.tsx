import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../types/page-builder";
import type { ComponentConfig } from "@measured/puck";
import { FeedbackPageRender } from "./FeedbackPageRender";
import { VISUAL_EDITOR_SETTINGS } from "packages/page-builder/src/constants/visual-editor";

const enableEditDefaultWidget:boolean = Boolean(VISUAL_EDITOR_SETTINGS.ENABLE_EDIT_WIDGET);

export interface IFeedbackPageConfig {
  heading: string | null;
  description: string | null;
  config: IPageOrWidgetConfig;
}

export type IFeedbackRenderProps = IFeedbackPageConfig & IRenderProps;

export const FeedbackPageConfig: ComponentConfig<IFeedbackPageConfig> = {
  fields: {
    heading: {
      type: "text",
      label: "Heading",
    },
    description: {
      type: "textarea",
      label: "Description",
    },

    config: {
      type: "custom",
      render: () => <></>,
    },
  },
  defaultProps: {
    heading: "Please Provide Your Feedback",
    description: "Please let us know how your shopping experience was. Any feedback that can help us improve our store is greatly appreciated.",
    config: {
      type: "Page",
      hasConfigurable: false,
      id: "FeedbackPage",
      widgetConfig: null,
    },
  },
  permissions: {
    delete:  enableEditDefaultWidget,
    drag:  true,
    duplicate:  enableEditDefaultWidget,
    insert:  enableEditDefaultWidget,
  },
  label: "Feedback Page",
  render: (props: IFeedbackRenderProps) => {
    return <FeedbackPageRender {...props} />;
  },
};
