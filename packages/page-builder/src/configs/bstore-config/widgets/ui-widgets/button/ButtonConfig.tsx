import type { ComponentConfig } from "@measured/puck";
import { ButtonRender } from "./ButtonRender";
import { IRenderProps } from "../../../../../types/page-builder";

export type IButtonConfig = {
  text?: string;
};

export type IButtonRenderProps = IButtonConfig & IRenderProps;

export const ButtonConfig: ComponentConfig<IButtonConfig> = {
  fields: {
    text: { label: "Text", type: "textarea" },
  },
  defaultProps: {
    text: "Text",
  },
  label: "BStore: Button",
  render: (props: IButtonRenderProps) => {
    return <ButtonRender {...props} />;
  },
};
