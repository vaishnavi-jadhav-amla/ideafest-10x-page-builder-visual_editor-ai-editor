import { ReactNode } from "react";

interface IContextualRendererProps {
  children: ReactNode;
}
export function ContextualRenderer(props: Readonly<IContextualRendererProps>) {
  const hasStoreCode = typeof window !== "undefined" ? new URL(window.location.href).searchParams.get("storeCode") : "";
  if (hasStoreCode) {
    return (
      <>
      <div className="h-[50px]"></div>
        {props.children}
      </>
    );
  }
  return props.children;
}
