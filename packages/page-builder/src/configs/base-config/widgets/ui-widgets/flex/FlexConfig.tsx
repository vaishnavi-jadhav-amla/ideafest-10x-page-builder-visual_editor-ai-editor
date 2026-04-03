import { AssetsGallery } from "../../../../../component/assets-gallery";
import { ColorPicker } from "@znode/base-components/common/color-picker";
import { ComponentConfig, Field } from "@measured/puck";
import { FlexRender } from "./FlexRender";
import { IRenderProps } from "../../../../../types/page-builder";
import { Images } from "lucide-react";
import { MediaPopup } from "../../../../../component/media-popup";
import { MEDIA } from "@znode/constants/images";
interface IMarginPadding {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

interface IBorder {
  width: string;
  color: string;
  borderClass: "solid" | "dotted" | "dashed";
  borderRadius: number;
}

interface IImageConfig {
  src: string;
  backgroundSize?: "cover" | "contain" | "auto";
  backgroundPosition?: "center" | "top" | "bottom" | "left" | "right";
  backgroundRepeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
}

interface IAlignment {
  justifyContent: "flex-start" | "flex-end" | "center" | "space-between" | undefined;
  alignItems: "flex-start" | "flex-end" | "center" | undefined;
}

type IRigidView = "yes" | "no";

interface IFlexProperties {
  flexDirection: "row" | "column";
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse";
  gap?: number;
  rowAlignment?: IAlignment;
  columnAlignment?: IAlignment;
}

type ILayout = "standard" | "custom";

export interface IFlexConfig {
  layout: ILayout;
  flexProperties: IFlexProperties;
  align: "center" | "left" | "right";
  height: string;
  margin: IMarginPadding;
  padding: IMarginPadding;
  border: IBorder;
  image: IImageConfig;
  maxWidth?: number;
  hasDropZoneDisabled?: boolean;
  rigidView?: IRigidView;
}

export type IFlexRenderProps = IFlexConfig & IRenderProps;

export const defaultAlignment: IAlignment = {
  justifyContent: undefined,
  alignItems: undefined,
};

export const defaultFlexProperties: IFlexProperties = {
  flexDirection: "column",
  rowAlignment: defaultAlignment,
  columnAlignment: defaultAlignment,
  flexWrap: "nowrap",
};

const rowAlignmentField: Field<IAlignment> = {
  label: "Row Alignment",
  type: "object",
  objectFields: {
    justifyContent: {
      label: "Align Horizontally",
      type: "select",
      options: [
        { label: "Left", value: "flex-start" },
        { label: "Center", value: "center" },
        { label: "Right", value: "flex-end" },
        { label: "Distribute Equally", value: "space-between" },
      ],
    },
    alignItems: {
      label: "Align Vertically",
      type: "select",
      options: [
        { label: "Top", value: "flex-start" },
        { label: "Middle", value: "center" },
        { label: "Bottom", value: "flex-end" },
      ],
    },
  },
};

const columnAlignmentField: Field<IAlignment> = {
  label: "Column Alignment",
  type: "object",
  objectFields: {
    alignItems: {
      label: "Align Horizontally",
      type: "select",
      options: [
        { label: "Left", value: "flex-start" },
        { label: "Center", value: "center" },
        { label: "Right", value: "flex-end" },
      ],
    },
    justifyContent: {
      label: "Align Vertically",
      type: "select",
      options: [
        { label: "Top", value: "flex-start" },
        { label: "Middle", value: "center" },
        { label: "Bottom", value: "flex-end" },
      ],
    },
  },
};

const gapField: Field<number> = {
  label: "Spacing",
  type: "number",
  min: 0,
};

const flexWrapField: Field<string> = {
  label: "Wrap Content",
  type: "radio",
  options: [
    { label: "Wrap", value: "wrap" },
    { label: "Unwrap", value: "nowrap" },
  ],
};

const rigidViewField: Field<IRigidView> = {
  label: "Rigid View",
  type: "radio",
  options: [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ],
};

const layoutField: Field<ILayout> = {
  label: "Layout Style",
  type: "radio",
  options: [
    { label: "Standard", value: "standard" },
    { label: "Custom", value: "custom" },
  ],
};

const flexPropertiesField: Field<IFlexProperties> = {
  label: "Container Properties",
  type: "object",
  objectFields: {
    flexDirection: {
      label: "Content Orientation",
      type: "radio",
      options: [
        { label: "Column", value: "column" },
        { label: "Row", value: "row" },
      ],
    },
    columnAlignment: columnAlignmentField,
    rowAlignment: rowAlignmentField,
    gap: gapField,
    flexWrap: flexWrapField,
  },
};

export const FlexConfig: ComponentConfig<IFlexConfig> = {
  fields: {
    layout: layoutField,
    flexProperties: flexPropertiesField,
    align: {
      label: "Container Alignment",
      type: "radio",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
    maxWidth: {
      label: "Container Width",
      type: "number",
    },
    height: {
      label: "Container Height",
      type: "number",
      min: 0,
      max: 2400,
    },
    rigidView: rigidViewField,
    image: {
      label: "Background Image",
      type: "object",
      objectFields: {
        src: {
          label: "Select",
          type: "custom",
          render: ({ onChange }) => {
            return <MediaPopup mediaType={MEDIA.REQUIRED_EXTENSION} onChange={onChange} header="Select Image" Component={AssetsGallery} ButtonIcon={Images} />;
          },
        },
        backgroundSize: {
          label: "Background Size",
          type: "radio",
          options: [
            { label: "Cover", value: "cover" },
            { label: "Contain", value: "contain" },
            { label: "Auto", value: "auto" },
          ],
        },
        backgroundPosition: {
          label: "Background Position",
          type: "select",
          options: [
            { label: "Center", value: "center" },
            { label: "Top", value: "top" },
            { label: "Bottom", value: "bottom" },
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
          ],
        },
        backgroundRepeat: {
          label: "Background Repeat",
          type: "select",
          options: [
            { label: "No Repeat", value: "no-repeat" },
            { label: "Repeat", value: "repeat" },
            { label: "Repeat X", value: "repeat-x" },
            { label: "Repeat Y", value: "repeat-y" },
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
            return <ColorPicker label="Color" value={value} onChange={(color: string) => onChange(color)} />;
          },
        },
        borderRadius: {
          label: "Border Radius",
          type: "number",
          min: 0,
          max: 100,
        },
        borderClass: {
          label: "Border Style",
          type: "radio",
          options: [
            { label: "Solid", value: "solid" },
            { label: "Dotted", value: "dotted" },
            { label: "Dashed", value: "dashed" },
          ],
        },
      },
    },
  },
  defaultProps: {
    align: "center",
    layout: "standard",
    flexProperties: defaultFlexProperties,
    rigidView: "no",
    maxWidth: 1200,
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
      borderClass: "solid",
      borderRadius: 0,
    },
    height: "auto",
    image: {
      src: "",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },
  },
  resolveData: async ({ props }) => {
    const layout = props.layout;
    const rigidView = props?.rigidView;

    let updateProps: Partial<IFlexConfig> = {};
    let readOnly: Partial<Record<string, boolean>> = {};

    let hasUpdateProps = false;
    let hasReadOnly = false;

    // Backward Compatibility - block and layout
    if ("block" in props && layout === undefined) {
      if (props.block === "box") {
        updateProps.layout = "custom";
        hasUpdateProps = true;
      }

      if (props.block === "full") {
        updateProps.layout = "standard";
        hasUpdateProps = true;
      }

      if (updateProps.layout === "standard") {
        readOnly.maxWidth = true;
        readOnly.align = true;
        hasReadOnly = true;
      }

      if (updateProps.layout === "custom") {
        readOnly.maxWidth = false;
        readOnly.align = false;
        hasReadOnly = true;
      }
    }

    if (layout === "standard") {
      readOnly.maxWidth = true;
      readOnly.align = true;
      hasReadOnly = true;
    }

    if (layout === "custom") {
      readOnly.maxWidth = false;
      readOnly.align = false;
      hasReadOnly = true;
    }

    // Backward Compatibility - layout
    if (layout === undefined) {
      updateProps.flexProperties = defaultFlexProperties;

      if (updateProps.flexProperties?.flexDirection === "column") {
        readOnly["flexProperties.rowAlignment"] = true;
      }

      if (updateProps.flexProperties?.flexDirection === "row") {
        readOnly["flexProperties.columnAlignment"] = true;
      }

      hasReadOnly = true;
      hasUpdateProps = true;
    }

    if (props.flexProperties?.flexDirection === "column") {
      readOnly["flexProperties.rowAlignment"] = true;
      hasReadOnly = true;
    }

    if (props.flexProperties?.flexDirection === "row") {
      readOnly["flexProperties.columnAlignment"] = true;

      if (props.flexProperties?.rowAlignment?.justifyContent === "space-between") {
        readOnly["flexProperties.gap"] = true;
      }

      hasReadOnly = true;
    }

    // Backward Compatibility - responsiveness
    if (rigidView === undefined) {
      updateProps.rigidView = "no";
      hasUpdateProps = true;
    }

    return {
      props: hasUpdateProps ? updateProps : undefined,
      readOnly: hasReadOnly ? readOnly : undefined,
    };
  },
  label: "Container",
  render: (props: IFlexRenderProps) => {
    return <FlexRender {...props} />;
  },
};
