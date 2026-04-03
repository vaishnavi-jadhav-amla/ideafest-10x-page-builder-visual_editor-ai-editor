import type { ComponentConfig } from "@measured/puck";
import { IRenderProps } from "../../../../../types/page-builder";
import { spacingOptions } from "./spacing-options";

export interface IVerticalSpaceConfig {
  size: string;
}

type IVerticalSpaceRenderProps = IRenderProps & IVerticalSpaceConfig;

export const VerticalSpaceConfig: ComponentConfig<IVerticalSpaceConfig> = {
  label: "Vertical Space",
  fields: {
    size: {
      label: "Size",
      type: "select",
      options: spacingOptions,
    },
  },
  defaultProps: {
    size: "24px",
  },
  render: ({ size }: IVerticalSpaceRenderProps) => {
    return <div style={{ height: size, width: "100%" }} />;
  },
};
