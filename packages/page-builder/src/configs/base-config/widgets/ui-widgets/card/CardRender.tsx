import { ReactElement } from "react";
import type { ICardRenderProps } from "./CardConfig";
import dynamic from "next/dynamic";
import dynamicIconImports from "lucide-react/dynamicIconImports";

// Todo: Implement dynamic our existing ZIcon components into our dynamic component
const icons = Object.keys(dynamicIconImports).reduce<Record<string, ReactElement>>((acc, iconName) => {
  const El = dynamic((dynamicIconImports as any)[iconName]);

  return {
    ...acc,
    [iconName]: <El />,
  };
}, {});

export function CardRender({ title, icon, description, mode }: ICardRenderProps) {
  return (
    <div className={`flex ${mode === "card" ? "flex-row items-center gap-4" : "flex-col items-center gap-6"} bg-white p-6 z-10`}>
      <div className={`${mode === "card" ? "w-12 h-12" : "w-16 h-16"} rounded-[50%] bg-slate-200 flex justify-center items-center`}>{icon && icons[icon]}</div>
      <div className={`${mode === "card" ? "flex-1" : "text-center"}`}>
        <div className={`text-2xl ${mode === "card" ? "text-left" : "text-center"}`}>{title}</div>
        {mode === "card" && <div className="text-gray-500">{description}</div>}
      </div>
      {mode !== "card" && <div>{description}</div>}
    </div>
  );
}
