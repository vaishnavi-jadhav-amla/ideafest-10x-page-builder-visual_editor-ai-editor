import type { ComponentConfig } from "@measured/puck";
import { CardRender } from "./CardRender";
import { IRenderProps } from "../../../../../types/page-builder";

export type ICardConfig = {
  text?: string;
};

export type ICardRenderProps = ICardConfig & IRenderProps;

export const CardConfig: ComponentConfig<ICardConfig> = {
  fields: {
    text: { label: "Text", type: "textarea" },
  },
  defaultProps: {
    text: "Text",
  },
  label: "BStore: Card",
  render: (props: ICardRenderProps) => {
    return <CardRender {...props} />;
  },
};
