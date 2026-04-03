import { CSSProperties, ReactNode } from "react";
import { IPadding } from "../text/TextConfig";

export interface ISectionProps {
  className?: string;
  children: ReactNode;
  padding?: IPadding;
  maxWidth?: string;
  style?: CSSProperties;
}

export function Section({ children, padding, style = {} }: ISectionProps) {
  const getAdjustedPadding = () => ({
    paddingTop: `${padding?.top ?? 0}px`,
    paddingRight: `${padding?.right ?? 0}px`,
    paddingBottom: `${padding?.bottom ?? 0}px`,
    paddingLeft: `${padding?.left ?? 0}px`,
  });

  return (
    <div
      style={{
        ...style,
        ...getAdjustedPadding(),
      }}
    >
      <div>{children}</div>
    </div>
  );
}
