import type { ComponentConfig } from "@measured/puck";
import { IRenderProps } from "../../../../../types/page-builder";
import { LogoRender } from "./LogoRender";

export interface ILogoConfig {
  logos: {
    alt: string;
    imageUrl: string;
  }[];
}

export type ILogoRenderProps = ILogoConfig & IRenderProps;

export const LogoConfig: ComponentConfig<ILogoConfig> = {
  fields: {
    logos: {
      label: "Logos",
      type: "array",
      getItemSummary: (item, i) => item.alt || `Feature #${i}`,
      defaultItemProps: {
        alt: "",
        imageUrl: "",
      },
      arrayFields: {
        alt: { type: "text", label: "Alt Text" },
        imageUrl: { type: "text", label: "Image URL" },
      },
    },
  },
  defaultProps: {
    logos: [
      {
        alt: "google",
        imageUrl: "https://logolook.net/wp-content/uploads/2021/06/Google-Logo.png",
      },
    ],
  },
  render: (props: ILogoRenderProps) => {
    return <LogoRender {...props} />;
  },
};
