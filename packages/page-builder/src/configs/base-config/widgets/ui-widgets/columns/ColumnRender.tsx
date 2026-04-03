import { DropZone } from "@measured/puck";
import type { IColumnRenderProps } from "./ColumnConfig";
import { useMemo } from "react";

export function ColumnRender({ columns, gap, margin, distribution }: IColumnRenderProps) {
  const marginStyle = useMemo(
    () => ({
      marginTop: `${margin.top}px`,
      marginRight: `${margin.right}px`,
      marginBottom: `${margin.bottom}px`,
      marginLeft: `${margin.left}px`,
    }),
    [margin]
  );

  const gapStyle = useMemo(() => (gap ? { gap: `${gap}px` } : {}), [gap]);

  const gridTemplateColumns = useMemo(
    () => (distribution === "manual" ? "repeat(12, minmax(0, 1fr))" : `repeat(${Math.min(columns.length, 12)}, minmax(0, 1fr))`),
    [columns.length, distribution]
  );

  return (
    <div
      className="flex flex-col grid-cols-12 md:grid"
      style={{
        gridTemplateColumns: gridTemplateColumns,
        ...marginStyle,
        ...gapStyle,
      }}
    >
      {columns.map(({ span }, idx) => {
        const gridColumn = distribution === "manual" && span ? `col-span-${Math.max(Math.min(span, 12), 1)}` : "";
        return (
          <div key={idx} className={gridColumn}>
            <DropZone zone={`column-${idx}`} />
          </div>
        );
      })}
    </div>
  );
}
