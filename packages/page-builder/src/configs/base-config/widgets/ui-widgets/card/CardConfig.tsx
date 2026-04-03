import type { ComponentConfig } from "@measured/puck";

import dynamicIconImports from "lucide-react/dynamicIconImports";
import { CardRender } from "./CardRender";
import { IRenderProps } from "../../../../../types/page-builder";

const iconOptions = Object.keys(dynamicIconImports).map((iconName) => ({
  label: iconName,
  value: iconName,
}));

export interface ICardConfig {
  title: string;
  description: string;
  icon?: string;
  mode: "flat" | "card";
}

export type ICardRenderProps = ICardConfig & IRenderProps;

export const CardConfig: ComponentConfig<ICardConfig> = {
  fields: {
    title: { label: "Title", type: "text" },
    description: { label: "Description", type: "textarea" },
    icon: {
      label: "Icon",
      type: "select",
      options: iconOptions,
    },
    mode: {
      label: "Mode",
      type: "radio",
      options: [
        { label: "Card", value: "card" },
        { label: "Flat", value: "flat" },
      ],
    },
  },
  defaultProps: {
    title: "Title",
    description: "Description",
    icon: "Feather",
    mode: "flat",
  },
  render: (props: ICardRenderProps) => {
    return <CardRender {...props} />;
  },
};
