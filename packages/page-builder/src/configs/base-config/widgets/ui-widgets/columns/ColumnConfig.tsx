import { ColumnRender } from "./ColumnRender";
import type { ComponentConfig } from "@measured/puck";
import { IRenderProps } from "../../../../../types/page-builder";

export interface IColumnConfig {
  distribution: "auto" | "manual";
  gap: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  hasDropZoneDisabled?: boolean;
  columns: {
    span?: number;
  }[];
}

export type IColumnRenderProps = IColumnConfig & IRenderProps;

export const ColumnConfig: ComponentConfig<IColumnConfig> = {
  fields: {
    distribution: {
      label: "Distribution",
      type: "radio",
      options: [
        {
          value: "auto",
          label: "Auto",
        },
        {
          value: "manual",
          label: "Manual",
        },
      ],
    },
    columns: {
      label: "Columns",
      type: "array",
      getItemSummary: (col, id = -1) => `Column ${id + 1}, span ${col.span ? Math.max(Math.min(col.span, 12), 1) : "auto"}`,
      arrayFields: {
        span: {
          label: "Span (1-12)",
          type: "number",
          min: 0,
          max: 12,
        },
      },
    },
    gap: {
      label: "Column Gap",
      type: "number",
      min: 0,
      max: 50,
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
  },
  resolveData: async (data, params) => {
    const isAuto = data?.props?.distribution === "auto";

    const columns =
      data?.props?.columns?.map((col): IColumnConfig["columns"][number] => {
        // Remove span if in auto mode
        if (isAuto && "span" in col) {
          const { span, ...rest } = col;
          return rest;
        }
        return col;
      }) || [];

    return {
      ...data,
      props: {
        ...data.props,
        columns,
      },
      readOnly: {
        columns: false,
        "columns[*].span": isAuto,
      },
    };
  },
  defaultProps: {
    distribution: "auto",
    columns: [{}, {}],
    gap: 2,
    hasDropZoneDisabled: false,
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  },
  render: (props: IColumnRenderProps) => {
    return <ColumnRender {...props} />;
  },
};
