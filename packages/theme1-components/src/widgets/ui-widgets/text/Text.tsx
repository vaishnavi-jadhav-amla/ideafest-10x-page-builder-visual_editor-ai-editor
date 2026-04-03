import React from "react";

// ** Override and implement your custom theme Text
export function Text({
  align,
  color,
  text,
  size,
  padding,
  maxWidth,
  dataTestSelector,
}: {
  align?: "left" | "center" | "right";
  color: string;
  text?: string;
  size?: string;
  padding?: string;
  maxWidth?: string;
  dataTestSelector?: string;
}) {
  const paddingTopClass = padding ? `pt-[${padding}]` : "";
  const paddingBottomClass = padding ? `pb-[${padding}]` : "";
  const maxWidthClass = maxWidth ? `max-w-[${maxWidth}]` : "";
  return (
    <div className={`p-4 ${paddingTopClass} ${paddingBottomClass}`}>
      <span
        data-test-selector={dataTestSelector}
        className={`flex 
          ${align === "center" ? "text-center justify-center" : align === "right" ? "text-right justify-end" : "text-left justify-start"}
          w-full 
          ${size === "m" ? "text-xl" : "text-base"}
          mx-auto
          font-light 
          ${color === "default" ? "" : "text-widgetColor"}
          ${maxWidthClass}`}
      >
        {text}
      </span>
    </div>
  );
}
