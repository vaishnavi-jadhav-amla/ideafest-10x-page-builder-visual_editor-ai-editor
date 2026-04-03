import type { ComponentConfig } from "@measured/puck";
import { HeroRender } from "./HeroRender";
import { IRenderProps } from "../../../../../types/page-builder";

interface IPadding {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

export interface IHeroConfig {
  quote?: { index: number; label: string };
  title: string;
  description: string;
  align?: string;
  padding: IPadding;
  image?: {
    mode?: "inline" | "background";
    url?: string;
  };
  buttons: {
    label: string;
    href: string;
    variant?: "primary" | "secondary";
    more?: { text: string }[];
  }[];
}

export type IRenderHeroProps = IHeroConfig & IRenderProps;
export const HeroConfig: ComponentConfig<IHeroConfig> = {
  fields: {
    title: { label: "Title", type: "text" },
    description: { label: "Description", type: "textarea" },
    buttons: {
      label: "Buttons",
      type: "array",
      min: 1,
      max: 4,
      getItemSummary: (item) => item.label || "Button",
      arrayFields: {
        label: { type: "text", label: "Label" },
        href: { type: "text", label: "Href" },
        variant: {
          label: "Variant",
          type: "select",
          options: [
            { label: "primary", value: "primary" },
            { label: "secondary", value: "secondary" },
          ],
        },
      },
      defaultItemProps: {
        label: "Button",
        href: "#",
      },
    },
    align: {
      label: "Align",
      type: "radio",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
      ],
    },
    image: {
      label: "Image",
      type: "object",
      objectFields: {
        url: { label: "Url", type: "text" },
        mode: {
          label: "Mode",
          type: "radio",
          options: [
            { label: "Inline", value: "inline" },
            { label: "Background", value: "background" },
          ],
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
    title: "Hero",
    align: "left",
    description: "Description",
    buttons: [{ label: "Learn more", href: "#" }],
    padding: {
      top: "0",
      right: "0",
      bottom: "0",
      left: "0",
    },
  },
  resolveFields: async (data, { fields }) => {
    if (data.props.align === "center") {
      return {
        ...fields,
        image: undefined,
      };
    }

    return fields;
  },
  render: (props: IRenderHeroProps) => {
    return <HeroRender {...props} />;
  },
};
