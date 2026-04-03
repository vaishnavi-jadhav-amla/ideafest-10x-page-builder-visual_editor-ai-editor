import React from "react";
import { DomPortal } from "../dom-portal";
import LoaderComponent from "./LoaderComponent";

export function OverlayLoader({ color }: { color: string }) {
  return (
    <DomPortal>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] w-full h-full flex items-center justify-center">
        <LoaderComponent isLoading color={color} />
      </div>
    </DomPortal>
  );
}
