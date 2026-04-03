import type { IPageOrWidgetConfig, IRenderProps } from "../../../../../types/page-builder";

import type { ComponentConfig } from "@measured/puck";
import { NewsLetterWrapper } from "./NewsLetterRender";

export interface INewsLetterConfig {
  label: string;
  placeholder: string;
  buttonText: string;
  align?: string;
}

export type INewsLetterConfigRenderProps = INewsLetterConfig & IRenderProps;

export const NewsLetterConfig: ComponentConfig<INewsLetterConfig> = {
  fields: {
    label: {
      type: "text",
      label: "Label",
    },
    placeholder: {
      type: "text",
      label: "Placeholder",
    },
    buttonText: {
      type: "text",
      label: "Button Text",
    },
    align: {
      label: "Align",
      type: "radio",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
  },
  permissions: {
    duplicate: false
  },
  defaultProps: {
    label: "SIGN UP FOR EMAIL",
    placeholder: "Your Email Address",
    buttonText: "Join",
  },
  label: "Newsletter Widget",
  render: (props: INewsLetterConfigRenderProps) => {
    return <NewsLetterWrapper {...props} />;
  },
};
