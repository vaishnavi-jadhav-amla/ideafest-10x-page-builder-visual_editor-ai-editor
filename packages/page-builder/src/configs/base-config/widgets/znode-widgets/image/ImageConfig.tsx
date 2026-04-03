import type { IRenderProps } from "../../../../../types/page-builder";
import { AssetsGallery } from "../../../../../component/assets-gallery";
import type { ComponentConfig } from "@measured/puck";
import { ImageRender } from "./ImageRender";
import { MediaPopup } from "../../../../../component/media-popup";
import { Images } from "lucide-react";
import DataStateHandler from "packages/page-builder/src/component/data-handler/DataStateHandler";
import { WIDGET_CONFIGURATION_MESSAGES } from "packages/page-builder/src/constants/constants";
import { MEDIA } from "@znode/constants/images";

export interface IImageConfig {
  image: string;
  height?: number;
  width?: number;
  alt: string;
  url?: string;
  layout?: "fixed" | "responsive" | "fullWidth";
  borderRadius?: string;
  loading?: "lazy" | "eager";
  hoverEffect?: "zoom" | "grayscale" | "opacity" | "none";
  target?: "_self" | "_blank";
  shadow?: boolean;
  padding?: string;
  alignment?: "start" | "center" | "end";
}

export type IImageConfigRenderProps = IImageConfig & IRenderProps;

export const ImageConfig: ComponentConfig<IImageConfig> = {
  label: "Image Widget",
  fields: {
    image: {
      type: "custom",
      label: "Image",
      render: ({ onChange }) => <MediaPopup mediaType={MEDIA.REQUIRED_EXTENSION} onChange={onChange} header="Select Image" Component={AssetsGallery} ButtonIcon={Images} />,
    },
    alt: { type: "text", label: "Alt" },
    url: { type: "text", label: "Link URL" },
    target: {
      label: "Target",
      type: "select",
      options: [
        { label: "Open in Same Tab", value: "_self" },
        { label: "Open in New Tab", value: "_blank" },
      ],
    },
    layout: {
      type: "select",
      label: "Layout",
      options: [
        { label: "Fixed", value: "fixed" },
        { label: "Responsive", value: "responsive" },
        { label: "Full Width", value: "fullWidth" },
      ],
    },
    width: { type: "number", label: "Width", min: 0, max: 2400 },
    height: { type: "number", label: "Height", min: 0, max: 2400 },
    alignment: {
      label: "Alignment",
      type: "radio",
      options: [
        { label: "Start", value: "start" },
        { label: "Center", value: "center" },
        { label: "End", value: "end" },
      ],
    },
    borderRadius: {
      type: "text",
      label: "Border Radius (e.g., 8px/50%)",
    },
  },

  resolveData: async (data): Promise<{ props?: Partial<IImageConfig>; readOnly?: Partial<Record<keyof IImageConfig, boolean>> }> => {
    const layout = data?.props?.layout ?? "fixed";

    const isFixed = layout === "fixed";
    const isFullWidth = layout === "fullWidth";
    const isResponsive = layout === "responsive";

    let readOnly: Partial<Record<keyof IImageConfig, boolean>> = {};

    if (isFullWidth) {
      readOnly = {
        ...readOnly,
        width: true,
        alignment: true,
      };
    }

    if (isResponsive) {
      readOnly = {
        ...readOnly,
        width: true,
        height: true,
        alignment: true,
      };
    }

    if (isFixed) {
      readOnly = {
        ...readOnly,
        width: false,
        height: false,
        alignment: false,
      };
    }

    return {
      readOnly,
    };
  },

  defaultProps: {
    image: "",
    alt: "",
    url: "",
    layout: "fixed",
    height: 200,
    width: 200,
    alignment: "start",
    borderRadius: "0px",
    target: "_self",
  },

  render: (props: IImageConfigRenderProps) => {
    const { image, ...restProps } = props;
    return (
      <DataStateHandler response={image} emptyMessage={WIDGET_CONFIGURATION_MESSAGES.IMAGE_CONFIGURATION_REQUIRED}>
        {image && <ImageRender image={image} {...restProps} />}
      </DataStateHandler>
    );
  },
};
