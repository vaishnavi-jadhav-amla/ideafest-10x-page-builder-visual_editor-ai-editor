import { ColorPicker } from "@znode/base-components/common/color-picker";
import type { ComponentConfig } from "@measured/puck";
import DataStateHandler from "packages/page-builder/src/component/data-handler/DataStateHandler";
import { HeadingRender } from "./HeadingRender";
import type { IRenderProps } from "../../../../../types/page-builder";
import { ReactNode } from "react";
import { WIDGET_CONFIGURATION_MESSAGES } from "packages/page-builder/src/constants/constants";
import Input from "@znode/base-components/common/input/Input";
export interface IHeadingProps {
  children: ReactNode;
  rank?: "1" | "2" | "3" | "4" | "5" | "6";
  size?: "xxxl" | "xxl" | "xl" | "l" | "m" | "s" | "xs" | "default";
  dataTestSelector?: string;
  headingId?: string;
}

interface IMarginPadding {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

interface IBorder {
  width: string;
  color: string;
  style: "solid" | "dotted" | "dashed";
  borderRadius: number;
}

export interface IHeadingConfig {
  align: "left" | "center" | "right";
  text?: string;
  headingId?: string;
  textColor: string;
  level?: IHeadingProps["rank"];
  size: IHeadingProps["size"];
  margin: IMarginPadding;
  padding: IMarginPadding;
  border: IBorder;
  background: string;
}

export type IHeadingRenderProps = IHeadingConfig & IRenderProps;

const sizeOptions = [
  { value: "default", label: "DEFAULT" },
  { value: "xxxl", label: "XXXL" },
  { value: "xxl", label: "XXL" },
  { value: "xl", label: "XL" },
  { value: "l", label: "L" },
  { value: "m", label: "M" },
  { value: "s", label: "S" },
  { value: "xs", label: "XS" },
];

const levelOptions = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6", value: "6" },
];

export const HeadingConfig: ComponentConfig<IHeadingConfig> = {
  fields: {
    text: {
      label: "Text",
      type: "textarea",
    },
    headingId: {
      label: "Id",
      type: "custom",
      render: ({ onChange, value }) => {
        const handleChange = (newValue: string) => {
          if (/^[a-zA-Z0-9_-]*$/.test(newValue)) {
            onChange(newValue);
          }
        };

        return (
          <div className="flex flex-col space-y-2">
            <label>{"Id"}</label>
            <Input type="text" value={value} onChange={(e) => handleChange(e.target.value)} />
          </div>
        );
      },
    },
    size: {
      label: "Size",
      type: "select",
      options: sizeOptions,
    },
    level: {
      label: "Level",
      type: "select",
      options: levelOptions,
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
    background: {
      label: "Background",
      type: "custom",
      render: ({ onChange, value }) => {
        return <ColorPicker label="Background Color" value={value} onChange={(color: string) => onChange(color)} />;
      },
    },
    textColor: {
      label: "Text Color",
      type: "custom",
      render: ({ onChange, value }) => {
        return <ColorPicker label="Text Color" value={value} onChange={(color: string) => onChange(color)} />;
      },
    },
    border: {
      label: "Border",
      type: "object",
      objectFields: {
        width: {
          label: "Width",
          type: "number",
          min: 0,
          max: 2400,
        },
        color: {
          label: "Color",
          type: "custom",
          render: ({ onChange, value }) => {
            return <ColorPicker label="color" value={value} onChange={(color: string) => onChange(color)} />;
          },
        },
        borderRadius: {
          label: "Border Radius",
          type: "number",
          min: 0,
          max: 100,
        },
        style: {
          label: "Style",
          type: "radio",
          options: [
            { label: "Solid", value: "solid" },
            { label: "Dotted", value: "dotted" },
            { label: "Dashed", value: "dashed" },
          ],
        },
      },
    },
    margin: {
      label: "Margin",
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
    text: "Heading",
    margin: {
      top: "0",
      right: "0",
      bottom: "0",
      left: "0",
    },
    padding: {
      top: "0",
      right: "0",
      bottom: "0",
      left: "0",
    },
    border: {
      width: "0",
      color: "black",
      style: "solid",
      borderRadius: 0,
    },
    size: "default",
    background: "transparent",
    textColor: "black",
  },
  render: (props: IHeadingRenderProps) => {
    return (
      <DataStateHandler response={props.text} emptyMessage={WIDGET_CONFIGURATION_MESSAGES.TEXT_CONFIGURATION_REQUIRED}>
        <HeadingRender {...props} />
      </DataStateHandler>
    );
  },
};
