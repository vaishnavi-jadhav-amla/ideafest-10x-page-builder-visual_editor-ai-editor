import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../types/page-builder";
import type { ComponentConfig } from "@measured/puck";
import { ContactUsPageRender } from "./ContactUsPageRender";
import { VISUAL_EDITOR_SETTINGS } from "packages/page-builder/src/constants/visual-editor";

const enableEditDefaultWidget:boolean = Boolean(VISUAL_EDITOR_SETTINGS.ENABLE_EDIT_WIDGET);

export interface IContactUsPageConfig {
  heading: string | null;
  description: string | null;
  config:  IPageOrWidgetConfig;
}

export type IContactUsRenderProps = IContactUsPageConfig & IRenderProps;

export const ContactUsPageConfig: ComponentConfig<IContactUsPageConfig> = {
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
    heading: "Contact Us",
    description: "Please submit your comments below. We will respond to your request as soon as possible.",
    config: {
      type: "Page",
      hasConfigurable: false,
      id: "ContactUsPage",
      widgetConfig: null,
    },
  },
  permissions: {
    delete:  enableEditDefaultWidget,
    drag:  true,
    duplicate:  enableEditDefaultWidget,
    insert:  enableEditDefaultWidget,
  },
  label: "Contact Us Page",
  render: (props: IContactUsRenderProps) => {
    return <ContactUsPageRender {...props} />;
  },
};
