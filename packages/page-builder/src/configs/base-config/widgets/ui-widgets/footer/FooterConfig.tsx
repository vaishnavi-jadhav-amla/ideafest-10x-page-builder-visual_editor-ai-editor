import type { ComponentConfig } from "@measured/puck";
import { IRenderProps } from "../../../../../types/page-builder";
import { FooterRender } from "./FooterRender";

export interface IFooterConfig {}

export type IFooterRenderProps = IFooterConfig & IRenderProps;

export const FooterConfig: ComponentConfig<IFooterConfig> = {
  fields: {},
  permissions: {
    drag: false,
    duplicate: false,
    delete: false,
    insert: false,
  },
  render: (props: IFooterRenderProps) => {
    return <FooterRender {...props} />;
  },
};

export const getFooterConfig = (hasDropZoneDisabled: boolean): ComponentConfig<IFooterConfig> => {
  return {
    ...FooterConfig,
    render: (props: IFooterRenderProps) => {
      return <FooterRender {...props} hasDropZoneDisabled={hasDropZoneDisabled} />;
    },
  };
};
