import type { ComponentConfig, ComponentData } from "@measured/puck";

import { AssetsGallery } from "../../../../../component/assets-gallery";
import { IRenderProps } from "../../../../../types/page-builder";
import { Images } from "lucide-react";
import { MEDIA } from "@znode/constants/images";
import { MediaPopup } from "../../../../../component/media-popup";
import { TextImageRender } from "./TextImageRender";

export interface ITextImageConfig {
  padding: string;
  margin: string;
  order: "image-first" | "text-first";
  heading: string;
  description: string;
  image: {
    ratio: "small" | "large";
    src: string;
    width: number;
    alt: string;
  };
  button: {
    buttonText: string;
    url: string;
    variant: "primary" | "secondary";
    target?: "_self" | "_blank" | "_parent" | "_top";
  };
}

export type ITextImageRenderProps = ITextImageConfig & IRenderProps;

export const TextImageConfig: ComponentConfig<ITextImageConfig> = {
  fields: {
    padding: {
      label: "Padding",
      type: "text",
    },
    margin: {
      label: "Margin",
      type: "text",
    },
    heading: {
      label: "Heading",
      type: "text",
    },
    description: {
      label: "Description",
      type: "textarea",
    },
    button: {
      label: "Button",
      type: "object",
      objectFields: {
        buttonText: {
          label: "Label",
          type: "text",
        },
        url: {
          label: "Href",
          type: "text",
        },
        variant: {
          label: "Variant",
          type: "select",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
          ],
        },
        target: {
          label: "Target",
          type: "select",
          options: [
            { label: "Self", value: "_self" },
            { label: "New window", value: "_blank" },
            { label: "Parent", value: "_parent" },
            { label: "Top", value: "_top" },
          ],
        },
      },
    },
    order: {
      label: "Layout",
      type: "radio",
      options: [
        { label: "Image first", value: "image-first" },
        { label: "Text first", value: "text-first" },
      ],
    },
    image: {
      label: "Image",
      type: "object",
      objectFields: {
        ratio: {
          label: "Image ratio",
          type: "radio",
          options: [
            { label: "Small", value: "small" },
            { label: "Large", value: "large" },
          ],
        },
        width: {
          type: "number",
          label: "Width(%)",
          min: 0,
          max: 2400,
        },
        alt: {
          type: "text",
          label: "Alt",
        },
        src: {
          label: "Select",
          type: "custom",
          render: ({ onChange }) => {
            return <MediaPopup mediaType={MEDIA.REQUIRED_EXTENSION} onChange={onChange} header="Select Image" Component={AssetsGallery} ButtonIcon={Images} />;
          },
        },
      },
    },
  },

  resolveData(data: Omit<ComponentData<ITextImageConfig, string>, "type">): Promise<{
    readOnly?: Partial<Record<string, boolean>>; // allow string keys
  }> {
    const ratio = data?.props?.image?.ratio ?? "large";
    const isLarge = ratio === "large";
    const isSmall = ratio === "small";

    let readOnly: Partial<Record<string, boolean>> = {};

    if (isLarge) {
      data.props.image = {
        ...data.props.image,
        width: 100, // override to fixed value
      };
      // Use dot‑notation to mark only the width field of image as read‑only
      readOnly["image.width"] = true;
    }
    if (isSmall) {
      readOnly["image.width"] = false;
    }

    return Promise.resolve({ readOnly });
  },

  defaultProps: {
    // gap: "12px",
    heading: "Image with text",
    description: "",
    padding: "24px",
    margin: "12px",
    order: "image-first",
    image: {
      ratio: "small",
      src: "",
      width: 50,
      alt: "",
    },
    button: {
      buttonText: "Button Label",
      url: "",
      variant: "primary",
      target: "_self",
    },
  },
  label: "Text Image Widget",
  render: (props: ITextImageRenderProps) => {
    return <TextImageRender {...props} />;
  },
};
