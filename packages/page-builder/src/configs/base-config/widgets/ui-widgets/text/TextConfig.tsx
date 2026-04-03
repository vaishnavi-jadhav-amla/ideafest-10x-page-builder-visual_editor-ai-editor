import type { ComponentConfig } from "@measured/puck";
import DataStateHandler from "packages/page-builder/src/component/data-handler/DataStateHandler";
import { IRenderProps } from "../../../../../types/page-builder";
import { TextRender } from "./TextRender";
import { WIDGET_CONFIGURATION_MESSAGES } from "packages/page-builder/src/constants/constants";

export interface IPadding {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

export type ITextConfig = {
  align: "left" | "center" | "right";
  text?: string;
  padding?: IPadding;
  size?: "s" | "m";
  color: "default" | "muted";
  weight: "normal" | "semibold" | "bold" | "extrabold";
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
    weight: {
      label: "Weight",
      type: "select",
      options: [
        { label: "Normal", value: "normal" },
        { label: "Semibold", value: "semibold" },
        { label: "Bold", value: "bold" },
        { label: "Extrabold", value: "extrabold" },
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
    padding: {
      label: "Padding",
      type: "object",
      objectFields: {
        top: {
          label: "Top",
          type: "number",
          min: 0,
          max: 200,
        },
        right: {
          label: "Right",
          type: "number",
          min: 0,
          max: 200,
        },
        bottom: {
          label: "Bottom",
          type: "number",
          min: 0,
          max: 200,
        },
        left: {
          label: "Left",
          type: "number",
          min: 0,
          max: 200,
        },
      },
    },
  },
  defaultProps: {
    align: "left",
    text: "Text",
    padding: {
      top: "0",
      right: "0",
      bottom: "0",
      left: "0",
    },
    size: "s",
    weight: "normal",
    color: "default",
  },
  render: (props: ITextRenderProps) => {
    return (
      <DataStateHandler response={props.text} emptyMessage={WIDGET_CONFIGURATION_MESSAGES.TEXT_CONFIGURATION_REQUIRED}>
        <TextRender {...props} />
      </DataStateHandler>
    );
  },
};
