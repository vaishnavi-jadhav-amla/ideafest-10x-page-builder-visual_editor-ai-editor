import type { ComponentConfig } from "@measured/puck";
import { TextRender } from "./TextRender";
import { IRenderProps } from "../../../../../types/page-builder";

export type ITextConfig = {
  align: "left" | "center" | "right";
  text?: string;
  padding?: string;
  size?: "s" | "m";
  color: "default" | "muted";
  maxWidth?: string;
};

export type ITextRenderProps = ITextConfig & IRenderProps;

export const TextConfig: ComponentConfig<ITextConfig> = {
  fields: {
    text: { label: "Text", type: "textarea" },
    size: {
      label: "Size",
      type: "select",
      options: [
        { label: "S", value: "s" },
        { label: "M", value: "m" },
      ],
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
    color: {
      label: "Color",
      type: "radio",
      options: [
        { label: "Default", value: "default" },
        { label: "Muted", value: "muted" },
      ],
    },
    padding: { label: "Padding", type: "text" },
    maxWidth: { label: "Max width", type: "text" },
  },
  defaultProps: {
    align: "left",
    text: "theme1 override text",
    padding: "24px",
    size: "m",
    color: "default",
  },
  label: "Text - theme1 override",
  render: (props: ITextRenderProps) => {
    return <TextRender {...props} />;
  },
};
